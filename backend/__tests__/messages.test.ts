import { describe, it, expect } from 'vitest';
import { getMessageForSubscriber, MESSAGES } from '../src/nudge/messages';

describe('MESSAGES', () => {
  it('has at least 7 messages per pillar', () => {
    expect(MESSAGES.C.length).toBeGreaterThanOrEqual(7);
    expect(MESSAGES.I.length).toBeGreaterThanOrEqual(7);
    expect(MESSAGES.D.length).toBeGreaterThanOrEqual(7);
    expect(MESSAGES.S.length).toBeGreaterThanOrEqual(7);
  });
});

describe('getMessageForSubscriber', () => {
  it('returns only C messages for phase 1', () => {
    const sub = {
      currentPhase: 1,
      weakestPillar: 'C' as const,
      lastMessageIndex: { C: 0, I: 0, D: 0, S: 0 },
    };
    const result = getMessageForSubscriber(sub);
    expect(result.pillar).toBe('C');
    expect(result.messageIndex).toBe(1);
  });

  it('weights toward weakest pillar when in current phase', () => {
    // Phase 2 = C + I unlocked, weakest is I
    // Run 100 times, expect ~60% I
    const sub = {
      currentPhase: 2,
      weakestPillar: 'I' as const,
      lastMessageIndex: { C: 0, I: 0, D: 0, S: 0 },
    };
    let iCount = 0;
    for (let i = 0; i < 100; i++) {
      if (getMessageForSubscriber(sub).pillar === 'I') iCount++;
    }
    expect(iCount).toBeGreaterThan(40); // allow variance
    expect(iCount).toBeLessThan(80);
  });

  it('wraps message index when bank exhausted', () => {
    const sub = {
      currentPhase: 1,
      weakestPillar: 'C' as const,
      lastMessageIndex: { C: MESSAGES.C.length, I: 0, D: 0, S: 0 },
    };
    const result = getMessageForSubscriber(sub);
    expect(result.messageIndex).toBe(1); // wraps to start
  });
});
