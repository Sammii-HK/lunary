import { hasFeatureAccess, PRICING_PLANS } from 'utils/pricing';

describe('Pricing Utilities', () => {
  describe('hasFeatureAccess', () => {
    it('should grant access to free features for free users', () => {
      expect(hasFeatureAccess('free', undefined, 'moon_phases')).toBe(true);
      expect(hasFeatureAccess('free', undefined, 'grimoire')).toBe(true);
    });

    it('should grant access to trial features for trial users', () => {
      expect(hasFeatureAccess('trial', 'lunary_plus', 'birth_chart')).toBe(
        true,
      );
      expect(
        hasFeatureAccess('trial', 'lunary_plus', 'personalized_horoscope'),
      ).toBe(true);
    });

    it('should grant access to all features for active subscribers', () => {
      expect(hasFeatureAccess('active', 'lunary_plus', 'birth_chart')).toBe(
        true,
      );
      expect(hasFeatureAccess('active', 'yearly', 'advanced_patterns')).toBe(
        true,
      );
    });

    it('should deny access to premium features for free users', () => {
      expect(hasFeatureAccess('free', undefined, 'birth_chart')).toBe(false);
      expect(
        hasFeatureAccess('free', undefined, 'personalized_horoscope'),
      ).toBe(false);
    });
  });

  describe('PRICING_PLANS', () => {
    it('should have all required plans', () => {
      expect(PRICING_PLANS.length).toBeGreaterThanOrEqual(3);
      expect(PRICING_PLANS.find((p) => p.id === 'free')).toBeDefined();
      expect(PRICING_PLANS.find((p) => p.id === 'lunary_plus')).toBeDefined();
      expect(
        PRICING_PLANS.find((p) => p.id === 'lunary_plus_ai'),
      ).toBeDefined();
      expect(PRICING_PLANS.find((p) => p.id === 'yearly')).toBeDefined();
    });

    it('should have correct pricing', () => {
      const freePlan = PRICING_PLANS.find((p) => p.id === 'free');
      const lunaryPlusPlan = PRICING_PLANS.find((p) => p.id === 'lunary_plus');
      const yearlyPlan = PRICING_PLANS.find((p) => p.id === 'yearly');

      expect(freePlan?.price).toBe(0);
      expect(lunaryPlusPlan?.price).toBe(4.99);
      expect(yearlyPlan?.price).toBe(79.99);
    });
  });
});
