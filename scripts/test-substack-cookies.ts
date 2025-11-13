import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function testCookies() {
  console.log('🔍 Checking Substack cookies...\n');

  const COOKIES_KEY = 'substack_auth_cookies';

  if (process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL) {
    try {
      const { sql } = await import('@vercel/postgres');

      const result = await sql`
        SELECT value, updated_at FROM app_config 
        WHERE key = ${COOKIES_KEY}
        LIMIT 1
      `;

      if (result.rows.length > 0) {
        const cookies = JSON.parse(result.rows[0].value);
        console.log('✅ Cookies found in database!');
        console.log(`   Cookie count: ${cookies.length}`);
        console.log(`   Last updated: ${result.rows[0].updated_at}`);
        console.log(`   First cookie domain: ${cookies[0]?.domain || 'N/A'}`);
        return;
      } else {
        console.log('❌ No cookies found in database');
      }
    } catch (error) {
      console.error('❌ Error checking database:', error);
    }
  } else {
    console.log('⚠️  No POSTGRES_URL found, checking file system...');
  }

  const fs = await import('fs');
  const path = await import('path');
  const cookiesFile = path.join(process.cwd(), '.substack-cookies.json');

  if (fs.existsSync(cookiesFile)) {
    const cookiesData = fs.readFileSync(cookiesFile, 'utf-8');
    const cookies = JSON.parse(cookiesData);
    console.log('✅ Cookies found in file!');
    console.log(`   Cookie count: ${cookies.length}`);
    console.log(`   File path: ${cookiesFile}`);
  } else {
    console.log('❌ No cookies file found');
    console.log('\n💡 Run: npx tsx scripts/setup-substack-cookies.ts');
  }
}

testCookies().catch(console.error);
