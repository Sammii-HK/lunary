import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatTimestamp, resolveDateRange } from '@/lib/analytics/date-range';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

// Canonical event types (DB is SSOT)
// - Engagement (DAU/WAU/MAU) is derived from app_opened plus key usage events.
const ENGAGEMENT_EVENTS = [
  'grimoire_viewed',
  'tarot_drawn',
  'chart_viewed',
  'birth_chart_viewed',
  'personalized_horoscope_viewed',
  'personalized_tarot_viewed',
  'astral_chat_used',
  'ritual_started',
  'horoscope_viewed',
  'daily_dashboard_viewed',
  'journal_entry_created',
  'dream_entry_created',
  'cosmic_pulse_opened',
];
const APP_OPENED_EVENTS = ['app_opened'];

// Product interaction events - same as engagement events
// The difference is Product requires signed-in users
const PRODUCT_EVENTS = [
  'grimoire_viewed',
  'tarot_drawn',
  'chart_viewed',
  'birth_chart_viewed',
  'personalized_horoscope_viewed',
  'personalized_tarot_viewed',
  'astral_chat_used',
  'ritual_started',
  'horoscope_viewed',
  'daily_dashboard_viewed',
  'journal_entry_created',
  'dream_entry_created',
  'cosmic_pulse_opened',
];
const SITEWIDE_EVENTS = ['page_viewed'];
const GRIMOIRE_EVENTS = ['grimoire_viewed'];
const AUDIT_THRESHOLD_PERCENT = 2;

// Note: When using @vercel/postgres, avoid constructing "array SQL" as a string
// or nesting sql fragments. Instead pass JS arrays as parameters and cast to text[].

const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

// Count total events (not distinct users) in a window
const countEventsInWindow = (
  eventCountMap: Map<string, number>,
  endDate: Date,
  days: number,
) => {
  const start = new Date(endDate);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  let total = 0;
  for (
    let d = new Date(start);
    d <= endDate;
    d.setUTCDate(d.getUTCDate() + 1)
  ) {
    const key = formatDateKey(d);
    total += eventCountMap.get(key) || 0;
  }
  return total;
};

type IdentityRow = {
  date: unknown;
  user_id?: string | null;
  anonymous_id?: string | null;
};

type IdentityOptions = {
  requireSignedIn?: boolean;
};

const sanitizeIdentityValue = (value?: string | null): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const canonicalIdentityFromRow = (
  row: IdentityRow,
  identityLinks: Map<string, string>,
): { identity: string | null; signedIn: boolean } => {
  const userId = sanitizeIdentityValue(row.user_id);
  if (userId) {
    return { identity: `user:${userId}`, signedIn: true };
  }

  const anonymousId = sanitizeIdentityValue(row.anonymous_id);
  if (!anonymousId) {
    return { identity: null, signedIn: false };
  }

  const linkedUserId = identityLinks.get(anonymousId);
  if (linkedUserId) {
    return { identity: `user:${linkedUserId}`, signedIn: true };
  }

  return { identity: `anon:${anonymousId}`, signedIn: false };
};

const addIdentityRow = (
  map: Map<string, Set<string>>,
  row: IdentityRow,
  identityLinks: Map<string, string>,
  options: IdentityOptions = {},
) => {
  const { identity, signedIn } = canonicalIdentityFromRow(row, identityLinks);
  if (!identity) return;
  if (options.requireSignedIn && !signedIn) {
    return;
  }
  const date = normalizeRowDateKey(row.date);
  if (!map.has(date)) {
    map.set(date, new Set());
  }
  map.get(date)!.add(identity);
};

const toUtcStartOfDay = (value: Date) =>
  new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
  );

const gatherUsersBetween = (
  map: Map<string, Set<string>>,
  start: Date,
  end: Date,
) => {
  if (start > end) {
    return new Set<string>();
  }
  const users = new Set<string>();
  for (
    let cursor = new Date(start);
    cursor <= end;
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  ) {
    const key = formatDateKey(cursor);
    const bucket = map.get(key);
    if (!bucket) continue;
    bucket.forEach((id) => users.add(id));
  }
  return users;
};

const intersectionSize = (a: Set<string>, b: Set<string>) => {
  let count = 0;
  a.forEach((value) => {
    if (b.has(value)) {
      count += 1;
    }
  });
  return count;
};

