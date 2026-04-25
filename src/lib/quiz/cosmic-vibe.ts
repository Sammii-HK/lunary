/**
 * Cosmic Profile Quiz — pure utility.
 *
 * Maps a 5-question, mood-based quiz onto one of 12 archetypes (e.g.
 * "Saturn Witch", "Venus Dreamer", "Mars Architect"). Designed as a
 * Co-Star-style viral on-ramp BEFORE a user has filled in their birth
 * data, so the result is shareable identity, not literal astrology.
 *
 * Determinism: same `answers` always produce the same `CosmicVibe`.
 * The mapping is a weighted score across (planet, element) channels;
 * a stable hash of the answers is used as a tie-breaker so repeats
 * give the same result.
 */

export const COSMIC_VIBE_QUESTION_IDS = [
  'crisis', // When everything's falling apart, you…
  'saturday', // Your dream Saturday is…
  'energy', // Your energy reads most like…
  'comfort', // What soothes you when you're spiralling…
  'craving', // Right now you're secretly craving…
] as const;

export type CosmicVibeQuestionId = (typeof COSMIC_VIBE_QUESTION_IDS)[number];

export type CosmicVibeAnswers = Partial<Record<CosmicVibeQuestionId, string>>;

export type CosmicElement = 'Fire' | 'Earth' | 'Air' | 'Water';

export type CosmicArchetypeId =
  | 'saturn-witch'
  | 'venus-dreamer'
  | 'mars-architect'
  | 'mercury-trickster'
  | 'moon-oracle'
  | 'sun-flame'
  | 'jupiter-wanderer'
  | 'pluto-alchemist'
  | 'neptune-mystic'
  | 'uranus-rebel'
  | 'chiron-healer'
  | 'lilith-priestess';

export interface CosmicArchetype {
  id: CosmicArchetypeId;
  vibeName: string; // poetic identity card title
  archetype: string; // short label, e.g. "Saturn Witch"
  element: CosmicElement;
  ruler: string; // chart-ruler-flavoured planet name
  oneLiner: string; // poetic one-liner for the card / narration
  gradient: {
    from: string;
    via: string;
    to: string;
  };
}

export interface CosmicVibe {
  vibeName: string;
  element: CosmicElement;
  archetype: string;
  oneLiner: string;
  gradient: {
    from: string;
    via: string;
    to: string;
  };
  /** Stable identifier of the archetype, useful for analytics + OG params. */
  archetypeId: CosmicArchetypeId;
  /** Stable hash of the answers — used to seed share-image starfields, etc. */
  seed: string;
}

interface AnswerOption {
  id: string;
  label: string;
  /** Weighted score per archetype. Missing entries default to 0. */
  weights: Partial<Record<CosmicArchetypeId, number>>;
  /** Element vote — used to compute the final element on the card. */
  element: CosmicElement;
}

export interface CosmicVibeQuestion {
  id: CosmicVibeQuestionId;
  prompt: string;
  options: AnswerOption[];
}

/**
 * 12 archetype definitions. Gradients reference Tailwind/lunary brand
 * tokens via raw CSS hex so the same record can drive both the
 * Tailwind UI card and the edge-runtime OG renderer (which can't
 * resolve Tailwind classes).
 */
