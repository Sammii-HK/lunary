/**
 * Couples Mode v1 — pure forecast utility.
 *
 * Given two birth charts and the current sky, computes:
 *   1. A baseline natal-to-natal synastry score.
 *   2. The single tightest synastry aspect that is *also* being lit up by
 *      today's transits (the "daily aspect").
 *   3. A 14-day shared forecast: each day's score is the synastry baseline
 *      modulated by how active the relevant transits are that day.
 *
 * Reuses `calculateSynastry` (utils/astrology/synastry) and
 * `byPersonalImpact` (src/lib/transits/personal-impact-rank). No transit math
 * is reimplemented here — we just rank what's already on the table.
 */

import { calculateSynastry } from '../../../utils/astrology/synastry';
import type {
  SynastryAspect,
  SynastryResult,
} from '../../../utils/astrology/synastry';
import type { BirthChartData } from '../../../utils/astrology/birthChart';
import {
  byPersonalImpact,
  type RankableTransit,
} from '@/lib/transits/personal-impact-rank';
import type {
  CoupleDailyAspect,
  CoupleDayForecast,
  CoupleDayTheme,
  CoupleSummary,
} from './types';

const ASPECT_ANGLES: Record<string, number> = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  opposition: 180,
};

const ASPECT_NAME_TITLE: Record<string, string> = {
  conjunction: 'Conjunction',
  sextile: 'Sextile',
  square: 'Square',
  trine: 'Trine',
  opposition: 'Opposition',
};

const TRANSIT_ACTIVATION_ORB = 4; // degrees — how close a transit needs to be
//                                   to a natal-to-natal midpoint to "activate"
//                                   the synastry aspect for the day.

/** Skies as fed in: { Sun: { longitude: 12.34 }, Moon: { ... }, ... } */
export interface SkyLongitudes {
  [planet: string]: { longitude: number; retrograde?: boolean };
}

export interface ComputeCoupleForecastInput {
  userChart: BirthChartData[];
  partnerChart: BirthChartData[];
  /** Today's sky (planet → ecliptic longitude). */
  currentSky: SkyLongitudes;
  /**
   * Optional per-day skies for the 14-day calendar. If omitted, we fall back
   * to a smoothed approximation from the current sky alone.
   * Indexed by ISO date (YYYY-MM-DD).
   */
  dailySkies?: Record<string, SkyLongitudes>;
  /** Defaults to 14. */
  days?: number;
  partnerId: string;
  partnerName: string;
  partnerHandle?: string;
  pairedAt: Date;
}

function normalizeAngle(angle: number): number {
  let a = angle % 360;
  if (a < 0) a += 360;
  return a;
}

function angularSeparation(a: number, b: number): number {
  const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b)) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/**
 * For a given synastry aspect, compute the closest "activation longitude" —
 * i.e. the natal longitude of either side. If today's transits are closely
 * conjunct or in major aspect to either natal point, the synastry aspect
 * counts as "activated" for that day.
 */
function activationLongitudes(
  aspect: SynastryAspect,
  chartA: BirthChartData[],
  chartB: BirthChartData[],
): number[] {
  const longA = chartA.find(
    (p) => p.body === aspect.personA.planet && p.sign === aspect.personA.sign,
  )?.eclipticLongitude;
  const longB = chartB.find(
    (p) => p.body === aspect.personB.planet && p.sign === aspect.personB.sign,
  )?.eclipticLongitude;
  return [longA, longB].filter(
    (v): v is number => typeof v === 'number' && Number.isFinite(v),
  );
}

/**
 * Closest angular separation between any planet in `sky` and any longitude in
 * `targets` — across the major aspect family. Returns the smallest orb (deg).
 */
function closestTransitOrb(
  sky: SkyLongitudes,
  targets: number[],
): { orb: number; transitPlanet: string; aspect: string } | null {
  let best: { orb: number; transitPlanet: string; aspect: string } | null =
    null;

  for (const [transitPlanet, payload] of Object.entries(sky)) {
    if (!payload || typeof payload.longitude !== 'number') continue;
    const transitLong = payload.longitude;
    for (const target of targets) {
      for (const [aspectName, aspectAngle] of Object.entries(ASPECT_ANGLES)) {
        const sep = angularSeparation(transitLong, target);
        const orb = Math.abs(sep - aspectAngle);
        if (!best || orb < best.orb) {
          best = { orb, transitPlanet, aspect: aspectName };
        }
      }
    }
  }
  return best;
}

/**
 * Pick the day's "headline" synastry aspect: the tightest natal aspect that
 * is also being most-activated by today's transits.
 */
function pickDailyAspect(
  synastry: SynastryResult,
  chartA: BirthChartData[],
  chartB: BirthChartData[],
  sky: SkyLongitudes,
): { aspect: SynastryAspect; activationOrb: number } | null {
  if (!synastry.aspects || synastry.aspects.length === 0) return null;

  // Prefer aspects that are tight natally AND tightly activated by transits.
  // Score = natal orb + (best transit orb within activation window).
  let best: { aspect: SynastryAspect; activationOrb: number } | null = null;

  for (const aspect of synastry.aspects) {
    const targets = activationLongitudes(aspect, chartA, chartB);
    if (targets.length === 0) continue;
    const transitHit = closestTransitOrb(sky, targets);
    if (!transitHit) continue;

    // Combined heuristic: tight natal aspect + tight activation wins.
    const combined = aspect.orb + transitHit.orb * 0.6;
    if (!best || combined < best.activationOrb) {
      best = { aspect, activationOrb: combined };
    }
  }

  // Fallback: even without strong activation, surface the tightest natal aspect.
  if (!best) {
    return { aspect: synastry.aspects[0], activationOrb: 99 };
  }
  return best;
}

