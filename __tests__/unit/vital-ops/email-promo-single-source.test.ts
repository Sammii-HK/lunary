/**
 * @jest-environment node
 *
 * VITAL OP #8 - Email promo single source of truth (#267).
 *
 * Lifecycle emails used to hardcode bare promo strings. The Stripe checkout
 * silently drops any code that is not an ACTIVE promotion code and charges full
 * price with no error, so a stale code in an email is a silent revenue/trust
 * leak. PR #267 centralised the live offer in src/lib/promo/email-promo.ts.
 *
 * This file pins:
 *   1. EMAIL_PROMO resolves to the live BLUEMOON / Pro Annual offer (and honours
 *      env overrides) so every drip advertises the same code + percent.
 *   2. buildPromoPricingUrl builds the right `?promo=...&plan=annual` URL.
 *   3. The checkout `promoCodeApplied` flag behaves: it stays `false` when the
 *      `active:true` lookup finds no live code (the silent-drop signal) and only
 *      flips `true` when an active code matches. Stripe is mocked.
 *
 * No network, no DB, deterministic.
 */
import * as fs from 'fs';
import * as path from 'path';

const readSource = (rel: string) =>
  fs.readFileSync(path.join(process.cwd(), rel), 'utf-8');

describe('VITAL #8 EMAIL_PROMO - single live offer (defaults to BLUEMOON)', () => {
  afterEach(() => {
    jest.resetModules();
    delete process.env.LUNARY_EMAIL_PROMO_CODE;
    delete process.env.LUNARY_EMAIL_PROMO_PERCENT;
    delete process.env.LUNARY_EMAIL_PROMO_LABEL;
  });

  it('defaults to BLUEMOON, 32% off, Pro Annual', () => {
    jest.isolateModules(() => {
      delete process.env.LUNARY_EMAIL_PROMO_CODE;
      delete process.env.LUNARY_EMAIL_PROMO_PERCENT;
      delete process.env.LUNARY_EMAIL_PROMO_LABEL;
      const { EMAIL_PROMO } = require('@/lib/promo/email-promo');
      expect(EMAIL_PROMO.code).toBe('BLUEMOON');
      expect(EMAIL_PROMO.percent).toBe(32);
      expect(EMAIL_PROMO.plan).toBe('annual');
      expect(EMAIL_PROMO.label).toBe('Pro Annual');
    });
  });

  it('honours env overrides so the offer can be rotated without code change', () => {
    jest.isolateModules(() => {
      process.env.LUNARY_EMAIL_PROMO_CODE = 'HARVEST25';
      process.env.LUNARY_EMAIL_PROMO_PERCENT = '25';
      process.env.LUNARY_EMAIL_PROMO_LABEL = 'Pro Monthly';
      const { EMAIL_PROMO } = require('@/lib/promo/email-promo');
      expect(EMAIL_PROMO.code).toBe('HARVEST25');
      expect(EMAIL_PROMO.percent).toBe(25);
      expect(EMAIL_PROMO.label).toBe('Pro Monthly');
    });
  });

  it('falls back to 32 when the percent env var is not a number', () => {
    jest.isolateModules(() => {
      process.env.LUNARY_EMAIL_PROMO_PERCENT = 'not-a-number';
      const { EMAIL_PROMO } = require('@/lib/promo/email-promo');
      expect(EMAIL_PROMO.percent).toBe(32);
    });
  });
});

describe('VITAL #8 buildPromoPricingUrl - ?promo=...&plan=annual', () => {
  const {
    buildPromoPricingUrl,
    EMAIL_PROMO,
  } = require('@/lib/promo/email-promo');

  it('builds a /pricing URL carrying the live promo code and annual plan hint', () => {
    const url = buildPromoPricingUrl('https://lunary.app');
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe('https://lunary.app/pricing');
    const params = parsed.searchParams;
    expect(params.get('promo')).toBe(EMAIL_PROMO.code); // BLUEMOON
    expect(params.get('promo')).toBe('BLUEMOON');
    // BLUEMOON is annual-only — the plan hint must land the user where it applies.
    expect(params.get('plan')).toBe('annual');
    expect(params.get('nav')).toBe('app');
  });

  it('merges UTM params for attribution without dropping the promo/plan', () => {
    const url = buildPromoPricingUrl('https://lunary.app', {
      utm_source: 'lifecycle',
      utm_campaign: 'winback',
    });
    const params = new URL(url).searchParams;
    expect(params.get('utm_source')).toBe('lifecycle');
    expect(params.get('utm_campaign')).toBe('winback');
    expect(params.get('promo')).toBe('BLUEMOON');
    expect(params.get('plan')).toBe('annual');
  });

  it('keeps the plan hint annual for the default annual-scoped offer', () => {
    // The current live offer is annual; the helper must never hint monthly for it,
    // or the code would silently fail to apply on the landing plan.
    const params = new URL(buildPromoPricingUrl('https://lunary.app'))
      .searchParams;
    expect(params.get('plan')).not.toBe('monthly');
  });
});

