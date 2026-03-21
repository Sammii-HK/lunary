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
  transit_spotlight: [
    '#astrotransits',
    '#planetarytransit',
    '#cosmicenergy',
    '#astrologytransit',
    '#celestialevents',
    '#astrologytoday',
  ],
  myth_vs_reality: [
    '#astrologyfacts',
    '#mythbusting',
    '#zodiacfacts',
    '#astrologymyths',
    '#didyouknow',
    '#learnastrology',
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
    transitEvent?: string;
    transitPlanet?: string;
    transitSign?: string;
    mythTopic?: string;
    transitReason?: string;
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
    case 'transit_spotlight':
      caption = generateTransitSpotlightCaption(options);
      break;
    case 'myth_vs_reality':
      caption = generateMythVsRealityCaption(options);
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
  transitReason?: string;
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

  // Add transit context when the sign was chosen because of current sky activity
  const transitLine = options.transitReason
    ? `\n\n${options.transitReason}`
    : '';

  return `${hook}${transitLine}\n\nDouble tap if this is you.\nTag someone who needs to see this.\nSave this for your ${sign} collection.\n\nFollow @lunary.app for daily zodiac content`;
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
  return `What resonates with you today?\n\nSave this for when you need a reminder.\nDrop a thought below.\n\nFree birth chart reading at lunary.app`;
}

