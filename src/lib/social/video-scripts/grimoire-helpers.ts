/**
 * Grimoire data helpers for video scripts
 */

import type { DailyFacet } from '../weekly-themes';
import { CATEGORY_SLUG_PREFIXES } from './constants';

// Import data sources
import zodiacSigns from '@/data/zodiac-signs.json';
import tarotCards from '@/data/tarot-cards.json';
import crystals from '@/data/crystals.json';
import numerology from '@/data/numerology.json';
import chakras from '@/data/chakras.json';
import sabbats from '@/data/sabbats.json';
import planetaryBodies from '@/data/planetary-bodies.json';

/**
 * Get Grimoire data for a facet
 */
export function getGrimoireDataForFacet(
  facet: DailyFacet,
): Record<string, any> | null {
  const slug = facet.grimoireSlug;

  // Try zodiac signs
  if (slug.includes('zodiac/')) {
    const sign = slug.split('/').pop();
    if (sign && zodiacSigns[sign as keyof typeof zodiacSigns]) {
      return zodiacSigns[sign as keyof typeof zodiacSigns];
    }
  }

  // Try planets
  if (slug.includes('planets/') || slug.includes('astronomy/')) {
    const planet = slug.split('/').pop();
    if (planet && planetaryBodies[planet as keyof typeof planetaryBodies]) {
      return planetaryBodies[planet as keyof typeof planetaryBodies];
    }
  }

  // Try chakras
  if (slug.includes('chakras/')) {
    const chakra = slug.split('/').pop();
    if (chakra && chakras[chakra as keyof typeof chakras]) {
      return chakras[chakra as keyof typeof chakras];
    }
  }

  // Try crystals
  if (slug.includes('crystals/')) {
    const crystalId = slug.split('/').pop();
    const crystal = (crystals as any[]).find(
      (c) =>
        c.id === crystalId || c.name.toLowerCase() === crystalId?.toLowerCase(),
    );
    if (crystal) return crystal;
  }

  // Try tarot
  if (slug.includes('tarot/')) {
    const cardSlug = slug.split('/').pop();
    if (cardSlug) {
      const cardKey = cardSlug
        .split('-')
        .map((word, i) =>
          i === 0
            ? word.toLowerCase()
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join('');
      const card =
        tarotCards.majorArcana[cardKey as keyof typeof tarotCards.majorArcana];
      if (card) return card;
    }
  }

  // Try sabbats
  if (slug.includes('wheel-of-the-year/')) {
    const sabbatName = slug.split('/').pop();
    const sabbat = (sabbats as any[]).find(
      (s) => s.name.toLowerCase() === sabbatName?.toLowerCase(),
    );
    if (sabbat) return sabbat;
  }

  // Try numerology
  if (slug.includes('numerology') || slug.includes('angel-numbers')) {
    const match = slug.match(/(\d+)/);
    if (match) {
      const num = match[1];
      const angelNum =
        numerology.angelNumbers?.[num as keyof typeof numerology.angelNumbers];
      if (angelNum) return angelNum;
      const lifePath =
        numerology.lifePathNumbers?.[
          num as keyof typeof numerology.lifePathNumbers
        ];
      if (lifePath) return lifePath;
    }
  }

  return null;
}

/**
 * Check if slug is allowed for category
 */
export function isAllowedSlugForCategory(
  category: string,
  slug: string,
): boolean {
  const lower = slug.toLowerCase();
  const prefixes = CATEGORY_SLUG_PREFIXES[category] || [];
  return prefixes.some((prefix) => lower.startsWith(prefix));
}

/**
 * Get safe Grimoire data for facet (only if slug is allowed for category)
 */
export function getSafeGrimoireDataForFacet(
  facet: DailyFacet,
  category: string,
): Record<string, any> | null {
  if (!isAllowedSlugForCategory(category, facet.grimoireSlug)) {
    return null;
  }
  return getGrimoireDataForFacet(facet);
}
