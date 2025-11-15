import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { generateMoonCircle } from '@/lib/moon-circles/generator';
import {
  generateMoonCircleEmailHTML,
  generateMoonCircleEmailText,
} from '@/lib/moon-circles/email-template';
import { sendEmail } from '@/lib/email';
import { trackConversion } from '@/lib/analytics';
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

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    console.log('🌙 Checking for Moon Circle event:', dateStr);

    const moonCircle = await generateMoonCircle(today);

    if (!moonCircle) {
      console.log('📭 No New Moon or Full Moon today');
      return NextResponse.json({
        success: true,
        moonCircleGenerated: false,
        message: 'No New Moon or Full Moon today',
        date: dateStr,
      });
    }

    const existingCircle = await sql`
      SELECT id FROM moon_circles WHERE circle_date = ${dateStr}
    `;

    if (existingCircle.rows.length > 0) {
      console.log('✅ Moon Circle already exists for today');
      return NextResponse.json({
        success: true,
        moonCircleGenerated: false,
        message: 'Moon Circle already exists',
        date: dateStr,
      });
    }

    const contentJson = {
      guidedRitual: moonCircle.guidedRitual,
      journalQuestions: moonCircle.journalQuestions,
      tarotSpreadSuggestion: moonCircle.tarotSpreadSuggestion,
      aiDeepDivePrompt: moonCircle.aiDeepDivePrompt,
      moonSignInfo: moonCircle.moonSignInfo,
      intention: moonCircle.intention,
    };

    await sql`
      INSERT INTO moon_circles (
        moon_phase,
        moon_sign,
        circle_date,
        content
      ) VALUES (
        ${moonCircle.moonPhase},
        ${moonCircle.moonSign},
        ${dateStr}::date,
        ${JSON.stringify(contentJson)}::jsonb
      )
    `;

    console.log(
      `✅ Moon Circle generated: ${moonCircle.moonPhase} in ${moonCircle.moonSign}`,
    );

    const deepLinkUrl = `${baseUrl}/book-of-shadows?prompt=${encodeURIComponent(moonCircle.aiDeepDivePrompt)}`;

    const subscriptions = await sql`
      SELECT endpoint, p256dh, auth, user_id, user_email, preferences
      FROM push_subscriptions 
      WHERE is_active = true 
      AND (
        preferences->>'moonCircles' = 'true' 
        OR preferences->>'moonCircles' IS NULL
      )
    `;

    let pushSent = 0;
    let pushFailed = 0;
    let emailsSent = 0;
    let emailsFailed = 0;

    for (const sub of subscriptions.rows) {
      try {
        const preferences = sub.preferences || {};
        const userName = (preferences.name as string) || undefined;
        const userEmail = sub.user_email || undefined;
        const userId = sub.user_id;

        const pushNotification = {
          title: `🌙 Moon Circle: ${moonCircle.moonPhase} in ${moonCircle.moonSign}`,
          body: `${moonCircle.intention} - Join the circle`,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          vibrate: [200, 100, 200],
          tag: 'lunary-moon-circle',
          data: {
            url: `${baseUrl}/moon-circles?date=${dateStr}`,
            type: 'moon_circle',
            date: dateStr,
            phase: moonCircle.moonPhase,
          },
          actions: [
            {
              action: 'view',
              title: 'View Moon Circle',
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

          pushSent++;

          if (userEmail) {
            try {
              const emailHtml = generateMoonCircleEmailHTML(
                moonCircle,
                deepLinkUrl,
                userName,
              );
              const emailText = generateMoonCircleEmailText(
                moonCircle,
                deepLinkUrl,
                userName,
              );

              await sendEmail({
                to: userEmail,
                subject: `🌙 Moon Circle: ${moonCircle.moonPhase} in ${moonCircle.moonSign}`,
                html: emailHtml,
                text: emailText,
              });

              emailsSent++;

              await trackConversion('moon_circle_opened', {
                userId,
                userEmail,
                metadata: {
                  date: dateStr,
                  phase: moonCircle.moonPhase,
                  sign: moonCircle.moonSign,
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

          await trackConversion('moon_circle_sent', {
            userId,
            userEmail,
            metadata: {
              date: dateStr,
              phase: moonCircle.moonPhase,
              sign: moonCircle.moonSign,
              source: 'push',
            },
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
        }
      } catch (error) {
        console.error(
          `Error processing subscription for ${sub.user_id}:`,
          error,
        );
      }
    }

    console.log(
      `✅ Moon Circle notifications: ${pushSent} push sent, ${pushFailed} push failed, ${emailsSent} emails sent, ${emailsFailed} emails failed`,
    );

    return NextResponse.json({
      success: true,
      moonCircleGenerated: true,
      moonCircle: {
        phase: moonCircle.moonPhase,
        sign: moonCircle.moonSign,
        date: dateStr,
      },
      pushSent,
      pushFailed,
      emailsSent,
      emailsFailed,
      date: dateStr,
    });
  } catch (error) {
    console.error('❌ Moon Circle cron failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
