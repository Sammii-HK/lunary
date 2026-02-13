export type RewardType =
  | 'badge_cosmic_seed'
  | 'pro_1_week'
  | 'exclusive_spread_houses'
  | 'pro_1_month'
  | 'exclusive_spread_shadow'
  | 'pro_3_months'
  | 'pro_6_months';

export interface ReferralTier {
  threshold: number;
  reward: RewardType;
  label: string;
  description: string;
}

export const REFERRAL_TIERS: readonly ReferralTier[] = [
  {
    threshold: 1,
    reward: 'badge_cosmic_seed',
    label: 'Cosmic Seed',
    description: 'Cosmic Seed badge on your profile',
  },
  {
    threshold: 3,
    reward: 'pro_1_week',
    label: 'Star Weaver',
    description: '1 week of Lunary+ free',
  },
  {
    threshold: 5,
    reward: 'exclusive_spread_houses',
    label: 'Cosmic Connector',
    description: 'Unlock Astrological Houses Spread + Cosmic Connector badge',
  },
  {
    threshold: 10,
    reward: 'pro_1_month',
    label: 'Celestial Guide',
    description: '1 month of Lunary+ free + profile glow cosmetic',
  },
  {
    threshold: 15,
    reward: 'exclusive_spread_shadow',
    label: 'Star Architect',
    description: 'Unlock Shadow Work Spread (exclusive)',
  },
  {
    threshold: 25,
    reward: 'pro_3_months',
    label: 'Galaxy Keeper',
    description: '3 months of Lunary+ free + Galaxy Keeper title',
  },
  {
    threshold: 50,
    reward: 'pro_6_months',
    label: 'Founding Star',
    description:
      '6 months of Lunary+ free + Founding Star title + all exclusive cosmetics',
  },
] as const;

/**
 * Get the tier a user is currently at based on their activated referral count.
 */
export function getCurrentTier(
  activatedReferrals: number,
): ReferralTier | null {
  let currentTier: ReferralTier | null = null;
  for (const tier of REFERRAL_TIERS) {
    if (activatedReferrals >= tier.threshold) {
      currentTier = tier;
    }
  }
  return currentTier;
}

/**
 * Get the next tier a user can reach.
 */
export function getNextTier(activatedReferrals: number): ReferralTier | null {
  for (const tier of REFERRAL_TIERS) {
    if (activatedReferrals < tier.threshold) {
      return tier;
    }
  }
  return null;
}

/**
 * Check if a tier threshold was just crossed with a new referral count.
 */
export function getNewlyCrossedTier(
  previousCount: number,
  newCount: number,
): ReferralTier | null {
  for (const tier of REFERRAL_TIERS) {
    if (previousCount < tier.threshold && newCount >= tier.threshold) {
      return tier;
    }
  }
  return null;
}

/**
 * Get the pro duration in days for a given reward type.
 */
export function getProDurationDays(reward: RewardType): number | null {
  switch (reward) {
    case 'pro_1_week':
      return 7;
    case 'pro_1_month':
      return 30;
    case 'pro_3_months':
      return 90;
    case 'pro_6_months':
      return 180;
    default:
      return null;
  }
}
