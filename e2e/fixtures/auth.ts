/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { TEST_USERS } from './test-users';

type AuthFixtures = {
  authenticatedPage: Page;
  adminPage: Page;
  testUser: { email: string; password: string };
};

export const test = base.extend<AuthFixtures>({
  page: async ({ page }, use) => {
    await page.route('**/api/auth/get-session', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ session: null, user: null }),
      });
    });

    await page.route('**/*', (route) => {
      const resourceType = route.request().resourceType();
      const url = route.request().url();

      if (url.includes('/api/auth/get-session')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ session: null, user: null }),
        });
        return;
      }

      if (
        resourceType === 'image' &&
        !url.includes('og-image') &&
        !url.includes('og/')
      ) {
        route.abort();
        return;
      }

      if (resourceType === 'font') {
        route.abort();
        return;
      }

      if (resourceType === 'media') {
        route.abort();
        return;
      }

      if (resourceType === 'stylesheet') {
        try {
          const parsedUrl = new URL(url);
          const host = parsedUrl.hostname.toLowerCase();
          if (
            host === 'fonts.googleapis.com' ||
            host === 'cdn.jsdelivr.net' ||
            host === 'unpkg.com'
          ) {
            route.abort();
            return;
          }
        } catch {
          // Invalid URL, continue
        }
      }

      route.continue();
    });

    await use(page);
  },

  testUser: async ({}, use) => {
    await use({
      email: TEST_USERS.regular.email,
      password: TEST_USERS.regular.password,
    });
  },

  authenticatedPage: async ({ browser, baseURL }, use) => {
    const testBaseURL = baseURL || 'http://localhost:3000';

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });

    await context.route('**/api/auth/get-session', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          session: {
            id: 'test-session-id',
            userId: 'test-user-id',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
          user: {
            id: 'test-user-id',
            email: TEST_USERS.regular.email,
            name: TEST_USERS.regular.name,
            emailVerified: true,
          },
        }),
      });
    });

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

    await context.route('**/api/profile', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            profile: {
              userId: 'test-user-id',
              name: TEST_USERS.regular.name,
              email: TEST_USERS.regular.email,
              birthday: '1990-01-15',
            },
          }),
        });
      } else {
        route.continue();
      }
    });

    await context.route('**/*', (route) => {
      const resourceType = route.request().resourceType();
      const url = route.request().url();

      if (
        resourceType === 'image' &&
        !url.includes('og-image') &&
        !url.includes('og/')
      ) {
        route.abort();
        return;
      }
      if (resourceType === 'font') {
        route.abort();
        return;
      }
      if (resourceType === 'media') {
        route.abort();
        return;
      }
      if (resourceType === 'stylesheet') {
        try {
          const parsedUrl = new URL(url);
          const host = parsedUrl.hostname.toLowerCase();
          if (
            host === 'fonts.googleapis.com' ||
            host === 'cdn.jsdelivr.net' ||
            host === 'unpkg.com'
          ) {
            route.abort();
            return;
          }
        } catch {
          // Invalid URL, continue
        }
      }
      route.continue();
    });

    const page = await context.newPage();

    // Set authenticated test flag before navigating
    await page.addInitScript(() => {
      (window as any).__PLAYWRIGHT_AUTHENTICATED__ = true;
    });

    await page.goto(`${testBaseURL}/`, { waitUntil: 'domcontentloaded' });

    await use(page);
    await page.close();
    await context.close();
  },

  adminPage: async ({ browser, baseURL }, use) => {
    const testBaseURL = baseURL || 'http://localhost:3000';

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });

    await context.route('**/api/auth/get-session', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          session: {
            id: 'admin-session-id',
            userId: 'admin-user-id',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
          user: {
            id: 'admin-user-id',
            email: TEST_USERS.admin.email,
            name: TEST_USERS.admin.name,
            emailVerified: true,
            role: 'admin',
          },
        }),
      });
    });

    await context.route('**/*', (route) => {
      const resourceType = route.request().resourceType();
      const url = route.request().url();

      if (
        resourceType === 'image' &&
        !url.includes('og-image') &&
        !url.includes('og/')
      ) {
        route.abort();
        return;
      }
      if (resourceType === 'font') {
        route.abort();
        return;
      }
      if (resourceType === 'media') {
        route.abort();
        return;
      }
      route.continue();
    });

    const page = await context.newPage();

    // Set authenticated test flag before navigating
    await page.addInitScript(() => {
      (window as any).__PLAYWRIGHT_AUTHENTICATED__ = true;
    });

    await page.goto(`${testBaseURL}/admin`, { waitUntil: 'domcontentloaded' });

    await use(page);
    await page.close();
    await context.close();
  },
});

export { expect };
