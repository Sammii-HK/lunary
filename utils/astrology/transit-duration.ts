import {
  PLANET_DAILY_MOTION,
  SLOW_PLANETS,
  FAST_PLANETS,
  SLOW_PLANET_SIGN_CHANGES,
} from './transit-duration-constants';

export interface TransitDuration {
  totalDays: number;
  remainingDays: number;
  displayText: string;
  startDate: Date;
  endDate: Date;
}

/**
 * Calculate transit duration for a planet in its current sign
 * Branches: slow planets (Jupiter-Pluto) use YEARLY_TRANSITS, fast planets use orbital math
 */
export function calculateTransitDuration(
  planet: string,
  currentSign: string,
  currentLongitude: number,
  date: Date = new Date(),
): TransitDuration | null {
  // Check if planet is slow or fast
  if (SLOW_PLANETS.includes(planet)) {
    return calculateSlowPlanetDuration(planet, currentSign, date);
  } else if (FAST_PLANETS.includes(planet)) {
    return calculateFastPlanetDuration(planet, currentLongitude, date);
  }

  return null;
}

/**
 * Slow planets (Jupiter-Pluto): O(1) lookup from YEARLY_TRANSITS
 */
function calculateSlowPlanetDuration(
  planet: string,
  currentSign: string,
  date: Date,
): TransitDuration | null {
  const planetData = SLOW_PLANET_SIGN_CHANGES[planet];
  if (!planetData) return estimateSlowPlanetDuration(planet, date);

  const signData = planetData[currentSign];
  if (!signData) return estimateSlowPlanetDuration(planet, date);

  const { start, end } = signData;
  const now = date.getTime();
  const startTime = start.getTime();
  const endTime = end.getTime();

  // Check if current date is within the range
  if (now < startTime || now > endTime) {
    // Not in this transit period, return approximate based on average
    return estimateSlowPlanetDuration(planet, date);
  }

  const totalMs = endTime - startTime;
  const remainingMs = endTime - now;

  const totalDays = Math.ceil(totalMs / (1000 * 60 * 60 * 24));
  const remainingDays = remainingMs / (1000 * 60 * 60 * 24);

  return {
    totalDays,
    remainingDays,
    displayText: formatDuration(remainingDays),
    startDate: start,
    endDate: end,
  };
}

/**
 * Estimate duration for slow planets when not in YEARLY_TRANSITS data
 * Returns null to avoid triggering false milestones - we only generate
 * milestone posts when we have actual transit dates from YEARLY_TRANSITS.
 */
function estimateSlowPlanetDuration(
  _planet: string,
  _date: Date,
): TransitDuration | null {
  // Return null when we don't have real transit data
  // This prevents false "halfway through" or other milestone triggers
  // Add missing transit entries to YEARLY_TRANSITS instead
  return null;
}

/**
 * Fast planets (Moon-Mars): degrees remaining ÷ daily motion
 */
function calculateFastPlanetDuration(
  planet: string,
  currentLongitude: number,
  date: Date,
): TransitDuration | null {
  const dailyMotion =
    PLANET_DAILY_MOTION[planet as keyof typeof PLANET_DAILY_MOTION];
  if (!dailyMotion) return null;

  // Calculate degree within current sign (0-30)
  const degreeInSign = currentLongitude % 30;

  // Degrees remaining in sign
  const degreesRemaining = 30 - degreeInSign;

  // Days remaining = degrees remaining / daily motion (fractional for hour precision)
  const remainingDays = degreesRemaining / dailyMotion;

  // Calculate start date (when planet entered this sign)
  const daysElapsed = degreeInSign / dailyMotion;
  const startDate = new Date(date);
  startDate.setDate(startDate.getDate() - daysElapsed);

  // Calculate end date (when planet will leave this sign)
  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + remainingDays);

  const totalDays = daysElapsed + remainingDays;

  return {
    totalDays,
    remainingDays,
    displayText: formatDuration(remainingDays),
    startDate,
    endDate,
  };
}

/**
 * Format duration as compact badge text
 * - < 1 hour: "<1h left"
 * - < 1 day: "Xh left"
 * - 1-6 days: "Xd left"
 * - 7-55 days: "Xw left"
 * - 56-364 days: "Xm left"
 * - 365+ days: "Xy left"
 */
export function formatDuration(days: number): string {
  const hours = Math.round(days * 24);

  if (hours < 1) {
    return '<1h left';
  } else if (days < 1) {
    return `${hours}h left`;
  } else if (days < 7) {
    return `${Math.round(days)}d left`;
  } else if (days < 56) {
    const weeks = Math.round(days / 7);
    return `${weeks}w left`;
  } else if (days < 365) {
    const months = Math.round(days / 30);
    return `${months}m left`;
  } else {
    const years = Math.round((days / 365) * 10) / 10;
    return years % 1 === 0 ? `${Math.round(years)}y left` : `${years}y left`;
  }
}
