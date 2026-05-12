import { expect, test as base, type Page } from '@playwright/test';

const MOBILE_APP_CHROME_ROUTES = [
  {
    path: '/app',
    readySelector: '#dashboard-container',
    topSelector:
      'text=/Good morning|Good afternoon|Good evening|Happy birthday/',
    topSnapshot: 'app-mobile-top-shell.png',
    bottomSnapshot: 'app-mobile-bottom-nav.png',
    readyTimeout: 10000,
    topClipHeight: 240,
    bottomClipHeight: 140,
  },
  {
    path: '/horoscope',
    readySelector: "text=/Your Transits|Today's reading|Upcoming Transits/",
    topSelector: 'text=Your Transits',
    topSnapshot: 'horoscope-mobile-top-shell.png',
    bottomSnapshot: 'horoscope-mobile-bottom-nav.png',
    readyTimeout: 30000,
    topClipHeight: 240,
    bottomClipHeight: 140,
  },
  {
    path: '/guide',
    readySelector: 'text=/Astral Guide/',
    topSelector: 'text=Astral Guide',
    topSnapshot: null,
    bottomSnapshot: 'guide-mobile-bottom-nav.png',
    readyTimeout: 10000,
    topClipHeight: 150,
    bottomClipHeight: 90,
  },
] as const;

const COOKIE_CONSENT_PAYLOAD = JSON.stringify({
  version: 1,
  preferences: {
    essential: true,
    analytics: false,
    timestamp: 1,
  },
});

const AUTHENTICATED_SESSION = {
  id: 'test-session-id',
  userId: 'test-user-id',
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

const AUTHENTICATED_USER = {
  id: 'test-user-id',
  email: 'sammii@example.com',
  name: 'Sammii',
  emailVerified: true,
};

const AUTHENTICATED_PROFILE = {
  userId: 'test-user-id',
  name: 'Sammii',
  email: 'sammii@example.com',
  birthday: '1990-01-15',
};

async function gotoWithRetry(page: Page, targetUrl: string) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await page.goto(targetUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 120000,
      });
      return;
    } catch (error) {
      lastError = error;
      const message =
        error instanceof Error ? error.message : String(error ?? '');
      const isTransientNavFailure =
        message.includes('ERR_NETWORK_IO_SUSPENDED') ||
        message.includes('ERR_ABORTED') ||
        message.includes('frame was detached');

      if (!isTransientNavFailure || attempt === 1) {
        throw error;
      }

      await page.waitForTimeout(2000);
    }
  }

  throw lastError;
}

async function installAuthenticatedAppStubs(page: Page) {
  await page.addInitScript((consentPayload) => {
    (
      window as { __PLAYWRIGHT_AUTHENTICATED__?: boolean }
    ).__PLAYWRIGHT_AUTHENTICATED__ = true;
    localStorage.setItem('cookie_consent', consentPayload);
    document.cookie = `cookie_consent=${encodeURIComponent(consentPayload)}; path=/; SameSite=Lax`;
  }, COOKIE_CONSENT_PAYLOAD);

  await page.context().route('**/*', async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    const resourceType = route.request().resourceType();

    if (url.includes('/api/auth/get-session')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          session: AUTHENTICATED_SESSION,
          user: AUTHENTICATED_USER,
          data: {
            session: AUTHENTICATED_SESSION,
            user: AUTHENTICATED_USER,
          },
        }),
      });
      return;
    }

    if (url.includes('/api/profile') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          profile: AUTHENTICATED_PROFILE,
        }),
      });
      return;
    }

    if (url.includes('/api/subscription') && method === 'GET') {
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

    if (url.includes('/api/announcements') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
      return;
    }

    if (
      resourceType === 'image' &&
      !url.includes('og-image') &&
      !url.includes('og/')
    ) {
      await route.abort();
      return;
    }

    if (resourceType === 'font' || resourceType === 'media') {
      await route.abort();
      return;
    }

    if (resourceType === 'stylesheet') {
      try {
        const host = new URL(url).hostname.toLowerCase();
        if (
          host === 'fonts.googleapis.com' ||
          host === 'cdn.jsdelivr.net' ||
          host === 'unpkg.com'
        ) {
          await route.abort();
          return;
        }
      } catch {
        // Ignore parse errors and continue.
      }
    }

    await route.continue();
  });
}

