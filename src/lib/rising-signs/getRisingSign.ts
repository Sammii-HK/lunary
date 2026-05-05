/**
 * Helper for accessing rising sign (ascendant) data
 */

import risingSignsData from '@/data/rising-signs.json';

export interface RisingSign {
  sign: string;
  element: string;
  modality: string;
  ruler: string;
  coreTraits: string[];
  firstImpression: string;
  physicalAppearance: string;
  lifeApproach: string;
  howOthersSeeYou: string;
  strengths: string[];
  challenges: string[];
  compatibility: string;
  famousExamples: string;
  seoTitle: string;
  seoDescription: string;
}

const risingSigns = risingSignsData.risingSigns as Record<string, RisingSign>;

export function normalizeRisingSignSlug(slug: string): string {
  return slug.endsWith('-rising') ? slug : `${slug}-rising`;
}

export function getPublicRisingSignSlug(slug: string): string {
  return slug.replace(/-rising$/, '');
}

/**
 * Get all rising sign slugs
 */
export function getAllRisingSignSlugs(): string[] {
  return Object.keys(risingSigns);
}

/**
 * Get a specific rising sign by slug
 */
export function getRisingSign(slug: string): RisingSign | null {
  return risingSigns[normalizeRisingSignSlug(slug)] || null;
}

/**
 * Get all rising signs data
 */
export function getAllRisingSigns(): Array<RisingSign & { slug: string }> {
  return Object.entries(risingSigns).map(([slug, data]) => ({
    slug,
    ...data,
  }));
}

/**
 * Get rising sign by zodiac sign name
 */
export function getRisingSignByName(signName: string): RisingSign | null {
  return getRisingSign(signName.toLowerCase());
}
