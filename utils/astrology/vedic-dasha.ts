import dayjs from 'dayjs';

/**
 * Vimshottari Dasha System (Vedic Astrology)
 *
 * The Vimshottari dasha is a 120-year cycle divided into 9 planetary periods.
 * Each planet rules a specific number of years in a fixed sequence.
 * The cycle starts based on the Moon's position in the natal chart.
 *
 * Dasha periods (years):
 * - Ketu: 7 years
 * - Venus: 20 years
 * - Sun: 6 years
 * - Moon: 10 years
 * - Mars: 7 years
 * - Rahu: 18 years
 * - Jupiter: 16 years
 * - Saturn: 19 years
 * - Mercury: 17 years
 * Total: 120 years
 */

const VIMSHOTTARI_SEQUENCE = [
  'Ketu',
  'Venus',
  'Sun',
  'Moon',
  'Mars',
  'Rahu',
  'Jupiter',
  'Saturn',
  'Mercury',
];

const DASHA_PERIODS: Record<string, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

const TOTAL_CYCLE_YEARS = 120;
const LUNAR_NODES_IN_ZODIAC = 27; // nakshatra count
const DEGREES_PER_NAKSHATRA = 360 / 27;

/**
 * Represents a dasha period
 */
export interface DashaPeriod {
  planet: string;
  startDate: Date;
  endDate: Date;
  years: number;
  isActive: boolean;
  daysRemaining?: number;
  percentComplete?: number;
}

/**
 * Represents the current dasha state
 */
export interface CurrentDashaState {
  mahadasha: {
    planet: string;
    startDate: Date;
    endDate: Date;
    years: number;
    daysRemaining: number;
    percentComplete: number;
  };
  antardasha: DashaPeriod;
  upcoming: DashaPeriod[];
  currentAge: number;
  ageInCurrentDasha: number;
  transitionApproaching: boolean; // true if within 6 months of dasha change
}

/**
 * Calculate the position of a nakshatra (lunar mansion) from the Moon's degree
 * Nakshatras are 13°20' each (360° / 27 nakshatras)
 */
function calculateNakshatraPosition(moonDegree: number): number {
  const normalizedDegree = ((moonDegree % 360) + 360) % 360;
  return Math.floor(normalizedDegree / DEGREES_PER_NAKSHATRA);
}

/**
 * Get the starting planet in the Vimshottari dasha based on Moon's nakshatra position
 * Each nakshatra corresponds to a dasha lord
 */
function getDashaLordByNakshatra(nakshatraPosition: number): string {
  // Nakshatra positions 0-26 map to dasha lords
  // Ashwini (0-0) -> Ketu, Bharani (1) -> Venus, Krittika (2) -> Sun, etc.
  const dashaLordIndex = nakshatraPosition % 9;
  return VIMSHOTTARI_SEQUENCE[dashaLordIndex];
}

/**
 * Calculate what percentage of a nakshatra the Moon is within
 * Helps determine exact dasha start time
 */
function getNakshatraSubdivision(moonDegree: number): number {
  const normalizedDegree = ((moonDegree % 360) + 360) % 360;
  const nakshatraPosition = normalizedDegree / DEGREES_PER_NAKSHATRA;
  return nakshatraPosition % 1; // Fractional position within nakshatra
}

/**
 * Calculate which planet starts the dasha cycle and at what point within their period
 * Returns { startingPlanetIndex, fractionIntoStartingPlanet }
 */
function calculateDashaStartPoint(natalMoonDegree: number): {
  startingPlanetIndex: number;
  fractionIntoStartingPlanet: number;
} {
  const nakshatraPosition = calculateNakshatraPosition(natalMoonDegree);
  const nakshatraSubdivision = getNakshatraSubdivision(natalMoonDegree);

  // Which of the 9 planets starts the cycle for this nakshatra
  const startingPlanetIndex = nakshatraPosition % 9;

  return {
    startingPlanetIndex,
    fractionIntoStartingPlanet: nakshatraSubdivision,
  };
}

/**
 * Calculate the current dasha and all periods in the dasha timeline
 * The 120-year Vimshottari dasha cycle is based on Moon's nakshatra position at birth
 */
