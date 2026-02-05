import { sql } from '@vercel/postgres';
import { formatTimestamp } from '@/lib/analytics/date-range';

export type DateRange = { start: Date; end: Date };

export type EngagementEventType =
  | 'app_opened'
  | 'product_opened'
  | 'grimoire_viewed'
  | 'signup';

const utcDateExpr = `(created_at AT TIME ZONE 'UTC')::date`;
const parseIsoDay = (dateKey: string) => new Date(`${dateKey}T00:00:00.000Z`);

const identityLinksCte = `
  identity_links AS (
    SELECT DISTINCT ON (anonymous_id)
      anonymous_id,
      user_id,
      last_seen_at
    FROM analytics_identity_links
    WHERE user_id IS NOT NULL
      AND user_id != ''
      AND anonymous_id IS NOT NULL
      AND anonymous_id != ''
    ORDER BY anonymous_id,
             last_seen_at DESC NULLS LAST,
             first_seen_at DESC NULLS LAST
  )
`;

const identityLinkJoin = `
  LEFT JOIN identity_links linked
    ON linked.anonymous_id = ce.anonymous_id
`;

const canonicalIdentityExpression = `
  CASE
    WHEN ce.user_id IS NOT NULL AND ce.user_id <> '' THEN 'user:' || ce.user_id
    WHEN ce.anonymous_id IS NOT NULL
      AND ce.anonymous_id <> ''
      AND linked.user_id IS NOT NULL THEN 'user:' || linked.user_id
    WHEN ce.anonymous_id IS NOT NULL AND ce.anonymous_id <> '' THEN 'anon:' || ce.anonymous_id
    ELSE NULL
  END
`;

const identityLinkAppliedExpression = `
  CASE
    WHEN (ce.user_id IS NULL OR ce.user_id = '') AND linked.user_id IS NOT NULL THEN 1
    ELSE 0
  END
`;

const missingIdentityExpression = `
  CASE
    WHEN (ce.user_id IS NULL OR ce.user_id = '')
      AND (ce.anonymous_id IS NULL OR ce.anonymous_id = '') THEN 1
    ELSE 0
  END
`;

const buildCanonicalEventCtes = (
  startParamIndex: number,
  eventTypeParamIndex: number,
) => `
  ${identityLinksCte},
  base AS (
    SELECT
      ce.*,
      ${canonicalIdentityExpression} AS canonical_identity,
      ${identityLinkAppliedExpression} AS identity_link_applied,
      ${missingIdentityExpression} AS missing_identity,
      (ce.created_at AT TIME ZONE 'UTC')::date AS day
    FROM conversion_events ce
    ${identityLinkJoin}
    WHERE ce.event_type = $${eventTypeParamIndex}
      AND ce.created_at >= $${startParamIndex}
      AND ce.created_at <= $${startParamIndex + 1}
  ),
  canonical AS (
    SELECT * FROM base
    WHERE canonical_identity IS NOT NULL
  )
`;

const buildCanonicalIdentitySetCte = (
  alias: string,
  startParamIndex: number,
  eventTypeParamIndex: number,
) => `
  ${alias} AS (
    SELECT DISTINCT ${canonicalIdentityExpression} AS canonical_identity
    FROM conversion_events ce
    ${identityLinkJoin}
    WHERE ce.event_type = $${eventTypeParamIndex}
      AND ce.created_at >= $${startParamIndex}
      AND ce.created_at <= $${startParamIndex + 1}
      AND (${canonicalIdentityExpression} IS NOT NULL)
  )
`;

export type AuditInfo = {
  raw_events_count: number;
  distinct_canonical_identities: number;
  missing_identity_rows: number;
  linked_identities_applied: number;
  last_event_timestamp: string | null;
  anomalies: string[];
};

export async function getEventAudit(
  startTs: string,
  endTs: string,
  eventType: EngagementEventType,
) {
  const result = await sql.query(
    `
      WITH ${buildCanonicalEventCtes(1, 3)}
      SELECT
        COUNT(*) AS raw_events_count,
        (
          SELECT COUNT(DISTINCT canonical_identity)
          FROM canonical
        ) AS distinct_canonical_identities,
        COUNT(*) FILTER (WHERE missing_identity = 1) AS missing_identity_rows,
        COUNT(*) FILTER (WHERE identity_link_applied = 1) AS linked_identities_applied,
        MAX(created_at) AS last_event_timestamp
      FROM base
    `,
    [startTs, endTs, eventType],
  );

  const row = result.rows[0];
  return {
    raw_events_count: Number(row?.raw_events_count || 0),
    distinct_canonical_identities: Number(
      row?.distinct_canonical_identities || 0,
    ),
    missing_identity_rows: Number(row?.missing_identity_rows || 0),
    linked_identities_applied: Number(row?.linked_identities_applied || 0),
    last_event_timestamp: row?.last_event_timestamp
      ? new Date(row.last_event_timestamp).toISOString()
      : null,
    anomalies: [],
  };
}

