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

async function loadExistingCookies(): Promise<any[] | null> {
  if (process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL) {
    try {
      const { sql } = await import('@vercel/postgres');
      const result = await sql`
        SELECT value FROM app_config 
        WHERE key = ${COOKIES_KEY}
        LIMIT 1
      `;
      if (result.rows.length > 0 && result.rows[0].value) {
        return JSON.parse(result.rows[0].value);
      }
    } catch (error) {
      // Table might not exist yet
    }
  }

  if (fs.existsSync(COOKIES_FILE_PATH)) {
    try {
      const cookiesData = fs.readFileSync(COOKIES_FILE_PATH, 'utf-8');
      return JSON.parse(cookiesData);
    } catch (error) {
      // Invalid file
    }
  }

  return null;
}

async function testCookies(cookies: any[]): Promise<boolean> {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    await context.addCookies(cookies);
    const page = await context.newPage();
    await page.goto('https://substack.com/dashboard', {
      waitUntil: 'domcontentloaded',
      timeout: 10000,
    });
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    return (
      currentUrl.includes('/dashboard') ||
      currentUrl.includes('/publish') ||
      (currentUrl.includes('substack.com') && !currentUrl.includes('/sign-in'))
    );
  } catch (error) {
    return false;
  } finally {
    await browser.close();
  }
}

async function setupCookies() {
  console.log('🍪 Substack Cookie Setup\n');

  const existingCookies = await loadExistingCookies();
  if (existingCookies && existingCookies.length > 0) {
    console.log(
      `📦 Found ${existingCookies.length} existing cookies. Testing...`,
    );
    const isValid = await testCookies(existingCookies);
    if (isValid) {
      console.log(
        '✅ Existing cookies are still valid! No need to log in again.\n',
      );
      const uploadToProd = process.argv.includes('--upload-to-prod');
      if (uploadToProd) {
        // Upload existing cookies to prod
        const prodUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';
        const cronSecret = process.env.CRON_SECRET;
        if (cronSecret) {
          try {
            console.log(`📤 Uploading existing cookies to production...`);
            const response = await fetch(
              `${prodUrl}/api/admin/substack/setup-cookies`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${cronSecret}`,
                },
                body: JSON.stringify({ cookies: existingCookies }),
              },
            );

            const responseText = await response.text();

            if (response.ok) {
              console.log('✅ Cookies uploaded to production successfully!');
              try {
                const result = JSON.parse(responseText);
                if (result.message) {
                  console.log(`   ${result.message}`);
                }
              } catch {
                // Response is not JSON, but that's okay if status is OK
              }
            } else {
              let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
              try {
                const errorJson = JSON.parse(responseText);
                errorMessage =
                  errorJson.error || errorJson.details || errorMessage;
              } catch {
                errorMessage = responseText || errorMessage;
              }
              console.warn(`⚠️  Upload failed: ${errorMessage}`);
              console.warn(
                '   Cookies are valid locally, but not uploaded to production.',
              );
              console.warn(
                '   You can manually upload later or check your CRON_SECRET.',
              );
            }
          } catch (error) {
            console.warn(
              `⚠️  Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            console.warn(
              '   Cookies are valid locally, but not uploaded to production.',
            );
            console.warn('   Check your network connection and CRON_SECRET.');
          }
        }
      }
      return;
    } else {
      console.log(
        '⚠️  Existing cookies are expired or invalid. Need to log in again.\n',
      );
    }
  }

  console.log('This script will open a browser for you to log in manually.');
  console.log(
    'After logging in once, cookies will be saved and reused automatically.\n',
  );

  const userDataDir = path.join(process.cwd(), '.playwright-browser');
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = (await context.pages()[0]) || (await context.newPage());

  console.log('🌐 Opening Substack...');
  await page.goto('https://substack.com/dashboard', {
    waitUntil: 'domcontentloaded',
  });

  await page.waitForTimeout(2000);
  const currentUrl = page.url();

  if (currentUrl.includes('/sign-in')) {
    console.log('🔐 Not logged in. Please log in in the browser window...');
    console.log('\n📋 Instructions:');
    console.log('1. Log in to Substack in the browser window that opened');
    console.log('2. Wait until you see the dashboard');
    console.log('3. Come back here and press Enter to save cookies\n');

    await new Promise<void>((resolve) => {
      process.stdin.once('data', () => {
        resolve();
      });
    });

    await page.waitForTimeout(1000);
  } else {
    console.log('✅ Already logged in! Extracting cookies...');
  }

  try {
    const finalUrl = page.url();
    const isLoggedIn =
      finalUrl.includes('/dashboard') ||
      finalUrl.includes('/publish') ||
      (finalUrl.includes('substack.com') && !finalUrl.includes('/sign-in'));

    if (!isLoggedIn) {
      console.error('❌ Error: You must be logged in before saving cookies.');
      console.error(`Current URL: ${finalUrl}`);
      console.error(
        '\n💡 Make sure you completed the login process and are not on the sign-in page.',
      );
      await context.close();
      process.exit(1);
    }

    console.log(`✅ Detected logged-in state at: ${finalUrl}`);

    const cookies = await context.cookies();
    console.log(`📦 Extracted ${cookies.length} cookies`);

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

        const responseText = await response.text();

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          try {
            const errorJson = JSON.parse(responseText);
            errorMessage = errorJson.error || errorJson.details || errorMessage;
          } catch {
            errorMessage = responseText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        let result;
        try {
          result = JSON.parse(responseText);
        } catch {
          result = {
            success: true,
            message: 'Cookies uploaded (no response body)',
          };
        }

        console.log('✅ Cookies uploaded to production successfully!');
        if (result.message) {
          console.log(`   ${result.message}`);
        }
      } catch (error) {
        console.error('❌ Failed to upload to production:', error);
        console.error(
          '   You can manually upload by calling the API endpoint with the cookies.',
        );
        console.error(
          `   curl -X POST ${prodUrl}/api/admin/substack/setup-cookies \\`,
        );
        console.error(
          `     -H "Authorization: Bearer ${cronSecret.substring(0, 10)}..." \\`,
        );
        console.error('     -H "Content-Type: application/json" \\');
        console.error('     -d @.substack-cookies.json');
      }
    }
  } catch (error) {
    console.error('❌ Failed to save cookies:', error);
    process.exit(1);
  } finally {
    await context.close();
  }

  console.log('\n💡 Tip: Cookies are saved in persistent browser context.');
  console.log(
    '   Next time you run this script, it will reuse your session automatically!',
  );
}

setupCookies().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
