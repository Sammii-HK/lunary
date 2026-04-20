import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

// Tests that have been concluded and hardcoded — exclude from dashboard
const CONCLUDED_TESTS = new Set([
  'inline_cta', // sparkles won (0.79% CTR, 90% confidence). Hardcoded in components.
  // Legacy flat CTA tests — replaced by per-hub tests (seo_cta_{hub}, seo_sticky_cta_{hub})
  'seo_cta_copy',
  'seo_sticky_cta_copy',
]);

// Tests where copy was rewritten — old data predates the change and must be excluded.
// These hubs had 0% click-through with chart-focused CTAs, rewritten 2026-04-13
// to match reader intent (numerology for angel/clock numbers, moon timing for crystals).
// Data before this date is noise. Filter applies automatically via dateCutoff.
const REWRITTEN_TESTS_CUTOFF = new Date('2026-04-13T12:00:00Z');
const REWRITTEN_TESTS = new Set([
  'seo_cta_angelNumbers',
  'seo_cta_clockNumbers',
  'seo_cta_crystals',
  'seo_cta_weeklyForecast',
  'seo_sticky_cta_angelNumbers',
  'seo_sticky_cta_clockNumbers',
  'seo_sticky_cta_crystals',
  'seo_sticky_cta_weeklyForecast',
]);

// Tests that have hub-specific variants mixed in from legacy tracking.
// Variants matching {hubName}_{digit} should be filtered out — they're
// already tracked correctly under per-hub tests (seo_cta_{hub}).
const TESTS_WITH_LEGACY_HUB_VARIANTS = new Set(['cta_copy', 'sticky_cta_copy']);
const LEGACY_HUB_VARIANT_PATTERN = /^[a-zA-Z]+_\d+$/;

// These tests currently do not emit a trustworthy variant-specific conversion
// event. Showing them with the generic app/page -> trial/subscription funnel
// creates impossible rates (>100%) and should be suppressed until they are
// instrumented properly.
const UNINSTRUMENTED_TESTS = new Set([
  'weekly_lock',
  'tarot_truncation',
  'transit_limit',
]);

export interface VariantMetrics {
  name: string;
  impressions: number;
  conversions: number;
  conversionRate: number | null; // null when impressions = 0
}

export interface ABTestResult {
  testName: string;
  variants: VariantMetrics[];
  bestVariant: string | null;
  improvement: number | null;
  confidence: number;
  isSignificant: boolean;
  recommendation: string;
  status: 'significant' | 'promising' | 'collecting' | 'sub_par' | 'no_data';
  totalImpressions: number;
  totalConversions: number;
}

// Helper to get date cutoff based on time range
function getDateCutoff(timeRange: string): Date {
  const now = new Date();
  switch (timeRange) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(0); // Beginning of time
  }
}

async function getVariantImpressions(
  testName: string,
  variant: string,
  dateCutoffIso: string,
): Promise<number> {
  const result = await sql`
    SELECT COUNT(DISTINCT COALESCE(user_id, anonymous_id)) as count
    FROM conversion_events
    WHERE metadata->>'abTest' = ${testName}
      AND metadata->>'abVariant' = ${variant}
      AND event_type IN ('app_opened', 'pricing_page_viewed', 'cta_impression', 'page_viewed')
      AND created_at >= ${dateCutoffIso}
  `;

  return parseInt(result.rows[0]?.count || '0');
}