async function countCanonicalIdentities(
  startTs: string,
  endTs: string,
  eventType: EngagementEventType,
): Promise<number> {
  const countResult = await sql.query(
    `
      WITH ${buildCanonicalEventCtes(1, 3)}
      SELECT COUNT(DISTINCT canonical_identity) AS count
      FROM canonical
    `,
    [startTs, endTs, eventType],
  );
  return Number(countResult.rows[0]?.count || 0);
}

export type EngagementOverview = {
  dau_trend: Array<{ date: string; dau: number; returning_dau: number }>;
  dau: number;
  wau: number;
  mau: number;
  stickiness_dau_mau: number;
  stickiness_wau_mau: number;
  new_users: number;
  returning_users_lifetime: number;
  returning_users_range: number;
  returning_dau: number;
  returning_wau: number;
  returning_mau: number;
  all_time: {
    total_product_users: number;
    returning_users: number;
    median_active_days_per_user: number;
  };
  avg_active_days_per_user: number;
  active_days_distribution: {
    '1': number;
    '2-3': number;
    '4-7': number;
    '8-14': number;
    '15+': number;
  };
  retention: {
    cohorts: Array<{
      cohort_day: string;
      cohort_users: number;
      day_1: number | null;
      day_7: number | null;
      day_30: number | null;
    }>;
  };
  returning_referrer_breakdown: {
    organic_returning: number;
    direct_returning: number;
    internal_returning: number;
  };
  audit?: AuditInfo;
};

export type FeatureAdoption = {
  mau: number;
  features: Array<{
    event_type: string;
    users: number;
    adoption_rate: number;
  }>;
};

export type GrimoireHealth = {
  grimoire_entry_rate: number;
  grimoire_to_app_rate: number;
  grimoire_visitors: number;
  grimoire_to_app_users: number;
  grimoire_views_per_active_user: number;
  return_to_grimoire_rate: number;
  grimoire_penetration: number;
  influence: {
    subscription_users: number;
    subscription_users_with_grimoire_before: number;
    subscription_with_grimoire_before_rate: number;
    median_days_first_grimoire_to_signup: number | null;
    median_days_signup_to_subscription: number | null;
  };
};

export type ConversionInfluence = {
  subscription_users: number;
  subscription_users_with_grimoire_before: number;
  subscription_with_grimoire_before_rate: number;
  median_days_first_grimoire_to_signup: number | null;
  median_days_signup_to_subscription: number | null;
};

function pct(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return (numerator / denominator) * 100;
}

async function countWindowOverlap(
  startCurrent: string,
  endCurrent: string,
  startPrev: string,
  endPrev: string,
  eventType: EngagementEventType,
) {
  const result = await sql.query(
    `
      WITH ${identityLinksCte},
           ${buildCanonicalIdentitySetCte('current_window', 1, 5)},
           ${buildCanonicalIdentitySetCte('prev_window', 3, 5)}
      SELECT COUNT(*) AS overlap
      FROM current_window c
      WHERE EXISTS (
        SELECT 1 FROM prev_window p WHERE p.canonical_identity = c.canonical_identity
      )
    `,
    [startCurrent, endCurrent, startPrev, endPrev, eventType],
  );
  return Number(result.rows[0]?.overlap || 0);
}

function toDateKey(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'string') {
    // If already a date-only string, keep it.
    return value.length >= 10 ? value.slice(0, 10) : value;
  }
  return String(value);
}

