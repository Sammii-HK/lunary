/**
 * Category slug prefix configuration for content filtering
 */

/**
 * Allowed slug prefixes by category to prevent cross-contamination
 */
export const CATEGORY_SLUG_PREFIXES: Record<string, string[]> = {
  lunar: ['moon', 'moon/', 'moon-', 'moon-in', 'lunar', 'eclipses'],
  planetary: ['astronomy/planets', 'astronomy/retrogrades', 'planets'],
  zodiac: ['zodiac', 'rising-sign', 'birth-chart'],
  tarot: ['tarot', 'card-combinations', 'tarot-spreads'],
  crystals: ['crystals'],
  numerology: ['numerology', 'angel-numbers', 'life-path'],
  chakras: ['chakras'],
  sabbat: ['wheel-of-the-year', 'sabbats', 'sabbat'],
};

/**
 * Check if a slug is allowed for a given category
 */
export const isAllowedSlugForCategory = (
  category: string,
  slug: string,
): boolean => {
  const lower = slug.toLowerCase();
  const prefixes = CATEGORY_SLUG_PREFIXES[category] || [];
  return prefixes.some((prefix) => lower.startsWith(prefix));
};