async function getVariantConversions(
  testName: string,
  variant: string,
  dateCutoffIso: string,
): Promise<number> {
  if (UNINSTRUMENTED_TESTS.has(testName)) {
    return 0;
  }

  if (testName === 'paywall_preview' || testName === 'feature_preview') {
    const result = await sql`
      SELECT COUNT(DISTINCT COALESCE(user_id, anonymous_id)) as count
      FROM conversion_events
      WHERE event_type = 'locked_content_clicked'
        AND metadata->>'preview_variant' = ${variant}
        AND created_at >= ${dateCutoffIso}
    `;
    return parseInt(result.rows[0]?.count || '0');
  }

  if (testName === 'transit_overflow') {
    const result = await sql`
      SELECT COUNT(DISTINCT COALESCE(user_id, anonymous_id)) as count
      FROM conversion_events
      WHERE event_type = 'locked_content_clicked'
        AND metadata->>'overflow_variant' = ${variant}
        AND created_at >= ${dateCutoffIso}
    `;
    return parseInt(result.rows[0]?.count || '0');
  }

  const result = await sql`
    SELECT COUNT(DISTINCT COALESCE(user_id, anonymous_id)) as count
    FROM conversion_events
    WHERE metadata->>'abTest' = ${testName}
      AND metadata->>'abVariant' = ${variant}
      AND event_type IN ('trial_started', 'subscription_started', 'trial_converted', 'cta_clicked')
      AND created_at >= ${dateCutoffIso}
  `;

  return parseInt(result.rows[0]?.count || '0');
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const dateCutoff = getDateCutoff(timeRange);

    // Get all unique test names and variants
    const testsAndVariants = await sql`
      SELECT DISTINCT
        metadata->>'abTest' as test_name,
        metadata->>'abVariant' as variant
      FROM conversion_events
      WHERE metadata->>'abTest' IS NOT NULL
        AND metadata->>'abVariant' IS NOT NULL
        AND created_at >= ${dateCutoff.toISOString()}
      ORDER BY test_name, variant
    `;

    // Group variants by test name, skipping concluded tests and legacy hub variants
    const testVariantsMap = new Map<string, string[]>();
    for (const row of testsAndVariants.rows) {
      if (!row.test_name || !row.variant) continue;
      if (CONCLUDED_TESTS.has(row.test_name)) continue;
      if (UNINSTRUMENTED_TESTS.has(row.test_name)) continue;
      // Filter out legacy hub-specific variants (e.g. "horoscopes_4", "angelNumbers_2")
      // from tests that had them accidentally bundled in. These are already tracked
      // under per-hub tests (seo_cta_{hub}).
      if (
        TESTS_WITH_LEGACY_HUB_VARIANTS.has(row.test_name) &&
        LEGACY_HUB_VARIANT_PATTERN.test(row.variant)
      ) {
        continue;
      }
      const variants = testVariantsMap.get(row.test_name) || [];
      variants.push(row.variant);
      testVariantsMap.set(row.test_name, variants);
    }

    const results: ABTestResult[] = [];

    for (const [testName, variants] of Array.from(testVariantsMap.entries())) {
      const variantMetrics: VariantMetrics[] = [];

      // For rewritten tests, use the rewrite date as cutoff to exclude stale data
      const effectiveCutoff = REWRITTEN_TESTS.has(testName)
        ? new Date(
            Math.max(dateCutoff.getTime(), REWRITTEN_TESTS_CUTOFF.getTime()),
          )
        : dateCutoff;

      for (const variant of variants) {
        const cutoffIso = effectiveCutoff.toISOString();
        const impressions = await getVariantImpressions(
          testName,
          variant,
          cutoffIso,
        );
        const conversions = await getVariantConversions(
          testName,
          variant,
          cutoffIso,
        );
        // null when no impressions - can't calculate rate without a denominator
        const conversionRate =
          impressions > 0 ? (conversions / impressions) * 100 : null;

        variantMetrics.push({
          name: variant,
          impressions,
          conversions,
          conversionRate,
        });
      }

      // Sort variants by conversion rate (descending), nulls last
      variantMetrics.sort((a, b) => {
        if (a.conversionRate === null && b.conversionRate === null) return 0;
        if (a.conversionRate === null) return 1;
        if (b.conversionRate === null) return -1;
        return b.conversionRate - a.conversionRate;
      });

      const totalImpressions = variantMetrics.reduce(
        (sum, v) => sum + v.impressions,
        0,
      );
      const totalConversions = variantMetrics.reduce(
        (sum, v) => sum + v.conversions,
        0,
      );

      // Calculate improvement and confidence using same pair (best vs runner-up)
      const variantsWithTraffic = variantMetrics.filter(
        (v) => v.impressions > 0,
      );
      let improvement: number | null = null;
      let bestVariant: string | null = null;
      let confidence = 0;

      if (variantsWithTraffic.length >= 2) {
        const [best, runnerUp] = variantsWithTraffic;
        bestVariant = best.name;
        const bestRate = best.conversionRate ?? 0;
        const runnerUpRate = runnerUp.conversionRate ?? 0;

        if (runnerUpRate > 0) {
          improvement = ((bestRate - runnerUpRate) / runnerUpRate) * 100;
        } else if (bestRate > 0) {
          improvement = 100;
        }

        confidence = calculateConfidence(
          best.impressions,
          best.conversions,
          runnerUp.impressions,
          runnerUp.conversions,
        );
      } else if (variantsWithTraffic.length === 1) {
        bestVariant = variantsWithTraffic[0].name;
      }

      // Require minimum 100 impressions per compared variant for significance
      const minPerVariantImpressions =
        variantsWithTraffic.length >= 2
          ? Math.min(
              variantsWithTraffic[0].impressions,
              variantsWithTraffic[1].impressions,
            )
          : 0;
      const hasEnoughData = minPerVariantImpressions >= 100;
      const isSignificant = confidence >= 95 && hasEnoughData;

      const recommendation = getRecommendation(
        variantMetrics,
        confidence,
        hasEnoughData,
      );

      // Compute status for programmatic consumption
      let status: ABTestResult['status'] = 'collecting';
      if (isSignificant) {
        status = 'significant';
      } else if (recommendation.startsWith('Sub-par')) {
        status = 'sub_par';
      } else if (totalImpressions === 0) {
        status = 'no_data';
      } else if (confidence >= 70 && hasEnoughData) {
        status = 'promising';
      }

      results.push({
        testName,
        variants: variantMetrics,
        bestVariant,
        improvement,
        confidence,
        isSignificant,
        recommendation,
        status,
        totalImpressions,
        totalConversions,
      });
    }

    // Sort by total impressions descending (most active tests first)
    results.sort((a, b) => b.totalImpressions - a.totalImpressions);

    // Build hub summary — aggregate across both old flat tests and new per-hub tests
    // This answers "which grimoire hub converts best?" regardless of copy variant
    const hubSummary = await buildHubSummary(dateCutoff);

    return NextResponse.json({ tests: results, hubSummary });
  } catch (error) {
    console.error('Failed to fetch A/B test results:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch A/B test results',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// Hub-level summary: aggregate impressions + conversions by grimoire hub
// Works with both old flat test data (variant = "horoscopes_4") and new per-hub data
interface HubMetrics {
  hub: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
}

async function buildHubSummary(dateCutoff: Date): Promise<HubMetrics[]> {
  // Query all CTA events and extract hub from either:
  // 1. New format: test name = seo_cta_{hub} or seo_sticky_cta_{hub}
  // 2. Old format: test name = seo_cta_copy, variant = {hub}_{index}
  // 3. metadata->>'hub' field (tracked on all CTA events)
  const hubData = await sql`
    SELECT
      COALESCE(
        metadata->>'hub',
        CASE
          WHEN metadata->>'abTest' LIKE 'seo_cta_%' AND metadata->>'abTest' != 'seo_cta_copy'
            THEN REPLACE(metadata->>'abTest', 'seo_cta_', '')
          WHEN metadata->>'abTest' LIKE 'seo_sticky_cta_%' AND metadata->>'abTest' != 'seo_sticky_cta_copy'
            THEN REPLACE(metadata->>'abTest', 'seo_sticky_cta_', '')
          WHEN metadata->>'abVariant' LIKE '%_%'
            THEN REGEXP_REPLACE(metadata->>'abVariant', '_[0-9]+$', '')
          ELSE 'unknown'
        END
      ) as hub,
      event_type,
      COUNT(DISTINCT COALESCE(user_id, anonymous_id)) as unique_users
    FROM conversion_events
    WHERE (
      metadata->>'abTest' IN ('seo_cta_copy', 'seo_sticky_cta_copy')
      OR metadata->>'abTest' LIKE 'seo_cta_%'
      OR metadata->>'abTest' LIKE 'seo_sticky_cta_%'
    )
      AND event_type IN ('cta_impression', 'cta_clicked')
      AND created_at >= ${dateCutoff.toISOString()}
    GROUP BY hub, event_type
    ORDER BY hub
  `;

  // Aggregate into hub metrics
  const hubMap = new Map<
    string,
    { impressions: number; conversions: number }
  >();
  for (const row of hubData.rows) {
    const hub = row.hub as string;
    if (hub === 'unknown') continue;
    const current = hubMap.get(hub) || { impressions: 0, conversions: 0 };
    if (row.event_type === 'cta_impression') {
      current.impressions = parseInt(row.unique_users as string);
    } else if (row.event_type === 'cta_clicked') {
      current.conversions = parseInt(row.unique_users as string);
    }
    hubMap.set(hub, current);
  }

  const summary: HubMetrics[] = [];
  for (const [hub, data] of hubMap.entries()) {
    summary.push({
      hub,
      impressions: data.impressions,
      conversions: data.conversions,
      conversionRate:
        data.impressions > 0 ? (data.conversions / data.impressions) * 100 : 0,
    });
  }

  // Sort by impressions descending
  summary.sort((a, b) => b.impressions - a.impressions);
  return summary;
}

// Simplified confidence calculation (z-test for two proportions)
function calculateConfidence(
  n1: number,
  x1: number,
  n2: number,
  x2: number,
): number {
  if (n1 === 0 || n2 === 0) return 0;

  const p1 = x1 / n1;
  const p2 = x2 / n2;
  const p = (x1 + x2) / (n1 + n2);

  if (p === 0 || p === 1) return 0;

  const se = Math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2));
  if (se === 0) return 0;

  const z = Math.abs(p2 - p1) / se;

  // Z-score to confidence level
  if (z >= 2.576) return 99; // 99% confidence
  if (z >= 1.96) return 95; // 95% confidence
  if (z >= 1.645) return 90; // 90% confidence
  if (z >= 1.282) return 80; // 80% confidence

  return Math.min(80, z * 40); // Rough approximation
}

