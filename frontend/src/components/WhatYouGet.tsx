const BENEFITS = [
  { icon: '📱', title: 'Daily nudge', desc: 'One message following the CIDS framework' },
  { icon: '📖', title: 'CIDS Framework Guide', desc: 'Free PDF — everything you need on one page per pillar' },
  { icon: '👊', title: 'Accountability', desc: 'We follow up. We check in. We keep you honest.' },
];

export function WhatYouGet() {
  return (
    <section className="px-4 py-8 border-t border-white/5">
      <h2 className="text-2xl font-extrabold tracking-tight mb-4">
        What You Get
      </h2>
      {BENEFITS.map((b, i) => (
        <div key={i} className="flex items-center gap-3 py-3 border-b border-white/5">
          <div className="w-9 h-9 rounded-lg bg-[#6366f1]/15 flex items-center justify-center text-base flex-shrink-0">
            {b.icon}
          </div>
          <div className="text-sm text-white/70">
            <strong className="text-white block">{b.title}</strong>
            {b.desc}
          </div>
        </div>
      ))}
    </section>
  );
}
