/**
 * transit-copy.ts
 *
 * Rich, seeded copy for transit aspects and planet-in-sign summaries.
 * Each combination has multiple template variants — the seeded picker
 * rotates them by week + user so no two users read the same line.
 *
 * Follows the same pattern as grimoire-email-copy.ts.
 * No em dashes. UK English.
 */

import planetaryBodies from '@/data/planetary-bodies.json';

// ─── Seeding ─────────────────────────────────────────────────────────────────

function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
}

function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) + h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function seededPick<T>(arr: T[], seed: number, offset = 0): T {
  return arr[Math.abs(seed + offset) % arr.length];
}

export function getTransitSeed(userId?: string, offset = 0): number {
  const week = getWeekNumber();
  const user = userId ? hashString(userId) : 0;
  return week * 31 + user + offset;
}

// ─── Duration phrasing ───────────────────────────────────────────────────────

/**
 * Returns a natural time phrase from remaining days.
 * e.g. "over the next few hours", "for the rest of this week", "over the coming months"
 */
export function formatTransitWindow(remainingDays: number): string {
  if (remainingDays < 0.5) return 'in the next few hours';
  if (remainingDays < 1) return 'for the rest of today';
  if (remainingDays < 2) return 'over the next day or two';
  if (remainingDays < 5) return 'over the next few days';
  if (remainingDays < 10) return 'for the rest of this week';
  if (remainingDays < 21) return 'over the coming weeks';
  if (remainingDays < 60) return 'over the coming month';
  return 'over the coming months';
}

// ─── Natal planet themes ─────────────────────────────────────────────────────
// What each natal planet represents for YOU specifically

const NATAL_THEMES: Record<string, string> = {
  Sun: 'your sense of self and vitality',
  Moon: 'your emotional nature and inner life',
  Mercury: 'how you think, communicate, and process information',
  Venus: 'your relationships, values, and what you find beautiful',
  Mars: 'your drive, ambition, and the way you take action',
  Jupiter: 'your capacity for growth, faith, and expansion',
  Saturn: 'your discipline, long-term goals, and where you build over time',
  Uranus: 'your need for freedom and where you break from the expected',
  Neptune: 'your intuition, ideals, and your connection to something larger',
  Pluto: 'your personal power and the deepest places of transformation',
  Ascendant: 'how you present yourself and how others first encounter you',
  Midheaven: 'your public life, career, and long-term ambitions',
};

// ─── House meanings ──────────────────────────────────────────────────────────

const HOUSE_MEANINGS: Record<number, string> = {
  1: 'identity and how you show up',
  2: 'money, self-worth, and what you value',
  3: 'communication, learning, and your local world',
  4: 'home, roots, and your inner foundation',
  5: 'creativity, joy, and self-expression',
  6: 'health, daily work, and small habits',
  7: 'partnerships and close relationships',
  8: 'transformation, intimacy, and shared resources',
  9: 'beliefs, travel, and expanding your worldview',
  10: 'career, reputation, and long-term goals',
  11: 'community, friends, and future visions',
  12: 'solitude, the subconscious, and what is hidden',
};

export function getHouseMeaning(house: number): string {
  return HOUSE_MEANINGS[house] ?? 'personal growth';
}

// ─── Sign flavour (how each sign colours any planet passing through) ────────

const SIGN_FLAVOUR: Record<string, string> = {
  Aries: 'direct, initiating, and impatient for first steps',
  Taurus: 'sensual, grounded, and unhurried',
  Gemini: 'curious, quick, and juggling several threads',
  Cancer: 'protective, emotionally textured, and attuned to belonging',
  Leo: 'warm, expressive, and visible',
  Virgo: 'discerning, practical, and attentive to craft',
  Libra: 'relational, balance-seeking, and aesthetically careful',
  Scorpio: 'deep, private, and willing to go underneath',
  Sagittarius: 'expansive, meaning-seeking, and forward-leaning',
  Capricorn: 'structured, long-view, and committed to what lasts',
  Aquarius: 'detached, future-facing, and community-minded',
  Pisces: 'porous, intuitive, and dissolving edges',
};

export function getSignFlavour(sign: string): string {
  return SIGN_FLAVOUR[sign] ?? 'distinct in its own way';
}

// ─── Planet nature (the essential function of each planet) ──────────────────

