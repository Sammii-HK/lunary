import { test as base } from '@playwright/test';
import type { BrowserContext, Page } from '@playwright/test';

type OptimizedContextFixtures = {
  optimizedPage: Page;
};

// Reusable browser context with optimizations
let sharedContext: BrowserContext | null = null;

export const testWithOptimizedContext = base.extend<OptimizedContextFixtures>({
  optimizedPage: async ({ browser }, use) => {
    // Reuse context across tests for better performance
    if (!sharedContext) {
      sharedContext = await browser.newContext({
        // Block unnecessary resources for faster page loads
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
      });

      // Block images, fonts, and other non-essential resources
      await sharedContext.route('**/*', (route) => {
        const resourceType = route.request().resourceType();
        const url = route.request().url();

        // Block images (unless needed for visual tests)
        if (
          resourceType === 'image' &&
          !url.includes('og-image') &&
          !url.includes('og/')
        ) {
          route.abort();
          return;
        }

        // Block fonts (use system fonts for faster tests)
        if (resourceType === 'font') {
          route.abort();
          return;
        }

        // Block media files
        if (resourceType === 'media') {
          route.abort();
          return;
        }

        // Block stylesheets from external CDNs (keep local CSS)
        if (
          resourceType === 'stylesheet' &&
          (url.includes('fonts.googleapis.com') ||
            url.includes('cdn.jsdelivr.net') ||
            url.includes('unpkg.com'))
        ) {
          route.abort();
          return;
        }

        // Allow everything else
        route.continue();
      });
    }

    const page = await sharedContext.newPage();
    await use(page);
    await page.close();
  },
});

// Cleanup shared context after all tests
export async function cleanupSharedContext() {
  if (sharedContext) {
    await sharedContext.close();
    sharedContext = null;
  }
}
