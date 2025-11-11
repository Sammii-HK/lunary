import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { ensureTestUser, TEST_USERS } from './test-users';

type AuthFixtures = {
  authenticatedPage: Page;
  adminPage: Page;
  testUser: { email: string; password: string };
};

export const test = base.extend<AuthFixtures>({
  testUser: async ({}, use) => {
    // Access TEST_USERS.regular as a getter to ensure env vars are read at test time
    const testUser = TEST_USERS.regular;
    const email = testUser.email;
    const password = testUser.password;

    // Log which email is being used
    if (process.env.TEST_EMAIL || process.env.TEST_USER_EMAIL) {
      console.log(`📧 Using TEST_EMAIL from environment: ${email}`);
    } else {
      console.log(
        `⚠️  No TEST_EMAIL env var found, using test email: ${email}`,
      );
      console.log(
        `   → Tests will bypass Better Auth (no authentication required)`,
      );
      console.log(
        `   → Set TEST_EMAIL and TEST_PASSWORD in .env.local to use Better Auth`,
      );
    }

    await use({
      email,
      password,
    });
  },

  authenticatedPage: async ({ page, baseURL, testUser }, use, testInfo) => {
    const testBaseURL = baseURL || 'http://localhost:3000';

    console.log(`\n🔐 Authenticating user for test: ${testInfo.title}`);
    console.log(`   Email: ${testUser.email}`);

    // Authenticate user via UI (required for Jazz)
    const authenticated = await ensureTestUser(page, {
      email: testUser.email,
      password: testUser.password,
      name: 'Test User',
    });

    if (authenticated) {
      console.log(`✅ Authentication successful`);
    } else {
      console.warn('⚠️  Auth may have failed, continuing anyway');
    }

    // Navigate to home to verify state
    console.log(`   Navigating to home page...`);
    await page.goto(`${testBaseURL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    await use(page);
  },

  adminPage: async ({ page, baseURL }, use, testInfo) => {
    const testBaseURL = baseURL || 'http://localhost:3000';

    console.log(`\n🔐 Authenticating admin user for test: ${testInfo.title}`);
    console.log(`   Email: ${TEST_USERS.admin.email}`);

    // Authenticate admin user
    const authenticated = await ensureTestUser(page, TEST_USERS.admin);

    if (authenticated) {
      console.log(`✅ Admin authentication successful`);
    } else {
      console.warn('⚠️  Admin auth may have failed');
    }

    console.log(`   Navigating to admin page...`);
    await page.goto(`${testBaseURL}/admin`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    await use(page);
  },
});

export { expect };
