import { describe, it, expect } from 'vitest';
import { scoreAssessment, type AssessmentAnswers } from '@/lib/scoring';

describe('scoreAssessment', () => {
  it('returns the pillar with the lowest score', () => {
    const answers: AssessmentAnswers = { C: 3, I: 2, D: 4, S: 3 };
    expect(scoreAssessment(answers)).toBe('I');
  });

  it('breaks ties by CIDS order (earlier pillar wins)', () => {
    const answers: AssessmentAnswers = { C: 2, I: 2, D: 3, S: 4 };
    expect(scoreAssessment(answers)).toBe('C');
  });

  it('returns C when all scores are equal', () => {
    const answers: AssessmentAnswers = { C: 3, I: 3, D: 3, S: 3 };
    expect(scoreAssessment(answers)).toBe('C');
  });

  it('returns S when sleep is the only low score', () => {
    const answers: AssessmentAnswers = { C: 4, I: 4, D: 4, S: 1 };
    expect(scoreAssessment(answers)).toBe('S');
  });

  it('breaks tie between D and S in favor of D', () => {
    const answers: AssessmentAnswers = { C: 4, I: 4, D: 1, S: 1 };
    expect(scoreAssessment(answers)).toBe('D');
  });
});