function getRecommendation(
  variants: VariantMetrics[],
  confidence: number,
  hasEnoughData: boolean,
): string {
  const variantsWithTraffic = variants.filter((v) => v.impressions > 0);

  if (variantsWithTraffic.length === 0) {
    return 'No traffic recorded for any variant';
  }

  if (variantsWithTraffic.length === 1) {
    return 'Only one variant has traffic — need multiple variants to compare';
  }

  // Flag sub-par tests: enough impressions but zero or near-zero conversions
  const totalImpressions = variantsWithTraffic.reduce(
    (sum, v) => sum + v.impressions,
    0,
  );
  const totalConversions = variantsWithTraffic.reduce(
    (sum, v) => sum + v.conversions,
    0,
  );

  if (totalImpressions >= 200 && totalConversions === 0) {
    return 'Sub-par: 0 conversions despite significant impressions. CTA copy likely does not match reader intent. Rewrite recommended.';
  }

  if (
    totalImpressions >= 500 &&
    totalConversions > 0 &&
    (totalConversions / totalImpressions) * 100 < 0.1
  ) {
    return `Sub-par: ${totalConversions} conversions from ${totalImpressions} impressions (${((totalConversions / totalImpressions) * 100).toFixed(2)}%). CTA may need stronger hook or better intent match.`;
  }

  if (!hasEnoughData) {
    return 'Need more data — collect at least 100 impressions per variant';
  }

  if (confidence < 95) {
    return `Not statistically significant (${confidence.toFixed(1)}% confidence). Continue testing.`;
  }

  const [best, second] = variantsWithTraffic;

  const bestRate = best.conversionRate ?? 0;
  const secondRate = second.conversionRate ?? 0;

  if (bestRate > secondRate) {
    const improvementPct =
      secondRate > 0 ? ((bestRate - secondRate) / secondRate) * 100 : 100;
    return `"${best.name}" is winning with ${improvementPct.toFixed(1)}% higher conversion. Consider implementing.`;
  }

  return 'No significant difference between top variants.';
}
