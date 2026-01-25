import dayjs from 'dayjs';
import { getAstrologicalChart, AstroChartInformation } from './astrology';
import { getUpcomingTransits, TransitEvent } from './transitCalendar';
import { Observer } from 'astronomy-engine';

export type PersonalTransitImpact = {
  date: dayjs.Dayjs;
  planet: string;
  event: string;
  description: string;
  significance: 'low' | 'medium' | 'high';
  type: 'sign_change' | 'retrograde' | 'direct' | 'aspect' | 'lunar_phase';
  personalImpact: string;
  actionableGuidance: string;
  house?: number;
  houseMeaning?: string;
  aspectToNatal?: {
    natalPlanet: string;
    aspectType: string;
    intensity: number;
    transitDegree?: string;
    natalDegree?: string;
    transitSign?: string;
    natalSign?: string;
  };
};

// Calculate which house a planet is in using Whole Sign Houses
const calculateHouseWholeSig = (
  planetLongitude: number,
  ascendantLongitude: number,
): number => {
  const ascendantSign = Math.floor(ascendantLongitude / 30);
  const planetSign = Math.floor(planetLongitude / 30);

  let house = ((planetSign - ascendantSign + 12) % 12) + 1;
  return house;
};

const getHouseMeaning = (house: number): string => {
  const meanings: Record<number, string> = {
    1: 'identity, confidence, how you present yourself',
    2: 'finances, self-worth, possessions',
    3: 'communication, learning, siblings',
    4: 'home, family, inner foundation',
    5: 'creativity, joy, romance, children',
    6: 'health, habits, work environment',
    7: 'partnerships, marriage, collaboration',
    8: 'intimacy, shared money, transformation',
    9: 'travel, philosophy, beliefs, education',
    10: 'career, reputation, leadership',
    11: 'community, friends, social causes',
    12: 'subconscious, solitude, healing',
  };
  return meanings[house] || 'personal growth';
};

// Calculate aspects between a transiting planet and natal planets
const calculateAspectsToNatal = (
  transitPlanet: AstroChartInformation,
  natalChart: any[],
): {
  natalPlanet: string;
  aspectType: string;
  intensity: number;
  transitDegree?: string;
  natalDegree?: string;
  transitSign?: string;
  natalSign?: string;
} | null => {
  for (const natal of natalChart) {
    let diff = Math.abs(
      transitPlanet.eclipticLongitude - natal.eclipticLongitude,
    );
    if (diff > 180) diff = 360 - diff;

    const formatDegree = (longitude: number, sign: string) => {
      const degreeInSign = longitude % 30;
      const wholeDegree = Math.floor(degreeInSign);
      const minutes = Math.floor((degreeInSign - wholeDegree) * 60);
      return `${wholeDegree}°${minutes.toString().padStart(2, '0')}' ${sign}`;
    };

    const result = {
      natalPlanet: natal.body,
      aspectType: '',
      intensity: 0,
      transitDegree: formatDegree(
        transitPlanet.eclipticLongitude,
        transitPlanet.sign,
      ),
      natalDegree: formatDegree(natal.eclipticLongitude, natal.sign),
      transitSign: transitPlanet.sign,
      natalSign: natal.sign,
    };

    // Check for major aspects
    if (Math.abs(diff - 0) <= 8) {
      return {
        ...result,
        aspectType: 'conjunction',
        intensity: 10 - Math.abs(diff - 0),
      };
    } else if (Math.abs(diff - 180) <= 8) {
      return {
        ...result,
        aspectType: 'opposition',
        intensity: 10 - Math.abs(diff - 180),
      };
    } else if (Math.abs(diff - 120) <= 6) {
      return {
        ...result,
        aspectType: 'trine',
        intensity: 8 - Math.abs(diff - 120),
      };
    } else if (Math.abs(diff - 90) <= 6) {
      return {
        ...result,
        aspectType: 'square',
        intensity: 8 - Math.abs(diff - 90),
      };
    }
  }
  return null;
};

// Generate personal impact description
const generatePersonalImpact = (
  transit: TransitEvent,
  house?: number,
  houseMeaning?: string,
  aspectToNatal?: {
    natalPlanet: string;
    aspectType: string;
    intensity: number;
  },
): string => {
  const parts: string[] = [];

  if (house && houseMeaning) {
    parts.push(
      `This transit activates your ${house}${getOrdinalSuffix(house)} house (${houseMeaning})`,
    );
  }

  if (aspectToNatal) {
    const aspectDescriptions = {
      conjunction: 'merges with',
      opposition: 'opposes',
      trine: 'harmoniously connects with',
      square: 'creates tension with',
    };
    parts.push(
      `and ${aspectDescriptions[aspectToNatal.aspectType as keyof typeof aspectDescriptions]} your natal ${aspectToNatal.natalPlanet}`,
    );
  }

  if (parts.length === 0) {
    return 'This transit brings cosmic energy that affects your overall chart.';
  }

  return parts.join(', ') + '.';
};