export const COSMIC_ARCHETYPES: Record<CosmicArchetypeId, CosmicArchetype> = {
  'saturn-witch': {
    id: 'saturn-witch',
    vibeName: 'The Saturn Witch',
    archetype: 'Saturn Witch',
    element: 'Earth',
    ruler: 'Saturn',
    oneLiner: 'You build cathedrals out of discipline and call it devotion.',
    gradient: { from: '#1F1B2E', via: '#3B2F4F', to: '#6B5B95' },
  },
  'venus-dreamer': {
    id: 'venus-dreamer',
    vibeName: 'The Venus Dreamer',
    archetype: 'Venus Dreamer',
    element: 'Water',
    ruler: 'Venus',
    oneLiner: 'Beauty finds you first; you mistake it for a calling.',
    gradient: { from: '#3B1B36', via: '#7A2A6B', to: '#EE789E' },
  },
  'mars-architect': {
    id: 'mars-architect',
    vibeName: 'The Mars Architect',
    archetype: 'Mars Architect',
    element: 'Fire',
    ruler: 'Mars',
    oneLiner: 'You don’t wait for permission — you draft the blueprint.',
    gradient: { from: '#2A0A0A', via: '#7A1F1F', to: '#EAB308' },
  },
  'mercury-trickster': {
    id: 'mercury-trickster',
    vibeName: 'The Mercury Trickster',
    archetype: 'Mercury Trickster',
    element: 'Air',
    ruler: 'Mercury',
    oneLiner: 'You arrive mid-sentence and leave with all the punchlines.',
    gradient: { from: '#0F1E36', via: '#2B5083', to: '#7DD3FC' },
  },
  'moon-oracle': {
    id: 'moon-oracle',
    vibeName: 'The Moon Oracle',
    archetype: 'Moon Oracle',
    element: 'Water',
    ruler: 'Moon',
    oneLiner: 'You feel the weather changing three days before anyone else.',
    gradient: { from: '#0A0E2A', via: '#1E2A66', to: '#A5B4FC' },
  },
  'sun-flame': {
    id: 'sun-flame',
    vibeName: 'The Sun Flame',
    archetype: 'Sun Flame',
    element: 'Fire',
    ruler: 'Sun',
    oneLiner: 'You walk into rooms; rooms light up because of it.',
    gradient: { from: '#3B1606', via: '#B45309', to: '#FBBF24' },
  },
  'jupiter-wanderer': {
    id: 'jupiter-wanderer',
    vibeName: 'The Jupiter Wanderer',
    archetype: 'Jupiter Wanderer',
    element: 'Fire',
    ruler: 'Jupiter',
    oneLiner: 'Every detour you took was the actual map.',
    gradient: { from: '#1B0F2A', via: '#5B2A86', to: '#C77DFF' },
  },
  'pluto-alchemist': {
    id: 'pluto-alchemist',
    vibeName: 'The Pluto Alchemist',
    archetype: 'Pluto Alchemist',
    element: 'Water',
    ruler: 'Pluto',
    oneLiner: 'You burn it down on purpose, then plant something rarer.',
    gradient: { from: '#08070D', via: '#3D1248', to: '#8458D8' },
  },
  'neptune-mystic': {
    id: 'neptune-mystic',
    vibeName: 'The Neptune Mystic',
    archetype: 'Neptune Mystic',
    element: 'Water',
    ruler: 'Neptune',
    oneLiner: 'Reality is one of the languages you speak — not the favourite.',
    gradient: { from: '#0B1A2C', via: '#1F4068', to: '#7B7BE8' },
  },
  'uranus-rebel': {
    id: 'uranus-rebel',
    vibeName: 'The Uranus Rebel',
    archetype: 'Uranus Rebel',
    element: 'Air',
    ruler: 'Uranus',
    oneLiner: 'You don’t shock people — they were just standing too still.',
    gradient: { from: '#0E0F1C', via: '#1E3A8A', to: '#22D3EE' },
  },
  'chiron-healer': {
    id: 'chiron-healer',
    vibeName: 'The Chiron Healer',
    archetype: 'Chiron Healer',
    element: 'Earth',
    ruler: 'Chiron',
    oneLiner: 'The wound learned your name and kept teaching it to others.',
    gradient: { from: '#0E1F18', via: '#1F3F2F', to: '#86EFAC' },
  },
  'lilith-priestess': {
    id: 'lilith-priestess',
    vibeName: 'The Lilith Priestess',
    archetype: 'Lilith Priestess',
    element: 'Fire',
    ruler: 'Black Moon Lilith',
    oneLiner: 'You are nobody’s second draft and never were.',
    gradient: { from: '#1A0612', via: '#4B0A2A', to: '#EE789E' },
  },
};

const ARCHETYPE_IDS = Object.keys(COSMIC_ARCHETYPES) as CosmicArchetypeId[];

/**
 * 5 mood/feel-based questions. Each option distributes points across a
 * couple of archetypes and votes for one element.
 */
