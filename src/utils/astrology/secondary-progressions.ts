/**
 * Secondary Progressions Calculation
 *
 * Formula: 1 day after birth = 1 year of life
 *
 * Example: If someone is 25 years old and was born Jan 1, 2000:
 * - Look at the chart for Jan 26, 2000 (25 days after birth)
 * - That represents their progressed positions at age 25
 */

import { BirthChartPlacement } from '@/context/UserContext';

export interface ProgressedChart extends BirthChartPlacement {
  natalPosition?: number; // eclipticLongitude from natal, for comparison
  movement?: number; // degrees moved since birth
}

/**
 * Calculate the age in days given a birth date and target date
 */
export function getAgeDays(birthDate: string, targetDate: string): number {
  const birth = new Date(birthDate);
  const target = new Date(targetDate);
  const diffTime = target.getTime() - birth.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Calculate the progressed date for a given age
 *
 * Secondary progressions use the formula: 1 day after birth = 1 year of life
 * So to get the progressed chart at age N, we look at the chart from N days after birth
 */
export function getProgressedDate(birthDate: string, ageYears: number): Date {
  const birth = new Date(birthDate);
  const progressed = new Date(birth);
  progressed.setDate(progressed.getDate() + ageYears);
  return progressed;
}

/**
 * Format a date for API calls (YYYY-MM-DD)
 */
export function formatProgressedDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate approximate age based on birth date and today
 */
export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();

  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Calculate the current progressed date for someone
 * This is the chart position at their current age
 */
export function getCurrentProgressedDate(birthDate: string): Date {
  const age = calculateAge(birthDate);
  return getProgressedDate(birthDate, age);
}

/**
 * Enhance progressed chart placements with natal comparison data
 */
export function enhanceProgressedChart(
  progressedChart: BirthChartPlacement[],
  natalChart: BirthChartPlacement[],
): ProgressedChart[] {
  return progressedChart.map((progressed) => {
    const natal = natalChart.find((n) => n.body === progressed.body);

    let movement = 0;
    if (natal) {
      // Calculate the degrees moved (accounting for zodiac wrap-around)
      let diff = progressed.eclipticLongitude - natal.eclipticLongitude;

      // Normalize to -180 to 180 range for shortest path
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;

      movement = diff;
    }

    return {
      ...progressed,
      natalPosition: natal?.eclipticLongitude,
      movement,
    };
  });
}

/**
 * Identify major progressions (planets changing signs)
 * These represent significant life chapter shifts
 */
export function getMajorProgressions(
  natalChart: BirthChartPlacement[],
  progressedChart: BirthChartPlacement[],
): Array<{
  body: string;
  natalSign: string;
  progressedSign: string;
  movement: number;
}> {
  return progressedChart
    .map((prog) => {
      const natal = natalChart.find((n) => n.body === prog.body);
      if (!natal || natal.sign === prog.sign) return null;

      const diff = prog.eclipticLongitude - natal.eclipticLongitude;
      let movement = diff;
      if (movement > 180) movement -= 360;
      if (movement < -180) movement += 360;

      return {
        body: prog.body,
        natalSign: natal.sign,
        progressedSign: prog.sign,
        movement,
      };
    })
    .filter(Boolean) as Array<{
    body: string;
    natalSign: string;
    progressedSign: string;
    movement: number;
  }>;
}

/**
 * Identify key bodies for progression tracking
 * Moon moves ~13° per year (sign change every ~2.5 years)
 * This is the primary indicator in secondary progressions
 */
export function getProgressionFocus(
  ageYears: number,
): 'moon' | 'sun' | 'angles' | 'general' {
  const moonCycle = ageYears % 30; // Approximate zodiac cycle

  // Every 2.5 years, Progressed Moon changes signs (major phase shift)
  if (moonCycle % 2.5 < 0.5 || moonCycle % 2.5 > 2) {
    return 'moon';
  }

  // Every 30 years, Progressed Sun changes signs
  if (ageYears % 30 < 2 || ageYears % 30 > 28) {
    return 'sun';
  }

  // Always important to track angles (Ascendant, Midheaven)
  return 'angles';
}
