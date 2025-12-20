import { PostHog } from 'posthog-node';

let posthogClient: PostHog | null = null;

export function getPostHogServer(): PostHog | null {
  if (posthogClient) return posthogClient;

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey) return null;

  posthogClient = new PostHog(apiKey, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    flushAt: 1,
    flushInterval: 0,
  });

  return posthogClient;
}

export interface LLMGenerationEvent {
  distinctId: string;
  model: string;
  provider?: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  input?: string;
  output?: string;
  traceId?: string;
  success?: boolean;
  error?: string;
}

const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4o': { input: 0.0025, output: 0.01 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
};

function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const costs = MODEL_COSTS[model] || MODEL_COSTS['gpt-4o-mini'];
  return (
    (inputTokens / 1000) * costs.input + (outputTokens / 1000) * costs.output
  );
}

export function captureAIGeneration(event: LLMGenerationEvent): void {
  const posthog = getPostHogServer();
  if (!posthog) return;

  const cost = calculateCost(
    event.model,
    event.inputTokens,
    event.outputTokens,
  );

  posthog.capture({
    distinctId: event.distinctId,
    event: '$ai_generation',
    properties: {
      $ai_model: event.model,
      $ai_provider: event.provider || 'openai',
      $ai_input_tokens: event.inputTokens,
      $ai_output_tokens: event.outputTokens,
      $ai_latency: event.latencyMs / 1000,
      $ai_total_cost_usd: cost,
      $ai_trace_id: event.traceId,
      $ai_input: event.input,
      $ai_output_choices: event.output
        ? [{ content: event.output }]
        : undefined,
      $ai_is_error: event.success === false,
      $ai_error: event.error,
    },
  });
}

export function captureEvent(
  distinctId: string,
  eventName: string,
  properties?: Record<string, unknown>,
): void {
  const posthog = getPostHogServer();
  if (!posthog) return;

  posthog.capture({
    distinctId,
    event: eventName,
    properties,
  });
}

export async function shutdownPostHog(): Promise<void> {
  if (posthogClient) {
    await posthogClient.shutdown();
    posthogClient = null;
  }
}

const POSTHOG_API_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

