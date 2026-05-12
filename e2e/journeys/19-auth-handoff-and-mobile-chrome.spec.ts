import { expect, test as base } from '@playwright/test';
import { test as authTest } from '../fixtures/auth';

base.describe('Auth handoff', () => {
  base(
    'keeps the user on /app while session resolution catches up',
    async ({ page }) => {
      let sessionReads = 0;
      const context = page.context();

      await page.addInitScript(() => {
        sessionStorage.setItem(
          'lunary_recent_auth_handoff',
          JSON.stringify({ completedAt: Date.now() }),
        );
      });

      await context.route('**/*', async (route) => {
        const url = route.request().url();

        if (url.includes('/api/auth/get-session')) {
          sessionReads += 1;

          if (sessionReads < 2) {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({ data: { user: null } }),
            });
            return;
          }

          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                user: {
                  id: 'handoff-user-id',
                  email: 'handoff@example.com',
                  name: 'Sammii',
                },
              },
            }),
          });
          return;
        }

        if (
          url.includes('/api/profile') &&
          route.request().method() === 'GET'
        ) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              profile: {
                userId: 'handoff-user-id',
                name: 'Sammii',
                email: 'handoff@example.com',
                birthday: '1990-01-15',
              },
            }),
          });
          return;
        }

        if (
          url.includes('/api/subscription') &&
          route.request().method() === 'GET'
        ) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              status: 'active',
              plan: 'monthly',
              planType: 'monthly',
            }),
          });
          return;
        }

        await route.continue();
      });

      await page.goto('/app', { waitUntil: 'domcontentloaded' });

      await expect(page).toHaveURL(/\/app$/);
      await expect(page).not.toHaveURL(/\/auth/);
      await expect(page.locator('main')).toContainText(
        /Finishing sign-in…|Good morning|Good afternoon|Good evening|Happy birthday/,
        { timeout: 10000 },
      );
      expect(sessionReads).toBeGreaterThanOrEqual(2);
    },
  );
});

authTest.describe('Mobile app chrome', () => {
  authTest(
    'keeps authenticated mobile app chrome aligned to the viewport',
    async ({ authenticatedPage }) => {
      await authenticatedPage.setViewportSize({ width: 393, height: 852 });
      await authenticatedPage.goto('/app', { waitUntil: 'domcontentloaded' });
      await authenticatedPage.waitForTimeout(2000);

      const dashboard = authenticatedPage
        .locator('#dashboard-container')
        .first();
      const bottomNav = authenticatedPage.locator('nav.fixed.bottom-0').first();

      await expect(dashboard).toBeVisible({ timeout: 10000 });
      await expect(bottomNav).toBeVisible({ timeout: 10000 });

      const dashboardBox = await dashboard.boundingBox();
      const navBox = await bottomNav.boundingBox();
      const viewport = authenticatedPage.viewportSize();
      const mainStyle = await authenticatedPage
        .locator('main')
        .getAttribute('style');
      const navInnerStyle = await authenticatedPage
        .locator('nav.fixed.bottom-0 > div')
        .getAttribute('style');

      expect(dashboardBox).toBeTruthy();
      expect(navBox).toBeTruthy();
      expect(viewport).toBeTruthy();
      expect(mainStyle).toContain('safe-area-inset-top');
      expect(navInnerStyle).toContain('safe-area-inset-bottom');

      expect(navBox!.y + navBox!.height).toBeGreaterThanOrEqual(
        viewport!.height - 2,
      );
      expect(navBox!.height).toBeGreaterThanOrEqual(56);

      await expect(authenticatedPage).toHaveScreenshot(
        'app-mobile-chrome.png',
        {
          animations: 'disabled',
          caret: 'hide',
          fullPage: false,
        },
      );
    },
  );
});
