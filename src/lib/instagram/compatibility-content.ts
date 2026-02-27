import type { IGCompatibilityContent, IGCarouselSlide } from './types';
import { seededRandom } from './ig-utils';

const SIGNS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
];

const SIGN_ELEMENTS: Record<string, string> = {
  aries: 'Fire',
  taurus: 'Earth',
  gemini: 'Air',
  cancer: 'Water',
  leo: 'Fire',
  virgo: 'Earth',
  libra: 'Air',
  scorpio: 'Water',
  sagittarius: 'Fire',
  capricorn: 'Earth',
  aquarius: 'Air',
  pisces: 'Water',
};

// Element compatibility matrix (higher = more compatible)
const ELEMENT_COMPAT: Record<string, Record<string, number>> = {
  Fire: { Fire: 75, Earth: 45, Air: 90, Water: 40 },
  Earth: { Fire: 45, Earth: 80, Air: 50, Water: 85 },
  Air: { Fire: 90, Earth: 50, Air: 70, Water: 55 },
  Water: { Fire: 40, Earth: 85, Air: 55, Water: 75 },
};

// Specific sign pair adjustments (override element defaults)
const PAIR_ADJUSTMENTS: Record<string, number> = {
  'aries-leo': 95,
  'aries-sagittarius': 93,
  'taurus-cancer': 90,
  'taurus-virgo': 88,
  'gemini-libra': 92,
  'gemini-aquarius': 91,
  'cancer-scorpio': 94,
  'cancer-pisces': 93,
  'leo-sagittarius': 90,
  'libra-aquarius': 88,
  'scorpio-pisces': 92,
  'capricorn-virgo': 89,
  'capricorn-taurus': 87,
  // Traditionally challenging pairs
  'aries-cancer': 35,
  'taurus-aquarius': 30,
  'gemini-virgo': 42,
  'leo-scorpio': 38,
  'scorpio-aquarius': 33,
  'aries-capricorn': 40,
};

const HEADLINES: Record<string, string[]> = {
  high: [
    'Written in the stars',
    'Cosmic soulmates',
    'A match made in the heavens',
    'The universe approves',
    'Fire and magic',
  ],
  medium: [
    'This pairing is... complicated',
    "It'll take work, but the sparks are real",
    'Chaos. Beautiful chaos.',
    'Different energies, shared spark',
    'Growth through challenge',
  ],
  low: [
    'Not for the faint-hearted',
    "The universe said 'good luck'",
    'Different wavelengths, beautiful friction',
    'A challenging but transformative pairing',
    'The universe is testing you',
  ],
};

// Element combination details for carousel deep-dives
const PAIR_DETAILS: Record<
  string,
  {
    vibe: string;
    strengths: string[];
    challenges: string[];
  }
