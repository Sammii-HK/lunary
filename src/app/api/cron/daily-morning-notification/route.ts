import { NextRequest, NextResponse } from 'next/server';
import {
  sendUnifiedNotification,
  NotificationEvent,
} from '@/lib/notifications/unified-service';

export const dynamic = 'force-dynamic';

/**
 * Daily morning notification - sends ONE notification per day at 8 AM UTC
 * Uses unified notification system to send the most important cosmic event
 */
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

    const todayDate = new Date();
    const today = todayDate.toISOString().split('T')[0];
    const checkTime = new Date().toISOString();

    console.log('🌅 Daily morning notification check started at:', checkTime);

    // Get today's cosmic data from the cosmic-post API endpoint
    // This endpoint returns the correct structure with primaryEvent and allEvents
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    const cosmicResponse = await fetch(
      `${baseUrl}/api/og/cosmic-post/${today}`,
      {
        headers: { 'User-Agent': 'Lunary-Morning-Notification/1.0' },
      },
    );

    if (!cosmicResponse.ok) {
      throw new Error(`Failed to fetch cosmic data: ${cosmicResponse.status}`);
    }

    const cosmicData = await cosmicResponse.json();

    // Get notification-worthy events
    const notificationEvents = getNotificationWorthyEvents(cosmicData);

    if (notificationEvents.length === 0) {
      console.log('📭 No notification-worthy events today');
      return NextResponse.json({
        success: true,
        notificationsSent: 0,
        message: 'No significant events to notify about',
        date: today,
        checkTime,
      });
    }

    // Sort events by priority and importance
    // Priority order: retrogrades > moon phases > major transits > other
    const sortedEvents = [...notificationEvents].sort((a, b) => {
      // Retrogrades get highest priority
      if (a.type === 'retrograde' && b.type !== 'retrograde') return -1;
      if (a.type !== 'retrograde' && b.type === 'retrograde') return 1;

      // Moon phases are high priority
      if (a.type === 'moon' && b.type !== 'moon') return -1;
      if (a.type !== 'moon' && b.type === 'moon') return 1;

      // Then by priority number
      return (b.priority || 0) - (a.priority || 0);
    });

    // Send only the top priority event (one notification per day)
    const eventToSend = sortedEvents[0];

    if (!eventToSend) {
      return NextResponse.json({
        success: true,
        notificationsSent: 0,
        message: 'No event selected to send',
        date: today,
        checkTime,
      });
    }

    try {
      const notificationEvent: NotificationEvent = {
        name: eventToSend.name || 'Cosmic Event',
        type: eventToSend.type || 'unknown',
        priority: eventToSend.priority || 0,
        planet: eventToSend.planet,
        sign: eventToSend.sign,
        planetA: eventToSend.planetA,
        planetB: eventToSend.planetB,
        aspect: eventToSend.aspect,
        emoji: eventToSend.emoji,
        energy: eventToSend.energy,
        description: eventToSend.description,
      };

      const result = await sendUnifiedNotification(
        notificationEvent,
        cosmicData,
        'daily',
      );

      console.log(
        `✅ Morning notification sent: ${result.successful} successful, ${result.failed} failed`,
      );

      return NextResponse.json({
        success: result.success,
        notificationsSent: result.recipientCount,
        event: {
          name: eventToSend.name,
          type: eventToSend.type,
          priority: eventToSend.priority,
        },
        result: {
          recipientCount: result.recipientCount,
          successful: result.successful,
          failed: result.failed,
          eventKey: result.eventKey,
        },
        date: today,
        checkTime,
      });
    } catch (eventError) {
      console.error(
        `❌ Failed to send morning notification for event ${eventToSend.name}:`,
        eventError,
      );
      return NextResponse.json(
        {
          success: false,
          error:
            eventError instanceof Error ? eventError.message : 'Unknown error',
          event: eventToSend.name,
          date: today,
          checkTime,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('❌ Daily morning notification check failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        checkTime: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

/**
 * Get notification-worthy events from cosmic data
 * Filters for significant events that users should be notified about
 */
function getNotificationWorthyEvents(cosmicData: any): any[] {
  const events: any[] = [];

  // Primary event (usually the most significant)
  if (cosmicData.primaryEvent) {
    const primary = cosmicData.primaryEvent;
    // Only include if it's significant (priority >= 5)
    if ((primary.priority || 0) >= 5) {
      events.push(primary);
    }
  }

  // Check all events for significant ones
  if (cosmicData.allEvents) {
    for (const event of cosmicData.allEvents) {
      // Skip if already included as primary
      if (events.some((e) => e.name === event.name && e.type === event.type)) {
        continue;
      }

      // Include significant events (priority >= 7)
      // This includes: major moon phases, retrogrades, major transits, eclipses
      if ((event.priority || 0) >= 7) {
        events.push(event);
      }
    }
  }

  return events;
}
