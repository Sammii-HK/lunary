/**
 * Helper for accessing curated angel number data
 */

import angelNumbersData from '@/data/angel-numbers.json';

export interface AngelNumberLove {
  single: string;
  relationship: string;
  thinkingOfSomeone: string;
}

export interface AngelNumberNumerology {
  rootNumber: number;
  calculation: string;
  rootMeaning: string;
  amplification: string;
}

export interface AngelNumberCorrespondences {
  planet: string;
  element: string;
  chakra: string;
  crystal: string;
  tarotCard: string;
}

export interface AngelNumberFAQ {
  question: string;
  answer: string;
}

export interface CuratedAngelNumber {
  number: string;
  name: string;
  coreMeaning: string;
  keywords: string[];
  quickMeaning: string;
  description: string;
  message: string;
  meaning: string;
  whyYouKeepSeeing: string;
  whenItAppears: string[];
  yesOrNo: string;
  love: AngelNumberLove;
  loveMeaning: string;
  career: string;
  careerMeaning: string;
  spiritualMeaning: string;
  numerologyBreakdown: AngelNumberNumerology;
  whatToDo: string[];
  correspondences: AngelNumberCorrespondences;
  journalPrompts: string[];
  faq: AngelNumberFAQ[];
}

const angelNumbers = angelNumbersData.numbers as Record<
  string,
  CuratedAngelNumber
>;

/**
 * Get all angel number slugs (keys)
 */
export function getAllAngelNumberSlugs(): string[] {
  return Object.keys(angelNumbers);
}

/**
 * Get a specific angel number by slug
 */
export function getAngelNumber(slug: string): CuratedAngelNumber | null {
  return angelNumbers[slug] || null;
}

/**
 * Get all angel numbers data
 */
export function getAllAngelNumbers(): Array<
  CuratedAngelNumber & { slug: string }
> {
  return Object.entries(angelNumbers).map(([slug, data]) => ({
    slug,
    ...data,
  }));
}

/**
 * Check if we have curated data for a number
 */
export function hasCuratedAngelNumber(slug: string): boolean {
  return slug in angelNumbers;
}
