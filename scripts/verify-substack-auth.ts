import { chromium, BrowserContext } from 'playwright';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

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
  } catch (error: any) {
    if (error?.message?.includes('relation "app_config" does not exist')) {
      console.log(
        'ℹ️  Database table not created yet - cookies will be saved on first use',
      );
    } else {
      console.warn('Failed to load cookies from database:', error);
    }
  }
  return null;
}

async function loadCookiesFromFile(): Promise<any[] | null> {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const cookiesFile = path.join(process.cwd(), '.substack-cookies.json');

    if (fs.existsSync(cookiesFile)) {
      const cookiesData = fs.readFileSync(cookiesFile, 'utf-8');
      const cookies = JSON.parse(cookiesData);
      return Array.isArray(cookies) ? cookies : null;
    }
  } catch (error) {
    console.warn('Failed to load cookies from file:', error);
  }
  return null;
}

async function verifyAuth() {
  console.log('🔍 Verifying Substack authentication...\n');

  let cookies: any[] | null = null;

  if (process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL) {
    cookies = await loadCookiesFromDatabase();
    if (cookies) {
      console.log(`✅ Found ${cookies.length} cookies in database`);
    }
  }

  if (!cookies) {
    cookies = await loadCookiesFromFile();
    if (cookies) {
      console.log(`✅ Found ${cookies.length} cookies in file`);
    }
  }

  if (!cookies || cookies.length === 0) {
    console.log('❌ No cookies found!');
    console.log('\n💡 Run the setup script:');
    console.log('   npx tsx scripts/setup-substack-cookies.ts\n');
    process.exit(1);
  }

  console.log('\n🧪 Testing authentication...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  try {
    await context.addCookies(cookies);
    const page = await context.newPage();

    console.log('📡 Navigating to Substack dashboard...');
    await page.goto('https://substack.com/dashboard');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);

    if (currentUrl.includes('/dashboard') || currentUrl.includes('/publish')) {
      console.log('\n✅ Authentication successful! Cookies are working.');
      console.log('   You can now publish to Substack.\n');
    } else if (currentUrl.includes('/sign-in')) {
      console.log('\n❌ Authentication failed - redirected to sign-in page');
      console.log(
        '   Cookies may have expired. Please run the setup script again:\n',
      );
      console.log('   npx tsx scripts/setup-substack-cookies.ts\n');
      process.exit(1);
    } else {
      console.log(`\n⚠️  Unexpected URL: ${currentUrl}`);
      console.log('   Authentication status unclear.\n');
    }
  } catch (error) {
    console.error('❌ Error testing authentication:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyAuth().catch(console.error);