const normalizeRowDateKey = (value: unknown): string => {
  // `DATE(created_at)` can come back as a Date or a string depending on driver.
  if (value instanceof Date) return formatDateKey(value);
  if (typeof value === 'string') {
    // Keep date-only strings stable.
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return formatDateKey(parsed);
    return value;
  }
  const parsed = new Date(String(value));
  if (!Number.isNaN(parsed.getTime())) return formatDateKey(parsed);
  return String(value);
};

const alignDateToGranularity = (
  date: Date,
  granularity: 'day' | 'week' | 'month',
) => {
  const aligned = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

  if (granularity === 'week') {
    const day = aligned.getUTCDay();
    const diff = (day + 6) % 7;
    aligned.setUTCDate(aligned.getUTCDate() - diff);
  } else if (granularity === 'month') {
    aligned.setUTCDate(1);
  }

  return aligned;
};

const buildDateBuckets = (
  startDate: Date,
  endDate: Date,
  granularity: 'day' | 'week' | 'month',
) => {
  const buckets: string[] = [];
  const cursor = alignDateToGranularity(startDate, granularity);
  const end = new Date(endDate.getTime());

  while (cursor <= end) {
    buckets.push(formatDateKey(cursor));
    if (granularity === 'week') {
      cursor.setUTCDate(cursor.getUTCDate() + 7);
    } else if (granularity === 'month') {
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    } else {
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  return buckets;
};

const buildRollingTrends = (
  userMap: Map<string, Set<string>>,
  startDate: Date,
  endDate: Date,
  granularity: 'day' | 'week' | 'month',
) => {
  const trends: Array<{ date: string; dau: number; wau: number; mau: number }> =
    [];
  const buckets = buildDateBuckets(startDate, endDate, granularity);

  const buildWindowSet = (end: Date, days: number) => {
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (days - 1));
    const windowUsers = new Set<string>();
    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      const key = formatDateKey(d);
      const users = userMap.get(key);
      if (users) {
        users.forEach((id) => windowUsers.add(id));
      }
    }
    return windowUsers;
  };

  for (const bucket of buckets) {
    const bucketDate = new Date(`${bucket}T00:00:00Z`);
    const dau = userMap.get(bucket)?.size || 0;
    const wau = buildWindowSet(bucketDate, 7).size;
    const mau = buildWindowSet(bucketDate, 30).size;
    trends.push({ date: bucket, dau, wau, mau });
  }

  return trends;
};

