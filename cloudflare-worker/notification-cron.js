/**
 * Cloudflare Worker for Lunary Push Notifications
 * Runs every 4 hours to check for astronomical events and send notifications
 */

export default {
  async scheduled(event, env, ctx) {
    console.log(
      '🔔 Cloudflare notification cron started at:',
      new Date().toISOString(),
    );

    try {
      const today = new Date().toISOString().split('T')[0];
      const baseUrl = 'https://www.lunary.app';

      // Get cosmic data to check for events
      const cosmicResponse = await fetch(
        `${baseUrl}/api/og/cosmic-post/${today}`,
        {
          headers: { 'User-Agent': 'Lunary-Cloudflare-Notification/1.0' },
        },
      );

      if (!cosmicResponse.ok) {
        throw new Error(
          `Failed to fetch cosmic data: ${cosmicResponse.status}`,
        );
      }

      const cosmicData = await cosmicResponse.json();

      // Use the actual cosmic data structure!
      const notificationEvents = [];

      if (cosmicData.primaryEvent) {
        console.log('🎯 Primary event found:', cosmicData.primaryEvent.name);
        console.log(
          '📊 Astronomical data:',
          cosmicData.astronomicalData?.primaryEvent,
        );

        // Combine display data with astronomical metadata
        const eventData = {
          ...cosmicData.primaryEvent,
          type: cosmicData.astronomicalData?.primaryEvent?.type || 'unknown',
          priority: cosmicData.astronomicalData?.primaryEvent?.priority || 10,
        };

        console.log('📦 Combined event data:', eventData);
        notificationEvents.push(createNotificationFromEvent(eventData));
      }

      if (notificationEvents.length === 0) {
        console.log('📭 No events found in cosmic data');
        return new Response(
          JSON.stringify({
            success: true,
            notificationsSent: 0,
            primaryEvent: cosmicData.primaryEvent?.name || 'none',
            message: 'No events in cosmic data',
            checkTime: new Date().toISOString(),
          }),
          {
            headers: { 'Content-Type': 'application/json' },
          },
        );
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
              Authorization: `Bearer ${env.CRON_SECRET}`,
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
                  source: 'cloudflare-worker',
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
            error: eventError.message || 'Unknown error',
            eventName: event.name,
          });
        }
      }

      console.log(
        `✅ Cloudflare notification check completed: ${totalSent} notifications sent`,
      );

      return new Response(
        JSON.stringify({
          success: totalSent > 0,
          notificationsSent: totalSent,
          primaryEvent: cosmicData.primaryEvent?.name,
          results,
          checkTime: new Date().toISOString(),
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
    } catch (error) {
      console.error('❌ Cloudflare notification check failed:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message || 'Unknown error',
          checkTime: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  },

  // Handle manual triggers via HTTP
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/trigger' && request.method === 'POST') {
      // Manual trigger for testing
      return this.scheduled(null, env, ctx);
    }

    return new Response(
      'Lunary Notification Worker - Use POST /trigger to test',
      {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      },
    );
  },
};

// No filtering needed - your cosmic API already did the work!

function createNotificationFromEvent(event) {
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

function getPhaseGuidance(phaseName) {
  const guidance = {
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

function getPlanetEmoji(event) {
  const text = event.name || event.description || '';
  const emojis = {
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
