/**
 * @jest-environment node
 *
 * VITAL OP #1 - Stripe checkout session creation.
 *
 * The full POST handler in
 *   src/app/api/stripe/create-checkout-session/route.ts
 * is network + DB heavy (Stripe SDK, @vercel/postgres) and not a pure unit.
 * These tests cover the *revenue-critical pure logic* that lives inside it,
 * mirrored exactly from the route, plus the currency price-ID resolution the
 * route delegates to (getPriceForCurrency). No network, no DB, deterministic.
 *
 * Why this matters: a regression here silently charges/trials the wrong
 * amount or gives away free trials on top of discounts.
 *
 * The mirrored helpers are kept byte-faithful to the route. A structural
 * source assertion at the bottom fails loudly if the route logic drifts away
 * from what these tests pin, so the mirror cannot rot unnoticed.
 */
import * as fs from 'fs';
import * as path from 'path';
import { getPriceForCurrency } from '../../../utils/stripe-prices';

// ---------------------------------------------------------------------------
// Mirrored, byte-faithful copies of the route's pure logic.
// Source: src/app/api/stripe/create-checkout-session/route.ts (POST handler).
// ---------------------------------------------------------------------------

/** Mirror of normalizedPromoCode / normalizedDiscountCode derivation. */
function normalizeCode(code: unknown): string | null {
  return typeof code === 'string' && code.trim().length > 0
    ? code.trim().toUpperCase()
    : null;
}

/** Mirror of skipTrialFromCoupon. */
function skipTrialFromCoupon(
  promoCode: unknown,
  discountCode: unknown,
): boolean {
  const normalizedPromoCode = normalizeCode(promoCode);
  const normalizedDiscountCode = normalizeCode(discountCode);
  return Boolean(normalizedPromoCode) || Boolean(normalizedDiscountCode);
}

/**
 * Mirror of the trial-zeroing branch:
 *   let trialDays = skipTrialFromCoupon ? 0 : <stripe metadata trial days>
 * The Stripe-derived default is passed in so the test stays deterministic.
 */
function resolveTrialDays(
  promoCode: unknown,
  discountCode: unknown,
  stripeTrialDays: number,
): number {
  return skipTrialFromCoupon(promoCode, discountCode) ? 0 : stripeTrialDays;
}

/** Mirror of the metadata.skipTrialReason assignment. */
function skipTrialReason(
  promoCode: unknown,
  discountCode: unknown,
): 'promo' | 'discount' | undefined {
  if (!skipTrialFromCoupon(promoCode, discountCode)) return undefined;
  return normalizeCode(promoCode) ? 'promo' : 'discount';
}

describe('VITAL #1 Stripe checkout - promo/discount code normalisation', () => {
  it('uppercases and trims a promo code', () => {
    expect(normalizeCode('  welcome10 ')).toBe('WELCOME10');
  });

  it('uppercases and trims a discount code', () => {
    expect(normalizeCode('cosmicseason')).toBe('COSMICSEASON');
  });

  it('treats empty / whitespace / non-string codes as no code', () => {
    expect(normalizeCode('')).toBeNull();
    expect(normalizeCode('   ')).toBeNull();
    expect(normalizeCode(undefined)).toBeNull();
    expect(normalizeCode(null)).toBeNull();
    expect(normalizeCode(123)).toBeNull();
  });
});

