import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

/**
 * Compute daily metrics and store in daily_metrics table
 * Runs via Vercel Cron once per day
 *
 * This endpoint computes expensive aggregations once and caches them,
 * reducing database costs by 99% for historical queries.
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

    // Execute all queries in parallel for speed
    const [
      dauResult,
      wauResult,
      mauResult,
      productDauResult,
      productWauResult,
      productMauResult,
      appMauResult,
      signupsResult,
      activationResult,
      mrrResult,
      subscriptionsResult,
      conversionsResult,
      featureAdoptionResult,
    ] = await Promise.all([
      // DAU - users active on target date
      sql.query(
        `SELECT COUNT(DISTINCT user_id) as count
         FROM conversion_events
         WHERE created_at >= $1 AND created_at <= $2
           AND user_id IS NOT NULL
           AND user_id NOT LIKE 'anon:%'
           AND (user_email IS NULL OR (user_email NOT LIKE $3 AND user_email != $4))`,
        [
          dayStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // WAU - users active in 7-day window ending on target date
      sql.query(
        `SELECT COUNT(DISTINCT user_id) as count
         FROM conversion_events
         WHERE created_at >= $1 AND created_at <= $2
           AND user_id IS NOT NULL
           AND user_id NOT LIKE 'anon:%'
           AND (user_email IS NULL OR (user_email NOT LIKE $3 AND user_email != $4))`,
        [
          wauStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // MAU - users active in 30-day window ending on target date
      sql.query(
        `SELECT COUNT(DISTINCT user_id) as count
         FROM conversion_events
         WHERE created_at >= $1 AND created_at <= $2
           AND user_id IS NOT NULL
           AND user_id NOT LIKE 'anon:%'
           AND (user_email IS NULL OR (user_email NOT LIKE $3 AND user_email != $4))`,
        [
          mauStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // Product DAU - signed-in users who used product features
      sql.query(
        `SELECT COUNT(DISTINCT user_id) as count
         FROM conversion_events
         WHERE created_at >= $1 AND created_at <= $2
           AND user_id IS NOT NULL
           AND user_id NOT LIKE 'anon:%'
           AND event_type NOT IN ('app_opened', 'page_viewed')
           AND (user_email IS NULL OR (user_email NOT LIKE $3 AND user_email != $4))`,
        [
          dayStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // Product WAU
      sql.query(
        `SELECT COUNT(DISTINCT user_id) as count
         FROM conversion_events
         WHERE created_at >= $1 AND created_at <= $2
           AND user_id IS NOT NULL
           AND user_id NOT LIKE 'anon:%'
           AND event_type NOT IN ('app_opened', 'page_viewed')
           AND (user_email IS NULL OR (user_email NOT LIKE $3 AND user_email != $4))`,
        [
          wauStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // Product MAU
      sql.query(
        `SELECT COUNT(DISTINCT user_id) as count
         FROM conversion_events
         WHERE created_at >= $1 AND created_at <= $2
           AND user_id IS NOT NULL
           AND user_id NOT LIKE 'anon:%'
           AND event_type NOT IN ('app_opened', 'page_viewed')
           AND (user_email IS NULL OR (user_email NOT LIKE $3 AND user_email != $4))`,
        [
          mauStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // App Opened MAU
      sql.query(
        `SELECT COUNT(DISTINCT user_id) as count
         FROM conversion_events
         WHERE created_at >= $1 AND created_at <= $2
           AND event_type = 'app_opened'
           AND user_id IS NOT NULL
           AND user_id NOT LIKE 'anon:%'
           AND (user_email IS NULL OR (user_email NOT LIKE $3 AND user_email != $4))`,
        [
          mauStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
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

      // Activated users (users who completed key action within 7 days of signup)
      sql.query(
        `SELECT COUNT(DISTINCT u.id) as count
         FROM "user" u
         INNER JOIN conversion_events ce ON ce.user_id = u.id
         WHERE u."createdAt" >= $1 AND u."createdAt" <= $2
           AND ce.event_type IN ('chart_viewed', 'personalized_horoscope_viewed', 'tarot_drawn')
           AND ce.created_at <= u."createdAt" + INTERVAL '7 days'
           AND (u.email IS NULL OR (u.email NOT LIKE $3 AND u.email != $4))`,
        [
          dayStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
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
        `SELECT COUNT(DISTINCT s."userId") as count
         FROM subscriptions s
         INNER JOIN "user" u ON u.id = s."userId"
         WHERE s."createdAt" >= $1 AND s."createdAt" <= $2
           AND (u.email IS NULL OR (u.email NOT LIKE $3 AND u.email != $4))`,
        [
          dayStart.toISOString(),
          dayEnd.toISOString(),
          TEST_EMAIL_PATTERN,
          TEST_EMAIL_EXACT,
        ],
      ),

      // Feature adoption (count users who used each feature in MAU window)
      sql.query(
        `SELECT
           event_type,
           COUNT(DISTINCT user_id) as users
         FROM conversion_events
         WHERE created_at >= $1 AND created_at <= $2
           AND user_id IS NOT NULL
           AND user_id NOT LIKE 'anon:%'
           AND event_type IN (
             'daily_dashboard_viewed',
             'personalized_horoscope_viewed',
             'tarot_drawn',
             'chart_viewed',
             'astral_chat_used',
             'ritual_started'
           )
           AND (user_email IS NULL OR (user_email NOT LIKE $3 AND user_email != $4))
         GROUP BY event_type`,
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
    const appMau = Number(appMauResult.rows[0]?.count || 0);
    const signups = Number(signupsResult.rows[0]?.count || 0);
    const activatedUsers = Number(activationResult.rows[0]?.count || 0);
    const mrr = Number(mrrResult.rows[0]?.mrr || 0);
    const activeSubscriptions = Number(
      subscriptionsResult.rows[0]?.active || 0,
    );
    const trialSubscriptions = Number(subscriptionsResult.rows[0]?.trial || 0);
    const newConversions = Number(conversionsResult.rows[0]?.count || 0);

    // Calculate derived metrics
    const stickiness = mau > 0 ? (dau / mau) * 100 : 0;
    const activationRate = signups > 0 ? (activatedUsers / signups) * 100 : 0;
    const avgActiveDaysPerWeek = wau > 0 && dau > 0 ? (dau / wau) * 7 : 0;

    // Feature adoption rates (% of MAU)
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
        app_opened_mau,
        new_signups, activated_users, activation_rate,
        mrr, active_subscriptions, trial_subscriptions, new_conversions,
        stickiness, avg_active_days_per_week,
        dashboard_adoption, horoscope_adoption, tarot_adoption,
        chart_adoption, guide_adoption, ritual_adoption,
        computed_at, computation_duration_ms
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, NOW(), $24
      )
      ON CONFLICT (metric_date)
      DO UPDATE SET
        dau = EXCLUDED.dau,
        wau = EXCLUDED.wau,
        mau = EXCLUDED.mau,
        signed_in_product_dau = EXCLUDED.signed_in_product_dau,
        signed_in_product_wau = EXCLUDED.signed_in_product_wau,
        signed_in_product_mau = EXCLUDED.signed_in_product_mau,
        app_opened_mau = EXCLUDED.app_opened_mau,
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
        computed_at = NOW(),
        computation_duration_ms = EXCLUDED.computation_duration_ms`,
      [
        dateStr,
        dau,
        wau,
        mau,
        productDau,
        productWau,
        productMau,
        appMau,
        signups,
        activatedUsers,
        activationRate,
        mrr,
        activeSubscriptions,
        trialSubscriptions,
        newConversions,
        stickiness,
        avgActiveDaysPerWeek,
        featureAdoption['daily_dashboard_viewed'] || 0,
        featureAdoption['personalized_horoscope_viewed'] || 0,
        featureAdoption['tarot_drawn'] || 0,
        featureAdoption['chart_viewed'] || 0,
        featureAdoption['astral_chat_used'] || 0,
        featureAdoption['ritual_started'] || 0,
        computationDuration,
      ],
    );

    console.log(
      `✅ Metrics computed for ${dateStr} in ${computationDuration}ms`,
    );

    return NextResponse.json({
      success: true,
      date: dateStr,
      metrics: {
        dau,
        wau,
        mau,
        productDau,
        productWau,
        productMau,
        signups,
        activationRate,
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
