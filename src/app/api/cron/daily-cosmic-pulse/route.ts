import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import webpush from 'web-push';
import { generateCosmicPulse } from '@/lib/cosmic-pulse/generator';
import {
  generateCosmicPulseEmailHTML,
  generateCosmicPulseEmailText,
} from '@/lib/cosmic-pulse/email-template';
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

async function trackConversionServer(
  baseUrl: string,
  payload: {
    event: string;
    userId?: string;
    userEmail?: string;
    metadata?: Record<string, unknown>;
  },
) {
  try {
    await fetch(`${baseUrl}/api/analytics/conversion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
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
        process.env.CRON_SECRET &&
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

    // Debug: Get counts for each condition to understand filtering
    const allActiveCount = await sql`
      SELECT COUNT(*) as count FROM push_subscriptions WHERE is_active = true
    `;
    const withBirthdayCount = await sql`
      SELECT COUNT(*) as count FROM push_subscriptions 
      WHERE is_active = true 
      AND preferences->>'birthday' IS NOT NULL 
      AND preferences->>'birthday' != ''
    `;
    const cosmicPulseEnabledCount = await sql`
      SELECT COUNT(*) as count FROM push_subscriptions 
      WHERE is_active = true 
      AND (preferences->>'cosmicPulse' = 'true' OR preferences->>'cosmicPulse' IS NULL)
    `;

    console.log(`[cosmic-pulse] Debug counts:`, {
      allActive: allActiveCount.rows[0]?.count,
      withBirthday: withBirthdayCount.rows[0]?.count,
      cosmicPulseEnabled: cosmicPulseEnabledCount.rows[0]?.count,
    });

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
      console.log('📭 No active cosmic pulse subscriptions found');
      console.log(
        '[cosmic-pulse] Reason: Either no subscribers have birthday set, or cosmicPulse is explicitly disabled',
      );

      // Additional debug: show first few subscriptions and their preferences
      const sampleSubs = await sql`
        SELECT user_id, user_email, preferences, is_active
        FROM push_subscriptions 
        WHERE is_active = true
        LIMIT 3
      `;
      console.log(
        '[cosmic-pulse] Sample active subscriptions:',
        JSON.stringify(
          sampleSubs.rows.map((s) => ({
            userId: s.user_id,
            email: s.email ? '***@***' : null,
            hasBirthday: !!(
              s.preferences?.birthday && s.preferences.birthday !== ''
            ),
            cosmicPulse: s.preferences?.cosmicPulse,
          })),
          null,
          2,
        ),
      );

      return NextResponse.json({
        success: true,
        notificationsSent: 0,
        emailsSent: 0,
        message: 'No subscribers for cosmic pulse',
        debug: {
          allActive: parseInt(allActiveCount.rows[0]?.count || '0'),
          withBirthday: parseInt(withBirthdayCount.rows[0]?.count || '0'),
          cosmicPulseEnabled: parseInt(
            cosmicPulseEnabledCount.rows[0]?.count || '0',
          ),
        },
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

          if (userEmail) {
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
