/**
 * Fix duplicate social_posts rows created by multiple pipeline runs.
 *
 * The generate-weekly route has no ON CONFLICT guard, so each trigger
 * inserts fresh rows for every post. This script:
 *   1. Reports how many duplicates exist per base_group_key
 *   2. Deletes all but the lowest ID (oldest row) per group key
 *   3. Reports what was kept and what was removed
 *
 * Run: npx tsx scripts/fix-duplicate-social-posts.ts
 * Dry run: npx tsx scripts/fix-duplicate-social-posts.ts --dry-run
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const sql = neon(process.env.POSTGRES_URL!);

const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  console.log(
    DRY_RUN
      ? '🔍 DRY RUN — no changes will be made\n'
      : '🔧 LIVE RUN — deleting duplicates\n',
  );

  // Find all base_group_keys that have more than 1 row
  const duplicateGroups = await sql`
    SELECT
      base_group_key,
      COUNT(*) AS total,
      MIN(id) AS keep_id,
      ARRAY_AGG(id ORDER BY id) AS all_ids
    FROM social_posts
    WHERE
      base_group_key IS NOT NULL
      AND status IN ('pending', 'approved')
    GROUP BY base_group_key
    HAVING COUNT(*) > 1
    ORDER BY MIN(scheduled_date), base_group_key
  `;

  if (duplicateGroups.length === 0) {
    console.log('✅ No duplicates found.');
    return;
  }

  console.log(`Found ${duplicateGroups.length} groups with duplicates:\n`);

  let totalToDelete = 0;
  const toDelete: number[] = [];

  for (const group of duplicateGroups) {
    const allIds = group.all_ids as number[];
    const keepId = group.keep_id as number;
    const deleteIds = allIds.filter((id: number) => id !== keepId);
    totalToDelete += deleteIds.length;
    toDelete.push(...deleteIds);

    console.log(`  ${group.base_group_key}`);
    console.log(
      `    total: ${group.total}  keep: ${keepId}  delete: [${deleteIds.join(', ')}]`,
    );
  }

  console.log(`\nTotal rows to delete: ${totalToDelete}`);

  if (DRY_RUN) {
    console.log('\n✅ Dry run complete — re-run without --dry-run to apply.');
    return;
  }

  // Delete in batches of 100
  const BATCH = 100;
  let deleted = 0;
  for (let i = 0; i < toDelete.length; i += BATCH) {
    const batch = toDelete.slice(i, i + BATCH);
    const result = await sql`
      DELETE FROM social_posts
      WHERE id = ANY(${batch}::int[])
        AND status IN ('pending', 'approved')
    `;
    deleted += result.length ?? batch.length;
  }

  console.log(`\n✅ Deleted ${deleted} duplicate rows. Kept 1 per group.`);

  // Verify
  const remaining = await sql`
    SELECT base_group_key, COUNT(*) AS total
    FROM social_posts
    WHERE base_group_key IS NOT NULL AND status IN ('pending', 'approved')
    GROUP BY base_group_key
    HAVING COUNT(*) > 1
  `;

  if (remaining.length === 0) {
    console.log('✅ Verification passed — no more duplicates.');
  } else {
    console.warn(
      `⚠️  ${remaining.length} groups still have duplicates — check manually.`,
    );
    for (const r of remaining) {
      console.warn(`  ${r.base_group_key}: ${r.total} rows`);
    }
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
