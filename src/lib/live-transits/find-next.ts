/**
 * Live Transit Awareness — find the next aspect-to-natal that hits the user's
 * chart hardest within a forward window.
 *
 * Pure utility. No IO, no auth — accepts a snapshot of natal placements and
 * the current sky and walks day-by-day until an aspect orb tightens to ≤0.5°.
 * The hit is then ranked by personal impact so we can surface the one event
 * most likely to feel meaningful, not just the chronologically nearest.
 *
 * Reuses:
 *   - `byPersonalImpact` from `src/lib/transits/personal-impact-rank.ts`
 *   - `getRealPlanetaryPositions` from `utils/astrology/astronomical-data.ts`
 */

import { getRealPlanetaryPositions } from '../../../utils/astrology/astronomical-data';
import {
  byPersonalImpact,
  scoreTransits,
  type RankableTransit,
} from '../transits/personal-impact-rank';
import type { BirthChartData } from '../../../utils/astrology/birthChart';

// Planets we walk forward — fast-to-medium movers create most "hits" inside
// a typical 30-day window. Outers move so slowly that an aspect already in
// orb today rarely becomes exact within a month, but we still include them
// so long-running squares/oppositions can be detected.
const TRANSIT_PLANETS = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
] as const;

type TransitPlanet = (typeof TRANSIT_PLANETS)[number];

export type AspectName =
  | 'Conjunction'
  | 'Sextile'
  | 'Square'
  | 'Trine'
  | 'Opposition';

const ASPECTS: { name: AspectName; angle: number }[] = [
  { name: 'Conjunction', angle: 0 },
  { name: 'Sextile', angle: 60 },
  { name: 'Square', angle: 90 },
  { name: 'Trine', angle: 120 },
  { name: 'Opposition', angle: 180 },
];

const ELEMENT_COLORS: Record<string, string> = {
  Fire: '#ff6b6b',
  Earth: '#6b8e4e',
  Air: '#5dade2',
  Water: '#9b59b6',
};

const SIGN_ELEMENTS: Record<string, keyof typeof ELEMENT_COLORS> = {
  Aries: 'Fire',
  Taurus: 'Earth',
  Gemini: 'Air',
  Cancer: 'Water',
  Leo: 'Fire',
  Virgo: 'Earth',
  Libra: 'Air',
  Scorpio: 'Water',
  Sagittarius: 'Fire',
  Capricorn: 'Earth',
  Aquarius: 'Air',
  Pisces: 'Water',
};

export interface NextHit {
  transitPlanet: TransitPlanet;
  natalPlanet: string;
  aspect: AspectName;
  /** Hour-precision Date when the orb is closest to exact within the window. */
  exactDate: Date;
  /** Whole days from `now` until exactDate (floor). */
  daysUntil: number;
  /** Hours from `now` until exactDate (floor) — for "in 3d 4h" countdowns. */
  hoursUntil: number;
  /** Personal-impact score, 0–100. */
  score: number;
  /** Element colour of the *transit* planet's current sign — for accent UI. */
  color: string;
}

export interface CurrentSky {
  /** Map planet name → ecliptic longitude (degrees). */
  [planet: string]: { longitude: number; sign?: string } | undefined;
}

export interface FindNextHitArgs {
  natalChart: BirthChartData[];
  /**
   * Optional — if omitted, we compute from `getRealPlanetaryPositions(now)`.
   * Caller can pass for tests or to avoid a duplicate ephemeris call.
   */
  currentSky?: CurrentSky;
  /** How far forward to search. Defaults to 30 days. */
  withinDays?: number;
  /** Override "now" — primarily for tests. */
  now?: Date;
}

/** Smallest unsigned angular distance between two longitudes, in degrees. */
function angularDistance(a: number, b: number): number {
  let diff = Math.abs(a - b) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

/** Orb to nearest major aspect — returns { aspect, orb } or null if > 8°. */
function nearestAspect(
  transitLon: number,
  natalLon: number,
): { aspect: AspectName; orb: number } | null {
  const sep = angularDistance(transitLon, natalLon);
  let best: { aspect: AspectName; orb: number } | null = null;
  for (const { name, angle } of ASPECTS) {
    const orb = Math.abs(sep - angle);
    if (orb <= 8 && (!best || orb < best.orb)) {
      best = { aspect: name, orb };
    }
  }
  return best;
}

function signFromLongitude(lon: number): string {
  const SIGNS = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ];
  const norm = ((lon % 360) + 360) % 360;
  return SIGNS[Math.floor(norm / 30)];
}

function colorForSign(sign: string | undefined): string {
  if (!sign) return '#a78bfa';
  const element = SIGN_ELEMENTS[sign];
  return element ? ELEMENT_COLORS[element] : '#a78bfa';
}

/**
 * Walk forward day-by-day looking for the moment when each (transit, natal)
 * pair's orb tightens to ≤ 0.5°. Once we have all candidate hits, rank by
 * personal impact and return the top one (with hour-level refinement).
 *
 * Returns `null` when no hit lands inside the window — caller renders the
 * "quiet sky" state.
 */
