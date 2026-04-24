import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const safeStartDate =
      startDate && dateRegex.test(startDate) ? startDate : null;
    const safeEndDate = endDate && dateRegex.test(endDate) ? endDate : null;
    const hasDateRange = safeStartDate && safeEndDate;

    // Revenue-by-source: joins user_attribution to subscriptions to get
    // real Stripe-backed MRR per first-touch source. Filters out beta
    // comps (discount_percent=100 or is_paying=false) and test users.
    const revenueBySource = hasDateRange
      ? await sql`
          SELECT
            COALESCE(ua.first_touch_source, 'direct') as source,
            COUNT(DISTINCT s.user_id) as paying_users,
            COALESCE(SUM(s.monthly_amount_due), 0)::numeric as mrr_gbp,
            COALESCE(AVG(s.monthly_amount_due), 0)::numeric as avg_arpu_gbp
          FROM subscriptions s
          INNER JOIN user_attribution ua ON ua.user_id = s.user_id
          WHERE s.is_paying = true
            AND (s.discount_percent IS NULL OR s.discount_percent < 100)
            AND s.user_email NOT LIKE ${TEST_EMAIL_PATTERN}
            AND COALESCE(ua.first_touch_at, ua.created_at) >= ${safeStartDate}::date
            AND COALESCE(ua.first_touch_at, ua.created_at) <= ${safeEndDate}::date + INTERVAL '1 day'
          GROUP BY COALESCE(ua.first_touch_source, 'direct')
          ORDER BY mrr_gbp DESC`
      : await sql`
          SELECT
            COALESCE(ua.first_touch_source, 'direct') as source,
            COUNT(DISTINCT s.user_id) as paying_users,
            COALESCE(SUM(s.monthly_amount_due), 0)::numeric as mrr_gbp,
            COALESCE(AVG(s.monthly_amount_due), 0)::numeric as avg_arpu_gbp
          FROM subscriptions s
          INNER JOIN user_attribution ua ON ua.user_id = s.user_id
          WHERE s.is_paying = true
            AND (s.discount_percent IS NULL OR s.discount_percent < 100)
            AND s.user_email NOT LIKE ${TEST_EMAIL_PATTERN}
            AND COALESCE(ua.first_touch_at, ua.created_at) >= NOW() - INTERVAL '90 days'
          GROUP BY COALESCE(ua.first_touch_source, 'direct')
          ORDER BY mrr_gbp DESC`;

    // Revenue-by-source+medium for UTM-level breakdown
    const revenueBySourceMedium = hasDateRange
      ? await sql`
          SELECT
            COALESCE(ua.first_touch_source, 'direct') as source,
            COALESCE(ua.first_touch_medium, 'unknown') as medium,
            COUNT(DISTINCT s.user_id) as paying_users,
            COALESCE(SUM(s.monthly_amount_due), 0)::numeric as mrr_gbp
          FROM subscriptions s
          INNER JOIN user_attribution ua ON ua.user_id = s.user_id
          WHERE s.is_paying = true
            AND (s.discount_percent IS NULL OR s.discount_percent < 100)
            AND s.user_email NOT LIKE ${TEST_EMAIL_PATTERN}
            AND COALESCE(ua.first_touch_at, ua.created_at) >= ${safeStartDate}::date
            AND COALESCE(ua.first_touch_at, ua.created_at) <= ${safeEndDate}::date + INTERVAL '1 day'
          GROUP BY COALESCE(ua.first_touch_source, 'direct'), COALESCE(ua.first_touch_medium, 'unknown')
          ORDER BY mrr_gbp DESC LIMIT 30`
      : await sql`
          SELECT
            COALESCE(ua.first_touch_source, 'direct') as source,
            COALESCE(ua.first_touch_medium, 'unknown') as medium,
            COUNT(DISTINCT s.user_id) as paying_users,
            COALESCE(SUM(s.monthly_amount_due), 0)::numeric as mrr_gbp
          FROM subscriptions s
          INNER JOIN user_attribution ua ON ua.user_id = s.user_id
          WHERE s.is_paying = true
            AND (s.discount_percent IS NULL OR s.discount_percent < 100)
            AND s.user_email NOT LIKE ${TEST_EMAIL_PATTERN}
            AND COALESCE(ua.first_touch_at, ua.created_at) >= NOW() - INTERVAL '90 days'
          GROUP BY COALESCE(ua.first_touch_source, 'direct'), COALESCE(ua.first_touch_medium, 'unknown')
          ORDER BY mrr_gbp DESC LIMIT 30`;

    // Signup → paying conversion rate per source (for CAC / funnel work)
    const conversionBySource = hasDateRange
      ? await sql`
          SELECT
            COALESCE(ua.first_touch_source, 'direct') as source,
            COUNT(DISTINCT ua.user_id) as signups,
            COUNT(DISTINCT CASE
              WHEN s.is_paying = true
                AND (s.discount_percent IS NULL OR s.discount_percent < 100)
              THEN s.user_id END) as paying_users,
            ROUND(
              COUNT(DISTINCT CASE
                WHEN s.is_paying = true
                  AND (s.discount_percent IS NULL OR s.discount_percent < 100)
                THEN s.user_id END)::numeric
              / NULLIF(COUNT(DISTINCT ua.user_id), 0) * 100,
            2) as conversion_pct
          FROM user_attribution ua
          LEFT JOIN subscriptions s ON s.user_id = ua.user_id
            AND s.user_email NOT LIKE ${TEST_EMAIL_PATTERN}
          WHERE COALESCE(ua.first_touch_at, ua.created_at) >= ${safeStartDate}::date
            AND COALESCE(ua.first_touch_at, ua.created_at) <= ${safeEndDate}::date + INTERVAL '1 day'
          GROUP BY COALESCE(ua.first_touch_source, 'direct')
          HAVING COUNT(DISTINCT ua.user_id) > 0
          ORDER BY paying_users DESC`
      : await sql`
          SELECT
            COALESCE(ua.first_touch_source, 'direct') as source,
            COUNT(DISTINCT ua.user_id) as signups,
            COUNT(DISTINCT CASE
              WHEN s.is_paying = true
                AND (s.discount_percent IS NULL OR s.discount_percent < 100)
              THEN s.user_id END) as paying_users,
            ROUND(
              COUNT(DISTINCT CASE
                WHEN s.is_paying = true
                  AND (s.discount_percent IS NULL OR s.discount_percent < 100)
                THEN s.user_id END)::numeric
              / NULLIF(COUNT(DISTINCT ua.user_id), 0) * 100,
            2) as conversion_pct
          FROM user_attribution ua
          LEFT JOIN subscriptions s ON s.user_id = ua.user_id
            AND s.user_email NOT LIKE ${TEST_EMAIL_PATTERN}
          WHERE COALESCE(ua.first_touch_at, ua.created_at) >= NOW() - INTERVAL '90 days'
          GROUP BY COALESCE(ua.first_touch_source, 'direct')
          HAVING COUNT(DISTINCT ua.user_id) > 0
          ORDER BY paying_users DESC`;

    const totalMrrGbp = revenueBySource.rows.reduce(
      (sum, r) => sum + Number(r.mrr_gbp ?? 0),
      0,
    );
    const totalPayingUsers = revenueBySource.rows.reduce(
      (sum, r) => sum + Number(r.paying_users ?? 0),
      0,
    );

    return NextResponse.json(
      {
        range: hasDateRange
          ? { start: safeStartDate, end: safeEndDate }
          : { start: null, end: null, label: 'last-90-days' },
        totals: {
          mrr_gbp: Number(totalMrrGbp.toFixed(2)),
          paying_users: totalPayingUsers,
        },
        by_source: revenueBySource.rows.map((r) => ({
          source: r.source,
          paying_users: Number(r.paying_users ?? 0),
          mrr_gbp: Number(Number(r.mrr_gbp ?? 0).toFixed(2)),
          avg_arpu_gbp: Number(Number(r.avg_arpu_gbp ?? 0).toFixed(2)),
        })),
        by_source_medium: revenueBySourceMedium.rows.map((r) => ({
          source: r.source,
          medium: r.medium,
          paying_users: Number(r.paying_users ?? 0),
          mrr_gbp: Number(Number(r.mrr_gbp ?? 0).toFixed(2)),
        })),
        signup_to_paid_by_source: conversionBySource.rows.map((r) => ({
          source: r.source,
          signups: Number(r.signups ?? 0),
          paying_users: Number(r.paying_users ?? 0),
          conversion_pct: Number(r.conversion_pct ?? 0),
        })),
      },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${ANALYTICS_CACHE_TTL_SECONDS}, stale-while-revalidate=${ANALYTICS_CACHE_TTL_SECONDS * 2}`,
        },
      },
    );
  } catch (error) {
    console.error('[revenue-by-attribution] error:', error);
    return NextResponse.json(
      { error: 'Failed to compute revenue-by-attribution' },
      { status: 500 },
    );
  }
}
