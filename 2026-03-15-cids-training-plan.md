# CIDS.training Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first single-page site teaching the CIDS training framework, with self-assessment, email/SMS signup, and daily nudge messaging.

**Architecture:** Next.js static export served via S3/CloudFront. Three Lambda functions (signup, nudge, unsubscribe) behind API Gateway with DynamoDB. All infrastructure via CDK in TypeScript.

**Tech Stack:** Next.js 14+, TypeScript, Tailwind CSS, Framer Motion, AWS CDK, Lambda, DynamoDB, API Gateway, SES, SNS, Vitest, Testing Library, Playwright

---

## File Structure

```
cids.training/
├── package.json                    # workspace root
├── frontend/
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── public/
│   │   └── images/                 # hero-deadlift.jpg, etc.
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx          # root layout, fonts, metadata
│   │   │   ├── page.tsx            # assembles all sections
│   │   │   └── globals.css         # tailwind directives + custom
│   │   ├── components/
│   │   │   ├── Nav.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── PillarRow.tsx       # reusable pillar display row
│   │   │   ├── WhyOrder.tsx
│   │   │   ├── Gallery.tsx
│   │   │   ├── Assessment.tsx
│   │   │   ├── AssessmentResult.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── WhatYouGet.tsx
│   │   │   ├── Transformations.tsx
│   │   │   └── Footer.tsx
│   │   └── lib/
│   │       ├── pillars.ts          # pillar data constants
│   │       ├── scoring.ts          # assessment scoring logic
│   │       └── api.ts              # signup API client
│   └── __tests__/
│       ├── lib/
│       │   └── scoring.test.ts
│       └── components/
│           ├── Assessment.test.tsx
│           └── SignupForm.test.tsx
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── shared/
│   │   │   ├── types.ts            # shared interfaces
│   │   │   ├── db.ts               # DynamoDB client helpers
│   │   │   └── messaging.ts        # messaging interface + SMS impl
│   │   ├── signup/
│   │   │   └── handler.ts
│   │   ├── nudge/
│   │   │   ├── handler.ts
│   │   │   └── messages.ts         # message bank
│   │   └── unsubscribe/
│   │       └── handler.ts
│   └── __tests__/
│       ├── signup.test.ts
│       ├── nudge.test.ts
│       ├── unsubscribe.test.ts
│       ├── scoring.test.ts
│       └── messages.test.ts
├── infra/
│   ├── package.json
│   ├── tsconfig.json
│   ├── bin/
│   │   └── cids.ts                 # CDK app entry
│   └── lib/
│       ├── cids-stack.ts           # main stack
│       ├── frontend-construct.ts   # S3 + CloudFront + Route53
│       ├── api-construct.ts        # API GW + Lambdas
│       └── database-construct.ts   # DynamoDB table + GSIs
└── e2e/
    ├── package.json
    ├── playwright.config.ts
    └── signup.spec.ts
```

---

## Chunk 1: Project Scaffolding & Shared Code

### Task 1: Initialize Monorepo

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `.nvmrc`

- [ ] **Step 1: Initialize git repo**

```bash
cd "/Users/daniel/Library/CloudStorage/GoogleDrive-dan.grzelak@gmail.com/My Drive/Projects/cids.training"
git init
```

- [ ] **Step 2: Create workspace root package.json**

```json
{
  "name": "cids-training",
  "private": true,
  "workspaces": ["frontend", "backend", "infra", "e2e"],
  "scripts": {
    "test": "npm run test --workspaces --if-present",
    "build": "npm run build --workspace=frontend",
    "deploy:dev": "npm run deploy:dev --workspace=infra",
    "deploy:prod": "npm run deploy:prod --workspace=infra"
  }
}
```

- [ ] **Step 3: Create .gitignore**

```
node_modules/
.next/
out/
dist/
cdk.out/
.env*
*.js.map
.superpowers/
```

- [ ] **Step 4: Create .nvmrc**

```
20
```

- [ ] **Step 5: Move images into frontend/public/images/**

```bash
mkdir -p frontend/public/images
mv hero-deadlift.jpg consistency-lacing-shoes.jpg intensity-chalk-grip.jpg diet-meal-prep.jpg sleep-rest.jpg transformation-energy.jpg community-gym.jpg frontend/public/images/
```

- [ ] **Step 6: Commit**

```bash
git add package.json .gitignore .nvmrc frontend/public/images/
git commit -m "feat: initialize monorepo with workspace structure and images"
```

---

### Task 2: Scaffold Next.js Frontend

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/next.config.ts`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/postcss.config.js`
- Create: `frontend/vitest.config.ts`
- Create: `frontend/vitest.setup.ts`
- Create: `frontend/src/app/globals.css`
- Create: `frontend/src/app/layout.tsx`
- Create: `frontend/src/app/page.tsx`

- [ ] **Step 1: Create frontend/package.json**

```json
{
  "name": "cids-frontend",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "framer-motion": "^11.0.0"
  },
  "devDependencies": {
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.4.0",
    "vitest": "^2.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "jsdom": "^24.0.0"
  }
}
```

- [ ] **Step 2: Create frontend/next.config.ts**

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

- [ ] **Step 3: Create frontend/tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cids: {
          bg: '#0f0f0f',
          'bg-deep': '#0a0a15',
          'bg-card': '#1a1a2e',
          consistency: { from: '#6366f1', to: '#8b5cf6' },
          intensity: { from: '#ec4899', to: '#f43f5e' },
          diet: { from: '#f59e0b', to: '#f97316' },
          sleep: { from: '#06b6d4', to: '#3b82f6' },
        },
      },
      fontWeight: {
        black: '900',
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 4: Create frontend/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": { "@/*": ["./src/*"] },
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: Create frontend/postcss.config.js**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 6: Create frontend/vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

- [ ] **Step 7: Create frontend/vitest.setup.ts**

```typescript
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 8: Create frontend/src/app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%);
  min-height: 100vh;
}

/* Hide scrollbar for horizontal scroll gallery */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
```

- [ ] **Step 9: Create frontend/src/app/layout.tsx**

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CIDS — Consistency, Intensity, Diet, Sleep',
  description:
    'The only training framework you need. Show Up. Push Hard. Eat Right. Rest Well. Everything else is optimization.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-cids-bg text-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 10: Create frontend/src/app/page.tsx (placeholder)**

```tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-5xl font-black tracking-tighter">CIDS</h1>
    </main>
  );
}
```

- [ ] **Step 11: Install dependencies and verify dev server**

```bash
cd frontend && npm install && npm run dev
```
Expected: Dev server starts, page shows "CIDS" at localhost:3000

- [ ] **Step 12: Commit**

```bash
git add frontend/
git commit -m "feat: scaffold Next.js frontend with Tailwind and Vitest"
```

---

### Task 3: Pillar Data & Scoring Logic (TDD)

**Files:**
- Create: `frontend/src/lib/pillars.ts`
- Create: `frontend/src/lib/scoring.ts`
- Create: `frontend/__tests__/lib/scoring.test.ts`

- [ ] **Step 1: Create frontend/src/lib/pillars.ts**

```typescript
export type PillarId = 'C' | 'I' | 'D' | 'S';

export interface Pillar {
  id: PillarId;
  number: string;
  name: string;
  tagline: string;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  question: string;
  answers: string[];
  resultCopy: string;
  resultTip: string;
}

export const PILLARS: Pillar[] = [
  {
    id: 'C',
    number: '01',
    name: 'Consistency',
    tagline: 'Show Up',
    gradientFrom: '#6366f1',
    gradientTo: '#8b5cf6',
    borderColor: '#6366f1',
    question: 'What does your week look like?',
    answers: [
      "I haven't trained in months (or ever)",
      'I start strong on Monday but it falls apart by Wednesday',
      'I get in a few sessions but it\'s random',
      'I show up like clockwork, no excuses',
    ],
    resultCopy: 'Your priority: Consistency. Nothing else matters until you\'re showing up.',
    resultTip: 'Commit to 3 days this week. Any 3 days. Put them in your calendar right now. Don\'t think about what you\'ll do — just show up.',
  },
  {
    id: 'I',
    number: '02',
    name: 'Intensity',
    tagline: 'Push Hard',
    gradientFrom: '#ec4899',
    gradientTo: '#f43f5e',
    borderColor: '#ec4899',
    question: "When you do train, what's it actually like?",
    answers: [
      'I scroll my phone between sets and leave dry',
      'I break a sweat but could talk through it',
      "I'm breathing hard, counting down rest seconds",
      'I grunt, sweat through my shirt, question my life choices',
    ],
    resultCopy: "Your priority: Intensity. You're showing up — now make it count.",
    resultTip: 'Next session: put your phone in your bag. Set a timer for rest periods. When the timer goes off, you go. No scrolling.',
  },
  {
    id: 'D',
    number: '03',
    name: 'Diet',
    tagline: 'Eat Right',
    gradientFrom: '#f59e0b',
    gradientTo: '#f97316',
    borderColor: '#f59e0b',
    question: "What's your protein situation?",
    answers: [
      "Protein what? I couldn't tell you how many grams",
      "I know I should eat more but I'm winging it",
      "I hit my protein most days but meals aren't consistent",
      'I track my macros and eat to fuel my training',
    ],
    resultCopy: "Your priority: Diet. You're doing the work — now fuel it.",
    resultTip: 'This week: track your protein for 3 days. Just protein, nothing else. Know your number. Aim for 1g per pound of bodyweight.',
  },
  {
    id: 'S',
    number: '04',
    name: 'Sleep',
    tagline: 'Rest Well',
    gradientFrom: '#06b6d4',
    gradientTo: '#3b82f6',
    borderColor: '#06b6d4',
    question: "What's 6am feel like?",
    answers: [
      "I didn't sleep, or slept 4 hours doom-scrolling",
      'Hit snooze 5 times, dragged myself up wrecked',
      "Alarm went off, took a minute but I'm functional",
      'Eyes open before the alarm, ready to go',
    ],
    resultCopy: "Your priority: Sleep. You're earning it — now let your body rebuild.",
    resultTip: 'Tonight: phone on the charger in another room by 10pm. No negotiation. Do it for 5 nights straight and feel the difference.',
  },
];

