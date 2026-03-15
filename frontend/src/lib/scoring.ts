import { PILLAR_ORDER, type PillarId } from './pillars';

export type AssessmentAnswers = Record<PillarId, number>;

export function scoreAssessment(answers: AssessmentAnswers): PillarId {
  let lowestScore = Infinity;
  let weakestPillar: PillarId = 'C';

  for (const pillar of PILLAR_ORDER) {
    if (answers[pillar] < lowestScore) {
      lowestScore = answers[pillar];
      weakestPillar = pillar;
    }
  }

  return weakestPillar;
}
