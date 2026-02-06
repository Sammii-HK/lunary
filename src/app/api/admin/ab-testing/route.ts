import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

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

export async function GET(request: NextRequest) {
  try {
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

    // Group variants by test name
    const testVariantsMap = new Map<string, string[]>();
    for (const row of testsAndVariants.rows) {
      if (!row.test_name || !row.variant) continue;
      const variants = testVariantsMap.get(row.test_name) || [];
      variants.push(row.variant);
      testVariantsMap.set(row.test_name, variants);
    }

    const results: ABTestResult[] = [];

    for (const [testName, variants] of Array.from(testVariantsMap.entries())) {
      const variantMetrics: VariantMetrics[] = [];

      for (const variant of variants) {
        // Get impressions for this variant
        // Include cta_impression for SEO page A/B tests, app_opened/pricing_page_viewed for app tests
        const impressionsResult = await sql`
          SELECT COUNT(DISTINCT COALESCE(user_id, anonymous_id)) as count
          FROM conversion_events
          WHERE metadata->>'abTest' = ${testName}
            AND metadata->>'abVariant' = ${variant}
            AND event_type IN ('app_opened', 'pricing_page_viewed', 'cta_impression', 'page_viewed')
            AND created_at >= ${dateCutoff.toISOString()}
        `;

        // Get conversions for this variant
        // Include cta_click for CTA tests (click is the conversion), plus hard conversions
        const conversionsResult = await sql`
          SELECT COUNT(DISTINCT COALESCE(user_id, anonymous_id)) as count
          FROM conversion_events
          WHERE metadata->>'abTest' = ${testName}
            AND metadata->>'abVariant' = ${variant}
            AND event_type IN ('trial_started', 'subscription_started', 'trial_converted', 'cta_clicked')
            AND created_at >= ${dateCutoff.toISOString()}
        `;

        const impressions = parseInt(impressionsResult.rows[0]?.count || '0');
        const conversions = parseInt(conversionsResult.rows[0]?.count || '0');
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

      // Calculate improvement (best vs worst with traffic)
      const variantsWithTraffic = variantMetrics.filter(
        (v) => v.impressions > 0,
      );
      let improvement: number | null = null;
      let bestVariant: string | null = null;

      if (variantsWithTraffic.length >= 2) {
        const best = variantsWithTraffic[0];
        const worst = variantsWithTraffic[variantsWithTraffic.length - 1];
        bestVariant = best.name;

        if (worst.conversionRate > 0) {
          improvement =
            ((best.conversionRate - worst.conversionRate) /
              worst.conversionRate) *
            100;
        } else if (best.conversionRate > 0) {
          improvement = 100;
        }
      } else if (variantsWithTraffic.length === 1) {
        bestVariant = variantsWithTraffic[0].name;
      }

      // Calculate confidence (pairwise between top 2 variants if available)
      let confidence = 0;
      if (variantsWithTraffic.length >= 2) {
        const [first, second] = variantsWithTraffic;
        confidence = calculateConfidence(
          first.impressions,
          first.conversions,
          second.impressions,
          second.conversions,
        );
      }

      const isSignificant = confidence >= 95;

      results.push({
        testName,
        variants: variantMetrics,
        bestVariant,
        improvement,
        confidence,
        isSignificant,
        recommendation: getRecommendation(
          variantMetrics,
          confidence,
          totalImpressions,
        ),
        totalImpressions,
        totalConversions,
      });
    }

    // Sort by total impressions descending (most active tests first)
    results.sort((a, b) => b.totalImpressions - a.totalImpressions);

    return NextResponse.json({ tests: results });
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
  totalImpressions: number,
): string {
  const variantsWithTraffic = variants.filter((v) => v.impressions > 0);

  if (totalImpressions < 100) {
    return 'Need more data — collect at least 100 impressions per variant';
  }

  if (variantsWithTraffic.length === 0) {
    return 'No traffic recorded for any variant';
  }

  if (variantsWithTraffic.length === 1) {
    return 'Only one variant has traffic — need multiple variants to compare';
  }

  if (confidence < 95) {
    return `Not statistically significant (${confidence.toFixed(1)}% confidence). Continue testing.`;
  }

  const [best, second] = variantsWithTraffic;

  if (best.conversionRate > second.conversionRate) {
    const improvement =
      second.conversionRate > 0
        ? ((best.conversionRate - second.conversionRate) /
            second.conversionRate) *
          100
        : 100;
    return `"${best.name}" is winning with ${improvement.toFixed(1)}% higher conversion. Consider implementing.`;
  }

  return 'No significant difference between top variants.';
}
