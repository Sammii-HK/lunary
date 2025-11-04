import { NextRequest, NextResponse } from 'next/server';
import {
  getSentEvents,
  markEventAsSent,
  cleanupOldDates,
  getSentEventsCount,
} from '../shared-notification-tracker';

// This endpoint runs every 4 hours to check for astronomical events
export async function GET(request: NextRequest) {
  try {
    // Verify cron request
    const authHeader = request.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const checkTime = now.toISOString();

    console.log('🔔 4-hourly notification check started at:', checkTime);

    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://www.lunary.app'
        : 'http://localhost:3000';

    // Get cosmic data to check for events
    const cosmicResponse = await fetch(
      `${baseUrl}/api/og/cosmic-post/${today}`,
      {
        headers: { 'User-Agent': 'Lunary-4Hourly-Notification/1.0' },
      },
    );

    if (!cosmicResponse.ok) {
      throw new Error(`Failed to fetch cosmic data: ${cosmicResponse.status}`);
    }

    const cosmicData = await cosmicResponse.json();

    // Cleanup old tracking data (only keep today + 1 day buffer)
    // We only need to track events for the current day to prevent duplicates
    await cleanupOldDates(1);

    // Get events that have already been sent today (by daily cron or previous 4-hourly checks)
    const sentToday = await getSentEvents(today);
    const alreadySentCount = await getSentEventsCount(today);

    // Check if there are notification-worthy events happening today
    const currentEvents = getNotificationWorthyEvents(cosmicData);

    // Filter out events that have already been notified about today
    // This includes events sent by daily cron AND events sent in previous 4-hourly checks
    const newEvents = currentEvents.filter((event: any) => {
      const eventKey = `${event.type}-${event.name}-${event.priority}`;
      // Event is new if it hasn't been sent yet
      return !sentToday.has(eventKey);
    });

    // Log comparison for debugging
    console.log(
      `📊 Event comparison: ${currentEvents.length} current events, ${alreadySentCount} already sent (by daily cron or previous checks), ${newEvents.length} new events`,
    );

    if (newEvents.length === 0) {
      console.log('📭 No new notification-worthy events in this 4-hour check');
      return NextResponse.json({
        success: true,
        notificationsSent: 0,
        primaryEvent: cosmicData.primaryEvent?.name,
        message:
          'No new significant events to notify about (may have already been sent)',
        checkTime,
        alreadySent: sentToday.size,
      });
    }

    // Send notifications for significant events
    const results = [];
    let totalSent = 0;

    for (const event of newEvents) {
      try {
        const eventKey = `${event.type}-${event.name}-${event.priority}`;

        // Map event type to notification type format
        const getNotificationType = (type: string): string => {
          const mapping: Record<string, string> = {
            moon: 'moon_phase',
            aspect: 'major_aspect',
            ingress: 'planetary_transit',
            seasonal: 'sabbat',
            retrograde: 'retrograde',
          };
          return mapping[type] || 'moon_phase';
        };

        const response = await fetch(`${baseUrl}/api/notifications/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CRON_SECRET}`,
          },
          body: JSON.stringify({
            payload: {
              type: getNotificationType(event.type),
              title: event.title,
              body: event.body,
              data: {
                date: today,
                eventName: event.name,
                priority: event.priority,
                eventType: event.type,
                checkType: '4-hourly',
              },
            },
          }),
        });

        const result = await response.json();
        totalSent += result.recipientCount || 0;
        results.push(result);

        // Mark this event as sent in database tracker (so it won't be sent again)
        await markEventAsSent(
          today,
          eventKey,
          event.type,
          event.name,
          event.priority,
          '4-hourly',
        );
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
      `✅ 4-hourly notification check completed: ${totalSent} notifications sent, ${newEvents.length} new events`,
    );

    return NextResponse.json({
      success: totalSent > 0,
      notificationsSent: totalSent,
      primaryEvent: cosmicData.primaryEvent?.name,
      newEventsCount: newEvents.length,
      totalEventsToday: currentEvents.length,
      alreadySentToday: alreadySentCount,
      results,
      checkTime,
    });
  } catch (error) {
    console.error('❌ 4-hourly notification check failed:', error);
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

// Same logic as daily-posts but for 4-hourly checks
function getNotificationWorthyEvents(cosmicData: any) {
  const events: any[] = [];

  // Build allEvents array from available data (same as daily-posts)
  const allEvents: any[] = [];

  // Get primary event with full metadata
  const primaryEventType =
    cosmicData.astronomicalData?.primaryEvent?.type || 'unknown';
  const primaryEventPriority =
    cosmicData.astronomicalData?.primaryEvent?.priority || 0;

  if (cosmicData.primaryEvent) {
    allEvents.push({
      name: cosmicData.primaryEvent.name,
      energy: cosmicData.primaryEvent.energy,
      type: primaryEventType,
      priority: primaryEventPriority,
      ...cosmicData.astronomicalData?.primaryEvent,
    });
  }

  // Add aspect events
  if (cosmicData.aspectEvents && Array.isArray(cosmicData.aspectEvents)) {
    allEvents.push(
      ...cosmicData.aspectEvents.map((event: any) => ({
        ...event,
        type: event.type || 'aspect',
      })),
    );
  }

  // Add ingress events
  if (cosmicData.ingressEvents && Array.isArray(cosmicData.ingressEvents)) {
    allEvents.push(
      ...cosmicData.ingressEvents.map((event: any) => ({
        ...event,
        type: event.type || 'ingress',
        priority: event.priority || 4,
      })),
    );
  }

  // Add seasonal events
  if (cosmicData.seasonalEvents && Array.isArray(cosmicData.seasonalEvents)) {
    allEvents.push(
      ...cosmicData.seasonalEvents.map((event: any) => ({
        ...event,
        type: event.type || 'seasonal',
        priority: event.priority || 8,
      })),
    );
  }

  // Add retrograde events
  if (
    cosmicData.retrogradeEvents &&
    Array.isArray(cosmicData.retrogradeEvents)
  ) {
    allEvents.push(
      ...cosmicData.retrogradeEvents.map((event: any) => ({
        ...event,
        type: event.type || 'retrograde',
        priority: event.priority || 6,
      })),
    );
  }

  // Add retrograde ingress events
  if (
    cosmicData.retrogradeIngress &&
    Array.isArray(cosmicData.retrogradeIngress)
  ) {
    allEvents.push(
      ...cosmicData.retrogradeIngress.map((event: any) => ({
        ...event,
        type: event.type || 'retrograde',
        priority: event.priority || 6,
      })),
    );
  }

  // Sort by priority
  allEvents.sort((a, b) => (b.priority || 0) - (a.priority || 0));

  // Get notification-worthy events
  const notificationWorthyEvents = allEvents.filter((event: any) => {
    return isEventNotificationWorthy(event);
  });

  // Create notification objects for up to 2 most significant events (limit for 4-hourly)
  const eventsToSend = notificationWorthyEvents.slice(0, 2);

  for (const event of eventsToSend) {
    events.push(createNotificationFromEvent(event));
  }

  return events;
}

function isEventNotificationWorthy(event: any): boolean {
  // Only send notifications for significant events
  if (event.priority >= 9) return true; // Extraordinary planetary events

  // Moon phases (ALL major phases are significant)
  if (event.type === 'moon' && event.priority === 10) {
    const significantPhases = [
      'New Moon',
      'Full Moon',
      'First Quarter',
      'Last Quarter',
      'Quarter',
    ];
    return significantPhases.some((phase) => event.name.includes(phase));
  }

  // Seasonal events (equinoxes, solstices, sabbats)
  if (event.priority === 8) return true;

  // Major aspects involving outer planets
  if (event.type === 'aspect' && event.priority >= 7) {
    const outerPlanets = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    return outerPlanets.some(
      (planet) =>
        event.name?.includes(planet) || event.description?.includes(planet),
    );
  }

  return false;
}

function createNotificationFromEvent(event: any) {
  const baseEvent = {
    name: event.name,
    type: event.type,
    priority: event.priority,
  };

  // Create descriptive titles without emojis (same as daily-posts)
  const createNotificationTitle = (event: any) => {
    const eventName = event.name || 'Cosmic Event';

    switch (event.type) {
      case 'moon':
        return eventName;

      case 'aspect':
        if (event.planetA && event.planetB && event.aspect) {
          const planetAName = event.planetA.name || event.planetA;
          const planetBName = event.planetB.name || event.planetB;
          const aspectName =
            event.aspect.charAt(0).toUpperCase() + event.aspect.slice(1);
          return `${planetAName}-${planetBName} ${aspectName}`;
        }
        return eventName || 'Planetary Aspect';

      case 'seasonal':
        return eventName;

      case 'ingress':
        if (event.planet && event.sign) {
          return `${event.planet} Enters ${event.sign}`;
        }
        return eventName || 'Planetary Ingress';

      case 'retrograde':
        if (event.planet) {
          return `${event.planet} Retrograde Begins`;
        }
        return eventName || 'Planetary Retrograde';

      default:
        return eventName || 'Cosmic Event';
    }
  };

  const createNotificationBody = (event: any) => {
    const baseBody = event.energy || 'Cosmic event occurring';

    switch (event.type) {
      case 'moon':
        return `${baseBody} - ${getPhaseGuidance(event.name)}`;

      case 'aspect':
        if (event.aspect) {
          const aspectDesc = getAspectDescription(event.aspect);
          const signA = event.planetA?.constellation || event.signA;
          const signB = event.planetB?.constellation || event.signB;
          if (signA && signB) {
            return `${baseBody} - ${aspectDesc} in ${signA} and ${signB}`;
          }
          return `${baseBody} - ${aspectDesc} forming`;
        }
        return `${baseBody} - Powerful cosmic alignment forming`;

      case 'seasonal':
        return `${baseBody} - Seasonal energy shift begins`;

      case 'ingress':
        if (event.planet && event.sign) {
          return `${baseBody} - ${event.planet} energy shifts to ${event.sign} themes`;
        }
        return `${baseBody} - New cosmic energy emerges`;

      case 'retrograde':
        if (event.planet) {
          return `${baseBody} - ${event.planet} moves retrograde, inviting reflection`;
        }
        return `${baseBody} - Planetary retrograde begins`;

      default:
        return baseBody;
    }
  };

  return {
    ...baseEvent,
    title: createNotificationTitle(event),
    body: createNotificationBody(event),
  };
}

function getAspectDescription(aspect: string): string {
  const descriptions: Record<string, string> = {
    conjunction: 'Planets unite',
    trine: 'Harmonious flow',
    square: 'Dynamic tension',
    sextile: 'Cooperative opportunities',
    opposition: 'Seeking balance',
  };
  return descriptions[aspect] || 'Planetary alignment';
}

function getPhaseGuidance(phaseName: string): string {
  const guidance: Record<string, string> = {
    'New Moon': 'Perfect time for new beginnings and intention setting',
    'Full Moon': 'Time for release, gratitude, and manifestation',
    'First Quarter': 'Take action on your intentions and push forward',
    'Last Quarter': 'Release what no longer serves and reflect',
  };

  for (const [phase, message] of Object.entries(guidance)) {
    if (phaseName.includes(phase)) return message;
  }

  return 'Lunar energy shift occurring';
}
