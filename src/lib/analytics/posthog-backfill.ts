import { sql } from '@vercel/postgres';
import { queryPostHogAPI } from '@/lib/posthog-server';
import {
  canonicaliseEvent,
  insertCanonicalEventsBatch,
  type CanonicalEventType,
} from '@/lib/analytics/canonical-events';

type BackfillArgs = {
  start: Date;
  end: Date;
  dryRun: boolean;
  limit: number;
};

type BackfillCounters = {
  fetched: number;
  inserted: number;
  skipped_no_user: number;
  skipped_duplicate: number;
  skipped_invalid: number;
};

const PAGEVIEW_EVENT = '$pageview';

const APP_PAGE_PREFIXES = [
  '/app',
  '/tarot',
  '/horoscope',
  '/birth-chart',
  '/book-of-shadows',
  '/profile',
  '/cosmic-state',
  '/cosmic-report-generator',
  '/guide',
  '/explore',
];

const TEST_USER_FILTER = `
  AND (
    (properties.email IS NULL OR properties.email NOT LIKE '%@test.lunary.app')
    AND (person.properties.email IS NULL OR person.properties.email NOT LIKE '%@test.lunary.app')
    AND (person.properties.$email IS NULL OR person.properties.$email NOT LIKE '%@test.lunary.app')
  )
`;

const POSTHOG_EVENT_SOURCES: string[] = [
  // Canonical (may already exist in PostHog)
  'app_opened',
  'grimoire_viewed',
  'chart_viewed',
  'daily_dashboard_viewed',
  'astral_chat_used',
  'tarot_drawn',
  'ritual_started',
  'signup_completed',
  'subscription_started',
  'subscription_cancelled',
  'trial_started',

  // Legacy events we normalise into canonical
  'birth_chart_viewed',
  'dashboard_viewed',
  'ai_chat',
  'tarot_viewed',
  'ritual_view',
  'signup',
  'trial_converted',

  // Pageviews for app_opened/grimoire_viewed mapping
  PAGEVIEW_EVENT,
];

function mapPageviewToEvent(
  pathname: string | null,
): CanonicalEventType | null {
  if (!pathname) return null;

  let cleanPath = pathname;
  if (cleanPath.startsWith('http')) {
    try {
      cleanPath = new URL(cleanPath).pathname;
    } catch {
      return null;
    }
  }

  if (cleanPath.startsWith('/grimoire')) {
    return 'grimoire_viewed';
  }

  if (APP_PAGE_PREFIXES.some((prefix) => cleanPath.startsWith(prefix))) {
    return 'app_opened';
  }

  return null;
}

function formatAsHogQLStringList(values: string[]) {
  return values.map((value) => `'${value.replace(/'/g, "''")}'`).join(', ');
}

async function fetchBatch(params: {
  startTimestamp: number;
  endTimestamp: number;
  limit: number;
  offset: number;
}) {
  const eventsList = formatAsHogQLStringList(POSTHOG_EVENT_SOURCES);

  const query = `
    SELECT
      timestamp,
      event,
      distinct_id,
      COALESCE(
        NULLIF(person.properties.user_id, ''),
        NULLIF(person.properties.userId, ''),
        NULLIF(properties.user_id, ''),
        NULLIF(properties.userId, '')
      ) AS resolved_user_id,
      COALESCE(
        NULLIF(person.properties.email, ''),
        NULLIF(person.properties.$email, ''),
        NULLIF(properties.email, '')
      ) AS user_email,
      COALESCE(
        NULLIF(properties.$pathname, ''),
        NULLIF(properties.pathname, ''),
        NULLIF(properties.$current_url, ''),
        NULLIF(properties.current_url, '')
      ) AS pathname,
      COALESCE(NULLIF(properties.$referrer, ''), NULLIF(properties.referrer, '')) AS referrer,
      NULLIF(properties.utm_source, '') AS utm_source,
      NULLIF(properties.utm_medium, '') AS utm_medium,
      NULLIF(properties.utm_campaign, '') AS utm_campaign
    FROM events
    WHERE event IN (${eventsList})
      AND timestamp >= toDateTime(${params.startTimestamp})
      AND timestamp <= toDateTime(${params.endTimestamp})
      ${TEST_USER_FILTER}
    ORDER BY timestamp ASC
    LIMIT ${params.limit}
    OFFSET ${params.offset}
  `;

  return queryPostHogAPI<{
    results: Array<
      [
        string,
        string,
        string | null,
        string | null,
        string | null,
        string | null,
        string | null,
        string | null,
        string | null,
        string | null,
      ]
    >;
  }>('/query/', {
    method: 'POST',
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
  });
}

export async function runPostHogBackfill({
  start,
  end,
  dryRun,
  limit,
}: BackfillArgs): Promise<BackfillCounters> {
  // Ensure conversion_events exists early (better error)
  await sql`SELECT 1 FROM conversion_events LIMIT 1`;

  const startTimestamp = Math.floor(start.getTime() / 1000);
  const endTimestamp = Math.floor(end.getTime() / 1000);

  const counters: BackfillCounters = {
    fetched: 0,
    inserted: 0,
    skipped_no_user: 0,
    skipped_duplicate: 0,
    skipped_invalid: 0,
  };

  let offset = 0;

  while (true) {
    const response = await fetchBatch({
      startTimestamp,
      endTimestamp,
      limit,
      offset,
    });

    const results = (response?.results ?? []) as unknown as Array<
      [
        string,
        string,
        string | null,
        string | null,
        string | null,
        string | null,
        string | null,
        string | null,
        string | null,
        string | null,
      ]
    >;

    if (results.length === 0) break;
    counters.fetched += results.length;

    const rowsForInsert = [];

    for (const row of results) {
      const [
        timestamp,
        event,
        distinctId,
        resolvedUserId,
        userEmail,
        pathname,
        referrer,
        utmSource,
        utmMedium,
        utmCampaign,
      ] = row;

      const mappedEvent =
        event === PAGEVIEW_EVENT ? mapPageviewToEvent(pathname) : event;

      const canonical = canonicaliseEvent({
        eventType: mappedEvent,
        userId: resolvedUserId,
        anonymousId: distinctId,
        userEmail,
        pagePath: pathname,
        metadata: {
          source: 'posthog_backfill',
          posthog_event: event,
          referrer: referrer ?? undefined,
          utm_source: utmSource ?? undefined,
          utm_medium: utmMedium ?? undefined,
          utm_campaign: utmCampaign ?? undefined,
        },
        createdAt: timestamp,
      });

      if (!canonical.ok) {
        if (canonical.reason === 'skipped_no_user')
          counters.skipped_no_user += 1;
        if (canonical.reason === 'skipped_invalid')
          counters.skipped_invalid += 1;
        continue;
      }

      // Drop invalid anon user IDs that are too long (PostHog occasionally yields huge IDs)
      if (canonical.row.userId.length > 255) {
        counters.skipped_invalid += 1;
        continue;
      }

      rowsForInsert.push(canonical.row);
    }

    if (!dryRun && rowsForInsert.length > 0) {
      // Insert in a single batch; unique indexes enforce dedupe.
      const { inserted, duplicates } =
        await insertCanonicalEventsBatch(rowsForInsert);
      counters.inserted += inserted;
      counters.skipped_duplicate += duplicates;
    }

    if (results.length < limit) break;
    offset += limit;
  }

  return counters;
}
