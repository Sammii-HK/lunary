/**
 * Centralized pricing constants for Lunary
 * Update these values in ONE place to reflect across the entire site
 */

export const PRICING = {
  FREE: {
    price: 0,
    display: 'Free',
  },
  LUNARY_PLUS: {
    price: 4.99,
    display: '$4.99/mo',
    interval: 'month' as const,
  },
  LUNARY_PLUS_PRO: {
    price: 8.99,
    display: '$8.99/mo',
    interval: 'month' as const,
  },
  LUNARY_PLUS_PRO_ANNUAL: {
    price: 89.99,
    display: '$89.99/yr',
    interval: 'year' as const,
    savings: '17%',
  },
} as const;

/**
 * Helper strings for comparison pages
 */
export const PRICING_DISPLAY = {
  // For comparison tables
  range: `Free + from ${PRICING.LUNARY_PLUS.display}`,

  // For text descriptions
  paidTiersStart: `${PRICING.LUNARY_PLUS.display}`,
  paidTiersRange: `${PRICING.LUNARY_PLUS.display}-${PRICING.LUNARY_PLUS_PRO.display}`,

  // For FAQs and explanations
  fullRange: `Free, ${PRICING.LUNARY_PLUS.display} (Lunary+), ${PRICING.LUNARY_PLUS_PRO.display} (Lunary+ Pro), or ${PRICING.LUNARY_PLUS_PRO_ANNUAL.display} (Lunary+ Pro Annual)`,
} as const;

/**
 * Free trial days
 */
export const FREE_TRIAL_DAYS = {
  monthly: 7,
  annual: 14,
  display: '7 days (monthly) / 14 days (annual)',
} as const;
