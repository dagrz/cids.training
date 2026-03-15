import type { Pillar } from '@/lib/pillars';

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
      <div>
        <div className="text-sm font-bold">{pillar.name}</div>
        <div className="text-xs text-white/40">{pillar.tagline}</div>
      </div>
    </div>
  );
}