export const PILLAR_ORDER: PillarId[] = ['C', 'I', 'D', 'S'];
```

- [ ] **Step 2: Write failing scoring tests**

```typescript
// frontend/__tests__/lib/scoring.test.ts
import { describe, it, expect } from 'vitest';
import { scoreAssessment, type AssessmentAnswers } from '@/lib/scoring';
import { PillarId } from '@/lib/pillars';

describe('scoreAssessment', () => {
  it('returns the pillar with the lowest score', () => {
    const answers: AssessmentAnswers = { C: 3, I: 2, D: 4, S: 3 };
    expect(scoreAssessment(answers)).toBe('I');
  });

  it('breaks ties by CIDS order (earlier pillar wins)', () => {
    const answers: AssessmentAnswers = { C: 2, I: 2, D: 3, S: 4 };
    expect(scoreAssessment(answers)).toBe('C');
  });

  it('returns C when all scores are equal', () => {
    const answers: AssessmentAnswers = { C: 3, I: 3, D: 3, S: 3 };
    expect(scoreAssessment(answers)).toBe('C');
  });

  it('returns S when sleep is the only low score', () => {
    const answers: AssessmentAnswers = { C: 4, I: 4, D: 4, S: 1 };
    expect(scoreAssessment(answers)).toBe('S');
  });

  it('breaks tie between D and S in favor of D', () => {
    const answers: AssessmentAnswers = { C: 4, I: 4, D: 1, S: 1 };
    expect(scoreAssessment(answers)).toBe('D');
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd frontend && npx vitest run __tests__/lib/scoring.test.ts
```
Expected: FAIL — module `@/lib/scoring` not found

- [ ] **Step 4: Implement scoring**

```typescript
// frontend/src/lib/scoring.ts
import { PILLAR_ORDER, type PillarId } from './pillars';

export type AssessmentAnswers = Record<PillarId, number>;

export function scoreAssessment(answers: AssessmentAnswers): PillarId {
  let lowestScore = Infinity;
  let weakestPillar: PillarId = 'C';

  for (const pillar of PILLAR_ORDER) {
    if (answers[pillar] < lowestScore) {
      lowestScore = answers[pillar];
      weakestPillar = pillar;
    }
  }

  return weakestPillar;
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd frontend && npx vitest run __tests__/lib/scoring.test.ts
```
Expected: All 5 tests PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/src/lib/ frontend/__tests__/
git commit -m "feat: add pillar data constants and assessment scoring with tests"
```

---

## Chunk 2: Frontend Components

### Task 4: Nav + Hero + PillarRow Components

**Files:**
- Create: `frontend/src/components/Nav.tsx`
- Create: `frontend/src/components/PillarRow.tsx`
- Create: `frontend/src/components/Hero.tsx`
- Modify: `frontend/src/app/page.tsx`

- [ ] **Step 1: Create Nav component**

```tsx
// frontend/src/components/Nav.tsx
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
```

- [ ] **Step 2: Create PillarRow component**

```tsx
// frontend/src/components/PillarRow.tsx
import type { Pillar } from '@/lib/pillars';

interface PillarRowProps {
  pillar: Pillar;
}

export function PillarRow({ pillar }: PillarRowProps) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-3 rounded-r-lg"
      style={{
        backgroundColor: `${pillar.borderColor}15`,
        borderLeft: `3px solid ${pillar.borderColor}`,
      }}
    >
      <span
        className="text-lg font-extrabold"
        style={{ color: pillar.gradientTo }}
      >
        {pillar.number}
      </span>
      <div>
        <div className="text-sm font-bold">{pillar.name}</div>
        <div className="text-xs text-white/40">{pillar.tagline}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create Hero component**

```tsx
// frontend/src/components/Hero.tsx
import Image from 'next/image';
import { PILLARS } from '@/lib/pillars';
import { PillarRow } from './PillarRow';

export function Hero() {
  return (
    <section className="px-4 py-8 text-center">
      <h1 className="text-6xl font-black tracking-tighter leading-none">
        CIDS
      </h1>
      <p className="text-xs tracking-[4px] text-white/30 uppercase mt-1 mb-6">
        Training Framework
      </p>

      <div className="flex flex-col gap-2 mb-6">
        {PILLARS.map((pillar) => (
          <PillarRow key={pillar.id} pillar={pillar} />
        ))}
      </div>

      <p className="text-sm text-white/40 italic mb-6">
        Everything else is optimization.
      </p>

      <div className="rounded-xl overflow-hidden">
        <Image
          src="/images/hero-deadlift.jpg"
          alt="Person training with focus and determination"
          width={800}
          height={450}
          className="w-full h-auto"
          priority
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Update page.tsx to use components**

```tsx
// frontend/src/app/page.tsx
import { Nav } from '@/components/Nav';
import { Hero } from '@/components/Hero';

export default function Home() {
  return (
    <main className="max-w-md mx-auto">
      <Nav />
      <Hero />
    </main>
  );
}
```

- [ ] **Step 5: Verify in browser**

```bash
cd frontend && npm run dev
```
Expected: Hero renders with CIDS title, pillar stack, tagline, and hero image at localhost:3000

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/ frontend/src/app/page.tsx
git commit -m "feat: add Nav, Hero, and PillarRow components"
```

---

### Task 5: WhyOrder + Gallery + WhatYouGet + Transformations + Footer

**Files:**
- Create: `frontend/src/components/WhyOrder.tsx`
- Create: `frontend/src/components/Gallery.tsx`
- Create: `frontend/src/components/WhatYouGet.tsx`
- Create: `frontend/src/components/Transformations.tsx`
- Create: `frontend/src/components/Footer.tsx`
- Modify: `frontend/src/app/page.tsx`

- [ ] **Step 1: Create WhyOrder component**

```tsx
// frontend/src/components/WhyOrder.tsx
import { PILLARS } from '@/lib/pillars';

const WHY_COPY = [
  "Consistency comes first. Nothing else matters if you don't show up. Don't worry about your diet or sleep hacks. Just get in the door, every single day.",
  "Then bring intensity. You're showing up — great. Now make it count. Don't scroll between sets. Don't coast. Push until it's uncomfortable.",
  "Now fuel it properly. You're consistent and training hard. Time to support that with the right food. Hit your protein. Plan your meals. Stop winging it.",
  "Finally, recover. You're doing the work and eating right. Now let your body rebuild. Phone down, lights out, 7-8 hours. This is where the gains happen.",
];

export function WhyOrder() {
  return (
    <section className="px-4 py-8 border-t border-white/5">
      <h2 className="text-2xl font-extrabold tracking-tight mb-1">
        Why This Order Matters
      </h2>
      <p className="text-sm text-white/40 mb-5">
        Master each one before moving to the next.
      </p>

      <div className="flex flex-col gap-3">
        {PILLARS.map((pillar, i) => (
          <div
            key={pillar.id}
            className="p-4 rounded-r-lg text-sm leading-relaxed text-white/70"
            style={{
              backgroundColor: `${pillar.borderColor}10`,
              borderLeft: `3px solid ${pillar.borderColor}`,
            }}
          >
            <strong className="text-white">{WHY_COPY[i].split('.')[0]}.</strong>
            {WHY_COPY[i].substring(WHY_COPY[i].indexOf('.') + 1)}
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create Gallery component**

```tsx
// frontend/src/components/Gallery.tsx
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
```

- [ ] **Step 3: Create WhatYouGet component**

```tsx
// frontend/src/components/WhatYouGet.tsx
const BENEFITS = [
  { icon: '📱', title: 'Daily nudge', desc: 'One message following the CIDS framework' },
  { icon: '📊', title: 'Self-assessment', desc: 'Know exactly which pillar to focus on' },
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
```

- [ ] **Step 4: Create Transformations component**

```tsx
// frontend/src/components/Transformations.tsx
import Image from 'next/image';

const TESTIMONIALS = [
  {
    image: '/images/transformation-energy.jpg',
    quote: "Six months ago I couldn't get off the couch. I didn't change my workout program — I just started showing up. CIDS gave me the order. The rest took care of itself.",
  },
  {
    image: '/images/community-gym.jpg',
    quote: "I tried every app, every program. CIDS is the only thing that stuck because it doesn't ask you to be perfect — it asks you to be consistent.",
  },
];

export function Transformations() {
  return (
    <section className="px-4 py-8 border-t border-white/5">
      <h2 className="text-2xl font-extrabold tracking-tight mb-1">
        It&apos;s Not About the Body
      </h2>
      <p className="text-sm text-white/40 mb-5">
        It&apos;s about the energy, the posture, the confidence.
      </p>

      <div className="flex flex-col gap-3">
        {TESTIMONIALS.map((t, i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden bg-cids-bg-card border border-white/5"
          >
            <div className="relative h-36">
              <Image src={t.image} alt="" fill className="object-cover" />
            </div>
            <div className="p-4">
              <p className="text-sm text-white/60 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create Footer component**

```tsx
// frontend/src/components/Footer.tsx
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
        © 2026 CIDS Training. Everything else is optimization.
      </p>
    </footer>
  );
}
```

- [ ] **Step 6: Update page.tsx with all static sections**

```tsx
// frontend/src/app/page.tsx
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
```

- [ ] **Step 7: Verify in browser — scroll through all sections on mobile viewport**

```bash
cd frontend && npm run dev
```
Expected: Full page renders with all static sections, images load, horizontal scroll on gallery works

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/ frontend/src/app/page.tsx
git commit -m "feat: add WhyOrder, Gallery, WhatYouGet, Transformations, and Footer sections"
```

---

### Task 6: Assessment Component (TDD)

**Files:**
- Create: `frontend/src/components/Assessment.tsx`
- Create: `frontend/src/components/AssessmentResult.tsx`
- Create: `frontend/__tests__/components/Assessment.test.tsx`
- Modify: `frontend/src/app/page.tsx`

- [ ] **Step 1: Write failing Assessment test**

```tsx
// frontend/__tests__/components/Assessment.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Assessment } from '@/components/Assessment';

describe('Assessment', () => {
  it('renders all 4 pillar questions', () => {
    render(<Assessment />);
    expect(screen.getByText('What does your week look like?')).toBeInTheDocument();
    expect(screen.getByText("When you do train, what's it actually like?")).toBeInTheDocument();
    expect(screen.getByText("What's your protein situation?")).toBeInTheDocument();
    expect(screen.getByText("What's 6am feel like?")).toBeInTheDocument();
  });

  it('shows result after all questions answered', () => {
    render(<Assessment />);

    // Answer all 4 questions with first option (score 1 each)
    fireEvent.click(screen.getByText("I haven't trained in months (or ever)"));
    fireEvent.click(screen.getByText('I scroll my phone between sets and leave dry'));
    fireEvent.click(screen.getByText("Protein what? I couldn't tell you how many grams"));
    fireEvent.click(screen.getByText("I didn't sleep, or slept 4 hours doom-scrolling"));

    // C wins tie at score 1 (CIDS order)
    expect(screen.getByText(/Your priority: Consistency/)).toBeInTheDocument();
  });

  it('highlights the correct weakest pillar', () => {
    render(<Assessment />);

    // C=4, I=1, D=4, S=4 => Intensity is weakest
    fireEvent.click(screen.getByText('I show up like clockwork, no excuses'));
    fireEvent.click(screen.getByText('I scroll my phone between sets and leave dry'));
    fireEvent.click(screen.getByText('I track my macros and eat to fuel my training'));
    fireEvent.click(screen.getByText('Eyes open before the alarm, ready to go'));

    expect(screen.getByText(/Your priority: Intensity/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd frontend && npx vitest run __tests__/components/Assessment.test.tsx
```
Expected: FAIL — module not found

- [ ] **Step 3: Implement Assessment component**

```tsx
// frontend/src/components/Assessment.tsx
'use client';

import { useState } from 'react';
import { PILLARS, type PillarId } from '@/lib/pillars';
import { scoreAssessment, type AssessmentAnswers } from '@/lib/scoring';
import { AssessmentResult } from './AssessmentResult';

export function Assessment() {
  const [answers, setAnswers] = useState<Partial<AssessmentAnswers>>({});
  const [result, setResult] = useState<PillarId | null>(null);

  const handleAnswer = (pillarId: PillarId, score: number) => {
    const updated = { ...answers, [pillarId]: score };
    setAnswers(updated);

    if (Object.keys(updated).length === 4) {
      setResult(scoreAssessment(updated as AssessmentAnswers));
    }
  };

  if (result) {
    const pillar = PILLARS.find((p) => p.id === result)!;
    return (
      <AssessmentResult
        pillar={pillar}
        answers={answers as AssessmentAnswers}
        onReset={() => {
          setAnswers({});
          setResult(null);
        }}
      />
    );
  }

  return (
    <section id="assessment" className="px-4 py-8 border-t border-white/5">
      <h2 className="text-2xl font-extrabold tracking-tight mb-1">
        Where Do You Start?
      </h2>
      <p className="text-sm text-white/40 mb-5">
        Tap the answer that fits. Be honest.
      </p>

      {PILLARS.map((pillar) => (
        <div key={pillar.id} className="mb-5">
          <h4
            className="text-sm font-bold mb-2"
            style={{ color: pillar.gradientTo }}
          >
            {pillar.name} — {pillar.question}
          </h4>
          {pillar.answers.map((answer, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(pillar.id, i + 1)}
              className={`block w-full text-left text-xs px-3 py-2.5 mb-1.5 rounded-lg border transition-colors ${
                answers[pillar.id] === i + 1
                  ? 'border-white/30 text-white bg-white/10'
                  : 'border-white/10 text-white/60 bg-white/[0.03] hover:border-white/20 hover:text-white'
              }`}
            >
              {answer}
            </button>
          ))}
        </div>
      ))}
    </section>
  );
}
```

- [ ] **Step 4: Implement AssessmentResult component**

```tsx
// frontend/src/components/AssessmentResult.tsx
import type { Pillar } from '@/lib/pillars';
import type { AssessmentAnswers } from '@/lib/scoring';

interface AssessmentResultProps {
  pillar: Pillar;
  answers: AssessmentAnswers;
  onReset: () => void;
}

export function AssessmentResult({ pillar, answers, onReset }: AssessmentResultProps) {
  return (
    <section className="px-4 py-8 border-t border-white/5">
      <div
        className="rounded-xl p-6 border"
        style={{
          backgroundColor: `${pillar.borderColor}10`,
          borderColor: `${pillar.borderColor}30`,
        }}
      >
        <div className="text-xs uppercase tracking-widest text-white/40 mb-2">
          Your Result
        </div>
        <h3 className="text-xl font-extrabold mb-3" style={{ color: pillar.gradientTo }}>
          {pillar.resultCopy}
        </h3>
        <p className="text-sm text-white/60 leading-relaxed mb-4">
          {pillar.resultTip}
        </p>
        <button
          onClick={onReset}
          className="text-xs text-white/30 underline hover:text-white/50"
        >
          Retake assessment
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd frontend && npx vitest run __tests__/components/Assessment.test.tsx
```
Expected: All 3 tests PASS

- [ ] **Step 6: Add Assessment to page.tsx**

Replace the comment `{/* Assessment and Signup go here in Task 6-7 */}` with:

```tsx
<Assessment />
{/* SignupForm goes here in Task 7 */}
```

Add import: `import { Assessment } from '@/components/Assessment';`

Note: Keep page.tsx as a Server Component. Assessment already has `'use client'` so it handles its own client boundary. Do NOT add `'use client'` to page.tsx — that would break the metadata export in layout.tsx and force all sections to be client-rendered unnecessarily.

- [ ] **Step 7: Verify in browser — complete the assessment flow**

```bash
cd frontend && npm run dev
```
Expected: Assessment renders, tapping answers highlights them, after all 4 answered the result card appears with correct pillar

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/ frontend/__tests__/ frontend/src/app/page.tsx
git commit -m "feat: add interactive self-assessment with scoring and result display"
```

---

### Task 7: Signup Form Component (TDD)

**Files:**
- Create: `frontend/src/components/SignupForm.tsx`
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/__tests__/components/SignupForm.test.tsx`
- Modify: `frontend/src/app/page.tsx`

- [ ] **Step 1: Write failing SignupForm test**

```tsx
// frontend/__tests__/components/SignupForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignupForm } from '@/components/SignupForm';

describe('SignupForm', () => {
  it('renders email and phone inputs', () => {
    render(<SignupForm />);
    expect(screen.getByPlaceholderText('Your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your phone number')).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    render(<SignupForm />);
    fireEvent.change(screen.getByPlaceholderText('Your email'), {
      target: { value: 'notanemail' },
    });
    fireEvent.change(screen.getByPlaceholderText('Your phone number'), {
      target: { value: '5551234567' },
    });
    fireEvent.click(screen.getByRole('button', { name: /start now/i }));

    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  it('shows success message after valid submission', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    render(<SignupForm />);
    fireEvent.change(screen.getByPlaceholderText('Your email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Your phone number'), {
      target: { value: '5551234567' },
    });
    fireEvent.click(screen.getByRole('button', { name: /start now/i }));

    await waitFor(() => {
      expect(screen.getByText(/you're in/i)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd frontend && npx vitest run __tests__/components/SignupForm.test.tsx
```
Expected: FAIL

- [ ] **Step 3: Create API client**

```typescript
// frontend/src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface SignupPayload {
  email: string;
  phone: string;
  countryCode: string;
  assessmentResult?: Record<string, number>;
}

export async function submitSignup(payload: SignupPayload): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Signup failed');
  }

  return response.json();
}
```

- [ ] **Step 4: Implement SignupForm component**

```tsx
// frontend/src/components/SignupForm.tsx
'use client';

import { useState } from 'react';
import { submitSignup } from '@/lib/api';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!phone || phone.replace(/\D/g, '').length < 7) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      await submitSignup({ email, phone: phone.replace(/\D/g, ''), countryCode });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section id="signup" className="px-4 py-8 border-t border-white/5 text-center">
        <div className="text-2xl font-extrabold mb-2">You&apos;re In 🤝</div>
        <p className="text-sm text-white/50">
          Check your email for the CIDS Framework Guide. Your first nudge is coming tomorrow morning.
        </p>
      </section>
    );
  }

  return (
    <section id="signup" className="px-4 py-8 border-t border-white/5">
      <h2 className="text-2xl font-extrabold tracking-tight mb-1">
        Get Your Daily Nudge
      </h2>
      <p className="text-sm text-white/40 mb-5">
        One message a day. No spam. Just a reminder to Show Up, Push Hard, Eat Right, Rest Well.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white/[0.06] border border-white/10 rounded-lg px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
        />
        <div className="flex gap-2">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="bg-white/[0.06] border border-white/10 rounded-lg px-3 py-3.5 text-sm text-white outline-none w-20"
          >
            <option value="+1">+1</option>
            <option value="+44">+44</option>
            <option value="+61">+61</option>
            <option value="+91">+91</option>
          </select>
          <input
            type="tel"
            placeholder="Your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1 bg-white/[0.06] border border-white/10 rounded-lg px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30"
          />
        </div>

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-lg py-3.5 text-sm font-bold uppercase tracking-widest disabled:opacity-50"
        >
          {loading ? 'Signing up...' : 'Start Now'}
        </button>
      </form>

      <p className="text-[11px] text-white/25 mt-2.5 text-center">
        Unsubscribe anytime. We respect your sleep — no messages after 9pm.
      </p>
    </section>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd frontend && npx vitest run __tests__/components/SignupForm.test.tsx
```
Expected: All 3 tests PASS

- [ ] **Step 6: Add SignupForm to page.tsx**

Replace `{/* SignupForm goes here in Task 7 */}` with `<SignupForm />` and add import.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/SignupForm.tsx frontend/src/lib/api.ts frontend/__tests__/components/ frontend/src/app/page.tsx
git commit -m "feat: add signup form with validation and API integration"
```

---

### Task 8: Scroll Animations with Framer Motion

**Files:**
- Create: `frontend/src/components/AnimateIn.tsx`
- Modify: `frontend/src/components/Hero.tsx` (wrap pillar rows)
- Modify: `frontend/src/components/WhyOrder.tsx` (wrap order items)

- [ ] **Step 1: Create reusable AnimateIn wrapper**

```tsx
// frontend/src/components/AnimateIn.tsx
'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface AnimateInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function AnimateIn({ children, delay = 0, className }: AnimateInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Wrap PillarRow items in Hero with staggered AnimateIn**

In `Hero.tsx`, add import `import { AnimateIn } from './AnimateIn';` and change the pillar map to:

```tsx
{PILLARS.map((pillar, i) => (
  <AnimateIn key={pillar.id} delay={i * 0.1}>
    <PillarRow pillar={pillar} />
  </AnimateIn>
))}
```

- [ ] **Step 3: Wrap WhyOrder items with AnimateIn**

In `WhyOrder.tsx`, add import `import { AnimateIn } from './AnimateIn';` and wrap each order item:

```tsx
{PILLARS.map((pillar, i) => (
  <AnimateIn key={pillar.id} delay={i * 0.1}>
    <div
      className="p-4 rounded-r-lg text-sm leading-relaxed text-white/70"
      style={{
        backgroundColor: `${pillar.borderColor}10`,
        borderLeft: `3px solid ${pillar.borderColor}`,
      }}
    >
      <strong className="text-white">{WHY_COPY[i].split('.')[0]}.</strong>
      {WHY_COPY[i].substring(WHY_COPY[i].indexOf('.') + 1)}
    </div>
  </AnimateIn>
))}
```

- [ ] **Step 4: Verify animations in browser**

```bash
cd frontend && npm run dev
```
Expected: Pillar rows and order items animate in on scroll with stagger

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/
git commit -m "feat: add scroll-triggered animations with Framer Motion"
```

---

## Chunk 3: Backend

### Task 9: Backend Scaffolding & Shared Types

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/src/shared/types.ts`

- [ ] **Step 1: Create backend/package.json**

```json
{
  "name": "cids-backend",
  "private": true,
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.500.0",
    "@aws-sdk/lib-dynamodb": "^3.500.0",
    "@aws-sdk/client-ses": "^3.500.0",
    "@aws-sdk/client-sns": "^3.500.0",
    "@aws-sdk/s3-request-presigner": "^3.500.0",
    "@aws-sdk/client-s3": "^3.500.0",
    "@types/aws-lambda": "^8.10.130"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Create backend/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "__tests__"]
}
```

- [ ] **Step 3: Create shared types**

```typescript
// backend/src/shared/types.ts
export type PillarId = 'C' | 'I' | 'D' | 'S';

export interface AssessmentResult {
  C: number;
  I: number;
  D: number;
  S: number;
}

export interface Subscriber {
  email: string;
  phone: string;
  assessmentResult: AssessmentResult;
  weakestPillar: PillarId;
  signupDate: string;
  currentPhase: number;
  status: 'active' | 'unsubscribed';
  unsubscribeToken: string;
  lastNudgeDate?: string;
  lastMessageIndex: Record<PillarId, number>;
  messagingChannel: 'whatsapp' | 'sms';
}

export interface SignupRequest {
  email: string;
  phone: string;
  countryCode: string;
  timezone: string; // IANA timezone e.g. 'America/New_York'
  assessmentResult?: AssessmentResult;
}
```

- [ ] **Step 4: Install deps and verify build**

```bash
cd backend && npm install && npx tsc --noEmit
```
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add backend/package.json backend/tsconfig.json backend/src/shared/types.ts
git commit -m "feat: scaffold backend with shared types"
```

---

### Task 10: DynamoDB Client & Signup Lambda (TDD)

**Files:**
- Create: `backend/src/shared/db.ts`
- Create: `backend/src/signup/handler.ts`
- Create: `backend/__tests__/signup.test.ts`
- Create: `backend/vitest.config.ts`

- [ ] **Step 1: Create backend/vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
  },
});
```

- [ ] **Step 2: Write failing signup tests**

```typescript
// backend/__tests__/signup.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEvent } from 'aws-lambda';

// Mock AWS SDK before importing handler
vi.mock('@aws-sdk/lib-dynamodb', () => {
  const mockSend = vi.fn();
  return {
    DynamoDBDocumentClient: { from: () => ({ send: mockSend }) },
    PutCommand: vi.fn(),
    GetCommand: vi.fn(),
    QueryCommand: vi.fn(),
    __mockSend: mockSend,
  };
});

vi.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('@aws-sdk/client-ses', () => ({
  SESClient: vi.fn().mockImplementation(() => ({ send: vi.fn() })),
  SendEmailCommand: vi.fn(),
}));

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(() => ({})),
  GetObjectCommand: vi.fn(),
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockResolvedValue('https://s3.example.com/guide.pdf?signed'),
}));

describe('signup handler', () => {
  let handler: any;
  let mockSend: any;

  beforeEach(async () => {
    vi.resetModules();
    vi.stubEnv('TABLE_NAME', 'test-table');
    vi.stubEnv('PDF_BUCKET', 'test-bucket');
    vi.stubEnv('PDF_KEY', 'guide.pdf');
    vi.stubEnv('FROM_EMAIL', 'noreply@cids.training');

    const mod = await import('@aws-sdk/lib-dynamodb') as any;
    mockSend = mod.__mockSend;
    mockSend.mockReset();

    // Default: no existing subscriber
    mockSend.mockResolvedValue({ Items: [] });

    handler = (await import('../src/signup/handler')).handler;
  });

  const makeEvent = (body: object): Partial<APIGatewayProxyEvent> => ({
    body: JSON.stringify(body),
    httpMethod: 'POST',
  });

  it('returns 400 for missing email', async () => {
    const result = await handler(makeEvent({ phone: '5551234567', countryCode: '+1' }));
    expect(result.statusCode).toBe(400);
  });

  it('returns 400 for invalid email', async () => {
    const result = await handler(makeEvent({ email: 'bad', phone: '5551234567', countryCode: '+1' }));
    expect(result.statusCode).toBe(400);
  });

  it('returns 200 for valid signup', async () => {
    const result = await handler(
      makeEvent({
        email: 'test@example.com',
        phone: '5551234567',
        countryCode: '+1',
        assessmentResult: { C: 2, I: 3, D: 4, S: 1 },
      })
    );
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).success).toBe(true);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd backend && npx vitest run __tests__/signup.test.ts
```
Expected: FAIL — handler module not found

- [ ] **Step 4: Create DynamoDB client helper**

```typescript
// backend/src/shared/db.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME!;

export async function putSubscriber(item: Record<string, any>) {
  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
}

export async function getSubscriber(email: string) {
  const result = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { email } }));
  return result.Item;
}

export async function queryByPhone(phone: string) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'phone-index',
      KeyConditionExpression: 'phone = :phone',
      ExpressionAttributeValues: { ':phone': phone },
    })
  );
  return result.Items || [];
}

export async function updateSubscriberStatus(email: string, status: string) {
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { email },
      UpdateExpression: 'SET #s = :status',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':status': status },
    })
  );
}
```

- [ ] **Step 5: Implement signup handler**

```typescript
// backend/src/signup/handler.ts
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { putSubscriber, getSubscriber, queryByPhone } from '../shared/db';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { PillarId, AssessmentResult, SignupRequest } from '../shared/types';

const ses = new SESClient({});
const s3 = new S3Client({});

const PILLAR_ORDER: PillarId[] = ['C', 'I', 'D', 'S'];

function scoreWeakest(result: AssessmentResult): PillarId {
  let lowest = Infinity;
  let weakest: PillarId = 'C';
  for (const p of PILLAR_ORDER) {
    if (result[p] < lowest) {
      lowest = result[p];
      weakest = p;
    }
  }
  return weakest;
}

function cors(response: APIGatewayProxyResult): APIGatewayProxyResult {
  return {
    ...response,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      ...response.headers,
    },
  };
}

export async function handler(event: Partial<APIGatewayProxyEvent>): Promise<APIGatewayProxyResult> {
  try {
    const body: SignupRequest = JSON.parse(event.body || '{}');

    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return cors({ statusCode: 400, body: JSON.stringify({ message: 'Please enter a valid email address' }) });
    }

    if (!body.phone || body.phone.replace(/\D/g, '').length < 7) {
      return cors({ statusCode: 400, body: JSON.stringify({ message: 'Please enter a valid phone number' }) });
    }

    const phone = `${body.countryCode || '+1'}${body.phone.replace(/\D/g, '')}`;

    // Check for duplicate phone with different email
    const phoneMatches = await queryByPhone(phone);
    const otherEmailWithPhone = phoneMatches.find((item: any) => item.email !== body.email);
    if (otherEmailWithPhone) {
      return cors({ statusCode: 409, body: JSON.stringify({ message: 'This number is already registered.' }) });
    }

    const assessment = body.assessmentResult || { C: 1, I: 1, D: 1, S: 1 };
    const weakestPillar = scoreWeakest(assessment);

    const subscriber = {
      email: body.email,
      phone,
      timezone: body.timezone || 'America/New_York',
      assessmentResult: assessment,
      weakestPillar,
      signupDate: new Date().toISOString(),
      currentPhase: 1,
      status: 'active',
      unsubscribeToken: randomUUID(),
      lastMessageIndex: { C: 0, I: 0, D: 0, S: 0 },
      messagingChannel: 'sms' as const,
    };

    await putSubscriber(subscriber);

    // Generate presigned URL for PDF
    const pdfUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.PDF_BUCKET!,
        Key: process.env.PDF_KEY!,
      }),
      { expiresIn: 604800 } // 7 days
    );

    // Send welcome email
    await ses.send(
      new SendEmailCommand({
        Source: process.env.FROM_EMAIL!,
        Destination: { ToAddresses: [body.email] },
        Message: {
          Subject: { Data: 'Welcome to CIDS — Your Framework Guide is Here' },
          Body: {
            Html: {
              Data: `<p>Welcome to CIDS.</p>
                <p>Here's your free CIDS Framework Guide: <a href="${pdfUrl}">Download PDF</a></p>
                <p>Your first daily nudge arrives tomorrow morning.</p>
                <p>Show Up. Push Hard. Eat Right. Rest Well.<br/>Everything else is optimization.</p>`,
            },
          },
        },
      })
    );

    return cors({ statusCode: 200, body: JSON.stringify({ success: true }) });
  } catch (err) {
    console.error('Signup error:', err);
    return cors({ statusCode: 500, body: JSON.stringify({ message: 'Something went wrong' }) });
  }
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
cd backend && npx vitest run __tests__/signup.test.ts
```
Expected: All 3 tests PASS

- [ ] **Step 7: Commit**

```bash
git add backend/
git commit -m "feat: add signup Lambda handler with DynamoDB, SES, and presigned PDF URL"
```

---

### Task 11: Message Bank & Nudge Lambda (TDD)

**Files:**
- Create: `backend/src/nudge/messages.ts`
- Create: `backend/src/nudge/handler.ts`
- Create: `backend/src/shared/messaging.ts`
- Create: `backend/__tests__/messages.test.ts`
- Create: `backend/__tests__/nudge.test.ts`

- [ ] **Step 1: Write failing messages test**

```typescript
// backend/__tests__/messages.test.ts
import { describe, it, expect } from 'vitest';
import { getMessageForSubscriber, MESSAGES } from '../src/nudge/messages';

describe('MESSAGES', () => {
  it('has at least 7 messages per pillar', () => {
    expect(MESSAGES.C.length).toBeGreaterThanOrEqual(7);
    expect(MESSAGES.I.length).toBeGreaterThanOrEqual(7);
    expect(MESSAGES.D.length).toBeGreaterThanOrEqual(7);
    expect(MESSAGES.S.length).toBeGreaterThanOrEqual(7);
  });
});

describe('getMessageForSubscriber', () => {
  it('returns only C messages for phase 1', () => {
    const sub = {
      currentPhase: 1,
      weakestPillar: 'C' as const,
      lastMessageIndex: { C: 0, I: 0, D: 0, S: 0 },
    };
    const result = getMessageForSubscriber(sub);
    expect(result.pillar).toBe('C');
    expect(result.messageIndex).toBe(1);
  });

  it('weights toward weakest pillar when in current phase', () => {
    // Phase 2 = C + I unlocked, weakest is I
    // Run 100 times, expect ~60% I
    const sub = {
      currentPhase: 2,
      weakestPillar: 'I' as const,
      lastMessageIndex: { C: 0, I: 0, D: 0, S: 0 },
    };
    let iCount = 0;
    for (let i = 0; i < 100; i++) {
      if (getMessageForSubscriber(sub).pillar === 'I') iCount++;
    }
    expect(iCount).toBeGreaterThan(40); // allow variance
    expect(iCount).toBeLessThan(80);
  });

  it('wraps message index when bank exhausted', () => {
    const sub = {
      currentPhase: 1,
      weakestPillar: 'C' as const,
      lastMessageIndex: { C: MESSAGES.C.length, I: 0, D: 0, S: 0 },
    };
    const result = getMessageForSubscriber(sub);
    expect(result.messageIndex).toBe(1); // wraps to start
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend && npx vitest run __tests__/messages.test.ts
```
Expected: FAIL

- [ ] **Step 3: Implement message bank**

```typescript
// backend/src/nudge/messages.ts
import type { PillarId } from '../shared/types';

export const MESSAGES: Record<PillarId, string[]> = {
  C: [
    "Show up today. That's it. Don't plan the perfect workout — just walk through the door.",
    "Day 3. You're building something. Don't stop now.",
    "Missed yesterday? Doesn't matter. Today is the only day that exists. Go.",
    "You don't need motivation. You need a routine. Same time, same place. Go.",
    "The people who get results aren't more talented. They just don't skip days.",
    "10 minutes counts. A walk counts. Just don't let the streak break.",
    "Your future self is built by what you do today. Show up.",
    "Consistency isn't about being perfect. It's about never quitting.",
  ],
  I: [
    "You showed up. Now earn it. Phone in the bag. Timer on. Go harder than last time.",
    "Comfortable is the enemy. Find the set that scares you and do it.",
    "If you can hold a conversation, you're not pushing hard enough.",
    "Last rep. Add one more. That's where the growth happens.",
    "Stop resting so long. Set a timer. When it beeps, you go.",
    "Sweat is your body telling you it's working. Chase that feeling.",
    "You didn't come here to go through the motions. Make it count.",
  ],
  D: [
    "You're putting in the work. Now feed it. Hit your protein at every meal today.",
    "Meal prep Sunday. 30 minutes now saves you all week. Chicken, rice, greens. Done.",
    "Track your protein today. Just today. Know your number.",
    "You can't out-train a bad diet. What you eat is what you become.",
    "Eat like you're building something. Because you are.",
    "Skip the drive-through. You've earned better fuel than that.",
    "Protein at breakfast. Protein at lunch. Protein at dinner. Simple.",
  ],
  S: [
    "Phone on the charger. In another room. By 10pm. Your gains happen while you sleep.",
    "8 hours isn't lazy. It's the best performance hack that exists. Lights out.",
    "Your body rebuilds while you sleep. Give it the time it needs.",
    "Screen off by 9. Read a book. Let your brain wind down.",
    "Sleep is not optional. It's where consistency, intensity, and diet pay off.",
    "Tomorrow's workout starts tonight. Get to bed.",
    "One week of good sleep and you'll feel like a different person. Start tonight.",
  ],
};

const PILLAR_ORDER: PillarId[] = ['C', 'I', 'D', 'S'];

function getPillarsForPhase(phase: number): PillarId[] {
  return PILLAR_ORDER.slice(0, phase);
}

interface SubscriberNudgeInfo {
  currentPhase: number;
  weakestPillar: PillarId;
  lastMessageIndex: Record<PillarId, number>;
}

export function getMessageForSubscriber(sub: SubscriberNudgeInfo): {
  pillar: PillarId;
  message: string;
  messageIndex: number;
} {
  const unlocked = getPillarsForPhase(sub.currentPhase);

  // Pick pillar based on weighting
  let selectedPillar: PillarId;
  if (unlocked.length === 1) {
    selectedPillar = unlocked[0];
  } else if (unlocked.includes(sub.weakestPillar)) {
    // 60% chance weakest, 40% distributed among others
    selectedPillar =
      Math.random() < 0.6
        ? sub.weakestPillar
        : unlocked.filter((p) => p !== sub.weakestPillar)[
            Math.floor(Math.random() * (unlocked.length - 1))
          ];
  } else {
    // Equal distribution
    selectedPillar = unlocked[Math.floor(Math.random() * unlocked.length)];
  }

  // Sequential rotation with wrap
  const bank = MESSAGES[selectedPillar];
  const lastIdx = sub.lastMessageIndex[selectedPillar] || 0;
  const nextIdx = lastIdx >= bank.length ? 1 : lastIdx + 1;
  const message = bank[(nextIdx - 1) % bank.length];

  return { pillar: selectedPillar, message, messageIndex: nextIdx > bank.length ? 1 : nextIdx };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd backend && npx vitest run __tests__/messages.test.ts
```
Expected: All tests PASS

- [ ] **Step 5: Write failing nudge handler test**

```typescript
// backend/__tests__/nudge.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@aws-sdk/lib-dynamodb', () => {
  const mockSend = vi.fn();
  return {
    DynamoDBDocumentClient: { from: () => ({ send: mockSend }) },
    ScanCommand: vi.fn(),
    UpdateCommand: vi.fn(),
    __mockSend: mockSend,
  };
});

vi.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('@aws-sdk/client-sns', () => ({
  SNSClient: vi.fn().mockImplementation(() => ({ send: vi.fn() })),
  PublishCommand: vi.fn(),
}));

describe('nudge handler', () => {
  let handler: any;
  let mockSend: any;

  beforeEach(async () => {
    vi.resetModules();
    vi.stubEnv('TABLE_NAME', 'test-table');

    const mod = await import('@aws-sdk/lib-dynamodb') as any;
    mockSend = mod.__mockSend;
    mockSend.mockReset();

    handler = (await import('../src/nudge/handler')).handler;
  });

  it('skips subscribers already nudged today', async () => {
    const today = new Date().toISOString().split('T')[0];
    mockSend.mockResolvedValueOnce({
      Items: [{
        email: 'test@test.com', phone: '+15551234567', timezone: 'America/New_York',
        status: 'active', lastNudgeDate: today, signupDate: '2026-01-01T00:00:00Z',
        weakestPillar: 'C', lastMessageIndex: { C: 0, I: 0, D: 0, S: 0 },
        messagingChannel: 'sms', currentPhase: 1,
      }],
    });

    const result = await handler({ targetTimezones: ['America/New_York'] });
    // Only 1 send call (the scan), no update call
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('sends nudge to active subscriber with matching timezone', async () => {
    mockSend.mockResolvedValueOnce({
      Items: [{
        email: 'test@test.com', phone: '+15551234567', timezone: 'America/New_York',
        status: 'active', lastNudgeDate: '2026-01-01', signupDate: '2026-01-01T00:00:00Z',
        weakestPillar: 'C', lastMessageIndex: { C: 0, I: 0, D: 0, S: 0 },
        messagingChannel: 'sms', currentPhase: 1,
      }],
    });
    mockSend.mockResolvedValueOnce({}); // update

    const result = await handler({ targetTimezones: ['America/New_York'] });
    expect(result.processed).toBe(1);
  });

  it('skips subscribers in non-matching timezone', async () => {
    mockSend.mockResolvedValueOnce({
      Items: [{
        email: 'test@test.com', phone: '+15551234567', timezone: 'America/Los_Angeles',
        status: 'active', lastNudgeDate: '2026-01-01', signupDate: '2026-01-01T00:00:00Z',
        weakestPillar: 'C', lastMessageIndex: { C: 0, I: 0, D: 0, S: 0 },
        messagingChannel: 'sms', currentPhase: 1,
      }],
    });

    const result = await handler({ targetTimezones: ['America/New_York'] });
    expect(result.processed).toBe(0);
  });
});
```

- [ ] **Step 6: Run nudge handler test to verify it fails**

```bash
cd backend && npx vitest run __tests__/nudge.test.ts
```
Expected: FAIL — handler module not found

- [ ] **Step 7: Create messaging interface**

```typescript
// backend/src/shared/messaging.ts
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const sns = new SNSClient({});

export interface MessagingService {
  send(phone: string, message: string): Promise<void>;
}

export class SmsService implements MessagingService {
  async send(phone: string, message: string): Promise<void> {
    await sns.send(
      new PublishCommand({
        PhoneNumber: phone,
        Message: message,
      })
    );
  }
}

export function getMessagingService(channel: 'sms' | 'whatsapp'): MessagingService {
  // WhatsApp implementation will be added when Meta Business API is approved
  return new SmsService();
}
```

- [ ] **Step 8: Implement nudge handler**

```typescript
// backend/src/nudge/handler.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { getMessageForSubscriber } from './messages';
import { getMessagingService } from '../shared/messaging';
import type { Subscriber } from '../shared/types';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

export async function handler(event: { targetTimezones?: string[] } = {}) {
  const targetTimezones = event.targetTimezones || [];

  // Scan for active subscribers (acceptable at MVP scale)
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: '#s = :active',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':active': 'active' },
    })
  );

  const allSubscribers = (result.Items || []) as (Subscriber & { timezone: string })[];
  const today = new Date().toISOString().split('T')[0];

  // Filter by timezone if specified, skip already-nudged
  const subscribers = allSubscribers.filter((sub) => {
    if (sub.lastNudgeDate === today) return false;
    if (targetTimezones.length > 0 && !targetTimezones.includes(sub.timezone)) return false;
    return true;
  });

  let processed = 0;

  for (const sub of subscribers) {
    // Calculate phase based on signup date
    const daysSinceSignup = Math.floor(
      (Date.now() - new Date(sub.signupDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const phase = daysSinceSignup < 14 ? 1 : daysSinceSignup < 28 ? 2 : daysSinceSignup < 42 ? 3 : 4;

    const { pillar, message, messageIndex } = getMessageForSubscriber({
      currentPhase: phase,
      weakestPillar: sub.weakestPillar,
      lastMessageIndex: sub.lastMessageIndex,
    });

    try {
      const messaging = getMessagingService(sub.messagingChannel);
      await messaging.send(sub.phone, message);

      await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { email: sub.email },
          UpdateExpression: 'SET lastNudgeDate = :today, currentPhase = :phase, lastMessageIndex.#p = :idx',
          ExpressionAttributeNames: { '#p': pillar },
          ExpressionAttributeValues: { ':today': today, ':phase': phase, ':idx': messageIndex },
        })
      );
      processed++;
    } catch (err) {
      console.error(`Failed to nudge ${sub.email}:`, err);
    }
  }

  return { processed };
}
```

- [ ] **Step 7: Commit**

```bash
git add backend/src/ backend/__tests__/
git commit -m "feat: add message bank, nudge handler with phase progression and weighted selection"
```

---

### Task 12: Unsubscribe Lambda (TDD)

**Files:**
- Create: `backend/src/unsubscribe/handler.ts`
- Create: `backend/__tests__/unsubscribe.test.ts`

- [ ] **Step 1: Write failing unsubscribe test**

```typescript
// backend/__tests__/unsubscribe.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@aws-sdk/lib-dynamodb', () => {
  const mockSend = vi.fn();
  return {
    DynamoDBDocumentClient: { from: () => ({ send: mockSend }) },
    ScanCommand: vi.fn(),
    UpdateCommand: vi.fn(),
    __mockSend: mockSend,
  };
});

vi.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: vi.fn().mockImplementation(() => ({})),
}));

describe('unsubscribe handler', () => {
  let handler: any;
  let mockSend: any;

  beforeEach(async () => {
    vi.resetModules();
    vi.stubEnv('TABLE_NAME', 'test-table');
    const mod = await import('@aws-sdk/lib-dynamodb') as any;
    mockSend = mod.__mockSend;
    mockSend.mockReset();
    handler = (await import('../src/unsubscribe/handler')).handler;
  });

  it('returns 400 for missing token', async () => {
    const result = await handler({ queryStringParameters: {} });
    expect(result.statusCode).toBe(400);
  });

  it('returns 404 for invalid token', async () => {
    mockSend.mockResolvedValueOnce({ Items: [] });
    const result = await handler({ queryStringParameters: { token: 'bad-token' } });
    expect(result.statusCode).toBe(404);
  });

  it('returns 200 with HTML for valid token', async () => {
    mockSend.mockResolvedValueOnce({
      Items: [{ email: 'test@example.com', unsubscribeToken: 'valid-token' }],
    });
    mockSend.mockResolvedValueOnce({}); // update command

    const result = await handler({ queryStringParameters: { token: 'valid-token' } });
    expect(result.statusCode).toBe(200);
    expect(result.headers['Content-Type']).toBe('text/html');
    expect(result.body).toContain('unsubscribed');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend && npx vitest run __tests__/unsubscribe.test.ts
```
Expected: FAIL

- [ ] **Step 3: Implement unsubscribe handler**

```typescript
// backend/src/unsubscribe/handler.ts
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

export async function handler(event: Partial<APIGatewayProxyEvent>): Promise<APIGatewayProxyResult> {
  const token = event.queryStringParameters?.token;

  if (!token) {
    return { statusCode: 400, body: 'Missing token', headers: {} };
  }

  // Find subscriber by token
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'unsubscribeToken = :token',
      ExpressionAttributeValues: { ':token': token },
    })
  );

  const subscriber = result.Items?.[0];
  if (!subscriber) {
    return { statusCode: 404, body: 'Invalid unsubscribe link', headers: {} };
  }

  // Update status
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { email: subscriber.email },
      UpdateExpression: 'SET #s = :status',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':status': 'unsubscribed' },
    })
  );

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    body: `<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{background:#0a0a15;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.box{text-align:center;padding:2rem}.title{font-size:1.5rem;font-weight:800;margin-bottom:0.5rem}</style></head>
<body><div class="box"><div class="title">You've been unsubscribed</div>
<p style="color:rgba(255,255,255,0.5);font-size:0.875rem">We'll miss you. Come back anytime at cids.training</p></div></body></html>`,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd backend && npx vitest run __tests__/unsubscribe.test.ts
```
Expected: All 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/unsubscribe/ backend/__tests__/unsubscribe.test.ts
git commit -m "feat: add unsubscribe Lambda with token validation and inline HTML response"
```

---

## Chunk 4: Infrastructure & Integration

### Task 13: CDK Infrastructure

**Files:**
- Create: `infra/package.json`
- Create: `infra/tsconfig.json`
- Create: `infra/bin/cids.ts`
- Create: `infra/lib/database-construct.ts`
- Create: `infra/lib/api-construct.ts`
- Create: `infra/lib/frontend-construct.ts`
- Create: `infra/lib/cids-stack.ts`

- [ ] **Step 1: Create infra/package.json**

```json
{
  "name": "cids-infra",
  "private": true,
  "scripts": {
    "build": "tsc",
    "deploy:dev": "cdk deploy --context env=dev",
    "deploy:prod": "cdk deploy --context env=prod",
    "diff": "cdk diff",
    "synth": "cdk synth"
  },
  "dependencies": {
    "aws-cdk-lib": "^2.130.0",
    "constructs": "^10.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "aws-cdk": "^2.130.0"
  }
}
```

- [ ] **Step 2: Create infra/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["bin/**/*", "lib/**/*"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create database construct**

```typescript
// infra/lib/database-construct.ts
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { RemovalPolicy } from 'aws-cdk-lib';

export class DatabaseConstruct extends Construct {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: { isProd: boolean }) {
    super(scope, id);

    this.table = new dynamodb.Table(this, 'Subscribers', {
      partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: props.isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    this.table.addGlobalSecondaryIndex({
      indexName: 'phase-index',
      partitionKey: { name: 'currentPhase', type: dynamodb.AttributeType.NUMBER },
      sortKey: { name: 'signupDate', type: dynamodb.AttributeType.STRING },
    });

    this.table.addGlobalSecondaryIndex({
      indexName: 'phone-index',
      partitionKey: { name: 'phone', type: dynamodb.AttributeType.STRING },
    });
  }
}
```

- [ ] **Step 4: Create API construct**

```typescript
// infra/lib/api-construct.ts
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Duration } from 'aws-cdk-lib';
import path from 'path';

interface ApiConstructProps {
  table: dynamodb.Table;
  pdfBucket: s3.Bucket;
  fromEmail: string;
  domain?: string;
}

export class ApiConstruct extends Construct {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);

    const backendDir = path.join(__dirname, '../../backend');

    // Signup Lambda
    const signupFn = new lambdaNode.NodejsFunction(this, 'SignupFn', {
      entry: path.join(backendDir, 'src/signup/handler.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: Duration.seconds(10),
      environment: {
        TABLE_NAME: props.table.tableName,
        PDF_BUCKET: props.pdfBucket.bucketName,
        PDF_KEY: 'cids-framework-guide.pdf',
        FROM_EMAIL: props.fromEmail,
      },
    });

    props.table.grantReadWriteData(signupFn);
    props.pdfBucket.grantRead(signupFn);
    signupFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ses:SendEmail'],
        resources: ['*'],
      })
    );

    // Nudge Lambda
    const nudgeFn = new lambdaNode.NodejsFunction(this, 'NudgeFn', {
      entry: path.join(backendDir, 'src/nudge/handler.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: Duration.minutes(5),
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    });

    props.table.grantReadWriteData(nudgeFn);
    nudgeFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['sns:Publish'],
        resources: ['*'],
      })
    );

    // EventBridge rules for timezone-based nudges (7am local time)
    // Subscribers specify their IANA timezone on signup
    const timezoneSchedules: Array<{ name: string; hour: number; timezones: string[] }> = [
      { name: 'ET', hour: 12, timezones: ['America/New_York', 'America/Detroit', 'US/Eastern'] },
      { name: 'CT', hour: 13, timezones: ['America/Chicago', 'US/Central'] },
      { name: 'MT', hour: 14, timezones: ['America/Denver', 'US/Mountain'] },
      { name: 'PT', hour: 15, timezones: ['America/Los_Angeles', 'US/Pacific'] },
    ];

    for (const tz of timezoneSchedules) {
      new events.Rule(this, `NudgeRule${tz.name}`, {
        schedule: events.Schedule.cron({ hour: String(tz.hour), minute: '0' }),
        targets: [new targets.LambdaFunction(nudgeFn, {
          event: events.RuleTargetInput.fromObject({ targetTimezones: tz.timezones }),
        })],
      });
    }

    // Unsubscribe Lambda
    const unsubscribeFn = new lambdaNode.NodejsFunction(this, 'UnsubscribeFn', {
      entry: path.join(backendDir, 'src/unsubscribe/handler.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: Duration.seconds(10),
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    });

    props.table.grantReadWriteData(unsubscribeFn);

    // API Gateway
    this.api = new apigateway.RestApi(this, 'CidsApi', {
      restApiName: 'CIDS API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type'],
      },
    });

    const signup = this.api.root.addResource('signup');
    signup.addMethod('POST', new apigateway.LambdaIntegration(signupFn));

    const unsubscribe = this.api.root.addResource('unsubscribe');
    unsubscribe.addMethod('GET', new apigateway.LambdaIntegration(unsubscribeFn));
  }
}
```

- [ ] **Step 5: Create frontend construct**

```typescript
// infra/lib/frontend-construct.ts
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { RemovalPolicy } from 'aws-cdk-lib';
import path from 'path';

interface FrontendConstructProps {
  domainName?: string;
  hostedZoneId?: string;
  certificateArn?: string;
  isProd: boolean;
}

export class FrontendConstruct extends Construct {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: FrontendConstructProps) {
    super(scope, id);

    this.bucket = new s3.Bucket(this, 'SiteBucket', {
      removalPolicy: props.isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      autoDeleteObjects: !props.isProd,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    const oai = new cloudfront.OriginAccessIdentity(this, 'OAI');
    this.bucket.grantRead(oai);

    const distributionProps: cloudfront.DistributionProps = {
      defaultBehavior: {
        origin: new origins.S3Origin(this.bucket, { originAccessIdentity: oai }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responsePagePath: '/index.html',
          responseHttpStatus: 200,
        },
      ],
    };

    // Add domain + certificate if provided
    if (props.domainName && props.certificateArn) {
      const certificate = acm.Certificate.fromCertificateArn(this, 'Cert', props.certificateArn);
      Object.assign(distributionProps, {
        domainNames: [props.domainName],
        certificate,
      });
    }

    const distribution = new cloudfront.Distribution(this, 'Distribution', distributionProps);

    // Deploy frontend build output
    new s3deploy.BucketDeployment(this, 'DeployFrontend', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../frontend/out'))],
      destinationBucket: this.bucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // Route53 record if domain provided
    if (props.domainName && props.hostedZoneId) {
      const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'Zone', {
        hostedZoneId: props.hostedZoneId,
        zoneName: props.domainName,
      });

      new route53.ARecord(this, 'AliasRecord', {
        zone: hostedZone,
        target: route53.RecordTarget.fromAlias(
          new route53targets.CloudFrontTarget(distribution)
        ),
      });
    }
  }
}
```

- [ ] **Step 6: Create main stack**

```typescript
// infra/lib/cids-stack.ts
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DatabaseConstruct } from './database-construct';
import { ApiConstruct } from './api-construct';
import { FrontendConstruct } from './frontend-construct';

interface CidsStackProps extends StackProps {
  isProd: boolean;
  domainName?: string;
  hostedZoneId?: string;
  certificateArn?: string;
  fromEmail?: string;
}

export class CidsStack extends Stack {
  constructor(scope: Construct, id: string, props: CidsStackProps) {
    super(scope, id, props);

    const db = new DatabaseConstruct(this, 'Database', {
      isProd: props.isProd,
    });

    const frontend = new FrontendConstruct(this, 'Frontend', {
      domainName: props.domainName,
      hostedZoneId: props.hostedZoneId,
      certificateArn: props.certificateArn,
      isProd: props.isProd,
    });

    new ApiConstruct(this, 'Api', {
      table: db.table,
      pdfBucket: frontend.bucket,
      fromEmail: props.fromEmail || 'noreply@cids.training',
      domain: props.domainName,
    });
  }
}
```

- [ ] **Step 7: Create CDK app entry**

```typescript
// infra/bin/cids.ts
#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { CidsStack } from '../lib/cids-stack';

const app = new App();
const env = app.node.tryGetContext('env') || 'dev';
const isProd = env === 'prod';

new CidsStack(app, `CidsStack-${env}`, {
  env: { region: 'us-east-2' },
  isProd,
  domainName: isProd ? 'cids.training' : undefined,
  hostedZoneId: isProd ? app.node.tryGetContext('hostedZoneId') : undefined,
  certificateArn: isProd ? app.node.tryGetContext('certificateArn') : undefined,
  fromEmail: isProd ? 'noreply@cids.training' : 'noreply@cids-dev.training',
});
```

- [ ] **Step 8: Install deps and verify synth**

```bash
cd infra && npm install && npx cdk synth --context env=dev
```
Expected: CloudFormation template output with no errors

- [ ] **Step 9: Commit**

```bash
git add infra/
git commit -m "feat: add CDK infrastructure with DynamoDB, Lambda, API Gateway, S3, and CloudFront"
```

---

### Task 14: Frontend-Backend Integration

**Files:**
- Create: `frontend/.env.local`
- Modify: `frontend/src/components/Assessment.tsx` (pass results to signup)
- Modify: `frontend/src/components/SignupForm.tsx` (accept assessment prop)
- Modify: `frontend/src/app/page.tsx` (wire state between components)

- [ ] **Step 1: Create frontend/.env.local**

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Add `.env.local` to `.gitignore` if not already there.

- [ ] **Step 2: Create frontend/.env.example**

```
NEXT_PUBLIC_API_URL=https://your-api-id.execute-api.us-east-2.amazonaws.com/prod
```

- [ ] **Step 3: Create HomeContent client component to manage state**

Keep `page.tsx` as a Server Component (preserves metadata). Create a new client component that manages shared state:

```tsx
// frontend/src/components/HomeContent.tsx
'use client';

import { useState } from 'react';
import { Nav } from './Nav';
import { Hero } from './Hero';
import { WhyOrder } from './WhyOrder';
import { Gallery } from './Gallery';
import { Assessment } from './Assessment';
import { SignupForm } from './SignupForm';
import { WhatYouGet } from './WhatYouGet';
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
      <WhatYouGet />
      <Transformations />
      <Footer />
    </>
  );
}
```

- [ ] **Step 4: Update page.tsx to use HomeContent**

```tsx
// frontend/src/app/page.tsx
import { HomeContent } from '@/components/HomeContent';

export default function Home() {
  return (
    <main className="max-w-md mx-auto">
      <HomeContent />
    </main>
  );
}
```

- [ ] **Step 5: Update Assessment to accept onComplete callback**

In `Assessment.tsx`, change the component signature and add the callback:

```tsx
// Add to Assessment props
interface AssessmentProps {
  onComplete?: (answers: AssessmentAnswers) => void;
}

export function Assessment({ onComplete }: AssessmentProps) {
  // ... existing state ...

  const handleAnswer = (pillarId: PillarId, score: number) => {
    const updated = { ...answers, [pillarId]: score };
    setAnswers(updated);

    if (Object.keys(updated).length === 4) {
      const complete = updated as AssessmentAnswers;
      setResult(scoreAssessment(complete));
      onComplete?.(complete);
    }
  };
  // ... rest unchanged
}
```

- [ ] **Step 6: Update SignupForm to accept assessmentResult and add timezone**

In `SignupForm.tsx`, add the prop and auto-detect timezone:

```tsx
interface SignupFormProps {
  assessmentResult?: Record<string, number>;
}

export function SignupForm({ assessmentResult }: SignupFormProps) {
  // ... existing state ...
  const [timezone] = useState(() =>
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  const handleSubmit = async (e: React.FormEvent) => {
    // ... existing validation ...

    setLoading(true);
    try {
      await submitSignup({
        email,
        phone: phone.replace(/\D/g, ''),
        countryCode,
        timezone,
        assessmentResult,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  // ... rest unchanged
}
```

Also update `frontend/src/lib/api.ts` `SignupPayload` to include `timezone: string`.

- [ ] **Step 6: Verify full flow in dev**

```bash
cd frontend && npm run dev
```
Expected: Complete assessment → signup form sends assessment result in payload (visible in network tab)

- [ ] **Step 7: Commit**

```bash
git add frontend/
git commit -m "feat: wire assessment results into signup form submission"
```

---

### Task 15: Static Build & Deploy Verification

**Files:**
- Modify: `frontend/next.config.ts` (verify static export)

- [ ] **Step 1: Build static export**

```bash
cd frontend && npm run build
```
Expected: `out/` directory created with static HTML/CSS/JS

- [ ] **Step 2: Verify static build serves correctly**

```bash
npx serve out
```
Expected: Site loads at localhost:3000, all sections render, images load

- [ ] **Step 3: Deploy dev stack**

```bash
cd infra && npx cdk deploy --context env=dev
```
Expected: Stack deploys successfully, outputs API URL and CloudFront URL

- [ ] **Step 4: Extract API URL from CDK output and create production env**

```bash
# Get the API URL from the CDK deploy output (look for "CidsStack-dev.ApiEndpoint")
# Then create the production env file:
echo "NEXT_PUBLIC_API_URL=https://YOUR_API_ID.execute-api.us-east-2.amazonaws.com/prod" > frontend/.env.production
# Rebuild with production API URL
cd frontend && npm run build
```
Expected: `out/` directory rebuilt with production API URL baked in

- [ ] **Step 5: Commit**

```bash
git add frontend/ infra/
git commit -m "feat: verify static build and dev stack deployment"
```

---

### Task 16: E2E Tests

**Files:**
- Create: `e2e/package.json`
- Create: `e2e/playwright.config.ts`
- Create: `e2e/signup.spec.ts`

- [ ] **Step 1: Create e2e/package.json**

```json
{
  "name": "cids-e2e",
  "private": true,
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui"
  },
  "devDependencies": {
    "@playwright/test": "^1.42.0"
  }
}
```

- [ ] **Step 2: Create e2e/playwright.config.ts**

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 375, height: 812 }, // iPhone viewport
  },
  webServer: {
    command: 'cd ../frontend && npm run dev',
    port: 3000,
    reuseExistingServer: true,
  },
});
```

- [ ] **Step 3: Create signup E2E test**

```typescript
// e2e/signup.spec.ts
import { test, expect } from '@playwright/test';

test.describe('CIDS.training', () => {
  test('page loads with CIDS hero', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('CIDS');
  });

  test('assessment flow shows result', async ({ page }) => {
    await page.goto('/');

    // Scroll to assessment
    await page.locator('#assessment').scrollIntoViewIfNeeded();

    // Answer all 4 questions (first option = score 1)
    await page.click("text=I haven't trained in months");
    await page.click('text=I scroll my phone between sets');
    await page.click("text=Protein what?");
    await page.click("text=I didn't sleep");

    // Should show result
    await expect(page.locator('text=Your priority')).toBeVisible();
  });

  test('signup form validates email', async ({ page }) => {
    await page.goto('/');
    await page.locator('#signup').scrollIntoViewIfNeeded();

    await page.fill('input[type="email"]', 'bad-email');
    await page.fill('input[type="tel"]', '5551234567');
    await page.click('button:text("Start Now")');

    await expect(page.locator('text=valid email')).toBeVisible();
  });

  test('nav Start Now scrolls to signup', async ({ page }) => {
    await page.goto('/');
    await page.click('button:text("Start Now")');

    await expect(page.locator('#signup')).toBeInViewport();
  });

  test('gallery is horizontally scrollable', async ({ page }) => {
    await page.goto('/');
    const gallery = page.locator('.snap-x');
    await expect(gallery).toBeVisible();

    const scrollWidth = await gallery.evaluate((el) => el.scrollWidth);
    const clientWidth = await gallery.evaluate((el) => el.clientWidth);
    expect(scrollWidth).toBeGreaterThan(clientWidth);
  });
});
```

- [ ] **Step 4: Install and run E2E tests**

```bash
cd e2e && npm install && npx playwright install && npx playwright test
```
Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add e2e/
git commit -m "feat: add Playwright E2E tests for assessment flow, signup, and navigation"
```

---

## Pre-Launch Checklist

These are manual/out-of-band tasks not covered by the implementation plan:

- [ ] Design CIDS Framework Guide PDF in Figma/Canva, export and upload to S3 bucket
- [ ] Verify SES email sending (sandbox → production if needed)
- [ ] Set up Route53 hosted zone for cids.training
- [ ] Obtain ACM certificate for cids.training (must be in us-east-1 for CloudFront)
- [ ] Apply for Meta WhatsApp Business API verification
- [ ] Deploy prod stack: `cd infra && npx cdk deploy --context env=prod --context hostedZoneId=XXX --context certificateArn=XXX`
- [ ] Add `.superpowers/` to `.gitignore`
