import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import webpush from 'web-push';
import {
  detectCosmicChanges,
  formatChangeNotification,
  getNotificationTitle,
} from '@/lib/cosmic-snapshot/changes';
import { sendEmail } from '@/lib/email';

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

export const runtime = 'nodejs';

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

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = now.toISOString().split('T')[0];

    console.log('[cosmic-changes-notification] Checking for changes:', dateStr);

    const eventKey = `cosmic-changes-${dateStr}`;
    const alreadySent = await sql`
      SELECT id FROM notification_sent_events 
      WHERE date = ${dateStr}::date 
      AND event_key = ${eventKey}
    `;

    if (alreadySent.rows.length > 0) {
      console.log('[cosmic-changes-notification] Already sent today, skipping');
      return NextResponse.json({
        success: true,
        notificationsSent: 0,
        message: 'Already sent today',
        date: dateStr,
      });
    }

    const subscriptions = await sql`
      SELECT DISTINCT user_id, user_email, endpoint, p256dh, auth, preferences
      FROM push_subscriptions
      WHERE is_active = true
      AND (
        preferences->>'cosmicChanges' = 'true'
        OR preferences->>'cosmicChanges' IS NULL
      )
      AND (
        preferences->>'birthday' IS NOT NULL 
        AND preferences->>'birthday' != ''
      )
    `;

    if (subscriptions.rows.length === 0) {
      console.log('[cosmic-changes-notification] No subscribers found');
      return NextResponse.json({
        success: true,
        notificationsSent: 0,
        message: 'No subscribers for cosmic changes',
      });
    }

    console.log(
      `[cosmic-changes-notification] Processing ${subscriptions.rows.length} subscribers`,
    );

    let notificationsSent = 0;
    let notificationsFailed = 0;
    let emailsSent = 0;

    for (const sub of subscriptions.rows) {
      try {
        const userId = sub.user_id;

        let isPayingUser = false;
        try {
          const subscriptionResult = await sql`
            SELECT status FROM subscriptions 
            WHERE user_id = ${userId} 
            AND status IN ('active', 'trial')
            ORDER BY created_at DESC 
            LIMIT 1
          `;
          isPayingUser = subscriptionResult.rows.length > 0;
        } catch (error) {
          console.error(
            '[cosmic-changes] Failed to check subscription:',
            error,
          );
        }

        const changes = await detectCosmicChanges(
          userId,
          now,
          yesterday,
          isPayingUser,
        );

        if (changes.length === 0) {
          continue;
        }

        const notificationText = formatChangeNotification(changes);
        const notificationTitle = getNotificationTitle(changes);
        const baseUrl =
          process.env.NODE_ENV === 'production'
            ? 'https://lunary.app'
            : 'http://localhost:3000';

        const pushNotification = {
          title: notificationTitle,
          body: notificationText,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          vibrate: [200, 100, 200],
          tag: 'lunary-cosmic-changes',
          data: {
            url: `${baseUrl}/cosmic-state`,
            type: 'cosmic_changes',
            date: dateStr,
          },
          actions: [
            {
              action: 'view',
              title: 'View Changes',
              icon: '/icons/icon-72x72.png',
            },
          ],
        };

        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            JSON.stringify(pushNotification),
          );

          notificationsSent++;

          if (sub.user_email) {
            try {
              await sendEmail({
                to: sub.user_email,
                subject: notificationTitle,
                html: `
                  <h2>${notificationTitle}</h2>
                  <p>${notificationText}</p>
                  <p><a href="${baseUrl}/cosmic-state">View your cosmic state →</a></p>
                `,
                text: `${notificationTitle}\n\n${notificationText}\n\nView your cosmic state: ${baseUrl}/cosmic-state`,
              });

              emailsSent++;
            } catch (emailError) {
              console.error(
                `Failed to send email to ${sub.user_email}:`,
                emailError,
              );
            }
          }
        } catch (pushError) {
          console.error(
            `Failed to send push to ${sub.endpoint.substring(0, 50)}...`,
            pushError,
          );

          if (
            pushError instanceof Error &&
            (pushError.message.includes('410') ||
              pushError.message.includes('invalid') ||
              pushError.message.includes('expired'))
          ) {
            await sql`
              UPDATE push_subscriptions 
              SET is_active = false 
              WHERE endpoint = ${sub.endpoint}
            `;
          }

          notificationsFailed++;
        }
      } catch (error) {
        console.error(
          `Error processing subscription for ${sub.user_id}:`,
          error,
        );
      }
    }

    if (notificationsSent > 0 || emailsSent > 0) {
      await sql`
        INSERT INTO notification_sent_events (date, event_key, event_type, event_name, event_priority, sent_by)
        VALUES (${dateStr}::date, ${eventKey}, 'cosmic_changes', 'Cosmic Changes Notification', 6, 'daily')
        ON CONFLICT (date, event_key) DO NOTHING
      `;
    }

    console.log(
      `[cosmic-changes-notification] Completed: ${notificationsSent} sent, ${notificationsFailed} failed, ${emailsSent} emails`,
    );

    return NextResponse.json({
      success: true,
      notificationsSent,
      notificationsFailed,
      emailsSent,
      totalSubscribers: subscriptions.rows.length,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('[cosmic-changes-notification] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send cosmic changes notifications',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
