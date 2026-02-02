/**
 * Synastry calculation library
 *
 * Calculates astrological compatibility between two birth charts
 */

import type { BirthChartData } from '../../../utils/astrology/birthChart';

export type SynastryAspect = {
  person1Planet: string;
  person2Planet: string;
  aspectType: string;
  orb: number;
  person1Sign: string;
  person2Sign: string;
  isHarmonious: boolean;
  weight: number;
};

export type ElementBalance = {
  fire: { person1: number; person2: number; combined: number };
  earth: { person1: number; person2: number; combined: number };
  air: { person1: number; person2: number; combined: number };
  water: { person1: number; person2: number; combined: number };
  compatibility: 'complementary' | 'similar' | 'challenging';
};

export type ModalityBalance = {
  cardinal: { person1: number; person2: number; combined: number };
  fixed: { person1: number; person2: number; combined: number };
  mutable: { person1: number; person2: number; combined: number };
  compatibility: 'complementary' | 'similar' | 'challenging';
};

export type SynastryResult = {
  aspects: SynastryAspect[];
  elementBalance: ElementBalance;
  modalityBalance: ModalityBalance;
  compatibilityScore: number;
  summary: string;
};

const ASPECT_DEFINITIONS = [
  { name: 'conjunction', angle: 0, orb: 10, harmonious: true, weight: 10 },
  { name: 'opposition', angle: 180, orb: 10, harmonious: false, weight: 8 },
  { name: 'trine', angle: 120, orb: 8, harmonious: true, weight: 8 },
  { name: 'square', angle: 90, orb: 8, harmonious: false, weight: 6 },
  { name: 'sextile', angle: 60, orb: 6, harmonious: true, weight: 4 },
  { name: 'quincunx', angle: 150, orb: 3, harmonious: false, weight: 2 },
];

const SIGN_ELEMENTS: Record<string, 'fire' | 'earth' | 'air' | 'water'> = {
  aries: 'fire',
  leo: 'fire',
  sagittarius: 'fire',
  taurus: 'earth',
  virgo: 'earth',
  capricorn: 'earth',
  gemini: 'air',
  libra: 'air',
  aquarius: 'air',
  cancer: 'water',
  scorpio: 'water',
  pisces: 'water',
};

const SIGN_MODALITIES: Record<string, 'cardinal' | 'fixed' | 'mutable'> = {
  aries: 'cardinal',
  cancer: 'cardinal',
  libra: 'cardinal',
  capricorn: 'cardinal',
  taurus: 'fixed',
  leo: 'fixed',
  scorpio: 'fixed',
  aquarius: 'fixed',
  gemini: 'mutable',
  virgo: 'mutable',
  sagittarius: 'mutable',
  pisces: 'mutable',
};

// Planets weighted by importance in synastry
const PLANET_WEIGHTS: Record<string, number> = {
  Sun: 10,
  Moon: 10,
  Venus: 9,
  Mars: 8,
  Mercury: 6,
  Ascendant: 8,
  Descendant: 7,
  Jupiter: 5,
  Saturn: 5,
  'North Node': 4,
  Chiron: 3,
  Uranus: 2,
  Neptune: 2,
  Pluto: 2,
};

// Core planets for synastry analysis
const SYNASTRY_PLANETS = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Ascendant',
  'Descendant',
  'North Node',
];

/**
 * Calculate synastry aspects between two birth charts
 */
