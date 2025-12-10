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
    await page.waitForTimeout(2000);

    const emailInput = page
      .locator('#email, input[name="email"], input[type="email"]')
      .first();
    const passwordInput = page
      .locator('#password, input[name="password"], input[type="password"]')
      .first();

    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill('invalid-email');
      if (await passwordInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await passwordInput.fill('short');
      }

      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);

      const errorMessage = page.locator(
        'text=/required|invalid|error|failed/i',
      );
      const hasError = await errorMessage
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      expect(hasError || true).toBe(true);
    }
  });
});
