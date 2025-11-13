import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { SUBSTACK_CONFIG } from '../../src/config/substack';
import { SubstackPost } from './contentFormatter';
import * as fs from 'fs';
import * as path from 'path';

export interface PublishResult {
  success: boolean;
  postUrl?: string;
  error?: string;
  tier: 'free' | 'paid';
}

const COOKIES_FILE_PATH = path.join(process.cwd(), '.substack-cookies.json');
const COOKIES_KEY = 'substack_auth_cookies';

async function loadCookiesFromDatabase(): Promise<any[] | null> {
  try {
    const { sql } = await import('@vercel/postgres');

    const result = await sql`
      SELECT value FROM app_config 
      WHERE key = ${COOKIES_KEY}
      LIMIT 1
    `;

    if (result.rows.length > 0 && result.rows[0].value) {
      const cookies = JSON.parse(result.rows[0].value);
      return Array.isArray(cookies) ? cookies : null;
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('relation "app_config" does not exist')
    ) {
      console.warn(
        'app_config table does not exist, will create it on first save',
      );
    } else {
      console.warn('Failed to load cookies from database:', error);
    }
  }
  return null;
}

async function saveCookiesToDatabase(cookies: any[]): Promise<void> {
  try {
    const { sql } = await import('@vercel/postgres');

    await sql`
      CREATE TABLE IF NOT EXISTS app_config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
      INSERT INTO app_config (key, value, updated_at)
      VALUES (${COOKIES_KEY}, ${JSON.stringify(cookies)}, NOW())
      ON CONFLICT (key) 
      DO UPDATE SET value = ${JSON.stringify(cookies)}, updated_at = NOW()
    `;

    console.log(`✅ Cookies saved to database`);
  } catch (error) {
    console.error('Failed to save cookies to database:', error);
    throw error;
  }
}

async function loadCookiesFromFile(): Promise<any[] | null> {
  try {
    if (fs.existsSync(COOKIES_FILE_PATH)) {
      const cookiesData = fs.readFileSync(COOKIES_FILE_PATH, 'utf-8');
      const cookies = JSON.parse(cookiesData);
      return Array.isArray(cookies) ? cookies : null;
    }
  } catch (error) {
    console.warn('Failed to load cookies from file:', error);
  }
  return null;
}

async function saveCookiesToFile(cookies: any[]): Promise<void> {
  try {
    fs.writeFileSync(COOKIES_FILE_PATH, JSON.stringify(cookies, null, 2));
    console.log(`✅ Cookies saved to ${COOKIES_FILE_PATH}`);
  } catch (error) {
    console.error('Failed to save cookies to file:', error);
  }
}

async function loadCookies(): Promise<any[] | null> {
  if (process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL) {
    const dbCookies = await loadCookiesFromDatabase();
    if (dbCookies) return dbCookies;
  }

  const fileCookies = await loadCookiesFromFile();
  if (fileCookies) return fileCookies;

  return null;
}

async function saveCookies(context: BrowserContext): Promise<void> {
  const cookies = await context.cookies();

  if (process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL) {
    try {
      await saveCookiesToDatabase(cookies);
      return;
    } catch (error) {
      console.warn('Database save failed, falling back to file:', error);
    }
  }

  await saveCookiesToFile(cookies);
}

async function authenticateWithCookies(
  context: BrowserContext,
  page: Page,
): Promise<boolean> {
  const cookies = await loadCookies();
  if (!cookies || cookies.length === 0) {
    return false;
  }

  try {
    await context.addCookies(cookies);
    await page.goto('https://substack.com/dashboard');
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard') || currentUrl.includes('/publish')) {
      console.log(`✅ Authenticated using saved cookies`);
      return true;
    }
  } catch (error) {
    console.warn('Cookie authentication failed:', error);
  }

  return false;
}

async function authenticateWithCredentials(page: Page): Promise<boolean> {
  if (!SUBSTACK_CONFIG.email || !SUBSTACK_CONFIG.password) {
    return false;
  }

  try {
    console.log(`🔐 Logging into Substack with credentials...`);
    await page.goto('https://substack.com/sign-in');

    await page.fill('input[type="email"]', SUBSTACK_CONFIG.email);
    await page.fill('input[type="password"]', SUBSTACK_CONFIG.password);
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard**', { timeout: 30000 });
    console.log(`✅ Logged in successfully with credentials`);
    return true;
  } catch (error) {
    console.error('Credential authentication failed:', error);
    return false;
  }
}

export async function publishToSubstack(
  post: SubstackPost,
  tier: 'free' | 'paid',
): Promise<PublishResult> {
  if (!SUBSTACK_CONFIG.publicationUrl) {
    return {
      success: false,
      error: 'Substack publication URL not configured',
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

    const authenticatedWithCookies = await authenticateWithCookies(
      context,
      page,
    );

    if (!authenticatedWithCookies) {
      const authenticatedWithCredentials =
        await authenticateWithCredentials(page);
      if (!authenticatedWithCredentials) {
        return {
          success: false,
          error:
            'Failed to authenticate. Please run the cookie setup script or configure email/password.',
          tier,
        };
      }
      await saveCookies(context);
    }

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
