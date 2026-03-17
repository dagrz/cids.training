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
    id: 'C', number: '01', name: 'Consistency', tagline: 'Show Up',
    gradientFrom: '#6366f1', gradientTo: '#8b5cf6', borderColor: '#6366f1',
    question: 'What does your week look like?',
    answers: [
      "I haven't trained in months (or ever)",
      'I start strong on Monday but it falls apart by Wednesday',
      "I get in a few sessions but it's random",
      'I show up like clockwork, no excuses',
    ],
    resultCopy: "Your priority: Consistency. Nothing else matters until you're showing up.",
    resultTip: "Commit to 4 days this week. Put them in your calendar right now. Don't think about what you'll do — just show up.",
  },
  {
    id: 'I', number: '02', name: 'Intensity', tagline: 'Push Hard',
    gradientFrom: '#ec4899', gradientTo: '#f43f5e', borderColor: '#ec4899',
    question: "When you do train, what's it actually like?",
    answers: [
      'I scroll my phone between sets and leave dry',
      'I break a sweat but could talk through it',
      "I'm breathing hard, counting down rest seconds",
      'I grunt, sweat through my shirt, question my life choices',
    ],
    resultCopy: "Your priority: Intensity. You're showing up — now make it count.",
    resultTip: "Every set should finish with less than 2 reps in reserve. If you could have done 3 more, it wasn't hard enough. Phone in the bag.",
  },
  {
    id: 'D', number: '03', name: 'Diet', tagline: 'Eat Right',
    gradientFrom: '#f59e0b', gradientTo: '#f97316', borderColor: '#f59e0b',
    question: "What's your protein situation?",
    answers: [
      "Protein what? I couldn't tell you how many grams",
      "I know I should eat more but I'm winging it",
      "I hit my protein most days but meals aren't consistent",
      'I track my macros and eat to fuel my training',
    ],
    resultCopy: "Your priority: Diet. You're doing the work — now fuel it.",
    resultTip: "Hit 1g of protein per pound of bodyweight (2g per kg) every day this week. Track it. That's it — just protein. The rest follows.",
  },
  {
    id: 'S', number: '04', name: 'Sleep', tagline: 'Rest Well',
    gradientFrom: '#06b6d4', gradientTo: '#3b82f6', borderColor: '#06b6d4',
    question: "What's 6am feel like?",
    answers: [
      "I didn't sleep, or slept 4 hours doom-scrolling",
      'Hit snooze 5 times, dragged myself up wrecked',
      "Alarm went off, took a minute but I'm functional",
      'Eyes open before the alarm, ready to go',
    ],
    resultCopy: "Your priority: Sleep. You're earning it — now let your body rebuild.",
    resultTip: "Get 7+ hours every night this week. Phone on the charger in another room by 10pm. No negotiation. Your gains happen while you sleep.",
  },
];

export const PILLAR_ORDER: PillarId[] = ['C', 'I', 'D', 'S'];
