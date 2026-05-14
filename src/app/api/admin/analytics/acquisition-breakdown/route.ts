import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';
import { queryPostHogAPI } from '@/lib/posthog-server';
import {
  TEST_EMAIL_EXACT,
  TEST_EMAIL_PATTERN,
} from '@/lib/analytics/test-filter';

export const dynamic = 'force-dynamic';

type DateRange = {
  start: Date;
  end: Date;
  days: number;
};

type PageviewRow = {
  row_id: string;
  date: string;
  identity: string | null;
  session_key: string | null;
  page_path: string | null;
  referrer: string | null;
  country: string | null;
  device: string | null;
  os: string | null;
  browser: string | null;
};

type BreakdownRow = {
  key: string;
  visitors: number;
  uniqueVisitors: number;
  pageViews: number;
  percentage: number;
};

type GroupedDimension = {
  visitors: Set<string>;
  uniqueVisitors: Set<string>;
  pageViews: number;
};

type AcquisitionSource = 'posthog' | 'neon_fallback';

type PostHogQueryResponse = {
  results?: unknown[][];
  error?: string | null;
};

const POSTHOG_PAGEVIEW_ROW_LIMIT = 100_000;
const ACQUISITION_CACHE_TTL_MS = 15 * 60 * 1000;
const POSTHOG_BREAKDOWN_LIMIT = 500;

type AcquisitionPayload = {
  source: AcquisitionSource;
  cached: boolean;
  generatedAt: string;
  range: {
    days: number;
    start: string;
    end: string;
  };
  semantics: {
    note: string;
    visitorDefinition: string;
    pageViewDefinition: string;
  };
  summary: ReturnType<typeof summarizePageviews>['summary'];
  daily: ReturnType<typeof summarizePageviews>['daily'];
  breakdowns: {
    referrers: BreakdownRow[];
    routes: BreakdownRow[];
    pages: BreakdownRow[];
    countries: BreakdownRow[];
    devices: BreakdownRow[];
    operatingSystems: BreakdownRow[];
    browsers: BreakdownRow[];
    events: BreakdownRow[];
  };
};

const acquisitionCache = new Map<
  string,
  { expiresAt: number; payload: AcquisitionPayload }
>();

function parseDays(value: string | null): number {
  const parsed = Number.parseInt(value || '7', 10);
  if (!Number.isFinite(parsed)) return 7;
  return Math.min(Math.max(parsed, 1), 365);
}

