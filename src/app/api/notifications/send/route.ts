import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

import { trackNotificationEvent } from '@/lib/analytics/tracking';
import { queueAnalyticsEvent } from '@/lib/discord';
import {
  getSentEvents,
  markEventAsSent,
  cleanupOldDates,
} from '@/app/api/cron/shared-notification-tracker';

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

function createEventKeyFromPayload(payload: NotificationPayload): string {
  const eventType = payload.data?.eventType || payload.type || 'unknown';
  const eventName = payload.data?.eventName || payload.title || 'unknown';
  const priority = payload.data?.priority ?? 0;
  return `${eventType}-${eventName}-${priority}`;
}

export async function POST(request: NextRequest) {
  let payloadForError: NotificationPayload | undefined;
  try {
    // Configure VAPID keys when actually needed (not at module load time)
    ensureVapidConfigured();

    const { payload: requestPayload }: { payload: NotificationPayload } =
      await request.json();

    if (!requestPayload) {
      return NextResponse.json(
        { error: 'Payload is required' },
        { status: 400 },
      );
    }

    const payload: NotificationPayload = requestPayload;
    payloadForError = payload;

    const today = new Date().toISOString().split('T')[0];
    const eventKey = createEventKeyFromPayload(payload);

    await cleanupOldDates(1);

    const sentEvents = await getSentEvents(today);
    if (sentEvents.has(eventKey)) {
      console.log(
        `⏭️ Event ${eventKey} already sent today, skipping duplicate`,
      );
      return NextResponse.json({
        success: true,
        message: `Event already sent today (duplicate prevented)`,
        recipientCount: 0,
        skipped: true,
        eventKey,
      });
    }

    // Get all subscriptions from database that want this type of notification
    // const subscriptions = await db.subscriptions.findMany({
    //   where: {
    //     [`preferences.${payload.type}`]: true
    //   }
    // });

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
          title: 'View',
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
    // Map notification types to analytics-friendly names
    const typeMapping: Record<string, string> = {
      moon_phase: 'moon_circle',
      planetary_transit: 'cosmic_pulse',
      retrograde: 'cosmic_pulse',
      major_aspect: 'cosmic_pulse',
      eclipse: 'cosmic_pulse',
      sabbat: 'cosmic_pulse',
      cosmic_pulse: 'cosmic_pulse',
      moon_circle: 'moon_circle',
      weekly_report: 'weekly_report',
      personalized_tarot: 'cosmic_pulse',
      cosmic_changes: 'cosmic_pulse',
    };

    const rawType = payload.data?.eventType || payload.type || 'notification';
    const notificationType = typeMapping[rawType] || 'cosmic_pulse';

    const timeSpecificTypes = [
      'retrograde',
      'planetary_transit',
      'major_aspect',
      'eclipse',
      'sabbat',
      'moon_phase',
    ];
    const isTimeSpecific =
      timeSpecificTypes.includes(payload.type) ||
      timeSpecificTypes.includes(payload.data?.eventType || '');

    const nonTimeSpecificTypes = [
      'cosmic_pulse',
      'cosmic_changes',
      'moon_circle',
      'weekly_report',
      'personalized_tarot',
    ];
    const isScheduledNotification =
      nonTimeSpecificTypes.includes(payload.type) ||
      nonTimeSpecificTypes.includes(payload.data?.eventType || '') ||
      payload.data?.isScheduled === true;

    function shouldSendPwaNotification(): boolean {
      if (isTimeSpecific) return true;

      if (isScheduledNotification) {
        const now = new Date();
        const hour = now.getUTCHours();
        const isQuietHours = hour >= 22 || hour < 8;
        return !isQuietHours;
      }

      const now = new Date();
      const hour = now.getUTCHours();
      const isQuietHours = hour >= 22 || hour < 8;
      return !isQuietHours;
    }

    if (!shouldSendPwaNotification()) {
      console.log(
        `[notifications] Skipped during quiet hours: ${payload.type}`,
      );
      return NextResponse.json({
        success: true,
        message: `Notification skipped (quiet hours)`,
        recipientCount: subscriptions.rows.length,
        skipped: true,
      });
    }

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

        // Track notification sent (use user_id if available, otherwise use endpoint hash)
        try {
          await trackNotificationEvent({
            userId: sub.user_id || `anon_${sub.endpoint.slice(-20)}`,
            notificationType,
            eventType: 'sent',
            notificationId: payload.data?.notification_id,
            metadata: {
              endpoint: sub.endpoint,
              delivery: 'push',
              raw_type: rawType,
            },
          });
        } catch (trackError) {
          // Don't fail notification send if tracking fails
          console.error(
            '[notifications] Failed to track sent event:',
            trackError,
          );
        }

        return { success: true, endpoint: sub.endpoint };
      } catch (error) {
        const errorObj = error as any;
        const statusCode = errorObj?.statusCode;
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        const endpointPreview = sub.endpoint.substring(0, 50);

        // Enhanced error logging
        console.error(
          `❌ Failed to send notification to ${endpointPreview}...`,
          {
            endpoint: endpointPreview,
            userId: sub.user_id || 'anonymous',
            statusCode,
            error: errorMessage,
            errorType: errorObj?.name || 'Unknown',
            notificationType,
            timestamp: new Date().toISOString(),
          },
        );

        // If subscription is invalid, mark as inactive
        const isExpired =
          statusCode === 410 ||
          statusCode === 404 ||
          errorMessage.includes('410') ||
          errorMessage.includes('404') ||
          errorMessage.includes('invalid') ||
          errorMessage.includes('expired') ||
          errorMessage.includes('unsubscribed') ||
          errorMessage.includes('Gone') ||
          errorMessage.includes('Not Found');

        if (isExpired) {
          console.log(
            `🔄 Marking subscription as inactive due to ${statusCode || 'expired'}: ${endpointPreview}...`,
          );
          await sql`
            UPDATE push_subscriptions 
            SET is_active = false, updated_at = NOW()
            WHERE endpoint = ${sub.endpoint}
          `;
        }

        return {
          success: false,
          endpoint: sub.endpoint,
          error: errorMessage,
          statusCode,
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

    if (successful > 0) {
      const eventType = payload.data?.eventType || payload.type || 'unknown';
      const eventName = payload.data?.eventName || payload.title || 'unknown';
      const priority = payload.data?.priority ?? 0;

      await markEventAsSent(
        today,
        eventKey,
        eventType,
        eventName,
        priority,
        payload.data?.checkType === '4-hourly' ? '4-hourly' : 'daily',
      );
    }

    const truncate = (value: string | undefined, max: number) => {
      if (!value) return value;
      return value.length > max ? `${value.slice(0, max - 3)}...` : value;
    };

    const discordFields: { name: string; value: string; inline?: boolean }[] =
      [];

    if (eventType) {
      discordFields.push({
        name: 'Event Type',
        value: String(eventType),
        inline: true,
      });
    }

    if (payload.data?.priority !== undefined) {
      discordFields.push({
        name: 'Priority',
        value: String(payload.data.priority),
        inline: true,
      });
    }

    discordFields.push({
      name: 'Recipients',
      value: String(subscriptions.rows.length),
      inline: true,
    });

    discordFields.push({
      name: 'Delivered',
      value: `${successful} ok / ${failed} failed`,
      inline: true,
    });

    const footerParts: string[] = [];

    if (payload.data?.eventName) {
      footerParts.push(payload.data.eventName);
    }

    if (payload.data?.date) {
      footerParts.push(payload.data.date);
    }

    if (payload.data?.source) {
      footerParts.push(`Source: ${payload.data.source}`);
    }

    if (successful > 0 && subscriptions.rows.length >= 10) {
      await queueAnalyticsEvent({
        category: 'analytics',
        eventType: 'cosmic_alert',
        title: payload.title,
        dedupeKey: `cosmic-alert-${payload.type}-${payload.data?.date || new Date().toISOString().split('T')[0]}`,
        metadata: {
          content: `Cosmic alert: ${payload.title}`,
          description: truncate(payload.body, 1500),
          url: payload.data?.url,
          fields: discordFields,
          footer: footerParts.length ? footerParts.join(' • ') : undefined,
          recipientCount: subscriptions.rows.length,
          successful,
          failed,
        },
      });
    }

    return NextResponse.json({
      success: successful > 0,
      message: `Notification sent for ${payload.type}`,
      recipientCount: subscriptions.rows.length,
      successful,
      failed,
      payload: notificationData,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error sending notifications:', {
      error: errorMessage,
      errorType: error instanceof Error ? error.name : 'Unknown',
      payloadType: payloadForError?.type,
      hasVapidKeys: !!(
        process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
      ),
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      {
        error: 'Failed to send notifications',
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}
