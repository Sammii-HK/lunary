import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

import { formatTimestamp, resolveDateRange } from '@/lib/analytics/date-range';

type NotificationBucket = {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
};

const DEFAULT_BUCKETS = ['cosmic_pulse', 'moon_circle', 'weekly_report'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);
    const notificationType = searchParams.get('notification_type');

    const filterByType = notificationType && notificationType !== 'all';

    const rows = filterByType
      ? await sql`
          SELECT
            notification_type,
            COUNT(*) FILTER (WHERE event_type = 'sent') AS sent,
            COUNT(*) FILTER (WHERE event_type = 'delivered') AS delivered,
            COUNT(*) FILTER (WHERE event_type = 'opened') AS opened,
            COUNT(*) FILTER (WHERE event_type = 'clicked') AS clicked
          FROM analytics_notification_events
          WHERE created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(
            range.end,
          )}
            AND notification_type = ${notificationType}
          GROUP BY notification_type
        `
      : await sql`
          SELECT
            notification_type,
            COUNT(*) FILTER (WHERE event_type = 'sent') AS sent,
            COUNT(*) FILTER (WHERE event_type = 'delivered') AS delivered,
            COUNT(*) FILTER (WHERE event_type = 'opened') AS opened,
            COUNT(*) FILTER (WHERE event_type = 'clicked') AS clicked
          FROM analytics_notification_events
          WHERE created_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(
            range.end,
          )}
          GROUP BY notification_type
        `;

    const buckets = new Map<string, NotificationBucket>();
    for (const row of rows.rows) {
      buckets.set(row.notification_type, {
        sent: Number(row.sent || 0),
        delivered: Number(row.delivered || 0),
        opened: Number(row.opened || 0),
        clicked: Number(row.clicked || 0),
      });
    }

    const responseBuckets: Record<
      string,
      NotificationBucket & {
        open_rate: number;
        click_through_rate: number;
      }
    > = {};

    const allKeys = new Set<string>([
      ...DEFAULT_BUCKETS,
      ...(notificationType && notificationType !== 'all'
        ? [notificationType]
        : []),
      ...buckets.keys(),
    ]);

    for (const key of allKeys) {
      const metrics = buckets.get(key) ?? {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
      };

      responseBuckets[key] = withRates(metrics);
    }

    const totals = Array.from(buckets.values()).reduce(
      (acc, bucket) => {
        acc.sent += bucket.sent;
        acc.opened += bucket.opened;
        acc.clicked += bucket.clicked;
        return acc;
      },
      { sent: 0, opened: 0, clicked: 0 },
    );

    const overallOpenRate =
      totals.sent > 0
        ? Number(((totals.opened / totals.sent) * 100).toFixed(2))
        : 0;
    const overallClickRate =
      totals.sent > 0
        ? Number(((totals.clicked / totals.sent) * 100).toFixed(2))
        : 0;

    const payload: Record<
      string,
      NotificationBucket & { open_rate: number; click_through_rate: number }
    > = {
      cosmic_pulse: responseBuckets.cosmic_pulse ?? withRates(),
      moon_circle: responseBuckets.moon_circle ?? withRates(),
      weekly_report: responseBuckets.weekly_report ?? withRates(),
    };

    for (const [key, value] of Object.entries(responseBuckets)) {
      if (!payload[key]) {
        payload[key] = value;
      }
    }

    return NextResponse.json({
      ...payload,
      overall_open_rate: overallOpenRate,
      overall_click_through_rate: overallClickRate,
    });
  } catch (error) {
    console.error('[analytics/notifications] Failed to load metrics', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

const withRates = (
  metrics: NotificationBucket = {
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
  },
) => ({
  ...metrics,
  open_rate:
    metrics.sent > 0
      ? Number(((metrics.opened / metrics.sent) * 100).toFixed(2))
      : 0,
  click_through_rate:
    metrics.sent > 0
      ? Number(((metrics.clicked / metrics.sent) * 100).toFixed(2))
      : 0,
});
