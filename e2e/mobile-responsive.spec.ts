import { test, expect } from '@playwright/test';

test.describe('Mobile responsiveness smoke', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  const routes: { path: string; name: string }[] = [
    { path: '/', name: 'Home' },
    { path: '/pricing', name: 'Pricing' },
    { path: '/grimoire', name: 'Grimoire index' },
    { path: '/grimoire/placements', name: 'Placements' },
    { path: '/grimoire/compatibility', name: 'Compatibility' },
    { path: '/shop', name: 'Shop' },
    { path: '/auth', name: 'Auth' },
    // Authenticated routes (Playwright runs with BYPASS_AUTH / SKIP_AUTH in config)
    { path: '/profile', name: 'Profile' },
    { path: '/horoscope/today', name: 'Horoscope today' },
    { path: '/tarot', name: 'Tarot' },
  ];

  for (const route of routes) {
    test(`${route.name} has no horizontal page overflow`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });

      // Let layout settle (fonts/hydration). Avoid networkidle for long-polling pages.
      await page.waitForTimeout(750);

      const { innerWidth, scrollWidth, bodyScrollWidth } = await page.evaluate(
        () => {
          const doc = document.documentElement;
          return {
            innerWidth: window.innerWidth,
            scrollWidth: doc.scrollWidth,
            bodyScrollWidth: document.body?.scrollWidth ?? doc.scrollWidth,
          };
        },
      );

      // Allow a tiny tolerance for subpixel rounding.
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth + 2);
      expect(bodyScrollWidth).toBeLessThanOrEqual(innerWidth + 2);
    });
  }
});
