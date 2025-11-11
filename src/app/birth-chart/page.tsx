'use client';

import { useAccount } from 'jazz-tools/react';
import { SmartTrialButton } from '@/components/SmartTrialButton';
import {
  getBirthChartFromProfile,
  hasBirthChart,
  BirthChartData,
} from '../../../utils/astrology/birthChart';
import { BirthChart } from '@/components/BirthChart';
import { bodiesSymbols } from '../../../utils/zodiac/zodiac';
import { useSubscription } from '../../hooks/useSubscription';
import { hasBirthChartAccess } from '../../../utils/pricing';
import Link from 'next/link';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { TrialReminder } from '@/components/TrialReminder';
import { FeatureGate } from '@/components/FeatureGate';
import { conversionTracking } from '@/lib/analytics';
import { useEffect } from 'react';

// Function to generate concise planetary interpretations
const getPlanetaryInterpretation = (planet: BirthChartData): string => {
  const planetMeanings: Record<string, string> = {
    Sun: 'Your core identity and life purpose',
    Moon: 'Your emotional nature and instinctive reactions',
    Mercury: 'How you think and communicate',
    Venus: 'Your approach to love and what you value',
    Mars: 'Your drive, anger, and how you take action',
    Jupiter: 'Your beliefs, growth, and luck',
    Saturn: 'Your discipline, restrictions, and life lessons',
    Uranus: 'Your need for freedom and innovation',
    Neptune: 'Your dreams, illusions, and spirituality',
    Pluto: 'Your power, transformation, and hidden depths',
  };

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

  const planetMeaning = planetMeanings[planet.body] || `Your ${planet.body}`;
  const signQuality = signQualities[planet.sign] || planet.sign;
  const retrogradeNote = planet.retrograde
    ? ' Retrograde brings internal focus and deeper mastery.'
    : '';

  return `${planetMeaning} expresses through ${signQuality} energy.${retrogradeNote}`;
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
    Fire: '🔥',
    Earth: '🌍',
    Air: '💨',
    Water: '🌊',
  };

  return Object.entries(elementGroups).map(([name, planets]) => ({
    name,
    count: planets.length,
    symbol: symbols[name],
    planets: planets,
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
  });

  return dignities;
};

