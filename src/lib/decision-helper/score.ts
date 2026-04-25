/**
 * Cosmic Decision Helper — deterministic scorer.
 *
 * Given a category, a natal chart, and the current sky, returns a verdict
 * (yes / wait / no), a confidence score, a one-paragraph reasoning string
 * stitched from the existing transit-content templates plus a small library
 * of decision-specific lines, and an optional `betterDay` recommendation
 * computed by a forward-scan over the next 14 days.
 *
 * Pure module — no IO, no async. All ephemeris work happens *outside* this
 * module; the caller supplies today's sky and an optional `forwardScan`
 * callback that returns sky positions for N days ahead. This keeps the
 * scoring logic fully unit-testable with fixture data.
 */

import {
  aspectBlurbs,
  type AspectKey,
  type AspectType,
  type BodyName,
} from '@/lib/transit-content/templates';
import type { Category } from './categorise';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type Verdict = 'yes' | 'wait' | 'no';

export interface Placement {
  body: string;
  eclipticLongitude: number;
  retrograde?: boolean;
  sign?: string;
}

export interface DecisionResult {
  verdict: Verdict;
  confidence: number; // 0-100
  reasoning: string;
  betterDay?: { date: string; why: string };
}

export interface ScoreInput {
  category: Category;
  natalChart: Placement[];
  currentSky: Placement[];
  /**
   * Optional forward-scan: returns the sky positions for `daysAhead` days
   * from now. When supplied, the scorer will look up to 14 days ahead for a
   * better window when the verdict is 'wait' or 'no'.
   */
  forwardScan?: (daysAhead: number) => Placement[];
  /** Override "today" for deterministic testing. */
  now?: Date;
}

// ---------------------------------------------------------------------------
// Category → which planets matter
// ---------------------------------------------------------------------------

interface CategoryProfile {
  /** Primary ruler — the transit planet we care about most. */
  ruler: BodyName;
  /** Natal planets the transit ruler is "talking to" for this category. */
  natalTargets: readonly BodyName[];
  /** A short noun phrase used in stitched reasoning. */
  domain: string;
  /** Verb-phrase used when verdict is yes — "send the email", "ask them out". */
  yesAction: string;
  /** Verb-phrase used when verdict is wait — "wait a few days", "sit on it". */
  waitAction: string;
  /** Verb-phrase used when verdict is no — "skip today", "don't push". */
  noAction: string;
}

const CATEGORY_PROFILES: Record<
  Exclude<Category, 'general'>,
  CategoryProfile
> = {
  communication: {
    ruler: 'Mercury',
    natalTargets: ['Mercury', 'Sun', 'Moon'],
    domain: 'words and signal',
    yesAction: 'send it — your message will land cleanly',
    waitAction: 'sit on it for a beat — re-read before you send',
    noAction: 'hold the send. The wires are crossed today',
  },
  love: {
    ruler: 'Venus',
    natalTargets: ['Venus', 'Sun', 'Moon', 'Mars'],
    domain: 'love and wanting',
    yesAction: 'say it. The yes is in the air',
    waitAction: 'wait until the air softens — the moment is close',
    noAction: 'protect your heart today. Not the right window',
  },
  action: {
    ruler: 'Mars',
    natalTargets: ['Mars', 'Sun', 'Saturn'],
    domain: 'drive and momentum',
    yesAction: 'go. Move while the fire is on your side',
    waitAction: 'sharpen the blade before you swing',
    noAction: 'do not push today — the wall pushes back harder',
  },
  career: {
    ruler: 'Sun',
    natalTargets: ['Sun', 'Saturn', 'Jupiter', 'Mercury'],
    domain: 'work and standing',
    yesAction: 'make the move — the room will see you',
    waitAction: 'lay one more brick, then move',
    noAction: 'not today. The structure is being audited',
  },
  creative: {
    ruler: 'Venus',
    natalTargets: ['Venus', 'Sun', 'Moon', 'Neptune'],
    domain: 'beauty and expression',
    yesAction: 'make the thing. The muse is local',
    waitAction: 'sketch privately — the public version wants more time',
    noAction: 'let the well refill. Today is not for output',
  },
  travel: {
    ruler: 'Jupiter',
    natalTargets: ['Jupiter', 'Sun', 'Mercury'],
    domain: 'reach and horizon',
    yesAction: 'go. The road bends in your favour',
    waitAction: 'book it, but leave a few days later than you planned',
    noAction: 'delay. The wind is wrong today',
  },
  commitment: {
    ruler: 'Saturn',
    natalTargets: ['Saturn', 'Sun', 'Venus', 'Moon'],
    domain: 'long-term shape',
    yesAction: 'sign. The ground under this is real',
    waitAction: 'read it twice — Saturn rewards patience here',
    noAction: 'do not commit today. Foundations are still moving',
  },
  rest: {
    ruler: 'Moon',
    natalTargets: ['Moon', 'Sun', 'Neptune'],
    domain: 'energy and reserves',
    yesAction: 'rest. Your body is the oracle today',
    waitAction: 'try to rest — push the rest of the list to tomorrow',
    noAction: 'do not push. The reserves are already low',
  },
};

