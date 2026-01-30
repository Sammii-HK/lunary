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
  astrologicalPoints,
} from '../../../utils/zodiac/zodiac';
import { useSubscription } from '../../hooks/useSubscription';
import { hasBirthChartAccess } from '../../../utils/pricing';
import Link from 'next/link';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { conversionTracking } from '@/lib/analytics';
import { useEffect, useMemo, useState } from 'react';
import { ShareBirthChart } from '@/components/ShareBirthChart';

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
              🌟 Your Birth Chart Awaits
            </h1>
            <div className='bg-gradient-to-r from-lunary-primary-900/30 to-lunary-rose-900/30 rounded-lg p-6 border border-lunary-primary-700 mb-6'>
              <p className='text-zinc-300 mb-4'>
                Sign up for a free account and unlock your complete cosmic
                blueprint with a detailed birth chart analysis. Discover your
                planetary positions, aspects, and the deeper meaning behind your
                astrological profile.
              </p>
              <ul className='text-sm text-zinc-400 space-y-2 mb-6 text-left'>
                <li>✨ Complete planetary positions at your birth</li>
                <li>🌙 Sun, Moon, and Rising sign analysis</li>
                <li>⭐ Cosmic aspects and their interpretations</li>
                <li>🎯 Personality insights and guidance</li>
              </ul>
            </div>
            <SmartTrialButton feature='birth_chart' size='lg' />
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
    <div className='h-full overflow-auto'>
      <div className='flex w-full flex-col gap-4 max-w-2xl md:max-w-4xl mx-auto p-4'>
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
              href='/grimoire/houses/overview/first'
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
            <button
              onClick={() => setShowAspects(!showAspects)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                showAspects
                  ? 'bg-lunary-primary text-white shadow-lg'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {showAspects ? '✨ Hide Aspects' : '🔗 Show Aspects'}
            </button>

            {showAspects && (
              <div className='flex gap-2 items-center'>
                <span className='text-xs text-zinc-500'>Filter:</span>
                <button
                  onClick={() => setAspectFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    aspectFilter === 'all'
                      ? 'bg-zinc-700 text-white'
                      : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setAspectFilter('harmonious')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    aspectFilter === 'harmonious'
                      ? 'bg-green-700 text-white'
                      : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800'
                  }`}
                >
                  Harmonious
                </button>
                <button
                  onClick={() => setAspectFilter('challenging')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    aspectFilter === 'challenging'
                      ? 'bg-red-700 text-white'
                      : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800'
                  }`}
                >
                  Challenging
                </button>
              </div>
            )}
          </div>

          <BirthChart
            birthChart={birthChartData}
            userName={userName}
            birthDate={userBirthday}
            showAspects={showAspects}
            aspectFilter={aspectFilter}
          />
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

        {/* Planetary Interpretations - Responsive Grid */}
        {birthChartData && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {/* Big Three - Sun, Moon, Rising */}
            {(() => {
              const sun = birthChartData.find((p) => p.body === 'Sun');
              const moon = birthChartData.find((p) => p.body === 'Moon');
              const rising = birthChartData.find((p) => p.body === 'Ascendant');

              if (sun || moon || rising) {
                return (
                  <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800 md:col-span-2'>
                    <h4 className='text-xs font-medium text-lunary-primary-400 mb-3 uppercase tracking-wide'>
                      The Big Three
                    </h4>
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
                            Your core identity and life purpose. This is who you
                            are at your essence.
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
                            Your emotional nature and inner needs. This is how
                            you feel and what you need to feel secure.
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
                            Your outer personality and how others see you. This
                            is your mask and first impression.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Houses Section */}
            {(() => {
              const houses = calculateWholeSigHouses(birthChartData);
              if (!houses) {
                return (
                  <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800 md:col-span-2'>
                    <h4 className='text-xs font-medium text-lunary-highlight mb-2 uppercase tracking-wide'>
                      Houses
                    </h4>
                    <p className='text-xs text-zinc-400'>
                      Add your birth time to see accurate house placements.
                    </p>
                  </div>
                );
              }

              return (
                <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800 md:col-span-2'>
                  <h4 className='text-xs font-medium text-lunary-highlight mb-3 uppercase tracking-wide'>
                    Your 12 Houses
                  </h4>
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
                          <div className='text-xs text-zinc-400 mb-1'>
                            {sign}
                          </div>
                          {planets.length > 0 && (
                            <div className='flex flex-wrap gap-1 mt-1'>
                              {planets.map((p) => (
                                <span
                                  key={p.body}
                                  className='text-sm font-astro text-lunary-highlight-300'
                                  title={p.body}
                                >
                                  {
                                    bodiesSymbols[
                                      p.body.toLowerCase() as keyof typeof bodiesSymbols
                                    ]
                                  }
                                </span>
                              ))}
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
              );
            })()}

            {/* Personal Planets */}
            <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800'>
              <h4 className='text-xs font-medium text-lunary-secondary mb-2 uppercase tracking-wide'>
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
                        className='border-l-2 border-lunary-secondary pl-3'
                      >
                        <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                          <span className='font-astro text-lg'>
                            {
                              bodiesSymbols[
                                planet.body.toLowerCase() as keyof typeof bodiesSymbols
                              ]
                            }
                          </span>
                          {planet.body} in {planet.sign}
                          {planet.retrograde && (
                            <span className='text-lunary-error text-xs'>℞</span>
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
            <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800'>
              <h4 className='text-xs font-medium text-lunary-accent mb-2 uppercase tracking-wide'>
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
                        className='border-l-2 border-lunary-accent pl-3'
                      >
                        <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                          <span className='font-astro text-lg'>
                            {
                              bodiesSymbols[
                                planet.body.toLowerCase() as keyof typeof bodiesSymbols
                              ]
                            }
                          </span>
                          {planet.body} in {planet.sign}
                          {planet.retrograde && (
                            <span className='text-lunary-error text-xs'>℞</span>
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
            <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800'>
              <h4 className='text-xs font-medium text-lunary-primary-400 mb-2 uppercase tracking-wide'>
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
                        className='border-l-2 border-lunary-primary-400 pl-3'
                      >
                        <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                          <span className='font-astro text-lg'>
                            {
                              bodiesSymbols[
                                planet.body.toLowerCase() as keyof typeof bodiesSymbols
                              ]
                            }
                          </span>
                          {planet.body} in {planet.sign}
                          {planet.retrograde && (
                            <span className='text-lunary-error text-xs'>℞</span>
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

            {/* Sensitive Points */}
            {(() => {
              const midheaven = birthChartData.find(
                (p) => p.body === 'Midheaven',
              );
              const northNode = birthChartData.find(
                (p) => p.body === 'North Node',
              );
              const southNode = birthChartData.find(
                (p) => p.body === 'South Node',
              );
              const chiron = birthChartData.find((p) => p.body === 'Chiron');
              const lilith = birthChartData.find((p) => p.body === 'Lilith');

              const descendant = birthChartData.find(
                (p) => p.body === 'Descendant',
              );
              const hasPoints =
                midheaven ||
                descendant ||
                northNode ||
                southNode ||
                chiron ||
                lilith;

              if (!hasPoints) return null;

              return (
                <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800'>
                  <h4 className='text-xs font-medium text-lunary-highlight mb-2 uppercase tracking-wide'>
                    Sensitive Points
                  </h4>
                  <div className='space-y-2'>
                    {midheaven && (
                      <div className='border-l-2 border-lunary-highlight pl-3'>
                        <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                          <span className='font-astro text-lg text-lunary-highlight'>
                            {astroPointSymbols.midheaven}
                          </span>
                          Midheaven in {midheaven.sign}
                          <span className='font-astro text-zinc-400'>
                            {
                              zodiacSymbol[
                                midheaven.sign.toLowerCase() as keyof typeof zodiacSymbol
                              ]
                            }
                          </span>
                        </h5>
                        <p className='text-xs text-zinc-300 mt-1'>
                          {astrologicalPoints.midheaven.mysticalProperties}
                        </p>
                      </div>
                    )}
                    {descendant && (
                      <div className='border-l-2 border-lunary-primary-400 pl-3'>
                        <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                          <span className='font-astro text-lg text-lunary-primary-400'>
                            {astroPointSymbols.descendant}
                          </span>
                          Descendant in {descendant.sign}
                          <span className='font-astro text-zinc-400'>
                            {
                              zodiacSymbol[
                                descendant.sign.toLowerCase() as keyof typeof zodiacSymbol
                              ]
                            }
                          </span>
                        </h5>
                        <p className='text-xs text-zinc-300 mt-1'>
                          {astrologicalPoints.descendant.mysticalProperties}
                        </p>
                      </div>
                    )}
                    {northNode && (
                      <div className='border-l-2 border-emerald-500 pl-3'>
                        <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                          <span className='font-astro text-lg text-emerald-400'>
                            {astroPointSymbols.northnode}
                          </span>
                          North Node in {northNode.sign}
                          <span className='font-astro text-zinc-400'>
                            {
                              zodiacSymbol[
                                northNode.sign.toLowerCase() as keyof typeof zodiacSymbol
                              ]
                            }
                          </span>
                        </h5>
                        <p className='text-xs text-zinc-300 mt-1'>
                          {astrologicalPoints.northnode.mysticalProperties}
                        </p>
                      </div>
                    )}
                    {southNode && (
                      <div className='border-l-2 border-violet-500 pl-3'>
                        <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                          <span className='font-astro text-lg text-violet-400'>
                            {astroPointSymbols.southnode}
                          </span>
                          South Node in {southNode.sign}
                          <span className='font-astro text-zinc-400'>
                            {
                              zodiacSymbol[
                                southNode.sign.toLowerCase() as keyof typeof zodiacSymbol
                              ]
                            }
                          </span>
                        </h5>
                        <p className='text-xs text-zinc-300 mt-1'>
                          {astrologicalPoints.southnode.mysticalProperties}
                        </p>
                      </div>
                    )}
                    {chiron && (
                      <div className='border-l-2 border-amber-500 pl-3'>
                        <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                          <span className='font-astro text-lg text-amber-400'>
                            {astroPointSymbols.chiron}
                          </span>
                          Chiron in {chiron.sign}
                          <span className='font-astro text-zinc-400'>
                            {
                              zodiacSymbol[
                                chiron.sign.toLowerCase() as keyof typeof zodiacSymbol
                              ]
                            }
                          </span>
                        </h5>
                        <p className='text-xs text-zinc-300 mt-1'>
                          {astrologicalPoints.chiron.mysticalProperties}
                        </p>
                      </div>
                    )}
                    {lilith && (
                      <div className='border-l-2 border-fuchsia-500 pl-3'>
                        <h5 className='text-sm font-medium text-white flex items-center gap-2'>
                          <span className='font-astro text-lg text-fuchsia-400'>
                            {astroPointSymbols.lilith}
                          </span>
                          Lilith in {lilith.sign}
                          <span className='font-astro text-zinc-400'>
                            {
                              zodiacSymbol[
                                lilith.sign.toLowerCase() as keyof typeof zodiacSymbol
                              ]
                            }
                          </span>
                        </h5>
                        <p className='text-xs text-zinc-300 mt-1'>
                          {astrologicalPoints.lilith.mysticalProperties}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

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
                <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800 md:col-span-2'>
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
              <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800 md:col-span-2'>
                <h4 className='text-sm font-medium text-lunary-secondary mb-3'>
                  Chart Analysis
                </h4>
                <div className='space-y-3'>
                  {getChartAnalysis(birthChartData).map((analysis, index) => (
                    <div key={index} className='bg-zinc-900 rounded p-3'>
                      <h5 className='text-xs font-medium text-lunary-secondary-300 mb-1'>
                        {analysis.category}
                      </h5>
                      <p className='text-xs text-zinc-300'>
                        {analysis.insight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Element & Modality Breakdown */}
            <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800 md:col-span-2'>
              <h4 className='text-sm font-medium text-lunary-rose mb-3'>
                Elemental & Modal Balance
              </h4>
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
                                  return (
                                    <span
                                      key={planet.body}
                                      className='text-xs font-astro bg-zinc-800 px-1 rounded'
                                      title={planet.body}
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
                                    return (
                                      <span
                                        key={planet.body}
                                        className='text-xs font-astro bg-zinc-800 px-1 rounded'
                                        title={planet.body}
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

            {/* Planetary Aspects */}
            {getPlanetaryAspects(birthChartData).length > 0 && (
              <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800 md:col-span-2'>
                <h4 className='text-sm font-medium text-lunary-primary mb-3'>
                  Major Aspects
                </h4>
                <div className='space-y-2'>
                  {getPlanetaryAspects(birthChartData).map((aspect, index) => (
                    <div
                      key={index}
                      className='border-l-2 border-lunary-primary pl-3'
                    >
                      <h5 className='text-xs font-medium text-lunary-primary-300'>
                        {aspect.planet1} {aspect.aspectSymbol} {aspect.planet2}
                      </h5>
                      <p className='text-xs text-zinc-300'>{aspect.meaning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chart Patterns */}
            {getChartPatterns(birthChartData).length > 0 && (
              <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800 md:col-span-2'>
                <h4 className='text-sm font-medium text-lunary-success mb-3'>
                  Chart Patterns
                </h4>
                <div className='space-y-2'>
                  {getChartPatterns(birthChartData).map((pattern, index) => (
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
                  ))}
                </div>
              </div>
            )}

            {/* Stelliums */}
            {getStelliums(birthChartData).length > 0 && (
              <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800 md:col-span-2'>
                <h4 className='text-sm font-medium text-lunary-highlight mb-3'>
                  Stelliums & Concentrations
                </h4>
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
            )}

            {/* Planetary Dignities */}
            {getPlanetaryDignities(birthChartData).length > 0 && (
              <div className='bg-lunary-bg rounded-lg p-4 border border-zinc-800 md:col-span-2'>
                <h4 className='text-sm font-medium text-lunary-rose mb-3'>
                  Special Placements
                </h4>
                <div className='space-y-2'>
                  {getPlanetaryDignities(birthChartData).map(
                    (dignity, index) => (
                      <div
                        key={index}
                        className='border-l-2 border-lunary-rose pl-3'
                      >
                        <h5 className='text-xs font-medium text-lunary-rose-300'>
                          {dignity.planet} {dignity.type}
                        </h5>
                        <p className='text-xs text-zinc-300'>
                          {dignity.meaning}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BirthChartPage;
