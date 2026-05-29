import { sql } from '@vercel/postgres';
import { sendEmail } from '@/lib/email';
import {
  generateTrialWelcomeEmailHTML,
  generateTrialWelcomeEmailText,
} from '@/lib/email-templates/trial-nurture';

/**
 * Day-0 welcome email, fired the moment a user verifies their email.
 *
 * BACKGROUND
 * ----------
 * The revenue/lifecycle audit found that the "Welcome email is sent after email
 * verification" comment in `src/lib/auth.ts` was never true: nothing sent a
 * Day-0 welcome, so the first content email a new trial user received was the
 * trial-nurture Day 1 (Sun sign) email ~24h later. Day-0 "try these 3 things"
 * onboarding is the single biggest activation lever for a 7-day trial, so this
 * closes that gap by reusing the existing `TrialWelcomeEmail` template.
 *
 * SAFETY GATE (default OFF / dry-run)
 * -----------------------------------
 * The actual Resend send is gated behind `WELCOME_EMAIL_ENABLED`, which defaults
 * to OFF. With the flag off this function performs every check (preferences,
 * idempotency) and logs what it WOULD send, but never calls Resend. This mirrors
 * the cautious roll-out pattern used elsewhere in the lifecycle stack and lets
 * the trigger ship wired-up-but-dormant. See the "Go-live" note at the bottom of
 * this file for the single env change required to turn it on.
 *
 * IDEMPOTENCY
 * -----------
 * better-auth can invoke the verification callback more than once (e.g. a retried
 * request). We use the existing `analytics_notification_events` ledger with a
 * deterministic `welcome-day0-<userId>` notification id as the de-dupe guard, the
 * same approach as the daily-digest / daily-horoscope crons. No schema change is
 * required. `sendEmail` records the `sent` event, which closes the loop.
 */

export const WELCOME_NOTIFICATION_TYPE = 'trial_welcome';

/**
 * Returns true when the live send is enabled. Defaults to OFF (dry-run) for any
 * value other than the explicit string "true", so a missing or malformed env var
 * can never start sending.
 */
export function isWelcomeEmailEnabled(): boolean {
  return process.env.WELCOME_EMAIL_ENABLED === 'true';
}

function welcomeNotificationId(userId: string): string {
  return `welcome-day0-${userId}`;
}

export interface WelcomeEmailUser {
  id?: string | null;
  email?: string | null;
  name?: string | null;
}

export type WelcomeEmailResult =
  | { sent: true; messageId?: string }
  | {
      sent: false;
      reason:
        | 'no_email'
        | 'disabled_dry_run'
        | 'already_sent'
        | 'unsubscribed'
        | 'error';
      dryRun?: boolean;
    };

/**
 * Send (or, in dry-run, simulate) the Day-0 welcome email for a freshly verified
 * user. Never throws: a failed welcome email must never block the verification
 * flow. The caller (the better-auth `onEmailVerification` hook) can safely fire
 * and forget.
 */
export async function sendWelcomeEmail(
  user: WelcomeEmailUser,
): Promise<WelcomeEmailResult> {
  const email = user.email?.trim();
  const userId = user.id || email;

  if (!email || !userId) {
    return { sent: false, reason: 'no_email' };
  }

  const enabled = isWelcomeEmailEnabled();
  const notificationId = welcomeNotificationId(userId);

  try {
    // Respect a global opt-out even in dry-run, so the dry-run logs reflect the
    // real audience we would email.
    const prefs = await sql`
      SELECT unsubscribed_all
      FROM email_preferences
      WHERE user_id = ${userId}
      LIMIT 1
    `;
    if (prefs.rows[0]?.unsubscribed_all === true) {
      console.log(
        `[welcome-email] skip (unsubscribed_all) user=${userId} enabled=${enabled}`,
      );
      return { sent: false, reason: 'unsubscribed', dryRun: !enabled };
    }

    // Idempotency: never send the Day-0 welcome twice.
    const alreadySent = await sql`
      SELECT 1
      FROM analytics_notification_events
      WHERE user_id = ${userId}
        AND notification_type = ${WELCOME_NOTIFICATION_TYPE}
        AND notification_id = ${notificationId}
      LIMIT 1
    `;
    if (alreadySent.rows.length > 0) {
      return { sent: false, reason: 'already_sent', dryRun: !enabled };
    }

    if (!enabled) {
      // Dry-run: log the intent and return without touching Resend.
      console.log(
        `[welcome-email] DRY-RUN (WELCOME_EMAIL_ENABLED!=true) would send Day-0 welcome to user=${userId}`,
      );
      return { sent: false, reason: 'disabled_dry_run', dryRun: true };
    }

    const userName = user.name || 'there';
    // New auto-trials are monthly-style (see auth.ts databaseHooks.user.create);
    // planType only affects copy in the welcome template.
    const html = await generateTrialWelcomeEmailHTML(
      userName,
      7,
      'monthly',
      email,
    );
    const text = generateTrialWelcomeEmailText(userName, 7, 'monthly', email);

    const result = await sendEmail({
      to: email,
      subject: '✨ Your Astral Guide is ready - Lunary',
      html,
      text,
      tracking: {
        userId,
        notificationType: WELCOME_NOTIFICATION_TYPE,
        notificationId,
        utm: {
          source: 'email',
          medium: 'lifecycle',
          campaign: 'trial_welcome',
          content: 'day0',
        },
      },
    });

    const messageId =
      result && 'id' in result ? (result as { id: string }).id : undefined;
    console.log(`[welcome-email] sent Day-0 welcome to user=${userId}`);
    return { sent: true, messageId };
  } catch (error) {
    console.error('[welcome-email] failed:', error);
    return { sent: false, reason: 'error', dryRun: !enabled };
  }
}

/*
 * GO-LIVE (Sammii) — turning the Day-0 welcome email ON
 * -----------------------------------------------------
 * 1. Confirm the existing TrialWelcomeEmail copy reads well for a brand-new
 *    user (it is the "try these 3 things" onboarding email already used by the
 *    admin /api/emails/trial-welcome route).
 * 2. In Vercel → Project → Settings → Environment Variables, add:
 *        WELCOME_EMAIL_ENABLED = true
 *    for the Production (and Preview, if you want to test) environment, then
 *    redeploy. No code change, no cron, no vercel.json entry is needed — the
 *    send is triggered inline by the better-auth onEmailVerification hook.
 * 3. To pause again, set WELCOME_EMAIL_ENABLED back to false (or delete it).
 *    Anything other than the exact string "true" keeps it in dry-run.
 *
 * While the flag is off the hook still runs and logs "[welcome-email] DRY-RUN ..."
 * so you can confirm the trigger fires for real verifications before enabling it.
 */
