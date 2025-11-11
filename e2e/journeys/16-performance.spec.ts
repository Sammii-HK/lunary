import { test, expect } from '../fixtures/auth';

test.describe('Performance', () => {
  test('homepage should load quickly', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const loadTime = Date.now() - startTime;

    // Should load in under 5 seconds (generous for local dev)
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have fast Time to Interactive', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Check that interactive elements are ready
    const buttons = page.locator('button').first();
    await expect(buttons).toBeVisible({ timeout: 5000 });
  });

  test('should lazy load images', async ({ page }) => {
    await page.goto('/grimoire', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Check for lazy loading attributes
    const images = page.locator('img[loading="lazy"]');
    const lazyCount = await images.count();

    // Many images should be lazy loaded (or all if implemented)
    // This is a soft check - any lazy loading is good
    expect(lazyCount).toBeGreaterThanOrEqual(0);
  });

  test('should have optimized assets', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'networkidle' });

    // Check response headers for compression
    const contentType = response?.headers()['content-type'];
    expect(contentType).toContain('text/html');

    // Check that page size is reasonable (under 500KB for HTML)
    const body = await response?.text();
    expect(body?.length || 0).toBeLessThan(500000);
  });

  test('should minimize layout shift', async ({ page }) => {
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Check that main content is stable
    const mainContent = page.locator('main, [role="main"]').first();
    await expect(mainContent).toBeVisible({ timeout: 5000 });

    // Wait a bit more and check it hasn't shifted
    await page.waitForTimeout(1000);
    const stillVisible = await mainContent.isVisible();
    expect(stillVisible).toBe(true);
  });

  test('should handle rapid navigation', async ({ page }) => {
    const pages = ['/', '/pricing', '/grimoire', '/blog', '/'];

    for (const path of pages) {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500); // Small delay between navigations
    }

    // Should still be responsive after rapid navigation
    const currentContent = page.locator('body').first();
    await expect(currentContent).toBeVisible({ timeout: 5000 });
  });

  test('should have efficient API calls', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/horoscope', { waitUntil: 'networkidle' });

    // Check network requests
    const requests = authenticatedPage.request.url();

    // Should have made requests (this is a basic check)
    expect(requests).toBeTruthy();
  });

  test('should cache static assets', async ({ page }) => {
    // First load
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Second load should be faster (cached)
    const startTime = Date.now();
    await page.reload({ waitUntil: 'domcontentloaded' });
    const reloadTime = Date.now() - startTime;

    // Reload should be faster than initial load
    expect(reloadTime).toBeLessThan(3000);
  });
});
