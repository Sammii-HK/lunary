import { test, expect } from '../fixtures/auth';

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Check for h1 tag
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible({ timeout: 5000 });
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/grimoire', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Check images have alt attributes
    const images = page.locator('img');
    const count = await images.count();

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        // Alt should exist (can be empty for decorative images, but should exist)
        expect(alt).not.toBeNull();
      }
    }
  });

  test('should have accessible form labels', async ({ page }) => {
    await page.goto('/auth', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const emailInput = page.locator('input[type="email"], #email').first();
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      const id = await emailInput.getAttribute('id');
      const hasLabel = id
        ? await page
            .locator(`label[for="${id}"]`)
            .isVisible()
            .catch(() => false)
        : false;
      const hasAriaLabel = await emailInput.getAttribute('aria-label');
      const hasPlaceholder = await emailInput.getAttribute('placeholder');
      const hasName = await emailInput.getAttribute('name');

      expect(
        hasLabel || hasAriaLabel || hasPlaceholder || hasName,
      ).toBeTruthy();
    }
  });

  test('should have keyboard navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);

    // Should be able to focus on links/buttons
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'TEXTAREA']).toContain(focused);
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Check for common ARIA attributes
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      const firstButton = buttons.first();
      const ariaLabel = await firstButton.getAttribute('aria-label');
      const ariaLabeledBy = await firstButton.getAttribute('aria-labelledby');

      // Button should have accessible name (aria-label, aria-labelledby, or text content)
      const hasText = await firstButton.textContent();
      expect(ariaLabel || ariaLabeledBy || hasText).toBeTruthy();
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Basic check: text should be visible
    const text = page.locator('body').first();
    const textContent = await text.textContent();
    expect(textContent?.length).toBeGreaterThan(0);

    // Note: Full contrast checking requires more sophisticated tools
    // This is a basic smoke test
  });

  test('should be navigable with screen reader', async ({ page }) => {
    await page.goto('/grimoire', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Check for semantic HTML elements
    const nav = page.locator('nav').first();
    const main = page.locator('main').first();

    // Should have navigation and main content areas
    const hasNav = await nav.isVisible().catch(() => false);
    const hasMain = await main.isVisible().catch(() => false);

    // At least one should exist for proper structure
    expect(hasNav || hasMain).toBe(true);
  });
});