export const COSMIC_VIBE_QUESTIONS: CosmicVibeQuestion[] = [
  {
    id: 'crisis',
    prompt: 'When everything’s falling apart, you…',
    options: [
      {
        id: 'list',
        label: 'Make a list. Light a candle. Get to work.',
        element: 'Earth',
        weights: { 'saturn-witch': 3, 'mars-architect': 2 },
      },
      {
        id: 'rage',
        label: 'Pick a fight with the universe and win it.',
        element: 'Fire',
        weights: { 'mars-architect': 3, 'lilith-priestess': 2 },
      },
      {
        id: 'feel',
        label: 'Cry in the bath. Tell the moon. Let it pass.',
        element: 'Water',
        weights: { 'moon-oracle': 3, 'neptune-mystic': 2 },
      },
      {
        id: 'reframe',
        label: 'Theorise it into a podcast you’ll never record.',
        element: 'Air',
        weights: { 'mercury-trickster': 3, 'uranus-rebel': 2 },
      },
    ],
  },
  {
    id: 'saturday',
    prompt: 'Your dream Saturday is…',
    options: [
      {
        id: 'cosy',
        label: 'Linen sheets, slow coffee, one perfect playlist.',
        element: 'Water',
        weights: { 'venus-dreamer': 3, 'moon-oracle': 1 },
      },
      {
        id: 'wild',
        label: 'Strangers, sunsets, somewhere you didn’t plan.',
        element: 'Fire',
        weights: { 'jupiter-wanderer': 3, 'sun-flame': 2 },
      },
      {
        id: 'craft',
        label: 'Hands in dirt, hands in dough, hands in dust.',
        element: 'Earth',
        weights: { 'chiron-healer': 3, 'saturn-witch': 1 },
      },
      {
        id: 'ideas',
        label: 'Library, café, three open tabs, one new theory.',
        element: 'Air',
        weights: { 'mercury-trickster': 3, 'uranus-rebel': 1 },
      },
    ],
  },
  {
    id: 'energy',
    prompt: 'Your energy reads most like…',
    options: [
      {
        id: 'beam',
        label: 'A spotlight nobody asked for but everyone needed.',
        element: 'Fire',
        weights: { 'sun-flame': 3, 'lilith-priestess': 1 },
      },
      {
        id: 'fog',
        label: 'A fog rolling in. Beautiful. Slightly disorienting.',
        element: 'Water',
        weights: { 'neptune-mystic': 3, 'pluto-alchemist': 1 },
      },
      {
        id: 'spark',
        label: 'A wire that hums when you walk past it.',
        element: 'Air',
        weights: { 'uranus-rebel': 3, 'mercury-trickster': 1 },
      },
      {
        id: 'root',
        label: 'A tree that’s seen worse and stayed anyway.',
        element: 'Earth',
        weights: { 'saturn-witch': 2, 'chiron-healer': 3 },
      },
    ],
  },
  {
    id: 'comfort',
    prompt: 'What soothes you when you’re spiralling…',
    options: [
      {
        id: 'beauty',
        label: 'Something heartbreakingly pretty. A song. A face.',
        element: 'Water',
        weights: { 'venus-dreamer': 3, 'neptune-mystic': 1 },
      },
      {
        id: 'shadow',
        label: 'Going somewhere darker than the spiral. On purpose.',
        element: 'Water',
        weights: { 'pluto-alchemist': 3, 'lilith-priestess': 2 },
      },
      {
        id: 'plan',
        label: 'A list, a colour-coded plan, a promise to yourself.',
        element: 'Earth',
        weights: { 'saturn-witch': 3, 'mars-architect': 1 },
      },
      {
        id: 'people',
        label: 'A long voice note. A friend who gets it instantly.',
        element: 'Air',
        weights: { 'chiron-healer': 2, 'mercury-trickster': 2 },
      },
    ],
  },
  {
    id: 'craving',
    prompt: 'Right now, you’re secretly craving…',
    options: [
      {
        id: 'recognition',
        label: 'To be seen — fully, without explaining yourself.',
        element: 'Fire',
        weights: { 'sun-flame': 3, 'venus-dreamer': 1 },
      },
      {
        id: 'meaning',
        label: 'A bigger story. A reason all of this is happening.',
        element: 'Fire',
        weights: { 'jupiter-wanderer': 3, 'neptune-mystic': 1 },
      },
      {
        id: 'reinvention',
        label: 'A clean slate. A new name. Different hair, maybe.',
        element: 'Air',
        weights: { 'uranus-rebel': 3, 'pluto-alchemist': 2 },
      },
      {
        id: 'softness',
        label: 'To rest. To be held. To stop performing.',
        element: 'Water',
        weights: { 'moon-oracle': 3, 'chiron-healer': 1 },
      },
    ],
  },
];

