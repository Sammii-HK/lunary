/**
 * Notable Days — forward-looking 90-day calendar where each day is scored
 * by personal-impact (transits hitting the user's natal chart).
 *
 * Pure utility (no I/O, no DB) — the API route loads natal data and calls
 * `scoreNextNDays`. Reuses the existing `byPersonalImpact` heuristic from
 * `@/lib/transits/personal-impact-rank` so we don't reimplement transit math.
 */

import {
  scoreTransits,
  type RankableTransit,
} from '@/lib/transits/personal-impact-rank';
import { getRealPlanetaryPositions } from '../../../utils/astrology/astronomical-data';
import type { BirthChartData } from '../../../utils/astrology/birthChart';

export type NotableDayTheme =
  | 'career'
  | 'love'
  | 'healing'
  | 'learning'
  | 'structural'
  | 'general';

export type NotableAspect = {
  transitPlanet: string;
  natalPlanet: string;
  aspect: string; // 'Conjunction'|'Opposition'|'Square'|'Trine'|'Sextile'
  exactness: number; // orb in degrees, smaller = more exact
};

export type NotableDay = {
  date: string; // YYYY-MM-DD
  score: number; // 0-100
  topAspects: NotableAspect[];
  theme: NotableDayTheme;
  oneLiner: string;
};

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

// Aspect name -> exact angle. Tight orbs only — we want days that *burn*.
const ASPECTS: Array<{ name: string; angle: number; orb: number }> = [
  { name: 'Conjunction', angle: 0, orb: 2 },
  { name: 'Opposition', angle: 180, orb: 2 },
  { name: 'Square', angle: 90, orb: 1.5 },
  { name: 'Trine', angle: 120, orb: 1.5 },
  { name: 'Sextile', angle: 60, orb: 1 },
];

// Theme classification: which natal planet got hit decides the life area.
// Order matters — first match wins, so put strongest signal up top.
const THEME_BY_NATAL: Record<string, NotableDayTheme> = {
  Venus: 'love',
  Saturn: 'structural',
  Mercury: 'learning',
  Jupiter: 'learning',
  Sun: 'career',
  Mars: 'career',
  Midheaven: 'career',
  MC: 'career',
  Moon: 'healing',
  Neptune: 'healing',
  Pluto: 'structural',
  Uranus: 'structural',
  Ascendant: 'general',
  Asc: 'general',
  AC: 'general',
};

