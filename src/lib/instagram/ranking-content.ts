import type { IGSignRankingContent } from './types';
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
};

const TRAITS = Object.keys(TRAIT_WEIGHTS);

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
