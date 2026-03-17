export function Footer() {
  return (
    <footer className="px-4 py-6 border-t border-white/5 text-center">
      <div className="text-base font-extrabold tracking-tighter mb-2">
        CIDS
      </div>
      <div className="text-xs text-white/30 space-x-2">
        <a href="#" className="hover:text-white/50">Privacy</a>
        <span>·</span>
        <a href="#" className="hover:text-white/50">Unsubscribe</a>
        <span>·</span>
        <a href="#" className="hover:text-white/50">Contact</a>
      </div>
      <p className="text-[10px] text-white/20 mt-3">
        © 2026 CIDS Training. The rest is noise.
      </p>
    </footer>
  );
}
