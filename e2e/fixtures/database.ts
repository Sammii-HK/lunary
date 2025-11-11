import { test as base } from '@playwright/test';
import type { Page } from '@playwright/test';

type DatabaseFixtures = {
  cleanDatabase: Page;
};

export const testWithDB = base.extend<DatabaseFixtures>({
  cleanDatabase: async ({ page, baseURL }, use) => {
    // Setup: Clean test data before test
    try {
      await page.request.post(`${baseURL}/api/test/cleanup`, {
        data: { testUser: true },
      });
    } catch (error) {
      // Ignore if cleanup endpoint doesn't exist
      console.warn('Cleanup endpoint not available:', error);
    }

    await use(page);

    // Teardown: Clean test data after test
    try {
      await page.request.post(`${baseURL}/api/test/cleanup`, {
        data: { testUser: true },
      });
    } catch (error) {
      // Ignore cleanup errors
    }
  },
});
