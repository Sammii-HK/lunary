import { PostHog } from 'posthog-node';
import { buildCoreAppRouteCondition } from '@/constants/core-app-routes';

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

// Helper to build test user filter for PostHog queries
// Note: This filters by person properties.email if available
// PostHog may not always have email in person properties, so this is best-effort
function getTestUserFilter(): string {
  // Filter out test users by email pattern across event + person properties.
  return `AND (
    (properties.email IS NULL OR properties.email NOT LIKE '%@test.lunary.app')
    AND (person.properties.email IS NULL OR person.properties.email NOT LIKE '%@test.lunary.app')
    AND (person.properties.$email IS NULL OR person.properties.$email NOT LIKE '%@test.lunary.app')
  )`;
}

const PRODUCT_EVENT_NAMES = [
  'birth_chart_viewed',
  'personalized_horoscope_viewed',
  'personalized_tarot_viewed',
  'dashboard_viewed',
  'login',
];

const PRODUCT_EVENT_CONDITION = PRODUCT_EVENT_NAMES.map(
  (event) => `event = '${event}'`,
).join(' OR ');

const PRODUCT_CORE_ROUTE_CONDITION = buildCoreAppRouteCondition(
  'properties.pathname',
);

const PRODUCT_ACTIVITY_CONDITION = `(${PRODUCT_EVENT_CONDITION} OR (event = '$pageview' AND (${PRODUCT_CORE_ROUTE_CONDITION})))`;

const AUTHENTICATED_USER_CONDITION = `
  (
    properties.isAuthenticated = true
    OR properties.is_authenticated = true
    OR properties.user_id IS NOT NULL
    OR properties.userId IS NOT NULL
    OR person.properties.user_id IS NOT NULL
    OR person.properties.userId IS NOT NULL
  )
`;

export const PRODUCT_FILTER_CONDITION = `(${AUTHENTICATED_USER_CONDITION} AND ${PRODUCT_ACTIVITY_CONDITION})`;

const GRIMOIRE_FILTER_CONDITION =
  "(event = '$pageview' AND (properties.is_grimoire_page = true OR properties.pathname LIKE '/grimoire%'))";

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

async function queryDistinctPersonCount(
  condition: string,
  daysBack: number,
): Promise<number> {
  const testUserFilter = getTestUserFilter();
  const query = `
    SELECT count(DISTINCT person_id)
    FROM events
    WHERE ${condition}
      AND timestamp >= now() - INTERVAL ${daysBack} DAY
      ${testUserFilter}
  `;

  const result = await queryPostHogAPI<{ results: Array<Array<number>> }>(
    '/query/',
    {
      method: 'POST',
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query,
        },
      }),
    },
  );

  return Number(result?.results?.[0]?.[0] || 0);
}

async function queryGrimoireOnlyCount(daysBack: number): Promise<number> {
  const testUserFilter = getTestUserFilter();
  const innerQuery = `
    SELECT DISTINCT person_id
    FROM events
    WHERE ${PRODUCT_FILTER_CONDITION}
      AND timestamp >= now() - INTERVAL ${daysBack} DAY
      ${testUserFilter}
  `;

  const outerQuery = `
    SELECT count(DISTINCT person_id)
    FROM events
    WHERE ${GRIMOIRE_FILTER_CONDITION}
      AND timestamp >= now() - INTERVAL ${daysBack} DAY
      AND person_id NOT IN (${innerQuery})
      ${testUserFilter}
  `;

  const result = await queryPostHogAPI<{ results: Array<Array<number>> }>(
    '/query/',
    {
      method: 'POST',
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query: outerQuery,
        },
      }),
    },
  );

  return Number(result?.results?.[0]?.[0] || 0);
}

export async function getPostHogProductActiveUsers(
  daysBack: number = 30,
): Promise<number | null> {
  try {
    return await queryDistinctPersonCount(PRODUCT_FILTER_CONDITION, daysBack);
  } catch (error) {
    console.error('[PostHog] Product active user query failed:', error);
    return null;
  }
}

export async function getPostHogGrimoireActiveUsers(
  daysBack: number = 30,
): Promise<number | null> {
  try {
    return await queryDistinctPersonCount(GRIMOIRE_FILTER_CONDITION, daysBack);
  } catch (error) {
    console.error('[PostHog] Grimoire active user query failed:', error);
    return null;
  }
}

