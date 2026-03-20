import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME!;

export async function putSubscriber(item: Record<string, any>) {
  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
}

export async function getSubscriber(email: string) {
  const result = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { email } }));
  return result.Item;
}


export async function updateSubscriberStatus(email: string, status: string) {
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { email },
      UpdateExpression: 'SET #s = :status',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':status': status },
    })
  );
}
