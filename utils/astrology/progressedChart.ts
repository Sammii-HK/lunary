import { getRealPlanetaryPositions } from './astronomical-data';
import dayjs from 'dayjs';

export type ProgressedChartData = {
  progressedSun: {
    sign: string;
    degree: number;
    minute: number;
  };
  progressedMoon: {
    sign: string;
    degree: number;
    minute: number;
    moonPhaseInCycle: string; // Description of where Moon is in progressed cycle
  };
  progressedMercury?: {
    sign: string;
    degree: number;
  };
  progressedVenus?: {
    sign: string;
    degree: number;
  };
  progressedMars?: {
    sign: string;
    degree: number;
  };
  progressionDate: Date; // The actual date used for progression calculation
  yearsSinceBirth: number;
  description: string;
};

/**
 * Calculate secondary progressions for a birth chart
 *
 * Secondary Progressions: 1 day after birth = 1 year of life
 * - Progressed Sun moves ~1° per year (changes sign every ~30 years)
 * - Progressed Moon moves ~1° per month (changes sign every ~2.5 years, completes cycle in ~27-28 years)
 * - Personal planets (Mercury, Venus, Mars) can change signs during lifetime
 *
 * This uses the EXISTING optimized getRealPlanetaryPositions() function
 * which already has variable TTL caching (Moon: 15min, Sun: 30min, etc.)
 */
export async function calculateProgressedChart(
  birthDate: Date,
  currentDate: Date = new Date(),
): Promise<ProgressedChartData> {
  // Calculate how many years have passed since birth
  const birth = dayjs(birthDate);
  const current = dayjs(currentDate);
  const yearsSinceBirth = current.diff(birth, 'year', true); // Fractional years

  // Secondary Progressions: Add yearsSinceBirth as DAYS to birth date
  // 1 year of life = 1 day after birth
  const progressionDate = birth.add(yearsSinceBirth, 'day').toDate();

  // Use existing optimized planetary position function
  // This already has smart caching built-in (Moon: 15min, Sun: 30min, etc.)
  const progressedPositions = await getRealPlanetaryPositions(progressionDate);

  // Extract progressed Sun
  const progressedSun = {
    sign: progressedPositions.Sun.sign,
    degree: progressedPositions.Sun.degree,
    minute: Math.floor((progressedPositions.Sun.degree % 1) * 60),
  };

  // Extract progressed Moon
  const progressedMoon = {
    sign: progressedPositions.Moon.sign,
    degree: progressedPositions.Moon.degree,
    minute: Math.floor((progressedPositions.Moon.degree % 1) * 60),
    moonPhaseInCycle: describeMoonProgressionCycle(yearsSinceBirth),
  };

  // Extract progressed personal planets
  const progressedMercury = progressedPositions.Mercury
    ? {
        sign: progressedPositions.Mercury.sign,
        degree: progressedPositions.Mercury.degree,
      }
    : undefined;

  const progressedVenus = progressedPositions.Venus
    ? {
        sign: progressedPositions.Venus.sign,
        degree: progressedPositions.Venus.degree,
      }
    : undefined;

  const progressedMars = progressedPositions.Mars
    ? {
        sign: progressedPositions.Mars.sign,
        degree: progressedPositions.Mars.degree,
      }
    : undefined;

  // Generate description
  const description = generateProgressionDescription(
    progressedSun,
    progressedMoon,
    yearsSinceBirth,
  );

  return {
    progressedSun,
    progressedMoon,
    progressedMercury,
    progressedVenus,
    progressedMars,
    progressionDate,
    yearsSinceBirth,
    description,
  };
}

/**
 * Describe where the progressed Moon is in its ~27-28 year cycle
 */
function describeMoonProgressionCycle(yearsSinceBirth: number): string {
  const cycleLength = 27.3; // Progressed Moon completes cycle in ~27-28 years
  const cyclePosition = yearsSinceBirth % cycleLength;

  if (cyclePosition < 7) {
    return 'First Quarter of Cycle (ages 0-7, 27-34, 54-61, etc.) - New beginnings, planting seeds';
  } else if (cyclePosition < 14) {
    return 'Second Quarter of Cycle (ages 7-14, 34-41, 61-68, etc.) - Growth, building, expansion';
  } else if (cyclePosition < 21) {
    return 'Third Quarter of Cycle (ages 14-21, 41-48, 68-75, etc.) - Maturity, harvest, sharing';
  } else {
    return 'Fourth Quarter of Cycle (ages 21-27, 48-54, 75-82, etc.) - Integration, reflection, closure';
  }
}

/**
 * Generate human-readable description of progressions
 */
function generateProgressionDescription(
  progressedSun: { sign: string; degree: number },
  progressedMoon: { sign: string; degree: number },
  yearsSinceBirth: number,
): string {
  const parts: string[] = [];

  parts.push(
    `Progressed Sun in ${progressedSun.sign} at ${Math.floor(progressedSun.degree)}°`,
  );
  parts.push(
    `Progressed Moon in ${progressedMoon.sign} at ${Math.floor(progressedMoon.degree)}°`,
  );

  // Note significant progressed Moon phase
  const cyclePosition = yearsSinceBirth % 27.3;
  if (cyclePosition < 1 || cyclePosition > 26) {
    parts.push('(Progressed Moon near new cycle - fresh emotional start)');
  } else if (Math.abs(cyclePosition - 13.65) < 1) {
    parts.push('(Progressed Moon at cycle midpoint - emotional culmination)');
  }

  return parts.join(' • ');
}

/**
 * Check if progressed Moon has changed sign recently (within last year)
 * Progressed Moon changes sign every ~2.5 years - a significant shift in emotional focus
 */
export function hasProgressedMoonChangedSign(
  birthDate: Date,
  currentDate: Date = new Date(),
): { changed: boolean; whenChanged?: Date; newSign?: string } {
  const oneYearAgo = dayjs(currentDate).subtract(1, 'year').toDate();

  // This is a simplified check - full implementation would calculate
  // exact progressed Moon positions for current and 1 year ago
  // For now, return placeholder
  return { changed: false };
}

/**
 * Calculate when progressed Sun will change sign
 * Progressed Sun takes ~30 years to change sign (major life theme shift)
 */
export function whenWillProgressedSunChangeSign(
  birthDate: Date,
  currentProgressedSun: { sign: string; degree: number },
): { yearsUntilChange: number; estimatedDate: Date; nextSign: string } {
  // Progressed Sun moves ~1° per year
  // Need to reach 30° to change sign
  const degreesRemaining = 30 - currentProgressedSun.degree;
  const yearsUntilChange = degreesRemaining;

  const estimatedDate = dayjs(new Date())
    .add(yearsUntilChange, 'year')
    .toDate();

  // Calculate next sign
  const zodiacOrder = [
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
  const currentIndex = zodiacOrder.indexOf(currentProgressedSun.sign);
  const nextSign = zodiacOrder[(currentIndex + 1) % 12];

  return {
    yearsUntilChange,
    estimatedDate,
    nextSign,
  };
}
