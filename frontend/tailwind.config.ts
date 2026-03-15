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
      fontWeight: { black: '900' },
    },
  },
  plugins: [],
};
export default config;
