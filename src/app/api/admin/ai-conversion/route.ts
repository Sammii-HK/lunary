import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatTimestamp } from '@/lib/analytics/date-range';
import { readFileSync } from 'fs';
import { join } from 'path';

// Ensure conversion_events table exists
let tableChecked = false;
async function ensureConversionEventsTable() {
  if (tableChecked) return; // Only check once per server instance

  try {
    console.log('🔍 Checking if conversion_events table exists...');

    // Check if table exists first
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'conversion_events'
      )
    `;

    if (tableExists.rows[0]?.exists) {
      console.log('✅ conversion_events table already exists');
      tableChecked = true;
      return;
    }

    console.log('📦 Creating conversion_events table...');
    await sql`
      CREATE TABLE IF NOT EXISTS conversion_events (
        id SERIAL PRIMARY KEY,
        event_type TEXT NOT NULL,
        user_id TEXT,
        user_email TEXT,
        plan_type TEXT,
        trial_days_remaining INTEGER,
        feature_name TEXT,
        page_path TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    console.log('📊 Creating indexes for conversion_events...');
    // Create indexes if they don't exist
    await sql`CREATE INDEX IF NOT EXISTS idx_conversion_events_event_type ON conversion_events(event_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversion_events_user_id ON conversion_events(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversion_events_user_email ON conversion_events(user_email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversion_events_created_at ON conversion_events(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversion_events_plan_type ON conversion_events(plan_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversion_events_user_event ON conversion_events(user_id, event_type, created_at)`;

    console.log('✅ conversion_events table and indexes created successfully');
    tableChecked = true;
  } catch (error: any) {
    console.error('❌ Failed to create conversion_events table:', error);
    // Don't throw - let the query fail naturally with a better error message
    throw new Error(
      `Database setup failed: ${error.message}. Please run the database setup script or check your database connection.`,
    );
  }
}

// Load AI context once and cache it
let cachedAIContext: string | null = null;

function getAIContext(): string {
  if (cachedAIContext) {
    return cachedAIContext;
  }

  try {
    const contextPath = join(process.cwd(), 'docs', 'AI_CONTEXT.md');
    cachedAIContext = readFileSync(contextPath, 'utf-8');
    return cachedAIContext;
  } catch (error) {
    // Fallback if file doesn't exist - minimal context to save tokens
    cachedAIContext = `Lunary: Cosmic astrology app. Personalized birth charts, horoscopes, tarot. Free trial → paid ($4.99/mo or $39.99/yr). Focus: personalization, real astronomy, cosmic/spiritual tone.`;
    return cachedAIContext;
  }
}

const AI_CONTEXT = getAIContext();

