/**
 * Lunary PDF Pack Schema
 *
 * TypeScript types for pack content - the single source of truth
 * for all downloadable PDF packs.
 */

export type SpellLevel = 'beginner' | 'intermediate' | 'advanced';

export interface PdfSpell {
  id: string;
  title: string;
  level: SpellLevel;
  duration: string;
  moonPhases?: string[];
  description: string;
  materials: string[];
  steps: string[];
  incantation?: string;
}

export interface PdfPack {
  slug: string;
  title: string;
  subtitle?: string;
  moodText?: string;
  perfectFor?: string[];
  introText?: string;
  beforeYouBegin?: string;
  spells: PdfSpell[];
  closingText?: string;
  optionalAffirmation?: string;
}

// Default closing texts (gentle, modern, non-religious)
export const DEFAULT_CLOSING_TEXT =
  'Thank you for practising with Lunary. You can always return to these rituals whenever you need to reconnect with yourself.';

export const DEFAULT_AFFIRMATION =
  'Trust your pace, your timing, and your own inner guidance. You are the magic; the tools are just helpers.';

export const DEFAULT_BEFORE_YOU_BEGIN =
  'Before beginning any ritual, take a moment to centre yourself. Ground your energy, set your intention, and create sacred space. Magic works best when you are fully present.';

// Helper to create a spell from raw data
export function createPdfSpell(
  data: Partial<PdfSpell> & { id: string; title: string },
): PdfSpell {
  return {
    id: data.id,
    title: data.title,
    level: data.level || 'beginner',
    duration: data.duration || '10-15 minutes',
    moonPhases: data.moonPhases,
    description: data.description || '',
    materials: data.materials || [],
    steps: data.steps || [],
    incantation: data.incantation,
  };
}

// Helper to create a pack from raw data
export function createPdfPack(
  data: Partial<PdfPack> & { slug: string; title: string; spells: PdfSpell[] },
): PdfPack {
  return {
    slug: data.slug,
    title: data.title,
    subtitle: data.subtitle,
    moodText: data.moodText,
    perfectFor: data.perfectFor,
    introText: data.introText,
    beforeYouBegin: data.beforeYouBegin || DEFAULT_BEFORE_YOU_BEGIN,
    spells: data.spells,
    closingText: data.closingText || DEFAULT_CLOSING_TEXT,
    optionalAffirmation: data.optionalAffirmation || DEFAULT_AFFIRMATION,
  };
}
