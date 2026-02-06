'use client';

import { useUser } from '@/context/UserContext';
import { SmartTrialButton } from '@/components/SmartTrialButton';
import { BirthChartData } from '../../../utils/astrology/birthChart';
import {
  formatDegree,
  getZodiacSign,
} from '../../../utils/astrology/astrology';
import { BirthChart } from '@/components/BirthChart';
import {
  bodiesSymbols,
  zodiacSymbol,
  elementAstro,
  modalityAstro,
  astroPointSymbols,
  houseThemes,
} from '../../../utils/zodiac/zodiac';
import { useSubscription } from '../../hooks/useSubscription';
import { hasBirthChartAccess } from '../../../utils/pricing';
import Link from 'next/link';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { conversionTracking } from '@/lib/analytics';
import { useEffect, useMemo, useState } from 'react';
import { ShareBirthChart } from '@/components/ShareBirthChart';
import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { Sparkles, Moon, Star, Home } from 'lucide-react';
import { PersonalPlanetsSection } from '@/components/birth-chart-sections/PersonalPlanetsSection';
import { SocialPlanetsSection } from '@/components/birth-chart-sections/SocialPlanetsSection';
import { GenerationalPlanetsSection } from '@/components/birth-chart-sections/GenerationalPlanetsSection';
import { AsteroidsSection } from '@/components/birth-chart-sections/AsteroidsSection';
import { SensitivePointsSection } from '@/components/birth-chart-sections/SensitivePointsSection';

const ZODIAC_ORDER = [
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

const calculateWholeSigHouses = (birthChart: BirthChartData[]) => {
  const ascendant = birthChart.find((p) => p.body === 'Ascendant');
  if (!ascendant) return null;

  const ascendantSignIndex = ZODIAC_ORDER.findIndex(
    (sign) => sign.toLowerCase() === ascendant.sign.toLowerCase(),
  );
  if (ascendantSignIndex === -1) return null;

  const houses: Array<{
    house: number;
    sign: string;
    planets: BirthChartData[];
  }> = [];

  for (let i = 0; i < 12; i++) {
    const houseSign = ZODIAC_ORDER[(ascendantSignIndex + i) % 12];
    const planetsInHouse = birthChart.filter((p) => {
      if (
        [
          'Ascendant',
          'Midheaven',
          'North Node',
          'South Node',
          'Chiron',
          'Lilith',
        ].includes(p.body)
      ) {
        return false;
      }
      return p.sign.toLowerCase() === houseSign.toLowerCase();
    });

    houses.push({
      house: i + 1,
      sign: houseSign,
      planets: planetsInHouse,
    });
  }

  return houses;
};

const ensureDescendantInChart = (birthChart: BirthChartData[]) => {
  const hasDescendant = birthChart.some((p) => p.body === 'Descendant');
  if (hasDescendant) return birthChart;
  const ascendant = birthChart.find((p) => p.body === 'Ascendant');
  if (!ascendant) return birthChart;

  const descendantLongitude = (ascendant.eclipticLongitude + 180) % 360;
  const formatted = formatDegree(descendantLongitude);
  const descendantSign = getZodiacSign(descendantLongitude);

  return [
    ...birthChart,
    {
      body: 'Descendant',
      sign: descendantSign,
      degree: formatted.degree,
      minute: formatted.minute,
      eclipticLongitude: descendantLongitude,
      retrograde: false,
    },
  ];
};

// Function to generate concise planetary interpretations
const getPlanetaryInterpretation = (planet: BirthChartData): string => {
  // Detailed planet-sign interpretations
  const interpretations: Record<string, Record<string, string>> = {
    Sun: {
      Aries:
        'Your identity is expressed through bold leadership and pioneering spirit. You need independence and thrive when initiating new projects. Your life purpose involves courage and being first.',
      Taurus:
        'Your sense of self is grounded in stability, material security, and sensory pleasure. You build your identity through reliability and patience. Your purpose involves creating lasting value.',
      Gemini:
        'Your identity flows through communication, learning, and mental agility. You define yourself through versatility and curiosity. Your purpose is sharing ideas and making connections.',
      Cancer:
        'Your core self is deeply emotional, protective, and nurturing. You identify with home, family, and emotional security. Your purpose involves caring for others and creating safe spaces.',
      Leo: 'You shine through creative self-expression, confidence, and generosity. Your identity needs recognition and appreciation. Your purpose is inspiring others through authentic presence.',
      Virgo:
        'Your identity is analytical, service-oriented, and improvement-focused. You define yourself through usefulness and precision. Your purpose involves healing and practical problem-solving.',
      Libra:
        'Your sense of self emerges through relationships, harmony, and aesthetics. You identify with fairness and partnership. Your purpose involves creating balance and beauty.',
      Scorpio:
        'Your identity is intensely transformative, powerful, and penetrating. You define yourself through depth and emotional truth. Your purpose involves profound change and uncovering hidden realities.',
      Sagittarius:
        'Your core self is adventurous, philosophical, and truth-seeking. You identify with freedom and meaning. Your purpose involves expanding horizons and sharing wisdom.',
      Capricorn:
        'Your identity is ambitious, disciplined, and achievement-oriented. You define yourself through accomplishment and responsibility. Your purpose involves mastering challenges and building legacy.',
      Aquarius:
        'Your sense of self is innovative, independent, and humanitarian. You identify with progress and individuality. Your purpose involves revolutionary change and collective advancement.',
      Pisces:
        'Your identity is compassionate, intuitive, and spiritually-oriented. You define yourself through empathy and transcendence. Your purpose involves healing and connecting to the divine.',
    },
    Moon: {
      Aries:
        'You feel most secure when taking action and being independent. Emotionally, you need freedom and excitement. You process feelings through direct, immediate expression.',
      Taurus:
        'Your emotional needs center on stability, comfort, and physical security. You process feelings slowly and thoroughly. You find peace in routine, nature, and sensory pleasure.',
      Gemini:
        'You need intellectual stimulation and communication to feel emotionally secure. You process emotions through talking and analyzing. Variety and mental engagement soothe you.',
      Cancer:
        'Your emotional world is rich, protective, and deeply sensitive. You need nurturing and a safe home base. You process feelings through caring for others and emotional intimacy.',
      Leo: 'You need appreciation, creative expression, and warmth to feel emotionally fulfilled. You process emotions dramatically and generously. Recognition and joy are essential.',
      Virgo:
        'Your emotional security comes from being useful and organized. You process feelings analytically and need to feel productive. Service and routine bring comfort.',
      Libra:
        'You need harmony, partnership, and aesthetic beauty for emotional wellbeing. You process feelings through relationships. Balance and fairness soothe your soul.',
      Scorpio:
        'Your emotional needs are intense, private, and transformative. You process feelings deeply and completely. You need emotional honesty and transformative experiences.',
      Sagittarius:
        'You feel secure through freedom, adventure, and philosophical understanding. You process emotions optimistically. Learning and expansion bring emotional satisfaction.',
      Capricorn:
        'Your emotional security comes from achievement and structure. You process feelings cautiously and practically. Responsibility and accomplishment bring comfort.',
      Aquarius:
        'You need intellectual freedom and social ideals for emotional wellbeing. You process feelings objectively and uniquely. Progress and independence soothe you.',
      Pisces:
        'Your emotional world is compassionate, intuitive, and boundless. You process feelings through empathy and imagination. Spirituality and creativity bring peace.',
    },
    Mercury: {
      Aries:
        'You think quickly, directly, and decisively. Your communication style is bold and competitive. You learn best through action and debate.',
      Taurus:
        'Your thinking is deliberate, practical, and thorough. You communicate with patience and common sense. You learn through hands-on experience and repetition.',
      Gemini:
        'Your mind is quick, versatile, and curious. You communicate effortlessly and love variety. You learn through reading, talking, and multitasking.',
      Cancer:
        'You think intuitively and emotionally. Your communication style is nurturing and protective. You learn best in comfortable, secure environments.',
      Leo: 'Your thinking is confident, creative, and dramatic. You communicate with warmth and authority. You learn through self-expression and recognition.',
      Virgo:
        'Your mind is analytical, detail-oriented, and practical. You communicate precisely and helpfully. You learn through systematic study and application.',
      Libra:
        'You think diplomatically and consider multiple perspectives. Your communication seeks harmony and fairness. You learn through discussion and comparison.',
      Scorpio:
        'Your thinking is deep, investigative, and intense. You communicate powerfully but selectively. You learn by going beneath the surface.',
      Sagittarius:
        'Your mind is philosophical, optimistic, and expansive. You communicate bluntly and enthusiastically. You learn through big-picture understanding and experience.',
      Capricorn:
        'Your thinking is strategic, ambitious, and practical. You communicate with authority and caution. You learn through structured, goal-oriented study.',
      Aquarius:
        'Your mind is innovative, objective, and unconventional. You communicate uniquely and intellectually. You learn through experimentation and systems thinking.',
      Pisces:
        'Your thinking is intuitive, imaginative, and holistic. You communicate through metaphor and emotion. You learn through absorption and artistic expression.',
    },
    Venus: {
      Aries:
        'You love passionately and impulsively. You attract others through confidence and directness. You value independence and excitement in relationships.',
      Taurus:
        'You love steadily and sensually. You attract through reliability and physical affection. You value loyalty, comfort, and material security.',
      Gemini:
        'You love through conversation and mental connection. You attract through wit and versatility. You value communication and variety in relationships.',
      Cancer:
        'You love nurturingly and emotionally. You attract through caring and sensitivity. You value emotional security and family in relationships.',
      Leo: 'You love generously and dramatically. You attract through warmth and confidence. You value romance, loyalty, and appreciation.',
      Virgo:
        'You love through practical service and attention to detail. You attract through helpfulness. You value usefulness and improvement in relationships.',
      Libra:
        'You love harmoniously and romantically. You attract through charm and grace. You value partnership, balance, and beauty.',
      Scorpio:
        'You love intensely and possessively. You attract through magnetic depth. You value emotional intimacy, loyalty, and transformation.',
      Sagittarius:
        'You love freely and adventurously. You attract through enthusiasm and honesty. You value freedom, growth, and shared philosophy.',
      Capricorn:
        'You love seriously and committedly. You attract through stability and ambition. You value respect, loyalty, and long-term goals.',
      Aquarius:
        'You love unconventionally and independently. You attract through uniqueness and intellect. You value friendship, freedom, and individuality.',
      Pisces:
        'You love compassionately and romantically. You attract through empathy and creativity. You value spiritual connection and unconditional acceptance.',
    },
    Mars: {
      Aries:
        'You act boldly, quickly, and independently. Your drive is competitive and pioneering. You assert yourself directly and courageously.',
      Taurus:
        'You act steadily and deliberately. Your drive builds slowly but powerfully. You assert yourself through persistence and determination.',
      Gemini:
        'You act through multiple channels simultaneously. Your drive is mental and versatile. You assert yourself through words and clever strategies.',
      Cancer:
        'You act protectively and emotionally. Your drive defends what you care about. You assert yourself indirectly and tenaciously.',
      Leo: 'You act confidently and dramatically. Your drive seeks recognition and creative expression. You assert yourself proudly and generously.',
      Virgo:
        'You act precisely and efficiently. Your drive focuses on improvement and service. You assert yourself through competence and critique.',
      Libra:
        'You act diplomatically and strategically. Your drive seeks fairness and partnership. You assert yourself through charm and negotiation.',
      Scorpio:
        'You act intensely and strategically. Your drive is powerful and transformative. You assert yourself through emotional intensity and willpower.',
      Sagittarius:
        'You act adventurously and optimistically. Your drive seeks freedom and truth. You assert yourself through enthusiasm and honesty.',
      Capricorn:
        'You act ambitiously and strategically. Your drive is disciplined and goal-oriented. You assert yourself through authority and achievement.',
      Aquarius:
        'You act unconventionally and rebelliously. Your drive seeks innovation and freedom. You assert yourself through originality and detachment.',
      Pisces:
        'You act compassionately and intuitively. Your drive is spiritual and creative. You assert yourself indirectly through empathy and imagination.',
    },
  };

  // Fallback for outer planets and asteroids
  const planetMeanings: Record<string, string> = {
    Jupiter: 'Your beliefs, growth, and opportunities',
    Saturn: 'Your discipline, boundaries, and life lessons',
    Uranus: 'Your uniqueness and revolutionary spirit',
    Neptune: 'Your dreams, spirituality, and illusions',
    Pluto: 'Your power and transformative capacity',
  };

  const signQualities: Record<string, string> = {
    Aries: 'bold, direct, and pioneering',
    Taurus: 'steady, practical, and determined',
    Gemini: 'curious, communicative, and adaptable',
    Cancer: 'nurturing, protective, and emotional',
    Leo: 'confident, creative, and generous',
    Virgo: 'analytical, helpful, and precise',
    Libra: 'diplomatic, harmonious, and fair',
    Scorpio: 'intense, transformative, and deep',
    Sagittarius: 'adventurous, philosophical, and honest',
    Capricorn: 'ambitious, disciplined, and responsible',
    Aquarius: 'innovative, independent, and humanitarian',
    Pisces: 'compassionate, intuitive, and imaginative',
  };

  // Get specific interpretation or fallback to general
  const specific = interpretations[planet.body]?.[planet.sign];
  if (specific) {
    const retrogradeNote = planet.retrograde
      ? ' [Retrograde: This energy turns inward, requiring you to master it internally before expressing it outwardly. Periods of reflection and revision are essential.]'
      : '';
    return specific + retrogradeNote;
  }

  // Fallback for planets without specific interpretations
  const planetMeaning = planetMeanings[planet.body] || `Your ${planet.body}`;
  const signQuality = signQualities[planet.sign] || planet.sign;
  const retrogradeNote = planet.retrograde
    ? ' Retrograde brings internal focus and deeper mastery.'
    : '';

  return `${planetMeaning} expresses through ${signQuality} energy.${retrogradeNote}`;
};

// Function to get the chart ruler based on Ascendant sign
const getChartRuler = (ascendantSign: string): string => {
  const rulers: Record<string, string> = {
    Aries: 'Mars',
    Taurus: 'Venus',
    Gemini: 'Mercury',
    Cancer: 'Moon',
    Leo: 'Sun',
    Virgo: 'Mercury',
    Libra: 'Venus',
    Scorpio: 'Pluto', // Modern ruler (traditional: Mars)
    Sagittarius: 'Jupiter',
    Capricorn: 'Saturn',
    Aquarius: 'Uranus', // Modern ruler (traditional: Saturn)
    Pisces: 'Neptune', // Modern ruler (traditional: Jupiter)
  };
  return rulers[ascendantSign] || 'Unknown';
};

// Function to get ordinal suffix for numbers (1st, 2nd, 3rd, etc.)
const getOrdinalSuffix = (num: number): string => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
};

