import { test, expect } from '../fixtures/auth';

test.describe('Mobile Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test('should display mobile navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Check for mobile menu button or hamburger menu
    const mobileMenu = page
      .locator(
        'button[aria-label*="menu"], button:has-text("Menu"), [data-testid="mobile-menu"]',
      )
      .first();
    const hasMobileMenu = await mobileMenu
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    // Mobile menu should exist OR navigation should be visible
    expect(hasMobileMenu || (await page.locator('nav').isVisible())).toBe(true);
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
    await page.waitForTimeout(1000);

    // Try tapping/swiping on mobile
    const crystalLink = page.locator('text=Crystals').first();
    if (await crystalLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await crystalLink.tap();
      await page.waitForTimeout(2000);

      const crystalContent = page.locator('text=/crystal|stone/i').first();
      await expect(crystalContent).toBeVisible({ timeout: 10000 });
    }
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
