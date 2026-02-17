import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

function getAIContext(): string {
  try {
    const contextPath = join(process.cwd(), 'docs', 'AI_CONTEXT.md');
    return readFileSync(contextPath, 'utf-8');
  } catch {
    return `Lunary is a cosmic/spiritual astrology app providing personalized birth chart analysis, daily horoscopes, tarot readings, and cosmic guidance.`;
  }
}

const AI_CONTEXT = getAIContext();

interface VariantMetrics {
  name: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
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
      return new Date(0);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { testName, variants, timeRange } = await request.json();

    if (!testName) {
      return NextResponse.json(
        { error: 'Test name is required' },
        { status: 400 },
      );
    }

    const dateCutoff = getDateCutoff(timeRange || '30d');

    // Get detailed event breakdown and journey data for each variant
    const variantsWithDetails = await Promise.all(
      (variants as VariantMetrics[]).map(async (variant) => {
        const events = await sql`
          SELECT event_type, COUNT(*) as count
          FROM conversion_events
          WHERE metadata->>'abTest' = ${testName}
            AND metadata->>'abVariant' = ${variant.name}
            AND created_at >= ${dateCutoff.toISOString()}
          GROUP BY event_type
          ORDER BY count DESC
        `;

        const journey = await sql`
          SELECT
            COUNT(DISTINCT CASE WHEN event_type = 'signup' THEN user_id END) as signups,
            COUNT(DISTINCT CASE WHEN event_type = 'trial_started' THEN user_id END) as trials,
            COUNT(DISTINCT CASE WHEN event_type IN ('trial_converted', 'subscription_started') THEN user_id END) as conversions
          FROM conversion_events
          WHERE metadata->>'abTest' = ${testName}
            AND metadata->>'abVariant' = ${variant.name}
            AND created_at >= ${dateCutoff.toISOString()}
        `;

        return {
          ...variant,
          events: events.rows,
          journey: journey.rows[0],
        };
      }),
    );

    // Generate AI insights
    const insights = await generateAIInsights({
      testName,
      variants: variantsWithDetails,
    });

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Failed to generate AI insights:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate insights',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

interface VariantWithDetails extends VariantMetrics {
  events: Array<Record<string, unknown>>;
  journey: Record<string, unknown>;
}

async function generateAIInsights(data: {
  testName: string;
  variants: VariantWithDetails[];
}): Promise<string> {
  try {
    const { generateContent } = await import('@/lib/ai/content-generator');

    const variantsSummary = data.variants
      .map(
        (v) => `${v.name}:
- Impressions: ${v.impressions}
- Conversions: ${v.conversions}
- Conversion Rate: ${v.conversionRate.toFixed(2)}%
- Events: ${JSON.stringify(v.events)}`,
      )
      .join('\n\n');

    const prompt = `${AI_CONTEXT}

**Task**: Analyze A/B test results for a multivariate experiment

Test: ${data.testName}

Variants (${data.variants.length} total):

${variantsSummary}

Provide concise analysis (3-4 paragraphs):
1. Key insights - which variant(s) perform best and why
2. Actionable recommendations
3. Possible reasons for performance differences
4. Next steps (more testing, implement winner, etc.)`;

    const result = await generateContent({
      systemPrompt:
        'You are a data-driven conversion optimization expert. Provide clear, actionable insights for multivariate A/B tests.',
      prompt,
      maxTokens: 600,
      temperature: 0.7,
    });

    return result || generateBasicInsights(data);
  } catch (error) {
    console.error('AI insights error:', error);
    return generateBasicInsights(data);
  }
}

function generateBasicInsights(data: {
  testName: string;
  variants: VariantWithDetails[];
}): string {
  const sortedVariants = [...data.variants].sort(
    (a, b) => b.conversionRate - a.conversionRate,
  );
  const best = sortedVariants[0];
  const worst = sortedVariants[sortedVariants.length - 1];

  const variantList = sortedVariants
    .map(
      (v, i) =>
        `${i + 1}. **${v.name}**: ${v.conversionRate.toFixed(2)}% (${v.conversions}/${v.impressions})`,
    )
    .join('\n');

  const improvement =
    worst.conversionRate > 0
      ? ((best.conversionRate - worst.conversionRate) / worst.conversionRate) *
        100
      : best.conversionRate > 0
        ? 100
        : 0;

  return `**Analysis for ${data.testName}**

**Performance Ranking:**
${variantList}

**Key Observations:**
- "${best.name}" leads with ${best.conversionRate.toFixed(2)}% conversion rate
- ${improvement > 0 ? `${improvement.toFixed(1)}% improvement over worst-performing variant` : 'No significant difference between variants'}

**Recommendation:**
${
  improvement >= 20 && best.impressions >= 50
    ? `Consider implementing "${best.name}" if statistically significant (95%+ confidence).`
    : `Continue collecting data. Current sample size may be too small for confident conclusions.`
}`;
}
