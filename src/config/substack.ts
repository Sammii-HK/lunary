export const SUBSTACK_CONFIG = {
  publicationUrl: process.env.SUBSTACK_PUBLICATION_URL || '',
  email: process.env.SUBSTACK_EMAIL || '',
  password: process.env.SUBSTACK_PASSWORD || '',
  pricing: {
    monthly: 3, // $3/month for paid tier (value ladder: Substack $3 → App $4.99)
    currency: 'USD',
  },
  utm: {
    free: {
      source: 'substack',
      medium: 'email',
      campaign: 'weekly_free',
    },
    paid: {
      source: 'substack',
      medium: 'email',
      campaign: 'weekly_paid',
    },
  },
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app',
} as const;

export function getAppUrlWithUtm(tier: 'free' | 'paid'): string {
  const utm = SUBSTACK_CONFIG.utm[tier];
  return `${SUBSTACK_CONFIG.appUrl}?utm_source=${utm.source}&utm_medium=${utm.medium}&utm_campaign=${utm.campaign}`;
}
