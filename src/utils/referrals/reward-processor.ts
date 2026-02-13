import { sql } from '@vercel/postgres';
import { sendToUser } from '@/lib/notifications/native-push-sender';
import {
  getNewlyCrossedTier,
  getProDurationDays,
  type RewardType,
} from './reward-tiers';

/**
 * Process referral tier rewards after a new referral activates.
 * Called from check-activation.ts after granting the base reward.
 */
export async function processReferralTierReward(
  referrerUserId: string,
): Promise<void> {
  try {
    // Count total activated referrals for this user
    const countResult = await sql`
      SELECT COUNT(*)::int AS count
      FROM user_referrals
      WHERE referrer_user_id = ${referrerUserId}
        AND activated = true
    `;

    const totalActivated = countResult.rows[0]?.count ?? 0;
    const previousCount = totalActivated - 1; // Before this activation

    // Check if a new tier was crossed
    const newTier = getNewlyCrossedTier(previousCount, totalActivated);
    if (!newTier) return;

    // Grant the appropriate reward
    await grantTierReward(referrerUserId, newTier.reward, newTier.threshold);

    // Update the reward_tier on the most recent referral
    await sql`
      UPDATE user_referrals
      SET reward_tier = ${newTier.threshold}
      WHERE referrer_user_id = ${referrerUserId}
        AND activated = true
      ORDER BY activated_at DESC
      LIMIT 1
    `;

    // Send notification
    sendToUser(referrerUserId, {
      title: `You've reached ${newTier.label}!`,
      body: newTier.description,
      data: { type: 'referral_tier', action: '/referrals' },
    }).catch(() => {});

    console.log(
      `[Referral] Tier reward granted: user=${referrerUserId}, tier=${newTier.label}, threshold=${newTier.threshold}`,
    );
  } catch (error) {
    console.error('[Referral] Tier reward processing failed:', error);
  }
}

async function grantTierReward(
  userId: string,
  reward: RewardType,
  threshold: number,
): Promise<void> {
  const proDays = getProDurationDays(reward);

  if (proDays) {
    // Grant Pro subscription extension
    await grantProExtension(userId, proDays);
  }

  // Handle badges and exclusive spreads via milestones
  if (reward === 'badge_cosmic_seed') {
    await insertMilestone(userId, 'referral_badge', 'cosmic_seed', {
      title: 'Cosmic Seed',
      description: 'Earned for your first successful referral',
      threshold,
    });
  }

  if (reward === 'exclusive_spread_houses') {
    await insertMilestone(userId, 'referral_spread', 'spread_houses', {
      title: 'Astrological Houses Spread',
      description: 'Unlocked the exclusive Astrological Houses Spread',
      threshold,
    });
    // Also grant Cosmic Connector badge
    await insertMilestone(userId, 'referral_badge', 'cosmic_connector', {
      title: 'Cosmic Connector',
      description: 'Earned for 5 successful referrals',
      threshold,
    });
  }

  if (reward === 'exclusive_spread_shadow') {
    await insertMilestone(userId, 'referral_spread', 'spread_shadow', {
      title: 'Shadow Work Spread',
      description: 'Unlocked the exclusive Shadow Work Spread',
      threshold,
    });
  }

  // Handle titles for high tiers
  if (reward === 'pro_1_month') {
    // Celestial Guide - profile glow
    await insertMilestone(userId, 'referral_badge', 'celestial_guide', {
      title: 'Celestial Guide',
      description: 'Profile glow cosmetic for 10 referrals',
      threshold,
    });
  }

  if (reward === 'pro_3_months') {
    await insertMilestone(userId, 'referral_title', 'galaxy_keeper', {
      title: 'Galaxy Keeper',
      description: 'Galaxy Keeper title earned for 25 referrals',
      threshold,
    });
  }

  if (reward === 'pro_6_months') {
    await insertMilestone(userId, 'referral_title', 'founding_star', {
      title: 'Founding Star',
      description: 'Founding Star title + all cosmetics for 50 referrals',
      threshold,
    });
  }
}

async function grantProExtension(userId: string, days: number): Promise<void> {
  const subscription = await sql`
    SELECT status FROM subscriptions
    WHERE user_id = ${userId}
    AND status IN ('active', 'trial')
    LIMIT 1
  `;

  if (subscription.rows.length > 0) {
    await sql`
      UPDATE subscriptions
      SET current_period_end = current_period_end + ${`${days} days`}::interval,
          updated_at = NOW()
      WHERE user_id = ${userId}
      AND status IN ('active', 'trial')
    `;
  } else {
    await sql`
      INSERT INTO subscriptions (
        user_id, status, plan_type, trial_ends_at,
        current_period_end, user_email, user_name, trial_used
      )
      VALUES (
        ${userId}, 'trial', 'monthly',
        NOW() + ${`${days} days`}::interval,
        NOW() + ${`${days} days`}::interval,
        NULL, NULL, true
      )
      ON CONFLICT (user_id) DO UPDATE SET
        status = 'trial',
        trial_ends_at = NOW() + ${`${days} days`}::interval,
        current_period_end = NOW() + ${`${days} days`}::interval,
        trial_used = true,
        updated_at = NOW()
    `;
  }
}

async function insertMilestone(
  userId: string,
  milestoneType: string,
  milestoneKey: string,
  data: Record<string, unknown>,
): Promise<void> {
  await sql`
    INSERT INTO milestones_achieved (user_id, milestone_type, milestone_key, milestone_data, achieved_at)
    VALUES (${userId}, ${milestoneType}, ${milestoneKey}, ${JSON.stringify(data)}, NOW())
    ON CONFLICT (user_id, milestone_key) DO NOTHING
  `;
}
