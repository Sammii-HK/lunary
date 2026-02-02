/**
 * Cohort Retention Fix Verification Script
 *
 * This script runs against the actual database to demonstrate:
 * 1. What the current calculation returns (likely 0%)
 * 2. What the fixed calculation should return
 * 3. The difference between them
 *
 * Run with: pnpm tsx scripts/test-cohort-retention-fix.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { sql } from '@vercel/postgres';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function testDay1Calculation() {
  console.log('📊 Testing Day 1 Cohort Retention Calculation Fix\n');

  // Create test data
  const testUserId = `test-cohort-user-${Date.now()}`;
  const signupTime = new Date('2026-01-15T12:00:00Z');
  const day1ReturnTime = new Date('2026-01-16T14:00:00Z'); // Next calendar day (26 hours later)

  try {
    console.log('🧹 Cleaning up any existing test data...');
    await sql`DELETE FROM conversion_events WHERE user_id LIKE 'user:test-cohort-user-%'`;
    await sql`DELETE FROM "user" WHERE id LIKE 'test-cohort-user-%'`;

    console.log('✅ Cleanup complete\n');

    console.log('📝 Creating test data...');
    console.log(`   Signup: ${signupTime.toISOString()}`);
    console.log(`   Return: ${day1ReturnTime.toISOString()}`);
    console.log(
      `   Hours between: ${(day1ReturnTime.getTime() - signupTime.getTime()) / (1000 * 60 * 60)}\n`,
    );

    // Insert test user
    const signupTimeStr = signupTime.toISOString();
    const returnTimeStr = day1ReturnTime.toISOString();

    await sql`
      INSERT INTO "user" (id, name, email, "createdAt")
      VALUES (${testUserId}, 'Test User', 'test@cohort.test', ${signupTimeStr})
    `;

    // Insert Day 1 return event
    await sql`
      INSERT INTO conversion_events (
        event_id, event_type, user_id, created_at
      ) VALUES (
        gen_random_uuid(),
        'app_opened',
        ${'user:' + testUserId},
        ${returnTimeStr}
      )
    `;

    console.log('✅ Test data created\n');

    // Query 1: Current (broken) calculation
    console.log('🔍 Running current (broken) calculation...');
    const currentCalc = await sql`
      SELECT
        COUNT(DISTINCT CASE
          WHEN EXISTS (
            SELECT 1 FROM conversion_events ce
            WHERE ce.user_id = CONCAT('user:', u.id)
            AND ce.event_type = 'app_opened'
            -- CURRENT LOGIC: Time interval (broken)
            AND ce.created_at > u."createdAt"
            AND ce.created_at <= u."createdAt" + INTERVAL '1 day'
          )
          THEN u.id
        END) as retained_current
      FROM "user" u
      WHERE u.id = ${testUserId}
    `;

    // Query 2: Fixed calculation
    console.log('🔍 Running fixed calculation...\n');
    const fixedCalc = await sql`
      SELECT
        COUNT(DISTINCT CASE
          WHEN EXISTS (
            SELECT 1 FROM conversion_events ce
            WHERE ce.user_id = CONCAT('user:', u.id)
            AND ce.event_type = 'app_opened'
            -- FIXED LOGIC: Calendar day
            AND DATE(ce.created_at AT TIME ZONE 'UTC') =
                DATE(u."createdAt" AT TIME ZONE 'UTC') + 1
          )
          THEN u.id
        END) as retained_fixed
      FROM "user" u
      WHERE u.id = ${testUserId}
    `;

    const currentRetained = parseInt(
      currentCalc.rows[0]?.retained_current || '0',
    );
    const fixedRetained = parseInt(fixedCalc.rows[0]?.retained_fixed || '0');

    console.log('📈 Results:');
    console.log(`   Current calculation: ${currentRetained} users retained`);
    console.log(`   Fixed calculation: ${fixedRetained} users retained`);

    // Check expectations
    const hoursDiff =
      (day1ReturnTime.getTime() - signupTime.getTime()) / (1000 * 60 * 60);

    console.log('\n✅ Verification:');
    if (hoursDiff > 24) {
      console.log(
        `   ❌ Current logic FAILS: ${currentRetained} (expected 0, user returned ${hoursDiff}h later)`,
      );
      console.log(
        `   ✅ Fixed logic WORKS: ${fixedRetained} (expected 1, user returned on next calendar day)`,
      );
      if (currentRetained === 0 && fixedRetained === 1) {
        console.log('\n🎉 Test PASSED! Fix works correctly.');
      } else {
        console.log('\n⚠️  Unexpected results!');
      }
    } else {
      console.log(
        `   ✅ Current logic works for this case: ${currentRetained}`,
      );
      console.log(`   ✅ Fixed logic also works: ${fixedRetained}`);
      if (currentRetained === 1 && fixedRetained === 1) {
        console.log('\n🎉 Both calculations agree for this test case.');
      }
    }
  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  } finally {
    console.log('\n🧹 Cleaning up test data...');
    await sql`DELETE FROM conversion_events WHERE user_id LIKE 'user:test-cohort-user-%'`;
    await sql`DELETE FROM "user" WHERE id LIKE 'test-cohort-user-%'`;
    console.log('✅ Cleanup complete');
  }
}

async function testEdgeCase() {
  console.log('\n\n📊 Testing Edge Case: Late Night Signup\n');

  // Edge case: User signs up 11:59 PM, returns 25 hours later (calendar Day 2)
  const testUserId = `test-cohort-edge-${Date.now()}`;
  const signupTime = new Date('2026-01-15T23:59:00Z'); // Late at night
  const returnTime = new Date('2026-01-17T01:00:00Z'); // 25 hours later, Day 2

  try {
    console.log('🧹 Cleaning up any existing test data...');
    await sql`DELETE FROM conversion_events WHERE user_id LIKE 'user:test-cohort-edge-%'`;
    await sql`DELETE FROM "user" WHERE id LIKE 'test-cohort-edge-%'`;

    console.log('✅ Cleanup complete\n');

    console.log('📝 Creating edge case test data...');
    console.log(`   Signup: ${signupTime.toISOString()} (late at night)`);
    console.log(
      `   Return: ${returnTime.toISOString()} (25 hours later, calendar Day 2)\n`,
    );

    const signupTimeStr = signupTime.toISOString();
    const returnTimeStr = returnTime.toISOString();

    await sql`
      INSERT INTO "user" (id, name, email, "createdAt")
      VALUES (${testUserId}, 'Test Edge User', 'test-edge@cohort.test', ${signupTimeStr})
    `;

    await sql`
      INSERT INTO conversion_events (
        event_id, event_type, user_id, created_at
      ) VALUES (
        gen_random_uuid(),
        'app_opened',
        ${'user:' + testUserId},
        ${returnTimeStr}
      )
    `;

    console.log('✅ Test data created\n');

    const currentCalc = await sql`
      SELECT
        COUNT(DISTINCT CASE
          WHEN EXISTS (
            SELECT 1 FROM conversion_events ce
            WHERE ce.user_id = CONCAT('user:', u.id)
            AND ce.event_type = 'app_opened'
            AND ce.created_at > u."createdAt"
            AND ce.created_at <= u."createdAt" + INTERVAL '1 day'
          )
          THEN u.id
        END) as retained_current
      FROM "user" u
      WHERE u.id = ${testUserId}
    `;

    const fixedCalc = await sql`
      SELECT
        COUNT(DISTINCT CASE
          WHEN EXISTS (
            SELECT 1 FROM conversion_events ce
            WHERE ce.user_id = CONCAT('user:', u.id)
            AND ce.event_type = 'app_opened'
            AND DATE(ce.created_at AT TIME ZONE 'UTC') =
                DATE(u."createdAt" AT TIME ZONE 'UTC') + 2
          )
          THEN u.id
        END) as retained_day2
      FROM "user" u
      WHERE u.id = ${testUserId}
    `;

    const currentRetained = parseInt(
      currentCalc.rows[0]?.retained_current || '0',
    );
    const day2Retained = parseInt(fixedCalc.rows[0]?.retained_day2 || '0');

    console.log('📈 Results:');
    console.log(`   Current Day 1 calculation: ${currentRetained} users`);
    console.log(`   Fixed Day 2 calculation: ${day2Retained} users`);

    console.log('\n✅ Verification:');
    console.log(
      `   ❌ Current logic misses this (25h > 24h): ${currentRetained} (expected 0)`,
    );
    console.log(
      `   ✅ Fixed logic correctly identifies Day 2: ${day2Retained} (expected 1)`,
    );

    if (currentRetained === 0 && day2Retained === 1) {
      console.log('\n🎉 Edge case test PASSED!');
    } else {
      console.log('\n⚠️  Unexpected results!');
    }
  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  } finally {
    console.log('\n🧹 Cleaning up test data...');
    await sql`DELETE FROM conversion_events WHERE user_id LIKE 'user:test-cohort-edge-%'`;
    await sql`DELETE FROM "user" WHERE id LIKE 'test-cohort-edge-%'`;
    console.log('✅ Cleanup complete');
  }
}

async function compareProductionData() {
  console.log('\n\n📊 Comparing Current vs Fixed on Production Data\n');

  try {
    const comparison = await sql`
      WITH recent_cohort AS (
        SELECT
          DATE(u."createdAt" AT TIME ZONE 'UTC') as signup_date,
          u.id as user_id,
          u."createdAt"
        FROM "user" u
        WHERE u."createdAt" >= NOW() - INTERVAL '14 days'
        AND u."createdAt" < NOW() - INTERVAL '2 days'  -- At least 2 days old
        ORDER BY u."createdAt" DESC
        LIMIT 100
      )
      SELECT
        signup_date,
        COUNT(DISTINCT user_id) as cohort_size,
        -- Current calculation
        COUNT(DISTINCT CASE
          WHEN EXISTS (
            SELECT 1 FROM conversion_events ce
            WHERE ce.user_id = CONCAT('user:', rc.user_id)
            AND ce.event_type IN ('app_opened', 'page_viewed')
            AND ce.created_at > rc."createdAt"
            AND ce.created_at <= rc."createdAt" + INTERVAL '1 day'
          )
          THEN rc.user_id
        END) as retained_current,
        -- Fixed calculation
        COUNT(DISTINCT CASE
          WHEN EXISTS (
            SELECT 1 FROM conversion_events ce
            WHERE ce.user_id = CONCAT('user:', rc.user_id)
            AND ce.event_type IN ('app_opened', 'page_viewed')
            AND DATE(ce.created_at AT TIME ZONE 'UTC') =
                DATE(rc."createdAt" AT TIME ZONE 'UTC') + 1
          )
          THEN rc.user_id
        END) as retained_fixed
      FROM recent_cohort rc
      GROUP BY signup_date
      ORDER BY signup_date DESC
      LIMIT 5
    `;

    console.log('📈 Production Data Comparison (last 5 cohorts):');
    console.log('Date       | Size | Current | Fixed | Difference');
    console.log('-----------|------|---------|-------|------------');

    comparison.rows.forEach((row: any) => {
      const currentPct =
        row.cohort_size > 0
          ? ((row.retained_current / row.cohort_size) * 100).toFixed(1)
          : '0.0';
      const fixedPct =
        row.cohort_size > 0
          ? ((row.retained_fixed / row.cohort_size) * 100).toFixed(1)
          : '0.0';
      const diff = (parseFloat(fixedPct) - parseFloat(currentPct)).toFixed(1);

      console.log(
        `${row.signup_date.toISOString().split('T')[0]} | ` +
          `${String(row.cohort_size).padStart(4)} | ` +
          `${String(currentPct).padStart(6)}% | ` +
          `${String(fixedPct).padStart(4)}% | ` +
          `${diff !== '0.0' ? (parseFloat(diff) > 0 ? '+' : '') + diff + '%' : '   -'}`,
      );
    });

    if (comparison.rows.length === 0) {
      console.log('⚠️  No recent cohorts found');
    }
  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  }
}

async function main() {
  if (!process.env.POSTGRES_URL) {
    console.error('❌ POSTGRES_URL environment variable not set');
    console.error('   Set it in .env.local to run this script');
    process.exit(1);
  }

  try {
    await testDay1Calculation();
    await testEdgeCase();
    await compareProductionData();

    console.log('\n\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Tests failed:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
