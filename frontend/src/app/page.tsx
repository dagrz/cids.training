import { Nav } from '@/components/Nav';
import { Hero } from '@/components/Hero';
import { WhyOrder } from '@/components/WhyOrder';
import { Gallery } from '@/components/Gallery';
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
      {/* Assessment and Signup go here in Task 6-7 */}
      <WhatYouGet />
      <Transformations />
      <Footer />
    </main>
  );
}
