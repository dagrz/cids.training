const BENEFITS = [
  { icon: '📖', title: 'Your Personalized CIDS Guide', desc: 'Based on your assessment — start where you need to' },
  { icon: '📊', title: 'Weekly Accountability Check-In', desc: 'Track your progress and stay honest with yourself' },
  { icon: '🧠', title: 'Advice That Evolves With You', desc: 'As you level up through CIDS, so does your program' },
  { icon: '🏷️', title: 'Early Access to Merch & Deals', desc: 'Gear and extras before anyone else' },
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
