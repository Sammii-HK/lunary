'use client';

import numerology from '@/data/numerology.json';
import numerologyExtended from '@/data/numerology-extended.json';

type LifePathEntry = {
  number: number;
  description?: string;
  meaning?: string;
  keywords?: string[];
  traits?: string[];
  strengths?: string[];
  challenges?: string[];
  career?: string[];
  love?: string[];
};

type ExpressionEntry = {
  number: number;
  description?: string;
  meaning?: string;
  keywords?: string[];
  talents?: string[];
  challenges?: string[];
  careers?: string[];
};

type SoulUrgeEntry = {
  number: number;
  description?: string;
  meaning?: string;
  keywords?: string[];
  desires?: string[];
  motivations?: string[];
  inRelationships?: string;
};

type KarmicDebtEntry = {
  number: number;
  description?: string;
  meaning?: string;
  keywords?: string[];
  lesson?: string;
  challenges?: string[];
  howToHeal?: string[];
};

type AngelEntry = {
  number: string;
  description?: string;
  meaning?: string;
  keywords?: string[];
  message?: string;
  spiritualMeaning?: string;
};

const lifePathNumbers = (numerology as any).lifePathNumbers as Record<
  string,
  LifePathEntry
>;
const expressionNumbers = (numerologyExtended as any)
  .expressionNumbers as Record<string, ExpressionEntry>;
const soulUrgeNumbers = (numerologyExtended as any).soulUrgeNumbers as Record<
  string,
  SoulUrgeEntry
>;
const karmicDebtNumbers = (numerologyExtended as any)
  .karmicDebtNumbers as Record<string, KarmicDebtEntry>;
const angelNumbers = (numerology as any).angelNumbers as Record<
  string,
  AngelEntry
>;

export type NumerologyDetailContext =
  | 'lifePath'
  | 'expression'
  | 'soulUrge'
  | 'karmicDebt'
  | 'angel';

export interface NumerologyDetailSection {
  label: string;
  items: string[];
}

export interface NumerologyDetail {
  description?: string;
  energy?: string;
  keywords?: string[];
  sections?: NumerologyDetailSection[];
  extraNote?: string;
}

const sectionTemplates: Record<
  NumerologyDetailContext,
  Array<{ key: string; label: string; single?: boolean }>
> = {
  lifePath: [
    { key: 'traits', label: 'Traits' },
    { key: 'strengths', label: 'Strengths' },
    { key: 'challenges', label: 'Challenges' },
    { key: 'career', label: 'Careers' },
    { key: 'love', label: 'Love' },
  ],
  expression: [
    { key: 'talents', label: 'Talents' },
    { key: 'challenges', label: 'Challenges' },
    { key: 'careers', label: 'Career paths' },
  ],
  soulUrge: [
    { key: 'desires', label: 'Desires' },
    { key: 'motivations', label: 'Motivations' },
    { key: 'inRelationships', label: 'Relationships', single: true },
  ],
  karmicDebt: [
    { key: 'lesson', label: 'Karmic lesson', single: true },
    { key: 'challenges', label: 'Challenges' },
    { key: 'howToHeal', label: 'Healing focus' },
  ],
  angel: [
    { key: 'message', label: 'Message', single: true },
    { key: 'spiritualMeaning', label: 'Spiritual meaning', single: true },
  ],
};

const getSections = (
  context: NumerologyDetailContext,
  entry: Record<string, any>,
): NumerologyDetailSection[] => {
  const template = sectionTemplates[context];
  if (!template) return [];
  return template
    .map(({ key, label, single }) => {
      const value = entry?.[key];
      if (!value || (Array.isArray(value) && value.length === 0)) return null;
      const items = Array.isArray(value) ? value : [value];
      return { label, items };
    })
    .filter(Boolean) as NumerologyDetailSection[];
};

const getEntry = (
  context: NumerologyDetailContext,
  value: number | string,
): Record<string, any> | null => {
  const key = String(value);
  switch (context) {
    case 'lifePath':
      return lifePathNumbers[key] ?? null;
    case 'expression':
      return expressionNumbers[key] ?? null;
    case 'soulUrge':
      return soulUrgeNumbers[key] ?? null;
    case 'karmicDebt':
      return karmicDebtNumbers[key] ?? null;
    case 'angel':
      return angelNumbers[key] ?? null;
  }
};

export function getNumerologyDetail(
  context: NumerologyDetailContext,
  value: number | string,
): NumerologyDetail | null {
  const entry = getEntry(context, value);
  if (!entry) return null;

  return {
    description: entry.description,
    energy: entry.meaning || entry.description,
    keywords: entry.keywords,
    sections: getSections(context, entry),
    extraNote:
      entry.lesson ||
      entry.message ||
      entry.spiritualMeaning ||
      entry.inRelationships,
  };
}
