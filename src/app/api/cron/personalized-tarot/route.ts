import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import webpush from 'web-push';
import { getTarotCard } from '../../../../../utils/tarot/tarot';

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

// This endpoint sends personalized daily tarot notifications
export async function GET(request: NextRequest) {
  try {
    // Configure VAPID keys when actually needed (not at module load time)
    ensureVapidConfigured();

    // Verify cron request
    // Vercel cron jobs send x-vercel-cron header, allow those
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const authHeader = request.headers.get('authorization');

    // If not from Vercel cron, require CRON_SECRET
    if (!isVercelCron) {
      if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const dateStr = todayString;

    console.log('🔮 Sending personalized tarot notifications for:', dateStr);

    // Get all active subscriptions that have tarot notifications enabled
    // and have user data (birthday) stored in preferences
    const subscriptions = await sql`
      SELECT endpoint, p256dh, auth, user_id, preferences
      FROM push_subscriptions 
      WHERE is_active = true 
      AND (
        preferences->>'tarotNotifications' = 'true'
        OR (preferences->>'tarotNotifications')::boolean = true
      )
      AND preferences->>'birthday' IS NOT NULL
      AND preferences->>'birthday' != ''
    `;

    if (subscriptions.rows.length === 0) {
      console.log('📭 No active tarot notification subscriptions found');
      return NextResponse.json({
        success: true,
        notificationsSent: 0,
        message: 'No subscribers for personalized tarot notifications',
      });
    }

    console.log(
      `🔮 Sending personalized tarot to ${subscriptions.rows.length} subscribers`,
    );

    // Send personalized notifications
    const results = [];
    let totalSent = 0;
    let totalFailed = 0;

    for (const sub of subscriptions.rows) {
      try {
        const preferences = sub.preferences || {};
        const birthday = preferences.birthday as string;
        const userName = (preferences.name as string) || undefined;

        if (!birthday) {
          console.log(`⚠️ Skipping subscription ${sub.user_id} - no birthday`);
          continue;
        }

        // Get personalized daily tarot card
        const dailyCard = getTarotCard(
          `daily-${todayString}`,
          userName,
          birthday,
        );

        const now = new Date();
        const hour = now.getUTCHours();
        const isQuietHours = hour >= 22 || hour < 8;

        if (isQuietHours) {
          console.log(
            `[personalized-tarot] Skipped during quiet hours (${hour}:00 UTC) for ${sub.user_id}`,
          );
          continue;
        }

        // Create personalized notification
        const notification = {
          title: `🔮 Your Daily Tarot: ${dailyCard.name}`,
          body: `${dailyCard.keywords[0]} - ${dailyCard.information.substring(0, 100)}${dailyCard.information.length > 100 ? '...' : ''}`,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          vibrate: [200, 100, 200],
          tag: 'lunary-personalized-tarot',
          data: {
            url: '/tarot',
            type: 'personalized_tarot',
            date: dateStr,
            cardName: dailyCard.name,
            isScheduled: true,
          },
          actions: [
            {
              action: 'view',
              title: 'View in Lunary',
              icon: '/icons/icon-72x72.png',
            },
          ],
        };

        // Send notification
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify(notification),
        );

        // Update last notification sent timestamp
        await sql`
          UPDATE push_subscriptions 
          SET last_notification_sent = NOW() 
          WHERE endpoint = ${sub.endpoint}
        `;

        totalSent++;
        results.push({
          success: true,
          endpoint: sub.endpoint.substring(0, 50),
          userName: userName || 'Unknown',
        });
      } catch (error) {
        console.error(
          `Failed to send tarot notification to ${sub.endpoint.substring(0, 50)}...`,
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

        totalFailed++;
        results.push({
          success: false,
          endpoint: sub.endpoint.substring(0, 50),
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(
      `✅ Personalized tarot notifications: ${totalSent} successful, ${totalFailed} failed`,
    );

    return NextResponse.json({
      success: totalSent > 0,
      notificationsSent: totalSent,
      failed: totalFailed,
      totalSubscribers: subscriptions.rows.length,
      results,
      date: dateStr,
    });
  } catch (error) {
    console.error('❌ Personalized tarot notification cron failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
