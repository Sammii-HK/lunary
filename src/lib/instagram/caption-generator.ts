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
    '#zodiacsigns',
    '#astrology',
    '#zodiacfacts',
    '#zodiacpersonality',
    '#astrologymemes',
    '#zodiacenergy',
    '#zodiacranking',
    '#horoscope',
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
      caption = generateOneWordCaption({
        sign: options.sign,
        trait: options.trait,
      });
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

// Keyword-rich openers for zodiac sign carousels — written as things people actually search
const ZODIAC_SIGN_OPENERS: Record<string, string> = {
  aries:
    'Aries personality traits: why they lead, explode, and somehow always win.',
  taurus:
    'Taurus personality: why the most stubborn sign is also the most loyal.',
  gemini:
    "Gemini personality traits — why they're the most misunderstood sign in the zodiac.",
  cancer:
    'Cancer zodiac: the emotional intelligence most people completely miss.',
  leo: 'Leo personality traits: why every room feels different when they walk in.',
  virgo:
    "Virgo personality — why they're not uptight, they just have higher standards.",
  libra:
    'Libra personality traits: the charming, calculated truth behind the balance.',
  scorpio:
    'Scorpio personality — why everyone is either obsessed with them or terrified.',
  sagittarius:
    "Sagittarius personality traits: the freedom-chaser who can't be contained.",
  capricorn:
    "Capricorn personality — why they're always five steps ahead of everyone else.",
  aquarius:
    "Aquarius personality traits: why they're the most original sign in the zodiac.",
  pisces:
    'Pisces personality — the most emotionally complex sign, fully explained.',
};

// Keyword-rich openers for tarot card carousels
const TAROT_CARD_OPENERS: Record<string, string> = {
  'the fool':
    "The Fool tarot card meaning — it's not about naivety. Here's what it's really saying.",
  'the magician':
    "The Magician tarot card: you already have everything you need. Here's why.",
  'the high priestess':
    'The High Priestess tarot meaning — trust what you already know.',
  'the empress':
    'The Empress tarot card meaning: abundance, creation, and what it means for you.',
  'the emperor':
    'The Emperor tarot card — authority, structure, and when it shows up in a reading.',
  'the hierophant':
    'The Hierophant tarot meaning: tradition, institutions, and breaking from them.',
  'the lovers':
    "The Lovers tarot card doesn't just mean romance. Full meaning inside.",
  'the chariot':
    "The Chariot tarot meaning — willpower, momentum, and when you're close to winning.",
  strength:
    "Strength tarot card: this isn't about force. Here's the real meaning.",
  'the hermit':
    'The Hermit tarot card meaning — solitude, wisdom, and inner guidance.',
  'wheel of fortune':
    'Wheel of Fortune tarot: what it actually means when cycles shift.',
  justice:
    "Justice tarot card meaning — karma, truth, and what's coming back around.",
  'the hanged man':
    "The Hanged Man tarot: he chose to hang upside down. Here's what that means for your reading.",
  death:
    "Death tarot card doesn't mean what you think. The real meaning, fully explained.",
  temperance:
    'Temperance tarot card meaning — balance, alchemy, and the long game.',
  'the devil':
    "The Devil tarot card: it's not evil. Here's what it's actually showing you.",
  'the tower':
    "The Tower tarot card meaning — most people fear this pull. Here's why you shouldn't.",
  'the star':
    'The Star tarot card: hope after collapse. Full meaning and what it means for you.',
  'the moon':
    "The Moon tarot card meaning — illusion, anxiety, and what's hidden in the shadows.",
  'the sun':
    'The Sun tarot card: the most positive card in the deck. Full breakdown inside.',
  judgement:
    "Judgement tarot card meaning — a calling, not a verdict. Here's the full guide.",
  'the world':
    'The World tarot card: completion, achievement, and what comes next.',
};

function generateCarouselCaption(options: {
  title?: string;
  category?: ThemeCategory;
}): string {
  const title = options.title || 'Grimoire Guide';
  const category = options.category || 'tarot';
  const titleKey = title.toLowerCase();

  // Zodiac sign: use sign-specific keyword hook
  if (category === 'zodiac') {
    const hook =
      ZODIAC_SIGN_OPENERS[titleKey] ||
      `${title} personality traits, compatibility, and the full astrology breakdown.`;
    return `${hook}\n\nSwipe through for everything — personality, strengths, shadow side, love compatibility, and career energy.\n\nSave this if you're a ${title} or know one.\n\nFull grimoire — link in bio`;
  }

  // Tarot card: use card-specific keyword hook
  if (category === 'tarot') {
    const hook =
      TAROT_CARD_OPENERS[titleKey] ||
      `${title} tarot card — upright, reversed, love, career, and spirituality. Full breakdown.`;
    return `${hook}\n\nSwipe for the complete guide — upright meaning, reversed, love, career, and spiritual guidance.\n\nSave this for your next reading.\n\nFull grimoire — link in bio`;
  }

  // Other categories: specific but concise
  const hooks: Record<string, string> = {
    spells: `How to cast: ${title}`,
    crystals: `${title} crystal — properties, chakra connections, and how to work with its energy.`,
    numerology: `${title} — the meaning most people overlook.`,
    runes: `${title} rune — meaning, divination, and magical uses.`,
    chakras: `${title} — signs of imbalance and how to heal it.`,
    sabbat: `${title} — history, traditions, and how to mark it properly.`,
    lunar: `${title} — what the lunar cycle is telling you.`,
    planetary: `${title} — how this planetary energy affects you.`,
  };

  const bodies: Record<string, string> = {
    crystals: `Swipe for the full guide — healing properties, how to cleanse it, and how to work with its energy.\n\nKnowing your crystals is one of the most practical parts of any spiritual practice.`,
    runes: `Swipe for the full meaning — upright, reversed, and how to work with this rune in readings and daily life.\n\nThe Elder Futhark holds ancient wisdom. Each rune has layers.`,
    spells: `Swipe for the full ritual — ingredients, timing, and step-by-step method.\n\nIntention is everything. Read the full guide before casting.`,
    numerology: `Swipe for the complete breakdown — core meaning, life path connections, and spiritual significance.\n\nNumerology reveals patterns most people miss entirely.`,
    chakras: `Swipe for the full guide — location, signs of imbalance, and practices to heal and activate this energy centre.\n\nChakra work is ongoing, not a one-time fix.`,
    sabbat: `Swipe for the full breakdown — the history, traditions, rituals, and how to mark this point on the Wheel of the Year.\n\nThe sabbats are about alignment with natural cycles.`,
  };

  const hook = hooks[category] || `${title} — the full guide.`;
  const body =
    bodies[category] ||
    `Swipe through for the complete breakdown.\n\nSave this — you'll want to come back to it.`;

  return `${hook}\n\n${body}\n\nFull grimoire — link in bio`;
}

