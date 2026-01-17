import { config } from 'dotenv';
import { resolve } from 'path';
import { sql } from '@vercel/postgres';
import { queryPostHogAPI } from '../src/lib/posthog-server';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

type Args = {
  startDate?: string;
  endDate?: string;
  dryRun: boolean;
  limit: number;
};

const ACTIVITY_EVENTS = [
  'app_opened',
  'tarot_viewed',
  'personalized_tarot_viewed',
  'birth_chart_viewed',
  'horoscope_viewed',
  'personalized_horoscope_viewed',
  'cosmic_pulse_opened',
  'moon_circle_opened',
  'weekly_report_opened',
  'pricing_page_viewed',
  'trial_started',
  'trial_converted',
  'subscription_started',
  'login',
  'dashboard_viewed',
  'grimoire_viewed',
];

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

function parseArgs(argv: string[]): Args {
  return argv.reduce<Args>(
    (acc, arg) => {
      if (arg === '--dry-run') {
        acc.dryRun = true;
        return acc;
      }
      const [key, value] = arg.split('=');
      if (!value) return acc;
      if (key === '--start-date') acc.startDate = value;
      if (key === '--end-date') acc.endDate = value;
      if (key === '--limit') acc.limit = Number(value);
      return acc;
    },
    { dryRun: false, limit: 10000 },
  );
}

function parseDate(input?: string, fallbackDays?: number): Date {
  if (!input && typeof fallbackDays === 'number') {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - fallbackDays);
    return d;
  }
  if (!input) {
    return new Date();
  }
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: ${input}`);
  }
  return parsed;
}

async function fetchBatch(
  eventsList: string,
  startTimestamp: number,
  endTimestamp: number,
  limit: number,
  offset: number,
) {
  const query = `
    SELECT
      timestamp,
      event,
      COALESCE(
        NULLIF(person.properties.user_id, ''),
        NULLIF(person.properties.userId, ''),
        NULLIF(properties.user_id, ''),
        NULLIF(properties.userId, ''),
        concat('ph:', person_id)
      ) AS user_id,
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
      ) AS pathname
    FROM events
    WHERE event IN (${eventsList})
      AND timestamp >= toDateTime(${startTimestamp})
      AND timestamp <= toDateTime(${endTimestamp})
      ${TEST_USER_FILTER}
    ORDER BY timestamp ASC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  return queryPostHogAPI<{
    results: Array<[string, string, string | null, string | null]>;
  }>('/query/', {
    method: 'POST',
    body: JSON.stringify({
      query: { kind: 'HogQLQuery', query },
    }),
  });
}

function mapPageviewToEvent(pathname?: string | null) {
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

async function insertBatch(
  rows: Array<[string, string, string | null, string | null, string | null]>,
) {
  if (rows.length === 0) return 0;

  const values: string[] = [];
  const params: Array<string | null> = [];
  const seen = new Set<string>();

  rows.forEach((row) => {
    const [timestamp, event, userId, userEmail, pathname] = row;
    if (!userId) return;

    const mappedEvent =
      event === PAGEVIEW_EVENT ? mapPageviewToEvent(pathname) : event;
    if (!mappedEvent || !ACTIVITY_EVENTS.includes(mappedEvent)) return;

    const dateKey = new Date(timestamp).toISOString().slice(0, 10);
    const dedupeKey = `${mappedEvent}:${userId}:${dateKey}`;
    if (event === PAGEVIEW_EVENT) {
      if (seen.has(dedupeKey)) return;
      seen.add(dedupeKey);
    }

    const createdAt =
      event === PAGEVIEW_EVENT
        ? `${dateKey}T00:00:00.000Z`
        : new Date(timestamp).toISOString();

    const idx = params.length;
    values.push(
      `($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5}::timestamptz)`,
    );
    params.push(mappedEvent, userId, userEmail, pathname || null, createdAt);
  });

  if (values.length === 0) return 0;

  const insertQuery = `
    INSERT INTO conversion_events (
      event_type,
      user_id,
      user_email,
      page_path,
      metadata,
      created_at
    )
    SELECT
      v.event_type,
      v.user_id,
      v.user_email,
      v.page_path,
      $${params.length + 1}::jsonb,
      v.created_at
    FROM (VALUES ${values.join(', ')}) AS v(event_type, user_id, user_email, page_path, created_at)
    WHERE NOT EXISTS (
      SELECT 1
      FROM conversion_events ce
      WHERE ce.event_type = v.event_type
        AND ce.user_id = v.user_id
        AND ce.created_at = v.created_at
    )
  `;

  const result = await sql.query(insertQuery, [
    ...params,
    JSON.stringify({ source: 'posthog_backfill' }),
  ]);

  return result.rowCount ?? 0;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const startDate = parseDate(args.startDate, 30);
  const endDate = parseDate(args.endDate);
  const eventsList = [...ACTIVITY_EVENTS, PAGEVIEW_EVENT]
    .map((e) => `'${e}'`)
    .join(', ');
  const startTimestamp = Math.floor(startDate.getTime() / 1000);
  const endTimestamp = Math.floor(endDate.getTime() / 1000);

  let offset = 0;
  let totalFetched = 0;
  let totalInserted = 0;

  while (true) {
    const response = await fetchBatch(
      eventsList,
      startTimestamp,
      endTimestamp,
      args.limit,
      offset,
    );
    const results = (response?.results ?? []) as unknown as Array<
      [string, string, string | null, string | null, string | null]
    >;
    if (results.length === 0) break;

    totalFetched += results.length;
    if (!args.dryRun) {
      totalInserted += await insertBatch(results);
    }

    if (results.length < args.limit) break;
    offset += args.limit;
  }

  console.log(
    `Backfill complete. fetched=${totalFetched}, inserted=${totalInserted}, dryRun=${args.dryRun}`,
  );
}

main().catch((error) => {
  console.error('Backfill failed:', error);
  process.exit(1);
});
