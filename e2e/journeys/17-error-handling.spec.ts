import { test, expect } from '../fixtures/auth';

test.describe('Error Handling Journey', () => {
  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/non-existent-page-12345', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(2000);

    await expect(
      page.locator('text=/404|not found|page not found/i').first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.goto('/');

    const response = await page.goto('/api/non-existent-endpoint');
    expect(response?.status()).toBe(404);
  });

  test('should display error messages for invalid forms', async ({ page }) => {
    await page.goto('/auth');

    await page.click('button[type="submit"]');

    const errorMessage = page.locator('text=/required|invalid|error/i');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
  });
});
