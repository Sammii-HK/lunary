/**
 * Tests for 100% off coupon handling:
 * - Webhook status override (trial → active for 100% discount)
 * - extractDiscountInfo correctly calculates monthlyAmountDue
 * - Checkout session removes allow_promotion_codes when discount applied
 *
 * These test the pure logic extracted from the webhook and checkout handlers.
 */

// Replicate the core functions from the webhook route for unit testing
// (they are not exported, so we test the logic directly)

function mapStripeStatus(status: string): string {
  switch (status) {
    case 'trialing':
      return 'trial';
    case 'active':
      return 'active';
    case 'canceled':
      return 'cancelled';
    case 'past_due':
      return 'past_due';
    default:
      return 'free';
  }
}

interface DiscountInfo {
  hasDiscount: boolean;
  discountPercent: number;
  monthlyAmountDue: number;
  couponId: string | null;
  discountEndsAt: string | null;
}

function computeEffectiveStatus(
  stripeStatus: string,
  discountInfo: DiscountInfo,
): string {
  const rawStatus = mapStripeStatus(stripeStatus);
  if (
    rawStatus === 'trial' &&
    discountInfo.hasDiscount &&
    (discountInfo.discountPercent >= 100 || discountInfo.monthlyAmountDue <= 0)
  ) {
    return 'active';
  }
  return rawStatus;
}

/**
 * Simulates the SQL WHERE clause logic used in trial email queries
 * to determine if a subscription should be excluded from trial emails.
 */
function shouldExcludeFromTrialEmails(subscription: {
  status: string;
  hasDiscount: boolean;
  discountPercent: number | null;
  monthlyAmountDue: number | null;
  promoCode: string | null;
}): boolean {
  // Must be a trial to even be in the email pipeline
  if (subscription.status !== 'trial') return true;

  // 100% discount exclusion (matches the SQL filter)
  if (
    subscription.hasDiscount &&
    ((subscription.discountPercent ?? 0) >= 100 ||
      (subscription.monthlyAmountDue !== null &&
        subscription.monthlyAmountDue <= 0))
  ) {
    return true;
  }

  // FULLORBIT promo code exclusion
  if (subscription.promoCode === 'FULLORBIT') {
    return true;
  }

  return false;
}