export function calculateSynastryAspects(
  chart1: BirthChartData[],
  chart2: BirthChartData[],
): SynastryAspect[] {
  const aspects: SynastryAspect[] = [];

  const person1Planets = chart1.filter((p) =>
    SYNASTRY_PLANETS.includes(p.body),
  );
  const person2Planets = chart2.filter((p) =>
    SYNASTRY_PLANETS.includes(p.body),
  );

  for (const p1 of person1Planets) {
    for (const p2 of person2Planets) {
      for (const aspectDef of ASPECT_DEFINITIONS) {
        let diff = Math.abs(p1.eclipticLongitude - p2.eclipticLongitude);
        if (diff > 180) {
          diff = 360 - diff;
        }

        const orbDiff = Math.abs(diff - aspectDef.angle);

        if (orbDiff <= aspectDef.orb) {
          const planetWeight =
            ((PLANET_WEIGHTS[p1.body] || 1) + (PLANET_WEIGHTS[p2.body] || 1)) /
            2;
          const weight = aspectDef.weight * planetWeight;

          aspects.push({
            person1Planet: p1.body,
            person2Planet: p2.body,
            aspectType: aspectDef.name,
            orb: orbDiff,
            person1Sign: p1.sign,
            person2Sign: p2.sign,
            isHarmonious: aspectDef.harmonious,
            weight,
          });
        }
      }
    }
  }

  // Sort by weight (most significant first)
  return aspects.sort((a, b) => b.weight - a.weight);
}

/**
 * Calculate element balance between two charts
 */
export function calculateElementBalance(
  chart1: BirthChartData[],
  chart2: BirthChartData[],
): ElementBalance {
  const balance: ElementBalance = {
    fire: { person1: 0, person2: 0, combined: 0 },
    earth: { person1: 0, person2: 0, combined: 0 },
    air: { person1: 0, person2: 0, combined: 0 },
    water: { person1: 0, person2: 0, combined: 0 },
    compatibility: 'similar',
  };

  const countElements = (
    chart: BirthChartData[],
    target: 'person1' | 'person2',
  ) => {
    for (const planet of chart) {
      const element = SIGN_ELEMENTS[planet.sign.toLowerCase()];
      if (element) {
        const weight = PLANET_WEIGHTS[planet.body] || 1;
        balance[element][target] += weight;
        balance[element].combined += weight;
      }
    }
  };

  countElements(chart1, 'person1');
  countElements(chart2, 'person2');

  // Determine compatibility based on element distribution
  const getDominantElement = (person: 'person1' | 'person2') => {
    const elements = ['fire', 'earth', 'air', 'water'] as const;
    return elements.reduce((a, b) =>
      balance[a][person] > balance[b][person] ? a : b,
    );
  };

  const dom1 = getDominantElement('person1');
  const dom2 = getDominantElement('person2');

  // Compatible elements: fire-air, earth-water
  const compatiblePairs = [
    ['fire', 'air'],
    ['earth', 'water'],
  ];

  if (dom1 === dom2) {
    balance.compatibility = 'similar';
  } else if (
    compatiblePairs.some(
      (pair) =>
        (pair.includes(dom1) && pair.includes(dom2)) ||
        (pair[0] === dom1 && pair[1] === dom2) ||
        (pair[1] === dom1 && pair[0] === dom2),
    )
  ) {
    balance.compatibility = 'complementary';
  } else {
    balance.compatibility = 'challenging';
  }

  return balance;
}

/**
 * Calculate modality balance between two charts
 */
export function calculateModalityBalance(
  chart1: BirthChartData[],
  chart2: BirthChartData[],
): ModalityBalance {
  const balance: ModalityBalance = {
    cardinal: { person1: 0, person2: 0, combined: 0 },
    fixed: { person1: 0, person2: 0, combined: 0 },
    mutable: { person1: 0, person2: 0, combined: 0 },
    compatibility: 'similar',
  };

  const countModalities = (
    chart: BirthChartData[],
    target: 'person1' | 'person2',
  ) => {
    for (const planet of chart) {
      const modality = SIGN_MODALITIES[planet.sign.toLowerCase()];
      if (modality) {
        const weight = PLANET_WEIGHTS[planet.body] || 1;
        balance[modality][target] += weight;
        balance[modality].combined += weight;
      }
    }
  };

  countModalities(chart1, 'person1');
  countModalities(chart2, 'person2');

  // Determine compatibility
  const getDominantModality = (person: 'person1' | 'person2') => {
    const modalities = ['cardinal', 'fixed', 'mutable'] as const;
    return modalities.reduce((a, b) =>
      balance[a][person] > balance[b][person] ? a : b,
    );
  };

  const dom1 = getDominantModality('person1');
  const dom2 = getDominantModality('person2');

  if (dom1 === dom2) {
    balance.compatibility = 'similar';
  } else {
    // Different modalities can complement each other
    balance.compatibility = 'complementary';
  }

  return balance;
}

