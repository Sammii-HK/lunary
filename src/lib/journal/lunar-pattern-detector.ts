/**
 * Lunar Pattern Detection (Phase 2 - Simplified)
 *
 * Future phases will implement:
 * - Cross-reference journal entries with moon phases
 * - Track mood/activity patterns by moon phase and sign
 * - Identify which moon phases correlate with high energy, creativity, introspection
 * - Detect moon-sensitive users (strong lunar influence in natal chart)
 */

import type { BirthChartData } from '../../../utils/astrology/birthChart';

export type LunarCyclePattern = {
  type: 'moon_phase_sensitivity' | 'moon_sign_pattern';
  moonPhase?: string; // 'new', 'waxing_crescent', 'first_quarter', etc.
  moonSign?: string;
  activityType: string; // 'high_energy', 'creative', 'introspective', 'emotional'
  occurrences: number;
  description: string;
  confidence: number;
};

/**
 * Detect if user has strong lunar sensitivity based on natal chart
 * High sensitivity = Moon in angular houses (1, 4, 7, 10) or prominent aspects
 */
export function detectLunarSensitivity(
  birthChart: BirthChartData[],
): LunarCyclePattern | null {
  const moonPlacement = birthChart.find((p) => p.planet === 'Moon');
  if (!moonPlacement) return null;

  const angularHouses = [1, 4, 7, 10];
  const isAngular = moonPlacement.house
    ? angularHouses.includes(moonPlacement.house)
    : false;

  if (isAngular) {
    return {
      type: 'moon_phase_sensitivity',
      activityType: 'lunar_sensitive',
      occurrences: 1,
      description: `Moon in House ${moonPlacement.house} suggests strong lunar sensitivity. You may notice emotional shifts with moon phases.`,
      confidence: 0.8,
    };
  }

  return null;
}

/**
 * Future implementation: Analyze journal entries to detect moon phase patterns
 * This will require:
 * 1. Fetching journal entries with timestamps
 * 2. Calculating moon phase for each entry
 * 3. Analyzing sentiment, keywords, mood tags
 * 4. Finding correlations (e.g., "user journals more during full moons")
 *
 * For now, returns empty array (placeholder)
 */
export async function detectLunarCyclePatterns(
  userId: string,
  daysBack: number = 90,
): Promise<LunarCyclePattern[]> {
  // Placeholder for future implementation
  // Will analyze journal entries and correlate with moon phases
  return [];
}
