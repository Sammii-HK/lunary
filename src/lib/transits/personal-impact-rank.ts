/**
 * Personal-impact ranking for transits.
 *
 * Pure utilities — no side effects, SSR-safe. Used to score and sort transit
 * events by how meaningfully they touch a user's natal chart so the calendar
 * can surface the most relevant items first.
 */

import type { BirthChartData } from '../../../utils/astrology/birthChart';

export type RankableTransitType =
  | 'aspect'
  | 'ingress'
  | 'retrograde'
  | 'lunation'
  | 'eclipse';

export type RankableTransit = {
  transitPlanet: string; // 'Sun'..'Pluto'
  transitLongitude: number; // 0-360
  natalPlanet?: string; // optional — only if it's an aspect-to-natal
  aspectType?: string; // 'Conjunction'|'Opposition'|'Trine'|'Square'|'Sextile'
  orb?: number; // current orb in degrees
  date: Date; // when this is exact / peaks
  type: RankableTransitType;
};

const LUMINARIES_AND_ANGLES = new Set([
  'Sun',
  'Moon',
  'Ascendant',
  'Midheaven',
  'Asc',
  'MC',
  'AC',
]);

const NATAL_ANGLES = new Set([
  'Ascendant',
  'Midheaven',
  'Descendant',
  'Imum Coeli',
  'Asc',
  'MC',
  'Desc',
  'IC',
  'AC',
  'DC',
]);

const INNER_PLANETS = new Set(['Mercury', 'Venus', 'Mars']);
const OUTER_PLANETS = new Set(['Saturn', 'Uranus', 'Neptune', 'Pluto']);

const MAJOR_ASPECT_TYPES = new Set([
  'Conjunction',
  'Opposition',
  'Square',
  'Trine',
  'Sextile',
]);

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function orbScore(orb: number | undefined): number {
  if (orb === undefined || Number.isNaN(orb)) return 5;
  const abs = Math.abs(orb);
  if (abs <= 1) return 50;
  if (abs <= 3) return 30;
  if (abs <= 6) return 15;
  return 5;
}

function aspectScore(aspectType: string | undefined): number {
  if (!aspectType) return 0;
  switch (aspectType) {
    case 'Conjunction':
    case 'Opposition':
      return 20;
    case 'Square':
      return 18;
    case 'Trine':
      return 15;
    case 'Sextile':
      return 10;
    default:
      return 0;
  }
}

function aspectedPlanetScore(natalPlanet: string | undefined): number {
  if (!natalPlanet) return 0;
  if (LUMINARIES_AND_ANGLES.has(natalPlanet) || NATAL_ANGLES.has(natalPlanet))
    return 20;
  if (INNER_PLANETS.has(natalPlanet)) return 12;
  if (OUTER_PLANETS.has(natalPlanet)) return 6;
  // Fallback for nodes/chiron/asteroids — treat as inner-ish.
  return 8;
}

function transitPlanetScore(transitPlanet: string): number {
  if (OUTER_PLANETS.has(transitPlanet)) return 15;
  if (transitPlanet === 'Mars' || transitPlanet === 'Jupiter') return 10;
  return 5;
}

function angleBoost(
  natalPlanet: string | undefined,
  natalChart: BirthChartData[],
): number {
  if (!natalPlanet) return 0;
  if (NATAL_ANGLES.has(natalPlanet)) return 15;
  // Only count it as an "angle hit" if the natal chart actually has that angle.
  const hit = natalChart.some(
    (p) => p.body === natalPlanet && NATAL_ANGLES.has(p.body),
  );
  return hit ? 15 : 0;
}

/**
 * Rank a single transit by personal impact, returning a score in [0, 100].
 */
export function rankPersonalImpact(
  t: RankableTransit,
  natalChart: BirthChartData[],
): number {
  // Hard-coded high-impact event categories.
  if (t.type === 'eclipse') return 95;
  if (t.type === 'retrograde') {
    // Saturn / Jupiter / Pluto stations are big-deal moments.
    if (
      t.transitPlanet === 'Saturn' ||
      t.transitPlanet === 'Jupiter' ||
      t.transitPlanet === 'Pluto'
    ) {
      return 80;
    }
    // Other retrograde stations still meaningful but not capped.
  }
  if (t.type === 'lunation' && t.natalPlanet) {
    // Major lunations (New/Full Moon) hitting a natal point.
    return 70;
  }

  let score = 0;
  score += orbScore(t.orb);
  score += aspectScore(t.aspectType);
  score += aspectedPlanetScore(t.natalPlanet);
  score += transitPlanetScore(t.transitPlanet);
  score += angleBoost(t.natalPlanet, natalChart);

  return clamp(Math.round(score), 0, 100);
}

/**
 * Sort helper — returns a new array sorted by personal impact, descending.
 */
export function byPersonalImpact<T extends RankableTransit>(
  transits: T[],
  natal: BirthChartData[],
): T[] {
  return [...transits]
    .map((t) => ({ t, score: rankPersonalImpact(t, natal) }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.t);
}

/**
 * Convenience helper — exposes the score alongside the transit so consumers
 * can filter by threshold without re-running the heuristic.
 */
export function scoreTransits<T extends RankableTransit>(
  transits: T[],
  natal: BirthChartData[],
): Array<{ transit: T; score: number }> {
  return transits.map((transit) => ({
    transit,
    score: rankPersonalImpact(transit, natal),
  }));
}

export const MAJOR_ASPECTS = MAJOR_ASPECT_TYPES;