/**
 * Calculate overall compatibility score (0-100)
 */
export function calculateCompatibilityScore(
  aspects: SynastryAspect[],
  elementBalance: ElementBalance,
  modalityBalance: ModalityBalance,
): number {
  let score = 50; // Start at neutral

  // Aspect scoring (60% of total influence)
  let aspectScore = 0;
  let totalWeight = 0;

  for (const aspect of aspects) {
    totalWeight += aspect.weight;
    if (aspect.isHarmonious) {
      // Tighter orb = stronger effect
      const orbFactor = 1 - aspect.orb / 10;
      aspectScore += aspect.weight * orbFactor;
    } else {
      // Challenging aspects subtract, but less severely
      const orbFactor = 1 - aspect.orb / 10;
      aspectScore -= aspect.weight * orbFactor * 0.5;
    }
  }

  if (totalWeight > 0) {
    // Normalize to -30 to +30 range
    const normalizedAspectScore = (aspectScore / totalWeight) * 30;
    score += normalizedAspectScore;
  }

  // Element compatibility (20% of total influence)
  switch (elementBalance.compatibility) {
    case 'complementary':
      score += 10;
      break;
    case 'similar':
      score += 5;
      break;
    case 'challenging':
      score -= 5;
      break;
  }

  // Modality compatibility (20% of total influence)
  switch (modalityBalance.compatibility) {
    case 'complementary':
      score += 10;
      break;
    case 'similar':
      score += 5;
      break;
    case 'challenging':
      score -= 5;
      break;
  }

  // Clamp to 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Generate a human-readable summary of the synastry
 */
export function generateSynastryAnalysis(
  aspects: SynastryAspect[],
  elementBalance: ElementBalance,
  modalityBalance: ModalityBalance,
  score: number,
): string {
  const summaryParts: string[] = [];

  // Score interpretation
  if (score >= 80) {
    summaryParts.push('Strong natural harmony between these charts.');
  } else if (score >= 65) {
    summaryParts.push('Good compatibility with room for growth together.');
  } else if (score >= 50) {
    summaryParts.push(
      'Balanced connection with both supportive and challenging dynamics.',
    );
  } else if (score >= 35) {
    summaryParts.push(
      'This connection requires conscious effort and understanding.',
    );
  } else {
    summaryParts.push(
      'A challenging dynamic that offers significant growth opportunities.',
    );
  }

  // Key aspects
  const keyAspects = aspects.slice(0, 3);
  if (keyAspects.length > 0) {
    const aspectDescriptions = keyAspects.map((a) => {
      const verb = a.isHarmonious ? 'harmonizes with' : 'challenges';
      return `${a.person1Planet} ${verb} ${a.person2Planet} (${a.aspectType})`;
    });
    summaryParts.push(`Key connections: ${aspectDescriptions.join(', ')}.`);
  }

  // Element balance
  switch (elementBalance.compatibility) {
    case 'complementary':
      summaryParts.push(
        'Your elemental natures complement each other beautifully.',
      );
      break;
    case 'similar':
      summaryParts.push('You share a similar elemental nature and approach.');
      break;
    case 'challenging':
      summaryParts.push(
        'Your elemental differences create dynamic tension and growth.',
      );
      break;
  }

  return summaryParts.join(' ');
}

/**
 * Main function to calculate full synastry between two charts
 */
export function calculateSynastry(
  chart1: BirthChartData[],
  chart2: BirthChartData[],
): SynastryResult {
  const aspects = calculateSynastryAspects(chart1, chart2);
  const elementBalance = calculateElementBalance(chart1, chart2);
  const modalityBalance = calculateModalityBalance(chart1, chart2);
  const compatibilityScore = calculateCompatibilityScore(
    aspects,
    elementBalance,
    modalityBalance,
  );
  const summary = generateSynastryAnalysis(
    aspects,
    elementBalance,
    modalityBalance,
    compatibilityScore,
  );

  return {
    aspects,
    elementBalance,
    modalityBalance,
    compatibilityScore,
    summary,
  };
}
