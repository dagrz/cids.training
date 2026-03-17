# CIDS.training — Design Spec

## Overview

CIDS.training is a mobile-first single-page website that teaches a simple, ordered personal training framework: **Consistency, Intensity, Diet, Sleep**. The core insight is that this order matters — don't worry about diet until you're showing up consistently, don't optimize sleep until you're eating right. "Everything else is optimization."

**Target audience:** Complete beginners and people restarting after a break. People who need simplicity and motivation, not complexity.

**Approach:** Progressive — ship the single-page MVP first, add a user dashboard in phase 2 based on real user feedback.

## The CIDS Framework

The ordering is the product:

1. **Consistency** ("Show Up") — Nothing matters if you don't show up. This is the foundation.
2. **Intensity** ("Push Hard") — Once you're showing up, make it count. Don't coast.
3. **Diet** ("Eat Right") — You're consistent and training hard. Now fuel it properly. Focus on protein and macros.
4. **Sleep** ("Rest Well") — You're doing the work and eating right. Now let your body rebuild.

Each pillar is only relevant once the previous one is locked in. The nudge system and content reinforces this ordering.

## Visual Identity

- **Style:** Modern dark with gradient accents — premium, app-like feel (Vercel/Linear design language applied to fitness)
- **Background:** Dark gradient (#0f0f0f → #1a1a2e)
- **Typography:** System UI font stack, bold weights (800-900), tight letter-spacing
- **Pillar colors:**
  - Consistency: Purple gradient (#6366f1 → #8b5cf6)
  - Intensity: Pink/red gradient (#ec4899 → #f43f5e)
  - Diet: Orange gradient (#f59e0b → #f97316)
  - Sleep: Cyan/blue gradient (#06b6d4 → #3b82f6)
- **Pillar tagline pills:** Gradient rounded pills with "Show Up" / "Push Hard" / "Eat Right" / "Rest Well"
- **Imagery:** Authentic, real-looking people — not fitness models. Diverse ages, body types, ethnicities. Gym lighting, not studio. Cinematic film grain aesthetic.
- **Mobile-first:** Designed for 375px base, scales up to tablet (768px) and desktop (1024px+)

## Page Structure

### 1. Sticky Nav
- CIDS logo (left)
- "Start Now" gradient CTA button (right) — scrolls to signup
- Sticky on scroll with blur backdrop

### 2. Hero Section
- Large "CIDS" title (56px, weight 900)
- "Training Framework" subtitle
- Numbered pillar stack — each pillar is a row with:
  - Number (01-04) in pillar accent color
  - Pillar name (bold white)
  - Tagline (dimmed: "Show Up", "Push Hard", "Eat Right", "Rest Well")
  - Color-coded left border
- "Everything else is optimization." tagline (italic, dimmed)
- Hero image below (hero-deadlift.jpg)

### 3. "Why This Order Matters"
- Section title + subtitle: "Master each one before moving to the next."
- Four text blocks, each with the pillar's color-coded left border
- Copy explains why each pillar is in its position and why you don't move on until it's locked in

### 4. Inspiration Gallery
- Horizontal scroll (swipeable on mobile)
- Cards with pillar images as backgrounds
- Quote overlays from "real people"
- Images: consistency-lacing-shoes.jpg, intensity-chalk-grip.jpg, diet-meal-prep.jpg, sleep-rest.jpg

### 5. Self-Assessment ("Where Do You Start?")
- 4 questions, one per pillar, tap-to-select answers
- Language is conversational and real — how people actually feel, not clinical scales

**Q1 — Consistency:** "What does your week look like?"
- I haven't trained in months (or ever)
- I start strong on Monday but it falls apart by Wednesday
- I get in a few sessions but it's random
- I show up like clockwork, no excuses

**Q2 — Intensity:** "When you do train, what's it actually like?"
- I scroll my phone between sets and leave dry
- I break a sweat but could talk through it
- I'm breathing hard, counting down rest seconds
- I grunt, sweat through my shirt, question my life choices

**Q3 — Diet:** "What's your protein situation?"
- Protein what? I couldn't tell you how many grams
- I know I should eat more but I'm winging it
- I hit my protein most days but meals aren't consistent
- I track my macros and eat to fuel my training

**Q4 — Sleep:** "What's 6am feel like?"
- I didn't sleep, or slept 4 hours doom-scrolling
- Hit snooze 5 times, dragged myself up wrecked
- Alarm went off, took a minute but I'm functional
- Eyes open before the alarm, ready to go

**Scoring:** Each answer maps to 1-4. Lowest pillar = "Start Here" recommendation. Ties broken by CIDS order (earlier pillar wins).

**Result cards by pillar:**

| Priority | Result Card Copy | Actionable Tip |
|----------|-----------------|----------------|
| Consistency | "Your priority: **Consistency**. Nothing else matters until you're showing up." | "Commit to 3 days this week. Any 3 days. Put them in your calendar right now. Don't think about what you'll do — just show up." |
| Intensity | "Your priority: **Intensity**. You're showing up — now make it count." | "Next session: put your phone in your bag. Set a timer for rest periods. When the timer goes off, you go. No scrolling." |
| Diet | "Your priority: **Diet**. You're doing the work — now fuel it." | "This week: track your protein for 3 days. Just protein, nothing else. Know your number. Aim for 1g per pound of bodyweight." |
| Sleep | "Your priority: **Sleep**. You're earning it — now let your body rebuild." | "Tonight: phone on the charger in another room by 10pm. No negotiation. Do it for 5 nights straight and feel the difference." |

### 6. Daily Nudge Signup
- Email + phone number form
- Phone number: E.164 format with country code selector (default to US +1). Frontend validates format before submission.
- Copy: "One message a day. No spam. Just a reminder to Show Up, Push Hard, Eat Right, Rest Well."
- Gradient CTA button: "Start Now"
- Fine print: "Unsubscribe anytime. We respect your sleep — no messages after 9pm."
- **Duplicate handling:** If email already exists, update phone/assessment. If phone already exists with different email, reject with "This number is already registered."

### 7. "What You Get"
- Icon list:
  - Daily nudge — one message following the CIDS framework
  - Self-assessment — know which pillar to focus on
  - CIDS Framework Guide — free PDF download (lead magnet)
  - Accountability — we follow up and keep you honest

### 8. Transformation / Social Proof
- Title: "It's Not About the Body" / subtitle: "It's about the energy, the posture, the confidence."
- Cards with transformation-energy.jpg and community-gym.jpg
- Quote testimonials (placeholder for MVP, replaced with real ones later):
  - "Six months ago I couldn't get off the couch. I didn't change my workout program — I just started showing up. CIDS gave me the order. The rest took care of itself."
  - "I tried every app, every program. CIDS is the only thing that stuck because it doesn't ask you to be perfect — it asks you to be consistent."

### 9. Footer
- CIDS logo
- Links: Privacy, Unsubscribe, Contact
- Copyright: "© 2026 CIDS Training. Everything else is optimization."

## Daily Nudge System

### Message Philosophy
- Follow the CIDS ordering — everyone starts at Consistency
- Only graduate to the next pillar's messages when the previous one is established
- Messages are short, direct, no links, no selling — feels like a text from a coach

### Progression (time-based for MVP)
- **Weeks 1-2:** Consistency messages only ("Did you train today?", "3 days in a row. Keep going.", "Missed yesterday? Doesn't matter. Go today.")
- **Weeks 3-4:** Add Intensity messages
- **Weeks 5-6:** Add Diet messages
- **Week 7+:** Full CIDS rotation

### Delivery
- Primary: WhatsApp (Meta Business API). Requires business verification and pre-approved message templates. Apply early — approval can take 1-2 weeks.
- Fallback: SMS (SNS/Twilio) — used if WhatsApp approval is pending or for users who prefer SMS
- **MVP launch plan:** Start with SMS (available immediately), add WhatsApp once approved. The messaging interface abstraction means swapping is a config change.
- ~30 messages in the bank (7-8 per pillar), rotated
- **Send window:** 7-8am in the subscriber's local timezone (subscriber selects IANA timezone on signup, auto-detected from browser via `Intl.DateTimeFormat().resolvedOptions().timeZone`). No messages after 9pm.

### Sample Messages

**Consistency (weeks 1-2):**
- "Show up today. That's it. Don't plan the perfect workout — just walk through the door."
- "Day 3. You're building something. Don't stop now."
- "Missed yesterday? Doesn't matter. Today is the only day that exists. Go."

**Intensity (weeks 3-4):**
- "You showed up. Now earn it. Phone in the bag. Timer on. Go harder than last time."
- "Comfortable is the enemy. Find the set that scares you and do it."

**Diet (weeks 5-6):**
- "You're putting in the work. Now feed it. Hit your protein at every meal today."
- "Meal prep Sunday. 30 minutes now saves you all week. Chicken, rice, greens. Done."

**Sleep (week 7+):**
- "Phone on the charger. In another room. By 10pm. Your gains happen while you sleep."
- "8 hours isn't lazy. It's the best performance hack that exists. Lights out."

### Personalization
- Assessment result weights messages toward weakest pillar within the current phase
- **Weighting rule:** If subscriber's weakest assessed pillar falls within their current phase, send that pillar's message 60% of the time, distribute remaining 40% across other unlocked pillars. If weakest pillar is not yet unlocked, use equal distribution across unlocked pillars.

## Lead Magnet

**CIDS Framework Guide (PDF)** — free on email signup:
- One page per pillar
- What it means, why it's in this position
- 3 actionable tips per pillar
- "Don't move to the next pillar until this one is locked in"
- Matches site design (dark, gradient accents)
- **Creation:** Designed manually (Figma/Canva), exported as PDF, uploaded to S3 as a static asset. This is a pre-launch task, not part of the codebase.

## Monetization (Future — Not MVP)

Architecture should not prevent:
- **Digital products:** Workout plans, habit workbooks, printable trackers
- **Affiliate:** Gear, supplements, app recommendations
- These will be informed by user feedback post-launch

## Architecture

### Frontend
- **Next.js 14+** (App Router) with TypeScript
- **Static export** to S3 + CloudFront (no SSR needed for MVP)
- **Tailwind CSS** for the dark gradient design system
- **Framer Motion** for scroll animations (pillar reveals, number counting)
- **Mobile-first breakpoints:** 375px base, 768px tablet, 1024px+ desktop

### Backend
- **Lambda #1 — Signup:** Receives email + phone (E.164) + assessment result, stores in DynamoDB, triggers welcome email via SES with presigned S3 URL to the PDF lead magnet (static file on S3, 7-day expiry)
- **Lambda #2 — Daily Nudge:** Scheduled via EventBridge with multiple rules (one per target timezone hour: 12pm UTC for US Eastern 7am, 1pm UTC for US Central, etc.). Each invocation receives the target timezone offset as input, queries GSI by phase, filters by country code to match timezone, sends messages. At MVP scale (<10k subscribers), a scan is acceptable; GSI is the growth path. Message rotation: sequential through the bank per pillar, tracked via `lastMessageIndex` attribute. No repeats until all messages in the pillar are exhausted.
- **Lambda #3 — Unsubscribe:** Receives unsubscribe token from link, sets `status=unsubscribed` in DynamoDB. Returns inline HTML response directly from Lambda (no hosted page needed).
- **API Gateway:** Single REST API fronting Lambdas
- **DynamoDB:** Single table design:
  - **Partition key:** `email` (string)
  - **Sort key:** none (single item per subscriber)
  - **GSI:** `phase-index` — PK: `currentPhase` (string), SK: `signupDate` (ISO 8601)
  - **GSI:** `phone-index` — PK: `phone` (string) — for duplicate phone detection on signup
  - **Attributes:** email, phone (E.164), timezone (IANA string e.g. 'America/New_York'), assessmentResult (map: {C: 1-4, I: 1-4, D: 1-4, S: 1-4}), weakestPillar, signupDate, currentPhase (1-4), status (active/unsubscribed), unsubscribeToken, lastNudgeDate, lastMessageIndex (map: {C: n, I: n, D: n, S: n}), messagingChannel (whatsapp/sms)

### Infrastructure
- **Route53** → **CloudFront** → **S3** (static site hosting)
- **API Gateway** + **Lambda** + **DynamoDB** (backend)
- **SNS** for SMS, **SES** for email
- **Region:** us-east-2
- **IaC:** AWS CDK (TypeScript)
- **No auth for MVP** — signup is a form submission, unsubscribe via tokenized link
- **Environments:** Dev stack (suffixed `-dev`) for integration testing with real AWS services. DynamoDB Local for unit tests.

### Testing
- **TDD throughout** — tests written before implementation
- Unit tests for Lambda handlers, assessment scoring logic, message rotation
- Integration tests for API Gateway → Lambda → DynamoDB flow
- E2E tests for the signup flow (Playwright)
- Component tests for React components (Vitest + Testing Library)

## Images

All images are generated and stored in the project root as JPGs:

| File | Use | Section |
|------|-----|---------|
| hero-deadlift.jpg | Hero banner | Hero |
| consistency-lacing-shoes.jpg | Pillar 01 card | Why This Order / Gallery |
| intensity-chalk-grip.jpg | Pillar 02 card | Why This Order / Gallery |
| diet-meal-prep.jpg | Pillar 03 card | Why This Order / Gallery |
| sleep-rest.jpg | Pillar 04 card | Why This Order / Gallery |
| transformation-energy.jpg | Before/after diptych | Transformations |
| community-gym.jpg | Group training | Social Proof |

## MVP Scope

**In scope:**
- Single-page site with all sections above
- Self-assessment with result
- Email + phone signup with DynamoDB storage
- Welcome email with PDF lead magnet
- Daily nudge messaging (WhatsApp primary, SMS fallback)
- Time-based pillar progression
- CDK infrastructure
- Full test coverage (TDD)

**Out of scope (phase 2):**
- User dashboard / login
- Reply-based progression
- Digital product store
- Affiliate integrations
- Community features beyond email list