export function calculateDashaTimeline(
  birthDate: Date,
  natalMoonDegree: number,
  endDate: Date = new Date(),
): DashaPeriod[] {
  const { startingPlanetIndex, fractionIntoStartingPlanet } =
    calculateDashaStartPoint(natalMoonDegree);

  const timeline: DashaPeriod[] = [];
  // Generate enough periods: need at least 3 upcoming + current + lookback buffer
  // 140 years guarantees we cover 120+ years of full cycles
  const lookAheadYears = 140;
  const targetEndDate = dayjs(endDate).add(lookAheadYears, 'year');

  // Calculate years into the starting planet's period (may be partial)
  const startingPlanet = VIMSHOTTARI_SEQUENCE[startingPlanetIndex];
  const startingPlanetFullPeriod = DASHA_PERIODS[startingPlanet];
  const yearsIntoStartingPlanet =
    fractionIntoStartingPlanet * startingPlanetFullPeriod;
  const yearsRemainingInStartingPlanet =
    startingPlanetFullPeriod - yearsIntoStartingPlanet;

  let currentPeriodStart = dayjs(birthDate);
  let planetIndex = startingPlanetIndex;
  let isFirstPeriod = true;

  while (currentPeriodStart.isBefore(targetEndDate)) {
    const planet = VIMSHOTTARI_SEQUENCE[planetIndex % 9];
    let periodYears: number;

    if (isFirstPeriod) {
      // First period: only the remaining portion of the starting planet's period
      periodYears = yearsRemainingInStartingPlanet;
      isFirstPeriod = false;
    } else {
      // Subsequent periods: full planetary periods
      periodYears = DASHA_PERIODS[planet];
    }

    const periodStart = currentPeriodStart.toDate();
    const periodEnd = currentPeriodStart.add(periodYears, 'year').toDate();

    const daysRemaining = dayjs(periodEnd).diff(endDate, 'day');
    const isActive =
      dayjs(endDate).isAfter(dayjs(periodStart)) &&
      dayjs(endDate).isBefore(dayjs(periodEnd).add(1, 'day'));

    const percentComplete = isActive
      ? ((dayjs(endDate).diff(dayjs(periodStart), 'day') /
          dayjs(periodEnd).diff(dayjs(periodStart), 'day')) *
          100) %
        100
      : undefined;

    timeline.push({
      planet,
      startDate: periodStart,
      endDate: periodEnd,
      years: periodYears,
      isActive,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      percentComplete,
    });

    currentPeriodStart = dayjs(periodEnd);
    planetIndex = (planetIndex + 1) % 9;
  }

  return timeline;
}

/**
 * Get the current mahadasha (main dasha period)
 */
export function calculateCurrentDasha(
  birthDate: Date,
  natalMoonDegree: number,
  currentDate: Date = new Date(),
): DashaPeriod | null {
  const timeline = calculateDashaTimeline(
    birthDate,
    natalMoonDegree,
    currentDate,
  );
  const activeDasha = timeline.find(
    (period) =>
      (dayjs(currentDate).isAfter(dayjs(period.startDate)) &&
        dayjs(currentDate).isBefore(dayjs(period.endDate).add(1, 'day'))) ||
      period.isActive,
  );

  return activeDasha || null;
}

/**
 * Calculate antardasha (sub-period) within a mahadasha
 * Antardasha periods are proportional to the planetary period
 */
export function calculateAntardasha(
  mahadashaPlanet: string,
  mahadashStartDate: Date,
  mahadashEndDate: Date,
  currentDate: Date = new Date(),
): DashaPeriod | null {
  const mahadashaPeriod = DASHA_PERIODS[mahadashaPlanet];
  if (!mahadashaPeriod) return null;

  const mahadashaDurationDays = dayjs(mahadashEndDate).diff(
    dayjs(mahadashStartDate),
    'day',
  );

  // Antardasha cycle within mahadasha follows the same 9-planet sequence
  let accumulatedDays = 0;
  for (const antarPlanet of VIMSHOTTARI_SEQUENCE) {
    // Each antardasha duration = (antarPlanet period / 120) * mahadasha duration
    const antarDuration =
      (DASHA_PERIODS[antarPlanet] / TOTAL_CYCLE_YEARS) * mahadashaDurationDays;
    const antarStartDate = dayjs(mahadashStartDate)
      .add(accumulatedDays, 'day')
      .toDate();
    const antarEndDate = dayjs(mahadashStartDate)
      .add(accumulatedDays + antarDuration, 'day')
      .toDate();

    if (
      dayjs(currentDate).isAfter(dayjs(antarStartDate)) &&
      dayjs(currentDate).isBefore(dayjs(antarEndDate).add(1, 'day'))
    ) {
      const daysRemaining = dayjs(antarEndDate).diff(currentDate, 'day');
      const percentComplete =
        ((dayjs(currentDate).diff(dayjs(antarStartDate), 'day') /
          antarDuration) *
          100) %
        100;

      return {
        planet: antarPlanet,
        startDate: antarStartDate,
        endDate: antarEndDate,
        years: antarDuration / 365.25,
        isActive: true,
        daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
        percentComplete: Math.max(0, Math.min(100, percentComplete)),
      };
    }

    accumulatedDays += antarDuration;
  }

  return null;
}

