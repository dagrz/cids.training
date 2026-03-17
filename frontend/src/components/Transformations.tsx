import Image from 'next/image';

const TESTIMONIALS = [
  {
    image: '/images/transformation-energy.jpg',
    quote: "Six months ago I couldn't get off the couch. I didn't change my workout program — I just started showing up. CIDS gave me the order. The rest took care of itself.",
  },
  {
    image: '/images/community-gym.jpg',
    quote: "I tried every app, every program. CIDS is the only thing that stuck because it doesn't ask you to be perfect — it asks you to be consistent.",
  },
];

export function Transformations() {
  return (
    <section className="px-4 py-8 border-t border-white/5">
      <h2 className="text-2xl font-extrabold tracking-tight mb-1">
        It&apos;s Not About the Body
      </h2>
      <p className="text-sm text-white/40 mb-5">
        It&apos;s about the energy, the posture, the confidence.
      </p>

      <div className="flex flex-col gap-3">
        {TESTIMONIALS.map((t, i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden bg-cids-bg-card" style={{ border: '3px solid rgba(255,255,255,0.15)' }}
          >
            <div className="relative h-36">
              <Image src={t.image} alt="" fill className="object-cover" />
            </div>
            <div className="p-4">
              <p className="text-sm text-white/60 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