const ELEMENT_FALLBACK: CosmicElement = 'Water';

function stableHash(input: string): number {
  // djb2 — tiny, deterministic, no deps.
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function findOption(
  question: CosmicVibeQuestion,
  optionId: string | undefined,
): AnswerOption | undefined {
  if (!optionId) return undefined;
  return question.options.find((opt) => opt.id === optionId);
}

function pickDominantElement(
  votes: Record<CosmicElement, number>,
): CosmicElement {
  const entries = (Object.entries(votes) as [CosmicElement, number][]).sort(
    (a, b) => b[1] - a[1],
  );
  return entries[0]?.[0] ?? ELEMENT_FALLBACK;
}

/**
 * Compute a `CosmicVibe` from quiz answers.
 *
 * Deterministic: same answers → same archetype, oneLiner, gradient.
 * Tie-breaks use a stable djb2 hash of the answer signature so two
 * users with the exact same answers still always share a vibe.
 */
export function computeCosmicVibe(answers: CosmicVibeAnswers): CosmicVibe {
  const scores: Record<CosmicArchetypeId, number> = ARCHETYPE_IDS.reduce(
    (acc, id) => {
      acc[id] = 0;
      return acc;
    },
    {} as Record<CosmicArchetypeId, number>,
  );

  const elementVotes: Record<CosmicElement, number> = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0,
  };

  const signatureParts: string[] = [];

  for (const question of COSMIC_VIBE_QUESTIONS) {
    const chosen = findOption(question, answers[question.id]);
    if (!chosen) continue;
    signatureParts.push(`${question.id}:${chosen.id}`);
    elementVotes[chosen.element] += 1;
    for (const [archetypeId, weight] of Object.entries(chosen.weights) as [
      CosmicArchetypeId,
      number,
    ][]) {
      scores[archetypeId] += weight;
    }
  }

  const signature = signatureParts.sort().join('|') || 'empty';
  const seed = stableHash(signature).toString(36);

  // Pick the highest-scoring archetype; ties broken by the stable seed
  // so the same answers always yield the same archetype.
  let topId: CosmicArchetypeId = ARCHETYPE_IDS[0];
  let topScore = -Infinity;
  ARCHETYPE_IDS.forEach((id, index) => {
    const score = scores[id];
    if (score > topScore) {
      topScore = score;
      topId = id;
      return;
    }
    if (score === topScore) {
      // Deterministic tie-break: use seed-mod to pick between equal scorers
      const seedNum = stableHash(`${signature}:${id}:${index}`);
      const currentSeed = stableHash(`${signature}:${topId}:${index}`);
      if (seedNum > currentSeed) {
        topId = id;
      }
    }
  });

  const archetype = COSMIC_ARCHETYPES[topId];
  const dominantElement =
    topScore > 0 ? archetype.element : pickDominantElement(elementVotes);

  return {
    vibeName: archetype.vibeName,
    element: dominantElement,
    archetype: archetype.archetype,
    oneLiner: archetype.oneLiner,
    gradient: archetype.gradient,
    archetypeId: archetype.id,
    seed,
  };
}

/** Lookup helper — used by API route + OG renderer to recompute deterministically. */
export function getArchetype(id: CosmicArchetypeId): CosmicArchetype {
  return COSMIC_ARCHETYPES[id];
}

export const COSMIC_ARCHETYPE_IDS = ARCHETYPE_IDS;