const countDistinctInWindow = (
  userMap: Map<string, Set<string>>,
  endDate: Date,
  days: number,
) => {
  const start = new Date(endDate);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  const windowUsers = new Set<string>();
  for (
    let d = new Date(start);
    d <= endDate;
    d.setUTCDate(d.getUTCDate() + 1)
  ) {
    const key = formatDateKey(d);
    const users = userMap.get(key);
    if (users) {
      users.forEach((id) => windowUsers.add(id));
    }
  }
  return windowUsers.size;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const granularity = (searchParams.get('granularity') || 'day') as
      | 'day'
      | 'week'
      | 'month';
    const range = resolveDateRange(searchParams, 30);

    const identityLinksExistsResult = await sql.query(
      `SELECT to_regclass('analytics_identity_links') IS NOT NULL AS exists`,
    );
    const hasIdentityLinks = Boolean(identityLinksExistsResult.rows[0]?.exists);

    const extendedStart = new Date(range.start);
    extendedStart.setUTCDate(extendedStart.getUTCDate() - 30);

    const auditAppOpenedQuery = hasIdentityLinks
      ? `
      WITH canonical AS (
        SELECT
          DATE((ce.created_at AT TIME ZONE 'UTC')) AS date,
          COALESCE(
            CASE WHEN ce.user_id IS NOT NULL AND ce.user_id <> '' THEN 'user:' || ce.user_id END,
            CASE WHEN l.user_id IS NOT NULL THEN 'user:' || l.user_id END,
            CASE WHEN ce.anonymous_id IS NOT NULL AND ce.anonymous_id <> '' THEN 'anon:' || ce.anonymous_id END
          ) AS identity
        FROM conversion_events ce
        LEFT JOIN analytics_identity_links l
          ON l.anonymous_id = ce.anonymous_id
        WHERE ce.event_type = 'app_opened'
          AND ce.created_at >= $1
          AND ce.created_at <= $2
          AND (ce.user_email IS NULL OR (ce.user_email NOT LIKE $3 AND ce.user_email != $4))
          AND (ce.user_id IS NOT NULL OR ce.anonymous_id IS NOT NULL)
      )
      SELECT date, identity
      FROM canonical
      WHERE identity IS NOT NULL
    `
      : `
      WITH canonical AS (
        SELECT
          DATE((created_at AT TIME ZONE 'UTC')) AS date,
          COALESCE(
            CASE WHEN user_id IS NOT NULL AND user_id <> '' THEN 'user:' || user_id END,
            CASE WHEN anonymous_id IS NOT NULL AND anonymous_id <> '' THEN 'anon:' || anonymous_id END
          ) AS identity
        FROM conversion_events
        WHERE event_type = 'app_opened'
          AND created_at >= $1
          AND created_at <= $2
          AND (user_email IS NULL OR (user_email NOT LIKE $3 AND user_email != $4))
          AND (user_id IS NOT NULL OR anonymous_id IS NOT NULL)
      )
      SELECT date, identity
      FROM canonical
      WHERE identity IS NOT NULL
    `;

    const auditAppOpenedParams = [
      formatTimestamp(extendedStart),
      formatTimestamp(range.end),
      TEST_EMAIL_PATTERN,
      TEST_EMAIL_EXACT,
    ];

    const [
      activityRows,
      appOpenedRows,
      productRows,
      grimoireRows,
      sitewideRows,
      auditRows,
    ] = await Promise.all([
      sql.query(
        `
          SELECT
            DATE(created_at) as date,
            user_id,
            anonymous_id
          FROM conversion_events
          WHERE event_type = ANY($1::text[])
            AND created_at >= $2
            AND created_at <= $3
            AND (user_email IS NULL OR (user_email NOT LIKE $4 AND user_email != $5))
        `,
        [
          ENGAGEMENT_EVENTS,
          formatTimestamp(extendedStart),
          formatTimestamp(range.end),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),
      sql.query(
        `
          SELECT
            DATE(created_at) as date,
            user_id,
            anonymous_id
          FROM conversion_events
          WHERE event_type = ANY($1::text[])
            AND created_at >= $2
            AND created_at <= $3
            AND (user_email IS NULL OR (user_email NOT LIKE $4 AND user_email != $5))
        `,
        [
          APP_OPENED_EVENTS,
          formatTimestamp(extendedStart),
          formatTimestamp(range.end),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),
      sql.query(
        `
          SELECT
            DATE(created_at) as date,
            user_id,
            anonymous_id
          FROM conversion_events
          WHERE event_type = ANY($1::text[])
            AND created_at >= $2
            AND created_at <= $3
            AND (user_email IS NULL OR (user_email NOT LIKE $4 AND user_email != $5))
        `,
        [
          PRODUCT_EVENTS,
          formatTimestamp(extendedStart),
          formatTimestamp(range.end),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),
      sql.query(
        `
          SELECT
            DATE(created_at) as date,
            user_id,
            anonymous_id
          FROM conversion_events
          WHERE event_type = ANY($1::text[])
            AND created_at >= $2
            AND created_at <= $3
            AND (user_email IS NULL OR (user_email NOT LIKE $4 AND user_email != $5))
        `,
        [
          GRIMOIRE_EVENTS,
          formatTimestamp(extendedStart),
          formatTimestamp(range.end),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),
      sql.query(
        `
          SELECT
            DATE(created_at) as date,
            user_id,
            anonymous_id
          FROM conversion_events
          WHERE event_type = ANY($1::text[])
            AND created_at >= $2
            AND created_at <= $3
            AND (user_email IS NULL OR (user_email NOT LIKE $4 AND user_email != $5))
        `,
        [
          SITEWIDE_EVENTS,
          formatTimestamp(extendedStart),
          formatTimestamp(range.end),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),
      sql.query(auditAppOpenedQuery, auditAppOpenedParams),
    ]);

    const collectSources = [
      activityRows.rows,
      appOpenedRows.rows,
      productRows.rows,
      grimoireRows.rows,
      sitewideRows.rows,
    ];
    const anonymousIds = new Set<string>();
    collectSources.forEach((rows) => {
      rows.forEach((row) => {
        const anonymousId = sanitizeIdentityValue(row.anonymous_id);
        if (anonymousId) {
          anonymousIds.add(anonymousId);
        }
      });
    });

    const identityLinks = new Map<string, string>();
    if (hasIdentityLinks && anonymousIds.size > 0) {
      const linkResult = await sql.query(
        `
          SELECT anonymous_id, user_id
          FROM analytics_identity_links
          WHERE anonymous_id = ANY($1::text[])
        `,
        [[...anonymousIds]],
      );
      linkResult.rows.forEach((linkRow) => {
        const anonymousId = sanitizeIdentityValue(linkRow.anonymous_id);
        const userId = sanitizeIdentityValue(linkRow.user_id);
        if (anonymousId && userId) {
          identityLinks.set(anonymousId, userId);
        }
      });
    }

    const totalAccountsQuery = hasIdentityLinks
      ? `
      WITH canonical AS (
        SELECT
          CASE
            WHEN ce.user_id IS NOT NULL AND ce.user_id <> '' THEN 'user:' || ce.user_id
            WHEN l.user_id IS NOT NULL AND l.user_id <> '' THEN 'user:' || l.user_id
            WHEN ce.anonymous_id IS NOT NULL AND ce.anonymous_id <> '' THEN 'anon:' || ce.anonymous_id
          END AS identity
        FROM conversion_events ce
        LEFT JOIN analytics_identity_links l
          ON l.anonymous_id = ce.anonymous_id
        WHERE ce.event_type = 'signup_completed'
          AND (ce.user_email IS NULL OR (ce.user_email NOT LIKE $1 AND ce.user_email != $2))
          AND (ce.user_id IS NOT NULL OR ce.anonymous_id IS NOT NULL)
      )
      SELECT COUNT(DISTINCT identity) AS total_accounts
      FROM canonical
      WHERE identity IS NOT NULL
    `
      : `
      WITH canonical AS (
        SELECT
          CASE
            WHEN ce.user_id IS NOT NULL AND ce.user_id <> '' THEN 'user:' || ce.user_id
            WHEN ce.anonymous_id IS NOT NULL AND ce.anonymous_id <> '' THEN 'anon:' || ce.anonymous_id
          END AS identity
        FROM conversion_events ce
        WHERE ce.event_type = 'signup_completed'
          AND (ce.user_email IS NULL OR (ce.user_email NOT LIKE $1 AND ce.user_email != $2))
          AND (ce.user_id IS NOT NULL OR ce.anonymous_id IS NOT NULL)
      )
      SELECT COUNT(DISTINCT identity) AS total_accounts
      FROM canonical
      WHERE identity IS NOT NULL
    `;

    const totalAccountsResult = await sql.query(totalAccountsQuery, [
      TEST_EMAIL_PATTERN,
      TEST_EMAIL_EXACT,
    ]);
    const totalAccountsEver = Number(
      totalAccountsResult.rows[0]?.total_accounts || 0,
    );

    const activityMap = new Map<string, Set<string>>();
    const activityEventCountMap = new Map<string, number>();
    activityRows.rows.forEach((row) => {
      addIdentityRow(activityMap, row, identityLinks);
      // Also count total events per day (not distinct)
      const dateKey =
        typeof row.date === 'string'
          ? row.date.split('T')[0]
          : row.date instanceof Date
            ? formatDateKey(row.date)
            : '';
      if (dateKey) {
        activityEventCountMap.set(
          dateKey,
          (activityEventCountMap.get(dateKey) || 0) + 1,
        );
      }
    });
    // Engagement = total events (not distinct users) - shows usage intensity
    const engagementEventsDau = countEventsInWindow(
      activityEventCountMap,
      range.end,
      1,
    );
    const engagementEventsWau = countEventsInWindow(
      activityEventCountMap,
      range.end,
      7,
    );
    const engagementEventsMau = countEventsInWindow(
      activityEventCountMap,
      range.end,
      30,
    );
    // Also keep distinct user counts for returning/stickiness calculations
    const engagementUsersDau = countDistinctInWindow(activityMap, range.end, 1);
    const engagementUsersWau = countDistinctInWindow(activityMap, range.end, 7);
    const engagementUsersMau = countDistinctInWindow(
      activityMap,
      range.end,
      30,
    );

    const productMap = new Map<string, Set<string>>();
    productRows.rows.forEach((row) =>
      addIdentityRow(productMap, row, identityLinks, { requireSignedIn: true }),
    );

    const grimoireMap = new Map<string, Set<string>>();
    grimoireRows.rows.forEach((row) =>
      addIdentityRow(grimoireMap, row, identityLinks),
    );

    const sitewideMap = new Map<string, Set<string>>();
    sitewideRows.rows.forEach((row) =>
      addIdentityRow(sitewideMap, row, identityLinks),
    );

    const appOpenedMap = new Map<string, Set<string>>();
    appOpenedRows.rows.forEach((row) =>
      addIdentityRow(appOpenedMap, row, identityLinks),
    );
    const auditMap = new Map<string, Set<string>>();
    auditRows.rows.forEach((row) => {
      const dateKey = normalizeRowDateKey(row.date);
      if (!auditMap.has(dateKey)) {
        auditMap.set(dateKey, new Set());
      }
      auditMap.get(dateKey)!.add(row.identity);
    });

    const endOfRangeDay = toUtcStartOfDay(range.end);
    const lookbackEnd = new Date(endOfRangeDay);
    lookbackEnd.setUTCDate(lookbackEnd.getUTCDate() - 1);
    // Use activityMap (engagement events) for returning users to match DAU/WAU/MAU
    const earlierLookbackSet = gatherUsersBetween(
      activityMap,
      lookbackEnd,
      lookbackEnd,
    );
    const currentDaySet =
      activityMap.get(formatDateKey(endOfRangeDay)) ?? new Set<string>();
    const returningDau = intersectionSize(currentDaySet, earlierLookbackSet);

    const currentWauStart = new Date(endOfRangeDay);
    currentWauStart.setUTCDate(currentWauStart.getUTCDate() - 6);
    const prevWauEnd = new Date(currentWauStart);
    prevWauEnd.setUTCDate(prevWauEnd.getUTCDate() - 1);
    const prevWauStart = new Date(prevWauEnd);
    prevWauStart.setUTCDate(prevWauStart.getUTCDate() - 6);
    const currentWauSet = gatherUsersBetween(
      activityMap,
      currentWauStart,
      endOfRangeDay,
    );
    const prevWauSet = gatherUsersBetween(
      activityMap,
      prevWauStart,
      prevWauEnd,
    );
    const returningWau = intersectionSize(currentWauSet, prevWauSet);

    const currentMauStart = new Date(endOfRangeDay);
    currentMauStart.setUTCDate(currentMauStart.getUTCDate() - 29);
    const prevMauEnd = new Date(currentMauStart);
    prevMauEnd.setUTCDate(prevMauEnd.getUTCDate() - 1);
    const prevMauStart = new Date(prevMauEnd);
    prevMauStart.setUTCDate(prevMauStart.getUTCDate() - 29);
    const currentMauSet = gatherUsersBetween(
      activityMap,
      currentMauStart,
      endOfRangeDay,
    );
    const prevMauSet = gatherUsersBetween(
      activityMap,
      prevMauStart,
      prevMauEnd,
    );
    const returningMau = intersectionSize(currentMauSet, prevMauSet);

    const engagementTrends = buildRollingTrends(
      activityMap,
      range.start,
      range.end,
      granularity,
    );
    const appOpenedTrends = buildRollingTrends(
      appOpenedMap,
      range.start,
      range.end,
      granularity,
    );
    const trends = engagementTrends;
    const productTrends = buildRollingTrends(
      productMap,
      range.start,
      range.end,
      granularity,
    );
    const grimoireTrends = buildRollingTrends(
      grimoireMap,
      range.start,
      range.end,
      granularity,
    );
    const sitewideTrends = buildRollingTrends(
      sitewideMap,
      range.start,
      range.end,
      granularity,
    );

    const currentBucket = formatDateKey(
      alignDateToGranularity(range.end, granularity),
    );
    const currentTrend = trends.find(
      (trend) => trend.date === currentBucket,
    ) || {
      dau: 0,
      wau: 0,
      mau: 0,
    };
    const currentProductTrend = productTrends.find(
      (trend) => trend.date === currentBucket,
    ) || {
      dau: 0,
      wau: 0,
      mau: 0,
    };
    const currentGrimoireTrend = grimoireTrends.find(
      (trend) => trend.date === currentBucket,
    ) || {
      dau: 0,
      wau: 0,
      mau: 0,
    };
    const currentAppOpenedTrend = appOpenedTrends.find(
      (trend) => trend.date === currentBucket,
    ) || {
      dau: 0,
      wau: 0,
      mau: 0,
    };
    const productDau = countDistinctInWindow(productMap, range.end, 1);
    const productWau = countDistinctInWindow(productMap, range.end, 7);
    const productMau = countDistinctInWindow(productMap, range.end, 30);
    const grimoireDau = countDistinctInWindow(grimoireMap, range.end, 1);
    const grimoireWau = countDistinctInWindow(grimoireMap, range.end, 7);
    const grimoireMau = countDistinctInWindow(grimoireMap, range.end, 30);
    const appOpenedDau = countDistinctInWindow(appOpenedMap, range.end, 1);
    const appOpenedWau = countDistinctInWindow(appOpenedMap, range.end, 7);
    const appOpenedMau = countDistinctInWindow(appOpenedMap, range.end, 30);
    const sitewideDau = countDistinctInWindow(sitewideMap, range.end, 1);
    const sitewideWau = countDistinctInWindow(sitewideMap, range.end, 7);
    const sitewideMau = countDistinctInWindow(sitewideMap, range.end, 30);

    const rawDau = countDistinctInWindow(auditMap, range.end, 1);
    const rawWau = countDistinctInWindow(auditMap, range.end, 7);
    const rawMau = countDistinctInWindow(auditMap, range.end, 30);
    const calculateAuditDiff = (actual: number, reference: number) =>
      reference > 0 ? (Math.abs(actual - reference) / reference) * 100 : 0;
    const auditDiffPercentages = {
      dau: calculateAuditDiff(appOpenedDau, rawDau),
      wau: calculateAuditDiff(appOpenedWau, rawWau),
      mau: calculateAuditDiff(appOpenedMau, rawMau),
    };
    const auditMismatch =
      (rawDau > 0 && auditDiffPercentages.dau > AUDIT_THRESHOLD_PERCENT) ||
      (rawWau > 0 && auditDiffPercentages.wau > AUDIT_THRESHOLD_PERCENT) ||
      (rawMau > 0 && auditDiffPercentages.mau > AUDIT_THRESHOLD_PERCENT);

    const signedInProductDau = productDau;
    const signedInProductWau = productWau;
    const signedInProductMau = productMau;

    const grimoireWindowStart = new Date(range.end);
    grimoireWindowStart.setUTCDate(grimoireWindowStart.getUTCDate() - 29);
    const grimoireEventsResult = await sql`
        SELECT DISTINCT user_id
        FROM conversion_events
        WHERE event_type = 'grimoire_viewed'
        AND user_id IS NOT NULL
        AND user_id NOT LIKE 'anon:%'
        AND created_at >= ${formatTimestamp(grimoireWindowStart)}
        AND created_at <= ${formatTimestamp(range.end)}
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
      `;
    const productWindowResult = await sql.query(
      `
        SELECT DISTINCT user_id
        FROM conversion_events
        WHERE event_type = ANY($1::text[])
          AND user_id IS NOT NULL
          AND user_id NOT LIKE 'anon:%'
          AND created_at >= $2
          AND created_at <= $3
          AND (user_email IS NULL OR (user_email NOT LIKE $4 AND user_email != $5))
      `,
      [
        // Treat any app_opened as product engagement for the purpose of
        // identifying Grimoire-only users (Grimoire-only means Grimoire without app engagement).
        ['app_opened', ...PRODUCT_EVENTS],
        formatTimestamp(grimoireWindowStart),
        formatTimestamp(range.end),
        TEST_EMAIL_PATTERN,
        TEST_EMAIL_EXACT,
      ],
    );

    const grimoireUsers = new Set(
      grimoireEventsResult.rows.map((row) => String(row.user_id)),
    );
    const signedInProductUsers = new Set(
      productWindowResult.rows.map((row) => String(row.user_id)),
    );
    const grimoireOnlyMauBase = grimoireUsers.size;
    let grimoireOnlyMau = 0;
    grimoireUsers.forEach((id) => {
      if (!signedInProductUsers.has(id)) {
        grimoireOnlyMau += 1;
      }
    });

    const productUsageSummaryResult = await sql.query(
      `
        SELECT
          user_id,
          COUNT(*) as total_events,
          COUNT(DISTINCT DATE(created_at)) as active_days
        FROM conversion_events
        WHERE event_type = ANY($1::text[])
          AND user_id IS NOT NULL
          AND user_id NOT LIKE 'anon:%'
          AND created_at >= $2
          AND created_at <= $3
          AND (user_email IS NULL OR (user_email NOT LIKE $4 AND user_email != $5))
        GROUP BY user_id
      `,
      [
        PRODUCT_EVENTS,
        formatTimestamp(range.start),
        formatTimestamp(range.end),
        TEST_EMAIL_PATTERN,
        TEST_EMAIL_EXACT,
      ],
    );

    const productUsers = productUsageSummaryResult.rows.length;
    const returningUsers = productUsageSummaryResult.rows.filter(
      (row) => Number(row.active_days || 0) > 1,
    ).length;
    const totalSessions = productUsageSummaryResult.rows.reduce(
      (sum, row) => sum + Number(row.active_days || 0),
      0,
    );
    const avgSessionsPerUser =
      productUsers > 0 ? totalSessions / productUsers : 0;

    const calcRetention = async (
      cohortStart: Date,
      cohortEndInclusive: Date,
      days: 1 | 7 | 30,
    ): Promise<number | null> => {
      if (cohortEndInclusive < cohortStart) return null;
      // Standard retention: "Day N or later" (ensures Day 1 >= Day 7 >= Day 30)
      const dateCondition = `DATE(ce.created_at AT TIME ZONE 'UTC') >= DATE(cohort."createdAt" AT TIME ZONE 'UTC') + ${days}`;

      const query = hasIdentityLinks
        ? `
        WITH cohort AS (
          SELECT id, "createdAt"
          FROM "user"
          WHERE "createdAt" >= $1
            AND "createdAt" <= $2
            AND (email IS NULL OR (email NOT LIKE $4 AND email != $5))
        )
        SELECT
          COUNT(*) AS cohort_size,
          COUNT(*) FILTER (
            WHERE EXISTS (
              SELECT 1
              FROM conversion_events ce
              WHERE ce.event_type = ANY($3::text[])
                AND ${dateCondition}
                AND (
                  ce.user_id = cohort.id
                  OR (
                    ce.anonymous_id IS NOT NULL
                    AND EXISTS (
                      SELECT 1
                      FROM analytics_identity_links l
                      WHERE l.user_id = cohort.id
                        AND l.anonymous_id = ce.anonymous_id
                    )
                  )
                )
                AND (ce.user_email IS NULL OR (ce.user_email NOT LIKE $4 AND ce.user_email != $5))
            )
          ) AS returned
        FROM cohort
      `
        : `
        WITH cohort AS (
          SELECT id, "createdAt"
          FROM "user"
          WHERE "createdAt" >= $1
            AND "createdAt" <= $2
            AND (email IS NULL OR (email NOT LIKE $4 AND email != $5))
        )
        SELECT
          COUNT(*) AS cohort_size,
          COUNT(*) FILTER (
            WHERE EXISTS (
              SELECT 1
              FROM conversion_events ce
              WHERE ce.user_id = cohort.id
                AND ce.event_type = ANY($3::text[])
                AND ${dateCondition}
                AND (ce.user_email IS NULL OR (ce.user_email NOT LIKE $4 AND ce.user_email != $5))
            )
          ) AS returned
        FROM cohort
      `;

      const result = await sql.query(query, [
        formatTimestamp(cohortStart),
        formatTimestamp(cohortEndInclusive),
        ENGAGEMENT_EVENTS,
        TEST_EMAIL_PATTERN,
        TEST_EMAIL_EXACT,
      ]);

      const cohortSize = Number(result.rows[0]?.cohort_size || 0);
      const returned = Number(result.rows[0]?.returned || 0);
      return cohortSize > 0 ? (returned / cohortSize) * 100 : null;
    };

    // Retention for the selected range: cohort = signups inside the selected range
    // with enough time to observe the requested window (signup <= end - N days).
    const eligibleCohortEndInclusive = (days: 1 | 7 | 30) => {
      const d = new Date(range.end);
      d.setUTCDate(d.getUTCDate() - days);
      return d;
    };

    const [day1Retention, day7Retention, day30Retention] = await Promise.all([
      calcRetention(range.start, eligibleCohortEndInclusive(1), 1),
      calcRetention(range.start, eligibleCohortEndInclusive(7), 7),
      calcRetention(range.start, eligibleCohortEndInclusive(30), 30),
    ]);

    const churnRate =
      typeof day30Retention === 'number'
        ? Number((100 - day30Retention).toFixed(2))
        : null;

    // Calculate stickiness for app_opened metrics
    const appOpenedStickinessDauMau =
      appOpenedMau > 0 ? (appOpenedDau / appOpenedMau) * 100 : 0;
    const appOpenedStickinessWauMau =
      appOpenedMau > 0 ? (appOpenedWau / appOpenedMau) * 100 : 0;

    // Product stickiness metrics
    const productStickinessDauMau =
      productMau > 0 ? (productDau / productMau) * 100 : 0;
    const productStickinessWauMau =
      productMau > 0 ? (productWau / productMau) * 100 : 0;

    // Signed-in product stickiness (same as product for now since they use same values)
    const signedInProductStickinessDauMau =
      signedInProductMau > 0
        ? (signedInProductDau / signedInProductMau) * 100
        : 0;
    const signedInProductStickinessWauMau =
      signedInProductMau > 0
        ? (signedInProductWau / signedInProductMau) * 100
        : 0;

    const response = NextResponse.json({
      // Engagement = total events (not distinct users) - shows usage intensity
      dau: engagementEventsDau,
      wau: engagementEventsWau,
      mau: engagementEventsMau,
      // Also expose distinct user counts
      engaged_users_dau: engagementUsersDau,
      engaged_users_wau: engagementUsersWau,
      engaged_users_mau: engagementUsersMau,
      // Stickiness uses distinct users (user-based ratio makes sense)
      stickiness_dau_mau:
        engagementUsersMau > 0
          ? Number(((engagementUsersDau / engagementUsersMau) * 100).toFixed(2))
          : 0,
      stickiness_wau_mau:
        engagementUsersMau > 0
          ? Number(((engagementUsersWau / engagementUsersMau) * 100).toFixed(2))
          : 0,
      stickiness_dau_wau:
        engagementUsersWau > 0
          ? Number(((engagementUsersDau / engagementUsersWau) * 100).toFixed(2))
          : 0,
      returning_dau: returningDau,
      returning_wau: returningWau,
      returning_mau: returningMau,
      retention: {
        day_1:
          typeof day1Retention === 'number'
            ? Number(day1Retention.toFixed(2))
            : null,
        day_7:
          typeof day7Retention === 'number'
            ? Number(day7Retention.toFixed(2))
            : null,
        day_30:
          typeof day30Retention === 'number'
            ? Number(day30Retention.toFixed(2))
            : null,
      },
      churn_rate: churnRate,
      trends,
      product_trends: productTrends,
      signed_in_product_trends: productTrends,
      grimoire_trends: grimoireTrends,
      app_opened_trends: appOpenedTrends,
      sitewide_trends: sitewideTrends,
      product_dau: productDau,
      product_wau: productWau,
      product_mau: productMau,
      product_stickiness_dau_mau: Number(productStickinessDauMau.toFixed(2)),
      product_stickiness_wau_mau: Number(productStickinessWauMau.toFixed(2)),
      grimoire_dau: grimoireDau,
      grimoire_wau: grimoireWau,
      grimoire_mau: grimoireMau,
      app_opened_dau: appOpenedDau,
      app_opened_wau: appOpenedWau,
      app_opened_mau: appOpenedMau,
      app_opened_stickiness_dau_mau: Number(
        appOpenedStickinessDauMau.toFixed(2),
      ),
      app_opened_stickiness_wau_mau: Number(
        appOpenedStickinessWauMau.toFixed(2),
      ),
      sitewide_dau: sitewideDau,
      sitewide_wau: sitewideWau,
      sitewide_mau: sitewideMau,
      audit: {
        raw_dau: rawDau,
        raw_wau: rawWau,
        raw_mau: rawMau,
        difference_percent: {
          dau: Number(auditDiffPercentages.dau.toFixed(2)),
          wau: Number(auditDiffPercentages.wau.toFixed(2)),
          mau: Number(auditDiffPercentages.mau.toFixed(2)),
        },
        mismatch: auditMismatch,
        threshold_percent: AUDIT_THRESHOLD_PERCENT,
        source: 'conversion_events',
      },
      signed_in_product_dau: signedInProductDau,
      signed_in_product_wau: signedInProductWau,
      signed_in_product_mau: signedInProductMau,
      signed_in_product_stickiness_dau_mau: Number(
        signedInProductStickinessDauMau.toFixed(2),
      ),
      signed_in_product_stickiness_wau_mau: Number(
        signedInProductStickinessWauMau.toFixed(2),
      ),
      signed_in_product_users: productUsers,
      signed_in_product_returning_users: returningUsers,
      signed_in_product_avg_sessions_per_user: Number(
        avgSessionsPerUser.toFixed(2),
      ),
      content_mau_grimoire: grimoireOnlyMauBase,
      grimoire_only_mau: grimoireOnlyMau,
      total_accounts: totalAccountsEver,
      debug: {
        grimoire_metrics_source: 'conversion_events',
        product_summary_source: 'conversion_events',
        sitewide_metrics_source: 'conversion_events',
        engagement_events_dau: engagementEventsDau,
        engagement_users_dau: engagementUsersDau,
        activity_rows: activityRows.rows.length,
      },
      source: 'database',
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error('[analytics/dau-wau-mau] Failed to load metrics', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
