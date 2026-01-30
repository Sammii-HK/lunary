/**
 * Advanced Grimoire Recommenders
 *
 * Runes, Lunar Nodes, Synastry, Decans, Witch Types, Divination
 * Only loaded when needed based on query analysis
 */

import {
  getRune,
  getRunesByElement,
  getZodiacSign,
  grimoireData,
} from './data-accessor';
import { getCrystalsByZodiacSign } from '@/constants/grimoire/crystals';

// Import data
import zodiacCompatibilityData from '@/data/zodiac-compatibility.json';
import witchTypesData from '@/constants/witch-types.json';

export interface RuneRecommendation {
  rune: any;
  reason: string;
  element: string;
  meaning: string;
  magicalUses: string[];
}

export interface LunarNodeGuidance {
  northNode: {
    sign: string;
    house?: number;
    meaning: string;
    lifeLesson: string;
    growthArea: string;
  };
  southNode: {
    sign: string;
    house?: number;
    meaning: string;
    pastPattern: string;
    releaseArea: string;
  };
  axis: string;
}

export interface SynastryInsight {
  partnerSign?: string;
  compatibility: {
    overall: string;
    strengths: string[];
    challenges: string[];
    advice: string;
  };
  elementBalance: {
    yourElement: string;
    theirElement: string;
    dynamic: string;
  };
  recommendedCrystals: string[];
  relationshipRituals: string[];
}

export interface DecanInfo {
  sign: string;
  decan: number;
  rulingPlanet: string;
  subRuler: string;
  degrees: string;
  interpretation: string;
}

export interface WitchTypeRecommendation {
  type: string;
  description: string;
  practices: string[];
  tools: string[];
  perfectFor: string[];
  chartReasons: string[];
}

export interface DivinationRecommendation {
  method: string;
  description: string;
  bestFor: string[];
  chartAlignment: string;
  howTo: string[];
}

/**
 * Get a specific rune by name
 * Use when user asks about a specific rune (e.g., "Tell me about Fehu")
 */
export function getSpecificRune(runeName: string): RuneRecommendation | null {
  const rune = getRune(runeName);
  if (!rune) return null;

  return {
    rune,
    reason: `You asked about ${rune.name}`,
    element: rune.element,
    meaning: rune.meaning,
    magicalUses: rune.magicalUses,
  };
}

/**
 * Get rune recommendations based on element balance or specific query
 */
export function getRuneRecommendations(
  elementNeeded?: string,
  intention?: string,
): RuneRecommendation[] {
  const recommendations: RuneRecommendation[] = [];

  if (elementNeeded) {
    const runes = getRunesByElement(elementNeeded);
    for (const rune of runes.slice(0, 3)) {
      recommendations.push({
        rune,
        reason: `Balances ${elementNeeded} element energy`,
        element: rune.element,
        meaning: rune.meaning,
        magicalUses: rune.magicalUses,
      });
    }
  }

  // If intention-based, search runes by keywords
  if (intention && recommendations.length < 3) {
    const allRunes = Object.values(grimoireData.runes);
    for (const rune of allRunes) {
      if (
        rune.keywords.some((kw) =>
          kw.toLowerCase().includes(intention.toLowerCase()),
        ) ||
        rune.meaning.toLowerCase().includes(intention.toLowerCase())
      ) {
        if (!recommendations.some((r) => r.rune.name === rune.name)) {
          recommendations.push({
            rune,
            reason: `Supports ${intention} intention`,
            element: rune.element,
            meaning: rune.meaning,
            magicalUses: rune.magicalUses,
          });
        }
      }

      if (recommendations.length >= 3) break;
    }
  }

  return recommendations;
}

/**
 * Get lunar nodes guidance from natal chart
 */
