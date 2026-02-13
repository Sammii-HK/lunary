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
 * Branches: slow planets (Jupiter-Pluto) use ephemeris-computed sign segments, fast planets use orbital math
 * @param actualDailyMotion - Real observed daily motion (degrees/day) from astronomy-engine.
 *   When provided, replaces the hardcoded average for fast planets — critical for the Moon
 *   where actual speed (12.2-14.8°/day) varies ~20% from the 13.176° average.
 */
export function calculateTransitDuration(
  planet: string,
  currentSign: string,
  currentLongitude: number,
  date: Date = new Date(),
  actualDailyMotion?: number,
): TransitDuration | null {
  // Check if planet is slow or fast
  if (SLOW_PLANETS.includes(planet)) {
    return calculateSlowPlanetDuration(planet, currentSign, date);
  } else if (FAST_PLANETS.includes(planet)) {
    return calculateFastPlanetDuration(
      planet,
      currentLongitude,
      date,
      actualDailyMotion,
    );
  }

  return null;
}

/**
 * Slow planets (Jupiter-Pluto): lookup from ephemeris-computed sign segments.
 * Each planet+sign has an array of segments (multiple for retrograde re-entries).
 *
 * Aggregates across ALL segments so that totalDays reflects the full cumulative
 * time the planet spends in the sign (e.g. Saturn in Aries = ~2.4 years total,
 * not the ~3 months of the first brief entry before retrograde).
 *
 * - totalDays: cumulative days across all segments
 * - remainingDays: remaining in current segment + all future segments
 * - startDate: first segment start (initial ingress)
 * - endDate: last segment end (final egress)
 */
function calculateSlowPlanetDuration(
  planet: string,
  currentSign: string,
  date: Date,
): TransitDuration | null {
  const planetData = SLOW_PLANET_SIGN_CHANGES[planet];
  if (!planetData) return null;

  const segments = planetData[currentSign];
  if (!segments || segments.length === 0) return null;

  const now = date.getTime();
  const msPerDay = 1000 * 60 * 60 * 24;

  // Find the segment that contains the current date
  const activeIndex = segments.findIndex(
    (seg) => now >= seg.start.getTime() && now <= seg.end.getTime(),
  );

  if (activeIndex === -1) return null;

  // Total cumulative days across ALL segments for this planet+sign
  const totalCumulativeDays = segments.reduce(
    (sum, seg) => sum + (seg.end.getTime() - seg.start.getTime()) / msPerDay,
    0,
  );

  // Remaining: rest of current segment + all future segments
  const activeSegment = segments[activeIndex];
  let remainingCumulativeDays = (activeSegment.end.getTime() - now) / msPerDay;

  for (let i = activeIndex + 1; i < segments.length; i++) {
    remainingCumulativeDays +=
      (segments[i].end.getTime() - segments[i].start.getTime()) / msPerDay;
  }

  return {
    totalDays: Math.ceil(totalCumulativeDays),
    remainingDays: remainingCumulativeDays,
    displayText: formatDuration(remainingCumulativeDays),
    startDate: segments[0].start,
    endDate: segments[segments.length - 1].end,
  };
}

/**
 * Look up the total cumulative days a slow planet spends in a given sign.
 * Useful for posts that reference the NEXT sign's duration (e.g. "~3 years in Taurus").
 * Returns null if no data exists for the planet+sign combo.
 */
export function getSlowPlanetSignTotalDays(
  planet: string,
  sign: string,
): number | null {
  const planetData = SLOW_PLANET_SIGN_CHANGES[planet];
  if (!planetData) return null;

  const segments = planetData[sign];
  if (!segments || segments.length === 0) return null;

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil(
    segments.reduce(
      (sum, seg) => sum + (seg.end.getTime() - seg.start.getTime()) / msPerDay,
      0,
    ),
  );
}

/**
 * Fast planets (Moon-Mars): degrees remaining ÷ daily motion
 * Uses actual observed motion when available, falls back to orbital average
 */
function calculateFastPlanetDuration(
  planet: string,
  currentLongitude: number,
  date: Date,
  actualDailyMotion?: number,
): TransitDuration | null {
  const averageMotion =
    PLANET_DAILY_MOTION[planet as keyof typeof PLANET_DAILY_MOTION];
  if (!averageMotion) return null;

  // Use actual motion if provided and reasonable (> 50% of average)
  const dailyMotion =
    actualDailyMotion && actualDailyMotion > averageMotion * 0.5
      ? actualDailyMotion
      : averageMotion;

  // Calculate degree within current sign (0-30)
  const degreeInSign = currentLongitude % 30;

  // Degrees remaining in sign
  const degreesRemaining = 30 - degreeInSign;

  // Days remaining = degrees remaining / daily motion (fractional for hour precision)
  const remainingDays = degreesRemaining / dailyMotion;

  // Calculate start date (when planet entered this sign)
  const daysElapsed = degreeInSign / dailyMotion;
  const msPerDay = 86400000;
  const startDate = new Date(date.getTime() - daysElapsed * msPerDay);

  // Calculate end date (when planet will leave this sign)
  const endDate = new Date(date.getTime() + remainingDays * msPerDay);

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
 * Recalculate remainingDays and displayText from stored start/end dates.
 * Fixes stale cached durations by computing remaining time from NOW.
 * Handles both Date objects and ISO strings (from JSON/DB serialization).
 */
export function refreshDuration(
  duration:
    | { startDate: Date | string; endDate: Date | string; totalDays?: number }
    | null
    | undefined,
): TransitDuration | null {
  if (!duration?.endDate || !duration?.startDate) return null;

  const endDate = new Date(duration.endDate);
  const startDate = new Date(duration.startDate);
  const now = Date.now();

  const totalMs = endDate.getTime() - startDate.getTime();
  const remainingMs = endDate.getTime() - now;

  if (remainingMs <= 0) return null; // Transit has ended

  const totalDays =
    duration.totalDays ?? Math.ceil(totalMs / (1000 * 60 * 60 * 24));
  const remainingDays = remainingMs / (1000 * 60 * 60 * 24);

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
 * - 1-13 days: "Xd left"
 * - 14-55 days: "Xw left"
 * - 56-364 days: "Xm left"
 * - 365+ days: "Xy left"
 */
export function formatDuration(days: number): string {
  const hours = Math.round(days * 24);

  if (hours < 1) {
    return '<1h left';
  } else if (days < 1) {
    return `${hours}h left`;
  } else if (days < 14) {
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
