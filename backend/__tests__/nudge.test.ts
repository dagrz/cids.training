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

vi.mock('@aws-sdk/client-sns', () => ({
  SNSClient: vi.fn().mockImplementation(() => ({ send: vi.fn() })),
  PublishCommand: vi.fn(),
}));

describe('nudge handler', () => {
  let handler: any;
  let mockSend: any;

  beforeEach(async () => {
    vi.resetModules();
    vi.stubEnv('TABLE_NAME', 'test-table');

    const mod = await import('@aws-sdk/lib-dynamodb') as any;
    mockSend = mod.__mockSend;
    mockSend.mockReset();

    handler = (await import('../src/nudge/handler')).handler;
  });

  it('skips subscribers already nudged today', async () => {
    const today = new Date().toISOString().split('T')[0];
    mockSend.mockResolvedValueOnce({
      Items: [{
        email: 'test@test.com', phone: '+15551234567', timezone: 'America/New_York',
        status: 'active', lastNudgeDate: today, signupDate: '2026-01-01T00:00:00Z',
        weakestPillar: 'C', lastMessageIndex: { C: 0, I: 0, D: 0, S: 0 },
        messagingChannel: 'sms', currentPhase: 1,
      }],
    });

    const result = await handler({ targetTimezones: ['America/New_York'] });
    // Only 1 send call (the scan), no update call
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('sends nudge to active subscriber with matching timezone', async () => {
    mockSend.mockResolvedValueOnce({
      Items: [{
        email: 'test@test.com', phone: '+15551234567', timezone: 'America/New_York',
        status: 'active', lastNudgeDate: '2026-01-01', signupDate: '2026-01-01T00:00:00Z',
        weakestPillar: 'C', lastMessageIndex: { C: 0, I: 0, D: 0, S: 0 },
        messagingChannel: 'sms', currentPhase: 1,
      }],
    });
    mockSend.mockResolvedValueOnce({}); // SNS publish
    mockSend.mockResolvedValueOnce({}); // update

    const result = await handler({ targetTimezones: ['America/New_York'] });
    expect(result.processed).toBe(1);
  });

  it('skips subscribers in non-matching timezone', async () => {
    mockSend.mockResolvedValueOnce({
      Items: [{
        email: 'test@test.com', phone: '+15551234567', timezone: 'America/Los_Angeles',
        status: 'active', lastNudgeDate: '2026-01-01', signupDate: '2026-01-01T00:00:00Z',
        weakestPillar: 'C', lastMessageIndex: { C: 0, I: 0, D: 0, S: 0 },
        messagingChannel: 'sms', currentPhase: 1,
      }],
    });

    const result = await handler({ targetTimezones: ['America/New_York'] });
    expect(result.processed).toBe(0);
  });
});
