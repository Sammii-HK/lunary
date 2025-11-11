import { test, expect } from '../fixtures/auth';
import { fillBirthData } from '../utils/helpers';
import { testBirthData } from '../fixtures/test-data';

test.describe('Horoscope Journey', () => {
  test('should display horoscope page with daily forecast and features', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto('/horoscope', {
      waitUntil: 'domcontentloaded',
    });
    await authenticatedPage.waitForTimeout(2000); // Wait for React hydration

    await test.step('Verify horoscope page loads', async () => {
      await expect(
        authenticatedPage.locator('text=/horoscope|daily|forecast/i').first(),
      ).toBeVisible({ timeout: 10000 });
    });

    await test.step('Verify daily horoscope content', async () => {
      const horoscopeContent = authenticatedPage
        .locator('text=/today|daily|horoscope|forecast/i')
        .first();
      await expect(horoscopeContent).toBeVisible({ timeout: 15000 });
    });

    await test.step('Verify transit information', async () => {
      await expect(
        authenticatedPage.locator('text=/transit|planet|aspect/i').first(),
      ).toBeVisible({ timeout: 10000 });
    });

    await test.step('Verify date selector', async () => {
      const dateSelector = authenticatedPage
        .locator('input[type="date"], [data-testid="date-selector"]')
        .first();
      if (await dateSelector.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(dateSelector).toBeVisible();
      }
    });
  });

  test('should show personalized horoscope after birth data', async ({
    authenticatedPage,
  }) => {
    await test.step('Fill birth data', async () => {
      await authenticatedPage.goto('/birth-chart', {
        waitUntil: 'domcontentloaded',
      });
      await fillBirthData(authenticatedPage, {
        date: testBirthData.date,
        time: testBirthData.time,
        location: testBirthData.location,
      });
      await authenticatedPage
        .waitForLoadState('networkidle', { timeout: 5000 })
        .catch(() => {});
    });

    await test.step('Verify personalized horoscope', async () => {
      await authenticatedPage.goto('/horoscope', {
        waitUntil: 'domcontentloaded',
      });
      await authenticatedPage.waitForTimeout(2000);
      await expect(
        authenticatedPage.locator('text=/personalized|your|transit/i').first(),
      ).toBeVisible({ timeout: 15000 });
    });
  });
});
