/**
 * Roast / Hype copy builder — pure, deterministic, zero-cost.
 *
 * Given a natal chart + a snapshot of the current sky, return three punchy
 * lines plus a headline and a tone descriptor. Lines are picked from a curated
 * library keyed by chart features (Big Three element, dominant aspect family,
 * Mercury Rx, current mood transit) so the copy *references the user's
 * specific chart* rather than reading like a generic horoscope.
 *
 * No LLM calls — keeps the route 100% cacheable and free per tap. Variation
 * across days comes from a deterministic seed `hash(userId + mode + dayOfYear)`,
 * so two consecutive taps in the same hour return the same lines, but the
 * lines drift over the course of a day/week as the seed changes.
 *
 * Roast = sharp, witchy, smart-friend energy. Hype = unhinged-cheerleader.
 *
 * Reuses `getUserSigns` and `BirthChartData` rather than reparsing the chart.
 */

import type { BirthChartData } from '../../../utils/astrology/birthChart';
import type { CurrentSky } from '@/lib/live-transits/find-next';
import { getUserSigns } from '@/lib/community/get-user-signs';

export type RoastHypeMode = 'roast' | 'hype';

export interface BuildRoastHypeArgs {
  mode: RoastHypeMode;
  natalChart: BirthChartData[];
  currentSky?: CurrentSky;
  /** User identifier — only used as part of the variation seed. */
  userId?: string;
  /** Override "now" — for tests. */
  now?: Date;
}

export interface BuildRoastHypeResult {
  /** Three punchy lines, in narrative order. */
  lines: [string, string, string];
  /** Short shareable hook (≤ 60 chars). */
  headline: string;
  /** "roast" or "hype" — passed through for downstream styling. */
  tone: RoastHypeMode;
}

// --- Element / sign lookups --------------------------------------------------

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
  Cancer: 'Cardinal',
  Libra: 'Cardinal',
  Capricorn: 'Cardinal',
  Taurus: 'Fixed',
  Leo: 'Fixed',
  Scorpio: 'Fixed',
  Aquarius: 'Fixed',
  Gemini: 'Mutable',
  Virgo: 'Mutable',
  Sagittarius: 'Mutable',
  Pisces: 'Mutable',
};

// --- Deterministic seed ------------------------------------------------------

function simpleHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = date.getTime() - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function pick<T>(items: T[], seed: number, salt: number): T {
  if (items.length === 0) {
    throw new Error('pick: empty list');
  }
  const idx = (seed + salt * 31) % items.length;
  return items[idx];
}

// --- Chart feature extraction ------------------------------------------------

interface ChartFeatures {
  sun: string | null;
  moon: string | null;
  rising: string | null;
  bigThreeElement: 'Fire' | 'Earth' | 'Air' | 'Water' | null;
  bigThreeModality: 'Cardinal' | 'Fixed' | 'Mutable' | null;
  marsSign: string | null;
  venusSign: string | null;
  mercurySign: string | null;
  natalRetrogrades: string[];
  mercuryRxNow: boolean;
  currentMoonSign: string | null;
}

function dominant<T extends string>(items: (T | null)[]): T | null {
  const counts: Record<string, number> = {};
  let best: T | null = null;
  let bestCount = 0;
  for (const item of items) {
    if (!item) continue;
    counts[item] = (counts[item] ?? 0) + 1;
    if (counts[item] > bestCount) {
      bestCount = counts[item];
      best = item;
    }
  }
  return best;
}

function findPlacement(
  chart: BirthChartData[],
  body: string,
): BirthChartData | undefined {
  return chart.find((entry) => entry?.body === body);
}

