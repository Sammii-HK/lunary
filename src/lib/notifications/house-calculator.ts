/**
 * House Calculator for Notification Personalization
 *
 * Uses whole sign house system to determine which house a sign falls in
 * relative to the user's Ascendant/Rising sign.
 */

const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;

type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

const HOUSE_MEANINGS: Record<number, string> = {
  1: 'self and identity',
  2: 'finances and values',
  3: 'communication and learning',
  4: 'home and family',
  5: 'creativity and romance',
  6: 'health and daily routines',
  7: 'partnerships and relationships',
  8: 'transformation and shared resources',
  9: 'expansion and philosophy',
  10: 'career and public image',
  11: 'community and aspirations',
  12: 'spirituality and the unconscious',
};

const HOUSE_SHORT_MEANINGS: Record<number, string> = {
  1: 'identity',
  2: 'values',
  3: 'communication',
  4: 'home',
  5: 'creativity',
  6: 'health',
  7: 'relationships',
  8: 'transformation',
  9: 'expansion',
  10: 'career',
  11: 'community',
  12: 'spirituality',
};

/**
 * Calculate which house a sign falls in using whole sign houses
 *
 * @param signPosition - The zodiac sign to find the house for (e.g., "Capricorn")
 * @param ascendantSign - The user's rising/ascendant sign (e.g., "Cancer")
 * @returns House number (1-12)
 */
export function calculateHouseForSign(
  signPosition: string,
  ascendantSign: string,
): number {
  const normalizedSign = normalizeSignName(signPosition);
  const normalizedAsc = normalizeSignName(ascendantSign);

  const signIdx = ZODIAC_SIGNS.indexOf(normalizedSign as ZodiacSign);
  const ascIdx = ZODIAC_SIGNS.indexOf(normalizedAsc as ZodiacSign);

  if (signIdx === -1 || ascIdx === -1) {
    return 1; // Default to 1st house if invalid sign
  }

  // House = (sign position - ascendant position + 12) % 12 + 1
  return ((signIdx - ascIdx + 12) % 12) + 1;
}

/**
 * Get the meaning/theme of a house
 *
 * @param house - House number (1-12)
 * @param short - Return short version if true
 * @returns House meaning string
 */
export function getHouseMeaning(house: number, short = false): string {
  const clampedHouse = Math.max(1, Math.min(12, house));
  return short
    ? HOUSE_SHORT_MEANINGS[clampedHouse]
    : HOUSE_MEANINGS[clampedHouse];
}

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 *
 * @param n - Number to convert
 * @returns Ordinal string (e.g., "1st", "2nd", "3rd")
 */
export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Normalize sign name to match our canonical list
 *
 * @param sign - Sign name in any case
 * @returns Normalized sign name
 */
function normalizeSignName(sign: string): string {
  const normalized = sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();
  return normalized;
}

/**
 * Create a personalized house context string
 *
 * @param signPosition - The sign where the transit/event is happening
 * @param ascendantSign - The user's rising sign
 * @returns Formatted string like "your 7th house of relationships"
 */
export function createHouseContext(
  signPosition: string,
  ascendantSign: string,
): string {
  const house = calculateHouseForSign(signPosition, ascendantSign);
  const meaning = getHouseMeaning(house);
  return `your ${ordinal(house)} house of ${meaning}`;
}

/**
 * Get which user's natal planet is in a specific sign
 *
 * @param birthChart - Array of birth chart placements
 * @param sign - Sign to check for
 * @returns Array of planet names in that sign
 */
export function getPlanetsInSign(
  birthChart: Array<{ body: string; sign: string }>,
  sign: string,
): string[] {
  const normalizedSign = normalizeSignName(sign);
  return birthChart
    .filter((p) => normalizeSignName(p.sign) === normalizedSign)
    .map((p) => p.body);
}

/**
 * Check if a transit sign activates the user's chart
 * (i.e., user has natal planets in that sign)
 *
 * @param birthChart - User's birth chart placements
 * @param transitSign - The sign of the transit
 * @returns Object with activation details
 */
export function checkChartActivation(
  birthChart: Array<{ body: string; sign: string }>,
  transitSign: string,
): { isActivated: boolean; activatedPlanets: string[] } {
  const planetsInSign = getPlanetsInSign(birthChart, transitSign);
  return {
    isActivated: planetsInSign.length > 0,
    activatedPlanets: planetsInSign,
  };
}
