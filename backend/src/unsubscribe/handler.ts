import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

export async function handler(event: Partial<APIGatewayProxyEvent>): Promise<APIGatewayProxyResult> {
  const token = event.queryStringParameters?.token;

  if (!token) {
    return { statusCode: 400, body: 'Missing token', headers: {} };
  }

  // Find subscriber by token
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'unsubscribeToken = :token',
      ExpressionAttributeValues: { ':token': token },
    })
  );

  const subscriber = result.Items?.[0];
  if (!subscriber) {
    return { statusCode: 404, body: 'Invalid unsubscribe link', headers: {} };
  }

  // Update status
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { email: subscriber.email },
      UpdateExpression: 'SET #s = :status',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':status': 'unsubscribed' },
    })
  );

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    body: `<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{background:#0a0a15;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.box{text-align:center;padding:2rem}.title{font-size:1.5rem;font-weight:800;margin-bottom:0.5rem}</style></head>
<body><div class="box"><div class="title">You've been unsubscribed</div>
<p style="color:rgba(255,255,255,0.5);font-size:0.875rem">We'll miss you. Come back anytime at cids.training</p></div></body></html>`,
  };
}
