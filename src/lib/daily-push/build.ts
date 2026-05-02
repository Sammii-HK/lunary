/**
 * Daily personalised push — pure builder.
 *
 * Given a user's natal chart and the current sky, produce the title/body
 * for the morning push notification.
 *
 * No IO, no DB. The cron is responsible for fetching natal charts and
 * subscriptions, and for deciding when to fan this out per user.
 *
 * Title pattern:   "Your six-word horoscope"
 * Body  pattern:   six words derived from the user's strongest transit
 *
 * The longer audio recap stays behind a dashboard button instead of taking
 * over the dashboard or being forced from the notification.
 */

import { findNextHit, type CurrentSky } from '@/lib/live-transits/find-next';
import { buildSixWord, type SixWordAspect } from '@/lib/six-word/build';
import type { BirthChartData } from '../../../utils/astrology/birthChart';

const SIX_WORD_ASPECTS = new Set<SixWordAspect>([
  'Conjunction',
  'Sextile',
  'Square',
  'Trine',
  'Opposition',
]);

export interface DailyPushParams {
  userId?: string;
  natalChart: BirthChartData[];
  /**
   * Optional snapshot of the current sky. If omitted, `findNextHit` will
   * compute one from the ephemeris. Caller can pass for tests / to share
   * a snapshot across users in a fan-out.
   */
  currentSky?: CurrentSky;
  /** The user's local sunrise as a Date (any TZ — only the local hour is used). */
  sunriseLocal?: Date;
  /** Reserved for future i18n. Currently the templates are en-only. */
  locale?: string;
}

export interface DailyPush {
  title: string;
  body: string;
  /** Tap target — opens the dashboard. */
  deepLink: string;
  /** Local hour-of-day (0-23) the user's sunrise lands on — used by the cron. */
  hourLocal: number;
}

function isSixWordAspect(aspect: string | undefined): aspect is SixWordAspect {
  return !!aspect && SIX_WORD_ASPECTS.has(aspect as SixWordAspect);
}

export function buildDailyPush(params: DailyPushParams): DailyPush {
  const { natalChart, currentSky, sunriseLocal } = params;

  // Find today's strongest transit hitting this user's chart.
  const hit = findNextHit({
    natalChart,
    currentSky,
    withinDays: 1,
  });

  const deepLink = '/app?from=daily-push';
  const hourLocal = sunriseLocal ? sunriseLocal.getHours() : 7;
  const dateUTC = new Date().toISOString().slice(0, 10);
  const topTransit =
    hit && isSixWordAspect(hit.aspect)
      ? {
          transitPlanet: hit.transitPlanet,
          natalPlanet: hit.natalPlanet,
          aspect: hit.aspect,
        }
      : undefined;
  const sixWord = buildSixWord({
    userId: params.userId ?? 'anonymous',
    dateUTC,
    natalChart,
    currentSky,
    topTransit,
  });

  return {
    title: 'Your six-word horoscope',
    body: sixWord.line,
    deepLink,
    hourLocal,
  };
}

// ---------------------------------------------------------------------------
// Sunrise approximation.
//
// NOAA / "general solar position" formula, simplified — accurate to within a
// few minutes for ordinary latitudes, which is well inside our 30-minute
// dispatch window. No external deps.
// ---------------------------------------------------------------------------

const SUNRISE_ZENITH = 90.833; // degrees (official sunrise, accounts for refraction)

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Approximate the local sunrise for `date` at `(latitude, longitude)`.
 *
 * Returns a Date whose **UTC instant** is the sunrise moment. Caller can
 * format it in any TZ. The hour read off `sunriseLocal.getHours()` will be
 * the *server's* local hour; for our cron we only care about the offset
 * relative to UTC, so callers should construct sunrise via this helper
 * and convert to the user's timezone with `Intl.DateTimeFormat`.
 *
 * Falls back to 06:00 UTC if the sun never rises (polar night) or never
 * sets (polar day) for the given inputs.
 */
export function approximateSunriseUTC(
  date: Date,
  latitude: number,
  longitude: number,
): Date {
  // Day of the year (1-366).
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear;
  const dayOfYear = Math.floor(diff / 86_400_000);

  const lngHour = longitude / 15;
  // Approx hour for sunrise (initial guess: 6am local).
  const t = dayOfYear + (6 - lngHour) / 24;

  // Sun's mean anomaly.
  const M = 0.9856 * t - 3.289;
  // Sun's true longitude.
  let L =
    M + 1.916 * Math.sin(toRad(M)) + 0.02 * Math.sin(toRad(2 * M)) + 282.634;
  L = ((L % 360) + 360) % 360;

  // Right ascension.
  let RA = toDeg(Math.atan(0.91764 * Math.tan(toRad(L))));
  RA = ((RA % 360) + 360) % 360;
  // Quadrant adjust.
  const Lquadrant = Math.floor(L / 90) * 90;
  const RAquadrant = Math.floor(RA / 90) * 90;
  RA = RA + (Lquadrant - RAquadrant);
  RA = RA / 15; // hours

  // Sun's declination.
  const sinDec = 0.39782 * Math.sin(toRad(L));
  const cosDec = Math.cos(Math.asin(sinDec));

  // Hour angle.
  const cosH =
    (Math.cos(toRad(SUNRISE_ZENITH)) - sinDec * Math.sin(toRad(latitude))) /
    (cosDec * Math.cos(toRad(latitude)));

  // Polar day / polar night — sun never rises/sets.
  if (cosH > 1 || cosH < -1) {
    // Default to 06:00 UTC; the cron will simply send at server's 06:00 UTC.
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        6,
        0,
        0,
      ),
    );
  }

  const H = (360 - toDeg(Math.acos(cosH))) / 15; // sunrise hour angle in hours

  // Local mean time of sunrise.
  const T = H + RA - 0.06571 * t - 6.622;
  // UTC time of sunrise.
  let UT = T - lngHour;
  UT = ((UT % 24) + 24) % 24;

  const hours = Math.floor(UT);
  const minutes = Math.floor((UT - hours) * 60);

  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      hours,
      minutes,
      0,
    ),
  );
}
