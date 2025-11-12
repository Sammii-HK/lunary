import { test, expect } from '../fixtures/auth';

const isCI = !!process.env.CI;
const log = (message: string) => {
  if (!isCI) console.log(message);
};

// Quick smoke tests for critical paths
test.describe('Smoke Tests @smoke', () => {
  test('homepage loads', async ({ page }) => {
    log('\n📄 Testing homepage...');
    const response = await page.goto('/', {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    });

    if (response?.status() !== 200) {
      throw new Error(`Homepage returned status ${response?.status()}`);
    }

    const body = page.locator('body');
    await expect(body).toBeVisible({ timeout: 10000 });
    log('✅ Homepage loaded successfully');
  });

  test('auth page loads', async ({ page }) => {
    log('\n📄 Testing auth page...');

    const response = await page.goto('/auth', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Check if we got redirected or got a 404
    const currentUrl = page.url();
    const status = response?.status();

    if (status === 404) {
      throw new Error(
        `Auth page returned 404. This usually means the dev server isn't running or the wrong app is on port 3000. Current URL: ${currentUrl}`,
      );
    } else if (status !== 200) {
      throw new Error(
        `Auth page returned status ${status}. Current URL: ${currentUrl}`,
      );
    }

    // Wait for React hydration - AuthComponent uses hooks that need time to initialize
    log('   → Waiting for React hydration and AuthComponent to render...');

    // Wait for the form to be present - this indicates AuthComponent has rendered
    log('   → Looking for auth form...');
    try {
      await page.waitForSelector('form', { timeout: 15000 });
      // Wait for network to be idle instead of fixed timeout
      await page
        .waitForLoadState('networkidle', { timeout: 5000 })
        .catch(() => {});
    } catch (error) {
      // If form not found, check if component is still loading
      const hasLunaryText = await page
        .locator('text=/Lunary/i')
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      if (!hasLunaryText) {
        throw new Error(
          `Auth page form not found and page doesn't appear to have loaded. Current URL: ${currentUrl}`,
        );
      }
    }

    // Try multiple selectors for email input - prioritize #email since that's what AuthComponent uses
    console.log('   → Looking for email input...');
    const emailSelectors = [
      '#email', // Primary selector from AuthComponent
      'input[name="email"]',
      'input[type="email"]',
      'input[placeholder*="email" i]',
    ];

    let emailInputFound = false;
    for (const selector of emailSelectors) {
      try {
        const input = page.locator(selector).first();
        await input.waitFor({ state: 'visible', timeout: 5000 });
        emailInputFound = true;
        console.log(
          `✅ Auth page loaded - found email input with selector: ${selector}`,
        );
        break;
      } catch {
        // Try next selector
        continue;
      }
    }

    if (!emailInputFound) {
      // Get better error info - check if page has loaded properly
      const pageTitle = await page.title();
      const hasLunaryText = await page
        .locator('text=/Lunary/i')
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      const hasForm = await page
        .locator('form')
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      const hasSignInText = await page
        .locator('text=/Sign In|Create Account/i')
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      throw new Error(
        `Auth page loaded but email input not found.\n` +
          `Page title: ${pageTitle}\n` +
          `Has "Lunary" text: ${hasLunaryText}\n` +
          `Has form: ${hasForm}\n` +
          `Has "Sign In" text: ${hasSignInText}\n` +
          `Current URL: ${currentUrl}`,
      );
    }
  });

  test('pricing page loads', async ({ page }) => {
    console.log('\n📄 Testing pricing page...');

    const response = await page.goto('/pricing', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Check if we got redirected or got a 404
    const currentUrl = page.url();
    const status = response?.status();

    if (status === 404) {
      throw new Error(
        `Pricing page returned 404. This usually means the dev server isn't running or the wrong app is on port 3000. Current URL: ${currentUrl}`,
      );
    } else if (status !== 200) {
      throw new Error(
        `Pricing page returned status ${status}. Current URL: ${currentUrl}`,
      );
    }

    // Wait for React hydration (use networkidle instead of fixed timeout)
    await page
      .waitForLoadState('networkidle', { timeout: 5000 })
      .catch(() => {});

    // Look for pricing-related text with multiple fallbacks
    const pricingSelectors = [
      page.getByText(/pricing|Simple|Plan|Subscribe/i).first(),
      page
        .locator('text=/cosmic explorer|cosmic guide|cosmic master/i')
        .first(),
      page.locator('text=/monthly|yearly|free/i').first(),
    ];

    let found = false;
    for (const selector of pricingSelectors) {
      try {
        await expect(selector).toBeVisible({ timeout: 10000 });
        found = true;
        break;
      } catch {
        continue;
      }
    }

    if (!found) {
      throw new Error(
        `Pricing page loaded but pricing content not found. Current URL: ${currentUrl}`,
      );
    }

    console.log('✅ Pricing page loaded successfully');
  });
});
