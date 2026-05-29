/**
 * Single source of truth for the promo code advertised in lifecycle emails.
 *
 * WHY THIS EXISTS
 * ----------------
 * Lifecycle emails (browse-abandon, abandoned-checkout drip, post-trial winback)
 * used to hardcode bare promo strings (CURIOUS10 / RETURN20 / WELCOME15) directly
 * in their JSX. The Stripe checkout silently drops any code that is not an active
 * promotion code and charges full price without surfacing an error
 * (see src/app/api/stripe/create-checkout-session/route.ts). So if any of those
 * codes expired or never existed, the email promised a discount the checkout
 * quietly ignored — a silent revenue / trust leak.
 *
 * Centralising the code here means:
 *   1. There is ONE place to rotate the live offer (or override via env).
 *   2. Every drip advertises the SAME live code + percent, so they cannot drift.
 *   3. The advertised percentage always matches the code.
 *
 * IMPORTANT: the value here must correspond to an ACTIVE promotion code in the
 * live Stripe account. If the live offer changes, update LUNARY_EMAIL_PROMO_CODE
 * (and the percent/label) here or via the env vars below. Do not reintroduce
 * bare hardcoded codes in individual email components.
 */

export interface EmailPromo {
  /** Stripe promotion code (must be active in the live Stripe account). */
  code: string;
  /** Headline discount percent advertised in copy. Must match the Stripe code. */
  percent: number;
  /**
   * Plan the discount applies to. The current live offer (BLUEMOON) is scoped to
   * Pro Annual, so copy must not promise it on the monthly plan.
   */
  plan: 'annual' | 'monthly' | 'any';
  /** Short human label for the offer, used in copy. */
  label: string;
}

/**
 * The live email promo. Defaults to BLUEMOON (32% off Pro Annual), the current
 * live marketing offer. Override per-environment with:
 *   LUNARY_EMAIL_PROMO_CODE, LUNARY_EMAIL_PROMO_PERCENT, LUNARY_EMAIL_PROMO_LABEL
 */
export const EMAIL_PROMO: EmailPromo = {
  code: process.env.LUNARY_EMAIL_PROMO_CODE || 'BLUEMOON',
  percent: Number(process.env.LUNARY_EMAIL_PROMO_PERCENT) || 32,
  plan: 'annual',
  label: process.env.LUNARY_EMAIL_PROMO_LABEL || 'Pro Annual',
};

/**
 * Build the pricing URL that carries the live promo code. Centralised so the
 * `?promo=` param and plan hint stay consistent across every email CTA.
 *
 * @param baseUrl  Absolute site origin (e.g. https://lunary.app).
 * @param utm      UTM params appended for attribution (campaign/content/etc).
 */
export function buildPromoPricingUrl(
  baseUrl: string,
  utm: Record<string, string> = {},
): string {
  const params = new URLSearchParams({
    nav: 'app',
    promo: EMAIL_PROMO.code,
    // BLUEMOON applies to the annual plan; hint the plan so the checkout lands
    // the user where the code is valid rather than on a plan it cannot discount.
    plan: EMAIL_PROMO.plan === 'monthly' ? 'monthly' : 'annual',
    ...utm,
  });
  return `${baseUrl}/pricing?${params.toString()}`;
}