const getModalitySymbol = (modality: string): string => {
  const symbols: Record<string, string> = {
    Cardinal: '⚡',
    Fixed: '🔒',
    Mutable: '🔄',
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
    const yodPlanets = new Set(
      quincunxes.flatMap((q) => [q.planet1, q.planet2]),
    );
    if (yodPlanets.size >= 3) {
      patterns.push({
        name: 'Yod (Finger of God)',
        description:
          'Two quincunx aspects pointing to one planet - karmic configuration',
        meaning:
          'Special mission or destiny. The apex planet represents a unique gift that must be developed for spiritual growth.',
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

  // 8. STELLIUM PATTERN (3+ planets within 8° in same sign)
  const stelliumSigns = getStelliums(birthChart);
  if (stelliumSigns.length > 0) {
    stelliumSigns.forEach((stellium) => {
      patterns.push({
        name: `${stellium.sign} Stellium`,
        description: `${stellium.planets.length} planets concentrated in ${stellium.sign}`,
        meaning: `Intense focus on ${stellium.sign} themes dominates your personality and life direction.`,
      });
    });
  }

  // 9. GRAND CONJUNCTION (3+ planets within 10°)
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

const BirthChartPage = () => {
  const { me } = useAccount();
  const subscription = useSubscription();
  const userName = (me?.profile as any)?.name;
  const userBirthday = (me?.profile as any)?.birthday;

  const hasChartAccess = hasBirthChartAccess(subscription.status);

  useEffect(() => {
    if (hasChartAccess && hasBirthChart(me?.profile)) {
      const userId = (me as any)?.id;
      if (userId) {
        conversionTracking.birthChartViewed(userId);
      }
    }
  }, [hasChartAccess, me?.profile, me]);

  if (!me) {
    return (
      <div className='h-[91vh] flex items-center justify-center'>
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
      <div className='min-h-screen space-y-6 pb-20 px-4'>
        <TrialReminder variant='banner' />
        <div className='flex items-center justify-center min-h-[60vh]'>
          <div className='text-center max-w-lg px-4'>
            <h1 className='text-3xl font-bold text-white mb-6'>
              🌟 Your Birth Chart Awaits
            </h1>
            <div className='bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-6 border border-purple-500/30 mb-6'>
              <p className='text-zinc-300 mb-4'>
                Unlock your complete cosmic blueprint with a detailed birth
                chart analysis. Discover your planetary positions, aspects, and
                the deeper meaning behind your astrological profile.
              </p>
              <ul className='text-sm text-zinc-400 space-y-2 mb-6 text-left'>
                <li>✨ Complete planetary positions at your birth</li>
                <li>🌙 Sun, Moon, and Rising sign analysis</li>
                <li>⭐ Cosmic aspects and their interpretations</li>
                <li>🎯 Personality insights and guidance</li>
              </ul>
            </div>
            <SmartTrialButton size='lg' />
          </div>
        </div>
        <UpgradePrompt
          variant='card'
          featureName='birth_chart'
          title='Unlock Your Complete Birth Chart'
          description='Get detailed planetary positions, aspects, and cosmic patterns unique to your birth time'
          className='max-w-2xl mx-auto'
        />
      </div>
    );
  }

  if (!userBirthday) {
    return (
      <div className='h-[91vh] flex items-center justify-center'>
        <div className='text-center max-w-md px-4'>
          <h1 className='text-2xl font-bold text-white mb-4'>
            Your Birth Chart
          </h1>
          <p className='text-zinc-300 mb-6'>
            To generate your personalized birth chart, you need to provide your
            birthday in your profile.
          </p>
          <Link
            href='/profile'
            className='inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition-colors'
          >
            Complete Profile
          </Link>
        </div>
      </div>
    );
  }

  // Check if user has birth chart data (but they still need subscription to view it)
  const hasBirthChartData = hasBirthChart(me.profile);
  const birthChartData = hasBirthChartData
    ? getBirthChartFromProfile(me.profile)
    : null;

  // Note: Even if birth chart exists, user still can't access it without subscription
  // This preserves data for users who had trial/paid but keeps paywall intact
  if (!hasBirthChartData || !birthChartData) {
    return (
      <div className='h-[91vh] flex items-center justify-center'>
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
            className='inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition-colors'
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='h-[91vh] space-y-6 pb-4 overflow-auto'>
      <TrialReminder variant='banner' />
      <BirthChart
        birthChart={birthChartData}
        userName={userName}
        birthDate={userBirthday}
      />

      {/* Planetary Interpretations */}
      {birthChartData && (
        <div className='bg-zinc-800 rounded-lg p-4 max-w-md mx-auto'>
          <h3 className='text-lg font-semibold text-green-400 mb-3'>
            Your Cosmic Blueprint
          </h3>
          <div className='space-y-4'>
            {/* Personal Planets */}
            <div>
              <h4 className='text-xs font-medium text-blue-400 mb-2 uppercase tracking-wide'>
                Personal Planets
              </h4>
              <div className='space-y-2'>
                {birthChartData
                  .filter((planet) =>
                    ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'].includes(
                      planet.body,
                    ),
                  )
                  .map((planet) => {
                    const interpretation = getPlanetaryInterpretation(planet);
                    return (
                      <div
                        key={planet.body}
                        className='border-l-2 border-blue-400 pl-3'
                      >
                        <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                          <span className='text-lg'>
                            {
                              bodiesSymbols[
                                planet.body.toLowerCase() as keyof typeof bodiesSymbols
                              ]
                            }
                          </span>
                          {planet.body} in {planet.sign}
                          {planet.retrograde && (
                            <span className='text-red-400 text-xs'>℞</span>
                          )}
                        </h5>
                        <p className='text-xs text-zinc-300 mt-1'>
                          {interpretation}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Social Planets */}
            <div>
              <h4 className='text-xs font-medium text-yellow-400 mb-2 uppercase tracking-wide'>
                Social Planets
              </h4>
              <div className='space-y-2'>
                {birthChartData
                  .filter((planet) =>
                    ['Jupiter', 'Saturn'].includes(planet.body),
                  )
                  .map((planet) => {
                    const interpretation = getPlanetaryInterpretation(planet);
                    return (
                      <div
                        key={planet.body}
                        className='border-l-2 border-yellow-400 pl-3'
                      >
                        <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                          <span className='text-lg'>
                            {
                              bodiesSymbols[
                                planet.body.toLowerCase() as keyof typeof bodiesSymbols
                              ]
                            }
                          </span>
                          {planet.body} in {planet.sign}
                          {planet.retrograde && (
                            <span className='text-red-400 text-xs'>℞</span>
                          )}
                        </h5>
                        <p className='text-xs text-zinc-300 mt-1'>
                          {interpretation}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Generational Planets */}
            <div>
              <h4 className='text-xs font-medium text-purple-400 mb-2 uppercase tracking-wide'>
                Generational Planets
              </h4>
              <div className='space-y-2'>
                {birthChartData
                  .filter((planet) =>
                    ['Uranus', 'Neptune', 'Pluto'].includes(planet.body),
                  )
                  .map((planet) => {
                    const interpretation = getPlanetaryInterpretation(planet);
                    return (
                      <div
                        key={planet.body}
                        className='border-l-2 border-purple-400 pl-3'
                      >
                        <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                          <span className='text-lg'>
                            {
                              bodiesSymbols[
                                planet.body.toLowerCase() as keyof typeof bodiesSymbols
                              ]
                            }
                          </span>
                          {planet.body} in {planet.sign}
                          {planet.retrograde && (
                            <span className='text-red-400 text-xs'>℞</span>
                          )}
                        </h5>
                        <p className='text-xs text-zinc-300 mt-1'>
                          {interpretation}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Chart Patterns & Analysis */}
          <div className='mt-6 pt-4 border-t border-zinc-700'>
            <h4 className='text-sm font-medium text-cyan-400 mb-3'>
              Chart Analysis
            </h4>
            <div className='space-y-3'>
              {getChartAnalysis(birthChartData).map((analysis, index) => (
                <div key={index} className='bg-zinc-700 rounded p-3'>
                  <h5 className='text-xs font-medium text-cyan-300 mb-1'>
                    {analysis.category}
                  </h5>
                  <p className='text-xs text-zinc-300'>{analysis.insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Element & Modality Breakdown */}
          <div className='mt-4'>
            <h4 className='text-sm font-medium text-orange-400 mb-3'>
              Elemental & Modal Balance
            </h4>
            <div className='grid grid-cols-2 gap-3'>
              {/* Elements */}
              <div>
                <h5 className='text-xs font-medium text-orange-300 mb-2'>
                  Elements
                </h5>
                <div className='space-y-1'>
                  {getElementModality(birthChartData).elements.map(
                    (element) => (
                      <div
                        key={element.name}
                        className='bg-zinc-700 rounded p-2'
                      >
                        <div className='flex items-center justify-between mb-1'>
                          <div className='flex items-center gap-2'>
                            <span className='text-sm'>{element.symbol}</span>
                            <span className='text-xs text-zinc-300'>
                              {element.name}
                            </span>
                          </div>
                          <span className='text-xs text-orange-300'>
                            {element.count}
                          </span>
                        </div>
                        {element.count > 0 && (
                          <div className='flex flex-wrap gap-1'>
                            {(element as any).planets?.map(
                              (planet: BirthChartData) => (
                                <span
                                  key={planet.body}
                                  className='text-xs bg-zinc-600 px-1 rounded'
                                >
                                  {
                                    bodiesSymbols[
                                      planet.body.toLowerCase() as keyof typeof bodiesSymbols
                                    ]
                                  }
                                </span>
                              ),
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
                <h5 className='text-xs font-medium text-orange-300 mb-2'>
                  Modalities
                </h5>
                <div className='space-y-1'>
                  {getElementModality(birthChartData).modalities.map(
                    (modality) => (
                      <div
                        key={modality.name}
                        className='bg-zinc-700 rounded p-2'
                      >
                        <div className='flex items-center justify-between mb-1'>
                          <div className='flex items-center gap-2'>
                            <span className='text-sm'>
                              {getModalitySymbol(modality.name)}
                            </span>
                            <span className='text-xs text-zinc-300'>
                              {modality.name}
                            </span>
                          </div>
                          <span className='text-xs text-orange-300'>
                            {modality.count}
                          </span>
                        </div>
                        {modality.count > 0 && (
                          <div className='space-y-1'>
                            <div className='flex flex-wrap gap-1'>
                              {(modality as any).planets?.map(
                                (planet: BirthChartData) => (
                                  <span
                                    key={planet.body}
                                    className='text-xs bg-zinc-600 px-1 rounded'
                                  >
                                    {
                                      bodiesSymbols[
                                        planet.body.toLowerCase() as keyof typeof bodiesSymbols
                                      ]
                                    }
                                  </span>
                                ),
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

          {/* Planetary Aspects */}
          <div className='mt-4'>
            <h4 className='text-sm font-medium text-indigo-400 mb-3'>
              Major Aspects
            </h4>
            <div className='space-y-2'>
              {getPlanetaryAspects(birthChartData).map((aspect, index) => (
                <div key={index} className='border-l-2 border-indigo-400 pl-3'>
                  <h5 className='text-xs font-medium text-indigo-300'>
                    {aspect.planet1} {aspect.aspectSymbol} {aspect.planet2}
                  </h5>
                  <p className='text-xs text-zinc-300'>{aspect.meaning}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chart Patterns */}
          <div className='mt-4'>
            <h4 className='text-sm font-medium text-emerald-400 mb-3'>
              Chart Patterns
            </h4>
            <div className='space-y-2'>
              {getChartPatterns(birthChartData).map((pattern, index) => (
                <div key={index} className='bg-zinc-700 rounded p-3'>
                  <h5 className='text-xs font-medium text-emerald-300 mb-1'>
                    {pattern.name}
                  </h5>
                  <p className='text-xs text-zinc-300'>{pattern.description}</p>
                  <p className='text-xs text-emerald-200 mt-1'>
                    {pattern.meaning}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Stelliums */}
          <div className='mt-4'>
            <h4 className='text-sm font-medium text-violet-400 mb-3'>
              Stelliums & Concentrations
            </h4>
            <div className='space-y-2'>
              {getStelliums(birthChartData).map((stellium, index) => (
                <div key={index} className='border-l-2 border-violet-400 pl-3'>
                  <h5 className='text-xs font-medium text-violet-300'>
                    {stellium.sign} Stellium ({stellium.planets.length} planets)
                  </h5>
                  <p className='text-xs text-zinc-400 mb-1'>
                    {stellium.planets
                      .map((p) => `${p.body} (${p.degree}°)`)
                      .join(', ')}
                  </p>
                  <p className='text-xs text-zinc-300'>{stellium.meaning}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Planetary Dignities */}
          <div className='mt-4'>
            <h4 className='text-sm font-medium text-pink-400 mb-3'>
              Special Placements
            </h4>
            <div className='space-y-2'>
              {getPlanetaryDignities(birthChartData).map((dignity, index) => (
                <div key={index} className='border-l-2 border-pink-400 pl-3'>
                  <h5 className='text-xs font-medium text-pink-300'>
                    {dignity.planet} {dignity.type}
                  </h5>
                  <p className='text-xs text-zinc-300'>{dignity.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BirthChartPage;
