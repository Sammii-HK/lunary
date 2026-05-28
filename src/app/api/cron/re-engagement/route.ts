import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendEmail } from '@/lib/email';
import {
  getUsersWithMissedStreaks,
  getMilestoneUsers,
  getDormantFreeUsers,
  hasReceivedCampaign,
  recordCampaignSent,
} from '@/lib/re-engagement/campaign-manager';
import { renderChurnPrevention } from '@/lib/email-components/ChurnPreventionEmail';
import {
  generateReEngagementStreakEmailHTML,
  generateReEngagementStreakEmailText,
} from '@/lib/email/templates/re-engagement-streak';
import {
  generateReEngagementMilestoneEmailHTML,
  generateReEngagementMilestoneEmailText,
} from '@/lib/email/templates/re-engagement-milestone';
import {
  generateReEngagementInsightsEmailHTML,
  generateReEngagementInsightsEmailText,
} from '@/lib/email/templates/re-engagement-insights';
import {
  renderFreeDay2Email,
  renderFreeDay7Email,
  renderFreeDay14Email,
} from '@/lib/email-components/FreeReengagementEmails';

export const dynamic = 'force-dynamic';

/** Sanitize string for safe logging (prevent log injection) */
function sanitizeForLogging(value: unknown): string {
  return String(value).replace(/[\r\n\x00-\x1F\x7F]/g, '');
}

