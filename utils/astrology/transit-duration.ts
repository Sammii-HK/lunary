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
  if (!planetData) return null;

  const signData = planetData[currentSign];
  if (!signData) return null;

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
  const elapsedMs = now - startTime;
  const remainingMs = endTime - now;

  const totalDays = Math.ceil(totalMs / (1000 * 60 * 60 * 24));
  const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

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
 * Uses average orbital speed as fallback
 */
function estimateSlowPlanetDuration(
  planet: string,
  date: Date,
): TransitDuration | null {
  const dailyMotion =
    PLANET_DAILY_MOTION[planet as keyof typeof PLANET_DAILY_MOTION];
  if (!dailyMotion) return null;

  // Estimate days to traverse 30 degrees (one sign)
  const daysPerSign = 30 / dailyMotion;

  // Estimate we're halfway through (average)
  const remainingDays = Math.ceil(daysPerSign / 2);

  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + remainingDays);

  const startDate = new Date(date);
  startDate.setDate(startDate.getDate() - remainingDays);

  return {
    totalDays: Math.ceil(daysPerSign),
    remainingDays,
    displayText: formatDuration(remainingDays),
    startDate,
    endDate,
  };
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

  // Days remaining = degrees remaining / daily motion
  const remainingDays = Math.ceil(degreesRemaining / dailyMotion);

  // Calculate start date (when planet entered this sign)
  const daysElapsed = Math.ceil(degreeInSign / dailyMotion);
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
 * Format duration intelligently
 * - < 1 day: "< 1 day remaining"
 * - 1 day: "1 day remaining"
 * - 2-6 days: "X days remaining"
 * - 7-55 days: "X weeks remaining"
 * - 56+ days: "X months remaining"
 */
export function formatDuration(days: number): string {
  if (days < 1) {
    return '< 1 day remaining';
  } else if (days === 1) {
    return '1 day remaining';
  } else if (days < 7) {
    return `${days} days remaining`;
  } else if (days < 56) {
    // 56 days = 8 weeks threshold
    const weeks = Math.round(days / 7);
    return weeks === 1 ? '1 week remaining' : `${weeks} weeks remaining`;
  } else {
    // 56+ days = months
    const months = Math.round(days / 30);
    return months === 1 ? '1 month remaining' : `${months} months remaining`;
  }
}
