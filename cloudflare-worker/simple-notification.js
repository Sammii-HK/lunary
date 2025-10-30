/**
 * SIMPLE Cloudflare Worker for Lunary Push Notifications
 * If your cosmic API says there's a primary event, we send it. That's it.
 */

export default {
  async scheduled(event, env, ctx) {
    console.log('🔔 Simple notification check started');

    try {
      const today = new Date().toISOString().split('T')[0];

      // Get cosmic data from your API
      const response = await fetch(
        `https://www.lunary.app/api/og/cosmic-post/${today}`,
      );
      const cosmicData = await response.json();

      console.log('📡 Cosmic data received');
      console.log('🎯 Primary event:', cosmicData.primaryEvent?.name);
      console.log('📊 All events count:', cosmicData.allEvents?.length || 0);

      const notifications = [];
      let totalSent = 0;

      // PRIMARY EVENT - Always send if it exists (your API already chose it!)
      if (cosmicData.primaryEvent?.name) {
        const primaryNotification = {
          type: getEventType(
            cosmicData.primaryEvent,
            cosmicData.astronomicalData,
          ),
          title: createTitle(cosmicData.primaryEvent),
          body: createBody(cosmicData.primaryEvent),
          data: {
            date: today,
            eventName: cosmicData.primaryEvent.name,
            energy: cosmicData.primaryEvent.energy,
            eventType: 'primary',
            isPrimary: true,
          },
        };

        console.log('📤 Sending primary event:', primaryNotification.title);
        notifications.push(primaryNotification);
      }

      // SEND ALL HIGHLIGHTS AS NOTIFICATIONS (multiple per day!)
      if (cosmicData.highlights && Array.isArray(cosmicData.highlights)) {
        console.log(`📋 Processing ${cosmicData.highlights.length} highlights`);

        // Send notifications for interesting highlights (skip primary event)
        const interestingHighlights = cosmicData.highlights
          .filter(
            (highlight) =>
              typeof highlight === 'string' &&
              !highlight.includes(cosmicData.primaryEvent?.name) && // Don't duplicate primary
              highlight.length > 20, // Skip short/empty highlights
          )
          .slice(0, 3); // Max 3 additional per check

        console.log(
          `📋 Found ${interestingHighlights.length} additional events`,
        );

        for (const highlight of interestingHighlights) {
          const notification = {
            type: 'cosmic_event',
            title: getHighlightTitle(highlight),
            body:
              highlight.length > 120
                ? `${highlight.substring(0, 117)}...`
                : highlight,
            data: {
              date: today,
              eventName: 'Cosmic Highlight',
              eventType: 'highlight',
              content: highlight,
            },
          };

          console.log('📤 Sending highlight:', notification.title);
          notifications.push(notification);
        }
      }

      // Send all notifications
      const results = [];
      for (const notification of notifications) {
        try {
          const sendResponse = await fetch(
            'https://www.lunary.app/api/notifications/send',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${env.CRON_SECRET}`,
              },
              body: JSON.stringify({ payload: notification }),
            },
          );

          const result = await sendResponse.json();
          totalSent += result.recipientCount || 0;
          results.push(result);
          console.log(
            `✅ Sent "${notification.title}" to ${result.recipientCount || 0} subscribers`,
          );
        } catch (error) {
          console.error('❌ Failed to send notification:', error);
          results.push({ success: false, error: error.message });
        }
      }

      return new Response(
        JSON.stringify({
          success: totalSent > 0,
          notificationsSent: totalSent,
          primaryEvent: cosmicData.primaryEvent?.name,
          secondaryEvents: notifications.length - 1,
          results,
          checkTime: new Date().toISOString(),
        }),
      );
    } catch (error) {
      console.error('❌ Notification worker failed:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
          checkTime: new Date().toISOString(),
        }),
        { status: 500 },
      );
    }
  },

  // Handle manual triggers
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/trigger' && request.method === 'POST') {
      return this.scheduled(null, env, ctx);
    }

    return new Response(
      'Simple Lunary Notification Worker - POST /trigger to test',
    );
  },
};

function getEventType(event, astronomicalData) {
  return astronomicalData?.primaryEvent?.type || 'cosmic_event';
}

function createTitle(event) {
  const name = event.name;

  // Add appropriate emoji based on event type
  if (name.includes('Moon')) return `🌙 ${name}`;
  if (name.includes('Mercury')) return `☿ ${name}`;
  if (name.includes('Venus')) return `♀ ${name}`;
  if (name.includes('Mars')) return `♂ ${name}`;
  if (name.includes('Jupiter')) return `♃ ${name}`;
  if (name.includes('Saturn')) return `♄ ${name}`;
  if (name.includes('retrograde')) return `🔄 ${name}`;
  if (name.includes('enters')) return `🚀 ${name}`;

  return `✨ ${name}`;
}

function createBody(event) {
  const energy = event.energy || 'Cosmic event occurring';

  // Add guidance based on event type
  if (event.name.includes('New Moon')) {
    return `${energy} - Perfect time for new beginnings and intention setting`;
  }
  if (event.name.includes('Full Moon')) {
    return `${energy} - Time for release, gratitude, and manifestation`;
  }
  if (event.name.includes('First Quarter')) {
    return `${energy} - Take action on your intentions and push forward`;
  }
  if (event.name.includes('Last Quarter')) {
    return `${energy} - Release what no longer serves and reflect`;
  }
  if (event.name.includes('retrograde')) {
    return `${energy} - Time for reflection and review`;
  }
  if (event.name.includes('enters')) {
    return `${energy} - New cosmic energy emerges`;
  }

  return `${energy} - Significant cosmic shift occurring`;
}

function getHighlightTitle(highlight) {
  // Extract meaningful title from highlight string
  if (highlight.includes('retrograde')) return '🔄 Planetary Retrograde';
  if (highlight.includes('enters')) return '🚀 Planetary Ingress';
  if (highlight.includes('conjunction')) return '✨ Planetary Conjunction';
  if (highlight.includes('opposition')) return '⚡ Planetary Opposition';
  if (highlight.includes('square')) return '🔥 Planetary Square';
  if (highlight.includes('trine')) return '🌟 Planetary Trine';

  return '🌌 Cosmic Event';
}
