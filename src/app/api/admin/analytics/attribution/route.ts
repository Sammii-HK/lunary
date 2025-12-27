import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Filter test users by joining with conversion_events or subscriptions
    const testUserFilter = `
      AND NOT EXISTS (
        SELECT 1 FROM subscriptions s
        WHERE s.user_id = ua.user_id
          AND (s.user_email LIKE '${TEST_EMAIL_PATTERN}' OR s.user_email = '${TEST_EMAIL_EXACT}')
      )
      AND NOT EXISTS (
        SELECT 1 FROM conversion_events ce
        WHERE ce.user_id = ua.user_id
          AND (ce.user_email LIKE '${TEST_EMAIL_PATTERN}' OR ce.user_email = '${TEST_EMAIL_EXACT}')
      )
    `;

    const dateFilter =
      startDate && endDate
        ? `WHERE ua.created_at >= '${startDate}'::date AND ua.created_at <= '${endDate}'::date + INTERVAL '1 day'`
        : "WHERE ua.created_at >= NOW() - INTERVAL '30 days'";

    const sourceBreakdown = await sql.query(`
      SELECT 
        ua.first_touch_source as source,
        COUNT(*) as user_count,
        ROUND(COUNT(*)::numeric / NULLIF(SUM(COUNT(*)) OVER (), 0) * 100, 1) as percentage
      FROM user_attribution ua
      ${dateFilter}
      ${testUserFilter}
      GROUP BY ua.first_touch_source
      ORDER BY user_count DESC
    `);

    const mediumBreakdown = await sql.query(`
      SELECT 
        ua.first_touch_source as source,
        ua.first_touch_medium as medium,
        COUNT(*) as user_count
      FROM user_attribution ua
      ${dateFilter}
      ${testUserFilter}
      GROUP BY ua.first_touch_source, ua.first_touch_medium
      ORDER BY user_count DESC
      LIMIT 20
    `);

    const topLandingPages = await sql.query(`
      SELECT 
        ua.first_touch_page as page,
        ua.first_touch_source as source,
        COUNT(*) as user_count
      FROM user_attribution ua
      ${dateFilter}
      ${testUserFilter}
      GROUP BY ua.first_touch_page, ua.first_touch_source
      ORDER BY user_count DESC
      LIMIT 20
    `);

    const keywordBreakdown = await sql.query(`
      SELECT 
        ua.first_touch_keyword as keyword,
        COUNT(*) as user_count
      FROM user_attribution ua
      ${dateFilter}
      ${testUserFilter}
      AND ua.first_touch_keyword IS NOT NULL
      GROUP BY ua.first_touch_keyword
      ORDER BY user_count DESC
      LIMIT 20
    `);

    const dailyTrend = await sql.query(`
      SELECT 
        DATE(ua.created_at) as date,
        ua.first_touch_source as source,
        COUNT(*) as user_count
      FROM user_attribution ua
      ${dateFilter}
      ${testUserFilter}
      GROUP BY DATE(ua.created_at), ua.first_touch_source
      ORDER BY date DESC, user_count DESC
    `);

    const organicStats = await sql.query(`
      SELECT 
        COUNT(*) FILTER (WHERE ua.first_touch_source = 'seo') as organic_users,
        COUNT(*) as total_users,
        ROUND(
          COUNT(*) FILTER (WHERE ua.first_touch_source = 'seo')::numeric / 
          NULLIF(COUNT(*), 0) * 100, 
          1
        ) as organic_percentage
      FROM user_attribution ua
      ${dateFilter}
      ${testUserFilter}
    `);

    // Fix ambiguous column reference by properly qualifying created_at
    const conversionDateFilter =
      startDate && endDate
        ? `WHERE ua.created_at >= '${startDate}'::date AND ua.created_at <= '${endDate}'::date + INTERVAL '1 day'`
        : "WHERE ua.created_at >= NOW() - INTERVAL '30 days'";

    const conversionBySource = await sql.query(`
      SELECT 
        ua.first_touch_source as source,
        COUNT(DISTINCT ua.user_id) as total_users,
        COUNT(DISTINCT s.user_id) as paying_users,
        ROUND(
          COUNT(DISTINCT s.user_id)::numeric / 
          NULLIF(COUNT(DISTINCT ua.user_id), 0) * 100, 
          1
        ) as conversion_rate
      FROM user_attribution ua
      LEFT JOIN subscriptions s ON ua.user_id = s.user_id AND s.status = 'active'
      ${conversionDateFilter}
      ${testUserFilter}
      GROUP BY ua.first_touch_source
      ORDER BY total_users DESC
    `);

    return NextResponse.json({
      summary: {
        totalUsers: organicStats.rows[0]?.total_users || 0,
        organicUsers: organicStats.rows[0]?.organic_users || 0,
        organicPercentage: organicStats.rows[0]?.organic_percentage || 0,
      },
      sourceBreakdown: sourceBreakdown.rows,
      mediumBreakdown: mediumBreakdown.rows,
      topLandingPages: topLandingPages.rows,
      keywordBreakdown: keywordBreakdown.rows,
      dailyTrend: dailyTrend.rows,
      conversionBySource: conversionBySource.rows,
    });
  } catch (error) {
    console.error('Attribution analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attribution analytics' },
      { status: 500 },
    );
  }
}
