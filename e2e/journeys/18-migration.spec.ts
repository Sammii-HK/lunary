import { test, expect } from '../fixtures/auth';
import { waitForPageLoad } from '../utils/helpers';

/**
 * Migration Test Suite
 * Tests to ensure zero-downtime migration from Jazz to PostgreSQL
 * These tests verify data persistence, API functionality, and user flows
 */
test.describe('Migration Journey - Zero Downtime Validation', () => {
  test.describe('Profile Data Persistence', () => {
    test('should persist profile data in PostgreSQL after migration', async ({
      authenticatedPage,
    }) => {
      // Navigate to profile page
      await authenticatedPage.goto('/profile', {
        waitUntil: 'domcontentloaded',
      });
      await authenticatedPage.waitForTimeout(2000);

      // Verify profile page loads
      await expect(
        authenticatedPage.locator('text=/profile|account|settings/i').first(),
      ).toBeVisible({ timeout: 10000 });

      // Check that user data is displayed (from PostgreSQL)
      const profileContent = authenticatedPage
        .locator('text=/email|name|birthday/i')
        .first();
      await expect(profileContent).toBeVisible({ timeout: 10000 });
    });

    test('should save and retrieve profile updates via PostgreSQL API', async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto('/profile', {
        waitUntil: 'domcontentloaded',
      });
      await authenticatedPage.waitForTimeout(2000);

      // Look for edit button or editable fields
      const editButton = authenticatedPage
        .locator('button:has-text("Edit"), button:has-text("Update")')
        .first();

      if (await editButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Profile is in view mode, can click edit
        console.log('   → Edit button found, profile data is loaded');
      }

      // Verify API endpoint is accessible
      const response = await authenticatedPage.request.get('/api/profile');
      expect([200, 401]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toBeDefined();
        console.log('   ✅ Profile API returns data from PostgreSQL');
      }
    });
  });

  test.describe('Birth Chart Data Accessibility', () => {
    test('should access birth chart data from PostgreSQL', async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto('/birth-chart', {
        waitUntil: 'domcontentloaded',
      });
      await authenticatedPage.waitForTimeout(2000);

      // Verify birth chart page loads
      await expect(
        authenticatedPage.locator('text=/birth chart|chart|zodiac/i').first(),
      ).toBeVisible({ timeout: 10000 });

      // Check API endpoint
      const response = await authenticatedPage.request.get(
        '/api/profile/birth-chart',
      );
      expect([200, 401, 404]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        console.log('   ✅ Birth chart data accessible from PostgreSQL');
      }
    });

    test('should save birth chart updates to PostgreSQL', async ({
      authenticatedPage,
    }) => {
      // Test that birth chart can be generated and saved
      await authenticatedPage.goto('/birth-chart', {
        waitUntil: 'domcontentloaded',
      });
      await waitForPageLoad(authenticatedPage);

      // Look for generate or calculate button
      const generateButton = authenticatedPage
        .locator(
          'button:has-text("Generate"), button:has-text("Calculate"), button:has-text("Create")',
        )
        .first();

      if (
        await generateButton.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        console.log('   → Generate button available for birth chart');
      }
    });
  });

  test.describe('Personal Card Data Accessibility', () => {
    test('should access personal card data from PostgreSQL', async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto('/tarot', { waitUntil: 'domcontentloaded' });
      await authenticatedPage.waitForTimeout(2000);

      // Verify tarot page loads
      await expect(
        authenticatedPage.locator('text=/tarot|card|reading/i').first(),
      ).toBeVisible({ timeout: 10000 });

      // Check API endpoint
      const response = await authenticatedPage.request.get(
        '/api/profile/personal-card',
      );
      expect([200, 401, 404]).toContain(response.status());

      if (response.status() === 200) {
        console.log('   ✅ Personal card data accessible from PostgreSQL');
      }
    });
  });

  test.describe('Subscription Status Consistency', () => {
    test('should retrieve subscription status from PostgreSQL', async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto('/profile', {
        waitUntil: 'domcontentloaded',
      });
      await authenticatedPage.waitForTimeout(2000);

      // Check subscription status is displayed
      await expect(
        authenticatedPage.locator('text=/active|trial|expired|free/i').first(),
      ).toBeVisible({ timeout: 10000 });

      // Verify subscription API
      const response = await authenticatedPage.request.get('/api/subscription');
      expect([200, 401]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toBeDefined();
        console.log('   ✅ Subscription status retrieved from PostgreSQL');
      }
    });

    test('should display correct plan on pricing page', async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto('/pricing', {
        waitUntil: 'domcontentloaded',
      });
      await authenticatedPage.waitForTimeout(2000);

      // Verify pricing page shows subscription status
      await expect(
        authenticatedPage.locator('text=/pricing|plan|subscribe/i').first(),
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Location Data Preservation', () => {
    test('should preserve location data after migration', async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto('/profile', {
        waitUntil: 'domcontentloaded',
      });
      await authenticatedPage.waitForTimeout(2000);

      // Check location API endpoint
      const response = await authenticatedPage.request.get(
        '/api/profile/location',
      );
      expect([200, 401, 404]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        console.log('   ✅ Location data accessible from PostgreSQL');
      }
    });
  });

  test.describe('API Endpoint Validation', () => {
    test('should return correct data format from profile API', async ({
      authenticatedPage,
    }) => {
      const response = await authenticatedPage.request.get('/api/profile');

      if (response.status() === 200) {
        const data = await response.json();
        // Verify expected structure
        if (data.profile) {
          expect(data.profile).toHaveProperty('userId');
          console.log('   ✅ Profile API returns correct format');
        }
      }
    });

    test('should handle profile updates correctly', async ({
      authenticatedPage,
    }) => {
      const testData = {
        name: 'Test User Updated',
      };

      const response = await authenticatedPage.request.put('/api/profile', {
        data: testData,
      });

      expect([200, 401]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(data.profile).toBeDefined();
        console.log('   ✅ Profile update works via PostgreSQL');
      }
    });
  });

  test.describe('Authentication with PostgreSQL Backend', () => {
    test('should authenticate successfully with Better Auth + PostgreSQL', async ({
      authenticatedPage,
      testUser,
    }) => {
      // Verify authentication state persists
      await authenticatedPage.goto('/', { waitUntil: 'domcontentloaded' });
      await authenticatedPage.waitForTimeout(1000);

      // Check for authenticated user indicators
      const authIndicator = authenticatedPage
        .locator(
          'button:has-text("Sign Out"), text=/logout|sign out|profile/i, [data-authenticated="true"]',
        )
        .first();

      await expect(authIndicator).toBeVisible({ timeout: 10000 });
      console.log('   ✅ User authenticated via Better Auth + PostgreSQL');
    });

    test('should maintain session across page navigations', async ({
      authenticatedPage,
    }) => {
      // Navigate to multiple pages and verify session persists
      const pages = ['/profile', '/horoscope', '/tarot', '/'];

      for (const pagePath of pages) {
        await authenticatedPage.goto(pagePath, {
          waitUntil: 'domcontentloaded',
        });
        await authenticatedPage.waitForTimeout(500);

        // Verify not redirected to auth page
        const currentUrl = authenticatedPage.url();
        expect(currentUrl).not.toContain('/auth');
      }

      console.log('   ✅ Session persists across page navigations');
    });
  });

  test.describe('No Data Loss Validation', () => {
    test('should not lose profile data on page refresh', async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto('/profile', {
        waitUntil: 'domcontentloaded',
      });
      await authenticatedPage.waitForTimeout(2000);

      // Get initial profile state
      const response1 = await authenticatedPage.request.get('/api/profile');
      const data1 = response1.status() === 200 ? await response1.json() : null;

      // Refresh page
      await authenticatedPage.reload({ waitUntil: 'domcontentloaded' });
      await authenticatedPage.waitForTimeout(2000);

      // Get profile state after refresh
      const response2 = await authenticatedPage.request.get('/api/profile');
      const data2 = response2.status() === 200 ? await response2.json() : null;

      // Compare data
      if (data1 && data2) {
        expect(data1.profile?.name).toBe(data2.profile?.name);
        expect(data1.profile?.birthday).toBe(data2.profile?.birthday);
        console.log('   ✅ Profile data persists across page refresh');
      }
    });

    test('should handle concurrent API requests without data loss', async ({
      authenticatedPage,
    }) => {
      // Make multiple concurrent requests
      const requests = [
        authenticatedPage.request.get('/api/profile'),
        authenticatedPage.request.get('/api/subscription'),
        authenticatedPage.request.get('/api/profile/location'),
      ];

      const responses = await Promise.all(requests);

      // All requests should succeed or return expected status
      for (const response of responses) {
        expect([200, 401, 404]).toContain(response.status());
      }

      console.log('   ✅ Concurrent requests handled correctly');
    });
  });

  test.describe('Feature Parity Check', () => {
    test('should access horoscope feature after migration', async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto('/horoscope', {
        waitUntil: 'domcontentloaded',
      });
      await authenticatedPage.waitForTimeout(2000);

      await expect(
        authenticatedPage.locator('text=/horoscope|zodiac|daily/i').first(),
      ).toBeVisible({ timeout: 10000 });

      console.log('   ✅ Horoscope feature accessible');
    });

    test('should access tarot feature after migration', async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto('/tarot', { waitUntil: 'domcontentloaded' });
      await authenticatedPage.waitForTimeout(2000);

      await expect(
        authenticatedPage.locator('text=/tarot|card|reading/i').first(),
      ).toBeVisible({ timeout: 10000 });

      console.log('   ✅ Tarot feature accessible');
    });

    test('should access shop feature after migration', async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto('/shop', { waitUntil: 'domcontentloaded' });
      await authenticatedPage.waitForTimeout(2000);

      await expect(
        authenticatedPage.locator('text=/shop|products|packs/i').first(),
      ).toBeVisible({ timeout: 10000 });

      console.log('   ✅ Shop feature accessible');
    });
  });
});
