import { EMAIL_PROMO, buildPromoPricingUrl } from '@/lib/promo/email-promo';

/**
 * Guards the single source of truth for the promo code advertised in lifecycle
 * emails. The Stripe checkout silently DROPS any code that is not an active
 * promotion code and charges full price without surfacing an error, so a blank
 * or typo'd EMAIL_PROMO.code is a silent revenue / trust leak.
 *
 * This does not (and cannot, without live Stripe creds) prove the code is active
 * in Stripe — that lives in the create-checkout-session route's `promoCodeApplied`
 * signal. What it DOES catch in CI is the cheap, common failure mode: a blank,
 * whitespace-only, or malformed code shipping to production.
 */
describe('EMAIL_PROMO (lifecycle promo single source of truth)', () => {
  it('has a non-empty, trimmed promo code', () => {
    expect(typeof EMAIL_PROMO.code).toBe('string');
    expect(EMAIL_PROMO.code.length).toBeGreaterThan(0);
    // No leading/trailing whitespace — Stripe codes are matched exactly.
    expect(EMAIL_PROMO.code).toBe(EMAIL_PROMO.code.trim());
  });

  it('uses a well-formed Stripe promotion-code shape', () => {
    // Stripe promotion codes are uppercase alphanumeric (optionally with
    // - or _). Reject lower-case, spaces, and punctuation that would never
    // match a real code and would silently fall through to full price.
    expect(EMAIL_PROMO.code).toMatch(/^[A-Z0-9][A-Z0-9_-]{2,}$/);
  });

  it('advertises a sane discount percent (1-100)', () => {
    expect(Number.isFinite(EMAIL_PROMO.percent)).toBe(true);
    expect(Number.isInteger(EMAIL_PROMO.percent)).toBe(true);
    expect(EMAIL_PROMO.percent).toBeGreaterThan(0);
    expect(EMAIL_PROMO.percent).toBeLessThanOrEqual(100);
  });

  it('targets a known plan scope', () => {
    expect(['annual', 'monthly', 'any']).toContain(EMAIL_PROMO.plan);
  });

  it('has a non-empty human label', () => {
    expect(typeof EMAIL_PROMO.label).toBe('string');
    expect(EMAIL_PROMO.label.trim().length).toBeGreaterThan(0);
  });

  it('builds a pricing URL that carries the live promo code', () => {
    const url = buildPromoPricingUrl('https://lunary.app', {
      utm_source: 'email',
    });
    const parsed = new URL(url);
    expect(parsed.pathname).toBe('/pricing');
    expect(parsed.searchParams.get('promo')).toBe(EMAIL_PROMO.code);
    expect(parsed.searchParams.get('utm_source')).toBe('email');
    // The plan hint must land the user where the code is valid.
    const expectedPlan = EMAIL_PROMO.plan === 'monthly' ? 'monthly' : 'annual';
    expect(parsed.searchParams.get('plan')).toBe(expectedPlan);
  });
});
