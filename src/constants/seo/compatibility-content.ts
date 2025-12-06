// Content database for Zodiac Compatibility pages
// 12 × 12 = 144 combinations (78 unique pairs)

import { signDescriptions } from './planet-sign-content';

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

  // Calculate scores
  const elementScore = elementCompatibility[s1.element][s2.element];
  const modalityScore = modalityCompatibility[s1.modality][s2.modality];
  const baseScore = (elementScore + modalityScore) / 2;

  // Same sign bonus/penalty
  const sameSign = sign1Key === sign2Key;
  const overallScore = sameSign
    ? Math.round(baseScore * 0.9)
    : Math.round(baseScore);

  const slug =
    sign1Key <= sign2Key
      ? `${sign1Key}-and-${sign2Key}`
      : `${sign2Key}-and-${sign1Key}`;

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
