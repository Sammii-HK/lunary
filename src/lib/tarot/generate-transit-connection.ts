/**
 * Transit Connection Generator for Tarot Cards
 *
 * Generates meaningful connections between tarot cards and current transits.
 * Produces both compact (one sentence) and in-depth (paragraph) interpretations.
 */

import type { BirthChartSnapshot, TransitRecord } from '@/lib/ai/types';
import type { TransitAspect } from '@/features/horoscope/transitDetails';
import {
  getCardAffinity,
  type CardTransitAffinity,
  type AspectType,
} from './card-transit-mappings';

export type TransitConnection = {
  compact: string; // One sentence for dashboard
  inDepth: string; // Full paragraph(s) for tarot page/spreads
};

/**
 * Finds relevant transits for a given tarot card
 */
function findRelevantTransits(
  cardName: string,
  transits: TransitAspect[],
  birthChart: BirthChartSnapshot
): TransitAspect[] {
  const affinity = getCardAffinity(cardName);
  if (!affinity || !transits || transits.length === 0) {
    return [];
  }

  // Score and filter transits based on card affinity
  const scoredTransits = transits
    .map((transit) => {
      let score = 0;

      // Check if transit planet matches card's planetary affinity
      if (affinity.planets.some((p) => p.toLowerCase() === transit.transitPlanet.toLowerCase())) {
        score += 3;
      }

      // Check if aspect type matches card's preferred aspects
      const aspectTypeNormalized = transit.aspectType.toLowerCase();
      if (
        affinity.aspectTypes.includes('any' as AspectType) ||
        affinity.aspectTypes.some((a) => a === aspectTypeNormalized)
      ) {
        score += 2;
      }

      // Bonus for tight orbs (stronger transits)
      if (transit.orbDegrees <= 2) {
        score += 2;
      } else if (transit.orbDegrees <= 4) {
        score += 1;
      }

      // Apply card weight
      score = score * (affinity.weight || 5);

      return { transit, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  // Return top 3 most relevant transits
  return scoredTransits.slice(0, 3).map((item) => item.transit);
}

/**
 * Format aspect name for readable output
 */
function formatAspectName(aspectType: string): string {
  const names: Record<string, string> = {
    conjunction: 'conjunct',
    sextile: 'sextile',
    trine: 'trine',
    square: 'square',
    opposition: 'opposite',
  };
  return names[aspectType.toLowerCase()] || aspectType;
}

/**
 * Get ordinal suffix for house numbers
 */
function getOrdinalSuffix(n: number): string {
  if (n === 11 || n === 12 || n === 13) return 'th';
  const lastDigit = n % 10;
  if (lastDigit === 1) return 'st';
  if (lastDigit === 2) return 'nd';
  if (lastDigit === 3) return 'rd';
  return 'th';
}

/**
 * Generates compact connection (one sentence)
 */
function generateCompactConnection(
  cardName: string,
  transit: TransitAspect
): string {
  const aspectName = formatAspectName(transit.aspectType);
  const cardAffinity = getCardAffinity(cardName);
  const theme = cardAffinity?.themes[0]?.replace(/-/g, ' ') || 'awareness';

  // Template: "Today this theme connects to [Transit] [aspect] your [Natal Planet]—[brief insight]."
  return `Today this theme connects to ${transit.transitPlanet} ${aspectName} your ${transit.natalPlanet}, highlighting ${theme}.`;
}

/**
 * Get aspect quality description
 */
function getAspectQuality(aspectType: string): string {
  const qualities: Record<string, string> = {
    conjunction:
      'This conjunction intensifies and merges these energies, creating a powerful focus point.',
    trine:
      'This harmonious trine allows these energies to flow naturally together, offering ease and support.',
    sextile:
      'This supportive sextile opens doors for integration when you take conscious action.',
    square:
      'This dynamic square creates productive tension that motivates growth and breakthrough.',
    opposition:
      'This opposition illuminates both sides of this dynamic, calling for balance and integration.',
  };
  return (
    qualities[aspectType.toLowerCase()] ||
    'This aspect creates a meaningful connection between these areas of your life.'
  );
}

/**
 * Get house themes
 */
const HOUSE_THEMES: Record<number, string> = {
  1: 'identity, appearance, and how you meet the world',
  2: 'resources, money, and self-worth',
  3: 'communication, local environment, and learning',
  4: 'home, roots, and emotional foundations',
  5: 'creativity, romance, and joy',
  6: 'work, routines, and health',
  7: 'partnerships, contracts, and long-term commitments',
  8: 'intimacy, shared resources, and transformation',
  9: 'beliefs, travel, and higher learning',
  10: 'career, public life, and reputation',
  11: 'friends, networks, and collective projects',
  12: 'rest, the unconscious, and spiritual retreat',
};

/**
 * Generate card-specific insight based on themes
 */
function generateCardInsight(cardName: string, transit: TransitAspect): string {
  const affinity = getCardAffinity(cardName);
  if (!affinity) {
    return `${cardName}'s message becomes especially relevant through this transit.`;
  }

  const primaryTheme = affinity.themes[0]?.replace(/-/g, ' ') || 'awareness';
  const aspectType = transit.aspectType.toLowerCase();

  // Customize insight based on aspect quality
  if (aspectType === 'square' || aspectType === 'opposition') {
    return `${cardName}'s themes of ${primaryTheme} meet productive challenge, pushing you toward clarity and action.`;
  } else if (aspectType === 'trine' || aspectType === 'sextile') {
    return `${cardName}'s message of ${primaryTheme} flows naturally with this transit's supportive energy.`;
  } else {
    return `${cardName}'s core themes of ${primaryTheme} merge powerfully with this planetary energy.`;
  }
}

/**
 * Generates in-depth connection (full paragraph)
 */
function generateInDepthConnection(
  cardName: string,
  transits: TransitAspect[],
  birthChart: BirthChartSnapshot
): string {
  if (transits.length === 0) {
    return '';
  }

  const primaryTransit = transits[0];
  const aspectName = formatAspectName(primaryTransit.aspectType);

  // Build opening sentence with specific degrees
  let opening = `With ${primaryTransit.transitPlanet} at ${primaryTransit.transitDegree} ${aspectName} your natal ${primaryTransit.natalPlanet} at ${primaryTransit.natalDegree}`;

  // Add orb information if tight
  if (primaryTransit.orbDegrees <= 2) {
    const orbRounded = Math.round(primaryTransit.orbDegrees * 10) / 10;
    opening += ` (${orbRounded}° orb)`;
  }

  opening += `, ${cardName}'s message takes on particular meaning in your chart today.`;

  // Add aspect quality
  const aspectQuality = getAspectQuality(primaryTransit.aspectType);

  // Add house activation if available
  let houseInfo = '';
  if (primaryTransit.house) {
    const houseTheme =
      HOUSE_THEMES[primaryTransit.house] || 'this area of your life';
    houseInfo = ` Your ${primaryTransit.house}${getOrdinalSuffix(primaryTransit.house)} house is activated, highlighting ${houseTheme}.`;
  }

  // Add card-specific insight
  const cardInsight = generateCardInsight(cardName, primaryTransit);

  // Add additional transits if multiple
  let additionalInfo = '';
  if (transits.length > 1) {
    const additionalTransit = transits[1];
    additionalInfo = ` Additionally, ${additionalTransit.transitPlanet} ${formatAspectName(additionalTransit.aspectType)} your ${additionalTransit.natalPlanet}, adding another layer of resonance to this reading.`;
  }

  // Combine all parts
  return `${opening} ${aspectQuality}${houseInfo} ${cardInsight}${additionalInfo}`;
}

/**
 * Main function: Generate tarot transit connection
 *
 * Returns null if no relevant transits are found
 */
export async function generateTarotTransitConnection(
  cardName: string,
  birthChart: BirthChartSnapshot | null,
  transits: TransitAspect[]
): Promise<TransitConnection | null> {
  // Require birth chart for personalized connections
  if (!birthChart || !transits || transits.length === 0) {
    return null;
  }

  // Find relevant transits for this card
  const relevantTransits = findRelevantTransits(cardName, transits, birthChart);

  if (relevantTransits.length === 0) {
    return null; // No connection if no relevant transits
  }

  // Generate both versions
  const compact = generateCompactConnection(cardName, relevantTransits[0]);
  const inDepth = generateInDepthConnection(
    cardName,
    relevantTransits,
    birthChart
  );

  return { compact, inDepth };
}
