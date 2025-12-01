import { BirthChartData } from '../astrology/birthChart';

export type Crystal = {
  name: string;
  properties: string[];
  sunSigns: string[];
  moonSigns: string[];
  aspects: string[];
  chakra: string;
  intention: string;
  description: string;
  element: string;
  color: string[];
};

export const crystalDatabase: Crystal[] = [
  {
    name: 'Amethyst',
    properties: ['intuition', 'spiritual', 'calming', 'protection'],
    sunSigns: ['Pisces', 'Aquarius', 'Sagittarius'],
    moonSigns: ['Pisces', 'Cancer', 'Scorpio'],
    aspects: ['opposition', 'square', 'conjunction-neptune'],
    chakra: 'Crown',
    intention: 'Enhance spiritual awareness and inner peace',
    description: 'Opens the third eye and connects you to higher wisdom',
    element: 'Water',
    color: ['Purple', 'Violet'],
  },
  {
    name: 'Rose Quartz',
    properties: ['love', 'heart-healing', 'emotional', 'compassion'],
    sunSigns: ['Taurus', 'Libra', 'Cancer'],
    moonSigns: ['Cancer', 'Libra', 'Taurus'],
    aspects: ['venus-aspects', 'trine', 'moon-aspects'],
    chakra: 'Heart',
    intention: 'Open your heart to love and self-compassion',
    description: 'Soothes emotional wounds and attracts loving relationships',
    element: 'Water',
    color: ['Pink', 'Rose'],
  },
  {
    name: 'Citrine',
    properties: ['abundance', 'confidence', 'manifestation', 'solar'],
    sunSigns: ['Leo', 'Sagittarius', 'Aries'],
    moonSigns: ['Leo', 'Aries', 'Sagittarius'],
    aspects: ['sun-aspects', 'jupiter-aspects', 'trine'],
    chakra: 'Solar Plexus',
    intention: 'Amplify personal power and manifest abundance',
    description: 'Radiates confidence and attracts prosperity',
    element: 'Fire',
    color: ['Yellow', 'Golden'],
  },
  {
    name: 'Black Tourmaline',
    properties: ['protection', 'grounding', 'mars-energy', 'strength'],
    sunSigns: ['Scorpio', 'Capricorn', 'Aries'],
    moonSigns: ['Capricorn', 'Scorpio', 'Virgo'],
    aspects: ['mars-aspects', 'saturn-aspects', 'square'],
    chakra: 'Root',
    intention: 'Ground your energy and protect against negativity',
    description: 'Creates an energetic shield and promotes inner stability',
    element: 'Earth',
    color: ['Black'],
  },
  {
    name: 'Clear Quartz',
    properties: ['amplification', 'clarity', 'universal', 'mercury'],
    sunSigns: ['Gemini', 'Virgo', 'Aquarius'],
    moonSigns: ['Gemini', 'Virgo', 'Aquarius'],
    aspects: ['mercury-aspects', 'conjunction', 'any'],
    chakra: 'Crown',
    intention: 'Amplify intentions and bring mental clarity',
    description: 'The master healer that enhances all other energies',
    element: 'Air',
    color: ['Clear', 'White'],
  },
  {
    name: 'Moonstone',
    properties: ['lunar', 'intuition', 'feminine', 'cycles'],
    sunSigns: ['Cancer', 'Pisces', 'Scorpio'],
    moonSigns: ['Cancer', 'Pisces', 'Taurus'],
    aspects: ['moon-aspects', 'opposition', 'new-moon'],
    chakra: 'Sacral',
    intention: 'Connect with lunar rhythms and feminine wisdom',
    description: 'Enhances intuition and honors natural cycles',
    element: 'Water',
    color: ['White', 'Cream', 'Gray'],
  },
  {
    name: 'Carnelian',
    properties: ['creativity', 'courage', 'mars', 'action'],
    sunSigns: ['Aries', 'Leo', 'Sagittarius'],
    moonSigns: ['Aries', 'Leo', 'Scorpio'],
    aspects: ['mars-aspects', 'sun-aspects', 'fire-energy'],
    chakra: 'Sacral',
    intention: 'Boost creativity and courage for new ventures',
    description: 'Ignites passion and supports bold action',
    element: 'Fire',
    color: ['Orange', 'Red-Orange'],
  },
  {
    name: 'Labradorite',
    properties: ['transformation', 'magic', 'uranus', 'awakening'],
    sunSigns: ['Aquarius', 'Scorpio', 'Pisces'],
    moonSigns: ['Aquarius', 'Scorpio', 'Pisces'],
    aspects: ['uranus-aspects', 'pluto-aspects', 'transformation'],
    chakra: 'Third Eye',
    intention: 'Awaken psychic abilities and embrace transformation',
    description: 'Reveals hidden truths and enhances spiritual gifts',
    element: 'Air',
    color: ['Gray', 'Blue', 'Green'],
  },
  {
    name: 'Green Aventurine',
    properties: ['luck', 'heart-healing', 'venus', 'growth'],
    sunSigns: ['Taurus', 'Virgo', 'Libra'],
    moonSigns: ['Taurus', 'Cancer', 'Virgo'],
    aspects: ['venus-aspects', 'earth-energy', 'trine'],
    chakra: 'Heart',
    intention: 'Attract good fortune and emotional healing',
    description: 'Opens opportunities and soothes the heart',
    element: 'Earth',
    color: ['Green'],
  },
  {
    name: 'Lapis Lazuli',
    properties: ['wisdom', 'truth', 'jupiter', 'communication'],
    sunSigns: ['Sagittarius', 'Pisces', 'Aquarius'],
    moonSigns: ['Sagittarius', 'Gemini', 'Aquarius'],
    aspects: ['jupiter-aspects', 'mercury-aspects', 'expansion'],
    chakra: 'Throat',
    intention: 'Speak your truth with wisdom and authority',
    description: 'Enhances communication and reveals deeper truths',
    element: 'Air',
    color: ['Blue', 'Gold'],
  },
  {
    name: 'Hematite',
    properties: ['grounding', 'mars', 'focus', 'strength'],
    sunSigns: ['Aries', 'Capricorn', 'Virgo'],
    moonSigns: ['Capricorn', 'Virgo', 'Taurus'],
    aspects: ['mars-aspects', 'saturn-aspects', 'earth-energy'],
    chakra: 'Root',
    intention: 'Ground scattered energy and enhance focus',
    description: 'Strengthens connection to Earth and builds determination',
    element: 'Earth',
    color: ['Silver', 'Metallic'],
  },
  {
    name: 'Obsidian',
    properties: ['protection', 'grounding', 'truth', 'pluto'],
    sunSigns: ['Scorpio', 'Capricorn', 'Sagittarius'],
    moonSigns: ['Scorpio', 'Capricorn', 'Aries'],
    aspects: ['pluto-aspects', 'square', 'opposition'],
    chakra: 'Root',
    intention: 'Shield from negativity and reveal hidden truths',
    description: 'Powerful protector that cuts through illusions',
    element: 'Fire',
    color: ['Black'],
  },
  {
    name: 'Garnet',
    properties: ['passion', 'energy', 'mars', 'commitment'],
    sunSigns: ['Aries', 'Leo', 'Capricorn'],
    moonSigns: ['Aries', 'Scorpio', 'Leo'],
    aspects: ['mars-aspects', 'conjunction', 'fire-energy'],
    chakra: 'Root',
    intention: 'Ignite passion and strengthen commitment',
    description: 'Energizes the spirit and enhances devotion',
    element: 'Fire',
    color: ['Red', 'Deep Red'],
  },
  {
    name: "Tiger's Eye",
    properties: ['courage', 'protection', 'focus', 'earth-energy'],
    sunSigns: ['Leo', 'Capricorn', 'Gemini'],
    moonSigns: ['Leo', 'Virgo', 'Capricorn'],
    aspects: ['sun-aspects', 'saturn-aspects', 'earth-energy'],
    chakra: 'Solar Plexus',
    intention: 'Enhance personal power and clear thinking',
    description: 'Combines Earth stability with Solar confidence',
    element: 'Earth',
    color: ['Brown', 'Golden'],
  },
  {
    name: 'Turquoise',
    properties: ['healing', 'protection', 'communication', 'jupiter'],
    sunSigns: ['Sagittarius', 'Aquarius', 'Pisces'],
    moonSigns: ['Sagittarius', 'Aquarius', 'Libra'],
    aspects: ['jupiter-aspects', 'mercury-aspects', 'trine'],
    chakra: 'Throat',
    intention: 'Enhance communication and spiritual protection',
    description: 'Ancient stone of wisdom and protection',
    element: 'Air',
    color: ['Blue', 'Green'],
  },
  {
    name: 'Aquamarine',
    properties: ['calming', 'communication', 'mercury', 'clarity'],
    sunSigns: ['Pisces', 'Aquarius', 'Gemini'],
    moonSigns: ['Pisces', 'Cancer', 'Libra'],
    aspects: ['mercury-aspects', 'neptune-aspects', 'water-energy'],
    chakra: 'Throat',
    intention: 'Calm the mind and enhance clear communication',
    description: 'Soothes emotions while promoting clarity of thought',
    element: 'Water',
    color: ['Blue', 'Light Blue'],
  },
];

