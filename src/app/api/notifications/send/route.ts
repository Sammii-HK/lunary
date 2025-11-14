import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

import { trackNotificationEvent } from '@/lib/analytics/tracking';

// Lazy initialization of VAPID keys (only when actually needed)
function ensureVapidConfigured() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error(
      'VAPID keys not configured. Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in your environment variables.',
    );
  }

  webpush.setVapidDetails('mailto:info@lunary.app', publicKey, privateKey);
}

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
    // Configure VAPID keys when actually needed (not at module load time)
    ensureVapidConfigured();

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

    // Map event types to preference keys
    const getPreferenceKey = (eventType: string): string | null => {
      const mapping: Record<string, string> = {
        moon: 'moonPhases',
        moon_phase: 'moonPhases',
        aspect: 'majorAspects',
        ingress: 'planetaryTransits',
        planetary_transit: 'planetaryTransits',
        retrograde: 'retrogrades',
        seasonal: 'sabbats',
        sabbat: 'sabbats',
        eclipse: 'eclipses',
      };
      return mapping[eventType] || null;
    };

    let subscriptions;
    const eventType = payload.data?.eventType || payload.type;
    const preferenceKey = eventType ? getPreferenceKey(eventType) : null;

    if (preferenceKey) {
      // Filter by event type preference
      subscriptions = await sql`
        SELECT endpoint, p256dh, auth, user_id, preferences
        FROM push_subscriptions 
        WHERE is_active = true 
        AND preferences->>${preferenceKey} = 'true'
      `;
    } else {
      // Get all active subscriptions (fallback if no mapping found)
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
        'preference key:',
        preferenceKey,
      );
      return NextResponse.json({
        success: true,
        message: `No subscribers for event type: ${eventType}`,
        recipientCount: 0,
      });
    }

      console.log(`📱 Sending to ${subscriptions.rows.length} subscribers`);

      // Send notifications using web-push
      const notificationType =
        payload.data?.eventType || payload.type || 'notification';

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

        if (sub.user_id) {
          await trackNotificationEvent({
            userId: sub.user_id,
            notificationType,
            eventType: 'sent',
            notificationId: payload.data?.notification_id,
            metadata: {
              endpoint: sub.endpoint,
              delivery: 'push',
            },
          });
        }

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
