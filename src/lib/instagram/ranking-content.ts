import type {
  IGSignRankingContent,
  IGCarouselSlide,
  CarouselSlideVariant,
} from './types';
import type { ThemeCategory } from '@/lib/social/types';
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

// Trait-specific base rankings (general tendency, shuffled with seed for variety)
// Higher weight = stronger association with this trait
const TRAIT_WEIGHTS: Record<string, Record<string, number>> = {
  patience: {
    taurus: 10,
    capricorn: 9,
    virgo: 8,
    pisces: 7,
    libra: 6,
    cancer: 5,
    aquarius: 4,
    scorpio: 3,
    leo: 2,
    gemini: 2,
    sagittarius: 1,
    aries: 0,
  },
  loyalty: {
    scorpio: 10,
    taurus: 9,
    cancer: 8,
    leo: 7,
    capricorn: 6,
    virgo: 5,
    pisces: 4,
    aries: 3,
    libra: 2,
    aquarius: 2,
    gemini: 1,
    sagittarius: 0,
  },
  stubbornness: {
    taurus: 10,
    scorpio: 9,
    capricorn: 8,
    leo: 7,
    aquarius: 6,
    aries: 5,
    virgo: 4,
    cancer: 3,
    pisces: 2,
    libra: 2,
    sagittarius: 1,
    gemini: 0,
  },
  creativity: {
    pisces: 10,
    leo: 9,
    aquarius: 8,
    libra: 7,
    gemini: 6,
    sagittarius: 5,
    cancer: 4,
    scorpio: 3,
    aries: 2,
    virgo: 2,
    taurus: 1,
    capricorn: 0,
  },
  intensity: {
    scorpio: 10,
    aries: 9,
    capricorn: 8,
    leo: 7,
    cancer: 6,
    pisces: 5,
    taurus: 4,
    virgo: 3,
    sagittarius: 2,
    aquarius: 2,
    gemini: 1,
    libra: 0,
  },
  sensitivity: {
    pisces: 10,
    cancer: 9,
    scorpio: 8,
    libra: 7,
    virgo: 6,
    taurus: 5,
    leo: 4,
    gemini: 3,
    aquarius: 2,
    sagittarius: 2,
    capricorn: 1,
    aries: 0,
  },
  independence: {
    aquarius: 10,
    sagittarius: 9,
    aries: 8,
    scorpio: 7,
    capricorn: 6,
    virgo: 5,
    gemini: 4,
    leo: 3,
    libra: 2,
    taurus: 2,
    pisces: 1,
    cancer: 0,
  },
  ambition: {
    capricorn: 10,
    aries: 9,
    scorpio: 8,
    leo: 7,
    virgo: 6,
    taurus: 5,
    aquarius: 4,
    sagittarius: 3,
    libra: 2,
    gemini: 2,
    cancer: 1,
    pisces: 0,
  },
  spontaneity: {
    sagittarius: 10,
    aries: 9,
    gemini: 8,
    aquarius: 7,
    leo: 6,
    libra: 5,
    pisces: 4,
    scorpio: 3,
    cancer: 2,
    taurus: 2,
    virgo: 1,
    capricorn: 0,
  },
  empathy: {
    pisces: 10,
    cancer: 9,
    libra: 8,
    virgo: 7,
    scorpio: 6,
    taurus: 5,
    aquarius: 4,
    sagittarius: 3,
    leo: 2,
    gemini: 2,
    capricorn: 1,
    aries: 0,
  },
  overthinking: {
    virgo: 10,
    gemini: 9,
    libra: 8,
    scorpio: 7,
    pisces: 6,
    cancer: 5,
    aquarius: 4,
    capricorn: 3,
    taurus: 2,
    aries: 2,
    leo: 1,
    sagittarius: 0,
  },
  flirtiness: {
    gemini: 10,
    libra: 9,
    leo: 8,
    sagittarius: 7,
    aries: 6,
    pisces: 5,
    scorpio: 4,
    aquarius: 3,
    taurus: 2,
    cancer: 2,
    virgo: 1,
    capricorn: 0,
  },
  drama: {
    leo: 10,
    scorpio: 9,
    gemini: 8,
    aries: 7,
    cancer: 6,
    libra: 5,
    pisces: 4,
    sagittarius: 3,
    virgo: 2,
    aquarius: 2,
    taurus: 1,
    capricorn: 0,
  },
  trustworthiness: {
    capricorn: 10,
    taurus: 9,
    scorpio: 8,
    cancer: 7,
    virgo: 6,
    leo: 5,
    aquarius: 4,
    pisces: 3,
    aries: 2,
    libra: 2,
    sagittarius: 1,
    gemini: 0,
  },
  intelligence: {
    aquarius: 10,
    virgo: 9,
    scorpio: 8,
    gemini: 7,
    capricorn: 6,
    libra: 5,
    sagittarius: 4,
    aries: 3,
    cancer: 2,
    pisces: 2,
    taurus: 1,
    leo: 0,
  },
  jealousy: {
    scorpio: 10,
    cancer: 9,
    leo: 8,
    taurus: 7,
    aries: 6,
    virgo: 5,
    pisces: 4,
    capricorn: 3,
    libra: 2,
    gemini: 2,
    aquarius: 1,
    sagittarius: 0,
  },
  romance: {
    libra: 10,
    pisces: 9,
    taurus: 8,
    cancer: 7,
    leo: 6,
    scorpio: 5,
    virgo: 4,
    sagittarius: 3,
    gemini: 2,
    capricorn: 2,
    aries: 1,
    aquarius: 0,
  },
  confidence: {
    leo: 10,
    aries: 9,
    sagittarius: 8,
    scorpio: 7,
    capricorn: 6,
    aquarius: 5,
    gemini: 4,
    taurus: 3,
    libra: 2,
    virgo: 2,
    cancer: 1,
    pisces: 0,
  },
};

