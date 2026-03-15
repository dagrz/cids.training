'use client';

export function Nav() {
  const scrollToSignup = () => {
    document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-cids-bg-deep/95 backdrop-blur-md">
      <span className="text-lg font-black tracking-tighter">CIDS</span>
      <button
        onClick={scrollToSignup}
        className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
      >
        Start Now
      </button>
    </nav>
  );
}
