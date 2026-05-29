// Content database for Zodiac Compatibility pages
// 12 × 12 = 144 combinations (78 unique pairs)
// Uses curated content from JSON when available, otherwise generates algorithmically

import { signDescriptions } from './planet-sign-content';
import curatedPairsData from '@/data/zodiac-compatibility-pairs.json';

export interface CompatibilityContent {
  sign1: string;
  sign2: string;
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  overallScore: number; // 1-10
  loveScore: number;
  friendshipScore: number;
  workScore: number;
  strengths: string[];
  challenges: string[];
  advice: string;
  summary?: string; // Only available for curated pairs
  isCurated?: boolean;
}

// Type for curated pair data from JSON
interface CuratedPair {
  sign1: string;
  sign2: string;
  scores: { overall: number; love: number; friendship: number; work: number };
  summary: string;
  strengths: string[];
  challenges: string[];
  advice: string;
}

// Canonicalise two sign keys into the alphabetical "a-and-b" slug. Defined
// up here because the curated map below is keyed on this canonical form.
function canonicalPairSlug(sign1Key: string, sign2Key: string): string {
  return sign1Key <= sign2Key
    ? `${sign1Key}-and-${sign2Key}`
    : `${sign2Key}-and-${sign1Key}`;
}

// Curated pairs, re-keyed to the canonical alphabetical slug. The source JSON
// stores 12 of the 42 pairs under non-alphabetical keys (e.g.
// "taurus-and-cancer"), but every consumer builds slugs alphabetically via
// compatibilitySlug() (e.g. "cancer-and-taurus"). Without this normalisation
// those 12 curated pages fail the curated lookup, get redirected to a slug that
// is never statically generated, and render noindexed. Re-keying once here keeps
// the data and every lookup in the same canonical space. There are no key
// collisions, so no curated pair is lost.
const curatedPairs: Record<string, CuratedPair> = (() => {
  const raw = curatedPairsData.pairs as Record<string, CuratedPair>;
  const normalised: Record<string, CuratedPair> = {};
  for (const [key, value] of Object.entries(raw)) {
    const [a, b] = key.split('-and-');
    const canonical = b ? canonicalPairSlug(a, b) : key;
    normalised[canonical] = value;
  }
  return normalised;
})();

// Get curated pair data if available. The slug is expected to already be the
// canonical alphabetical form (as produced by compatibilitySlug); we also accept
// a raw non-alphabetical slug by re-canonicalising it so lookups never miss.
function getCuratedPair(slug: string): CuratedPair | null {
  if (curatedPairs[slug]) return curatedPairs[slug];
  const [a, b] = slug.split('-and-');
  if (!b) return null;
  return curatedPairs[canonicalPairSlug(a, b)] || null;
}

// Element compatibility matrix
const elementCompatibility: Record<string, Record<string, number>> = {
  Fire: { Fire: 8, Earth: 5, Air: 9, Water: 4 },
  Earth: { Fire: 5, Earth: 8, Air: 4, Water: 9 },
  Air: { Fire: 9, Earth: 4, Air: 8, Water: 5 },
  Water: { Fire: 4, Earth: 9, Air: 5, Water: 8 },
};

// Modality compatibility
const modalityCompatibility: Record<string, Record<string, number>> = {
  Cardinal: { Cardinal: 6, Fixed: 7, Mutable: 8 },
  Fixed: { Cardinal: 7, Fixed: 5, Mutable: 7 },
  Mutable: { Cardinal: 8, Fixed: 7, Mutable: 6 },
};

export function generateCompatibilityContent(
  sign1Key: string,
  sign2Key: string,
): CompatibilityContent {
  const s1 = signDescriptions[sign1Key];
  const s2 = signDescriptions[sign2Key];

  if (!s1 || !s2) {
    throw new Error(`Invalid signs: ${sign1Key}, ${sign2Key}`);
  }

  // Normalise slug to canonical alphabetical order so it matches the curated map.
  const slug = canonicalPairSlug(sign1Key, sign2Key);

  // Check for curated content first
  const curated = getCuratedPair(slug);

  if (curated) {
    return {
      sign1: curated.sign1,
      sign2: curated.sign2,
      slug,
      title: `${curated.sign1} and ${curated.sign2} Compatibility: Love, Friendship & More`,
      description: curated.summary,
      keywords: [
        `${curated.sign1.toLowerCase()} and ${curated.sign2.toLowerCase()} compatibility`,
        `${curated.sign1.toLowerCase()} ${curated.sign2.toLowerCase()} love`,
        `${curated.sign1.toLowerCase()} ${curated.sign2.toLowerCase()} relationship`,
        `are ${curated.sign1.toLowerCase()} and ${curated.sign2.toLowerCase()} compatible`,
        `${curated.sign1.toLowerCase()} ${curated.sign2.toLowerCase()} match`,
      ],
      overallScore: curated.scores.overall,
      loveScore: curated.scores.love,
      friendshipScore: curated.scores.friendship,
      workScore: curated.scores.work,
      strengths: curated.strengths,
      challenges: curated.challenges,
      advice: curated.advice,
      summary: curated.summary,
      isCurated: true,
    };
  }

  // Fall back to generated content
  const elementScore = elementCompatibility[s1.element][s2.element];
  const modalityScore = modalityCompatibility[s1.modality][s2.modality];
  const baseScore = (elementScore + modalityScore) / 2;

  // Same sign bonus/penalty
  const sameSign = sign1Key === sign2Key;
  const overallScore = sameSign
    ? Math.round(baseScore * 0.9)
    : Math.round(baseScore);

  return {
    sign1: s1.name,
    sign2: s2.name,
    slug,
    title: `${s1.name} and ${s2.name} Compatibility: Love, Friendship & More`,
    description: `Explore ${s1.name} and ${s2.name} compatibility in love, friendship, and work. Learn about their strengths, challenges, and how these zodiac signs can build a lasting relationship.`,
    keywords: [
      `${s1.name.toLowerCase()} and ${s2.name.toLowerCase()} compatibility`,
      `${s1.name.toLowerCase()} ${s2.name.toLowerCase()} love`,
      `${s1.name.toLowerCase()} ${s2.name.toLowerCase()} relationship`,
      `are ${s1.name.toLowerCase()} and ${s2.name.toLowerCase()} compatible`,
      `${s1.name.toLowerCase()} ${s2.name.toLowerCase()} match`,
    ],
    overallScore,
    loveScore: Math.min(10, Math.max(1, overallScore + (sameSign ? -1 : 1))),
    friendshipScore: Math.min(10, Math.max(1, overallScore + 1)),
    workScore: Math.min(
      10,
      Math.max(1, overallScore + (s1.modality === s2.modality ? -1 : 0)),
    ),
    strengths: generateStrengths(s1, s2),
    challenges: generateChallenges(s1, s2),
    advice: generateAdvice(s1, s2),
    isCurated: false,
  };
}

