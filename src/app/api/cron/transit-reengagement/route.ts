import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import {
  getDormantFreeUsers,
  hasReceivedCampaign,
  recordCampaignSent,
} from '@/lib/re-engagement/campaign-manager';
import {
  renderFreeMajorTransitEmail,
  type TransitKind,
} from '@/lib/email-components/FreeReengagementEmails';
import {
  getEventCalendarForDate,
  type CalendarEvent,
} from '@/lib/astro/event-calendar';

export const dynamic = 'force-dynamic';

/** Sanitize string for safe logging (prevent log injection) */
function sanitizeForLogging(value: unknown): string {
  return String(value).replace(/[\r\n\x00-\x1F\x7F]/g, '');
}

/** Extract Sun sign from a birth_chart JSON array */
function parseSunSign(birthChart: unknown): string | undefined {
  if (!Array.isArray(birthChart)) return undefined;
  for (const p of birthChart as Record<string, unknown>[]) {
    if (p?.body === 'Sun') return p.sign as string;
  }
  return undefined;
}

/**
 * Event types significant enough to wake a dormant user. We deliberately
 * exclude the everyday noise (plain aspects, ordinary moon phases) so the
 * email genuinely earns the "a major transit just hit your chart" framing.
 */
const MAJOR_EVENT_TYPES = new Set<CalendarEvent['eventType']>([
  'retrograde_station',
  'ingress',
  'eclipse',
  'equinox',
  'solstice',
  'sabbat',
]);

/** Map the calendar event type onto the email's TransitKind. */
function toTransitKind(eventType: CalendarEvent['eventType']): TransitKind {
  switch (eventType) {
    case 'retrograde_station':
    case 'ingress':
    case 'eclipse':
    case 'sabbat':
    case 'equinox':
    case 'solstice':
    case 'aspect':
    case 'moon_phase':
      return eventType;
    default:
      return 'other';
  }
}

/**
 * Find the single most significant major event that fired in the last few
 * days, so we only email when something genuinely noteworthy has just landed.
 * Returns null when the sky has been quiet, in which case the cron sends
 * nothing.
 */
async function findRecentMajorTransit(
  lookbackDays = 3,
): Promise<CalendarEvent | null> {
  const today = new Date();
  let best: CalendarEvent | null = null;

  for (let i = 0; i <= lookbackDays; i++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    try {
      const events = await getEventCalendarForDate(dateStr);
      for (const event of events) {
        if (!MAJOR_EVENT_TYPES.has(event.eventType)) continue;
        // Only count events whose own date falls inside the lookback window,
        // so a long active retrograde does not re-trigger every single day.
        if (event.date !== dateStr) continue;
        if (!best || event.score > best.score) best = event;
      }
    } catch (error) {
      console.error(
        `[Transit Re-Engagement] event lookup failed for ${sanitizeForLogging(dateStr)}:`,
        error,
      );
    }
  }

  return best;
}

export async function GET(request: NextRequest) {
  try {
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const authHeader = request.headers.get('authorization');

    if (!isVercelCron) {
      if (
        !process.env.CRON_SECRET ||
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // 1. Is there a major transit worth emailing about right now?
    const event = await findRecentMajorTransit(3);
    if (!event) {
      return NextResponse.json({
        success: true,
        triggered: false,
        reason: 'No major transit in the lookback window',
        emailsSent: 0,
      });
    }

    const transitKind = toTransitKind(event.eventType);

    // 2. Target the dormant free-user pool directly (real session recency).
    //    Dormant 7+ days, no outer bound: these are exactly the cold users a
    //    created_at welcome drip would never reach. The event itself is the
    //    re-entry hook, not a calendar position in their lifecycle.
    const dormantUsers = await getDormantFreeUsers(7, null, 200);

    let emailsSent = 0;
    let emailsFailed = 0;
    let skipped = 0;

    for (const user of dormantUsers) {
      try {
        // One transit email per user per 14 days, so a busy sky does not spam.
        if (await hasReceivedCampaign(user.userId, 'free_major_transit', 14)) {
          skipped++;
          continue;
        }

        const sunSign = parseSunSign(user.birthChart);

        const html = await renderFreeMajorTransitEmail({
          userId: user.userId,
          userName: user.name || 'there',
          userEmail: user.email,
          sunSign,
          transitName: event.name,
          transitKind,
          planet: event.planet,
          sign: event.sign,
        });

        await sendEmail({
          to: user.email,
          from: 'Sammii <hello@lunary.app>',
          replyTo: 'sammii@lunary.app',
          subject:
            transitKind === 'retrograde_station' && event.planet
              ? `${event.planet} just stationed retrograde, and your chart felt it`
              : 'A major transit just hit your chart',
          html,
          tracking: {
            userId: user.userId,
            notificationType: 'free_reengagement',
            notificationId: `free-major-transit-${event.id}-${user.userId}`,
            utm: {
              source: 'email',
              medium: 'reengagement',
              campaign: 'free_major_transit',
              content: event.eventType,
            },
          },
        });

        await recordCampaignSent(user.userId, 'free_major_transit', {
          eventId: event.id,
          eventType: event.eventType,
        });
        emailsSent++;
      } catch (error) {
        console.error(
          `[Transit Re-Engagement] failed for ${sanitizeForLogging(user.email)}:`,
          error,
        );
        emailsFailed++;
      }
    }

    return NextResponse.json({
      success: true,
      triggered: true,
      event: {
        id: event.id,
        name: event.name,
        eventType: event.eventType,
        date: event.date,
      },
      emailsSent,
      emailsFailed,
      skipped,
    });
  } catch (error) {
    console.error('[Transit Re-Engagement] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