const getDailyInfluences = (today: Date, userBirthday?: string) => {
  const dayOfWeek = today.getDay();
  const dateString = today.toISOString().split('T')[0];

  let universalDay = dateString
    .replace(/-/g, '')
    .split('')
    .reduce((sum, digit) => sum + parseInt(digit), 0);

  let reducedUniversal = universalDay;
  while (reducedUniversal > 9 && ![11, 22, 33].includes(reducedUniversal)) {
    reducedUniversal = reducedUniversal
      .toString()
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit), 0);
  }

  let personalDay = 1;
  if (userBirthday) {
    const [birthYear, birthMonth, birthDay] = userBirthday
      .split('-')
      .map(Number);
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    const personalSum =
      birthMonth + birthDay + currentYear + currentMonth + currentDay;
    personalDay = personalSum;
    while (personalDay > 9 && ![11, 22, 33].includes(personalDay)) {
      personalDay = personalDay
        .toString()
        .split('')
        .reduce((sum, digit) => sum + parseInt(digit), 0);
    }
  }

  const planetaryRulers = [
    'Sun',
    'Moon',
    'Mars',
    'Mercury',
    'Jupiter',
    'Venus',
    'Saturn',
  ];
  const todaysPlanet = planetaryRulers[dayOfWeek];

  const weekElements = [
    'Fire',
    'Water',
    'Fire',
    'Air',
    'Fire',
    'Water',
    'Earth',
  ];
  const todaysElement = weekElements[dayOfWeek];

  return {
    dayOfWeek,
    universalDay: reducedUniversal,
    personalDay,
    planetaryRuler: todaysPlanet,
    element: todaysElement,
    dateString,
  };
};