function generateQuoteCaption(options: { headline?: string }): string {
  return `What resonates with you today?\n\nDrop a thought below.`;
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
    `${categoryLabel} fact most people get wrong`,
    `${categoryLabel} knowledge you need in your life`,
    `Bet you didn't know this one`,
  ];

  const hookIndex = hashString(options.fact || category) % hooks.length;
  const hook = hooks[hookIndex];

  return `${hook}\n\nComment below if this changes how you think about it.`;
}

// Search-optimised opening lines per trait — written as queries people actually type
const TRAIT_SEARCH_OPENERS: Record<string, string> = {
  patience: 'Which zodiac sign has the most patience? We ranked all 12.',
  loyalty: 'Most loyal zodiac signs ranked from #1 to #12.',
  stubbornness: 'Most stubborn zodiac signs: the definitive ranking.',
  creativity:
    'Most creative zodiac signs ranked. Does your sign make the top 3?',
  intensity: 'Most intense zodiac signs ranked. Is yours at the top?',
  sensitivity: 'Most sensitive zodiac signs ranked from most to least.',
  independence: 'Most independent zodiac signs: ranked all 12.',
  ambition: 'Most ambitious zodiac signs ranked. Where does yours land?',
  spontaneity: 'Most spontaneous zodiac signs ranked. Agree with #1?',
  empathy: 'Most empathetic zodiac signs ranked from #1 to #12.',
  overthinking: 'Which zodiac sign overthinks the most? Full ranking inside.',
  flirtiness: 'Most flirtatious zodiac signs ranked. Is yours in the top 3?',
  drama: 'Most dramatic zodiac signs ranked. You already know who is #1.',
  trustworthiness: 'Most trustworthy zodiac signs ranked. Is yours reliable?',
  intelligence:
    'Most intelligent zodiac signs ranked. Does your sign crack the top 5?',
  jealousy: 'Most jealous zodiac signs: ranked all 12.',
  romance: 'Most romantic zodiac signs ranked. Who loves hardest?',
  confidence: 'Most confident zodiac signs ranked from #1 to #12.',
};

function generateSignRankingCaption(options: { trait?: string }): string {
  const trait = options.trait || 'patience';
  const traitCap = trait.charAt(0).toUpperCase() + trait.slice(1);

  const opener =
    TRAIT_SEARCH_OPENERS[trait] ||
    `All 12 zodiac signs ranked by ${trait}. Where does yours land?`;

  const bodies = [
    `Swipe to see the full countdown from #5 to #1.\n\nComment your sign below. Do you agree with #1?`,
    `Swipe through to see every sign's ranking.\n\nDrop your sign in the comments. Disagree with the order?`,
    `The full ${traitCap} ranking is in. Swipe to see where your sign landed.\n\nComment and let's debate.`,
  ];

  const bodyIndex = hashString(trait) % bodies.length;

  return `${opener}\n\n${bodies[bodyIndex]}`;
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

function generateOneWordCaption(options: {
  sign?: string;
  trait?: string;
}): string {
  // Trait-level caption (all 12 signs in one carousel)
  if (options.trait) {
    const trait = options.trait;
    const traitLabel = trait.replace(/_/g, ' ');

    const hooks = [
      `Your sign's ${traitLabel} in one word. Which word is yours?`,
      `All 12 signs described by their ${traitLabel} in one word. Swipe to find yours.`,
      `One word sums up every sign's ${traitLabel}. How accurate is yours?`,
      `The ${traitLabel} of every zodiac sign in one word. Save this.`,
    ];

    const hookIndex = hashString(trait) % hooks.length;
    const hook = hooks[hookIndex];

    return `${hook}\n\nSwipe through all 12 signs.\nComment your sign and word below.\n\nFollow for daily zodiac content`;
  }

  // Single-sign caption fallback
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
 * Build topically relevant hashtags.
 *
 * Merges post-type tags + category tags into one pool of related tags,
 * then picks using seed-based rotation for daily variety.
 * Falls back to broad discovery tags only if the topical pool is too small.
 */
export function buildHashtags(
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

  return rotated.slice(0, 5);
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
