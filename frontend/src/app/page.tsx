import { Nav } from '@/components/Nav';
import { Hero } from '@/components/Hero';
import { WhyOrder } from '@/components/WhyOrder';
import { Gallery } from '@/components/Gallery';
import { Assessment } from '@/components/Assessment';
import { WhatYouGet } from '@/components/WhatYouGet';
import { Transformations } from '@/components/Transformations';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <main className="max-w-md mx-auto">
      <Nav />
      <Hero />
      <WhyOrder />
      <Gallery />
      <Assessment />
      {/* SignupForm goes here in Task 7 */}
      <WhatYouGet />
      <Transformations />
      <Footer />
    </main>
  );
}