/** Extract Sun and Moon sign from a birth_chart JSON array */
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

    let emailsSent = 0;
    let emailsFailed = 0;
    const counts: Record<string, number> = {};

    // ─── 1. Paying users: 7 days inactive ──────────────────────────────────
    // Original campaign. Only users who are paying and have gone quiet.
    // Activation filter: must have at least one session (no bot accounts).

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const inactivePaying7d = await sql`
      SELECT DISTINCT
        s.user_id,
        s.user_email as email,
        s.user_name as name,
        up.birth_chart
      FROM subscriptions s
      LEFT JOIN user_profiles up ON s.user_id = up.user_id
      WHERE s.user_email IS NOT NULL
        AND s.status IN ('active', 'trial')
        AND s.is_paying = true
        AND EXISTS (
          SELECT 1 FROM user_sessions us2
          WHERE us2.user_id = s.user_id
        )
        AND NOT EXISTS (
          SELECT 1 FROM user_sessions us
          WHERE us.user_id = s.user_id
          AND us.session_timestamp >= ${sevenDaysAgo.toISOString()}
        )
        AND (s.churn_prevention_sent = false OR s.churn_prevention_sent IS NULL)
      LIMIT 50
    `;

    counts['paying_7d'] = 0;
    for (const user of inactivePaying7d.rows) {
      try {
        if (await hasReceivedCampaign(user.user_id, '7days_inactive', 30))
          continue;

        const { sunSign } = parsePlacements(user.birth_chart);

        const html = await renderChurnPrevention({
          userName: user.name || 'there',
          sunSign,
          daysSinceLastVisit: 7,
          userEmail: user.email,
        });

        await sendEmail({
          to: user.email,
          subject:
            'The planets have been busy: here is what changed in your chart',
          html,
          tracking: {
            userId: user.user_id,
            notificationType: 'churn_prevention',
            notificationId: `churn-prevention-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'churn_prevention',
            },
          },
        });

        await recordCampaignSent(user.user_id, '7days_inactive');
        await sql`UPDATE subscriptions SET churn_prevention_sent = true WHERE user_id = ${user.user_id}`;
        emailsSent++;
        counts['paying_7d']++;
      } catch (error) {
        console.error(
          `[Re-Engagement] paying_7d failed for ${sanitizeForLogging(user.email)}:`,
          error,
        );
        emailsFailed++;
      }
    }

    // ─── 2. Dormant free users: day 2 ──────────────────────────────────────
    // Gentle check-in. Targets the dormant free-user pool directly via
    // getDormantFreeUsers (real session recency), NOT a subscriptions
    // created_at drip, so cold users who set up and vanished are caught.
    // Inner cutoff 2 days, outer bound 7 days so day-2 only fires on the
    // freshly-dormant before the day-7 email takes over.

    const freeInactive2d = await getDormantFreeUsers(2, 7, 50);

    counts['free_2d'] = 0;
    for (const user of freeInactive2d) {
      try {
        if (await hasReceivedCampaign(user.userId, 'free_2days_inactive', 7))
          continue;

        const { sunSign } = parsePlacements(user.birthChart);

        const html = await renderFreeDay2Email({
          userId: user.userId,
          userName: user.name || 'there',
          sunSign,
          userEmail: user.email,
        });

        await sendEmail({
          to: user.email,
          from: 'Sammii <hello@lunary.app>',
          replyTo: 'sammii@lunary.app',
          subject: 'Came to check in on your chart',
          html,
          tracking: {
            userId: user.userId,
            notificationType: 'free_reengagement',
            notificationId: `free-2d-${user.userId}`,
            utm: {
              source: 'email',
              medium: 'reengagement',
              campaign: 'free_2d',
            },
          },
        });

        await recordCampaignSent(user.userId, 'free_2days_inactive');
        emailsSent++;
        counts['free_2d']++;
      } catch (error) {
        console.error(
          `[Re-Engagement] free_2d failed for ${sanitizeForLogging(user.email)}:`,
          error,
        );
        emailsFailed++;
      }
    }

    // ─── 3. Dormant free users: day 7 ──────────────────────────────────────
    // Inner cutoff 7 days, outer bound 14 days.

    const freeInactive7d = await getDormantFreeUsers(7, 14, 50);

    counts['free_7d'] = 0;
    for (const user of freeInactive7d) {
      try {
        if (await hasReceivedCampaign(user.userId, 'free_7days_inactive', 14))
          continue;

        const { sunSign, moonSign } = parsePlacements(user.birthChart);

        const html = await renderFreeDay7Email({
          userId: user.userId,
          userName: user.name || 'there',
          sunSign,
          moonSign,
          userEmail: user.email,
        });

        await sendEmail({
          to: user.email,
          from: 'Sammii <hello@lunary.app>',
          replyTo: 'sammii@lunary.app',
          subject: sunSign
            ? `Your ${sunSign} chart: here is what moved this week`
            : 'Here is what moved in your chart this week',
          html,
          tracking: {
            userId: user.userId,
            notificationType: 'free_reengagement',
            notificationId: `free-7d-${user.userId}`,
            utm: {
              source: 'email',
              medium: 'reengagement',
              campaign: 'free_7d',
            },
          },
        });

        await recordCampaignSent(user.userId, 'free_7days_inactive');
        emailsSent++;
        counts['free_7d']++;
      } catch (error) {
        console.error(
          `[Re-Engagement] free_7d failed for ${sanitizeForLogging(user.email)}:`,
          error,
        );
        emailsFailed++;
      }
    }

    // ─── 4. Dormant free users: 14 days ────────────────────────────────────
    // The thing they probably missed (the Grimoire). Last in-sequence email,
    // so no outer bound: any free user dormant 14+ days who has not had it.
    // Content hook only, no discount. The major-transit email (separate cron)
    // takes over from here as the event-triggered re-entry point.

    const freeInactive14d = await getDormantFreeUsers(14, null, 50);

    counts['free_14d'] = 0;
    for (const user of freeInactive14d) {
      try {
        if (await hasReceivedCampaign(user.userId, 'free_14days_inactive', 30))
          continue;

        const { sunSign } = parsePlacements(user.birthChart);

        const html = await renderFreeDay14Email({
          userId: user.userId,
          userName: user.name || 'there',
          sunSign,
          userEmail: user.email,
        });

        await sendEmail({
          to: user.email,
          from: 'Sammii <hello@lunary.app>',
          replyTo: 'sammii@lunary.app',
          subject: 'Something I want to make sure you saw',
          html,
          tracking: {
            userId: user.userId,
            notificationType: 'free_reengagement',
            notificationId: `free-14d-${user.userId}`,
            utm: {
              source: 'email',
              medium: 'reengagement',
              campaign: 'free_14d',
            },
          },
        });

        await recordCampaignSent(user.userId, 'free_14days_inactive');
        emailsSent++;
        counts['free_14d']++;
      } catch (error) {
        console.error(
          `[Re-Engagement] free_14d failed for ${sanitizeForLogging(user.email)}:`,
          error,
        );
        emailsFailed++;
      }
    }

    // ─── 5. Missed streak ──────────────────────────────────────────────────

    const missedStreaks = await getUsersWithMissedStreaks();
    counts['missed_streak'] = 0;
    for (const user of missedStreaks) {
      try {
        if (await hasReceivedCampaign(user.userId, 'missed_streak', 3))
          continue;

        const emailHtml = generateReEngagementStreakEmailHTML(
          user.email.split('@')[0],
          user.streak,
          'https://lunary.app',
        );
        const emailText = generateReEngagementStreakEmailText(
          user.email.split('@')[0],
          user.streak,
          'https://lunary.app',
        );

        await sendEmail({
          to: user.email,
          subject: 'Do not break your streak',
          html: emailHtml,
          text: emailText,
        });

        await recordCampaignSent(user.userId, 'missed_streak', {
          streak: user.streak,
        });
        emailsSent++;
        counts['missed_streak']++;
      } catch (error) {
        console.error(
          `[Re-Engagement] missed_streak failed for ${sanitizeForLogging(user.email)}:`,
          error,
        );
        emailsFailed++;
      }
    }

    // ─── 6. Milestones ─────────────────────────────────────────────────────

    const milestones = await getMilestoneUsers();
    counts['milestone'] = 0;
    for (const user of milestones) {
      try {
        if (await hasReceivedCampaign(user.userId, 'milestone', 7)) continue;

        const emailHtml = generateReEngagementMilestoneEmailHTML(
          user.email.split('@')[0],
          user.milestone,
          'https://lunary.app',
        );
        const emailText = generateReEngagementMilestoneEmailText(
          user.email.split('@')[0],
          user.milestone,
          'https://lunary.app',
        );

        await sendEmail({
          to: user.email,
          subject: 'You hit a milestone',
          html: emailHtml,
          text: emailText,
        });

        await recordCampaignSent(user.userId, 'milestone', {
          milestone: user.milestone,
        });
        emailsSent++;
        counts['milestone']++;
      } catch (error) {
        console.error(
          `[Re-Engagement] milestone failed for ${sanitizeForLogging(user.email)}:`,
          error,
        );
        emailsFailed++;
      }
    }

    // ─── 7. Monthly insights ready ─────────────────────────────────────────

    const now = new Date();
    const insightsReady = await sql`
      SELECT DISTINCT mi.user_id, sub.user_email as email
      FROM monthly_insights mi
      INNER JOIN subscriptions sub ON sub.user_id = mi.user_id
      WHERE mi.month = ${now.getMonth() + 1}
        AND mi.year = ${now.getFullYear()}
        AND mi.updated_at >= NOW() - INTERVAL '24 hours'
        AND sub.user_email IS NOT NULL
      LIMIT 50
    `;

    counts['insights_ready'] = 0;
    for (const row of insightsReady.rows) {
      try {
        if (await hasReceivedCampaign(row.user_id, 'insights_ready', 7))
          continue;

        const emailHtml = generateReEngagementInsightsEmailHTML(
          row.email.split('@')[0],
          'https://lunary.app',
        );
        const emailText = generateReEngagementInsightsEmailText(
          row.email.split('@')[0],
          'https://lunary.app',
        );

        await sendEmail({
          to: row.email,
          subject: 'Your monthly insights are ready',
          html: emailHtml,
          text: emailText,
        });

        await recordCampaignSent(row.user_id, 'insights_ready');
        emailsSent++;
        counts['insights_ready']++;
      } catch (error) {
        console.error(
          `[Re-Engagement] insights_ready failed for ${sanitizeForLogging(row.email)}:`,
          error,
        );
        emailsFailed++;
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent,
      emailsFailed,
      counts,
    });
  } catch (error) {
    console.error('[Re-Engagement] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