> = {
  'Fire-Fire': {
    vibe: 'Electric, passionate, and endlessly adventurous. Two flames that either ignite a wildfire or burn each other out.',
    strengths: [
      'Mutual understanding of independence needs',
      'Shared love for spontaneity and adventure',
      'Natural chemistry and passion',
    ],
    challenges: [
      'Both want to lead—who follows?',
      'Impulsive decisions without grounding',
      'Competitive energy can turn combative',
    ],
  },
  'Fire-Earth': {
    vibe: 'Fire wants to soar, Earth wants to build. One dreams in motion, the other in foundations. The friction can forge something solid—or smother the spark.',
    strengths: [
      "Fire's enthusiasm inspires Earth's ambitions",
      "Earth's stability grounds Fire's chaos",
      'Complementary energy when aligned on goals',
    ],
    challenges: [
      'Different paces—Fire rushes, Earth deliberates',
      'Fire feels restrained, Earth feels overwhelmed',
      'Conflicting priorities: freedom vs. security',
    ],
  },
  'Fire-Air': {
    vibe: 'A match that feels effortless. Air fans the flames, Fire gives Air purpose. Together they create movement, ideas, and endless possibility.',
    strengths: [
      'Natural flow of ideas and action',
      'Mutual respect for independence',
      'Exciting, dynamic connection',
    ],
    challenges: [
      'Both avoid emotional depth',
      'Air overthinks, Fire acts without thinking',
      'Commitment can feel restrictive',
    ],
  },
  'Fire-Water': {
    vibe: "Fire craves intensity, Water craves intimacy. One burns bright, the other runs deep. When it works, it's transformative. When it doesn't, it's exhausting.",
    strengths: [
      'Fire teaches Water to take risks',
      'Water teaches Fire emotional depth',
      'Passionate, transformative connection',
    ],
    challenges: [
      'Fire is too direct, Water too sensitive',
      'Emotional needs often clash',
      'Fire withdraws, Water clings',
    ],
  },
  'Earth-Earth': {
    vibe: 'Steady, loyal, and built to last. Two Earth signs create a fortress of stability, comfort, and shared values. The challenge? Not getting too comfortable.',
    strengths: [
      'Shared values and long-term vision',
      'Mutual reliability and trust',
      'Practical partnership that endures',
    ],
    challenges: [
      'Risk of stagnation and routine',
      'Both stubborn—no one budges first',
      'Lack of spontaneity can breed boredom',
    ],
  },
  'Earth-Air': {
    vibe: 'Earth builds, Air explores. One needs roots, the other needs wings. Respect and curiosity can bridge the gap, but fundamentally different worldviews create tension.',
    strengths: [
      'Air brings fresh perspectives to Earth',
      "Earth gives structure to Air's ideas",
      'Intellectual respect when balanced',
    ],
    challenges: [
      'Earth sees Air as flighty, Air sees Earth as rigid',
      'Different communication styles clash',
      'Air craves novelty, Earth craves consistency',
    ],
  },
  'Earth-Water': {
    vibe: 'A natural, nurturing pairing. Earth provides the container, Water fills it with emotion. Together they grow something deeply rooted and beautifully alive.',
    strengths: [
      'Deep emotional and physical connection',
      'Mutual care and devotion',
      'Build a stable, nurturing home together',
    ],
    challenges: [
      "Water's moods can overwhelm Earth's logic",
      "Earth's practicality can seem cold to Water",
      'Both hold grudges—resentment lingers',
    ],
  },
  'Air-Air': {
    vibe: "Intellectually stimulating, endlessly curious, and always in motion. Two Air signs vibe on ideas, conversation, and freedom. Emotional depth? That's optional.",
    strengths: [
      'Endless mental stimulation',
      'Mutual respect for independence',
      'Shared love of exploration and novelty',
    ],
    challenges: [
      'Avoidance of emotional vulnerability',
      'Commitment feels like a trap',
      'No grounding force—decisions drift',
    ],
  },
  'Air-Water': {
    vibe: 'Air seeks logic, Water seeks feeling. One lives in the mind, the other in the heart. Bridging these worlds requires effort, patience, and genuine curiosity.',
    strengths: [
      'Air helps Water articulate emotions',
      'Water helps Air access deeper feelings',
      'Balance of mind and heart when aligned',
    ],
    challenges: [
      "Water's intensity overwhelms Air's detachment",
      "Air's rationality invalidates Water's emotions",
      'Fundamentally different processing styles',
    ],
  },
  'Water-Water': {
    vibe: 'Deeply intuitive, profoundly emotional, and almost psychic. Two Water signs understand each other without words—but can also drown in shared intensity.',
    strengths: [
      'Unspoken understanding and empathy',
      'Deeply intimate emotional connection',
      'Shared intuition and spiritual bond',
    ],
    challenges: [
      'Emotions amplify—no one provides grounding',
      'Codependency and boundary issues',
      'Shared moods spiral without external perspective',
    ],
  },
};

function getPairKey(sign1: string, sign2: string): string {
  return [sign1, sign2].sort().join('-');
}

function getElementPairKey(element1: string, element2: string): string {
  const key = `${element1}-${element2}`;
  if (PAIR_DETAILS[key]) return key;
  const reverseKey = `${element2}-${element1}`;
  if (PAIR_DETAILS[reverseKey]) return reverseKey;
  return key;
}

function getCompatibilityScore(sign1: string, sign2: string): number {
  const pairKey = getPairKey(sign1, sign2);

  // Check specific pair adjustments first
  if (PAIR_ADJUSTMENTS[pairKey] !== undefined) {
    return PAIR_ADJUSTMENTS[pairKey];
  }

  // Fall back to element compatibility
  const el1 = SIGN_ELEMENTS[sign1];
  const el2 = SIGN_ELEMENTS[sign2];
  return ELEMENT_COMPAT[el1]?.[el2] ?? 60;
}

