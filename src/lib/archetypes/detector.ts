import { LUNARY_ARCHETYPES, LunaryArchetype } from './definitions';

export interface ArchetypeResult {
  id: string;
  name: string;
  freeSummary: string;
  premiumNarrative: string;
  lightTraits: string[];
  shadowTraits: string[];
  suggestedWork: string[];
  score: number;
}

export interface ArchetypeDetectorInput {
  journalEntries: Array<{
    content: string;
    moodTags: string[];
  }>;
  dreamTags: string[];
  tarotMajors: string[];
  tarotSuits: Array<{ suit: string; count: number }>;
  recentTransits?: string[];
}

const MIN_DATA_POINTS = 3;

function countKeywordMatches(texts: string[], keywords: string[]): number {
  const lowerKeywords = keywords.map((k) => k.toLowerCase());
  let count = 0;

  for (const text of texts) {
    const lower = text.toLowerCase();
    for (const keyword of lowerKeywords) {
      if (lower.includes(keyword)) {
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

function scoreArchetype(
  archetype: LunaryArchetype,
  input: ArchetypeDetectorInput,
): number {
  let score = 0;

  const journalTexts = input.journalEntries.map((e) => e.content);
  const moodTags = input.journalEntries.flatMap((e) => e.moodTags);

  score +=
    countKeywordMatches(journalTexts, archetype.triggers.journalKeywords) * 2;
  score += countArrayOverlap(moodTags, archetype.triggers.moodTags) * 3;
  score +=
    countArrayOverlap(input.dreamTags, archetype.triggers.dreamMotifs) * 4;
  score +=
    countArrayOverlap(input.tarotMajors, archetype.triggers.tarotMajors) * 3;

  if (input.tarotSuits.length > 0) {
    const topSuits = input.tarotSuits.slice(0, 2).map((s) => s.suit);
    score += countArrayOverlap(topSuits, archetype.triggers.tarotSuits) * 2;
  }

  if (input.recentTransits) {
    score +=
      countArrayOverlap(input.recentTransits, archetype.triggers.transits) * 2;
  }

  return score;
}

export function hasEnoughDataForArchetypes(
  input: ArchetypeDetectorInput,
): boolean {
  let dataPoints = 0;

  if (input.journalEntries.length > 0) dataPoints++;
  if (input.dreamTags.length > 0) dataPoints++;
  if (input.tarotMajors.length > 0) dataPoints++;
  if (input.tarotSuits.length > 0) dataPoints++;

  return dataPoints >= MIN_DATA_POINTS;
}

export function detectArchetypes(
  input: ArchetypeDetectorInput,
  maxArchetypes: number = 1,
): ArchetypeResult[] {
  if (!hasEnoughDataForArchetypes(input)) {
    return [];
  }

  const scoredArchetypes = LUNARY_ARCHETYPES.map((archetype) => ({
    id: archetype.id,
    name: archetype.name,
    freeSummary: archetype.freeSummary,
    premiumNarrative: archetype.premiumNarrative,
    lightTraits: archetype.lightTraits,
    shadowTraits: archetype.shadowTraits,
    suggestedWork: archetype.suggestedWork,
    score: scoreArchetype(archetype, input),
  }));

  scoredArchetypes.sort((a, b) => b.score - a.score);

  const minScoreThreshold = 3;
  const qualifyingArchetypes = scoredArchetypes.filter(
    (a) => a.score >= minScoreThreshold,
  );

  return qualifyingArchetypes.slice(0, maxArchetypes);
}

export function detectPrimaryArchetype(
  input: ArchetypeDetectorInput,
): ArchetypeResult | null {
  const archetypes = detectArchetypes(input, 1);
  return archetypes[0] || null;
}
