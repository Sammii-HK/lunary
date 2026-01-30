/**
 * House Emphasis Tracker (Phase 2 - Simplified)
 *
 * Future phases will implement:
 * - Track which houses are activated by transits over time
 * - Cross-reference with journal entries to see which life areas get focus
 * - Identify user's most active houses (career, relationships, spirituality)
 * - Provide insights: "You journal most about career when Mars transits your 10th house"
 */

import type { BirthChartData } from '../../../utils/astrology/birthChart';

export type HouseEmphasisPattern = {
  type: 'house_activation';
  house: number;
  lifArea: string; // 'identity', 'finances', 'communication', etc.
  activationCount: number;
  description: string;
  confidence: number;
};

const HOUSE_MEANINGS: Record<number, string> = {
  1: 'identity/self',
  2: 'finances/values',
  3: 'communication/learning',
  4: 'home/family',
  5: 'creativity/romance',
  6: 'health/work',
  7: 'partnerships',
  8: 'transformation/intimacy',
  9: 'philosophy/travel',
  10: 'career/reputation',
  11: 'friends/community',
  12: 'spirituality/subconscious',
};

/**
 * Detect natal house emphasis based on planetary placements
 * Houses with 2+ planets are considered emphasized
 */
export function detectNatalHouseEmphasis(
  birthChart: BirthChartData[],
): HouseEmphasisPattern[] {
  const patterns: HouseEmphasisPattern[] = [];
  const houseCount: Record<number, number> = {};

  // Count planets in each house
  birthChart.forEach((placement) => {
    if (placement.house) {
      houseCount[placement.house] = (houseCount[placement.house] || 0) + 1;
    }
  });

  // Identify emphasized houses (2+ planets)
  Object.entries(houseCount).forEach(([house, count]) => {
    if (count >= 2) {
      const houseNum = parseInt(house);
      patterns.push({
        type: 'house_activation',
        house: houseNum,
        lifArea: HOUSE_MEANINGS[houseNum] || 'unknown',
        activationCount: count,
        description: `${count} planets in House ${houseNum} (${HOUSE_MEANINGS[houseNum]}) - this life area is emphasized in your chart`,
        confidence: 0.85,
      });
    }
  });

  return patterns;
}

/**
 * Future implementation: Track which houses get activated by transits over time
 * This will require:
 * 1. Storing transit history
 * 2. Cross-referencing with journal entries
 * 3. Identifying patterns (e.g., "User journals about relationships when 7th house is activated")
 *
 * For now, returns empty array (placeholder)
 */
export async function detectHouseEmphasisPatterns(
  userId: string,
  birthChart: BirthChartData[],
  daysBack: number = 90,
): Promise<HouseEmphasisPattern[]> {
  // Placeholder for future implementation
  // Will analyze transit history and journal patterns
  return [];
}
