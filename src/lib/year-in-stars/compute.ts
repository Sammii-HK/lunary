/**
 * Year in Stars — pure compute utilities for the annual wrap feature.
 *
 * Given a year's worth of journal entries and ranked transits, produce a
 * structured stats blob suitable for rendering a Spotify-Wrapped style reel.
 *
 * Pure — no DB, no fetch, no I/O. Safe to call from anywhere (server, client,
 * worker). All inputs are plain data.
 */

import type { BirthChartData } from '../../../utils/astrology/birthChart';
import {
  scoreTransits,
  type RankableTransit,
} from '../transits/personal-impact-rank';

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

/**
 * The minimum journal-entry shape we need. Compatible with `JournalEntry`
 * from `src/app/api/journal/route.ts` but only requires the fields we read.
 */
export interface YearInStarsJournalEntry {
  id?: number | string;
  content?: string;
  moodTags?: string[];
  moonPhase?: string | null;
  transitHighlight?: string | null;
  createdAt: string | Date;
}

export interface ComputeYearInStarsArgs {
  year: number;
  journalEntries: YearInStarsJournalEntry[];
  transits: RankableTransit[];
  natalChart: BirthChartData[];
}

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------

export interface RankedTransitHighlight {
  /** Display label, e.g. "Saturn square Sun" or "Solar eclipse in Aries". */
  label: string;
  /** Personal-impact score in [0, 100]. */
  score: number;
  /** ISO date string for when the transit peaks. */
  date: string;
  /** Original transit type (aspect, eclipse, retrograde, etc). */
  type: RankableTransit['type'];
  /** Transit planet (for theming). */
  transitPlanet: string;
  /** Natal target if applicable. */
  natalPlanet?: string;
  /** Aspect type if applicable. */
  aspectType?: string;
}

export interface JournalVolumeStats {
  /** Total journal entries written in the year. */
  totalEntries: number;
  /** Total non-whitespace word count across all entries. */
  totalWords: number;
  /** Distinct calendar days that contain at least one entry. */
  uniqueDays: number;
  /** Longest streak of consecutive days with at least one entry. */
  longestStreak: number;
  /** Most-journaled month label, e.g. "March". */
  busiestMonth?: string;
  /** Number of entries in the busiest month. */
  busiestMonthCount: number;
  /** Average words per entry, rounded. */
  averageWordsPerEntry: number;
}

export interface MoonPatternStats {
  /** Moon phase the user journaled most under, e.g. "Full Moon". */
  topPhase?: string;
  /** Entry count under the top phase. */
  topPhaseCount: number;
  /** Distribution of entries by phase. */
  distribution: Array<{ phase: string; count: number }>;
}

export interface WeekHighlight {
  /** ISO date string for the start (Monday) of the week. */
  weekStart: string;
  /** ISO date string for the end (Sunday) of the week. */
  weekEnd: string;
  /** Friendly label, e.g. "Mar 17 – Mar 23". */
  label: string;
  /** Mood-balance score: positive moods minus heavy moods, normalized. */
  moodScore: number;
  /** Number of entries written in the week. */
  entryCount: number;
  /** Up to three representative mood tags. */
  topMoods: string[];
}

export interface YearInStarsData {
  year: number;
  topTransits: RankedTransitHighlight[];
  journal: JournalVolumeStats;
  moon: MoonPatternStats;
  bestWeek?: WeekHighlight;
  hardestWeek?: WeekHighlight;
  /** True when the dataset was rich enough to fill every slide. */
  hasEnoughData: boolean;
}

// ---------------------------------------------------------------------------
// Mood lexicon (kept small + deterministic on purpose)
// ---------------------------------------------------------------------------

const POSITIVE_MOODS = new Set([
  'joyful',
  'happy',
  'grateful',
  'hopeful',
  'calm',
  'inspired',
  'loved',
  'peaceful',
  'energized',
  'excited',
  'content',
  'magical',
  'aligned',
  'expansive',
  'open',
  'soft',
]);