export async function getPostHogGrimoireOnlyUsers(
  daysBack: number = 30,
): Promise<number | null> {
  try {
    return await queryGrimoireOnlyCount(daysBack);
  } catch (error) {
    console.error('[PostHog] Grimoire-only user query failed:', error);
    return null;
  }
}

export interface PostHogActiveUsers {
  dau: number;
  wau: number;
  mau: number;
}

export interface PostHogActiveUsersTrend {
  date: string;
  dau: number;
  wau: number;
  mau: number;
}

function normalizeDateKey(value: string | number) {
  const asString = String(value);
  const parsed = new Date(asString);
  if (Number.isNaN(parsed.getTime())) {
    return asString.split('T')[0];
  }
  return parsed.toISOString().split('T')[0];
}

export async function getPostHogActiveUsersTrends(
  startDate: Date,
  endDate: Date,
  granularity: 'day' | 'week' | 'month' = 'day',
  whereClause?: string,
): Promise<PostHogActiveUsersTrend[]> {
  // Determine date truncation based on granularity
  let dateTrunc: string;
  const dailyDateTrunc = 'toDate(timestamp)';
  switch (granularity) {
    case 'week':
      dateTrunc = 'toMonday(toDate(timestamp))';
      break;
    case 'month':
      dateTrunc = 'toStartOfMonth(toDate(timestamp))';
      break;
    default:
      dateTrunc = 'toDate(timestamp)';
  }

  // For rolling windows, we need data from before startDate
  // Query 30 days before start for MAU calculation
  const extendedStart = new Date(startDate);
  extendedStart.setDate(extendedStart.getDate() - 30);
  const extendedStartTimestamp = Math.floor(extendedStart.getTime() / 1000);
  const endTimestamp = Math.floor(endDate.getTime() / 1000);

  const testUserFilter = getTestUserFilter();

  const eventFilter = whereClause ? `(${whereClause})` : "event = '$pageview'";

  // Build a map of date -> Set of person_ids for that date
  // We need the actual person_ids to calculate rolling windows
  const personIdsByDateQuery = `
    SELECT 
      ${dailyDateTrunc} as date,
      person_id
    FROM events 
    WHERE ${eventFilter}
      AND timestamp >= toDateTime(${extendedStartTimestamp})
      AND timestamp <= toDateTime(${endTimestamp})
      ${testUserFilter}
    LIMIT 1000000
  `;

  const personIdsResult = await queryPostHogAPI<{
    results: Array<Array<string | number>>;
  }>('/query/', {
    method: 'POST',
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query: personIdsByDateQuery,
      },
    }),
  });

  // Build map: date -> Set<person_id>
  const usersByDate = new Map<string, Set<string>>();
  if (personIdsResult?.results) {
    personIdsResult.results.forEach((row) => {
      const date = normalizeDateKey(row[0]);
      const personId = String(row[1]);
      if (!usersByDate.has(date)) {
        usersByDate.set(date, new Set());
      }
      usersByDate.get(date)!.add(personId);
    });
  }

  // Generate all dates in the requested range
  const trends: PostHogActiveUsersTrend[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    let dateStr: string;
    if (granularity === 'week') {
      // Get Monday of the week
      const monday = new Date(currentDate);
      const day = monday.getDay();
      const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
      monday.setDate(diff);
      dateStr = monday.toISOString().split('T')[0];
    } else if (granularity === 'month') {
      // Get first day of month
      const firstDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );
      dateStr = firstDay.toISOString().split('T')[0];
    } else {
      dateStr = currentDate.toISOString().split('T')[0];
    }

    // DAU: unique users on this date
    const dau = usersByDate.get(dateStr)?.size || 0;

    // WAU: unique users in last 7 days (including this date)
    const wauUsers = new Set<string>();
    const wauStart = new Date(currentDate);
    wauStart.setDate(wauStart.getDate() - 6);
    for (
      let d = new Date(wauStart);
      d <= currentDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dStr = d.toISOString().split('T')[0];
      const users = usersByDate.get(dStr);
      if (users) {
        users.forEach((id) => wauUsers.add(id));
      }
    }
    const wau = wauUsers.size;

    // MAU: unique users in last 30 days (including this date)
    const mauUsers = new Set<string>();
    const mauStart = new Date(currentDate);
    mauStart.setDate(mauStart.getDate() - 29);
    for (
      let d = new Date(mauStart);
      d <= currentDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dStr = d.toISOString().split('T')[0];
      const users = usersByDate.get(dStr);
      if (users) {
        users.forEach((id) => mauUsers.add(id));
      }
    }
    const mau = mauUsers.size;

    // Only add if we haven't seen this date (for week/month granularity)
    if (!trends.find((t) => t.date === dateStr)) {
      trends.push({
        date: dateStr,
        dau,
        wau,
        mau,
      });
    }

    // Move to next period
    if (granularity === 'week') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (granularity === 'month') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return trends;
}

