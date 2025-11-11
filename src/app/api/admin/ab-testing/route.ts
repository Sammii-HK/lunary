import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export interface ABTestResult {
  testName: string;
  variantA: {
    name: string;
    impressions: number;
    conversions: number;
    conversionRate: number;
  };
  variantB: {
    name: string;
    impressions: number;
    conversions: number;
    conversionRate: number;
  };
  improvement: number;
  confidence: number;
  isSignificant: boolean;
  recommendation: string;
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

    // Get all A/B tests from metadata
    const abTests = await sql`
      SELECT DISTINCT
        metadata->>'abTest' as test_name,
        metadata->>'abVariant' as variant
      FROM conversion_events
      WHERE metadata->>'abTest' IS NOT NULL
      AND ${(sql as any).raw(dateFilter)}
    `;

    const testNames = [
      ...new Set(abTests.rows.map((r) => r.test_name).filter(Boolean)),
    ];

    const results: ABTestResult[] = [];

    for (const testName of testNames) {
      // Get impressions (app_opened or pricing_page_viewed with this test)
      const impressionsA = await sql`
        SELECT COUNT(DISTINCT user_id) as count
        FROM conversion_events
        WHERE metadata->>'abTest' = ${testName}
        AND metadata->>'abVariant' = 'A'
        AND event_type IN ('app_opened', 'pricing_page_viewed')
        AND ${(sql as any).raw(dateFilter)}
      `;

      const impressionsB = await sql`
        SELECT COUNT(DISTINCT user_id) as count
        FROM conversion_events
        WHERE metadata->>'abTest' = ${testName}
        AND metadata->>'abVariant' = 'B'
        AND event_type IN ('app_opened', 'pricing_page_viewed')
        AND ${(sql as any).raw(dateFilter)}
      `;

      // Get conversions (trial_started, subscription_started)
      const conversionsA = await sql`
        SELECT COUNT(DISTINCT user_id) as count
        FROM conversion_events
        WHERE metadata->>'abTest' = ${testName}
        AND metadata->>'abVariant' = 'A'
        AND event_type IN ('trial_started', 'subscription_started', 'trial_converted')
        AND ${(sql as any).raw(dateFilter)}
      `;

      const conversionsB = await sql`
        SELECT COUNT(DISTINCT user_id) as count
        FROM conversion_events
        WHERE metadata->>'abTest' = ${testName}
        AND metadata->>'abVariant' = 'B'
        AND event_type IN ('trial_started', 'subscription_started', 'trial_converted')
        AND ${(sql as any).raw(dateFilter)}
      `;

      const impressionsA_count = parseInt(impressionsA.rows[0]?.count || '0');
      const impressionsB_count = parseInt(impressionsB.rows[0]?.count || '0');
      const conversionsA_count = parseInt(conversionsA.rows[0]?.count || '0');
      const conversionsB_count = parseInt(conversionsB.rows[0]?.count || '0');

      const conversionRateA =
        impressionsA_count > 0
          ? (conversionsA_count / impressionsA_count) * 100
          : 0;
      const conversionRateB =
        impressionsB_count > 0
          ? (conversionsB_count / impressionsB_count) * 100
          : 0;

      const improvement =
        conversionRateA > 0
          ? ((conversionRateB - conversionRateA) / conversionRateA) * 100
          : conversionRateB > 0
            ? 100
            : 0;

      // Calculate statistical significance (chi-square test simplified)
      const confidence = calculateConfidence(
        impressionsA_count,
        conversionsA_count,
        impressionsB_count,
        conversionsB_count,
      );

      const isSignificant = confidence >= 95;

      results.push({
        testName,
        variantA: {
          name: 'Variant A',
          impressions: impressionsA_count,
          conversions: conversionsA_count,
          conversionRate: conversionRateA,
        },
        variantB: {
          name: 'Variant B',
          impressions: impressionsB_count,
          conversions: conversionsB_count,
          conversionRate: conversionRateB,
        },
        improvement,
        confidence,
        isSignificant,
        recommendation: getRecommendation(
          conversionRateA,
          conversionRateB,
          confidence,
          impressionsA_count + impressionsB_count,
        ),
      });
    }

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

// Simplified confidence calculation (chi-square approximation)
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

  // Z-score to confidence level (simplified)
  if (z >= 2.576) return 99; // 99% confidence
  if (z >= 1.96) return 95; // 95% confidence
  if (z >= 1.645) return 90; // 90% confidence
  if (z >= 1.282) return 80; // 80% confidence

  return Math.min(80, z * 40); // Rough approximation
}

function getRecommendation(
  rateA: number,
  rateB: number,
  confidence: number,
  totalImpressions: number,
): string {
  if (totalImpressions < 100) {
    return 'Need more data - collect at least 100 impressions per variant';
  }

  if (confidence < 95) {
    return `Not statistically significant (${confidence.toFixed(1)}% confidence). Continue testing.`;
  }

  if (rateB > rateA) {
    const improvement = ((rateB - rateA) / rateA) * 100;
    return `Variant B is winning! ${improvement.toFixed(1)}% improvement. Consider implementing.`;
  } else if (rateA > rateB) {
    const improvement = ((rateA - rateB) / rateB) * 100;
    return `Variant A is winning! ${improvement.toFixed(1)}% improvement. Keep current version.`;
  }

  return 'No significant difference. Both variants perform similarly.';
}
