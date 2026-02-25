import type { ThemeCategory } from '@/lib/social/types';
import type { IGPostType } from './types';

// --- Hashtag Sets ---

// Broad astrology discovery tags — used to fill remaining slots
const DISCOVERY_HASHTAGS = [
  '#astrology',
  '#zodiacsigns',
  '#horoscope',
  '#spirituality',
  '#mystic',
  '#starsigns',
];

const CATEGORY_HASHTAGS: Record<ThemeCategory, string[]> = {
  zodiac: ['#zodiac', '#zodiacsigns', '#horoscope', '#astrologymemes'],
  tarot: ['#tarot', '#tarotreading', '#tarotcards', '#divination'],
  lunar: ['#moonphases', '#moonmagic', '#lunarphase', '#moon'],
  planetary: ['#astrology', '#planets', '#cosmicenergy', '#celestial'],
  crystals: ['#crystals', '#crystalhealing', '#witchtok', '#crystalgrid'],
  numerology: ['#numerology', '#angelnumbers', '#lifepath', '#manifestation'],
  chakras: ['#chakras', '#chakrahealing', '#energyhealing', '#spirituality'],
  sabbat: ['#wheeloftheyear', '#paganism', '#witchcraft', '#sabbat'],
  runes: ['#runes', '#norsemythology', '#runemagic', '#divination'],
  spells: ['#witchtok', '#spellwork', '#witchcraft', '#magick'],
};

const POST_TYPE_HASHTAGS: Record<IGPostType, string[]> = {
  meme: ['#astrologymemes', '#zodiacmemes', '#relatable', '#foryou'],
  carousel: [
    '#witchesofinstagram',
    '#grimoirepages',
    '#savethis',
    '#astrologyfacts',
  ],
  quote: ['#cosmicquotes', '#spiritualquotes', '#inspiration', '#deepthoughts'],
  app_feature: ['#astrologyapp', '#birthchart', '#cosmictools', '#astrology'],
  did_you_know: ['#didyouknow', '#astrologyfacts', '#savethis', '#funfact'],
  sign_ranking: ['#zodiacranking', '#zodiacsigns', '#signcheck', '#zodiactea'],
  angel_number_carousel: [
    '#angelnumbers',
    '#numerology',
    '#manifestation',
    '#spiritualawakening',
  ],
  compatibility: [
    '#zodiaccompatibility',
    '#astrolove',
    '#cosmicmatch',
    '#tagsomeone',
  ],
  story: ['#dailyhoroscope', '#moonphase', '#tarotdaily', '#cosmicguidance'],
};

// --- Caption Generators ---

interface CaptionResult {
  caption: string;
  hashtags: string[];
}

/**
 * Generate a complete Instagram caption with hashtags separated
 * (first-comment strategy: post hashtags as first comment).
 */
export function generateCaption(
  postType: IGPostType,
  options: {
    category?: ThemeCategory;
    sign?: string;
    title?: string;
    setup?: string;
    punchline?: string;
    headline?: string;
    moonPhase?: string;
    slug?: string;
    fact?: string;
    trait?: string;
    sign1?: string;
    sign2?: string;
    score?: number;
  },
): CaptionResult {
  let caption: string;

  switch (postType) {
    case 'meme':
      caption = generateMemeCaption(options);
      break;
    case 'carousel':
      caption = generateCarouselCaption(options);
      break;
    case 'angel_number_carousel':
      caption = generateAngelNumberCaption(options);
      break;
    case 'quote':
      caption = generateQuoteCaption(options);
      break;
    case 'app_feature':
      caption = generateAppFeatureCaption(options);
      break;
    case 'did_you_know':
      caption = generateDidYouKnowCaption(options);
      break;
    case 'sign_ranking':
      caption = generateSignRankingCaption(options);
      break;
    case 'compatibility':
      caption = generateCompatibilityCaption(options);
      break;
    case 'story':
      caption = generateStoryCaption(options);
      break;
    default:
      caption = 'Explore the cosmos with Lunary \u2728';
  }

  // Build hashtags (category + post type + core) with rotation
  // Use a seed based on content for deterministic but varied selection
  const seed =
    options.title ||
    options.headline ||
    options.fact ||
    options.sign ||
    postType;
  const hashtags = buildHashtags(postType, options.category, seed);

  return { caption, hashtags };
}

function generateMemeCaption(options: {
  sign?: string;
  setup?: string;
  punchline?: string;
}): string {
  const sign = options.sign
    ? options.sign.charAt(0).toUpperCase() + options.sign.slice(1)
    : 'zodiac';

  // Hook in first line (before "...more" fold at ~125 chars)
  const hooks = [
    `${sign} energy is unmatched`,
    `Every ${sign} knows this feeling`,
    `Tag your ${sign} friends`,
    `${sign}s, explain yourselves`,
    `This is so ${sign} coded`,
  ];

  const hookIndex = hashString(options.setup || sign) % hooks.length;
  const hook = hooks[hookIndex];

  return `${hook}\n\nDouble tap if this is you.\nTag someone who needs to see this.\n\nFollow @lunaryapp for daily cosmic content`;
}

