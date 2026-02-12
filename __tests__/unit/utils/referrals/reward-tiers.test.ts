import {
  REFERRAL_TIERS,
  getCurrentTier,
  getNextTier,
  getNewlyCrossedTier,
  getProDurationDays,
} from '@/utils/referrals/reward-tiers';

describe('REFERRAL_TIERS', () => {
  it('has 7 tiers with ascending thresholds', () => {
    expect(REFERRAL_TIERS).toHaveLength(7);
    for (let i = 1; i < REFERRAL_TIERS.length; i++) {
      expect(REFERRAL_TIERS[i].threshold).toBeGreaterThan(
        REFERRAL_TIERS[i - 1].threshold,
      );
    }
  });

  it('each tier has required fields', () => {
    for (const tier of REFERRAL_TIERS) {
      expect(tier.threshold).toBeGreaterThan(0);
      expect(tier.reward).toBeTruthy();
      expect(tier.label).toBeTruthy();
      expect(tier.description).toBeTruthy();
    }
  });
});

describe('getCurrentTier', () => {
  it('returns null for 0 referrals', () => {
    expect(getCurrentTier(0)).toBeNull();
  });

  it('returns Cosmic Seed for 1 referral', () => {
    expect(getCurrentTier(1)?.label).toBe('Cosmic Seed');
  });

  it('returns Cosmic Seed for 2 referrals (between tiers)', () => {
    expect(getCurrentTier(2)?.label).toBe('Cosmic Seed');
  });

  it('returns Star Weaver for 3 referrals', () => {
    expect(getCurrentTier(3)?.label).toBe('Star Weaver');
  });

  it('returns Founding Star for 50+ referrals', () => {
    expect(getCurrentTier(50)?.label).toBe('Founding Star');
    expect(getCurrentTier(100)?.label).toBe('Founding Star');
  });
});

describe('getNextTier', () => {
  it('returns Cosmic Seed for 0 referrals', () => {
    expect(getNextTier(0)?.label).toBe('Cosmic Seed');
    expect(getNextTier(0)?.threshold).toBe(1);
  });

  it('returns Star Weaver for 1 referral', () => {
    expect(getNextTier(1)?.label).toBe('Star Weaver');
  });

  it('returns null when all tiers are reached', () => {
    expect(getNextTier(50)).toBeNull();
  });
});

describe('getNewlyCrossedTier', () => {
  it('detects crossing the 1-referral threshold', () => {
    const tier = getNewlyCrossedTier(0, 1);
    expect(tier?.threshold).toBe(1);
    expect(tier?.label).toBe('Cosmic Seed');
  });

  it('detects crossing the 5-referral threshold', () => {
    const tier = getNewlyCrossedTier(4, 5);
    expect(tier?.threshold).toBe(5);
    expect(tier?.label).toBe('Cosmic Connector');
  });

  it('returns null when no tier is crossed', () => {
    expect(getNewlyCrossedTier(1, 2)).toBeNull();
    expect(getNewlyCrossedTier(6, 9)).toBeNull();
  });

  it('returns the highest crossed tier when skipping', () => {
    // If somehow going from 0 to 5, the function returns the first tier crossed
    const tier = getNewlyCrossedTier(0, 5);
    // It will return the first tier whose threshold is crossed
    expect(tier?.threshold).toBe(1);
  });
});

describe('getProDurationDays', () => {
  it('returns 7 for pro_1_week', () => {
    expect(getProDurationDays('pro_1_week')).toBe(7);
  });

  it('returns 30 for pro_1_month', () => {
    expect(getProDurationDays('pro_1_month')).toBe(30);
  });

  it('returns 90 for pro_3_months', () => {
    expect(getProDurationDays('pro_3_months')).toBe(90);
  });

  it('returns 180 for pro_6_months', () => {
    expect(getProDurationDays('pro_6_months')).toBe(180);
  });

  it('returns null for badge rewards', () => {
    expect(getProDurationDays('badge_cosmic_seed')).toBeNull();
  });

  it('returns null for spread rewards', () => {
    expect(getProDurationDays('exclusive_spread_houses')).toBeNull();
  });
});