// Function to get the most aspected planet
const getMostAspectedPlanet = (birthChart: BirthChartData[]): string => {
  const aspectCounts: Record<string, number> = {};
  const majorAspects = [
    { angle: 0, orb: 8 }, // Conjunction
    { angle: 180, orb: 8 }, // Opposition
    { angle: 120, orb: 6 }, // Trine
    { angle: 90, orb: 6 }, // Square
    { angle: 60, orb: 4 }, // Sextile
  ];

  // Count aspects for each planet
  birthChart.forEach((planet1) => {
    if (!aspectCounts[planet1.body]) aspectCounts[planet1.body] = 0;

    birthChart.forEach((planet2) => {
      if (planet1.body === planet2.body) return;

      let diff = Math.abs(
        planet1.eclipticLongitude - planet2.eclipticLongitude,
      );
      if (diff > 180) diff = 360 - diff;

      for (const aspect of majorAspects) {
        const orb = Math.abs(diff - aspect.angle);
        if (orb <= aspect.orb) {
          aspectCounts[planet1.body]++;
          break;
        }
      }
    });
  });

  // Find planet with most aspects
  let mostAspected = 'Sun';
  let maxCount = 0;

  Object.entries(aspectCounts).forEach(([planet, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostAspected = planet;
    }
  });

  return mostAspected;
};

// Function to get planetary dignity status for a single planet
const getPlanetDignityStatus = (
  planetName: string,
  sign: string,
): 'rulership' | 'exaltation' | 'detriment' | 'fall' | null => {
  const rulerships: Record<string, string[]> = {
    Sun: ['Leo'],
    Moon: ['Cancer'],
    Mercury: ['Gemini', 'Virgo'],
    Venus: ['Taurus', 'Libra'],
    Mars: ['Aries', 'Scorpio'],
    Jupiter: ['Sagittarius', 'Pisces'],
    Saturn: ['Capricorn', 'Aquarius'],
    Uranus: ['Aquarius'],
    Neptune: ['Pisces'],
    Pluto: ['Scorpio'],
  };

  const exaltations: Record<string, string> = {
    Sun: 'Aries',
    Moon: 'Taurus',
    Mercury: 'Virgo',
    Venus: 'Pisces',
    Mars: 'Capricorn',
    Jupiter: 'Cancer',
    Saturn: 'Libra',
  };

  const detriments: Record<string, string[]> = {
    Sun: ['Aquarius'],
    Moon: ['Capricorn'],
    Mercury: ['Sagittarius', 'Pisces'],
    Venus: ['Aries', 'Scorpio'],
    Mars: ['Libra', 'Taurus'],
    Jupiter: ['Gemini', 'Virgo'],
    Saturn: ['Cancer', 'Leo'],
  };

  const falls: Record<string, string> = {
    Sun: 'Libra',
    Moon: 'Scorpio',
    Mercury: 'Pisces',
    Venus: 'Virgo',
    Mars: 'Cancer',
    Jupiter: 'Capricorn',
    Saturn: 'Aries',
  };

  if (rulerships[planetName]?.includes(sign)) return 'rulership';
  if (exaltations[planetName] === sign) return 'exaltation';
  if (detriments[planetName]?.includes(sign)) return 'detriment';
  if (falls[planetName] === sign) return 'fall';

  return null;
};

// Chart analysis functions
type ChartAnalysis = {
  category: string;
  insight: string;
};

type PlanetaryDignity = {
  planet: string;
  type: string;
  meaning: string;
};

type PlanetaryAspect = {
  planet1: string;
  planet2: string;
  aspectSymbol: string;
  aspect: string;
  orb: number;
  meaning: string;
};

type ChartPattern = {
  name: string;
  description: string;
  meaning: string;
};

type Stellium = {
  sign: string;
  planets: BirthChartData[];
  meaning: string;
};

const getChartAnalysis = (birthChart: BirthChartData[]): ChartAnalysis[] => {
  const analysis: ChartAnalysis[] = [];

  // Count retrograde planets
  const retrogradeCount = birthChart.filter((p) => p.retrograde).length;
  if (retrogradeCount >= 3) {
    analysis.push({
      category: 'Retrograde Emphasis',
      insight: `${retrogradeCount} retrograde planets suggest deep introspection and mastery through internal processing.`,
    });
  }

  // Element dominance
  const elements = getElementCounts(birthChart);
  const dominantElement = elements.reduce((a, b) =>
    a.count > b.count ? a : b,
  );
  if (dominantElement.count >= 3) {
    analysis.push({
      category: 'Elemental Dominance',
      insight: `Strong ${dominantElement.name} emphasis brings ${getElementMeaning(dominantElement.name)} energy to your personality.`,
    });
  }

  // Sign spread
  const uniqueSigns = new Set(birthChart.map((p) => p.sign)).size;
  if (uniqueSigns <= 4) {
    const occupiedSigns = Array.from(new Set(birthChart.map((p) => p.sign)));
    const signList =
      occupiedSigns.slice(0, 3).join(', ') +
      (occupiedSigns.length > 3 ? '...' : '');

    analysis.push({
      category: 'Focused Energy',
      insight: `Planets concentrated in ${uniqueSigns} signs (${signList}) creates laser-focused intensity. You approach life through these specific energetic lenses, giving you expertise and depth in these areas but potentially creating blind spots in others. This concentration amplifies your power in these themes while requiring conscious effort to develop more diverse perspectives.`,
    });
  } else if (uniqueSigns >= 8) {
    analysis.push({
      category: 'Diverse Expression',
      insight: `Planets spread across ${uniqueSigns} signs brings versatility and adaptability.`,
    });
  }

  return analysis;
};

const getElementModality = (birthChart: BirthChartData[]) => {
  const elements = getElementCounts(birthChart);
  const modalities = getModalityCounts(birthChart);

  return { elements, modalities };
};

const getElementCounts = (birthChart: BirthChartData[]) => {
  const elementMap: Record<string, string> = {
    Aries: 'Fire',
    Leo: 'Fire',
    Sagittarius: 'Fire',
    Taurus: 'Earth',
    Virgo: 'Earth',
    Capricorn: 'Earth',
    Gemini: 'Air',
    Libra: 'Air',
    Aquarius: 'Air',
    Cancer: 'Water',
    Scorpio: 'Water',
    Pisces: 'Water',
  };

  const elementGroups: Record<string, BirthChartData[]> = {
    Fire: [],
    Earth: [],
    Air: [],
    Water: [],
  };

  birthChart.forEach((planet) => {
    const element = elementMap[planet.sign];
    if (element) elementGroups[element].push(planet);
  });

  const symbols: Record<string, string> = {
    Fire: elementAstro.fire,
    Earth: elementAstro.earth,
    Air: elementAstro.air,
    Water: elementAstro.water,
  };

  return Object.entries(elementGroups).map(([name, planets]) => ({
    name,
    count: planets.length,
    symbol: symbols[name],
    planets: planets,
    useAstroFont: true,
  }));
};