export async function getPostHogActiveUsers(
  asOf: Date = new Date(),
): Promise<PostHogActiveUsers | null> {
  const startOfTodayUtc = new Date(
    Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate()),
  );
  const endOfTodayUtc = new Date(startOfTodayUtc);
  endOfTodayUtc.setUTCDate(endOfTodayUtc.getUTCDate() + 1);
  const start7Utc = new Date(startOfTodayUtc);
  start7Utc.setUTCDate(start7Utc.getUTCDate() - 7);
  const start30Utc = new Date(startOfTodayUtc);
  start30Utc.setUTCDate(start30Utc.getUTCDate() - 30);

  const formatDateTime = (date: Date) =>
    date.toISOString().slice(0, 19).replace('T', ' ');

  const todayStart = formatDateTime(startOfTodayUtc);
  const todayEnd = formatDateTime(endOfTodayUtc);
  const weekStart = formatDateTime(start7Utc);
  const monthStart = formatDateTime(start30Utc);

  // Use HogQL Query API instead of Insights API (Personal API Keys don't support Insights)
  const testUserFilter = getTestUserFilter();
  const [dauResult, wauResult, mauResult] = await Promise.all([
    queryPostHogAPI<{ results: Array<Array<number>> }>('/query/', {
      method: 'POST',
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query: `SELECT count(DISTINCT person_id) FROM events WHERE event = '$pageview' AND timestamp >= toDateTime('${todayStart}') AND timestamp < toDateTime('${todayEnd}') ${testUserFilter}`,
        },
      }),
    }),
    queryPostHogAPI<{ results: Array<Array<number>> }>('/query/', {
      method: 'POST',
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query: `SELECT count(DISTINCT person_id) FROM events WHERE event = '$pageview' AND timestamp >= toDateTime('${weekStart}') AND timestamp < toDateTime('${todayEnd}') ${testUserFilter}`,
        },
      }),
    }),
    queryPostHogAPI<{ results: Array<Array<number>> }>('/query/', {
      method: 'POST',
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query: `SELECT count(DISTINCT person_id) FROM events WHERE event = '$pageview' AND timestamp >= toDateTime('${monthStart}') AND timestamp < toDateTime('${todayEnd}') ${testUserFilter}`,
        },
      }),
    }),
  ]);

  if (!dauResult || !wauResult || !mauResult) {
    return null;
  }

  const dau = Number(dauResult.results?.[0]?.[0] || 0);
  const wau = Number(wauResult.results?.[0]?.[0] || 0);
  const mau = Number(mauResult.results?.[0]?.[0] || 0);

  if (wau < dau || mau < wau) {
    console.warn('[PostHog] Active user window mismatch', {
      dau,
      wau,
      mau,
      todayStart,
      todayEnd,
      weekStart,
      monthStart,
    });
  }

  return {
    dau,
    wau: Math.max(wau, dau),
    mau: Math.max(mau, Math.max(wau, dau)),
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
  const testUserFilter = getTestUserFilter();
  const queryString = `
    SELECT 
      count(*) as total_generations,
      count(DISTINCT person_id) as unique_users,
      sum(toFloatOrDefault(properties['$ai_input_tokens'], 0.0)) as input_tokens,
      sum(toFloatOrDefault(properties['$ai_output_tokens'], 0.0)) as output_tokens,
      sum(toFloatOrDefault(properties['$ai_total_cost_usd'], 0.0)) as total_cost,
      avg(toFloatOrDefault(properties['$ai_latency'], 0.0)) as avg_latency
    FROM events 
    WHERE event = '$ai_generation' 
      AND timestamp >= now() - INTERVAL ${daysBack} DAY
      ${testUserFilter}
  `;

  const result = await queryPostHogAPI<{ results: Array<Array<number>> }>(
    '/query/',
    {
      method: 'POST',
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query: queryString,
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
  // Retention calculation using rolling windows:
  // Day 1: Users who first visited 1-2 days ago and returned in the last 1 day
  // Day 7: Users who first visited 7-14 days ago and returned in the last 7 days
  // Day 30: Users who first visited 30-60 days ago and returned in the last 30 days

  const testUserFilter = getTestUserFilter();
  const [day1Result, day7Result, day30Result] = await Promise.all([
    // Day 1 retention: users who first visited 1-2 days ago and returned today/yesterday
    queryPostHogAPI<{ results: Array<Array<number>> }>('/query/', {
      method: 'POST',
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query: `
            WITH first_seen AS (
              SELECT person_id, min(timestamp) as first_visit
              FROM events WHERE event = '$pageview'
              ${testUserFilter}
              GROUP BY person_id
              HAVING toDate(first_visit) >= today() - INTERVAL 2 DAY 
                AND toDate(first_visit) < today() - INTERVAL 1 DAY
            )
            SELECT 
              count(DISTINCT fs.person_id) as cohort_size,
              count(DISTINCT e.person_id) as returned
            FROM first_seen fs
            LEFT JOIN events e ON fs.person_id = e.person_id 
              AND e.event = '$pageview' 
              AND toDate(e.timestamp) >= today() - INTERVAL 1 DAY
              AND e.timestamp > fs.first_visit
              ${testUserFilter}
          `,
        },
      }),
    }),
    // Day 7 retention: users who first visited 7-14 days ago and returned in last 7 days
    queryPostHogAPI<{ results: Array<Array<number>> }>('/query/', {
      method: 'POST',
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query: `
            WITH first_seen AS (
              SELECT person_id, min(timestamp) as first_visit
              FROM events WHERE event = '$pageview'
              ${testUserFilter}
              GROUP BY person_id
              HAVING toDate(first_visit) >= today() - INTERVAL 14 DAY 
                AND toDate(first_visit) < today() - INTERVAL 7 DAY
            )
            SELECT 
              count(DISTINCT fs.person_id) as cohort_size,
              count(DISTINCT e.person_id) as returned
            FROM first_seen fs
            LEFT JOIN events e ON fs.person_id = e.person_id 
              AND e.event = '$pageview' 
              AND e.timestamp >= now() - INTERVAL 7 DAY
              AND e.timestamp > fs.first_visit
              ${testUserFilter}
          `,
        },
      }),
    }),
    // Day 30 retention: users who first visited 30-60 days ago and returned in last 30 days
    queryPostHogAPI<{ results: Array<Array<number>> }>('/query/', {
      method: 'POST',
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query: `
            WITH first_seen AS (
              SELECT person_id, min(timestamp) as first_visit
              FROM events WHERE event = '$pageview'
              ${testUserFilter}
              GROUP BY person_id
              HAVING toDate(first_visit) >= today() - INTERVAL 60 DAY 
                AND toDate(first_visit) < today() - INTERVAL 30 DAY
            )
            SELECT 
              count(DISTINCT fs.person_id) as cohort_size,
              count(DISTINCT e.person_id) as returned
            FROM first_seen fs
            LEFT JOIN events e ON fs.person_id = e.person_id 
              AND e.event = '$pageview' 
              AND e.timestamp >= now() - INTERVAL 30 DAY
              AND e.timestamp > fs.first_visit
              ${testUserFilter}
          `,
        },
      }),
    }),
  ]);

  const calcRetention = (result: { results: Array<Array<number>> } | null) => {
    if (!result?.results?.[0]) return null;
    const [cohortSize, returned] = result.results[0];
    if (cohortSize === 0) return null; // No cohort data available
    return (returned / cohortSize) * 100;
  };

  const day1 = calcRetention(day1Result);
  const day7 = calcRetention(day7Result);
  const day30 = calcRetention(day30Result);

  // Return null if no data available, otherwise return the values
  if (day1 === null && day7 === null && day30 === null) {
    return null;
  }

  return {
    day1: day1 ?? 0,
    day7: day7 ?? 0,
    day30: day30 ?? 0,
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
  adoptionRate?: number;
  trend: 'up' | 'down' | 'stable';
}

