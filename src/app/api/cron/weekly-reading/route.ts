/**
 * /api/cron/weekly-reading
 *
 * Runs every Sunday at 9am UTC.
 * Sends a personal weekly chart reading from Sammii to every activated user
 * who has a birth chart on file.
 *
 * "Activated" = has at least one real session (filters out bot signups).
 * Deduplicates per ISO week so it never sends twice in the same week.
 */
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendEmail } from '@/lib/email';
import {
  hasReceivedCampaign,
  recordCampaignSent,
} from '@/lib/re-engagement/campaign-manager';
import {
  renderWeeklyPersonalReading,
  weeklyReadingSubject,
} from '@/lib/email-components/WeeklyPersonalReadingEmail';
import { getCurrentWeekLabel } from '@/lib/email/grimoire-email-copy';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function parsePlacements(birthChart: unknown): {
  sunSign?: string;
  moonSign?: string;
} {
  if (!Array.isArray(birthChart)) return {};
  let sunSign: string | undefined;
  let moonSign: string | undefined;
  for (const p of birthChart as Record<string, unknown>[]) {
    if (p?.body === 'Sun') sunSign = p.sign as string;
    if (p?.body === 'Moon') moonSign = p.sign as string;
  }
  return { sunSign, moonSign };
}

/** ISO week key used for deduplication, e.g. "weekly_reading_2026-W15" */
function weekCampaignKey(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 +
      startOfYear.getDay() +
      1) /
      7,
  );
  return `weekly_reading_${now.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
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

    const weekLabel = getCurrentWeekLabel();
    const campaignKey = weekCampaignKey();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

    // All activated users (at least one session) with a birth chart
    const users = await sql`
      SELECT DISTINCT
        s.user_id,
        s.user_email as email,
        s.user_name as name,
        up.birth_chart
      FROM subscriptions s
      INNER JOIN user_profiles up ON s.user_id = up.user_id
      WHERE s.user_email IS NOT NULL
        AND up.birth_chart IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM user_sessions us
          WHERE us.user_id = s.user_id
        )
      LIMIT 200
    `;

    if (users.rows.length === 0) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'no_eligible_users',
      });
    }

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const user of users.rows) {
      try {
        // One reading per user per week — keyed to the ISO week
        if (await hasReceivedCampaign(user.user_id, 'weekly_reading', 6)) {
          skipped++;
          continue;
        }

        const { sunSign, moonSign } = parsePlacements(user.birth_chart);
        const firstName = user.name?.split(' ')[0] || undefined;

        const html = await renderWeeklyPersonalReading({
          userId: user.user_id,
          userName: user.name || 'there',
          sunSign,
          moonSign,
          userEmail: user.email,
          weekLabel,
          baseUrl,
        });

        await sendEmail({
          to: user.email,
          from: 'Sammii <sammii@lunary.app>',
          subject: weeklyReadingSubject(firstName),
          html,
          tracking: {
            userId: user.user_id,
            notificationType: 'weekly_reading',
            notificationId: `${campaignKey}-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'weekly',
              campaign: 'weekly_reading',
            },
          },
        });

        await recordCampaignSent(user.user_id, 'weekly_reading');
        sent++;
      } catch (error) {
        console.error(`[Weekly Reading] Failed for ${user.email}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      weekLabel,
      campaignKey,
      sent,
      failed,
      skipped,
      total: users.rows.length,
    });
  } catch (error) {
    console.error('[Weekly Reading] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
