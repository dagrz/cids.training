import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { getMessageForSubscriber } from './messages';
import { getMessagingService } from '../shared/messaging';
import type { Subscriber } from '../shared/types';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

export async function handler(event: { targetTimezones?: string[] } = {}) {
  const targetTimezones = event.targetTimezones || [];

  // Scan for active subscribers (acceptable at MVP scale)
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: '#s = :active',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':active': 'active' },
    })
  );

  const allSubscribers = (result.Items || []) as (Subscriber & { timezone: string })[];
  const today = new Date().toISOString().split('T')[0];

  // Filter by timezone if specified, skip already-nudged
  const subscribers = allSubscribers.filter((sub) => {
    if (sub.lastNudgeDate === today) return false;
    if (targetTimezones.length > 0 && !targetTimezones.includes(sub.timezone)) return false;
    return true;
  });

  let processed = 0;

  for (const sub of subscribers) {
    // Calculate phase based on signup date
    const daysSinceSignup = Math.floor(
      (Date.now() - new Date(sub.signupDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const phase = daysSinceSignup < 14 ? 1 : daysSinceSignup < 28 ? 2 : daysSinceSignup < 42 ? 3 : 4;

    const { pillar, message, messageIndex } = getMessageForSubscriber({
      currentPhase: phase,
      weakestPillar: sub.weakestPillar,
      lastMessageIndex: sub.lastMessageIndex,
    });

    try {
      const messaging = getMessagingService(sub.messagingChannel);
      await messaging.send(sub.phone, message);

      await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { email: sub.email },
          UpdateExpression: 'SET lastNudgeDate = :today, currentPhase = :phase, lastMessageIndex.#p = :idx',
          ExpressionAttributeNames: { '#p': pillar },
          ExpressionAttributeValues: { ':today': today, ':phase': phase, ':idx': messageIndex },
        })
      );
      processed++;
    } catch (err) {
      console.error(`Failed to nudge ${sub.email}:`, err);
    }
  }

  return { processed };
}
