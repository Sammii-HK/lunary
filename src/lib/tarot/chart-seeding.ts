/**
 * Chart-based tarot seeding utilities
 *
 * Uses natal chart positions + transiting Moon to generate personalized,
 * stable daily cards and chart-influenced spread pulls.
 */

import type { BirthChartSnapshot, MoonSnapshot } from '@/lib/ai/types';

/**
 * Simple hash function for string to number conversion
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Extracts a stable natal signature from birth chart
 * Uses Sun, Moon, and Ascendant positions for personalization
 */
function getNatalSignature(birthChart: BirthChartSnapshot): string {
  const sun = birthChart.placements.find((p) => p.planet === 'Sun');
  const moon = birthChart.placements.find((p) => p.planet === 'Moon');
  const ascendant = birthChart.placements.find((p) => p.planet === 'Ascendant');

  const sunPos = sun ? `${sun.sign}${sun.degree.toFixed(2)}` : '';
  const moonPos = moon ? `${moon.sign}${moon.degree.toFixed(2)}` : '';
  const ascPos = ascendant
    ? `${ascendant.sign}${ascendant.degree.toFixed(2)}`
    : '';

  return `${sunPos}|${moonPos}|${ascPos}`;
}

/**
 * Formats Moon position for daily variation
 */
function getMoonPosition(moon: MoonSnapshot | null): string {
  if (!moon) return '';
  return `${moon.sign}`;
}

/**
 * Generates seed for daily tarot card
 *
 * Combines:
 * - Natal positions (for personalization)
 * - Transiting Moon position (for daily variation)
 * - Current date (for stability throughout the day)
 *
 * Result: Same card all day for same user, different cards on different days
 */
export function getDailyCardSeed(
  birthChart: BirthChartSnapshot | null,
  moon: MoonSnapshot | null,
): number {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  if (!birthChart) {
    // Fallback for users without birth chart
    return simpleHash(`daily-${today}-${getMoonPosition(moon)}`);
  }

  const natalSig = getNatalSignature(birthChart);
  const moonPos = getMoonPosition(moon);

  const seedString = `${natalSig}|${moonPos}|${today}`;
  return simpleHash(seedString);
}

/**
 * Generates seed for spread card pulls
 *
 * Combines:
 * - Natal positions (for chart influence)
 * - Spread ID (for spread uniqueness)
 * - Position index (for card position within spread)
 * - Timestamp (for uniqueness per pull)
 *
 * Result: Different cards each pull, but influenced by natal chart
 */
export function getSpreadCardSeed(
  birthChart: BirthChartSnapshot | null,
  spreadSlug: string,
  positionIndex: number,
  timestamp: number,
): number {
  if (!birthChart) {
    // Fallback for users without birth chart
    return simpleHash(`${spreadSlug}-${positionIndex}-${timestamp}`);
  }

  const natalSig = getNatalSignature(birthChart);
  const seedString = `${natalSig}|${spreadSlug}|${positionIndex}|${timestamp}`;

  return simpleHash(seedString);
}

/**
 * Normalizes seed to array index
 */
export function seedToIndex(seed: number, arrayLength: number): number {
  return Math.abs(seed) % arrayLength;
}
