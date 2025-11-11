import { test, expect } from '../fixtures/auth';

test.describe('Tarot Journey', () => {
  test('should display tarot page with card and interpretation', async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto('/tarot', { waitUntil: 'domcontentloaded' });
    await authenticatedPage.waitForTimeout(2000); // Wait for React hydration

    await test.step('Verify tarot page loads', async () => {
      // Use heading instead of generic text to avoid matching title tag
      await expect(
        authenticatedPage
          .getByRole('heading', { name: /tarot|reading/i })
          .first(),
      ).toBeVisible({ timeout: 10000 });
    });

    await test.step('Verify tarot card displays', async () => {
      const tarotCard = authenticatedPage
        .locator('img[alt*="tarot"], img[alt*="card"]')
        .first();
      await expect(tarotCard).toBeVisible({ timeout: 15000 });
    });

    await test.step('Verify card interpretation', async () => {
      await expect(
        authenticatedPage
          .locator('text=/meaning|interpretation|guidance/i')
          .first(),
      ).toBeVisible({ timeout: 10000 });
    });

    await test.step('Verify personalized content', async () => {
      await expect(
        authenticatedPage.locator('text=/personal|your|birth chart/i').first(),
      ).toBeVisible({ timeout: 10000 });
    });

    await test.step('Test drawing new card', async () => {
      const drawButton = authenticatedPage
        .locator(
          'button:has-text("Draw"), button:has-text("New Card"), button:has-text("Shuffle")',
        )
        .first();
      if (await drawButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await drawButton.click();
        await authenticatedPage
          .waitForLoadState('networkidle', { timeout: 5000 })
          .catch(() => {});
        await expect(
          authenticatedPage
            .locator('img[alt*="tarot"], [data-testid="tarot-card"]')
            .first(),
        ).toBeVisible({ timeout: 5000 });
      }
    });
  });
});
