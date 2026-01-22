import { sql } from '@vercel/postgres';
import { formatTimestamp } from '@/lib/analytics/date-range';

export type DateRange = { start: Date; end: Date };

const utcDateExpr = `(created_at AT TIME ZONE 'UTC')::date`;
const canonicalIdentityExpr = `
  CASE
    WHEN user_id IS NOT NULL AND user_id <> '' THEN user_id
    WHEN anonymous_id IS NOT NULL AND anonymous_id <> '' THEN 'anon:' || anonymous_id
    ELSE NULL
  END
`;
const hasCanonicalIdentity = `
  (
    (user_id IS NOT NULL AND user_id <> '')
    OR (anonymous_id IS NOT NULL AND anonymous_id <> '')
  )
`;
const parseIsoDay = (dateKey: string) => new Date(`${dateKey}T00:00:00.000Z`);

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
  grimoire_views_per_active_user: number;
  return_to_grimoire_rate: number;
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
) {
  const result = await sql.query(
    `
      WITH current_window AS (
        SELECT DISTINCT ${canonicalIdentityExpr} AS identity
        FROM conversion_events
        WHERE event_type = 'app_opened'
          AND created_at >= $1
          AND created_at <= $2
          AND ${hasCanonicalIdentity}
      ),
      prev_window AS (
        SELECT DISTINCT ${canonicalIdentityExpr} AS identity
        FROM conversion_events
        WHERE event_type = 'app_opened'
          AND created_at >= $3
          AND created_at <= $4
          AND ${hasCanonicalIdentity}
      )
      SELECT COUNT(*) AS overlap
      FROM current_window c
      WHERE EXISTS (
        SELECT 1 FROM prev_window p WHERE p.identity = c.identity
      )
    `,
    [startCurrent, endCurrent, startPrev, endPrev],
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
): Promise<EngagementOverview> {
  const startTs = formatTimestamp(range.start);
  const endTs = formatTimestamp(range.end);

  // Daily DAU + daily returning DAU within the selected range.
  // returning_dau(day) = users active on `day` whose first active day in the selected range is before `day`.
  const dauTrendResult = await sql.query(
    `
      WITH days AS (
      SELECT DISTINCT user_id, ${utcDateExpr} AS day
      FROM conversion_events
      WHERE event_type = 'app_opened'
        AND user_id IS NOT NULL
        AND created_at >= $1
        AND created_at <= $2
      ),
      first_in_range AS (
        SELECT user_id, MIN(day) AS first_day_in_range
        FROM days
        GROUP BY user_id
      )
      SELECT
        d.day AS date,
        COUNT(DISTINCT d.user_id) AS dau,
        COUNT(DISTINCT d.user_id) FILTER (WHERE d.day > f.first_day_in_range) AS returning_dau
      FROM days d
      INNER JOIN first_in_range f ON f.user_id = d.user_id
      GROUP BY d.day
      ORDER BY d.day ASC
    `,
    [startTs, endTs],
  );

  // Current-day DAU over the selected end date (UTC day)
  const endDayKey = range.end.toISOString().slice(0, 10);
  const dauResult = await sql.query(
    `
      SELECT COUNT(DISTINCT user_id) AS count
      FROM conversion_events
      WHERE event_type = 'app_opened'
        AND user_id IS NOT NULL
        AND ${utcDateExpr} = $1::date
    `,
    [endDayKey],
  );

  // WAU/MAU relative to selected end
  const wauStart = new Date(range.end);
  wauStart.setUTCDate(wauStart.getUTCDate() - 6);
  wauStart.setUTCHours(0, 0, 0, 0);

  const mauStart = new Date(range.end);
  mauStart.setUTCDate(mauStart.getUTCDate() - 29);
  mauStart.setUTCHours(0, 0, 0, 0);

  const [wauResult, mauResult] = await Promise.all([
    sql.query(
      `
      SELECT COUNT(DISTINCT user_id) AS count
      FROM conversion_events
      WHERE event_type = 'app_opened'
        AND user_id IS NOT NULL
        AND created_at >= $1
        AND created_at <= $2
      `,
      [formatTimestamp(wauStart), endTs],
    ),
    sql.query(
      `
      SELECT COUNT(DISTINCT user_id) AS count
      FROM conversion_events
      WHERE event_type = 'app_opened'
        AND user_id IS NOT NULL
        AND created_at >= $1
        AND created_at <= $2
      `,
      [formatTimestamp(mauStart), endTs],
    ),
  ]);

  const dau = Number(dauResult.rows[0]?.count || 0);
  const wau = Number(wauResult.rows[0]?.count || 0);
  const mau = Number(mauResult.rows[0]?.count || 0);

  // New vs returning (lifetime) based on first-ever app_opened date.
  // This is useful for cohort age, but can be confusing during backfills.
  const newReturningResult = await sql.query(
    `
      WITH first_open AS (
    SELECT user_id, MIN(${utcDateExpr}) AS first_day
    FROM conversion_events
    WHERE event_type = 'app_opened'
      AND user_id IS NOT NULL
      AND user_id NOT LIKE 'anon:%'
    GROUP BY user_id
  ),
  active_in_range AS (
    SELECT DISTINCT user_id
    FROM conversion_events
    WHERE event_type = 'app_opened'
      AND user_id IS NOT NULL
      AND user_id NOT LIKE 'anon:%'
      AND created_at >= $1
      AND created_at <= $2
  )
      SELECT
        COUNT(*) FILTER (WHERE fo.first_day >= $3::date AND fo.first_day <= $4::date) AS new_users,
        COUNT(*) FILTER (WHERE fo.first_day < $3::date) AS returning_users_lifetime
      FROM active_in_range a
      INNER JOIN first_open fo ON fo.user_id = a.user_id
    `,
    [
      startTs,
      endTs,
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
      WITH per_user AS (
        SELECT
          user_id,
          COUNT(DISTINCT ${utcDateExpr}) AS active_days
        FROM conversion_events
        WHERE event_type = 'app_opened'
          AND user_id IS NOT NULL
          AND created_at >= $1
          AND created_at <= $2
        GROUP BY user_id
      )
      SELECT COUNT(*) AS returning_users_range
      FROM per_user
      WHERE active_days >= 2
    `,
    [startTs, endTs],
  );
  const returningUsersRange = Number(
    returningUsersRangeResult.rows[0]?.returning_users_range || 0,
  );

  const returningReferrerResult = await sql.query(
    `
      WITH returning_users AS (
        SELECT user_id
        FROM conversion_events
        WHERE event_type = 'app_opened'
          AND user_id IS NOT NULL
          AND created_at >= $1
          AND created_at <= $2
        GROUP BY user_id
        HAVING COUNT(DISTINCT ${utcDateExpr}) >= 2
      ),
      latest_returning AS (
        SELECT DISTINCT ON (user_id)
          user_id,
          COALESCE(metadata->>'referrer', '') AS referrer,
          COALESCE(metadata->>'utm_source', '') AS utm_source,
          COALESCE(metadata->>'origin_type', '') AS origin_type
        FROM conversion_events
        WHERE event_type = 'app_opened'
          AND user_id IS NOT NULL
          AND created_at >= $1
          AND created_at <= $2
          AND user_id IN (SELECT user_id FROM returning_users)
        ORDER BY user_id, created_at DESC
      ),
      classified AS (
        SELECT
          user_id,
          LOWER(referrer) AS ref_lower,
          LOWER(utm_source) AS utm_lower,
          LOWER(origin_type) AS origin_lower
        FROM latest_returning
      ),
      categorized AS (
        SELECT
          user_id,
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
    [startTs, endTs],
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

  // Returning DAU (selected end day): active on end day AND also active on an earlier day in the selected range.
  const endDayDate = parseIsoDay(endDayKey);
  const prevDayDate = new Date(endDayDate);
  prevDayDate.setUTCDate(prevDayDate.getUTCDate() - 1);
  const prevDayKey = toDateKey(prevDayDate);

  const returningDauResult = await sql.query(
    `
      WITH days AS (
        SELECT DISTINCT user_id, ${utcDateExpr} AS day
        FROM conversion_events
        WHERE event_type = 'app_opened'
          AND user_id IS NOT NULL
          AND user_id NOT LIKE 'anon:%'
          AND created_at >= $1
          AND created_at <= $2
      )
      SELECT COUNT(*) AS returning_dau
      FROM days d
      WHERE d.day = $3::date
        AND EXISTS (
          SELECT 1
          FROM days prev
          WHERE prev.user_id = d.user_id
            AND prev.day = $4::date
        )
    `,
    [startTs, endTs, endDayKey, prevDayKey],
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
  );

  // Active days per user (within selected range)
  const activeDaysResult = await sql.query(
    `
      WITH per_user AS (
        SELECT
          user_id,
          COUNT(DISTINCT ${utcDateExpr}) AS active_days
        FROM conversion_events
        WHERE event_type = 'app_opened'
          AND user_id IS NOT NULL
          AND created_at >= $1
          AND created_at <= $2
        GROUP BY user_id
      )
      SELECT
        AVG(active_days)::float AS avg_active_days,
        COUNT(*) FILTER (WHERE active_days = 1) AS bucket_1,
        COUNT(*) FILTER (WHERE active_days BETWEEN 2 AND 3) AS bucket_2_3,
        COUNT(*) FILTER (WHERE active_days BETWEEN 4 AND 7) AS bucket_4_7,
        COUNT(*) FILTER (WHERE active_days BETWEEN 8 AND 14) AS bucket_8_14,
        COUNT(*) FILTER (WHERE active_days >= 15) AS bucket_15_plus
      FROM per_user
    `,
    [startTs, endTs],
  );

  const avgActiveDays = Number(activeDaysResult.rows[0]?.avg_active_days || 0);

  // Cohort-lite retention: day+1/day+7/day+30 from first-ever open day
  const retentionResult = await sql.query(
    `
      WITH first_open AS (
        SELECT user_id, MIN(${utcDateExpr}) AS first_day
      FROM conversion_events
      WHERE event_type = 'app_opened'
        AND user_id IS NOT NULL
        AND user_id NOT LIKE 'anon:%'
      GROUP BY user_id
    ),
    cohort AS (
      SELECT user_id, first_day
      FROM first_open
      WHERE first_day >= $1::date
        AND first_day <= $2::date
    ),
    opens AS (
      SELECT DISTINCT user_id, ${utcDateExpr} AS day
      FROM conversion_events
      WHERE event_type = 'app_opened'
        AND user_id IS NOT NULL
        AND user_id NOT LIKE 'anon:%'
    )
      SELECT
        c.first_day AS cohort_day,
        COUNT(*) AS cohort_users,
        COUNT(*) FILTER (
          WHERE EXISTS (
            SELECT 1 FROM opens o
            WHERE o.user_id = c.user_id
              AND o.day = c.first_day + 1
          )
        ) AS retained_day_1,
        COUNT(*) FILTER (
          WHERE EXISTS (
            SELECT 1 FROM opens o
            WHERE o.user_id = c.user_id
              AND o.day = c.first_day + 7
          )
        ) AS retained_day_7,
        COUNT(*) FILTER (
          WHERE EXISTS (
            SELECT 1 FROM opens o
            WHERE o.user_id = c.user_id
              AND o.day = c.first_day + 30
          )
        ) AS retained_day_30
      FROM cohort c
      GROUP BY c.first_day
      ORDER BY c.first_day ASC
    `,
    [
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
  };
}

export async function getFeatureAdoption(
  range: DateRange,
): Promise<FeatureAdoption> {
  const endTs = formatTimestamp(range.end);

  const mauStart = new Date(range.end);
  mauStart.setUTCDate(mauStart.getUTCDate() - 29);
  mauStart.setUTCHours(0, 0, 0, 0);

  const mauResult = await sql.query(
    `
      SELECT COUNT(DISTINCT user_id) AS count
      FROM conversion_events
      WHERE event_type = 'app_opened'
        AND user_id IS NOT NULL
        AND user_id NOT LIKE 'anon:%'
        AND created_at >= $1
        AND created_at <= $2
    `,
    [formatTimestamp(mauStart), endTs],
  );

  const mau = Number(mauResult.rows[0]?.count || 0);

  const featureTypes = [
    'daily_dashboard_viewed',
    'grimoire_viewed',
    'astral_chat_used',
    'tarot_drawn',
    'ritual_started',
    'chart_viewed',
  ];

  const result = await sql.query(
    `
      SELECT event_type, COUNT(DISTINCT user_id) AS users
      FROM conversion_events
      WHERE event_type = ANY($1::text[])
        AND user_id IS NOT NULL
        AND created_at >= $2
        AND created_at <= $3
      GROUP BY event_type
      ORDER BY users DESC
    `,
    [featureTypes, formatTimestamp(range.start), formatTimestamp(range.end)],
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

  // Active users in selected range
  const activeUsersResult = await sql.query(
    `
      SELECT COUNT(DISTINCT user_id) AS count
      FROM conversion_events
      WHERE event_type = 'app_opened'
        AND user_id IS NOT NULL
        AND user_id NOT LIKE 'anon:%'
        AND created_at >= $1
        AND created_at <= $2
    `,
    [startTs, endTs],
  );
  const activeUsers = Number(activeUsersResult.rows[0]?.count || 0);

  // New users in selected range (first app_opened within range)
  const newUsersResult = await sql.query(
    `
      WITH first_open AS (
        SELECT user_id, MIN(${utcDateExpr}) AS first_day
        FROM conversion_events
        WHERE event_type = 'app_opened'
          AND user_id IS NOT NULL
        GROUP BY user_id
      )
      SELECT COUNT(*) AS count
      FROM first_open
      WHERE first_day >= $1::date
        AND first_day <= $2::date
    `,
    [
      range.start.toISOString().slice(0, 10),
      range.end.toISOString().slice(0, 10),
    ],
  );
  const newUsers = Number(newUsersResult.rows[0]?.count || 0);

  // Grimoire entry: new users whose first-open day includes a grimoire view
  const entryResult = await sql.query(
    `
      WITH first_open AS (
        SELECT user_id, MIN(${utcDateExpr}) AS first_day
        FROM conversion_events
        WHERE event_type = 'app_opened'
          AND user_id IS NOT NULL
        GROUP BY user_id
      ),
      new_users AS (
        SELECT user_id, first_day
        FROM first_open
        WHERE first_day >= $1::date
          AND first_day <= $2::date
      )
      SELECT
        COUNT(*) FILTER (
          WHERE EXISTS (
            SELECT 1
            FROM conversion_events ce
            WHERE ce.user_id = nu.user_id
              AND ce.event_type = 'grimoire_viewed'
              AND (ce.created_at AT TIME ZONE 'UTC')::date = nu.first_day
          )
        ) AS entry_users
      FROM new_users nu
    `,
    [
      range.start.toISOString().slice(0, 10),
      range.end.toISOString().slice(0, 10),
    ],
  );
  const entryUsers = Number(entryResult.rows[0]?.entry_users || 0);

  // Grimoire distinct pages per active user (avg distinct entity per user, include 0s)
  const grimoireDistinctPerUser = await sql.query(
    `
      WITH active_users AS (
        SELECT DISTINCT user_id
        FROM conversion_events
        WHERE event_type = 'app_opened'
          AND user_id IS NOT NULL
          AND created_at >= $1
          AND created_at <= $2
      ),
      per_user AS (
        SELECT
          au.user_id,
          COUNT(DISTINCT COALESCE(ce.entity_id, ce.page_path, '')) AS distinct_pages
        FROM active_users au
        LEFT JOIN conversion_events ce
          ON ce.user_id = au.user_id
          AND ce.event_type = 'grimoire_viewed'
          AND ce.created_at >= $1
          AND ce.created_at <= $2
        GROUP BY au.user_id
      )
      SELECT AVG(distinct_pages)::float AS avg_distinct_pages
      FROM per_user
    `,
    [startTs, endTs],
  );
  const viewsPerActiveUser = Number(
    grimoireDistinctPerUser.rows[0]?.avg_distinct_pages || 0,
  );

  // Return-to-Grimoire: 2+ distinct grimoire days among users who viewed grimoire
  const returnToGrimoireResult = await sql.query(
    `
      WITH per_user AS (
        SELECT
          user_id,
          COUNT(DISTINCT ${utcDateExpr}) AS grimoire_days
        FROM conversion_events
        WHERE event_type = 'grimoire_viewed'
          AND user_id IS NOT NULL
          AND created_at >= $1
          AND created_at <= $2
        GROUP BY user_id
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

  // Influence metrics
  const influence = await getConversionInfluence(range);

  return {
    grimoire_entry_rate: Number(pct(entryUsers, newUsers).toFixed(2)),
    grimoire_views_per_active_user: Number(viewsPerActiveUser.toFixed(2)),
    return_to_grimoire_rate: Number(
      pct(returnUsers, anyGrimoireUsers).toFixed(2),
    ),
    influence,
  };
}

export async function getConversionInfluence(
  range: DateRange,
): Promise<ConversionInfluence> {
  const startTs = formatTimestamp(range.start);
  const endTs = formatTimestamp(range.end);

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
          )
        ) AS subscription_users_with_grimoire_before
      FROM subs
    `,
    [startTs, endTs, subscriptionEventTypes],
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
        GROUP BY user_id
      ),
      grimoire_first AS (
        SELECT user_id, MIN(created_at) AS first_grimoire_at
        FROM conversion_events
        WHERE event_type = 'grimoire_viewed'
          AND user_id IS NOT NULL
        GROUP BY user_id
      ),
      signup_first AS (
        SELECT user_id, MIN(created_at) AS signup_at
        FROM conversion_events
        WHERE event_type = ANY($4::text[])
          AND user_id IS NOT NULL
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
    [startTs, endTs, subscriptionEventTypes, signupEventTypes],
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
