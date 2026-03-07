import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendEmail } from '@/lib/email';
import {
  generateTrialReminderEmailHTML,
  generateTrialReminderEmailText,
} from '@/lib/email-templates/trial-nurture';
import {
  generateTrialExpiredEmailHTML,
  generateTrialExpiredEmailText,
} from '@/lib/email-components/TrialExpiredEmail';
import {
  renderWinBackDay3,
  renderWinBackDay7,
} from '@/lib/email-components/PostTrialWinBackEmails';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find users with trials ending in 3 days or 1 day
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    // Get trials ending in 3 days (first reminder)
    const threeDayReminders = await sql`
      SELECT DISTINCT
        s.user_id,
        s.user_email as email,
        s.user_name as name,
        s.trial_ends_at,
        s.plan_type
      FROM subscriptions s
      WHERE s.status = 'trial'
      AND s.trial_ends_at::date = ${threeDaysFromNow.toISOString().split('T')[0]}
      AND (s.trial_reminder_3d_sent = false OR s.trial_reminder_3d_sent IS NULL)
      AND s.user_email IS NOT NULL
      AND (s.has_discount IS NULL OR s.has_discount = false)
      AND (s.promo_code IS NULL OR s.promo_code = '')
    `;

    // Get trials ending in 1 day (final reminder)
    const oneDayReminders = await sql`
      SELECT DISTINCT
        s.user_id,
        s.user_email as email,
        s.user_name as name,
        s.trial_ends_at,
        s.plan_type
      FROM subscriptions s
      WHERE s.status = 'trial'
      AND s.trial_ends_at::date = ${oneDayFromNow.toISOString().split('T')[0]}
      AND (s.trial_reminder_1d_sent = false OR s.trial_reminder_1d_sent IS NULL)
      AND s.user_email IS NOT NULL
      AND (s.has_discount IS NULL OR s.has_discount = false)
      AND (s.promo_code IS NULL OR s.promo_code = '')
    `;

    let sent3Day = 0;
    let sent1Day = 0;
    const errors: string[] = [];

    // Send 3-day reminders
    for (const user of threeDayReminders.rows) {
      try {
        const trialEnd = new Date(user.trial_ends_at);
        const daysRemaining = Math.ceil(
          (trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );

        const html = await generateTrialReminderEmailHTML(
          user.name || 'there',
          daysRemaining,
        );
        const text = await generateTrialReminderEmailText(
          user.name || 'there',
          daysRemaining,
        );

        await sendEmail({
          to: user.email,
          subject: `⏰ ${daysRemaining} Days Left in Your Trial - Lunary`,
          html,
          text,
          tracking: {
            userId: user.user_id,
            notificationType: 'trial_reminder',
            notificationId: `trial-reminder-3d-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'trial_reminder',
              content: '3_day',
            },
          },
        });

        // Mark as sent
        await sql`
          UPDATE subscriptions
          SET trial_reminder_3d_sent = true
          WHERE user_id = ${user.user_id}
          AND status = 'trial'
        `;

        sent3Day++;
      } catch (error) {
        errors.push(
          `Failed to send 3-day reminder to ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    // Send 1-day reminders
    for (const user of oneDayReminders.rows) {
      try {
        const trialEnd = new Date(user.trial_ends_at);
        const daysRemaining = Math.ceil(
          (trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );

        const html = await generateTrialReminderEmailHTML(
          user.name || 'there',
          daysRemaining,
        );
        const text = await generateTrialReminderEmailText(
          user.name || 'there',
          daysRemaining,
        );

        await sendEmail({
          to: user.email,
          subject: `⏰ Last Day! Your Trial Ends Tomorrow - Lunary`,
          html,
          text,
          tracking: {
            userId: user.user_id,
            notificationType: 'trial_reminder',
            notificationId: `trial-reminder-1d-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'trial_reminder',
              content: '1_day',
            },
          },
        });

        // Mark as sent
        await sql`
          UPDATE subscriptions
          SET trial_reminder_1d_sent = true
          WHERE user_id = ${user.user_id}
          AND status = 'trial'
        `;

        sent1Day++;
      } catch (error) {
        errors.push(
          `Failed to send 1-day reminder to ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    // === TRIAL EXPIRED EMAILS ===
    // Find users whose trial ended (past) and haven't received the expired email
    let sentExpired = 0;
    const expiredTrials = await sql`
      SELECT DISTINCT
        s.user_id,
        s.user_email as email,
        s.user_name as name,
        s.trial_ends_at,
        s.plan_type
      FROM subscriptions s
      WHERE s.status = 'trial'
      AND s.trial_ends_at < NOW()
      AND (s.trial_expired_email_sent = false OR s.trial_expired_email_sent IS NULL)
      AND s.user_email IS NOT NULL
      AND (s.has_discount IS NULL OR s.has_discount = false)
      AND (s.promo_code IS NULL OR s.promo_code = '')
      LIMIT 100
    `;

    for (const user of expiredTrials.rows) {
      try {
        const trialEnd = new Date(user.trial_ends_at);
        const daysSinceExpiry = Math.floor(
          (Date.now() - trialEnd.getTime()) / (1000 * 60 * 60 * 24),
        );
        // Approximate missed insights: ~1 per day since expiry
        const missedInsights = Math.max(1, daysSinceExpiry);

        const html = await generateTrialExpiredEmailHTML(
          user.name || 'there',
          missedInsights,
          user.email,
        );
        const text = generateTrialExpiredEmailText(
          user.name || 'there',
          missedInsights,
          user.email,
        );

        await sendEmail({
          to: user.email,
          subject: 'Your trial has ended — Lunary',
          html,
          text,
          tracking: {
            userId: user.user_id,
            notificationType: 'trial_expired',
            notificationId: `trial-expired-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'trial_expired',
            },
          },
        });

        // Mark as sent
        await sql`
          UPDATE subscriptions
          SET trial_expired_email_sent = true
          WHERE user_id = ${user.user_id}
        `;

        sentExpired++;
      } catch (error) {
        errors.push(
          `Failed to send trial expired email to ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    // === WIN-BACK DAY 3: What you missed ===
    let sentWinback3 = 0;
    const winback3Trials = await sql`
      SELECT DISTINCT
        s.user_id,
        s.user_email as email,
        s.user_name as name,
        s.trial_ends_at,
        up.birth_chart
      FROM subscriptions s
      LEFT JOIN user_profiles up ON s.user_id = up.user_id
      WHERE s.status IN ('trial', 'expired', 'free')
      AND s.trial_ends_at IS NOT NULL
      AND s.trial_ends_at::date = ${new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0]}
      AND s.trial_expired_email_sent = true
      AND (s.winback_day3_sent = false OR s.winback_day3_sent IS NULL)
      AND s.is_paying = false
      AND s.user_email IS NOT NULL
      LIMIT 100
    `;

    for (const user of winback3Trials.rows) {
      try {
        const chart = Array.isArray(user.birth_chart) ? user.birth_chart : [];
        const sunEntry = chart.find(
          (p: Record<string, unknown>) => p?.body === 'Sun',
        );
        const sunSign = sunEntry?.sign as string | undefined;

        const html = await renderWinBackDay3({
          userName: user.name || 'there',
          sunSign,
          missedDays: 3,
          userEmail: user.email,
        });

        await sendEmail({
          to: user.email,
          subject: '3 days of personalised guidance you missed',
          html,
          tracking: {
            userId: user.user_id,
            notificationType: 'winback',
            notificationId: `winback-day3-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'winback',
              content: 'day3',
            },
          },
        });

        await sql`UPDATE subscriptions SET winback_day3_sent = true WHERE user_id = ${user.user_id}`;
        sentWinback3++;
      } catch (error) {
        errors.push(
          `Winback D3 → ${user.email}: ${error instanceof Error ? error.message : 'Unknown'}`,
        );
      }
    }

    // === WIN-BACK DAY 7: Last chance with discount ===
    let sentWinback7 = 0;
    const winback7Trials = await sql`
      SELECT DISTINCT
        s.user_id,
        s.user_email as email,
        s.user_name as name,
        s.trial_ends_at,
        up.birth_chart
      FROM subscriptions s
      LEFT JOIN user_profiles up ON s.user_id = up.user_id
      WHERE s.status IN ('trial', 'expired', 'free')
      AND s.trial_ends_at IS NOT NULL
      AND s.trial_ends_at::date = ${new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]}
      AND s.winback_day3_sent = true
      AND (s.winback_day7_sent = false OR s.winback_day7_sent IS NULL)
      AND s.is_paying = false
      AND s.user_email IS NOT NULL
      LIMIT 100
    `;

    for (const user of winback7Trials.rows) {
      try {
        const chart = Array.isArray(user.birth_chart) ? user.birth_chart : [];
        const sunEntry = chart.find(
          (p: Record<string, unknown>) => p?.body === 'Sun',
        );
        const sunSign = sunEntry?.sign as string | undefined;

        const html = await renderWinBackDay7({
          userName: user.name || 'there',
          sunSign,
          userEmail: user.email,
        });

        await sendEmail({
          to: user.email,
          subject: 'Come back for 20% off — your chart is waiting',
          html,
          tracking: {
            userId: user.user_id,
            notificationType: 'winback',
            notificationId: `winback-day7-${user.user_id}`,
            utm: {
              source: 'email',
              medium: 'lifecycle',
              campaign: 'winback',
              content: 'day7',
            },
          },
        });

        await sql`UPDATE subscriptions SET winback_day7_sent = true WHERE user_id = ${user.user_id}`;
        sentWinback7++;
      } catch (error) {
        errors.push(
          `Winback D7 → ${user.email}: ${error instanceof Error ? error.message : 'Unknown'}`,
        );
      }
    }

    return NextResponse.json({
      success: true,
      sent: {
        threeDayReminders: sent3Day,
        oneDayReminders: sent1Day,
        trialExpired: sentExpired,
        winbackDay3: sentWinback3,
        winbackDay7: sentWinback7,
        total: sent3Day + sent1Day + sentExpired + sentWinback3 + sentWinback7,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Trial reminder cron error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send trial reminders',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
