/**
 * @jest-environment node
 *
 * VITAL OP #10 - BLUEMOON surfacing on /pricing + annual trial-zeroing (#263).
 *
 * The Blue Moon offer (BLUEMOON, 32% off Pro Annual) is seeded on the pricing
 * page, but ONLY for the annual plan — a deliberate pay/commit intent. Applying
 * any promo zeroes the free trial (see the checkout skipTrialFromCoupon logic),
 * so attaching BLUEMOON to the monthly experience would silently strip the trial
 * fresh monthly visitors rely on. A URL `?promo=` always wins over the seed.
 *
 * This file pins the pure `effectivePromoCode` derivation and the
 * coupon -> trial-zeroing relationship, with a structural guard so the pricing
 * page cannot drift away from seeding-on-annual-only. No network, no DB.
 */
import * as fs from 'fs';
import * as path from 'path';

const readSource = (rel: string) =>
  fs.readFileSync(path.join(process.cwd(), rel), 'utf-8');

const BLUE_MOON_PROMO_CODE = 'BLUEMOON';

// ---------------------------------------------------------------------------
// Mirror of the pricing page derivation.
// Source: src/app/pricing/page.tsx
//   const effectivePromoCode =
//     urlPromoCode ?? (billingCycle === 'annual' ? BLUE_MOON_PROMO_CODE : undefined);
// ---------------------------------------------------------------------------
function effectivePromoCode(
  urlPromoCode: string | null | undefined,
  billingCycle: 'monthly' | 'annual',
): string | undefined {
  // Faithful to the source: `urlPromoCode ?? (annual ? BLUEMOON : undefined)`.
  // `??` means a present URL code wins; null/undefined falls through to the seed.
  const seed = billingCycle === 'annual' ? BLUE_MOON_PROMO_CODE : undefined;
  return urlPromoCode ?? seed;
}

// ---------------------------------------------------------------------------
// Mirror of the checkout trial-zeroing (skipTrialFromCoupon): any present
// promo/discount code zeroes the trial. Source: create-checkout-session/route.ts.
// ---------------------------------------------------------------------------
function normalizeCode(code: unknown): string | null {
  return typeof code === 'string' && code.trim().length > 0
    ? code.trim().toUpperCase()
    : null;
}
function skipTrialFromCoupon(promo: unknown, discount: unknown): boolean {
  return Boolean(normalizeCode(promo)) || Boolean(normalizeCode(discount));
}

describe('VITAL #10 effectivePromoCode - BLUEMOON seeded on annual only', () => {
  it('seeds BLUEMOON when the annual cycle is selected and no URL promo', () => {
    expect(effectivePromoCode(null, 'annual')).toBe('BLUEMOON');
  });

  it('does NOT seed any code on monthly (keeps monthly trial-first)', () => {
    expect(effectivePromoCode(null, 'monthly')).toBeUndefined();
  });

  it('a URL ?promo always wins, even on monthly', () => {
    expect(effectivePromoCode('WELCOME15', 'monthly')).toBe('WELCOME15');
  });

  it('a URL ?promo overrides the annual BLUEMOON seed', () => {
    expect(effectivePromoCode('HARVEST25', 'annual')).toBe('HARVEST25');
  });
});

describe('VITAL #10 annual trial-zeroing - the monthly trial is protected', () => {
  it('the seeded BLUEMOON code zeroes the trial on annual (pay-now intent)', () => {
    const code = effectivePromoCode(null, 'annual');
    expect(skipTrialFromCoupon(code, undefined)).toBe(true);
  });

  it('monthly has no seeded code, so the trial is preserved', () => {
    const code = effectivePromoCode(null, 'monthly');
    // No code -> no trial zeroing -> fresh monthly visitors keep their free trial.
    expect(code).toBeUndefined();
    expect(skipTrialFromCoupon(code, undefined)).toBe(false);
  });

  it('a URL promo on monthly DOES zero the trial (explicit user intent)', () => {
    const code = effectivePromoCode('SAVE20', 'monthly');
    expect(skipTrialFromCoupon(code, undefined)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Structural guard: the pricing page must still seed BLUEMOON on annual only,
// honour ?promo / ?billing / ?plan, and define the code constant.
// ---------------------------------------------------------------------------
describe('VITAL #10 pricing source still surfaces BLUEMOON on annual only', () => {
  const source = readSource('src/app/pricing/page.tsx');

  it('defines the BLUEMOON promo code constant', () => {
    expect(source).toContain("BLUE_MOON_PROMO_CODE = 'BLUEMOON'");
  });

  it('still derives effectivePromoCode = urlPromoCode ?? (annual ? BLUEMOON : undefined)', () => {
    expect(source).toContain('const effectivePromoCode =');
    expect(source).toContain('urlPromoCode ??');
    expect(source).toMatch(
      /billingCycle === 'annual'\s*\?\s*BLUE_MOON_PROMO_CODE\s*:\s*undefined/,
    );
  });

  it('honours a ?promo / ?coupon URL code (which wins over the seed)', () => {
    expect(source).toContain("params.get('promo') || params.get('coupon')");
  });

  it('lets an offer link land on annual via ?billing=annual or ?plan=annual', () => {
    expect(source).toContain("params.get('billing') === 'annual'");
    expect(source).toContain("params.get('plan')");
    expect(source).toContain("planHint === 'annual'");
  });
});
