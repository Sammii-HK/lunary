import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

function getAIContext(): string {
  try {
    const contextPath = join(process.cwd(), 'docs', 'AI_CONTEXT.md');
    return readFileSync(contextPath, 'utf-8');
  } catch (error) {
    return `Lunary is a cosmic/spiritual astrology app providing personalized birth chart analysis, daily horoscopes, tarot readings, and cosmic guidance.`;
  }
}

const AI_CONTEXT = getAIContext();

export async function POST(request: NextRequest) {
  try {
    const { testName, variantA, variantB, timeRange } = await request.json();

    if (!testName) {
      return NextResponse.json(
        { error: 'Test name is required' },
        { status: 400 },
      );
    }

    let dateFilter = '';
    switch (timeRange || '30d') {
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

    // Get detailed event breakdown
    const eventsA = await sql`
      SELECT event_type, COUNT(*) as count
      FROM conversion_events
      WHERE metadata->>'abTest' = ${testName}
      AND metadata->>'abVariant' = 'A'
      AND ${(sql as any).raw(dateFilter)}
      GROUP BY event_type
      ORDER BY count DESC
    `;

    const eventsB = await sql`
      SELECT event_type, COUNT(*) as count
      FROM conversion_events
      WHERE metadata->>'abTest' = ${testName}
      AND metadata->>'abVariant' = 'B'
      AND ${(sql as any).raw(dateFilter)}
      GROUP BY event_type
      ORDER BY count DESC
    `;

    // Get user journey data
    const journeysA = await sql`
      SELECT 
        COUNT(DISTINCT CASE WHEN event_type = 'signup' THEN user_id END) as signups,
        COUNT(DISTINCT CASE WHEN event_type = 'trial_started' THEN user_id END) as trials,
        COUNT(DISTINCT CASE WHEN event_type IN ('trial_converted', 'subscription_started') THEN user_id END) as conversions
      FROM conversion_events
      WHERE metadata->>'abTest' = ${testName}
      AND metadata->>'abVariant' = 'A'
      AND ${(sql as any).raw(dateFilter)}
    `;

    const journeysB = await sql`
      SELECT 
        COUNT(DISTINCT CASE WHEN event_type = 'signup' THEN user_id END) as signups,
        COUNT(DISTINCT CASE WHEN event_type = 'trial_started' THEN user_id END) as trials,
        COUNT(DISTINCT CASE WHEN event_type IN ('trial_converted', 'subscription_started') THEN user_id END) as conversions
      FROM conversion_events
      WHERE metadata->>'abTest' = ${testName}
      AND metadata->>'abVariant' = 'B'
      AND ${(sql as any).raw(dateFilter)}
    `;

    // Generate AI insights
    const insights = await generateAIInsights({
      testName,
      variantA: {
        ...variantA,
        events: eventsA.rows,
        journey: journeysA.rows[0],
      },
      variantB: {
        ...variantB,
        events: eventsB.rows,
        journey: journeysB.rows[0],
      },
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

async function generateAIInsights(data: any): Promise<string> {
  // If OpenAI is not configured, return basic insights
  if (!process.env.OPENAI_API_KEY) {
    return generateBasicInsights(data);
  }

  try {
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `${AI_CONTEXT}

**Task**: Analyze A/B test results

Test: ${data.testName}

Variant A:
- Impressions: ${data.variantA.impressions}
- Conversions: ${data.variantA.conversions}
- Conversion Rate: ${data.variantA.conversionRate.toFixed(2)}%
- Events: ${JSON.stringify(data.variantA.events)}

Variant B:
- Impressions: ${data.variantB.impressions}
- Conversions: ${data.variantB.conversions}
- Conversion Rate: ${data.variantB.conversionRate.toFixed(2)}%
- Events: ${JSON.stringify(data.variantB.events)}

Provide concise analysis (3-4 paragraphs):
1. Key insights
2. Actionable recommendations
3. Reasons for difference
4. Next steps`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a data-driven conversion optimization expert. Provide clear, actionable insights.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return (
      completion.choices[0]?.message?.content || generateBasicInsights(data)
    );
  } catch (error) {
    console.error('OpenAI API error:', error);
    return generateBasicInsights(data);
  }
}

function generateBasicInsights(data: any): string {
  const improvement =
    data.variantB.conversionRate - data.variantA.conversionRate;
  const isWinning = improvement > 0;

  return `**Analysis for ${data.testName}**

${isWinning ? 'Variant B' : 'Variant A'} is performing ${Math.abs(improvement).toFixed(2)}% ${isWinning ? 'better' : 'worse'} than the other variant.

**Key Observations:**
- Variant A: ${data.variantA.conversionRate.toFixed(2)}% conversion rate (${data.variantA.conversions}/${data.variantA.impressions})
- Variant B: ${data.variantB.conversionRate.toFixed(2)}% conversion rate (${data.variantB.conversions}/${data.variantB.impressions})

**Recommendation:**
${isWinning ? 'Consider implementing Variant B' : 'Keep Variant A'} if the difference is statistically significant (95%+ confidence). Continue collecting data if sample size is small (<100 impressions per variant).`;
}
