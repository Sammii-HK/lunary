/**
 * Analytics Calculations Audit
 *
 * Validates all analytics calculations and identifies issues:
 * - Cohort retention (Day 1 = 0% issue)
 * - DAU/WAU/MAU consistency
 * - Stickiness calculations
 * - Identity stitching coverage
 * - Deduplication issues
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { sql } from '@vercel/postgres';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

interface AuditResult {
  category: string;
  check: string;
  status: 'PASS' | 'FAIL' | 'WARN' | 'INFO';
  message: string;
  details?: any;
}

const results: AuditResult[] = [];

function addResult(result: AuditResult) {
  results.push(result);
  const icon = {
    PASS: '✅',
    FAIL: '❌',
    WARN: '⚠️',
    INFO: 'ℹ️',
  }[result.status];
  console.log(`${icon} ${result.check}`);
  console.log(`   ${result.message}`);
  if (result.details) {
    console.log(`   Details:`, result.details);
  }
  console.log();
}

async function auditCohorts() {
  console.log('=== 1. COHORT RETENTION AUDIT ===\n');

  try {
    // Check cohort retention rates
    const cohortQuery = await sql`
      WITH cohorts AS (
        SELECT
          DATE(u."createdAt" AT TIME ZONE 'UTC') as signup_date,
          COUNT(DISTINCT u.id) as cohort_size
        FROM "user" u
        WHERE u."createdAt" >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(u."createdAt" AT TIME ZONE 'UTC')
        HAVING COUNT(DISTINCT u.id) >= 10
        ORDER BY signup_date DESC
        LIMIT 10
      ),
      day1_retention AS (
        SELECT
          DATE(u."createdAt" AT TIME ZONE 'UTC') as signup_date,
          COUNT(DISTINCT CASE
            WHEN EXISTS (
              SELECT 1 FROM conversion_events ce
              WHERE ce.user_id = CONCAT('user:', u.id)
              AND ce.event_type IN ('app_opened', 'page_viewed')
              -- Current (potentially broken) logic
              AND ce.created_at > u."createdAt"
              AND ce.created_at <= u."createdAt" + INTERVAL '1 day'
            )
            THEN u.id
          END) as retained_day1_old,
          COUNT(DISTINCT CASE
            WHEN EXISTS (
              SELECT 1 FROM conversion_events ce
              WHERE ce.user_id = CONCAT('user:', u.id)
              AND ce.event_type IN ('app_opened', 'page_viewed')
              -- Corrected logic: calendar day 1 after signup
              AND DATE(ce.created_at AT TIME ZONE 'UTC') =
                  DATE(u."createdAt" AT TIME ZONE 'UTC') + 1
            )
            THEN u.id
          END) as retained_day1_new
        FROM "user" u
        WHERE u."createdAt" >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(u."createdAt" AT TIME ZONE 'UTC')
      )
      SELECT
        c.signup_date,
        c.cohort_size,
        COALESCE(r.retained_day1_old, 0) as retained_old,
        COALESCE(r.retained_day1_new, 0) as retained_new,
        ROUND((COALESCE(r.retained_day1_old, 0)::numeric / c.cohort_size * 100), 1) as retention_old_pct,
        ROUND((COALESCE(r.retained_day1_new, 0)::numeric / c.cohort_size * 100), 1) as retention_new_pct
      FROM cohorts c
      LEFT JOIN day1_retention r ON c.signup_date = r.signup_date
      ORDER BY c.signup_date DESC
      LIMIT 5
    `;

    if (cohortQuery.rows.length === 0) {
      addResult({
        category: 'Cohorts',
        check: 'Day 1 Retention Data',
        status: 'WARN',
        message: 'No recent cohorts with 10+ users found',
      });
    } else {
      const hasZeroRetention = cohortQuery.rows.some(
        (row: any) =>
          row.retention_old_pct === 0 || row.retention_old_pct === '0.0',
      );
      const hasDifference = cohortQuery.rows.some(
        (row: any) =>
          Math.abs(
            parseFloat(row.retention_old_pct) -
              parseFloat(row.retention_new_pct),
          ) > 5,
      );

      console.log('Recent Cohorts (Old vs New Calculation):');
      console.log('Date       | Size | Old Logic | New Logic | Difference');
      console.log('-----------|------|-----------|-----------|------------');
      cohortQuery.rows.forEach((row: any) => {
        const diff =
          parseFloat(row.retention_new_pct) - parseFloat(row.retention_old_pct);
        console.log(
          `${row.signup_date.toISOString().split('T')[0]} | ${String(row.cohort_size).padStart(4)} | ` +
            `${String(row.retention_old_pct).padStart(7)}% | ${String(row.retention_new_pct).padStart(7)}% | ` +
            `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`,
        );
      });
      console.log();

      if (hasZeroRetention) {
        addResult({
          category: 'Cohorts',
          check: 'Day 1 Retention = 0%',
          status: 'FAIL',
          message: 'Some cohorts show 0% Day 1 retention with old calculation',
          details: {
            issue: 'Time window excludes returns within 24 hours',
            fix: 'Use calendar day logic instead of time interval',
          },
        });
      }

      if (hasDifference) {
        addResult({
          category: 'Cohorts',
          check: 'Retention Calculation Difference',
          status: 'FAIL',
          message: `Old vs new calculation shows ${Math.max(
            ...cohortQuery.rows.map((r: any) =>
              Math.abs(
                parseFloat(r.retention_old_pct) -
                  parseFloat(r.retention_new_pct),
              ),
            ),
          ).toFixed(1)}% max difference`,
          details:
            'Calendar day logic captures more returns than time interval',
        });
      } else {
        addResult({
          category: 'Cohorts',
          check: 'Day 1 Retention Calculation',
          status: 'PASS',
          message: 'Retention calculations match (no significant difference)',
        });
      }
    }
  } catch (error: any) {
    addResult({
      category: 'Cohorts',
      check: 'Cohort Retention Query',
      status: 'FAIL',
      message: `Query failed: ${error.message}`,
    });
  }
}

async function auditDAUWAUMAU() {
  console.log('=== 2. DAU/WAU/MAU CONSISTENCY AUDIT ===\n');

  try {
    const consistencyQuery = await sql`
      WITH daily_metrics AS (
        SELECT
          DATE(created_at AT TIME ZONE 'UTC') as date,
          COUNT(DISTINCT user_id) as dau
        FROM conversion_events
        WHERE event_type IN ('app_opened', 'grimoire_viewed', 'tarot_drawn', 'chart_viewed')
        AND created_at >= NOW() - INTERVAL '35 days'
        AND user_id IS NOT NULL
        AND NOT user_id LIKE 'anon:%'
        GROUP BY DATE(created_at AT TIME ZONE 'UTC')
      ),
      weekly_metrics AS (
        SELECT
          dm.date,
          COUNT(DISTINCT ce.user_id) as wau
        FROM daily_metrics dm
        CROSS JOIN conversion_events ce
        WHERE ce.event_type IN ('app_opened', 'grimoire_viewed', 'tarot_drawn', 'chart_viewed')
        AND ce.created_at >= dm.date - INTERVAL '6 days'
        AND ce.created_at <= dm.date + INTERVAL '1 day'
        AND ce.user_id IS NOT NULL
        AND NOT ce.user_id LIKE 'anon:%'
        GROUP BY dm.date
      ),
      monthly_metrics AS (
        SELECT
          dm.date,
          COUNT(DISTINCT ce.user_id) as mau
        FROM daily_metrics dm
        CROSS JOIN conversion_events ce
        WHERE ce.event_type IN ('app_opened', 'grimoire_viewed', 'tarot_drawn', 'chart_viewed')
        AND ce.created_at >= dm.date - INTERVAL '29 days'
        AND ce.created_at <= dm.date + INTERVAL '1 day'
        AND ce.user_id IS NOT NULL
        AND NOT ce.user_id LIKE 'anon:%'
        GROUP BY dm.date
      )
      SELECT
        dm.date,
        dm.dau,
        wm.wau,
        mm.mau,
        ROUND((dm.dau::numeric / NULLIF(wm.wau, 0) * 100), 1) as stickiness_dau_wau,
        ROUND((wm.wau::numeric / NULLIF(mm.mau, 0) * 100), 1) as stickiness_wau_mau,
        CASE
          WHEN dm.dau > wm.wau THEN 'DAU > WAU'
          WHEN wm.wau > mm.mau THEN 'WAU > MAU'
          ELSE 'OK'
        END as consistency_check
      FROM daily_metrics dm
      JOIN weekly_metrics wm ON dm.date = wm.date
      JOIN monthly_metrics mm ON dm.date = mm.date
      WHERE dm.date >= NOW() - INTERVAL '7 days'
      ORDER BY dm.date DESC
      LIMIT 7
    `;

    const violations = consistencyQuery.rows.filter(
      (row: any) => row.consistency_check !== 'OK',
    );

    console.log('Recent 7 Days Metrics:');
    console.log('Date       | DAU  | WAU  | MAU  | DAU/WAU | WAU/MAU | Status');
    console.log('-----------|------|------|------|---------|---------|-------');
    consistencyQuery.rows.forEach((row: any) => {
      console.log(
        `${row.date.toISOString().split('T')[0]} | ${String(row.dau).padStart(4)} | ` +
          `${String(row.wau).padStart(4)} | ${String(row.mau).padStart(4)} | ` +
          `${String(row.stickiness_dau_wau).padStart(6)}% | ${String(row.stickiness_wau_mau).padStart(6)}% | ` +
          `${row.consistency_check}`,
      );
    });
    console.log();

    if (violations.length > 0) {
      addResult({
        category: 'DAU/WAU/MAU',
        check: 'Funnel Consistency',
        status: 'FAIL',
        message: `${violations.length} days with DAU > WAU or WAU > MAU violations`,
        details: violations.map(
          (v: any) =>
            `${v.date.toISOString().split('T')[0]}: ${v.consistency_check}`,
        ),
      });
    } else {
      addResult({
        category: 'DAU/WAU/MAU',
        check: 'Funnel Consistency',
        status: 'PASS',
        message: 'All days satisfy DAU ≤ WAU ≤ MAU',
      });
    }

    // Check stickiness bounds
    const invalidStickiness = consistencyQuery.rows.filter(
      (row: any) =>
        parseFloat(row.stickiness_dau_wau) > 100 ||
        parseFloat(row.stickiness_wau_mau) > 100,
    );

    if (invalidStickiness.length > 0) {
      addResult({
        category: 'DAU/WAU/MAU',
        check: 'Stickiness Bounds',
        status: 'FAIL',
        message: `${invalidStickiness.length} days with stickiness > 100%`,
        details: invalidStickiness,
      });
    } else {
      addResult({
        category: 'DAU/WAU/MAU',
        check: 'Stickiness Bounds',
        status: 'PASS',
        message: 'All stickiness ratios within [0, 100%]',
      });
    }
  } catch (error: any) {
    addResult({
      category: 'DAU/WAU/MAU',
      check: 'Metrics Calculation',
      status: 'FAIL',
      message: `Query failed: ${error.message}`,
    });
  }
}

async function auditIdentityStitching() {
  console.log('=== 3. IDENTITY STITCHING AUDIT ===\n');

  try {
    // Check identity links coverage
    const linkCoverage = await sql`
      WITH anon_events AS (
        SELECT DISTINCT
          SUBSTRING(user_id FROM 6) as anonymous_id
        FROM conversion_events
        WHERE user_id LIKE 'anon:%'
        AND created_at >= NOW() - INTERVAL '30 days'
      ),
      linked_anons AS (
        SELECT DISTINCT anonymous_id
        FROM analytics_identity_links
        WHERE anonymous_id IN (SELECT anonymous_id FROM anon_events)
      )
      SELECT
        (SELECT COUNT(*) FROM anon_events) as total_anonymous_ids,
        (SELECT COUNT(*) FROM linked_anons) as linked_anonymous_ids,
        ROUND(
          (SELECT COUNT(*)::numeric FROM linked_anons) /
          NULLIF((SELECT COUNT(*) FROM anon_events), 0) * 100,
          1
        ) as link_coverage_pct
    `;

    const coverage = parseFloat(linkCoverage.rows[0]?.link_coverage_pct || '0');

    console.log('Identity Link Coverage:');
    console.log(
      `Total anonymous IDs: ${linkCoverage.rows[0]?.total_anonymous_ids || 0}`,
    );
    console.log(
      `Linked to user IDs: ${linkCoverage.rows[0]?.linked_anonymous_ids || 0}`,
    );
    console.log(`Coverage: ${coverage}%\n`);

    if (coverage < 50) {
      addResult({
        category: 'Identity Stitching',
        check: 'Link Coverage',
        status: 'FAIL',
        message: `Only ${coverage}% of anonymous IDs are linked to users`,
        details: 'Low coverage may cause undercounting of user returns',
      });
    } else if (coverage < 80) {
      addResult({
        category: 'Identity Stitching',
        check: 'Link Coverage',
        status: 'WARN',
        message: `${coverage}% link coverage (target: 80%+)`,
      });
    } else {
      addResult({
        category: 'Identity Stitching',
        check: 'Link Coverage',
        status: 'PASS',
        message: `${coverage}% link coverage`,
      });
    }

    // Check for orphaned links
    const orphanedLinks = await sql`
      SELECT COUNT(*) as orphaned_count
      FROM analytics_identity_links l
      WHERE NOT EXISTS (
        SELECT 1 FROM "user" u WHERE u.id = l.user_id
      )
    `;

    const orphaned = parseInt(orphanedLinks.rows[0]?.orphaned_count || '0');

    if (orphaned > 0) {
      addResult({
        category: 'Identity Stitching',
        check: 'Orphaned Links',
        status: 'WARN',
        message: `${orphaned} identity links point to non-existent users`,
        details:
          'Clean up with: DELETE FROM analytics_identity_links WHERE user_id NOT IN (SELECT id FROM "user")',
      });
    } else {
      addResult({
        category: 'Identity Stitching',
        check: 'Orphaned Links',
        status: 'PASS',
        message: 'No orphaned identity links',
      });
    }

    // Check for duplicate links (DISTINCT ON issue)
    const duplicateLinks = await sql`
      SELECT
        anonymous_id,
        COUNT(DISTINCT user_id) as user_count
      FROM analytics_identity_links
      GROUP BY anonymous_id
      HAVING COUNT(DISTINCT user_id) > 1
      LIMIT 5
    `;

    if (duplicateLinks.rows.length > 0) {
      addResult({
        category: 'Identity Stitching',
        check: 'Duplicate Anonymous IDs',
        status: 'WARN',
        message: `${duplicateLinks.rows.length} anonymous IDs linked to multiple users`,
        details: {
          note: 'DISTINCT ON may pick wrong link',
          sample: duplicateLinks.rows,
        },
      });
    } else {
      addResult({
        category: 'Identity Stitching',
        check: 'Duplicate Anonymous IDs',
        status: 'PASS',
        message: 'No duplicate anonymous ID links',
      });
    }
  } catch (error: any) {
    addResult({
      category: 'Identity Stitching',
      check: 'Identity Links Analysis',
      status: 'FAIL',
      message: `Query failed: ${error.message}`,
    });
  }
}

async function auditDeduplication() {
  console.log('=== 4. EVENT DEDUPLICATION AUDIT ===\n');

  try {
    // Check for potential duplicate events
    const duplicateAttempts = await sql`
      WITH daily_event_counts AS (
        SELECT
          user_id,
          event_type,
          DATE(created_at AT TIME ZONE 'UTC') as event_date,
          COUNT(*) as event_count
        FROM conversion_events
        WHERE event_type IN ('app_opened', 'grimoire_viewed')
        AND created_at >= NOW() - INTERVAL '7 days'
        AND user_id IS NOT NULL
        GROUP BY user_id, event_type, DATE(created_at AT TIME ZONE 'UTC')
        HAVING COUNT(*) > 1
      )
      SELECT
        event_type,
        COUNT(*) as duplicate_days,
        AVG(event_count) as avg_events_per_day,
        MAX(event_count) as max_events_per_day
      FROM daily_event_counts
      GROUP BY event_type
    `;

    if (duplicateAttempts.rows.length > 0) {
      console.log('Duplicate Events per Day:');
      console.log('Event Type      | Duplicate Days | Avg/Day | Max/Day');
      console.log('----------------|----------------|---------|--------');
      duplicateAttempts.rows.forEach((row: any) => {
        console.log(
          `${row.event_type.padEnd(15)} | ${String(row.duplicate_days).padStart(14)} | ` +
            `${String(parseFloat(row.avg_events_per_day).toFixed(1)).padStart(7)} | ` +
            `${String(row.max_events_per_day).padStart(7)}`,
        );
      });
      console.log();

      addResult({
        category: 'Deduplication',
        check: 'Daily Event Duplicates',
        status: 'WARN',
        message: 'Multiple events per user per day detected',
        details: {
          note: 'Database has daily deduplication, client has 30-min guard',
          impact: 'May indicate race condition or guard not working',
        },
      });
    } else {
      addResult({
        category: 'Deduplication',
        check: 'Daily Event Duplicates',
        status: 'PASS',
        message: 'No duplicate events per user per day',
      });
    }
  } catch (error: any) {
    addResult({
      category: 'Deduplication',
      check: 'Deduplication Analysis',
      status: 'FAIL',
      message: `Query failed: ${error.message}`,
    });
  }
}

async function auditEventListConsistency() {
  console.log('=== 5. EVENT LIST CONSISTENCY AUDIT ===\n');

  try {
    // This is a code-level check, documented as INFO
    addResult({
      category: 'Event Lists',
      check: 'Definition Consistency',
      status: 'INFO',
      message: 'Different endpoints use different "active user" event lists',
      details: {
        cohorts_route: ['app_opened'],
        dau_wau_mau_route: [
          'app_opened',
          'grimoire_viewed',
          'tarot_drawn',
          'chart_viewed',
          'horoscope_viewed',
          'ritual_started',
          'astral_chat_used',
          'daily_dashboard_viewed',
        ],
        recommendation: 'Create single source of truth in event-definitions.ts',
      },
    });
  } catch (error: any) {
    addResult({
      category: 'Event Lists',
      check: 'Event List Check',
      status: 'FAIL',
      message: `Check failed: ${error.message}`,
    });
  }
}

async function generateSummary() {
  console.log('\n=== AUDIT SUMMARY ===\n');

  const byStatus = {
    PASS: results.filter((r) => r.status === 'PASS').length,
    FAIL: results.filter((r) => r.status === 'FAIL').length,
    WARN: results.filter((r) => r.status === 'WARN').length,
    INFO: results.filter((r) => r.status === 'INFO').length,
  };

  console.log(`Total Checks: ${results.length}`);
  console.log(`✅ Passed: ${byStatus.PASS}`);
  console.log(`❌ Failed: ${byStatus.FAIL}`);
  console.log(`⚠️  Warnings: ${byStatus.WARN}`);
  console.log(`ℹ️  Info: ${byStatus.INFO}\n`);

  if (byStatus.FAIL > 0) {
    console.log('CRITICAL ISSUES (Failed Checks):');
    results
      .filter((r) => r.status === 'FAIL')
      .forEach((r) => {
        console.log(`  • ${r.category}: ${r.check}`);
        console.log(`    ${r.message}`);
      });
    console.log();
  }

  if (byStatus.WARN > 0) {
    console.log('WARNINGS:');
    results
      .filter((r) => r.status === 'WARN')
      .forEach((r) => {
        console.log(`  • ${r.category}: ${r.check}`);
        console.log(`    ${r.message}`);
      });
    console.log();
  }

  console.log('RECOMMENDATIONS:');

  const failedCategories = new Set(
    results.filter((r) => r.status === 'FAIL').map((r) => r.category),
  );

  if (failedCategories.has('Cohorts')) {
    console.log(
      '  1. Fix cohort retention calculation (use calendar day logic)',
    );
    console.log('     File: src/app/api/admin/analytics/cohorts/route.ts');
  }

  if (failedCategories.has('DAU/WAU/MAU')) {
    console.log('  2. Fix DAU/WAU/MAU calculation inconsistencies');
    console.log('     File: src/lib/analytics/kpis.ts');
  }

  if (failedCategories.has('Identity Stitching')) {
    console.log(
      '  3. Improve identity stitching coverage and fix DISTINCT ON issue',
    );
    console.log('     File: src/lib/analytics/kpis.ts (lines 15-78)');
  }

  console.log('\nNext steps:');
  console.log('  • Review failed checks above');
  console.log(
    '  • Implement fixes for P0 issues (cohorts, identity stitching)',
  );
  console.log('  • Re-run this audit after fixes');
  console.log('  • Monitor metrics for anomalies');
}

async function main() {
  console.log('🔍 ANALYTICS CALCULATIONS AUDIT\n');
  console.log('Checking database calculations for accuracy...\n');

  try {
    await auditCohorts();
    await auditDAUWAUMAU();
    await auditIdentityStitching();
    await auditDeduplication();
    await auditEventListConsistency();
    await generateSummary();
  } catch (error) {
    console.error('Audit failed:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