function generateStrengths(
  s1: (typeof signDescriptions)[string],
  s2: (typeof signDescriptions)[string],
): string[] {
  const strengths: string[] = [];

  // Element-based strengths
  if (s1.element === s2.element) {
    strengths.push(
      `Shared ${s1.element} element creates natural understanding and similar energy`,
    );
  } else if (
    (s1.element === 'Fire' && s2.element === 'Air') ||
    (s1.element === 'Air' && s2.element === 'Fire')
  ) {
    strengths.push(
      `${s1.element} and ${s2.element} elements inspire and energize each other`,
    );
  } else if (
    (s1.element === 'Earth' && s2.element === 'Water') ||
    (s1.element === 'Water' && s2.element === 'Earth')
  ) {
    strengths.push(
      `${s1.element} and ${s2.element} elements create emotional security and stability`,
    );
  }

  strengths.push(
    `${s1.name}'s ${s1.traits.split(', ')[0]} nature complements ${s2.name}'s ${s2.traits.split(', ')[0]} approach`,
  );
  strengths.push(
    `Both can learn valuable lessons from each other's perspective`,
  );
  strengths.push(
    `${s1.modality} ${s1.name} and ${s2.modality} ${s2.name} can balance initiation with follow-through`,
  );

  return strengths;
}

function generateChallenges(
  s1: (typeof signDescriptions)[string],
  s2: (typeof signDescriptions)[string],
): string[] {
  const challenges: string[] = [];

  // Element-based challenges
  if (
    (s1.element === 'Fire' && s2.element === 'Water') ||
    (s1.element === 'Water' && s2.element === 'Fire')
  ) {
    challenges.push(
      `Fire's directness may overwhelm Water's sensitivity, while Water may dampen Fire's enthusiasm`,
    );
  } else if (
    (s1.element === 'Earth' && s2.element === 'Air') ||
    (s1.element === 'Air' && s2.element === 'Earth')
  ) {
    challenges.push(
      `Earth's practicality may clash with Air's need for variety and intellectual freedom`,
    );
  } else if (s1.element === s2.element) {
    challenges.push(
      `Too much ${s1.element} energy can amplify both positive and negative tendencies`,
    );
  }

  if (s1.modality === s2.modality) {
    challenges.push(
      `Both being ${s1.modality} signs may lead to power struggles or competition`,
    );
  }

  challenges.push(
    `Different communication styles require patience and adaptation`,
  );
  challenges.push(
    `Must respect each other's need for independence vs. togetherness`,
  );

  return challenges;
}

function generateAdvice(
  s1: (typeof signDescriptions)[string],
  s2: (typeof signDescriptions)[string],
): string {
  return `For ${s1.name} and ${s2.name} to thrive together, focus on appreciating your differences rather than trying to change each other. ${s1.name} can offer ${s1.traits.split(', ')[0]} energy, while ${s2.name} brings ${s2.traits.split(', ')[0]} qualities to the relationship. Communication is key—remember that you may process emotions and express needs differently. Build on your strengths as a pair and approach challenges as opportunities for growth.`;
}

// Get all unique compatibility slugs (78 unique pairs + 12 same-sign)
export function getAllCompatibilitySlugs(): string[] {
  const slugs: string[] = [];
  const signs = Object.keys(signDescriptions);

  for (let i = 0; i < signs.length; i++) {
    for (let j = i; j < signs.length; j++) {
      slugs.push(`${signs[i]}-and-${signs[j]}`);
    }
  }

  return slugs;
}

export function getCuratedCompatibilitySlugs(): string[] {
  // Keys are already canonical alphabetical slugs (see curatedPairs above), so
  // these match the slugs every consumer builds via compatibilitySlug().
  return Object.keys(curatedPairs).sort();
}

// Pre-computed set of curated slugs for O(1) membership checks. Used to keep
// internal links (matrix, related-pairs) pointed only at curated, indexable
// pages so the thin element/modality fallback pairs are not crawled or linked.
const curatedSlugSet = new Set(getCuratedCompatibilitySlugs());

// Normalise two sign keys into the canonical alphabetical slug used everywhere.
export function compatibilitySlug(sign1Key: string, sign2Key: string): string {
  return canonicalPairSlug(sign1Key, sign2Key);
}

// True only for the hand-written, substantive pairs. Non-curated pairs fall
// back to a templated element/modality summary and are kept out of the index.
export function isCuratedCompatibilityPair(slug: string): boolean {
  return curatedSlugSet.has(slug);
}
