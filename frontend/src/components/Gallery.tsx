import Image from 'next/image';

const GALLERY_ITEMS = [
  {
    image: '/images/consistency-lacing-shoes.jpg',
    quote: '"I stopped trying to be perfect and just started showing up."',
    borderColor: '#6366f1',
  },
  {
    image: '/images/intensity-chalk-grip.jpg',
    quote: '"The only workout you regret is the one you didn\'t do."',
    borderColor: '#ec4899',
  },
  {
    image: '/images/diet-meal-prep.jpg',
    quote: '"Meal prep Sunday changed everything for me."',
    borderColor: '#f59e0b',
  },
  {
    image: '/images/sleep-rest.jpg',
    quote: '"I thought sleep was for the weak. I was wrong."',
    borderColor: '#06b6d4',
  },
];

export function Gallery() {
  return (
    <section className="py-8 border-t border-white/5">
      <div className="px-4">
        <h2 className="text-2xl font-extrabold tracking-tight mb-1">
          Real People. Real Work.
        </h2>
        <p className="text-sm text-white/40 mb-5"></p>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4">
        {GALLERY_ITEMS.map((item, i) => (
          <div
            key={i}
            className="relative w-full aspect-[3/4] rounded-xl overflow-hidden"
            style={{ border: `3px solid ${item.borderColor}80`, boxShadow: `0 0 20px ${item.borderColor}20` }}
          >
            <Image
              src={item.image}
              alt=""
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <p className="absolute bottom-3 left-3 right-3 text-[11px] italic text-white/90 leading-relaxed">
              {item.quote}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
