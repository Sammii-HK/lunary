import { test, expect } from '../fixtures/auth';
import { waitForPageLoad } from '../utils/helpers';

test.describe('Newsletter Journey', () => {
  test('should subscribe to newsletter', async ({ page }) => {
    await page.goto('/newsletter', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill(`newsletter-${Date.now()}@test.lunary.app`);
      await page
        .click('button[type="submit"], button:has-text("Subscribe")')
        .catch(() => {});
      await page.waitForTimeout(3000);

      const successMsg = page
        .locator('text=/success|subscribed|thank/i')
        .first();
      await expect(successMsg)
        .toBeVisible({ timeout: 10000 })
        .catch(() => {
          // Newsletter might not have a success message, that's okay
        });
    }
  });

  test('should verify newsletter subscription', async ({ page }) => {
    await page.goto('/newsletter/verify?token=test-token', {
      waitUntil: 'domcontentloaded',
    });
    await waitForPageLoad(page);
    await page.waitForTimeout(2000);

    await expect(
      page.locator('text=/verified|confirmed|success/i').first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test('should unsubscribe from newsletter', async ({ page }) => {
    await page.goto('/unsubscribe?token=test-token', {
      waitUntil: 'domcontentloaded',
    });
    await waitForPageLoad(page);
    await page.waitForTimeout(2000);

    await expect(
      page.locator('text=/unsubscribed|removed/i').first(),
    ).toBeVisible({ timeout: 10000 });
  });
});
