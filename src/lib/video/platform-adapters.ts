/**
 * Platform-specific caption and hashtag adapters.
 *
 * Takes a TikTokScript and produces the right caption format and hashtag
 * count for each platform.
 *
 * Rules from CLAUDE.md:
 * - No links in caption body (algorithm penalty on Threads/Instagram)
 * - UK English
 * - No em dashes
 * - Sentence case
 */

import type { TikTokScript } from './tiktok-scripts';

// ============================================================================
// Hashtag banks
// ============================================================================

const HIGH_VOLUME = [
  'astrology',
  'zodiac',
  'horoscope',
  'astrologytiktok',
  'spirituality',
  'manifestation',
  'cosmic',
];

const MEDIUM_VOLUME = [
  'birthchart',
  'transits',
  'moonphase',
  'risingSign',
  'planetaryalignment',
  'astroapp',
  'dailyhoroscope',
];

const BRANDED = ['lunaryapp', 'lunarapp', 'astroapp', 'cosmicapp'];

const NICHE_BY_CATEGORY: Record<string, string[]> = {
  'feature-reveal': [
    'appfeature',
    'astrotechnology',
    'astrologyapp',
    'techastrology',
    'birthchartapp',
    'cosmictech',
    'appupdate',
  ],
  walkthrough: [
    'howtostrology',
    'astrologyforbeginners',
    'learnastrology',
    'astrologytutorial',
    'cosmicguide',
    'astrologytips',
    'birthchartreading',
  ],
  'deep-dive': [
    'astrologydeep',
    'planetaryaspects',
    'synastry',
    'nataChart',
    'astrologyresearch',
    'cosmicwisdom',
    'astrologygeek',
  ],
  'did-you-know': [
    'astrologyFacts',
    'cosmicfacts',
    'astrologytrivia',
    'didyouknow',
    'astrologyinfo',
    'zodiacfacts',
    'cosmicmystery',
  ],
  'how-to': [
    'howtostrology',
    'astrologyforbeginners',
    'learnastrology',
    'astrologytutorial',
    'cosmicguide',
    'astrologytips',
    'readyourchart',
  ],
  comparison: [
    'astrologyvsastrology',
    'zodiaccomparison',
    'astrologydebate',
    'cosmiccomparison',
    'astrologytake',
    'astrologythoughts',
    'chartcomparison',
  ],
};

function getNicheHashtags(category: TikTokScript['category']): string[] {
  return NICHE_BY_CATEGORY[category] ?? NICHE_BY_CATEGORY['feature-reveal'];
}

// ============================================================================
// Instagram adapter
// ============================================================================

export function adaptForInstagram(script: TikTokScript): {
  caption: string;
  hashtags: string[];
} {
  // 2-3 sentence storytelling caption.
  // Lead with the hook text as the attention-grabber, then expand.
  const hookLine = script.hook.text;
  const bodyLine = script.caption;

  // Build a multi-sentence caption: hook + body + soft CTA (no link in body)
  const cta = 'Follow for your daily cosmic download.';
  const caption = `${hookLine}\n\n${bodyLine}\n\n${cta}`;

  // 25 hashtags: 7 high-volume + 7 medium + 7 niche + 4 branded
  const niche = getNicheHashtags(script.category).slice(0, 7);
  const hashtags = [
    ...HIGH_VOLUME.slice(0, 7),
    ...MEDIUM_VOLUME.slice(0, 7),
    ...niche,
    ...BRANDED.slice(0, 4),
  ];

  return { caption, hashtags };
}

// ============================================================================
// X / Twitter adapter
// ============================================================================

export function adaptForX(script: TikTokScript): {
  caption: string;
  hashtags: string[];
} {
  // X caption must be punchy and leave room for 2 hashtags + a URL.
  // Target: <= 240 chars for the caption text itself.
  let caption = script.caption;

  // Trim to 240 chars at a word boundary if needed
  if (caption.length > 240) {
    caption = caption.slice(0, 237).replace(/\s+\S*$/, '') + '...';
  }

  // 1-3 hashtags: #astrology + one category-specific tag
  const categoryTag =
    script.category === 'how-to' || script.category === 'walkthrough'
      ? 'learnastrology'
      : script.category === 'deep-dive'
        ? 'birthchart'
        : 'astroapp';

  const hashtags = ['astrology', categoryTag];

  return { caption, hashtags };
}