base.describe('Auth handoff', () => {
  base.describe.configure({ timeout: 180000 });

  base(
    'keeps the user on /app while session resolution catches up',
    async ({ page, baseURL }) => {
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

      const targetUrl = new URL(
        '/app',
        baseURL ?? 'http://localhost:3000',
      ).toString();

      await page.context().request.get(targetUrl, {
        timeout: 120000,
        failOnStatusCode: false,
      });

      await gotoWithRetry(page, targetUrl);

      await expect(page).toHaveURL(/\/app$/);
      await expect(page).not.toHaveURL(/\/auth/);
      await expect(page.locator('main')).toContainText(
        /Checking authentication|Finishing sign-in|Good morning|Good afternoon|Good evening|Happy birthday/,
        { timeout: 30000 },
      );
    },
  );
});

base.describe('Mobile app chrome', () => {
  base.describe.configure({ timeout: 180000 });

  async function assertMobileAppChrome(
    page: Page,
    baseURL: string | undefined,
    route: (typeof MOBILE_APP_CHROME_ROUTES)[number],
  ) {
    await installAuthenticatedAppStubs(page);

    await page.setViewportSize({ width: 393, height: 852 });
    const targetUrl = new URL(
      route.path,
      baseURL ?? 'http://localhost:3000',
    ).toString();

    await page.context().request.get(targetUrl, {
      timeout: 120000,
      failOnStatusCode: false,
    });

    await gotoWithRetry(page, targetUrl);
    await page.waitForTimeout(2000);

    const readyContent = page.locator(route.readySelector).first();
    const topContent = page.locator(route.topSelector).first();
    const bottomNav = page.locator('nav.fixed.bottom-0').first();

    await expect(readyContent).toBeVisible({ timeout: route.readyTimeout });
    await expect(topContent).toBeVisible({ timeout: route.readyTimeout });
    await expect(bottomNav).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText('We use cookies to enhance your experience.'),
    ).toHaveCount(0);

    const topContentBox = await topContent.boundingBox();
    const navBox = await bottomNav.boundingBox();
    const viewport = page.viewportSize();
    const mainStyle = await page.locator('main').getAttribute('style');
    const navInnerStyle = await page
      .locator('nav.fixed.bottom-0 > div')
      .getAttribute('style');

    expect(topContentBox).toBeTruthy();
    expect(navBox).toBeTruthy();
    expect(viewport).toBeTruthy();
    expect(mainStyle).toContain('safe-area-inset-top');
    expect(navInnerStyle).toContain('safe-area-inset-bottom');
    expect(topContentBox!.y).toBeGreaterThanOrEqual(24);
    expect(navBox!.y + navBox!.height).toBeGreaterThanOrEqual(
      viewport!.height - 2,
    );
    expect(navBox!.height).toBeGreaterThanOrEqual(56);

    if (route.topSnapshot) {
      await expect(page).toHaveScreenshot(route.topSnapshot, {
        animations: 'disabled',
        caret: 'hide',
        fullPage: false,
        maxDiffPixels: 50,
        clip: {
          x: 0,
          y: 0,
          width: viewport!.width,
          height: route.topClipHeight,
        },
      });
    }

    await expect(page).toHaveScreenshot(route.bottomSnapshot, {
      animations: 'disabled',
      caret: 'hide',
      fullPage: false,
      maxDiffPixels: 50,
      clip: {
        x: 0,
        y: viewport!.height - route.bottomClipHeight,
        width: viewport!.width,
        height: route.bottomClipHeight,
      },
    });
  }

  for (const route of MOBILE_APP_CHROME_ROUTES) {
    base(
      `keeps authenticated mobile app chrome aligned on ${route.path}`,
      async ({ page, baseURL }) => {
        await assertMobileAppChrome(page, baseURL, route);
      },
    );
  }
});