const getModalityCounts = (birthChart: BirthChartData[]) => {
  const modalityMap: Record<string, string> = {
    Aries: 'Cardinal',
    Cancer: 'Cardinal',
    Libra: 'Cardinal',
    Capricorn: 'Cardinal',
    Taurus: 'Fixed',
    Leo: 'Fixed',
    Scorpio: 'Fixed',
    Aquarius: 'Fixed',
    Gemini: 'Mutable',
    Virgo: 'Mutable',
    Sagittarius: 'Mutable',
    Pisces: 'Mutable',
  };

  const modalityGroups: Record<string, BirthChartData[]> = {
    Cardinal: [],
    Fixed: [],
    Mutable: [],
  };

  birthChart.forEach((planet) => {
    const modality = modalityMap[planet.sign];
    if (modality) modalityGroups[modality].push(planet);
  });

  return Object.entries(modalityGroups).map(([name, planets]) => ({
    name,
    count: planets.length,
    planets: planets,
  }));
};

const getElementMeaning = (element: string): string => {
  const meanings: Record<string, string> = {
    Fire: 'passionate, energetic, action-oriented',
    Earth: 'practical, grounded, stability-seeking',
    Air: 'intellectual, communicative, idea-focused',
    Water: 'emotional, intuitive, feeling-oriented',
  };
  return meanings[element] || element;
};

const getPlanetaryDignities = (
  birthChart: BirthChartData[],
): PlanetaryDignity[] => {
  const dignities: PlanetaryDignity[] = [];

  // Rulership (planets in their home signs)
  const rulerships: Record<string, string[]> = {
    Sun: ['Leo'],
    Moon: ['Cancer'],
    Mercury: ['Gemini', 'Virgo'],
    Venus: ['Taurus', 'Libra'],
    Mars: ['Aries', 'Scorpio'],
    Jupiter: ['Sagittarius', 'Pisces'],
    Saturn: ['Capricorn', 'Aquarius'],
    Uranus: ['Aquarius'],
    Neptune: ['Pisces'],
    Pluto: ['Scorpio'],
  };

  // Exaltation (planets in their exalted signs)
  const exaltations: Record<string, string> = {
    Sun: 'Aries',
    Moon: 'Taurus',
    Mercury: 'Virgo',
    Venus: 'Pisces',
    Mars: 'Capricorn',
    Jupiter: 'Cancer',
    Saturn: 'Libra',
  };

  // Detriment (planets in the sign opposite their rulership)
  const detriments: Record<string, string[]> = {
    Sun: ['Aquarius'],
    Moon: ['Capricorn'],
    Mercury: ['Sagittarius', 'Pisces'],
    Venus: ['Aries', 'Scorpio'],
    Mars: ['Libra', 'Taurus'],
    Jupiter: ['Gemini', 'Virgo'],
    Saturn: ['Cancer', 'Leo'],
  };

  // Fall (planets in the sign opposite their exaltation)
  const falls: Record<string, string> = {
    Sun: 'Libra',
    Moon: 'Scorpio',
    Mercury: 'Pisces',
    Venus: 'Virgo',
    Mars: 'Cancer',
    Jupiter: 'Capricorn',
    Saturn: 'Aries',
  };

  birthChart.forEach((planet) => {
    // Check rulership
    if (rulerships[planet.body]?.includes(planet.sign)) {
      dignities.push({
        planet: planet.body,
        type: 'in Rulership',
        meaning: `${planet.body} is at home in ${planet.sign}, expressing its pure essence with natural strength.`,
      });
    }

    // Check exaltation
    if (exaltations[planet.body] === planet.sign) {
      dignities.push({
        planet: planet.body,
        type: 'in Exaltation',
        meaning: `${planet.body} is exalted in ${planet.sign}, operating at its highest potential.`,
      });
    }

    // Check detriment
    if (detriments[planet.body]?.includes(planet.sign)) {
      dignities.push({
        planet: planet.body,
        type: 'in Detriment',
        meaning: `${planet.body} is in detriment in ${planet.sign}, facing challenges in expressing its natural qualities and requiring extra effort.`,
      });
    }

    // Check fall
    if (falls[planet.body] === planet.sign) {
      dignities.push({
        planet: planet.body,
        type: 'in Fall',
        meaning: `${planet.body} is in fall in ${planet.sign}, operating in a weakened state and struggling to manifest its highest expression.`,
      });
    }
  });

  return dignities;
};

const getModalitySymbol = (modality: string): string => {
  const symbols: Record<string, string> = {
    Cardinal: modalityAstro.cardinal,
    Fixed: modalityAstro.fixed,
    Mutable: modalityAstro.mutable,
  };
  return symbols[modality] || '';
};

const getModalityMeaning = (
  modality: string,
  planets: BirthChartData[],
): string => {
  const meanings: Record<string, string> = {
    Cardinal: 'Initiative & Leadership',
    Fixed: 'Stability & Persistence',
    Mutable: 'Adaptability & Change',
  };

  const planetList = planets.map((p) => p.body).join(', ');
  const detailed: Record<string, string> = {
    Cardinal: `Your ${planetList} drive you to initiate, lead, and start new things. You're naturally equipped to pioneer new directions and take charge when action is needed.`,
    Fixed: `Your ${planetList} provide unwavering determination and the ability to see things through to completion. You have incredible staying power and resist change until you're ready.`,
    Mutable: `Your ${planetList} make you highly adaptable, flexible, and able to go with the flow. You excel at adjusting to circumstances and finding creative solutions.`,
  };

  return detailed[modality] || meanings[modality] || modality;
};

const getPlanetaryAspects = (
  birthChart: BirthChartData[],
): PlanetaryAspect[] => {
  const aspects: PlanetaryAspect[] = [];

  // Define major aspects with their angles and orbs
  const majorAspects = [
    { name: 'Conjunction', angle: 0, symbol: '☌', orb: 8 },
    { name: 'Opposition', angle: 180, symbol: '☍', orb: 8 },
    { name: 'Trine', angle: 120, symbol: '△', orb: 6 },
    { name: 'Square', angle: 90, symbol: '□', orb: 6 },
    { name: 'Sextile', angle: 60, symbol: '⚹', orb: 4 },
  ];

  // Check all planet pairs
  for (let i = 0; i < birthChart.length; i++) {
    for (let j = i + 1; j < birthChart.length; j++) {
      const planet1 = birthChart[i];
      const planet2 = birthChart[j];

      let diff = Math.abs(
        planet1.eclipticLongitude - planet2.eclipticLongitude,
      );
      if (diff > 180) diff = 360 - diff;

      for (const aspect of majorAspects) {
        const orb = Math.abs(diff - aspect.angle);
        if (orb <= aspect.orb) {
          aspects.push({
            planet1: planet1.body,
            planet2: planet2.body,
            aspectSymbol: aspect.symbol,
            aspect: aspect.name,
            orb,
            meaning: getAspectMeaning(planet1.body, planet2.body, aspect.name),
          });
          break;
        }
      }
    }
  }

  return aspects.slice(0, 8); // Limit to most significant aspects
};

const getAspectMeaning = (
  planet1: string,
  planet2: string,
  aspect: string,
): string => {
  const meanings: Record<string, string> = {
    Conjunction: 'energies blend and amplify each other',
    Opposition: 'creates tension requiring balance and integration',
    Trine: 'harmonious flow of energy and natural talents',
    Square: 'dynamic tension that motivates growth and action',
    Sextile: 'supportive energy offering opportunities for development',
  };

  return `${planet1} and ${planet2} ${meanings[aspect] || 'interact significantly'}.`;
};

