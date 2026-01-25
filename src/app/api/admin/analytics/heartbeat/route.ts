import { NextRequest, NextResponse } from 'next/server';
import { formatTimestamp } from '@/lib/analytics/date-range';
import { EngagementEventType, getEventAudit } from '@/lib/analytics/kpis';

const HEARTBEAT_WINDOW_MINUTES = 30;

type HeartbeatEventConfig = {
  label: string;
  eventType: EngagementEventType;
};

const HEARTBEAT_EVENTS: HeartbeatEventConfig[] = [
  { label: 'Site open (app_opened)', eventType: 'app_opened' },
  { label: 'Product open (product_opened)', eventType: 'product_opened' },
  { label: 'Grimoire viewed (grimoire_viewed)', eventType: 'grimoire_viewed' },
  { label: 'Signups (signup)', eventType: 'signup' },
];

export async function GET(_request: NextRequest) {
  try {
    const now = new Date();
    const start = new Date(
      now.getTime() - HEARTBEAT_WINDOW_MINUTES * 60 * 1000,
    );
    const startTs = formatTimestamp(start);
    const endTs = formatTimestamp(now);

    const events = await Promise.all(
      HEARTBEAT_EVENTS.map(async (event) => {
        const audit = await getEventAudit(startTs, endTs, event.eventType);
        return {
          label: event.label,
          event_type: event.eventType,
          ...audit,
        };
      }),
    );

    return NextResponse.json({
      window_minutes: HEARTBEAT_WINDOW_MINUTES,
      events,
      source: 'database',
    });
  } catch (error) {
    console.error('[analytics/heartbeat] Failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
