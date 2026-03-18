import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CIDS — Consistency, Intensity, Diet, Sleep',
  description: 'The only training framework you need. Show Up. Push Hard. Eat Right. Rest Well. Building muscle should be simple, not easy.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-cids-bg text-white font-sans antialiased">{children}</body>
    </html>
  );
}
