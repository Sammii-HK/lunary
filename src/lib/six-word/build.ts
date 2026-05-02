/**
 * Six-Word Horoscope — pure utility.
 *
 * "Co-Star nailed punchy push notifications with vague poetic generalities.
 * We do better — a daily 6-word horoscope (literally, ~6 words, deterministic,
 * sharable) derived from the user's actual top transit + Big Three."
 *
 * Composes a single line from a slot library:
 *
 *   [VERB_PHRASE] [WHAT/WHO] [QUALIFIER]
 *
 * - VERB_PHRASE is keyed by aspect type (Conjunction/Square/Trine/Sextile/Opp)
 *   so the imperative reflects what the transit actually *feels* like.
 * - WHAT/WHO names the transiting body and what it's touching on the user's
 *   chart (natal placement) — guarantees the line is specific, not generic.
 * - QUALIFIER is keyed by the dominant element of the natal chart and gets
 *   a Mercury-Rx tilt when Mercury is retrograde, so two users with the same
 *   transit still get differently-flavoured lines.
 *
 * The composer picks one option from each slot using a deterministic seed
 * (hash of `userId + dateUTC + topTransitKey`) so the line is stable across
 * reloads on the same day but rotates as soon as the date or transit changes.
 *
 * Output is exactly six words. We never generate generic horoscope filler —
 * every line names the active transit and the natal point it touches.
 */

import type { BirthChartData } from '../../../utils/astrology/birthChart';
import type { CurrentSky } from '../live-transits/find-next';

export type SixWordAspect =
  | 'Conjunction'
  | 'Sextile'
  | 'Square'
  | 'Trine'
  | 'Opposition';

export type SixWordElement = 'Fire' | 'Earth' | 'Air' | 'Water';

export interface TopTransit {
  transitPlanet: string;
  natalPlanet: string;
  aspect: SixWordAspect;
}

export interface BuildSixWordArgs {
  userId: string;
  /** ISO date in UTC, YYYY-MM-DD. */
  dateUTC: string;
  natalChart: BirthChartData[];
  /** Optional — only used to detect Mercury Rx. */
  currentSky?: CurrentSky & {
    Mercury?: { longitude: number; sign?: string; retrograde?: boolean };
  };
  /** Pre-computed top transit (caller usually passes findNextHit's result). */
  topTransit?: TopTransit | null;
  /** Force Mercury Rx state (overrides currentSky inference — for tests). */
  mercuryRx?: boolean;
}

export interface SixWordResult {
  line: string;
  /** A short, machine-readable tag describing what drove the line. */
  transitTag: string;
  dateUTC: string;
}

// ---------------------------------------------------------------------------
// Slot library
// ---------------------------------------------------------------------------

/**
 * Verb phrases keyed by aspect type. Each list trades off "directive" tone
 * (Square/Opposition: friction → instruction) vs "permissive" tone
 * (Trine/Sextile: flow → invitation) vs "potent" (Conjunction: ignition).
 *
 * 60 entries total — enough variety that two adjacent days never repeat
 * even when the same aspect type is dominant for a week-long outer transit.
 */
const VERB_PHRASES_BY_ASPECT: Record<SixWordAspect, string[]> = {
  Conjunction: [
    'Light a match under',
    'Begin again with',
    'Plant the new seed of',
    'Step into',
    'Marry your day to',
    'Anchor everything around',
    'Let the spark be',
    'Stand close to',
    'Speak the first word of',
    'Lean fully into',
    'Wake up beside',
    'Fuse yourself to',
  ],
  Square: [
    'Press gently against',
    'Stop arguing with',
    'Trust the friction with',
    'Stay close to',
    'Hold steady through',
    'Let the edge of',
    'Refuse to flinch from',
    'Sit inside the heat of',
    'Stop softening',
    'Meet the resistance in',
    'Breathe slowly into',
    'Move toward, not around,',
  ],
  Trine: [
    'Say yes to',
    'Ride the open road of',
    'Let yourself be carried by',
    'Trust the easy gift of',
    'Spend more time near',
    'Lean into the grace of',
    'Receive, finally,',
    'Open the door for',
    'Walk gently toward',
    'Let it be simple with',
    'Drift toward',
    'Rest inside',
  ],
  Sextile: [
    'Reach for',
    'Pick up the thread of',
    'Quietly say yes to',
    'Make one small move toward',
    'Notice the gentle pull of',
    'Whisper an invitation to',
    'Slip your hand into',
    'Send the email about',
    'Take a small step with',
    'Open the small door of',
    'Begin a conversation with',
    'Tilt slightly toward',
  ],
  Opposition: [
    'Sit across from',
    'Listen carefully to',
    'Stop pulling away from',
    'Hold the tension between you and',
    'Meet, fully,',
    'Stop performing for',
    'Look directly at',
    'Make peace with',
    'Speak honestly to',
    'Stand opposite, not against,',
    'Mirror the truth of',
    'Acknowledge',
  ],
};

