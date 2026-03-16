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