/**
 * Get comprehensive dasha information including upcoming transitions
 */
export function getCurrentDashaState(
  birthDate: Date,
  natalMoonDegree: number,
  currentDate: Date = new Date(),
): CurrentDashaState | null {
  const timeline = calculateDashaTimeline(
    birthDate,
    natalMoonDegree,
    currentDate,
  );

  // Find the active dasha at current date
  const currentDasha = timeline.find((p) => p.isActive);
  if (!currentDasha) return null;

  const antardasha = calculateAntardasha(
    currentDasha.planet,
    currentDasha.startDate,
    currentDasha.endDate,
    currentDate,
  );

  // Get upcoming dashas (next 3 after current)
  const currentDashaIndex = timeline.findIndex((p) => p.isActive);
  const upcoming = timeline.slice(currentDashaIndex + 1, currentDashaIndex + 4);

  const currentAge = dayjs(currentDate).diff(dayjs(birthDate), 'year', true);
  const ageInCurrentDasha = dayjs(currentDate).diff(
    dayjs(currentDasha.startDate),
    'year',
    true,
  );

  // Check if major dasha transition is approaching (within 6 months)
  const transitionDate = currentDasha.endDate;
  const daysUntilTransition = dayjs(transitionDate).diff(currentDate, 'day');
  const transitionApproaching =
    daysUntilTransition > 0 && daysUntilTransition <= 180;

  return {
    mahadasha: {
      planet: currentDasha.planet,
      startDate: currentDasha.startDate,
      endDate: currentDasha.endDate,
      years: currentDasha.years,
      daysRemaining: currentDasha.daysRemaining || 0,
      percentComplete: currentDasha.percentComplete || 0,
    },
    antardasha: antardasha || {
      planet: 'Unknown',
      startDate: currentDate,
      endDate: currentDate,
      years: 0,
      isActive: false,
      daysRemaining: 0,
      percentComplete: 0,
    },
    upcoming,
    currentAge,
    ageInCurrentDasha,
    transitionApproaching,
  };
}

/**
 * Check if currently in a major dasha transition period (within 6 months)
 */
export function isMajorDashaTransition(
  birthDate: Date,
  natalMoonDegree: number,
  currentDate: Date = new Date(),
): boolean {
  const state = getCurrentDashaState(birthDate, natalMoonDegree, currentDate);
  return state?.transitionApproaching || false;
}

/**
 * Get dasha periods with all subdivisions (mahadasha, antardasha, pratyantar dasha)
 * This is for detailed timeline views
 */
export interface DetailedDashaPeriod extends DashaPeriod {
  antardashas?: DetailedDashaPeriod[];
  level: 'mahadasha' | 'antardasha' | 'pratyantar';
}

export function getDashaPeriodsWithSubdivisions(
  mahadashaPlanet: string,
  mahadashStartDate: Date,
  mahadashEndDate: Date,
): DetailedDashaPeriod[] {
  const result: DetailedDashaPeriod[] = [];

  const mahadashaDurationDays = dayjs(mahadashEndDate).diff(
    dayjs(mahadashStartDate),
    'day',
  );

  // Generate antardasha periods
  const antardashas: DetailedDashaPeriod[] = [];
  let accumulatedDays = 0;

  for (const antarPlanet of VIMSHOTTARI_SEQUENCE) {
    const antarDuration =
      (DASHA_PERIODS[antarPlanet] / TOTAL_CYCLE_YEARS) * mahadashaDurationDays;
    const antarStartDate = dayjs(mahadashStartDate)
      .add(accumulatedDays, 'day')
      .toDate();
    const antarEndDate = dayjs(mahadashStartDate)
      .add(accumulatedDays + antarDuration, 'day')
      .toDate();

    antardashas.push({
      planet: antarPlanet,
      startDate: antarStartDate,
      endDate: antarEndDate,
      years: antarDuration / 365.25,
      isActive: false,
      level: 'antardasha',
    });

    accumulatedDays += antarDuration;
  }

  result.push({
    planet: mahadashaPlanet,
    startDate: mahadashStartDate,
    endDate: mahadashEndDate,
    years: DASHA_PERIODS[mahadashaPlanet],
    isActive: false,
    level: 'mahadasha',
    antardashas,
  });

  return result;
}
