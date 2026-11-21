import { defineConfig, devices } from '@playwright/test';

const PORT = 4174;

/**
 * End-to-end smoke tests run against the app in DEMO mode (LocalStore, no network),
 * on a phone-sized Chromium. Locally you can use an installed Chrome: `PW_CHANNEL=chrome npm run test:e2e`.
 * Set `SCREENSHOTS=1` to save screenshots of every screen to test-results/screens/.
 */
export default defineConfig({
  testDir: 'e2e',
  timeout: 45_000,
  fullyParallel: false,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    ...devices['Pixel 7'],
    baseURL: `http://localhost:${PORT}`,
    locale: 'he-IL',
    timezoneId: 'Asia/Jerusalem',
    channel: process.env.PW_CHANNEL || undefined,
    trace: 'retain-on-failure',
    // Also verifies the reduced-motion styles (the labor button "breathes" otherwise).
    contextOptions: { reducedMotion: 'reduce' },
  },
  webServer: {
    command: `npx vite --mode demo --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [{ name: 'mobile' }],
});
