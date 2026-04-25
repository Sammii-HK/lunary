/**
 * Couples Mode v2 — pure composite-chart utility.
 *
 * The composite chart treats a relationship as a third entity: for each shared
 * body (planet, angle, point), the composite longitude is the midpoint of the
 * two natal longitudes — using the SHORTER arc (so ~10° Aries midpointed with
 * ~350° Pisces lands near 0° Aries, not 180° Libra).
 *
 * Pure module — no IO, no async. Safe to import server- or client-side.
 */

import type { BirthChartData } from '../../../utils/astrology/birthChart';
import { getLongitudeInTropicalSign } from '../../../utils/astrology/zodiacSystems';

/** Element/modality categorisation for the dominant tally. */
const SIGN_ELEMENT: Record<string, 'Fire' | 'Earth' | 'Air' | 'Water'> = {
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

const SIGN_MODALITY: Record<string, 'Cardinal' | 'Fixed' | 'Mutable'> = {
  Aries: 'Cardinal',
  Taurus: 'Fixed',
  Gemini: 'Mutable',
  Cancer: 'Cardinal',
  Leo: 'Fixed',
  Virgo: 'Mutable',
  Libra: 'Cardinal',
  Scorpio: 'Fixed',
  Sagittarius: 'Mutable',
  Capricorn: 'Cardinal',
  Aquarius: 'Fixed',
  Pisces: 'Mutable',
};

/** Bodies that contribute to dominant element/modality (the "luminary set"). */
const DOMINANT_BODIES = new Set([
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Ascendant',
]);

/**
 * Aspect orbs for the composite chart's internal aspects. Same orbs as the
 * synastry layer for consistency.
 */
const COMPOSITE_ASPECTS: Array<{
  name: string;
  symbol: string;
  angle: number;
  orb: number;
  nature: 'harmonious' | 'challenging' | 'neutral';
}> = [
  { name: 'conjunction', symbol: '☌', angle: 0, orb: 8, nature: 'neutral' },
  {
    name: 'opposition',
    symbol: '☍',
    angle: 180,
    orb: 7,
    nature: 'challenging',
  },
  { name: 'trine', symbol: '△', angle: 120, orb: 7, nature: 'harmonious' },
  { name: 'square', symbol: '□', angle: 90, orb: 6, nature: 'challenging' },
  { name: 'sextile', symbol: '⚹', angle: 60, orb: 5, nature: 'harmonious' },
];

export interface CompositeAspect {
  bodyA: string;
  bodyB: string;
  aspect: string;
  aspectSymbol: string;
  orb: number;
  nature: 'harmonious' | 'challenging' | 'neutral';
}

export interface CompositeChart {
  /** Composite placements, ready to feed straight into <BirthChart />. */
  placements: BirthChartData[];
  /** Most-represented element across the composite "luminary set". */
  dominantElement: 'Fire' | 'Earth' | 'Air' | 'Water';
  /** Most-represented modality across the composite "luminary set". */
  dominantModality: 'Cardinal' | 'Fixed' | 'Mutable';
  /** Tightest internal aspect — used as the relationship's signature. */
  signatureAspect: CompositeAspect | null;
  /** Lightweight English summary, suitable for OG cards / share previews. */
  summary: string;
}

export interface ComputeCompositeInput {
  chartA: BirthChartData[];
  chartB: BirthChartData[];
}

function normalizeAngle(angle: number): number {
  let a = angle % 360;
  if (a < 0) a += 360;
  return a;
}

/**
 * Midpoint of two ecliptic longitudes along the SHORTER arc.
 *
 * Wrap-around handling: if the two points sit on opposite sides of the 0/360
 * boundary (e.g. 350° and 10°), the naive average is 180° — the wrong side of
 * the circle. We detect that case (|diff| > 180), bump the smaller longitude
 * by 360, average, then `mod 360` back into range.
 */
export function midpointLongitude(lonA: number, lonB: number): number {
  const a = normalizeAngle(lonA);
  const b = normalizeAngle(lonB);
  const diff = Math.abs(a - b);
  if (diff > 180) {
    // Shorter arc crosses the 0°/360° boundary — lift the smaller side by 360
    // before averaging so we land on the correct side of the circle.
    const lifted = a < b ? a + 360 : b + 360;
    const partner = a < b ? b : a;
    return normalizeAngle((lifted + partner) / 2);
  }
  return normalizeAngle((a + b) / 2);
}

/** Closest angular separation between two longitudes (0..180). */
function angularSeparation(a: number, b: number): number {
  const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b)) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function findCompositeAspect(
  longA: number,
  longB: number,
): CompositeAspect | null {
  const sep = angularSeparation(longA, longB);
  let best: { def: (typeof COMPOSITE_ASPECTS)[number]; orb: number } | null =
    null;
  for (const def of COMPOSITE_ASPECTS) {
    const orb = Math.abs(sep - def.angle);
    if (orb <= def.orb && (!best || orb < best.orb)) {
      best = { def, orb };
    }
  }
  if (!best) return null;
  return {
    bodyA: '',
    bodyB: '',
    aspect: best.def.name,
    aspectSymbol: best.def.symbol,
    orb: Math.round(best.orb * 10) / 10,
    nature: best.def.nature,
  };
}