function parseIsoDate(value: string | null): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const parsed = new Date(`${trimmed}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseDateRange(searchParams: URLSearchParams): DateRange {
  const startParam = parseIsoDate(searchParams.get('start_date'));
  const endParam = parseIsoDate(searchParams.get('end_date'));

  if (startParam && endParam && startParam <= endParam) {
    const start = new Date(startParam);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(endParam);
    end.setUTCHours(23, 59, 59, 999);

    const diffMs = end.getTime() - start.getTime();
    const days = Math.min(
      Math.max(Math.floor(diffMs / 86_400_000) + 1, 1),
      365,
    );
    return { start, end, days };
  }

  const days = parseDays(searchParams.get('days'));
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  start.setUTCHours(0, 0, 0, 0);
  return { start, end, days };
}

function normalizePercentage(value: number): number {
  return Number(value.toFixed(2));
}

function normalizeReferrerKey(value: string | null | undefined): string {
  const trimmed = (value || '').trim();

  if (
    !trimmed ||
    trimmed === '(direct)' ||
    trimmed.toLowerCase() === 'direct' ||
    trimmed.toLowerCase() === 'unknown'
  ) {
    return '(direct)';
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    if (!host) return '(direct)';
    if (host === 'lunary.app' || host.endsWith('.lunary.app')) {
      return '(internal)';
    }
    if (
      host === 'chatgpt.com' ||
      host.endsWith('.chatgpt.com') ||
      host === 'chat.openai.com' ||
      host === 'openai.com' ||
      host.endsWith('.openai.com')
    ) {
      return 'ChatGPT / OpenAI';
    }
    return host;
  } catch {
    const withoutProtocol = trimmed.replace(/^https?:\/\//i, '');
    const host = withoutProtocol
      .split('/')[0]
      ?.toLowerCase()
      .replace(/^www\./, '');
    if (
      host === 'chatgpt.com' ||
      host.endsWith('.chatgpt.com') ||
      host === 'chat.openai.com' ||
      host === 'openai.com' ||
      host.endsWith('.openai.com') ||
      trimmed.toLowerCase() === 'chatgpt' ||
      trimmed.toLowerCase() === 'openai'
    ) {
      return 'ChatGPT / OpenAI';
    }
    return host || trimmed;
  }
}

function normalizeUnknown(value: string | null | undefined): string {
  return value?.trim() || 'unknown';
}

function normalizeCountry(value: string | null | undefined): string {
  return value?.trim().toUpperCase() || 'Unknown';
}

function normalizePostHogPath(
  pagePath: unknown,
  pathname: unknown,
  currentUrl: unknown,
): string {
  const directPath =
    typeof pagePath === 'string' && pagePath.trim().length > 0
      ? pagePath.trim()
      : typeof pathname === 'string' && pathname.trim().length > 0
        ? pathname.trim()
        : null;

  if (directPath) {
    try {
      return new URL(directPath).pathname || '/';
    } catch {
      return directPath.split('?')[0]?.split('#')[0] || '/';
    }
  }

  if (typeof currentUrl === 'string' && currentUrl.trim().length > 0) {
    try {
      return new URL(currentUrl).pathname || '/';
    } catch {
      return '/';
    }
  }

  return '/';
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}

function formatHogQlDateTime(value: string): string {
  return value.slice(0, 19).replace('T', ' ');
}

function escapeHogQlString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function postHogIdentitySql(): string {
  return "coalesce(toString(person_id), nullIf(toString(distinct_id), ''), 'unknown')";
}

function postHogSessionSql(identity = 'identity'): string {
  return `coalesce(
    nullIf(toString(properties.analytics_session_id), ''),
    nullIf(toString(properties.$session_id), ''),
    concat(toString(toDate(timestamp)), ':', ${identity})
  )`;
}

function postHogBasePageviewSubquery(): string {
  const identity = postHogIdentitySql();
  return `
    SELECT
      timestamp,
      toString(toDate(timestamp)) AS date,
      ${identity} AS identity,
      ${postHogSessionSql(identity)} AS session_key,
      coalesce(
        nullIf(toString(properties.page_path), ''),
        nullIf(toString(properties.$pathname), ''),
        nullIf(toString(properties.$current_url), ''),
        '/'
      ) AS page_path,
      coalesce(
        nullIf(toString(properties.referrer), ''),
        nullIf(toString(properties.$referrer), ''),
        nullIf(toString(properties.utm_source), ''),
        nullIf(extractURLParameter(toString(properties.$current_url), 'utm_source'), ''),
        ''
      ) AS referrer,
      coalesce(
        nullIf(toString(properties.country), ''),
        nullIf(toString(properties.$geoip_country_code), ''),
        ''
      ) AS country,
      coalesce(
        nullIf(toString(properties.device), ''),
        nullIf(toString(properties.$device_type), ''),
        ''
      ) AS device,
      coalesce(
        nullIf(toString(properties.os), ''),
        nullIf(toString(properties.$os), ''),
        ''
      ) AS os,
      coalesce(
        nullIf(toString(properties.browser), ''),
        nullIf(toString(properties.$browser), ''),
        ''
      ) AS browser
    FROM events
    WHERE event IN ('page_viewed', '$pageview')
  `;
}

function postHogBoundedPageviewSubquery(
  startIso: string,
  endExclusiveIso: string,
): string {
  const start = escapeHogQlString(formatHogQlDateTime(startIso));
  const end = escapeHogQlString(formatHogQlDateTime(endExclusiveIso));

  return `
    ${postHogBasePageviewSubquery()}
      AND timestamp >= toDateTime('${start}')
      AND timestamp < toDateTime('${end}')
  `;
}

function acquisitionCacheKey(args: {
  startIso: string;
  endExclusiveIso: string;
}): string {
  return `${args.startIso}:${args.endExclusiveIso}`;
}

function cachedResponse(payload: AcquisitionPayload) {
  return NextResponse.json(
    {
      ...payload,
      cached: true,
    },
    {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=600',
      },
    },
  );
}

function freshResponse(payload: AcquisitionPayload) {
  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'private, max-age=60, stale-while-revalidate=600',
    },
  });
}

function normalizeRoute(pathname: string): string {
  const rules: Array<[RegExp, string]> = [
    [/^\/grimoire\/birthday\/[^/]+$/i, '/grimoire/birthday/[date]'],
    [
      /^\/grimoire\/horoscopes\/[^/]+\/\d{4}\/[^/]+$/i,
      '/grimoire/horoscopes/[sign]/[year]/[month]',
    ],
    [
      /^\/grimoire\/horoscopes\/[^/]+\/\d{4}$/i,
      '/grimoire/horoscopes/[sign]/[year]',
    ],
    [/^\/grimoire\/horoscopes\/[^/]+$/i, '/grimoire/horoscopes/[sign]'],
    [/^\/grimoire\/spells\/[^/]+$/i, '/grimoire/spells/[spellId]'],
    [/^\/grimoire\/placements\/[^/]+$/i, '/grimoire/placements/[placement]'],
    [/^\/grimoire\/angel-numbers\/[^/]+$/i, '/grimoire/angel-numbers/[number]'],
    [/^\/grimoire\/tarot\/[^/]+$/i, '/grimoire/tarot/[card]'],
    [/^\/grimoire\/transits\/year\/\d{4}$/i, '/grimoire/transits/year/[year]'],
    [/^\/grimoire\/decans\/[^/]+\/[^/]+$/i, '/grimoire/decans/[sign]/[decan]'],
    [/^\/grimoire\/moon\/phases\/[^/]+$/i, '/grimoire/moon/phases/[phase]'],
    [
      /^\/grimoire\/synastry\/aspects\/[^/]+$/i,
      '/grimoire/synastry/aspects/[slug]',
    ],
    [/^\/grimoire\/transits\/[^/]+$/i, '/grimoire/transits/[transit]'],
    [/^\/grimoire\/houses\/[^/]+\/[^/]+$/i, '/grimoire/houses/[slug]/[house]'],
    [/^\/grimoire\/double-hours\/[^/]+$/i, '/grimoire/double-hours/[time]'],
    [/^\/grimoire\/mirror-hours\/[^/]+$/i, '/grimoire/mirror-hours/[time]'],
    [/^\/grimoire\/events\/\d{4}\/[^/]+$/i, '/grimoire/events/[year]/[event]'],
    [/^\/grimoire\/crystals\/[^/]+$/i, '/grimoire/crystals/[crystal]'],
    [/^\/grimoire\/compatibility\/[^/]+$/i, '/grimoire/compatibility/[match]'],
    [/^\/grimoire\/moon-in\/[^/]+$/i, '/grimoire/moon-in/[sign]'],
    [
      /^\/grimoire\/seasons\/\d{4}\/[^/]+$/i,
      '/grimoire/seasons/[year]/[season]',
    ],
    [/^\/grimoire\/zodiac\/[^/]+$/i, '/grimoire/zodiac/[sign]'],
    [/^\/grimoire\/rising\/[^/]+$/i, '/grimoire/rising/[sign]'],
    [
      /^\/grimoire\/astronomy\/retrogrades\/[^/]+$/i,
      '/grimoire/astronomy/retrogrades/[planet]',
    ],
    [
      /^\/grimoire\/astronomy\/planets\/[^/]+$/i,
      '/grimoire/astronomy/planets/[planet]',
    ],
    [
      /^\/grimoire\/astronomy\/planets\/[^/]+\/in-signs$/i,
      '/grimoire/astronomy/planets/[planet]/in-signs',
    ],
    [
      /^\/grimoire\/numerology\/soul-urge\/[^/]+$/i,
      '/grimoire/numerology/soul-urge/[number]',
    ],
    [
      /^\/grimoire\/numerology\/expression\/[^/]+$/i,
      '/grimoire/numerology/expression/[number]',
    ],
    [
      /^\/grimoire\/numerology\/karmic-debt\/[^/]+$/i,
      '/grimoire/numerology/karmic-debt/[number]',
    ],
    [
      /^\/grimoire\/numerology\/year\/[^/]+$/i,
      '/grimoire/numerology/year/[year]',
    ],
    [/^\/blog\/week\/[^/]+$/i, '/blog/week/[week]'],
    [/^\/blog\/page\/[^/]+$/i, '/blog/page/[page]'],
    [/^\/\[nav\]\/birth-chart$/i, '/[nav]/birth-chart'],
    [/^\/\[nav\]\/time-machine$/i, '/[nav]/time-machine'],
    [/^\/\[nav\]\/timing$/i, '/[nav]/timing'],
  ];

  for (const [pattern, replacement] of rules) {
    if (pattern.test(pathname)) return replacement;
  }

  return pathname;
}

function stableIdentity(row: Pick<PageviewRow, 'row_id' | 'identity'>): string {
  return row.identity || `unknown:${row.row_id}`;
}

function visitorDayKey(row: Pick<PageviewRow, 'date' | 'row_id' | 'identity'>) {
  return `${row.date}:${stableIdentity(row)}`;
}

function summarizePageviews(rows: PageviewRow[]) {
  const visitorDays = new Set<string>();
  const uniqueVisitors = new Set<string>();
  const sessions = new Map<string, number>();
  const daily = new Map<
    string,
    {
      visitors: Set<string>;
      uniqueVisitors: Set<string>;
      pageViews: number;
      sessions: Map<string, number>;
    }
  >();

  for (const row of rows) {
    const identity = stableIdentity(row);
    const visitorKey = visitorDayKey(row);
    const sessionKey = row.session_key || visitorKey;

    visitorDays.add(visitorKey);
    uniqueVisitors.add(identity);
    sessions.set(sessionKey, (sessions.get(sessionKey) || 0) + 1);

    const bucket = daily.get(row.date) || {
      visitors: new Set<string>(),
      uniqueVisitors: new Set<string>(),
      pageViews: 0,
      sessions: new Map<string, number>(),
    };
    bucket.visitors.add(visitorKey);
    bucket.uniqueVisitors.add(identity);
    bucket.pageViews += 1;
    bucket.sessions.set(sessionKey, (bucket.sessions.get(sessionKey) || 0) + 1);
    daily.set(row.date, bucket);
  }

  const singlePageSessions = Array.from(sessions.values()).filter(
    (pageViews) => pageViews === 1,
  ).length;
  const sessionCount = sessions.size;
  const visitors = visitorDays.size;
  const uniqueVisitorCount = uniqueVisitors.size;
  const pageViews = rows.length;

  return {
    summary: {
      visitors,
      uniqueVisitors: uniqueVisitorCount,
      pageViews,
      sessions: sessionCount,
      singlePageSessions,
      bounceRate:
        sessionCount > 0
          ? normalizePercentage((singlePageSessions / sessionCount) * 100)
          : 0,
      pagesPerVisitor:
        visitors > 0 ? normalizePercentage(pageViews / visitors) : 0,
      pagesPerUniqueVisitor:
        uniqueVisitorCount > 0
          ? normalizePercentage(pageViews / uniqueVisitorCount)
          : 0,
    },
    daily: Array.from(daily.entries())
      .map(([date, bucket]) => {
        const dailySessions = bucket.sessions.size;
        const dailySinglePageSessions = Array.from(
          bucket.sessions.values(),
        ).filter((pageViews) => pageViews === 1).length;

        return {
          date,
          visitors: bucket.visitors.size,
          uniqueVisitors: bucket.uniqueVisitors.size,
          pageViews: bucket.pageViews,
          sessions: dailySessions,
          bounceRate:
            dailySessions > 0
              ? normalizePercentage(
                  (dailySinglePageSessions / dailySessions) * 100,
                )
              : 0,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}

function groupPageviews(
  rows: PageviewRow[],
  totalVisitors: number,
  getKey: (row: PageviewRow) => string,
): BreakdownRow[] {
  const groups = new Map<string, GroupedDimension>();

  for (const row of rows) {
    const key = getKey(row);
    const group =
      groups.get(key) ||
      ({
        visitors: new Set<string>(),
        uniqueVisitors: new Set<string>(),
        pageViews: 0,
      } satisfies GroupedDimension);

    group.visitors.add(visitorDayKey(row));
    group.uniqueVisitors.add(stableIdentity(row));
    group.pageViews += 1;
    groups.set(key, group);
  }

  return Array.from(groups.entries())
    .map(([key, group]) => ({
      key,
      visitors: group.visitors.size,
      uniqueVisitors: group.uniqueVisitors.size,
      pageViews: group.pageViews,
      percentage:
        totalVisitors > 0
          ? normalizePercentage((group.visitors.size / totalVisitors) * 100)
          : 0,
    }))
    .sort((a, b) => b.visitors - a.visitors || b.pageViews - a.pageViews);
}

function breakdownRowsFromPostHog(
  rows: unknown[][],
  totalVisitors: number,
  normalizeKey: (value: string | null) => string,
): BreakdownRow[] {
  return rows
    .map((row) => ({
      key: normalizeKey(stringValue(row[0])),
      visitors: Number(row[1] || 0),
      uniqueVisitors: Number(row[2] || 0),
      pageViews: Number(row[3] || 0),
      percentage:
        totalVisitors > 0
          ? normalizePercentage((Number(row[1] || 0) / totalVisitors) * 100)
          : 0,
    }))
    .sort((a, b) => b.visitors - a.visitors || b.pageViews - a.pageViews);
}

function mergeBreakdownRows(rows: BreakdownRow[], limit = 250): BreakdownRow[] {
  const groups = new Map<string, BreakdownRow>();
  const totalVisitors = rows.reduce((sum, row) => sum + row.visitors, 0);

  for (const row of rows) {
    const existing = groups.get(row.key);
    if (existing) {
      existing.visitors += row.visitors;
      existing.uniqueVisitors += row.uniqueVisitors;
      existing.pageViews += row.pageViews;
    } else {
      groups.set(row.key, { ...row });
    }
  }

  return Array.from(groups.values())
    .map((row) => ({
      ...row,
      percentage:
        totalVisitors > 0
          ? normalizePercentage((row.visitors / totalVisitors) * 100)
          : 0,
    }))
    .sort((a, b) => b.visitors - a.visitors || b.pageViews - a.pageViews)
    .slice(0, limit);
}

function identitySql(hasIdentityLinks: boolean): string {
  if (!hasIdentityLinks) {
    return `
      COALESCE(
        CASE WHEN ce.user_id IS NOT NULL AND ce.user_id <> '' AND ce.user_id NOT LIKE 'anon:%' THEN 'user:' || ce.user_id END,
        CASE WHEN ce.user_id LIKE 'anon:%' THEN 'anon:' || substring(ce.user_id FROM 6) END,
        CASE WHEN ce.anonymous_id IS NOT NULL AND ce.anonymous_id <> '' THEN 'anon:' || ce.anonymous_id END
      )
    `;
  }

  return `
    COALESCE(
      CASE WHEN ce.user_id IS NOT NULL AND ce.user_id <> '' AND ce.user_id NOT LIKE 'anon:%' THEN 'user:' || ce.user_id END,
      CASE WHEN ail.user_id IS NOT NULL AND ail.user_id <> '' THEN 'user:' || ail.user_id END,
      CASE WHEN ce.user_id LIKE 'anon:%' THEN 'anon:' || substring(ce.user_id FROM 6) END,
      CASE WHEN ce.anonymous_id IS NOT NULL AND ce.anonymous_id <> '' THEN 'anon:' || ce.anonymous_id END
    )
  `;
}

function identityJoinSql(hasIdentityLinks: boolean): string {
  if (!hasIdentityLinks) return '';

  return `
    LEFT JOIN (
      SELECT DISTINCT ON (anonymous_id)
        anonymous_id,
        user_id
      FROM analytics_identity_links
      WHERE anonymous_id IS NOT NULL
        AND anonymous_id <> ''
      ORDER BY
        anonymous_id,
        last_seen_at DESC NULLS LAST,
        first_seen_at DESC NULLS LAST,
        user_id
    ) ail
      ON (
        ce.anonymous_id IS NOT NULL
        AND ail.anonymous_id = ce.anonymous_id
      )
      OR (
        ce.user_id LIKE 'anon:%'
        AND ail.anonymous_id = substring(ce.user_id FROM 6)
      )
  `;
}

async function loadPostHogPageviews(
  startIso: string,
  endExclusiveIso: string,
): Promise<PageviewRow[] | null> {
  const start = escapeHogQlString(formatHogQlDateTime(startIso));
  const end = escapeHogQlString(formatHogQlDateTime(endExclusiveIso));

  const query = `
    SELECT
      timestamp,
      distinct_id,
      person_id,
      properties.page_path,
      properties.$pathname,
      properties.$current_url,
      properties.referrer,
      properties.$referrer,
      properties.country,
      properties.$geoip_country_code,
      properties.device,
      properties.$device_type,
      properties.os,
      properties.$os,
      properties.browser,
      properties.$browser,
      properties.analytics_session_id,
      properties.$session_id
    FROM events
    WHERE event IN ('page_viewed', '$pageview')
      AND timestamp >= toDateTime('${start}')
      AND timestamp < toDateTime('${end}')
    ORDER BY timestamp ASC
    LIMIT ${POSTHOG_PAGEVIEW_ROW_LIMIT}
  `;

  const result = await queryPostHogAPI<PostHogQueryResponse>('/query/', {
    method: 'POST',
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query,
      },
      name: 'lunary acquisition pageviews',
    }),
  });

  if (!result || result.error) {
    return null;
  }

  return (result.results ?? []).map((row, index) => {
    const timestamp = stringValue(row[0]) ?? startIso;
    const date = timestamp.slice(0, 10);
    const distinctId = stringValue(row[1]);
    const personId = stringValue(row[2]);
    const pagePath = normalizePostHogPath(row[3], row[4], row[5]);

    return {
      row_id: `posthog:${timestamp}:${index}`,
      date,
      identity: personId ? `person:${personId}` : distinctId,
      session_key:
        stringValue(row[16]) ||
        stringValue(row[17]) ||
        `${date}:${personId || distinctId || `unknown:${index}`}`,
      page_path: pagePath,
      referrer: stringValue(row[6]) || stringValue(row[7]),
      country: stringValue(row[8]) || stringValue(row[9]),
      device: stringValue(row[10]) || stringValue(row[11]),
      os: stringValue(row[12]) || stringValue(row[13]),
      browser: stringValue(row[14]) || stringValue(row[15]),
    };
  });
}

async function queryPostHogRows(
  name: string,
  query: string,
): Promise<unknown[][] | null> {
  const result = await queryPostHogAPI<PostHogQueryResponse>('/query/', {
    method: 'POST',
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query,
      },
      name,
    }),
  });

  if (!result || result.error) return null;
  return result.results ?? [];
}

async function loadPostHogAggregatedAcquisition(
  startIso: string,
  endExclusiveIso: string,
  days: number,
  start: Date,
  end: Date,
): Promise<AcquisitionPayload | null> {
  const pageviews = postHogBoundedPageviewSubquery(startIso, endExclusiveIso);

  const summaryQuery = `
    SELECT
      count() AS page_views,
      count(DISTINCT concat(date, ':', identity)) AS visitors,
      count(DISTINCT identity) AS unique_visitors,
      count(DISTINCT session_key) AS sessions
    FROM (${pageviews})
  `;

  const singlePageSessionsQuery = `
    SELECT count()
    FROM (
      SELECT session_key, count() AS page_views
      FROM (${pageviews})
      GROUP BY session_key
      HAVING page_views = 1
    )
  `;

  const dailyQuery = `
    SELECT
      date,
      count(DISTINCT concat(date, ':', identity)) AS visitors,
      count(DISTINCT identity) AS unique_visitors,
      count() AS page_views,
      count(DISTINCT session_key) AS sessions
    FROM (${pageviews})
    GROUP BY date
    ORDER BY date ASC
  `;

  const dailySinglePageQuery = `
    SELECT date, count()
    FROM (
      SELECT date, session_key, count() AS page_views
      FROM (${pageviews})
      GROUP BY date, session_key
      HAVING page_views = 1
    )
    GROUP BY date
  `;

  const breakdownQuery = (dimension: string, orderBy = 'visitors') => `
    SELECT
      ${dimension} AS key,
      count(DISTINCT concat(date, ':', identity)) AS visitors,
      count(DISTINCT identity) AS unique_visitors,
      count() AS page_views
    FROM (${pageviews})
    GROUP BY key
    ORDER BY ${orderBy} DESC, page_views DESC
    LIMIT ${POSTHOG_BREAKDOWN_LIMIT}
  `;

  const eventQuery = (() => {
    const start = escapeHogQlString(formatHogQlDateTime(startIso));
    const end = escapeHogQlString(formatHogQlDateTime(endExclusiveIso));
    const identity = postHogIdentitySql();

    return `
      SELECT
        event,
        count(DISTINCT concat(toString(toDate(timestamp)), ':', ${identity})) AS visitors,
        count(DISTINCT ${identity}) AS unique_visitors,
        count() AS total_events
      FROM events
      WHERE timestamp >= toDateTime('${start}')
        AND timestamp < toDateTime('${end}')
      GROUP BY event
      ORDER BY total_events DESC, visitors DESC
      LIMIT 250
    `;
  })();

  const [
    summaryRows,
    singlePageRows,
    dailyRows,
    dailySingleRows,
    referrerRows,
    pageRows,
    countryRows,
    deviceRows,
    osRows,
    browserRows,
    eventRows,
  ] = await Promise.all([
    queryPostHogRows('lunary acquisition summary', summaryQuery),
    queryPostHogRows(
      'lunary acquisition single page sessions',
      singlePageSessionsQuery,
    ),
    queryPostHogRows('lunary acquisition daily', dailyQuery),
    queryPostHogRows('lunary acquisition daily bounces', dailySinglePageQuery),
    queryPostHogRows(
      'lunary acquisition referrers',
      breakdownQuery('referrer'),
    ),
    queryPostHogRows('lunary acquisition pages', breakdownQuery('page_path')),
    queryPostHogRows('lunary acquisition countries', breakdownQuery('country')),
    queryPostHogRows('lunary acquisition devices', breakdownQuery('device')),
    queryPostHogRows('lunary acquisition os', breakdownQuery('os')),
    queryPostHogRows('lunary acquisition browsers', breakdownQuery('browser')),
    queryPostHogRows('lunary acquisition events', eventQuery),
  ]);

  if (
    !summaryRows ||
    !singlePageRows ||
    !dailyRows ||
    !dailySingleRows ||
    !referrerRows ||
    !pageRows ||
    !countryRows ||
    !deviceRows ||
    !osRows ||
    !browserRows ||
    !eventRows
  ) {
    return null;
  }

  const summaryRow = summaryRows[0] ?? [];
  const pageViews = Number(summaryRow[0] || 0);
  const visitors = Number(summaryRow[1] || 0);
  const uniqueVisitors = Number(summaryRow[2] || 0);
  const sessions = Number(summaryRow[3] || 0);
  const singlePageSessions = Number(singlePageRows[0]?.[0] || 0);
  const dailySinglePageByDate = new Map(
    dailySingleRows.map((row) => [String(row[0]), Number(row[1] || 0)]),
  );
  const pages = breakdownRowsFromPostHog(pageRows, visitors, (value) =>
    normalizePostHogPath(value, null, null),
  );
  const totalEventCount = eventRows.reduce(
    (sum, row) => sum + Number(row[3] || 0),
    0,
  );

  return {
    source: 'posthog',
    cached: false,
    generatedAt: new Date().toISOString(),
    range: {
      days,
      start: start.toISOString(),
      end: end.toISOString(),
    },
    semantics: {
      visitorDefinition:
        'Visitors are counted as unique identity-days, which is the closest Lunary equivalent to Vercel Web Analytics because Vercel visitor identity is daily-scoped. Unique People dedupes the same identity across the whole selected window.',
      pageViewDefinition:
        'Page Views are PostHog pageview events fired by first-party server middleware in production, with the client route tracker kept as a local/dev fallback. Admin routes are excluded.',
      note: 'Raw acquisition traffic is read from PostHog using aggregate queries, so admin loads do not need high-volume pageview writes in Neon. Older ranges can undercount because global pageview tracking was only rolled out after page_viewed had been wired manually on a handful of routes.',
    },
    summary: {
      visitors,
      uniqueVisitors,
      pageViews,
      sessions,
      singlePageSessions,
      bounceRate:
        sessions > 0
          ? normalizePercentage((singlePageSessions / sessions) * 100)
          : 0,
      pagesPerVisitor:
        visitors > 0 ? normalizePercentage(pageViews / visitors) : 0,
      pagesPerUniqueVisitor:
        uniqueVisitors > 0
          ? normalizePercentage(pageViews / uniqueVisitors)
          : 0,
    },
    daily: dailyRows.map((row) => {
      const date = String(row[0]);
      const dailySessions = Number(row[4] || 0);
      const dailySinglePageSessions = dailySinglePageByDate.get(date) || 0;

      return {
        date,
        visitors: Number(row[1] || 0),
        uniqueVisitors: Number(row[2] || 0),
        pageViews: Number(row[3] || 0),
        sessions: dailySessions,
        bounceRate:
          dailySessions > 0
            ? normalizePercentage(
                (dailySinglePageSessions / dailySessions) * 100,
              )
            : 0,
      };
    }),
    breakdowns: {
      referrers: mergeBreakdownRows(
        breakdownRowsFromPostHog(referrerRows, visitors, normalizeReferrerKey),
      ),
      routes: mergeBreakdownRows(
        pages.map((row) => ({
          ...row,
          key: normalizeRoute(row.key),
        })),
      ),
      pages: pages.slice(0, 250),
      countries: breakdownRowsFromPostHog(
        countryRows,
        visitors,
        normalizeCountry,
      ).slice(0, 250),
      devices: breakdownRowsFromPostHog(
        deviceRows,
        visitors,
        normalizeUnknown,
      ).slice(0, 250),
      operatingSystems: breakdownRowsFromPostHog(
        osRows,
        visitors,
        normalizeUnknown,
      ).slice(0, 250),
      browsers: breakdownRowsFromPostHog(
        browserRows,
        visitors,
        normalizeUnknown,
      ).slice(0, 250),
      events: eventRows.map((row) => {
        const pageViews = Number(row[3] || 0);
        return {
          key: String(row[0] || 'unknown'),
          visitors: Number(row[1] || 0),
          uniqueVisitors: Number(row[2] || 0),
          pageViews,
          percentage:
            totalEventCount > 0
              ? normalizePercentage((pageViews / totalEventCount) * 100)
              : 0,
        };
      }),
    },
  };
}

async function loadPostHogEventBreakdown(
  startIso: string,
  endExclusiveIso: string,
): Promise<BreakdownRow[] | null> {
  const start = escapeHogQlString(formatHogQlDateTime(startIso));
  const end = escapeHogQlString(formatHogQlDateTime(endExclusiveIso));

  const query = `
    SELECT
      event,
      count() AS total_events,
      count(DISTINCT concat(toString(toDate(timestamp)), ':', coalesce(toString(person_id), distinct_id))) AS visitors,
      count(DISTINCT coalesce(toString(person_id), distinct_id)) AS unique_visitors
    FROM events
    WHERE timestamp >= toDateTime('${start}')
      AND timestamp < toDateTime('${end}')
    GROUP BY event
    ORDER BY total_events DESC, visitors DESC
    LIMIT 250
  `;

  const result = await queryPostHogAPI<PostHogQueryResponse>('/query/', {
    method: 'POST',
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query,
      },
      name: 'lunary acquisition event breakdown',
    }),
  });

  if (!result || result.error) {
    return null;
  }

  const rows = result.results ?? [];
  const totalEvents = rows.reduce((sum, row) => sum + Number(row[1] || 0), 0);

  return rows.map((row) => {
    const pageViews = Number(row[1] || 0);
    return {
      key: String(row[0] || 'unknown'),
      pageViews,
      visitors: Number(row[2] || 0),
      uniqueVisitors: Number(row[3] || 0),
      percentage:
        totalEvents > 0
          ? normalizePercentage((pageViews / totalEvents) * 100)
          : 0,
    };
  });
}

async function hasIdentityLinksTable(): Promise<boolean> {
  const result = await sql.query(
    `SELECT to_regclass('analytics_identity_links') IS NOT NULL AS exists`,
  );
  return Boolean(result.rows[0]?.exists);
}

async function loadPageviews(startIso: string, endExclusiveIso: string) {
  const hasIdentityLinks = await hasIdentityLinksTable();
  const identity = identitySql(hasIdentityLinks);
  const identityJoin = identityJoinSql(hasIdentityLinks);

  const result = await sql.query(
    `
      WITH pageviews AS (
        SELECT
          ce.id::text AS row_id,
          DATE(ce.created_at AT TIME ZONE 'UTC')::text AS date,
          ce.created_at,
          COALESCE(NULLIF(ce.page_path, ''), '/') AS page_path,
          ce.metadata,
          ${identity} AS identity
        FROM conversion_events ce
        ${identityJoin}
        WHERE ce.event_type = 'page_viewed'
          AND ce.created_at >= $1
          AND ce.created_at < $2
          AND (
            ce.user_email IS NULL
            OR (ce.user_email NOT LIKE $3 AND ce.user_email != $4)
          )
      )
      SELECT
        row_id,
        date,
        identity,
        COALESCE(
          NULLIF(metadata->>'analytics_session_id', ''),
          COALESCE(identity, 'unknown:' || row_id) || ':' || date
        ) AS session_key,
        page_path,
        metadata->>'referrer' AS referrer,
        metadata->>'country' AS country,
        metadata->>'device' AS device,
        metadata->>'os' AS os,
        metadata->>'browser' AS browser
      FROM pageviews
      ORDER BY date ASC
    `,
    [startIso, endExclusiveIso, TEST_EMAIL_PATTERN, TEST_EMAIL_EXACT],
  );

  return result.rows as PageviewRow[];
}

async function loadEventBreakdown(
  startIso: string,
  endExclusiveIso: string,
): Promise<BreakdownRow[]> {
  const hasIdentityLinks = await hasIdentityLinksTable();
  const identity = identitySql(hasIdentityLinks);
  const identityJoin = identityJoinSql(hasIdentityLinks);

  const result = await sql.query(
    `
      WITH events AS (
        SELECT
          ce.id::text AS row_id,
          ce.event_type,
          DATE(ce.created_at AT TIME ZONE 'UTC')::text AS date,
          ${identity} AS identity
        FROM conversion_events ce
        ${identityJoin}
        WHERE ce.created_at >= $1
          AND ce.created_at < $2
          AND (
            ce.user_email IS NULL
            OR (ce.user_email NOT LIKE $3 AND ce.user_email != $4)
          )
      )
      SELECT
        event_type,
        COUNT(*)::int AS total_events,
        COUNT(DISTINCT date || ':' || COALESCE(identity, 'unknown:' || row_id))::int AS visitors,
        COUNT(DISTINCT COALESCE(identity, 'unknown:' || row_id))::int AS unique_visitors
      FROM events
      GROUP BY event_type
      ORDER BY total_events DESC, visitors DESC
    `,
    [startIso, endExclusiveIso, TEST_EMAIL_PATTERN, TEST_EMAIL_EXACT],
  );

  const totalEvents = result.rows.reduce(
    (sum, row) => sum + Number(row.total_events || 0),
    0,
  );

  return result.rows.map((row) => {
    const pageViews = Number(row.total_events || 0);
    return {
      key: String(row.event_type || 'unknown'),
      visitors: Number(row.visitors || 0),
      uniqueVisitors: Number(row.unique_visitors || 0),
      pageViews,
      percentage:
        totalEvents > 0
          ? normalizePercentage((pageViews / totalEvents) * 100)
          : 0,
    };
  });
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const { start, end, days } = parseDateRange(searchParams);
    const startIso = start.toISOString();
    const endExclusiveIso = new Date(end.getTime() + 1).toISOString();
    const cacheKey = acquisitionCacheKey({ startIso, endExclusiveIso });
    const bypassCache = searchParams.get('refresh') === '1';
    const cached = acquisitionCache.get(cacheKey);

    if (!bypassCache && cached && cached.expiresAt > Date.now()) {
      return cachedResponse(cached.payload);
    }

    const aggregatedPostHogPayload = await loadPostHogAggregatedAcquisition(
      startIso,
      endExclusiveIso,
      days,
      start,
      end,
    );

    if (aggregatedPostHogPayload) {
      acquisitionCache.set(cacheKey, {
        expiresAt: Date.now() + ACQUISITION_CACHE_TTL_MS,
        payload: aggregatedPostHogPayload,
      });

      return freshResponse(aggregatedPostHogPayload);
    }

    let source: AcquisitionSource = 'posthog';
    let rows = await loadPostHogPageviews(startIso, endExclusiveIso);

    if (!rows) {
      source = 'neon_fallback';
      rows = await loadPageviews(startIso, endExclusiveIso);
    }

    const { summary, daily } = summarizePageviews(rows);
    const totalVisitors = summary.visitors;

    const events =
      source === 'posthog'
        ? ((await loadPostHogEventBreakdown(startIso, endExclusiveIso)) ?? [])
        : await loadEventBreakdown(startIso, endExclusiveIso);

    const payload: AcquisitionPayload = {
      source,
      cached: false,
      generatedAt: new Date().toISOString(),
      range: {
        days,
        start: start.toISOString(),
        end: end.toISOString(),
      },
      semantics: {
        visitorDefinition:
          'Visitors are counted as unique identity-days, which is the closest Lunary equivalent to Vercel Web Analytics because Vercel visitor identity is daily-scoped. Unique People dedupes the same identity across the whole selected window.',
        pageViewDefinition:
          'Page Views are PostHog pageview events fired by first-party server middleware in production, with the client route tracker kept as a local/dev fallback. Admin routes are excluded.',
        note:
          source === 'posthog'
            ? 'Raw acquisition traffic is read from PostHog to avoid high-volume pageview writes in Neon. Older ranges can undercount because global pageview tracking was only rolled out after page_viewed had been wired manually on a handful of routes.'
            : 'PostHog acquisition data was unavailable, so this response fell back to Neon conversion_events. Older ranges can undercount because global pageview tracking was only rolled out after page_viewed had been wired manually on a handful of routes.',
      },
      summary,
      daily,
      breakdowns: {
        referrers: groupPageviews(rows, totalVisitors, (row) =>
          normalizeReferrerKey(row.referrer),
        ).slice(0, 250),
        routes: groupPageviews(rows, totalVisitors, (row) =>
          normalizeRoute(row.page_path?.trim() || '/'),
        ).slice(0, 250),
        pages: groupPageviews(
          rows,
          totalVisitors,
          (row) => row.page_path?.trim() || '/',
        ).slice(0, 250),
        countries: groupPageviews(rows, totalVisitors, (row) =>
          normalizeCountry(row.country),
        ).slice(0, 250),
        devices: groupPageviews(rows, totalVisitors, (row) =>
          normalizeUnknown(row.device),
        ).slice(0, 250),
        operatingSystems: groupPageviews(rows, totalVisitors, (row) =>
          normalizeUnknown(row.os),
        ).slice(0, 250),
        browsers: groupPageviews(rows, totalVisitors, (row) =>
          normalizeUnknown(row.browser),
        ).slice(0, 250),
        events,
      },
    };

    acquisitionCache.set(cacheKey, {
      expiresAt: Date.now() + ACQUISITION_CACHE_TTL_MS,
      payload,
    });

    return freshResponse(payload);
  } catch (error) {
    console.error('[admin/analytics/acquisition-breakdown] failed', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unknown acquisition breakdown error',
      },
      { status: 500 },
    );
  }
}