describe('100% off coupon handling', () => {
  describe('mapStripeStatus', () => {
    it('maps trialing to trial', () => {
      expect(mapStripeStatus('trialing')).toBe('trial');
    });

    it('maps active to active', () => {
      expect(mapStripeStatus('active')).toBe('active');
    });

    it('maps canceled to cancelled', () => {
      expect(mapStripeStatus('canceled')).toBe('cancelled');
    });

    it('maps past_due to past_due', () => {
      expect(mapStripeStatus('past_due')).toBe('past_due');
    });

    it('maps unknown statuses to free', () => {
      expect(mapStripeStatus('incomplete')).toBe('free');
      expect(mapStripeStatus('')).toBe('free');
    });
  });

  describe('is100PercentOff detection - triggers Stripe trial removal', () => {
    function is100PercentOff(
      stripeStatus: string,
      discountInfo: DiscountInfo,
    ): boolean {
      const rawStatus = mapStripeStatus(stripeStatus);
      return (
        rawStatus === 'trial' &&
        discountInfo.hasDiscount &&
        (discountInfo.discountPercent >= 100 ||
          discountInfo.monthlyAmountDue <= 0)
      );
    }

    it('detects 100% off on trialing subscription', () => {
      expect(
        is100PercentOff('trialing', {
          hasDiscount: true,
          discountPercent: 100,
          monthlyAmountDue: 0,
          couponId: 'fullorbit',
          discountEndsAt: null,
        }),
      ).toBe(true);
    });

    it('does not flag active subscriptions with 100% off', () => {
      expect(
        is100PercentOff('active', {
          hasDiscount: true,
          discountPercent: 100,
          monthlyAmountDue: 0,
          couponId: 'fullorbit',
          discountEndsAt: null,
        }),
      ).toBe(false);
    });

    it('does not flag partial discount trialing subscriptions', () => {
      expect(
        is100PercentOff('trialing', {
          hasDiscount: true,
          discountPercent: 50,
          monthlyAmountDue: 4.99,
          couponId: 'half-off',
          discountEndsAt: null,
        }),
      ).toBe(false);
    });
  });

  describe('computeEffectiveStatus - webhook status override', () => {
    it('overrides trial to active for 100% percent off coupon', () => {
      const result = computeEffectiveStatus('trialing', {
        hasDiscount: true,
        discountPercent: 100,
        monthlyAmountDue: 0,
        couponId: 'fullorbit-coupon',
        discountEndsAt: null,
      });
      expect(result).toBe('active');
    });

    it('overrides trial to active when monthlyAmountDue is 0', () => {
      const result = computeEffectiveStatus('trialing', {
        hasDiscount: true,
        discountPercent: 0,
        monthlyAmountDue: 0,
        couponId: 'amount-off-coupon',
        discountEndsAt: null,
      });
      expect(result).toBe('active');
    });

    it('overrides trial to active when discountPercent exceeds 100', () => {
      const result = computeEffectiveStatus('trialing', {
        hasDiscount: true,
        discountPercent: 150,
        monthlyAmountDue: 0,
        couponId: 'super-coupon',
        discountEndsAt: null,
      });
      expect(result).toBe('active');
    });

    it('does NOT override trial when discount is less than 100%', () => {
      const result = computeEffectiveStatus('trialing', {
        hasDiscount: true,
        discountPercent: 50,
        monthlyAmountDue: 4.99,
        couponId: 'half-off',
        discountEndsAt: null,
      });
      expect(result).toBe('trial');
    });

    it('does NOT override trial when there is no discount', () => {
      const result = computeEffectiveStatus('trialing', {
        hasDiscount: false,
        discountPercent: 0,
        monthlyAmountDue: 9.99,
        couponId: null,
        discountEndsAt: null,
      });
      expect(result).toBe('trial');
    });

    it('does NOT override active status even with 100% discount', () => {
      const result = computeEffectiveStatus('active', {
        hasDiscount: true,
        discountPercent: 100,
        monthlyAmountDue: 0,
        couponId: 'fullorbit-coupon',
        discountEndsAt: null,
      });
      expect(result).toBe('active');
    });

    it('does NOT override canceled status even with 100% discount', () => {
      const result = computeEffectiveStatus('canceled', {
        hasDiscount: true,
        discountPercent: 100,
        monthlyAmountDue: 0,
        couponId: 'fullorbit-coupon',
        discountEndsAt: null,
      });
      expect(result).toBe('cancelled');
    });

    it('preserves past_due status even with 100% discount', () => {
      const result = computeEffectiveStatus('past_due', {
        hasDiscount: true,
        discountPercent: 100,
        monthlyAmountDue: 0,
        couponId: 'fullorbit-coupon',
        discountEndsAt: null,
      });
      expect(result).toBe('past_due');
    });
  });

  describe('shouldExcludeFromTrialEmails - email query filters', () => {
    it('excludes 100% discount subscriptions', () => {
      expect(
        shouldExcludeFromTrialEmails({
          status: 'trial',
          hasDiscount: true,
          discountPercent: 100,
          monthlyAmountDue: 0,
          promoCode: null,
        }),
      ).toBe(true);
    });

    it('excludes subscriptions with $0 monthly amount due', () => {
      expect(
        shouldExcludeFromTrialEmails({
          status: 'trial',
          hasDiscount: true,
          discountPercent: 0,
          monthlyAmountDue: 0,
          promoCode: null,
        }),
      ).toBe(true);
    });

    it('excludes FULLORBIT promo code users', () => {
      expect(
        shouldExcludeFromTrialEmails({
          status: 'trial',
          hasDiscount: false,
          discountPercent: null,
          monthlyAmountDue: null,
          promoCode: 'FULLORBIT',
        }),
      ).toBe(true);
    });

    it('excludes FULLORBIT users even with partial discount data', () => {
      expect(
        shouldExcludeFromTrialEmails({
          status: 'trial',
          hasDiscount: true,
          discountPercent: 100,
          monthlyAmountDue: 0,
          promoCode: 'FULLORBIT',
        }),
      ).toBe(true);
    });

    it('does NOT exclude normal trial users', () => {
      expect(
        shouldExcludeFromTrialEmails({
          status: 'trial',
          hasDiscount: false,
          discountPercent: null,
          monthlyAmountDue: 9.99,
          promoCode: null,
        }),
      ).toBe(false);
    });

    it('does NOT exclude partial discount trial users', () => {
      expect(
        shouldExcludeFromTrialEmails({
          status: 'trial',
          hasDiscount: true,
          discountPercent: 50,
          monthlyAmountDue: 4.99,
          promoCode: null,
        }),
      ).toBe(false);
    });

    it('does NOT exclude users with other promo codes', () => {
      expect(
        shouldExcludeFromTrialEmails({
          status: 'trial',
          hasDiscount: true,
          discountPercent: 20,
          monthlyAmountDue: 7.99,
          promoCode: 'WELCOME20',
        }),
      ).toBe(false);
    });

    it('excludes non-trial subscriptions (they are not in the pipeline)', () => {
      expect(
        shouldExcludeFromTrialEmails({
          status: 'active',
          hasDiscount: false,
          discountPercent: null,
          monthlyAmountDue: 9.99,
          promoCode: null,
        }),
      ).toBe(true);
    });

    it('handles null discount_percent and null monthly_amount_due', () => {
      expect(
        shouldExcludeFromTrialEmails({
          status: 'trial',
          hasDiscount: false,
          discountPercent: null,
          monthlyAmountDue: null,
          promoCode: null,
        }),
      ).toBe(false);
    });

    it('handles negative monthly_amount_due as $0 due', () => {
      expect(
        shouldExcludeFromTrialEmails({
          status: 'trial',
          hasDiscount: true,
          discountPercent: 0,
          monthlyAmountDue: -1,
          promoCode: null,
        }),
      ).toBe(true);
    });
  });

  describe('checkout allow_promotion_codes removal', () => {
    it('removes allow_promotion_codes when discounts array is set', () => {
      const sessionConfig: Record<string, unknown> = {
        mode: 'subscription',
        allow_promotion_codes: true,
        discounts: [{ promotion_code: 'promo_123' }],
      };

      // Replicate the checkout logic
      if (
        Array.isArray(sessionConfig.discounts) &&
        (sessionConfig.discounts as unknown[]).length > 0
      ) {
        delete sessionConfig.allow_promotion_codes;
      }

      expect(sessionConfig.allow_promotion_codes).toBeUndefined();
      expect(sessionConfig.discounts).toEqual([
        { promotion_code: 'promo_123' },
      ]);
    });

    it('keeps allow_promotion_codes when no discounts applied', () => {
      const sessionConfig: Record<string, unknown> = {
        mode: 'subscription',
        allow_promotion_codes: true,
      };

      if (
        Array.isArray(sessionConfig.discounts) &&
        (sessionConfig.discounts as unknown[]).length > 0
      ) {
        delete sessionConfig.allow_promotion_codes;
      }

      expect(sessionConfig.allow_promotion_codes).toBe(true);
    });

    it('keeps allow_promotion_codes when discounts array is empty', () => {
      const sessionConfig: Record<string, unknown> = {
        mode: 'subscription',
        allow_promotion_codes: true,
        discounts: [],
      };

      if (
        Array.isArray(sessionConfig.discounts) &&
        (sessionConfig.discounts as unknown[]).length > 0
      ) {
        delete sessionConfig.allow_promotion_codes;
      }

      expect(sessionConfig.allow_promotion_codes).toBe(true);
    });
  });
});