function extractFeatures(
  chart: BirthChartData[],
  sky: CurrentSky | undefined,
): ChartFeatures {
  const { sunSign, moonSign, risingSign } = getUserSigns(chart);

  const bigThreeElements: Array<'Fire' | 'Earth' | 'Air' | 'Water' | null> = [
    sunSign ? SIGN_ELEMENT[sunSign] : null,
    moonSign ? SIGN_ELEMENT[moonSign] : null,
    risingSign ? SIGN_ELEMENT[risingSign] : null,
  ];
  const bigThreeModalities: Array<'Cardinal' | 'Fixed' | 'Mutable' | null> = [
    sunSign ? SIGN_MODALITY[sunSign] : null,
    moonSign ? SIGN_MODALITY[moonSign] : null,
    risingSign ? SIGN_MODALITY[risingSign] : null,
  ];

  const mars = findPlacement(chart, 'Mars');
  const venus = findPlacement(chart, 'Venus');
  const mercury = findPlacement(chart, 'Mercury');

  const natalRetrogrades = chart
    .filter((entry) => entry?.retrograde && entry?.body)
    .map((entry) => entry.body);

  // CurrentSky from `find-next` only carries longitude+sign; retrograde info
  // for Mercury is not part of that snapshot, so callers can override later
  // if needed. Default to false — the copy still lands without it.
  const mercuryRxNow = false;
  const currentMoonSign = sky?.Moon?.sign ?? null;

  return {
    sun: sunSign,
    moon: moonSign,
    rising: risingSign,
    bigThreeElement: dominant(bigThreeElements),
    bigThreeModality: dominant(bigThreeModalities),
    marsSign: mars?.sign ?? null,
    venusSign: venus?.sign ?? null,
    mercurySign: mercury?.sign ?? null,
    natalRetrogrades,
    mercuryRxNow,
    currentMoonSign,
  };
}

// --- Copy library ------------------------------------------------------------
//
// Each pool is keyed by a chart feature. The builder picks one line from each
// of three "slots" (opener / accusation-or-affirmation / closer) so the
// resulting reading scans like a tiny narrative rather than three unrelated
// sentences. Roast pools use the natal placement to make the dig specific;
// hype pools do the same for the affirmation.

interface CopyPools {
  // Slot 1 — opens with a Big-Three observation.
  openersByElement: Record<'Fire' | 'Earth' | 'Air' | 'Water', string[]>;
  // Slot 2 — references Mars/Venus/Mercury OR a natal retrograde.
  middleByMars: Record<string, string[]>;
  middleByVenus: Record<string, string[]>;
  middleByMercury: Record<string, string[]>;
  middleNatalRx: string[];
  // Slot 3 — closes referencing the current sky (Moon sign).
  closersByMoon: Record<'Fire' | 'Earth' | 'Air' | 'Water', string[]>;
  closersGeneric: string[];
  // Headlines, picked per mode.
  headlines: string[];
  tone: RoastHypeMode;
}