const TRAITS = Object.keys(TRAIT_WEIGHTS);

// Brief reasons for why each sign ranks high in each trait (max 60 chars)
const TRAIT_REASONS: Record<string, Record<string, string>> = {
  patience: {
    taurus: 'Unshakeable calm in any storm',
    capricorn: 'Plays the long game with discipline',
    virgo: 'Methodical approach to everything',
    pisces: 'Goes with the flow naturally',
    libra: 'Weighs options without rushing',
  },
  loyalty: {
    scorpio: 'Ride or die for their people',
    taurus: 'Once committed, never wavers',
    cancer: 'Protective and devoted always',
    leo: 'Fiercely stands by loved ones',
    capricorn: 'Takes commitments seriously',
  },
  stubbornness: {
    taurus: 'Immovable when mind is made up',
    scorpio: 'Never backs down from position',
    capricorn: 'Sticks to their principles',
    leo: "Won't admit when wrong",
    aquarius: 'Convinced they know best',
  },
  creativity: {
    pisces: 'Dreams up entire worlds',
    leo: 'Natural born performer',
    aquarius: 'Thinks completely outside box',
    libra: 'Aesthetic vision on point',
    gemini: 'Ideas flow endlessly',
  },
  intensity: {
    scorpio: 'All or nothing energy',
    aries: 'Goes hard at everything',
    capricorn: 'Laser focused on goals',
    leo: 'Passionate about it all',
    cancer: 'Feels everything deeply',
  },
  sensitivity: {
    pisces: 'Absorbs all emotions around',
    cancer: 'Heart on their sleeve',
    scorpio: 'Picks up on everything',
    libra: 'Highly attuned to others',
    virgo: 'Notices every subtle shift',
  },
  independence: {
    aquarius: 'Marches to own drum',
    sagittarius: 'Needs complete freedom',
    aries: 'Does it solo always',
    scorpio: 'Trusts self above all',
    capricorn: 'Self-reliant to core',
  },
  ambition: {
    capricorn: 'Born to reach top',
    aries: 'Always chasing next win',
    scorpio: 'Determined to dominate',
    leo: 'Wants the crown',
    virgo: 'Perfectionist drive kicks in',
  },
  spontaneity: {
    sagittarius: 'Says yes first asks later',
    aries: 'Acts on impulse constantly',
    gemini: 'Changes plans on whim',
    aquarius: 'Keeps life unpredictable',
    leo: 'Lives for the moment',
  },
  empathy: {
    pisces: 'Feels your pain as own',
    cancer: 'Nurtures everyone around',
    libra: 'Sees all perspectives',
    virgo: 'Wants to help solve it',
    scorpio: 'Understands the darkness',
  },
  overthinking: {
    virgo: 'Analyzes every tiny detail',
    gemini: 'Mind never stops racing',
    libra: 'Weighs pros cons forever',
    scorpio: 'Questions everything deeply',
    pisces: 'Lost in thought spirals',
  },
  flirtiness: {
    gemini: 'Charms everyone effortlessly',
    libra: 'Natural smooth talker',
    leo: 'Loves the attention game',
    sagittarius: 'Playful and fun energy',
    aries: 'Direct and bold approach',
  },
  drama: {
    leo: 'Main character energy always',
    scorpio: 'Everything is intense',
    gemini: 'Stirs the pot regularly',
    aries: 'Quick to react loudly',
    cancer: 'Emotions run the show',
  },
  trustworthiness: {
    capricorn: 'Word is their bond',
    taurus: 'Reliable as the sun rising',
    scorpio: 'Loyal to the end',
    cancer: 'Protects your secrets',
    virgo: 'Does what they promise',
  },
  intelligence: {
    aquarius: 'Sees patterns others miss',
    virgo: 'Analytical mind never rests',
    scorpio: 'Strategic thinker always',
    gemini: 'Absorbs knowledge instantly',
    capricorn: 'Practical genius at work',
  },
  jealousy: {
    scorpio: 'Possessive to the core',
    cancer: 'Guards loved ones fiercely',
    leo: 'Cannot stand being second',
    taurus: 'What is theirs is theirs',
    aries: 'Competitive about everything',
  },
  romance: {
    libra: 'Lives for grand gestures',
    pisces: 'Love is their whole world',
    taurus: 'Sensual and deeply devoted',
    cancer: 'Creates a love cocoon',
    leo: 'Makes you feel like royalty',
  },
  confidence: {
    leo: 'Born knowing their worth',
    aries: 'Fears nothing and no one',
    sagittarius: 'Unshakeable self-belief',
    scorpio: 'Quietly certain of power',
    capricorn: 'Earned confidence through grit',
  },
};