/**
 * Modulate the synastry baseline by how harmonious/challenging today's
 * transits are landing on the couple's combined personal planets.
 */
function dailyTransitModulator(
  chartA: BirthChartData[],
  chartB: BirthChartData[],
  sky: SkyLongitudes,
  date: Date,
): number {
  const transits: RankableTransit[] = [];
  const PERSONAL = new Set([
    'Sun',
    'Moon',
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
  ]);

  // Build aspect-to-natal RankableTransits by checking each transit planet
  // against each personal natal planet on both charts.
  const allNatal: Array<{ owner: 'A' | 'B'; planet: BirthChartData }> = [];
  for (const p of chartA) {
    if (PERSONAL.has(p.body)) allNatal.push({ owner: 'A', planet: p });
  }
  for (const p of chartB) {
    if (PERSONAL.has(p.body)) allNatal.push({ owner: 'B', planet: p });
  }

  for (const [transitPlanet, payload] of Object.entries(sky)) {
    if (!payload || typeof payload.longitude !== 'number') continue;
    const transitLong = payload.longitude;
    for (const { planet } of allNatal) {
      let bestAspect: { name: string; orb: number } | null = null;
      for (const [aspectName, aspectAngle] of Object.entries(ASPECT_ANGLES)) {
        const sep = angularSeparation(transitLong, planet.eclipticLongitude);
        const orb = Math.abs(sep - aspectAngle);
        if (orb <= 6 && (!bestAspect || orb < bestAspect.orb)) {
          bestAspect = { name: aspectName, orb };
        }
      }
      if (bestAspect) {
        transits.push({
          transitPlanet,
          transitLongitude: transitLong,
          natalPlanet: planet.body,
          aspectType: ASPECT_NAME_TITLE[bestAspect.name] ?? bestAspect.name,
          orb: bestAspect.orb,
          date,
          type: 'aspect',
        });
      }
    }
  }

  if (transits.length === 0) return 0;

  // Use byPersonalImpact to get the top 5 most-meaningful events. Then
  // turn aspect natures into a +/- modulator.
  const ranked = byPersonalImpact(transits, [...chartA, ...chartB]).slice(0, 5);

  let modulator = 0;
  for (const t of ranked) {
    const aspect = (t.aspectType ?? '').toLowerCase();
    if (aspect === 'trine' || aspect === 'sextile') modulator += 3;
    else if (aspect === 'conjunction') modulator += 1;
    else if (aspect === 'square' || aspect === 'opposition') modulator -= 3;
  }
  // Clamp into ±15.
  return Math.max(-15, Math.min(15, modulator));
}

function themeFor(score: number): CoupleDayTheme {
  if (score >= 65) return 'harmonious';
  if (score <= 40) return 'friction';
  return 'mixed';
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function naturalToCoupleAspect(aspect: SynastryAspect): CoupleDailyAspect {
  return {
    planetA: aspect.personA.planet,
    planetB: aspect.personB.planet,
    aspect: aspect.aspect,
    aspectSymbol: aspect.aspectSymbol,
    orb: aspect.orb,
    nature: aspect.nature,
    description: aspect.description,
  };
}

/**
 * Compute the full Couples Mode forecast.
 */
export function computeCoupleForecast(
  input: ComputeCoupleForecastInput,
): CoupleSummary {
  const {
    userChart,
    partnerChart,
    currentSky,
    dailySkies,
    days = 14,
    partnerId,
    partnerName,
    partnerHandle,
    pairedAt,
  } = input;

  const synastry = calculateSynastry(userChart, partnerChart);
  const baseline = synastry.compatibilityScore;

  const today = new Date();
  today.setUTCHours(12, 0, 0, 0);

  // Today's headline aspect — natal-aspect activated by today's transits.
  const headline = pickDailyAspect(
    synastry,
    userChart,
    partnerChart,
    currentSky,
  );

  const todayModulator = dailyTransitModulator(
    userChart,
    partnerChart,
    currentSky,
    today,
  );
  const dailyScore = Math.max(
    0,
    Math.min(100, Math.round(baseline + todayModulator)),
  );

  // 14-day strip.
  const fourteenDay: CoupleDayForecast[] = [];
  for (let i = 0; i < days; i += 1) {
    const day = new Date(today.getTime() + i * 86400000);
    const dayKey = isoDate(day);
    const sky = dailySkies?.[dayKey] ?? currentSky;
    const mod = dailyTransitModulator(userChart, partnerChart, sky, day);
    const score = Math.max(0, Math.min(100, Math.round(baseline + mod)));
    fourteenDay.push({ date: dayKey, score, theme: themeFor(score) });
  }

  // Override day 0 with the activated daily score we already computed.
  if (fourteenDay.length > 0) {
    fourteenDay[0] = {
      date: isoDate(today),
      score: dailyScore,
      theme: themeFor(dailyScore),
    };
  }

  return {
    partnerId,
    partnerName,
    partnerHandle,
    pairedAt: pairedAt.toISOString(),
    dailyScore,
    dailyAspect: headline ? naturalToCoupleAspect(headline.aspect) : null,
    fourteenDay,
  };
}