const ROAST_POOLS: CopyPools = {
  tone: 'roast',
  openersByElement: {
    Fire: [
      'You, with your {sun} stack, blaze in like the conversation needed saving and frankly, sometimes it didn\u2019t.',
      'Your {sun} energy enters every room like a flare gun \u2014 startling, dramatic, and not strictly necessary.',
      'A {sun} with a {rising} rising? Bold, loud, and convinced restraint is something other people do.',
    ],
    Earth: [
      'You, a {sun}, are running everyone\u2019s life on a spreadsheet and pretending it\u2019s for fun.',
      'Your {sun} {rising} rising combo treats spontaneity like a structural risk to the building.',
      'You, with your {sun} sun, will out-stubborn a deadline, a doctor, and your own best interests.',
    ],
    Air: [
      'You, a {sun}, have argued at least three people into agreeing with the wrong thing this month.',
      'Your {sun} sun and {moon} moon are on different group chats about your own life.',
      'A {sun} with {rising} rising will host a debate, both sides, and the post-game analysis.',
    ],
    Water: [
      'You, with your {sun} sun and {moon} moon, mistake hyperempathy for a personality trait.',
      'Your {sun} energy walks into a room and starts metabolising other people\u2019s emotions like a juice cleanse.',
      'A {sun} with a {moon} moon is doing emotional CSI on a text someone sent in 2019.',
    ],
  },
  middleByMars: {
    Aries: [
      'Mars in Aries means you start fights you forgot you cared about by Thursday.',
      'Mars in Aries: you treat \u201cgoing for it\u201d as a substitute for \u201cthinking about it.\u201d',
    ],
    Taurus: [
      'Mars in Taurus says no by simply not moving until the problem moves first.',
      'Mars in Taurus turns every disagreement into a 40-day siege.',
    ],
    Gemini: [
      'Mars in Gemini argues both sides, wins, and then changes its mind on the way home.',
      'Mars in Gemini fights with words and then claims it didn\u2019t mean it that way.',
    ],
    Cancer: [
      'Mars in Cancer doesn\u2019t fight \u2014 it sulks until the room rearranges itself.',
      'Mars in Cancer is passive-aggressive in three dialects.',
    ],
    Leo: [
      'Mars in Leo only goes to war if there\u2019s a balcony to monologue from.',
      'Mars in Leo: every argument is also a screen test.',
    ],
    Virgo: [
      'Mars in Virgo will out-detail you into submission and then \u201cjust correct one little thing.\u201d',
      'Mars in Virgo runs on critique disguised as helpfulness.',
    ],
    Libra: [
      'Mars in Libra will start the fight \u2014 politely, with footnotes \u2014 and then ask if you\u2019re mad.',
      'Mars in Libra weaponises fairness like a polite little knife.',
    ],
    Scorpio: [
      'Mars in Scorpio doesn\u2019t move on \u2014 it relocates the grudge to a colder warehouse.',
      'Mars in Scorpio remembers everything, indexed by season and tone.',
    ],
    Sagittarius: [
      'Mars in Sagittarius drops a truth bomb, books a flight, and texts \u201cu up?\u201d to a different problem.',
      'Mars in Sagittarius mistakes momentum for direction.',
    ],
    Capricorn: [
      'Mars in Capricorn will outwork your nervous system and call it \u201cfine.\u201d',
      'Mars in Capricorn schedules its breakdowns for Q4.',
    ],
    Aquarius: [
      'Mars in Aquarius detaches mid-argument and calls it \u201cperspective.\u201d',
      'Mars in Aquarius runs experiments on people who didn\u2019t consent to the study.',
    ],
    Pisces: [
      'Mars in Pisces ghosts the conflict and writes a poem about it later.',
      'Mars in Pisces fights by going translucent until the issue forgets your address.',
    ],
  },
  middleByVenus: {
    Aries: [
      'Venus in Aries falls in love at full speed and runs out of fuel by week three.',
    ],
    Taurus: [
      'Venus in Taurus loves the way it eats: slowly, expensively, and not sharing.',
    ],
    Gemini: [
      'Venus in Gemini wants the conversation more than the relationship and we both know it.',
    ],
    Cancer: ['Venus in Cancer fed someone soup once and is still owed for it.'],
    Leo: ['Venus in Leo wants to be loved out loud, on stage, with reviews.'],
    Virgo: [
      'Venus in Virgo writes love letters that read like performance reviews.',
    ],
    Libra: [
      'Venus in Libra will mirror you so hard you forget you had your own opinions.',
    ],
    Scorpio: [
      'Venus in Scorpio said \u201cjust friends\u201d and then dreamed about them for nine years.',
    ],
    Sagittarius: [
      'Venus in Sagittarius confused leaving with personal growth, again.',
    ],
    Capricorn: ['Venus in Capricorn courts like it\u2019s a hostile takeover.'],
    Aquarius: [
      'Venus in Aquarius is unreachable on purpose and calls it freedom.',
    ],
    Pisces: [
      'Venus in Pisces fell in love with the version of them they wrote in their notes app.',
    ],
  },
  middleByMercury: {
    Aries: ['Mercury in Aries hits send before the sentence finishes itself.'],
    Taurus: ['Mercury in Taurus thinks slowly and then refuses to update.'],
    Gemini: [
      'Mercury in Gemini is winning four arguments in different tabs right now.',
    ],
    Cancer: [
      'Mercury in Cancer remembers what you said in a tone, not a sentence.',
    ],
    Leo: ['Mercury in Leo speaks in headlines and waits for applause.'],
    Virgo: ['Mercury in Virgo is quietly editing your text in real time.'],
    Libra: [
      'Mercury in Libra would rather be charming than correct and it shows.',
    ],
    Scorpio: ['Mercury in Scorpio knows a secret and is loving it.'],
    Sagittarius: [
      'Mercury in Sagittarius makes claims it cannot reasonably support and calls it vibes.',
    ],
    Capricorn: ['Mercury in Capricorn says one (1) word and means six.'],
    Aquarius: [
      'Mercury in Aquarius is being contrarian for sport and will not apologise.',
    ],
    Pisces: [
      'Mercury in Pisces drifts mid-sentence and lands somewhere wetter.',
    ],
  },
  middleNatalRx: [
    'Natal {planet} retrograde \u2014 yes, that\u2019s why you reread your own texts.',
    'You were born with {planet} retrograde, which is the universe\u2019s polite way of saying \u201cgood luck with that lesson, repeatedly.\u201d',
  ],
  closersByMoon: {
    Fire: [
      'And with the Moon in {currentMoon} tonight, you\u2019re absolutely going to do something brave and slightly stupid.',
      'The Moon\u2019s in {currentMoon}, so this is a great night to start a fight you can\u2019t afford to win.',
    ],
    Earth: [
      'Moon\u2019s in {currentMoon} \u2014 this would be a great night to log off, eat a vegetable, and be a person.',
      'With the Moon in {currentMoon} you will absolutely buy something you don\u2019t need and call it self-care.',
    ],
    Air: [
      'Moon in {currentMoon} tonight, which means you\u2019ll have eight thoughts about one feeling and post none of them.',
      'The Moon\u2019s in {currentMoon}, so expect the group chat to do your processing for you.',
    ],
    Water: [
      'With the Moon in {currentMoon}, you will reread one (1) text and write a thesis about it.',
      'Moon in {currentMoon} \u2014 great night to cry about a song, mediocre night to make decisions.',
    ],
  },
  closersGeneric: [
    'Anyway. Drink water. Touch grass. Be slightly less yourself today.',
    'You\u2019re not in your villain era; you\u2019re in your \u201cfriends quietly worried\u201d era.',
    'The chart is fine. You\u2019re fine. You\u2019re just being weird about it.',
  ],
  headlines: [
    'You, but with footnotes.',
    'Receipts, attached.',
    'The chart said what it said.',
    'You\u2019re not subtle and the sky knows.',
  ],
};