function generateCarouselCaption(options: {
  title?: string;
  category?: ThemeCategory;
}): string {
  const title = options.title || 'Grimoire Guide';
  const category = options.category || 'tarot';

  const hooks: Record<string, string> = {
    tarot: `Everything you need to know about ${title}`,
    zodiac: `The complete guide to ${title}`,
    spells: `How to cast: ${title}`,
    crystals: `${title} - properties, uses, and healing`,
    numerology: `${title} - what the numbers reveal`,
    runes: `${title} - meaning and magical uses`,
    chakras: `${title} - healing and alignment`,
    sabbat: `${title} - traditions and rituals`,
    lunar: `${title} - cosmic insight`,
    planetary: `${title} - planetary energy guide`,
  };

  const hook = hooks[category] || `Discover: ${title}`;

  return `${hook}\n\nSave this for later - you'll want to come back to it.\nSwipe through for the full guide.\n\nExplore the complete Grimoire at lunary.app`;
}

function generateQuoteCaption(options: { headline?: string }): string {
  return `What resonates with you today?\n\nDrop a thought below.\nSave this for when you need a reminder.\n\nMore cosmic wisdom at lunary.app`;
}

function generateAppFeatureCaption(options: { title?: string }): string {
  const title = options.title || 'your cosmic profile';

  return `Discover ${title} with Lunary\n\nYour personal astrology companion.\nBirth charts, daily readings, and 200+ grimoire entries.\n\nLink in bio`;
}

function generateDidYouKnowCaption(options: {
  fact?: string;
  category?: ThemeCategory;
}): string {
  const category = options.category || 'astrology';
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

  const hooks = [
    `Most people don't know this about ${categoryLabel}`,
    `Save this ${categoryLabel} fact for later`,
    `${categoryLabel} knowledge you need in your life`,
    `Bet you didn't know this one`,
  ];

  const hookIndex = hashString(options.fact || category) % hooks.length;
  const hook = hooks[hookIndex];

  return `${hook}\n\nSave this post and share it with someone who needs to know.\n\nMore cosmic wisdom in the Grimoire at lunary.app`;
}

function generateSignRankingCaption(options: { trait?: string }): string {
  const trait = options.trait || 'patience';

  const hooks = [
    `Signs ranked by ${trait}. Agree or disagree?`,
    `Where does your sign fall on the ${trait} scale?`,
    `The official ${trait} ranking is in. Drop your sign below.`,
    `POV: checking where your sign landed for ${trait}`,
  ];

  const hookIndex = hashString(trait) % hooks.length;
  const hook = hooks[hookIndex];

  return `${hook}\n\nTag someone and see if they agree with their ranking.\nComment your sign and let's debate.\n\nFollow @lunaryapp for daily cosmic content`;
}

function generateCompatibilityCaption(options: {
  sign1?: string;
  sign2?: string;
  score?: number;
}): string {
  const sign1 = options.sign1
    ? options.sign1.charAt(0).toUpperCase() + options.sign1.slice(1)
    : 'Your sign';
  const sign2 = options.sign2
    ? options.sign2.charAt(0).toUpperCase() + options.sign2.slice(1)
    : 'their sign';
  const score = options.score ?? 75;

  const hooks =
    score >= 75
      ? [
          `${sign1} + ${sign2} = cosmic magic`,
          `If you're a ${sign1} dating a ${sign2}, you already know`,
          `${sign1} and ${sign2}: the universe said yes`,
        ]
      : [
          `${sign1} + ${sign2}: it's complicated`,
          `${sign1} and ${sign2}: growth through challenge`,
          `Can ${sign1} and ${sign2} make it work? The stars have opinions`,
        ];

  const hookIndex = hashString(sign1 + sign2) % hooks.length;
  const hook = hooks[hookIndex];

  return `${hook}\n\nTag your person and see if they agree.\nDrop your signs in the comments.\n\nCheck your full compatibility at lunary.app`;
}

function generateStoryCaption(options: {
  headline?: string;
  moonPhase?: string;
}): string {
  return options.headline || 'Your daily cosmic guidance';
}

function generateAngelNumberCaption(options: { title?: string }): string {
  const title = options.title || 'this angel number';

  const hooks = [
    `You keep seeing ${title}. Here's why.`,
    `${title} keeps showing up? The universe is trying to tell you something.`,
    `Stop what you're doing if you keep seeing ${title}.`,
    `${title} isn't a coincidence. Read this.`,
  ];

  const hookIndex = hashString(title) % hooks.length;
  const hook = hooks[hookIndex];

  return `${hook}\n\nSave this for next time it appears.\nWhat number do YOU keep seeing? Comment below.\n\nExplore all angel numbers at lunary.app`;
}

/**
 * Build 3 topically relevant hashtags.
 *
 * Merges post-type tags + category tags into one pool of related tags,
 * then picks 3 using seed-based rotation for daily variety.
 * Falls back to broad discovery tags only if the topical pool is too small.
 */
function buildHashtags(
  postType: IGPostType,
  category?: ThemeCategory,
  seed?: string,
): string[] {
  const hash = hashString(seed || postType);

  // Build a single pool of topically relevant tags
  const pool: string[] = [];
  pool.push(...(POST_TYPE_HASHTAGS[postType] || []));
  if (category && CATEGORY_HASHTAGS[category]) {
    pool.push(...CATEGORY_HASHTAGS[category]);
  }

  // Dedupe
  const unique = Array.from(new Set(pool));

  // If pool is too small, pad with broad discovery tags
  if (unique.length < 3) {
    for (const tag of DISCOVERY_HASHTAGS) {
      if (!unique.includes(tag)) unique.push(tag);
      if (unique.length >= 6) break;
    }
  }

  // Rotate the pool based on seed so each post gets a different 3
  const startIndex = hash % unique.length;
  const rotated = [...unique.slice(startIndex), ...unique.slice(0, startIndex)];

  return rotated.slice(0, 3);
}

/**
 * Simple string hash for deterministic selection.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}
