import { chromium, Browser, Page } from 'playwright';
import { SUBSTACK_CONFIG } from '../../src/config/substack';
import { SubstackPost } from './contentFormatter';

export interface PublishResult {
  success: boolean;
  postUrl?: string;
  error?: string;
  tier: 'free' | 'paid';
}

export async function publishToSubstack(
  post: SubstackPost,
  tier: 'free' | 'paid',
): Promise<PublishResult> {
  if (
    !SUBSTACK_CONFIG.email ||
    !SUBSTACK_CONFIG.password ||
    !SUBSTACK_CONFIG.publicationUrl
  ) {
    return {
      success: false,
      error: 'Substack credentials not configured',
      tier,
    };
  }

  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();

    console.log(`🔐 Logging into Substack...`);
    await page.goto('https://substack.com/sign-in');

    await page.fill('input[type="email"]', SUBSTACK_CONFIG.email);
    await page.fill('input[type="password"]', SUBSTACK_CONFIG.password);
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard**', { timeout: 30000 });

    console.log(`✅ Logged in successfully`);

    const publicationUrl = SUBSTACK_CONFIG.publicationUrl;
    await page.goto(`${publicationUrl}/publish`);

    console.log(`📝 Creating new post...`);

    await page.waitForSelector(
      'textarea[placeholder*="title"], input[placeholder*="title"]',
      {
        timeout: 10000,
      },
    );

    await page.fill(
      'textarea[placeholder*="title"], input[placeholder*="title"]',
      post.title,
    );

    if (post.subtitle) {
      const subtitleSelector =
        'textarea[placeholder*="subtitle"], input[placeholder*="subtitle"]';
      const subtitleExists = await page.$(subtitleSelector);
      if (subtitleExists) {
        await page.fill(subtitleSelector, post.subtitle);
      }
    }

    const contentArea = await page.$(
      'div[contenteditable="true"], textarea[placeholder*="content"], .editor-content',
    );
    if (contentArea) {
      await contentArea.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.type(post.content);
    } else {
      const contentSelector =
        'textarea[placeholder*="Write your post"], .editor';
      await page.fill(contentSelector, post.content);
    }

    if (tier === 'paid') {
      const paidToggle = await page.$(
        'input[type="checkbox"][name*="paid"], .paid-toggle',
      );
      if (paidToggle) {
        const isChecked = await paidToggle.isChecked();
        if (!isChecked) {
          await paidToggle.click();
        }
      }
    }

    console.log(`💾 Saving draft...`);
    const saveButton = await page.$(
      'button:has-text("Save"), button:has-text("Publish")',
    );
    if (saveButton) {
      await saveButton.click();
      await page.waitForTimeout(2000);
    }

    const publishButton = await page.$(
      'button:has-text("Publish"), button:has-text("Publish now")',
    );
    if (publishButton) {
      console.log(`🚀 Publishing post...`);
      await publishButton.click();
      await page.waitForTimeout(3000);

      const currentUrl = page.url();
      if (currentUrl.includes('/p/')) {
        return {
          success: true,
          postUrl: currentUrl,
          tier,
        };
      }
    }

    return {
      success: true,
      postUrl: page.url(),
      tier,
    };
  } catch (error) {
    console.error('Error publishing to Substack:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      tier,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export async function publishBothTiers(
  freePost: SubstackPost,
  paidPost: SubstackPost,
): Promise<{ free: PublishResult; paid: PublishResult }> {
  console.log('📬 Publishing both free and paid posts to Substack...');

  const [freeResult, paidResult] = await Promise.all([
    publishToSubstack(freePost, 'free'),
    publishToSubstack(paidPost, 'paid'),
  ]);

  return {
    free: freeResult,
    paid: paidResult,
  };
}
