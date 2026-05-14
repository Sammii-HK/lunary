export const CANONICAL_SITE_URL = 'https://lunary.app';

// Keep this curated. Do not re-promote weak scaled families such as birthday,
// crystals, empty decans, or broad ritual inventory from the discovery index.
export const CURATED_DISCOVERY_SITEMAPS = [
  'sitemap.xml',
  'sitemap-horoscopes.xml',
  'sitemap-yearly-transits.xml',
  'sitemap-transits.xml',
  'sitemap-transit-blog.xml',
  'sitemap-aspects.xml',
  'sitemap-numerology.xml',
  'sitemap-planets.xml',
  'sitemap-placements.xml',
  'sitemap-houses.xml',
  'sitemap-cusps.xml',
  'sitemap-zodiac.xml',
  'sitemap-compatibility.xml',
  'sitemap-tarot.xml',
  'sitemap-chinese-zodiac.xml',
  'sitemap-seasons.xml',
  'sitemap-images.xml',
] as const;

export const DEPRIORITIZED_DISCOVERY_SITEMAPS = [
  'sitemap-birthday.xml',
  'sitemap-crystals.xml',
  'sitemap-decans.xml',
  'sitemap-rituals.xml',
] as const;

export const AI_DISCOVERY_PATHS = [
  '/robots.txt',
  '/llms.txt',
  '/llms-full.txt',
  '/.well-known/ai-plugin.json',
  '/.well-known/openapi.json',
  '/.well-known/lunary-gpt-openapi.yaml',
  '/sitemap-index.xml',
  ...CURATED_DISCOVERY_SITEMAPS.map((sitemap) => `/${sitemap}`),
] as const;

export const INDEXNOW_DISCOVERY_PATHS = ['/', ...AI_DISCOVERY_PATHS] as const;