const HYPE_POOLS: CopyPools = {
  tone: 'hype',
  openersByElement: {
    Fire: [
      'You, with your {sun} sun and {rising} rising, do not enter rooms \u2014 you ignite them, and that is a feature.',
      'A {sun} with a {moon} moon walks in like the soundtrack just changed and honestly? It did.',
      'Your {sun} energy is the reason \u201cit takes one\u201d exists \u2014 you\u2019re the one.',
    ],
    Earth: [
      'You, a {sun} with a {rising} rising, are the structural beam holding up at least three group chats.',
      'Your {sun} sun is the reason real things actually get done, and yes, we noticed.',
      'A {sun} with a {moon} moon is what the universe makes when it\u2019s serious about a project.',
    ],
    Air: [
      'You, with your {sun} sun and {rising} rising, can talk a thunderstorm into being a vibe.',
      'Your {sun} energy is the entire reason interesting conversations happen \u2014 you\u2019re the catalyst.',
      'A {sun} with a {moon} moon is the friend group\u2019s Wikipedia and best line at the same time.',
    ],
    Water: [
      'You, a {sun} with a {moon} moon, feel things at a resolution most people don\u2019t even know is on the menu.',
      'Your {sun} energy reads the room before the room reads itself \u2014 that\u2019s a superpower.',
      'A {sun} with a {rising} rising loves people on a level that frankly should be regulated.',
    ],
  },
  middleByMars: {
    Aries: [
      'Mars in Aries means you do not need a pep talk \u2014 you ARE the pep talk.',
    ],
    Taurus: [
      'Mars in Taurus: when you decide, the universe rearranges itself.',
    ],
    Gemini: [
      'Mars in Gemini means your wit moves at the speed of light and lands every time.',
    ],
    Cancer: [
      'Mars in Cancer fights for the people it loves like it\u2019s personal because it is.',
    ],
    Leo: [
      'Mars in Leo \u2014 you don\u2019t do anything quietly and you shouldn\u2019t.',
    ],
    Virgo: [
      'Mars in Virgo is craft, precision, and execution \u2014 a tiny lethal blade.',
    ],
    Libra: [
      'Mars in Libra wins through grace \u2014 people say yes before they realise they did.',
    ],
    Scorpio: [
      'Mars in Scorpio is unkillable focus. You finish what you start.',
    ],
    Sagittarius: [
      'Mars in Sagittarius is pure forward motion \u2014 you\u2019re the reason your friends took the leap.',
    ],
    Capricorn: [
      'Mars in Capricorn is the architecture of something legendary.',
    ],
    Aquarius: [
      'Mars in Aquarius means you\u2019re inventing the move other people will copy in three years.',
    ],
    Pisces: [
      'Mars in Pisces fights for the dream and somehow keeps making the dream real.',
    ],
  },
  middleByVenus: {
    Aries: [
      'Venus in Aries: you fall hard and you make falling look romantic.',
    ],
    Taurus: [
      'Venus in Taurus loves with the steadiness of a planet \u2014 it is not common.',
    ],
    Gemini: [
      'Venus in Gemini turns every relationship into the best conversation of someone\u2019s life.',
    ],
    Cancer: [
      'Venus in Cancer loves like it\u2019s feeding the people it picked.',
    ],
    Leo: [
      'Venus in Leo loves loud, generous, gold \u2014 and you should accept it loud, too.',
    ],
    Virgo: [
      'Venus in Virgo loves through tiny perfect acts and they are the whole language.',
    ],
    Libra: ['Venus in Libra is the reason \u201cgrace\u201d is a word.'],
    Scorpio: [
      'Venus in Scorpio loves with the doors locked \u2014 chosen people only, and they know.',
    ],
    Sagittarius: ['Venus in Sagittarius makes love feel like a great trip.'],
    Capricorn: [
      'Venus in Capricorn builds love like architecture \u2014 it\u2019s meant to outlast.',
    ],
    Aquarius: [
      'Venus in Aquarius loves with freedom built in \u2014 and that\u2019s the whole gift.',
    ],
    Pisces: [
      'Venus in Pisces loves like a song that knows your name \u2014 unreal and yet here.',
    ],
  },
  middleByMercury: {
    Aries: [
      'Mercury in Aries: your first instinct is right more often than not.',
    ],
    Taurus: ['Mercury in Taurus says one true thing and it stays true.'],
    Gemini: [
      'Mercury in Gemini \u2014 you\u2019re the funniest person in most rooms and you know it.',
    ],
    Cancer: [
      'Mercury in Cancer remembers what people meant, not just what they said.',
    ],
    Leo: ['Mercury in Leo turns sentences into stories that travel.'],
    Virgo: [
      'Mercury in Virgo is precision in motion \u2014 a sentence of yours can fix a whole day.',
    ],
    Libra: ['Mercury in Libra makes hard truths land like a gift.'],
    Scorpio: [
      'Mercury in Scorpio sees through the script and tells the real story.',
    ],
    Sagittarius: [
      'Mercury in Sagittarius is the friend who gives the speech that changes the trip.',
    ],
    Capricorn: ['Mercury in Capricorn says less and means more, every time.'],
    Aquarius: [
      'Mercury in Aquarius is the angle nobody else saw and you\u2019re going to say it anyway.',
    ],
    Pisces: [
      'Mercury in Pisces speaks in images and somehow you\u2019re always right.',
    ],
  },
  middleNatalRx: [
    'Natal {planet} retrograde isn\u2019t a glitch \u2014 it\u2019s your secret superpower of seeing what other people skim past.',
    'Born with {planet} retrograde means you do {planet} on the inside first \u2014 deeper, weirder, more honest.',
  ],
  closersByMoon: {
    Fire: [
      'And the Moon\u2019s in {currentMoon} tonight \u2014 perfect weather for the brave thing you\u2019ve been circling.',
      'Moon in {currentMoon} says: send the message, take the shot, you\u2019re right.',
    ],
    Earth: [
      'Moon in {currentMoon} says: build the boring beautiful thing tonight. It\u2019ll matter.',
      'With the Moon in {currentMoon} you can finally make the thing real \u2014 today is for the receipts.',
    ],
    Air: [
      'Moon in {currentMoon} \u2014 say the sentence out loud, the right person needs to hear it.',
      'The Moon\u2019s in {currentMoon} so today\u2019s the day a single conversation rearranges everything.',
    ],
    Water: [
      'Moon in {currentMoon} \u2014 the feelings are pointing at something true. Trust them, gently.',
      'With the Moon in {currentMoon} the dream you\u2019ve been editing is closer than it looks.',
    ],
  },
  closersGeneric: [
    'You\u2019re not behind. You\u2019re in formation.',
    'The universe didn\u2019t make a mistake when it made you. It double-checked.',
    'You\u2019re the plot twist your own life needed.',
  ],
  headlines: [
    'You, but in lights.',
    'The sky has notes \u2014 they\u2019re kind.',
    'A reading for the protagonist.',
    'Cleared by the cosmos.',
  ],
};