export function getLunarNodesGuidance(
  northNodeSign: string,
  northNodeHouse?: number,
): LunarNodeGuidance | null {
  // North Node shows destiny, growth, life purpose
  // South Node (opposite sign) shows past life gifts to release

  const zodiacOrder = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ];
  const northIndex = zodiacOrder.findIndex(
    (s) => s.toLowerCase() === northNodeSign.toLowerCase(),
  );
  if (northIndex === -1) return null;

  const southIndex = (northIndex + 6) % 12; // Opposite sign
  const southNodeSign = zodiacOrder[southIndex];

  const northNodeMeanings: {
    [key: string]: { lifeLesson: string; growthArea: string };
  } = {
    Aries: {
      lifeLesson: 'Develop independence, courage, and self-assertion',
      growthArea: 'Taking initiative, being a pioneer, trusting yourself',
    },
    Taurus: {
      lifeLesson: 'Build stability, cultivate patience, appreciate simplicity',
      growthArea: 'Grounding, self-worth, material security, sensual pleasures',
    },
    Gemini: {
      lifeLesson: 'Embrace curiosity, communicate, gather information',
      growthArea:
        'Learning, networking, flexibility, seeing multiple perspectives',
    },
    Cancer: {
      lifeLesson: 'Nurture emotions, create home, develop intuition',
      growthArea: 'Emotional intelligence, family, belonging, self-care',
    },
    Leo: {
      lifeLesson: 'Express creativity, develop confidence, shine authentically',
      growthArea: 'Self-expression, leadership, joy, creative courage',
    },
    Virgo: {
      lifeLesson: 'Serve others, develop discernment, master skills',
      growthArea: 'Practical service, health, daily rituals, humble mastery',
    },
    Libra: {
      lifeLesson: 'Cultivate relationships, seek balance, practice diplomacy',
      growthArea:
        'Partnership, fairness, beauty, cooperation over independence',
    },
    Scorpio: {
      lifeLesson: 'Embrace transformation, dive deep, merge with others',
      growthArea: 'Intimacy, shared resources, emotional depth, rebirth',
    },
    Sagittarius: {
      lifeLesson: 'Seek truth, embrace adventure, expand horizons',
      growthArea: 'Philosophy, travel, higher learning, faith, optimism',
    },
    Capricorn: {
      lifeLesson: 'Build structure, achieve goals, take responsibility',
      growthArea: 'Ambition, discipline, public reputation, long-term planning',
    },
    Aquarius: {
      lifeLesson: 'Embrace uniqueness, serve collective, innovate',
      growthArea:
        'Community, humanitarian work, individuality, progressive thinking',
    },
    Pisces: {
      lifeLesson: 'Develop compassion, trust intuition, surrender control',
      growthArea: 'Spirituality, creativity, empathy, dissolving boundaries',
    },
  };

  const southNodeMeanings: {
    [key: string]: { pastPattern: string; releaseArea: string };
  } = {
    Aries: {
      pastPattern: 'Over-reliance on independence and self-focus',
      releaseArea: 'Going it alone, impulsiveness, me-first mentality',
    },
    Taurus: {
      pastPattern: 'Attachment to material security and comfort',
      releaseArea: 'Stubbornness, possessiveness, fear of change',
    },
    Gemini: {
      pastPattern: 'Mental restlessness and surface-level connections',
      releaseArea: 'Scattered energy, gossip, avoiding depth',
    },
    Cancer: {
      pastPattern: 'Over-attachment to family and emotional safety',
      releaseArea: 'Dependency, moodiness, staying in comfort zone',
    },
    Leo: {
      pastPattern: 'Need for attention and external validation',
      releaseArea: 'Drama, ego-centeredness, pride',
    },
    Virgo: {
      pastPattern: 'Perfectionism and excessive criticism',
      releaseArea: 'Nitpicking, anxiety, servant mentality',
    },
    Libra: {
      pastPattern: 'People-pleasing and avoiding conflict',
      releaseArea: 'Codependency, indecision, losing self in relationships',
    },
    Scorpio: {
      pastPattern: 'Control, manipulation, and emotional intensity',
      releaseArea: 'Jealousy, vengeance, power struggles',
    },
    Sagittarius: {
      pastPattern: 'Avoiding commitment and preaching instead of doing',
      releaseArea: 'Restlessness, dogmatism, excess',
    },
    Capricorn: {
      pastPattern: 'Workaholism and emotional repression',
      releaseArea: 'Rigidity, pessimism, fear of vulnerability',
    },
    Aquarius: {
      pastPattern: 'Emotional detachment and rebelliousness',
      releaseArea: 'Aloofness, stubbornness, feeling superior',
    },
    Pisces: {
      pastPattern: 'Escapism and victim mentality',
      releaseArea: 'Martyrdom, boundary issues, addiction',
    },
  };

  const northGuidance = northNodeMeanings[northNodeSign];
  const southGuidance = southNodeMeanings[southNodeSign];

  return {
    northNode: {
      sign: northNodeSign,
      house: northNodeHouse,
      meaning: `Your North Node in ${northNodeSign} points to your soul's growth direction`,
      lifeLesson: northGuidance.lifeLesson,
      growthArea: northGuidance.growthArea,
    },
    southNode: {
      sign: southNodeSign,
      house: northNodeHouse ? ((northNodeHouse + 5) % 12) + 1 : undefined,
      meaning: `Your South Node in ${southNodeSign} represents comfortable patterns to release`,
      pastPattern: southGuidance.pastPattern,
      releaseArea: southGuidance.releaseArea,
    },
    axis: `${northNodeSign}-${southNodeSign} Axis`,
  };
}

