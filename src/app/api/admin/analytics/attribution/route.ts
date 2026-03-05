import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Validate date format to prevent injection (YYYY-MM-DD only)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const safeStartDate =
      startDate && dateRegex.test(startDate) ? startDate : null;
    const safeEndDate = endDate && dateRegex.test(endDate) ? endDate : null;
    const hasDateRange = safeStartDate && safeEndDate;

    // Use parameterized queries to prevent SQL injection.
    // Each query variant is a separate tagged template (no string interpolation).
    const sourceBreakdown = hasDateRange
      ? await sql`
          SELECT ua.first_touch_source as source, COUNT(*) as user_count,
            ROUND(COUNT(*)::numeric / NULLIF(SUM(COUNT(*)) OVER (), 0) * 100, 1) as percentage
          FROM user_attribution ua
          WHERE COALESCE(ua.first_touch_at, ua.created_at) >= ${safeStartDate}::date
            AND COALESCE(ua.first_touch_at, ua.created_at) <= ${safeEndDate}::date + INTERVAL '1 day'
            AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = ua.user_id AND s.user_email LIKE ${TEST_EMAIL_PATTERN})
            AND NOT EXISTS (SELECT 1 FROM conversion_events ce WHERE ce.user_id = ua.user_id AND ce.user_email LIKE ${TEST_EMAIL_PATTERN})
          GROUP BY ua.first_touch_source ORDER BY user_count DESC`
      : await sql`
          SELECT ua.first_touch_source as source, COUNT(*) as user_count,
            ROUND(COUNT(*)::numeric / NULLIF(SUM(COUNT(*)) OVER (), 0) * 100, 1) as percentage
          FROM user_attribution ua
          WHERE COALESCE(ua.first_touch_at, ua.created_at) >= NOW() - INTERVAL '30 days'
            AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = ua.user_id AND s.user_email LIKE ${TEST_EMAIL_PATTERN})
            AND NOT EXISTS (SELECT 1 FROM conversion_events ce WHERE ce.user_id = ua.user_id AND ce.user_email LIKE ${TEST_EMAIL_PATTERN})
          GROUP BY ua.first_touch_source ORDER BY user_count DESC`;

    const mediumBreakdown = hasDateRange
      ? await sql`
          SELECT ua.first_touch_source as source, ua.first_touch_medium as medium, COUNT(*) as user_count
          FROM user_attribution ua
          WHERE COALESCE(ua.first_touch_at, ua.created_at) >= ${safeStartDate}::date
            AND COALESCE(ua.first_touch_at, ua.created_at) <= ${safeEndDate}::date + INTERVAL '1 day'
            AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = ua.user_id AND s.user_email LIKE ${TEST_EMAIL_PATTERN})
            AND NOT EXISTS (SELECT 1 FROM conversion_events ce WHERE ce.user_id = ua.user_id AND ce.user_email LIKE ${TEST_EMAIL_PATTERN})
          GROUP BY ua.first_touch_source, ua.first_touch_medium ORDER BY user_count DESC LIMIT 20`
      : await sql`
          SELECT ua.first_touch_source as source, ua.first_touch_medium as medium, COUNT(*) as user_count
          FROM user_attribution ua
          WHERE COALESCE(ua.first_touch_at, ua.created_at) >= NOW() - INTERVAL '30 days'
            AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = ua.user_id AND s.user_email LIKE ${TEST_EMAIL_PATTERN})
            AND NOT EXISTS (SELECT 1 FROM conversion_events ce WHERE ce.user_id = ua.user_id AND ce.user_email LIKE ${TEST_EMAIL_PATTERN})
          GROUP BY ua.first_touch_source, ua.first_touch_medium ORDER BY user_count DESC LIMIT 20`;

    const topLandingPages = hasDateRange
      ? await sql`
          SELECT ua.first_touch_page as page, ua.first_touch_source as source, COUNT(*) as user_count
          FROM user_attribution ua
          WHERE COALESCE(ua.first_touch_at, ua.created_at) >= ${safeStartDate}::date
            AND COALESCE(ua.first_touch_at, ua.created_at) <= ${safeEndDate}::date + INTERVAL '1 day'
            AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = ua.user_id AND s.user_email LIKE ${TEST_EMAIL_PATTERN})
            AND NOT EXISTS (SELECT 1 FROM conversion_events ce WHERE ce.user_id = ua.user_id AND ce.user_email LIKE ${TEST_EMAIL_PATTERN})
          GROUP BY ua.first_touch_page, ua.first_touch_source ORDER BY user_count DESC LIMIT 20`
      : await sql`
          SELECT ua.first_touch_page as page, ua.first_touch_source as source, COUNT(*) as user_count
          FROM user_attribution ua
          WHERE COALESCE(ua.first_touch_at, ua.created_at) >= NOW() - INTERVAL '30 days'
            AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = ua.user_id AND s.user_email LIKE ${TEST_EMAIL_PATTERN})
            AND NOT EXISTS (SELECT 1 FROM conversion_events ce WHERE ce.user_id = ua.user_id AND ce.user_email LIKE ${TEST_EMAIL_PATTERN})
          GROUP BY ua.first_touch_page, ua.first_touch_source ORDER BY user_count DESC LIMIT 20`;

    const keywordBreakdown = hasDateRange
      ? await sql`
          SELECT ua.first_touch_keyword as keyword, COUNT(*) as user_count
          FROM user_attribution ua
          WHERE COALESCE(ua.first_touch_at, ua.created_at) >= ${safeStartDate}::date
            AND COALESCE(ua.first_touch_at, ua.created_at) <= ${safeEndDate}::date + INTERVAL '1 day'
            AND ua.first_touch_keyword IS NOT NULL
            AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = ua.user_id AND s.user_email LIKE ${TEST_EMAIL_PATTERN})
            AND NOT EXISTS (SELECT 1 FROM conversion_events ce WHERE ce.user_id = ua.user_id AND ce.user_email LIKE ${TEST_EMAIL_PATTERN})
          GROUP BY ua.first_touch_keyword ORDER BY user_count DESC LIMIT 20`
      : await sql`
          SELECT ua.first_touch_keyword as keyword, COUNT(*) as user_count
          FROM user_attribution ua
          WHERE COALESCE(ua.first_touch_at, ua.created_at) >= NOW() - INTERVAL '30 days'
            AND ua.first_touch_keyword IS NOT NULL
            AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = ua.user_id AND s.user_email LIKE ${TEST_EMAIL_PATTERN})
            AND NOT EXISTS (SELECT 1 FROM conversion_events ce WHERE ce.user_id = ua.user_id AND ce.user_email LIKE ${TEST_EMAIL_PATTERN})
          GROUP BY ua.first_touch_keyword ORDER BY user_count DESC LIMIT 20`;

    const dailyTrend = hasDateRange
      ? await sql`
          SELECT DATE(ua.created_at) as date, ua.first_touch_source as source, COUNT(*) as user_count
          FROM user_attribution ua
          WHERE COALESCE(ua.first_touch_at, ua.created_at) >= ${safeStartDate}::date
            AND COALESCE(ua.first_touch_at, ua.created_at) <= ${safeEndDate}::date + INTERVAL '1 day'
            AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = ua.user_id AND s.user_email LIKE ${TEST_EMAIL_PATTERN})
            AND NOT EXISTS (SELECT 1 FROM conversion_events ce WHERE ce.user_id = ua.user_id AND ce.user_email LIKE ${TEST_EMAIL_PATTERN})
          GROUP BY DATE(ua.created_at), ua.first_touch_source ORDER BY date DESC, user_count DESC`
      : await sql`
          SELECT DATE(ua.created_at) as date, ua.first_touch_source as source, COUNT(*) as user_count
          FROM user_attribution ua
          WHERE COALESCE(ua.first_touch_at, ua.created_at) >= NOW() - INTERVAL '30 days'
            AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = ua.user_id AND s.user_email LIKE ${TEST_EMAIL_PATTERN})
            AND NOT EXISTS (SELECT 1 FROM conversion_events ce WHERE ce.user_id = ua.user_id AND ce.user_email LIKE ${TEST_EMAIL_PATTERN})
          GROUP BY DATE(ua.created_at), ua.first_touch_source ORDER BY date DESC, user_count DESC`;

    const organicStats = hasDateRange
      ? await sql`
          SELECT COUNT(*) FILTER (WHERE ua.first_touch_source = 'seo') as organic_users,
            COUNT(*) as total_users,
            ROUND(COUNT(*) FILTER (WHERE ua.first_touch_source = 'seo')::numeric / NULLIF(COUNT(*), 0) * 100, 1) as organic_percentage
          FROM user_attribution ua
          WHERE COALESCE(ua.first_touch_at, ua.created_at) >= ${safeStartDate}::date
            AND COALESCE(ua.first_touch_at, ua.created_at) <= ${safeEndDate}::date + INTERVAL '1 day'
            AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = ua.user_id AND s.user_email LIKE ${TEST_EMAIL_PATTERN})
            AND NOT EXISTS (SELECT 1 FROM conversion_events ce WHERE ce.user_id = ua.user_id AND ce.user_email LIKE ${TEST_EMAIL_PATTERN})`
      : await sql`
          SELECT COUNT(*) FILTER (WHERE ua.first_touch_source = 'seo') as organic_users,
            COUNT(*) as total_users,
            ROUND(COUNT(*) FILTER (WHERE ua.first_touch_source = 'seo')::numeric / NULLIF(COUNT(*), 0) * 100, 1) as organic_percentage
          FROM user_attribution ua
          WHERE COALESCE(ua.first_touch_at, ua.created_at) >= NOW() - INTERVAL '30 days'
            AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = ua.user_id AND s.user_email LIKE ${TEST_EMAIL_PATTERN})
            AND NOT EXISTS (SELECT 1 FROM conversion_events ce WHERE ce.user_id = ua.user_id AND ce.user_email LIKE ${TEST_EMAIL_PATTERN})`;

    const conversionBySource = hasDateRange
      ? await sql`
          SELECT ua.first_touch_source as source, COUNT(DISTINCT ua.user_id) as total_users,
            COUNT(DISTINCT s.user_id) as paying_users,
            ROUND(COUNT(DISTINCT s.user_id)::numeric / NULLIF(COUNT(DISTINCT ua.user_id), 0) * 100, 1) as conversion_rate
          FROM user_attribution ua
          LEFT JOIN subscriptions s ON ua.user_id = s.user_id AND s.status = 'active'
          WHERE COALESCE(ua.first_touch_at, ua.created_at) >= ${safeStartDate}::date
            AND COALESCE(ua.first_touch_at, ua.created_at) <= ${safeEndDate}::date + INTERVAL '1 day'
            AND NOT EXISTS (SELECT 1 FROM subscriptions s2 WHERE s2.user_id = ua.user_id AND s2.user_email LIKE ${TEST_EMAIL_PATTERN})
            AND NOT EXISTS (SELECT 1 FROM conversion_events ce WHERE ce.user_id = ua.user_id AND ce.user_email LIKE ${TEST_EMAIL_PATTERN})
          GROUP BY ua.first_touch_source ORDER BY total_users DESC`
      : await sql`
          SELECT ua.first_touch_source as source, COUNT(DISTINCT ua.user_id) as total_users,
            COUNT(DISTINCT s.user_id) as paying_users,
            ROUND(COUNT(DISTINCT s.user_id)::numeric / NULLIF(COUNT(DISTINCT ua.user_id), 0) * 100, 1) as conversion_rate
          FROM user_attribution ua
          LEFT JOIN subscriptions s ON ua.user_id = s.user_id AND s.status = 'active'
          WHERE COALESCE(ua.first_touch_at, ua.created_at) >= NOW() - INTERVAL '30 days'
            AND NOT EXISTS (SELECT 1 FROM subscriptions s2 WHERE s2.user_id = ua.user_id AND s2.user_email LIKE ${TEST_EMAIL_PATTERN})
            AND NOT EXISTS (SELECT 1 FROM conversion_events ce WHERE ce.user_id = ua.user_id AND ce.user_email LIKE ${TEST_EMAIL_PATTERN})
          GROUP BY ua.first_touch_source ORDER BY total_users DESC`;

    // Postgres ROUND() and COUNT() return numeric/bigint as strings via
    // @vercel/postgres. Coerce to JS numbers so the UI can type-check them.
    const coerceRows = (rows: Record<string, unknown>[]) =>
      rows.map((row) => {
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(row)) {
          out[k] =
            typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v;
        }
        return out;
      });

    const response = NextResponse.json({
      summary: {
        totalUsers: Number(organicStats.rows[0]?.total_users || 0),
        organicUsers: Number(organicStats.rows[0]?.organic_users || 0),
        organicPercentage: Number(
          organicStats.rows[0]?.organic_percentage || 0,
        ),
      },
      sourceBreakdown: coerceRows(sourceBreakdown.rows),
      mediumBreakdown: coerceRows(mediumBreakdown.rows),
      topLandingPages: coerceRows(topLandingPages.rows),
      keywordBreakdown: coerceRows(keywordBreakdown.rows),
      dailyTrend: coerceRows(dailyTrend.rows),
      conversionBySource: coerceRows(conversionBySource.rows),
    });
    response.headers.set(
      'Cache-Control',
      `private, max-age=${ANALYTICS_CACHE_TTL_SECONDS}`,
    );
    return response;
  } catch (error) {
    console.error('Attribution analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attribution analytics' },
      { status: 500 },
    );
  }
}
