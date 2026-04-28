/**
 * Friend Milestone Pings — pure detection logic.
 *
 * Given a user, their friends, and the current sky, returns a list of
 * milestone "pings" (push-notification previews) covering the friends who
 * are about to hit a major astrological turning point.
 *
 * Pure math + composition. No DB, no fetch.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MilestoneType =
  | 'saturn_return'
  | 'jupiter_return'
  | 'outer_natal_sun_aspect'
  | 'profection_year_start';

export interface MilestonePing {
  friendId: string;
  friendName: string;
  milestoneType: MilestoneType;
  exactDate: string; // ISO date YYYY-MM-DD
  copy: string;
}

export interface BirthChartLike {
  // Tolerant shape: planet -> { eclipticLongitude, sign }
  // Existing utils/astrology code treats birth_chart as `any[]` of bodies,
  // we accept either an array of {body, eclipticLongitude} or a record.
  [key: string]: unknown;
}

/**
 * The minimum we need from a friend to compute their milestones.
 *
 * Mirrors the shape persisted on `friend_connections` + `user_profiles`:
 * - `id`            -> friend_connections.id (for routing pings)
 * - `friendId`      -> friend_connections.friend_id (the actual user being tracked)
 * - `name`          -> nickname OR user_profiles.name
 * - `birthday`      -> user_profiles.birthday (ISO yyyy-mm-dd)
 * - `birthChart`    -> user_profiles.birth_chart (positions keyed by body)
 */
export interface FriendForDetection {
  id: string;
  friendId: string;
  name: string;
  birthday?: string | null;
  birthChart?: BirthChartLike | null;
}

