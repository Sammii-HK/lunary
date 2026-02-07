import { BirthChartData } from '../../../utils/astrology/birthChart';
import {
  formatDegree,
  getZodiacSign,
} from '../../../utils/astrology/astrology';
import { elementAstro, modalityAstro } from '../../../utils/zodiac/zodiac';

// ── Types ───────────────────────────────────────────────────────────

export type ChartAnalysis = {
  category: string;
  insight: string;
};

export type PlanetaryDignity = {
  planet: string;
  type: string;
  meaning: string;
};

export type PlanetaryAspect = {
  planet1: string;
  planet2: string;
  aspectSymbol: string;
  aspect: string;
  orb: number;
  meaning: string;
};

export type ChartPattern = {
  name: string;
  description: string;
  meaning: string;
};

export type Stellium = {
  sign: string;
  planets: BirthChartData[];
  meaning: string;
};

// ── Constants ───────────────────────────────────────────────────────

export const ZODIAC_ORDER = [
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

// ── House Calculations ──────────────────────────────────────────────

export const calculateWholeSigHouses = (birthChart: BirthChartData[]) => {
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

export const ensureDescendantInChart = (birthChart: BirthChartData[]) => {
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

// ── Planetary Interpretations ───────────────────────────────────────

export const getPlanetaryInterpretation = (planet: BirthChartData): string => {
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

  const specific = interpretations[planet.body]?.[planet.sign];
  if (specific) {
    const retrogradeNote = planet.retrograde
      ? ' [Retrograde: This energy turns inward, requiring you to master it internally before expressing it outwardly. Periods of reflection and revision are essential.]'
      : '';
    return specific + retrogradeNote;
  }

  const planetMeaning = planetMeanings[planet.body] || `Your ${planet.body}`;
  const signQuality = signQualities[planet.sign] || planet.sign;
  const retrogradeNote = planet.retrograde
    ? ' Retrograde brings internal focus and deeper mastery.'
    : '';

  return `${planetMeaning} expresses through ${signQuality} energy.${retrogradeNote}`;
};

// ── Chart Ruler ─────────────────────────────────────────────────────

export const getChartRuler = (ascendantSign: string): string => {
  const rulers: Record<string, string> = {
    Aries: 'Mars',
    Taurus: 'Venus',
    Gemini: 'Mercury',
    Cancer: 'Moon',
    Leo: 'Sun',
    Virgo: 'Mercury',
    Libra: 'Venus',
    Scorpio: 'Pluto',
    Sagittarius: 'Jupiter',
    Capricorn: 'Saturn',
    Aquarius: 'Uranus',
    Pisces: 'Neptune',
  };
  return rulers[ascendantSign] || 'Unknown';
};

// ── Ordinal Suffix ──────────────────────────────────────────────────

export const getOrdinalSuffix = (num: number): string => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
};

// ── Most Aspected Planet ────────────────────────────────────────────

export const getMostAspectedPlanet = (birthChart: BirthChartData[]): string => {
  const aspectCounts: Record<string, number> = {};
  const majorAspects = [
    { angle: 0, orb: 8 },
    { angle: 180, orb: 8 },
    { angle: 120, orb: 6 },
    { angle: 90, orb: 6 },
    { angle: 60, orb: 4 },
  ];

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

// ── Planetary Dignity ───────────────────────────────────────────────

export const getPlanetDignityStatus = (
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

// ── Chart Analysis ──────────────────────────────────────────────────

export const getChartAnalysis = (
  birthChart: BirthChartData[],
): ChartAnalysis[] => {
  const analysis: ChartAnalysis[] = [];

  const retrogradeCount = birthChart.filter((p) => p.retrograde).length;
  if (retrogradeCount >= 3) {
    analysis.push({
      category: 'Retrograde Emphasis',
      insight: `${retrogradeCount} retrograde planets suggest deep introspection and mastery through internal processing.`,
    });
  }

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

// ── Element & Modality ──────────────────────────────────────────────

export const getElementModality = (birthChart: BirthChartData[]) => {
  const elements = getElementCounts(birthChart);
  const modalities = getModalityCounts(birthChart);

  return { elements, modalities };
};

export const getElementCounts = (birthChart: BirthChartData[]) => {
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

export const getModalityCounts = (birthChart: BirthChartData[]) => {
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

export const getElementMeaning = (element: string): string => {
  const meanings: Record<string, string> = {
    Fire: 'passionate, energetic, action-oriented',
    Earth: 'practical, grounded, stability-seeking',
    Air: 'intellectual, communicative, idea-focused',
    Water: 'emotional, intuitive, feeling-oriented',
  };
  return meanings[element] || element;
};

// ── Planetary Dignities ─────────────────────────────────────────────

export const getPlanetaryDignities = (
  birthChart: BirthChartData[],
): PlanetaryDignity[] => {
  const dignities: PlanetaryDignity[] = [];

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

  birthChart.forEach((planet) => {
    if (rulerships[planet.body]?.includes(planet.sign)) {
      dignities.push({
        planet: planet.body,
        type: 'in Rulership',
        meaning: `${planet.body} is at home in ${planet.sign}, expressing its pure essence with natural strength.`,
      });
    }

    if (exaltations[planet.body] === planet.sign) {
      dignities.push({
        planet: planet.body,
        type: 'in Exaltation',
        meaning: `${planet.body} is exalted in ${planet.sign}, operating at its highest potential.`,
      });
    }

    if (detriments[planet.body]?.includes(planet.sign)) {
      dignities.push({
        planet: planet.body,
        type: 'in Detriment',
        meaning: `${planet.body} is in detriment in ${planet.sign}, facing challenges in expressing its natural qualities and requiring extra effort.`,
      });
    }

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

// ── Modality Helpers ────────────────────────────────────────────────

export const getModalitySymbol = (modality: string): string => {
  const symbols: Record<string, string> = {
    Cardinal: modalityAstro.cardinal,
    Fixed: modalityAstro.fixed,
    Mutable: modalityAstro.mutable,
  };
  return symbols[modality] || '';
};

export const getModalityMeaning = (
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

// ── Planetary Aspects ───────────────────────────────────────────────

export const getPlanetaryAspects = (
  birthChart: BirthChartData[],
): PlanetaryAspect[] => {
  const aspects: PlanetaryAspect[] = [];

  const majorAspects = [
    { name: 'Conjunction', angle: 0, symbol: '☌', orb: 8 },
    { name: 'Opposition', angle: 180, symbol: '☍', orb: 8 },
    { name: 'Trine', angle: 120, symbol: '△', orb: 6 },
    { name: 'Square', angle: 90, symbol: '□', orb: 6 },
    { name: 'Sextile', angle: 60, symbol: '⚹', orb: 4 },
  ];

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

  return aspects.slice(0, 8);
};

export const getAspectMeaning = (
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

// ── Chart Patterns ──────────────────────────────────────────────────

export const getChartPatterns = (
  birthChart: BirthChartData[],
): ChartPattern[] => {
  const patterns: ChartPattern[] = [];
  const allAspects = getPlanetaryAspects(birthChart);

  const conjunctions = allAspects.filter((a) => a.aspect === 'Conjunction');
  const oppositions = allAspects.filter((a) => a.aspect === 'Opposition');
  const trines = allAspects.filter((a) => a.aspect === 'Trine');
  const squares = allAspects.filter((a) => a.aspect === 'Square');
  const sextiles = allAspects.filter((a) => a.aspect === 'Sextile');

  // GRAND CROSS
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

  // GRAND TRINE
  if (trines.length >= 3) {
    const trinePlanets = new Set(trines.flatMap((t) => [t.planet1, t.planet2]));
    if (trinePlanets.size >= 3) {
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

  // T-SQUARE
  if (oppositions.length >= 1 && squares.length >= 2) {
    const oppositionPlanets = oppositions.flatMap((o) => [
      o.planet1,
      o.planet2,
    ]);
    const squarePlanets = squares.flatMap((s) => [s.planet1, s.planet2]);

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

  // YOD (Finger of God)
  const quincunxes = getQuincunxAspects(birthChart);
  if (quincunxes.length >= 2 && sextiles.length >= 1) {
    let yodFound = false;
    let yodPattern: {
      apexPlanet: string;
      basePlanets: string[];
    } | null = null;

    for (let i = 0; i < quincunxes.length && !yodFound; i++) {
      for (let j = i + 1; j < quincunxes.length && !yodFound; j++) {
        const q1 = quincunxes[i];
        const q2 = quincunxes[j];

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

  // KITE
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

  // MYSTIC RECTANGLE
  if (oppositions.length >= 2 && sextiles.length >= 4) {
    patterns.push({
      name: 'Mystic Rectangle',
      description:
        'Two oppositions connected by four sextiles - stable yet dynamic',
      meaning:
        'Perfect balance of stability and growth. Challenges are met with supportive resources and practical solutions.',
    });
  }

  // CRADLE
  if (sextiles.length >= 2 && trines.length >= 2) {
    patterns.push({
      name: 'Cradle Pattern',
      description: 'Harmonious configuration providing support and protection',
      meaning:
        'Natural safety net and support system. Talents are nurtured and protected, leading to gentle but steady growth.',
    });
  }

  // GRAND CONJUNCTION
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

  // CHART SHAPE PATTERNS
  const shapePattern = getChartShapePattern(birthChart);
  if (shapePattern) {
    patterns.push(shapePattern);
  }

  const locomotivePattern = getLocomotivePattern(birthChart);
  if (locomotivePattern) {
    patterns.push(locomotivePattern);
  }

  const bowlPattern = getBowlPattern(birthChart);
  if (bowlPattern) {
    patterns.push(bowlPattern);
  }

  if (!shapePattern && !locomotivePattern && !bowlPattern) {
    const seesawPattern = getSeesawPattern(birthChart);
    if (seesawPattern) {
      patterns.push(seesawPattern);
    }
  }

  if (!shapePattern && !locomotivePattern && !bowlPattern) {
    const splashPattern = getSplashPattern(birthChart);
    if (splashPattern) {
      patterns.push(splashPattern);
    }
  }

  if (!shapePattern && !locomotivePattern && !bowlPattern) {
    const splayPattern = getSplayPattern(birthChart);
    if (splayPattern) {
      patterns.push(splayPattern);
    }
  }

  return patterns;
};

// ── Stelliums ───────────────────────────────────────────────────────

export const getStelliums = (birthChart: BirthChartData[]): Stellium[] => {
  const stelliums: Stellium[] = [];

  const signGroups: Record<string, BirthChartData[]> = {};
  birthChart.forEach((planet) => {
    if (!signGroups[planet.sign]) signGroups[planet.sign] = [];
    signGroups[planet.sign].push(planet);
  });

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

// ── Helper Functions (internal) ─────────────────────────────────────

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

  if (maxSpan > 120) {
    const gapIndex = spans.indexOf(maxSpan);
    const handlePlanet = birthChart[gapIndex] || birthChart[0];

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
  if (birthChart.length < 8) return null;

  const longitudes = birthChart
    .map((p) => p.eclipticLongitude)
    .sort((a, b) => a - b);

  const spans = [];
  for (let i = 0; i < longitudes.length - 1; i++) {
    spans.push(longitudes[i + 1] - longitudes[i]);
  }
  spans.push(360 + longitudes[0] - longitudes[longitudes.length - 1]);

  const maxSpan = Math.max(...spans);
  const maxSpanIndex = spans.indexOf(maxSpan);

  if (maxSpan < 150 || maxSpan > 210) return null;

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

  if (group1.length >= 4 && group2.length >= 4) {
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
  if (birthChart.length < 7) return null;

  const longitudes = birthChart
    .map((p) => p.eclipticLongitude)
    .sort((a, b) => a - b);

  const uniqueSigns = new Set(birthChart.map((p) => p.sign)).size;
  if (uniqueSigns < 8) return null;

  const spans = [];
  for (let i = 0; i < longitudes.length - 1; i++) {
    spans.push(longitudes[i + 1] - longitudes[i]);
  }
  spans.push(360 + longitudes[0] - longitudes[longitudes.length - 1]);

  const maxGap = Math.max(...spans);
  if (maxGap > 60) return null;

  const avgGap = spans.reduce((a, b) => a + b, 0) / spans.length;
  const gapVariance =
    spans.reduce((sum, gap) => sum + Math.abs(gap - avgGap), 0) / spans.length;

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
  if (birthChart.length < 5) return null;

  const longitudes = birthChart
    .map((p) => p.eclipticLongitude)
    .sort((a, b) => a - b);

  const totalSpread = longitudes[longitudes.length - 1] - longitudes[0];

  if (totalSpread <= 180) return null;

  const upperHemisphere = birthChart.filter(
    (p) => p.eclipticLongitude >= 0 && p.eclipticLongitude < 180,
  ).length;
  const lowerHemisphere = birthChart.filter(
    (p) => p.eclipticLongitude >= 180 && p.eclipticLongitude < 360,
  ).length;

  if (upperHemisphere === 0 || lowerHemisphere === 0) return null;

  const spans = [];
  for (let i = 0; i < longitudes.length - 1; i++) {
    spans.push(longitudes[i + 1] - longitudes[i]);
  }
  spans.push(360 + longitudes[0] - longitudes[longitudes.length - 1]);

  const maxGap = Math.max(...spans);
  const minGap = Math.min(...spans);

  if (maxGap > 60 && maxGap < 120 && minGap < 30) {
    const uniqueSigns = new Set(birthChart.map((p) => p.sign)).size;
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
