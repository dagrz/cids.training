import Image from 'next/image';
import { PILLARS } from '@/lib/pillars';
import { PillarRow } from './PillarRow';
import { AnimateIn } from './AnimateIn';

export function Hero() {
  return (
    <section className="px-4 py-8">
      <h1 className="text-6xl font-black tracking-tighter leading-none text-center">
        CIDS
      </h1>
      <p className="text-xs tracking-[4px] text-white/30 uppercase mt-1 mb-6 text-center">
        Training Framework
      </p>

      <div className="flex flex-col gap-2 mb-6">
        {PILLARS.map((pillar, i) => (
          <AnimateIn key={pillar.id} delay={i * 0.1}>
            <PillarRow pillar={pillar} />
          </AnimateIn>
        ))}
      </div>

      <p className="text-sm text-white/40 italic mb-6 text-center">
        Building muscle should be simple, not easy.
      </p>

      <div className="rounded-xl overflow-hidden" style={{ border: '3px solid rgba(255,255,255,0.15)' }}>
        <Image
          src="/images/hero-deadlift.jpg"
          alt="Person training with focus and determination"
          width={800}
          height={450}
          className="w-full h-auto"
          priority
        />
      </div>
    </section>
  );
}
