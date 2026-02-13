import { test, expect } from '../fixtures/auth';
import { TEST_USERS } from '../fixtures/test-users';

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
      timeout: 60000,
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
      page.locator('text=/Lunary Free|Lunary\\+|monthly|yearly/i').first(),
      page.locator('text=/free|trial|premium/i').first(),
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

  // Critical regression test: users who signed up with age gate (birthday
  // collected at signup) but have no birth chart yet must NOT have onboarding
  // silently skipped. The app must either show onboarding or trigger
  // auto-generation via UserContext.
  test('authenticated user with birthday but no chart triggers generation', async ({
    browser,
    baseURL,
  }) => {
    log('\n📄 Testing birthday-only user chart generation...');
    const testBaseURL = baseURL || 'http://localhost:3000';

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });

    // Track whether the generate endpoint was called
    let generateCalled = false;

    await context.route('**/api/auth/get-session', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          session: {
            id: 'test-session-birthday-only',
            userId: 'test-user-birthday-only',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
          user: {
            id: 'test-user-birthday-only',
            email: TEST_USERS.regular.email,
            name: TEST_USERS.regular.name,
            emailVerified: true,
          },
        }),
      });
    });

    await context.route('**/api/subscription', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'trial',
            plan: 'monthly',
            planType: 'monthly',
          }),
        });
      } else {
        route.continue();
      }
    });

    // Profile returns birthday but NO birth chart — simulates age gate signup
    await context.route('**/api/profile', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            profile: {
              userId: 'test-user-birthday-only',
              name: TEST_USERS.regular.name,
              email: TEST_USERS.regular.email,
              birthday: '1990-01-15',
              birthChart: null,
              location: {},
            },
            subscription: {
              status: 'trial',
              planType: 'monthly',
            },
          }),
        });
      } else {
        route.continue();
      }
    });

    // Intercept birth chart generation endpoint
    await context.route('**/api/profile/birth-chart/generate', (route) => {
      generateCalled = true;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // Mock onboarding status as not completed
    await context.route('**/api/onboarding/complete', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ completed: false, skipped: false }),
        });
      } else {
        route.continue();
      }
    });

    // Block heavy resources for speed
    await context.route('**/*', (route) => {
      const resourceType = route.request().resourceType();
      if (['image', 'font', 'media'].includes(resourceType)) {
        route.abort();
        return;
      }
      route.continue();
    });

    const page = await context.newPage();

    await page.addInitScript(() => {
      (window as any).__PLAYWRIGHT_AUTHENTICATED__ = true;
    });

    await page.goto(`${testBaseURL}/`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Wait for React hydration and UserContext to process
    await page
      .waitForLoadState('networkidle', { timeout: 10000 })
      .catch(() => {});

    // Either onboarding should show OR UserContext auto-generation should fire.
    // Check for onboarding visibility first.
    const onboardingVisible = await page
      .locator('text=/When Were You Born|Refine Your Birth Chart|Get Started/i')
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    // At least one must be true: onboarding shown or generate endpoint called
    const chartGenerationTriggered = onboardingVisible || generateCalled;

    if (!chartGenerationTriggered) {
      throw new Error(
        'CRITICAL: User with birthday but no birth chart did not trigger onboarding or chart generation. ' +
          'This means the age gate signup bug has regressed.',
      );
    }

    log(
      `✅ Birthday-only user handled correctly (onboarding: ${onboardingVisible}, generate called: ${generateCalled})`,
    );

    await page.close();
    await context.close();
  });
});
