import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@aws-sdk/lib-dynamodb', () => {
  const mockSend = vi.fn();
  return {
    DynamoDBDocumentClient: { from: () => ({ send: mockSend }) },
    ScanCommand: vi.fn(),
    UpdateCommand: vi.fn(),
    __mockSend: mockSend,
  };
});

vi.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: vi.fn().mockImplementation(() => ({})),
}));

describe('unsubscribe handler', () => {
  let handler: any;
  let mockSend: any;

  beforeEach(async () => {
    vi.resetModules();
    vi.stubEnv('TABLE_NAME', 'test-table');
    const mod = await import('@aws-sdk/lib-dynamodb') as any;
    mockSend = mod.__mockSend;
    mockSend.mockReset();
    handler = (await import('../src/unsubscribe/handler')).handler;
  });

  it('returns 400 for missing token', async () => {
    const result = await handler({ queryStringParameters: {} });
    expect(result.statusCode).toBe(400);
  });

  it('returns 404 for invalid token', async () => {
    mockSend.mockResolvedValueOnce({ Items: [] });
    const result = await handler({ queryStringParameters: { token: 'bad-token' } });
    expect(result.statusCode).toBe(404);
  });

  it('returns 200 with HTML for valid token', async () => {
    mockSend.mockResolvedValueOnce({
      Items: [{ email: 'test@example.com', unsubscribeToken: 'valid-token' }],
    });
    mockSend.mockResolvedValueOnce({}); // update command

    const result = await handler({ queryStringParameters: { token: 'valid-token' } });
    expect(result.statusCode).toBe(200);
    expect(result.headers['Content-Type']).toBe('text/html');
    expect(result.body).toContain('unsubscribed');
  });
});
