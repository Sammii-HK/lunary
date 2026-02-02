/**
 * @jest-environment node
 */
import {
  hasFeatureAccess,
  normalizePlanType,
  getTrialDaysRemaining,
} from '../../../utils/pricing';

describe('pricing entitlements', () => {
  it('grants free features and blocks paid features', () => {
    expect(hasFeatureAccess('free', 'free', 'birth_chart')).toBe(true);
    expect(hasFeatureAccess('free', 'free', 'personalized_horoscope')).toBe(
      false,
    );
  });

  it('grants paid features for active plan', () => {
    expect(
      hasFeatureAccess('active', 'lunary_plus', 'personalized_horoscope'),
    ).toBe(true);
  });

  it('grants friend_connections for paid plans only', () => {
    // Free users should not have access
    expect(hasFeatureAccess('free', 'free', 'friend_connections')).toBe(false);

    // Paid users should have access
    expect(
      hasFeatureAccess('active', 'lunary_plus', 'friend_connections'),
    ).toBe(true);
    expect(
      hasFeatureAccess('active', 'lunary_plus_ai', 'friend_connections'),
    ).toBe(true);
    expect(
      hasFeatureAccess('active', 'lunary_plus_ai_annual', 'friend_connections'),
    ).toBe(true);

    // Trial users should have access
    expect(
      hasFeatureAccess('trialing', 'lunary_plus', 'friend_connections'),
    ).toBe(true);
  });

  it('normalizes yearly plan to annual entitlements', () => {
    expect(hasFeatureAccess('active', 'yearly', 'yearly_forecast')).toBe(true);
  });

  it('treats trialing users as trial', () => {
    expect(
      hasFeatureAccess('trialing', 'lunary_plus_ai', 'downloadable_reports'),
    ).toBe(true);
  });

  it('normalizes plan types consistently', () => {
    expect(normalizePlanType('annual')).toBe('lunary_plus_ai_annual');
    expect(normalizePlanType('monthly')).toBe('lunary_plus');
    expect(normalizePlanType('lunary_plus_ai')).toBe('lunary_plus_ai');
  });

  it('calculates remaining trial days from trial end date', () => {
    const now = new Date('2026-01-14T12:00:00Z');
    jest.useFakeTimers();
    jest.setSystemTime(now);

    const trialEndsAt = '2026-01-17T12:00:00Z';
    expect(getTrialDaysRemaining(trialEndsAt)).toBe(3);

    jest.useRealTimers();
  });
});
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
      // Note: birth_chart is intentionally allowed for free users to encourage signups
      expect(hasFeatureAccess('free', undefined, 'birth_chart')).toBe(true);
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
      expect(
        PRICING_PLANS.find((p) => p.id === 'lunary_plus_ai_annual'),
      ).toBeDefined();
    });

    it('should have correct pricing', () => {
      const freePlan = PRICING_PLANS.find((p) => p.id === 'free');
      const lunaryPlusPlan = PRICING_PLANS.find((p) => p.id === 'lunary_plus');
      const yearlyPlan = PRICING_PLANS.find(
        (p) => p.id === 'lunary_plus_ai_annual',
      );

      expect(freePlan?.price).toBe(0);
      expect(lunaryPlusPlan?.price).toBe(4.99);
      expect(yearlyPlan?.price).toBe(89.99);
    });
  });
});
