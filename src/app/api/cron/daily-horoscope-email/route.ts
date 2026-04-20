import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendEmail } from '@/lib/email';
import {
  buildPublicHoroscopeResponse,
  normalizeZodiacSign,
  type ZodiacSign,
} from '@/lib/horoscope/public-horoscope';
import {
  generateDailyHoroscopeEmailHTML,
  generateDailyHoroscopeEmailText,
} from '@/lib/email-templates/daily-horoscope';

export const dynamic = 'force-dynamic';

const BATCH_SIZE = 100;

interface SubscriberRow {
  email: string;
  user_id: string | null;
  preferences: Record<string, any> | null;
  birth_chart: unknown;
}

function extractSunSignFromChart(birthChart: unknown): ZodiacSign | undefined {
  if (!Array.isArray(birthChart)) return undefined;

  for (const placement of birthChart) {
    if (typeof placement !== 'object' || !placement) continue;
    const body = (placement as Record<string, unknown>).body;
    const sign = (placement as Record<string, unknown>).sign;
    if (body === 'Sun' && typeof sign === 'string') {
      return normalizeZodiacSign(sign);
    }
  }

  return undefined;
}

function resolveRecipientSign(row: SubscriberRow): ZodiacSign | undefined {
  const captureSign = row.preferences?.captureContext?.sign;
  return (
    normalizeZodiacSign(captureSign) || extractSunSignFromChart(row.birth_chart)
  );
}

export async function GET(request: NextRequest) {
  try {
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
    const todayStr = today.toISOString().slice(0, 10);
    const testEmail = request.nextUrl.searchParams.get('email');

    const subscribers = await sql.query<SubscriberRow>(
      `SELECT
        ns.email,
        ns.user_id,
        ns.preferences,
        up.birth_chart
      FROM newsletter_subscribers ns
      LEFT JOIN user_profiles up ON ns.user_id = up.user_id
      WHERE ns.is_active = true
        AND ns.is_verified = true
        AND ns.preferences->>'dailyHoroscope' = 'true'
        AND ($1::text IS NULL OR ns.email = $1)
        AND NOT EXISTS (
          SELECT 1 FROM analytics_notification_events ane
          WHERE ane.user_id = COALESCE(ns.user_id, ns.email)
            AND ane.notification_type = 'daily_horoscope_email'
            AND ane.notification_id = $2 || COALESCE(ns.user_id, ns.email)
        )
      ORDER BY ns.created_at ASC
      LIMIT $3`,
      [testEmail, `daily-horoscope-${todayStr}-`, BATCH_SIZE],
    );

    if (subscribers.rows.length === 0) {
      return NextResponse.json({
        success: true,
        date: todayStr,
        stats: { eligible: 0, sent: 0, skipped: 0, failed: 0 },
        note: 'No eligible daily horoscope subscribers',
      });
    }

    let sent = 0;
    let skipped = 0;
    const errors: Array<{ email: string; error: string }> = [];

    for (const subscriber of subscribers.rows) {
      try {
        const sign = resolveRecipientSign(subscriber);
        if (!sign) {
          skipped++;
          continue;
        }

        const horoscope = buildPublicHoroscopeResponse(sign, 'daily', today);
        const notificationUserId = subscriber.user_id || subscriber.email;

        const html = generateDailyHoroscopeEmailHTML({
          userEmail: subscriber.email,
          sign,
          signLabel: horoscope.sign,
          date: horoscope.date,
          horoscope: horoscope.horoscope,
          mood: horoscope.mood,
          luckyNumber: horoscope.luckyNumber,
          luckyColor: horoscope.luckyColor,
          compatibility: horoscope.compatibility,
          moonPhase: horoscope.moonPhase,
          ctaUrl: horoscope.ctaUrl,
        });

        const text = generateDailyHoroscopeEmailText({
          userEmail: subscriber.email,
          sign,
          signLabel: horoscope.sign,
          date: horoscope.date,
          horoscope: horoscope.horoscope,
          mood: horoscope.mood,
          luckyNumber: horoscope.luckyNumber,
          luckyColor: horoscope.luckyColor,
          compatibility: horoscope.compatibility,
          moonPhase: horoscope.moonPhase,
          ctaUrl: horoscope.ctaUrl,
        });

        await sendEmail({
          to: subscriber.email,
          subject: `${horoscope.sign} daily horoscope for ${horoscope.date}`,
          html,
          text,
          tracking: {
            userId: notificationUserId,
            notificationType: 'daily_horoscope_email',
            notificationId: `daily-horoscope-${todayStr}-${notificationUserId}`,
            utm: {
              source: 'email',
              medium: 'daily_horoscope',
              campaign: 'daily_horoscope',
              content: sign,
            },
          },
        });

        await sql`
          UPDATE newsletter_subscribers
          SET
            last_email_sent = NOW(),
            email_count = email_count + 1
          WHERE email = ${subscriber.email}
        `;

        sent++;
      } catch (error) {
        errors.push({
          email: subscriber.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      date: todayStr,
      stats: {
        eligible: subscribers.rows.length,
        sent,
        skipped,
        failed: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
      testMode: Boolean(testEmail),
    });
  } catch (error) {
    console.error('Daily horoscope email cron failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to send daily horoscope emails',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
