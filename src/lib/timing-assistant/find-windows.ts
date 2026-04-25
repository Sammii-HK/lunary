/**
 * Timing Assistant — pick the top N best dates in the next month for a goal.
 *
 * Forward-looking sibling of the Cosmic Decision Helper. Given a category
 * and a natal chart, scan the next `daysAhead` days, score each one with the
 * same deterministic logic the Decision Helper uses for "today", then pick
 * the top `count` dates with a minimum spacing so we never return three
 * dates that all clump on the same week.
 *
 * Pure module — no IO, no async. The caller supplies a `getSky(d)` callback
 * that returns the sky for `d` days ahead (today = 0). This keeps the
 * scoring fully testable with fixture data and matches the existing
 * `forwardScan` pattern used by `scoreDecision`.
 */
import {
  CATEGORY_PROFILES,
  scoreDecision,
  type Placement,
} from '@/lib/decision-helper/score';
import type { Category } from '@/lib/decision-helper/categorise';

/** A single ranked date returned by {@link findTopDates}. */
export interface TimedDate {
  /** ISO `YYYY-MM-DD` (UTC) of the recommended day. */
  date: string;
  /** 0..100 — directional score. 100 = strongest support, 0 = avoid. */
  score: number;
  /** Short description of the dominant aspect, e.g. "Mercury trine your natal Sun." */
  dominantAspect: string;
  /** One-line reason a user can understand at a glance. */
  reasoning: string;
  /** Theme noun phrase pulled from the category profile (e.g. "words and signal"). */
  theme: string;
}

interface FindTopDatesInput {
  category: Category;
  natalChart: Placement[];
  /** Returns the sky for `daysAhead` days from now (today = 0). */
  getSky: (daysAhead: number) => Placement[];
  /** Defaults to 30. */
  daysAhead?: number;
  /** Defaults to 3. */
  count?: number;
  /** Minimum spacing in days between picks. Defaults to 3. */
  minSpacingDays?: number;
  /** Override "today" for deterministic testing. */
  now?: Date;
}

interface DayCandidate {
  daysAhead: number;
  date: string; // YYYY-MM-DD
  /** Signed scalar — positive supports the goal, negative resists. */
  signed: number;
  /** 0..100 brightness score (clamped, directional toward "yes"). */
  score: number;
  dominantAspect: string;
  reasoning: string;
}

function formatYMD(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Pull the dominant-aspect sentence out of the stitched reasoning string.
 * `stitchReasoning` always starts with the aspect blurb, then a period+space,
 * then optional retrograde flag, then the action line. We grab the first
 * sentence so the UI can show the headline aspect without re-running the
 * aspect math here.
 */
function extractDominantAspect(reasoning: string): string {
  const trimmed = reasoning.trim();
  const idx = trimmed.indexOf('. ');
  if (idx === -1) return trimmed;
  return trimmed.slice(0, idx + 1);
}

/**
 * Map a Decision Helper verdict + confidence onto a signed scalar so we can
 * rank days that are "more yes" higher than days that are "more no".
 *
 * Confidence is always positive (it's `|score|/30 * 100` inside scoreDecision)
 * so we have to use the verdict to recover direction:
 *   - yes  → +confidence
 *   - wait → confidence * 0.25 (weakly positive — "fine but not special")
 *   - no   → -confidence
 */
function signedScore(
  verdict: 'yes' | 'wait' | 'no',
  confidence: number,
): number {
  if (verdict === 'yes') return confidence;
  if (verdict === 'no') return -confidence;
  return confidence * 0.25;
}

/**
 * Convert the signed score (-100..+100) to a 0..100 brightness for the UI.
 * Anything below zero (a "no" day) gets clamped to 0 — we never want to
 * surface a date that actively resists the goal.
 */
function brightnessFromSigned(signed: number): number {
  if (signed <= 0) return 0;
  return Math.min(100, Math.round(signed));
}

/**
 * Theme phrase shown next to the date — pulled from the existing category
 * profile so we don't duplicate copy. `general` falls back to a neutral phrase.
 */
function themeFor(category: Category): string {
  if (category === 'general') return 'today';
  return CATEGORY_PROFILES[category].domain;
}

/**
 * Pick top N candidates with a minimum spacing between picks. We greedily
 * walk the sorted list and skip any candidate that lands within
 * `minSpacingDays` of an already-chosen date — this prevents three picks
 * clustering on the same week of a Mercury-trine-Sun pass-by, for example.
 *
 * Greedy by score is optimal for this use case because we always want the
 * single best window first; the second pick is the best window outside the
 * first's exclusion zone, and so on. Returns fewer than `count` if the
 * candidate pool runs out of well-spaced options.
 */
function pickWithSpacing(
  candidates: DayCandidate[],
  count: number,
  minSpacingDays: number,
): DayCandidate[] {
  // Skip any day that didn't score above zero — those are "avoid" days, not
  // recommendations. Better to return fewer dates than to surface bad ones.
  const positives = candidates.filter((c) => c.signed > 0);
  positives.sort((a, b) => b.signed - a.signed);

  const picks: DayCandidate[] = [];
  for (const cand of positives) {
    if (picks.length >= count) break;
    const tooClose = picks.some(
      (p) => Math.abs(p.daysAhead - cand.daysAhead) < minSpacingDays,
    );
    if (tooClose) continue;
    picks.push(cand);
  }

  // Sort the final picks chronologically so the UI renders soonest first.
  picks.sort((a, b) => a.daysAhead - b.daysAhead);
  return picks;
}

/**
 * Score every day in `[1..daysAhead]`, then pick the top `count` with at
 * least `minSpacingDays` between them. Day 0 (today) is intentionally
 * excluded — Decision Helper covers today; this surface answers "when next".
 */
export function findTopDates(input: FindTopDatesInput): TimedDate[] {
  const {
    category,
    natalChart,
    getSky,
    daysAhead = 30,
    count = 3,
    minSpacingDays = 3,
    now = new Date(),
  } = input;

  if (!Array.isArray(natalChart) || natalChart.length === 0) return [];

  const candidates: DayCandidate[] = [];

  for (let d = 1; d <= daysAhead; d += 1) {
    let sky: Placement[];
    try {
      sky = getSky(d);
    } catch {
      // Skip days we can't compute — never let a single bad ephemeris call
      // sink the whole scan.
      continue;
    }
    if (!sky || sky.length === 0) continue;

    // Reuse Decision Helper's full pipeline — same category profile, same
    // aspect math, same retrograde modifiers, same reasoning stitcher. We
    // pass no forwardScan because we're already inside the forward scan.
    const result = scoreDecision({
      category,
      natalChart,
      currentSky: sky,
      now,
    });

    const signed = signedScore(result.verdict, result.confidence);
    const target = new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

    candidates.push({
      daysAhead: d,
      date: formatYMD(target),
      signed,
      score: brightnessFromSigned(signed),
      dominantAspect: extractDominantAspect(result.reasoning),
      reasoning: result.reasoning,
    });
  }

  const picks = pickWithSpacing(candidates, count, minSpacingDays);
  const theme = themeFor(category);

  return picks.map((p) => ({
    date: p.date,
    score: p.score,
    dominantAspect: p.dominantAspect,
    reasoning: p.reasoning,
    theme,
  }));
}

export const __test__ = {
  extractDominantAspect,
  signedScore,
  brightnessFromSigned,
  pickWithSpacing,
};
