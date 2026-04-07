import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendEmail } from '@/lib/email';
import {
  getUsersWithMissedStreaks,
  getMilestoneUsers,
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
  renderFreeDay3Email,
  renderFreeDay7Email,
  renderFreeDay14Email,
  renderWinBackEmail,
} from '@/lib/email-components/FreeReengagementEmails';

export const dynamic = 'force-dynamic';

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
          `[Re-Engagement] paying_7d failed for ${user.email}:`,
          error,
        );
        emailsFailed++;
      }
    }

    // ─── 2. Free users: 3 days inactive ────────────────────────────────────
    // Gentle check-in. Only activated users (have at least one session).

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const freeInactive3d = await sql`
      SELECT DISTINCT
        s.user_id,
        s.user_email as email,
        s.user_name as name,
        up.birth_chart
      FROM subscriptions s
      LEFT JOIN user_profiles up ON s.user_id = up.user_id
      WHERE s.user_email IS NOT NULL
        AND s.status = 'free'
        AND EXISTS (
          SELECT 1 FROM user_sessions us2
          WHERE us2.user_id = s.user_id
        )
        AND NOT EXISTS (
          SELECT 1 FROM user_sessions us
          WHERE us.user_id = s.user_id
          AND us.session_timestamp >= ${threeDaysAgo.toISOString()}
        )
      LIMIT 50
    `;

    counts['free_3d'] = 0;
    for (const user of freeInactive3d.rows) {
      try {
        if (await hasReceivedCampaign(user.user_id, 'free_3days_inactive', 7))
          continue;

        const { sunSign } = parsePlacements(user.birth_chart);

        const html = await renderFreeDay3Email({
          userId: user.user_id,
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
            userId: user.user_id,
            notificationType: 'free_reengagement',
            notificationId: `free-3d-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'reengagement',
              campaign: 'free_3d',
            },
          },
        });

        await recordCampaignSent(user.user_id, 'free_3days_inactive');
        emailsSent++;
        counts['free_3d']++;
      } catch (error) {
        console.error(
          `[Re-Engagement] free_3d failed for ${user.email}:`,
          error,
        );
        emailsFailed++;
      }
    }

    // ─── 3. Free users: 7 days inactive ────────────────────────────────────

    const freeInactive7d = await sql`
      SELECT DISTINCT
        s.user_id,
        s.user_email as email,
        s.user_name as name,
        up.birth_chart
      FROM subscriptions s
      LEFT JOIN user_profiles up ON s.user_id = up.user_id
      WHERE s.user_email IS NOT NULL
        AND s.status = 'free'
        AND EXISTS (
          SELECT 1 FROM user_sessions us2
          WHERE us2.user_id = s.user_id
        )
        AND NOT EXISTS (
          SELECT 1 FROM user_sessions us
          WHERE us.user_id = s.user_id
          AND us.session_timestamp >= ${sevenDaysAgo.toISOString()}
        )
      LIMIT 50
    `;

    counts['free_7d'] = 0;
    for (const user of freeInactive7d.rows) {
      try {
        if (await hasReceivedCampaign(user.user_id, 'free_7days_inactive', 14))
          continue;

        const { sunSign, moonSign } = parsePlacements(user.birth_chart);

        const html = await renderFreeDay7Email({
          userId: user.user_id,
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
            userId: user.user_id,
            notificationType: 'free_reengagement',
            notificationId: `free-7d-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'reengagement',
              campaign: 'free_7d',
            },
          },
        });

        await recordCampaignSent(user.user_id, 'free_7days_inactive');
        emailsSent++;
        counts['free_7d']++;
      } catch (error) {
        console.error(
          `[Re-Engagement] free_7d failed for ${user.email}:`,
          error,
        );
        emailsFailed++;
      }
    }

    // ─── 4. Free users: 14 days inactive ───────────────────────────────────

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const freeInactive14d = await sql`
      SELECT DISTINCT
        s.user_id,
        s.user_email as email,
        s.user_name as name,
        up.birth_chart
      FROM subscriptions s
      LEFT JOIN user_profiles up ON s.user_id = up.user_id
      WHERE s.user_email IS NOT NULL
        AND s.status = 'free'
        AND EXISTS (
          SELECT 1 FROM user_sessions us2
          WHERE us2.user_id = s.user_id
        )
        AND NOT EXISTS (
          SELECT 1 FROM user_sessions us
          WHERE us.user_id = s.user_id
          AND us.session_timestamp >= ${fourteenDaysAgo.toISOString()}
        )
      LIMIT 50
    `;

    counts['free_14d'] = 0;
    for (const user of freeInactive14d.rows) {
      try {
        if (await hasReceivedCampaign(user.user_id, 'free_14days_inactive', 30))
          continue;

        const { sunSign } = parsePlacements(user.birth_chart);

        const html = await renderFreeDay14Email({
          userId: user.user_id,
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
            userId: user.user_id,
            notificationType: 'free_reengagement',
            notificationId: `free-14d-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'reengagement',
              campaign: 'free_14d',
            },
          },
        });

        await recordCampaignSent(user.user_id, 'free_14days_inactive');
        emailsSent++;
        counts['free_14d']++;
      } catch (error) {
        console.error(
          `[Re-Engagement] free_14d failed for ${user.email}:`,
          error,
        );
        emailsFailed++;
      }
    }

    // ─── 5. Win-back: 30 days inactive, all users ──────────────────────────

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const inactive30d = await sql`
      SELECT DISTINCT
        s.user_id,
        s.user_email as email,
        s.user_name as name,
        up.birth_chart
      FROM subscriptions s
      LEFT JOIN user_profiles up ON s.user_id = up.user_id
      WHERE s.user_email IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM user_sessions us2
          WHERE us2.user_id = s.user_id
        )
        AND NOT EXISTS (
          SELECT 1 FROM user_sessions us
          WHERE us.user_id = s.user_id
          AND us.session_timestamp >= ${thirtyDaysAgo.toISOString()}
        )
      LIMIT 50
    `;

    counts['winback_30d'] = 0;
    for (const user of inactive30d.rows) {
      try {
        if (await hasReceivedCampaign(user.user_id, 'winback_30d', 60))
          continue;

        const { sunSign } = parsePlacements(user.birth_chart);

        const html = await renderWinBackEmail({
          userName: user.name || 'there',
          userEmail: user.email,
          sunSign,
        });

        await sendEmail({
          to: user.email,
          from: 'Sammii <hello@lunary.app>',
          replyTo: 'sammii@lunary.app',
          subject: sunSign
            ? `Still here, and your ${sunSign} chart has been busy`
            : 'Still here, and I have something for you',
          html,
          tracking: {
            userId: user.user_id,
            notificationType: 'win_back',
            notificationId: `winback-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'reengagement',
              campaign: 'winback_30d',
            },
          },
        });

        await recordCampaignSent(user.user_id, 'winback_30d');
        emailsSent++;
        counts['winback_30d']++;
      } catch (error) {
        console.error(
          `[Re-Engagement] winback_30d failed for ${user.email}:`,
          error,
        );
        emailsFailed++;
      }
    }

    // ─── 6. Missed streak ──────────────────────────────────────────────────

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
          `[Re-Engagement] missed_streak failed for ${user.email}:`,
          error,
        );
        emailsFailed++;
      }
    }

    // ─── 7. Milestones ─────────────────────────────────────────────────────

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
          `[Re-Engagement] milestone failed for ${user.email}:`,
          error,
        );
        emailsFailed++;
      }
    }

    // ─── 8. Monthly insights ready ─────────────────────────────────────────

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
          `[Re-Engagement] insights_ready failed for ${row.email}:`,
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
