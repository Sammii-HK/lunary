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

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
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
      AND NOT (
        s.has_discount = true
        AND (
          COALESCE(s.discount_percent, 0) >= 100
          OR (s.monthly_amount_due IS NOT NULL AND s.monthly_amount_due <= 0)
        )
      )
      AND (s.promo_code IS NULL OR s.promo_code != 'FULLORBIT')
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
      AND NOT (
        s.has_discount = true
        AND (
          COALESCE(s.discount_percent, 0) >= 100
          OR (s.monthly_amount_due IS NOT NULL AND s.monthly_amount_due <= 0)
        )
      )
      AND (s.promo_code IS NULL OR s.promo_code != 'FULLORBIT')
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
      AND NOT (
        s.has_discount = true
        AND (
          COALESCE(s.discount_percent, 0) >= 100
          OR (s.monthly_amount_due IS NOT NULL AND s.monthly_amount_due <= 0)
        )
      )
      AND (s.promo_code IS NULL OR s.promo_code != 'FULLORBIT')
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

    return NextResponse.json({
      success: true,
      sent: {
        threeDayReminders: sent3Day,
        oneDayReminders: sent1Day,
        trialExpired: sentExpired,
        total: sent3Day + sent1Day + sentExpired,
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
