import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Configure VAPID keys from environment variables
webpush.setVapidDetails(
  'mailto:info@lunary.app',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

interface NotificationPayload {
  type:
    | 'moon_phase'
    | 'planetary_transit'
    | 'retrograde'
    | 'sabbat'
    | 'eclipse'
    | 'major_aspect';
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
}

// Function to check for notification-worthy events using existing cosmic API
async function checkAstronomicalEvents(
  date: string = new Date().toISOString().split('T')[0],
) {
  try {
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/og/cosmic-post/${date}`, {
      headers: { 'User-Agent': 'Lunary-Notification-Service/1.0' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cosmic data: ${response.status}`);
    }

    const cosmicData = await response.json();
    return cosmicData;
  } catch (error) {
    console.error('Error fetching astronomical events:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { payload }: { payload: NotificationPayload } = await request.json();

    // Get all subscriptions from database that want this type of notification
    // const subscriptions = await db.subscriptions.findMany({
    //   where: {
    //     [`preferences.${payload.type}`]: true
    //   }
    // });

    // For demo purposes, we'll just log the notification
    console.log('Sending cosmic notification:', payload);

    const notificationData = {
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/icon-72x72.png',
      tag: `lunary-${payload.type}`,
      data: {
        url: '/',
        type: payload.type,
        ...payload.data,
      },
      actions: [
        {
          action: 'view',
          title: 'View in Lunary',
          icon: '/icons/icon-72x72.png',
        },
      ],
      vibrate: [200, 100, 200, 100, 200],
    };

    // Get active subscriptions from PostgreSQL
    const { sql } = await import('@vercel/postgres');

    let subscriptions;
    const eventType = payload.data?.eventType || payload.type;

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
      console.log(
        '📭 No active push subscriptions found for event type:',
        eventType,
      );
      return NextResponse.json({
        success: true,
        message: `No subscribers for event type: ${eventType}`,
        recipientCount: 0,
      });
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
              auth: sub.auth,
            },
          },
          JSON.stringify(notificationData),
        );

        // Update last notification sent timestamp
        await sql`
          UPDATE push_subscriptions 
          SET last_notification_sent = NOW() 
          WHERE endpoint = ${sub.endpoint}
        `;

        return { success: true, endpoint: sub.endpoint };
      } catch (error) {
        console.error(
          `Failed to send to ${sub.endpoint.substring(0, 50)}...`,
          error,
        );

        // If subscription is invalid, mark as inactive
        if (
          error instanceof Error &&
          (error.message.includes('410') ||
            error.message.includes('invalid') ||
            error.message.includes('expired'))
        ) {
          await sql`
            UPDATE push_subscriptions 
            SET is_active = false 
            WHERE endpoint = ${sub.endpoint}
          `;
        }

        return {
          success: false,
          endpoint: sub.endpoint,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    const results = await Promise.allSettled(sendPromises);
    const successful = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success,
    ).length;
    const failed = results.length - successful;

    console.log(
      `✅ Notification sent: ${successful} successful, ${failed} failed`,
    );

    return NextResponse.json({
      success: successful > 0,
      message: `Notification sent for ${payload.type}`,
      recipientCount: subscriptions.rows.length,
      successful,
      failed,
      payload: notificationData,
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 },
    );
  }
}

// Example astronomical event notifications
export const astronomicalNotifications = {
  newMoon: (date: string, sign: string) => ({
    type: 'moon_phase' as const,
    title: '🌑 New Moon',
    body: `New Moon in ${sign} - Perfect time for new beginnings and intention setting`,
    data: { date, sign, phase: 'new' },
  }),

  fullMoon: (date: string, sign: string) => ({
    type: 'moon_phase' as const,
    title: '🌕 Full Moon',
    body: `Full Moon in ${sign} - Time for release, gratitude, and manifestation`,
    data: { date, sign, phase: 'full' },
  }),

  planetaryIngress: (planet: string, sign: string, date: string) => ({
    type: 'planetary_transit' as const,
    title: `${getPlanetEmoji(planet)} ${planet} enters ${sign}`,
    body: `${planet} moves into ${sign} - New cosmic energy shift begins`,
    data: { planet, sign, date, event: 'ingress' },
  }),

  retrograde: (planet: string, startDate: string, endDate: string) => ({
    type: 'retrograde' as const,
    title: `${getPlanetEmoji(planet)} ${planet} Retrograde`,
    body: `${planet} stations retrograde - Time for reflection and review in ${planet.toLowerCase()} themes`,
    data: { planet, startDate, endDate, event: 'retrograde_start' },
  }),

  retrogradeEnd: (planet: string, date: string) => ({
    type: 'retrograde' as const,
    title: `${getPlanetEmoji(planet)} ${planet} Direct`,
    body: `${planet} stations direct - Forward momentum returns`,
    data: { planet, date, event: 'retrograde_end' },
  }),

  sabbat: (sabbat: string, date: string, description: string) => ({
    type: 'sabbat' as const,
    title: `🌿 ${sabbat}`,
    body: description,
    data: { sabbat, date, season: getSeason(sabbat) },
  }),

  eclipse: (type: 'solar' | 'lunar', sign: string, date: string) => ({
    type: 'eclipse' as const,
    title: `${type === 'solar' ? '☀️' : '🌙'} ${type.charAt(0).toUpperCase() + type.slice(1)} Eclipse`,
    body: `${type.charAt(0).toUpperCase() + type.slice(1)} Eclipse in ${sign} - Major transformation portal opens`,
    data: { type, sign, date, intensity: 'high' },
  }),

  majorAspect: (
    planet1: string,
    aspect: string,
    planet2: string,
    date: string,
  ) => ({
    type: 'major_aspect' as const,
    title: `${getPlanetEmoji(planet1)} ${planet1} ${aspect} ${getPlanetEmoji(planet2)} ${planet2}`,
    body: `Significant ${aspect} aspect forming - Powerful cosmic alignment`,
    data: { planet1, planet2, aspect, date },
  }),
};

function getPlanetEmoji(planet: string): string {
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
  return emojis[planet] || '⭐';
}

function getSeason(sabbat: string): string {
  const seasons: Record<string, string> = {
    Samhain: 'autumn',
    Yule: 'winter',
    Imbolc: 'winter',
    Ostara: 'spring',
    Beltane: 'spring',
    Litha: 'summer',
    Lughnasadh: 'summer',
    Mabon: 'autumn',
  };
  return seasons[sabbat] || 'transition';
}
