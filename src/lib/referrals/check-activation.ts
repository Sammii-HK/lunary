import { sql } from '@vercel/postgres';
import { sendToUser } from '@/lib/notifications/native-push-sender';

/**
 * Activation events that trigger referral rewards.
 * Reward is granted when the referred user completes their first real action.
 */
export type ActivationEvent =
  | 'tarot_spread_completed'
  | 'journal_entry_created'
  | 'daily_ritual_completed';

/**
 * Check if a referred user has completed an activation event.
 * If so, grant referral rewards to both the referrer and the referred user.
 *
 * This is called from journal, tarot, and ritual endpoints after a qualifying action.
 * It's designed to be fire-and-forget (non-blocking, catches errors internally).
 */
export async function checkInviteActivation(
  userId: string,
  eventType: ActivationEvent,
): Promise<void> {
  try {
    // Find unactivated referral for this user
    const referralResult = await sql`
      SELECT id, referrer_user_id, referred_user_id
      FROM user_referrals
      WHERE referred_user_id = ${userId}
        AND (activated = false OR activated IS NULL)
        AND (reward_granted = false OR reward_granted IS NULL)
      LIMIT 1
    `;

    if (referralResult.rows.length === 0) {
      return; // Not referred, or already activated
    }

    const referral = referralResult.rows[0];

    // Self-referral prevention
    if (referral.referrer_user_id === userId) {
      return;
    }

    // Grant reward to both users
    await grantActivationReward(referral.referrer_user_id);
    await grantActivationReward(userId);

    // Mark as activated
    await sql`
      UPDATE user_referrals
      SET activated = true,
          activated_at = NOW(),
          activation_event = ${eventType},
          reward_granted = true,
          reward_granted_at = NOW()
      WHERE id = ${referral.id}
    `;

    // Send notifications (best-effort)
    sendToUser(referral.referrer_user_id, {
      title: 'Your referral is active!',
      body: "Your friend started their cosmic journey. You've both earned 30 days of Lunary+!",
      data: { type: 'referral_activated', action: '/profile' },
    }).catch(() => {});

    sendToUser(userId, {
      title: 'Welcome bonus unlocked!',
      body: "You've earned 30 days of Lunary+ for starting your cosmic practice!",
      data: { type: 'referral_activated', action: '/app' },
    }).catch(() => {});

    console.log(
      `[Referral] Activation reward granted: referrer=${referral.referrer_user_id}, referred=${userId}, event=${eventType}`,
    );
  } catch (error) {
    // Non-critical - don't fail the parent action
    console.error('[Referral] Activation check failed:', error);
  }
}

/**
 * Grant 30-day Pro trial/extension to a user as a referral reward.
 * Mirrors the logic from src/lib/referrals.ts grantReferralReward().
 */
async function grantActivationReward(userId: string): Promise<void> {
  try {
    // Check for existing subscription
    const subscription = await sql`
      SELECT status, stripe_subscription_id
      FROM subscriptions
      WHERE user_id = ${userId}
      AND status IN ('active', 'trial')
      LIMIT 1
    `;

    const subscriptionRow = subscription.rows[0] as
      | { status: string; stripe_subscription_id: string | null }
      | undefined;

    // If already has active subscription, extend by 30 days
    if (subscriptionRow) {
      await sql`
        UPDATE subscriptions
        SET
          current_period_end = current_period_end + INTERVAL '30 days',
          updated_at = NOW()
        WHERE user_id = ${userId}
        AND status IN ('active', 'trial')
      `;
      return;
    }

    // Grant new 30-day trial
    await sql`
      INSERT INTO subscriptions (
        user_id, status, plan_type, trial_ends_at,
        current_period_end, user_email, user_name, trial_used
      )
      VALUES (
        ${userId}, 'trial', 'monthly',
        NOW() + INTERVAL '30 days', NOW() + INTERVAL '30 days',
        NULL, NULL, true
      )
      ON CONFLICT (user_id) DO UPDATE SET
        status = 'trial',
        trial_ends_at = NOW() + INTERVAL '30 days',
        current_period_end = NOW() + INTERVAL '30 days',
        trial_used = true,
        updated_at = NOW()
    `;
  } catch (error) {
    console.error(
      `[Referral] Failed to grant activation reward to ${userId}:`,
      error,
    );
  }
}
