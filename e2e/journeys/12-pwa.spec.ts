import { test, expect } from '../fixtures/auth';

test.describe('PWA Journey', () => {
  test('should register service worker', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const hasSW = await page.evaluate(() => 'serviceWorker' in navigator);
    expect(hasSW).toBe(true);
  });

  test('should display PWA install prompt', async ({ page }) => {
    await page.goto('/');

    const manifestLink = await page
      .locator('link[rel="manifest"]')
      .getAttribute('href');
    expect(manifestLink).toBe('/manifest.json');
  });

  test('should have manifest.json', async ({ page }) => {
    const response = await page.goto('/manifest.json');
    expect(response?.status()).toBe(200);

    const manifest = await response?.json();
    expect(manifest).toHaveProperty('name');
    expect(manifest).toHaveProperty('icons');
  });

  test('should work offline', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await context.setOffline(true);

    await page.reload();

    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
  });
});
