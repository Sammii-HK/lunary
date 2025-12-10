import { Page } from '@playwright/test';

/**
 * Save authentication state to reuse across tests
 * This speeds up tests by avoiding repeated sign-ins
 */
export async function saveAuthState(
  page: Page,
  filePath: string = 'playwright/.auth/user.json',
) {
  await page.context().storageState({ path: filePath });
}

/**
 * Load saved authentication state
 */
export async function loadAuthState(
  page: Page,
  filePath: string = 'playwright/.auth/user.json',
) {
  // This would be used in playwright.config.ts or test setup
  // For now, we'll rely on fixtures
}

/**
 * Check if user is authenticated by checking for auth cookies or session
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    const cookies = await page.context().cookies();
    const hasAuthCookie = cookies.some(
      (cookie) =>
        cookie.name.includes('auth') ||
        cookie.name.includes('session') ||
        cookie.name.includes('better-auth'),
    );

    if (hasAuthCookie) {
      // Verify by checking if we can access a protected page
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);

      // Check if we're redirected to auth page
      const currentUrl = page.url();
      return !currentUrl.includes('/auth');
    }

    return false;
  } catch (error) {
    return false;
  }
}
