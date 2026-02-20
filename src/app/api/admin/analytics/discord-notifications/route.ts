import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatTimestamp } from '@/lib/analytics/date-range';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '24h';

    let startDate: Date;
    const now = new Date();

    switch (range) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const startDateFormatted = formatTimestamp(startDate);

    const stats = await sql`
      SELECT 
        category,
        event_type,
        COUNT(*) FILTER (WHERE event_type = 'sent') as sent,
        COUNT(*) FILTER (WHERE event_type = 'skipped') as skipped,
        COUNT(*) FILTER (WHERE rate_limited = true) as rate_limited,
        COUNT(*) FILTER (WHERE quiet_hours_skipped = true) as quiet_hours_skipped
      FROM discord_notification_analytics
      WHERE sent_at > ${startDateFormatted}
      GROUP BY category, event_type
      ORDER BY category, event_type
    `;

    const queued = await sql`
      SELECT 
        category,
        event_type,
        COUNT(*) as count,
        array_agg(DISTINCT title) FILTER (WHERE title IS NOT NULL) as titles
      FROM discord_notification_analytics
      WHERE sent_at > ${startDateFormatted}
      AND event_type = 'notification'
      GROUP BY category, event_type
    `;

    return NextResponse.json({
      success: true,
      range,
      stats: stats.rows,
      queued: queued.rows,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('[analytics/discord-notifications] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