/**
 * Get synastry/compatibility insights
 */
export function getSynastryInsights(
  userSunSign: string,
  partnerSunSign?: string,
): SynastryInsight | null {
  if (!partnerSunSign) {
    // Return general relationship guidance based on user's sign
    const signData = getZodiacSign(userSunSign);
    if (!signData) return null;

    return {
      compatibility: {
        overall: `As a ${userSunSign}, you seek ${signData.element.toLowerCase()} element connection`,
        strengths: signData.strengths?.slice(0, 3) || [],
        challenges: signData.weaknesses?.slice(0, 3) || [],
        advice: `Seek partners who appreciate your ${signData.keywords?.[0]?.toLowerCase()} nature`,
      },
      elementBalance: {
        yourElement: signData.element,
        theirElement: '',
        dynamic: `You thrive with partners who complement your ${signData.element} energy`,
      },
      recommendedCrystals: getCrystalsByZodiacSign(userSunSign)
        .slice(0, 3)
        .map((c) => c.name),
      relationshipRituals: [
        'New Moon intention setting for relationship',
        'Rose quartz crystal grid for love',
        'Venus day (Friday) love spell',
      ],
    };
  }

  // Get compatibility from grimoire data
  const compatKey = `${userSunSign.toLowerCase()}-${partnerSunSign.toLowerCase()}`;
  const compatData = (zodiacCompatibilityData as any)[compatKey];

  if (!compatData) return null;

  const userSignData = getZodiacSign(userSunSign);
  const partnerSignData = getZodiacSign(partnerSunSign);

  return {
    partnerSign: partnerSunSign,
    compatibility: {
      overall:
        compatData.summary ||
        `${userSunSign} and ${partnerSunSign} compatibility`,
      strengths: compatData.strengths || [],
      challenges: compatData.challenges || [],
      advice:
        compatData.advice || "Focus on understanding each other's differences",
    },
    elementBalance: {
      yourElement: userSignData?.element || '',
      theirElement: partnerSignData?.element || '',
      dynamic:
        compatData.elementDynamic ||
        `${userSignData?.element} meets ${partnerSignData?.element}`,
    },
    recommendedCrystals: [
      ...getCrystalsByZodiacSign(userSunSign).slice(0, 2),
      ...getCrystalsByZodiacSign(partnerSunSign).slice(0, 2),
    ]
      .slice(0, 4)
      .map((c) => c.name),
    relationshipRituals: compatData.rituals || [
      "Couple's New Moon intention ritual",
      "Crystal grid with both partners' stones",
      'Venus retrograde relationship review',
    ],
  };
}

/**
 * Get decan information for a planetary placement
 */
export function getDecanInfo(sign: string, degree: number): DecanInfo | null {
  // Decans divide each sign into 3 sections of 10 degrees
  // 1st decan: 0-9.99° (ruled by sign's planet)
  // 2nd decan: 10-19.99° (ruled by next sign of same element)
  // 3rd decan: 20-29.99° (ruled by third sign of same element)

  const decanNum = Math.floor(degree / 10) + 1;
  if (decanNum < 1 || decanNum > 3) return null;

  const signData = getZodiacSign(sign);
  if (!signData) return null;

  const elementSigns: { [key: string]: string[] } = {
    Fire: ['Aries', 'Leo', 'Sagittarius'],
    Earth: ['Taurus', 'Virgo', 'Capricorn'],
    Air: ['Gemini', 'Libra', 'Aquarius'],
    Water: ['Cancer', 'Scorpio', 'Pisces'],
  };

  const element = signData.element;
  const signs = elementSigns[element];
  const signIndex = signs.indexOf(sign);
  const subRulerIndex = (signIndex + decanNum - 1) % 3;
  const subRuler = signs[subRulerIndex];

  const degreesRange = `${decanNum * 10 - 10}-${decanNum * 10 - 1}°`;

  return {
    sign,
    decan: decanNum,
    rulingPlanet: signData.rulingPlanet,
    subRuler,
    degrees: degreesRange,
    interpretation: `The ${decanNum}${decanNum === 1 ? 'st' : decanNum === 2 ? 'nd' : 'rd'} decan of ${sign} is sub-ruled by ${subRuler}, adding ${subRuler} flavoring to ${sign} energy.`,
  };
}