function angularDistance(a: number, b: number): number {
  let diff = Math.abs(a - b) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

function findAspect(
  transitLong: number,
  natalLong: number,
): { aspect: string; orb: number } | null {
  const sep = angularDistance(transitLong, natalLong);
  for (const { name, angle, orb } of ASPECTS) {
    const delta = Math.abs(sep - angle);
    if (delta <= orb) return { aspect: name, orb: delta };
  }
  return null;
}

function classifyTheme(topAspects: NotableAspect[]): NotableDayTheme {
  // Use the highest-impact aspect's natal target to pick a theme.
  for (const aspect of topAspects) {
    const theme = THEME_BY_NATAL[aspect.natalPlanet];
    if (theme && theme !== 'general') return theme;
  }
  return 'general';
}

function aspectGlyph(aspect: string): string {
  switch (aspect) {
    case 'Conjunction':
      return 'meets';
    case 'Opposition':
      return 'opposes';
    case 'Square':
      return 'squares';
    case 'Trine':
      return 'trines';
    case 'Sextile':
      return 'sextiles';
    default:
      return 'aspects';
  }
}

function buildOneLiner(
  topAspects: NotableAspect[],
  theme: NotableDayTheme,
): string {
  if (topAspects.length === 0) return 'A quiet, low-charge day.';
  const top = topAspects[0];
  const themeFlavour: Record<NotableDayTheme, string> = {
    career: 'a career-shaping day',
    love: 'a heart-forward day',
    healing: 'a tender, healing day',
    learning: 'a clarity-bringing day',
    structural: 'a structural-shift day',
    general: 'a charged day',
  };
  return `${top.transitPlanet} ${aspectGlyph(top.aspect)} your natal ${top.natalPlanet} — ${themeFlavour[theme]}.`;
}

function startOfDayUTC(d: Date): Date {
  const out = new Date(d);
  out.setUTCHours(12, 0, 0, 0); // noon UTC, stable for ephemeris snapshots
  return out;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export type ScoreNextNDaysArgs = {
  natalChart: BirthChartData[];
  days?: number;
  /** Optional override for "today" — useful in tests. */
  from?: Date;
};

/**
 * Walk forward `days` days, snapshot transit positions at noon UTC each day,
 * find tight aspects to natal points, and rank by personal-impact.
 *
 * Returns one NotableDay per day, including quiet ones (score may be 0).
 */
export function scoreNextNDays({
  natalChart,
  days = 90,
  from,
}: ScoreNextNDaysArgs): NotableDay[] {
  if (!Array.isArray(natalChart) || natalChart.length === 0) return [];

  const start = startOfDayUTC(from ?? new Date());
  const out: NotableDay[] = [];

  for (let dayIdx = 0; dayIdx < days; dayIdx += 1) {
    const date = new Date(start.getTime() + dayIdx * 24 * 60 * 60 * 1000);

    let positions: Record<string, any>;
    try {
      positions = getRealPlanetaryPositions(date);
    } catch {
      // Skip days where ephemeris fails — surface as quiet day.
      out.push({
        date: isoDate(date),
        score: 0,
        topAspects: [],
        theme: 'general',
        oneLiner: 'A quiet day.',
      });
      continue;
    }

    // Build a list of RankableTransit candidates: every aspect from a transiting
    // planet to a natal point that falls within tight orb.
    const candidates: Array<RankableTransit & NotableAspect> = [];
    for (const transitPlanet of TRANSIT_PLANETS) {
      const tPos = positions[transitPlanet];
      if (!tPos || typeof tPos.longitude !== 'number') continue;
      for (const natal of natalChart) {
        if (!natal || typeof natal.eclipticLongitude !== 'number') continue;
        // Skip self-aspects (transit Sun to natal Sun is fine — different times).
        const hit = findAspect(tPos.longitude, natal.eclipticLongitude);
        if (!hit) continue;

        candidates.push({
          // RankableTransit fields
          transitPlanet,
          transitLongitude: tPos.longitude,
          natalPlanet: natal.body,
          aspectType: hit.aspect,
          orb: hit.orb,
          date,
          type: 'aspect',
          // NotableAspect mirror fields (kept on the same object for downstream use)
          aspect: hit.aspect,
          exactness: hit.orb,
        });
      }
    }

    if (candidates.length === 0) {
      out.push({
        date: isoDate(date),
        score: 0,
        topAspects: [],
        theme: 'general',
        oneLiner: 'A quiet day.',
      });
      continue;
    }

    // Score every candidate once, then sort descending by impact. Top three
    // feed the display and drive theme classification.
    const scored = scoreTransits(candidates, natalChart).sort(
      (a, b) => b.score - a.score,
    );
    const topAspects: NotableAspect[] = scored
      .slice(0, 3)
      .map(({ transit }) => ({
        transitPlanet: transit.transitPlanet,
        natalPlanet: transit.natalPlanet ?? '',
        aspect: transit.aspectType ?? transit.aspect,
        exactness: Math.round((transit.orb ?? transit.exactness) * 100) / 100,
      }));

    // Day score = peak single-aspect impact. We want days to "burn bright"
    // when a single major hit lands, not be diluted by averaging.
    const dayScore = scored[0]?.score ?? 0;

    const theme = classifyTheme(topAspects);
    const oneLiner = buildOneLiner(topAspects, theme);

    out.push({
      date: isoDate(date),
      score: dayScore,
      topAspects,
      theme,
      oneLiner,
    });
  }

  return out;
}

/**
 * Convenience: pull the top-N most pivotal days, one per theme where possible
 * so the user sees a spread rather than five Saturn-square-Saturn days.
 */
export function pickTopDays(days: NotableDay[], count = 5): NotableDay[] {
  const sorted = [...days].sort((a, b) => b.score - a.score);
  const picked: NotableDay[] = [];
  const seenThemes = new Set<NotableDayTheme>();

  // First pass — one per theme.
  for (const day of sorted) {
    if (picked.length >= count) break;
    if (day.score <= 0) break;
    if (seenThemes.has(day.theme)) continue;
    picked.push(day);
    seenThemes.add(day.theme);
  }

  // Second pass — fill remaining slots with the next-best regardless of theme.
  for (const day of sorted) {
    if (picked.length >= count) break;
    if (day.score <= 0) break;
    if (picked.includes(day)) continue;
    picked.push(day);
  }

  return picked;
}
