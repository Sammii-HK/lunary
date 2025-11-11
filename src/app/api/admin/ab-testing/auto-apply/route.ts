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

    // Get all A/B tests with significant results
    const abTests = await sql`
      SELECT DISTINCT metadata->>'abTest' as test_name
      FROM conversion_events
      WHERE metadata->>'abTest' IS NOT NULL
      AND ${sql.raw(dateFilter)}
    `;

    const suggestions: AutoApplySuggestion[] = [];

    for (const row of abTests.rows) {
      const testName = row.test_name;
      if (!testName) continue;

      // Get variant performance
      const impressionsA = await sql`
        SELECT COUNT(DISTINCT user_id) as count
        FROM conversion_events
        WHERE metadata->>'abTest' = ${testName}
        AND metadata->>'abVariant' = 'A'
        AND event_type IN ('app_opened', 'pricing_page_viewed')
        AND ${sql.raw(dateFilter)}
      `;

      const impressionsB = await sql`
        SELECT COUNT(DISTINCT user_id) as count
        FROM conversion_events
        WHERE metadata->>'abTest' = ${testName}
        AND metadata->>'abVariant' = 'B'
        AND event_type IN ('app_opened', 'pricing_page_viewed')
        AND ${sql.raw(dateFilter)}
      `;

      const conversionsA = await sql`
        SELECT COUNT(DISTINCT user_id) as count
        FROM conversion_events
        WHERE metadata->>'abTest' = ${testName}
        AND metadata->>'abVariant' = 'A'
        AND event_type IN ('trial_started', 'subscription_started', 'trial_converted')
        AND ${sql.raw(dateFilter)}
      `;

      const conversionsB = await sql`
        SELECT COUNT(DISTINCT user_id) as count
        FROM conversion_events
        WHERE metadata->>'abTest' = ${testName}
        AND metadata->>'abVariant' = 'B'
        AND event_type IN ('trial_started', 'subscription_started', 'trial_converted')
        AND ${sql.raw(dateFilter)}
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

      // Calculate confidence
      const confidence = calculateConfidence(
        impressionsA_count,
        conversionsA_count,
        impressionsB_count,
        conversionsB_count,
      );

      // Only suggest if statistically significant and meaningful improvement
      if (confidence >= 95 && Math.abs(improvement) >= 5) {
        const winningVariant = conversionRateB > conversionRateA ? 'B' : 'A';
        const currentVariant = 'A'; // Assume A is current (could be tracked in config)

        if (winningVariant !== currentVariant) {
          const suggestion = await generateCodeChanges(
            testName,
            winningVariant,
          );
          suggestions.push({
            testName,
            currentVariant,
            suggestedVariant: winningVariant,
            improvement: Math.abs(improvement),
            confidence,
            reason: `Variant ${winningVariant} shows ${Math.abs(improvement).toFixed(1)}% improvement with ${confidence.toFixed(1)}% confidence`,
            changes: suggestion.changes,
          });
        }
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

    // Apply changes (this would integrate with your codebase)
    // For now, we'll return a success response
    // In production, you'd want to:
    // 1. Create a git branch
    // 2. Apply the code changes
    // 3. Create a PR or commit
    // 4. Update the A/B test config to use the winning variant

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
  // Map test names to code locations
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
      variantA:
        "'Start your free trial - credit card required but no payment taken. Cancel anytime.'",
      variantB:
        "'Unlock your cosmic blueprint. Start free trial - credit card required but no payment taken.'",
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
