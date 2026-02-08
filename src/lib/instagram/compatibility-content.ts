import type { IGCompatibilityContent } from './types';
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
    'Opposites attract (sometimes)',
    'A cosmic work in progress',
    'Growth through challenge',
    'Different energies, shared spark',
    'The universe says: try harder',
  ],
  low: [
    'Cosmic friction ahead',
    'A challenging but transformative pairing',
    'The universe is testing you',
    'Different wavelengths, different worlds',
    'Growth through friction',
  ],
};

function getPairKey(sign1: string, sign2: string): string {
  return [sign1, sign2].sort().join('-');
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
