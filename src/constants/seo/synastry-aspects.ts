/**
 * Synastry Aspects Data
 * SEO content for relationship compatibility aspects
 */

import synastryData from '@/data/synastry-aspects.json';

export interface SynastryAspectFAQ {
  question: string;
  answer: string;
}

export interface SynastryAspectScores {
  overall: number;
  love: number;
  emotional: number;
  communication: number;
}

export interface SynastryAspect {
  slug: string;
  planet1: string;
  planet2: string;
  aspect: string;
  aspectType: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
  scores: SynastryAspectScores;
  overview: string;
  energyDynamic: string;
  emotionalConnection: string;
  romanticAttraction: string;
  challenges: string[];
  strengths: string[];
  communication: string;
  growthPotential: string;
  practicalAdvice: string[];
  keywords: string[];
  faq: SynastryAspectFAQ[];
}

export interface AspectTypeInfo {
  symbol: string;
  degrees: number;
  orb: number;
  nature: 'intense' | 'harmonious' | 'challenging';
  description: string;
}

export const aspectTypes = synastryData.aspectTypes as Record<
  string,
  AspectTypeInfo
>;

// Transform JSON data into typed array with slugs
export const synastryAspects: SynastryAspect[] = Object.entries(
  synastryData.aspects,
).map(([slug, data]) => ({
  slug,
  ...(data as Omit<SynastryAspect, 'slug'>),
}));

/**
 * Get a synastry aspect by slug
 */
export function getSynastryAspect(slug: string): SynastryAspect | undefined {
  return synastryAspects.find((aspect) => aspect.slug === slug);
}

/**
 * Get all synastry aspect slugs for static generation
 */
export function getAllSynastryAspectSlugs(): string[] {
  return synastryAspects.map((aspect) => aspect.slug);
}
