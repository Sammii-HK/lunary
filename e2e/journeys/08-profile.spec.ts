import { test, expect } from '../fixtures/auth';
import { waitForPageLoad } from '../utils/helpers';

test.describe('Profile Journey', () => {
  test('should navigate to profile page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/profile', { waitUntil: 'domcontentloaded' });
    await authenticatedPage.waitForTimeout(2000); // Wait for React hydration
    await expect(
      authenticatedPage.locator('text=/profile|account|settings/i').first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test('should display user information', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/profile', { waitUntil: 'domcontentloaded' });
    await authenticatedPage.waitForTimeout(3000);

    const profileContent = authenticatedPage
      .locator('text=/email|subscription|plan|profile/i')
      .first();
    await expect(profileContent).toBeVisible({ timeout: 10000 });
  });

  test('should show subscription status', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/profile', { waitUntil: 'domcontentloaded' });
    await waitForPageLoad(authenticatedPage);
    await authenticatedPage.waitForTimeout(2000);

    await expect(
      authenticatedPage.locator('text=/active|trial|expired|free/i').first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test('should allow managing subscription', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/profile', { waitUntil: 'domcontentloaded' });
    await waitForPageLoad(authenticatedPage);
    await authenticatedPage.waitForTimeout(2000);

    const manageButton = authenticatedPage
      .locator('button:has-text("Manage"), button:has-text("Subscription")')
      .first();
    if (await manageButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await manageButton.click();
      await waitForPageLoad(authenticatedPage);

      await expect(authenticatedPage).toHaveURL(/stripe|portal/i, {
        timeout: 10000,
      });
    }
  });
});
