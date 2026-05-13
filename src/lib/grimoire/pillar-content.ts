import zodiacSignsData from '@/data/zodiac-signs.json';
import planetaryBodiesData from '@/data/planetary-bodies.json';
import pillarContent from '@/data/grimoire-pillar-content.json';
import {
  getDecanData,
  type ZodiacSign as DecanZodiacSign,
} from '@/constants/seo/decans';
import {
  formatRulershipValue,
  getPrimaryRuler,
  hasDualRulership,
} from '@/lib/astrology/rulerships';

export const zodiacSignKeys = Object.keys(zodiacSignsData);
export const planetKeys = Object.keys(planetaryBodiesData).filter(
  (key) => key !== 'earth',
);

export const signPlanetOrder = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
] as const;

type ZodiacSignRecord = (typeof zodiacSignsData)[keyof typeof zodiacSignsData];
type PlanetRecord =
  (typeof planetaryBodiesData)[keyof typeof planetaryBodiesData] & {
    exalted?: string;
    detriment?: string;
    fall?: string;
  };

type PlanetSignInterpretation = {
  signKey: string;
  signName: string;
  title: string;
  summary: string;
};

type SignAppliedInterpretation = {
  planet: string;
  planetName: string;
  title: string;
  summary: string;
};

export function getZodiacSignData(sign: string): ZodiacSignRecord | null {
  return zodiacSignsData[sign as keyof typeof zodiacSignsData] ?? null;
}

export function getPlanetData(planet: string): PlanetRecord | null {
  return (planetaryBodiesData[planet as keyof typeof planetaryBodiesData] ??
    null) as PlanetRecord | null;
}

export function getSignDecans(sign: string) {
  return [1, 2, 3].map((decan) =>
    getDecanData(sign as DecanZodiacSign, decan as 1 | 2 | 3),
  );
}

export function getSignRulershipSummary(sign: string) {
  const display = formatRulershipValue(sign);
  return hasDualRulership(sign)
    ? `${display}. Traditional and modern rulerships are both worth knowing, but Lunary defaults to traditional rulership first when judging condition.`
    : `${display}.`;
}

export function getPlanetDignityRows() {
  return planetKeys.map((planet) => {
    const data = getPlanetData(planet);
    if (!data) {
      return [planet, '-', '-', '-', '-'];
    }

    return [
      data.name,
      Array.isArray(data.rules) ? data.rules.join(', ') || '-' : '-',
      data.exalted || '-',
      data.detriment || '-',
      data.fall || '-',
    ];
  });
}

export function buildPlanetSignInterpretations(
  planet: string,
): PlanetSignInterpretation[] {
  const planetData = getPlanetData(planet);
  if (!planetData) {
    return [];
  }

  return zodiacSignKeys.map((signKey) => {
    const signData = getZodiacSignData(signKey);
    if (!signData) {
      throw new Error(`Missing zodiac sign data for ${signKey}`);
    }

    const signName = signData.name;
    const emphasis =
      signData.element === 'Fire'
        ? 'action and momentum'
        : signData.element === 'Earth'
          ? 'stability and tangible results'
          : signData.element === 'Air'
            ? 'ideas, language, and perspective'
            : 'emotional patterning and intuition';

    return {
      signKey,
      signName,
      title: `${planetData.name} in ${signName}`,
      summary: `${planetData.name} in ${signName} pushes ${planetData.name.toLowerCase()}'s themes through ${signData.element.toLowerCase()} emphasis around ${emphasis}. Start with ${planetData.name.toLowerCase()}'s job in the chart, then read ${signName} as the style it takes on.`,
    };
  });
}

export function buildSignAppliedInterpretations(sign: string) {
  const signData = getZodiacSignData(sign);
  if (!signData) {
    return { planets: [], houses: [] };
  }

  const planets: SignAppliedInterpretation[] = signPlanetOrder.map((planet) => {
    const planetData = getPlanetData(planet);
    if (!planetData) {
      throw new Error(`Missing planet data for ${planet}`);
    }

    return {
      planet,
      planetName: planetData.name,
      title: `${planetData.name} in ${signData.name}`,
      summary: `${planetData.name} in ${signData.name} expresses ${planetData.name.toLowerCase()}'s themes through ${signData.element.toLowerCase()} ${signData.modality.toLowerCase()} style. Read the house and aspects next to see where that tone lands and what modifies it.`,
    };
  });

  const houses = Array.from({ length: 12 }, (_, index) => {
    const houseNumber = index + 1;
    return {
      houseNumber,
      title: `${signData.name} on the ${ordinal(houseNumber)} house cusp`,
      summary: `${signData.name} on the ${ordinal(houseNumber)} house cusp brings ${signData.keywords.slice(0, 2).join(' and ').toLowerCase()} into ${ordinal(houseNumber)} house topics. The next step is always to inspect ${getPrimaryRuler(signData.name)} and see how the ruler is placed.`,
    };
  });

  return {
    planets,
    houses,
  };
}

export function getPillarContent() {
  return pillarContent;
}

function ordinal(value: number) {
  const mod10 = value % 10;
  const mod100 = value % 100;

  if (mod10 === 1 && mod100 !== 11) return `${value}st`;
  if (mod10 === 2 && mod100 !== 12) return `${value}nd`;
  if (mod10 === 3 && mod100 !== 13) return `${value}rd`;
  return `${value}th`;
}
