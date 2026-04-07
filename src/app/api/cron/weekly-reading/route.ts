/**
 * /api/cron/weekly-reading
 *
 * Runs every Sunday at 9am UTC.
 * Pro users  → personalised card + full transit aspects + Sun/Moon grimoire copy
 * Free users → card of the week + Sun grimoire copy + transit house teasers (upsell)
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
import {
  getCurrentWeekLabel,
  getWeekSeed,
} from '@/lib/email/grimoire-email-copy';
import {
  getCurrentPlanetPositions,
  getCurrentMoonPhase,
  getWeeklyCard,
  getPersonalisedCard,
  getPlanetHousePlacements,
  getSignificantTransitAspects,
} from '@/lib/email/astro-email-utils';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function parseBirthChart(birthChart: unknown): {
  sunSign?: string;
  moonSign?: string;
  raw: unknown[];
} {
  if (!Array.isArray(birthChart)) return { raw: [] };
  let sunSign: string | undefined;
  let moonSign: string | undefined;
  for (const p of birthChart as Record<string, unknown>[]) {
    if (p?.body === 'Sun') sunSign = p.sign as string;
    if (p?.body === 'Moon') moonSign = p.sign as string;
  }
  return { sunSign, moonSign, raw: birthChart };
}

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
    const weekNum = getWeekSeed();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

    // Compute shared values once — same for all users this week
    const now = new Date();
    const currentPositions = getCurrentPlanetPositions(now);
    const moonPhase = getCurrentMoonPhase(now);
    const collectiveCard = getWeeklyCard(weekNum);

    // All activated users with a birth chart
    const users = await sql`
      SELECT DISTINCT
        s.user_id,
        s.user_email as email,
        s.user_name as name,
        s.is_paying,
        up.birth_chart
      FROM subscriptions s
      INNER JOIN user_profiles up ON s.user_id = up.user_id
      WHERE s.user_email IS NOT NULL
        AND up.birth_chart IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM user_sessions us
          WHERE us.user_id = s.user_id
        )
      LIMIT 500
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
        if (await hasReceivedCampaign(user.user_id, 'weekly_reading', 6)) {
          skipped++;
          continue;
        }

        const isPro = user.is_paying === true;
        const { sunSign, moonSign, raw } = parseBirthChart(user.birth_chart);
        const firstName = user.name?.split(' ')[0] || undefined;

        const weeklyCard = isPro
          ? getPersonalisedCard(weekNum, user.user_id)
          : collectiveCard;

        const transitAspects =
          isPro && raw.length > 0
            ? getSignificantTransitAspects(raw, currentPositions, 2)
            : [];

        const planetHouses =
          !isPro && raw.length > 0
            ? getPlanetHousePlacements(raw, currentPositions)
            : [];

        const html = await renderWeeklyPersonalReading({
          userId: user.user_id,
          userName: user.name || 'there',
          isPro,
          sunSign,
          moonSign,
          userEmail: user.email,
          weekLabel,
          baseUrl,
          moonPhase,
          weeklyCard,
          transitAspects,
          planetHouses,
        });

        await sendEmail({
          to: user.email,
          from: 'Sammii <hello@lunary.app>',
          replyTo: 'sammii@lunary.app',
          subject: weeklyReadingSubject(firstName),
          html,
          tracking: {
            userId: user.user_id,
            notificationType: 'weekly_reading',
            notificationId: `${campaignKey}-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'weekly',
              campaign: isPro ? 'weekly_reading' : 'weekly_reading_free',
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
