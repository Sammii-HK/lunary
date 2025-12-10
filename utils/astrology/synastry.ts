'use client';

import { BirthChartData } from './birthChart';

export interface SynastryAspect {
  personA: {
    planet: string;
    sign: string;
    degree: number;
  };
  personB: {
    planet: string;
    sign: string;
    degree: number;
  };
  aspect: string;
  aspectSymbol: string;
  orb: number;
  nature: 'harmonious' | 'challenging' | 'neutral';
  description: string;
}

export interface SynastryResult {
  aspects: SynastryAspect[];
  compatibilityScore: number;
  strengths: string[];
  challenges: string[];
  summary: string;
}

const ASPECT_DEFINITIONS = {
  conjunction: { angle: 0, orb: 8, symbol: '☌', nature: 'neutral' as const },
  opposition: {
    angle: 180,
    orb: 8,
    symbol: '☍',
    nature: 'challenging' as const,
  },
  trine: { angle: 120, orb: 8, symbol: '△', nature: 'harmonious' as const },
  square: { angle: 90, orb: 8, symbol: '□', nature: 'challenging' as const },
  sextile: { angle: 60, orb: 6, symbol: '⚹', nature: 'harmonious' as const },
};

const PERSONAL_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
const SOCIAL_PLANETS = ['Jupiter', 'Saturn'];
const OUTER_PLANETS = ['Uranus', 'Neptune', 'Pluto'];

function normalizeAngle(angle: number): number {
  while (angle < 0) angle += 360;
  while (angle >= 360) angle -= 360;
  return angle;
}

function findAspect(
  longA: number,
  longB: number,
): { aspect: string; orb: number } | null {
  const diff = normalizeAngle(longA - longB);
  const reverseDiff = normalizeAngle(longB - longA);
  const minDiff = Math.min(diff, reverseDiff);

  for (const [aspectName, def] of Object.entries(ASPECT_DEFINITIONS)) {
    const orbFromExact = Math.abs(minDiff - def.angle);
    if (orbFromExact <= def.orb) {
      return { aspect: aspectName, orb: Math.round(orbFromExact * 10) / 10 };
    }
  }
  return null;
}

function getAspectDescription(
  planetA: string,
  planetB: string,
  aspect: string,
): string {
  const descriptions: Record<string, Record<string, string>> = {
    'Sun-Moon': {
      conjunction:
        'Deep emotional understanding and natural compatibility. You feel seen and nurtured by each other.',
      trine:
        'Harmonious emotional connection. Your core selves support each other naturally.',
      sextile:
        'Easy communication of needs and feelings. Supportive emotional exchange.',
      square:
        'Tension between ego and emotions. Growth comes through learning to balance needs.',
      opposition:
        'Attraction of opposites. Learning to integrate different approaches to life.',
    },
    'Venus-Mars': {
      conjunction:
        'Strong romantic and physical attraction. Passion runs high.',
      trine: 'Natural romantic chemistry. Desires align harmoniously.',
      sextile: 'Flirtatious and playful connection. Romance flows easily.',
      square: 'Intense attraction with friction. Push-pull dynamic in romance.',
      opposition:
        'Magnetic attraction. Learning to balance give and take in love.',
    },
    'Mercury-Mercury': {
      conjunction:
        'Think alike and communicate easily. Mental wavelength match.',
      trine: 'Stimulating conversations. Ideas flow naturally between you.',
      sextile: 'Enjoy exchanging ideas. Communication is supportive.',
      square:
        'Different thinking styles. Growth through learning to understand each other.',
      opposition:
        'Complementary perspectives. Can learn from different viewpoints.',
    },
    'Sun-Venus': {
      conjunction:
        'Natural affection and appreciation. You enjoy being together.',
      trine: 'Easy love and admiration. Warm, supportive connection.',
      sextile: "Friendly affection. Appreciate each other's qualities.",
      square: 'Attraction with some friction. Values may need adjustment.',
      opposition:
        "Drawn to each other's differences. Learning to appreciate variety.",
    },
  };

  const key1 = `${planetA}-${planetB}`;
  const key2 = `${planetB}-${planetA}`;

  const descSet = descriptions[key1] || descriptions[key2];
  if (descSet && descSet[aspect]) {
    return descSet[aspect];
  }

  // Generic descriptions
  const genericDescs: Record<string, string> = {
    conjunction: `${planetA} and ${planetB} merge energies, creating an intense connection in this area.`,
    trine: `${planetA} and ${planetB} flow harmoniously, supporting each other naturally.`,
    sextile: `${planetA} and ${planetB} work well together with some effort.`,
    square: `${planetA} and ${planetB} create tension that pushes growth.`,
    opposition: `${planetA} and ${planetB} balance each other through integration.`,
  };

  return (
    genericDescs[aspect] || 'An astrological connection between these planets.'
  );
}

