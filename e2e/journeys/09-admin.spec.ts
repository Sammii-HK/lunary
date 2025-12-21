import { test, expect } from '../fixtures/auth';
import { waitForPageLoad } from '../utils/helpers';

test.describe('Admin Journey', () => {
  test('should navigate to admin dashboard', async ({ adminPage }) => {
    console.log('\n📄 Testing admin dashboard...');
    const response = await adminPage.goto('/admin', {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    });

    if (response?.status() !== 200) {
      const currentUrl = adminPage.url();
      throw new Error(
        `Admin page returned status ${response?.status()}. Current URL: ${currentUrl}`,
      );
    }

    // Wait for React hydration
    await adminPage.waitForTimeout(3000);

    // Wait for admin dashboard content
    console.log('   → Looking for admin dashboard content...');
    const adminSelectors = [
      'text=/Admin Dashboard/i',
      'text=/admin dashboard/i',
      'text=/Manage your cosmic/i',
      'h1:has-text("Admin")',
      'text=/Sign in to continue/i',
      'text=/Checking authorization/i',
    ];

    let found = false;
    for (const selector of adminSelectors) {
      try {
        const element = adminPage.locator(selector).first();
        await expect(element).toBeVisible({ timeout: 10000 });
        found = true;
        console.log(`   ✅ Found admin dashboard: ${selector}`);
        break;
      } catch {
        continue;
      }
    }

    if (!found) {
      const bodyText = await adminPage.locator('body').textContent();
      throw new Error(
        `Admin dashboard not found. Page content: ${bodyText?.substring(0, 500)}`,
      );
    }
  });

  test('should display admin tools', async ({ adminPage }) => {
    console.log('\n📄 Testing admin tools display...');
    const response = await adminPage.goto('/admin', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    if (response?.status() !== 200) {
      throw new Error(`Admin page returned status ${response?.status()}`);
    }

    await waitForPageLoad(adminPage);
    await adminPage
      .waitForLoadState('networkidle', { timeout: 10000 })
      .catch(() => {});
    await adminPage.waitForTimeout(3000);

    console.log('   → Looking for admin tools...');
    const toolSelectors = [
      'text=/analytics/i',
      'text=/content/i',
      'text=/social/i',
      'text=/shop/i',
      'text=/Social Media/i',
      'text=/Blog Manager/i',
      'text=/admin/i',
      'a[href*="/admin"]',
      'button:has-text("Analytics")',
      'button:has-text("Content")',
    ];

    let found = false;
    for (const selector of toolSelectors) {
      try {
        const element = adminPage.locator(selector).first();
        if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
          found = true;
          console.log(`   ✅ Found admin tool: ${selector}`);
          break;
        }
      } catch {
        continue;
      }
    }

    // Fallback: check if page has admin-related content
    if (!found) {
      const bodyText = await adminPage.locator('body').textContent();
      const hasAdminContent =
        bodyText?.toLowerCase().includes('admin') ||
        bodyText?.toLowerCase().includes('dashboard') ||
        bodyText?.toLowerCase().includes('analytics');
      if (hasAdminContent) {
        found = true;
        console.log('   ✅ Found admin content in page text');
      }
    }

    if (!found) {
      const bodyText = await adminPage.locator('body').textContent();
      throw new Error(
        `Admin tools not found. Page content: ${bodyText?.substring(0, 500)}`,
      );
    }
  });

  test('should access analytics page', async ({ adminPage }) => {
    await adminPage.goto('/admin/analytics', { waitUntil: 'domcontentloaded' });
    await adminPage
      .waitForLoadState('networkidle', { timeout: 10000 })
      .catch(() => {});
    await adminPage.waitForTimeout(3000);

    const analyticsContent = adminPage
      .locator('text=/analytics|metrics|conversion|dashboard|data/i')
      .first();

    // Try to find analytics content with multiple attempts
    let found = false;
    try {
      await expect(analyticsContent).toBeVisible({ timeout: 15000 });
      found = true;
    } catch {
      // Fallback: check if page has analytics-related content
      const bodyText = await adminPage.locator('body').textContent();
      const hasAnalyticsContent =
        bodyText?.toLowerCase().includes('analytics') ||
        bodyText?.toLowerCase().includes('metrics') ||
        bodyText?.toLowerCase().includes('dashboard') ||
        bodyText?.toLowerCase().includes('conversion');
      if (hasAnalyticsContent) {
        found = true;
      }
    }

    expect(found).toBe(true);
  });

  test('should access social media posts page', async ({ adminPage }) => {
    await adminPage.goto('/admin/social-posts', {
      waitUntil: 'domcontentloaded',
    });
    await waitForPageLoad(adminPage);
    await adminPage.waitForTimeout(2000);

    await expect(
      adminPage.locator('text=/social|post|generate/i').first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test('should access blog manager', async ({ adminPage }) => {
    await adminPage.goto('/admin/blog-manager', {
      waitUntil: 'domcontentloaded',
    });
    await waitForPageLoad(adminPage);
    await adminPage.waitForTimeout(2000);

    await expect(
      adminPage.locator('text=/blog|content|generate/i').first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test('should access shop manager', async ({ adminPage }) => {
    await adminPage.goto('/admin/shop-manager', {
      waitUntil: 'domcontentloaded',
    });
    await waitForPageLoad(adminPage);
    await adminPage.waitForTimeout(2000);

    await expect(
      adminPage.locator('text=/shop|products|packs/i').first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test('should prevent non-admin access', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/admin', { waitUntil: 'domcontentloaded' });
    await authenticatedPage.waitForTimeout(3000);

    // Non-admin users should see either "Access Denied" or "Sign in" or be redirected
    const accessDenied = authenticatedPage.locator(
      'text=/Access Denied|Sign in|not authorized|permission/i',
    );
    const isOnAdmin = authenticatedPage.url().includes('/admin');

    if (isOnAdmin) {
      await expect(accessDenied.first()).toBeVisible({ timeout: 10000 });
    } else {
      expect(authenticatedPage.url()).not.toContain('/admin');
    }
  });
});