export async function getEngagementOverview(
  range: DateRange,
  options?: { includeAudit?: boolean; eventType?: EngagementEventType },
): Promise<EngagementOverview> {
  const startTs = formatTimestamp(range.start);
  const endTs = formatTimestamp(range.end);
  const eventType = options?.eventType ?? 'app_opened';
  const canonicalCtes = buildCanonicalEventCtes(1, 3);

  const trendStart = new Date(range.start);
  trendStart.setUTCDate(trendStart.getUTCDate() - 1);
  trendStart.setUTCHours(0, 0, 0, 0);
  const trendStartTs = formatTimestamp(trendStart);
  const rangeStartKey = range.start.toISOString().slice(0, 10);
  const rangeEndKey = range.end.toISOString().slice(0, 10);

  // Returning DAU = users active on day X who were also active on ANY previous day
  // within the lookback window (30 days before the range start)
  const dauTrendResult = await sql.query(
    `
      WITH ${buildCanonicalEventCtes(1, 3)}
      SELECT
        c.day AS date,
        COUNT(DISTINCT c.canonical_identity) AS dau,
        COUNT(DISTINCT c.canonical_identity)
          FILTER (
            WHERE EXISTS (
              SELECT 1
              FROM canonical prev
              WHERE prev.canonical_identity = c.canonical_identity
                AND prev.day < c.day
                AND prev.day >= c.day - 30
            )
          ) AS returning_dau
      FROM canonical c
      WHERE c.day >= $4::date
        AND c.day <= $5::date
      GROUP BY c.day
      ORDER BY c.day ASC
    `,
    [trendStartTs, endTs, eventType, rangeStartKey, rangeEndKey],
  );

  // Current-day DAU over the selected end date (UTC day)
  const endDayKey = range.end.toISOString().slice(0, 10);
  const dauResult = await sql.query(
    `
      WITH ${canonicalCtes}
      SELECT COUNT(DISTINCT canonical_identity) AS count
      FROM canonical
      WHERE day = $4::date
    `,
    [startTs, endTs, eventType, endDayKey],
  );

  // WAU/MAU relative to selected end
  const wauStart = new Date(range.end);
  wauStart.setUTCDate(wauStart.getUTCDate() - 6);
  wauStart.setUTCHours(0, 0, 0, 0);

  const mauStart = new Date(range.end);
  mauStart.setUTCDate(mauStart.getUTCDate() - 29);
  mauStart.setUTCHours(0, 0, 0, 0);

  const wauStartKey = toDateKey(wauStart);
  const mauStartKey = toDateKey(mauStart);

  const [wauResult, mauResult] = await Promise.all([
    sql.query(
      `
      WITH ${canonicalCtes}
      SELECT COUNT(DISTINCT canonical_identity) AS count
      FROM canonical
      WHERE day >= $4::date
      `,
      [startTs, endTs, eventType, wauStartKey],
    ),
    sql.query(
      `
      WITH ${canonicalCtes}
      SELECT COUNT(DISTINCT canonical_identity) AS count
      FROM canonical
      WHERE day >= $4::date
      `,
      [startTs, endTs, eventType, mauStartKey],
    ),
  ]);

  const dau = Number(dauResult.rows[0]?.count || 0);
  const wau = Number(wauResult.rows[0]?.count || 0);
  const mau = Number(mauResult.rows[0]?.count || 0);

  // New vs returning (lifetime) based on first-ever app_opened date.
  // This is useful for cohort age, but can be confusing during backfills.
  const newReturningResult = await sql.query(
    `
      WITH ${canonicalCtes},
           first_open AS (
             SELECT canonical_identity, MIN(day) AS first_day
             FROM canonical
             GROUP BY canonical_identity
           ),
           active_in_range AS (
             SELECT canonical_identity
             FROM canonical
             GROUP BY canonical_identity
           )
      SELECT
        COUNT(*) FILTER (
          WHERE fo.first_day >= $4::date AND fo.first_day <= $5::date
        ) AS new_users,
        COUNT(*) FILTER (WHERE fo.first_day < $4::date) AS returning_users_lifetime
      FROM active_in_range a
      INNER JOIN first_open fo ON fo.canonical_identity = a.canonical_identity
    `,
    [
      startTs,
      endTs,
      eventType,
      range.start.toISOString().slice(0, 10),
      range.end.toISOString().slice(0, 10),
    ],
  );

  const newUsers = Number(newReturningResult.rows[0]?.new_users || 0);
  const returningUsersLifetime = Number(
    newReturningResult.rows[0]?.returning_users_lifetime || 0,
  );

  // Returning users (range): active users in range with 2+ distinct active days in range.
  const returningUsersRangeResult = await sql.query(
    `
      WITH ${canonicalCtes},
           per_identity AS (
             SELECT canonical_identity, COUNT(DISTINCT day) AS active_days
             FROM canonical
             GROUP BY canonical_identity
           )
      SELECT COUNT(*) AS returning_users_range
      FROM per_identity
      WHERE active_days >= 2
    `,
    [startTs, endTs, eventType],
  );
  const returningUsersRange = Number(
    returningUsersRangeResult.rows[0]?.returning_users_range || 0,
  );

  const returningReferrerResult = await sql.query(
    `
      WITH ${canonicalCtes},
           returning_users AS (
             SELECT canonical_identity
             FROM canonical
             GROUP BY canonical_identity
             HAVING COUNT(DISTINCT day) >= 2
           ),
           latest_returning AS (
             SELECT DISTINCT ON (canonical_identity)
               canonical_identity,
               COALESCE(metadata->>'referrer', '') AS referrer,
               COALESCE(metadata->>'utm_source', '') AS utm_source,
               COALESCE(metadata->>'origin_type', '') AS origin_type
             FROM canonical
             WHERE canonical_identity IN (
               SELECT canonical_identity FROM returning_users
             )
             ORDER BY canonical_identity, created_at DESC
           ),
           classified AS (
             SELECT
               canonical_identity,
               LOWER(referrer) AS ref_lower,
               LOWER(utm_source) AS utm_lower,
               LOWER(origin_type) AS origin_lower
             FROM latest_returning
           ),
           categorized AS (
             SELECT
               canonical_identity,
               (origin_lower = 'internal' OR ref_lower LIKE '%lunary.app%')
                 AS is_internal,
               (
                 origin_lower = 'seo'
                 OR utm_lower LIKE '%organic%'
                 OR utm_lower LIKE '%seo%'
                 OR utm_lower LIKE '%search%'
                 OR ref_lower LIKE '%google.%'
                 OR ref_lower LIKE '%bing.%'
                 OR ref_lower LIKE '%yahoo.%'
                 OR ref_lower LIKE '%duckduckgo.%'
                 OR ref_lower LIKE '%search%'
               ) AS is_search
             FROM classified
           )
      SELECT
        COALESCE(SUM(CASE WHEN is_internal THEN 1 ELSE 0 END), 0) AS internal_returning,
        COALESCE(SUM(CASE WHEN NOT is_internal AND is_search THEN 1 ELSE 0 END), 0) AS organic_returning,
        COALESCE(SUM(CASE WHEN NOT is_internal AND NOT is_search THEN 1 ELSE 0 END), 0) AS direct_returning
      FROM categorized
    `,
    [startTs, endTs, eventType],
  );

  const returningReferrerBreakdown = {
    internal_returning: Number(
      returningReferrerResult.rows[0]?.internal_returning || 0,
    ),
    organic_returning: Number(
      returningReferrerResult.rows[0]?.organic_returning || 0,
    ),
    direct_returning: Number(
      returningReferrerResult.rows[0]?.direct_returning || 0,
    ),
  };

  // Returning DAU (selected end day): active on end day AND also active on ANY earlier day
  // within a 30-day lookback window. This measures users who have returned, not just D1 retention.
  const endDayDate = parseIsoDay(endDayKey);
  const lookbackStart = new Date(endDayDate);
  lookbackStart.setUTCDate(lookbackStart.getUTCDate() - 30);
  const lookbackStartKey = toDateKey(lookbackStart);

  // Extend the query window to include the lookback period
  const extendedStart = new Date(lookbackStart);
  extendedStart.setUTCHours(0, 0, 0, 0);
  const extendedEnd = new Date(endDayDate);
  extendedEnd.setUTCHours(23, 59, 59, 999);

  const returningDauResult = await sql.query(
    `
      WITH ${buildCanonicalEventCtes(1, 3)}
      SELECT COUNT(DISTINCT c.canonical_identity) AS returning_dau
      FROM canonical c
      WHERE c.day = $4::date
        AND EXISTS (
          SELECT 1
          FROM canonical prev
          WHERE prev.canonical_identity = c.canonical_identity
            AND prev.day < $4::date
            AND prev.day >= $5::date
        )
    `,
    [
      formatTimestamp(extendedStart),
      formatTimestamp(extendedEnd),
      eventType,
      endDayKey,
      lookbackStartKey,
    ],
  );
  const returningDau = Number(returningDauResult.rows[0]?.returning_dau || 0);

  const currentWauStart = new Date(range.end);
  currentWauStart.setUTCDate(currentWauStart.getUTCDate() - 6);
  currentWauStart.setUTCHours(0, 0, 0, 0);

  const prevWauEnd = new Date(currentWauStart);
  prevWauEnd.setUTCDate(prevWauEnd.getUTCDate() - 1);
  prevWauEnd.setUTCHours(0, 0, 0, 0);
  const prevWauStart = new Date(prevWauEnd);
  prevWauStart.setUTCDate(prevWauStart.getUTCDate() - 6);
  prevWauStart.setUTCHours(0, 0, 0, 0);

  const returningWau = await countWindowOverlap(
    formatTimestamp(currentWauStart),
    endTs,
    formatTimestamp(prevWauStart),
    formatTimestamp(prevWauEnd),
    eventType,
  );

  const currentMauStart = new Date(range.end);
  currentMauStart.setUTCDate(currentMauStart.getUTCDate() - 29);
  currentMauStart.setUTCHours(0, 0, 0, 0);

  const prevMauEnd = new Date(currentMauStart);
  prevMauEnd.setUTCDate(prevMauEnd.getUTCDate() - 1);
  prevMauEnd.setUTCHours(0, 0, 0, 0);
  const prevMauStart = new Date(prevMauEnd);
  prevMauStart.setUTCDate(prevMauStart.getUTCDate() - 29);
  prevMauStart.setUTCHours(0, 0, 0, 0);

  const returningMau = await countWindowOverlap(
    formatTimestamp(currentMauStart),
    endTs,
    formatTimestamp(prevMauStart),
    formatTimestamp(prevMauEnd),
    eventType,
  );

  // Active days per user (within selected range)
  const activeDaysResult = await sql.query(
    `
      WITH ${canonicalCtes},
           per_identity AS (
             SELECT canonical_identity, COUNT(DISTINCT day) AS active_days
             FROM canonical
             GROUP BY canonical_identity
           )
      SELECT
        AVG(active_days)::float AS avg_active_days,
        COUNT(*) FILTER (WHERE active_days = 1) AS bucket_1,
        COUNT(*) FILTER (WHERE active_days BETWEEN 2 AND 3) AS bucket_2_3,
        COUNT(*) FILTER (WHERE active_days BETWEEN 4 AND 7) AS bucket_4_7,
        COUNT(*) FILTER (WHERE active_days BETWEEN 8 AND 14) AS bucket_8_14,
        COUNT(*) FILTER (WHERE active_days >= 15) AS bucket_15_plus
      FROM per_identity
    `,
    [startTs, endTs, eventType],
  );

  const avgActiveDays = Number(activeDaysResult.rows[0]?.avg_active_days || 0);

  const allTimeStartTs = '1970-01-01T00:00:00.000Z';
  const allTimeResult = await sql.query(
    `
      WITH ${buildCanonicalEventCtes(1, 3)},
           per_user AS (
             SELECT canonical_identity, COUNT(DISTINCT day) AS active_days
             FROM canonical
             GROUP BY canonical_identity
           )
      SELECT
        COUNT(*) AS total_users,
        COUNT(*) FILTER (WHERE active_days >= 2) AS returning_users,
        percentile_cont(0.5) WITHIN GROUP (ORDER BY active_days)
          AS median_active_days
      FROM per_user
    `,
    [allTimeStartTs, endTs, eventType],
  );
  const allTimeRow = allTimeResult.rows[0];
  const allTimeTotalUsers = Number(allTimeRow?.total_users || 0);
  const allTimeReturningUsers = Number(allTimeRow?.returning_users || 0);
  const allTimeMedianActiveDays = Number(allTimeRow?.median_active_days || 0);

  // Cohort-lite retention: day+1/day+7/day+30 from first-ever open day
  const retentionStartTs = '1970-01-01T00:00:00.000Z';
  const retentionResult = await sql.query(
    `
      WITH ${buildCanonicalEventCtes(1, 3)},
           first_open AS (
             SELECT canonical_identity, MIN(day) AS first_day
             FROM canonical
             GROUP BY canonical_identity
           ),
           cohort AS (
             SELECT canonical_identity, first_day
             FROM first_open
             WHERE first_day >= $4::date
               AND first_day <= $5::date
           ),
           opens AS (
             SELECT canonical_identity, day
             FROM canonical
           )
      SELECT
        c.first_day AS cohort_day,
        COUNT(*) AS cohort_users,
        COUNT(*) FILTER (
          WHERE EXISTS (
            SELECT 1 FROM opens o
            WHERE o.canonical_identity = c.canonical_identity
              AND o.day = c.first_day + 1
          )
        ) AS retained_day_1,
        COUNT(*) FILTER (
          WHERE EXISTS (
            SELECT 1 FROM opens o
            WHERE o.canonical_identity = c.canonical_identity
              AND o.day = c.first_day + 7
          )
        ) AS retained_day_7,
        COUNT(*) FILTER (
          WHERE EXISTS (
            SELECT 1 FROM opens o
            WHERE o.canonical_identity = c.canonical_identity
              AND o.day = c.first_day + 30
          )
        ) AS retained_day_30
      FROM cohort c
      GROUP BY c.first_day
      ORDER BY c.first_day ASC
    `,
    [
      retentionStartTs,
      endTs,
      eventType,
      range.start.toISOString().slice(0, 10),
      range.end.toISOString().slice(0, 10),
    ],
  );

  const cohorts = retentionResult.rows.map((row) => {
    const cohortUsers = Number(row.cohort_users || 0);
    const cohortDay = toDateKey(row.cohort_day);

    // For cohorts too recent to have a full offset, return null for that retention.
    const cohortDayDate = new Date(`${cohortDay}T00:00:00Z`);
    const latestDay = new Date(range.end);
    latestDay.setUTCHours(0, 0, 0, 0);

    const canDay1 =
      cohortDayDate.getTime() + 1 * 86400000 <= latestDay.getTime();
    const canDay7 =
      cohortDayDate.getTime() + 7 * 86400000 <= latestDay.getTime();
    const canDay30 =
      cohortDayDate.getTime() + 30 * 86400000 <= latestDay.getTime();

    const d1 = Number(row.retained_day_1 || 0);
    const d7 = Number(row.retained_day_7 || 0);
    const d30 = Number(row.retained_day_30 || 0);

    return {
      cohort_day: cohortDay,
      cohort_users: cohortUsers,
      day_1: canDay1 ? Number(pct(d1, cohortUsers).toFixed(2)) : null,
      day_7: canDay7 ? Number(pct(d7, cohortUsers).toFixed(2)) : null,
      day_30: canDay30 ? Number(pct(d30, cohortUsers).toFixed(2)) : null,
    };
  });

  let audit: AuditInfo | undefined;
  if (options?.includeAudit) {
    audit = await getEventAudit(startTs, endTs, eventType);
    const anomalies: string[] = [];
    if (dau > wau) {
      anomalies.push('DAU is greater than WAU');
    }
    if (wau > mau) {
      anomalies.push('WAU is greater than MAU');
    }
    if (returningDau > dau) {
      anomalies.push('Returning DAU is greater than DAU');
    }
    if (returningWau > wau) {
      anomalies.push('Returning WAU overlap is greater than WAU');
    }
    if (returningMau > mau) {
      anomalies.push('Returning MAU overlap is greater than MAU');
    }
    if (returningUsersRange > mau) {
      anomalies.push('Returning Users (range) exceeds MAU');
    }
    if (audit.distinct_canonical_identities !== mau) {
      anomalies.push('Distinct canonical identities mismatch MAU');
    }
    audit.anomalies = anomalies;
  }

  return {
    dau_trend: dauTrendResult.rows.map((r) => ({
      date: toDateKey(r.date),
      dau: Number(r.dau || 0),
      returning_dau: Number(r.returning_dau || 0),
    })),
    dau,
    wau,
    mau,
    stickiness_dau_mau: Number(pct(dau, mau).toFixed(2)),
    stickiness_wau_mau: Number(pct(wau, mau).toFixed(2)),
    new_users: newUsers,
    returning_users_lifetime: returningUsersLifetime,
    returning_users_range: returningUsersRange,
    returning_dau: returningDau,
    returning_wau: returningWau,
    returning_mau: returningMau,
    all_time: {
      total_product_users: allTimeTotalUsers,
      returning_users: allTimeReturningUsers,
      median_active_days_per_user: Number(allTimeMedianActiveDays.toFixed(2)),
    },
    avg_active_days_per_user: Number(avgActiveDays.toFixed(2)),
    active_days_distribution: {
      '1': Number(activeDaysResult.rows[0]?.bucket_1 || 0),
      '2-3': Number(activeDaysResult.rows[0]?.bucket_2_3 || 0),
      '4-7': Number(activeDaysResult.rows[0]?.bucket_4_7 || 0),
      '8-14': Number(activeDaysResult.rows[0]?.bucket_8_14 || 0),
      '15+': Number(activeDaysResult.rows[0]?.bucket_15_plus || 0),
    },
    retention: { cohorts },
    returning_referrer_breakdown: returningReferrerBreakdown,
    audit,
  };
}

