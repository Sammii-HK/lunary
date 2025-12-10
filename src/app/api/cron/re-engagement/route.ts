import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendEmail } from '@/lib/email';
import {
  getInactiveUsers,
  getUsersWithMissedStreaks,
  getMilestoneUsers,
  hasReceivedCampaign,
  recordCampaignSent,
} from '@/lib/re-engagement/campaign-manager';
import {
  generateReEngagement7DaysEmailHTML,
  generateReEngagement7DaysEmailText,
} from '@/lib/email/templates/re-engagement-7days';
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

    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    let emailsSent = 0;
    let emailsFailed = 0;

    // 1. 7 days inactive
    const inactive7Days = await getInactiveUsers(7);
    for (const user of inactive7Days) {
      try {
        if (await hasReceivedCampaign(user.userId, '7days_inactive', 7)) {
          continue;
        }

        const emailHtml = generateReEngagement7DaysEmailHTML(
          user.email.split('@')[0],
          baseUrl,
        );
        const emailText = generateReEngagement7DaysEmailText(
          user.email.split('@')[0],
          baseUrl,
        );

        await sendEmail({
          to: user.email,
          subject: '🌙 We miss you!',
          html: emailHtml,
          text: emailText,
        });

        await recordCampaignSent(user.userId, '7days_inactive');
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
        '7days_inactive': inactive7Days.length,
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
