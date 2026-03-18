// frontend/src/components/HomeContent.tsx
'use client';

import { useState } from 'react';
import { Nav } from './Nav';
import { Hero } from './Hero';
import { WhyOrder } from './WhyOrder';
import { Gallery } from './Gallery';
import { Assessment } from './Assessment';
import { SignupForm } from './SignupForm';
import { Transformations } from './Transformations';
import { Footer } from './Footer';
import type { AssessmentAnswers } from '@/lib/scoring';

export function HomeContent() {
  const [assessmentResult, setAssessmentResult] = useState<AssessmentAnswers | undefined>();

  return (
    <>
      <Nav />
      <Hero />
      <WhyOrder />
      <Gallery />
      <Assessment onComplete={setAssessmentResult} />
      <SignupForm assessmentResult={assessmentResult} />
      <Transformations />
      <Footer />
    </>
  );
}
