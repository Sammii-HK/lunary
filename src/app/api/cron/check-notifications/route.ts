import { NextRequest, NextResponse } from 'next/server';

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

    console.log(
      '🔔 4-hourly notification check started at:',
      new Date().toISOString(),
    );

    const today = new Date().toISOString().split('T')[0];
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

    // Check if there are notification-worthy events happening today
    const notificationEvents = getNotificationWorthyEvents(cosmicData);

    if (notificationEvents.length === 0) {
      console.log('📭 No notification-worthy events in this 4-hour check');
      return NextResponse.json({
        success: true,
        notificationsSent: 0,
        primaryEvent: cosmicData.primaryEvent?.name,
        message: 'No significant events to notify about',
        checkTime: new Date().toISOString(),
      });
    }

    // Send notifications for significant events
    const results = [];
    let totalSent = 0;

    for (const event of notificationEvents) {
      try {
        const response = await fetch(`${baseUrl}/api/notifications/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CRON_SECRET}`,
          },
          body: JSON.stringify({
            payload: {
              type: event.type,
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
      `✅ 4-hourly notification check completed: ${totalSent} notifications sent`,
    );

    return NextResponse.json({
      success: totalSent > 0,
      notificationsSent: totalSent,
      primaryEvent: cosmicData.primaryEvent?.name,
      results,
      checkTime: new Date().toISOString(),
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
  const events = [];

  // Check primary event
  if (
    cosmicData.primaryEvent &&
    isEventNotificationWorthy(cosmicData.primaryEvent)
  ) {
    events.push(createNotificationFromEvent(cosmicData.primaryEvent));
  }

  // Check secondary high-priority events
  if (cosmicData.allEvents) {
    const significantEvents = cosmicData.allEvents
      .filter(
        (event: any) =>
          event.priority >= 8 && event !== cosmicData.primaryEvent,
      )
      .slice(0, 1); // Limit to 1 additional notification per 4-hour check

    for (const event of significantEvents) {
      if (isEventNotificationWorthy(event)) {
        events.push(createNotificationFromEvent(event));
      }
    }
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

  // Customize based on event type
  switch (event.type) {
    case 'moon':
      return {
        ...baseEvent,
        title: `${event.emoji || '🌙'} ${event.name}`,
        body: `${event.energy} - ${getPhaseGuidance(event.name)}`,
      };

    case 'aspect':
      return {
        ...baseEvent,
        title: `${getPlanetEmoji(event)} ${event.name}`,
        body: `${event.energy} - Powerful cosmic alignment forming`,
      };

    case 'seasonal':
      return {
        ...baseEvent,
        title: `🌿 ${event.name}`,
        body: `${event.energy} - Seasonal energy shift begins`,
      };

    case 'ingress':
      return {
        ...baseEvent,
        title: `${getPlanetEmoji(event)} ${event.name}`,
        body: `${event.energy} - New cosmic energy emerges`,
      };

    default:
      return {
        ...baseEvent,
        title: `✨ ${event.name}`,
        body: event.energy || 'Significant cosmic event occurring',
      };
  }
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

function getPlanetEmoji(event: any): string {
  const text = event.name || event.description || '';
  const emojis: Record<string, string> = {
    Mercury: '☿',
    Venus: '♀',
    Mars: '♂',
    Jupiter: '♃',
    Saturn: '♄',
    Uranus: '♅',
    Neptune: '♆',
    Pluto: '♇',
    Sun: '☉',
    Moon: '☽',
  };

  for (const [planet, emoji] of Object.entries(emojis)) {
    if (text.includes(planet)) return emoji;
  }

  return '⭐';
}
