import Image from 'next/image';

const GALLERY_ITEMS = [
  {
    image: '/images/consistency-lacing-shoes.jpg',
    quote: '"I stopped trying to be perfect and just started showing up."',
  },
  {
    image: '/images/intensity-chalk-grip.jpg',
    quote: '"The only workout you regret is the one you didn\'t do."',
  },
  {
    image: '/images/diet-meal-prep.jpg',
    quote: '"Meal prep Sunday changed everything for me."',
  },
  {
    image: '/images/sleep-rest.jpg',
    quote: '"I thought sleep was for the weak. I was wrong."',
  },
];

export function Gallery() {
  return (
    <section className="py-8 border-t border-white/5">
      <div className="px-4">
        <h2 className="text-2xl font-extrabold tracking-tight mb-1">
          Real People. Real Work.
        </h2>
        <p className="text-sm text-white/40 mb-5">Swipe for inspiration</p>
      </div>

      <div className="flex gap-3 overflow-x-auto px-4 pb-3 snap-x snap-mandatory scrollbar-hide">
        {GALLERY_ITEMS.map((item, i) => (
          <div
            key={i}
            className="relative min-w-[240px] h-40 rounded-xl overflow-hidden snap-start flex-shrink-0"
          >
            <Image
              src={item.image}
              alt=""
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <p className="absolute bottom-3 left-3 right-3 text-xs italic text-white/80 leading-relaxed">
              {item.quote}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
