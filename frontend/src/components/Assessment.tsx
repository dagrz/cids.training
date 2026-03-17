// frontend/src/components/Assessment.tsx
'use client';

import { useState } from 'react';
import { PILLARS, PILLAR_ORDER, type PillarId } from '@/lib/pillars';
import type { AssessmentAnswers } from '@/lib/scoring';
import { AssessmentResult } from './AssessmentResult';

// If they score 1 or 2 on a pillar, that's their answer — stop here
const WEAK_THRESHOLD = 2;

interface AssessmentProps {
  onComplete?: (answers: AssessmentAnswers) => void;
}

export function Assessment({ onComplete }: AssessmentProps) {
  const [answers, setAnswers] = useState<Partial<AssessmentAnswers>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<PillarId | null>(null);

  const handleAnswer = (pillarId: PillarId, score: number) => {
    const updated = { ...answers, [pillarId]: score };
    setAnswers(updated);

    if (score <= WEAK_THRESHOLD) {
      // They're weak here — this is their priority. Stop asking.
      // Fill remaining pillars with max score so onComplete gets a full set
      const complete = { ...updated } as AssessmentAnswers;
      for (const p of PILLAR_ORDER) {
        if (!(p in complete)) complete[p] = 4;
      }
      setTimeout(() => {
        setResult(pillarId);
        onComplete?.(complete);
      }, 300);
    } else if (currentStep < PILLARS.length - 1) {
      // They're solid on this pillar — move to next
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    } else {
      // Answered all 4 and scored well on everything — C wins by default
      const complete = updated as AssessmentAnswers;
      setTimeout(() => {
        // Find lowest, break ties by CIDS order
        let lowest = Infinity;
        let weakest: PillarId = 'C';
        for (const p of PILLAR_ORDER) {
          if (complete[p] < lowest) {
            lowest = complete[p];
            weakest = p;
          }
        }
        setResult(weakest);
        onComplete?.(complete);
      }, 300);
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
          setCurrentStep(0);
          setResult(null);
        }}
      />
    );
  }

  const pillar = PILLARS[currentStep];

  return (
    <section id="assessment" className="px-4 py-8 border-t border-white/5">
      <h2 className="text-2xl font-extrabold tracking-tight mb-1">
        What Should You Do?
      </h2>
      <p className="text-sm text-white/40 mb-5">
        Tap the answer that fits. Be honest.
      </p>

      {/* Progress dots */}
      <div className="flex gap-2 mb-5">
        {PILLARS.map((p, i) => (
          <div
            key={p.id}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i < currentStep
                ? p.borderColor
                : i === currentStep
                  ? `${p.borderColor}80`
                  : 'rgba(255,255,255,0.1)',
            }}
          />
        ))}
      </div>

      <div key={pillar.id}>
        <h4
          className="text-sm font-bold mb-3"
          style={{ color: pillar.gradientTo }}
        >
          {pillar.name} — {pillar.question}
        </h4>
        {pillar.answers.map((answer, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(pillar.id, i + 1)}
            className={`block w-full text-left text-sm px-4 py-3 mb-2 rounded-lg border transition-colors ${
              answers[pillar.id] === i + 1
                ? 'border-white/30 text-white bg-white/10'
                : 'border-white/10 text-white/60 bg-white/[0.03] hover:border-white/20 hover:text-white'
            }`}
          >
            {answer}
          </button>
        ))}
      </div>

      <p className="text-xs text-white/20 mt-3">
        {currentStep + 1} of {PILLARS.length}
      </p>
    </section>
  );
}
