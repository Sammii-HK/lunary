import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import webpush from 'web-push';

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

export async function GET(request: NextRequest) {
  try {
    ensureVapidConfigured();

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

    const today = new Date().toISOString().split('T')[0];
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    console.log('🔔 Checking for engagement notifications:', today);

    const subscriptions = await sql`
      SELECT endpoint, p256dh, auth, user_id, preferences, last_notification_sent
      FROM push_subscriptions
      WHERE is_active = true
      AND preferences->>'engagementReminders' = 'true'
      AND (
        last_notification_sent IS NULL
        OR last_notification_sent < ${threeDaysAgo.toISOString()}
      )
      LIMIT 100
    `;

    if (subscriptions.rows.length === 0) {
      return NextResponse.json({
        success: true,
        notificationsSent: 0,
        message: 'No subscribers needing engagement reminders',
      });
    }

    console.log(
      `📱 Sending engagement reminders to ${subscriptions.rows.length} subscribers`,
    );

    let successful = 0;
    let failed = 0;

    for (const sub of subscriptions.rows) {
      try {
        const preferences = sub.preferences || {};
        const userName = (preferences.name as string)?.split(' ')[0] || 'there';

        const notification = {
          title: `✨ New insights available`,
          body: `Hi ${userName}, haven't checked your horoscope in a while. New cosmic insights are waiting for you.`,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          vibrate: [200, 100, 200],
          tag: 'lunary-engagement',
          data: {
            url: '/',
            type: 'engagement',
            date: today,
          },
          actions: [
            {
              action: 'view',
              title: 'View',
              icon: '/icons/icon-72x72.png',
            },
          ],
        };

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

        await sql`
          UPDATE push_subscriptions 
          SET last_notification_sent = NOW() 
          WHERE endpoint = ${sub.endpoint}
        `;

        successful++;
      } catch (error) {
        console.error(
          `Failed to send engagement notification to ${sub.endpoint.substring(0, 50)}...`,
          error,
        );

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

        failed++;
      }
    }

    console.log(
      `✅ Engagement notifications: ${successful} successful, ${failed} failed`,
    );

    return NextResponse.json({
      success: successful > 0,
      notificationsSent: successful,
      failed,
      totalSubscribers: subscriptions.rows.length,
      date: today,
    });
  } catch (error) {
    console.error('❌ Engagement notification cron failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
