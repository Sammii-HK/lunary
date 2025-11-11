import { test, expect } from '../fixtures/auth';
import { signUp, fillBirthData, waitForPageLoad } from '../utils/helpers';
import { testBirthData } from '../fixtures/test-data';

test.describe('Complete User Flow - Video Walkthrough', () => {
  test('complete onboarding and feature exploration', async ({ page }) => {
    const email = `walkthrough-${Date.now()}@test.lunary.app`;
    const password = 'TestPassword123!';

    await test.step('1. Sign Up', async () => {
      await signUp(page, email, password);
      await page.waitForTimeout(2000);
      const url = page.url();
      expect(url).not.toContain('/auth');
    });

    await test.step('2. Birth Chart Creation', async () => {
      await page.goto('/birth-chart', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const dateInput = page.locator('input[type="date"]').first();
      if (await dateInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await fillBirthData(page, {
          date: testBirthData.date,
          time: testBirthData.time,
          location: testBirthData.location,
        });
        await page.waitForTimeout(5000);
      }

      const chartContent = page.locator('text=/sun|moon|planet/i').first();
      await expect(chartContent).toBeVisible({ timeout: 10000 });
    });

    await test.step('3. View Horoscope', async () => {
      await page.goto('/horoscope', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      await expect(page.locator('text=/horoscope|daily/i').first()).toBeVisible(
        { timeout: 10000 },
      );
    });

    await test.step('4. Draw Tarot Card', async () => {
      await page.goto('/tarot', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      await expect(
        page.locator('img[alt*="tarot"], text=/tarot/i').first(),
      ).toBeVisible({ timeout: 10000 });
    });

    await test.step('5. Explore Grimoire', async () => {
      await page.goto('/grimoire', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('text=/grimoire|magic/i').first()).toBeVisible({
        timeout: 5000,
      });
    });

    await test.step('6. View Shop', async () => {
      await page.goto('/shop', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      await expect(page.locator('text=/shop|product/i').first()).toBeVisible({
        timeout: 10000,
      });
    });

    await test.step('7. Check Pricing', async () => {
      await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('text=/pricing|plan/i').first()).toBeVisible({
        timeout: 5000,
      });
    });
  });
});
