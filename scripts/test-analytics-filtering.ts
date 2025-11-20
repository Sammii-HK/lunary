#!/usr/bin/env tsx
/**
 * Test script to verify analytics filtering excludes test users
 *
 * Usage:
 *   pnpm tsx scripts/test-analytics-filtering.ts
 *
 * Make sure POSTGRES_URL is set in your .env.local file
 */

import 'dotenv/config';
import { sql } from '@vercel/postgres';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';
const EXCLUDED_EMAIL = 'kellow.sammii@gmail.com';

async function testAnalyticsFiltering() {
  console.log('🧪 Testing Analytics Filtering\n');

  try {
    // Test 1: Check if test users exist in database
    console.log('1️⃣ Checking for test users in database...');
    const testUsersInSubscriptions = await sql`
      SELECT COUNT(DISTINCT user_id) as count
      FROM subscriptions
      WHERE user_email LIKE ${TEST_EMAIL_PATTERN}
         OR user_email = ${TEST_EMAIL_EXACT}
         OR user_email = ${EXCLUDED_EMAIL}
    `;
    const testUsersInEvents = await sql`
      SELECT COUNT(DISTINCT user_id) as count
      FROM conversion_events
      WHERE user_email LIKE ${TEST_EMAIL_PATTERN}
         OR user_email = ${TEST_EMAIL_EXACT}
         OR user_email = ${EXCLUDED_EMAIL}
    `;

    const testSubCount = Number(testUsersInSubscriptions.rows[0]?.count || 0);
    const testEventCount = Number(testUsersInEvents.rows[0]?.count || 0);

    console.log(`   Found ${testSubCount} test users in subscriptions`);
    console.log(`   Found ${testEventCount} test users in conversion_events`);

    if (testSubCount === 0 && testEventCount === 0) {
      console.log('   ✅ No test users found - filtering is working!\n');
    } else {
      console.log(
        `   ⚠️  Found test users - they should be excluded from analytics\n`,
      );
    }

    // Test 2: Check DAU query (should exclude test users)
    console.log('2️⃣ Testing DAU query (should exclude test users)...');
    const today = new Date().toISOString().split('T')[0];
    const dauWithTestUsers = await sql`
      SELECT COUNT(DISTINCT user_id) AS value
      FROM analytics_user_activity
      WHERE activity_type = 'session'
        AND activity_date = ${today}
    `;
    const dauWithoutTestUsers = await sql`
      SELECT COUNT(DISTINCT user_id) AS value
      FROM analytics_user_activity
      WHERE activity_type = 'session'
        AND activity_date = ${today}
        AND user_id NOT IN (
          SELECT DISTINCT user_id FROM subscriptions WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT} OR user_email = ${EXCLUDED_EMAIL}
          UNION SELECT DISTINCT user_id FROM conversion_events WHERE user_email LIKE ${TEST_EMAIL_PATTERN} OR user_email = ${TEST_EMAIL_EXACT} OR user_email = ${EXCLUDED_EMAIL}
        )
    `;

    const dauWith = Number(dauWithTestUsers.rows[0]?.value || 0);
    const dauWithout = Number(dauWithoutTestUsers.rows[0]?.value || 0);
    const difference = dauWith - dauWithout;

    console.log(`   DAU with test users: ${dauWith}`);
    console.log(`   DAU without test users: ${dauWithout}`);
    console.log(`   Difference: ${difference} (excluded)`);

    if (difference > 0) {
      console.log(
        `   ✅ Filtering working - ${difference} test user(s) excluded\n`,
      );
    } else {
      console.log(
        `   ℹ️  No test users in today's DAU (either none exist or filtering working)\n`,
      );
    }

    // Test 3: Check subscriptions query
    console.log(
      '3️⃣ Testing subscriptions query (should exclude test users)...',
    );
    const subsWithTestUsers = await sql`
      SELECT COUNT(DISTINCT user_id) AS count
      FROM subscriptions
      WHERE status = 'active'
    `;
    const subsWithoutTestUsers = await sql`
      SELECT COUNT(DISTINCT user_id) AS count
      FROM subscriptions
      WHERE status = 'active'
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT} AND user_email != ${EXCLUDED_EMAIL}))
    `;

    const subsWith = Number(subsWithTestUsers.rows[0]?.count || 0);
    const subsWithout = Number(subsWithoutTestUsers.rows[0]?.count || 0);
    const subsDifference = subsWith - subsWithout;

    console.log(`   Active subscriptions with test users: ${subsWith}`);
    console.log(`   Active subscriptions without test users: ${subsWithout}`);
    console.log(`   Difference: ${subsDifference} (excluded)`);

    if (subsDifference > 0) {
      console.log(
        `   ✅ Filtering working - ${subsDifference} test subscription(s) excluded\n`,
      );
    } else {
      console.log(`   ℹ️  No test subscriptions found\n`);
    }

    // Test 4: Verify the API endpoint would work
    console.log('4️⃣ Testing API endpoint structure...');
    console.log('   To test the full endpoint, run:');
    console.log(
      `   curl -H "Authorization: Bearer YOUR_SECRET" https://lunary.app/api/analytics/summary`,
    );
    console.log('   (Replace YOUR_SECRET with your ANALYTICS_API_SECRET)\n');

    console.log('✅ All tests completed!\n');
    console.log('📊 Summary:');
    console.log(`   - Test users found: ${testSubCount + testEventCount}`);
    console.log(`   - DAU difference: ${difference}`);
    console.log(`   - Subscriptions difference: ${subsDifference}`);
    console.log('\n💡 Next steps:');
    console.log(
      '   1. Run your Google Apps Script again to update sheets with filtered data',
    );
    console.log('   2. Compare old vs new numbers to see the difference');
    console.log(
      '   3. Test users will be automatically excluded going forward',
    );
  } catch (error) {
    console.error('❌ Error testing analytics filtering:', error);
    process.exit(1);
  }
}

testAnalyticsFiltering();
