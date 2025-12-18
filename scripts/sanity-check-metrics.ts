/**
 * Sanity check script for weekly metrics
 * Prints last 4 weeks of KPIs to console for verification
 *
 * Usage: npx tsx scripts/sanity-check-metrics.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import {
  calculateWeeklyMetrics,
  getWeekBoundaries,
  formatDateLondon,
} from '../src/lib/analytics/weekly-metrics';

async function main() {
  console.log('\n📊 Weekly Metrics Sanity Check\n');
  console.log('Calculating metrics for last 4 weeks...\n');

  const now = new Date();
  const results = [];

  // Get last 4 weeks
  for (let i = 0; i < 4; i++) {
    const { weekStart, weekEnd } = getWeekBoundaries(now);
    const weekStartDate = new Date(
      weekStart.getTime() - i * 7 * 24 * 60 * 60 * 1000,
    );
    const weekEndDate = new Date(
      weekEnd.getTime() - i * 7 * 24 * 60 * 60 * 1000,
    );

    try {
      console.log(
        `Processing week ${i + 1}/4: ${formatDateLondon(weekStartDate)} to ${formatDateLondon(weekEndDate)}...`,
      );

      const metrics = await calculateWeeklyMetrics(weekStartDate, weekEndDate);

      results.push({
        week: metrics.isoWeek,
        weekStart: metrics.weekStartDate,
        weekEnd: metrics.weekEndDate,
        metrics,
      });

      console.log(`✅ Week ${metrics.isoWeek} completed\n`);
    } catch (error: any) {
      console.error(`❌ Error processing week: ${error.message}\n`);
      results.push({
        week: formatDateLondon(weekStartDate),
        error: error.message,
      });
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY - Last 4 Weeks');
  console.log('='.repeat(80) + '\n');

  for (const result of results.reverse()) {
    if (result.error) {
      console.log(`❌ ${result.week}: ERROR - ${result.error}\n`);
      continue;
    }

    const m = result.metrics!;
    console.log(
      `📅 Week ${m.isoWeek} (${m.weekStartDate} to ${m.weekEndDate})`,
    );
    console.log(`   New Users: ${m.newUsers}`);
    console.log(
      `   Activated: ${m.activatedUsers} (${m.activationRate.toFixed(1)}%)`,
    );
    console.log(`   WAU: ${m.wau}`);
    console.log(`   New Trials: ${m.newTrials}`);
    console.log(`   New Paying: ${m.newPayingSubscribers}`);
    console.log(`   MRR: $${m.mrrEndOfWeek.toFixed(2)}`);
    console.log(`   Gross Revenue: $${m.grossRevenueWeek.toFixed(2)}`);
    console.log(`   ARPU: $${m.arpuWeek.toFixed(2)}`);
    console.log(`   Churn Rate: ${m.churnRateWeek.toFixed(1)}%`);
    console.log(`   Data Completeness: ${m.dataCompletenessScore}%`);
    console.log(
      `   Top Features: ${m.topFeaturesByUsers.map((f) => `${f.feature} (${f.distinctUsers})`).join(', ')}`,
    );
    console.log('');
  }

  console.log('='.repeat(80));
  console.log('Sanity check complete!\n');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
