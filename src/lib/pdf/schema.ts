/**
 * Lunary PDF Pack Schema
 *
 * TypeScript types for pack content - the single source of truth
 * for all downloadable PDF packs.
 */

// ============================================
// PACK TYPES
// ============================================

export type PackType =
  | 'spell'
  | 'crystal'
  | 'tarot'
  | 'seasonal'
  | 'astrology'
  | 'birthchart'
  | 'retrograde';

export type SpellLevel = 'beginner' | 'intermediate' | 'advanced';

// ============================================
// SPELL PACK TYPES
// ============================================

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

export interface PdfSpellPack {
  type: 'spell';
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

// ============================================
// CRYSTAL PACK TYPES
// ============================================

export interface PdfCrystal {
  id: string;
  name: string;
  chakras: string[];
  element: string;
  zodiacSigns?: string[];
  properties: string[];
  howToUse: string[];
  affirmation?: string;
  cleansing?: string;
}

export interface PdfCrystalPack {
  type: 'crystal';
  slug: string;
  title: string;
  subtitle?: string;
  moodText?: string;
  perfectFor?: string[];
  introText?: string;
  crystals: PdfCrystal[];
  closingText?: string;
  optionalAffirmation?: string;
}

// ============================================
// TAROT PACK TYPES
// ============================================

export interface PdfTarotSpread {
  name: string;
  description: string;
  cardCount: number;
  positions: { position: number; name: string; meaning: string }[];
  bestFor: string[];
  journalPrompts?: string[];
}

export interface PdfTarotCard {
  name: string;
  arcana: 'major' | 'minor';
  suit?: string;
  keywords: string[];
  uprightMeaning: string;
  reversedMeaning?: string;
  shadowAspect?: string;
}

export interface PdfTarotPack {
  type: 'tarot';
  slug: string;
  title: string;
  subtitle?: string;
  moodText?: string;
  perfectFor?: string[];
  introText?: string;
  spreads: PdfTarotSpread[];
  cards?: PdfTarotCard[];
  journalPrompts?: string[];
  closingText?: string;
  optionalAffirmation?: string;
}

// ============================================
// SEASONAL PACK TYPES
// ============================================

export interface PdfCorrespondence {
  type: string;
  items: string[];
}

export interface PdfSeasonalRitual {
  title: string;
  timing?: string;
  description: string;
  activities: string[];
  correspondences?: PdfCorrespondence[];
}

export interface PdfSeasonalPack {
  type: 'seasonal';
  slug: string;
  title: string;
  subtitle?: string;
  moodText?: string;
  perfectFor?: string[];
  introText?: string;
  sabbatDate?: string;
  theme?: string;
  rituals: PdfSeasonalRitual[];
  correspondences?: PdfCorrespondence[];
  closingText?: string;
  optionalAffirmation?: string;
}

// ============================================
// ASTROLOGY PACK TYPES
// ============================================

export interface PdfAstrologySection {
  title: string;
  description: string;
  keyDates?: string[];
  practicalTips: string[];
  journalPrompts?: string[];
}

export interface PdfAstrologyPack {
  type: 'astrology';
  slug: string;
  title: string;
  subtitle?: string;
  moodText?: string;
  perfectFor?: string[];
  introText?: string;
  sections: PdfAstrologySection[];
  practicalTips?: string[];
  journalPrompts?: string[];
  closingText?: string;
  optionalAffirmation?: string;
}

// ============================================
// BIRTH CHART PACK TYPES
// ============================================

export interface PdfBirthChartSection {
  placement: string;
  sign?: string;
  meaning: string;
  traits: string[];
  guidance: string;
  integration?: string;
}

export interface PdfBirthChartPack {
  type: 'birthchart';
  slug: string;
  title: string;
  subtitle?: string;
  moodText?: string;
  perfectFor?: string[];
  introText?: string;
  sections: PdfBirthChartSection[];
  journalPrompts?: string[];
  closingText?: string;
  optionalAffirmation?: string;
}

// ============================================
// RETROGRADE PACK TYPES
// ============================================

export interface PdfRetrogradeSurvival {
  planet: string;
  phase: string;
  description: string;
  doList: string[];
  dontList: string[];
  affirmation?: string;
}

export interface PdfRetrogradePack {
  type: 'retrograde';
  slug: string;
  title: string;
  subtitle?: string;
  moodText?: string;
  perfectFor?: string[];
  introText?: string;
  planet: string;
  survivalGuide: PdfRetrogradeSurvival[];
  practicalTips?: string[];
  journalPrompts?: string[];
  closingText?: string;
  optionalAffirmation?: string;
}

// ============================================
// UNIFIED PACK TYPE
// ============================================

export type PdfPackUnion =
  | PdfSpellPack
  | PdfCrystalPack
  | PdfTarotPack
  | PdfSeasonalPack
  | PdfAstrologyPack
  | PdfBirthChartPack
  | PdfRetrogradePack;

// Legacy type for backward compatibility
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