export async function getFeatureAdoption(
  range: DateRange,
  options?: { eventType?: EngagementEventType; featureTypes?: string[] },
): Promise<FeatureAdoption> {
  const startTs = formatTimestamp(range.start);
  const endTs = formatTimestamp(range.end);
  const eventType = options?.eventType ?? 'app_opened';
  const mau = await countCanonicalIdentities(startTs, endTs, eventType);

  const featureTypes = options?.featureTypes ?? [
    'daily_dashboard_viewed',
    'grimoire_viewed',
    'astral_chat_used',
    'tarot_drawn',
    'ritual_started',
    'chart_viewed',
  ];

  const result = await sql.query(
    `
      WITH ${identityLinksCte},
           ${buildCanonicalIdentitySetCte('active_set', 2, 4)},
           feature_rows AS (
        SELECT
          ce.event_type,
          ${canonicalIdentityExpression} AS canonical_identity
        FROM conversion_events ce
        ${identityLinkJoin}
        WHERE ce.event_type = ANY($1::text[])
          AND ce.created_at >= $2
          AND ce.created_at <= $3
          AND ${canonicalIdentityExpression} IS NOT NULL
      )
      SELECT event_type, COUNT(DISTINCT canonical_identity) AS users
      FROM feature_rows
      WHERE canonical_identity IN (SELECT canonical_identity FROM active_set)
      GROUP BY event_type
      ORDER BY users DESC
    `,
    [featureTypes, startTs, endTs, eventType],
  );

  const usersByType = new Map<string, number>();
  for (const row of result.rows) {
    usersByType.set(String(row.event_type), Number(row.users || 0));
  }

  return {
    mau,
    features: featureTypes.map((eventType) => {
      const users = usersByType.get(eventType) || 0;
      return {
        event_type: eventType,
        users,
        adoption_rate: Number(pct(users, mau).toFixed(2)),
      };
    }),
  };
}