const HEAVY_MOODS = new Set([
  'sad',
  'anxious',
  'angry',
  'overwhelmed',
  'tired',
  'lonely',
  'heavy',
  'drained',
  'stuck',
  'foggy',
  'fearful',
  'numb',
  'restless',
  'tense',
  'grief',
  'low',
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function toDate(value: string | Date): Date | null {
  const d = value instanceof Date ? value : new Date(value);
  return Number.isFinite(d.getTime()) ? d : null;
}

/** YYYY-MM-DD in UTC, stable regardless of viewer TZ. */
function dayKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Returns the Monday-anchored week-start date (UTC). */
function weekStart(d: Date): Date {
  const out = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  // getUTCDay: 0 = Sunday, 1 = Monday … shift so Monday = 0.
  const dow = (out.getUTCDay() + 6) % 7;
  out.setUTCDate(out.getUTCDate() - dow);
  return out;
}

function weekLabel(start: Date, end: Date): string {
  const startMonth = SHORT_MONTHS[start.getUTCMonth()];
  const endMonth = SHORT_MONTHS[end.getUTCMonth()];
  return `${startMonth} ${start.getUTCDate()} – ${endMonth} ${end.getUTCDate()}`;
}

function countWords(text: string | undefined): number {
  if (!text) return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function transitLabel(t: RankableTransit): string {
  if (t.type === 'eclipse') return `${t.transitPlanet} eclipse`;
  if (t.type === 'retrograde') return `${t.transitPlanet} retrograde`;
  if (t.type === 'ingress') return `${t.transitPlanet} ingress`;
  if (t.type === 'lunation') {
    return t.natalPlanet
      ? `Lunation on natal ${t.natalPlanet}`
      : `${t.transitPlanet} lunation`;
  }
  // aspect
  if (t.aspectType && t.natalPlanet) {
    return `${t.transitPlanet} ${t.aspectType.toLowerCase()} natal ${t.natalPlanet}`;
  }
  if (t.aspectType) {
    return `${t.transitPlanet} ${t.aspectType.toLowerCase()}`;
  }
  return t.transitPlanet;
}

// ---------------------------------------------------------------------------
// Section computers
// ---------------------------------------------------------------------------

function computeTopTransits(
  args: ComputeYearInStarsArgs,
): RankedTransitHighlight[] {
  const { year, transits, natalChart } = args;
  const inYear = transits.filter((t) => {
    const d = toDate(t.date);
    return d ? d.getUTCFullYear() === year : false;
  });

  const scored = scoreTransits(inYear, natalChart);
  const seen = new Set<string>();
  const ranked: RankedTransitHighlight[] = [];

  scored
    .sort((a, b) => b.score - a.score)
    .forEach(({ transit, score }) => {
      const label = transitLabel(transit);
      if (seen.has(label)) return;
      seen.add(label);
      const dateIso =
        transit.date instanceof Date
          ? transit.date.toISOString()
          : new Date(transit.date).toISOString();
      ranked.push({
        label,
        score,
        date: dateIso,
        type: transit.type,
        transitPlanet: transit.transitPlanet,
        natalPlanet: transit.natalPlanet,
        aspectType: transit.aspectType,
      });
    });

  return ranked.slice(0, 3);
}

function computeJournalStats(args: ComputeYearInStarsArgs): JournalVolumeStats {
  const { year, journalEntries } = args;
  const dayCounts = new Map<string, number>();
  const monthCounts = new Array<number>(12).fill(0);
  let totalEntries = 0;
  let totalWords = 0;

  for (const entry of journalEntries) {
    const d = toDate(entry.createdAt);
    if (!d || d.getUTCFullYear() !== year) continue;
    totalEntries += 1;
    totalWords += countWords(entry.content);
    const key = dayKey(d);
    dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
    monthCounts[d.getUTCMonth()] += 1;
  }

  const uniqueDays = dayCounts.size;
  const sortedDays = Array.from(dayCounts.keys()).sort();
  let longestStreak = 0;
  let currentStreak = 0;
  let prev: string | null = null;
  for (const k of sortedDays) {
    if (prev === null) {
      currentStreak = 1;
    } else {
      const prevDate = new Date(`${prev}T00:00:00Z`);
      const curDate = new Date(`${k}T00:00:00Z`);
      const diffDays = Math.round(
        (curDate.getTime() - prevDate.getTime()) / 86_400_000,
      );
      currentStreak = diffDays === 1 ? currentStreak + 1 : 1;
    }
    if (currentStreak > longestStreak) longestStreak = currentStreak;
    prev = k;
  }

  let busiestMonthIdx = -1;
  let busiestMonthCount = 0;
  monthCounts.forEach((count, idx) => {
    if (count > busiestMonthCount) {
      busiestMonthCount = count;
      busiestMonthIdx = idx;
    }
  });

  const averageWordsPerEntry =
    totalEntries === 0 ? 0 : Math.round(totalWords / totalEntries);

  return {
    totalEntries,
    totalWords,
    uniqueDays,
    longestStreak,
    busiestMonth:
      busiestMonthIdx >= 0 ? MONTH_NAMES[busiestMonthIdx] : undefined,
    busiestMonthCount,
    averageWordsPerEntry,
  };
}

function computeMoonPattern(args: ComputeYearInStarsArgs): MoonPatternStats {
  const { year, journalEntries } = args;
  const counts = new Map<string, number>();
  for (const entry of journalEntries) {
    const d = toDate(entry.createdAt);
    if (!d || d.getUTCFullYear() !== year) continue;
    if (!entry.moonPhase) continue;
    counts.set(entry.moonPhase, (counts.get(entry.moonPhase) ?? 0) + 1);
  }
  const distribution = Array.from(counts.entries())
    .map(([phase, count]) => ({ phase, count }))
    .sort((a, b) => b.count - a.count);

  return {
    topPhase: distribution[0]?.phase,
    topPhaseCount: distribution[0]?.count ?? 0,
    distribution,
  };
}

interface WeekBucket {
  start: Date;
  end: Date;
  positive: number;
  heavy: number;
  entries: number;
  moods: Map<string, number>;
}

function computeBestAndHardest(args: ComputeYearInStarsArgs): {
  bestWeek?: WeekHighlight;
  hardestWeek?: WeekHighlight;
} {
  const { year, journalEntries } = args;
  const buckets = new Map<string, WeekBucket>();

  for (const entry of journalEntries) {
    const d = toDate(entry.createdAt);
    if (!d || d.getUTCFullYear() !== year) continue;
    const start = weekStart(d);
    const key = dayKey(start);
    let bucket = buckets.get(key);
    if (!bucket) {
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 6);
      bucket = {
        start,
        end,
        positive: 0,
        heavy: 0,
        entries: 0,
        moods: new Map<string, number>(),
      };
      buckets.set(key, bucket);
    }
    bucket.entries += 1;
    for (const tag of entry.moodTags ?? []) {
      const normalized = tag.trim().toLowerCase();
      if (!normalized) continue;
      bucket.moods.set(normalized, (bucket.moods.get(normalized) ?? 0) + 1);
      if (POSITIVE_MOODS.has(normalized)) bucket.positive += 1;
      if (HEAVY_MOODS.has(normalized)) bucket.heavy += 1;
    }
  }

  const candidates = Array.from(buckets.values()).map((b) => {
    const total = b.positive + b.heavy;
    const moodScore = total === 0 ? 0 : (b.positive - b.heavy) / total;
    const topMoods = Array.from(b.moods.entries())
      .sort((a, c) => c[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);
    return {
      weekStart: dayKey(b.start),
      weekEnd: dayKey(b.end),
      label: weekLabel(b.start, b.end),
      moodScore,
      entryCount: b.entries,
      topMoods,
    };
  });

  if (candidates.length === 0) return {};

  // Best = highest mood score; require at least 2 entries to count, else fall
  // back to the most-journaled week.
  const meaningful = candidates.filter((c) => c.entryCount >= 2);
  const pool = meaningful.length > 0 ? meaningful : candidates;

  const bestWeek = [...pool].sort((a, b) => b.moodScore - a.moodScore)[0];
  const hardestWeek = [...pool].sort((a, b) => a.moodScore - b.moodScore)[0];

  // Avoid returning the exact same week for both if there is variance.
  if (
    pool.length > 1 &&
    bestWeek &&
    hardestWeek &&
    bestWeek.weekStart === hardestWeek.weekStart
  ) {
    const second = [...pool]
      .filter((c) => c.weekStart !== bestWeek.weekStart)
      .sort((a, b) => a.moodScore - b.moodScore)[0];
    return { bestWeek, hardestWeek: second };
  }

  return { bestWeek, hardestWeek };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function computeYearInStars(
  args: ComputeYearInStarsArgs,
): YearInStarsData {
  const topTransits = computeTopTransits(args);
  const journal = computeJournalStats(args);
  const moon = computeMoonPattern(args);
  const { bestWeek, hardestWeek } = computeBestAndHardest(args);

  const hasEnoughData =
    journal.totalEntries >= 5 && (topTransits.length > 0 || moon.topPhase);

  return {
    year: args.year,
    topTransits,
    journal,
    moon,
    bestWeek,
    hardestWeek,
    hasEnoughData: Boolean(hasEnoughData),
  };
}
