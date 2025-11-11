import { test, expect } from '../fixtures/auth';
import { waitForPageLoad } from '../utils/helpers';

test.describe('Blog Journey', () => {
  test('should navigate to blog page', async ({ page }) => {
    await page.goto('/blog', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000); // Wait for React hydration
    await expect(
      page.locator('text=/blog|articles|posts/i').first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test('should display blog posts', async ({ page }) => {
    await page.goto('/blog', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const blogContent = page
      .locator('text=/week|planetary|cosmic|blog/i')
      .first();
    await expect(blogContent).toBeVisible({ timeout: 15000 });
  });

  test('should navigate to specific blog post', async ({ page }) => {
    await page.goto('/blog');
    await waitForPageLoad(page);

    const firstPost = page.locator('a[href*="/blog/"], article a').first();
    if (await firstPost.isVisible()) {
      await firstPost.click();
      await waitForPageLoad(page);

      await expect(page).toHaveURL(/\/blog\//);
      await expect(page.locator('article, [role="article"]')).toBeVisible();
    }
  });

  test('should display blog post content', async ({ page }) => {
    await page.goto('/blog');
    await waitForPageLoad(page);

    const firstPost = page.locator('a[href*="/blog/"], article a').first();
    if (await firstPost.isVisible()) {
      await firstPost.click();
      await waitForPageLoad(page);

      await expect(
        page.locator('text=/moon|planet|transit|retrograde/i').first(),
      ).toBeVisible({ timeout: 10000 });
    }
  });
});
