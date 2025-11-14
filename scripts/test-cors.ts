#!/usr/bin/env tsx

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

const testOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://lunary.app',
  'https://www.lunary.app',
  'https://test-sammiis-projects.vercel.app',
  'https://lunary-git-branch-test-b098c4-sammiis-projects.vercel.app',
  'https://invalid-origin.com',
  'https://malicious-site.com',
];

async function testCors(origin: string, endpoint: string) {
  const url = `${BASE_URL}${endpoint}`;

  console.log(`\n🧪 Testing: ${origin}`);
  console.log(`   Endpoint: ${endpoint}`);

  try {
    const response = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        Origin: origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });

    const corsOrigin = response.headers.get('Access-Control-Allow-Origin');
    const corsCredentials = response.headers.get(
      'Access-Control-Allow-Credentials',
    );
    const corsMethods = response.headers.get('Access-Control-Allow-Methods');

    const isValid = corsOrigin === origin;
    const status = isValid ? '✅' : '❌';

    console.log(`   Status: ${response.status} ${status}`);
    console.log(`   CORS Origin: ${corsOrigin || 'none'}`);
    console.log(`   CORS Credentials: ${corsCredentials || 'none'}`);
    console.log(`   CORS Methods: ${corsMethods || 'none'}`);

    if (!isValid && origin.includes('sammiis-projects')) {
      console.log(`   ⚠️  Expected CORS header for sammiis-projects URL`);
    }

    return isValid;
  } catch (error) {
    console.log(
      `   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    return false;
  }
}

async function testAuthEndpoint(origin: string) {
  const url = `${BASE_URL}/api/auth/get-session`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Origin: origin,
      },
    });

    const corsOrigin = response.headers.get('Access-Control-Allow-Origin');
    const isValid = corsOrigin === origin;
    const status = isValid ? '✅' : '❌';

    console.log(`\n🧪 Testing GET /api/auth/get-session`);
    console.log(`   Origin: ${origin}`);
    console.log(`   Status: ${response.status} ${status}`);
    console.log(`   CORS Origin: ${corsOrigin || 'none'}`);

    return isValid;
  } catch (error) {
    console.log(
      `   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    return false;
  }
}

async function main() {
  console.log('🚀 Testing CORS Configuration');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('='.repeat(60));

  const results: { origin: string; valid: boolean }[] = [];

  for (const origin of testOrigins) {
    const isValid = await testCors(origin, '/api/auth/get-session');
    results.push({ origin, valid: isValid });

    if (origin.includes('sammiis-projects')) {
      await testAuthEndpoint(origin);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');

  const validCount = results.filter((r) => r.valid).length;
  const invalidCount = results.filter((r) => !r.valid);

  console.log(`✅ Valid origins: ${validCount}`);
  results
    .filter((r) => r.valid)
    .forEach((r) => {
      console.log(`   - ${r.origin}`);
    });

  console.log(`\n❌ Invalid origins (expected): ${invalidCount.length}`);
  results
    .filter((r) => !r.valid)
    .forEach((r) => {
      console.log(`   - ${r.origin}`);
    });

  const sammiisProjectsValid = results.filter(
    (r) => r.origin.includes('sammiis-projects') && r.valid,
  ).length;

  const sammiisProjectsTotal = results.filter((r) =>
    r.origin.includes('sammiis-projects'),
  ).length;

  if (sammiisProjectsTotal > 0) {
    console.log(
      `\n🎯 sammiis-projects URLs: ${sammiisProjectsValid}/${sammiisProjectsTotal} valid`,
    );
    if (sammiisProjectsValid === sammiisProjectsTotal) {
      console.log('   ✅ All sammiis-projects URLs are properly configured!');
    } else {
      console.log('   ⚠️  Some sammiis-projects URLs are not working');
    }
  }
}

main().catch(console.error);
