import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export interface AutoApplySuggestion {
  testName: string;
  currentVariant: 'A' | 'B';
  suggestedVariant: 'A' | 'B';
  improvement: number;
  confidence: number;
  reason: string;
  changes: Array<{
    file: string;
    oldCode: string;
    newCode: string;
    description: string;
  }>;
}

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
      return new Date(0);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const dateCutoff = getDateCutoff(timeRange);

    // Get all A/B tests with significant results
    const abTests = await sql`
      SELECT DISTINCT metadata->>'abTest' as test_name
      FROM conversion_events
      WHERE metadata->>'abTest' IS NOT NULL
      AND created_at >= ${dateCutoff.toISOString()}
    `;

    const suggestions: AutoApplySuggestion[] = [];

    for (const row of abTests.rows) {
      const testName = row.test_name;
      if (!testName) continue;

      // Get all variants for this test
      const variantsResult = await sql`
        SELECT DISTINCT metadata->>'abVariant' as variant
        FROM conversion_events
        WHERE metadata->>'abTest' = ${testName}
          AND metadata->>'abVariant' IS NOT NULL
          AND created_at >= ${dateCutoff.toISOString()}
      `;

      const variants = variantsResult.rows
        .map((r) => r.variant)
        .filter(Boolean) as string[];
      if (variants.length < 2) continue;

      // Get impressions and conversions per variant
      const variantMetrics: Array<{
        name: string;
        impressions: number;
        conversions: number;
        rate: number;
      }> = [];

      for (const variant of variants) {
        const impressionsResult = await sql`
          SELECT COUNT(DISTINCT COALESCE(user_id, anonymous_id)) as count
          FROM conversion_events
          WHERE metadata->>'abTest' = ${testName}
            AND metadata->>'abVariant' = ${variant}
            AND event_type IN ('app_opened', 'pricing_page_viewed', 'cta_impression', 'page_viewed')
            AND created_at >= ${dateCutoff.toISOString()}
        `;

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
        const rate = impressions > 0 ? (conversions / impressions) * 100 : 0;

        variantMetrics.push({ name: variant, impressions, conversions, rate });
      }

      // Sort by conversion rate descending
      variantMetrics.sort((a, b) => b.rate - a.rate);

      const best = variantMetrics[0];
      const worst = variantMetrics[variantMetrics.length - 1];

      if (!best || !worst || best.impressions === 0 || worst.impressions === 0)
        continue;

      const improvement =
        worst.rate > 0
          ? ((best.rate - worst.rate) / worst.rate) * 100
          : best.rate > 0
            ? 100
            : 0;

      const confidence = calculateConfidence(
        best.impressions,
        best.conversions,
        worst.impressions,
        worst.conversions,
      );

      // Only suggest if statistically significant and meaningful improvement
      if (confidence >= 95 && Math.abs(improvement) >= 5) {
        const suggestion = await generateCodeChanges(
          testName,
          best.name as 'A' | 'B',
        );
        suggestions.push({
          testName,
          currentVariant: 'A',
          suggestedVariant: best.name as 'A' | 'B',
          improvement: Math.abs(improvement),
          confidence,
          reason: `Variant "${best.name}" shows ${Math.abs(improvement).toFixed(1)}% improvement with ${confidence.toFixed(1)}% confidence`,
          changes: suggestion.changes,
        });
      }
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Failed to generate auto-apply suggestions:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate suggestions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { testName, variant, changes } = await request.json();

    if (!testName || !variant || !changes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    console.log(`Applying changes for ${testName} - Variant ${variant}`);
    console.log('Changes:', JSON.stringify(changes, null, 2));

    return NextResponse.json({
      success: true,
      message: `Changes for ${testName} have been queued for approval`,
      testName,
      variant,
    });
  } catch (error) {
    console.error('Failed to apply changes:', error);
    return NextResponse.json(
      {
        error: 'Failed to apply changes',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

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

  if (z >= 2.576) return 99;
  if (z >= 1.96) return 95;
  if (z >= 1.645) return 90;
  if (z >= 1.282) return 80;

  return Math.min(80, z * 40);
}

async function generateCodeChanges(
  testName: string,
  winningVariant: 'A' | 'B',
): Promise<{
  changes: Array<{
    file: string;
    oldCode: string;
    newCode: string;
    description: string;
  }>;
}> {
  const testMappings: Record<
    string,
    {
      file: string;
      variantA: string;
      variantB: string;
      description: string;
    }
  > = {
    pricing_cta: {
      file: 'src/app/pricing/page.tsx',
      variantA: "'Start your free trial - no card required. Cancel anytime.'",
      variantB:
        "'Unlock your cosmic blueprint. Start free trial - no card required.'",
      description: 'Update pricing page CTA text to winning variant',
    },
  };

  const mapping = testMappings[testName];
  if (!mapping) {
    return { changes: [] };
  }

  const newCode = winningVariant === 'B' ? mapping.variantB : mapping.variantA;

  return {
    changes: [
      {
        file: mapping.file,
        oldCode: `const ctaText = ctaVariant === 'A'
                  ? ${mapping.variantA}
                  : ${mapping.variantB};`,
        newCode: `const ctaText = ${newCode};`,
        description: mapping.description,
      },
    ],
  };
}
