import {
  SearchLunarEclipse,
  SearchGlobalSolarEclipse,
  NextLunarEclipse,
  NextGlobalSolarEclipse,
  EclipseKind,
} from 'astronomy-engine';
import type { BirthChartData } from './birthChart';
import dayjs from 'dayjs';

export type EclipseEvent = {
  type: 'solar' | 'lunar';
  kind: string; // 'partial', 'total', 'annular', 'penumbral'
  date: Date;
  degree: number; // Zodiac degree where eclipse occurs
  sign: string; // Zodiac sign where eclipse occurs
  description: string;
  daysAway: number;
  isUpcoming: boolean; // Within next 6 months
};

export type EclipseRelevance = {
  eclipse: EclipseEvent;
  isRelevant: boolean;
  aspectedPlanets: Array<{
    planet: string;
    natalDegree: number;
    aspect: string; // 'conjunction', 'opposition', etc.
    orb: number; // Degrees of separation
  }>;
  affectedHouses: number[];
  significance: string;
};

const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

/**
 * Convert ecliptic longitude (0-360°) to zodiac sign and degree
 */
function eclipticToZodiac(eclipticLongitude: number): {
  sign: string;
  degree: number;
} {
  const signIndex = Math.floor(eclipticLongitude / 30);
  const degree = eclipticLongitude % 30;
  const sign = ZODIAC_SIGNS[signIndex];
  return { sign, degree };
}

/**
 * Get upcoming eclipses within the next 6 months
 * Uses astronomy-engine for accurate eclipse calculations
 */