// `general` falls back to a Sun + Moon read.
const GENERAL_PROFILE: CategoryProfile = {
  ruler: 'Sun',
  natalTargets: ['Sun', 'Moon', 'Mercury'],
  domain: 'today',
  yesAction: 'go ahead. The day is cooperating',
  waitAction: 'wait a beat — the day is mixed',
  noAction: 'skip it today. Try again when the sky shifts',
};

function profileFor(category: Category): CategoryProfile {
  return category === 'general' ? GENERAL_PROFILE : CATEGORY_PROFILES[category];
}

// ---------------------------------------------------------------------------
// Aspect detection — a slim copy of the transit-preview math, scoped to the
// natal targets we care about for this decision.
// ---------------------------------------------------------------------------

const ASPECTS: {
  name: AspectType;
  angle: number;
  orb: number;
  weight: number;
}[] = [
  { name: 'Conjunction', angle: 0, orb: 8, weight: 1 },
  { name: 'Opposition', angle: 180, orb: 8, weight: -1 },
  { name: 'Trine', angle: 120, orb: 6, weight: 2 },
  { name: 'Square', angle: 90, orb: 6, weight: -2 },
  { name: 'Sextile', angle: 60, orb: 4, weight: 1 },
];

const SUPPORTED_BODIES: ReadonlySet<BodyName> = new Set([
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
]);

function asBody(value: unknown): BodyName | null {
  return typeof value === 'string' && SUPPORTED_BODIES.has(value as BodyName)
    ? (value as BodyName)
    : null;
}

interface ScoredAspect {
  transitPlanet: BodyName;
  aspect: AspectType;
  natalPlanet: BodyName;
  /** Tightness, 0..orb — higher = closer. */
  tightness: number;
  /** Aspect base weight (positive = harmonising, negative = challenging). */
  baseWeight: number;
}

/**
 * Find aspects between today's sky and the natal chart, restricted to the
 * given (transit ruler) → (natal targets) pairs.
 */
