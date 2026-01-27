/**
 * Get Personalized Tarot Card
 *
 * Uses chart-based seeding if available, falls back to name+birthday method
 */

import type { BirthChartPlacement } from '@/context/UserContext';
import type { MoonSnapshot } from '@/lib/ai/types';
import { getDailyCardSeed, seedToIndex } from './chart-seeding';
import { getTarotCard } from '../../../utils/tarot/tarot';
import { TAROT_DECK, type TarotDeckCard } from '@/utils/tarot/deck';

/**
 * Convert BirthChartPlacement[] to BirthChartSnapshot
 */
function convertToBirthChartSnapshot(
  birthChart: BirthChartPlacement[] | undefined,
  userBirthday?: string,
): any | null {
  if (!birthChart || birthChart.length === 0 || !userBirthday) {
    return null;
  }

  return {
    date: userBirthday,
    time: '12:00', // We don't have exact time, but this is just for seeding
    lat: 0,
    lon: 0,
    placements: birthChart.map((p: any) => ({
      planet: p.planet || p.body,
      sign: p.sign,
      house: p.house,
      degree: p.degree,
    })),
  };
}

/**
 * Create MoonSnapshot from current moon data
 */
function createMoonSnapshot(
  moonSign: string | undefined,
  moonPhase: string | undefined,
  moonIllumination: number,
): MoonSnapshot | null {
  if (!moonSign || !moonPhase) {
    return null;
  }

  return {
    phase: moonPhase,
    sign: moonSign,
    emoji: '', // Not needed for seeding
    illumination: moonIllumination / 100,
  };
}

/**
 * Get personalized daily tarot card
 *
 * Uses chart-based seeding if birth chart is available,
 * otherwise falls back to the original name+birthday method
 */
export function getPersonalizedTarotCard(
  currentDate: string,
  birthChart: BirthChartPlacement[] | undefined,
  moonSign: string | undefined,
  moonPhase: string | undefined,
  moonIllumination: number,
  userName?: string,
  userBirthday?: string,
): TarotDeckCard | any {
  // Try chart-based seeding if we have birth chart data
  if (birthChart && birthChart.length > 0 && userBirthday) {
    const chartSnapshot = convertToBirthChartSnapshot(birthChart, userBirthday);
    const moonSnapshot = createMoonSnapshot(
      moonSign,
      moonPhase,
      moonIllumination,
    );

    if (chartSnapshot) {
      const seed = getDailyCardSeed(chartSnapshot, moonSnapshot);
      const index = seedToIndex(seed, TAROT_DECK.length);
      return TAROT_DECK[index];
    }
  }

  // Fallback to original method (name + birthday)
  return getTarotCard(`daily-${currentDate}`, userName, userBirthday);
}
