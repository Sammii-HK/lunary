/**
 * Cosmic Habits — correlation detector.
 *
 * Pure utility (no IO except the ephemeris cache inside
 * `getRealPlanetaryPositions`). For each entry we compute the dominant
 * transit-to-natal aspect on its date by reusing `byPersonalImpact` — only
 * the top hit per day is kept. Entries are bucketed by that aspect and we
 * compare bucket means to the user's overall mean for sleep, mood, and
 * practice rate.
 *
 * Thresholds (per spec):
 *   - sample size ≥ 3 + |effect| ≥ 10% → low confidence
 *   - sample size ≥ 5 + |effect| ≥ 15% → medium confidence
 *   - sample size ≥ 10 + |effect| ≥ 25% → high confidence
 *
 * Anything weaker is dropped. Output is sorted by |effectPct| desc.
 */

import { getRealPlanetaryPositions } from '../../../utils/astrology/astronomical-data';
import {
  byPersonalImpact,
  type RankableTransit,
} from '../transits/personal-impact-rank';
import type { BirthChartData } from '../../../utils/astrology/birthChart';
import {
  MOOD_VALUES,
  type HabitCapture,
  type HabitCorrelation,
  type HabitCorrelationConfidence,
  type HabitCorrelationKind,
} from './types';

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

const ASPECTS: { name: string; angle: number }[] = [
  { name: 'Conjunction', angle: 0 },
  { name: 'Sextile', angle: 60 },
  { name: 'Square', angle: 90 },
  { name: 'Trine', angle: 120 },
  { name: 'Opposition', angle: 180 },
];

const ASPECT_GLYPHS: Record<string, string> = {
  Conjunction: 'conjunct',
  Sextile: 'sextile',
  Square: 'square',
  Trine: 'trine',
  Opposition: 'opposition',
};

/** Entry shape detect() consumes — keep loose so callers can pass slim DTOs. */
export interface JournalEntryForDetect {
  id: number | string;
  /** ISO string or Date. */
  createdAt: string | Date;
  /** Parsed `content` JSON — must include `habitCapture` if tracked. */
  content: { habitCapture?: HabitCapture } | null | undefined;
}

export interface DetectArgs {
  entries: JournalEntryForDetect[];
  natalChart: BirthChartData[];
}

interface BucketAccumulator {
  transit: string;
  sleepValues: number[];
  moodValues: number[];
  practiceValues: number[]; // 1 or 0
}

const SECONDARY_THRESHOLDS: Array<{
  size: number;
  effect: number;
  confidence: HabitCorrelationConfidence;
}> = [
  { size: 10, effect: 25, confidence: 'high' },
  { size: 5, effect: 15, confidence: 'medium' },
  { size: 3, effect: 10, confidence: 'low' },
];

