/**
 * Weekly Pages — pure builder for Lunary's "Week Ahead" digest.
 *
 * Stitches together the user's top 3 transits, the moon phase journey, the
 * day-by-day notable-day calendar entries, a single ritual recommendation, and
 * a poetic summary paragraph. Zero per-user marginal AI cost: everything comes
 * from existing template libraries and deterministic helpers.
 *
 * No I/O, no DB. The API route loads natal data and calls `buildWeeklyPage`.
 */

import { scoreNextNDays, type NotableDay } from '@/lib/notable-days/score';
import {
  byPersonalImpact,
  type RankableTransit,
} from '@/lib/transits/personal-impact-rank';
import {
  getTemplateBlurb,
  GENERIC_FALLBACK_BLURB,
  type AspectType,
  type BodyName,
  type LunarPhase,
} from '@/lib/transit-content/templates';
import { getRealPlanetaryPositions } from '../../../utils/astrology/astronomical-data';
import { getAccurateMoonPhase } from '../../../utils/astrology/astronomical-data';
import { getZodiacSign } from '../../../utils/astrology/astrology';
import type { BirthChartData } from '../../../utils/astrology/birthChart';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TransitWindow = {
  /** ISO day (YYYY-MM-DD) when this transit peaks during the week. */
  peakDate: string;
  transitPlanet: string;
  natalPlanet: string;
  aspect: string;
  /** Tightest orb in degrees seen during the week. */
  exactness: number;
  /** Personal-impact score 0..100 at peak. */
  score: number;
  /** Templated, jargon-free blurb. */
  blurb: string;
  /** Display tint hint based on aspect quality. */
  tone: 'flow' | 'friction' | 'pivot';
  oneLiner: string;
};

export type MoonPhaseSnapshot = {
  date: string; // ISO day
  name: string; // 'Full Moon', 'First Quarter', etc
  illumination: number; // 0..100
  trend: 'waxing' | 'waning';
  sign: string; // zodiac sign Moon is in
};

export type VoidPeriod = {
  /** ISO day when the moon is void-of-course (rough heuristic). */
  date: string;
  /** Plain-language window description. */
  description: string;
};

export type MoonJourney = {
  phases: MoonPhaseSnapshot[];
  voidPeriods: VoidPeriod[];
  /** The dominant phase for the cover hero (peak illumination shift in window). */
  dominantPhase: MoonPhaseSnapshot;
};

export type Ritual = {
  title: string;
  body: string;
};

export type WeeklyPage = {
  weekStart: string; // ISO day (Sunday)
  weekEnd: string; // ISO day (Saturday)
  headline: string;
  topTransits: TransitWindow[];
  moonJourney: MoonJourney;
  notableDays: NotableDay[];
  ritual: Ritual;
  summary: string;
};

// ---------------------------------------------------------------------------
// Constants — local allow-lists keep us aligned with template typings.
// ---------------------------------------------------------------------------

