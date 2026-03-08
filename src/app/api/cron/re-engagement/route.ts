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

export const dynamic = 'force-dynamic';

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

    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    let emailsSent = 0;
    let emailsFailed = 0;

    // 1. 7 days inactive (personalised with Sun sign and transit context)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const inactive7Days = await sql`
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
        AND NOT EXISTS (
          SELECT 1 FROM user_sessions us
          WHERE us.user_id = s.user_id
          AND us.session_timestamp >= ${sevenDaysAgo.toISOString()}
        )
        AND (s.churn_prevention_sent = false OR s.churn_prevention_sent IS NULL)
      LIMIT 50
    `;

    for (const user of inactive7Days.rows) {
      try {
        if (await hasReceivedCampaign(user.user_id, '7days_inactive', 30)) {
          continue;
        }

        const chart = Array.isArray(user.birth_chart) ? user.birth_chart : [];
        const sunEntry = chart.find(
          (p: Record<string, unknown>) => p?.body === 'Sun',
        );
        const sunSign = sunEntry?.sign as string | undefined;

        const html = await renderChurnPrevention({
          userName: user.name || 'there',
          sunSign,
          daysSinceLastVisit: 7,
          userEmail: user.email,
        });

        await sendEmail({
          to: user.email,
          subject:
            'The planets have been busy — here is what changed in your chart',
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
      } catch (error) {
        console.error(
          `Failed to send 7-day re-engagement to ${user.email}:`,
          error,
        );
        emailsFailed++;
      }
    }

    // 2. Missed streak
    const missedStreaks = await getUsersWithMissedStreaks();
    for (const user of missedStreaks) {
      try {
        if (await hasReceivedCampaign(user.userId, 'missed_streak', 3)) {
          continue;
        }

        const emailHtml = generateReEngagementStreakEmailHTML(
          user.email.split('@')[0],
          user.streak,
          baseUrl,
        );
        const emailText = generateReEngagementStreakEmailText(
          user.email.split('@')[0],
          user.streak,
          baseUrl,
        );

        await sendEmail({
          to: user.email,
          subject: "🔥 Don't break your streak!",
          html: emailHtml,
          text: emailText,
        });

        await recordCampaignSent(user.userId, 'missed_streak', {
          streak: user.streak,
        });
        emailsSent++;
      } catch (error) {
        console.error(
          `Failed to send streak re-engagement to ${user.email}:`,
          error,
        );
        emailsFailed++;
      }
    }

    // 3. Milestones
    const milestones = await getMilestoneUsers();
    for (const user of milestones) {
      try {
        if (await hasReceivedCampaign(user.userId, 'milestone', 7)) {
          continue;
        }

        const emailHtml = generateReEngagementMilestoneEmailHTML(
          user.email.split('@')[0],
          user.milestone,
          baseUrl,
        );
        const emailText = generateReEngagementMilestoneEmailText(
          user.email.split('@')[0],
          user.milestone,
          baseUrl,
        );

        await sendEmail({
          to: user.email,
          subject: '🎉 Congratulations!',
          html: emailHtml,
          text: emailText,
        });

        await recordCampaignSent(user.userId, 'milestone', {
          milestone: user.milestone,
        });
        emailsSent++;
      } catch (error) {
        console.error(
          `Failed to send milestone re-engagement to ${user.email}:`,
          error,
        );
        emailsFailed++;
      }
    }

    // 4. Insights ready (check for users with monthly insights ready)
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const insightsReady = await sql`
      SELECT DISTINCT mi.user_id, sub.email as email
      FROM monthly_insights mi
      INNER JOIN subscriptions sub ON sub.user_id = mi.user_id
      WHERE mi.month = ${month}
        AND mi.year = ${year}
        AND mi.updated_at >= NOW() - INTERVAL '24 hours'
        AND sub.email IS NOT NULL
      LIMIT 50
    `;

    for (const row of insightsReady.rows) {
      try {
        if (await hasReceivedCampaign(row.user_id, 'insights_ready', 7)) {
          continue;
        }

        const emailHtml = generateReEngagementInsightsEmailHTML(
          row.email.split('@')[0],
          baseUrl,
        );
        const emailText = generateReEngagementInsightsEmailText(
          row.email.split('@')[0],
          baseUrl,
        );

        await sendEmail({
          to: row.email,
          subject: '✨ Your Monthly Insights Are Ready',
          html: emailHtml,
          text: emailText,
        });

        await recordCampaignSent(row.user_id, 'insights_ready');
        emailsSent++;
      } catch (error) {
        console.error(
          `Failed to send insights re-engagement to ${row.email}:`,
          error,
        );
        emailsFailed++;
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent,
      emailsFailed,
      campaigns: {
        '7days_inactive': inactive7Days.rows.length,
        missed_streak: missedStreaks.length,
        milestone: milestones.length,
        insights_ready: insightsReady.rows.length,
      },
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
