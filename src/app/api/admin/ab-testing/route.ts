import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export interface VariantMetrics {
  name: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
}

export interface ABTestResult {
  testName: string;
  variants: VariantMetrics[];
  bestVariant: string | null;
  improvement: number | null; // % improvement of best vs worst
  confidence: number;
  isSignificant: boolean;
  recommendation: string;
  totalImpressions: number;
  totalConversions: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    let dateFilter = '';
    switch (timeRange) {
      case '7d':
        dateFilter = "created_at >= NOW() - INTERVAL '7 days'";
        break;
      case '30d':
        dateFilter = "created_at >= NOW() - INTERVAL '30 days'";
        break;
      case '90d':
        dateFilter = "created_at >= NOW() - INTERVAL '90 days'";
        break;
      default:
        dateFilter = '1=1';
    }

    // Get all unique test names and variants
    const testsAndVariants = await sql`
      SELECT DISTINCT
        metadata->>'abTest' as test_name,
        metadata->>'abVariant' as variant
      FROM conversion_events
      WHERE metadata->>'abTest' IS NOT NULL
        AND metadata->>'abVariant' IS NOT NULL
        AND ${(sql as any).raw(dateFilter)}
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
        const impressionsResult = await sql`
          SELECT COUNT(DISTINCT user_id) as count
          FROM conversion_events
          WHERE metadata->>'abTest' = ${testName}
            AND metadata->>'abVariant' = ${variant}
            AND event_type IN ('app_opened', 'pricing_page_viewed')
            AND ${(sql as any).raw(dateFilter)}
        `;

        // Get conversions for this variant
        const conversionsResult = await sql`
          SELECT COUNT(DISTINCT user_id) as count
          FROM conversion_events
          WHERE metadata->>'abTest' = ${testName}
            AND metadata->>'abVariant' = ${variant}
            AND event_type IN ('trial_started', 'subscription_started', 'trial_converted')
            AND ${(sql as any).raw(dateFilter)}
        `;

        const impressions = parseInt(impressionsResult.rows[0]?.count || '0');
        const conversions = parseInt(conversionsResult.rows[0]?.count || '0');
        const conversionRate =
          impressions > 0 ? (conversions / impressions) * 100 : 0;

        variantMetrics.push({
          name: variant,
          impressions,
          conversions,
          conversionRate,
        });
      }

      // Sort variants by conversion rate (descending)
      variantMetrics.sort((a, b) => b.conversionRate - a.conversionRate);

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
