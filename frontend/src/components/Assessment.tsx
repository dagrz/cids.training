// frontend/src/components/Assessment.tsx
'use client';

import { useState } from 'react';
import { PILLARS, type PillarId } from '@/lib/pillars';
import { scoreAssessment, type AssessmentAnswers } from '@/lib/scoring';
import { AssessmentResult } from './AssessmentResult';

interface AssessmentProps {
  onComplete?: (answers: AssessmentAnswers) => void;
}

export function Assessment({ onComplete }: AssessmentProps) {
  const [answers, setAnswers] = useState<Partial<AssessmentAnswers>>({});
  const [result, setResult] = useState<PillarId | null>(null);

  const handleAnswer = (pillarId: PillarId, score: number) => {
    const updated = { ...answers, [pillarId]: score };
    setAnswers(updated);

    if (Object.keys(updated).length === 4) {
      const complete = updated as AssessmentAnswers;
      setResult(scoreAssessment(complete));
      onComplete?.(complete);
    }
  };

  if (result) {
    const pillar = PILLARS.find((p) => p.id === result)!;
    return (
      <AssessmentResult
        pillar={pillar}
        answers={answers as AssessmentAnswers}
        onReset={() => {
          setAnswers({});
          setResult(null);
        }}
      />
    );
  }

  return (
    <section id="assessment" className="px-4 py-8 border-t border-white/5">
      <h2 className="text-2xl font-extrabold tracking-tight mb-1">
        Where Do You Start?
      </h2>
      <p className="text-sm text-white/40 mb-5">
        Tap the answer that fits. Be honest.
      </p>

      {PILLARS.map((pillar) => (
        <div key={pillar.id} className="mb-5">
          <h4
            className="text-sm font-bold mb-2"
            style={{ color: pillar.gradientTo }}
          >
            <span>{pillar.name}</span>
            <span> — </span>
            <span>{pillar.question}</span>
          </h4>
          {pillar.answers.map((answer, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(pillar.id, i + 1)}
              className={`block w-full text-left text-xs px-3 py-2.5 mb-1.5 rounded-lg border transition-colors ${
                answers[pillar.id] === i + 1
                  ? 'border-white/30 text-white bg-white/10'
                  : 'border-white/10 text-white/60 bg-white/[0.03] hover:border-white/20 hover:text-white'
              }`}
            >
              {answer}
            </button>
          ))}
        </div>
      ))}
    </section>
  );
}
