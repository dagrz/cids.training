import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { putSubscriber, queryByPhone } from '../shared/db';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { PillarId, AssessmentResult, SignupRequest } from '../shared/types';

const ses = new SESClient({});
const s3 = new S3Client({});

const PILLAR_ORDER: PillarId[] = ['C', 'I', 'D', 'S'];

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

export async function handler(event: Partial<APIGatewayProxyEvent>): Promise<APIGatewayProxyResult> {
  try {
    const body: SignupRequest = JSON.parse(event.body || '{}');

    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return cors({ statusCode: 400, body: JSON.stringify({ message: 'Please enter a valid email address' }) });
    }

    if (!body.phone || body.phone.replace(/\D/g, '').length < 7) {
      return cors({ statusCode: 400, body: JSON.stringify({ message: 'Please enter a valid phone number' }) });
    }

    const phone = `${body.countryCode || '+1'}${body.phone.replace(/\D/g, '')}`;

    // Check for duplicate phone with different email
    const phoneMatches = await queryByPhone(phone);
    const otherEmailWithPhone = phoneMatches.find((item: any) => item.email !== body.email);
    if (otherEmailWithPhone) {
      return cors({ statusCode: 409, body: JSON.stringify({ message: 'This number is already registered.' }) });
    }

    const assessment = body.assessmentResult || { C: 1, I: 1, D: 1, S: 1 };
    const weakestPillar = scoreWeakest(assessment);

    const subscriber = {
      email: body.email,
      phone,
      timezone: body.timezone || 'America/New_York',
      assessmentResult: assessment,
      weakestPillar,
      signupDate: new Date().toISOString(),
      currentPhase: 1,
      status: 'active',
      unsubscribeToken: randomUUID(),
      lastMessageIndex: { C: 0, I: 0, D: 0, S: 0 },
      messagingChannel: 'sms' as const,
    };

    await putSubscriber(subscriber);

    // Generate presigned URL for PDF
    const pdfUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.PDF_BUCKET!,
        Key: process.env.PDF_KEY!,
      }),
      { expiresIn: 604800 } // 7 days
    );

    // Send welcome email
    await ses.send(
      new SendEmailCommand({
        Source: process.env.FROM_EMAIL!,
        Destination: { ToAddresses: [body.email] },
        Message: {
          Subject: { Data: 'Welcome to CIDS — Your Framework Guide is Here' },
          Body: {
            Html: {
              Data: `<p>Welcome to CIDS.</p>
                <p>Here's your free CIDS Framework Guide: <a href="${pdfUrl}">Download PDF</a></p>
                <p>Your first daily nudge arrives tomorrow morning.</p>
                <p>Show Up. Push Hard. Eat Right. Rest Well.<br/>Everything else is optimization.</p>`,
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
