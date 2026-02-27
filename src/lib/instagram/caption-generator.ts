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
  '#astrologypost',
  '#cosmicenergy',
];

const CATEGORY_HASHTAGS: Record<ThemeCategory, string[]> = {
  zodiac: [
    '#zodiac',
    '#zodiacsigns',
    '#horoscope',
    '#astrologymemes',
    '#birthchart',
    '#astrologyfacts',
    '#zodiacpersonality',
    '#learnastrology',
    '#astrologylovers',
    '#zodiacenergy',
  ],
  tarot: [
    '#tarot',
    '#tarotreading',
    '#tarotcards',
    '#divination',
    '#dailytarot',
    '#tarotcommunity',
    '#tarotdeck',
    '#tarotspread',
    '#tarotmeanings',
    '#tarotguidance',
  ],
  lunar: [
    '#moonphases',
    '#moonmagic',
    '#lunarphase',
    '#moon',
    '#fullmoon',
    '#newmoon',
    '#moonritual',
    '#moonenergy',
    '#lunarmagic',
    '#moonwitch',
  ],
  planetary: [
    '#astrology',
    '#planets',
    '#cosmicenergy',
    '#celestial',
    '#planetarymagic',
    '#astrotransits',
    '#mercuryretrograde',
    '#venusinretrograde',
    '#astrologycommunity',
    '#cosmicguidance',
  ],
  crystals: [
    '#crystals',
    '#crystalhealing',
    '#crystalcollection',
    '#healingcrystals',
    '#crystalgrid',
    '#witchesofinstagram',
    '#crystalmagic',
    '#chakrahealing',
    '#gemstones',
    '#crystalwitch',
  ],
  numerology: [
    '#numerology',
    '#angelnumbers',
    '#lifepath',
    '#manifestation',
    '#angelnumber',
    '#numerologyreading',
    '#spiritualawakening',
    '#divineguidance',
    '#lawofattraction',
    '#111',
  ],
  chakras: [
    '#chakras',
    '#chakrahealing',
    '#energyhealing',
    '#spirituality',
    '#chakrabalancing',
    '#sacredgeometry',
    '#kundalini',
    '#thirdeyeopen',
    '#rootchakra',
    '#highervibration',
  ],
  sabbat: [
    '#wheeloftheyear',
    '#paganism',
    '#witchcraft',
    '#sabbat',
    '#witchesofinstagram',
    '#pagancommunity',
    '#wicca',
    '#greenwitch',
    '#earthmagic',
    '#ritualmagic',
  ],
  runes: [
    '#runes',
    '#norsemythology',
    '#runemagic',
    '#divination',
    '#elderfuthark',
    '#vikingmagic',
    '#runesofinstagram',
    '#norsewitchcraft',
    '#runerunes',
    '#runereading',
  ],
  spells: [
    '#witchtok',
    '#spellwork',
    '#witchcraft',
    '#magick',
    '#witchesofinstagram',
    '#spellcasting',
    '#ritualmagic',
    '#manifestation',
    '#moonspell',
    '#candle magic',
  ],
};