function indexByBody(chart: BirthChartData[]): Map<string, BirthChartData> {
  const map = new Map<string, BirthChartData>();
  for (const p of chart) {
    if (
      p &&
      typeof p.body === 'string' &&
      Number.isFinite(p.eclipticLongitude)
    ) {
      map.set(p.body, p);
    }
  }
  return map;
}

function tally<T extends string>(values: T[], fallback: T): T {
  if (values.length === 0) return fallback;
  const counts = new Map<T, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  let bestKey: T = fallback;
  let bestCount = -1;
  for (const [k, c] of counts) {
    if (c > bestCount) {
      bestKey = k;
      bestCount = c;
    }
  }
  return bestKey;
}

function buildSummary(input: {
  sun?: BirthChartData;
  moon?: BirthChartData;
  asc?: BirthChartData;
  dominantElement: CompositeChart['dominantElement'];
  signatureAspect: CompositeAspect | null;
}): string {
  const parts: string[] = [];
  const tone =
    input.dominantElement === 'Fire'
      ? 'a kindled, forward-leaning'
      : input.dominantElement === 'Earth'
        ? 'a grounded, build-something'
        : input.dominantElement === 'Air'
          ? 'a curious, idea-trading'
          : 'a tender, deep-feeling';
  parts.push(`Together you carry ${tone} signature.`);
  if (input.sun && input.moon) {
    parts.push(
      `Your composite Sun in ${input.sun.sign} and composite Moon in ${input.moon.sign} name what this relationship is here to do, and how it feels day-to-day.`,
    );
  }
  if (input.signatureAspect) {
    parts.push(
      `The tightest thread inside the chart is composite ${input.signatureAspect.bodyA} ${input.signatureAspect.aspect} ${input.signatureAspect.bodyB} — the relationship's defining tension or gift.`,
    );
  }
  return parts.join(' ');
}

function roundedDisplayPosition(longitude: number): {
  sign: string;
  degree: number;
  minute: number;
} {
  const roundedLongitude = normalizeAngle(longitude + 0.5 / 60);
  const signData = getLongitudeInTropicalSign(roundedLongitude);
  const degree = Math.floor(signData.degreeInSign);
  const minute = Math.floor((signData.degreeInSign - degree) * 60);
  return { sign: signData.sign, degree, minute };
}

/**
 * Compute the composite chart from two natal charts.
 */
export function computeComposite(input: ComputeCompositeInput): CompositeChart {
  const a = indexByBody(input.chartA);
  const b = indexByBody(input.chartB);

  // Iterate the union of bodies present in BOTH charts. (We need both sides
  // to compute a midpoint — single-sided bodies are dropped.)
  const sharedBodies: string[] = [];
  for (const body of a.keys()) {
    if (b.has(body)) sharedBodies.push(body);
  }

  const placements: BirthChartData[] = [];
  for (const body of sharedBodies) {
    const pa = a.get(body)!;
    const pb = b.get(body)!;
    const midLon = midpointLongitude(
      pa.eclipticLongitude,
      pb.eclipticLongitude,
    );
    const display = roundedDisplayPosition(midLon);
    placements.push({
      body,
      sign: display.sign,
      degree: display.degree,
      minute: display.minute,
      eclipticLongitude: midLon,
      // Midpoints have no inherent direction — composite charts conventionally
      // display retrograde flags from the natal sides only when they agree.
      retrograde: Boolean(pa.retrograde && pb.retrograde),
      house: pa.house ?? pb.house,
    });
  }

  // Dominant element / modality across the luminary set.
  const dominantSet = placements.filter((p) => DOMINANT_BODIES.has(p.body));
  const elementVotes = dominantSet
    .map((p) => SIGN_ELEMENT[p.sign])
    .filter((v): v is 'Fire' | 'Earth' | 'Air' | 'Water' => Boolean(v));
  const modalityVotes = dominantSet
    .map((p) => SIGN_MODALITY[p.sign])
    .filter((v): v is 'Cardinal' | 'Fixed' | 'Mutable' => Boolean(v));
  const dominantElement = tally(elementVotes, 'Air');
  const dominantModality = tally(modalityVotes, 'Mutable');

  // Tightest internal aspect among the personal planet / angle set.
  const ASPECT_BODIES = [
    'Sun',
    'Moon',
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
    'Ascendant',
    'Midheaven',
  ];
  let signatureAspect: CompositeAspect | null = null;
  for (let i = 0; i < placements.length; i += 1) {
    const pa = placements[i];
    if (!ASPECT_BODIES.includes(pa.body)) continue;
    for (let j = i + 1; j < placements.length; j += 1) {
      const pb = placements[j];
      if (!ASPECT_BODIES.includes(pb.body)) continue;
      const aspect = findCompositeAspect(
        pa.eclipticLongitude,
        pb.eclipticLongitude,
      );
      if (!aspect) continue;
      const named: CompositeAspect = {
        ...aspect,
        bodyA: pa.body,
        bodyB: pb.body,
      };
      if (!signatureAspect || named.orb < signatureAspect.orb) {
        signatureAspect = named;
      }
    }
  }

  const sun = placements.find((p) => p.body === 'Sun');
  const moon = placements.find((p) => p.body === 'Moon');
  const asc = placements.find((p) => p.body === 'Ascendant');

  const summary = buildSummary({
    sun,
    moon,
    asc,
    dominantElement,
    signatureAspect,
  });

  return {
    placements,
    dominantElement,
    dominantModality,
    signatureAspect,
    summary,
  };
}