/**
 * Generate a compatibility card for a given date.
 * Deterministic: same date = same pairing.
 */
export function generateCompatibility(dateStr: string): IGCompatibilityContent {
  const rng = seededRandom(`compat-${dateStr}`);

  // Pick two different signs
  const shuffled = [...SIGNS].sort(() => rng() - 0.5);
  const sign1 = shuffled[0];
  const sign2 = shuffled[1];

  const score = getCompatibilityScore(sign1, sign2);
  const element1 = SIGN_ELEMENTS[sign1];
  const element2 = SIGN_ELEMENTS[sign2];

  // Pick headline based on score tier
  const tier = score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low';
  const headlinePool = HEADLINES[tier];
  const headline = headlinePool[Math.floor(rng() * headlinePool.length)];

  return {
    sign1,
    sign2,
    score,
    element1,
    element2,
    headline,
  };
}

/**
 * Generate multiple compatibility cards for preview.
 */
export function generateCompatibilityBatch(
  dateStr: string,
  count: number = 3,
): IGCompatibilityContent[] {
  const results: IGCompatibilityContent[] = [];
  const rng = seededRandom(`compat-batch-${dateStr}`);

  for (let i = 0; i < count; i++) {
    const shuffled = [...SIGNS].sort(() => rng() - 0.5);
    const sign1 = shuffled[0];
    const sign2 = shuffled[1];

    const score = getCompatibilityScore(sign1, sign2);
    const element1 = SIGN_ELEMENTS[sign1];
    const element2 = SIGN_ELEMENTS[sign2];

    const tier = score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low';
    const headlinePool = HEADLINES[tier];
    const headline = headlinePool[Math.floor(rng() * headlinePool.length)];

    results.push({ sign1, sign2, score, element1, element2, headline });
  }

  return results;
}

/**
 * Generate a 5-slide compatibility carousel for a given date.
 * Returns sign pair, score, and formatted slides for Instagram.
 */
export function generateCompatibilityCarousel(dateStr: string): {
  sign1: string;
  sign2: string;
  score: number;
  slides: IGCarouselSlide[];
} {
  // Get compatibility data
  const compat = generateCompatibility(dateStr);
  const { sign1, sign2, score, element1, element2 } = compat;

  // Get pair details based on element combination
  const pairKey = getElementPairKey(element1, element2);
  const details = PAIR_DETAILS[pairKey];

  // Format sign names for display
  const sign1Cap = sign1.charAt(0).toUpperCase() + sign1.slice(1);
  const sign2Cap = sign2.charAt(0).toUpperCase() + sign2.slice(1);

  const slides: IGCarouselSlide[] = [
    // Slide 1: Cover
    {
      slideIndex: 0,
      totalSlides: 5,
      title: `${sign1Cap} + ${sign2Cap}`,
      content: `${score}%`,
      subtitle: 'Destined or doomed? Swipe to find out',
      category: 'zodiac',
      variant: 'cover',
    },
    // Slide 2: Overall vibe
    {
      slideIndex: 1,
      totalSlides: 5,
      title: 'The Vibe',
      content: details.vibe,
      category: 'zodiac',
      variant: 'body',
    },
    // Slide 3: Strengths
    {
      slideIndex: 2,
      totalSlides: 5,
      title: 'What Works',
      content: details.strengths.map((s) => `• ${s}`).join('\n\n'),
      category: 'zodiac',
      variant: 'body',
    },
    // Slide 4: Challenges
    {
      slideIndex: 3,
      totalSlides: 5,
      title: 'The Friction',
      content: details.challenges.map((c) => `• ${c}`).join('\n\n'),
      category: 'zodiac',
      variant: 'body',
    },
    // Slide 5: CTA
    {
      slideIndex: 4,
      totalSlides: 5,
      title: 'Tag your person',
      content: 'Check your compatibility free → lunary.app',
      category: 'zodiac',
      variant: 'cta',
    },
  ];

  return { sign1, sign2, score, slides };
}
