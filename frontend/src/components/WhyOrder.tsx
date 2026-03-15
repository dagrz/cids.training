import { PILLARS } from '@/lib/pillars';
import { AnimateIn } from './AnimateIn';

const WHY_COPY = [
  "Consistency comes first. Nothing else matters if you don't show up. Don't worry about your diet or sleep hacks. Just get in the door, every single day.",
  "Then bring intensity. You're showing up — great. Now make it count. Don't scroll between sets. Don't coast. Push until it's uncomfortable.",
  "Now fuel it properly. You're consistent and training hard. Time to support that with the right food. Hit your protein. Plan your meals. Stop winging it.",
  "Finally, recover. You're doing the work and eating right. Now let your body rebuild. Phone down, lights out, 7-8 hours. This is where the gains happen.",
];

export function WhyOrder() {
  return (
    <section className="px-4 py-8 border-t border-white/5">
      <h2 className="text-2xl font-extrabold tracking-tight mb-1">
        Why This Order Matters
      </h2>
      <p className="text-sm text-white/40 mb-5">
        Master each one before moving to the next.
      </p>

      <div className="flex flex-col gap-3">
        {PILLARS.map((pillar, i) => (
          <AnimateIn key={pillar.id} delay={i * 0.1}>
            <div
              className="p-4 rounded-r-lg text-sm leading-relaxed text-white/70"
              style={{
                backgroundColor: `${pillar.borderColor}10`,
                borderLeft: `3px solid ${pillar.borderColor}`,
              }}
            >
              <strong className="text-white">{WHY_COPY[i].split('.')[0]}.</strong>
              {WHY_COPY[i].substring(WHY_COPY[i].indexOf('.') + 1)}
            </div>
          </AnimateIn>
        ))}
      </div>
    </section>
  );
}
