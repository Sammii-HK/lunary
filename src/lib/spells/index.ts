import spellsJson from '@/data/spells.json';
import spellsMeta from '@/data/spell-meta.json';
import { MoonPhaseLabels } from '../../../utils/moon/moonPhases';

/**
 * This is the "raw" JSON shape.
 * Keep it permissive, because the JSON is your truth.
 */
export type SpellJson = {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  type: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master' | string;
  purpose?: string;
  description?: string;
  alternativeNames?: string[];

  timing?: {
    moonPhase?: string[]; // you renamed to singular, keep it
    moonPhases?: string[]; // legacy
    timeOfDay?: string | string[];
    season?: string | string[];
    planetaryDay?: string | string[]; // json sometimes
    sabbat?: string | string[];
    planetaryHours?: string | string[];
    bestTiming?: string;
  };

  // json uses ingredients
  ingredients?: Array<{
    name: string;
    amount?: string;
    purpose?: string;
    substitutes?: string[];
  }>;

  tools?: string[];
  preparation?: string[];
  steps?: string[];

  correspondences?: {
    elements?: string[];
    colors?: string[];
    crystals?: string[];
    herbs?: string[];
    planets?: string[];
    zodiac?: string[];
    numbers?: number[];
    deities?: string[];
    tarot?: string[];
  };

  safety?: string[];
  variations?: string[]; // json uses strings
  history?: string;

  incantations?: Array<{
    text: string;
    timing?: string;
    repetitions?: number;
  }>;

  // allow any future fields without breaking
  [key: string]: any;
};

/**
 * This is the "normalised" runtime spell shape used by the app.
 * It matches what your spell/[id] page expects today.
 */
export type Spell = {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  type: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master' | string;

  purpose: string;
  description: string;
  duration: string;
  alternativeNames?: string[];

  timing: {
    moonPhase?: string[]; // current
    moonPhases?: string[]; // legacy
    timeOfDay?: string; // the UI renders a string
    season?: string; // the UI renders a string
    planetaryDay?: string[]; // UI uses join
    sabbat?: string[]; // optional
  };

  ingredients: Array<{
    name: string;
    amount?: string;
    purpose?: string;
    substitutes?: string[];
  }>;

  tools: string[];
  preparation: string[];
  steps: string[];

  correspondences: NonNullable<SpellJson['correspondences']>;
  safety: string[];

  variations?: string[];
  history?: string;

  incantations?: Array<{
    text: string;
    timing?: string;
    repetitions?: number;
  }>;
};

/**
 * Helpers
 */
const asStringArray = (v: unknown): string[] | undefined => {
  if (!v) return undefined;
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  return [String(v)].filter(Boolean);
};

const firstString = (v: unknown): string | undefined => {
  if (!v) return undefined;
  if (Array.isArray(v)) return v.length ? String(v[0]) : undefined;
  return String(v);
};

export function normaliseSpell(raw: SpellJson): Spell {
  return {
    id: String(raw.id),
    title: String(raw.title),
    category: String(raw.category),
    subcategory: raw.subcategory ? String(raw.subcategory) : undefined,
    type: String(raw.type),
    difficulty: raw.difficulty ?? 'beginner',

    purpose: raw.purpose ? String(raw.purpose) : 'A spell for your practice.',
    description: raw.description
      ? String(raw.description)
      : 'A guided working from the Lunary grimoire.',

    duration: raw.duration || '15 minutes',

    timing: {
      moonPhase: asStringArray(raw.timing?.moonPhase ?? raw.timing?.moonPhases),
      timeOfDay: firstString(raw.timing?.timeOfDay),
      season: firstString(raw.timing?.season),
      planetaryDay: asStringArray(raw.timing?.planetaryDay),
      sabbat: asStringArray(raw.timing?.sabbat),
    },

    ingredients: (raw.ingredients ?? []).map((i: any) => ({
      name: String(i.name),
      amount: i.amount ? String(i.amount) : undefined,
      purpose: i.purpose ? String(i.purpose) : undefined,
      substitutes: Array.isArray(i.substitutes)
        ? i.substitutes.map(String).filter(Boolean)
        : undefined,
    })),

    tools: Array.isArray(raw.tools)
      ? raw.tools.map(String).filter(Boolean)
      : [],
    preparation: Array.isArray(raw.preparation)
      ? raw.preparation.map(String).filter(Boolean)
      : [],
    steps: Array.isArray(raw.steps)
      ? raw.steps.map(String).filter(Boolean)
      : [],

    correspondences: raw.correspondences ?? {},
    safety: Array.isArray(raw.safety)
      ? raw.safety.map(String).filter(Boolean)
      : [],

    variations: Array.isArray(raw.variations)
      ? raw.variations.map(String).filter(Boolean)
      : undefined,
    history: raw.history ? String(raw.history) : undefined,

    incantations: Array.isArray(raw.incantations)
      ? raw.incantations.map((inc: any) => ({
          text: String(inc.text),
          timing: inc.timing ? String(inc.timing) : undefined,
          repetitions: inc.repetitions ? Number(inc.repetitions) : undefined,
        }))
      : undefined,
  };
}

