/**
 * Void-of-course Moon detection.
 *
 * The Moon is "void of course" when it makes no more applying major aspects to
 * the classical planets before it leaves its current sign — a natural pause
 * where new beginnings tend not to land as expected.
 *
 * This mirrors the same computation already used by the event-calendar builder
 * (`src/lib/astro/event-calendar.ts`, section 8c) so the in-app indicator and
 * the content layer agree. It is intentionally a pure function over an array of
 * `{ body, eclipticLongitude, sign }` so callers can feed it whatever chart
 * they already have on hand (e.g. the dashboard's live planetary chart) without
 * triggering another astronomy fetch.
 */

/** Mean lunar motion in degrees per hour (~13.18°/day). */
const MOON_DEGREES_PER_HOUR = 0.549;

/** Major aspect angles checked for an applying aspect before the sign change. */
const ASPECT_ANGLES = [0, 60, 90, 120, 180] as const;

/** Orb (degrees) within which an aspect counts. Matches event-calendar. */
const ORB = 8;

/**
 * Classical planets the Moon can perfect an aspect with. Outer planets are
 * excluded, matching the event-calendar definition of "major aspect".
 */
const ASPECTING_BODIES = [
  'Sun',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
] as const;

export interface VocChartBody {
  body: string;
  eclipticLongitude: number;
  sign?: string;
}

export interface VocMoonStatus {
  /** True when the Moon has no applying major aspect before the next sign. */
  isVoid: boolean;
  /** The Moon's current sign (empty string if unknown). */
  moonSign: string;
  /** Whole hours until the Moon changes sign (>= 0). */
  hoursRemaining: number;
}

function normalizeLongitude(value: number): number {
  return ((value % 360) + 360) % 360;
}

/**
 * Compute the Moon's void-of-course status from a chart snapshot.
 *
 * Returns `null` when the chart is missing the Moon so callers can render
 * nothing rather than guess.
 */
export function getVoidOfCourseMoon(
  chart: VocChartBody[] | null | undefined,
): VocMoonStatus | null {
  if (!chart || chart.length === 0) return null;

  const moon = chart.find((p) => p.body === 'Moon');
  if (!moon || typeof moon.eclipticLongitude !== 'number') return null;

  const moonLon = normalizeLongitude(moon.eclipticLongitude);
  const moonSignIndex = Math.floor(moonLon / 30);
  const nextSignBoundary = (moonSignIndex + 1) * 30;

  let hasApplyingAspect = false;
  outer: for (const bodyName of ASPECTING_BODIES) {
    const planet = chart.find((p) => p.body === bodyName);
    if (!planet || typeof planet.eclipticLongitude !== 'number') continue;
    const pLon = normalizeLongitude(planet.eclipticLongitude);

    for (const angle of ASPECT_ANGLES) {
      const targets =
        angle === 0
          ? [pLon]
          : angle === 180
            ? [(pLon + 180) % 360]
            : [(pLon + angle) % 360, (pLon - angle + 360) % 360];
      for (const target of targets) {
        // An aspect is still "applying" if its exact longitude sits ahead of
        // the Moon (within orb) but before the Moon leaves the sign.
        if (target > moonLon - ORB && target < nextSignBoundary) {
          hasApplyingAspect = true;
          break outer;
        }
      }
    }
  }

  const remainingDeg = nextSignBoundary - moonLon;
  const hoursRemaining = Math.max(
    0,
    Math.round(remainingDeg / MOON_DEGREES_PER_HOUR),
  );

  return {
    isVoid: !hasApplyingAspect,
    moonSign: moon.sign ?? '',
    hoursRemaining,
  };
}
