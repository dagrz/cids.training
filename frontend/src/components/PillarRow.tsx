import type { Pillar } from '@/lib/pillars';

const PILLAR_METRICS: Record<string, string> = {
  C: '4x / week',
  I: '<2 reps in reserve',
  D: '1g/lb · 2g/kg',
  S: '7+ hours / night',
};

interface PillarRowProps {
  pillar: Pillar;
}

export function PillarRow({ pillar }: PillarRowProps) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-3 rounded-r-lg"
      style={{
        backgroundColor: `${pillar.borderColor}15`,
        borderLeft: `3px solid ${pillar.borderColor}`,
      }}
    >
      <span
        className="text-lg font-extrabold"
        style={{ color: pillar.gradientTo }}
      >
        {pillar.number}
      </span>
      <div className="flex-1">
        <div className="text-sm font-bold">{pillar.name}</div>
        <div className="text-xs text-white/40">{pillar.tagline}</div>
      </div>
      <span
        className="text-xs font-semibold tracking-wide text-white/30"
      >
        {PILLAR_METRICS[pillar.id]}
      </span>
    </div>
  );
}
