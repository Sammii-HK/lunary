/**
 * Identity Stitching Diagnostic Script
 *
 * Investigates why identity stitching coverage is only 0.4%
 *
 * Run with: pnpm tsx scripts/diagnose-identity-stitching.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { sql } from '@vercel/postgres';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function diagnoseIdentityStitching() {
  console.log('🔍 Identity Stitching Diagnostic\n');

  try {
    // 1. Check if anonymous_id column exists and has data
    console.log('1️⃣ Checking anonymous_id column in conversion_events...\n');

    const totalEvents = await sql`
      SELECT COUNT(*) as total
      FROM conversion_events
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `;
    console.log(`   Total events (30 days): ${totalEvents.rows[0].total}`);

    const eventsWithAnonymousId = await sql`
      SELECT COUNT(*) as count
      FROM conversion_events
      WHERE anonymous_id IS NOT NULL
      AND anonymous_id != ''
      AND created_at >= NOW() - INTERVAL '30 days'
    `;
    console.log(
      `   Events with anonymous_id: ${eventsWithAnonymousId.rows[0].count}`,
    );

    const eventsWithUserId = await sql`
      SELECT COUNT(*) as count
      FROM conversion_events
      WHERE user_id IS NOT NULL
      AND user_id != ''
      AND NOT user_id LIKE 'anon:%'
      AND created_at >= NOW() - INTERVAL '30 days'
    `;
    console.log(
      `   Events with real user_id: ${eventsWithUserId.rows[0].count}`,
    );

    const eventsWithBoth = await sql`
      SELECT COUNT(*) as count
      FROM conversion_events
      WHERE user_id IS NOT NULL
      AND user_id != ''
      AND NOT user_id LIKE 'anon:%'
      AND anonymous_id IS NOT NULL
      AND anonymous_id != ''
      AND created_at >= NOW() - INTERVAL '30 days'
    `;
    console.log(`   Events with BOTH ids: ${eventsWithBoth.rows[0].count}\n`);

    // 2. Check what percentage of events have anonymous_id
    const anonPct = (
      (parseInt(eventsWithAnonymousId.rows[0].count) /
        parseInt(totalEvents.rows[0].total)) *
      100
    ).toFixed(1);
    const bothPct = (
      (parseInt(eventsWithBoth.rows[0].count) /
        parseInt(totalEvents.rows[0].total)) *
      100
    ).toFixed(1);

    console.log(`   📊 Anonymous ID coverage: ${anonPct}%`);
    console.log(`   📊 Both IDs present: ${bothPct}%\n`);

    // 3. Check identity links table
    console.log('2️⃣ Checking analytics_identity_links table...\n');

    const totalLinks = await sql`
      SELECT COUNT(*) as count
      FROM analytics_identity_links
    `;
    console.log(`   Total identity links: ${totalLinks.rows[0].count}`);

    const distinctAnonymousIds = await sql`
      SELECT COUNT(DISTINCT anonymous_id) as count
      FROM conversion_events
      WHERE anonymous_id IS NOT NULL
      AND anonymous_id != ''
      AND created_at >= NOW() - INTERVAL '30 days'
    `;
    console.log(
      `   Distinct anonymous IDs (30d): ${distinctAnonymousIds.rows[0].count}`,
    );

    const linkCoverage = (
      (parseInt(totalLinks.rows[0].count) /
        parseInt(distinctAnonymousIds.rows[0].count)) *
      100
    ).toFixed(1);
    console.log(`   Link coverage: ${linkCoverage}%\n`);

    // 4. Check recent link creation activity
    console.log('3️⃣ Checking link creation activity...\n');

    const recentLinks = await sql`
      SELECT COUNT(*) as count
      FROM analytics_identity_links
      WHERE first_seen_at >= NOW() - INTERVAL '7 days'
    `;
    console.log(`   Links created (7 days): ${recentLinks.rows[0].count}`);

    const recentEvents = await sql`
      SELECT COUNT(*) as count
      FROM conversion_events
      WHERE user_id IS NOT NULL
      AND user_id != ''
      AND NOT user_id LIKE 'anon:%'
      AND anonymous_id IS NOT NULL
      AND anonymous_id != ''
      AND created_at >= NOW() - INTERVAL '7 days'
    `;
    console.log(
      `   Events with both IDs (7 days): ${recentEvents.rows[0].count}\n`,
    );

    // 5. Check if links are being created for signup events
    console.log('4️⃣ Checking signup event linking...\n');

    const signupEvents = await sql`
      SELECT COUNT(*) as count
      FROM conversion_events
      WHERE event_type IN ('user_signed_up', 'signup_completed')
      AND created_at >= NOW() - INTERVAL '30 days'
    `;
    console.log(`   Signup events (30 days): ${signupEvents.rows[0].count}`);

    const signupWithBothIds = await sql`
      SELECT COUNT(*) as count
      FROM conversion_events
      WHERE event_type IN ('user_signed_up', 'signup_completed')
      AND user_id IS NOT NULL
      AND user_id != ''
      AND NOT user_id LIKE 'anon:%'
      AND anonymous_id IS NOT NULL
      AND anonymous_id != ''
      AND created_at >= NOW() - INTERVAL '30 days'
    `;
    console.log(
      `   Signups with both IDs: ${signupWithBothIds.rows[0].count}\n`,
    );

    // 6. Sample events to see what's happening
    console.log('5️⃣ Sample recent events with user_id...\n');

    const sampleEvents = await sql`
      SELECT
        event_type,
        user_id,
        anonymous_id,
        created_at
      FROM conversion_events
      WHERE user_id IS NOT NULL
      AND user_id != ''
      AND NOT user_id LIKE 'anon:%'
      AND created_at >= NOW() - INTERVAL '7 days'
      ORDER BY created_at DESC
      LIMIT 10
    `;

    sampleEvents.rows.forEach((row: any, i) => {
      console.log(`   ${i + 1}. ${row.event_type}`);
      console.log(`      user_id: ${row.user_id}`);
      console.log(`      anonymous_id: ${row.anonymous_id || 'NULL'}`);
      console.log(`      created_at: ${row.created_at}`);
      console.log();
    });

    // 7. Check if the issue is the anonymous_id not being sent
    console.log('6️⃣ Checking event types that have anonymous_id...\n');

    const eventTypesWithAnon = await sql`
      SELECT
        event_type,
        COUNT(*) as total_count,
        COUNT(CASE WHEN anonymous_id IS NOT NULL AND anonymous_id != '' THEN 1 END) as with_anon_id,
        ROUND(100.0 * COUNT(CASE WHEN anonymous_id IS NOT NULL AND anonymous_id != '' THEN 1 END) / COUNT(*), 1) as pct_with_anon
      FROM conversion_events
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY event_type
      ORDER BY total_count DESC
      LIMIT 15
    `;

    console.log('   Event Type                 | Total | With Anon | %');
    console.log('   ---------------------------|-------|-----------|------');
    eventTypesWithAnon.rows.forEach((row: any) => {
      console.log(
        `   ${row.event_type.padEnd(27)} | ${String(row.total_count).padStart(5)} | ${String(row.with_anon_id).padStart(9)} | ${String(row.pct_with_anon).padStart(4)}%`,
      );
    });

    console.log('\n✅ Diagnostic complete!');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

async function main() {
  if (!process.env.POSTGRES_URL) {
    console.error('❌ POSTGRES_URL environment variable not set');
    process.exit(1);
  }

  try {
    await diagnoseIdentityStitching();
  } catch (error) {
    console.error('\n❌ Diagnostic failed:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