const PLANET_NATURE: Record<string, string> = {
  Sun: 'identity, vitality, the self you are growing into',
  Moon: 'feelings, reflex, the inner weather',
  Mercury: 'thinking, speaking, connecting ideas',
  Venus: 'relating, valuing, what you find beautiful',
  Mars: 'drive, action, the way you push',
  Jupiter: 'expansion, belief, how you enlarge life',
  Saturn: 'structure, commitment, what endures',
  Uranus: 'disruption, awakening, the break from convention',
  Neptune: 'imagination, devotion, the dissolve of edges',
  Pluto: 'power, depth, what transforms through loss',
  Chiron: 'wound and teaching, where you heal others through your own scar',
  Ascendant: 'the face you show first',
  Descendant: 'the other you meet in partnership',
  Midheaven: 'the public self and long-horizon direction',
  IC: 'the private root, where you come from',
  Vertex: 'fated encounters, what finds you',
  'Anti-Vertex': 'what you go out to meet',
  'Part of Fortune': 'ease, natural flow, inherited luck',
  'North Node': 'the growth edge, unfamiliar ground',
  'South Node': 'the well-worn groove, what to release',
  Pallas: 'pattern recognition, strategy, creative intelligence',
};

export function getPlanetNature(planet: string): string {
  return PLANET_NATURE[planet] ?? `your natal ${planet}`;
}

// ─── Dignity modifier ────────────────────────────────────────────────────────

const DIGNITY_NOTE: Record<string, string> = {
  domicile: 'at home in this sign — the expression lands without translation',
  exalted: 'exalted here — the sign amplifies the planet at its best',
  detriment:
    'in detriment — the sign and the planet pull in opposite directions',
  fall: 'in fall — the sign dampens what the planet wants to express',
};

export function getDignityNote(dignity?: string | null): string | null {
  if (!dignity) return null;
  return DIGNITY_NOTE[dignity] ?? null;
}

// ─── Placement narrative (Sky Now expanded rows) ────────────────────────────
// Links planet nature × sign flavour × house area × dignity in 1-2 sentences.

export interface PlacementNarrativeInput {
  planet: string;
  sign: string;
  /** The user's natal house this planet currently falls in (whole-sign). */
  house?: number | null;
  /** Essential dignity: 'domicile' | 'exalted' | 'detriment' | 'fall'. */
  dignity?: string | null;
  retrograde?: boolean;
}

export function composePlacementNarrative({
  planet,
  sign,
  house,
  dignity,
  retrograde,
}: PlacementNarrativeInput): string {
  const nature = getPlanetNature(planet);
  const flavour = getSignFlavour(sign);
  const houseArea = house ? HOUSE_MEANINGS[house] : null;
  const dignityNote = getDignityNote(dignity);

  // Sentence 1: planet + sign — how the sign colours the planet's nature.
  const first = `${planet} (${nature}) moves through ${sign} ${flavour}`;

  // Sentence 2: where in life it's active — house area + dignity.
  const segments: string[] = [];
  if (houseArea && house) {
    segments.push(
      `In your ${ordinal(house)} house of ${houseArea}, that's where you'll feel it landing`,
    );
  }
  if (dignityNote) {
    segments.push(dignityNote);
  }
  if (retrograde) {
    segments.push(
      `retrograde right now — its themes are turning inward before they resolve`,
    );
  }

  const second = segments.length ? `${segments.join('. ')}.` : '';
  return second ? `${first}. ${second}` : `${first}.`;
}

// ─── Ordinal helper ──────────────────────────────────────────────────────────

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ─── Transit planet descriptions ─────────────────────────────────────────────
// What this transiting planet does when it moves through your chart

const TRANSIT_PLANET_ENERGY: Record<string, string[]> = {
  Sun: [
    'spotlighting and activating',
    'bringing focus and vitality to',
    'illuminating and energising',
  ],
  Moon: [
    'emotionally stirring',
    'bringing a wave of feeling through',
    'sensitising and tuning you into',
  ],
  Mercury: [
    'sharpening your thinking around',
    'bringing conversations and ideas to',
    'mentally activating',
  ],
  Venus: [
    'softening and opening up',
    'bringing warmth and beauty to',
    'drawing ease and connection into',
  ],
  Mars: [
    'pushing and energising',
    'bringing drive and urgency to',
    'activating and heating up',
  ],
  Jupiter: [
    'expanding and opening up',
    'bringing growth and opportunity to',
    'blessing and enlarging',
  ],
  Saturn: [
    'testing and strengthening',
    'bringing structure and seriousness to',
    'asking for discipline around',
  ],
  Uranus: [
    'disrupting and awakening',
    'shaking loose and electrifying',
    'bringing sudden change to',
  ],
  Neptune: [
    'softening and dissolving the edges around',
    'bringing sensitivity and mystery to',
    'heightening intuition around',
  ],
  Pluto: [
    'digging deep into and transforming',
    'bringing intensity and power to',
    'permanently reshaping',
  ],
};

// ─── Aspect tone ─────────────────────────────────────────────────────────────