export async function POST(request: NextRequest) {
  try {
    // Ensure table exists before processing
    try {
      await ensureConversionEventsTable();
    } catch (tableError: any) {
      console.error('Table creation error:', tableError);
      return NextResponse.json(
        {
          error: 'Database setup failed',
          details:
            tableError.message || 'Could not create conversion_events table',
          hint: 'Please run: pnpm setup-db or check your database connection',
        },
        { status: 500 },
      );
    }

    const { type, data } = await request.json();

    switch (type) {
      case 'generate-cta':
        return await generatePersonalizedCTA(data);
      case 'analyze-funnel':
        return await analyzeConversionFunnel(data);
      case 'suggest-tests':
        return await suggestABTests(data);
      case 'optimize-email':
        return await optimizeEmailCopy(data);
      case 'predict-churn':
        return await predictChurn(data);
      case 'personalize-experience':
        return await personalizeExperience(data);
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('AI conversion optimization error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

async function generatePersonalizedCTA(data: {
  context: string;
  userSegment?: string;
  goal: string;
}): Promise<NextResponse> {
  const { generateStructuredContent } =
    await import('@/lib/ai/content-generator');
  const { z } = await import('zod');

  const prompt = `Context: ${data.context}
Goal: ${data.goal}
${data.userSegment ? `Segment: ${data.userSegment}` : ''}

Generate 5 CTAs (under 10 words, cosmic tone, conversion-focused).`;

  const result = await generateStructuredContent({
    systemPrompt: `${AI_CONTEXT}\n\nYou are a conversion copywriting expert for Lunary.`,
    prompt,
    schema: z.object({ ctas: z.array(z.string()) }),
    schemaName: 'ctaList',
    maxTokens: 200,
    temperature: 0.7,
  });

  return NextResponse.json({ ctas: result.ctas });
}

async function analyzeConversionFunnel(data: {
  timeRange?: string;
}): Promise<NextResponse> {
  const timeRange = data.timeRange || '30d';

  // Calculate the date threshold based on time range
  const days = timeRange === '7d' ? 7 : 30;
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - days);

  // Get funnel data
  const funnel = await sql`
    SELECT 
      event_type,
      COUNT(DISTINCT user_id) as users,
      COUNT(*) as events
    FROM conversion_events
    WHERE created_at >= ${formatTimestamp(thresholdDate)}
    GROUP BY event_type
    ORDER BY 
      CASE event_type
        WHEN 'app_opened' THEN 1
        WHEN 'signup' THEN 2
        WHEN 'birth_data_submitted' THEN 3
        WHEN 'pricing_page_viewed' THEN 4
        WHEN 'trial_started' THEN 5
        WHEN 'subscription_started' THEN 6
        ELSE 7
      END
  `;

  const { generateContent } = await import('@/lib/ai/content-generator');

  const funnelData = funnel.rows.map((r: any) => ({
    event: r.event_type,
    users: r.users,
    events: r.events,
  }));

  const prompt = `Analyze conversion funnel (${timeRange}) using ONLY the real data provided below. Do NOT invent or estimate any numbers - only reference the actual data shown.

Real Funnel Data:
${JSON.stringify(funnelData, null, 2)}

Provide analysis:
1) Drop-off points (identify where users drop off based on the data above)
2) Opportunities (based on actual user counts)
3) Actionable recommendations (qualitative suggestions, no fake numbers)
4) Focus areas (what to prioritize based on the real data)

IMPORTANT: Do NOT include any percentage estimates, conversion rate predictions, or impact numbers. Only reference the actual user/event counts from the data above.`;

  let analysis = await generateContent({
    systemPrompt: `${AI_CONTEXT}\n\nYou are a conversion optimization expert. Provide specific, actionable insights.`,
    prompt,
    maxTokens: 400,
    temperature: 0.5,
  });

  // Add data disclaimer if funnel has no data
  if (funnel.rows.length === 0) {
    analysis = `⚠️ No funnel data available for the selected time range (${timeRange}).\n\nPlease ensure conversion events are being tracked. The analysis below is based on no data and should be treated as general recommendations only.\n\n${analysis}`;
  } else {
    // Prepend actual data summary
    const dataSummary = funnel.rows
      .map(
        (r: any) => `- ${r.event_type}: ${r.users} users, ${r.events} events`,
      )
      .join('\n');
    analysis = `📊 Actual Funnel Data (${timeRange}):\n${dataSummary}\n\n---\n\n${analysis}`;
  }

  return NextResponse.json({
    funnel: funnel.rows,
    analysis,
    dataAvailable: funnel.rows.length > 0,
  });
}

async function suggestABTests(data: {
  currentTests?: string[];
  conversionGoals?: string[];
}): Promise<NextResponse> {
  const { generateStructuredContent } =
    await import('@/lib/ai/content-generator');
  const { z } = await import('zod');

  // Get current conversion rates
  const currentRates = await sql`
    SELECT
      COUNT(DISTINCT CASE WHEN event_type = 'signup' THEN user_id END) as signups,
      COUNT(DISTINCT CASE WHEN event_type = 'trial_started' THEN user_id END) as trials,
      COUNT(DISTINCT CASE WHEN event_type IN ('trial_converted', 'subscription_started') THEN user_id END) as conversions
    FROM conversion_events
    WHERE created_at >= NOW() - INTERVAL '30 days'
  `;

  const rates = currentRates.rows[0];
  const prompt = `Suggest 5 A/B tests based on REAL data only. Do NOT invent conversion rates or impact numbers.

ACTUAL Current Stats (30d):
- Signups: ${rates?.signups || 0} unique users
- Trials: ${rates?.trials || 0} unique users
- Conversions: ${rates?.conversions || 0} unique users

Goals: ${data.conversionGoals?.join(', ') || 'Increase trial conversions'}
${data.currentTests?.length ? `Current tests: ${data.currentTests.join(', ')}` : ''}

For each test provide: name, hypothesis, variantA, variantB, difficulty (easy/medium/hard), and why it might help (qualitative reasoning only).

CRITICAL: Do NOT include "expectedImpact", "conversionRate", or any numeric predictions. Only provide qualitative reasoning based on the actual numbers above.`;

  const suggestions = await generateStructuredContent({
    systemPrompt: `${AI_CONTEXT}\n\nYou are a data-driven conversion optimization expert.`,
    prompt,
    schema: z.object({
      tests: z.array(
        z.object({
          name: z.string(),
          hypothesis: z.string(),
          variantA: z.string(),
          variantB: z.string(),
          difficulty: z.enum(['easy', 'medium', 'hard']),
          reasoning: z.string(),
        }),
      ),
    }),
    schemaName: 'abTests',
    maxTokens: 600,
    temperature: 0.7,
  });

  // Add actual stats to response for transparency
  return NextResponse.json({
    suggestions: suggestions.tests,
    actualStats: {
      signups: rates?.signups || 0,
      trials: rates?.trials || 0,
      conversions: rates?.conversions || 0,
      timeRange: '30d',
    },
  });
}

async function optimizeEmailCopy(data: {
  emailType: string;
  currentCopy: string;
  goal: string;
}): Promise<NextResponse> {
  const { generateStructuredContent } =
    await import('@/lib/ai/content-generator');
  const { z } = await import('zod');

  const prompt = `Optimize email copy.

Type: ${data.emailType}
Goal: ${data.goal}
Current: ${data.currentCopy}

Provide: subject, body (HTML), improvements, reasoning. Keep cosmic tone, conversion-focused.`;

  const optimized = await generateStructuredContent({
    systemPrompt: `${AI_CONTEXT}\n\nYou are an email marketing expert specializing in conversion optimization for Lunary.`,
    prompt,
    schema: z.object({
      subject: z.string(),
      body: z.string(),
      improvements: z.array(z.string()),
      reasoning: z.string(),
    }),
    schemaName: 'emailOptimization',
    maxTokens: 800,
    temperature: 0.7,
  });

  return NextResponse.json({ optimized });
}

async function predictChurn(data: { userId?: string }): Promise<NextResponse> {
  if (!data.userId) {
    // Analyze all users
    const userActivity = await sql`
      SELECT 
        user_id,
        MAX(created_at) as last_activity,
        COUNT(*) as total_events,
        COUNT(DISTINCT event_type) as unique_events
      FROM conversion_events
      WHERE created_at >= NOW() - INTERVAL '90 days'
      GROUP BY user_id
    `;

    const { generateStructuredContent } =
      await import('@/lib/ai/content-generator');
    const { z } = await import('zod');

    const activityData = userActivity.rows.slice(0, 50).map((r: any) => ({
      userId: r.user_id,
      lastActivity: r.last_activity,
      totalEvents: r.total_events,
      uniqueEvents: r.unique_events,
    }));

    const prompt = `Analyze churn risk from REAL user activity data. Do NOT invent statistics or percentages.

Real User Activity Data (last 90 days):
${JSON.stringify(activityData, null, 2)}

Provide analysis:
- highRiskUsers: Array of user IDs with low activity (based on actual activity patterns)
- patterns: Qualitative patterns observed in the data (no fake percentages)
- interventions: Actionable recommendations (qualitative only)
- reEngagement: Suggestions for re-engaging users (no numeric predictions)

IMPORTANT: Only reference the actual data provided. Do NOT include conversion rates, churn percentages, or any invented statistics.`;

    const predictions = await generateStructuredContent({
      systemPrompt: `${AI_CONTEXT}\n\nYou are a customer retention expert for Lunary.`,
      prompt,
      schema: z.object({
        highRiskUsers: z.array(z.string()),
        patterns: z.array(z.string()),
        interventions: z.array(z.string()),
        reEngagement: z.array(z.string()),
      }),
      schemaName: 'churnPrediction',
      maxTokens: 800,
      temperature: 0.5,
    });

    // Add actual data summary for transparency
    return NextResponse.json({
      predictions,
      actualData: {
        usersAnalyzed: userActivity.rows.length,
        sampleSize: Math.min(50, userActivity.rows.length),
        timeRange: '90 days',
      },
    });
  }

  // Single user analysis
  return NextResponse.json({
    message: 'Single user churn prediction coming soon',
  });
}

async function personalizeExperience(data: {
  userId: string;
  context: string;
}): Promise<NextResponse> {
  // Get user's conversion events
  const userEvents = await sql`
    SELECT event_type, created_at, metadata
    FROM conversion_events
    WHERE user_id = ${data.userId}
    ORDER BY created_at DESC
    LIMIT 20
  `;

  const { generateStructuredContent } =
    await import('@/lib/ai/content-generator');
  const { z } = await import('zod');

  const eventsData = userEvents.rows.map((r: any) => ({
    event: r.event_type,
    date: r.created_at,
    metadata: r.metadata,
  }));

  const prompt = `Personalize experience.

User Events: ${JSON.stringify(eventsData)}
Context: ${data.context}

Provide: featuresToHighlight (array), personalizedMessaging (object), optimalTiming, contentRecommendations.`;

  const personalization = await generateStructuredContent({
    systemPrompt: `${AI_CONTEXT}\n\nYou are a personalization expert for Lunary.`,
    prompt,
    schema: z.object({
      featuresToHighlight: z.array(z.string()),
      personalizedMessaging: z.record(z.string(), z.string()),
      optimalTiming: z.string(),
      contentRecommendations: z.array(z.string()),
    }),
    schemaName: 'personalization',
    maxTokens: 500,
    temperature: 0.7,
  });

  return NextResponse.json({ personalization });
}