/**
 * Generate a sign ranking for a given date.
 * Adds slight randomised variance so rankings aren't always identical.
 * Deterministic: same date = same ranking.
 */
export function generateSignRanking(dateStr: string): IGSignRankingContent {
  const rng = seededRandom(`ranking-${dateStr}`);

  // Pick trait
  const trait = TRAITS[Math.floor(rng() * TRAITS.length)];
  const weights = TRAIT_WEIGHTS[trait];

  // Add small random variance to base weights for variety
  const scored = SIGNS.map((sign) => ({
    sign,
    score: (weights[sign] || 5) + (rng() * 3 - 1.5),
  }));

  // Sort descending
  scored.sort((a, b) => b.score - a.score);

  const rankings = scored.map((s, i) => ({
    sign: s.sign,
    rank: i + 1,
  }));

  return { trait, rankings };
}

/**
 * Generate multiple rankings for preview purposes.
 */
export function generateRankingBatch(
  dateStr: string,
  count: number = 3,
): IGSignRankingContent[] {
  const results: IGSignRankingContent[] = [];
  const rng = seededRandom(`ranking-batch-${dateStr}`);
  const shuffledTraits = [...TRAITS].sort(() => rng() - 0.5);

  for (let i = 0; i < count; i++) {
    const trait = shuffledTraits[i % shuffledTraits.length];
    const weights = TRAIT_WEIGHTS[trait];

    const scored = SIGNS.map((sign) => ({
      sign,
      score: (weights[sign] || 5) + (rng() * 3 - 1.5),
    }));

    scored.sort((a, b) => b.score - a.score);

    results.push({
      trait,
      rankings: scored.map((s, i) => ({ sign: s.sign, rank: i + 1 })),
    });
  }

  return results;
}

/**
 * Generate a 7-slide carousel for the ranking system.
 * Slide 1: Cover with hook
 * Slides 2-6: Countdown from #5 to #1 with reasons
 * Slide 7: CTA to lunary.app
 */
export function generateRankingCarousel(dateStr: string): {
  trait: string;
  slides: IGCarouselSlide[];
  rankings: Array<{ sign: string; rank: number }>;
} {
  const { trait, rankings } = generateSignRanking(dateStr);

  // Get top 5 signs
  const top5 = rankings.slice(0, 5);

  // Capitalize trait for display
  const traitCapitalized = trait.charAt(0).toUpperCase() + trait.slice(1);

  const category: ThemeCategory = 'zodiac';
  const totalSlides = 7;

  const slides: IGCarouselSlide[] = [];

  // Slide 1: Cover
  slides.push({
    slideIndex: 1,
    totalSlides,
    title: `Signs ranked by ${traitCapitalized}`,
    content: `Do you agree with #1?`,
    category,
    variant: 'cover' as CarouselSlideVariant,
  });

  // Slides 2-6: Countdown from #5 to #1
  for (let i = 4; i >= 0; i--) {
    const { sign, rank } = top5[i];
    const signCapitalized = sign.charAt(0).toUpperCase() + sign.slice(1);
    const reason = TRAIT_REASONS[trait]?.[sign] || 'Natural affinity for this';

    slides.push({
      slideIndex: 6 - i,
      totalSlides,
      title: traitCapitalized,
      content: reason,
      subtitle: `#${rank} ${signCapitalized}`,
      symbol: sign,
      category,
      variant: 'body' as CarouselSlideVariant,
    });
  }

  // Slide 7: CTA
  slides.push({
    slideIndex: 7,
    totalSlides,
    title: "See your sign's full personality",
    content: 'lunary.app',
    category,
    variant: 'cta' as CarouselSlideVariant,
  });

  return { trait, slides, rankings };
}
