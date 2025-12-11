import { LIFE_THEMES, LifeTheme } from './themes';

export interface LifeThemeResult {
  id: string;
  name: string;
  shortSummary: string;
  longSummary: string;
  guidanceBullets: string[];
  relatedTags: string[];
  score: number;
}

export interface LifeThemeInput {
  journalEntries: Array<{
    content: string;
    moodTags: string[];
    createdAt: string;
  }>;
  tarotPatterns: {
    dominantThemes: string[];
    frequentCards: Array<{ name: string; count: number }>;
    suitDistribution?: Array<{ suit: string; count: number }>;
  } | null;
  birthChartElements?: {
    dominantElement?: string;
    sunSign?: string;
    moonSign?: string;
  };
  activeTransits?: string[];
}

const MIN_JOURNAL_ENTRIES = 5;
const MIN_TAROT_READINGS = 7;

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 3);
}

function countKeywordMatches(content: string[], triggers: string[]): number {
  const lowerTriggers = triggers.map((t) => t.toLowerCase());
  let count = 0;

  for (const text of content) {
    const lower = text.toLowerCase();
    for (const trigger of lowerTriggers) {
      if (lower.includes(trigger)) {
        count++;
      }
    }
  }

  return count;
}

function countArrayOverlap(arr1: string[], arr2: string[]): number {
  const set1 = new Set(arr1.map((s) => s.toLowerCase()));
  return arr2.filter((item) => set1.has(item.toLowerCase())).length;
}

function scoreTheme(theme: LifeTheme, input: LifeThemeInput): number {
  let score = 0;

  const journalTexts = input.journalEntries.map((e) => e.content);
  const moodTags = input.journalEntries.flatMap((e) => e.moodTags);

  score +=
    countKeywordMatches(journalTexts, theme.triggers.journalKeywords) * 2;
  score += countArrayOverlap(moodTags, theme.triggers.moodTags) * 3;

  if (input.tarotPatterns) {
    const cardNames = input.tarotPatterns.frequentCards.map((c) => c.name);
    score += countArrayOverlap(cardNames, theme.triggers.tarotMajors) * 4;

    const themes = input.tarotPatterns.dominantThemes;
    score += countArrayOverlap(themes, theme.triggers.journalKeywords) * 2;

    if (input.tarotPatterns.suitDistribution) {
      const suits = input.tarotPatterns.suitDistribution.map((s) => s.suit);
      score +=
        countArrayOverlap(suits.slice(0, 2), theme.triggers.tarotSuits) * 3;
    }
  }

  if (input.activeTransits) {
    score +=
      countArrayOverlap(input.activeTransits, theme.triggers.transits) * 2;
  }

  return score;
}

export function hasEnoughDataForThemes(input: LifeThemeInput): boolean {
  const hasJournalData = input.journalEntries.length >= MIN_JOURNAL_ENTRIES;
  const hasTarotData = Boolean(
    input.tarotPatterns &&
    input.tarotPatterns.frequentCards.length >= MIN_TAROT_READINGS,
  );

  return hasJournalData || hasTarotData;
}

export function analyzeLifeThemes(
  input: LifeThemeInput,
  maxThemes: number = 3,
): LifeThemeResult[] {
  if (!hasEnoughDataForThemes(input)) {
    return [];
  }

  const scoredThemes = LIFE_THEMES.map((theme) => ({
    ...theme,
    score: scoreTheme(theme, input),
  }));

  scoredThemes.sort((a, b) => b.score - a.score);

  const minScoreThreshold = 3;
  const qualifyingThemes = scoredThemes.filter(
    (t) => t.score >= minScoreThreshold,
  );

  return qualifyingThemes.slice(0, maxThemes).map((theme) => ({
    id: theme.id,
    name: theme.name,
    shortSummary: theme.shortSummary,
    longSummary: theme.longSummary,
    guidanceBullets: theme.guidanceBullets,
    relatedTags: theme.relatedTags,
    score: theme.score,
  }));
}

export function getPrimaryLifeTheme(
  input: LifeThemeInput,
): LifeThemeResult | null {
  const themes = analyzeLifeThemes(input, 1);
  return themes[0] || null;
}
