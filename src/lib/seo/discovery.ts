export const CANONICAL_SITE_URL = 'https://lunary.app';

export const AI_CRAWLER_USER_AGENTS = [
  'Bingbot',
  'DuckDuckBot',
  'OAI-SearchBot',
  'GPTBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'Claude-Web',
  'Anthropic-AI',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot',
  'Applebot-Extended',
  'CCBot',
] as const;

// Keep this curated. Do not re-promote weak scaled families such as birthday,
// crystals, empty decans, or broad ritual inventory from the discovery index.
export const CURATED_DISCOVERY_SITEMAPS = [
  'sitemap.xml',
  'sitemap-horoscopes.xml',
  'sitemap-yearly-transits.xml',
  'sitemap-transits.xml',
  'sitemap-transit-blog.xml',
  'sitemap-datasets.xml',
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

const currentDiscoveryYear = new Date().getUTCFullYear();

export const AI_DISCOVERY_PATHS = [
  '/robots.txt',
  '/llms.txt',
  '/llms-full.txt',
  '/ai-citation-map.json',
  '/about/citations',
  '/grimoire/datasets',
  '/grimoire/datasets/core-astrology.json',
  '/grimoire/datasets/core-astrology-2026-05-17.json',
  '/grimoire/datasets/current-sky-facts.json',
  '/grimoire/datasets/current-sky',
  '/grimoire/datasets/current-sky/2026-05-17',
  `/grimoire/datasets/astrology-calendar/${currentDiscoveryYear}.json`,
  `/grimoire/datasets/astrology-calendar/${currentDiscoveryYear + 1}.json`,
  '/grimoire/facts/moon-phase-today',
  '/grimoire/facts/current-moon-sign',
  '/grimoire/facts/planetary-positions-today',
  '/grimoire/facts/mercury-retrograde-status',
  '/grimoire/facts/next-full-moon',
  '/grimoire/facts/next-new-moon',
  '/grimoire/facts/next-eclipse',
  '/grimoire/facts/next-mercury-retrograde',
  '/about/methodology',
  '/.well-known/ai-plugin.json',
  '/.well-known/openapi.json',
  '/.well-known/lunary-gpt-openapi.yaml',
  '/sitemap-index.xml',
  ...CURATED_DISCOVERY_SITEMAPS.map((sitemap) => `/${sitemap}`),
] as const;

export const INDEXNOW_DISCOVERY_PATHS = ['/', ...AI_DISCOVERY_PATHS] as const;
