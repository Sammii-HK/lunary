/**
 * Centralized helper for curated planetary placement data
 * Imports all planet placement JSON files and provides a unified interface
 */

import sunData from '@/data/sun-placements.json';
import moonData from '@/data/moon-placements.json';
import mercuryData from '@/data/mercury-placements.json';
import venusData from '@/data/venus-placements.json';
import marsData from '@/data/mars-placements.json';
import jupiterData from '@/data/jupiter-placements.json';
import saturnData from '@/data/saturn-placements.json';
import uranusData from '@/data/uranus-placements.json';
import neptuneData from '@/data/neptune-placements.json';
import plutoData from '@/data/pluto-placements.json';
import chironData from '@/data/chiron-placements.json';
import northNodeData from '@/data/north-node-placements.json';

// Type for any curated placement - fields are optional since different planets have different structures
export interface CuratedPlacement {
  sign: string;
  element?: string;
  modality?: string;
  ruler?: string;
  dignity?: string;
  coreTraits?: string[];
  strengths?: string[];
  challenges?: string[];
  famousExamples?: string;
  seoTitle?: string;
  seoDescription?: string;
  // Planet-specific fields
  [key: string]: unknown;
}

// Map of planet to their data files
const planetDataMap: Record<
  string,
  { placements: Record<string, CuratedPlacement> }
> = {
  sun: sunData as { placements: Record<string, CuratedPlacement> },
  moon: moonData as { placements: Record<string, CuratedPlacement> },
  mercury: mercuryData as { placements: Record<string, CuratedPlacement> },
  venus: venusData as { placements: Record<string, CuratedPlacement> },
  mars: marsData as { placements: Record<string, CuratedPlacement> },
  jupiter: jupiterData as { placements: Record<string, CuratedPlacement> },
  saturn: saturnData as { placements: Record<string, CuratedPlacement> },
  uranus: uranusData as { placements: Record<string, CuratedPlacement> },
  neptune: neptuneData as { placements: Record<string, CuratedPlacement> },
  pluto: plutoData as { placements: Record<string, CuratedPlacement> },
  chiron: chironData as { placements: Record<string, CuratedPlacement> },
  'north-node': northNodeData as {
    placements: Record<string, CuratedPlacement>;
  },
};

/**
 * Get curated placement data for any planet-sign combination
 * Returns null if no curated data exists for the planet
 */
export function getCuratedPlacement(slug: string): CuratedPlacement | null {
  // Extract planet from slug (e.g., "venus-in-aries" -> "venus")
  const match = slug.match(/^([a-z-]+)-in-([a-z]+)$/);
  if (!match) return null;

  const [, planet] = match;
  const data = planetDataMap[planet];

  if (!data) return null;

  return data.placements[slug] || null;
}

/**
 * Check if a planet has curated data available
 */
export function hasCuratedData(planet: string): boolean {
  return planet in planetDataMap;
}

/**
 * Get all available curated planets
 */
export function getCuratedPlanets(): string[] {
  return Object.keys(planetDataMap);
}

/**
 * Generate SEO title for a placement
 */
export function getPlacementSEOTitle(
  planet: string,
  sign: string,
  curated: CuratedPlacement | null,
): string {
  if (curated?.seoTitle) {
    return curated.seoTitle;
  }

  // Fallback SEO titles by planet
  const planetName =
    planet.charAt(0).toUpperCase() + planet.slice(1).replace('-', ' ');
  const signName = sign.charAt(0).toUpperCase() + sign.slice(1);

  const titleMap: Record<string, string> = {
    sun: `Sun in ${signName}: Personality, Identity & Life Purpose`,
    moon: `Moon in ${signName}: Emotions, Instincts & Inner Needs`,
    mercury: `Mercury in ${signName}: Communication & Thinking Style`,
    venus: `Venus in ${signName}: Love Style, Attraction & Values`,
    mars: `Mars in ${signName}: Drive, Passion & How You Take Action`,
    jupiter: `Jupiter in ${signName}: Growth, Luck & Expansion`,
    saturn: `Saturn in ${signName}: Discipline, Challenges & Life Lessons`,
    uranus: `Uranus in ${signName}: Innovation, Rebellion & Change`,
    neptune: `Neptune in ${signName}: Dreams, Intuition & Spirituality`,
    pluto: `Pluto in ${signName}: Transformation, Power & Rebirth`,
    chiron: `Chiron in ${signName}: Wounds, Healing & Wisdom`,
    'north-node': `North Node in ${signName}: Life Purpose & Soul Growth`,
  };

  return (
    titleMap[planet] ||
    `${planetName} in ${signName}: Meaning & Personality Traits`
  );
}

/**
 * Generate SEO description for a placement
 */
export function getPlacementSEODescription(
  planet: string,
  sign: string,
  curated: CuratedPlacement | null,
): string {
  if (curated?.seoDescription) {
    return curated.seoDescription;
  }

  // Fallback SEO descriptions by planet
  const planetName =
    planet.charAt(0).toUpperCase() + planet.slice(1).replace('-', ' ');
  const signName = sign.charAt(0).toUpperCase() + sign.slice(1);

  const descMap: Record<string, string> = {
    sun: `Discover Sun in ${signName} meaning in your birth chart. Learn about your core personality, strengths, challenges, and life purpose with this placement.`,
    moon: `Explore Moon in ${signName} meaning in astrology. Understand your emotional nature, instincts, inner needs, and what makes you feel secure.`,
    mercury: `Learn about Mercury in ${signName} in your natal chart. Discover your communication style, how you think and learn, and mental strengths.`,
    venus: `Discover Venus in ${signName} meaning for love and relationships. Learn about your attraction style, values, and how this placement shapes how you love.`,
    mars: `Explore Mars in ${signName} meaning in your birth chart. Understand your drive, passion, motivation, and how you take action to achieve goals.`,
    jupiter: `Learn about Jupiter in ${signName} in astrology. Discover how this placement affects your luck, growth, optimism, and areas of expansion.`,
    saturn: `Explore Saturn in ${signName} meaning in your chart. Understand your life lessons, challenges, areas of discipline, and path to mastery.`,
    uranus: `Discover Uranus in ${signName} traits and meaning. Learn how this placement shapes your uniqueness, innovation, and approach to change.`,
    neptune: `Learn about Neptune in ${signName} in your birth chart. Explore your spiritual nature, creative gifts, intuition, and dreams.`,
    pluto: `Explore Pluto in ${signName} meaning in astrology. Understand your transformative power, intensity, and path to personal rebirth.`,
    chiron: `Discover Chiron in ${signName} meaning in your chart. Learn about your deepest wounds, healing gifts, and path to wisdom.`,
    'north-node': `Learn about North Node in ${signName} and your life purpose. Discover your soul's direction, karmic lessons, and path of growth.`,
  };

  return (
    descMap[planet] ||
    `Discover ${planetName} in ${signName} meaning in your birth chart. Learn about personality traits, strengths, challenges, and how this placement affects you.`
  );
}