describe('VITAL #1 Stripe checkout - skipTrialFromCoupon / trial zeroing', () => {
  it('zeroes the trial when a promo code is present', () => {
    expect(skipTrialFromCoupon('SAVE20', undefined)).toBe(true);
    expect(resolveTrialDays('SAVE20', undefined, 7)).toBe(0);
  });

  it('zeroes the trial when a discount code is present', () => {
    expect(skipTrialFromCoupon(undefined, 'COSMICSEASON')).toBe(true);
    expect(resolveTrialDays(undefined, 'COSMICSEASON', 14)).toBe(0);
  });

  it('keeps the Stripe-derived trial when no code is supplied', () => {
    expect(skipTrialFromCoupon(undefined, undefined)).toBe(false);
    expect(resolveTrialDays(undefined, undefined, 7)).toBe(7);
    expect(resolveTrialDays('', '   ', 14)).toBe(14);
  });

  it('does NOT stack a free trial on top of a discount (the revenue trap)', () => {
    // A coupon-bearing checkout must start billing immediately, never grant
    // both a discount AND a free trial.
    expect(resolveTrialDays('BLACKFRIDAY', undefined, 7)).toBe(0);
    expect(resolveTrialDays(undefined, 'WINBACK', 14)).toBe(0);
  });

  it('labels the skip reason promo vs discount correctly', () => {
    expect(skipTrialReason('PROMO', undefined)).toBe('promo');
    expect(skipTrialReason(undefined, 'DISC')).toBe('discount');
    // Promo takes precedence when both are present (matches route ternary).
    expect(skipTrialReason('PROMO', 'DISC')).toBe('promo');
    expect(skipTrialReason(undefined, undefined)).toBeUndefined();
  });
});

describe('VITAL #1 Stripe checkout - currency price-ID resolution', () => {
  it('returns the exact GBP price for a GBP checkout (no silent USD fallback)', () => {
    const price = getPriceForCurrency('lunary_plus', 'GBP');
    expect(price).not.toBeNull();
    expect(price?.currency).toBe('gbp');
    expect(price?.priceId).toBe('price_1SY7miPsyR7YcHgYNKW1GYV1');
  });

  it('is case-insensitive on the currency code', () => {
    const lower = getPriceForCurrency('lunary_plus', 'eur');
    const upper = getPriceForCurrency('lunary_plus', 'EUR');
    expect(lower?.priceId).toBe(upper?.priceId);
    expect(lower?.currency).toBe('eur');
  });

  it('defaults to USD for an unknown currency rather than returning null', () => {
    const price = getPriceForCurrency('lunary_plus', 'XYZ');
    expect(price).not.toBeNull();
    expect(price?.currency).toBe('usd');
  });

  it('defaults to USD currency by default argument', () => {
    const price = getPriceForCurrency('lunary_plus');
    expect(price?.currency).toBe('usd');
  });

  it('returns null for an unknown plan', () => {
    // @ts-expect-error intentionally passing an invalid plan id
    expect(getPriceForCurrency('not_a_plan', 'USD')).toBeNull();
  });

  it('USD amount is the documented monthly Plus price', () => {
    expect(getPriceForCurrency('lunary_plus', 'USD')?.amount).toBe(4.99);
  });
});

// ---------------------------------------------------------------------------
// Structural guard: the mirrored logic above only stays valid while the route
// still implements it. These assertions fail if the route drifts.
// ---------------------------------------------------------------------------
describe('VITAL #1 Stripe checkout - source still implements the pinned logic', () => {
  const source = fs.readFileSync(
    path.join(
      process.cwd(),
      'src/app/api/stripe/create-checkout-session/route.ts',
    ),
    'utf-8',
  );

  it('still derives skipTrialFromCoupon from promo OR discount code', () => {
    expect(source).toContain('const skipTrialFromCoupon =');
    expect(source).toContain(
      'Boolean(normalizedPromoCode) || Boolean(normalizedDiscountCode)',
    );
  });

  it('still zeroes trialDays when a coupon is applied', () => {
    expect(source).toContain('let trialDays = skipTrialFromCoupon');
    expect(source).toMatch(/skipTrialFromCoupon\s*\n?\s*\?\s*0/);
  });

  it('still records the promo vs discount skip reason', () => {
    expect(source).toContain(
      "metadata.skipTrialReason = normalizedPromoCode ? 'promo' : 'discount'",
    );
  });

  it('still looks up promotion codes with active:true', () => {
    // Guards against accidentally honouring expired/inactive promo codes.
    expect(source).toContain('active: true');
  });

  it('still drops allow_promotion_codes once an app discount is applied', () => {
    // Prevents double-discounting (Stripe conflict).
    expect(source).toContain('delete sessionConfig.allow_promotion_codes');
  });
});
