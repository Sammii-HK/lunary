import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    const dateFilter =
      startDate && endDate
        ? `WHERE created_at >= '${startDate}'::date AND created_at <= '${endDate}'::date + INTERVAL '1 day'`
        : "WHERE created_at >= NOW() - INTERVAL '30 days'";

    const sourceBreakdown = await sql.query(`
      SELECT 
        first_touch_source as source,
        COUNT(*) as user_count,
        ROUND(COUNT(*)::numeric / NULLIF(SUM(COUNT(*)) OVER (), 0) * 100, 1) as percentage
      FROM user_attribution
      ${dateFilter}
      GROUP BY first_touch_source
      ORDER BY user_count DESC
    `);

    const mediumBreakdown = await sql.query(`
      SELECT 
        first_touch_source as source,
        first_touch_medium as medium,
        COUNT(*) as user_count
      FROM user_attribution
      ${dateFilter}
      GROUP BY first_touch_source, first_touch_medium
      ORDER BY user_count DESC
      LIMIT 20
    `);

    const topLandingPages = await sql.query(`
      SELECT 
        first_touch_page as page,
        first_touch_source as source,
        COUNT(*) as user_count
      FROM user_attribution
      ${dateFilter}
      GROUP BY first_touch_page, first_touch_source
      ORDER BY user_count DESC
      LIMIT 20
    `);

    const keywordBreakdown = await sql.query(`
      SELECT 
        first_touch_keyword as keyword,
        COUNT(*) as user_count
      FROM user_attribution
      ${dateFilter}
      AND first_touch_keyword IS NOT NULL
      GROUP BY first_touch_keyword
      ORDER BY user_count DESC
      LIMIT 20
    `);

    const dailyTrend = await sql.query(`
      SELECT 
        DATE(created_at) as date,
        first_touch_source as source,
        COUNT(*) as user_count
      FROM user_attribution
      ${dateFilter}
      GROUP BY DATE(created_at), first_touch_source
      ORDER BY date DESC, user_count DESC
    `);

    const organicStats = await sql.query(`
      SELECT 
        COUNT(*) FILTER (WHERE first_touch_source = 'seo') as organic_users,
        COUNT(*) as total_users,
        ROUND(
          COUNT(*) FILTER (WHERE first_touch_source = 'seo')::numeric / 
          NULLIF(COUNT(*), 0) * 100, 
          1
        ) as organic_percentage
      FROM user_attribution
      ${dateFilter}
    `);

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
      ${dateFilter.replace('WHERE', 'WHERE ua.')}
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
