import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { putSubscriber } from '../shared/db';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import type { PillarId, AssessmentResult, SignupRequest } from '../shared/types';

const ses = new SESClient({});

const PILLAR_ORDER: PillarId[] = ['C', 'I', 'D', 'S'];

const PILLAR_NAMES: Record<PillarId, string> = {
  C: 'Consistency',
  I: 'Intensity',
  D: 'Diet',
  S: 'Sleep',
};

const PILLAR_TAGLINES: Record<PillarId, string> = {
  C: 'Show Up',
  I: 'Push Hard',
  D: 'Eat Right',
  S: 'Rest Well',
};

function scoreWeakest(result: AssessmentResult): PillarId {
  let lowest = Infinity;
  let weakest: PillarId = 'C';
  for (const p of PILLAR_ORDER) {
    if (result[p] < lowest) {
      lowest = result[p];
      weakest = p;
    }
  }
  return weakest;
}

function cors(response: APIGatewayProxyResult): APIGatewayProxyResult {
  return {
    ...response,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      ...response.headers,
    },
  };
}

function buildWelcomeEmail(pdfUrl: string, weakest: PillarId, unsubscribeUrl: string): string {
  const name = PILLAR_NAMES[weakest];
  const tagline = PILLAR_TAGLINES[weakest];

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f5f5f5; font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:480px; margin:0 auto; padding:32px 20px;">

    <!-- Header -->
    <div style="text-align:center; margin-bottom:32px;">
      <div style="font-size:28px; font-weight:900; letter-spacing:-2px; color:#1a1a1a;">CIDS</div>
      <div style="font-size:11px; letter-spacing:3px; color:#999; text-transform:uppercase;">Training Framework</div>
    </div>

    <!-- Main card -->
    <div style="background:#ffffff; border-radius:12px; padding:28px 24px; margin-bottom:20px;">
      <h1 style="font-size:20px; font-weight:800; color:#1a1a1a; margin:0 0 16px 0;">Your CIDS Guide is ready</h1>

      <p style="font-size:15px; color:#555; line-height:1.6; margin:0 0 20px 0;">
        Thanks for signing up. Here's the complete CIDS Framework Guide — everything you need to get started, backed by real research, no fluff.
      </p>

      <div style="text-align:center; margin:24px 0;">
        <a href="${pdfUrl}" style="display:inline-block; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#ffffff; text-decoration:none; padding:14px 32px; border-radius:8px; font-size:15px; font-weight:700; letter-spacing:0.5px;">
          Download Your Guide
        </a>
        <p style="font-size:12px; color:#999; margin:8px 0 0 0;">PDF download — yours to keep</p>
      </div>
    </div>

    <!-- Assessment result -->
    <div style="background:#ffffff; border-radius:12px; padding:24px; margin-bottom:20px; border-left:4px solid #6366f1;">
      <div style="font-size:12px; color:#999; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Based on your assessment</div>
      <div style="font-size:17px; font-weight:800; color:#1a1a1a; margin-bottom:8px;">Start with: ${name}</div>
      <p style="font-size:14px; color:#666; line-height:1.5; margin:0;">
        Your guide covers all four areas, but focus on <strong>${name}</strong> first. ${tagline}. Don't move to the next one until this is locked in.
      </p>
    </div>

    <!-- What's next -->
    <div style="background:#ffffff; border-radius:12px; padding:24px; margin-bottom:20px;">
      <div style="font-size:15px; font-weight:700; color:#1a1a1a; margin-bottom:12px;">What happens next</div>
      <p style="font-size:14px; color:#666; line-height:1.6; margin:0 0 8px 0;">
        → Your first weekly check-in arrives next Monday
      </p>
      <p style="font-size:14px; color:#666; line-height:1.6; margin:0 0 8px 0;">
        → Advice tailored to where you are in CIDS
      </p>
      <p style="font-size:14px; color:#666; line-height:1.6; margin:0;">
        → Building muscle should be simple, not easy
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align:center; padding:20px 0;">
      <div style="font-size:13px; font-style:italic; color:#bbb; margin-bottom:12px;">Building muscle should be simple, not easy.</div>
      <div style="font-size:12px; color:#ccc;">
        <a href="https://cids.training" style="color:#999; text-decoration:none;">cids.training</a>
        &nbsp;·&nbsp;
        <a href="${unsubscribeUrl}" style="color:#999; text-decoration:none;">Unsubscribe</a>
      </div>
    </div>

  </div>
</body>
</html>`;
}

export async function handler(event: Partial<APIGatewayProxyEvent>): Promise<APIGatewayProxyResult> {
  try {
    const body: SignupRequest = JSON.parse(event.body || '{}');

    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return cors({ statusCode: 400, body: JSON.stringify({ message: 'Please enter a valid email address' }) });
    }

    const assessment = body.assessmentResult || { C: 1, I: 1, D: 1, S: 1 };
    const weakestPillar = scoreWeakest(assessment);
    const unsubscribeToken = randomUUID();

    const subscriber = {
      email: body.email,
      ...(body.phone ? { phone: body.phone } : {}),
      timezone: body.timezone || 'America/New_York',
      assessmentResult: assessment,
      weakestPillar,
      signupDate: new Date().toISOString(),
      currentPhase: 1,
      status: 'active',
      unsubscribeToken,
      lastMessageIndex: { C: 0, I: 0, D: 0, S: 0 },
      messagingChannel: 'email' as const,
    };

    await putSubscriber(subscriber);

    const pdfUrl = 'https://cids.training/cids-framework-guide.pdf';

    // Build unsubscribe URL
    const apiUrl = `https://${event.requestContext?.domainName}/${event.requestContext?.stage}`;
    const unsubscribeUrl = `${apiUrl}/unsubscribe?token=${unsubscribeToken}`;

    // Send welcome email
    await ses.send(
      new SendEmailCommand({
        Source: process.env.FROM_EMAIL!,
        Destination: { ToAddresses: [body.email] },
        Message: {
          Subject: { Data: 'Your CIDS Framework Guide is ready' },
          Body: {
            Html: {
              Data: buildWelcomeEmail(pdfUrl, weakestPillar, unsubscribeUrl),
            },
          },
        },
      })
    );

    return cors({ statusCode: 200, body: JSON.stringify({ success: true }) });
  } catch (err) {
    console.error('Signup error:', err);
    return cors({ statusCode: 500, body: JSON.stringify({ message: 'Something went wrong' }) });
  }
}