function findAspects(
  natalChart: Placement[],
  currentSky: Placement[],
  transitPlanets: readonly BodyName[],
  natalTargets: readonly BodyName[],
): ScoredAspect[] {
  const transitSet = new Set(transitPlanets);
  const natalSet = new Set(natalTargets);
  const out: ScoredAspect[] = [];

  for (const t of currentSky) {
    const tBody = asBody(t.body);
    if (!tBody || !transitSet.has(tBody)) continue;

    for (const n of natalChart) {
      const nBody = asBody(n.body);
      if (!nBody || !natalSet.has(nBody)) continue;

      let diff = Math.abs(t.eclipticLongitude - n.eclipticLongitude);
      if (diff > 180) diff = 360 - diff;

      for (const asp of ASPECTS) {
        const orbDiff = Math.abs(diff - asp.angle);
        if (orbDiff <= asp.orb) {
          out.push({
            transitPlanet: tBody,
            aspect: asp.name,
            natalPlanet: nBody,
            tightness: asp.orb - orbDiff,
            baseWeight: asp.weight,
          });
          break;
        }
      }
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/**
 * Compute a scalar score for the day given a category profile + the relevant
 * current-sky aspects. Positive = supportive, negative = friction.
 *
 * Heuristics layered on top of base aspect weight:
 *  - Mercury Rx kills communication / commitment hard.
 *  - Mars Rx softens action and competition.
 *  - Venus Rx puts love / creative in "reconsider" mode.
 *  - Saturn Rx softens commitment slightly (audit, not abort).
 */
function computeDayScore(
  profile: CategoryProfile,
  category: Category,
  natalChart: Placement[],
  sky: Placement[],
): { score: number; topAspect: ScoredAspect | null; flags: string[] } {
  const flags: string[] = [];

  // Aspects from the ruler to its natal targets (the headline).
  const headline = findAspects(
    natalChart,
    sky,
    [profile.ruler],
    profile.natalTargets,
  );

  // Plus a wider net so we can colour the reasoning with a second-string
  // aspect (e.g. Saturn squaring natal Mars while we ask about action).
  const supportingTransitPlanets: BodyName[] =
    category === 'communication'
      ? ['Mercury', 'Mars', 'Saturn']
      : category === 'love'
        ? ['Venus', 'Mars', 'Saturn']
        : category === 'action'
          ? ['Mars', 'Saturn', 'Sun']
          : category === 'career'
            ? ['Sun', 'Saturn', 'Jupiter']
            : category === 'creative'
              ? ['Venus', 'Sun', 'Neptune']
              : category === 'travel'
                ? ['Jupiter', 'Mercury', 'Saturn']
                : category === 'commitment'
                  ? ['Saturn', 'Venus', 'Sun']
                  : category === 'rest'
                    ? ['Moon', 'Neptune', 'Saturn']
                    : ['Sun', 'Moon', 'Mercury'];

  const supporting = findAspects(
    natalChart,
    sky,
    supportingTransitPlanets,
    profile.natalTargets,
  );

  // Base score = sum of (weight * tightness) for all relevant aspects, with
  // headline aspects counting double.
  let score = 0;
  for (const a of headline) score += a.baseWeight * a.tightness * 2;
  for (const a of supporting) score += a.baseWeight * a.tightness;

  // Retrograde modifiers — look up the transit planet directly in the sky.
  const skyByBody = new Map<BodyName, Placement>();
  for (const p of sky) {
    const b = asBody(p.body);
    if (b) skyByBody.set(b, p);
  }
  const isRx = (b: BodyName) => skyByBody.get(b)?.retrograde === true;

  if (isRx('Mercury')) {
    if (category === 'communication') {
      score -= 12;
      flags.push('Mercury is retrograde');
    } else if (category === 'commitment' || category === 'travel') {
      score -= 6;
      flags.push('Mercury is retrograde');
    }
  }
  if (isRx('Venus') && (category === 'love' || category === 'creative')) {
    score -= 8;
    flags.push('Venus is retrograde');
  }
  if (isRx('Mars') && category === 'action') {
    score -= 8;
    flags.push('Mars is retrograde');
  }
  if (isRx('Saturn') && category === 'commitment') {
    score -= 4;
    flags.push('Saturn is retrograde');
  }
  if (isRx('Jupiter') && category === 'travel') {
    score -= 4;
    flags.push('Jupiter is retrograde');
  }

  // Pick the most "informative" aspect for the reasoning sentence — the
  // tightest one whose absolute weighted contribution is largest.
  const all = [...headline, ...supporting].sort((a, b) => {
    const aImpact = Math.abs(a.baseWeight) * a.tightness;
    const bImpact = Math.abs(b.baseWeight) * b.tightness;
    return bImpact - aImpact;
  });

  return { score, topAspect: all[0] ?? null, flags };
}

// ---------------------------------------------------------------------------
// Reasoning stitcher — pulls from existing aspectBlurbs, falls back to the
// decision-specific copy in the category profile.
// ---------------------------------------------------------------------------

function aspectSentence(aspect: ScoredAspect): string {
  const key =
    `${aspect.transitPlanet}_${aspect.aspect}_${aspect.natalPlanet}` as AspectKey;
  const blurb = aspectBlurbs[key];
  if (blurb) return blurb;
  // Generic but readable fallback that names the actual aspect.
  return `Transiting ${aspect.transitPlanet} is ${aspect.aspect.toLowerCase()} your natal ${aspect.natalPlanet}.`;
}

function stitchReasoning(
  verdict: Verdict,
  profile: CategoryProfile,
  topAspect: ScoredAspect | null,
  flags: string[],
): string {
  const action =
    verdict === 'yes'
      ? profile.yesAction
      : verdict === 'wait'
        ? profile.waitAction
        : profile.noAction;

  const headline = topAspect
    ? aspectSentence(topAspect)
    : `The sky is quiet on ${profile.domain} today.`;

  const flagLine = flags.length > 0 ? `${flags.join(' and ')}. ` : '';

  return `${headline} ${flagLine}For ${profile.domain}, ${action}.`;
}

// ---------------------------------------------------------------------------
// betterDay forward-scan
// ---------------------------------------------------------------------------

const FORWARD_SCAN_MAX_DAYS = 14;

function formatYMD(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function findBetterDay(
  category: Category,
  profile: CategoryProfile,
  natalChart: Placement[],
  todayScore: number,
  forwardScan: (daysAhead: number) => Placement[],
  now: Date,
): { date: string; why: string } | undefined {
  // Require a meaningful improvement — otherwise we're just shuffling noise.
  const requiredImprovement = Math.max(8, Math.abs(todayScore) * 0.5);

  let best: {
    daysAhead: number;
    score: number;
    topAspect: ScoredAspect | null;
  } | null = null;

  for (let d = 1; d <= FORWARD_SCAN_MAX_DAYS; d += 1) {
    let futureSky: Placement[];
    try {
      futureSky = forwardScan(d);
    } catch {
      continue;
    }
    if (!futureSky || futureSky.length === 0) continue;

    const { score, topAspect } = computeDayScore(
      profile,
      category,
      natalChart,
      futureSky,
    );

    if (score - todayScore < requiredImprovement) continue;
    if (!best || score > best.score) {
      best = { daysAhead: d, score, topAspect };
    }
  }

  if (!best) return undefined;

  const target = new Date(now.getTime() + best.daysAhead * 24 * 60 * 60 * 1000);
  const why = best.topAspect
    ? aspectSentence(best.topAspect)
    : `${profile.ruler} clears the rough water by then.`;

  return { date: formatYMD(target), why };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Score a decision question deterministically against the current sky.
 * No randomness, no LLM, no IO.
 */
export function scoreDecision(input: ScoreInput): DecisionResult {
  const profile = profileFor(input.category);
  const now = input.now ?? new Date();

  const { score, topAspect, flags } = computeDayScore(
    profile,
    input.category,
    input.natalChart,
    input.currentSky,
  );

  // Verdict thresholds — calibrated against the weight scale above. Aspect
  // contributions land roughly in [-30, +30] for a typical day.
  let verdict: Verdict;
  if (score >= 6) verdict = 'yes';
  else if (score <= -6) verdict = 'no';
  else verdict = 'wait';

  // Confidence — clamp |score| into 0..100 with a soft ceiling at |score|=30.
  const confidence = Math.min(100, Math.round((Math.abs(score) / 30) * 100));

  const reasoning = stitchReasoning(verdict, profile, topAspect, flags);

  // Only look for a better day when today is not a clean yes.
  let betterDay: DecisionResult['betterDay'];
  if (verdict !== 'yes' && input.forwardScan) {
    betterDay = findBetterDay(
      input.category,
      profile,
      input.natalChart,
      score,
      input.forwardScan,
      now,
    );
  }

  return { verdict, confidence, reasoning, betterDay };
}

export const __test__ = {
  CATEGORY_PROFILES,
  GENERAL_PROFILE,
  computeDayScore,
  findAspects,
  stitchReasoning,
};