type AspectContext = {
  flavour: string; // how the aspect feels
  direction: string; // what to do with it
};

const ASPECT_CONTEXT: Record<string, AspectContext[]> = {
  conjunction: [
    {
      flavour: 'The two energies are merging. What you feel here is amplified.',
      direction: 'Work with it rather than against it.',
    },
    {
      flavour: 'This is an intensification. Both forces speak at once.',
      direction: 'Lean into whatever feels most alive in this area.',
    },
    {
      flavour:
        'A merging of forces. The line between transit and natal blurs here.',
      direction: 'Notice what wants to move and let it.',
    },
  ],
  trine: [
    {
      flavour: 'This is a flowing, supportive connection.',
      direction: 'The door is open. You still have to walk through it.',
    },
    {
      flavour: 'Ease and alignment are available here.',
      direction:
        'Use the smooth energy rather than assuming it will do the work for you.',
    },
    {
      flavour: 'Things flow well between these two areas of your chart.',
      direction: 'Act on what comes naturally right now.',
    },
  ],
  sextile: [
    {
      flavour: 'A gentle opportunity is present.',
      direction:
        'It will not force itself on you. Take initiative and it opens.',
    },
    {
      flavour: 'There is an opening here if you look for it.',
      direction: 'Small steps in this area carry more weight than usual.',
    },
    {
      flavour: 'An invitation rather than a push.',
      direction:
        'A conversation, a small action, or a decision here has good timing.',
    },
  ],
  square: [
    {
      flavour: 'This is friction. Not bad, but it will not be comfortable.',
      direction: 'The tension is asking you to grow through it, not around it.',
    },
    {
      flavour: 'Challenge and pressure are part of this transit.',
      direction: 'What feels blocked here is where the real work is.',
    },
    {
      flavour: 'These two forces are in conflict. Something has to give.',
      direction: 'Use the pressure as fuel rather than letting it build up.',
    },
  ],
  opposition: [
    {
      flavour: 'Two parts of your life are pulling in opposite directions.',
      direction:
        'The goal is not to choose one over the other but to find the tension useful.',
    },
    {
      flavour: 'You are being asked to hold two things at once.',
      direction:
        'What looks like a contradiction may actually be a balance point.',
    },
    {
      flavour: 'Awareness of what is on both sides is the work right now.',
      direction: 'Neither extreme is the answer.',
    },
  ],
};

// ─── Full transit aspect copy ─────────────────────────────────────────────────

export interface TransitCopyInput {
  transitPlanet: string;
  natalPlanet: string;
  aspectType: string;
  remainingDays?: number;
  isApplying?: boolean;
  userId?: string;
  seed?: number;
  /** Sign the transiting planet is currently in. */
  transitSign?: string;
  /** Natal body's natal sign. */
  natalSign?: string;
  /** The user's natal house the transiting planet currently falls in. */
  transitHouse?: number | null;
  /** The user's natal house the natal body sits in. */
  natalHouse?: number | null;
  /** Essential dignity of the transiting planet in its current sign. */
  transitDignity?: string | null;
}

export interface TransitCopyOutput {
  headline: string; // one sentence, what is happening
  meaning: string; // one to two sentences, what it means
  action: string; // one sentence, what to do
  window: string; // e.g. "over the next 3 days"
}

/**
 * Returns rich, seeded copy for a transit aspect.
 */
