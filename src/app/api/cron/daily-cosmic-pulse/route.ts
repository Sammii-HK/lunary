import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import webpush from 'web-push';
import { generateCosmicPulse } from '@/lib/cosmic-pulse/generator';
import {
  generateCosmicPulseEmailHTML,
  generateCosmicPulseEmailText,
} from '@/lib/cosmic-pulse/email-template';
import { sendEmail } from '@/lib/email';
import { hasUserReceivedNotificationToday } from '@/lib/notifications/tiered-service';
import {
  canonicaliseEvent,
  insertCanonicalEvent,
} from '@/lib/analytics/canonical-events';
import { forwardEventToPostHog } from '@/lib/posthog-forward';

export const dynamic = 'force-dynamic';

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

async function trackConversionServer(
  _baseUrl: string,
  payload: {
    event: string;
    userId?: string;
    userEmail?: string;
    metadata?: Record<string, unknown>;
  },
) {
  try {
    const canonical = canonicaliseEvent({
      eventType: payload.event,
      userId: payload.userId,
      userEmail: payload.userEmail,
      metadata: payload.metadata,
    });
    if (canonical.ok) {
      const { inserted } = await insertCanonicalEvent(canonical.row);
      if (inserted && payload.userId) {
        forwardEventToPostHog({
          distinctId: payload.userId,
          event: payload.event,
          properties: payload.metadata || {},
        });
      }
    }
  } catch (error) {
    console.error('Failed to track conversion:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    ensureVapidConfigured();

    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const authHeader = request.headers.get('authorization');

    if (!isVercelCron) {
      if (
        !process.env.CRON_SECRET ||
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    console.log('🌙 Sending Daily Cosmic Pulse for:', dateStr);

    const eventKey = `cosmic-pulse-${dateStr}`;

    const alreadySent = await sql`
      SELECT id FROM notification_sent_events
      WHERE date = ${dateStr}::date
      AND event_key = ${eventKey}
    `;

    if (alreadySent.rows.length > 0) {
      console.log(
        '📭 Daily Cosmic Pulse already sent today, skipping duplicate',
      );
      return NextResponse.json({
        success: true,
        notificationsSent: 0,
        emailsSent: 0,
        message: 'Already sent today',
        date: dateStr,
      });
    }

    // Only query the actual subscribers - no debug COUNT queries needed
    const subscriptions = await sql`
      SELECT endpoint, p256dh, auth, user_id, user_email, preferences
      FROM push_subscriptions 
      WHERE is_active = true 
      AND (
        preferences->>'cosmicPulse' = 'true' 
        OR preferences->>'cosmicPulse' IS NULL
      )
      AND (
        preferences->>'birthday' IS NOT NULL 
        AND preferences->>'birthday' != ''
      )
    `;

    if (subscriptions.rows.length === 0) {
      console.log('📭 No active cosmic pulse subscriptions found, skipping');
      return NextResponse.json({
        success: true,
        notificationsSent: 0,
        emailsSent: 0,
        message: 'No subscribers for cosmic pulse',
      });
    }

    console.log(
      `🌙 Sending cosmic pulse to ${subscriptions.rows.length} subscribers`,
    );

    const results = [];
    let pushSent = 0;
    let pushFailed = 0;
    let emailsSent = 0;
    let emailsFailed = 0;

    // Track emails already sent to prevent duplicates (user may have multiple push subscriptions)
    const emailsSentTo = new Set<string>();

    for (const sub of subscriptions.rows) {
      try {
        const preferences = sub.preferences || {};
        const birthday = preferences.birthday as string;
        const userName = (preferences.name as string) || undefined;
        const userEmail = sub.email || undefined;
        const userId = sub.user_id;

        if (!birthday || !userId) {
          console.log(`⚠️ Skipping subscription ${userId} - missing data`);
          continue;
        }

        // Skip if user already got a notification today (max 1 per day)
        const alreadyNotified = await hasUserReceivedNotificationToday(userId);
        if (alreadyNotified) {
          console.log(
            `⏭️  Skipping ${userId} - already received notification today`,
          );
          continue;
        }

        const preferredTime =
          (preferences.cosmicPulseTime as string) || 'morning';
        const cosmicPulse = await generateCosmicPulse({
          userId,
          userName,
          userBirthday: birthday,
          userEmail,
          timezone: (preferences.timezone as string) || 'Europe/London',
          locale: (preferences.locale as string) || 'en-GB',
          now: today,
          preferredTime: preferredTime === 'evening' ? 'evening' : 'morning',
        });

        if (!cosmicPulse) {
          console.log(`⚠️ Failed to generate cosmic pulse for ${userId}`);
          continue;
        }

        const deepLinkUrl = `${baseUrl}/book-of-shadows?prompt=${encodeURIComponent(cosmicPulse.aiPrompt)}`;

        const now = new Date();
        const hour = now.getUTCHours();
        const isQuietHours = hour >= 22 || hour < 8;

        if (isQuietHours) {
          console.log(
            `[cosmic-pulse] Skipped during quiet hours (${hour}:00 UTC)`,
          );
          continue;
        }

        const pushNotification = {
          title: `🌙 Daily Cosmic Pulse: ${cosmicPulse.moonEnergy}`,
          body: `${cosmicPulse.mainTransit} - Tap to ask Astral Guide`,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          vibrate: [200, 100, 200],
          tag: 'lunary-cosmic-pulse',
          data: {
            url: deepLinkUrl,
            type: 'cosmic_pulse',
            date: dateStr,
            moonSign: cosmicPulse.moonSign,
            isScheduled: true,
          },
          actions: [
            {
              action: 'view',
              title: 'Ask Astral Guide',
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

          await sql`
            UPDATE push_subscriptions 
            SET last_notification_sent = NOW() 
            WHERE endpoint = ${sub.endpoint}
          `;

          pushSent++;

          // Only send email if we haven't already sent to this address
          if (userEmail && !emailsSentTo.has(userEmail)) {
            try {
              const emailHtml = await generateCosmicPulseEmailHTML(
                cosmicPulse,
                deepLinkUrl,
                userName,
                userEmail,
              );
              const emailText = await generateCosmicPulseEmailText(
                cosmicPulse,
                deepLinkUrl,
                userName,
                userEmail,
              );

              await sendEmail({
                to: userEmail,
                subject: `🌙 Your Daily Cosmic Pulse: ${cosmicPulse.moonEnergy}`,
                html: emailHtml,
                text: emailText,
              });

              emailsSentTo.add(userEmail);
              emailsSent++;

              await trackConversionServer(baseUrl, {
                event: 'cosmic_pulse_opened',
                userId,
                userEmail,
                metadata: {
                  date: dateStr,
                  moonSign: cosmicPulse.moonSign,
                  source: 'email',
                },
              });
            } catch (emailError) {
              console.error(
                `Failed to send email to ${userEmail}:`,
                emailError,
              );
              emailsFailed++;
            }
          }

          await trackConversionServer(baseUrl, {
            event: 'cosmic_pulse_sent',
            userId,
            userEmail,
            metadata: {
              date: dateStr,
              moonSign: cosmicPulse.moonSign,
              source: 'push',
            },
          });

          results.push({
            success: true,
            userId,
            pushSent: true,
            emailSent: !!userEmail,
          });
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

          pushFailed++;
          results.push({
            success: false,
            userId,
            error: pushError instanceof Error ? pushError.message : 'Unknown',
          });
        }
      } catch (error) {
        console.error(
          `Error processing subscription for ${sub.user_id}:`,
          error,
        );
        results.push({
          success: false,
          userId: sub.user_id,
          error: error instanceof Error ? error.message : 'Unknown',
        });
      }
    }

    if (pushSent > 0 || emailsSent > 0) {
      await sql`
        INSERT INTO notification_sent_events (date, event_key, event_type, event_name, event_priority, sent_by)
        VALUES (${dateStr}::date, ${eventKey}, 'cosmic_pulse', 'Daily Cosmic Pulse', 5, 'daily')
        ON CONFLICT (date, event_key) DO NOTHING
      `;
    }

    console.log(
      `✅ Daily Cosmic Pulse: ${pushSent} push sent, ${pushFailed} push failed, ${emailsSent} emails sent, ${emailsFailed} emails failed`,
    );

    return NextResponse.json({
      success: pushSent > 0 || emailsSent > 0,
      pushSent,
      pushFailed,
      emailsSent,
      emailsFailed,
      totalSubscribers: subscriptions.rows.length,
      results,
      date: dateStr,
    });
  } catch (error) {
    console.error('❌ Daily Cosmic Pulse cron failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
