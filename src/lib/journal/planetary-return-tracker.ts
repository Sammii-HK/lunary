import type { BirthChartData } from '../../../utils/astrology/birthChart';
import dayjs from 'dayjs';

export type PlanetaryReturn = {
  planet: string;
  returnType: 'exact' | 'approaching' | 'recent';
  proximityDays: number; // Days until/since exact return
  returnDate: Date | null; // Estimated exact return date
  isActive: boolean; // Within ±30 days of exact return
  phase: 'pre' | 'exact' | 'post'; // Before, during, or after return
  natalDegree: number;
  currentEstimate: string; // Human-readable estimate
};

// Orbital periods (in years)
const ORBITAL_PERIODS: Record<string, number> = {
  Sun: 1, // Solar return every year
  Moon: 0.0753, // ~27.3 days
  Mercury: 0.24,
  Venus: 0.62,
  Mars: 1.88,
  Jupiter: 11.86,
  Saturn: 29.46,
  Uranus: 84.01,
  Neptune: 164.79,
  Pluto: 248.09,
};

/**
 * Calculate the age of the person
 */
function calculateAge(birthDate: Date): number {
  const now = new Date();
  const birth = new Date(birthDate);
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Estimate proximity to next planetary return
 * Returns days until/since return (negative = past, positive = future)
 */
function estimateReturnProximity(
  planet: string,
  birthDate: Date,
  currentDate: Date,
): {
  proximityDays: number;
  returnDate: Date | null;
  phase: 'pre' | 'exact' | 'post';
} {
  const period = ORBITAL_PERIODS[planet];
  if (!period) {
    return { proximityDays: 999, returnDate: null, phase: 'pre' };
  }

  const age = calculateAge(birthDate);
  const yearsPerReturn = period;

  // Calculate how many complete returns have occurred
  const completedReturns = Math.floor(age / yearsPerReturn);

  // Calculate next return date
  const nextReturnAge = (completedReturns + 1) * yearsPerReturn;
  const lastReturnAge = completedReturns * yearsPerReturn;

  const birth = dayjs(birthDate);
  const nextReturn = birth.add(nextReturnAge, 'year');
  const lastReturn = birth.add(lastReturnAge, 'year');

  const now = dayjs(currentDate);
  const daysUntilNext = nextReturn.diff(now, 'day');
  const daysSinceLast = now.diff(lastReturn, 'day');

  // Determine which return is closer
  if (Math.abs(daysUntilNext) < Math.abs(daysSinceLast)) {
    // Next return is closer
    return {
      proximityDays: daysUntilNext,
      returnDate: nextReturn.toDate(),
      phase: daysUntilNext > 0 ? 'pre' : 'post',
    };
  } else {
    // Last return is closer
    return {
      proximityDays: -daysSinceLast,
      returnDate: lastReturn.toDate(),
      phase: daysSinceLast < 0 ? 'pre' : 'post',
    };
  }
}

/**
 * Calculate planetary returns for a given birth chart
 * Focuses on major returns: Solar (every year), Jupiter (~12 years), Saturn (~29 years)
 */
export function calculatePlanetaryReturns(
  birthChart: BirthChartData[],
  currentDate: Date,
  birthDate: Date,
): PlanetaryReturn[] {
  const returns: PlanetaryReturn[] = [];

  // Focus on major return planets
  const returnPlanets = ['Sun', 'Jupiter', 'Saturn'];

  returnPlanets.forEach((planet) => {
    const placement = birthChart.find((p) => p.body === planet);
    if (!placement) return;

    const { proximityDays, returnDate, phase } = estimateReturnProximity(
      planet,
      birthDate,
      currentDate,
    );

    // Returns are "active" within ±30 days of exact
    const isActive = Math.abs(proximityDays) <= 30;

    // Determine return type
    let returnType: 'exact' | 'approaching' | 'recent';
    if (Math.abs(proximityDays) <= 7) {
      returnType = 'exact';
    } else if (proximityDays > 0) {
      returnType = 'approaching';
    } else {
      returnType = 'recent';
    }

    // Human-readable estimate
    let currentEstimate: string;
    const absDays = Math.abs(proximityDays);
    if (absDays === 0) {
      currentEstimate = 'Today';
    } else if (absDays <= 7) {
      currentEstimate = `${absDays} day${absDays === 1 ? '' : 's'} ${proximityDays > 0 ? 'away' : 'ago'}`;
    } else if (absDays <= 30) {
      const weeks = Math.floor(absDays / 7);
      currentEstimate = `${weeks} week${weeks === 1 ? '' : 's'} ${proximityDays > 0 ? 'away' : 'ago'}`;
    } else {
      const months = Math.floor(absDays / 30);
      currentEstimate = `${months} month${months === 1 ? '' : 's'} ${proximityDays > 0 ? 'away' : 'ago'}`;
    }

    returns.push({
      planet,
      returnType,
      proximityDays,
      returnDate,
      isActive,
      phase,
      natalDegree: placement.degree,
      currentEstimate,
    });
  });

  return returns.filter((r) => r.isActive); // Only return active returns (within ±30 days)
}

/**
 * Get human-readable description of a planetary return
 */
export function describeReturn(planetaryReturn: PlanetaryReturn): string {
  const { planet, returnType, currentEstimate } = planetaryReturn;

  const descriptions: Record<string, string> = {
    Sun: 'Solar Return (your birthday)',
    Jupiter: 'Jupiter Return (expansion, growth, wisdom)',
    Saturn: 'Saturn Return (maturity, responsibility, lessons)',
  };

  const planetDesc = descriptions[planet] || `${planet} Return`;

  if (returnType === 'exact') {
    return `${planetDesc} is exact (${currentEstimate})`;
  } else if (returnType === 'approaching') {
    return `${planetDesc} approaching (${currentEstimate})`;
  } else {
    return `${planetDesc} recently passed (${currentEstimate})`;
  }
}
