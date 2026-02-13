import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

const ACTIVATION_EVENTS = [
  'grimoire_save',
  'tarot_pull',
  'moon_phase_view',
  'birth_chart_viewed',
  'tarot_viewed',
  'horoscope_viewed',
  'personalized_tarot_viewed',
  'personalized_horoscope_viewed',
];

/**
 * Compute daily metrics and store in daily_metrics table
 * Runs via Vercel Cron once per day
 *
 * Uses identity resolution (analytics_identity_links) to correctly count
 * anonymous users who later signed in, matching the live dau-wau-mau path.
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify cron secret (Vercel sets this header)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get target date (yesterday by default, or from query param for backfill)
    const { searchParams } = new URL(request.url);
    const targetDateParam = searchParams.get('date');

    const targetDate = targetDateParam
      ? new Date(targetDateParam)
      : (() => {
          const yesterday = new Date();
          yesterday.setUTCDate(yesterday.getUTCDate() - 1);
          yesterday.setUTCHours(0, 0, 0, 0);
          return yesterday;
        })();

    const dateStr = targetDate.toISOString().split('T')[0];
    const dayStart = new Date(targetDate);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setUTCHours(23, 59, 59, 999);

    console.log(`📊 Computing metrics for ${dateStr}...`);

    // Get WAU and MAU date ranges
    const wauStart = new Date(dayEnd);
    wauStart.setUTCDate(wauStart.getUTCDate() - 6); // 7 days including target
    const mauStart = new Date(dayEnd);
    mauStart.setUTCDate(mauStart.getUTCDate() - 29); // 30 days including target

    // Check if analytics_identity_links table exists for identity resolution
    const identityLinksCheck = await sql.query(
      `SELECT to_regclass('analytics_identity_links') IS NOT NULL AS exists`,
    );
    const hasIdentityLinks = Boolean(identityLinksCheck.rows[0]?.exists);

    // SQL fragments for identity resolution
    // idJoin: LEFT JOIN to resolve anonymous_id → user_id
    const idJoin = hasIdentityLinks
      ? 'LEFT JOIN analytics_identity_links ail ON ce.anonymous_id IS NOT NULL AND ail.anonymous_id = ce.anonymous_id'
      : '';

    // anyId: resolves to any identity (real user, linked anonymous, or raw anonymous)
    const anyId = hasIdentityLinks
      ? `COALESCE(CASE WHEN ce.user_id IS NOT NULL AND ce.user_id <> '' AND ce.user_id NOT LIKE 'anon:%' THEN ce.user_id END, ail.user_id, ce.anonymous_id)`
      : `COALESCE(CASE WHEN ce.user_id IS NOT NULL AND ce.user_id <> '' AND ce.user_id NOT LIKE 'anon:%' THEN ce.user_id END, ce.anonymous_id)`;

    // signedInId: resolves to signed-in users only (real user or linked anonymous → real user)
    const signedInId = hasIdentityLinks
      ? `COALESCE(CASE WHEN ce.user_id IS NOT NULL AND ce.user_id <> '' AND ce.user_id NOT LIKE 'anon:%' THEN ce.user_id END, ail.user_id)`
      : `CASE WHEN ce.user_id IS NOT NULL AND ce.user_id <> '' AND ce.user_id NOT LIKE 'anon:%' THEN ce.user_id ELSE NULL END`;

    // whereBase: filters for valid identities and excludes test emails
    // Uses $3/$4 for test email params (most queries use $1=start, $2=end, $3=pattern, $4=exact)
    const whereBase = `(ce.user_id IS NOT NULL OR ce.anonymous_id IS NOT NULL)
      AND (ce.user_email IS NULL OR (ce.user_email NOT LIKE $3 AND ce.user_email != $4))`;

    // Execute all queries in parallel for speed
    const [
      dauResult,
      wauResult,
      mauResult,
      productDauResult,
      productWauResult,
      productMauResult,
      appOpenedDauResult,
      appOpenedWauResult,
      appMauResult,
      reachDauResult,
      reachWauResult,
      reachMauResult,
      grimoireDauResult,
      grimoireWauResult,
      grimoireMauResult,
      grimoireOnlyMauResult,
      returningDauResult,
      returningWauResult,
      returningMauResult,
      activeDaysResult,
      totalAccountsResult,
      d1RetentionResult,
      d7RetentionResult,
      d30RetentionResult,
      signupsResult,
      activationResult,
      mrrResult,
      subscriptionsResult,
      conversionsResult,
      featureAdoptionResult,
      returningReferrerResult,
      signedInProductReturningResult,
    ] = await Promise.all([
      // DAU - all users active on target date (includes anonymous)
      sql.query(
        `SELECT COUNT(DISTINCT ${anyId}) as count
         FROM conversion_events ce
         ${idJoin}
         WHERE ce.created_at >= $1 AND ce.created_at <= $2
           AND ${whereBase}`,
        [
          dayStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // WAU - all users active in 7-day window
      sql.query(
        `SELECT COUNT(DISTINCT ${anyId}) as count
         FROM conversion_events ce
         ${idJoin}
         WHERE ce.created_at >= $1 AND ce.created_at <= $2
           AND ${whereBase}`,
        [
          wauStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // MAU - all users active in 30-day window
      sql.query(
        `SELECT COUNT(DISTINCT ${anyId}) as count
         FROM conversion_events ce
         ${idJoin}
         WHERE ce.created_at >= $1 AND ce.created_at <= $2
           AND ${whereBase}`,
        [
          mauStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // Product DAU - signed-in users who used product features (not app_opened/page_viewed)
      sql.query(
        `SELECT COUNT(DISTINCT ${signedInId}) as count
         FROM conversion_events ce
         ${idJoin}
         WHERE ce.created_at >= $1 AND ce.created_at <= $2
           AND ce.event_type NOT IN ('app_opened', 'page_viewed')
           AND ${whereBase}`,
        [
          dayStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // Product WAU
      sql.query(
        `SELECT COUNT(DISTINCT ${signedInId}) as count
         FROM conversion_events ce
         ${idJoin}
         WHERE ce.created_at >= $1 AND ce.created_at <= $2
           AND ce.event_type NOT IN ('app_opened', 'page_viewed')
           AND ${whereBase}`,
        [
          wauStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // Product MAU
      sql.query(
        `SELECT COUNT(DISTINCT ${signedInId}) as count
         FROM conversion_events ce
         ${idJoin}
         WHERE ce.created_at >= $1 AND ce.created_at <= $2
           AND ce.event_type NOT IN ('app_opened', 'page_viewed')
           AND ${whereBase}`,
        [
          mauStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // App Opened DAU (includes anonymous users)
      sql.query(
        `SELECT COUNT(DISTINCT ${anyId}) as count
         FROM conversion_events ce
         ${idJoin}
         WHERE ce.created_at >= $1 AND ce.created_at <= $2
           AND ce.event_type = 'app_opened'
           AND ${whereBase}`,
        [
          dayStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // App Opened WAU
      sql.query(
        `SELECT COUNT(DISTINCT ${anyId}) as count
         FROM conversion_events ce
         ${idJoin}
         WHERE ce.created_at >= $1 AND ce.created_at <= $2
           AND ce.event_type = 'app_opened'
           AND ${whereBase}`,
        [
          wauStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // App Opened MAU
      sql.query(
        `SELECT COUNT(DISTINCT ${anyId}) as count
         FROM conversion_events ce
         ${idJoin}
         WHERE ce.created_at >= $1 AND ce.created_at <= $2
           AND ce.event_type = 'app_opened'
           AND ${whereBase}`,
        [
          mauStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // Reach DAU (page_viewed events, includes anonymous)
      sql.query(
        `SELECT COUNT(DISTINCT ${anyId}) as count
         FROM conversion_events ce
         ${idJoin}
         WHERE ce.created_at >= $1 AND ce.created_at <= $2
           AND ce.event_type = 'page_viewed'
           AND ${whereBase}`,
        [
          dayStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // Reach WAU
      sql.query(
        `SELECT COUNT(DISTINCT ${anyId}) as count
         FROM conversion_events ce
         ${idJoin}
         WHERE ce.created_at >= $1 AND ce.created_at <= $2
           AND ce.event_type = 'page_viewed'
           AND ${whereBase}`,
        [
          wauStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // Reach MAU
      sql.query(
        `SELECT COUNT(DISTINCT ${anyId}) as count
         FROM conversion_events ce
         ${idJoin}
         WHERE ce.created_at >= $1 AND ce.created_at <= $2
           AND ce.event_type = 'page_viewed'
           AND ${whereBase}`,
        [
          mauStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // Grimoire DAU (grimoire page views, includes anonymous)
      sql.query(
        `SELECT COUNT(DISTINCT ${anyId}) as count
         FROM conversion_events ce
         ${idJoin}
         WHERE ce.created_at >= $1 AND ce.created_at <= $2
           AND ce.event_type = 'page_viewed'
           AND ce.page_path LIKE '/grimoire%'
           AND ${whereBase}`,
        [
          dayStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // Grimoire WAU
      sql.query(
        `SELECT COUNT(DISTINCT ${anyId}) as count
         FROM conversion_events ce
         ${idJoin}
         WHERE ce.created_at >= $1 AND ce.created_at <= $2
           AND ce.event_type = 'page_viewed'
           AND ce.page_path LIKE '/grimoire%'
           AND ${whereBase}`,
        [
          wauStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // Grimoire MAU
      sql.query(
        `SELECT COUNT(DISTINCT ${anyId}) as count
         FROM conversion_events ce
         ${idJoin}
         WHERE ce.created_at >= $1 AND ce.created_at <= $2
           AND ce.event_type = 'page_viewed'
           AND ce.page_path LIKE '/grimoire%'
           AND ${whereBase}`,
        [
          mauStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // Grimoire-only MAU (grimoire viewers who never opened the app as signed-in users)
      sql.query(
        `WITH grimoire_viewers AS (
           SELECT DISTINCT ${anyId} as resolved_id
           FROM conversion_events ce
           ${idJoin}
           WHERE ce.created_at >= $1 AND ce.created_at <= $2
             AND ce.event_type = 'page_viewed'
             AND ce.page_path LIKE '/grimoire%'
             AND ${whereBase}
         ),
         app_users AS (
           SELECT DISTINCT ${signedInId} as resolved_id
           FROM conversion_events ce
           ${idJoin}
           WHERE ce.created_at >= $1 AND ce.created_at <= $2
             AND ce.event_type = 'app_opened'
             AND ${whereBase}
         )
         SELECT COUNT(*) as count
         FROM grimoire_viewers gv
         WHERE gv.resolved_id IS NOT NULL
           AND NOT EXISTS (
             SELECT 1 FROM app_users au
             WHERE au.resolved_id IS NOT NULL AND au.resolved_id = gv.resolved_id
           )`,
        [
          mauStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // Returning DAU (users with 2+ active days in MAU window who were active today)
      sql.query(
        `WITH resolved AS (
           SELECT ${anyId} as resolved_id, DATE(ce.created_at) as event_date
           FROM conversion_events ce
           ${idJoin}
           WHERE ce.created_at >= $1 AND ce.created_at <= $2
             AND ${whereBase}
         ),
         multi_day_users AS (
           SELECT resolved_id
           FROM resolved
           WHERE resolved_id IS NOT NULL
           GROUP BY resolved_id
           HAVING COUNT(DISTINCT event_date) >= 2
         )
         SELECT COUNT(*) as count
         FROM multi_day_users mdu
         WHERE EXISTS (
           SELECT 1 FROM resolved r
           WHERE r.resolved_id = mdu.resolved_id
             AND r.event_date = $5::date
         )`,
        [
          mauStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
          dateStr,
        ],
      ),

      // Returning WAU (users with 2+ active days in WAU window)
      sql.query(
        `WITH resolved AS (
           SELECT ${anyId} as resolved_id, DATE(ce.created_at) as event_date
           FROM conversion_events ce
           ${idJoin}
           WHERE ce.created_at >= $1 AND ce.created_at <= $2
             AND ${whereBase}
         )
         SELECT COUNT(DISTINCT resolved_id) as count
         FROM (
           SELECT resolved_id
           FROM resolved
           WHERE resolved_id IS NOT NULL
           GROUP BY resolved_id
           HAVING COUNT(DISTINCT event_date) >= 2
         ) returning_users`,
        [
          wauStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // Returning MAU (users with 2+ active days in MAU window)
      sql.query(
        `WITH resolved AS (
           SELECT ${anyId} as resolved_id, DATE(ce.created_at) as event_date
           FROM conversion_events ce
           ${idJoin}
           WHERE ce.created_at >= $1 AND ce.created_at <= $2
             AND ${whereBase}
         )
         SELECT COUNT(DISTINCT resolved_id) as count
         FROM (
           SELECT resolved_id
           FROM resolved
           WHERE resolved_id IS NOT NULL
           GROUP BY resolved_id
           HAVING COUNT(DISTINCT event_date) >= 2
         ) returning_users`,
        [
          mauStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // Active days distribution (count users in each bucket for MAU period)
      sql.query(
        `WITH resolved AS (
           SELECT ${anyId} as resolved_id, DATE(ce.created_at) as event_date
           FROM conversion_events ce
           ${idJoin}
           WHERE ce.created_at >= $1 AND ce.created_at <= $2
             AND ${whereBase}
         ),
         user_days AS (
           SELECT resolved_id, COUNT(DISTINCT event_date) as active_days
           FROM resolved
           WHERE resolved_id IS NOT NULL
           GROUP BY resolved_id
         )
         SELECT
           COUNT(*) FILTER (WHERE active_days = 1) as days_1,
           COUNT(*) FILTER (WHERE active_days BETWEEN 2 AND 3) as days_2_3,
           COUNT(*) FILTER (WHERE active_days BETWEEN 4 AND 7) as days_4_7,
           COUNT(*) FILTER (WHERE active_days BETWEEN 8 AND 14) as days_8_14,
           COUNT(*) FILTER (WHERE active_days >= 15) as days_15_plus
         FROM user_days`,
        [
          mauStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // Total accounts (all-time)
      sql.query(
        `SELECT COUNT(*) as count
         FROM "user"
         WHERE (email IS NULL OR (email NOT LIKE $1 AND email != $2))`,
        [TEST_EMAIL_PATTERN, TEST_EMAIL_EXACT],
      ),

      // D1 Retention: rolling cohort (signed up 1-3 days ago), returned day 1+
      // Uses broader cohort window for stability instead of single-day cohort
      sql.query(
        hasIdentityLinks
          ? `WITH cohort AS (
               SELECT id, "createdAt" FROM "user"
               WHERE "createdAt" >= $1::date - INTERVAL '3 days'
                 AND "createdAt" < $1::date
                 AND (email IS NULL OR (email NOT LIKE $2 AND email != $3))
             )
             SELECT
               COUNT(*) as cohort_size,
               COUNT(*) FILTER (
                 WHERE EXISTS (
                   SELECT 1 FROM conversion_events ce
                   LEFT JOIN analytics_identity_links ail
                     ON ce.anonymous_id IS NOT NULL AND ail.anonymous_id = ce.anonymous_id
                   WHERE (ce.user_id = c.id OR ail.user_id = c.id)
                     AND DATE(ce.created_at AT TIME ZONE 'UTC') >= DATE(c."createdAt" AT TIME ZONE 'UTC') + 1
                 )
               ) as returned
             FROM cohort c`
          : `WITH cohort AS (
               SELECT id, "createdAt" FROM "user"
               WHERE "createdAt" >= $1::date - INTERVAL '3 days'
                 AND "createdAt" < $1::date
                 AND (email IS NULL OR (email NOT LIKE $2 AND email != $3))
             )
             SELECT
               COUNT(*) as cohort_size,
               COUNT(*) FILTER (
                 WHERE EXISTS (
                   SELECT 1 FROM conversion_events ce
                   WHERE ce.user_id = c.id
                     AND DATE(ce.created_at AT TIME ZONE 'UTC') >= DATE(c."createdAt" AT TIME ZONE 'UTC') + 1
                 )
               ) as returned
             FROM cohort c`,
        [dateStr, TEST_EMAIL_PATTERN, TEST_EMAIL_EXACT],
      ),

      // D7 Retention: rolling cohort (signed up 7-14 days ago), returned day 7+
      sql.query(
        hasIdentityLinks
          ? `WITH cohort AS (
               SELECT id, "createdAt" FROM "user"
               WHERE "createdAt" >= $1::date - INTERVAL '14 days'
                 AND "createdAt" < $1::date - INTERVAL '6 days'
                 AND (email IS NULL OR (email NOT LIKE $2 AND email != $3))
             )
             SELECT
               COUNT(*) as cohort_size,
               COUNT(*) FILTER (
                 WHERE EXISTS (
                   SELECT 1 FROM conversion_events ce
                   LEFT JOIN analytics_identity_links ail
                     ON ce.anonymous_id IS NOT NULL AND ail.anonymous_id = ce.anonymous_id
                   WHERE (ce.user_id = c.id OR ail.user_id = c.id)
                     AND DATE(ce.created_at AT TIME ZONE 'UTC') >= DATE(c."createdAt" AT TIME ZONE 'UTC') + 7
                 )
               ) as returned
             FROM cohort c`
          : `WITH cohort AS (
               SELECT id, "createdAt" FROM "user"
               WHERE "createdAt" >= $1::date - INTERVAL '14 days'
                 AND "createdAt" < $1::date - INTERVAL '6 days'
                 AND (email IS NULL OR (email NOT LIKE $2 AND email != $3))
             )
             SELECT
               COUNT(*) as cohort_size,
               COUNT(*) FILTER (
                 WHERE EXISTS (
                   SELECT 1 FROM conversion_events ce
                   WHERE ce.user_id = c.id
                     AND DATE(ce.created_at AT TIME ZONE 'UTC') >= DATE(c."createdAt" AT TIME ZONE 'UTC') + 7
                 )
               ) as returned
             FROM cohort c`,
        [dateStr, TEST_EMAIL_PATTERN, TEST_EMAIL_EXACT],
      ),

      // D30 Retention: rolling cohort (signed up 30-37 days ago), returned day 30+
      sql.query(
        hasIdentityLinks
          ? `WITH cohort AS (
               SELECT id, "createdAt" FROM "user"
               WHERE "createdAt" >= $1::date - INTERVAL '37 days'
                 AND "createdAt" < $1::date - INTERVAL '29 days'
                 AND (email IS NULL OR (email NOT LIKE $2 AND email != $3))
             )
             SELECT
               COUNT(*) as cohort_size,
               COUNT(*) FILTER (
                 WHERE EXISTS (
                   SELECT 1 FROM conversion_events ce
                   LEFT JOIN analytics_identity_links ail
                     ON ce.anonymous_id IS NOT NULL AND ail.anonymous_id = ce.anonymous_id
                   WHERE (ce.user_id = c.id OR ail.user_id = c.id)
                     AND DATE(ce.created_at AT TIME ZONE 'UTC') >= DATE(c."createdAt" AT TIME ZONE 'UTC') + 30
                 )
               ) as returned
             FROM cohort c`
          : `WITH cohort AS (
               SELECT id, "createdAt" FROM "user"
               WHERE "createdAt" >= $1::date - INTERVAL '37 days'
                 AND "createdAt" < $1::date - INTERVAL '29 days'
                 AND (email IS NULL OR (email NOT LIKE $2 AND email != $3))
             )
             SELECT
               COUNT(*) as cohort_size,
               COUNT(*) FILTER (
                 WHERE EXISTS (
                   SELECT 1 FROM conversion_events ce
                   WHERE ce.user_id = c.id
                     AND DATE(ce.created_at AT TIME ZONE 'UTC') >= DATE(c."createdAt" AT TIME ZONE 'UTC') + 30
                 )
               ) as returned
             FROM cohort c`,
        [dateStr, TEST_EMAIL_PATTERN, TEST_EMAIL_EXACT],
      ),

      // New signups on target date
      sql.query(
        `SELECT COUNT(*) as count
         FROM "user"
         WHERE "createdAt" >= $1 AND "createdAt" <= $2
           AND (email IS NULL OR (email NOT LIKE $3 AND email != $4))`,
        [
          dayStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // Activated users (users who completed key action within 24h of signup)
      // Matches the activation card's logic: same events, same 24h window
      // With identity resolution: also checks anonymous events linked to the user
      sql.query(
        hasIdentityLinks
          ? `SELECT COUNT(DISTINCT u.id) as count
             FROM "user" u
             WHERE u."createdAt" >= $1 AND u."createdAt" <= $2
               AND (u.email IS NULL OR (u.email NOT LIKE $3 AND u.email != $4))
               AND EXISTS (
                 SELECT 1 FROM conversion_events ce
                 LEFT JOIN analytics_identity_links ail
                   ON ce.anonymous_id IS NOT NULL AND ail.anonymous_id = ce.anonymous_id
                 WHERE (ce.user_id = u.id OR ail.user_id = u.id)
                   AND ce.event_type = ANY($5::text[])
                   AND ce.created_at >= u."createdAt"
                   AND ce.created_at <= u."createdAt" + INTERVAL '7 days'
               )`
          : `SELECT COUNT(DISTINCT u.id) as count
             FROM "user" u
             INNER JOIN conversion_events ce ON ce.user_id = u.id
             WHERE u."createdAt" >= $1 AND u."createdAt" <= $2
               AND ce.event_type = ANY($5::text[])
               AND ce.created_at >= u."createdAt"
               AND ce.created_at <= u."createdAt" + INTERVAL '7 days'
               AND (u.email IS NULL OR (u.email NOT LIKE $3 AND u.email != $4))`,
        [
          dayStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
          ACTIVATION_EVENTS,
        ],
      ),

      // MRR (Monthly Recurring Revenue)
      sql.query(
        `SELECT COALESCE(SUM(COALESCE(monthly_amount_due, 0)), 0) as mrr
         FROM subscriptions
         WHERE status IN ('active', 'trial', 'trialing')
           AND stripe_subscription_id IS NOT NULL
           AND (user_email IS NULL OR (user_email NOT LIKE $1 AND user_email != $2))`,
        [TEST_EMAIL_PATTERN, TEST_EMAIL_EXACT],
      ),

      // Active subscriptions count
      sql.query(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'active') as active,
           COUNT(*) FILTER (WHERE status IN ('trial', 'trialing')) as trial
         FROM subscriptions
         WHERE stripe_subscription_id IS NOT NULL
           AND (user_email IS NULL OR (user_email NOT LIKE $1 AND user_email != $2))`,
        [TEST_EMAIL_PATTERN, TEST_EMAIL_EXACT],
      ),

      // New conversions on target date
      sql.query(
        `SELECT COUNT(DISTINCT s.user_id) as count
         FROM subscriptions s
         INNER JOIN "user" u ON u.id = s.user_id
         WHERE s.created_at >= $1 AND s.created_at <= $2
           AND (u.email IS NULL OR (u.email NOT LIKE $3 AND u.email != $4))`,
        [
          dayStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // Feature adoption (signed-in users who used each feature in MAU window)
      sql.query(
        `SELECT
           ce.event_type,
           COUNT(DISTINCT ${signedInId}) as users
         FROM conversion_events ce
         ${idJoin}
         WHERE ce.created_at >= $1 AND ce.created_at <= $2
           AND ce.event_type IN (
             'daily_dashboard_viewed',
             'personalized_horoscope_viewed',
             'tarot_drawn',
             'chart_viewed',
             'astral_chat_used',
             'ritual_completed'
           )
           AND ${whereBase}
         GROUP BY ce.event_type`,
        [
          mauStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // Returning referrer breakdown (users with 2+ active days in MAU window)
      sql.query(
        `WITH resolved AS (
           SELECT ${anyId} as resolved_id,
                  DATE(ce.created_at) as event_date,
                  LOWER(COALESCE(ce.metadata->>'referrer', '')) as referrer,
                  LOWER(COALESCE(ce.metadata->>'utm_source', '')) as utm_source,
                  LOWER(COALESCE(ce.metadata->>'origin_type', '')) as origin_type
           FROM conversion_events ce
           ${idJoin}
           WHERE ce.created_at >= $1 AND ce.created_at <= $2
             AND ce.event_type = 'app_opened'
             AND ${whereBase}
         ),
         returning_users AS (
           SELECT resolved_id
           FROM resolved
           WHERE resolved_id IS NOT NULL
           GROUP BY resolved_id
           HAVING COUNT(DISTINCT event_date) >= 2
         ),
         latest_visit AS (
           SELECT DISTINCT ON (r.resolved_id)
             r.resolved_id, r.referrer, r.utm_source, r.origin_type
           FROM resolved r
           WHERE r.resolved_id IN (SELECT resolved_id FROM returning_users)
           ORDER BY r.resolved_id, r.event_date DESC
         ),
         classified AS (
           SELECT
             resolved_id,
             (origin_type = 'internal' OR referrer LIKE '%lunary.app%') AS is_internal,
             (origin_type = 'seo' OR utm_source LIKE '%organic%' OR utm_source LIKE '%seo%'
              OR utm_source LIKE '%search%' OR referrer LIKE '%google.%'
              OR referrer LIKE '%bing.%' OR referrer LIKE '%duckduckgo.%') AS is_search
           FROM latest_visit
         )
         SELECT
           COALESCE(SUM(CASE WHEN NOT is_internal AND is_search THEN 1 ELSE 0 END), 0) AS organic,
           COALESCE(SUM(CASE WHEN NOT is_internal AND NOT is_search THEN 1 ELSE 0 END), 0) AS direct,
           COALESCE(SUM(CASE WHEN is_internal THEN 1 ELSE 0 END), 0) AS internal
         FROM classified`,
        [
          mauStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // Signed-in product returning users (2+ active days with product events in MAU window)
      // Matches live path logic: productUsageSummaryResult.rows.filter(r => active_days > 1)
      sql.query(
        `WITH resolved AS (
           SELECT ${signedInId} as resolved_id, DATE(ce.created_at) as event_date
           FROM conversion_events ce
           ${idJoin}
           WHERE ce.created_at >= $1 AND ce.created_at <= $2
             AND ce.event_type NOT IN ('app_opened', 'page_viewed')
             AND ${whereBase}
         )
         SELECT COUNT(DISTINCT resolved_id) as count
         FROM (
           SELECT resolved_id
           FROM resolved
           WHERE resolved_id IS NOT NULL
           GROUP BY resolved_id
           HAVING COUNT(DISTINCT event_date) >= 2
         ) returning_product_users`,
        [
          mauStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),
    ]);

    // Extract values
    const dau = Number(dauResult.rows[0]?.count || 0);
    const wau = Number(wauResult.rows[0]?.count || 0);
    const mau = Number(mauResult.rows[0]?.count || 0);
    const productDau = Number(productDauResult.rows[0]?.count || 0);
    const productWau = Number(productWauResult.rows[0]?.count || 0);
    const productMau = Number(productMauResult.rows[0]?.count || 0);
    const appOpenedDau = Number(appOpenedDauResult.rows[0]?.count || 0);
    const appOpenedWau = Number(appOpenedWauResult.rows[0]?.count || 0);
    const appMau = Number(appMauResult.rows[0]?.count || 0);
    const reachDau = Number(reachDauResult.rows[0]?.count || 0);
    const reachWau = Number(reachWauResult.rows[0]?.count || 0);
    const reachMau = Number(reachMauResult.rows[0]?.count || 0);
    const grimoireDau = Number(grimoireDauResult.rows[0]?.count || 0);
    const grimoireWau = Number(grimoireWauResult.rows[0]?.count || 0);
    const grimoireMau = Number(grimoireMauResult.rows[0]?.count || 0);
    const grimoireOnlyMau = Number(grimoireOnlyMauResult.rows[0]?.count || 0);
    const returningDau = Number(returningDauResult.rows[0]?.count || 0);
    const returningWau = Number(returningWauResult.rows[0]?.count || 0);
    const returningMau = Number(returningMauResult.rows[0]?.count || 0);
    const signedInProductReturningUsers = Number(
      signedInProductReturningResult.rows[0]?.count || 0,
    );
    const activeDays = activeDaysResult.rows[0] || {};
    const activeDays1 = Number(activeDays.days_1 || 0);
    const activeDays2_3 = Number(activeDays.days_2_3 || 0);
    const activeDays4_7 = Number(activeDays.days_4_7 || 0);
    const activeDays8_14 = Number(activeDays.days_8_14 || 0);
    const activeDays15Plus = Number(activeDays.days_15_plus || 0);
    const totalAccounts = Number(totalAccountsResult.rows[0]?.count || 0);
    const signups = Number(signupsResult.rows[0]?.count || 0);
    const activatedUsers = Number(activationResult.rows[0]?.count || 0);
    const mrr = Number(mrrResult.rows[0]?.mrr || 0);
    const activeSubscriptions = Number(
      subscriptionsResult.rows[0]?.active || 0,
    );
    const trialSubscriptions = Number(subscriptionsResult.rows[0]?.trial || 0);
    const newConversions = Number(conversionsResult.rows[0]?.count || 0);

    // Retention calculations
    const d1CohortSize = Number(d1RetentionResult.rows[0]?.cohort_size || 0);
    const d1Returned = Number(d1RetentionResult.rows[0]?.returned || 0);
    const d1Retention =
      d1CohortSize > 0 ? (d1Returned / d1CohortSize) * 100 : 0;

    const d7CohortSize = Number(d7RetentionResult.rows[0]?.cohort_size || 0);
    const d7Returned = Number(d7RetentionResult.rows[0]?.returned || 0);
    const d7Retention =
      d7CohortSize > 0 ? (d7Returned / d7CohortSize) * 100 : 0;

    const d30CohortSize = Number(d30RetentionResult.rows[0]?.cohort_size || 0);
    const d30Returned = Number(d30RetentionResult.rows[0]?.returned || 0);
    const d30Retention =
      d30CohortSize > 0 ? (d30Returned / d30CohortSize) * 100 : 0;

    // Calculate derived metrics
    const stickiness = mau > 0 ? (dau / mau) * 100 : 0;
    const stickinessWauMau = mau > 0 ? (wau / mau) * 100 : 0;
    const activationRate = signups > 0 ? (activatedUsers / signups) * 100 : 0;
    const avgActiveDaysPerWeek = wau > 0 && dau > 0 ? (dau / wau) * 7 : 0;

    // Returning referrer breakdown
    const returningReferrerOrganic = Number(
      returningReferrerResult.rows[0]?.organic || 0,
    );
    const returningReferrerDirect = Number(
      returningReferrerResult.rows[0]?.direct || 0,
    );
    const returningReferrerInternal = Number(
      returningReferrerResult.rows[0]?.internal || 0,
    );

    // Grimoire to app conversion (users who saw grimoire AND used app)
    const grimoireToAppUsers = grimoireMau - grimoireOnlyMau;
    const grimoireToAppRate =
      grimoireMau > 0 ? (grimoireToAppUsers / grimoireMau) * 100 : 0;

    // Feature adoption rates (% of product MAU)
    const featureAdoption: Record<string, number> = {};
    for (const row of featureAdoptionResult.rows) {
      const eventType = String(row.event_type);
      const users = Number(row.users || 0);
      const adoptionRate = productMau > 0 ? (users / productMau) * 100 : 0;
      featureAdoption[eventType] = adoptionRate;
    }

    const computationDuration = Date.now() - startTime;

    // Insert or update daily_metrics
    await sql.query(
      `INSERT INTO daily_metrics (
        metric_date,
        dau, wau, mau,
        signed_in_product_dau, signed_in_product_wau, signed_in_product_mau,
        app_opened_dau, app_opened_wau, app_opened_mau,
        returning_dau, returning_wau, returning_mau,
        reach_dau, reach_wau, reach_mau,
        grimoire_dau, grimoire_wau, grimoire_mau, grimoire_only_mau,
        d1_retention, d7_retention, d30_retention,
        active_days_1, active_days_2_3, active_days_4_7, active_days_8_14, active_days_15_plus,
        stickiness_wau_mau, total_accounts,
        grimoire_to_app_rate, grimoire_to_app_users,
        new_signups, activated_users, activation_rate,
        mrr, active_subscriptions, trial_subscriptions, new_conversions,
        stickiness, avg_active_days_per_week,
        dashboard_adoption, horoscope_adoption, tarot_adoption,
        chart_adoption, guide_adoption, ritual_adoption,
        returning_referrer_organic, returning_referrer_direct, returning_referrer_internal,
        signed_in_product_returning_users,
        computed_at, computation_duration_ms
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
        $41, $42, $43, $44, $45, $46, $47, $48, $49, $50,
        $51, NOW(), $52
      )
      ON CONFLICT (metric_date)
      DO UPDATE SET
        dau = EXCLUDED.dau,
        wau = EXCLUDED.wau,
        mau = EXCLUDED.mau,
        signed_in_product_dau = EXCLUDED.signed_in_product_dau,
        signed_in_product_wau = EXCLUDED.signed_in_product_wau,
        signed_in_product_mau = EXCLUDED.signed_in_product_mau,
        app_opened_dau = EXCLUDED.app_opened_dau,
        app_opened_wau = EXCLUDED.app_opened_wau,
        app_opened_mau = EXCLUDED.app_opened_mau,
        returning_dau = EXCLUDED.returning_dau,
        returning_wau = EXCLUDED.returning_wau,
        returning_mau = EXCLUDED.returning_mau,
        reach_dau = EXCLUDED.reach_dau,
        reach_wau = EXCLUDED.reach_wau,
        reach_mau = EXCLUDED.reach_mau,
        grimoire_dau = EXCLUDED.grimoire_dau,
        grimoire_wau = EXCLUDED.grimoire_wau,
        grimoire_mau = EXCLUDED.grimoire_mau,
        grimoire_only_mau = EXCLUDED.grimoire_only_mau,
        d1_retention = EXCLUDED.d1_retention,
        d7_retention = EXCLUDED.d7_retention,
        d30_retention = EXCLUDED.d30_retention,
        active_days_1 = EXCLUDED.active_days_1,
        active_days_2_3 = EXCLUDED.active_days_2_3,
        active_days_4_7 = EXCLUDED.active_days_4_7,
        active_days_8_14 = EXCLUDED.active_days_8_14,
        active_days_15_plus = EXCLUDED.active_days_15_plus,
        stickiness_wau_mau = EXCLUDED.stickiness_wau_mau,
        total_accounts = EXCLUDED.total_accounts,
        grimoire_to_app_rate = EXCLUDED.grimoire_to_app_rate,
        grimoire_to_app_users = EXCLUDED.grimoire_to_app_users,
        new_signups = EXCLUDED.new_signups,
        activated_users = EXCLUDED.activated_users,
        activation_rate = EXCLUDED.activation_rate,
        mrr = EXCLUDED.mrr,
        active_subscriptions = EXCLUDED.active_subscriptions,
        trial_subscriptions = EXCLUDED.trial_subscriptions,
        new_conversions = EXCLUDED.new_conversions,
        stickiness = EXCLUDED.stickiness,
        avg_active_days_per_week = EXCLUDED.avg_active_days_per_week,
        dashboard_adoption = EXCLUDED.dashboard_adoption,
        horoscope_adoption = EXCLUDED.horoscope_adoption,
        tarot_adoption = EXCLUDED.tarot_adoption,
        chart_adoption = EXCLUDED.chart_adoption,
        guide_adoption = EXCLUDED.guide_adoption,
        ritual_adoption = EXCLUDED.ritual_adoption,
        returning_referrer_organic = EXCLUDED.returning_referrer_organic,
        returning_referrer_direct = EXCLUDED.returning_referrer_direct,
        returning_referrer_internal = EXCLUDED.returning_referrer_internal,
        signed_in_product_returning_users = EXCLUDED.signed_in_product_returning_users,
        computed_at = NOW(),
        computation_duration_ms = EXCLUDED.computation_duration_ms`,
      [
        dateStr, // $1
        dau, // $2
        wau, // $3
        mau, // $4
        productDau, // $5
        productWau, // $6
        productMau, // $7
        appOpenedDau, // $8
        appOpenedWau, // $9
        appMau, // $10
        returningDau, // $11
        returningWau, // $12
        returningMau, // $13
        reachDau, // $14
        reachWau, // $15
        reachMau, // $16
        grimoireDau, // $17
        grimoireWau, // $18
        grimoireMau, // $19
        grimoireOnlyMau, // $20
        d1Retention, // $21
        d7Retention, // $22
        d30Retention, // $23
        activeDays1, // $24
        activeDays2_3, // $25
        activeDays4_7, // $26
        activeDays8_14, // $27
        activeDays15Plus, // $28
        stickinessWauMau, // $29
        totalAccounts, // $30
        grimoireToAppRate, // $31
        grimoireToAppUsers, // $32
        signups, // $33
        activatedUsers, // $34
        activationRate, // $35
        mrr, // $36
        activeSubscriptions, // $37
        trialSubscriptions, // $38
        newConversions, // $39
        stickiness, // $40
        avgActiveDaysPerWeek, // $41
        featureAdoption['daily_dashboard_viewed'] || 0, // $42
        featureAdoption['personalized_horoscope_viewed'] || 0, // $43
        featureAdoption['tarot_drawn'] || 0, // $44
        featureAdoption['chart_viewed'] || 0, // $45
        featureAdoption['astral_chat_used'] || 0, // $46
        featureAdoption['ritual_completed'] || 0, // $47
        returningReferrerOrganic, // $48
        returningReferrerDirect, // $49
        returningReferrerInternal, // $50
        signedInProductReturningUsers, // $51
        computationDuration, // $52
      ],
    );

    console.log(
      `✅ Metrics computed for ${dateStr} in ${computationDuration}ms (identity_links: ${hasIdentityLinks})`,
    );

    return NextResponse.json({
      success: true,
      date: dateStr,
      identity_resolution: hasIdentityLinks,
      metrics: {
        dau,
        wau,
        mau,
        productDau,
        productWau,
        productMau,
        appOpenedDau,
        appOpenedWau,
        appOpenedMau: appMau,
        signups,
        activationRate,
        d1Retention,
        d7Retention,
        d30Retention,
        mrr,
        conversions: newConversions,
      },
      computationDuration,
    });
  } catch (error) {
    console.error('[cron/compute-metrics] Failed', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      },
      { status: 500 },
    );
  }
}
