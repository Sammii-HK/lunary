import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

config({ path: path.join(process.cwd(), '.env.local') });
config({ path: path.join(process.cwd(), '.env') });

const COOKIES_FILE_PATH = path.join(process.cwd(), '.substack-cookies.json');
const COOKIES_KEY = 'substack_auth_cookies';

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
    return;
  } catch (error) {
    console.warn('Database save failed, falling back to file:', error);
    throw error;
  }
}

async function saveCookiesToFile(cookies: any[]): Promise<void> {
  fs.writeFileSync(COOKIES_FILE_PATH, JSON.stringify(cookies, null, 2));
  console.log(`✅ Cookies saved to ${COOKIES_FILE_PATH}`);
}

async function setupCookies() {
  console.log('🍪 Substack Cookie Setup');
  console.log('This script will open a browser for you to log in manually.');
  console.log('After logging in, the cookies will be saved for future use.\n');

  const browser = await chromium.launch({ headless: false });

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  console.log('🌐 Opening Substack login page...');
  await page.goto('https://substack.com/sign-in');

  console.log('\n📋 Instructions:');
  console.log('1. Log in to Substack in the browser window that opened');
  console.log('2. Wait until you see the dashboard');
  console.log('3. Come back here and press Enter to save cookies\n');

  await new Promise<void>((resolve) => {
    process.stdin.once('data', () => {
      resolve();
    });
  });

  try {
    const currentUrl = page.url();
    const isLoggedIn =
      currentUrl.includes('/dashboard') ||
      currentUrl.includes('/publish') ||
      (currentUrl.includes('substack.com') && !currentUrl.includes('/sign-in'));

    if (!isLoggedIn) {
      console.error('❌ Error: You must be logged in before saving cookies.');
      console.error(`Current URL: ${currentUrl}`);
      console.error(
        '\n💡 Make sure you completed the login process and are not on the sign-in page.',
      );
      await browser.close();
      process.exit(1);
    }

    console.log(`✅ Detected logged-in state at: ${currentUrl}`);

    const cookies = await context.cookies();

    if (process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL) {
      try {
        await saveCookiesToDatabase(cookies);
        console.log('\n✅ Success! Cookies saved to database');
        console.log(
          'You can now use cookie-based authentication for publishing.\n',
        );
      } catch (error) {
        console.warn(
          '⚠️  Could not save to database, saving to file instead...',
        );
        await saveCookiesToFile(cookies);
        console.log('\n✅ Success! Cookies saved to file');
        console.log(
          'You can now use cookie-based authentication for publishing.\n',
        );
      }
    } else {
      await saveCookiesToFile(cookies);
      console.log('\n✅ Success! Cookies saved to file');
      console.log(
        'You can now use cookie-based authentication for publishing.\n',
      );
    }

    const uploadToProd = process.argv.includes('--upload-to-prod');
    if (uploadToProd) {
      const prodUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';
      const cronSecret = process.env.CRON_SECRET;

      if (!cronSecret) {
        console.warn(
          '\n⚠️  CRON_SECRET not found. Cannot upload to production.',
        );
        console.warn(
          '   Set CRON_SECRET in your .env.local to enable production upload.',
        );
        return;
      }

      try {
        console.log(`\n📤 Uploading cookies to production (${prodUrl})...`);
        const response = await fetch(
          `${prodUrl}/api/admin/substack/setup-cookies`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${cronSecret}`,
            },
            body: JSON.stringify({ cookies }),
          },
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        console.log('✅ Cookies uploaded to production successfully!');
      } catch (error) {
        console.error('❌ Failed to upload to production:', error);
        console.error(
          '   You can manually upload by calling the API endpoint with the cookies.',
        );
      }
    }
  } catch (error) {
    console.error('❌ Failed to save cookies:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

setupCookies().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
