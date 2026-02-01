#!/usr/bin/env tsx
/**
 * Script to remove duplicate moon circles
 * Keeps the oldest circle for each moon event (within 10-day window)
 * Only deletes duplicates that have NO user interactions (insights)
 *
 * Usage: pnpm tsx scripts/cleanup-duplicate-moon-circles.ts
 * Dry run: pnpm tsx scripts/cleanup-duplicate-moon-circles.ts --dry-run
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { sql } from '@vercel/postgres';

// Load environment variables (try .env.local first, then .env)
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const isDryRun = process.argv.includes('--dry-run');

async function cleanupDuplicates() {
  try {
    console.log('🔍 Finding duplicate moon circles...\n');

    // Find duplicates (circles where another circle for the same phase exists within 10 days and has a lower ID)
    const duplicates = await sql`
      SELECT
        mc1.id,
        mc1.moon_phase,
        mc1.event_date,
        mc1.title,
        mc1.insight_count,
        (SELECT COUNT(*) FROM moon_circle_insights mci WHERE mci.moon_circle_id = mc1.id) as actual_insights
      FROM moon_circles mc1
      WHERE EXISTS (
        SELECT 1 FROM moon_circles mc2
        WHERE mc2.moon_phase = mc1.moon_phase
          AND mc2.event_date BETWEEN mc1.event_date - INTERVAL '10 days'
                                 AND mc1.event_date + INTERVAL '10 days'
          AND mc2.id < mc1.id
      )
      ORDER BY mc1.moon_phase, mc1.event_date
    `;

    if (duplicates.rows.length === 0) {
      console.log('✅ No duplicate moon circles found!');
      return;
    }

    // Separate duplicates with and without interactions
    const safeToDelete = duplicates.rows.filter(
      (row) => Number(row.actual_insights) === 0,
    );
    const hasInteractions = duplicates.rows.filter(
      (row) => Number(row.actual_insights) > 0,
    );

    console.log(`Found ${duplicates.rows.length} duplicate(s):\n`);

    if (safeToDelete.length > 0) {
      console.log(
        `✅ SAFE TO DELETE (no interactions): ${safeToDelete.length}`,
      );
      console.log('ID\tPhase\t\tDate\t\tInsights\tTitle');
      console.log('-'.repeat(80));

      for (const row of safeToDelete) {
        const date = new Date(row.event_date).toISOString().split('T')[0];
        console.log(
          `${row.id}\t${row.moon_phase}\t${date}\t${row.actual_insights}\t\t${row.title}`,
        );
      }
      console.log('');
    }

    if (hasInteractions.length > 0) {
      console.log(`⚠️  SKIPPING (has interactions): ${hasInteractions.length}`);
      console.log('ID\tPhase\t\tDate\t\tInsights\tTitle');
      console.log('-'.repeat(80));

      for (const row of hasInteractions) {
        const date = new Date(row.event_date).toISOString().split('T')[0];
        console.log(
          `${row.id}\t${row.moon_phase}\t${date}\t${row.actual_insights}\t\t${row.title}`,
        );
      }
      console.log('');
      console.log(
        '   These duplicates have user insights and will NOT be deleted.',
      );
      console.log(
        '   Consider manually merging insights to the primary circle.\n',
      );
    }

    if (safeToDelete.length === 0) {
      console.log('ℹ️  No duplicates without interactions to delete.');
      return;
    }

    if (isDryRun) {
      console.log('🔍 DRY RUN - No changes made');
      console.log(
        `Run without --dry-run to delete ${safeToDelete.length} duplicate(s)`,
      );
      return;
    }

    // Delete only duplicates without interactions
    console.log(`🗑️  Deleting ${safeToDelete.length} duplicate(s)...`);

    const idsToDelete = safeToDelete.map((row) => row.id);

    const deleteResult = await sql`
      DELETE FROM moon_circles
      WHERE id = ANY(${idsToDelete}::int[])
    `;

    console.log(`✅ Deleted ${deleteResult.rowCount} duplicate moon circle(s)`);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

cleanupDuplicates();
