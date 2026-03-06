/**
 * Fix is_paying flag for all subscription records
 * Run with: npx ts-node scripts/fix-is-paying.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { sql } from '@vercel/postgres';

async function fixIsPaying() {
  console.log('🔧 Fixing is_paying flag for all subscriptions...\n');

  try {
    // Update all active status
    const activeResult = await sql`
      UPDATE subscriptions
      SET is_paying = true
      WHERE status = 'active'
      RETURNING user_id, status
    `;
    console.log(`✅ Updated ${activeResult.rowCount} active subscriptions`);

    // Update all past_due status
    const pastDueResult = await sql`
      UPDATE subscriptions
      SET is_paying = true
      WHERE status = 'past_due'
      RETURNING user_id, status
    `;
    console.log(`✅ Updated ${pastDueResult.rowCount} past_due subscriptions`);

    // Ensure all cancelled/free/trial have is_paying = false
    const inactiveResult = await sql`
      UPDATE subscriptions
      SET is_paying = false
      WHERE status IN ('cancelled', 'free', 'trial')
      RETURNING user_id, status
    `;
    console.log(
      `✅ Ensured ${inactiveResult.rowCount} cancelled/free/trial subscriptions have is_paying=false`,
    );

    // Verify
    const verify = await sql`
      SELECT
        status,
        COUNT(*) as count,
        COUNT(CASE WHEN is_paying = true THEN 1 END) as paying_count
      FROM subscriptions
      GROUP BY status
      ORDER BY count DESC
    `;

    console.log('\n📊 Verification:\n');
    for (const row of verify.rows) {
      console.log(
        `  ${row.status}: ${row.count} total, ${row.paying_count} marked as paying`,
      );
    }

    // Overall stats
    const total = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN is_paying = true THEN 1 END) as paying,
        SUM(CASE WHEN monthly_amount_due IS NOT NULL THEN monthly_amount_due ELSE 0 END) as mrr
      FROM subscriptions
    `;

    const stats = total.rows[0];
    console.log(`\n✨ Overall:\n`);
    console.log(`  Total subscriptions: ${stats.total}`);
    console.log(`  Paying: ${stats.paying}`);
    console.log(`  MRR: £${(stats.mrr || 0).toFixed(2)}`);

    console.log('\n✅ Fix complete!\n');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixIsPaying();
