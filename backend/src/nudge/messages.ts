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
