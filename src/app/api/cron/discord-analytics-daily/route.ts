import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatTimestamp } from '@/lib/analytics/date-range';
import { sendDiscordNotification } from '@/lib/discord';

export async function GET(request: NextRequest) {
  try {
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const authHeader = request.headers.get('authorization');

    if (!isVercelCron) {
      if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('[discord-analytics-daily] Starting daily analytics summary');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startDate = new Date(yesterday);
    startDate.setHours(0, 0, 0, 0);
    const startDateFormatted = formatTimestamp(startDate);

    const conversionEvents = await sql`
      SELECT 
        event_type,
        COUNT(*) as count,
        array_agg(DISTINCT title) FILTER (WHERE title IS NOT NULL) as titles
      FROM discord_notification_analytics
      WHERE sent_at > ${startDateFormatted}
      AND category = 'analytics'
      AND event_type = 'conversion'
      GROUP BY event_type
    `;

    const weeklyDigest = await sql`
      SELECT 
        COUNT(*) as count,
        array_agg(DISTINCT title) FILTER (WHERE title IS NOT NULL) as titles
      FROM discord_notification_analytics
      WHERE sent_at > ${startDateFormatted}
      AND category = 'analytics'
      AND event_type = 'weekly_digest'
    `;

    const cosmicAlerts = await sql`
      SELECT 
        COUNT(*) as count,
        array_agg(DISTINCT title) FILTER (WHERE title IS NOT NULL) as titles
      FROM discord_notification_analytics
      WHERE sent_at > ${startDateFormatted}
      AND category = 'analytics'
      AND event_type = 'cosmic_alert'
    `;

    const skippedStats = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE event_type = 'skipped') as skipped,
        COUNT(*) FILTER (WHERE rate_limited = true) as rate_limited,
        COUNT(*) FILTER (WHERE quiet_hours_skipped = true) as quiet_hours_skipped
      FROM discord_notification_analytics
      WHERE sent_at > ${startDateFormatted}
    `;

    const conversionRows = conversionEvents.rows;
    const weeklyDigestRow = weeklyDigest.rows[0];
    const cosmicAlertsRow = cosmicAlerts.rows[0];
    const skippedRow = skippedStats.rows[0];

    const fields: Array<{ name: string; value: string; inline?: boolean }> = [];

    if (conversionRows.length > 0) {
      const conversionSummary = conversionRows
        .map((row) => {
          const metadata = row.titles?.[0] || '';
          const match = metadata.match(/(\w+):\s*(\S+)/);
          if (match) {
            return `${match[1]}: ${row.count}`;
          }
          return `${row.event_type}: ${row.count}`;
        })
        .join('\n');

      fields.push({
        name: 'Conversion Events',
        value: conversionSummary || 'None',
        inline: false,
      });
    }

    if (weeklyDigestRow && parseInt(weeklyDigestRow.count || '0') > 0) {
      fields.push({
        name: 'Weekly Digest',
        value: 'Sent',
        inline: true,
      });
    }

    if (cosmicAlertsRow && parseInt(cosmicAlertsRow.count || '0') > 0) {
      fields.push({
        name: 'Cosmic Alerts',
        value: `${cosmicAlertsRow.count} alerts`,
        inline: true,
      });
    }

    if (skippedRow) {
      const skippedCount = parseInt(skippedRow.skipped || '0');
      const rateLimitedCount = parseInt(skippedRow.rate_limited || '0');
      const quietHoursCount = parseInt(skippedRow.quiet_hours_skipped || '0');

      if (skippedCount > 0 || rateLimitedCount > 0 || quietHoursCount > 0) {
        fields.push({
          name: 'Skipped Notifications',
          value: `Skipped: ${skippedCount}\nRate Limited: ${rateLimitedCount}\nQuiet Hours: ${quietHoursCount}`,
          inline: false,
        });
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No analytics events to summarize',
        timestamp: new Date().toISOString(),
      });
    }

    const result = await sendDiscordNotification({
      title: '📊 Daily Analytics Summary',
      description: `Analytics events from the past 24 hours`,
      fields,
      category: 'analytics',
      dedupeKey: `daily-analytics-${yesterday.toISOString().split('T')[0]}`,
      footer: `Summary for ${yesterday.toISOString().split('T')[0]}`,
    });

    return NextResponse.json({
      success: result.ok,
      message: 'Daily analytics summary sent',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[discord-analytics-daily] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