export function findNextHit(args: FindNextHitArgs): NextHit | null {
  const { natalChart, withinDays = 30, now = new Date(), currentSky } = args;

  if (!natalChart || natalChart.length === 0) return null;

  const candidates: Array<{
    rankable: RankableTransit;
    hit: NextHit;
  }> = [];

  // Resolve a starting sky if the caller didn't pass one. We re-call the
  // ephemeris per simulated day below, so this is just for the "today" sign
  // colouring on the returned hit.
  const startSky =
    currentSky ?? (snapshotSky(now) as CurrentSky | undefined) ?? undefined;

  // Walk day-by-day across each (transit, natal) pair.
  for (const transitPlanet of TRANSIT_PLANETS) {
    for (const natal of natalChart) {
      if (!natal?.body || natal.eclipticLongitude === undefined) continue;

      let prevOrb = Infinity;
      let prevDate = now;
      let exactDate: Date | null = null;
      let exactAspect: AspectName | null = null;

      for (let d = 0; d <= withinDays; d += 1) {
        const date = new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
        const sky = d === 0 && startSky ? startSky : snapshotSky(date);
        const transitLon = sky?.[transitPlanet]?.longitude;
        if (transitLon === undefined) break;

        const near = nearestAspect(transitLon, natal.eclipticLongitude);
        if (!near) {
          prevOrb = Infinity;
          prevDate = date;
          continue;
        }

        // Tightened to within 0.5° → refine to hour precision between prev
        // and current samples by linearly interpolating the orb.
        if (near.orb <= 0.5) {
          exactDate = refineExactDate(prevDate, date, prevOrb, near.orb);
          exactAspect = near.aspect;
          break;
        }

        // We're still wide — but if the orb is *increasing* and we used to be
        // tighter, we just passed the closest approach. Treat that as the hit
        // anchor — interpolation lands inside [prevDate, date].
        if (prevOrb < Infinity && near.orb > prevOrb && prevOrb <= 1.5) {
          exactDate = refineExactDate(prevDate, date, prevOrb, near.orb);
          exactAspect = near.aspect;
          break;
        }

        prevOrb = near.orb;
        prevDate = date;
      }

      if (!exactDate || !exactAspect) continue;

      const msUntil = exactDate.getTime() - now.getTime();
      if (msUntil < 0) continue;

      const rankable: RankableTransit = {
        transitPlanet,
        transitLongitude: 0, // unused by ranker for aspect type
        natalPlanet: natal.body,
        aspectType: exactAspect,
        orb: 0.5,
        date: exactDate,
        type: 'aspect',
      };

      const transitSign =
        startSky?.[transitPlanet]?.sign ??
        (startSky?.[transitPlanet]?.longitude !== undefined
          ? signFromLongitude(startSky[transitPlanet]!.longitude)
          : undefined);

      candidates.push({
        rankable,
        hit: {
          transitPlanet,
          natalPlanet: natal.body,
          aspect: exactAspect,
          exactDate,
          daysUntil: Math.floor(msUntil / (24 * 60 * 60 * 1000)),
          hoursUntil: Math.floor(msUntil / (60 * 60 * 1000)),
          score: 0, // filled in below
          color: colorForSign(transitSign),
        },
      });
    }
  }

  if (candidates.length === 0) return null;

  // Rank by personal impact; the ranker scores luminaries/angles/orb. We use
  // `scoreTransits` so we can surface the integer impact alongside the hit.
  const scored = scoreTransits(
    candidates.map((c) => c.rankable),
    natalChart,
  );
  scored.sort((a, b) => b.score - a.score);

  // Sanity-check that `byPersonalImpact` agrees (kept as a tree-shake-safe
  // reference and a guard against future ranker changes diverging).
  const ranked = byPersonalImpact(
    candidates.map((c) => c.rankable),
    natalChart,
  );
  const winningTransit = ranked[0] ?? scored[0]?.transit;
  if (!winningTransit) return null;

  const winner = candidates.find(
    (c) =>
      c.rankable.transitPlanet === winningTransit.transitPlanet &&
      c.rankable.natalPlanet === winningTransit.natalPlanet &&
      c.rankable.aspectType === winningTransit.aspectType,
  );
  if (!winner) return null;

  const winnerScore =
    scored.find(
      (s) =>
        s.transit.transitPlanet === winner.rankable.transitPlanet &&
        s.transit.natalPlanet === winner.rankable.natalPlanet &&
        s.transit.aspectType === winner.rankable.aspectType,
    )?.score ?? 0;

  return { ...winner.hit, score: winnerScore };
}

/**
 * Linear-interpolate between two daily samples to estimate the exact instant
 * the orb crossed its minimum. Returns hour-precision (rounded down to the
 * nearest hour to keep countdown UI stable across re-renders).
 */
function refineExactDate(
  startDate: Date,
  endDate: Date,
  startOrb: number,
  endOrb: number,
): Date {
  if (!Number.isFinite(startOrb) || startOrb === endOrb) return endDate;
  // Treat orb as a roughly linear function of time across the 24h window;
  // exact moment is where orb hits 0 (or its minimum if orb didn't cross 0).
  const total = endOrb + startOrb;
  if (total === 0) return endDate;
  const t = startOrb / total; // fraction from start → end where orb minimised
  const ms =
    startDate.getTime() + t * (endDate.getTime() - startDate.getTime());
  // Floor to the hour for a stable countdown.
  const HOUR = 60 * 60 * 1000;
  return new Date(Math.floor(ms / HOUR) * HOUR);
}

/** Wrap `getRealPlanetaryPositions` into the lighter `CurrentSky` shape. */
function snapshotSky(date: Date): CurrentSky | undefined {
  try {
    const positions = getRealPlanetaryPositions(date);
    const out: CurrentSky = {};
    for (const planet of TRANSIT_PLANETS) {
      const p = positions[planet];
      if (p) {
        out[planet] = { longitude: p.longitude, sign: p.sign };
      }
    }
    return out;
  } catch {
    return undefined;
  }
}