export async function getGrimoireHealth(
  range: DateRange,
): Promise<GrimoireHealth> {
  const startTs = formatTimestamp(range.start);
  const endTs = formatTimestamp(range.end);

  const canonicalRangeCtes = buildCanonicalEventCtes(1, 3);
  const baseEventType: EngagementEventType = 'app_opened';
  const grimoireEventType: EngagementEventType = 'grimoire_viewed';

  // Active users in selected range
  const [activeUsers, grimoireUsers] = await Promise.all([
    countCanonicalIdentities(startTs, endTs, baseEventType),
    countCanonicalIdentities(startTs, endTs, grimoireEventType),
  ]);

  // New users in selected range (first app_opened within range)
  const newUsersResult = await sql.query(
    `
      WITH ${canonicalRangeCtes},
           first_open AS (
             SELECT canonical_identity, MIN(day) AS first_day
             FROM canonical
             GROUP BY canonical_identity
           )
      SELECT COUNT(*) AS count
      FROM first_open
      WHERE first_day >= $4::date
        AND first_day <= $5::date
    `,
    [
      startTs,
      endTs,
      baseEventType,
      range.start.toISOString().slice(0, 10),
      range.end.toISOString().slice(0, 10),
    ],
  );
  const newUsers = Number(newUsersResult.rows[0]?.count || 0);

  // Grimoire entry: new users whose first-open day includes a grimoire view
  const entryResult = await sql.query(
    `
      WITH ${canonicalRangeCtes},
           first_open AS (
             SELECT canonical_identity, MIN(day) AS first_day
             FROM canonical
             GROUP BY canonical_identity
           ),
           new_users AS (
             SELECT canonical_identity, first_day
             FROM first_open
             WHERE first_day >= $4::date
               AND first_day <= $5::date
           ),
           grimoire_events AS (
             SELECT
               ${canonicalIdentityExpression} AS canonical_identity,
               (ce.created_at AT TIME ZONE 'UTC')::date AS day
             FROM conversion_events ce
             ${identityLinkJoin}
             WHERE ce.event_type = 'grimoire_viewed'
               AND ce.created_at >= $1
               AND ce.created_at <= $2
           )
      SELECT
        COUNT(*) FILTER (
          WHERE EXISTS (
            SELECT 1
            FROM grimoire_events gv
            WHERE gv.canonical_identity = nu.canonical_identity
              AND gv.day = nu.first_day
          )
        ) AS entry_users
      FROM new_users nu
    `,
    [
      startTs,
      endTs,
      baseEventType,
      range.start.toISOString().slice(0, 10),
      range.end.toISOString().slice(0, 10),
    ],
  );
  const entryUsers = Number(entryResult.rows[0]?.entry_users || 0);

  // Grimoire views per grimoire user (total events / distinct grimoire identities)
  const grimoireViewsResult = await sql.query(
    `
      WITH ${identityLinksCte},
           grimoire_events AS (
        SELECT
          ${canonicalIdentityExpression} AS canonical_identity
        FROM conversion_events ce
        ${identityLinkJoin}
        WHERE ce.event_type = 'grimoire_viewed'
          AND ce.created_at >= $1
          AND ce.created_at <= $2
          AND ${canonicalIdentityExpression} IS NOT NULL
      )
      SELECT
        COUNT(*) AS total_events,
        COUNT(DISTINCT canonical_identity) AS distinct_users
      FROM grimoire_events
    `,
    [startTs, endTs],
  );
  const grimoireViews = Number(grimoireViewsResult.rows[0]?.total_events || 0);
  const grimoireDistinctUsers = Number(
    grimoireViewsResult.rows[0]?.distinct_users || 0,
  );
  const viewsPerActiveUser =
    grimoireDistinctUsers > 0 ? grimoireViews / grimoireDistinctUsers : 0;

  // Return-to-Grimoire: 2+ distinct grimoire days among users who viewed grimoire
  const returnToGrimoireResult = await sql.query(
    `
      WITH ${identityLinksCte},
           grimoire_activity AS (
        SELECT
          ${canonicalIdentityExpression} AS canonical_identity,
          (ce.created_at AT TIME ZONE 'UTC')::date AS day
        FROM conversion_events ce
        ${identityLinkJoin}
        WHERE ce.event_type = 'grimoire_viewed'
          AND ce.created_at >= $1
          AND ce.created_at <= $2
          AND ${canonicalIdentityExpression} IS NOT NULL
      ),
      per_user AS (
        SELECT canonical_identity, COUNT(DISTINCT day) AS grimoire_days
        FROM grimoire_activity
        GROUP BY canonical_identity
      )
      SELECT
        COUNT(*) AS any_grimoire_users,
        COUNT(*) FILTER (WHERE grimoire_days >= 2) AS return_users
      FROM per_user
    `,
    [startTs, endTs],
  );
  const anyGrimoireUsers = Number(
    returnToGrimoireResult.rows[0]?.any_grimoire_users || 0,
  );
  const returnUsers = Number(returnToGrimoireResult.rows[0]?.return_users || 0);
  const grimoirePenetration = pct(grimoireUsers, activeUsers);

  // Grimoire → App Conversion: % of grimoire visitors who also used the app
  // This measures how well SEO content converts to product usage
  const grimoireToAppResult = await sql.query(
    `
      WITH ${identityLinksCte},
           grimoire_users AS (
             SELECT DISTINCT ${canonicalIdentityExpression} AS canonical_identity
             FROM conversion_events ce
             ${identityLinkJoin}
             WHERE ce.event_type = 'grimoire_viewed'
               AND ce.created_at >= $1
               AND ce.created_at <= $2
               AND ${canonicalIdentityExpression} IS NOT NULL
           ),
           app_users AS (
             SELECT DISTINCT ${canonicalIdentityExpression} AS canonical_identity
             FROM conversion_events ce
             ${identityLinkJoin}
             WHERE ce.event_type = 'app_opened'
               AND ce.created_at >= $1
               AND ce.created_at <= $2
               AND ${canonicalIdentityExpression} IS NOT NULL
           )
      SELECT
        (SELECT COUNT(*) FROM grimoire_users) AS grimoire_visitors,
        (SELECT COUNT(*) FROM grimoire_users g WHERE EXISTS (
          SELECT 1 FROM app_users a WHERE a.canonical_identity = g.canonical_identity
        )) AS grimoire_to_app_users
    `,
    [startTs, endTs],
  );
  const grimoireVisitors = Number(
    grimoireToAppResult.rows[0]?.grimoire_visitors || 0,
  );
  const grimoireToAppUsers = Number(
    grimoireToAppResult.rows[0]?.grimoire_to_app_users || 0,
  );
  const grimoireToAppRate = pct(grimoireToAppUsers, grimoireVisitors);

  // Influence metrics
  const influence = await getConversionInfluence(range);

  return {
    grimoire_entry_rate: Number(pct(entryUsers, newUsers).toFixed(2)),
    grimoire_to_app_rate: Number(grimoireToAppRate.toFixed(2)),
    grimoire_visitors: grimoireVisitors,
    grimoire_to_app_users: grimoireToAppUsers,
    grimoire_views_per_active_user: Number(viewsPerActiveUser.toFixed(2)),
    return_to_grimoire_rate: Number(
      pct(returnUsers, anyGrimoireUsers).toFixed(2),
    ),
    grimoire_penetration: Number(grimoirePenetration.toFixed(2)),
    influence,
  };
}

