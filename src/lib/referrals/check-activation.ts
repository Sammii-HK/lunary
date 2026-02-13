import { sql } from '@vercel/postgres';
import { sendToUser } from '@/lib/notifications/native-push-sender';
import { processReferralTierReward } from '@/utils/referrals/reward-processor';
import { getNextTier } from '@/utils/referrals/reward-tiers';
import {
  REFERRAL_DAYS_REFERRED,
  REFERRAL_DAYS_REFERRER,
} from '@/lib/referrals';

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

    // Account age gate: skip activation for accounts less than 1 hour old
    const userResult = await sql`
      SELECT "createdAt" FROM "user" WHERE id = ${userId} LIMIT 1
    `;
    if (userResult.rows.length > 0) {
      const createdAt = new Date(userResult.rows[0].createdAt);
      const ageMs = Date.now() - createdAt.getTime();
      if (ageMs < 60 * 60 * 1000) {
        return; // Account too new
      }
    }

    // Activation velocity cap: max 3 activations per referrer per 24 hours
    const velocityResult = await sql`
      SELECT COUNT(*) as count FROM user_referrals
      WHERE referrer_user_id = ${referral.referrer_user_id}
        AND activated = true
        AND activated_at > NOW() - INTERVAL '24 hours'
    `;
    if (Number(velocityResult.rows[0]?.count ?? 0) >= 3) {
      // Mark as activated but skip reward
      await sql`
        UPDATE user_referrals
        SET activated = true, activated_at = NOW(), activation_event = ${eventType}
        WHERE id = ${referral.id}
      `;
      return;
    }

    // IP deduplication: check if another referral from the same referrer
    // was activated from the same IP in the last 24 hours
    const sessionResult = await sql`
      SELECT "ipAddress" FROM "session"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;
    const activatingIp = sessionResult.rows[0]?.ipAddress;
    if (activatingIp) {
      const ipDupResult = await sql`
        SELECT COUNT(*) as count FROM user_referrals ur
        JOIN "session" s ON s."userId" = ur.referred_user_id
        WHERE ur.referrer_user_id = ${referral.referrer_user_id}
          AND ur.activated = true
          AND ur.activated_at > NOW() - INTERVAL '24 hours'
          AND ur.referred_user_id != ${userId}
          AND s."ipAddress" = ${activatingIp}
        LIMIT 1
      `;
      if (Number(ipDupResult.rows[0]?.count ?? 0) > 0) {
        // Same IP already activated a referral for this referrer — skip reward
        await sql`
          UPDATE user_referrals
          SET activated = true, activated_at = NOW(), activation_event = ${eventType}
          WHERE id = ${referral.id}
        `;
        return;
      }
    }

    // Grant reward to both users (referrer gets 7 days, referred gets 30 days)
    await grantActivationReward(
      referral.referrer_user_id,
      REFERRAL_DAYS_REFERRER,
    );
    await grantActivationReward(userId, REFERRAL_DAYS_REFERRED);

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

    // Count activated referrals for tier progress notification
    const activatedResult = await sql`
      SELECT COUNT(*)::int AS count FROM user_referrals
      WHERE referrer_user_id = ${referral.referrer_user_id}
        AND activated = true
    `;
    const activatedCount = activatedResult.rows[0]?.count ?? 0;
    const nextTier = getNextTier(activatedCount);

    // Send notifications (best-effort)
    const tierTeaser = nextTier
      ? ` ${nextTier.threshold - activatedCount} more to unlock ${nextTier.label}.`
      : '';
    sendToUser(referral.referrer_user_id, {
      title: 'Your referral is active!',
      body: `Your friend joined Lunary — you've earned a bonus week of Pro!${tierTeaser}`,
      data: { type: 'referral_activated', action: '/referrals' },
    }).catch(() => {});

    sendToUser(userId, {
      title: 'Welcome bonus unlocked!',
      body: `You've earned ${REFERRAL_DAYS_REFERRED} days of Pro for starting your cosmic practice!`,
      data: { type: 'referral_activated', action: '/app' },
    }).catch(() => {});

    // Process tiered referral rewards for the referrer
    processReferralTierReward(referral.referrer_user_id).catch(() => {});

    console.log(
      `[Referral] Activation reward granted: referrer=${referral.referrer_user_id}, referred=${userId}, event=${eventType}`,
    );
  } catch (error) {
    // Non-critical - don't fail the parent action
    console.error('[Referral] Activation check failed:', error);
  }
}

/**
 * Grant Pro trial/extension to a user as a referral reward.
 * Referred users get 30 days, referrers get 7 days per activation.
 */
async function grantActivationReward(
  userId: string,
  days: number,
): Promise<void> {
  try {
    const interval = `${days} days`;

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

    // If already has active subscription, extend
    if (subscriptionRow) {
      await sql`
        UPDATE subscriptions
        SET
          current_period_end = current_period_end + ${interval}::interval,
          updated_at = NOW()
        WHERE user_id = ${userId}
        AND status IN ('active', 'trial')
      `;
      return;
    }

    // Grant new trial
    await sql`
      INSERT INTO subscriptions (
        user_id, status, plan_type, trial_ends_at,
        current_period_end, user_email, user_name, trial_used
      )
      VALUES (
        ${userId}, 'trial', 'monthly',
        NOW() + ${interval}::interval, NOW() + ${interval}::interval,
        NULL, NULL, true
      )
      ON CONFLICT (user_id) DO UPDATE SET
        status = 'trial',
        trial_ends_at = NOW() + ${interval}::interval,
        current_period_end = NOW() + ${interval}::interval,
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
