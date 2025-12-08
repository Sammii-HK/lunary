import { NextRequest, NextResponse } from 'next/server';
import {
  getSentEvents,
  cleanupOldDates,
} from '@/app/api/cron/shared-notification-tracker';
import {
  sendUnifiedNotification,
  NotificationEvent,
} from '@/lib/notifications/unified-service';
import { processAccountDeletions, sendTrialReminders } from '@/lib/cron';

// This is the SINGLE cron job for Vercel Pro tier
// It runs every hour and handles all scheduled tasks directly (no fetch calls)
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

    const now = new Date();
    const hour = now.getUTCHours();
    const today = now.toISOString().split('T')[0];
    const checkTime = now.toISOString();

    const scheduledTasks: string[] = [];

    // Run process-deletions at 2am UTC (direct call, no fetch)
    if (hour === 2) {
      try {
        const result = await processAccountDeletions();
        scheduledTasks.push(
          `process-deletions (${result.processed} processed)`,
        );
      } catch (e) {
        console.error('Failed to run process-deletions:', e);
      }
    }

    // Run trial-reminders at 9am UTC (direct call, no fetch)
    if (hour === 9) {
      try {
        const result = await sendTrialReminders();
        scheduledTasks.push(`trial-reminders (${result.sent.total} sent)`);
      } catch (e) {
        console.error('Failed to run trial-reminders:', e);
      }
    }

    console.log(
      '🔔 Hourly time-sensitive notification check started at:',
      checkTime,
    );

    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://www.lunary.app'
        : 'http://localhost:3000';

    const cosmicResponse = await fetch(
      `${baseUrl}/api/og/cosmic-post/${today}`,
      {
        headers: { 'User-Agent': 'Lunary-Hourly-Notification/1.0' },
      },
    );

    if (!cosmicResponse.ok) {
      throw new Error(`Failed to fetch cosmic data: ${cosmicResponse.status}`);
    }

    const cosmicData = await cosmicResponse.json();

    await cleanupOldDates(1);

    const sentToday = await getSentEvents(today);

    // Get time-sensitive events (moon phases, major transits)
    const timeSensitiveEvents = getTimeSensitiveEvents(cosmicData);

    // Filter out events that have already been sent today
    const newEvents = timeSensitiveEvents.filter((event: any) => {
      const eventKey = `${event.type || 'unknown'}-${event.name || 'unknown'}-${event.priority || 0}`;
      return !sentToday.has(eventKey);
    });

    if (newEvents.length === 0) {
      console.log('📭 No new time-sensitive events in this hourly check');
      return NextResponse.json({
        success: true,
        notificationsSent: 0,
        message: 'No new time-sensitive events',
        scheduledTasks,
        checkTime,
      });
    }

    // Send notifications for time-sensitive events
    const results = [];
    let totalSent = 0;

    for (const event of newEvents) {
      try {
        const notificationEvent: NotificationEvent = {
          name: event.name || 'Cosmic Event',
          type: event.type || 'unknown',
          priority: event.priority || 0,
          planet: event.planet,
          sign: event.sign,
          planetA: event.planetA,
          planetB: event.planetB,
          aspect: event.aspect,
          emoji: event.emoji,
          energy: event.energy,
          description: event.description,
        };

        const result = await sendUnifiedNotification(
          notificationEvent,
          cosmicData,
          '4-hourly', // Use same tracking as 4-hourly
        );

        totalSent += result.recipientCount || 0;
        results.push({
          success: result.success,
          recipientCount: result.recipientCount,
          successful: result.successful,
          failed: result.failed,
          eventName: event.name,
          eventKey: result.eventKey,
        });
      } catch (eventError) {
        console.error(
          `Failed to send notification for event ${event.name}:`,
          eventError,
        );
        results.push({
          success: false,
          error:
            eventError instanceof Error ? eventError.message : 'Unknown error',
          eventName: event.name,
        });
      }
    }

    console.log(
      `✅ Hourly notification check completed: ${totalSent} notifications sent, ${newEvents.length} new events`,
    );

    return NextResponse.json({
      success: totalSent > 0 || scheduledTasks.length > 0,
      notificationsSent: totalSent,
      newEventsCount: newEvents.length,
      scheduledTasks,
      results,
      checkTime,
    });
  } catch (error) {
    console.error('❌ Hourly notification check failed:', error);
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

function getTimeSensitiveEvents(cosmicData: any): any[] {
  const timeSensitiveEvents: any[] = [];

  // Moon phases (highest priority - these happen at exact times)
  if (cosmicData.primaryEvent && cosmicData.primaryEvent.type === 'moon') {
    const moonEvent = cosmicData.primaryEvent;
    if (moonEvent.priority === 10) {
      const significantPhases = [
        'New Moon',
        'Full Moon',
        'First Quarter',
        'Last Quarter',
      ];
      if (significantPhases.some((phase) => moonEvent.name?.includes(phase))) {
        timeSensitiveEvents.push(moonEvent);
      }
    }
  }

  // Major transits (priority 9+) - these happen at exact times
  if (cosmicData.allEvents) {
    for (const event of cosmicData.allEvents) {
      // Major aspects involving outer planets (priority 9+)
      if (
        event.type === 'aspect' &&
        event.priority >= 9 &&
        !timeSensitiveEvents.some((e) => e.name === event.name)
      ) {
        const outerPlanets = [
          'Jupiter',
          'Saturn',
          'Uranus',
          'Neptune',
          'Pluto',
        ];
        if (
          outerPlanets.some(
            (planet) =>
              event.name?.includes(planet) ||
              event.description?.includes(planet),
          )
        ) {
          timeSensitiveEvents.push(event);
        }
      }

      // Major ingresses (priority 9+)
      if (
        event.type === 'ingress' &&
        event.priority >= 9 &&
        !timeSensitiveEvents.some((e) => e.name === event.name)
      ) {
        timeSensitiveEvents.push(event);
      }

      // Retrograde starts/ends (priority 9+)
      if (
        event.type === 'retrograde' &&
        event.priority >= 9 &&
        !timeSensitiveEvents.some((e) => e.name === event.name)
      ) {
        timeSensitiveEvents.push(event);
      }

      // Eclipses (always time-sensitive)
      if (
        event.type === 'eclipse' &&
        !timeSensitiveEvents.some((e) => e.name === event.name)
      ) {
        timeSensitiveEvents.push(event);
      }
    }
  }

  // Sort by priority (highest first)
  timeSensitiveEvents.sort((a, b) => (b.priority || 0) - (a.priority || 0));

  // Return up to 2 most important time-sensitive events per hour
  return timeSensitiveEvents.slice(0, 2);
}