const getChartPatterns = (birthChart: BirthChartData[]): ChartPattern[] => {
  const patterns: ChartPattern[] = [];
  const allAspects = getPlanetaryAspects(birthChart);

  // Organize aspects by type
  const conjunctions = allAspects.filter((a) => a.aspect === 'Conjunction');
  const oppositions = allAspects.filter((a) => a.aspect === 'Opposition');
  const trines = allAspects.filter((a) => a.aspect === 'Trine');
  const squares = allAspects.filter((a) => a.aspect === 'Square');
  const sextiles = allAspects.filter((a) => a.aspect === 'Sextile');

  // Get all planets involved in aspects
  const allAspectPlanets = new Set(
    allAspects.flatMap((a) => [a.planet1, a.planet2]),
  );

  // 1. GRAND CROSS (4 planets, 2 oppositions, 4 squares)
  if (oppositions.length >= 2 && squares.length >= 4) {
    const oppositionPlanets = new Set(
      oppositions.flatMap((o) => [o.planet1, o.planet2]),
    );
    const squarePlanets = new Set(
      squares.flatMap((s) => [s.planet1, s.planet2]),
    );
    const crossPlanets = new Set(
      Array.from(oppositionPlanets).concat(Array.from(squarePlanets)),
    );

    if (crossPlanets.size >= 4) {
      patterns.push({
        name: 'Grand Cross',
        description:
          'Four planets forming two oppositions and four squares - ultimate challenge aspect',
        meaning:
          'Maximum tension and potential. Crisis-driven growth, enormous achievement capacity, but requires mastery of conflicting forces.',
      });
    }
  }

  // 2. GRAND TRINE (3 planets 120° apart)
  if (trines.length >= 3) {
    const trinePlanets = new Set(trines.flatMap((t) => [t.planet1, t.planet2]));
    if (trinePlanets.size >= 3) {
      // Determine element of grand trine
      const trinePlanetsArray = Array.from(trinePlanets);
      const trineElements = trinePlanetsArray.map((planet) =>
        getElementFromSign(
          birthChart.find((p) => p.body === planet)?.sign || '',
        ),
      );
      const dominantElement = trineElements[0];

      patterns.push({
        name: `Grand ${dominantElement} Trine`,
        description: 'Three planets forming harmonious 120° triangle of energy',
        meaning: `Natural ${dominantElement.toLowerCase()} talents flow effortlessly. Gifts may be taken for granted - conscious development needed for full potential.`,
      });
    }
  }

  // 3. T-SQUARE (Opposition + 2 squares)
  if (oppositions.length >= 1 && squares.length >= 2) {
    const oppositionPlanets = oppositions.flatMap((o) => [
      o.planet1,
      o.planet2,
    ]);
    const squarePlanets = squares.flatMap((s) => [s.planet1, s.planet2]);

    // Find focal planet (planet that squares both opposition planets)
    const focalPlanets = squarePlanets.filter((planet) =>
      oppositionPlanets.every((op) => squarePlanets.includes(op)),
    );

    if (focalPlanets.length > 0) {
      patterns.push({
        name: 'T-Square',
        description: `Opposition focused through ${focalPlanets[0]} as the outlet`,
        meaning:
          'Dynamic tension demands action. The focal planet becomes your primary tool for resolving inner conflicts and achieving success.',
      });
    }
  }

  // 4. YOD (Finger of God) - 2 quincunx + 1 sextile
  const quincunxes = getQuincunxAspects(birthChart);
  if (quincunxes.length >= 2 && sextiles.length >= 1) {
    // Find pairs of quincunxes that share one planet (the apex)
    let yodFound = false;
    let yodPattern: {
      apexPlanet: string;
      basePlanets: string[];
    } | null = null;

    for (let i = 0; i < quincunxes.length && !yodFound; i++) {
      for (let j = i + 1; j < quincunxes.length && !yodFound; j++) {
        const q1 = quincunxes[i];
        const q2 = quincunxes[j];

        // Check if these two quincunxes share a planet (the apex)
        let apexPlanet: string | null = null;
        let basePlanets: string[] = [];

        if (q1.planet1 === q2.planet1) {
          apexPlanet = q1.planet1;
          basePlanets = [q1.planet2, q2.planet2];
        } else if (q1.planet1 === q2.planet2) {
          apexPlanet = q1.planet1;
          basePlanets = [q1.planet2, q2.planet1];
        } else if (q1.planet2 === q2.planet1) {
          apexPlanet = q1.planet2;
          basePlanets = [q1.planet1, q2.planet2];
        } else if (q1.planet2 === q2.planet2) {
          apexPlanet = q1.planet2;
          basePlanets = [q1.planet1, q2.planet1];
        }

        if (
          apexPlanet &&
          basePlanets.length === 2 &&
          basePlanets[0] !== basePlanets[1]
        ) {
          yodPattern = { apexPlanet, basePlanets };
          yodFound = true;
          break;
        }
      }
      if (yodFound) break;
    }

    if (yodFound && yodPattern) {
      patterns.push({
        name: 'Yod (Finger of God)',
        description: `${yodPattern.basePlanets[0]} and ${yodPattern.basePlanets[1]} form quincunx aspects pointing to ${yodPattern.apexPlanet} - karmic configuration`,
        meaning: `Special mission or destiny. ${yodPattern.apexPlanet} (the apex planet) represents a unique gift that must be developed for spiritual growth. The quincunx aspects from ${yodPattern.basePlanets[0]} and ${yodPattern.basePlanets[1]} create tension that drives you toward developing ${yodPattern.apexPlanet}'s potential.`,
      });
    }
  }

  // 5. KITE (Grand Trine + Opposition)
  if (trines.length >= 3 && oppositions.length >= 1) {
    const trinePlanets = new Set(trines.flatMap((t) => [t.planet1, t.planet2]));
    const oppositionPlanets = new Set(
      oppositions.flatMap((o) => [o.planet1, o.planet2]),
    );

    const trinePlanetsArray = Array.from(trinePlanets);
    const kiteIntersection = trinePlanetsArray.filter((p) =>
      oppositionPlanets.has(p),
    );
    if (kiteIntersection.length >= 1) {
      patterns.push({
        name: 'Kite Pattern',
        description:
          'Grand Trine with one planet opposed, creating dynamic focus',
        meaning:
          'Transforms natural talents into concrete achievements. The opposition provides motivation to use your gifts productively.',
      });
    }
  }

  // 6. MYSTIC RECTANGLE (2 oppositions + 4 sextiles)
  if (oppositions.length >= 2 && sextiles.length >= 4) {
    patterns.push({
      name: 'Mystic Rectangle',
      description:
        'Two oppositions connected by four sextiles - stable yet dynamic',
      meaning:
        'Perfect balance of stability and growth. Challenges are met with supportive resources and practical solutions.',
    });
  }

  // 7. CRADLE (2 sextiles + 2 trines)
  if (sextiles.length >= 2 && trines.length >= 2) {
    patterns.push({
      name: 'Cradle Pattern',
      description: 'Harmonious configuration providing support and protection',
      meaning:
        'Natural safety net and support system. Talents are nurtured and protected, leading to gentle but steady growth.',
    });
  }

  // 8. GRAND CONJUNCTION (3+ planets within 10°)
  if (conjunctions.length >= 3) {
    const conjunctionPlanets = new Set(
      conjunctions.flatMap((c) => [c.planet1, c.planet2]),
    );
    if (conjunctionPlanets.size >= 3) {
      const conjunctionPlanetsArray = Array.from(conjunctionPlanets);
      const conjunctionSign =
        birthChart.find((p) => conjunctionPlanetsArray.includes(p.body))
          ?.sign || '';
      const conjunctionPlanetsList = conjunctionPlanetsArray.join(', ');

      // Get planet meanings for personalized description
      const planetMeanings: Record<string, string> = {
        Sun: 'core identity',
        Moon: 'emotions and instincts',
        Mercury: 'communication and thinking',
        Venus: 'love and values',
        Mars: 'action and drive',
        Jupiter: 'expansion and beliefs',
        Saturn: 'discipline and structure',
        Uranus: 'innovation and freedom',
        Neptune: 'dreams and spirituality',
        Pluto: 'transformation and power',
      };

      const planetDescriptions = conjunctionPlanetsArray
        .map((planet) => `${planet} (${planetMeanings[planet] || 'energy'})`)
        .join(', ');

      patterns.push({
        name: 'Grand Conjunction',
        description: `${conjunctionPlanetsArray.length} planets fused in ${conjunctionSign}: ${conjunctionPlanetsList}`,
        meaning: `Your ${planetDescriptions} are completely merged in ${conjunctionSign}, creating an extraordinary powerhouse of concentrated energy. These planetary functions work as one unified force, amplifying each other's effects. This gives you tremendous intensity and focus in ${conjunctionSign} themes, but you may struggle to separate these energies or see situations from other perspectives. You approach life through this singular ${conjunctionSign} lens with incredible power but potential blind spots.`,
      });
    }
  }

  // 10. CHART SHAPE PATTERNS
  const shapePattern = getChartShapePattern(birthChart);
  if (shapePattern) {
    patterns.push(shapePattern);
  }

  // 11. LOCOMOTIVE PATTERN
  const locomotivePattern = getLocomotivePattern(birthChart);
  if (locomotivePattern) {
    patterns.push(locomotivePattern);
  }

  // 12. BOWL PATTERN
  const bowlPattern = getBowlPattern(birthChart);
  if (bowlPattern) {
    patterns.push(bowlPattern);
  }

  // 13. SEESAW PATTERN (only if no other shape pattern detected)
  if (!shapePattern && !locomotivePattern && !bowlPattern) {
    const seesawPattern = getSeesawPattern(birthChart);
    if (seesawPattern) {
      patterns.push(seesawPattern);
    }
  }

  // 14. SPLASH PATTERN (only if no other shape pattern detected)
  if (!shapePattern && !locomotivePattern && !bowlPattern) {
    const splashPattern = getSplashPattern(birthChart);
    if (splashPattern) {
      patterns.push(splashPattern);
    }
  }

  // 15. SPLAY PATTERN (only if no other shape pattern detected)
  if (!shapePattern && !locomotivePattern && !bowlPattern) {
    const splayPattern = getSplayPattern(birthChart);
    if (splayPattern) {
      patterns.push(splayPattern);
    }
  }

  return patterns;
};

const getStelliums = (birthChart: BirthChartData[]): Stellium[] => {
  const stelliums: Stellium[] = [];

  // Group planets by sign
  const signGroups: Record<string, BirthChartData[]> = {};
  birthChart.forEach((planet) => {
    if (!signGroups[planet.sign]) signGroups[planet.sign] = [];
    signGroups[planet.sign].push(planet);
  });

  // Find stelliums (3+ planets in same sign)
  Object.entries(signGroups).forEach(([sign, planets]) => {
    if (planets.length >= 3) {
      stelliums.push({
        sign,
        planets: planets.sort(
          (a, b) => a.eclipticLongitude - b.eclipticLongitude,
        ),
        meaning: getStelliumMeaning(sign, planets.length),
      });
    }
  });

  return stelliums;
};

const getStelliumMeaning = (sign: string, count: number): string => {
  const signQualities: Record<string, string> = {
    Aries: 'pioneering, impulsive, direct',
    Taurus: 'steady, sensual, stubborn',
    Gemini: 'curious, adaptable, scattered',
    Cancer: 'nurturing, emotional, protective',
    Leo: 'confident, dramatic, generous',
    Virgo: 'practical, analytical, perfectionist',
    Libra: 'diplomatic, artistic, indecisive',
    Scorpio: 'intense, transformative, secretive',
    Sagittarius: 'adventurous, philosophical, blunt',
    Capricorn: 'ambitious, disciplined, traditional',
    Aquarius: 'innovative, detached, rebellious',
    Pisces: 'intuitive, compassionate, dreamy',
  };

  const quality = signQualities[sign] || sign;
  return `Intense focus on ${quality} themes. ${count} planets amplify ${sign} energy throughout your personality.`;
};

// Additional helper functions for expanded chart patterns
const getElementFromSign = (sign: string): string => {
  const elementMap: Record<string, string> = {
    Aries: 'Fire',
    Leo: 'Fire',
    Sagittarius: 'Fire',
    Taurus: 'Earth',
    Virgo: 'Earth',
    Capricorn: 'Earth',
    Gemini: 'Air',
    Libra: 'Air',
    Aquarius: 'Air',
    Cancer: 'Water',
    Scorpio: 'Water',
    Pisces: 'Water',
  };
  return elementMap[sign] || 'Unknown';
};

const getQuincunxAspects = (
  birthChart: BirthChartData[],
): PlanetaryAspect[] => {
  const quincunxes: PlanetaryAspect[] = [];

  // Check all planet pairs for 150° aspects (quincunx)
  for (let i = 0; i < birthChart.length; i++) {
    for (let j = i + 1; j < birthChart.length; j++) {
      const planet1 = birthChart[i];
      const planet2 = birthChart[j];

      let diff = Math.abs(
        planet1.eclipticLongitude - planet2.eclipticLongitude,
      );
      if (diff > 180) diff = 360 - diff;

      const orb = Math.abs(diff - 150);
      if (orb <= 3) {
        // Tight orb for quincunx
        quincunxes.push({
          planet1: planet1.body,
          planet2: planet2.body,
          aspectSymbol: '⚻',
          aspect: 'Quincunx',
          orb,
          meaning: `${planet1.body} and ${planet2.body} require constant adjustment and adaptation.`,
        });
      }
    }
  }

  return quincunxes;
};

