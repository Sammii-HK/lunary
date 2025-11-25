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
    const hour = new Date().getHours();
    const isMorning = hour >= 6 && hour < 14;

    console.log(
      '🔔 Checking for ritual reminders:',
      today,
      isMorning ? 'morning' : 'evening',
    );

    // Get users who haven't completed their ritual today
    const usersNeedingReminder = await sql`
      SELECT DISTINCT ps.user_id, ps.endpoint, ps.p256dh, ps.auth, ps.preferences, us.ritual_streak
      FROM push_subscriptions ps
      LEFT JOIN user_streaks us ON us.user_id = ps.user_id
      LEFT JOIN ritual_habits rh ON rh.user_id = ps.user_id 
        AND rh.habit_date = ${today}::DATE 
        AND rh.ritual_type = ${isMorning ? 'morning' : 'evening'}
        AND rh.completed = TRUE
      WHERE ps.is_active = true
      AND rh.user_id IS NULL
      AND (
        ps.preferences->>'engagementReminders' = 'true'
        OR ps.preferences->>'engagementReminders' IS NULL
      )
      LIMIT 100
    `;

    if (usersNeedingReminder.rows.length === 0) {
      return NextResponse.json({
        success: true,
        notificationsSent: 0,
        message: 'No users needing ritual reminders',
      });
    }

    console.log(
      `📱 Sending ritual reminders to ${usersNeedingReminder.rows.length} users`,
    );

    let successful = 0;
    let failed = 0;

    for (const sub of usersNeedingReminder.rows) {
      try {
        const preferences = sub.preferences || {};
        const userName = (preferences.name as string)?.split(' ')[0] || 'there';
        const ritualStreak = sub.ritual_streak || 0;

        const ritualType = isMorning ? 'morning' : 'evening';
        const title = isMorning
          ? '🌅 Time for your morning ritual'
          : '🌙 Time for your evening ritual';

        const body =
          ritualStreak > 0
            ? `${userName}, don't break your ${ritualStreak}-day ritual streak! Complete your ${ritualType} ritual today.`
            : `${userName}, complete your ${ritualType} ritual to start building your streak.`;

        const notification = {
          title,
          body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: `ritual-reminder-${ritualType}`,
          data: {
            url: '/book-of-shadows',
            ritualType,
          },
          actions: [
            {
              action: 'complete',
              title: 'Complete Ritual',
              icon: '/icons/icon-72x72.png',
            },
          ],
          vibrate: [200, 100, 200],
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
          `Failed to send ritual reminder to ${sub.endpoint?.substring(0, 50)}...`,
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

    return NextResponse.json({
      success: true,
      notificationsSent: successful,
      failed,
      total: usersNeedingReminder.rows.length,
      ritualType: isMorning ? 'morning' : 'evening',
    });
  } catch (error) {
    console.error('[Ritual Reminders] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