/**
 * Single source of truth export
 */
export const spellDatabaseRaw = spellsJson as SpellJson[];
export const spellDatabase: Spell[] = spellDatabaseRaw.map(normaliseSpell);

/**
 * Query functions
 */
export function getSpellById(id: string): Spell | undefined {
  return spellDatabase.find((s) => s.id === id);
}

export function getSpellsByCategory(category: string): Spell[] {
  return spellDatabase.filter((s) => s.category === category);
}

export function getSpellsByMoonPhase(phase: string): Spell[] {
  return spellDatabase.filter(
    (s) =>
      s.timing.moonPhase?.includes(phase) ||
      s.timing.moonPhase?.includes('Any'),
  );
}

export function getSpellsBySabbat(sabbat: string): Spell[] {
  return spellDatabase.filter(
    (s) =>
      s.timing.sabbat?.includes(sabbat) || s.timing.sabbat?.includes('Any'),
  );
}

/**
 * PDF adapter: convert json ingredients into "materials" shape when needed.
 */
export function getMaterialsForPdf(spell: Spell) {
  return {
    essential: spell.ingredients.map((i) => ({
      name: i.name,
      amount: i.amount,
      purpose: i.purpose ?? '',
      substitutes: i.substitutes,
    })),
    optional: [],
  };
}

export const spellCategories = spellsMeta.spellCategories as Record<
  string,
  { name: string; description: string; icon?: string }
>;

export const moonSpells = spellsMeta.moonSpells as Record<string, string[]>;

export function getSpellsForMoonPhase(phase: string): Spell[] {
  const ids = moonSpells[phase] ?? [];
  const byId = new Map(spellDatabase.map((s) => [s.id, s]));

  const curated = ids.map((id) => byId.get(id)).filter(Boolean) as Spell[];

  const computed = spellDatabase.filter((s) =>
    s.timing.moonPhase?.includes(phase),
  );

  const seen = new Set(curated.map((s) => s.id));
  return [...curated, ...computed.filter((s) => !seen.has(s.id))];
}

export const getRecommendedSpells = (
  moonPhase: MoonPhaseLabels,
  currentSabbat?: string,
): Spell[] => {
  const moonRecommended = getSpellsForMoonPhase(moonPhase);
  const sabbatRecommended = currentSabbat
    ? getSpellsBySabbat(currentSabbat)
    : [];

  // Combine and deduplicate
  const combined = [...moonRecommended, ...sabbatRecommended];
  return combined.filter(
    (spell, index, self) => index === self.findIndex((s) => s.id === spell.id),
  );
};

export const searchSpells = (query: string): Spell[] => {
  const searchTerm = query.toLowerCase();
  return spellDatabase.filter(
    (spell) =>
      spell.title.toLowerCase().includes(searchTerm) ||
      spell.alternativeNames?.some((name) =>
        name.toLowerCase().includes(searchTerm),
      ) ||
      spell.purpose.toLowerCase().includes(searchTerm) ||
      spell.description.toLowerCase().includes(searchTerm) ||
      spell.category.toLowerCase().includes(searchTerm),
  );
};