export function calculateSynastry(
  chartA: BirthChartData[],
  chartB: BirthChartData[],
  nameA: string = 'Person A',
  nameB: string = 'Person B',
): SynastryResult {
  const aspects: SynastryAspect[] = [];
  let harmoniousCount = 0;
  let challengingCount = 0;
  const strengths: string[] = [];
  const challenges: string[] = [];

  // Focus on personal planets for most meaningful aspects
  const relevantPlanetsA = chartA.filter(
    (p) => PERSONAL_PLANETS.includes(p.body) || SOCIAL_PLANETS.includes(p.body),
  );
  const relevantPlanetsB = chartB.filter(
    (p) => PERSONAL_PLANETS.includes(p.body) || SOCIAL_PLANETS.includes(p.body),
  );

  for (const planetA of relevantPlanetsA) {
    for (const planetB of relevantPlanetsB) {
      const aspectResult = findAspect(
        planetA.eclipticLongitude,
        planetB.eclipticLongitude,
      );

      if (aspectResult) {
        const aspectDef =
          ASPECT_DEFINITIONS[
            aspectResult.aspect as keyof typeof ASPECT_DEFINITIONS
          ];
        const description = getAspectDescription(
          planetA.body,
          planetB.body,
          aspectResult.aspect,
        );

        aspects.push({
          personA: {
            planet: planetA.body,
            sign: planetA.sign,
            degree: planetA.degree,
          },
          personB: {
            planet: planetB.body,
            sign: planetB.sign,
            degree: planetB.degree,
          },
          aspect: aspectResult.aspect,
          aspectSymbol: aspectDef.symbol,
          orb: aspectResult.orb,
          nature: aspectDef.nature,
          description,
        });

        // Count for scoring
        const isPP =
          PERSONAL_PLANETS.includes(planetA.body) &&
          PERSONAL_PLANETS.includes(planetB.body);
        const weight = isPP ? 2 : 1;

        if (aspectDef.nature === 'harmonious') {
          harmoniousCount += weight;
        } else if (aspectDef.nature === 'challenging') {
          challengingCount += weight;
        } else {
          // Neutral (conjunction) - count as slightly positive
          harmoniousCount += weight * 0.5;
        }
      }
    }
  }

  // Calculate compatibility score (0-100)
  const totalWeight = harmoniousCount + challengingCount;
  const compatibilityScore =
    totalWeight > 0 ? Math.round((harmoniousCount / totalWeight) * 100) : 50;

  // Generate strengths
  const sunMoonAspects = aspects.filter(
    (a) =>
      (a.personA.planet === 'Sun' && a.personB.planet === 'Moon') ||
      (a.personA.planet === 'Moon' && a.personB.planet === 'Sun'),
  );
  if (sunMoonAspects.some((a) => a.nature === 'harmonious')) {
    strengths.push('Strong emotional understanding and compatibility');
  }

  const venusMarsAspects = aspects.filter(
    (a) =>
      (a.personA.planet === 'Venus' && a.personB.planet === 'Mars') ||
      (a.personA.planet === 'Mars' && a.personB.planet === 'Venus'),
  );
  if (
    venusMarsAspects.some(
      (a) => a.nature === 'harmonious' || a.aspect === 'conjunction',
    )
  ) {
    strengths.push('Natural romantic and physical attraction');
  }

  const mercuryAspects = aspects.filter(
    (a) => a.personA.planet === 'Mercury' && a.personB.planet === 'Mercury',
  );
  if (mercuryAspects.some((a) => a.nature === 'harmonious')) {
    strengths.push('Easy communication and mental connection');
  }

  // Generate challenges
  if (sunMoonAspects.some((a) => a.nature === 'challenging')) {
    challenges.push('Emotional needs may sometimes clash');
  }
  if (venusMarsAspects.some((a) => a.nature === 'challenging')) {
    challenges.push('Different approaches to romance require adjustment');
  }
  if (mercuryAspects.some((a) => a.nature === 'challenging')) {
    challenges.push('Communication styles may need work');
  }

  // Generate summary
  let summary: string;
  if (compatibilityScore >= 70) {
    summary = `${nameA} and ${nameB} share a highly compatible connection with ${aspects.length} significant aspects. The relationship flows naturally with strong emotional and romantic harmony.`;
  } else if (compatibilityScore >= 50) {
    summary = `${nameA} and ${nameB} have a balanced connection with ${aspects.length} significant aspects. There's good potential with some areas requiring growth and understanding.`;
  } else {
    summary = `${nameA} and ${nameB} have ${aspects.length} significant aspects. While there are challenges, these create opportunities for profound growth and transformation.`;
  }

  return {
    aspects: aspects.sort((a, b) => a.orb - b.orb), // Sort by tightest orb
    compatibilityScore,
    strengths:
      strengths.length > 0
        ? strengths
        : ['Unique connection with growth potential'],
    challenges:
      challenges.length > 0 ? challenges : ['Minor adjustments may be needed'],
    summary,
  };
}