/** Smallest unsigned angular distance between two longitudes, in degrees. */
function angularDistance(a: number, b: number): number {
  let diff = Math.abs(a - b) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

function nearestAspect(
  transitLon: number,
  natalLon: number,
): { aspect: string; orb: number } | null {
  const sep = angularDistance(transitLon, natalLon);
  let best: { aspect: string; orb: number } | null = null;
  for (const { name, angle } of ASPECTS) {
    const orb = Math.abs(sep - angle);
    if (orb <= 6 && (!best || orb < best.orb)) {
      best = { aspect: name, orb };
    }
  }
  return best;
}

/** Snap a timestamp to local-day key so two entries on the same day share work. */
function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Compute the single dominant transit-to-natal aspect for a given date.
 * Reuses `byPersonalImpact` for ranking — only the top hit is returned.
 */
export function dominantAspectForDate(
  date: Date,
  natalChart: BirthChartData[],
): RankableTransit | null {
  if (!natalChart || natalChart.length === 0) return null;

  let positions: Record<string, { longitude: number; sign?: string }>;
  try {
    positions = getRealPlanetaryPositions(date) as Record<
      string,
      { longitude: number; sign?: string }
    >;
  } catch {
    return null;
  }

  const candidates: RankableTransit[] = [];

  for (const transitPlanet of TRANSIT_PLANETS) {
    const transitLon = positions?.[transitPlanet]?.longitude;
    if (transitLon === undefined) continue;
    for (const natal of natalChart) {
      if (!natal?.body || natal.eclipticLongitude === undefined) continue;
      const near = nearestAspect(transitLon, natal.eclipticLongitude);
      if (!near) continue;
      candidates.push({
        transitPlanet,
        transitLongitude: transitLon,
        natalPlanet: natal.body,
        aspectType: near.aspect,
        orb: near.orb,
        date,
        type: 'aspect',
      });
    }
  }

  if (candidates.length === 0) return null;
  const ranked = byPersonalImpact(candidates, natalChart);
  return ranked[0] ?? null;
}

function transitLabel(t: RankableTransit): string {
  const aspect = ASPECT_GLYPHS[t.aspectType ?? ''] ?? 'aspect';
  return `${t.transitPlanet} ${aspect} ${t.natalPlanet ?? '?'}`;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  let sum = 0;
  for (const v of values) sum += v;
  return sum / values.length;
}

function classifyConfidence(
  sampleSize: number,
  effectAbsPct: number,
): HabitCorrelationConfidence | null {
  for (const tier of SECONDARY_THRESHOLDS) {
    if (sampleSize >= tier.size && effectAbsPct >= tier.effect) {
      return tier.confidence;
    }
  }
  return null;
}

function describePolarity(kind: HabitCorrelationKind, signed: number): string {
  if (kind === 'sleep') return signed > 0 ? 'better' : 'worse';
  if (kind === 'mood') return signed > 0 ? 'lifts' : 'dips';
  return signed > 0 ? 'more often' : 'less often';
}

function buildOneLiner(
  kind: HabitCorrelationKind,
  transit: string,
  effectPct: number,
  sampleSize: number,
): string {
  const direction = describePolarity(kind, effectPct);
  const magnitude = Math.round(Math.abs(effectPct));
  if (kind === 'sleep') {
    return `You sleep ~${magnitude}% ${direction} on ${transit} days (n=${sampleSize}).`;
  }
  if (kind === 'mood') {
    return `Your mood ${direction} ~${magnitude}% on ${transit} days (n=${sampleSize}).`;
  }
  return `You practise ~${magnitude}% ${direction} on ${transit} days (n=${sampleSize}).`;
}

/**
 * Detect habit×transit correlations. Returns at most one correlation per
 * (kind, transit) pair, sorted by |effectPct| descending.
 */
export function detectHabitCorrelations(args: DetectArgs): HabitCorrelation[] {
  const { entries, natalChart } = args;
  if (!entries || entries.length === 0) return [];
  if (!natalChart || natalChart.length === 0) return [];

  // Group entries by their day so we only call the ephemeris once per date.
  const byDay = new Map<string, JournalEntryForDetect[]>();
  for (const entry of entries) {
    const date =
      entry.createdAt instanceof Date
        ? entry.createdAt
        : new Date(entry.createdAt);
    if (Number.isNaN(date.getTime())) continue;
    const key = dayKey(date);
    const list = byDay.get(key);
    if (list) list.push(entry);
    else byDay.set(key, [entry]);
  }

  const buckets = new Map<string, BucketAccumulator>();
  const allSleep: number[] = [];
  const allMood: number[] = [];
  const allPractice: number[] = [];

  for (const [, dayEntries] of byDay) {
    // Use the first entry's timestamp as the day's anchor.
    const anchor =
      dayEntries[0].createdAt instanceof Date
        ? dayEntries[0].createdAt
        : new Date(dayEntries[0].createdAt);
    const dominant = dominantAspectForDate(anchor, natalChart);
    if (!dominant) continue;

    const label = transitLabel(dominant);
    let bucket = buckets.get(label);
    if (!bucket) {
      bucket = {
        transit: label,
        sleepValues: [],
        moodValues: [],
        practiceValues: [],
      };
      buckets.set(label, bucket);
    }

    for (const entry of dayEntries) {
      const cap = entry.content?.habitCapture;
      if (!cap) continue;
      if (typeof cap.sleepScore === 'number') {
        bucket.sleepValues.push(cap.sleepScore);
        allSleep.push(cap.sleepScore);
      }
      if (cap.mood && cap.mood in MOOD_VALUES) {
        const v = MOOD_VALUES[cap.mood];
        bucket.moodValues.push(v);
        allMood.push(v);
      }
      if (typeof cap.practiced === 'boolean') {
        const v = cap.practiced ? 1 : 0;
        bucket.practiceValues.push(v);
        allPractice.push(v);
      }
    }
  }

  const overallSleep = mean(allSleep);
  const overallMood = mean(allMood);
  const overallPractice = mean(allPractice);

  const out: HabitCorrelation[] = [];

  const consider = (
    kind: HabitCorrelationKind,
    bucketValues: number[],
    bucketTransit: string,
    overallMean: number,
  ) => {
    if (bucketValues.length < 3) return;
    if (overallMean === 0) return; // can't compute % vs zero baseline
    const bucketMean = mean(bucketValues);
    const effectPct = ((bucketMean - overallMean) / overallMean) * 100;
    const confidence = classifyConfidence(
      bucketValues.length,
      Math.abs(effectPct),
    );
    if (!confidence) return;
    out.push({
      kind,
      transit: bucketTransit,
      sampleSize: bucketValues.length,
      effectPct: Math.round(effectPct * 10) / 10,
      confidence,
      oneLiner: buildOneLiner(
        kind,
        bucketTransit,
        effectPct,
        bucketValues.length,
      ),
    });
  };

  for (const bucket of buckets.values()) {
    consider('sleep', bucket.sleepValues, bucket.transit, overallSleep);
    consider('mood', bucket.moodValues, bucket.transit, overallMood);
    consider(
      'practice',
      bucket.practiceValues,
      bucket.transit,
      overallPractice,
    );
  }

  out.sort((a, b) => Math.abs(b.effectPct) - Math.abs(a.effectPct));
  return out;
}