export interface CurrentSky {
  /** ISO date YYYY-MM-DD, used for "today's" anchor. */
  date: string;
  /** Transiting outer-planet ecliptic longitudes (0-360 degrees). */
  positions: {
    Saturn?: number;
    Jupiter?: number;
    Uranus?: number;
    Neptune?: number;
    Pluto?: number;
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Window (days) before exact when we ping the user. */
const PING_WINDOW_DAYS = 2;

/** Saturn return: ~29.46 years. Jupiter return: ~11.86 years. */
const SATURN_PERIOD_YEARS = 29.46;
const JUPITER_PERIOD_YEARS = 11.86;

/** Orb (degrees) for considering a transit "exact-ish" to the natal Sun. */
const OUTER_ASPECT_ORB = 1.5;

const OUTER_PLANETS = [
  'Saturn',
  'Jupiter',
  'Uranus',
  'Neptune',
  'Pluto',
] as const;
type OuterPlanet = (typeof OUTER_PLANETS)[number];

const ASPECT_ANGLES: Array<{ name: string; angle: number }> = [
  { name: 'conjunction', angle: 0 },
  { name: 'sextile', angle: 60 },
  { name: 'square', angle: 90 },
  { name: 'trine', angle: 120 },
  { name: 'opposition', angle: 180 },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function detectFriendMilestones(
  userId: string,
  friends: FriendForDetection[],
  currentSky: CurrentSky,
): MilestonePing[] {
  // userId is part of the signature for symmetry with the cron caller and
  // future per-user filtering (e.g. preferences). Intentionally unused here.
  void userId;

  const today = parseIsoDate(currentSky.date);
  if (!today) return [];

  const pings: MilestonePing[] = [];

  for (const friend of friends) {
    if (!friend.birthday) continue;
    const dob = parseIsoDate(friend.birthday);
    if (!dob) continue;

    const friendName = friend.name?.trim() || 'Your friend';

    // 1. Saturn return
    const saturn = detectReturn({
      today,
      dob,
      periodYears: SATURN_PERIOD_YEARS,
      windowDays: PING_WINDOW_DAYS,
    });
    if (saturn) {
      pings.push({
        friendId: friend.id,
        friendName,
        milestoneType: 'saturn_return',
        exactDate: toIsoDate(saturn),
        copy: composeCopy(friendName, 'saturn_return', today, saturn),
      });
    }

    // 2. Jupiter return
    const jupiter = detectReturn({
      today,
      dob,
      periodYears: JUPITER_PERIOD_YEARS,
      windowDays: PING_WINDOW_DAYS,
    });
    if (jupiter) {
      pings.push({
        friendId: friend.id,
        friendName,
        milestoneType: 'jupiter_return',
        exactDate: toIsoDate(jupiter),
        copy: composeCopy(friendName, 'jupiter_return', today, jupiter),
      });
    }

    // 3. Exact natal-Sun aspect from a transiting outer planet
    const natalSun = extractNatalLongitude(friend.birthChart, 'Sun');
    if (natalSun !== null) {
      for (const planet of OUTER_PLANETS) {
        const transit = currentSky.positions[planet];
        if (typeof transit !== 'number') continue;

        const aspect = nearestAspect(transit, natalSun, OUTER_ASPECT_ORB);
        if (!aspect) continue;

        pings.push({
          friendId: friend.id,
          friendName,
          milestoneType: 'outer_natal_sun_aspect',
          exactDate: currentSky.date,
          copy: composeOuterAspectCopy(friendName, planet, aspect.name),
        });
      }
    }

    // 4. Profection year start (annual, on solar return / birthday)
    const profection = detectProfectionStart({
      today,
      dob,
      windowDays: PING_WINDOW_DAYS,
    });
    if (profection) {
      pings.push({
        friendId: friend.id,
        friendName,
        milestoneType: 'profection_year_start',
        exactDate: toIsoDate(profection.date),
        copy: composeProfectionCopy(
          friendName,
          profection.house,
          today,
          profection.date,
        ),
      });
    }
  }

  return pings;
}

// ---------------------------------------------------------------------------
// Detection helpers
// ---------------------------------------------------------------------------

interface ReturnArgs {
  today: Date;
  dob: Date;
  periodYears: number;
  windowDays: number;
}

/**
 * Returns the date the next return falls on if it lands in the ping window
 * (today .. today + windowDays). Otherwise null.
 */
function detectReturn(args: ReturnArgs): Date | null {
  const { today, dob, periodYears, windowDays } = args;
  const ageYears = yearsBetween(dob, today);
  if (ageYears < 0) return null;

  // Find the next integer multiple of `periodYears` >= ageYears.
  const cyclesElapsed = Math.floor(ageYears / periodYears);
  for (const k of [cyclesElapsed, cyclesElapsed + 1]) {
    if (k <= 0) continue;
    const exact = addYears(dob, k * periodYears);
    if (isWithinWindow(exact, today, windowDays)) return exact;
  }
  return null;
}

interface ProfectionStart {
  date: Date;
  /** Profection house, 1-12 (age 0 -> 1st house, age 1 -> 2nd, ..., age 12 -> 1st again). */
  house: number;
}

function detectProfectionStart(args: {
  today: Date;
  dob: Date;
  windowDays: number;
}): ProfectionStart | null {
  const { today, dob, windowDays } = args;
  // Solar return = next birthday at or after today (inclusive of window).
  const ageYears = Math.floor(yearsBetween(dob, today));
  for (const k of [ageYears, ageYears + 1]) {
    if (k < 0) continue;
    const candidate = anniversaryOf(dob, k);
    if (isWithinWindow(candidate, today, windowDays)) {
      const house = (k % 12) + 1;
      return { date: candidate, house };
    }
  }
  return null;
}

interface AspectHit {
  name: string;
  angle: number;
  orb: number;
}

function nearestAspect(
  transitLon: number,
  natalLon: number,
  maxOrb: number,
): AspectHit | null {
  const sep = angularSeparation(transitLon, natalLon);
  let best: AspectHit | null = null;
  for (const aspect of ASPECT_ANGLES) {
    const orb = Math.abs(sep - aspect.angle);
    if (orb <= maxOrb && (!best || orb < best.orb)) {
      best = { name: aspect.name, angle: aspect.angle, orb };
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Copy composition
// ---------------------------------------------------------------------------

function composeCopy(
  friendName: string,
  type: MilestoneType,
  today: Date,
  exact: Date,
): string {
  const when = relativeWhen(today, exact);
  if (type === 'saturn_return') {
    return `${friendName} hits her Saturn return ${when} — check in?`;
  }
  if (type === 'jupiter_return') {
    return `${friendName}'s Jupiter return lands ${when}. Big-luck window — send a note.`;
  }
  return `${friendName} has a milestone ${when}.`;
}

function composeOuterAspectCopy(
  friendName: string,
  planet: OuterPlanet,
  aspectName: string,
): string {
  return `${friendName}: transiting ${planet} is exact ${aspectName} her natal Sun today — reach out.`;
}

function composeProfectionCopy(
  friendName: string,
  house: number,
  today: Date,
  exact: Date,
): string {
  const when = relativeWhen(today, exact);
  return `${friendName} starts a new profection year ${when} (house ${house}). Mark it with her.`;
}

// ---------------------------------------------------------------------------
// Date / math primitives
// ---------------------------------------------------------------------------

function parseIsoDate(s: string): Date | null {
  // Accepts YYYY-MM-DD or full ISO. Returns UTC midnight to avoid TZ drift.
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(Date.UTC(year, month, day));
  return Number.isNaN(d.getTime()) ? null : d;
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function yearsBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return ms / (365.2425 * 24 * 60 * 60 * 1000);
}

function addYears(d: Date, years: number): Date {
  const ms = years * 365.2425 * 24 * 60 * 60 * 1000;
  return new Date(d.getTime() + ms);
}

function anniversaryOf(dob: Date, ageYears: number): Date {
  // Calendar-anchored anniversary (handles Feb 29 by clamping).
  const y = dob.getUTCFullYear() + ageYears;
  const m = dob.getUTCMonth();
  const day = dob.getUTCDate();
  const candidate = new Date(Date.UTC(y, m, day));
  // Clamp Feb 29 -> Feb 28 in non-leap years.
  if (candidate.getUTCMonth() !== m) {
    return new Date(Date.UTC(y, m + 1, 0));
  }
  return candidate;
}

function isWithinWindow(
  target: Date,
  today: Date,
  windowDays: number,
): boolean {
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
  );
  return diffDays >= 0 && diffDays <= windowDays;
}

function angularSeparation(a: number, b: number): number {
  let diff = Math.abs(a - b) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

function extractNatalLongitude(
  chart: BirthChartLike | null | undefined,
  body: string,
): number | null {
  if (!chart) return null;

  // Array shape: [{ body: 'Sun', eclipticLongitude: 123.4, ... }, ...]
  if (Array.isArray(chart)) {
    const entry = (
      chart as Array<{ body?: string; eclipticLongitude?: number }>
    ).find((p) => p && p.body === body);
    return typeof entry?.eclipticLongitude === 'number'
      ? entry.eclipticLongitude
      : null;
  }

  // Record shape: { Sun: { eclipticLongitude: 123.4 } } or { Sun: 123.4 }
  const raw = (chart as Record<string, unknown>)[body];
  if (typeof raw === 'number') return raw;
  if (raw && typeof raw === 'object') {
    const lon = (raw as { eclipticLongitude?: unknown }).eclipticLongitude;
    if (typeof lon === 'number') return lon;
  }
  return null;
}

function relativeWhen(today: Date, target: Date): string {
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  return `in ${diffDays} days`;
}
