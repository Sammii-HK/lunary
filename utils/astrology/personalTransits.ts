import dayjs from 'dayjs';
import { getAstrologicalChart, AstroChartInformation } from './astrology';
import { TransitEvent } from './transitCalendar';
import { Observer } from 'astronomy-engine';

export type PersonalTransitImpact = {
  date: dayjs.Dayjs;
  planet: string;
  event: string;
  description: string;
  significance: 'low' | 'medium' | 'high';
  type: 'sign_change' | 'retrograde' | 'direct' | 'aspect' | 'lunar_phase';
  personalImpact: string;
  house?: number;
  houseMeaning?: string;
  aspectToNatal?: {
    natalPlanet: string;
    aspectType: string;
    intensity: number;
  };
};

// Calculate which house a planet is in (simplified equal house system)
const calculateHouse = (
  planetLongitude: number,
  ascendantLongitude: number,
): number => {
  let diff = planetLongitude - ascendantLongitude;
  if (diff < 0) diff += 360;

  const house = Math.floor(diff / 30) + 1;
  return house > 12 ? house - 12 : house;
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
): { natalPlanet: string; aspectType: string; intensity: number } | null => {
  for (const natal of natalChart) {
    let diff = Math.abs(
      transitPlanet.eclipticLongitude - natal.eclipticLongitude,
    );
    if (diff > 180) diff = 360 - diff;

    // Check for major aspects
    if (Math.abs(diff - 0) <= 8) {
      return {
        natalPlanet: natal.body,
        aspectType: 'conjunction',
        intensity: 10 - Math.abs(diff - 0),
      };
    } else if (Math.abs(diff - 180) <= 8) {
      return {
        natalPlanet: natal.body,
        aspectType: 'opposition',
        intensity: 10 - Math.abs(diff - 180),
      };
    } else if (Math.abs(diff - 120) <= 6) {
      return {
        natalPlanet: natal.body,
        aspectType: 'trine',
        intensity: 8 - Math.abs(diff - 120),
      };
    } else if (Math.abs(diff - 90) <= 6) {
      return {
        natalPlanet: natal.body,
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
      house = calculateHouse(
        transitPlanet.eclipticLongitude,
        ascendant.eclipticLongitude,
      );
      houseMeaning = getHouseMeaning(house);
    } else {
      // Fallback to Sun-based calculation
      const natalSun = natalChart.find((p: any) => p.body === 'Sun');
      if (natalSun) {
        let diff = transitPlanet.eclipticLongitude - natalSun.eclipticLongitude;
        if (diff < 0) diff += 360;
        const approximateHouse = Math.floor(diff / 30) + 1;
        house =
          approximateHouse > 12 ? approximateHouse - 12 : approximateHouse;
        houseMeaning = getHouseMeaning(house);
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

    impacts.push({
      ...transit,
      personalImpact,
      house,
      houseMeaning,
      aspectToNatal: aspectToNatal || undefined,
    });
  }

  return impacts;
};
