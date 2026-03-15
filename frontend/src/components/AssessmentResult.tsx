// frontend/src/components/AssessmentResult.tsx
import type { Pillar } from '@/lib/pillars';
import type { AssessmentAnswers } from '@/lib/scoring';

interface AssessmentResultProps {
  pillar: Pillar;
  answers: AssessmentAnswers;
  onReset: () => void;
}

export function AssessmentResult({ pillar, answers, onReset }: AssessmentResultProps) {
  return (
    <section className="px-4 py-8 border-t border-white/5">
      <div
        className="rounded-xl p-6 border"
        style={{
          backgroundColor: `${pillar.borderColor}10`,
          borderColor: `${pillar.borderColor}30`,
        }}
      >
        <div className="text-xs uppercase tracking-widest text-white/40 mb-2">
          Your Result
        </div>
        <h3 className="text-xl font-extrabold mb-3" style={{ color: pillar.gradientTo }}>
          {pillar.resultCopy}
        </h3>
        <p className="text-sm text-white/60 leading-relaxed mb-4">
          {pillar.resultTip}
        </p>
        <button
          onClick={onReset}
          className="text-xs text-white/30 underline hover:text-white/50"
        >
          Retake assessment
        </button>
      </div>
    </section>
  );
}
