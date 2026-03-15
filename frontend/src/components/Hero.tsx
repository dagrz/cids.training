import Image from 'next/image';
import { PILLARS } from '@/lib/pillars';
import { PillarRow } from './PillarRow';

export function Hero() {
  return (
    <section className="px-4 py-8 text-center">
      <h1 className="text-6xl font-black tracking-tighter leading-none">
        CIDS
      </h1>
      <p className="text-xs tracking-[4px] text-white/30 uppercase mt-1 mb-6">
        Training Framework
      </p>

      <div className="flex flex-col gap-2 mb-6">
        {PILLARS.map((pillar) => (
          <PillarRow key={pillar.id} pillar={pillar} />
        ))}
      </div>

      <p className="text-sm text-white/40 italic mb-6">
        Everything else is optimization.
      </p>

      <div className="rounded-xl overflow-hidden">
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
