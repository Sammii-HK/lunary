import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import webpush from 'web-push';

// Configure VAPID keys
webpush.setVapidDetails(
  'mailto:info@lunary.app',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// This endpoint checks for significant astronomical events and sends notifications
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

    const today = new Date().toISOString().split('T')[0];
    console.log('🔔 Checking astronomical events for notifications:', today);

    // Fetch cosmic data using your existing API
    const cosmicData = await checkAstronomicalEvents(today);
    
    if (!cosmicData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch cosmic data' 
      });
    }

    const notifications = [];

    // Check if primary event is notification-worthy
    const primaryEvent = cosmicData.primaryEvent;
    if (primaryEvent && isNotificationWorthy(primaryEvent)) {
      const notification = createNotificationFromEvent(primaryEvent, cosmicData);
      notifications.push(notification);
    }

    // Check secondary events for high-priority items
    if (cosmicData.allEvents) {
      const significantEvents = cosmicData.allEvents
        .filter((event: any) => event.priority >= 8 && event !== primaryEvent)
        .slice(0, 2); // Limit to 2 additional notifications per day

      for (const event of significantEvents) {
        if (isNotificationWorthy(event)) {
          const notification = createNotificationFromEvent(event, cosmicData);
          notifications.push(notification);
        }
      }
    }

    // Send notifications
    const results = [];
    for (const notification of notifications) {
      try {
        const sendResult = await sendNotificationToSubscribers(notification);
        results.push(sendResult);
      } catch (error) {
        console.error('Failed to send notification:', error);
        results.push({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          notification: notification.title 
        });
      }
    }

    return NextResponse.json({
      success: true,
      date: today,
      primaryEvent: primaryEvent?.name,
      notificationsSent: notifications.length,
      results,
    });

  } catch (error) {
    console.error('Error checking astronomical events:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

async function checkAstronomicalEvents(date: string) {
  try {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://lunary.app' 
      : 'http://localhost:3000';
      
    const response = await fetch(`${baseUrl}/api/og/cosmic-post/${date}`, {
      headers: { 'User-Agent': 'Lunary-Notification-Service/1.0' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cosmic data: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching astronomical events:', error);
    return null;
  }
}

function isNotificationWorthy(event: any): boolean {
  // Only send notifications for significant events
  if (event.priority >= 9) return true; // Extraordinary planetary events
  
  // Moon phases (but not every day - only exact phases)
  if (event.type === 'moon' && event.priority === 10) {
    const significantPhases = ['New Moon', 'Full Moon', 'First Quarter', 'Last Quarter'];
    return significantPhases.some(phase => event.name.includes(phase));
  }
  
  // Seasonal events (equinoxes, solstices, sabbats)
  if (event.priority === 8) return true;
  
  // Major aspects involving outer planets
  if (event.type === 'aspect' && event.priority >= 7) {
    const outerPlanets = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    return outerPlanets.some(planet => 
      event.name?.includes(planet) || event.description?.includes(planet)
    );
  }

  return false;
}

function createNotificationFromEvent(event: any, cosmicData: any) {
  const baseNotification = {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      date: cosmicData.date,
      eventType: event.type,
      priority: event.priority,
    },
    actions: [
      {
        action: 'view',
        title: 'View in Lunary',
        icon: '/icons/icon-72x72.png'
      }
    ]
  };

  // Customize based on event type
  switch (event.type) {
    case 'moon':
      return {
        ...baseNotification,
        title: `${event.emoji || '🌙'} ${event.name}`,
        body: `${event.energy} - ${getPhaseGuidance(event.name)}`,
        tag: 'lunary-moon-phase',
        data: { ...baseNotification.data, phase: event.name }
      };

    case 'aspect':
      return {
        ...baseNotification,
        title: `${getPlanetEmoji(event)} ${event.name}`,
        body: `${event.energy} - Powerful cosmic alignment forming`,
        tag: 'lunary-planetary-aspect',
        data: { ...baseNotification.data, aspect: event.name }
      };

    case 'seasonal':
      return {
        ...baseNotification,
        title: `🌿 ${event.name}`,
        body: `${event.energy} - Seasonal energy shift begins`,
        tag: 'lunary-seasonal',
        data: { ...baseNotification.data, season: event.name }
      };

    case 'ingress':
      return {
        ...baseNotification,
        title: `${getPlanetEmoji(event)} ${event.name}`,
        body: `${event.energy} - New cosmic energy emerges`,
        tag: 'lunary-planetary-ingress',
        data: { ...baseNotification.data, ingress: event.name }
      };

    default:
      return {
        ...baseNotification,
        title: `✨ ${event.name}`,
        body: event.energy || 'Significant cosmic event occurring',
        tag: 'lunary-cosmic-event',
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
    'Mercury': '☿',
    'Venus': '♀',
    'Mars': '♂',
    'Jupiter': '♃',
    'Saturn': '♄',
    'Uranus': '♅',
    'Neptune': '♆',
    'Pluto': '♇',
    'Sun': '☉',
    'Moon': '☽'
  };
  
  for (const [planet, emoji] of Object.entries(emojis)) {
    if (text.includes(planet)) return emoji;
  }
  
  return '⭐';
}

async function sendNotificationToSubscribers(notification: any) {
  try {
    console.log('📤 Sending notification:', notification.title);
    
    // Get the event type to filter subscriptions by preferences
    const eventType = notification.data?.eventType;
    
    // Fetch active subscriptions from PostgreSQL based on preferences
    let subscriptions;
    if (eventType) {
      // Filter by event type preference
      subscriptions = await sql`
        SELECT endpoint, p256dh, auth, user_id, preferences
        FROM push_subscriptions 
        WHERE is_active = true 
        AND preferences->>${eventType} = 'true'
      `;
    } else {
      // Get all active subscriptions
      subscriptions = await sql`
        SELECT endpoint, p256dh, auth, user_id, preferences
        FROM push_subscriptions 
        WHERE is_active = true
      `;
    }
    
    if (subscriptions.rows.length === 0) {
      console.log('📭 No active push subscriptions found for event type:', eventType);
      return {
        success: true,
        notification: notification.title,
        recipientCount: 0,
        message: 'No subscribers for this event type'
      };
    }

    console.log(`📱 Sending to ${subscriptions.rows.length} subscribers`);

    // Send notifications using web-push
    const sendPromises = subscriptions.rows.map(async (sub: any) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { 
              p256dh: sub.p256dh, 
              auth: sub.auth 
            }
          },
          JSON.stringify(notification)
        );
        
        // Update last notification sent timestamp
        await sql`
          UPDATE push_subscriptions 
          SET last_notification_sent = NOW() 
          WHERE endpoint = ${sub.endpoint}
        `;
        
        return { success: true, endpoint: sub.endpoint };
      } catch (error) {
        console.error(`Failed to send to ${sub.endpoint.substring(0, 50)}...`, error);
        
        // If subscription is invalid, mark as inactive
        if (error instanceof Error && (
          error.message.includes('410') || 
          error.message.includes('invalid') ||
          error.message.includes('expired')
        )) {
          await sql`
            UPDATE push_subscriptions 
            SET is_active = false 
            WHERE endpoint = ${sub.endpoint}
          `;
        }
        
        return { success: false, endpoint: sub.endpoint, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    const results = await Promise.allSettled(sendPromises);
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;
    
    console.log(`✅ Notification sent: ${successful} successful, ${failed} failed`);
    
    return {
      success: successful > 0,
      notification: notification.title,
      recipientCount: subscriptions.rows.length,
      successful,
      failed,
      results: results.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: 'Promise rejected' })
    };
    
  } catch (error) {
    console.error('Error sending notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      notification: notification.title
    };
  }
}
