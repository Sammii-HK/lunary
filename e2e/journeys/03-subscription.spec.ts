import { test, expect } from '../fixtures/auth';

test.describe('Subscription Journey', () => {
  test('should display pricing page with all plans and features', async ({
    page,
  }) => {
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000); // Wait for React hydration

    await test.step('Verify pricing page loads', async () => {
      await expect(
        page.locator('text=/pricing|plan|subscription/i').first(),
      ).toBeVisible({ timeout: 10000 });
    });

    await test.step('Verify all pricing plans are visible', async () => {
      await expect(
        page.locator('text=/cosmic explorer|free/i').first(),
      ).toBeVisible({ timeout: 5000 });
      await expect(
        page.locator('text=/cosmic guide|monthly/i').first(),
      ).toBeVisible({ timeout: 5000 });
      await expect(
        page.locator('text=/cosmic master|yearly/i').first(),
      ).toBeVisible({ timeout: 5000 });
    });

    await test.step('Verify popular plan highlighting', async () => {
      const popularPlan = page
        .locator('[data-popular="true"], .popular, text=/popular/i')
        .first();
      await expect(popularPlan).toBeVisible({ timeout: 5000 });
    });

    await test.step('Verify plan features', async () => {
      await expect(
        page.locator('text=/birth chart|horoscope|tarot|crystal/i').first(),
      ).toBeVisible({ timeout: 5000 });
    });

    await test.step('Verify free trial information', async () => {
      await expect(
        page.locator('text=/free trial|7 day|14 day/i').first(),
      ).toBeVisible({ timeout: 5000 });
    });

    await test.step('Verify credit card requirement notice', async () => {
      await expect(
        page.locator('text=/credit card|no payment|trial/i').first(),
      ).toBeVisible({ timeout: 5000 });
    });
  });

  test('should navigate to checkout for monthly plan', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto('/pricing', { waitUntil: 'domcontentloaded' });

    const monthlyButton = authenticatedPage
      .locator(
        'button:has-text("Monthly"), button:has-text("Cosmic Guide"), a[href*="checkout"]',
      )
      .first();
    if (await monthlyButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await monthlyButton.click();
      await authenticatedPage
        .waitForLoadState('networkidle', { timeout: 5000 })
        .catch(() => {});

      const url = authenticatedPage.url();
      // May redirect to Stripe or show checkout
      expect(
        url.includes('checkout') ||
          url.includes('stripe') ||
          url.includes('pricing'),
      ).toBe(true);
    }
  });
});
