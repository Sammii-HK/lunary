import type { Page } from '@playwright/test';

/**
 * Setup route blocking to speed up tests by blocking unnecessary resources
 * Call this in tests that don't need images/fonts
 */
export async function blockUnnecessaryResources(page: Page) {
  await page.route('**/*', (route) => {
    const resourceType = route.request().resourceType();
    const url = route.request().url();

    // Block images (unless OG images which are needed for some tests)
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

    // Block external stylesheets from CDNs
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