const TEMPLATE_PLANETS = new Set<BodyName>([
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

const TEMPLATE_ASPECTS = new Set<AspectType>([
  'Conjunction',
  'Opposition',
  'Trine',
  'Square',
  'Sextile',
]);

const FLOW_ASPECTS = new Set(['Trine', 'Sextile']);
const FRICTION_ASPECTS = new Set(['Square', 'Opposition']);

// Map the 0..360 phase angle returned by getAccurateMoonPhase to a coarse
// canonical phase name. Buckets sized so each named phase covers ~45° band.
function phaseAngleToName(angle: number): string {
  const a = ((angle % 360) + 360) % 360;
  if (a < 22.5 || a >= 337.5) return 'New Moon';
  if (a < 67.5) return 'Waxing Crescent';
  if (a < 112.5) return 'First Quarter';
  if (a < 157.5) return 'Waxing Gibbous';
  if (a < 202.5) return 'Full Moon';
  if (a < 247.5) return 'Waning Gibbous';
  if (a < 292.5) return 'Last Quarter';
  return 'Waning Crescent';
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function noonUtc(iso: string): Date {
  // Stable ephemeris snapshot — same as scoreNextNDays.
  const d = new Date(`${iso}T12:00:00Z`);
  return d;
}

function asTemplatePlanet(name: string): BodyName | null {
  return TEMPLATE_PLANETS.has(name as BodyName) ? (name as BodyName) : null;
}

function asTemplateAspect(name: string): AspectType | null {
  return TEMPLATE_ASPECTS.has(name as AspectType) ? (name as AspectType) : null;
}

function aspectTone(aspect: string): TransitWindow['tone'] {
  if (FLOW_ASPECTS.has(aspect)) return 'flow';
  if (FRICTION_ASPECTS.has(aspect)) return 'friction';
  return 'pivot';
}

// ---------------------------------------------------------------------------
// Top transits
// ---------------------------------------------------------------------------

/**
 * Build TransitWindow[] for the week. We collapse multi-day occurrences of the
 * same transit (transit planet + natal planet + aspect) into a single window
 * keyed to its tightest-orb day.
 */
function buildTopTransits(
  natalChart: BirthChartData[],
  notableDays: NotableDay[],
): TransitWindow[] {
  type Key = string;
  const windowsByKey = new Map<
    Key,
    {
      peakDate: string;
      transitPlanet: string;
      natalPlanet: string;
      aspect: string;
      exactness: number;
      score: number;
    }
  >();

  for (const day of notableDays) {
    for (const aspect of day.topAspects) {
      const key = `${aspect.transitPlanet}|${aspect.aspect}|${aspect.natalPlanet}`;
      const existing = windowsByKey.get(key);
      if (!existing || aspect.exactness < existing.exactness) {
        windowsByKey.set(key, {
          peakDate: day.date,
          transitPlanet: aspect.transitPlanet,
          natalPlanet: aspect.natalPlanet,
          aspect: aspect.aspect,
          exactness: aspect.exactness,
          score: existing ? Math.max(existing.score, day.score) : day.score,
        });
      } else if (existing && day.score > existing.score) {
        existing.score = day.score;
      }
    }
  }

  // Rank by personal impact via the existing helper for consistency with
  // notable-days. We feed it RankableTransit shapes built from each window.
  const rankable: RankableTransit[] = Array.from(windowsByKey.values()).map(
    (w) => ({
      transitPlanet: w.transitPlanet,
      transitLongitude: 0, // unused by ranker scoring path for aspects
      natalPlanet: w.natalPlanet,
      aspectType: w.aspect,
      orb: w.exactness,
      date: noonUtc(w.peakDate),
      type: 'aspect',
    }),
  );

  const ranked = byPersonalImpact(rankable, natalChart).slice(0, 3);

  return ranked.map((rt) => {
    const tpl = asTemplatePlanet(rt.transitPlanet);
    const nat = asTemplatePlanet(rt.natalPlanet ?? '');
    const asp = asTemplateAspect(rt.aspectType ?? '');
    const blurb =
      tpl && nat && asp
        ? (getTemplateBlurb({
            kind: 'aspect_to_natal',
            transitPlanet: tpl,
            aspect: asp,
            natalPlanet: nat,
          }) ?? GENERIC_FALLBACK_BLURB)
        : GENERIC_FALLBACK_BLURB;

    const aspectName = rt.aspectType ?? 'aspects';
    const oneLiner = `${rt.transitPlanet} ${aspectName.toLowerCase()} your natal ${rt.natalPlanet}`;

    // Recover the original window for peakDate/exactness/score.
    const key = `${rt.transitPlanet}|${rt.aspectType}|${rt.natalPlanet}`;
    const window = windowsByKey.get(key)!;

    return {
      peakDate: window.peakDate,
      transitPlanet: window.transitPlanet,
      natalPlanet: window.natalPlanet,
      aspect: window.aspect,
      exactness: window.exactness,
      score: window.score,
      blurb,
      tone: aspectTone(window.aspect),
      oneLiner,
    };
  });
}

// ---------------------------------------------------------------------------
// Moon journey
// ---------------------------------------------------------------------------

function buildMoonJourney(weekStart: string, weekEnd: string): MoonJourney {
  const phases: MoonPhaseSnapshot[] = [];
  const voidPeriods: VoidPeriod[] = [];

  const start = noonUtc(weekStart);
  const end = noonUtc(weekEnd);
  const dayMs = 24 * 60 * 60 * 1000;

  let prevSign: string | null = null;

  for (let cursor = start.getTime(); cursor <= end.getTime(); cursor += dayMs) {
    const day = new Date(cursor);
    let snapshot: MoonPhaseSnapshot | null = null;
    try {
      const moonPhase = getAccurateMoonPhase(day);
      const positions = getRealPlanetaryPositions(day);
      const moonLongitude = positions.Moon?.longitude ?? 0;
      const sign = getZodiacSign(moonLongitude);
      snapshot = {
        date: isoDate(day),
        name: phaseAngleToName(moonPhase.phaseAngle),
        illumination: Math.round(moonPhase.illumination),
        trend: moonPhase.trend,
        sign,
      };
      phases.push(snapshot);

      // Lightweight void-of-course heuristic: the moon is approaching the
      // cusp of the next sign (last 1.5° of current sign) — treat as a
      // "soft pause" window. This is a UX cue, not a precision calc.
      const degInSign = moonLongitude % 30;
      if (degInSign >= 28.5) {
        const nextSign = getZodiacSign(moonLongitude + 1.5);
        if (nextSign && nextSign !== sign) {
          voidPeriods.push({
            date: isoDate(day),
            description: `Moon drifts from ${sign} into ${nextSign} — soft pause window.`,
          });
        }
      }

      // Sign-ingress note as a moon journey beat (logged as a void-cousin).
      if (prevSign && prevSign !== sign) {
        voidPeriods.push({
          date: isoDate(day),
          description: `Moon enters ${sign} — emotional weather shifts toward ${sign.toLowerCase()} themes.`,
        });
      }
      prevSign = sign;
    } catch {
      // Ephemeris failure on any day — push a quiet placeholder so the strip
      // still renders 7 entries.
      phases.push({
        date: isoDate(day),
        name: 'Waxing Gibbous',
        illumination: 50,
        trend: 'waxing',
        sign: 'Aries',
      });
    }
  }

  // Dominant phase = the snapshot with the most named-phase weight; we prefer
  // exact phase markers (New/Full/Quarter) over crescent/gibbous days.
  const namedWeight: Record<string, number> = {
    'Full Moon': 5,
    'New Moon': 5,
    'First Quarter': 3,
    'Last Quarter': 3,
    'Waxing Gibbous': 2,
    'Waning Gibbous': 2,
    'Waxing Crescent': 1,
    'Waning Crescent': 1,
  };

  const dominantPhase = phases.reduce((best, p) => {
    const bw = namedWeight[best.name] ?? 0;
    const pw = namedWeight[p.name] ?? 0;
    return pw > bw ? p : best;
  }, phases[0]);

  return { phases, voidPeriods, dominantPhase };
}

// ---------------------------------------------------------------------------
// Ritual selection
// ---------------------------------------------------------------------------

const RITUAL_BY_THEME: Record<string, Ritual> = {
  career: {
    title: 'Anchor your ambition',
    body: 'Light a single candle on Wednesday morning. Write the title you want to hold by year-end. Fold it into your wallet — carry it for the week.',
  },
  love: {
    title: 'Soften the heart',
    body: 'Brew rose tea on the warmest evening. Speak one tender truth out loud — to a person, a journal, or the dark. Let the words be enough.',
  },
  healing: {
    title: 'Tend the tender thing',
    body: 'Run a salt bath under the bright moon. Rest your hand on the part of you that aches. Stay there until the water goes cool.',
  },
  learning: {
    title: 'Make space for clarity',
    body: 'Pull out a fresh notebook. Spend ten quiet minutes on a question you keep half-asking. The answer arrives between the lines.',
  },
  structural: {
    title: 'Build the next stone',
    body: 'Pick the smallest piece of the bigger thing. Set a timer for twenty minutes. Stack one stone today — tomorrow you stack two.',
  },
  general: {
    title: 'Hold the week gently',
    body: 'Keep a single sprig of rosemary by your bed for seven nights. Each night, press a thumb to it and exhale once. The sky moves; you stay.',
  },
};

function pickRitual(
  topTransits: TransitWindow[],
  notableDays: NotableDay[],
): Ritual {
  // Use the dominant theme across the highest-scoring days.
  const themeCounts: Record<string, number> = {};
  for (const day of notableDays) {
    if (day.score <= 0) continue;
    themeCounts[day.theme] = (themeCounts[day.theme] ?? 0) + day.score;
  }
  let best: string = 'general';
  let bestScore = -Infinity;
  for (const [theme, score] of Object.entries(themeCounts)) {
    if (score > bestScore) {
      best = theme;
      bestScore = score;
    }
  }
  // Friction transits steer the ritual gentler — bias toward healing if a
  // friction transit dominates and the theme is general.
  const topTone = topTransits[0]?.tone;
  if (best === 'general' && topTone === 'friction') {
    best = 'healing';
  }
  return RITUAL_BY_THEME[best] ?? RITUAL_BY_THEME.general;
}

// ---------------------------------------------------------------------------
// Headline + summary
// ---------------------------------------------------------------------------

function buildHeadline(
  topTransits: TransitWindow[],
  moonJourney: MoonJourney,
): string {
  const top = topTransits[0];
  if (!top) {
    return `A quiet week, anchored in ${moonJourney.dominantPhase.name}`;
  }
  const tone =
    top.tone === 'flow'
      ? 'opens'
      : top.tone === 'friction'
        ? 'rearranges'
        : 'asks something of'; // pivot
  return `The week ${tone} you — ${top.transitPlanet} on natal ${top.natalPlanet}`;
}

function buildSummary(
  topTransits: TransitWindow[],
  moonJourney: MoonJourney,
  ritual: Ritual,
): string {
  const phase = moonJourney.dominantPhase;

  // Try to pull a poetic moon-phase blurb from the templates lib so the
  // summary stays grounded in the same voice as the rest of the app.
  const phaseEventMap: Record<string, LunarPhase | null> = {
    'New Moon': 'NewMoon',
    'Full Moon': 'FullMoon',
    'First Quarter': 'FirstQuarter',
    'Last Quarter': 'LastQuarter',
  };
  const phaseEvent = phaseEventMap[phase.name];
  const moonBlurb = phaseEvent
    ? (getTemplateBlurb({ kind: 'lunation', phase: phaseEvent }) ??
      `The moon walks the ${phase.name.toLowerCase()} side of the cycle.`)
    : `The moon walks the ${phase.name.toLowerCase()} side of the cycle through ${phase.sign}.`;

  const top = topTransits[0];
  const supporting = topTransits.slice(1, 3);

  const opener = top
    ? top.blurb
    : 'No single transit is raising its hand this week — let the small things matter.';

  const supportingLine =
    supporting.length === 0
      ? ''
      : ` Underneath, ${supporting
          .map((t) => t.oneLiner.toLowerCase())
          .join(' and ')} keep the undercurrent moving.`;

  const ritualLine = ` ${ritual.title}: ${ritual.body}`;

  return `${opener} ${moonBlurb}${supportingLine}${ritualLine}`.replace(
    /\s+/g,
    ' ',
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type BuildWeeklyPageArgs = {
  natalChart: BirthChartData[];
  /** ISO day (Sunday in user's locale). */
  weekStart: string;
  /** ISO day (Saturday in user's locale). */
  weekEnd: string;
};

/**
 * Build a fully-populated WeeklyPage from a natal chart and a week range.
 * Pure: no I/O, deterministic for a given input pair.
 */
export function buildWeeklyPage({
  natalChart,
  weekStart,
  weekEnd,
}: BuildWeeklyPageArgs): WeeklyPage {
  // Score each day in the window. Compute days as the integer day-diff between
  // weekStart and weekEnd, inclusive. Falls back to 7 if the input is malformed.
  const startDate = noonUtc(weekStart);
  const endDate = noonUtc(weekEnd);
  const rawDays =
    Math.round(
      (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000),
    ) + 1;
  const days =
    Number.isFinite(rawDays) && rawDays > 0 ? Math.min(rawDays, 14) : 7;

  const notableDays = scoreNextNDays({
    natalChart,
    days,
    from: startDate,
  });

  const topTransits = buildTopTransits(natalChart, notableDays);
  const moonJourney = buildMoonJourney(weekStart, weekEnd);
  const ritual = pickRitual(topTransits, notableDays);
  const headline = buildHeadline(topTransits, moonJourney);
  const summary = buildSummary(topTransits, moonJourney, ritual);

  return {
    weekStart,
    weekEnd,
    headline,
    topTransits,
    moonJourney,
    notableDays,
    ritual,
    summary,
  };
}

// ---------------------------------------------------------------------------
// Helpers exposed for routes that want to compute the canonical week range
// in a user's locale (Sunday → Saturday). Pure and timezone-aware.
// ---------------------------------------------------------------------------

/**
 * Given a `now` Date and an IANA timezone string, returns the ISO day strings
 * for the Sunday-anchored week that contains `now` in that timezone.
 *
 * If timezone parsing fails, falls back to UTC-based calculation.
 */
export function getCurrentWeekRange(
  now: Date = new Date(),
  timezone?: string,
): { weekStart: string; weekEnd: string } {
  const fmt = (() => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone || 'UTC',
        weekday: 'short',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        weekday: 'short',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    }
  })();

  const parts = fmt.formatToParts(now);
  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? 'Sun';
  const year = parts.find((p) => p.type === 'year')?.value ?? '1970';
  const month = parts.find((p) => p.type === 'month')?.value ?? '01';
  const day = parts.find((p) => p.type === 'day')?.value ?? '01';
  const todayIso = `${year}-${month}-${day}`;

  const weekdayIndex: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const offset = weekdayIndex[weekday] ?? 0;
  const start = new Date(`${todayIso}T12:00:00Z`);
  start.setUTCDate(start.getUTCDate() - offset);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);

  return { weekStart: isoDate(start), weekEnd: isoDate(end) };
}