const getOrdinalSuffix = (n: number): string => {
  if (n >= 11 && n <= 13) return 'th';
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

const getActionableGuidanceByHouse = (
  planet: string,
  house: number,
): string => {
  const houseActions: Record<number, Record<string, string>> = {
    1: {
      Sun: 'Focus on self-expression and personal goals',
      Moon: 'Tune into your emotional needs and self-care',
      Mercury: 'Update your personal brand, start important conversations',
      Venus: 'Refresh your appearance, attract positive attention',
      Mars: 'Take initiative on personal projects, assert yourself',
      Jupiter: 'Expand your horizons, embrace new opportunities',
      Saturn: 'Build discipline around personal habits',
      default: 'Focus on yourself and your identity',
    },
    2: {
      Sun: 'Review your finances and values',
      Moon: 'Emotional security through stability matters now',
      Mercury: 'Good time to negotiate, review budgets',
      Venus: 'Attract abundance, treat yourself mindfully',
      Mars: 'Take action on financial goals',
      Jupiter: 'Opportunities for increased income',
      Saturn: 'Build long-term financial security',
      default: 'Focus on finances and self-worth',
    },
    3: {
      Sun: 'Express your ideas, connect with siblings',
      Moon: 'Write, journal, process your thoughts',
      Mercury: 'Excellent for learning, writing, short trips',
      Venus: 'Harmonious conversations, creative writing',
      Mars: 'Speak up, tackle mental projects',
      Jupiter: 'Expand your knowledge, take a course',
      Saturn: 'Focus on important communications',
      default: 'Communicate and learn something new',
    },
    4: {
      Sun: 'Focus on home and family matters',
      Moon: 'Nurture yourself at home, connect with family',
      Mercury: 'Have important family conversations',
      Venus: 'Beautify your home, enjoy family time',
      Mars: 'Tackle home projects, set boundaries',
      Jupiter: 'Expand your living space or family',
      Saturn: 'Address family responsibilities',
      default: 'Focus on home and emotional foundation',
    },
    5: {
      Sun: 'Express creativity, enjoy romance and fun',
      Moon: 'Follow your heart, do what brings joy',
      Mercury: 'Creative writing, playful conversations',
      Venus: 'Romance flourishes, artistic pursuits shine',
      Mars: 'Take creative risks, pursue passion projects',
      Jupiter: 'Luck in romance and creative ventures',
      Saturn: 'Commit to creative discipline',
      default: 'Express yourself creatively and have fun',
    },
    6: {
      Sun: 'Focus on health routines and daily habits',
      Moon: 'Listen to your body, adjust your routine',
      Mercury: 'Organize, plan, improve workflows',
      Venus: 'Make work pleasant, self-care rituals',
      Mars: 'Push through health goals, tackle tasks',
      Jupiter: 'Improve health habits, work opportunities',
      Saturn: 'Build sustainable health practices',
      default: 'Focus on health and daily routines',
    },
    7: {
      Sun: 'Focus on partnerships and collaboration',
      Moon: 'Nurture close relationships',
      Mercury: 'Important partnership discussions',
      Venus: 'Harmony in relationships, attract love',
      Mars: 'Address relationship dynamics directly',
      Jupiter: 'Partnership opportunities expand',
      Saturn: 'Commit to relationship responsibilities',
      default: 'Focus on important relationships',
    },
    8: {
      Sun: 'Deep transformation, address shared resources',
      Moon: 'Process deep emotions, trust your intuition',
      Mercury: 'Research, investigate, deep conversations',
      Venus: 'Deepen intimacy, joint financial benefits',
      Mars: 'Face fears, take transformative action',
      Jupiter: 'Financial gains through others, inheritance',
      Saturn: 'Face deep responsibilities, let go',
      default: 'Embrace transformation and shared resources',
    },
    9: {
      Sun: 'Explore, learn, expand your worldview',
      Moon: 'Seek meaning, follow your beliefs',
      Mercury: 'Study, publish, plan long-distance travel',
      Venus: 'Love of learning, foreign cultures attract',
      Mars: 'Pursue big goals, defend your beliefs',
      Jupiter: 'Travel, education, luck in expansion',
      Saturn: 'Commit to higher education or teaching',
      default: 'Expand your horizons and seek wisdom',
    },
    10: {
      Sun: 'Career spotlight, focus on reputation',
      Moon: 'Public recognition for emotional intelligence',
      Mercury: 'Important career communications',
      Venus: 'Career charm, professional recognition',
      Mars: 'Ambitious action, career advancement',
      Jupiter: 'Career luck and expansion',
      Saturn: 'Career responsibilities, long-term goals',
      default: 'Focus on career and public image',
    },
    11: {
      Sun: 'Connect with groups, pursue your vision',
      Moon: 'Nurture friendships, community belonging',
      Mercury: 'Network, join groups, share ideas',
      Venus: 'Social harmony, meet new friends',
      Mars: 'Take action on group goals, lead',
      Jupiter: 'Social luck, expand your network',
      Saturn: 'Commit to community responsibilities',
      default: 'Connect with friends and community',
    },
    12: {
      Sun: 'Rest, reflect, spiritual practices',
      Moon: 'Deep rest, dreams, subconscious work',
      Mercury: 'Meditation, journaling, therapy',
      Venus: 'Compassion, artistic inspiration, solitude',
      Mars: 'Inner work, release old patterns',
      Jupiter: 'Spiritual growth, hidden blessings',
      Saturn: 'Face hidden fears, healing work',
      default: 'Rest, reflect, and do inner work',
    },
  };

  const actions = houseActions[house] || houseActions[1];
  return actions[planet] || actions.default;
};

const getActionableGuidanceByType = (type: string, planet: string): string => {
  if (type === 'retrograde') {
    const retroActions: Record<string, string> = {
      Mercury:
        'Slow down communications, double-check details, revisit old ideas',
      Venus: 'Reflect on relationships and values, avoid major purchases',
      Mars: 'Review your actions, redirect energy inward',
      Jupiter: 'Reassess growth plans, internal expansion',
      Saturn: 'Review responsibilities, restructure slowly',
      default: 'Slow down and review this area of life',
    };
    return retroActions[planet] || retroActions.default;
  }

  if (type === 'direct') {
    return `${planet} moves forward again - time to act on what you reviewed`;
  }

  return '';
};

const generateActionableGuidance = (
  planet: string,
  type: string,
  house?: number,
  aspectToNatal?: { natalPlanet: string; aspectType: string },
): string => {
  const parts: string[] = [];

  if (type === 'retrograde' || type === 'direct') {
    parts.push(getActionableGuidanceByType(type, planet));
  } else if (house) {
    parts.push(getActionableGuidanceByHouse(planet, house));
  }

  if (aspectToNatal) {
    const aspectAdvice: Record<string, string> = {
      conjunction: 'Powerful energy - use it intentionally',
      opposition: 'Balance is key - consider other perspectives',
      trine: 'Easy flow - take advantage of this harmony',
      square: 'Tension brings growth - push through challenges',
    };
    if (aspectAdvice[aspectToNatal.aspectType]) {
      parts.push(aspectAdvice[aspectToNatal.aspectType]);
    }
  }

  return parts.length > 0
    ? parts.join('. ')
    : 'Stay aware of cosmic influences today';
};

// Get personal transit impacts for upcoming transits
export const getPersonalTransitImpacts = (
  upcomingTransits: TransitEvent[],
  natalChart: any[],
  limit: number = 10,
): PersonalTransitImpact[] => {
  if (!natalChart || natalChart.length === 0) {
    return [];
  }

  const observer = new Observer(51.4769, 0.0005, 0);
  const ascendant = natalChart.find((p: any) => p.body === 'Ascendant');

  const impacts: PersonalTransitImpact[] = [];

  for (const transit of upcomingTransits.slice(0, limit)) {
    // Get the planetary position on the transit date
    const transitDateChart = getAstrologicalChart(
      transit.date.toDate(),
      observer,
    );
    const transitPlanet = transitDateChart.find(
      (p) => p.body === transit.planet,
    );

    if (!transitPlanet) continue;

    // Calculate house position
    let house: number | undefined;
    let houseMeaning: string | undefined;

    if (ascendant) {
      house = calculateHouseWholeSig(
        transitPlanet.eclipticLongitude,
        ascendant.eclipticLongitude,
      );
      houseMeaning = getHouseMeaning(house);
    } else {
      // Fallback to Sun-based Whole Sign calculation (approximate)
      const natalSun = natalChart.find((p: any) => p.body === 'Sun');
      if (natalSun) {
        house = calculateHouseWholeSig(
          transitPlanet.eclipticLongitude,
          natalSun.eclipticLongitude,
        );
        houseMeaning = `${getHouseMeaning(house)} (approximate)`;
      }
    }

    // Calculate aspects to natal planets
    const aspectToNatal = calculateAspectsToNatal(transitPlanet, natalChart);

    // Generate personal impact
    const personalImpact = generatePersonalImpact(
      transit,
      house,
      houseMeaning,
      aspectToNatal || undefined,
    );

    // Generate actionable guidance
    const actionableGuidance = generateActionableGuidance(
      transit.planet,
      transit.type,
      house,
      aspectToNatal || undefined,
    );

    impacts.push({
      ...transit,
      personalImpact,
      actionableGuidance,
      house,
      houseMeaning,
      aspectToNatal: aspectToNatal || undefined,
    });
  }

  return impacts;
};

export const getPersonalTransitImpactList = (
  natalChart: any[],
  limit = 15,
): PersonalTransitImpact[] => {
  const upcomingTransits = getUpcomingTransits();
  const nonLunarTransits = upcomingTransits.filter(
    (transit) => transit.type !== 'lunar_phase',
  );
  const transitsToUse =
    nonLunarTransits.length > 0 ? nonLunarTransits : upcomingTransits;
  return getPersonalTransitImpacts(transitsToUse, natalChart, limit);
};
