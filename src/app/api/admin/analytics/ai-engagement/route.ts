import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

import {
  formatDate,
  formatTimestamp,
  resolveDateRange,
} from '@/lib/analytics/date-range';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    const summary = await sql`
      SELECT
        COUNT(*) AS total_sessions,
        COUNT(DISTINCT user_id) AS unique_users,
        COALESCE(SUM(token_count), 0) AS total_tokens,
        COALESCE(SUM(message_count), 0) AS total_messages,
        COUNT(*) FILTER (WHERE completed) AS completed_sessions
      FROM analytics_ai_usage
      WHERE created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(
        range.end,
      )}
    `;

    const row = summary.rows[0] || {};
    const totalSessions = Number(row.total_sessions || 0);
    const uniqueUsers = Number(row.unique_users || 0);
    const totalTokens = Number(row.total_tokens || 0);
    const totalMessages = Number(row.total_messages || 0);
    const completedSessions = Number(row.completed_sessions || 0);

    const modeBreakdownResult = await sql`
      SELECT
        COALESCE(mode, 'unknown') AS mode,
        COUNT(*) AS count
      FROM analytics_ai_usage
      WHERE created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(
        range.end,
      )}
      GROUP BY COALESCE(mode, 'unknown')
      ORDER BY count DESC
    `;

    const modeBreakdown = modeBreakdownResult.rows.map((modeRow) => {
      const count = Number(modeRow.count || 0);
      return {
        mode: modeRow.mode as string,
        count,
        percentage:
          totalSessions > 0 ? Number(((count / totalSessions) * 100).toFixed(2)) : 0,
      };
    });

    const trends = await sql`
      SELECT
        DATE(created_at) AS date,
        COUNT(*) AS sessions,
        COALESCE(SUM(token_count), 0) AS tokens
      FROM analytics_ai_usage
      WHERE created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(
        range.end,
      )}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return NextResponse.json({
      total_sessions: totalSessions,
      unique_users: uniqueUsers,
      avg_sessions_per_user:
        uniqueUsers > 0 ? Number((totalSessions / uniqueUsers).toFixed(2)) : 0,
      avg_tokens_per_user:
        uniqueUsers > 0 ? Number((totalTokens / uniqueUsers).toFixed(2)) : 0,
      avg_messages_per_session:
        totalSessions > 0 ? Number((totalMessages / totalSessions).toFixed(2)) : 0,
      completion_rate:
        totalSessions > 0
          ? Number(((completedSessions / totalSessions) * 100).toFixed(2))
          : 0,
      mode_breakdown: modeBreakdown,
      trends: trends.rows.map((trend) => ({
        date: formatDate(new Date(trend.date)),
        sessions: Number(trend.sessions || 0),
        tokens: Number(trend.tokens || 0),
      })),
    });
  } catch (error) {
    console.error('[analytics/ai-engagement] Failed to load metrics', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
