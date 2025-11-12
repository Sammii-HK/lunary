import { Page } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  name: string;
}

function getTestUserEmail(): string {
  // Use TEST_EMAIL if provided, otherwise use a test email (tests can bypass Better Auth)
  const email = process.env.TEST_USER_EMAIL || process.env.TEST_EMAIL;
  if (email) {
    return email;
  }
  // Fallback to a test email - tests can work without Better Auth
  return 'test@test.lunary.app';
}

function getTestUserPassword(): string {
  // Use TEST_PASSWORD if provided, otherwise use a default
  const password = process.env.TEST_USER_PASSWORD || process.env.TEST_PASSWORD;
  if (password) {
    return password;
  }
  // Default test password - tests can work without Better Auth
  return 'TestPassword123!';
}

export const TEST_USERS = {
  get regular() {
    return {
      email: getTestUserEmail(),
      password: getTestUserPassword(),
      name: 'Test User',
    };
  },
  get admin() {
    return {
      email: process.env.ADMIN_EMAIL || 'admin@lunary.app',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      name: 'Admin User',
    };
  },
};

export async function ensureTestUser(
  page: Page,
  user: TestUser,
): Promise<boolean> {
  // Skip Better Auth if TEST_EMAIL is not set - allow tests to run without auth
  const hasTestEmail = !!(
    process.env.TEST_USER_EMAIL || process.env.TEST_EMAIL
  );

  if (!hasTestEmail) {
    console.log(
      `   ⚠️  TEST_EMAIL not set - skipping Better Auth authentication`,
    );
    console.log(
      `   → Tests will run without authentication (bypassing Better Auth)`,
    );
    // Just navigate to home page - tests can work without auth
    await page.goto('http://localhost:3000/', {
      waitUntil: 'domcontentloaded',
    });
    return true;
  }

  // If TEST_EMAIL is set, try to authenticate with Better Auth
  const baseURL = 'http://localhost:3000';

  try {
    console.log(`   → Navigating to auth page...`);
    const response = await page.goto(`${baseURL}/auth`, {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    });

    if (response?.status() !== 200) {
      console.log(`   ✗ Auth page returned status ${response?.status()}`);
      return false;
    }

    // Wait for React hydration (reduced from 3000ms)
    await page
      .waitForLoadState('networkidle', { timeout: 5000 })
      .catch(() => {});
    await page.waitForTimeout(1000);

    // Check if already authenticated
    const url = page.url();
    if (!url.includes('/auth')) {
      console.log(`   → Already authenticated (redirected to ${url})`);
      return true;
    }

    console.log(`   → Looking for auth form elements...`);
    // Find email input
    const emailSelectors = [
      '#email',
      'input[name="email"]',
      'input[type="email"]',
    ];
    let emailInput: ReturnType<typeof page.locator> | null = null;

    for (const selector of emailSelectors) {
      try {
        const input = page.locator(selector).first();
        await input.waitFor({ state: 'visible', timeout: 15000 });
        emailInput = input;
        console.log(`   ✅ Found email input: ${selector}`);
        break;
      } catch {
        continue;
      }
    }

    if (!emailInput) {
      const bodyText = await page.locator('body').textContent();
      console.log(
        `   ✗ Auth form email input not found. Page content: ${bodyText?.substring(0, 500)}`,
      );
      return false;
    }

    // Find password input
    const passwordSelectors = [
      '#password',
      'input[name="password"]',
      'input[type="password"]',
    ];
    let passwordInput: ReturnType<typeof page.locator> | null = null;

    for (const selector of passwordSelectors) {
      try {
        const input = page.locator(selector).first();
        if (await input.isVisible({ timeout: 5000 })) {
          passwordInput = input;
          console.log(`   ✅ Found password input: ${selector}`);
          break;
        }
      } catch {
        continue;
      }
    }

    if (!passwordInput) {
      console.log(`   ✗ Auth form password input not found`);
      return false;
    }

    const submitButton = page.locator('button[type="submit"]').first();

    console.log(`   → Signing in with Better Auth user: ${user.email}`);
    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);

    await submitButton.click();

    // Wait for navigation - user should already exist from global setup
    try {
      await page.waitForURL((url) => !url.pathname.includes('/auth'), {
        timeout: 10000,
      });
      console.log(`   ✅ Sign in successful`);
      return true;
    } catch {
      const newUrl = page.url();
      console.log(`   ✗ Sign in failed (still on ${newUrl})`);
      console.log(`   → User should have been created in global setup`);
      return false;
    }
  } catch (error) {
    console.error(`   ✗ Auth error:`, error);
    return false;
  }
}
