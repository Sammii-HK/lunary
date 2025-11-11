import { sql } from '@vercel/postgres';

export interface ReferralCode {
  code: string;
  userId: string;
  createdAt: Date;
  uses: number;
  maxUses?: number;
}

export async function generateReferralCode(userId: string): Promise<string> {
  // Generate a unique referral code (8 characters, alphanumeric)
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();

  try {
    await sql`
      INSERT INTO referral_codes (code, user_id, created_at, uses)
      VALUES (${code}, ${userId}, NOW(), 0)
      ON CONFLICT (code) DO NOTHING
    `;

    return code;
  } catch (error) {
    console.error('Failed to generate referral code:', error);
    throw error;
  }
}

export async function getReferralCode(userId: string): Promise<string | null> {
  try {
    const result = await sql`
      SELECT code FROM referral_codes
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    return result.rows[0]?.code || null;
  } catch (error) {
    console.error('Failed to get referral code:', error);
    return null;
  }
}

export async function validateReferralCode(code: string): Promise<{
  valid: boolean;
  userId?: string;
  error?: string;
}> {
  try {
    const result = await sql`
      SELECT user_id, uses, max_uses
      FROM referral_codes
      WHERE code = ${code.toUpperCase()}
    `;

    if (result.rows.length === 0) {
      return { valid: false, error: 'Invalid referral code' };
    }

    const referral = result.rows[0];

    if (referral.max_uses && referral.uses >= referral.max_uses) {
      return { valid: false, error: 'Referral code has reached maximum uses' };
    }

    return { valid: true, userId: referral.user_id };
  } catch (error) {
    console.error('Failed to validate referral code:', error);
    return { valid: false, error: 'Failed to validate code' };
  }
}

export async function processReferralCode(
  code: string,
  newUserId: string,
): Promise<{ success: boolean; referrerUserId?: string; error?: string }> {
  try {
    const validation = await validateReferralCode(code);

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Check if this user has already used a referral code
    const existingReferral = await sql`
      SELECT id FROM user_referrals
      WHERE referred_user_id = ${newUserId}
    `;

    if (existingReferral.rows.length > 0) {
      return { success: false, error: 'User has already used a referral code' };
    }

    // Record the referral
    await sql`
      INSERT INTO user_referrals (referrer_user_id, referred_user_id, referral_code, created_at)
      VALUES (${validation.userId}, ${newUserId}, ${code.toUpperCase()}, NOW())
    `;

    // Increment referral code usage
    await sql`
      UPDATE referral_codes
      SET uses = uses + 1
      WHERE code = ${code.toUpperCase()}
    `;

    // Grant free month to referrer (if they don't have active subscription)
    await grantReferralReward(validation.userId!);

    return { success: true, referrerUserId: validation.userId };
  } catch (error) {
    console.error('Failed to use referral code:', error);
    return { success: false, error: 'Failed to process referral' };
  }
}

async function grantReferralReward(userId: string): Promise<void> {
  try {
    // Check if user has active subscription
    const subscription = await sql`
      SELECT status FROM subscriptions
      WHERE user_id = ${userId}
      AND status IN ('active', 'trial')
    `;

    if (subscription.rows.length > 0) {
      // Extend subscription by 1 month
      await sql`
        UPDATE subscriptions
        SET 
          current_period_end = current_period_end + INTERVAL '1 month',
          updated_at = NOW()
        WHERE user_id = ${userId}
        AND status = 'active'
      `;
    } else {
      // Create a 1-month free trial
      await sql`
        INSERT INTO subscriptions (user_id, status, plan_type, trial_ends_at, current_period_end)
        VALUES (
          ${userId},
          'trial',
          'monthly',
          NOW() + INTERVAL '30 days',
          NOW() + INTERVAL '30 days'
        )
        ON CONFLICT (user_id) DO UPDATE SET
          status = 'trial',
          trial_ends_at = NOW() + INTERVAL '30 days',
          current_period_end = NOW() + INTERVAL '30 days',
          updated_at = NOW()
      `;
    }
  } catch (error) {
    console.error('Failed to grant referral reward:', error);
  }
}

export async function getUserReferralStats(userId: string): Promise<{
  code: string | null;
  totalReferrals: number;
  activeReferrals: number;
}> {
  try {
    const [codeResult, statsResult] = await Promise.all([
      getReferralCode(userId),
      sql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN EXISTS (
            SELECT 1 FROM subscriptions s 
            WHERE s.user_id = user_referrals.referred_user_id 
            AND s.status IN ('active', 'trial')
          ) THEN 1 END) as active
        FROM user_referrals
        WHERE referrer_user_id = ${userId}
      `,
    ]);

    return {
      code: codeResult,
      totalReferrals: parseInt(statsResult.rows[0]?.total || '0'),
      activeReferrals: parseInt(statsResult.rows[0]?.active || '0'),
    };
  } catch (error) {
    console.error('Failed to get referral stats:', error);
    return { code: null, totalReferrals: 0, activeReferrals: 0 };
  }
}
