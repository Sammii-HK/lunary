import { test, expect } from '../fixtures/auth';
import { navigateToSection, waitForPageLoad } from '../utils/helpers';

test.describe('Grimoire Journey', () => {
  test('should display grimoire page and navigate sections', async ({
    page,
  }) => {
    await test.step('Navigate to grimoire', async () => {
      await page.goto('/grimoire', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000); // Wait for React hydration

      // Use heading instead of generic text to avoid matching title tag
      await expect(
        page.getByRole('heading', { name: /grimoire|welcome/i }).first(),
      ).toBeVisible({ timeout: 10000 });
      await expect(
        page.locator('text=/moon|crystals|tarot|spells|chakras/i').first(),
      ).toBeVisible({ timeout: 5000 });
    });

    await test.step('Navigate to moon section', async () => {
      const moonLink = page.locator('text=Moon').first();
      if (await moonLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await moonLink.click();
        await page.waitForTimeout(2000);
        await expect(page.locator('text=/moon|phase/i').first()).toBeVisible({
          timeout: 10000,
        });
      }
    });

    await test.step('Navigate to crystals section', async () => {
      await page.goto('/grimoire', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      await navigateToSection(page, 'Crystals');
      await expect(
        page.locator('text=/crystal|stone|healing/i').first(),
      ).toBeVisible({ timeout: 10000 });
    });

    await test.step('Display crystal database and search', async () => {
      await page.goto('/grimoire/crystals', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      await expect(
        page.locator('text=/quartz|amethyst|rose/i').first(),
      ).toBeVisible({ timeout: 10000 });

      const searchInput = page
        .locator('input[type="search"], input[placeholder*="search" i]')
        .first();
      if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await searchInput.fill('rose');
        await page
          .waitForLoadState('networkidle', { timeout: 5000 })
          .catch(() => {});
        await expect(page.locator('text=/rose/i').first()).toBeVisible({
          timeout: 5000,
        });
      }
    });

    await test.step('Navigate to spells section', async () => {
      await page.goto('/grimoire', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      await navigateToSection(page, 'Spells');
      await expect(
        page.locator('text=/spell|ritual|magic/i').first(),
      ).toBeVisible({ timeout: 10000 });
    });

    await test.step('Navigate to tarot section', async () => {
      await page.goto('/grimoire', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      await navigateToSection(page, 'Tarot');
      await expect(
        page.locator('text=/major arcana|minor arcana|card/i').first(),
      ).toBeVisible({ timeout: 10000 });
    });
  });
});
