/**
 * Diagnostic script to check A/B test data in conversion_events table
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { sql } from '@vercel/postgres';

// Load environment variables (try .env.local first, then .env)
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function checkABTestData() {
  console.log('🔍 Checking A/B test data in conversion_events...\n');

  try {
    // Check total conversion events
    const totalEvents = await sql`
      SELECT COUNT(*) as count
      FROM conversion_events
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `;
    console.log(
      `📊 Total conversion events (last 30 days): ${totalEvents.rows[0].count}`,
    );

    // Check app_opened events
    const appOpenedEvents = await sql`
      SELECT COUNT(*) as count
      FROM conversion_events
      WHERE event_type = 'app_opened'
      AND created_at >= NOW() - INTERVAL '30 days'
    `;
    console.log(
      `📱 app_opened events (last 30 days): ${appOpenedEvents.rows[0].count}`,
    );

    // Check for ANY metadata
    const eventsWithMetadata = await sql`
      SELECT COUNT(*) as count
      FROM conversion_events
      WHERE metadata IS NOT NULL
      AND metadata != '{}'::jsonb
      AND created_at >= NOW() - INTERVAL '30 days'
    `;
    console.log(
      `📝 Events with metadata (last 30 days): ${eventsWithMetadata.rows[0].count}`,
    );

    // Check distinct metadata keys
    console.log('\n🔑 Sample metadata keys found:');
    const metadataKeys = await sql`
      SELECT DISTINCT jsonb_object_keys(metadata) as key
      FROM conversion_events
      WHERE metadata IS NOT NULL
      AND metadata != '{}'::jsonb
      AND created_at >= NOW() - INTERVAL '7 days'
      LIMIT 20
    `;

    if (metadataKeys.rows.length === 0) {
      console.log('   ❌ No metadata keys found');
    } else {
      metadataKeys.rows.forEach((row: any) => {
        console.log(`   - ${row.key}`);
      });
    }

    // Check for A/B test data with camelCase keys
    console.log(
      '\n🧪 Checking for A/B test data (camelCase: abTest, abVariant):',
    );
    const abTestDataCamel = await sql`
      SELECT COUNT(*) as count
      FROM conversion_events
      WHERE metadata->>'abTest' IS NOT NULL
      AND created_at >= NOW() - INTERVAL '30 days'
    `;
    console.log(
      `   Events with 'abTest' key: ${abTestDataCamel.rows[0].count}`,
    );

    if (parseInt(abTestDataCamel.rows[0].count) > 0) {
      const sampleCamel = await sql`
        SELECT
          event_type,
          metadata->>'abTest' as ab_test,
          metadata->>'abVariant' as ab_variant,
          created_at
        FROM conversion_events
        WHERE metadata->>'abTest' IS NOT NULL
        AND created_at >= NOW() - INTERVAL '7 days'
        LIMIT 5
      `;
      console.log('   📋 Sample events:');
      sampleCamel.rows.forEach((row: any) => {
        console.log(
          `      ${row.event_type} | Test: ${row.ab_test} | Variant: ${row.ab_variant} | ${row.created_at}`,
        );
      });
    }

    // Check for A/B test data with snake_case keys
    console.log(
      '\n🧪 Checking for A/B test data (snake_case: ab_test, ab_variant):',
    );
    const abTestDataSnake = await sql`
      SELECT COUNT(*) as count
      FROM conversion_events
      WHERE metadata->>'ab_test' IS NOT NULL
      AND created_at >= NOW() - INTERVAL '30 days'
    `;
    console.log(
      `   Events with 'ab_test' key: ${abTestDataSnake.rows[0].count}`,
    );

    if (parseInt(abTestDataSnake.rows[0].count) > 0) {
      const sampleSnake = await sql`
        SELECT
          event_type,
          metadata->>'ab_test' as ab_test,
          metadata->>'ab_variant' as ab_variant,
          created_at
        FROM conversion_events
        WHERE metadata->>'ab_test' IS NOT NULL
        AND created_at >= NOW() - INTERVAL '7 days'
        LIMIT 5
      `;
      console.log('   📋 Sample events:');
      sampleSnake.rows.forEach((row: any) => {
        console.log(
          `      ${row.event_type} | Test: ${row.ab_test} | Variant: ${row.ab_variant} | ${row.created_at}`,
        );
      });
    }

    // Check distinct test names
    console.log('\n🎯 Distinct A/B test names found:');
    const distinctTestsCamel = await sql`
      SELECT DISTINCT metadata->>'abTest' as test_name
      FROM conversion_events
      WHERE metadata->>'abTest' IS NOT NULL
      AND created_at >= NOW() - INTERVAL '30 days'
    `;
    const distinctTestsSnake = await sql`
      SELECT DISTINCT metadata->>'ab_test' as test_name
      FROM conversion_events
      WHERE metadata->>'ab_test' IS NOT NULL
      AND created_at >= NOW() - INTERVAL '30 days'
    `;

    const allTests = [
      ...distinctTestsCamel.rows.map((r: any) => r.test_name),
      ...distinctTestsSnake.rows.map((r: any) => r.test_name),
    ].filter(Boolean);

    if (allTests.length === 0) {
      console.log(
        '   ❌ No A/B test data found in metadata\n\n   💡 This is expected if:',
      );
      console.log('      1. The bug was preventing tracking (now fixed)');
      console.log('      2. No users were in A/B tests during tracking');
      console.log(
        '      3. The fix needs to be deployed and users need to visit the app',
      );
    } else {
      allTests.forEach((test) => {
        console.log(`   - ${test}`);
      });
    }

    console.log('\n✅ Diagnostic complete!');
  } catch (error) {
    console.error('❌ Error checking A/B test data:', error);
    throw error;
  }
}

checkABTestData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