function generateAppFeatureCaption(options: { title?: string }): string {
  const title = options.title || 'your cosmic profile';

  return `Discover ${title}\n\nPersonal birth chart readings, daily horoscopes, transit tracking, and 2,000+ articles in the grimoire.\n100% free, no ads.\n\nSave this so you don't forget to check it out.\n\nLink in bio`;
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

  return `${hook}\n\nSave this for later.\nComment below if this changes how you think about it.\n\nMore facts like this at lunary.app/grimoire`;
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

  return `${opener}\n\n${bodies[bodyIndex]}\n\nSave this for reference.\n\nFree birth chart and zodiac profiles at lunary.app`;
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

  return `${hook}\n\nSave this and send it to them.\nTag your person and see if they agree.\nDrop your signs in the comments.\n\nFull compatibility reading free at lunary.app`;
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
 * Generate a TikTok-specific carousel caption.
 *
 * TikTok carousel captions differ from IG:
 * - SEO keywords in the first 10 words (TikTok search discovery)
 * - Shorter, punchier (no "link in bio", no "save this")
 * - Comment-driving CTA (TikTok rewards comment quality/length)
 * - 3-5 hashtags (1 broad + 2 niche, never #fyp)
 */
export function generateTikTokCarouselCaption(
  postType: IGPostType,
  options: {
    category?: ThemeCategory;
    title?: string;
    sign?: string;
    trait?: string;
    sign1?: string;
    sign2?: string;
    score?: number;
    fact?: string;
  },
): CaptionResult {
  const title = options.title || 'Astrology';
  const category = options.category || 'zodiac';
  const seed = options.title || options.sign || options.trait || postType;
  const hash = hashString(seed);

  let caption: string;

  switch (postType) {
    case 'carousel': {
      const titleKey = title.toLowerCase();
      if (category === 'zodiac') {
        const opener =
          ZODIAC_SIGN_OPENERS[titleKey] ||
          `${title} personality traits you need to know`;
        caption = `${opener}\n\nSwipe through all the slides. Which part is most accurate?\n\nComment your sign below`;
      } else if (category === 'tarot') {
        const opener =
          TAROT_CARD_OPENERS[titleKey] ||
          `${title} tarot card — full meaning breakdown`;
        caption = `${opener}\n\nSwipe for the complete guide. What card keeps coming up for you?`;
      } else {
        caption = `${title} — the full breakdown you need\n\nSwipe through. Drop a comment if this resonates`;
      }
      break;
    }
    case 'sign_ranking': {
      const trait = options.trait || 'patience';
      const opener =
        TRAIT_SEARCH_OPENERS[trait] || `All 12 zodiac signs ranked by ${trait}`;
      caption = `${opener}\n\nSwipe to see the ranking. Comment your sign — do you agree?`;
      break;
    }
    case 'angel_number_carousel': {
      const hooks = [
        `You keep seeing ${title}. This is what it means`,
        `${title} keeps appearing? Pay attention`,
        `${title} meaning — the universe is signalling you`,
      ];
      caption = `${hooks[hash % hooks.length]}\n\nSwipe for the full breakdown. What number do you keep seeing?`;
      break;
    }
    case 'compatibility': {
      const s1 = options.sign1
        ? options.sign1.charAt(0).toUpperCase() + options.sign1.slice(1)
        : 'Your sign';
      const s2 = options.sign2
        ? options.sign2.charAt(0).toUpperCase() + options.sign2.slice(1)
        : 'their sign';
      const score = options.score ?? 75;
      const hook =
        score >= 75
          ? `${s1} + ${s2} compatibility is off the charts`
          : `${s1} + ${s2} — can it work? Swipe to find out`;
      caption = `${hook}\n\nTag them and see if they agree`;
      break;
    }
    case 'meme': {
      const sign = options.sign
        ? options.sign.charAt(0).toUpperCase() + options.sign.slice(1)
        : 'zodiac';
      const hooks = [
        `${sign} energy explained in one post`,
        `Every ${sign} knows exactly what this means`,
        `This is the most ${sign} thing ever`,
      ];
      caption = `${hooks[hash % hooks.length]}\n\nTag a ${sign} who needs to see this`;
      break;
    }
    case 'did_you_know': {
      const catLabel = category.charAt(0).toUpperCase() + category.slice(1);
      const hooks = [
        `${catLabel} fact most people get wrong`,
        `Bet you didn't know this about ${catLabel}`,
      ];
      caption = `${hooks[hash % hooks.length]}\n\nComment if this changed how you think about it`;
      break;
    }
    case 'one_word': {
      const trait = options.trait;
      if (trait) {
        const traitLabel = trait.replace(/_/g, ' ');
        caption = `Every sign's ${traitLabel} in one word. How accurate is yours?\n\nSwipe through all 12. Comment your sign below`;
      } else {
        const sign = options.sign
          ? options.sign.charAt(0).toUpperCase() + options.sign.slice(1)
          : 'zodiac';
        caption = `One word for ${sign} and it says everything\n\nComment if you agree`;
      }
      break;
    }
    case 'transit_spotlight': {
      const event = options.title || 'Cosmic shift happening now';
      caption = `${event}\n\nSwipe for what it means and what to do. Comment your sign below`;
      break;
    }
    case 'myth_vs_reality': {
      const mythTopic = options.title || 'astrology';
      const hooks = [
        `Everything you think you know about ${mythTopic} is wrong`,
        `${mythTopic}: myth vs reality. Were you right?`,
      ];
      caption = `${hooks[hash % hooks.length]}\n\nSwipe for the truth. Comment if you believed the myth`;
      break;
    }
    default:
      caption = `${title}\n\nSwipe through. Comment your sign below`;
  }

  // TikTok hashtags: 3-5, niche-focused, never #fyp
  const hashtags = buildTikTokCarouselHashtags(postType, category, seed);

  return { caption, hashtags };
}

/**
 * TikTok carousel hashtags: 3-5 tags, niche-focused.
 * Formula: 1 broad + 2 category + 1-2 post-type specific.
 */
function buildTikTokCarouselHashtags(
  postType: IGPostType,
  category?: ThemeCategory,
  seed?: string,
): string[] {
  const hash = hashString(seed || postType);
  const tags: string[] = [];

  // 1 broad tag
  const broadTags = ['#astrology', '#zodiac', '#spirituality', '#horoscope'];
  tags.push(broadTags[hash % broadTags.length]);

  // 2 category tags (rotated)
  if (category && CATEGORY_HASHTAGS[category]) {
    const pool = CATEGORY_HASHTAGS[category];
    const start = hash % pool.length;
    tags.push(pool[start % pool.length]);
    if (pool.length > 1) tags.push(pool[(start + 1) % pool.length]);
  }

  // 1-2 post-type tags
  const ptTags = POST_TYPE_HASHTAGS[postType] || [];
  if (ptTags.length > 0) {
    const ptStart = (hash + 3) % ptTags.length;
    tags.push(ptTags[ptStart % ptTags.length]);
    if (ptTags.length > 1 && tags.length < 5) {
      tags.push(ptTags[(ptStart + 1) % ptTags.length]);
    }
  }

  return [...new Set(tags)].slice(0, 5);
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

function generateTransitSpotlightCaption(options: {
  transitEvent?: string;
  transitPlanet?: string;
  transitSign?: string;
}): string {
  const event = options.transitEvent || 'A cosmic shift is happening';
  const planet = options.transitPlanet;
  const sign = options.transitSign
    ? options.transitSign.charAt(0).toUpperCase() + options.transitSign.slice(1)
    : '';

  const hooks = planet
    ? [
        `${event}. Here's what it means for you.`,
        `${planet} energy is shifting. This changes everything.`,
        `Major transit alert: ${event}.`,
      ]
    : [
        `${event}. Here's what it means for you.`,
        'The sky is shifting. Pay attention to this.',
        'A cosmic event worth knowing about.',
      ];

  const hookIndex =
    hashString(options.transitEvent || 'transit') % hooks.length;
  const hook = hooks[hookIndex];

  const signLine = sign
    ? `\n${sign} and surrounding signs feel this most.`
    : '';

  return `${hook}${signLine}\n\nSwipe for the full breakdown: what it means, who feels it most, and what to do about it.\n\nSave this so you can come back to it.\n\nTrack all transits free at lunary.app`;
}

function generateMythVsRealityCaption(options: {
  mythTopic?: string;
  category?: ThemeCategory;
}): string {
  const topic = options.mythTopic || 'astrology';
  const category = options.category || 'zodiac';
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

  const hooks = [
    `Most people get ${topic} completely wrong. Here's the truth.`,
    `Everything you think you know about ${topic} might be a myth.`,
    `${topic}: myth vs reality. Which side were you on?`,
    `Stop spreading this myth about ${topic}. The reality is more interesting.`,
  ];

  const hookIndex = hashString(topic) % hooks.length;
  const hook = hooks[hookIndex];

  return `${hook}\n\nSwipe through to see the common myth, the actual truth, and what it means for you.\n\nComment below: did you believe the myth?\n\nMore ${categoryLabel.toLowerCase()} facts at lunary.app/grimoire`;
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
