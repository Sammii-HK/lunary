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

async function queryPostHogAPI<T>(
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
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      console.error(
        `[PostHog API] Error ${response.status}: ${await response.text()}`,
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

  const [dauResult, wauResult, mauResult] = await Promise.all([
    queryPostHogAPI<{ results: Array<{ aggregated_value: number }> }>(
      '/insights/trend/',
      {
        method: 'POST',
        body: JSON.stringify({
          events: [{ id: '$pageview', math: 'dau' }],
          date_from: todayStr,
          date_to: todayStr,
        }),
      },
    ),
    queryPostHogAPI<{ results: Array<{ aggregated_value: number }> }>(
      '/insights/trend/',
      {
        method: 'POST',
        body: JSON.stringify({
          events: [{ id: '$pageview', math: 'weekly_active' }],
          date_from: weekAgoStr,
          date_to: todayStr,
        }),
      },
    ),
    queryPostHogAPI<{ results: Array<{ aggregated_value: number }> }>(
      '/insights/trend/',
      {
        method: 'POST',
        body: JSON.stringify({
          events: [{ id: '$pageview', math: 'monthly_active' }],
          date_from: monthAgoStr,
          date_to: todayStr,
        }),
      },
    ),
  ]);

  if (!dauResult || !wauResult || !mauResult) {
    return null;
  }

  return {
    dau: dauResult.results?.[0]?.aggregated_value || 0,
    wau: wauResult.results?.[0]?.aggregated_value || 0,
    mau: mauResult.results?.[0]?.aggregated_value || 0,
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
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - daysBack);
  const startDateStr = startDate.toISOString().split('T')[0];

  const result = await queryPostHogAPI<{
    results: Array<{
      count: number;
      data: number[];
    }>;
  }>('/insights/trend/', {
    method: 'POST',
    body: JSON.stringify({
      events: [
        { id: '$ai_generation', math: 'total' },
        { id: '$ai_generation', math: 'dau' },
        {
          id: '$ai_generation',
          math: 'sum',
          math_property: '$ai_input_tokens',
        },
        {
          id: '$ai_generation',
          math: 'sum',
          math_property: '$ai_output_tokens',
        },
        {
          id: '$ai_generation',
          math: 'sum',
          math_property: '$ai_total_cost_usd',
        },
        { id: '$ai_generation', math: 'avg', math_property: '$ai_latency' },
      ],
      date_from: startDateStr,
      date_to: todayStr,
    }),
  });

  if (!result?.results) {
    return null;
  }

  const sumData = (data: number[] | undefined) =>
    data?.reduce((sum, val) => sum + (val || 0), 0) || 0;

  return {
    totalGenerations: sumData(result.results[0]?.data),
    uniqueUsers: sumData(result.results[1]?.data),
    totalInputTokens: sumData(result.results[2]?.data),
    totalOutputTokens: sumData(result.results[3]?.data),
    totalCostUsd: sumData(result.results[4]?.data),
    avgLatencySeconds:
      result.results[5]?.data?.length > 0
        ? result.results[5].data.reduce((a, b) => a + b, 0) /
          result.results[5].data.filter((v) => v > 0).length
        : 0,
  };
}

export interface PostHogRetention {
  day1: number;
  day7: number;
  day30: number;
}

export async function getPostHogRetention(): Promise<PostHogRetention | null> {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  const result = await queryPostHogAPI<{
    result: Array<{
      values: Array<{ count: number }>;
    }>;
  }>('/insights/retention/', {
    method: 'POST',
    body: JSON.stringify({
      retention_type: 'retention_first_time',
      target_entity: { id: '$pageview', type: 'events' },
      returning_entity: { id: '$pageview', type: 'events' },
      date_from: thirtyDaysAgoStr,
      date_to: todayStr,
      period: 'Day',
      total_intervals: 31,
    }),
  });

  if (!result?.result || result.result.length === 0) {
    return null;
  }

  const cohorts = result.result;
  let day1Total = 0,
    day1Retained = 0;
  let day7Total = 0,
    day7Retained = 0;
  let day30Total = 0,
    day30Retained = 0;

  for (const cohort of cohorts) {
    const values = cohort.values || [];
    const day0Count = values[0]?.count || 0;

    if (day0Count > 0) {
      if (values[1]) {
        day1Total += day0Count;
        day1Retained += values[1].count || 0;
      }
      if (values[7]) {
        day7Total += day0Count;
        day7Retained += values[7].count || 0;
      }
      if (values[30]) {
        day30Total += day0Count;
        day30Retained += values[30].count || 0;
      }
    }
  }

  return {
    day1: day1Total > 0 ? (day1Retained / day1Total) * 100 : 0,
    day7: day7Total > 0 ? (day7Retained / day7Total) * 100 : 0,
    day30: day30Total > 0 ? (day30Retained / day30Total) * 100 : 0,
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
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - daysBack);
  const startDateStr = startDate.toISOString().split('T')[0];

  const result = await queryPostHogAPI<{
    results: Array<{
      count: number;
      data: number[];
    }>;
  }>('/insights/trend/', {
    method: 'POST',
    body: JSON.stringify({
      events: [
        { id: 'birth_chart_viewed', math: 'total' },
        { id: 'tarot_viewed', math: 'total' },
        { id: 'horoscope_viewed', math: 'total' },
        { id: 'crystal_recommendations_viewed', math: 'total' },
        { id: 'personalized_tarot_viewed', math: 'total' },
        { id: 'personalized_horoscope_viewed', math: 'total' },
      ],
      date_from: startDateStr,
      date_to: todayStr,
    }),
  });

  if (!result?.results) {
    return null;
  }

  const sumData = (data: number[] | undefined) =>
    data?.reduce((sum, val) => sum + (val || 0), 0) || 0;

  return {
    birthChartViews: sumData(result.results[0]?.data),
    tarotPulls: sumData(result.results[1]?.data),
    horoscopeViews: sumData(result.results[2]?.data),
    crystalSearches: sumData(result.results[3]?.data),
    personalizedTarotViews: sumData(result.results[4]?.data),
    personalizedHoroscopeViews: sumData(result.results[5]?.data),
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
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - daysBack);
  const startDateStr = startDate.toISOString().split('T')[0];

  const featureEvents = [
    'birth_chart_viewed',
    'tarot_viewed',
    'horoscope_viewed',
    'crystal_recommendations_viewed',
    'personalized_tarot_viewed',
    'personalized_horoscope_viewed',
    'pricing_page_viewed',
    'upgrade_clicked',
  ];

  const [totalResult, uniqueResult] = await Promise.all([
    queryPostHogAPI<{
      results: Array<{
        label: string;
        count: number;
        data: number[];
        labels: string[];
      }>;
    }>('/insights/trend/', {
      method: 'POST',
      body: JSON.stringify({
        events: featureEvents.map((id) => ({ id, math: 'total' })),
        date_from: startDateStr,
        date_to: todayStr,
        interval: 'day',
      }),
    }),
    queryPostHogAPI<{
      results: Array<{
        label: string;
        count: number;
        data: number[];
      }>;
    }>('/insights/trend/', {
      method: 'POST',
      body: JSON.stringify({
        events: featureEvents.map((id) => ({ id, math: 'dau' })),
        date_from: startDateStr,
        date_to: todayStr,
        interval: 'day',
      }),
    }),
  ]);

  if (!totalResult?.results || !uniqueResult?.results) {
    return null;
  }

  const features: PostHogFeatureUsageItem[] = featureEvents.map(
    (feature, index) => {
      const totalData = totalResult.results[index]?.data || [];
      const uniqueData = uniqueResult.results[index]?.data || [];

      const totalEvents = totalData.reduce((sum, val) => sum + (val || 0), 0);
      const uniqueUsers = uniqueData.reduce((sum, val) => sum + (val || 0), 0);
      const avgPerUser = uniqueUsers > 0 ? totalEvents / uniqueUsers : 0;

      const recentHalf = totalData.slice(-Math.ceil(totalData.length / 2));
      const olderHalf = totalData.slice(0, Math.floor(totalData.length / 2));
      const recentAvg =
        recentHalf.length > 0
          ? recentHalf.reduce((a, b) => a + b, 0) / recentHalf.length
          : 0;
      const olderAvg =
        olderHalf.length > 0
          ? olderHalf.reduce((a, b) => a + b, 0) / olderHalf.length
          : 0;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (recentAvg > olderAvg * 1.1) trend = 'up';
      else if (recentAvg < olderAvg * 0.9) trend = 'down';

      return {
        feature,
        uniqueUsers,
        totalEvents,
        avgPerUser: Number(avgPerUser.toFixed(2)),
        trend,
      };
    },
  );

  features.sort((a, b) => b.totalEvents - a.totalEvents);

  const heatmap: Array<{ date: string; features: Record<string, number> }> = [];
  const labels = totalResult.results[0]?.labels || [];

  for (let i = 0; i < labels.length; i++) {
    const dateStr = labels[i];
    const featuresData: Record<string, number> = {};
    featureEvents.forEach((feature, featureIndex) => {
      featuresData[feature] = totalResult.results[featureIndex]?.data[i] || 0;
    });
    heatmap.push({ date: dateStr, features: featuresData });
  }

  return { features, heatmap };
}
