/**
 * Backfill Identity Links Script
 *
 * Creates missing identity links from conversion_events where we have
 * both user_id and anonymous_id but no link was created.
 *
 * Run with: pnpm tsx scripts/backfill-identity-links.ts
 * Dry run: pnpm tsx scripts/backfill-identity-links.ts --dry-run
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { sql } from '@vercel/postgres';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function backfillIdentityLinks(dryRun: boolean = false) {
  console.log('🔗 Identity Links Backfill\n');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}\n`);

  try {
    // Find all user_id + anonymous_id combinations that should have links
    console.log('1️⃣ Finding missing identity links...\n');

    const missingLinks = await sql`
      SELECT DISTINCT ON (ce.user_id, ce.anonymous_id)
        ce.user_id,
        ce.anonymous_id,
        MIN(ce.created_at) as first_seen_at,
        MAX(ce.created_at) as last_seen_at
      FROM conversion_events ce
      WHERE ce.user_id IS NOT NULL
        AND ce.user_id != ''
        AND NOT ce.user_id LIKE 'anon:%'
        AND ce.anonymous_id IS NOT NULL
        AND ce.anonymous_id != ''
        AND NOT EXISTS (
          SELECT 1
          FROM analytics_identity_links ail
          WHERE ail.user_id = ce.user_id
            AND ail.anonymous_id = ce.anonymous_id
        )
      GROUP BY ce.user_id, ce.anonymous_id
      ORDER BY ce.user_id, ce.anonymous_id, MIN(ce.created_at)
    `;

    console.log(
      `   Found ${missingLinks.rows.length} missing identity links\n`,
    );

    if (missingLinks.rows.length === 0) {
      console.log('✅ No missing links found!');
      return;
    }

    // Show sample of what will be created
    console.log('📋 Sample of links to create (first 10):\n');
    missingLinks.rows.slice(0, 10).forEach((row: any, i) => {
      console.log(`   ${i + 1}. user: ${row.user_id}`);
      console.log(`      anon: ${row.anonymous_id}`);
      console.log(`      first_seen: ${row.first_seen_at}`);
      console.log(`      last_seen: ${row.last_seen_at}\n`);
    });

    if (dryRun) {
      console.log('🔍 DRY RUN - No changes made');
      console.log(`\nWould create ${missingLinks.rows.length} identity links`);
      return;
    }

    // Create the links
    console.log(`2️⃣ Creating ${missingLinks.rows.length} identity links...\n`);

    let created = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const row of missingLinks.rows) {
      try {
        await sql`
          INSERT INTO analytics_identity_links (
            user_id,
            anonymous_id,
            first_seen_at,
            last_seen_at
          )
          VALUES (
            ${row.user_id},
            ${row.anonymous_id},
            ${row.first_seen_at},
            ${row.last_seen_at}
          )
          ON CONFLICT (user_id, anonymous_id) DO UPDATE
          SET
            first_seen_at = LEAST(analytics_identity_links.first_seen_at, EXCLUDED.first_seen_at),
            last_seen_at = GREATEST(analytics_identity_links.last_seen_at, EXCLUDED.last_seen_at)
        `;
        created++;

        if (created % 100 === 0) {
          console.log(`   Created ${created} links...`);
        }
      } catch (e: any) {
        failed++;
        const errorMsg = `Failed for user=${row.user_id}, anon=${row.anonymous_id}: ${e.message}`;
        errors.push(errorMsg);

        if (failed <= 5) {
          console.error(`   ❌ ${errorMsg}`);
        }
      }
    }

    console.log(`\n✅ Backfill complete!`);
    console.log(`   Created: ${created}`);
    console.log(`   Failed: ${failed}`);

    if (failed > 5) {
      console.log(`   (Showing first 5 errors, ${failed - 5} more occurred)`);
    }

    // Verify the results
    console.log('\n3️⃣ Verifying results...\n');

    const totalLinks = await sql`
      SELECT COUNT(*) as count
      FROM analytics_identity_links
    `;
    console.log(`   Total identity links now: ${totalLinks.rows[0].count}`);

    const distinctAnonymousIds = await sql`
      SELECT COUNT(DISTINCT anonymous_id) as count
      FROM conversion_events
      WHERE anonymous_id IS NOT NULL
        AND anonymous_id != ''
    `;
    const coverage = (
      (parseInt(totalLinks.rows[0].count) /
        parseInt(distinctAnonymousIds.rows[0].count)) *
      100
    ).toFixed(1);
    console.log(`   Coverage: ${coverage}%`);
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

  const dryRun = process.argv.includes('--dry-run');

  try {
    await backfillIdentityLinks(dryRun);
  } catch (error) {
    console.error('\n❌ Backfill failed:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