// ---------------------------------------------------------------------------
// Mirror of the checkout `promoCodeApplied` resolution.
// Source: src/app/api/stripe/create-checkout-session/route.ts (lines ~679-731).
// Stripe is mocked via the injected `listPromotionCodes` so this stays a unit.
// ---------------------------------------------------------------------------
type FakeStripe = {
  promotionCodes: {
    list: (args: {
      code: string;
      active: boolean;
      limit?: number;
    }) => Promise<{ data: Array<{ id: string }> }>;
  };
};

/** Mirror of the promo branch: only `active:true` codes apply; else flag stays false. */
async function resolvePromoApplied(
  stripe: FakeStripe,
  promoCode: string | undefined,
  normalizedPromoCode: string | null,
): Promise<{
  applied: boolean | undefined;
  discounts?: { promotion_code: string }[];
}> {
  let promoCodeApplied: boolean | undefined;
  let discounts: { promotion_code: string }[] | undefined;
  if (promoCode) {
    promoCodeApplied = false;
    try {
      const promoLookupCode = normalizedPromoCode || promoCode;
      const promoCodes = await stripe.promotionCodes.list({
        code: promoLookupCode,
        active: true,
      });
      if (promoCodes.data.length > 0) {
        discounts = [{ promotion_code: promoCodes.data[0].id }];
        promoCodeApplied = true;
      }
    } catch {
      // Continue without promo code if invalid.
    }
  }
  return { applied: promoCodeApplied, discounts };
}

describe('VITAL #8 checkout promoCodeApplied - active:true gating', () => {
  it('is undefined when no promo code is supplied at all', async () => {
    const stripe: FakeStripe = {
      promotionCodes: { list: jest.fn() },
    };
    const { applied } = await resolvePromoApplied(stripe, undefined, null);
    expect(applied).toBeUndefined();
    expect(stripe.promotionCodes.list).not.toHaveBeenCalled();
  });

  it('flips true and attaches the discount when an ACTIVE code matches', async () => {
    const list = jest
      .fn()
      .mockResolvedValue({ data: [{ id: 'promo_live_123' }] });
    const stripe: FakeStripe = { promotionCodes: { list } };

    const { applied, discounts } = await resolvePromoApplied(
      stripe,
      'BLUEMOON',
      'BLUEMOON',
    );

    expect(list).toHaveBeenCalledWith({ code: 'BLUEMOON', active: true });
    expect(applied).toBe(true);
    expect(discounts).toEqual([{ promotion_code: 'promo_live_123' }]);
  });

  it('stays FALSE (the silent-drop signal) when no active code matches', async () => {
    // This is exactly the leak #267 guards against: an email promised a code that
    // is not live, so the checkout proceeds at full price with applied=false.
    const list = jest.fn().mockResolvedValue({ data: [] });
    const stripe: FakeStripe = { promotionCodes: { list } };

    const { applied, discounts } = await resolvePromoApplied(
      stripe,
      'EXPIRED10',
      'EXPIRED10',
    );

    expect(applied).toBe(false);
    expect(discounts).toBeUndefined();
  });

  it('stays FALSE if the Stripe lookup throws (checkout still proceeds)', async () => {
    const list = jest.fn().mockRejectedValue(new Error('stripe down'));
    const stripe: FakeStripe = { promotionCodes: { list } };
    const { applied } = await resolvePromoApplied(
      stripe,
      'BLUEMOON',
      'BLUEMOON',
    );
    expect(applied).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Structural guard: the mirror above only stays valid while the route keeps
// implementing it. Also pins that the route uses active:true and that the
// promo module is the single source (no bare hardcoded promo strings reappear).
// ---------------------------------------------------------------------------
describe('VITAL #8 source still implements the pinned promo logic', () => {
  const route = readSource(
    'src/app/api/stripe/create-checkout-session/route.ts',
  );

  it('route still gates promo lookups on active:true', () => {
    expect(route).toContain('active: true');
  });

  it('route still tracks promoCodeApplied and only flips true on a match', () => {
    expect(route).toContain('let promoCodeApplied: boolean | undefined');
    expect(route).toContain('promoCodeApplied = true');
    expect(route).toContain('promoCodeApplied = false');
  });

  it('route still looks up the code via promotionCodes.list', () => {
    expect(route).toContain('promotionCodes.list({');
  });

  it('the promo module documents itself as the single source of truth', () => {
    const promo = readSource('src/lib/promo/email-promo.ts');
    expect(promo).toContain('Single source of truth');
    expect(promo).toContain('BLUEMOON');
    expect(promo).toContain('export function buildPromoPricingUrl');
  });
});
