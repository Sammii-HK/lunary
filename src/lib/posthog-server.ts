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
  process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

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