/**
 * Qualifiers keyed by dominant element. ~12 each so daily output stays varied
 * across a season even if a slow outer transit drives the verb for weeks.
 */
const QUALIFIERS_BY_ELEMENT: Record<SixWordElement, string[]> = {
  Fire: [
    "— it's forging clarity.",
    '— burn what isn\u2019t yours.',
    "— don't dim the flare.",
    '— action beats analysis today.',
    '— move, then think.',
    '— the heat is the message.',
    '— combustion clears stagnation.',
    '— you were built for this.',
    '— bold beats polished.',
    '— let it ignite something honest.',
    "— you don't need permission.",
  ],
  Earth: [
    "— it's testing your edges.",
    '— make it tangible.',
    '— slow steady wins.',
    '— roots before branches.',
    '— build, don\u2019t broadcast.',
    '— give it form, not feelings.',
    '— pace yourself, please.',
    "— it's asking for craft.",
    '— small consistent matters here.',
    '— solidify what already works.',
    '— the body knows first.',
  ],
  Air: [
    '\u2014 think it through aloud.',
    '\u2014 ideas want a witness.',
    '\u2014 say it out loud.',
    '\u2014 the conversation is the work.',
    '\u2014 write the messy version.',
    '\u2014 clarity follows movement.',
    '\u2014 ask the better question.',
    '\u2014 reframe, then decide.',
    '\u2014 perspective is everything.',
    '\u2014 let curiosity lead.',
    '\u2014 lighten before deepening.',
  ],
  Water: [
    '\u2014 your feelings are intel.',
    '\u2014 stay with the tender thing.',
    '\u2014 let it move through.',
    '\u2014 cry if it asks.',
    '\u2014 stay close to people who soften.',
    '\u2014 tend, don\u2019t armour.',
    '\u2014 trust the under-current.',
    '\u2014 the dream is data.',
    '\u2014 hold yourself like family.',
    '\u2014 sink, don\u2019t skim.',
    '\u2014 the heart already knows.',
  ],
};