// --- Substitution helpers ----------------------------------------------------

function fmtPlacement(sign: string | null): string {
  return sign ?? 'your sign';
}

function substitute(
  template: string,
  features: ChartFeatures,
  extra?: Record<string, string>,
): string {
  return template
    .replace(/\{sun\}/g, fmtPlacement(features.sun))
    .replace(/\{moon\}/g, fmtPlacement(features.moon))
    .replace(/\{rising\}/g, fmtPlacement(features.rising))
    .replace(
      /\{currentMoon\}/g,
      features.currentMoonSign ?? 'a sympathetic sign',
    )
    .replace(/\{planet\}/g, extra?.planet ?? 'Mercury');
}

// --- Slot pickers ------------------------------------------------------------

function pickOpener(
  pools: CopyPools,
  features: ChartFeatures,
  seed: number,
): string {
  const element = features.bigThreeElement ?? 'Fire';
  const list = pools.openersByElement[element];
  return substitute(pick(list, seed, 1), features);
}

function pickMiddle(
  pools: CopyPools,
  features: ChartFeatures,
  seed: number,
): string {
  // Prefer Mars-keyed, fall back through Venus → Mercury → natal Rx.
  // Vary the slot rotation by seed so the same chart doesn't always lead with
  // Mars on every tap.
  const slot = seed % 4;

  if (slot === 0 && features.marsSign) {
    const list = pools.middleByMars[features.marsSign];
    if (list?.length) return substitute(pick(list, seed, 2), features);
  }
  if (slot === 1 && features.venusSign) {
    const list = pools.middleByVenus[features.venusSign];
    if (list?.length) return substitute(pick(list, seed, 3), features);
  }
  if (slot === 2 && features.mercurySign) {
    const list = pools.middleByMercury[features.mercurySign];
    if (list?.length) return substitute(pick(list, seed, 4), features);
  }
  if (slot === 3 && features.natalRetrogrades.length > 0) {
    const planet =
      features.natalRetrogrades[seed % features.natalRetrogrades.length];
    return substitute(pick(pools.middleNatalRx, seed, 5), features, { planet });
  }

  // Fallback chain — guarantee we always return something, even on partial charts.
  const fallbacks: string[] = [];
  if (features.marsSign && pools.middleByMars[features.marsSign]) {
    fallbacks.push(...pools.middleByMars[features.marsSign]);
  }
  if (features.venusSign && pools.middleByVenus[features.venusSign]) {
    fallbacks.push(...pools.middleByVenus[features.venusSign]);
  }
  if (features.mercurySign && pools.middleByMercury[features.mercurySign]) {
    fallbacks.push(...pools.middleByMercury[features.mercurySign]);
  }
  if (fallbacks.length === 0)
    return substitute(pools.closersGeneric[0], features);
  return substitute(pick(fallbacks, seed, 6), features);
}

