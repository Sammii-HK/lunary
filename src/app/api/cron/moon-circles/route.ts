import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { generateMoonCircle } from '@/lib/moon-circles/generator';
import {
  generateMoonCircleEmailHTML,
  generateMoonCircleEmailText,
} from '@/lib/moon-circles/email-template';
import { sendEmail } from '@/lib/email';
import { trackConversion } from '@/lib/analytics';
import { sendDiscordNotification } from '@/lib/discord';
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

export async function POST(request: NextRequest) {
  try {
    ensureVapidConfigured();

    const authHeader = request.headers.get('authorization');
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';

    let isAuthorized = false;

    if (isVercelCron) {
      isAuthorized = true;
    } else if (authHeader && process.env.CRON_SECRET) {
      isAuthorized = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    } else {
      const { betterAuthClient } = await import('@/lib/auth-client');
      const session = await betterAuthClient.getSession();
      const userEmail = session?.data?.user?.email?.toLowerCase();
      const adminEmails = (
        process.env.ADMIN_EMAILS ||
        process.env.ADMIN_EMAIL ||
        ''
      )
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
      isAuthorized = Boolean(userEmail && adminEmails.includes(userEmail));
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const dateStr = body.date || new Date().toISOString().split('T')[0];
    const force = body.force === true;

    return await createMoonCircle(dateStr, force);
  } catch (error) {
    console.error('❌ Moon Circle POST failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    await sendDiscordNotification({
      title: '🚨 Moon Circle Manual Creation Failed',
      description: `Failed to manually create Moon Circle`,
      fields: [
        {
          name: 'Error',
          value: errorMessage.substring(0, 1000),
          inline: false,
        },
      ],
      color: 'error',
      footer: `Failed at ${new Date().toISOString()}`,
    });

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}

async function createMoonCircle(dateStr: string, force: boolean = false) {
  try {
    ensureVapidConfigured();

    const date = new Date(dateStr);
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    console.log('🌙 Creating Moon Circle for:', dateStr);

    const moonCircle = await generateMoonCircle(date);

    if (!moonCircle) {
      return NextResponse.json({
        success: false,
        moonCircleGenerated: false,
        message: 'No New Moon or Full Moon on this date',
        date: dateStr,
      });
    }

    if (!force) {
      const existingCircle = await sql`
        SELECT id FROM moon_circles WHERE event_date = ${dateStr}::date
      `;

      if (existingCircle.rows.length > 0) {
        await sendDiscordNotification({
          title: '🌙 Moon Circle Check',
          description: `Moon Circle already exists for ${dateStr}`,
          fields: [
            {
              name: 'Phase',
              value: moonCircle.moonPhase,
              inline: true,
            },
            {
              name: 'Sign',
              value: moonCircle.moonSign,
              inline: true,
            },
            {
              name: 'Status',
              value: 'Already exists',
              inline: true,
            },
          ],
          color: 'info',
          footer: `Checked at ${new Date().toISOString()}`,
        });

        return NextResponse.json({
          success: true,
          moonCircleGenerated: false,
          message: 'Moon Circle already exists',
          date: dateStr,
        });
      }
    } else {
      await sql`
        DELETE FROM moon_circles WHERE event_date = ${dateStr}::date
      `;
      console.log('🗑️ Deleted existing Moon Circle (force mode)');
    }

    const contentJson = {
      guidedRitual: moonCircle.guidedRitual,
      journalQuestions: moonCircle.journalQuestions,
      tarotSpreadSuggestion: moonCircle.tarotSpreadSuggestion,
      aiDeepDivePrompt: moonCircle.aiDeepDivePrompt,
      moonSignInfo: moonCircle.moonSignInfo,
      intention: moonCircle.intention,
    };

    const insertResult = await sql`
      INSERT INTO moon_circles (
        moon_phase,
        event_date,
        title,
        theme,
        description
      ) VALUES (
        ${moonCircle.moonPhase},
        ${dateStr}::date,
        ${`Moon Circle: ${moonCircle.moonPhase} in ${moonCircle.moonSign}`},
        ${moonCircle.moonPhase},
        ${moonCircle.moonSignInfo}
      )
      RETURNING id
    `;

    const moonCircleId = insertResult.rows[0]?.id;

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

          if (userEmail && moonCircleId) {
            try {
              const dateLabel = new Intl.DateTimeFormat('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              }).format(date);

              const emailHtml = generateMoonCircleEmailHTML({
                moonCircleId,
                moonPhase: moonCircle.moonPhase,
                dateLabel,
                title: `Moon Circle: ${moonCircle.moonPhase} in ${moonCircle.moonSign}`,
                summary: moonCircle.moonSignInfo,
                appUrl: baseUrl,
              });
              const emailText = generateMoonCircleEmailText({
                moonCircleId,
                moonPhase: moonCircle.moonPhase,
                dateLabel,
                title: `Moon Circle: ${moonCircle.moonPhase} in ${moonCircle.moonSign}`,
                summary: moonCircle.moonSignInfo,
                appUrl: baseUrl,
              });

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

    await sendDiscordNotification({
      title: '🌙 Moon Circle Created',
      description: `Successfully created and sent Moon Circle notifications`,
      fields: [
        {
          name: 'Phase',
          value: moonCircle.moonPhase,
          inline: true,
        },
        {
          name: 'Sign',
          value: moonCircle.moonSign,
          inline: true,
        },
        {
          name: 'Date',
          value: dateStr,
          inline: true,
        },
        {
          name: 'Push Notifications',
          value: `${pushSent} sent / ${pushFailed} failed`,
          inline: true,
        },
        {
          name: 'Emails',
          value: `${emailsSent} sent / ${emailsFailed} failed`,
          inline: true,
        },
        {
          name: 'Moon Circle ID',
          value: String(moonCircleId),
          inline: true,
        },
      ],
      url: `${baseUrl}/moon-circles?date=${dateStr}`,
      color: 'success',
      footer: `Created at ${new Date().toISOString()}`,
    });

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
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
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

    return await createMoonCircle(dateStr, false);
  } catch (error) {
    console.error('❌ Moon Circle cron failed:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    await sendDiscordNotification({
      title: '🚨 Moon Circle Creation Failed',
      description: `Failed to create Moon Circle for ${new Date().toISOString().split('T')[0]}`,
      fields: [
        {
          name: 'Error',
          value: errorMessage.substring(0, 1000),
          inline: false,
        },
        ...(errorStack
          ? [
              {
                name: 'Stack Trace',
                value: `\`\`\`${errorStack.substring(0, 500)}\`\`\``,
                inline: false,
              },
            ]
          : []),
      ],
      color: 'error',
      footer: `Failed at ${new Date().toISOString()}`,
    });

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