export interface PostHogFeatureUsage {
  features: PostHogFeatureUsageItem[];
  heatmap: Array<{
    date: string;
    features: Record<string, number>;
  }>;
}

export interface PostHogSignupTrend {
  date: string;
  signups: number;
}

// Human-readable feature names mapping
const FEATURE_NAMES: Record<string, string> = {
  birth_chart_viewed: 'Birth Chart',
  tarot_viewed: 'Tarot Reading',
  horoscope_viewed: 'Horoscope',
  crystal_recommendations_viewed: 'Crystal Recommendations',
  personalized_tarot_viewed: 'Personalized Tarot',
  personalized_horoscope_viewed: 'Personalized Horoscope',
  pricing_page_viewed: 'Pricing Page',
  upgrade_clicked: 'Upgrade Clicked',
  $pageview: 'Page Views',
};

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
  const testUserFilter = getTestUserFilter();
  const featureEventsList = featureEvents.map((e) => `'${e}'`).join(', ');
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
          WHERE event IN (${featureEventsList})
            AND timestamp >= now() - INTERVAL ${daysBack} DAY
            ${testUserFilter}
          GROUP BY event
          ORDER BY total_events DESC
        `,
      },
    }),
  });

  if (!result?.results) {
    return null;
  }

  // Get total active users for adoption rate calculation
  const totalActiveUsersQuery = `
    SELECT count(DISTINCT person_id) 
    FROM events 
    WHERE event = '$pageview'
      AND timestamp >= now() - INTERVAL ${daysBack} DAY
      ${testUserFilter}
  `;

  const totalActiveUsersResult = await queryPostHogAPI<{
    results: Array<Array<number>>;
  }>('/query/', {
    method: 'POST',
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query: totalActiveUsersQuery,
      },
    }),
  });

  const totalActiveUsers = totalActiveUsersResult?.results?.[0]?.[0] || 0;

  const features: PostHogFeatureUsageItem[] = result.results
    .map((row) => {
      const feature = String(row[0]);
      const totalEvents = Number(row[1]) || 0;
      const uniqueUsers = Number(row[2]) || 0;
      const avgPerUser = uniqueUsers > 0 ? totalEvents / uniqueUsers : 0;
      const adoptionRate =
        totalActiveUsers > 0 ? (uniqueUsers / totalActiveUsers) * 100 : 0;

      return {
        feature,
        uniqueUsers,
        totalEvents,
        avgPerUser: Number(avgPerUser.toFixed(2)),
        adoptionRate: Number(adoptionRate.toFixed(2)),
        trend: 'stable' as const,
      };
    })
    // Sort by total events, but prioritize meaningful features over $pageview
    .sort((a, b) => {
      // Put $pageview at the end
      if (a.feature === '$pageview' && b.feature !== '$pageview') return 1;
      if (b.feature === '$pageview' && a.feature !== '$pageview') return -1;
      return b.totalEvents - a.totalEvents;
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
          WHERE event IN (${featureEventsList})
            AND timestamp >= now() - INTERVAL ${daysBack} DAY
            ${testUserFilter}
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

export async function getPostHogSignupTrends(
  startDate: Date,
  endDate: Date,
  granularity: 'day' | 'week' | 'month' = 'day',
): Promise<PostHogSignupTrend[]> {
  // Determine date truncation based on granularity
  let dateTrunc: string;
  switch (granularity) {
    case 'week':
      dateTrunc = 'toMonday(toDate(timestamp))';
      break;
    case 'month':
      dateTrunc = 'toStartOfMonth(toDate(timestamp))';
      break;
    default:
      dateTrunc = 'toDate(timestamp)';
  }

  const startTimestamp = Math.floor(startDate.getTime() / 1000);
  const endTimestamp = Math.floor(endDate.getTime() / 1000);
  const testUserFilter = getTestUserFilter();

  const query = `
    SELECT 
      ${dateTrunc} as date,
      count(DISTINCT person_id) as signups
    FROM events 
    WHERE event = '$identify'
      AND timestamp >= toDateTime(${startTimestamp})
      AND timestamp <= toDateTime(${endTimestamp})
      ${testUserFilter}
    GROUP BY date
    ORDER BY date ASC
  `;

  const result = await queryPostHogAPI<{
    results: Array<Array<string | number>>;
  }>('/query/', {
    method: 'POST',
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query: query,
      },
    }),
  });

  if (!result?.results) {
    return [];
  }

  return result.results.map((row) => ({
    date: String(row[0]),
    signups: Number(row[1]) || 0,
  }));
}