export function getUpcomingEclipses(
  startDate: Date = new Date(),
  months: number = 6,
): EclipseEvent[] {
  const eclipses: EclipseEvent[] = [];
  const endDate = dayjs(startDate).add(months, 'month').toDate();

  try {
    // Search for solar eclipses
    let solarEclipse = SearchGlobalSolarEclipse(startDate);
    while (solarEclipse && dayjs(solarEclipse.peak.date).isBefore(endDate)) {
      // For solar eclipses, we need to estimate the zodiac position
      // Use a simplified approach for now (Phase 3 simplified)
      const estimatedDegree = 0; // Placeholder
      const estimatedSign = 'Aries'; // Placeholder
      const peakDate = solarEclipse.peak.date;
      const daysAway = dayjs(peakDate).diff(dayjs(startDate), 'day');

      eclipses.push({
        type: 'solar',
        kind: getEclipseKindDescription(solarEclipse.kind),
        date: peakDate,
        degree: estimatedDegree,
        sign: estimatedSign,
        description: `${getEclipseKindDescription(solarEclipse.kind)} Solar Eclipse`,
        daysAway,
        isUpcoming: daysAway >= 0 && daysAway <= months * 30,
      });

      solarEclipse = NextGlobalSolarEclipse(solarEclipse.peak.date);
    }

    // Search for lunar eclipses
    let lunarEclipse = SearchLunarEclipse(startDate);
    while (lunarEclipse && dayjs(lunarEclipse.peak.date).isBefore(endDate)) {
      // For lunar eclipses, estimate zodiac position (simplified for Phase 3)
      const estimatedDegree = 0; // Placeholder
      const estimatedSign = 'Aries'; // Placeholder
      const peakDate = lunarEclipse.peak.date;
      const daysAway = dayjs(peakDate).diff(dayjs(startDate), 'day');

      eclipses.push({
        type: 'lunar',
        kind: getEclipseKindDescription(lunarEclipse.kind),
        date: peakDate,
        degree: estimatedDegree,
        sign: estimatedSign,
        description: `${getEclipseKindDescription(lunarEclipse.kind)} Lunar Eclipse`,
        daysAway,
        isUpcoming: daysAway >= 0 && daysAway <= months * 30,
      });

      lunarEclipse = NextLunarEclipse(lunarEclipse.peak.date);
    }
  } catch (error) {
    console.error('[Eclipse Tracker] Failed to calculate eclipses:', error);
  }

  // Sort by date
  return eclipses.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Convert eclipse kind enum to human-readable description
 */
function getEclipseKindDescription(kind: EclipseKind): string {
  switch (kind) {
    case EclipseKind.Penumbral:
      return 'Penumbral';
    case EclipseKind.Partial:
      return 'Partial';
    case EclipseKind.Total:
      return 'Total';
    case EclipseKind.Annular:
      return 'Annular';
    default:
      return 'Unknown';
  }
}

/**
 * Calculate angular distance between two zodiac degrees
 */
function calculateOrb(degree1: number, degree2: number): number {
  const diff = Math.abs(degree1 - degree2);
  return Math.min(diff, 360 - diff);
}

/**
 * Check if eclipse aspects any natal planets within orb
 * Tight orb for eclipses: ±3° for conjunction/opposition
 */
export function checkEclipseRelevance(
  eclipse: EclipseEvent,
  birthChart: BirthChartData[],
): EclipseRelevance {
  const aspectedPlanets: Array<{
    planet: string;
    natalDegree: number;
    aspect: string;
    orb: number;
  }> = [];
  const affectedHouses: number[] = [];

  // Convert eclipse position to absolute degree (0-360)
  const eclipseSignIndex = ZODIAC_SIGNS.indexOf(eclipse.sign);
  const eclipseAbsoluteDegree = eclipseSignIndex * 30 + eclipse.degree;

  // Check each natal planet
  birthChart.forEach((placement) => {
    const signIndex = ZODIAC_SIGNS.indexOf(placement.sign);
    const natalAbsoluteDegree = signIndex * 30 + placement.degree;
    const orb = calculateOrb(eclipseAbsoluteDegree, natalAbsoluteDegree);

    // Check for conjunction (±3°)
    if (orb <= 3) {
      aspectedPlanets.push({
        planet: placement.body,
        natalDegree: placement.degree,
        aspect: 'conjunction',
        orb,
      });
      if (placement.house) {
        affectedHouses.push(placement.house);
      }
    }

    // Check for opposition (180° ±3°)
    const oppositionOrb = Math.abs(orb - 180);
    if (oppositionOrb <= 3) {
      aspectedPlanets.push({
        planet: placement.body,
        natalDegree: placement.degree,
        aspect: 'opposition',
        orb: oppositionOrb,
      });
      if (placement.house) {
        // Eclipse activates both the planet's house and the opposite house
        const oppositeHouse = ((placement.house + 5) % 12) + 1;
        affectedHouses.push(placement.house, oppositeHouse);
      }
    }
  });

  // Eclipse is relevant if it aspects any natal planet or angle
  const isRelevant = aspectedPlanets.length > 0;

  // Generate significance description
  let significance = '';
  if (isRelevant) {
    const planetNames = aspectedPlanets.map((ap) => ap.planet).join(', ');
    significance = `This eclipse ${aspectedPlanets[0].aspect}s your natal ${planetNames}`;
    if (affectedHouses.length > 0) {
      const uniqueHouses = [...new Set(affectedHouses)].sort((a, b) => a - b);
      significance += `, activating house${uniqueHouses.length > 1 ? 's' : ''} ${uniqueHouses.join(', ')}`;
    }
  } else {
    significance = `This eclipse in ${eclipse.sign} may have a general influence but doesn't closely aspect your natal planets`;
  }

  return {
    eclipse,
    isRelevant,
    aspectedPlanets,
    affectedHouses,
    significance,
  };
}

/**
 * Get all relevant eclipses for a user's birth chart
 * Returns only eclipses that aspect natal planets within tight orb
 */
export function getRelevantEclipses(
  birthChart: BirthChartData[],
  startDate: Date = new Date(),
  months: number = 6,
): EclipseRelevance[] {
  const upcomingEclipses = getUpcomingEclipses(startDate, months);
  const relevantEclipses: EclipseRelevance[] = [];

  upcomingEclipses.forEach((eclipse) => {
    const relevance = checkEclipseRelevance(eclipse, birthChart);
    if (relevance.isRelevant) {
      relevantEclipses.push(relevance);
    }
  });

  return relevantEclipses;
}

/**
 * Get human-readable eclipse forecast for a user
 */
export function generateEclipseForecast(
  relevantEclipses: EclipseRelevance[],
): string {
  if (relevantEclipses.length === 0) {
    return 'No significant eclipses affecting your chart in the next 6 months.';
  }

  const parts: string[] = [];
  relevantEclipses.slice(0, 3).forEach((rel, index) => {
    const { eclipse, aspectedPlanets, affectedHouses } = rel;
    const dateStr = dayjs(eclipse.date).format('MMM D, YYYY');
    const daysAwayStr =
      eclipse.daysAway === 0
        ? 'today'
        : eclipse.daysAway === 1
          ? 'tomorrow'
          : `in ${eclipse.daysAway} days`;

    const planetNames = aspectedPlanets.map((ap) => ap.planet).join(' & ');
    const aspect = aspectedPlanets[0].aspect;

    parts.push(
      `${index + 1}. ${eclipse.description} on ${dateStr} (${daysAwayStr}) ${aspect}s your ${planetNames}`,
    );
  });

  return parts.join('\n');
}