export async function queryPostHogAPI<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T | null> {
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
  if (!apiKey) {
    console.warn(
      '[PostHog] POSTHOG_PERSONAL_API_KEY not set, skipping API query',
    );
    return null;
  }

  const projectId = process.env.POSTHOG_PROJECT_ID;
  if (!projectId) {
    console.warn('[PostHog] POSTHOG_PROJECT_ID not set, skipping API query');
    return null;
  }

  try {
    const url = `${POSTHOG_API_HOST}/api/projects/${projectId}${endpoint}`;
    console.log(`[PostHog API] Querying: ${endpoint} (project: ${projectId})`);
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[PostHog API] Error ${response.status} for ${endpoint}: ${errorText}`,
      );
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('[PostHog API] Query failed:', error);
    return null;
  }
}

export interface PostHogActiveUsers {
  dau: number;
  wau: number;
  mau: number;
}

export async function getPostHogActiveUsers(): Promise<PostHogActiveUsers | null> {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split('T')[0];

  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);
  const monthAgoStr = monthAgo.toISOString().split('T')[0];

  // Use HogQL Query API instead of Insights API (Personal API Keys don't support Insights)
  const [dauResult, wauResult, mauResult] = await Promise.all([
    queryPostHogAPI<{ results: Array<Array<number>> }>('/query/', {
      method: 'POST',
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query: `SELECT count(DISTINCT person_id) FROM events WHERE event = '$pageview' AND timestamp >= today()`,
        },
      }),
    }),
    queryPostHogAPI<{ results: Array<Array<number>> }>('/query/', {
      method: 'POST',
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query: `SELECT count(DISTINCT person_id) FROM events WHERE event = '$pageview' AND timestamp >= now() - INTERVAL 7 DAY`,
        },
      }),
    }),
    queryPostHogAPI<{ results: Array<Array<number>> }>('/query/', {
      method: 'POST',
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query: `SELECT count(DISTINCT person_id) FROM events WHERE event = '$pageview' AND timestamp >= now() - INTERVAL 30 DAY`,
        },
      }),
    }),
  ]);

  if (!dauResult || !wauResult || !mauResult) {
    return null;
  }

  return {
    dau: dauResult.results?.[0]?.[0] || 0,
    wau: wauResult.results?.[0]?.[0] || 0,
    mau: mauResult.results?.[0]?.[0] || 0,
  };
}

export interface PostHogAIMetrics {
  totalGenerations: number;
  uniqueUsers: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUsd: number;
  avgLatencySeconds: number;
}

export async function getPostHogAIMetrics(
  daysBack: number = 30,
): Promise<PostHogAIMetrics | null> {
  // Use HogQL Query API instead of Insights API
  const result = await queryPostHogAPI<{ results: Array<Array<number>> }>(
    '/query/',
    {
      method: 'POST',
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query: `
            SELECT 
              count(*) as total_generations,
              count(DISTINCT person_id) as unique_users,
              sum(toFloat64OrNull(properties['$ai_input_tokens'])) as input_tokens,
              sum(toFloat64OrNull(properties['$ai_output_tokens'])) as output_tokens,
              sum(toFloat64OrNull(properties['$ai_total_cost_usd'])) as total_cost,
              avg(toFloat64OrNull(properties['$ai_latency'])) as avg_latency
            FROM events 
            WHERE event = '$ai_generation' 
              AND timestamp >= now() - INTERVAL ${daysBack} DAY
          `,
        },
      }),
    },
  );

  if (!result?.results?.[0]) {
    return null;
  }

  const row = result.results[0];
  return {
    totalGenerations: row[0] || 0,
    uniqueUsers: row[1] || 0,
    totalInputTokens: row[2] || 0,
    totalOutputTokens: row[3] || 0,
    totalCostUsd: row[4] || 0,
    avgLatencySeconds: row[5] || 0,
  };
}

export interface PostHogRetention {
  day1: number;
  day7: number;
  day30: number;
}

export async function getPostHogRetention(): Promise<PostHogRetention | null> {
  // Retention is complex to calculate with HogQL, use simplified version
  // This calculates what % of users from N days ago returned today
  const [day1Result, day7Result, day30Result] = await Promise.all([
    queryPostHogAPI<{ results: Array<Array<number>> }>('/query/', {
      method: 'POST',
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query: `
            WITH first_seen AS (
              SELECT person_id, min(timestamp) as first_visit
              FROM events WHERE event = '$pageview'
              GROUP BY person_id
              HAVING first_visit >= now() - INTERVAL 2 DAY AND first_visit < now() - INTERVAL 1 DAY
            )
            SELECT 
              count(DISTINCT fs.person_id) as cohort_size,
              count(DISTINCT e.person_id) as returned
            FROM first_seen fs
            LEFT JOIN events e ON fs.person_id = e.person_id 
              AND e.event = '$pageview' 
              AND e.timestamp >= now() - INTERVAL 1 DAY
          `,
        },
      }),
    }),
    queryPostHogAPI<{ results: Array<Array<number>> }>('/query/', {
      method: 'POST',
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query: `
            WITH first_seen AS (
              SELECT person_id, min(timestamp) as first_visit
              FROM events WHERE event = '$pageview'
              GROUP BY person_id
              HAVING first_visit >= now() - INTERVAL 14 DAY AND first_visit < now() - INTERVAL 7 DAY
            )
            SELECT 
              count(DISTINCT fs.person_id) as cohort_size,
              count(DISTINCT e.person_id) as returned
            FROM first_seen fs
            LEFT JOIN events e ON fs.person_id = e.person_id 
              AND e.event = '$pageview' 
              AND e.timestamp >= now() - INTERVAL 7 DAY
          `,
        },
      }),
    }),
    queryPostHogAPI<{ results: Array<Array<number>> }>('/query/', {
      method: 'POST',
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query: `
            WITH first_seen AS (
              SELECT person_id, min(timestamp) as first_visit
              FROM events WHERE event = '$pageview'
              GROUP BY person_id
              HAVING first_visit >= now() - INTERVAL 60 DAY AND first_visit < now() - INTERVAL 30 DAY
            )
            SELECT 
              count(DISTINCT fs.person_id) as cohort_size,
              count(DISTINCT e.person_id) as returned
            FROM first_seen fs
            LEFT JOIN events e ON fs.person_id = e.person_id 
              AND e.event = '$pageview' 
              AND e.timestamp >= now() - INTERVAL 30 DAY
          `,
        },
      }),
    }),
  ]);

  const calcRetention = (result: { results: Array<Array<number>> } | null) => {
    if (!result?.results?.[0]) return 0;
    const [cohortSize, returned] = result.results[0];
    return cohortSize > 0 ? (returned / cohortSize) * 100 : 0;
  };

  return {
    day1: calcRetention(day1Result),
    day7: calcRetention(day7Result),
    day30: calcRetention(day30Result),
  };
}

export interface PostHogProductUsage {
  birthChartViews: number;
  tarotPulls: number;
  horoscopeViews: number;
  crystalSearches: number;
  personalizedTarotViews: number;
  personalizedHoroscopeViews: number;
}

export async function getPostHogProductUsage(
  daysBack: number = 30,
): Promise<PostHogProductUsage | null> {
  const result = await queryPostHogAPI<{
    results: Array<Array<string | number>>;
  }>('/query/', {
    method: 'POST',
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query: `
          SELECT 
            event,
            count(*) as count
          FROM events 
          WHERE event IN (
            'birth_chart_viewed',
            'tarot_viewed', 
            'horoscope_viewed',
            'crystal_recommendations_viewed',
            'personalized_tarot_viewed',
            'personalized_horoscope_viewed'
          )
          AND timestamp >= now() - INTERVAL ${daysBack} DAY
          GROUP BY event
        `,
      },
    }),
  });

  if (!result?.results) {
    return null;
  }

  const counts: Record<string, number> = {};
  for (const row of result.results) {
    counts[String(row[0])] = Number(row[1]) || 0;
  }

  return {
    birthChartViews: counts['birth_chart_viewed'] || 0,
    tarotPulls: counts['tarot_viewed'] || 0,
    horoscopeViews: counts['horoscope_viewed'] || 0,
    crystalSearches: counts['crystal_recommendations_viewed'] || 0,
    personalizedTarotViews: counts['personalized_tarot_viewed'] || 0,
    personalizedHoroscopeViews: counts['personalized_horoscope_viewed'] || 0,
  };
}

export interface PostHogFeatureUsageItem {
  feature: string;
  uniqueUsers: number;
  totalEvents: number;
  avgPerUser: number;
  trend: 'up' | 'down' | 'stable';
}

export interface PostHogFeatureUsage {
  features: PostHogFeatureUsageItem[];
  heatmap: Array<{
    date: string;
    features: Record<string, number>;
  }>;
}

export async function getPostHogFeatureUsage(
  daysBack: number = 7,
): Promise<PostHogFeatureUsage | null> {
  const featureEvents = [
    'birth_chart_viewed',
    'tarot_viewed',
    'horoscope_viewed',
    'crystal_recommendations_viewed',
    'personalized_tarot_viewed',
    'personalized_horoscope_viewed',
    'pricing_page_viewed',
    'upgrade_clicked',
    '$pageview',
  ];

  // Use HogQL to get feature usage stats
  const result = await queryPostHogAPI<{
    results: Array<Array<string | number>>;
  }>('/query/', {
    method: 'POST',
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query: `
          SELECT 
            event,
            count(*) as total_events,
            count(DISTINCT person_id) as unique_users
          FROM events 
          WHERE event IN (${featureEvents.map((e) => `'${e}'`).join(', ')})
            AND timestamp >= now() - INTERVAL ${daysBack} DAY
          GROUP BY event
          ORDER BY total_events DESC
        `,
      },
    }),
  });

  if (!result?.results) {
    return null;
  }

  const features: PostHogFeatureUsageItem[] = result.results.map((row) => {
    const feature = String(row[0]);
    const totalEvents = Number(row[1]) || 0;
    const uniqueUsers = Number(row[2]) || 0;
    const avgPerUser = uniqueUsers > 0 ? totalEvents / uniqueUsers : 0;

    return {
      feature,
      uniqueUsers,
      totalEvents,
      avgPerUser: Number(avgPerUser.toFixed(2)),
      trend: 'stable' as const,
    };
  });

  // Get daily breakdown for heatmap
  const heatmapResult = await queryPostHogAPI<{
    results: Array<Array<string | number>>;
  }>('/query/', {
    method: 'POST',
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query: `
          SELECT 
            toDate(timestamp) as date,
            event,
            count(*) as count
          FROM events 
          WHERE event IN (${featureEvents.map((e) => `'${e}'`).join(', ')})
            AND timestamp >= now() - INTERVAL ${daysBack} DAY
          GROUP BY date, event
          ORDER BY date ASC
        `,
      },
    }),
  });

  const heatmap: Array<{ date: string; features: Record<string, number> }> = [];
  if (heatmapResult?.results) {
    const dateMap = new Map<string, Record<string, number>>();
    for (const row of heatmapResult.results) {
      const date = String(row[0]);
      const event = String(row[1]);
      const count = Number(row[2]) || 0;
      if (!dateMap.has(date)) {
        dateMap.set(date, {});
      }
      dateMap.get(date)![event] = count;
    }
    for (const [date, features] of dateMap) {
      heatmap.push({ date, features });
    }
  }

  return { features, heatmap };
}