const calculateKeyAspects = (
  birthChart: BirthChartData[],
  currentTransits: any[],
) => {
  const aspects: any[] = [];

  for (const transit of currentTransits) {
    for (const natal of birthChart) {
      let diff = Math.abs(transit.eclipticLongitude - natal.eclipticLongitude);
      if (diff > 180) diff = 360 - diff;

      if (Math.abs(diff - 0) <= 10) {
        aspects.push({
          type: 'conjunction',
          transitPlanet: transit.body,
          natalPlanet: natal.body,
          orb: Math.abs(diff - 0),
        });
      } else if (Math.abs(diff - 180) <= 10) {
        aspects.push({
          type: 'opposition',
          transitPlanet: transit.body,
          natalPlanet: natal.body,
          orb: Math.abs(diff - 180),
        });
      } else if (Math.abs(diff - 120) <= 8) {
        aspects.push({
          type: 'trine',
          transitPlanet: transit.body,
          natalPlanet: natal.body,
          orb: Math.abs(diff - 120),
        });
      } else if (Math.abs(diff - 90) <= 8) {
        aspects.push({
          type: 'square',
          transitPlanet: transit.body,
          natalPlanet: natal.body,
          orb: Math.abs(diff - 90),
        });
      }
    }
  }

  return aspects.sort((a, b) => a.orb - b.orb);
};

