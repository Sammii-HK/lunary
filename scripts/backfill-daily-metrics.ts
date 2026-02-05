/**
 * Backfill daily_metrics table with historical data
 * Run with: pnpm tsx scripts/backfill-daily-metrics.ts
 *
 * This computes metrics for the past N days by calling the compute-metrics endpoint
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const DAYS_TO_BACKFILL = 90; // Backfill last 90 days

async function backfill() {
  console.log(
    `📊 Backfilling daily_metrics for last ${DAYS_TO_BACKFILL} days...\n`,
  );

  const baseUrl =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000';

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let completed = 0;
  let failed = 0;

  for (let i = 1; i <= DAYS_TO_BACKFILL; i++) {
    const targetDate = new Date(today);
    targetDate.setUTCDate(targetDate.getUTCDate() - i);
    const dateStr = targetDate.toISOString().split('T')[0];

    try {
      console.log(`   Computing ${dateStr}...`);
      const startTime = Date.now();

      const response = await fetch(
        `${baseUrl}/api/cron/compute-metrics?date=${dateStr}`,
        {
          headers: process.env.CRON_SECRET
            ? { Authorization: `Bearer ${process.env.CRON_SECRET}` }
            : {},
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      const duration = Date.now() - startTime;

      console.log(
        `   ✅ ${dateStr} - DAU: ${result.metrics.dau}, MAU: ${result.metrics.mau} (${duration}ms)`,
      );
      completed++;

      // Small delay to avoid overwhelming the database
      if (i % 10 === 0) {
        console.log(
          `\n   ⏸️  Processed ${i}/${DAYS_TO_BACKFILL}, pausing 2s...\n`,
        );
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`   ❌ Failed ${dateStr}:`, error);
      failed++;
    }
  }

  console.log(`\n✨ Backfill complete!`);
  console.log(`   ✅ Completed: ${completed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(
    `\n💡 Next: Set up Vercel cron to run /api/cron/compute-metrics daily`,
  );
}

backfill()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Backfill failed:', error);
    process.exit(1);
  });
