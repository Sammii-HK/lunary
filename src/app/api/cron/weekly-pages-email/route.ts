/**
 * Sunday-evening cron: send the personalised "Week Ahead" digest to every
 * subscriber who has email enabled and explicitly opted into the weekly
 * digest preference.
 *
 * Auth: Vercel cron header (`x-vercel-cron`) OR `Authorization: Bearer
 * CRON_SECRET`. Idempotent — uses `notification_sent_events` to claim the
 * day once across concurrent triggers (Vercel + Cloudflare worker can race).
 *
 * Users without the email preference are silently skipped — they still see
 * the page in-app at /app/week-ahead.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

import { sendEmail } from '@/lib/email';
import { buildWeeklyPage, getCurrentWeekRange } from '@/lib/weekly-pages/build';
import {
  generateWeeklyPageEmailHTML,
  generateWeeklyPageEmailText,
} from '@/lib/weekly-pages/email-template';
import type { BirthChartData } from '../../../../../utils/astrology/birthChart';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const APP_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://lunary.app'
    : 'http://localhost:3000';

// Sanitise any string we feed into a log line so user-controlled data can't
// forge log entries via embedded newlines.
function safeLog(value: unknown): string {
  const raw = String(value ?? '');
  let out = '';
  for (let i = 0; i < raw.length && out.length < 200; i += 1) {
    const code = raw.charCodeAt(i);
    if (code < 0x20 || code === 0x7f) continue;
    out += raw[i];
  }
  return out;
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

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const eventKey = `weekly-pages-email-${dateStr}`;

    // Atomically claim this run to dedupe across redundant triggers.
    const claim = await sql`
      INSERT INTO notification_sent_events (date, event_key, event_type, event_name, event_priority, sent_by)
      VALUES (${dateStr}::date, ${eventKey}, 'weekly_pages', 'Weekly Pages Digest', 5, 'weekly')
      ON CONFLICT (date, event_key) DO NOTHING
      RETURNING id
    `;

    if (claim.rows.length === 0) {
      return NextResponse.json({
        success: true,
        emailsSent: 0,
        message: 'Already claimed by another run',
        date: dateStr,
      });
    }

    // Eligible users: active push subscription, weekly-digest explicitly
    // opted in through profile push preferences, AND the subscription has a
    // stored birthday so we can build a chart.
    const subscribers = await sql`
      SELECT DISTINCT ON (ps.user_email) ps.user_id, ps.user_email, ps.preferences
      FROM push_subscriptions ps
      JOIN user_profiles up ON up.user_id = ps.user_id
      WHERE ps.is_active = true
      AND up.personal_card->'pushPreferences'->>'weeklyDigest' = 'true'
      AND (
        ps.preferences->>'birthday' IS NOT NULL
        AND ps.preferences->>'birthday' != ''
      )
      ORDER BY ps.user_email, ps.created_at DESC
    `;

    if (subscribers.rows.length === 0) {
      return NextResponse.json({
        success: true,
        emailsSent: 0,
        message: 'No eligible subscribers',
      });
    }

    let emailsSent = 0;
    let emailsFailed = 0;
    let emailsSkipped = 0;

    for (const sub of subscribers.rows) {
      const userId = sub.user_id as string | null;
      const userEmail = sub.user_email as string | null;
      const preferences = (sub.preferences ?? {}) as Record<string, unknown>;
      const userName = (preferences.name as string | undefined) ?? undefined;
      const userTimezone =
        (preferences.timezone as string | undefined) ?? undefined;

      if (!userId || !userEmail) {
        emailsSkipped += 1;
        continue;
      }

      try {
        const profileResult = await sql`
          SELECT birth_chart, timezone FROM user_profiles
          WHERE user_id = ${userId} LIMIT 1
        `;
        const natalChart = (profileResult.rows[0]?.birth_chart ??
          []) as BirthChartData[];
        const timezone =
          (profileResult.rows[0]?.timezone as string | undefined) ??
          userTimezone;

        if (!Array.isArray(natalChart) || natalChart.length === 0) {
          emailsSkipped += 1;
          continue;
        }

        const { weekStart, weekEnd } = getCurrentWeekRange(now, timezone);
        const page = buildWeeklyPage({ natalChart, weekStart, weekEnd });

        const firstName = userName?.trim().split(' ')[0] ?? '';
        const topAspectLine = page.topTransits[0]?.oneLiner ?? page.headline;
        const subjectName = firstName ? `, ${firstName}` : '';
        const subject = `Your week ahead${subjectName} — ${topAspectLine}`;

        const html = await generateWeeklyPageEmailHTML({
          page,
          appUrl: APP_URL,
          userName,
          userEmail,
        });
        const text = await generateWeeklyPageEmailText({
          page,
          appUrl: APP_URL,
          userName,
          userEmail,
        });

        await sendEmail({
          to: userEmail,
          subject,
          html,
          text,
          tracking: {
            userId,
            notificationType: 'weekly_pages',
          },
        });

        emailsSent += 1;
      } catch (error) {
        emailsFailed += 1;
        console.error(
          '[weekly-pages-email] send failed:',
          safeLog(error instanceof Error ? error.message : error),
        );
      }
    }

    console.log(
      `[weekly-pages-email] sent=${emailsSent} failed=${emailsFailed} skipped=${emailsSkipped} total=${subscribers.rows.length}`,
    );

    return NextResponse.json({
      success: true,
      emailsSent,
      emailsFailed,
      emailsSkipped,
      totalSubscribers: subscribers.rows.length,
      date: dateStr,
    });
  } catch (error) {
    console.error('[weekly-pages-email] fatal');
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send weekly pages digest',
      },
      { status: 500 },
    );
  }
}