/** Mercury-Rx tilt — replaces or augments the qualifier when Mercury is Rx. */
const QUALIFIERS_MERCURY_RX: string[] = [
  '\u2014 reread before sending.',
  '\u2014 Mercury\u2019s editing the script.',
  '\u2014 say it slower.',
  '\u2014 the second draft is the one.',
  '\u2014 listen twice, speak once.',
  '\u2014 Mercury wants you to revise.',
  '\u2014 wait a beat, then reply.',
  '\u2014 confirm, don\u2019t assume.',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SIGN_ELEMENTS: Record<string, SixWordElement> = {
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

/**
 * Compute the dominant element across the user's natal chart, weighting the
 * Big Three (Sun, Moon, Ascendant) more heavily so a stellium of personal
 * planets in one element still wins on a typical chart.
 */
function dominantElement(natalChart: BirthChartData[]): SixWordElement {
  const counts: Record<SixWordElement, number> = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0,
  };
  for (const placement of natalChart) {
    if (!placement?.sign) continue;
    const element = SIGN_ELEMENTS[placement.sign];
    if (!element) continue;
    const weight =
      placement.body === 'Sun' ||
      placement.body === 'Moon' ||
      placement.body === 'Ascendant'
        ? 2
        : 1;
    counts[element] += weight;
  }
  let best: SixWordElement = 'Air';
  let bestCount = -1;
  for (const element of ['Fire', 'Earth', 'Air', 'Water'] as SixWordElement[]) {
    if (counts[element] > bestCount) {
      best = element;
      bestCount = counts[element];
    }
  }
  return best;
}

/**
 * Stable 32-bit string hash. Same algorithm used elsewhere in the codebase
 * for deterministic-randomness slot picks (see CLAUDE.md).
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function pick<T>(list: T[], seed: number, salt: number): T {
  return list[(seed + salt) % list.length];
}

function isMercuryRetrograde(args: BuildSixWordArgs): boolean {
  if (typeof args.mercuryRx === 'boolean') return args.mercuryRx;
  return Boolean(args.currentSky?.Mercury?.retrograde);
}

/** Pull a fallback "top transit" for when the caller couldn't compute one. */
function fallbackTransit(
  natalChart: BirthChartData[],
  seed: number,
): TopTransit {
  // Lean on the user's Sun → Moon → Ascendant in that order so the line is
  // still personal, even without an exact aspect.
  const priority = ['Sun', 'Moon', 'Ascendant'];
  for (const body of priority) {
    if (natalChart.some((p) => p.body === body)) {
      const aspects: SixWordAspect[] = ['Trine', 'Conjunction', 'Sextile'];
      return {
        transitPlanet: 'Moon',
        natalPlanet: body,
        aspect: aspects[seed % aspects.length],
      };
    }
  }
  return {
    transitPlanet: 'Moon',
    natalPlanet: 'Sun',
    aspect: 'Trine',
  };
}

function compactBodyLabel(body: string): string {
  if (body === 'Imum Coeli') return 'IC';
  if (body === 'North Node') return 'North-Node';
  if (body === 'South Node') return 'South-Node';
  return body.replace(/\s+/g, '-');
}

const EXACT_VERBS_BY_ASPECT: Record<SixWordAspect, string[]> = {
  Conjunction: ['ignites', 'wakes', 'charges', 'spotlights'],
  Square: ['tests', 'sharpens', 'pressures', 'confronts'],
  Trine: ['blesses', 'steadies', 'opens', 'softens'],
  Sextile: ['invites', 'nudges', 'signals', 'opens'],
  Opposition: ['mirrors', 'reveals', 'faces', 'balances'],
};

const ELEMENT_CLOSINGS: Record<SixWordElement, string[]> = {
  Fire: ['move first', 'risk cleanly', 'act now', 'choose heat'],
  Earth: ['build slowly', 'ground first', 'make proof', 'hold steady'],
  Air: ['speak clearly', 'ask better', 'name it', 'write honestly'],
  Water: ['feel fully', 'soften first', 'trust feeling', 'stay tender'],
};

function buildExactSixWordLine({
  transit,
  aspect,
  element,
  mercuryRx,
  seed,
}: {
  transit: TopTransit;
  aspect: SixWordAspect;
  element: SixWordElement;
  mercuryRx: boolean;
  seed: number;
}): string {
  const transitBody = compactBodyLabel(transit.transitPlanet);
  const natalBody = compactBodyLabel(transit.natalPlanet);
  const verb = pick(EXACT_VERBS_BY_ASPECT[aspect], seed, 11);
  const closing = mercuryRx
    ? pick(
        ['pause first', 'revise gently', 'read twice', 'answer slowly'],
        seed,
        17,
      )
    : pick(ELEMENT_CLOSINGS[element], seed, 17);
  return `${transitBody} ${verb} your ${natalBody}; ${closing}.`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build the daily six-word horoscope.
 *
 * Deterministic for `(userId, dateUTC, topTransit)` — refreshing the page
 * twice in one day always returns the same line. Crossing midnight UTC, or
 * a new top transit landing, produces a different line.
 */
export function buildSixWord(args: BuildSixWordArgs): SixWordResult {
  const { userId, dateUTC, natalChart } = args;

  const transit =
    args.topTransit ??
    fallbackTransit(natalChart, simpleHash(userId + dateUTC));
  const aspect: SixWordAspect = (
    [
      'Conjunction',
      'Sextile',
      'Square',
      'Trine',
      'Opposition',
    ] as SixWordAspect[]
  ).includes(transit.aspect)
    ? transit.aspect
    : 'Conjunction';

  const element = dominantElement(natalChart);
  const mercuryRx = isMercuryRetrograde(args);

  const transitKey = `${transit.transitPlanet}-${aspect}-${transit.natalPlanet}`;
  const seed = simpleHash(`${userId}|${dateUTC}|${transitKey}|${element}`);

  const line = buildExactSixWordLine({
    transit,
    aspect,
    element,
    mercuryRx,
    seed,
  });

  const transitTag = `${transit.transitPlanet.toLowerCase()}-${aspect.toLowerCase()}-${transit.natalPlanet.toLowerCase()}${
    mercuryRx ? '+rx' : ''
  }`;

  return { line, transitTag, dateUTC };
}

/** Exposed for tests and the OG route's allow-list logic. */
export const SLOT_LIBRARY_SIZE = {
  verbPhrases: Object.values(VERB_PHRASES_BY_ASPECT).reduce(
    (n, list) => n + list.length,
    0,
  ),
  qualifiers:
    Object.values(QUALIFIERS_BY_ELEMENT).reduce(
      (n, list) => n + list.length,
      0,
    ) + QUALIFIERS_MERCURY_RX.length,
} as const;
