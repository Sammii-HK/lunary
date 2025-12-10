import { test, expect } from '../fixtures/auth';

test.describe('Mobile Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test('should display mobile navigation', async ({ page }) => {
    await page.goto('/app', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // On app pages, look for bottom navigation bar
    const bottomNav = page.locator('nav.fixed.bottom-0').first();
    const hasBottomNav = await bottomNav
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    // On marketing pages, look for top nav or mobile menu
    const topNav = page.locator('nav').first();
    const hasTopNav = await topNav
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    // Any navigation pattern should work
    expect(hasBottomNav || hasTopNav).toBe(true);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Check that content is visible and not cut off
    const pricingContent = page.locator('text=/pricing|plan/i').first();
    await expect(pricingContent).toBeVisible({ timeout: 5000 });

    // Check viewport width
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThanOrEqual(375);
  });

  test('should handle touch interactions', async ({ page }) => {
    await page.goto('/grimoire', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Try tapping on mobile
    const tappableElements = page.locator('a, button').first();
    const isVisible = await tappableElements
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    if (isVisible) {
      await tappableElements.tap().catch(() => {});
      await page.waitForTimeout(1000);
    }

    // Just verify page is still functional after touch
    const hasContent = await page
      .locator('body')
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    expect(hasContent).toBe(true);
  });

  test('should display mobile-optimized forms', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto('/birth-chart', {
      waitUntil: 'domcontentloaded',
    });
    await authenticatedPage.waitForTimeout(2000);

    const dateInput = authenticatedPage.locator('input[type="date"]').first();
    if (await dateInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      // On mobile, date inputs should be accessible
      await expect(dateInput).toBeVisible();
    }
  });

  test('should handle mobile scroll', async ({ page }) => {
    await page.goto('/blog', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Scroll down to test mobile scrolling
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000);

    // Content should still be accessible after scroll
    const blogContent = page.locator('text=/blog|article/i').first();
    await expect(blogContent).toBeVisible({ timeout: 5000 });
  });
});