const getChartShapePattern = (
  birthChart: BirthChartData[],
): ChartPattern | null => {
  const longitudes = birthChart
    .map((p) => p.eclipticLongitude)
    .sort((a, b) => a - b);
  const spans = [];

  for (let i = 0; i < longitudes.length - 1; i++) {
    spans.push(longitudes[i + 1] - longitudes[i]);
  }
  spans.push(360 + longitudes[0] - longitudes[longitudes.length - 1]);

  const maxSpan = Math.max(...spans);
  const minSpan = Math.min(...spans);

  // Bucket pattern - one large gap with planets clustered
  if (maxSpan > 120) {
    const gapIndex = spans.indexOf(maxSpan);
    const handlePlanet = birthChart[gapIndex] || birthChart[0];

    // Get specific meaning for the handle planet
    const planetPurposes: Record<string, string> = {
      Sun: 'authentic self-expression and leadership',
      Moon: 'emotional fulfillment and nurturing others',
      Mercury: 'communication, learning, and sharing knowledge',
      Venus: 'creating beauty, harmony, and meaningful relationships',
      Mars: 'taking action, pioneering, and achieving goals',
      Jupiter: 'expanding horizons, teaching, and inspiring growth',
      Saturn: 'building lasting structures and mastering discipline',
      Uranus: 'innovating, liberating, and revolutionizing systems',
      Neptune: 'inspiring through creativity, spirituality, and compassion',
      Pluto: 'transforming, healing, and wielding deep psychological power',
    };

    const handlePurpose =
      planetPurposes[handlePlanet.body] || 'expressing unique talents';

    return {
      name: 'Bucket Pattern',
      description: `Planets clustered with ${handlePlanet.body} in ${handlePlanet.sign} as the "handle"`,
      meaning: `Your life energy flows through ${handlePlanet.body} in ${handlePlanet.sign}, making ${handlePurpose} your primary vehicle for success. The clustered planets provide the resources, talents, and energy, while ${handlePlanet.body} serves as the focused outlet - your special mission in life. This handle planet shows exactly how you're meant to channel all your abilities into concrete achievements and make your unique mark on the world.`,
    };
  }

  // Bundle pattern - all planets within 120°
  if (maxSpan < 120) {
    return {
      name: 'Bundle Pattern',
      description: 'All planets concentrated within one-third of the chart',
      meaning:
        'Highly focused individual with specialized interests. Great depth but may lack perspective in other areas.',
    };
  }

  return null;
};

const getLocomotivePattern = (
  birthChart: BirthChartData[],
): ChartPattern | null => {
  const longitudes = birthChart
    .map((p) => p.eclipticLongitude)
    .sort((a, b) => a - b);
  const spans = [];

  for (let i = 0; i < longitudes.length - 1; i++) {
    spans.push(longitudes[i + 1] - longitudes[i]);
  }
  spans.push(360 + longitudes[0] - longitudes[longitudes.length - 1]);

  const maxSpan = Math.max(...spans);

  // Locomotive pattern - planets spread over 2/3 of chart with one big gap
  if (maxSpan > 60 && maxSpan < 120) {
    const leadingPlanetIndex = spans.indexOf(maxSpan);
    const leadingPlanet = birthChart[leadingPlanetIndex];

    return {
      name: 'Locomotive Pattern',
      description: `Planets distributed around 2/3 of chart, led by ${leadingPlanet.body}`,
      meaning:
        'Self-motivated achiever with strong drive. The leading planet shows your primary motivation and area of leadership.',
    };
  }

  return null;
};

const getBowlPattern = (birthChart: BirthChartData[]): ChartPattern | null => {
  const longitudes = birthChart
    .map((p) => p.eclipticLongitude)
    .sort((a, b) => a - b);
  const totalSpread = longitudes[longitudes.length - 1] - longitudes[0];

  // Bowl pattern - all planets within 180° (half the chart)
  if (totalSpread <= 180) {
    return {
      name: 'Bowl Pattern',
      description: 'All planets contained within one hemisphere of the chart',
      meaning:
        'Self-contained individual with a specific life theme. You have everything you need within yourself to achieve your goals.',
    };
  }

  return null;
};

const getSeesawPattern = (
  birthChart: BirthChartData[],
): ChartPattern | null => {
  if (birthChart.length < 8) return null; // Need at least 8 planets for seesaw

  const longitudes = birthChart
    .map((p) => p.eclipticLongitude)
    .sort((a, b) => a - b);

  // Calculate gaps between consecutive planets
  const spans = [];
  for (let i = 0; i < longitudes.length - 1; i++) {
    spans.push(longitudes[i + 1] - longitudes[i]);
  }
  spans.push(360 + longitudes[0] - longitudes[longitudes.length - 1]);

  // Find the largest gap (should be roughly 180° for seesaw)
  const maxSpan = Math.max(...spans);
  const maxSpanIndex = spans.indexOf(maxSpan);

  // Check if the gap is roughly 180° (allow 30° orb)
  if (maxSpan < 150 || maxSpan > 210) return null;

  // Split planets into two groups based on the largest gap
  const group1: BirthChartData[] = [];
  const group2: BirthChartData[] = [];

  for (let i = 0; i < birthChart.length; i++) {
    const planet = birthChart[i];
    const planetIndex = longitudes.indexOf(planet.eclipticLongitude);

    if (planetIndex <= maxSpanIndex) {
      group1.push(planet);
    } else {
      group2.push(planet);
    }
  }

  // Each group should have at least 4 planets
  if (group1.length >= 4 && group2.length >= 4) {
    // Check that there are no more than 2-3 planets in the gap area
    const gapPlanets = Math.min(group1.length, group2.length);
    if (gapPlanets <= 3) {
      return {
        name: 'Seesaw Pattern',
        description: `Planets divided into two opposing groups (${group1.length} and ${group2.length} planets)`,
        meaning:
          'Life is a constant balancing act between two opposing forces. You excel at diplomacy and seeing both sides of situations. Your challenge is integrating these polarities rather than swinging between extremes. This pattern gives you versatility but requires conscious choice-making.',
      };
    }
  }

  return null;
};

const getSplashPattern = (
  birthChart: BirthChartData[],
): ChartPattern | null => {
  if (birthChart.length < 7) return null; // Need at least 7 planets

  const longitudes = birthChart
    .map((p) => p.eclipticLongitude)
    .sort((a, b) => a - b);

  // Check distribution across signs
  const uniqueSigns = new Set(birthChart.map((p) => p.sign)).size;
  if (uniqueSigns < 8) return null; // Need planets in 8+ different signs

  // Calculate gaps between consecutive planets
  const spans = [];
  for (let i = 0; i < longitudes.length - 1; i++) {
    spans.push(longitudes[i + 1] - longitudes[i]);
  }
  spans.push(360 + longitudes[0] - longitudes[longitudes.length - 1]);

  // Check that no gap is larger than 60° (even distribution)
  const maxGap = Math.max(...spans);
  if (maxGap > 60) return null;

  // Check that gaps are relatively even (no huge variations)
  const avgGap = spans.reduce((a, b) => a + b, 0) / spans.length;
  const gapVariance =
    spans.reduce((sum, gap) => sum + Math.abs(gap - avgGap), 0) / spans.length;

  // If gaps are relatively even (low variance), it's a splash
  if (gapVariance < 25) {
    return {
      name: 'Splash Pattern',
      description: `Planets spread evenly across ${uniqueSigns} signs with no major gaps`,
      meaning:
        'Versatile and adaptable, you have interests and talents in many areas. You can relate to diverse perspectives and situations. The challenge is maintaining focus and depth rather than scattering your energy too widely. You thrive on variety and change.',
    };
  }

  return null;
};

const getSplayPattern = (birthChart: BirthChartData[]): ChartPattern | null => {
  if (birthChart.length < 5) return null; // Need at least 5 planets

  const longitudes = birthChart
    .map((p) => p.eclipticLongitude)
    .sort((a, b) => a - b);

  const totalSpread = longitudes[longitudes.length - 1] - longitudes[0];

  // Splay: planets spread across more than 180° but not evenly
  // Not a bundle (all within 120°), not a bowl (all within 180°)
  if (totalSpread <= 180) return null;

  // Check distribution - should be in different hemispheres
  const upperHemisphere = birthChart.filter(
    (p) => p.eclipticLongitude >= 0 && p.eclipticLongitude < 180,
  ).length;
  const lowerHemisphere = birthChart.filter(
    (p) => p.eclipticLongitude >= 180 && p.eclipticLongitude < 360,
  ).length;

  // Should have planets in both hemispheres
  if (upperHemisphere === 0 || lowerHemisphere === 0) return null;

  // Check for gaps - should have some clustering but not too much
  const spans = [];
  for (let i = 0; i < longitudes.length - 1; i++) {
    spans.push(longitudes[i + 1] - longitudes[i]);
  }
  spans.push(360 + longitudes[0] - longitudes[longitudes.length - 1]);

  const maxGap = Math.max(...spans);
  const minGap = Math.min(...spans);

  // Should have some variation in gaps (not evenly distributed like splash)
  // But not all clustered (max gap should be > 60°)
  if (maxGap > 60 && maxGap < 120 && minGap < 30) {
    const uniqueSigns = new Set(birthChart.map((p) => p.sign)).size;
    // Should be spread across multiple signs but not all signs (unlike splash)
    if (uniqueSigns >= 5 && uniqueSigns < 8) {
      return {
        name: 'Splay Pattern',
        description: `Planets spread across ${uniqueSigns} signs in different hemispheres with varied spacing`,
        meaning:
          'Independent and self-directed, you have multiple areas of focus that you pursue simultaneously. You resist being boxed into one category and prefer flexibility. Your energy flows in several directions, requiring good time management and prioritization skills.',
      };
    }
  }

  return null;
};