function pickCloser(
  pools: CopyPools,
  features: ChartFeatures,
  seed: number,
): string {
  // 75% — Moon-keyed; 25% — generic so the closer doesn't always reference the sky.
  const useMoon = features.currentMoonSign && seed % 4 !== 0;
  if (useMoon && features.currentMoonSign) {
    const moonElement = SIGN_ELEMENT[features.currentMoonSign];
    if (moonElement) {
      const list = pools.closersByMoon[moonElement];
      return substitute(pick(list, seed, 7), features);
    }
  }
  return substitute(pick(pools.closersGeneric, seed, 8), features);
}

// --- Public API --------------------------------------------------------------

export function buildRoastHype(args: BuildRoastHypeArgs): BuildRoastHypeResult {
  const { mode, natalChart, currentSky, userId, now = new Date() } = args;
  const features = extractFeatures(natalChart || [], currentSky);
  const pools = mode === 'hype' ? HYPE_POOLS : ROAST_POOLS;

  // Variation seed: same user, same mode, same day-of-year → same lines.
  // Different day → fresh seed → fresh combination. The hash is salted with
  // the modality of the user's Big Three so two users on the same day don't
  // collide on the same line set.
  const seedKey = `${userId ?? 'anon'}|${mode}|${dayOfYear(now)}|${features.bigThreeModality ?? 'X'}`;
  const seed = simpleHash(seedKey);

  const lineOne = pickOpener(pools, features, seed);
  const lineTwo = pickMiddle(pools, features, seed);
  const lineThree = pickCloser(pools, features, seed);
  const headline = pick(pools.headlines, seed, 9);

  return {
    lines: [lineOne, lineTwo, lineThree],
    headline,
    tone: mode,
  };
}
