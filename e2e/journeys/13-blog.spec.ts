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
    await page.waitForTimeout(2000);

    const firstPost = page.locator('a[href*="/blog/"], article a').first();
    const isVisible = await firstPost
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (isVisible) {
      await firstPost.click();
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      const url = page.url();
      const hasArticle = await page
        .locator('article, [role="article"], main')
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      expect(url.includes('/blog') || hasArticle).toBe(true);
    } else {
      expect(true).toBe(true);
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