export async function getConversionInfluence(
  range: DateRange,
): Promise<ConversionInfluence> {
  const startTs = formatTimestamp(range.start);
  const endTs = formatTimestamp(range.end);
  const testEmailPattern = '%@test.lunary.app';
  const testEmailExact = 'test@test.lunary.app';

  // Subscription influence: % of subscription_started users that had a prior grimoire view
  const subscriptionEventTypes = ['subscription_started', 'trial_converted'];
  const signupEventTypes = ['signup_completed', 'signup'];

  const base = await sql.query(
    `
      WITH subs AS (
        SELECT user_id, MIN(created_at) AS sub_at
        FROM conversion_events
        WHERE event_type = ANY($3::text[])
          AND user_id IS NOT NULL
          AND created_at >= $1
          AND created_at <= $2
          AND (user_email IS NULL OR (user_email NOT LIKE $4 AND user_email != $5))
        GROUP BY user_id
      )
      SELECT
        COUNT(*) AS subscription_users,
        COUNT(*) FILTER (
          WHERE EXISTS (
            SELECT 1
            FROM conversion_events gv
            WHERE gv.user_id = subs.user_id
              AND gv.event_type = 'grimoire_viewed'
              AND gv.created_at < subs.sub_at
              AND (gv.user_email IS NULL OR (gv.user_email NOT LIKE $4 AND gv.user_email != $5))
          )
        ) AS subscription_users_with_grimoire_before
      FROM subs
    `,
    [startTs, endTs, subscriptionEventTypes, testEmailPattern, testEmailExact],
  );

  const subscriptionUsers = Number(base.rows[0]?.subscription_users || 0);
  const subscriptionUsersWithGrimoireBefore = Number(
    base.rows[0]?.subscription_users_with_grimoire_before || 0,
  );

  const medians = await sql.query(
    `
      WITH subs AS (
        SELECT user_id, MIN(created_at) AS sub_at
        FROM conversion_events
        WHERE event_type = ANY($3::text[])
          AND user_id IS NOT NULL
          AND created_at >= $1
          AND created_at <= $2
          AND (user_email IS NULL OR (user_email NOT LIKE $5 AND user_email != $6))
        GROUP BY user_id
      ),
      grimoire_first AS (
        SELECT user_id, MIN(created_at) AS first_grimoire_at
        FROM conversion_events
        WHERE event_type = 'grimoire_viewed'
          AND user_id IS NOT NULL
          AND (user_email IS NULL OR (user_email NOT LIKE $5 AND user_email != $6))
        GROUP BY user_id
      ),
      signup_first AS (
        SELECT user_id, MIN(created_at) AS signup_at
        FROM conversion_events
        WHERE event_type = ANY($4::text[])
          AND user_id IS NOT NULL
          AND (user_email IS NULL OR (user_email NOT LIKE $5 AND user_email != $6))
        GROUP BY user_id
      ),
      joined AS (
        SELECT
          s.user_id,
          s.sub_at,
          gf.first_grimoire_at,
          sf.signup_at
        FROM subs s
        LEFT JOIN grimoire_first gf ON gf.user_id = s.user_id
        LEFT JOIN signup_first sf ON sf.user_id = s.user_id
        WHERE gf.first_grimoire_at IS NOT NULL
          AND sf.signup_at IS NOT NULL
          AND sf.signup_at >= gf.first_grimoire_at
          AND s.sub_at >= sf.signup_at
      )
      SELECT
        percentile_cont(0.5) WITHIN GROUP (
          ORDER BY EXTRACT(EPOCH FROM (signup_at - first_grimoire_at)) / 86400
        ) AS median_days_first_grimoire_to_signup,
        percentile_cont(0.5) WITHIN GROUP (
          ORDER BY EXTRACT(EPOCH FROM (sub_at - signup_at)) / 86400
        ) AS median_days_signup_to_subscription
      FROM joined
    `,
    [
      startTs,
      endTs,
      subscriptionEventTypes,
      signupEventTypes,
      testEmailPattern,
      testEmailExact,
    ],
  );

  const medianFirstGrimoireToSignupRaw =
    medians.rows[0]?.median_days_first_grimoire_to_signup;
  const medianSignupToSubscriptionRaw =
    medians.rows[0]?.median_days_signup_to_subscription;

  const medianFirstGrimoireToSignup =
    medianFirstGrimoireToSignupRaw === null ||
    medianFirstGrimoireToSignupRaw === undefined
      ? null
      : Number(Number(medianFirstGrimoireToSignupRaw).toFixed(2));

  const medianSignupToSubscription =
    medianSignupToSubscriptionRaw === null ||
    medianSignupToSubscriptionRaw === undefined
      ? null
      : Number(Number(medianSignupToSubscriptionRaw).toFixed(2));

  return {
    subscription_users: subscriptionUsers,
    subscription_users_with_grimoire_before:
      subscriptionUsersWithGrimoireBefore,
    subscription_with_grimoire_before_rate: Number(
      pct(subscriptionUsersWithGrimoireBefore, subscriptionUsers).toFixed(2),
    ),
    median_days_first_grimoire_to_signup: medianFirstGrimoireToSignup,
    median_days_signup_to_subscription: medianSignupToSubscription,
  };
}
