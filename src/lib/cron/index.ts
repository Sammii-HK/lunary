import { sql } from '@vercel/postgres';
import Stripe from 'stripe';
import { sendEmail } from '@/lib/email';
import {
  generateTrialReminderEmailHTML,
  generateTrialReminderEmailText,
} from '@/lib/email-templates/trial-nurture';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export interface DeletionResult {
  processed: number;
  errors: number;
  details: Array<{ userId: string; success: boolean; error?: string }>;
}

export interface TrialReminderResult {
  sent: {
    threeDayReminders: number;
    oneDayReminders: number;
    total: number;
  };
  errors?: string[];
}

export async function processAccountDeletions(): Promise<DeletionResult> {
  console.log('🗑️ Processing scheduled account deletions...');

  const pendingDeletions = await sql`
    SELECT * FROM deletion_requests
    WHERE status = 'pending'
      AND scheduled_for <= NOW()
  `;

  const results: DeletionResult = {
    processed: 0,
    errors: 0,
    details: [],
  };

  for (const deletion of pendingDeletions.rows) {
    try {
      const userId = deletion.user_id;

      const subscription = await sql`
        SELECT stripe_subscription_id, stripe_customer_id
        FROM subscriptions WHERE user_id = ${userId}
      `;

      if (subscription.rows[0]?.stripe_subscription_id) {
        try {
          await stripe.subscriptions.cancel(
            subscription.rows[0].stripe_subscription_id,
          );
        } catch {
          console.log('Subscription already cancelled or not found');
        }
      }

      await sql`DELETE FROM push_subscriptions WHERE user_id = ${userId}`;
      await sql`DELETE FROM tarot_readings WHERE user_id = ${userId}`;
      await sql`DELETE FROM user_sessions WHERE user_id = ${userId}`;
      await sql`DELETE FROM ai_threads WHERE user_id = ${userId}`;
      await sql`DELETE FROM ai_usage WHERE user_id = ${userId}`;
      await sql`DELETE FROM user_profiles WHERE user_id = ${userId}`;
      await sql`DELETE FROM shop_purchases WHERE user_id = ${userId}`;
      await sql`DELETE FROM user_notes WHERE user_id = ${userId}`;
      await sql`DELETE FROM user_streaks WHERE user_id = ${userId}`;
      await sql`DELETE FROM api_keys WHERE user_id = ${userId}`;
      await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;
      await sql`DELETE FROM conversion_events WHERE user_id = ${userId}`;
      await sql`DELETE FROM journal_patterns WHERE user_id = ${userId}`;
      await sql`DELETE FROM email_events WHERE user_id = ${userId}`;
      await sql`DELETE FROM refund_requests WHERE user_id = ${userId}`;

      await sql`DELETE FROM "account" WHERE "userId" = ${userId}`;
      await sql`DELETE FROM "session" WHERE "userId" = ${userId}`;
      await sql`DELETE FROM "user" WHERE id = ${userId}`;

      await sql`
        UPDATE deletion_requests
        SET status = 'completed', processed_at = NOW()
        WHERE id = ${deletion.id}
      `;

      results.processed++;
      results.details.push({ userId, success: true });
      console.log(`✅ Deleted account: ${userId}`);
    } catch (error) {
      console.error(`❌ Failed to delete account ${deletion.user_id}:`, error);
      results.errors++;
      results.details.push({
        userId: deletion.user_id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  console.log(
    `🗑️ Deletion processing complete: ${results.processed} processed, ${results.errors} errors`,
  );

  return results;
}

export async function sendTrialReminders(): Promise<TrialReminderResult> {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  const oneDayFromNow = new Date();
  oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

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
  `;

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
  `;

  let sent3Day = 0;
  let sent1Day = 0;
  const errors: string[] = [];

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

  return {
    sent: {
      threeDayReminders: sent3Day,
      oneDayReminders: sent1Day,
      total: sent3Day + sent1Day,
    },
    errors: errors.length > 0 ? errors : undefined,
  };
}
