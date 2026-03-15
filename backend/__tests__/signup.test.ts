import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEvent } from 'aws-lambda';

// Mock AWS SDK before importing handler
vi.mock('@aws-sdk/lib-dynamodb', () => {
  const mockSend = vi.fn();
  return {
    DynamoDBDocumentClient: { from: () => ({ send: mockSend }) },
    PutCommand: vi.fn(),
    GetCommand: vi.fn(),
    QueryCommand: vi.fn(),
    __mockSend: mockSend,
  };
});

vi.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('@aws-sdk/client-ses', () => ({
  SESClient: vi.fn().mockImplementation(() => ({ send: vi.fn() })),
  SendEmailCommand: vi.fn(),
}));

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(() => ({})),
  GetObjectCommand: vi.fn(),
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockResolvedValue('https://s3.example.com/guide.pdf?signed'),
}));

describe('signup handler', () => {
  let handler: any;
  let mockSend: any;

  beforeEach(async () => {
    vi.resetModules();
    vi.stubEnv('TABLE_NAME', 'test-table');
    vi.stubEnv('PDF_BUCKET', 'test-bucket');
    vi.stubEnv('PDF_KEY', 'guide.pdf');
    vi.stubEnv('FROM_EMAIL', 'noreply@cids.training');

    const mod = await import('@aws-sdk/lib-dynamodb') as any;
    mockSend = mod.__mockSend;
    mockSend.mockReset();

    // Default: no existing subscriber
    mockSend.mockResolvedValue({ Items: [] });

    handler = (await import('../src/signup/handler')).handler;
  });

  const makeEvent = (body: object): Partial<APIGatewayProxyEvent> => ({
    body: JSON.stringify(body),
    httpMethod: 'POST',
  });

  it('returns 400 for missing email', async () => {
    const result = await handler(makeEvent({ phone: '5551234567', countryCode: '+1' }));
    expect(result.statusCode).toBe(400);
  });

  it('returns 400 for invalid email', async () => {
    const result = await handler(makeEvent({ email: 'bad', phone: '5551234567', countryCode: '+1' }));
    expect(result.statusCode).toBe(400);
  });

  it('returns 200 for valid signup', async () => {
    const result = await handler(
      makeEvent({
        email: 'test@example.com',
        phone: '5551234567',
        countryCode: '+1',
        assessmentResult: { C: 2, I: 3, D: 4, S: 1 },
      })
    );
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).success).toBe(true);
  });
});
