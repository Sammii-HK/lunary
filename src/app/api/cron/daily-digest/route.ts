import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendEmail } from '@/lib/email';
import {
  getDailyTheme,
  renderDailyDigestEmail,
} from '@/lib/email-components/DailyDigestEmail';

export const dynamic = 'force-dynamic';

// Max emails per cron invocation to stay within Vercel function timeout
const BATCH_SIZE = 100;

interface UserRow {
  user_id: string;
  user_email: string;
  user_name: string | null;
  birth_chart: unknown;
  cosmic_insights: boolean | null;
  unsubscribed_all: boolean | null;
}

/**
 * Extract the sun sign from a birth_chart JSON array.
 * birth_chart is an array of { body: string, sign: string, ... } entries.
 */
function extractSunSign(birthChart: unknown): string | null {
  if (!Array.isArray(birthChart)) return null;

  for (const placement of birthChart) {
    if (typeof placement !== 'object' || !placement) continue;
    const body = (placement as Record<string, unknown>).body as string;
    const sign = (placement as Record<string, unknown>).sign as string;
    if (body === 'Sun' && sign) return sign;
  }

  return null;
}

/**
 * Format a date as a human-friendly string like "Wednesday 18 March"
 */
function formatFriendlyDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD for dedup
    const friendlyDate = formatFriendlyDate(now);

    // ── Fetch eligible users ─────────────────────────────────────────
    // Active users (trial, active, or paying) who:
    // 1. Have an email address
    // 2. Have a birth chart with a sun sign
    // 3. Haven't opted out of cosmic_insights emails
    // 4. Haven't been unsubscribed from all emails
    //
    // Dedup: uses notification_id pattern 'daily-digest-YYYY-MM-DD-userId'
    // checked via email_events table to avoid re-sending if cron runs twice.

    const usersResult = await sql.query<UserRow>(
      `SELECT DISTINCT
        s.user_id,
        s.user_email,
        s.user_name,
        up.birth_chart,
        ep.cosmic_insights,
        ep.unsubscribed_all
      FROM subscriptions s
      LEFT JOIN user_profiles up ON s.user_id = up.user_id
      LEFT JOIN email_preferences ep ON s.user_id = ep.user_id
      WHERE s.user_email IS NOT NULL
        AND up.birth_chart IS NOT NULL
        AND (s.status IN ('trial', 'active') OR s.is_paying = true)
        AND (ep.cosmic_insights IS NULL OR ep.cosmic_insights = true)
        AND (ep.unsubscribed_all IS NULL OR ep.unsubscribed_all = false)
        AND NOT EXISTS (
          SELECT 1 FROM analytics_notification_events ane
          WHERE ane.user_id = s.user_id
            AND ane.notification_type = 'daily_digest'
            AND ane.notification_id LIKE $1
        )
      LIMIT $2`,
      [`daily-digest-${todayStr}-%`, BATCH_SIZE],
    );

    const users = usersResult.rows;

    let sent = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const user of users) {
      try {
        const sunSign = extractSunSign(user.birth_chart);
        if (!sunSign) {
          skipped++;
          continue;
        }

        const dailyTheme = getDailyTheme(sunSign, now);

        const html = await renderDailyDigestEmail({
          userName: user.user_name || 'there',
          sunSign,
          dailyTheme,
          dateString: friendlyDate,
          userEmail: user.user_email,
        });

        await sendEmail({
          to: user.user_email,
          subject: `${sunSign}: ${dailyTheme.slice(0, 50)}${dailyTheme.length > 50 ? '...' : ''}`,
          html,
          tracking: {
            userId: user.user_id,
            notificationType: 'daily_digest',
            notificationId: `daily-digest-${todayStr}-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'daily_digest',
              campaign: 'daily_digest',
              content: sunSign.toLowerCase(),
            },
          },
        });

        sent++;
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`${user.user_email}: ${msg}`);
      }
    }

    return NextResponse.json({
      success: true,
      date: todayStr,
      stats: {
        eligible: users.length,
        sent,
        skipped,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Daily digest cron error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send daily digest emails',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