export const calculateCrystalRecommendation = (
  birthChart: BirthChartData[],
  currentTransits: any[],
  today: Date,
  userBirthday?: string,
): { crystal: Crystal; reasons: string[] } => {
  const scores: Record<string, { score: number; reasons: string[] }> = {};

  crystalDatabase.forEach((crystal) => {
    scores[crystal.name] = { score: 0, reasons: [] };
  });

  const dailyInfluences = getDailyInfluences(today, userBirthday);

  const sunSign = birthChart.find((p) => p.body === 'Sun')?.sign || 'Aries';
  const moonSign = birthChart.find((p) => p.body === 'Moon')?.sign || 'Aries';

  const transitSun = currentTransits.find((p) => p.body === 'Sun');
  const transitMoon = currentTransits.find((p) => p.body === 'Moon');
  const transitMercury = currentTransits.find((p) => p.body === 'Mercury');
  const transitVenus = currentTransits.find((p) => p.body === 'Venus');
  const transitMars = currentTransits.find((p) => p.body === 'Mars');

  const aspects = calculateKeyAspects(birthChart, currentTransits);

  crystalDatabase.forEach((crystal) => {
    let score = 0;
    const reasons: string[] = [];

    if (crystal.sunSigns.includes(sunSign)) {
      score += 10;
      reasons.push(`Aligns with your ${sunSign} Sun`);
    }
    if (crystal.sunSigns.includes(transitSun?.sign || '')) {
      score += 8;
      reasons.push(`Resonates with Sun in ${transitSun?.sign}`);
    }
    if (crystal.moonSigns.includes(moonSign)) {
      score += 10;
      reasons.push(`Supports your ${moonSign} Moon`);
    }
    if (crystal.moonSigns.includes(transitMoon?.sign || '')) {
      score += 8;
      reasons.push(`Harmonizes with Moon in ${transitMoon?.sign}`);
    }

    const planetProps: Record<string, string[]> = {
      Sun: ['solar', 'confidence', 'leadership', 'sun'],
      Moon: ['lunar', 'intuition', 'emotional', 'moon'],
      Mars: ['mars', 'courage', 'action', 'energy'],
      Mercury: ['mercury', 'communication', 'clarity', 'mental-clarity'],
      Jupiter: ['jupiter', 'wisdom', 'abundance', 'expansion'],
      Venus: ['venus', 'love', 'beauty', 'harmony'],
      Saturn: ['saturn', 'grounding', 'discipline', 'structure'],
    };

    const todaysProperties = planetProps[dailyInfluences.planetaryRuler] || [];
    todaysProperties.forEach((prop) => {
      if (crystal.properties.includes(prop)) {
        score += 12;
        if (!reasons.some((r) => r.includes(dailyInfluences.planetaryRuler))) {
          reasons.push(
            `Enhanced by ${dailyInfluences.planetaryRuler}'s daily influence`,
          );
        }
      }
    });

    if (crystal.element === dailyInfluences.element) {
      score += 8;
      reasons.push(`Matches today's ${dailyInfluences.element} element`);
    }

    aspects.forEach((aspect) => {
      if (crystal.aspects.includes(aspect.type)) {
        score += 6;
        if (
          !reasons.some((r) => r.includes(aspect.transitPlanet)) &&
          reasons.length < 4
        ) {
          reasons.push(
            `Supports ${aspect.transitPlanet}-${aspect.natalPlanet} ${aspect.type}`,
          );
        }
      }
    });

    if (transitMercury && crystal.properties.includes('mercury')) score += 7;
    if (transitVenus && crystal.properties.includes('love')) {
      score += 7;
      if (!reasons.some((r) => r.includes('Venus'))) {
        reasons.push(`Amplified by Venus in ${transitVenus.sign}`);
      }
    }
    if (transitMars && crystal.properties.includes('mars')) {
      score += 7;
      if (!reasons.some((r) => r.includes('Mars'))) {
        reasons.push(`Energized by Mars in ${transitMars.sign}`);
      }
    }

    const hasChallengingAspects = aspects.some(
      (a) => a.type === 'square' || a.type === 'opposition',
    );
    if (hasChallengingAspects && crystal.properties.includes('protection')) {
      score += 8;
      reasons.push('Provides protection during challenging aspects');
    }
    if (hasChallengingAspects && crystal.properties.includes('grounding')) {
      score += 6;
      reasons.push('Grounds energy during tense transits');
    }

    const hasHarmoniousAspects = aspects.some(
      (a) => a.type === 'trine' || a.type === 'sextile',
    );
    if (hasHarmoniousAspects && crystal.properties.includes('manifestation')) {
      score += 6;
      reasons.push('Amplifies manifestation during harmonious aspects');
    }

    const dateNumber = parseInt(dailyInfluences.dateString.replace(/-/g, ''));
    const crystalSeed =
      crystal.name.length +
      crystal.name.charCodeAt(0) +
      crystal.name.charCodeAt(crystal.name.length - 1);
    const dailyVariation =
      (dateNumber + crystalSeed + dailyInfluences.dayOfWeek * 13) % 21;

    score += dailyVariation;

    scores[crystal.name] = { score, reasons: reasons.slice(0, 3) };
  });

  const sortedCrystals = Object.entries(scores)
    .sort(([, a], [, b]) => b.score - a.score)
    .slice(0, 5);

  const dateHash = parseInt(dailyInfluences.dateString.replace(/-/g, ''));
  const rotationIndex = dateHash % sortedCrystals.length;
  const selectedCrystalName = sortedCrystals[rotationIndex][0];
  const selectedData = scores[selectedCrystalName];

  const crystal =
    crystalDatabase.find((c) => c.name === selectedCrystalName) ||
    crystalDatabase[0];

  return {
    crystal,
    reasons:
      selectedData.reasons.length > 0
        ? selectedData.reasons
        : [`Supports your ${sunSign} energy today`],
  };
};

export const getCrystalGuidance = (
  crystal: Crystal,
  reasons: string[],
  sunSign: string,
): string => {
  if (reasons.length > 0) {
    return reasons.join('. ') + '.';
  }
  return `${crystal.name} resonates with your ${sunSign} nature, supporting ${crystal.properties.slice(0, 2).join(' and ')}.`;
};