export function getTransitCopy({
  transitPlanet,
  natalPlanet,
  aspectType,
  remainingDays = 7,
  isApplying = true,
  userId,
  seed: seedOverride,
  transitSign,
  natalSign,
  transitHouse,
  natalHouse,
  transitDignity,
}: TransitCopyInput): TransitCopyOutput {
  const seed = seedOverride ?? getTransitSeed(userId);
  const window = formatTransitWindow(remainingDays);
  const timing = isApplying ? 'building' : 'passing';

  const natalTheme = NATAL_THEMES[natalPlanet] ?? `your natal ${natalPlanet}`;
  const planetEnergies = TRANSIT_PLANET_ENERGY[transitPlanet] ?? [
    'influencing',
  ];
  const energy = seededPick(planetEnergies, seed, 0);

  const aspectContexts =
    ASPECT_CONTEXT[aspectType] ?? ASPECT_CONTEXT.conjunction;
  const aspectCtx = seededPick(aspectContexts, seed, 3);

  // Pull a transit effect from planetary-bodies.json if available
  const planetKey = transitPlanet.toLowerCase() as keyof typeof planetaryBodies;
  const planetData = planetaryBodies[planetKey] as
    | { transitEffect?: string; keywords?: string[] }
    | undefined;
  const planetKeywords: string[] = planetData?.keywords ?? [];
  const kw1 = planetKeywords[0]?.toLowerCase() ?? transitPlanet.toLowerCase();

  const isHarmonic = ['trine', 'sextile', 'conjunction'].includes(aspectType);
  const aspectLabel =
    aspectType === 'conjunction'
      ? 'conjunct'
      : aspectType === 'opposition'
        ? 'opposing'
        : aspectType === 'trine'
          ? 'trine'
          : aspectType === 'square'
            ? 'square'
            : 'sextile';

  // Richer headline when we have the sign + house context.
  const transitLocator = transitSign
    ? ` in ${transitSign}${transitHouse ? ` (your ${ordinal(transitHouse)})` : ''}`
    : '';
  const natalLocator =
    natalSign || natalHouse
      ? ` (${[natalSign, natalHouse ? `${ordinal(natalHouse)} house` : null]
          .filter(Boolean)
          .join(', ')})`
      : '';
  const headline = `${transitPlanet}${transitLocator} ${aspectLabel} your natal ${natalPlanet}${natalLocator}`;

  // Meaning: planet-in-sign framing + aspect-to-natal area + house crossover.
  const transitSigned = transitSign
    ? `Transiting ${transitPlanet} in ${transitSign} (${getSignFlavour(transitSign)})`
    : `Transiting ${transitPlanet}`;

  const natalAnchor = natalHouse
    ? `${natalTheme} — your ${ordinal(natalHouse)} house of ${getHouseMeaning(natalHouse)}`
    : natalTheme;

  let meaning: string;
  if (aspectType === 'opposition') {
    meaning = `${transitSigned} is illuminating ${natalAnchor} from across your chart. ${aspectCtx.flavour}`;
  } else {
    meaning = `${transitSigned} is ${energy} ${natalAnchor}. ${aspectCtx.flavour}`;
  }

  // Dignity note: only surface when the transiting planet is notably strong or
  // strained in its current sign — it materially changes how the aspect lands.
  const dignityNote = getDignityNote(transitDignity);
  if (dignityNote) {
    meaning += ` ${transitPlanet} is ${dignityNote}.`;
  }

  // Slow planets get a keyword beat so the tone matches the transit's weight.
  const isSlowPlanet = [
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
    'Pluto',
  ].includes(transitPlanet);
  if (isSlowPlanet && kw1) {
    meaning += ` ${transitPlanet} brings ${kw1} energy to whatever it touches.`;
  }

  const action = `${aspectCtx.direction} ${timing === 'building' ? `This aspect is still building and active ${window}.` : `It is ${window} before this passes.`}`;

  return { headline, meaning, action, window };
}

// ─── House placement copy (for free tease) ──────────────────────────────────

export interface HousePlacementCopyInput {
  transitPlanet: string;
  house: number;
  transitSign: string;
  retrograde?: boolean;
  userId?: string;
}

const FREE_TEASE_TEMPLATES = [
  ({
    planet,
    house,
    meaning,
  }: {
    planet: string;
    house: number;
    meaning: string;
  }) =>
    `${planet} is moving through your ${ordinal(house)} house right now — the area of ${meaning}.`,
  ({
    planet,
    house,
    meaning,
  }: {
    planet: string;
    house: number;
    meaning: string;
  }) =>
    `${planet} is active in your ${ordinal(house)} house (${meaning}) at the moment.`,
  ({
    planet,
    house,
    meaning,
  }: {
    planet: string;
    house: number;
    meaning: string;
  }) =>
    `Your ${ordinal(house)} house is lit up by ${planet} right now — that is the zone of ${meaning}.`,
];

/**
 * Returns a specific, chart-personalised tease line for free users.
 * Shows real data (which house, which planet) but locks the interpretation.
 */
export function getHousePlacementTease({
  transitPlanet,
  house,
  transitSign,
  retrograde = false,
  userId,
}: HousePlacementCopyInput): string {
  const seed = getTransitSeed(userId, 7);
  const meaning = getHouseMeaning(house);
  const template = seededPick(FREE_TEASE_TEMPLATES, seed);
  const retro = retrograde ? ` (retrograde in ${transitSign})` : '';
  return template({ planet: transitPlanet, house, meaning }) + retro;
}

// ─── Pro digest intro line ────────────────────────────────────────────────────

const DIGEST_INTROS = [
  'Here is what is active in your chart right now.',
  'Your chart has some clear energy moving through it today.',
  'A few things are live in your chart at the moment.',
  'This is what the sky is doing to your specific placements right now.',
];

export function getDigestIntro(userId?: string): string {
  const seed = getTransitSeed(userId, 13);
  return seededPick(DIGEST_INTROS, seed);
}
