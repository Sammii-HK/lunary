import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

import {
  formatDate,
  formatTimestamp,
  resolveDateRange,
} from '@/lib/analytics/date-range';
import { grimoire, grimoireItems } from '@/constants/grimoire';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    const endDate = formatDate(range.end);
    const startDate = formatDate(range.start);

    // 1. Daily Active Users (current day)
    const dauResult = await sql`
      SELECT COUNT(DISTINCT user_id) AS value
      FROM analytics_user_activity
      WHERE activity_type = 'session'
        AND activity_date = ${endDate}
    `;
    const dau = Number(dauResult.rows[0]?.value || 0);

    // 2. Daily Active Users - previous period for trend
    const prevEndDate = new Date(range.end);
    prevEndDate.setDate(prevEndDate.getDate() - 1);
    const prevDauResult = await sql`
      SELECT COUNT(DISTINCT user_id) AS value
      FROM analytics_user_activity
      WHERE activity_type = 'session'
        AND activity_date = ${formatDate(prevEndDate)}
    `;
    const prevDau = Number(prevDauResult.rows[0]?.value || 0);
    const dauTrend = dau > prevDau ? 'up' : dau < prevDau ? 'down' : 'stable';
    const dauChange = prevDau > 0 ? ((dau - prevDau) / prevDau) * 100 : 0;

    // 3. Weekly Returning Users (users active in last 7 days who were also active before)
    const wauResult = await sql`
      SELECT COUNT(DISTINCT a.user_id) AS value
      FROM analytics_user_activity a
      WHERE a.activity_type = 'session'
        AND a.activity_date BETWEEN (${endDate}::date - INTERVAL '6 days') AND ${endDate}
        AND EXISTS (
          SELECT 1
          FROM analytics_user_activity b
          WHERE b.user_id = a.user_id
            AND b.activity_type = 'session'
            AND b.activity_date < (${endDate}::date - INTERVAL '6 days')
        )
    `;
    const weeklyReturning = Number(wauResult.rows[0]?.value || 0);

    // Previous week for trend
    const prevWeekEnd = new Date(range.end);
    prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);
    const prevWeeklyReturningResult = await sql`
      SELECT COUNT(DISTINCT a.user_id) AS value
      FROM analytics_user_activity a
      WHERE a.activity_type = 'session'
        AND a.activity_date BETWEEN (${formatDate(prevWeekEnd)}::date - INTERVAL '6 days') AND ${formatDate(prevWeekEnd)}
        AND EXISTS (
          SELECT 1
          FROM analytics_user_activity b
          WHERE b.user_id = a.user_id
            AND b.activity_type = 'session'
            AND b.activity_date < (${formatDate(prevWeekEnd)}::date - INTERVAL '6 days')
        )
    `;
    const prevWeeklyReturning = Number(
      prevWeeklyReturningResult.rows[0]?.value || 0,
    );
    const weeklyReturningTrend =
      weeklyReturning > prevWeeklyReturning
        ? 'up'
        : weeklyReturning < prevWeeklyReturning
          ? 'down'
          : 'stable';
    const weeklyReturningChange =
      prevWeeklyReturning > 0
        ? ((weeklyReturning - prevWeeklyReturning) / prevWeeklyReturning) * 100
        : 0;

    // 4. Conversion Rate
    const freeUsersResult = await sql`
      SELECT COUNT(DISTINCT user_id) AS count
      FROM analytics_user_activity
      WHERE activity_type = 'session'
        AND activity_date BETWEEN ${startDate} AND ${endDate}
    `;
    const freeUsers = Number(freeUsersResult.rows[0]?.count || 0);

    const conversionsResult = await sql`
      SELECT COUNT(*) AS total_conversions
      FROM analytics_conversions
      WHERE created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(range.end)}
    `;
    const totalConversions = Number(
      conversionsResult.rows[0]?.total_conversions || 0,
    );
    const conversionRate =
      freeUsers > 0 ? (totalConversions / freeUsers) * 100 : 0;

    // Previous period conversion rate for trend
    const prevRangeStart = new Date(range.start);
    const prevRangeEnd = new Date(range.end);
    const periodDays = Math.ceil(
      (range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24),
    );
    prevRangeStart.setDate(prevRangeStart.getDate() - periodDays);
    prevRangeEnd.setDate(prevRangeEnd.getDate() - periodDays);

    const prevFreeUsersResult = await sql`
      SELECT COUNT(DISTINCT user_id) AS count
      FROM analytics_user_activity
      WHERE activity_type = 'session'
        AND activity_date BETWEEN ${formatDate(prevRangeStart)} AND ${formatDate(prevRangeEnd)}
    `;
    const prevFreeUsers = Number(prevFreeUsersResult.rows[0]?.count || 0);

    const prevConversionsResult = await sql`
      SELECT COUNT(*) AS total_conversions
      FROM analytics_conversions
      WHERE created_at BETWEEN ${formatTimestamp(prevRangeStart)} AND ${formatTimestamp(prevRangeEnd)}
    `;
    const prevTotalConversions = Number(
      prevConversionsResult.rows[0]?.total_conversions || 0,
    );
    const prevConversionRate =
      prevFreeUsers > 0 ? (prevTotalConversions / prevFreeUsers) * 100 : 0;
    const conversionTrend =
      conversionRate > prevConversionRate
        ? 'up'
        : conversionRate < prevConversionRate
          ? 'down'
          : 'stable';
    const conversionChange =
      prevConversionRate > 0
        ? ((conversionRate - prevConversionRate) / prevConversionRate) * 100
        : 0;

    // 5. Search Impressions & Clicks (placeholder - would need Google Search Console API)
    // For now, return placeholder values
    const searchImpressions = 0;
    const searchClicks = 0;
    const searchCtr = 0;
    const searchTrend = 'stable' as const;
    const searchChange = 0;

    // 6. Grimoire Articles Indexed
    // Count from sitemap - grimoire sections + individual items
    const grimoireSections = grimoireItems.length;
    // Estimate total articles (sections + subsections)
    let totalGrimoireArticles = grimoireSections;
    Object.values(grimoire).forEach((section: any) => {
      if (section.contents) {
        totalGrimoireArticles += section.contents.length;
      }
    });
    // This is static, so no trend needed
    const grimoireTrend = 'stable' as const;
    const grimoireChange = 0;

    // 7. AI Chat Messages
    const aiMessagesResult = await sql`
      SELECT
        COALESCE(SUM(message_count), 0) AS total_messages
      FROM analytics_ai_usage
      WHERE created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(range.end)}
    `;
    const aiMessages = Number(aiMessagesResult.rows[0]?.total_messages || 0);

    // Previous period for trend
    const prevAiMessagesResult = await sql`
      SELECT
        COALESCE(SUM(message_count), 0) AS total_messages
      FROM analytics_ai_usage
      WHERE created_at BETWEEN ${formatTimestamp(prevRangeStart)} AND ${formatTimestamp(prevRangeEnd)}
    `;
    const prevAiMessages = Number(
      prevAiMessagesResult.rows[0]?.total_messages || 0,
    );
    const aiMessagesTrend =
      aiMessages > prevAiMessages
        ? 'up'
        : aiMessages < prevAiMessages
          ? 'down'
          : 'stable';
    const aiMessagesChange =
      prevAiMessages > 0
        ? ((aiMessages - prevAiMessages) / prevAiMessages) * 100
        : 0;

    // 8. Substack Subscribers (using push subscriptions as proxy)
    const substackSubscribersResult = await sql`
      SELECT COUNT(*) AS count
      FROM push_subscriptions
      WHERE is_active = true
    `;
    const substackSubscribers = Number(
      substackSubscribersResult.rows[0]?.count || 0,
    );

    // Previous period for trend
    const prevSubstackSubscribersResult = await sql`
      SELECT COUNT(*) AS count
      FROM push_subscriptions
      WHERE is_active = true
        AND created_at < ${formatTimestamp(prevRangeEnd)}
    `;
    const prevSubstackSubscribers = Number(
      prevSubstackSubscribersResult.rows[0]?.count || 0,
    );
    const substackTrend =
      substackSubscribers > prevSubstackSubscribers
        ? 'up'
        : substackSubscribers < prevSubstackSubscribers
          ? 'down'
          : 'stable';
    const substackChange =
      prevSubstackSubscribers > 0
        ? ((substackSubscribers - prevSubstackSubscribers) /
            prevSubstackSubscribers) *
          100
        : 0;

    return NextResponse.json({
      daily_active_users: {
        value: dau,
        trend: dauTrend,
        change: Number(dauChange.toFixed(1)),
        target: null,
      },
      weekly_returning_users: {
        value: weeklyReturning,
        trend: weeklyReturningTrend,
        change: Number(weeklyReturningChange.toFixed(1)),
        target: null,
      },
      conversion_rate: {
        value: Number(conversionRate.toFixed(2)),
        trend: conversionTrend,
        change: Number(conversionChange.toFixed(1)),
        target: { min: 5, max: 10 },
      },
      search_impressions_clicks: {
        impressions: searchImpressions,
        clicks: searchClicks,
        ctr: searchCtr,
        trend: searchTrend,
        change: searchChange,
        note: 'Requires Google Search Console API integration',
      },
      grimoire_articles_indexed: {
        value: totalGrimoireArticles,
        trend: grimoireTrend,
        change: grimoireChange,
        target: null,
      },
      ai_chat_messages: {
        value: aiMessages,
        trend: aiMessagesTrend,
        change: Number(aiMessagesChange.toFixed(1)),
        target: null,
      },
      substack_subscribers: {
        value: substackSubscribers,
        trend: substackTrend,
        change: Number(substackChange.toFixed(1)),
        target: null,
      },
    });
  } catch (error) {
    console.error('[analytics/success-metrics] Failed to load metrics', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
