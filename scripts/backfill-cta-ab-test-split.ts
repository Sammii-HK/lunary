/**
 * Backfill: Split flat CTA A/B tests into per-hub tests
 *
 * Rewrites old conversion_events rows where:
 *   abTest = 'seo_cta_copy'        → abTest = 'seo_cta_{hub}',        abVariant = '{index}'
 *   abTest = 'seo_sticky_cta_copy' → abTest = 'seo_sticky_cta_{hub}', abVariant = '{index}'
 *
 * The old variant format was '{hub}_{index}' (e.g. 'horoscopes_4').
 * The new format scopes the test per hub and uses just the index as the variant.
 *
 * Usage:
 *   npx tsx scripts/backfill-cta-ab-test-split.ts [--dry-run]
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { sql } from '@vercel/postgres';

const OLD_TEST_NAMES = ['seo_cta_copy', 'seo_sticky_cta_copy'] as const;

const TEST_PREFIX_MAP: Record<string, string> = {
  seo_cta_copy: 'seo_cta_',
  seo_sticky_cta_copy: 'seo_sticky_cta_',
};

async function main() {
  const isDryRun = process.argv.includes('--dry-run');

  console.log('=== Backfill: Split CTA A/B tests by hub ===\n');
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}\n`);

  for (const oldTestName of OLD_TEST_NAMES) {
    const prefix = TEST_PREFIX_MAP[oldTestName];

    // Count rows to update
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM conversion_events
      WHERE metadata->>'abTest' = ${oldTestName}
        AND metadata->>'abVariant' IS NOT NULL
        AND metadata->>'abVariant' LIKE '%_%'
    `;
    const total = parseInt(countResult.rows[0]?.total || '0');
    console.log(`${oldTestName}: ${total} rows to update`);

    if (total === 0) continue;

    // Get distinct variants to show what we'll transform
    const variantsResult = await sql`
      SELECT DISTINCT metadata->>'abVariant' as variant,
             COUNT(*) as cnt
      FROM conversion_events
      WHERE metadata->>'abTest' = ${oldTestName}
        AND metadata->>'abVariant' IS NOT NULL
      GROUP BY metadata->>'abVariant'
      ORDER BY cnt DESC
      LIMIT 20
    `;

    console.log('  Top variants:');
    for (const row of variantsResult.rows) {
      const variant = row.variant as string;
      const match = variant.match(/^(.+)_(\d+)$/);
      if (match) {
        console.log(
          `    ${variant} (${row.cnt}) → test=${prefix}${match[1]}, variant=${match[2]}`,
        );
      } else {
        console.log(
          `    ${variant} (${row.cnt}) → SKIPPED (no hub_index pattern)`,
        );
      }
    }

    if (isDryRun) {
      console.log(`  [DRY RUN] Would update ${total} rows\n`);
      continue;
    }

    // Perform the update using REGEXP_REPLACE
    // Extract hub = everything before the last _N, index = the last number
    const result = await sql`
      UPDATE conversion_events
      SET metadata = jsonb_set(
        jsonb_set(
          metadata,
          '{abTest}',
          to_jsonb(${prefix} || REGEXP_REPLACE(metadata->>'abVariant', '_[0-9]+$', ''))
        ),
        '{abVariant}',
        to_jsonb(REGEXP_REPLACE(metadata->>'abVariant', '^.*_', ''))
      )
      WHERE metadata->>'abTest' = ${oldTestName}
        AND metadata->>'abVariant' IS NOT NULL
        AND metadata->>'abVariant' ~ '^.+_[0-9]+$'
    `;

    console.log(`  Updated ${result.rowCount} rows\n`);
  }

  // Verify
  if (!isDryRun) {
    console.log('--- Verification ---');
    const remaining = await sql`
      SELECT COUNT(*) as total
      FROM conversion_events
      WHERE metadata->>'abTest' IN ('seo_cta_copy', 'seo_sticky_cta_copy')
    `;
    console.log(
      `Remaining rows with old test names: ${remaining.rows[0]?.total}`,
    );

    const newTests = await sql`
      SELECT metadata->>'abTest' as test_name, COUNT(*) as cnt
      FROM conversion_events
      WHERE metadata->>'abTest' LIKE 'seo_cta_%'
         OR metadata->>'abTest' LIKE 'seo_sticky_cta_%'
      GROUP BY metadata->>'abTest'
      ORDER BY cnt DESC
      LIMIT 30
    `;
    console.log('\nNew per-hub tests:');
    for (const row of newTests.rows) {
      console.log(`  ${row.test_name}: ${row.cnt} events`);
    }
  }

  console.log('\nDone!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