/**
 * Get witch type recommendations based on birth chart
 */
export function getWitchTypeRecommendations(
  dominantElements: string[],
  sunSign: string,
  moonSign: string,
): WitchTypeRecommendation[] {
  const recommendations: WitchTypeRecommendation[] = [];
  const witchTypes = (witchTypesData as any).witchTypesOverview || [];

  // Match witch types to chart
  for (const type of witchTypes) {
    const chartReasons: string[] = [];
    let score = 0;

    // Element alignment
    if (type.elements) {
      for (const element of dominantElements) {
        if (type.elements.includes(element)) {
          score += 2;
          chartReasons.push(`${element} element alignment`);
        }
      }
    }

    // Zodiac alignment
    if (
      type.zodiacSigns &&
      (type.zodiacSigns.includes(sunSign) ||
        type.zodiacSigns.includes(moonSign))
    ) {
      score += 1;
      chartReasons.push('Zodiac sign resonance');
    }

    if (score > 0) {
      recommendations.push({
        type: type.name,
        description: type.description,
        practices: type.practices || [],
        tools: type.tools || [],
        perfectFor: type.perfectFor || [],
        chartReasons,
      });
    }
  }

  // Sort by score (most aligned first)
  return recommendations.slice(0, 3);
}

/**
 * Get divination method recommendations based on chart
 */
export function getDivinationRecommendations(
  hasStrongNeptune: boolean,
  hasStrongMoon: boolean,
  hasStrongMercury: boolean,
  dominantElement?: string,
): DivinationRecommendation[] {
  const recommendations: DivinationRecommendation[] = [];

  // Tarot - good for Air/Mercury placements
  if (hasStrongMercury || dominantElement === 'Air') {
    recommendations.push({
      method: 'Tarot',
      description: 'Symbolic card system for deep insight',
      bestFor: [
        'Decision-making',
        'Understanding patterns',
        'Spiritual guidance',
      ],
      chartAlignment: hasStrongMercury
        ? 'Mercury energy enhances intuitive communication'
        : 'Air element supports mental clarity',
      howTo: [
        'Pull daily card',
        'Three-card spread',
        'Celtic Cross for deep questions',
      ],
    });
  }

  // Scrying - good for Water/Neptune placements
  if (hasStrongNeptune || dominantElement === 'Water') {
    recommendations.push({
      method: 'Water Scrying',
      description: 'Gazing into water to receive visions',
      bestFor: [
        'Accessing subconscious',
        'Psychic visions',
        'Dream interpretation',
      ],
      chartAlignment: hasStrongNeptune
        ? 'Neptune enhances psychic receptivity'
        : 'Water element deepens intuitive flow',
      howTo: [
        'Use black bowl filled with water',
        'Add drop of ink or oil',
        'Gaze softly, receive images',
      ],
    });
  }

  // Runes - good for Earth placements
  if (dominantElement === 'Earth') {
    recommendations.push({
      method: 'Rune Casting',
      description: 'Norse symbols for practical wisdom',
      bestFor: ['Grounded guidance', 'Ancestral wisdom', 'Practical decisions'],
      chartAlignment: 'Earth element grounds divination in practical reality',
      howTo: [
        'Draw single rune for quick guidance',
        'Three-rune spread',
        'Cast multiple for complex reading',
      ],
    });
  }

  // Pendulum - good for anyone with strong Moon
  if (hasStrongMoon) {
    recommendations.push({
      method: 'Pendulum',
      description: 'Tool for yes/no questions and energy detection',
      bestFor: ['Quick answers', 'Chakra balancing', 'Finding lost objects'],
      chartAlignment: 'Moon energy enhances receptivity to subtle vibrations',
      howTo: [
        'Hold pendulum steady',
        'Ask clear yes/no questions',
        'Observe swing patterns',
      ],
    });
  }

  // Dream work - good for Water/Neptune/Pisces
  if (hasStrongNeptune) {
    recommendations.push({
      method: 'Dream Interpretation',
      description: 'Working with subconscious messages during sleep',
      bestFor: [
        'Subconscious exploration',
        'Processing emotions',
        'Receiving guidance',
      ],
      chartAlignment:
        'Neptune dissolves boundaries between conscious and unconscious',
      howTo: [
        'Keep dream journal by bed',
        'Record immediately upon waking',
        'Look for symbols and patterns',
      ],
    });
  }

  return recommendations.slice(0, 3);
}
