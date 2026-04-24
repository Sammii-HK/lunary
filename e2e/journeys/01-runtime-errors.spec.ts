import { test, expect } from '@playwright/test';

/**
 * Runtime error smoke tests @smoke
 *
 * Catches bundler/tree-shaking regressions that typecheck and unit tests miss.
 * Visits critical pages after build and asserts:
 * 1. No uncaught JS errors in console
 * 2. No React error boundary fallback rendered
 * 3. No 404s on JS chunks (broken code splitting)
 *
 * These tests run against the BUILT app (next start) in CI.
 */

const CRITICAL_PAGES = [
  { path: '/', name: 'Homepage' },
  { path: '/explore', name: 'Explore' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/auth', name: 'Auth' },
];

// Authenticated pages that need a mocked session
const AUTHENTICATED_PAGES = [
  { path: '/app', name: 'App Dashboard' },
  { path: '/horoscope', name: 'Horoscope' },
  { path: '/profile', name: 'Profile' },
  { path: '/tarot', name: 'Tarot' },
  { path: '/book-of-shadows', name: 'Book of Shadows' },
];

const isIgnorableMissingScript = (url: string) =>
  url.includes('/_vercel/insights/script.js') ||
  url.includes('/_vercel/speed-insights/script.js');

test.describe('Runtime Error Detection @smoke', () => {
  for (const { path, name } of CRITICAL_PAGES) {
    test(`${name} (${path}) has no runtime JS errors`, async ({ page }) => {
      const jsErrors: string[] = [];
      const chunk404s: string[] = [];

      // Collect console errors
      page.on('pageerror', (error) => {
        jsErrors.push(error.message);
      });

      // Collect failed chunk loads (404 on .js files)
      page.on('response', (response) => {
        const url = response.url();
        if (
          response.status() === 404 &&
          (url.endsWith('.js') || url.includes('.js?')) &&
          !isIgnorableMissingScript(url)
        ) {
          chunk404s.push(url);
        }
      });

      await page.goto(path, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      // Wait for hydration
      await page
        .waitForLoadState('networkidle', { timeout: 10000 })
        .catch(() => {});

      // Check for error boundary fallback
      const errorBoundary = await page
        .locator('[data-testid="error-boundary"], text=/something went wrong/i')
        .first()
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      // Assert no errors
      expect(
        jsErrors,
        `${name} had runtime JS errors:\n${jsErrors.join('\n')}`,
      ).toHaveLength(0);

      expect(
        chunk404s,
        `${name} had missing JS chunks (broken code splitting):\n${chunk404s.join('\n')}`,
      ).toHaveLength(0);

      expect(errorBoundary, `${name} rendered an error boundary fallback`).toBe(
        false,
      );
    });
  }

  for (const { path, name } of AUTHENTICATED_PAGES) {
    test(`${name} (${path}) has no runtime JS errors (authenticated)`, async ({
      browser,
      baseURL,
    }) => {
      const testBaseURL = baseURL || 'http://localhost:3003';
      const jsErrors: string[] = [];
      const chunk404s: string[] = [];

      const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
      });

      // Mock auth session
      await context.route('**/api/auth/get-session', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            session: {
              id: 'smoke-test-session',
              userId: 'smoke-test-user',
              expiresAt: new Date(
                Date.now() + 24 * 60 * 60 * 1000,
              ).toISOString(),
            },
            user: {
              id: 'smoke-test-user',
              email: 'smoke@test.lunary.app',
              name: 'Smoke Test',
              emailVerified: true,
            },
          }),
        });
      });

      // Mock profile with birth chart data
      await context.route('**/api/profile', (route) => {
        if (route.request().method() === 'GET') {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              profile: {
                userId: 'smoke-test-user',
                name: 'Smoke Test',
                email: 'smoke@test.lunary.app',
                birthday: '1990-06-15',
                birthChart: [
                  {
                    body: 'Sun',
                    sign: 'gemini',
                    eclipticLongitude: 84.5,
                  },
                  {
                    body: 'Moon',
                    sign: 'pisces',
                    eclipticLongitude: 348.2,
                  },
                  {
                    body: 'Ascendant',
                    sign: 'libra',
                    eclipticLongitude: 195.0,
                  },
                ],
                location: {},
              },
              subscription: { status: 'active', planType: 'monthly' },
            }),
          });
        } else {
          route.continue();
        }
      });

      // Mock subscription
      await context.route('**/api/subscription', (route) => {
        if (route.request().method() === 'GET') {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              status: 'active',
              plan: 'monthly',
              planType: 'monthly',
            }),
          });
        } else {
          route.continue();
        }
      });

      // Mock non-critical API endpoints to prevent network errors
      await context.route('**/api/horoscope/**', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            sunSign: 'Gemini',
            moonPhase: 'Waxing Crescent',
            headline: 'Test horoscope',
            overview: 'Test overview text.',
            tinyAction: 'Test ritual action.',
            dailyGuidance: 'Test guidance.',
          }),
        });
      });

      await context.route('**/api/onboarding/**', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ completed: true, skipped: false }),
        });
      });

      await context.route('**/api/progress', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ progress: [] }),
        });
      });

      const page = await context.newPage();

      // Collect errors
      page.on('pageerror', (error) => {
        jsErrors.push(error.message);
      });

      page.on('response', (response) => {
        const url = response.url();
        if (
          response.status() === 404 &&
          (url.endsWith('.js') || url.includes('.js?')) &&
          !isIgnorableMissingScript(url)
        ) {
          chunk404s.push(url);
        }
      });

      await page.addInitScript(() => {
        (window as any).__PLAYWRIGHT_AUTHENTICATED__ = true;
      });

      await page.goto(`${testBaseURL}${path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      // Wait for hydration
      await page
        .waitForLoadState('networkidle', { timeout: 10000 })
        .catch(() => {});

      // Check for error boundary
      const errorBoundary = await page
        .locator('[data-testid="error-boundary"], text=/something went wrong/i')
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false);

      // Assert
      expect(
        jsErrors,
        `${name} had runtime JS errors:\n${jsErrors.join('\n')}`,
      ).toHaveLength(0);

      expect(
        chunk404s,
        `${name} had missing JS chunks:\n${chunk404s.join('\n')}`,
      ).toHaveLength(0);

      expect(
        errorBoundary,
        `${name} rendered an error boundary fallback — likely a broken import or missing module`,
      ).toBe(false);

      await page.close();
      await context.close();
    });
  }
});
