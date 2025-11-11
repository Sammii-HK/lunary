import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file for Playwright tests
config({ path: resolve(__dirname, '.env.local') });

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Run tests sequentially to avoid auth conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid auth conflicts
  timeout: 60000, // 60 second timeout per test (increased for React hydration and Jazz sync)
  globalSetup: require.resolve('./e2e/global-setup.ts'),
  reporter: process.env.CI
    ? [['github'], ['list'], ['html', { outputFolder: 'playwright-report' }]]
    : [
        ['list'],
        ['line'],
        ['html', { outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results/results.json' }],
      ],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000, // Increased for Jazz sync
    navigationTimeout: 20000, // Increased for Jazz sync
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: true, // Run headless by default for speed
      },
    },
  ],
  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:3000',
    reuseExistingServer: false, // Always start fresh to avoid wrong server
    timeout: 60000, // 60 seconds should be enough
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      ...process.env,
      NODE_ENV: 'development',
    },
  },
});
