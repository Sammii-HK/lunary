import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file for Playwright tests
config({ path: resolve(__dirname, '.env.local') });

// Calculate shard info for test distribution
const shardId = process.env.SHARD_ID
  ? parseInt(process.env.SHARD_ID)
  : undefined;
const totalShards = process.env.TOTAL_SHARDS
  ? parseInt(process.env.TOTAL_SHARDS)
  : undefined;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Run tests sequentially to avoid auth conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? (totalShards ? 1 : 2) : 1, // Use 1 worker per shard, 2 if no sharding
  timeout: 60000, // 60 second timeout per test (increased for React hydration and Jazz sync)
  globalSetup: require.resolve('./e2e/global-setup.ts'),
  globalTeardown: require.resolve('./e2e/global-teardown.ts'),
  // Enable sharding if SHARD_ID and TOTAL_SHARDS are set
  // Each shard runs on a separate CI job with its own webServer instance
  ...(shardId !== undefined &&
  totalShards !== undefined &&
  shardId >= 1 &&
  shardId <= totalShards
    ? { shard: { current: shardId, total: totalShards } }
    : {}),
  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: 'playwright-report' }]]
    : [
        ['list'],
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
    // Optimize browser performance
    viewport: { width: 1280, height: 720 },
    // Disable unnecessary resources for faster tests
    bypassCSP: true,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: true, // Run headless by default for speed
        // Optimize browser launch for speed
        launchOptions: {
          args: [
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
            '--disable-backgrounding-occluded-windows',
            '--disable-ipc-flooding-protection',
          ],
        },
        // Block unnecessary resources for faster page loads
        contextOptions: {
          ignoreHTTPSErrors: true,
        },
      },
    },
  ],
  webServer: {
    command: process.env.CI
      ? 'pnpm dev'
      : 'lsof -ti:3000 | xargs kill -9 2>/dev/null || true; rm -rf .next/routes-manifest.json 2>/dev/null || true && pnpm dev', // Kill any process on port 3000 and clean routes manifest
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI, // Reuse existing server in local dev, always start fresh in CI
    timeout: 120000, // 120 seconds to allow Next.js to compile routes and generate manifest files
    stdout: process.env.CI ? 'ignore' : 'pipe',
    stderr: process.env.CI ? 'ignore' : 'pipe',
    env: {
      ...process.env,
      NODE_ENV: 'test',
      CI: process.env.CI || 'true', // Explicitly set CI for middleware
      GITHUB_ACTIONS: process.env.GITHUB_ACTIONS || 'true', // GitHub Actions flag
      // CRITICAL: Bypass auth in test mode to prevent hanging
      BYPASS_AUTH: 'true',
      SKIP_AUTH: 'true',
      // Suppress Next.js verbose logging in tests
      NEXT_TELEMETRY_DISABLED: '1',
      // Set default test values if not provided
      BETTER_AUTH_SECRET:
        process.env.BETTER_AUTH_SECRET || 'test-secret-key-for-e2e-tests-only',
      STRIPE_SECRET_KEY:
        process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_for_e2e_testing',
      // Admin email for access control
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@lunary.app',
      NEXT_PUBLIC_ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@lunary.app',
    },
  },
});