const BirthChartPage = () => {
  const { user, loading } = useUser();
  const subscription = useSubscription();
  const [hasMounted, setHasMounted] = useState(false);
  const [showAspects, setShowAspects] = useState(false);
  const [aspectFilter, setAspectFilter] = useState<
    'all' | 'harmonious' | 'challenging'
  >('all');
  const userName = user?.name;
  const userBirthday = user?.birthday;
  const originalBirthChartData = user?.birthChart || null;
  const birthChartData = useMemo(() => {
    if (!originalBirthChartData) return null;
    return ensureDescendantInChart(originalBirthChartData);
  }, [originalBirthChartData]);

  const hasChartAccess = hasBirthChartAccess(
    subscription.status,
    subscription.plan,
  );

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasChartAccess && user?.hasBirthChart && user?.id) {
      conversionTracking.birthChartViewed(user.id, subscription.plan);
    }
  }, [hasChartAccess, user?.hasBirthChart, user?.id, subscription.plan]);

  const shouldShowLoading = loading || !hasMounted;

  if (shouldShowLoading) {
    return (
      <div className='h-full flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4'></div>
          <p className='text-zinc-400'>Loading your birth chart...</p>
        </div>
      </div>
    );
  }

  // Check subscription access first
  if (!hasChartAccess) {
    return (
      <div className='h-full space-y-6 p-4 overflow-auto'>
        <div className='flex items-center justify-center min-h-[60vh]'>
          <div className='text-center max-w-lg px-4'>
            <h1 className='text-3xl font-bold text-white mb-6'>
              Your Birth Chart Awaits
            </h1>
            <div className='bg-gradient-to-r from-lunary-primary-900/30 to-lunary-rose-900/30 rounded-lg p-6 border border-lunary-primary-700 mb-6'>
              <p className='text-zinc-300 mb-4'>
                Sign up for a free account and unlock your complete cosmic
                blueprint with our comprehensive birth chart. We calculate 24+
                celestial bodies including all planets, asteroids, nodes, and
                sensitive points for the most detailed astrological analysis.
              </p>
              <ul className='text-sm text-zinc-400 space-y-2 mb-6 text-left'>
                <li className='flex items-start gap-2'>
                  <Sparkles className='w-4 h-4 mt-0.5 flex-shrink-0 text-lunary-primary' />
                  <span>
                    All 10 planets + 8 asteroids (Ceres, Pallas, Juno, Vesta,
                    Hygiea, Pholus, Psyche, Eros)
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <Moon className='w-4 h-4 mt-0.5 flex-shrink-0 text-lunary-secondary' />
                  <span>
                    Sun, Moon, Rising + Chiron, Lilith, North & South Nodes
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <Star className='w-4 h-4 mt-0.5 flex-shrink-0 text-lunary-accent' />
                  <span>Complete aspects, dignities, and pattern analysis</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Home className='w-4 h-4 mt-0.5 flex-shrink-0 text-lunary-highlight' />
                  <span>12 house placements with detailed interpretations</span>
                </li>
              </ul>
            </div>
            <SmartTrialButton feature='birth_chart' size='lg' />
          </div>
        </div>
        <UpgradePrompt
          variant='card'
          featureName='birth_chart'
          title='Unlock Your Complete Birth Chart'
          description='Get 24+ celestial bodies including all planets, 8 major asteroids, Chiron, Lilith, Nodes, houses, aspects, and personalized insights based on your exact birth time'
          className='max-w-2xl mx-auto'
        />
      </div>
    );
  }

  if (!userBirthday) {
    return (
      <div className='h-full flex items-center justify-center'>
        <div className='text-center max-w-md px-4'>
          <h1 className='text-2xl font-bold text-white mb-4'>
            Your Birth Chart
          </h1>
          <p className='text-zinc-300 mb-6'>
            To generate your personalized birth chart, you need to provide your
            birthday on your profile.
          </p>
          <Link
            href='/profile'
            className='inline-block bg-lunary-primary hover:bg-lunary-primary-400 text-white py-2 px-6 rounded-md transition-colors'
          >
            Complete Profile
          </Link>
        </div>
      </div>
    );
  }

  // Note: Even if birth chart exists, user still can't access it without subscription
  // This preserves data for users who had trial/paid but keeps paywall intact
  if (!user?.hasBirthChart || !birthChartData) {
    return (
      <div className='h-full flex items-center justify-center'>
        <div className='text-center max-w-md px-4'>
          <h1 className='text-2xl font-bold text-white mb-4'>
            Generating Birth Chart
          </h1>
          <p className='text-zinc-300 mb-6'>
            Your birth chart is being calculated based on your birthday. Please
            refresh the page in a moment.
          </p>
          <button
            onClick={() => window.location.reload()}
            className='inline-block bg-lunary-primary hover:bg-lunary-primary-400 text-white py-2 px-6 rounded-md transition-colors'
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full overflow-auto' data-testid='birth-chart-page'>
      <div className='flex w-full flex-col gap-4 max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto p-4 mb-16'>
        {/* Internal Links for SEO */}
        <nav className='p-4 bg-zinc-900/50 rounded-lg border border-zinc-800'>
          <p className='text-sm text-zinc-400 mb-3'>
            Learn more about your cosmic blueprint:
          </p>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/birth-chart'
              className='text-xs px-3 py-1.5 bg-lunary-primary-900/30 text-lunary-primary-300 border border-lunary-primary-700/50 rounded-full hover:bg-lunary-primary-900/50 transition-colors'
            >
              Birth Chart Guide
            </Link>
            <Link
              href='/grimoire/astronomy/planets'
              className='text-xs px-3 py-1.5 bg-lunary-accent-900/30 text-lunary-accent-300 border border-lunary-accent-700/50 rounded-full hover:bg-lunary-accent-900/50 transition-colors'
            >
              Planet Meanings
            </Link>
            <Link
              href='/grimoire/houses'
              className='text-xs px-3 py-1.5 bg-lunary-secondary-900/30 text-lunary-secondary-300 border border-lunary-secondary-700/50 rounded-full hover:bg-lunary-secondary-900/50 transition-colors'
            >
              The 12 Houses
            </Link>
            <Link
              href='/grimoire/zodiac'
              className='text-xs px-3 py-1.5 bg-lunary-rose-900/30 text-lunary-rose-300 border border-lunary-rose-700/50 rounded-full hover:bg-lunary-rose-900/50 transition-colors'
            >
              Zodiac Signs
            </Link>
            {birthChartData && (
              <div className='flex flex-col items-center gap-3'>
                <ShareBirthChart
                  birthChart={birthChartData}
                  userName={userName}
                  userBirthday={userBirthday}
                />
              </div>
            )}
          </div>
        </nav>

        <div className='flex flex-col items-center gap-3'>
          <div className='flex flex-col sm:flex-row gap-2 items-center'>
            <Button
              onClick={() => setShowAspects(!showAspects)}
              variant='lunary-soft'
              size='sm'
            >
              {showAspects ? 'Hide Aspects' : 'Show Aspects'}
            </Button>

            {showAspects && (
              <div className='flex gap-2 items-center'>
                <span className='text-xs text-zinc-500'>Filter:</span>
                <Button
                  onClick={() => setAspectFilter('all')}
                  variant={aspectFilter === 'all' ? 'lunary-soft' : 'ghost'}
                  size='xs'
                >
                  All
                </Button>
                <Button
                  onClick={() => setAspectFilter('harmonious')}
                  variant={
                    aspectFilter === 'harmonious' ? 'lunary-soft' : 'ghost'
                  }
                  size='xs'
                >
                  Harmonious
                </Button>
                <Button
                  onClick={() => setAspectFilter('challenging')}
                  variant={
                    aspectFilter === 'challenging' ? 'lunary-soft' : 'ghost'
                  }
                  size='xs'
                >
                  Challenging
                </Button>
              </div>
            )}
          </div>

          <div data-testid='chart-visualization'>
            <BirthChart
              birthChart={birthChartData}
              userName={userName}
              birthDate={userBirthday}
              showAspects={showAspects}
              aspectFilter={aspectFilter}
            />
          </div>
        </div>

        {birthChartData && (
          <div className='flex flex-col items-center gap-3'>
            <ShareBirthChart
              birthChart={birthChartData}
              userName={userName}
              userBirthday={userBirthday}
            />
          </div>
        )}

        {/* Planetary Interpretations - Stacked Sections */}
        {birthChartData && (
          <div className='flex flex-col gap-3' data-testid='planets-list'>
            {/* Big Three - Sun, Moon, Rising */}
            {(() => {
              const sun = birthChartData.find((p) => p.body === 'Sun');
              const moon = birthChartData.find((p) => p.body === 'Moon');
              const rising = birthChartData.find((p) => p.body === 'Ascendant');

              if (sun || moon || rising) {
                return (
                  <div className=''>
                    <CollapsibleSection
                      title='The Big Three'
                      defaultCollapsed={false}
                      persistState={true}
                    >
                      <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800'>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                          {sun && (
                            <div className='bg-zinc-900 rounded p-3'>
                              <div className='flex items-center gap-2 mb-1'>
                                <span className='font-astro text-lg'>
                                  {bodiesSymbols.sun}
                                </span>
                                <span className='text-sm font-medium text-white'>
                                  Sun in {sun.sign}
                                </span>
                              </div>
                              <p className='text-xs text-zinc-300'>
                                Your core identity and life purpose. This is who
                                you are at your essence.
                              </p>
                            </div>
                          )}
                          {moon && (
                            <div className='bg-zinc-900 rounded p-3'>
                              <div className='flex items-center gap-2 mb-1'>
                                <span className='font-astro text-lg'>
                                  {bodiesSymbols.moon}
                                </span>
                                <span className='text-sm font-medium text-white'>
                                  Moon in {moon.sign}
                                </span>
                              </div>
                              <p className='text-xs text-zinc-300'>
                                Your emotional nature and inner needs. This is
                                how you feel and what you need to feel secure.
                              </p>
                            </div>
                          )}
                          {rising && (
                            <div className='bg-zinc-900 rounded p-3'>
                              <div className='flex items-center gap-2 mb-1'>
                                <span className='text-lg font-astro text-lunary-accent'>
                                  {astroPointSymbols.ascendant}
                                </span>
                                <span className='text-sm font-medium text-white'>
                                  {rising.sign} Rising
                                </span>
                                <span className='text-sm font-astro text-zinc-400'>
                                  {
                                    zodiacSymbol[
                                      rising.sign.toLowerCase() as keyof typeof zodiacSymbol
                                    ]
                                  }
                                </span>
                              </div>
                              <p className='text-xs text-zinc-300'>
                                Your outer personality and how others see you.
                                This is your mask and first impression.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CollapsibleSection>
                  </div>
                );
              }
              return null;
            })()}

            {/* Quick Chart Summary */}
            {(() => {
              const elements = getElementCounts(birthChartData);
              const modalities = getModalityCounts(birthChartData);
              const mostAspectedPlanet = getMostAspectedPlanet(birthChartData);

              const dominantElement = elements.reduce((a, b) =>
                a.count > b.count ? a : b,
              );
              const dominantModality = modalities.reduce((a, b) =>
                a.count > b.count ? a : b,
              );

              return (
                <div className=''>
                  <CollapsibleSection
                    title='Chart Summary'
                    defaultCollapsed={false}
                    persistState={true}
                  >
                    <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800'>
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                        {/* Dominant Element */}
                        <div className='bg-zinc-900 rounded-lg p-3'>
                          <div className='flex items-center gap-2 mb-2'>
                            <span className='font-astro text-lg'>
                              {dominantElement.symbol}
                            </span>
                            <span className='text-sm font-medium text-white'>
                              {dominantElement.name} Dominant
                            </span>
                          </div>
                          <p className='text-xs text-zinc-300'>
                            {dominantElement.count} planet
                            {dominantElement.count !== 1 ? 's' : ''} in{' '}
                            {dominantElement.name} signs. You express yourself
                            through {getElementMeaning(dominantElement.name)}{' '}
                            energy.
                          </p>
                        </div>

                        {/* Dominant Modality */}
                        <div className='bg-zinc-900 rounded-lg p-3'>
                          <div className='flex items-center gap-2 mb-2'>
                            <span className='font-astro text-lg'>
                              {getModalitySymbol(dominantModality.name)}
                            </span>
                            <span className='text-sm font-medium text-white'>
                              {dominantModality.name} Mode
                            </span>
                          </div>
                          <p className='text-xs text-zinc-300'>
                            {dominantModality.count} planet
                            {dominantModality.count !== 1 ? 's' : ''} in{' '}
                            {dominantModality.name} signs. You approach life
                            through{' '}
                            {dominantModality.name === 'Cardinal'
                              ? 'initiative and leadership'
                              : dominantModality.name === 'Fixed'
                                ? 'stability and persistence'
                                : 'adaptability and change'}
                            .
                          </p>
                        </div>

                        {/* Most Aspected Planet */}
                        <div className='bg-zinc-900 rounded-lg p-3'>
                          <div className='flex items-center gap-2 mb-2'>
                            <span className='font-astro text-lg'>
                              {
                                bodiesSymbols[
                                  mostAspectedPlanet.toLowerCase() as keyof typeof bodiesSymbols
                                ]
                              }
                            </span>
                            <span className='text-sm font-medium text-white'>
                              {mostAspectedPlanet} Focal Point
                            </span>
                          </div>
                          <p className='text-xs text-zinc-300'>
                            Your most aspected planet. This is a major driving
                            force in your chart, connecting multiple energies
                            and themes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CollapsibleSection>
                </div>
              );
            })()}

            {/* Chart Ruler Section */}
            {(() => {
              const rising = birthChartData.find((p) => p.body === 'Ascendant');

              if (rising) {
                const chartRulerName = getChartRuler(rising.sign);
                const chartRuler = birthChartData.find(
                  (p) => p.body === chartRulerName,
                );

                if (chartRuler) {
                  // Get house placement if available
                  const houses = calculateWholeSigHouses(birthChartData);
                  const houseNum = houses?.findIndex(
                    (h) => h.sign === chartRuler.sign,
                  );
                  const housePlacement =
                    houseNum !== undefined && houseNum >= 0
                      ? `${houseNum + 1}${getOrdinalSuffix(houseNum + 1)} House`
                      : '';

                  // Get key aspects to chart ruler
                  const rulerAspects = getPlanetaryAspects(birthChartData)
                    .filter(
                      (a) =>
                        a.planet1 === chartRulerName ||
                        a.planet2 === chartRulerName,
                    )
                    .slice(0, 3); // Top 3 aspects

                  return (
                    <div className=''>
                      <CollapsibleSection
                        title='Chart Ruler'
                        defaultCollapsed={false}
                        persistState={true}
                      >
                        <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800'>
                          <div className='mb-3'>
                            <div className='flex items-center gap-2 mb-2'>
                              <span className='font-astro text-xl'>
                                {
                                  bodiesSymbols[
                                    chartRulerName.toLowerCase() as keyof typeof bodiesSymbols
                                  ]
                                }
                              </span>
                              <span className='text-base font-medium text-white'>
                                {chartRulerName} rules your chart
                              </span>
                            </div>
                            <p className='text-sm text-zinc-300 mb-3'>
                              As the ruler of your {rising.sign} Ascendant,{' '}
                              {chartRulerName} is the most important planet in
                              your chart. Its placement shows how you express
                              your Ascendant's energy and where you direct your
                              life force.
                            </p>
                          </div>

                          <div className='bg-zinc-900 rounded-lg p-3 mb-3'>
                            <div className='text-sm font-medium text-white mb-3'>
                              Chart Ruler Placement
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                              <div className='text-center'>
                                <div className='text-xs text-zinc-400 mb-1'>
                                  Sign
                                </div>
                                <div className='text-sm text-white flex items-center justify-center gap-1.5'>
                                  {chartRuler.sign}
                                  <span className='font-astro text-base text-zinc-500'>
                                    {
                                      zodiacSymbol[
                                        chartRuler.sign.toLowerCase() as keyof typeof zodiacSymbol
                                      ]
                                    }
                                  </span>
                                </div>
                              </div>
                              <div className='text-center'>
                                <div className='text-xs text-zinc-400 mb-1'>
                                  Position
                                </div>
                                <div className='text-sm text-white flex items-center justify-center gap-1.5'>
                                  {chartRuler.degree}°{chartRuler.minute}'
                                  {chartRuler.retrograde && (
                                    <span className='text-xs text-orange-400'>
                                      ℞
                                    </span>
                                  )}
                                </div>
                              </div>
                              {housePlacement && (
                                <div className='text-center'>
                                  <div className='text-xs text-zinc-400 mb-1'>
                                    House
                                  </div>
                                  <div className='text-sm text-white'>
                                    {housePlacement}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {rulerAspects.length > 0 && (
                            <div className='bg-zinc-900 rounded-lg p-3'>
                              <div className='text-sm font-medium text-white mb-2'>
                                Key Aspects to Chart Ruler
                              </div>
                              <div className='space-y-1.5'>
                                {rulerAspects.map((aspect, idx) => (
                                  <div
                                    key={idx}
                                    className='flex items-center gap-2 text-xs'
                                  >
                                    <span className='font-astro text-sm text-lunary-accent'>
                                      {aspect.aspectSymbol}
                                    </span>
                                    <span className='text-zinc-300'>
                                      {aspect.planet1 === chartRulerName
                                        ? aspect.planet2
                                        : aspect.planet1}
                                    </span>
                                    <span className='text-zinc-500'>
                                      ({aspect.orb}° orb)
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CollapsibleSection>
                    </div>
                  );
                }
              }
              return null;
            })()}

            {/* Houses Section */}
            {(() => {
              const houses = calculateWholeSigHouses(birthChartData);
              if (!houses) {
                return (
                  <div className='' data-testid='houses-list'>
                    <CollapsibleSection
                      title='Houses'
                      defaultCollapsed={true}
                      persistState={true}
                    >
                      <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800'>
                        <p className='text-xs text-zinc-400'>
                          Add your birth time to see accurate house placements.
                        </p>
                      </div>
                    </CollapsibleSection>
                  </div>
                );
              }

              return (
                <div className='' data-testid='houses-list'>
                  <CollapsibleSection
                    title='Your 12 Houses'
                    defaultCollapsed={true}
                    persistState={true}
                  >
                    <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800'>
                      <div className='grid grid-cols-2 gap-2'>
                        {houses.map(({ house, sign, planets }) => {
                          const houseInfo = houseThemes[house];
                          return (
                            <div
                              key={house}
                              className={`rounded p-2 ${
                                planets.length > 0
                                  ? 'bg-lunary-highlight-950 border border-lunary-highlight-700/30'
                                  : 'bg-zinc-900'
                              }`}
                            >
                              <div className='flex items-center justify-between mb-1'>
                                <span className='text-xs font-medium text-zinc-300'>
                                  {house}
                                  {house === 1
                                    ? 'st'
                                    : house === 2
                                      ? 'nd'
                                      : house === 3
                                        ? 'rd'
                                        : 'th'}
                                </span>
                                <span className='text-xs font-astro text-lunary-accent'>
                                  {
                                    zodiacSymbol[
                                      sign.toLowerCase() as keyof typeof zodiacSymbol
                                    ]
                                  }
                                </span>
                              </div>
                              <div className='text-xs text-zinc-400 mb-1 flex items-center gap-1.5'>
                                <span>{sign}</span>
                                <span className='font-astro text-base text-zinc-500'>
                                  {
                                    zodiacSymbol[
                                      sign.toLowerCase() as keyof typeof zodiacSymbol
                                    ]
                                  }
                                </span>
                              </div>
                              {planets.length > 0 && (
                                <div className='flex flex-wrap gap-1 mt-1'>
                                  {planets.map((p) => {
                                    const symbolKey = p.body
                                      .toLowerCase()
                                      .replace(
                                        /\s+/g,
                                        '',
                                      ) as keyof typeof bodiesSymbols;
                                    const symbol =
                                      bodiesSymbols[symbolKey] ||
                                      astroPointSymbols[
                                        symbolKey as keyof typeof astroPointSymbols
                                      ] ||
                                      '';
                                    // Use font-astro only for single ASCII characters (Astronomicon)
                                    const isAstronomiconChar =
                                      symbol.length === 1 &&
                                      symbol.charCodeAt(0) < 128;
                                    return (
                                      <span
                                        key={p.body}
                                        className={`text-sm text-lunary-highlight-300 ${isAstronomiconChar ? 'font-astro' : ''}`}
                                        title={p.body}
                                      >
                                        {symbol}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                              <div className='text-[10px] text-zinc-400 mt-1'>
                                {houseInfo?.theme}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CollapsibleSection>
                </div>
              );
            })()}

            {/* Personal Planets */}
            <PersonalPlanetsSection
              birthChartData={birthChartData}
              getPlanetaryInterpretation={getPlanetaryInterpretation}
              getPlanetDignityStatus={getPlanetDignityStatus}
            />

            {/* Social Planets */}
            <SocialPlanetsSection
              birthChartData={birthChartData}
              getPlanetaryInterpretation={getPlanetaryInterpretation}
              getPlanetDignityStatus={getPlanetDignityStatus}
            />

            {/* Generational Planets */}
            <GenerationalPlanetsSection
              birthChartData={birthChartData}
              getPlanetaryInterpretation={getPlanetaryInterpretation}
              getPlanetDignityStatus={getPlanetDignityStatus}
            />

            {/* Asteroids */}
            <AsteroidsSection birthChartData={birthChartData} />

            {/* Sensitive Points */}
            <SensitivePointsSection birthChartData={birthChartData} />

            {/* Houses */}
            {(() => {
              const planetsWithHouses = birthChartData.filter((p) => p.house);
              if (planetsWithHouses.length === 0) return null;

              const houseGroups: Record<number, BirthChartData[]> = {};
              planetsWithHouses.forEach((planet) => {
                if (planet.house) {
                  if (!houseGroups[planet.house])
                    houseGroups[planet.house] = [];
                  houseGroups[planet.house].push(planet);
                }
              });

              return (
                <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800 '>
                  <h4 className='text-xs font-medium text-lunary-secondary mb-2 uppercase tracking-wide'>
                    Houses
                  </h4>
                  <div className='space-y-2'>
                    {Object.entries(houseGroups)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([houseNum, planets]) => {
                        const houseInfo = houseThemes[Number(houseNum)];
                        return (
                          <div
                            key={houseNum}
                            className='bg-zinc-900 rounded p-3'
                          >
                            <div className='flex items-center justify-between mb-1'>
                              <h5 className='text-sm font-medium text-white'>
                                House {houseNum}: {houseInfo?.theme}
                              </h5>
                              <div className='flex gap-1'>
                                {planets.map((p) => (
                                  <span
                                    key={p.body}
                                    className='font-astro text-lunary-secondary'
                                  >
                                    {
                                      bodiesSymbols[
                                        p.body.toLowerCase() as keyof typeof bodiesSymbols
                                      ]
                                    }
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className='text-xs text-zinc-400'>
                              {planets.map((p) => p.body).join(', ')} in the
                              house of{' '}
                              {houseInfo?.keywords.slice(0, 2).join(' & ')}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })()}

            {/* Chart Analysis */}
            {getChartAnalysis(birthChartData).length > 0 && (
              <div className=''>
                <CollapsibleSection
                  title='Chart Analysis'
                  defaultCollapsed={true}
                  persistState={true}
                >
                  <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800'>
                    <div className='space-y-3'>
                      {getChartAnalysis(birthChartData).map(
                        (analysis, index) => (
                          <div key={index} className='bg-zinc-900 rounded p-3'>
                            <h5 className='text-xs font-medium text-lunary-secondary-300 mb-1'>
                              {analysis.category}
                            </h5>
                            <p className='text-xs text-zinc-300'>
                              {analysis.insight}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </CollapsibleSection>
              </div>
            )}

            {/* Element & Modality Breakdown */}
            <div className=''>
              <CollapsibleSection
                title='Elemental & Modal Balance'
                defaultCollapsed={true}
                persistState={true}
              >
                <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800'>
                  <div className='grid grid-cols-2 gap-3'>
                    {/* Elements */}
                    <div>
                      <h5 className='text-xs font-medium text-lunary-rose-300 mb-2'>
                        Elements
                      </h5>
                      <div className='space-y-1'>
                        {getElementModality(birthChartData).elements.map(
                          (element) => (
                            <div
                              key={element.name}
                              className='bg-zinc-900 rounded p-2'
                            >
                              <div className='flex items-center justify-between mb-1'>
                                <div className='flex items-center gap-2'>
                                  <span className='text-sm font-astro'>
                                    {element.symbol}
                                  </span>
                                  <span className='text-xs text-zinc-300'>
                                    {element.name}
                                  </span>
                                </div>
                                <span className='text-xs text-lunary-rose-300'>
                                  {element.count}
                                </span>
                              </div>
                              {element.count > 0 && (
                                <div className='flex flex-wrap gap-1'>
                                  {(element as any).planets?.map(
                                    (planet: BirthChartData) => {
                                      const symbolKey = planet.body
                                        .toLowerCase()
                                        .replace(
                                          /\s+/g,
                                          '',
                                        ) as keyof typeof bodiesSymbols;
                                      const symbol =
                                        bodiesSymbols[symbolKey] ||
                                        astroPointSymbols[
                                          symbolKey as keyof typeof astroPointSymbols
                                        ] ||
                                        '';
                                      // Use font-astro only for single ASCII characters (Astronomicon)
                                      // Unicode symbols should render with default font
                                      const isAstronomiconChar =
                                        symbol.length === 1 &&
                                        symbol.charCodeAt(0) < 128;
                                      return (
                                        <span
                                          key={planet.body}
                                          className={`text-xs bg-zinc-800 px-1 rounded ${isAstronomiconChar ? 'font-astro' : ''}`}
                                          title={`${planet.body}: ${planet.degree}°${planet.minute}' ${planet.sign}`}
                                        >
                                          {symbol}
                                        </span>
                                      );
                                    },
                                  )}
                                </div>
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Modalities */}
                    <div>
                      <h5 className='text-xs font-medium text-lunary-rose-300 mb-2'>
                        Modalities
                      </h5>
                      <div className='space-y-1'>
                        {getElementModality(birthChartData).modalities.map(
                          (modality) => (
                            <div
                              key={modality.name}
                              className='bg-zinc-900 rounded p-2'
                            >
                              <div className='flex items-center justify-between mb-1'>
                                <div className='flex items-center gap-2'>
                                  <span className='text-sm font-astro'>
                                    {getModalitySymbol(modality.name)}
                                  </span>
                                  <span className='text-xs text-zinc-300'>
                                    {modality.name}
                                  </span>
                                </div>
                                <span className='text-xs text-lunary-rose-300'>
                                  {modality.count}
                                </span>
                              </div>
                              {modality.count > 0 && (
                                <div className='space-y-1'>
                                  <div className='flex flex-wrap gap-1'>
                                    {(modality as any).planets?.map(
                                      (planet: BirthChartData) => {
                                        const symbolKey = planet.body
                                          .toLowerCase()
                                          .replace(
                                            /\s+/g,
                                            '',
                                          ) as keyof typeof bodiesSymbols;
                                        const symbol =
                                          bodiesSymbols[symbolKey] ||
                                          astroPointSymbols[
                                            symbolKey as keyof typeof astroPointSymbols
                                          ] ||
                                          '';
                                        // Use font-astro only for single ASCII characters (Astronomicon)
                                        // Unicode symbols should render with default font
                                        const isAstronomiconChar =
                                          symbol.length === 1 &&
                                          symbol.charCodeAt(0) < 128;
                                        return (
                                          <span
                                            key={planet.body}
                                            className={`text-xs bg-zinc-800 px-1 rounded ${isAstronomiconChar ? 'font-astro' : ''}`}
                                            title={`${planet.body}: ${planet.degree}°${planet.minute}' ${planet.sign}`}
                                          >
                                            {symbol}
                                          </span>
                                        );
                                      },
                                    )}
                                  </div>
                                  <p className='text-xs text-zinc-400 mt-1'>
                                    {getModalityMeaning(
                                      modality.name,
                                      (modality as any).planets || [],
                                    )}
                                  </p>
                                </div>
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>
            </div>

            {/* Planetary Aspects */}
            {getPlanetaryAspects(birthChartData).length > 0 && (
              <div className='' data-testid='aspects-list'>
                <CollapsibleSection
                  title='Major Aspects'
                  defaultCollapsed={true}
                  persistState={true}
                >
                  <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800'>
                    <div className='space-y-2'>
                      {getPlanetaryAspects(birthChartData).map(
                        (aspect, index) => (
                          <div
                            key={index}
                            className='border-l-2 border-lunary-primary pl-3'
                          >
                            <h5 className='text-xs font-medium text-lunary-primary-300'>
                              {aspect.planet1} {aspect.aspectSymbol}{' '}
                              {aspect.planet2}
                            </h5>
                            <p className='text-xs text-zinc-300'>
                              {aspect.meaning}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </CollapsibleSection>
              </div>
            )}

            {/* Chart Patterns */}
            {getChartPatterns(birthChartData).length > 0 && (
              <div className=''>
                <CollapsibleSection
                  title='Chart Patterns'
                  defaultCollapsed={true}
                  persistState={true}
                >
                  <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800'>
                    <div className='space-y-2'>
                      {getChartPatterns(birthChartData).map(
                        (pattern, index) => (
                          <div key={index} className='bg-zinc-900 rounded p-3'>
                            <h5 className='text-xs font-medium text-lunary-success-300 mb-1'>
                              {pattern.name}
                            </h5>
                            <p className='text-xs text-zinc-300'>
                              {pattern.description}
                            </p>
                            <p className='text-xs text-lunary-success-200 mt-1'>
                              {pattern.meaning}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </CollapsibleSection>
              </div>
            )}

            {/* Stelliums */}
            {getStelliums(birthChartData).length > 0 && (
              <div className=''>
                <CollapsibleSection
                  title='Stelliums & Concentrations'
                  defaultCollapsed={true}
                  persistState={true}
                >
                  <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800'>
                    <div className='space-y-2'>
                      {getStelliums(birthChartData).map((stellium, index) => (
                        <div
                          key={index}
                          className='border-l-2 border-lunary-highlight pl-3'
                        >
                          <h5 className='text-xs font-medium text-lunary-highlight-300'>
                            {stellium.sign} Stellium ({stellium.planets.length}{' '}
                            planets)
                          </h5>
                          <p className='text-xs text-zinc-400 mb-1'>
                            {stellium.planets
                              .map((p) => `${p.body} (${p.degree}°)`)
                              .join(', ')}
                          </p>
                          <p className='text-xs text-zinc-300'>
                            {stellium.meaning}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleSection>
              </div>
            )}

            {/* Planetary Dignities & Debilities */}
            {getPlanetaryDignities(birthChartData).length > 0 && (
              <div className=''>
                <CollapsibleSection
                  title='Planetary Strength'
                  defaultCollapsed={true}
                  persistState={true}
                >
                  <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800'>
                    <div className='space-y-3'>
                      {getPlanetaryDignities(birthChartData).map(
                        (dignity, index) => {
                          // Determine styling based on specific dignity type
                          const dignityStyles = {
                            'in Rulership': {
                              borderColor: 'border-green-500',
                              badgeColor:
                                'bg-green-500/20 text-green-300 border-green-500/40',
                              icon: '✦',
                            },
                            'in Exaltation': {
                              borderColor: 'border-amber-500',
                              badgeColor:
                                'bg-amber-500/20 text-amber-300 border-amber-500/40',
                              icon: '★',
                            },
                            'in Detriment': {
                              borderColor: 'border-orange-500',
                              badgeColor:
                                'bg-orange-500/20 text-orange-300 border-orange-500/40',
                              icon: '⚠',
                            },
                            'in Fall': {
                              borderColor: 'border-red-500',
                              badgeColor:
                                'bg-red-500/20 text-red-300 border-red-500/40',
                              icon: '▼',
                            },
                          };

                          const style =
                            dignityStyles[
                              dignity.type as keyof typeof dignityStyles
                            ];
                          const borderColor =
                            style?.borderColor || 'border-lunary-rose';
                          const badgeColor =
                            style?.badgeColor ||
                            'bg-lunary-rose/20 text-lunary-rose-300 border-lunary-rose/30';
                          const badgeIcon = style?.icon || '◆';

                          return (
                            <div
                              key={index}
                              className={`border-l-2 ${borderColor} pl-3 bg-zinc-900/30 rounded-r p-2`}
                            >
                              <div className='flex items-center gap-2 mb-1.5'>
                                <span className='font-astro text-sm'>
                                  {
                                    bodiesSymbols[
                                      dignity.planet.toLowerCase() as keyof typeof bodiesSymbols
                                    ]
                                  }
                                </span>
                                <h5 className='text-sm font-medium text-white'>
                                  {dignity.planet}
                                </h5>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded border ${badgeColor} flex items-center gap-1`}
                                >
                                  <span className='text-xs'>{badgeIcon}</span>
                                  {dignity.type}
                                </span>
                              </div>
                              <p className='text-xs text-zinc-300 leading-relaxed'>
                                {dignity.meaning}
                              </p>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                </CollapsibleSection>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BirthChartPage;
