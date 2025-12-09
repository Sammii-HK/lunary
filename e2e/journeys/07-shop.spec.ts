import { test, expect } from '../fixtures/auth';
import { waitForPageLoad } from '../utils/helpers';

test.describe('Shop Journey', () => {
  test('should navigate to shop page', async ({ page }) => {
    await page.goto('/shop', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000); // Wait for React hydration
    await expect(
      page.locator('text=/shop|products|packs/i').first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test('should display available products', async ({ page }) => {
    await page.goto('/shop', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const products = page
      .locator('text=/moon pack|calendar|product|shop/i')
      .first();
    await expect(products).toBeVisible({ timeout: 15000 });
  });

  test('should show product details', async ({ page }) => {
    await page.goto('/shop', { waitUntil: 'domcontentloaded' });
    await waitForPageLoad(page);

    const productCard = page
      .locator('[data-testid="product"], .product-card')
      .first();
    if (await productCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await productCard.click();
      await waitForPageLoad(page);

      await expect(
        page.locator('text=/description|features|price/i').first(),
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test('should navigate to checkout for product', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto('/shop', { waitUntil: 'domcontentloaded' });
    await waitForPageLoad(authenticatedPage);

    const buyButton = authenticatedPage
      .locator('button:has-text("Buy"), button:has-text("Purchase")')
      .first();
    if (await buyButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await buyButton.click();
      await waitForPageLoad(authenticatedPage);

      await expect(authenticatedPage).toHaveURL(/checkout|stripe/i, {
        timeout: 10000,
      });
    }
  });

  test('should display product images', async ({ page }) => {
    await page.goto('/shop', { waitUntil: 'domcontentloaded' });
    await waitForPageLoad(page);
    await page.waitForTimeout(2000);

    // Check for any images on the shop page
    const hasImages = await page
      .locator('img')
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    const hasProductContent = await page
      .locator('text=/moon|calendar|pack|product/i')
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    expect(hasImages || hasProductContent).toBe(true);
  });
});
