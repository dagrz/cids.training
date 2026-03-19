import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

export async function handler(event: Partial<APIGatewayProxyEvent>): Promise<APIGatewayProxyResult> {
  const token = event.queryStringParameters?.token;

  if (!token) {
    return { statusCode: 400, body: 'Missing token', headers: { 'Content-Type': 'text/html' } };
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
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'text/html' },
      body: buildPage('Link not found', 'This unsubscribe link is invalid or has already been used.'),
    };
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
    body: buildPage(
      "You've been unsubscribed",
      "No more emails from us. If you ever want to come back, just sign up again at cids.training."
    ),
  };
}

function buildPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} — CIDS</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%);
      color: #fff;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 400px;
    }
    .logo {
      font-size: 32px;
      font-weight: 900;
      letter-spacing: -2px;
      margin-bottom: 32px;
    }
    .title {
      font-size: 22px;
      font-weight: 800;
      margin-bottom: 12px;
    }
    .message {
      font-size: 15px;
      color: rgba(255,255,255,0.5);
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .link {
      display: inline-block;
      color: rgba(255,255,255,0.3);
      text-decoration: none;
      font-size: 13px;
      border: 1px solid rgba(255,255,255,0.15);
      padding: 10px 24px;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .link:hover {
      color: rgba(255,255,255,0.6);
      border-color: rgba(255,255,255,0.3);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">CIDS</div>
    <div class="title">${title}</div>
    <p class="message">${message}</p>
    <a href="https://cids.training" class="link">Back to cids.training</a>
  </div>
</body>
</html>`;
}
