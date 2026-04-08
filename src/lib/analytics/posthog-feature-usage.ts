import { queryPostHogAPI } from '@/lib/posthog-server';

type HogQLResponse = {
  results?: Array<Array<string | number | null>>;
};

const FEATURE_EVENTS = [
  'daily_dashboard_viewed',
  'grimoire_viewed',
  'astral_chat_used',
  'tarot_drawn',
  'ritual_completed',
  'chart_viewed',
  'signup_completed',
  'trial_started',
  'subscription_started',
  'subscription_cancelled',
] as const;

function formatHogQLDate(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function actorIdExpression(): string {
  return "coalesce(nullIf(person_id, ''), distinct_id)";
}

function eventList(values: readonly string[]): string {
  return values.map((value) => `'${value}'`).join(', ');
}

async function runHogQLRows(
  query: string,
): Promise<Array<Array<string | number | null>> | null> {
  const result = await queryPostHogAPI<HogQLResponse>('/query/', {
    method: 'POST',
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query,
      },
    }),
  });

  return result?.results ?? null;
}

export type PostHogFeatureUsage = {
  feature: string;
  totalEvents: number;
  uniqueUsers: number;
};

export type PostHogFeatureHeatmap = {
  date: string;
  eventType: string;
  count: number;
};

export async function fetchFeatureUsageFromPostHog(
  start: Date,
  end: Date,
): Promise<{
  features: PostHogFeatureUsage[];
  heatmap: PostHogFeatureHeatmap[];
  totalActiveUsers: number;
} | null> {
  const startTs = formatHogQLDate(start);
  const endExclusive = new Date(end);
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
  endExclusive.setUTCHours(0, 0, 0, 0);
  const endTs = formatHogQLDate(endExclusive);

  const [featureRows, totalUsersRows, heatmapRows] = await Promise.all([
    runHogQLRows(`
      SELECT
        event,
        count(*) as total_events,
        count(DISTINCT ${actorIdExpression()}) as unique_users
      FROM events
      WHERE event IN (${eventList(FEATURE_EVENTS)})
        AND timestamp >= toDateTime('${startTs}')
        AND timestamp < toDateTime('${endTs}')
      GROUP BY event
      ORDER BY total_events DESC
    `),
    runHogQLRows(`
      SELECT
        count(DISTINCT ${actorIdExpression()}) as total_users
      FROM events
      WHERE event IN (${eventList(FEATURE_EVENTS)})
        AND timestamp >= toDateTime('${startTs}')
        AND timestamp < toDateTime('${endTs}')
    `),
    runHogQLRows(`
      SELECT
        toDate(timestamp) as event_date,
        event,
        count(*) as event_count
      FROM events
      WHERE event IN (${eventList(FEATURE_EVENTS)})
        AND timestamp >= toDateTime('${startTs}')
        AND timestamp < toDateTime('${endTs}')
      GROUP BY event_date, event
      ORDER BY event_date ASC, event ASC
    `),
  ]);

  if (!featureRows || !totalUsersRows || !heatmapRows) {
    return null;
  }

  return {
    features: featureRows.map((row) => ({
      feature: String(row[0] ?? ''),
      totalEvents: Number(row[1] ?? 0),
      uniqueUsers: Number(row[2] ?? 0),
    })),
    totalActiveUsers: Number(totalUsersRows[0]?.[0] ?? 0),
    heatmap: heatmapRows.map((row) => ({
      date: String(row[0] ?? ''),
      eventType: String(row[1] ?? ''),
      count: Number(row[2] ?? 0),
    })),
  };
}
