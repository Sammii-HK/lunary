import {
  PLANET_DAILY_MOTION,
  SLOW_PLANETS,
  FAST_PLANETS,
  SLOW_PLANET_SIGN_CHANGES,
} from './transit-duration-constants';
import { Body, GeoVector, Ecliptic, AstroTime } from 'astronomy-engine';

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
 * @param retrograde - Whether the planet is currently in retrograde motion.
 *   When true, fast planets count down to 0° (re-entry into previous sign) rather than 30°.
 */
export function calculateTransitDuration(
  planet: string,
  currentSign: string,
  currentLongitude: number,
  date: Date = new Date(),
  actualDailyMotion?: number,
  retrograde?: boolean,
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
      retrograde,
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
 * Map planet name to astronomy-engine Body string.
 * Moon and Sun can't retrograde so they're excluded, but included for completeness.
 */
const BODY_MAP: Record<string, string> = {
  Mercury: 'Mercury',
  Venus: 'Venus',
  Mars: 'Mars',
  Jupiter: 'Jupiter',
  Saturn: 'Saturn',
  Uranus: 'Uranus',
  Neptune: 'Neptune',
  Pluto: 'Pluto',
};

/**
 * Find the date a retrograde planet stations direct by scanning forward.
 * Uses astronomy-engine to compute ecliptic longitude day-by-day and detects
 * when daily motion flips from negative (retrograde) to positive (direct).
 *
 * Also scans backward to find when the retrograde started (station retrograde).
 *
 * Returns { startDate, endDate } or null if the planet isn't in BODY_MAP.
 * Max scan: 120 days forward, 60 days back (covers even outer planet retrogrades).
 */
function findRetrogradeBounds(
  planet: string,
  date: Date,
): { startDate: Date; endDate: Date } | null {
  const bodyName = BODY_MAP[planet];
  if (!bodyName) return null;

  const body = bodyName as Body;
  const msPerDay = 86400000;

  function getLongitude(d: Date): number {
    const t = new AstroTime(d);
    const vec = GeoVector(body, t, true);
    return Ecliptic(vec).elon;
  }

  function dailyMotion(d: Date): number {
    const lon1 = getLongitude(d);
    const lon2 = getLongitude(new Date(d.getTime() + msPerDay));
    let diff = lon2 - lon1;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff;
  }

  // Scan forward to find station direct (motion goes from negative to positive)
  let endDate: Date | null = null;
  for (let i = 1; i <= 120; i++) {
    const futureDate = new Date(date.getTime() + i * msPerDay);
    const motion = dailyMotion(futureDate);
    if (motion > 0) {
      // Retrograde ended — refine to half-day precision
      const prevDate = new Date(futureDate.getTime() - msPerDay);
      const prevMotion = dailyMotion(prevDate);
      // Linear interpolation between the two days
      const fraction =
        Math.abs(prevMotion) / (Math.abs(prevMotion) + Math.abs(motion));
      endDate = new Date(prevDate.getTime() + fraction * msPerDay);
      break;
    }
  }

  // Scan backward to find station retrograde (motion goes from positive to negative)
  let startDate: Date | null = null;
  for (let i = 1; i <= 60; i++) {
    const pastDate = new Date(date.getTime() - i * msPerDay);
    const motion = dailyMotion(pastDate);
    if (motion > 0) {
      // Was direct here — retrograde started between this day and the next
      const nextDate = new Date(pastDate.getTime() + msPerDay);
      const nextMotion = dailyMotion(nextDate);
      const fraction =
        Math.abs(motion) / (Math.abs(motion) + Math.abs(nextMotion));
      startDate = new Date(pastDate.getTime() + fraction * msPerDay);
      break;
    }
  }

  if (!endDate) return null;

  return {
    startDate: startDate ?? date,
    endDate,
  };
}

/**
 * Fast planets (Moon-Mars): degrees remaining ÷ daily motion
 * Uses actual observed motion when available, falls back to orbital average.
 *
 * Retrograde-aware: when a planet is retrograde, we find the actual station
 * direct date using astronomy-engine rather than estimating from sign boundaries.
 * This gives accurate durations (e.g. Mercury retrograde ~3 weeks, not "4 days").
 *
 * For direct motion planets, uses the simpler degrees-to-sign-boundary calculation.
 */
function calculateFastPlanetDuration(
  planet: string,
  currentLongitude: number,
  date: Date,
  actualDailyMotion?: number,
  retrograde?: boolean,
): TransitDuration | null {
  const averageMotion =
    PLANET_DAILY_MOTION[planet as keyof typeof PLANET_DAILY_MOTION];
  if (!averageMotion) return null;

  const msPerDay = 86400000;

  // For retrograde planets, find the actual station direct date
  if (retrograde && planet !== 'Moon' && planet !== 'Sun') {
    const bounds = findRetrogradeBounds(planet, date);
    if (bounds) {
      const totalDays =
        (bounds.endDate.getTime() - bounds.startDate.getTime()) / msPerDay;
      const remainingDays =
        (bounds.endDate.getTime() - date.getTime()) / msPerDay;
      return {
        totalDays,
        remainingDays: Math.max(0, remainingDays),
        displayText: formatDuration(Math.max(0, remainingDays)),
        startDate: bounds.startDate,
        endDate: bounds.endDate,
      };
    }
  }

  // Direct motion: degrees to sign boundary ÷ daily motion
  const dailyMotion =
    actualDailyMotion && actualDailyMotion > averageMotion * 0.5
      ? actualDailyMotion
      : averageMotion;

  const degreeInSign = currentLongitude % 30;
  const degreesRemaining = 30 - degreeInSign;
  const remainingDays = degreesRemaining / dailyMotion;

  const daysElapsed = degreeInSign / dailyMotion;
  const startDate = new Date(date.getTime() - daysElapsed * msPerDay);
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

  // Transit has ended or is within the last few minutes — show <1h rather than
  // dropping the badge entirely (avoids a gap during sign-change transitions
  // when cached endDate expires before the next server refresh fires).
  if (remainingMs <= 0) {
    if (remainingMs > -3600000) {
      // endDate is < 1 hour in the past — planet is mid-transition, show <1h
      return {
        totalDays: duration.totalDays ?? 0,
        remainingDays: 0,
        displayText: '<1h left',
        startDate,
        endDate,
      };
    }
    return null; // Transit genuinely ended
  }

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