const POST_TYPE_HASHTAGS: Record<IGPostType, string[]> = {
  meme: [
    '#astrologymemes',
    '#zodiacmemes',
    '#relatable',
    '#zodiachumor',
    '#astrologytiktok',
    '#zodiacfacts',
  ],
  carousel: [
    '#witchesofinstagram',
    '#grimoirepages',
    '#savethis',
    '#astrologyfacts',
    '#learnastrology',
    '#astrologytips',
  ],
  quote: [
    '#cosmicquotes',
    '#spiritualquotes',
    '#inspiration',
    '#deepthoughts',
    '#cosmicwisdom',
    '#soulquotes',
  ],
  app_feature: [
    '#astrologyapp',
    '#birthchart',
    '#cosmictools',
    '#astrology',
    '#birthchartreading',
    '#freebirthchart',
  ],
  did_you_know: [
    '#didyouknow',
    '#astrologyfacts',
    '#savethis',
    '#funfact',
    '#astrologytips',
    '#learnastrology',
  ],
  sign_ranking: [
    '#zodiacranking',
    '#zodiacsigns',
    '#signcheck',
    '#zodiactea',
    '#zodiacfacts',
    '#astrologymemes',
  ],
  angel_number_carousel: [
    '#angelnumbers',
    '#numerology',
    '#manifestation',
    '#spiritualawakening',
    '#angelnumber',
    '#divineguidance',
  ],
  compatibility: [
    '#zodiaccompatibility',
    '#astrolove',
    '#cosmicmatch',
    '#tagsomeone',
    '#zodiaclove',
    '#astrologylove',
  ],
  story: [
    '#dailyhoroscope',
    '#moonphase',
    '#tarotdaily',
    '#cosmicguidance',
    '#dailyastrology',
    '#cosmicforecast',
  ],
  one_word: [
    '#zodiacsigns',
    '#zodiacenergy',
    '#astrologyfacts',
    '#zodiacpersonality',
    '#astrologymemes',
    '#zodiacvibes',
  ],
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
    case 'one_word':
      caption = generateOneWordCaption(options);
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

  return `${hook}\n\nDouble tap if this is you.\nTag someone who needs to see this.\n\nFollow for daily zodiac content and astrology facts`;
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
    crystals: `${title} — properties, uses, and healing`,
    numerology: `${title} — what the numbers reveal`,
    runes: `${title} — meaning and magical uses`,
    chakras: `${title} — healing and alignment`,
    sabbat: `${title} — traditions and rituals`,
    lunar: `${title} — cosmic insight`,
    planetary: `${title} — planetary energy guide`,
  };

  const bodies: Record<string, string> = {
    tarot: `Swipe through for the full breakdown — upright meaning, reversed meaning, love, career, and spirituality. Save this post so you have it for your next reading.\n\nThis card carries more wisdom than most people realise. The more you study it, the more it reveals.`,
    zodiac: `Swipe through for everything — personality traits, strengths, weaknesses, love compatibility, and career energy. Save this post and share it with someone who has this placement in their chart.\n\nAstrology is most powerful when you go beyond the surface. This is the deep dive.`,
    crystals: `Swipe for the full guide — healing properties, chakra connections, how to cleanse it, and how to work with its energy. Save this for your next crystal haul.\n\nKnowing your crystals is one of the most practical parts of spiritual practice.`,
    runes: `Swipe for the full meaning — upright, reversed, and how to work with this rune in readings and daily practice. Save this and come back when it shows up in your spreads.\n\nThe Elder Futhark holds ancient wisdom. Each rune has layers.`,
    spells: `Swipe for the full ritual — ingredients, timing, and step-by-step method. Save this and use it when the moment is right.\n\nIntention is everything. Read through the full guide before casting.`,
    numerology: `Swipe for the complete breakdown — the core meaning, what it tells you about life path, relationships, and spiritual growth. Save this for the next time this number appears.\n\nNumerology reveals patterns most people miss entirely.`,
    chakras: `Swipe for the full guide — location, meaning, signs of imbalance, and practices to heal and activate this energy centre. Save this and revisit it regularly.\n\nChakra work is ongoing — not a one-time thing.`,
    sabbat: `Swipe for the full breakdown — the history, traditions, rituals, and how to mark this point on the Wheel of the Year. Save this and return to it as the date approaches.\n\nThe sabbats are about alignment with natural cycles.`,
  };

  const hook = hooks[category] || `Discover: ${title}`;
  const body =
    bodies[category] ||
    `Swipe through for the full guide. Save this post — you will want to come back to it.\n\nThis is the kind of deep dive most people never get.`;

  return `${hook}\n\n${body}\n\nFree to read — link in bio`;
}

function generateQuoteCaption(options: { headline?: string }): string {
  return `What resonates with you today?\n\nDrop a thought below.\nSave this for when you need a reminder.\n\nFollow for daily cosmic wisdom and astrology insights`;
}

function generateAppFeatureCaption(options: { title?: string }): string {
  const title = options.title || 'your cosmic profile';

  return `Discover ${title}\n\nPersonal birth chart readings, daily horoscopes, transit tracking, and 2,000+ articles in the grimoire.\n100% free, no ads.\n\nLink in bio`;
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

  return `${hook}\n\nSave this post and share it with someone who needs to know.\n\nFollow for daily astrology facts, zodiac guides, and spiritual knowledge`;
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

  return `${hook}\n\nTag someone and see if they agree with their ranking.\nComment your sign below — let's debate.\n\nFollow for daily zodiac rankings, astrology facts, and cosmic content`;
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

  return `${hook}\n\nTag your person and see if they agree.\nDrop your signs in the comments — let's talk about it.\n\nFull birth chart compatibility reading — link in bio`;
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

  return `${hook}\n\nSave this for next time it appears.\nWhat number do YOU keep seeing? Comment below.\n\nFull angel number guide — link in bio`;
}

function generateOneWordCaption(options: { sign?: string }): string {
  const sign = options.sign
    ? options.sign.charAt(0).toUpperCase() + options.sign.slice(1)
    : 'zodiac';

  const hooks = [
    `One word for ${sign} and it says everything`,
    `If you know a ${sign}, you already know this is accurate`,
    `This is the most ${sign} thing ever`,
    `${sign} described in one word. Do you agree?`,
  ];

  const hookIndex = hashString(sign) % hooks.length;
  const hook = hooks[hookIndex];

  return `${hook}\n\nTag a ${sign} who needs to see this.\nComment your sign below.\n\nFollow for daily zodiac content`;
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

  // Rotate the pool based on seed so each post gets a different set
  const startIndex = hash % unique.length;
  const rotated = [...unique.slice(startIndex), ...unique.slice(0, startIndex)];

  return rotated.slice(0, 10);
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
