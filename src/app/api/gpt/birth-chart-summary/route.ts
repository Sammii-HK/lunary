import { NextRequest, NextResponse } from 'next/server';
import { requireGptAuth } from '@/lib/gptAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ZODIAC_SIGNS = [
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

function getZodiacSign(longitude: number): string {
  const index = Math.floor((((longitude % 360) + 360) % 360) / 30);
  return ZODIAC_SIGNS[index];
}

function getHouse(longitude: number, ascendantLongitude: number): number {
  const diff = (longitude - ascendantLongitude + 360) % 360;
  return Math.floor(diff / 30) + 1;
}

function calculatePlanetPosition(date: Date, planet: string): number {
  const J2000 = 2451545.0;
  const daysSinceJ2000 = date.getTime() / 86400000 + 2440587.5 - J2000;

  const orbitalPeriods: Record<string, number> = {
    sun: 365.25,
    moon: 27.32,
    mercury: 87.97,
    venus: 224.7,
    mars: 686.98,
    jupiter: 4332.59,
    saturn: 10759.22,
  };

  const basePositions: Record<string, number> = {
    sun: 280.46,
    moon: 218.32,
    mercury: 252.25,
    venus: 181.98,
    mars: 355.43,
    jupiter: 34.35,
    saturn: 50.07,
  };

  const period = orbitalPeriods[planet] || 365.25;
  const base = basePositions[planet] || 0;
  const motion = (360 / period) * daysSinceJ2000;

  return (base + motion) % 360;
}

function calculateAscendant(
  date: Date,
  latitude: number,
  longitude: number,
): number {
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const lst = (hours * 15 + longitude + 360) % 360;
  return (lst + 90) % 360;
}

function generateSummary(
  sunSign: string,
  moonSign: string,
  risingSign: string,
): string {
  const summaries: Record<string, string> = {
    Fire: 'passionate, energetic, and driven',
    Earth: 'grounded, practical, and reliable',
    Air: 'intellectual, communicative, and social',
    Water: 'intuitive, emotional, and deeply feeling',
  };

  const elements: Record<string, string> = {
    Aries: 'Fire',
    Taurus: 'Earth',
    Gemini: 'Air',
    Cancer: 'Water',
    Leo: 'Fire',
    Virgo: 'Earth',
    Libra: 'Air',
    Scorpio: 'Water',
    Sagittarius: 'Fire',
    Capricorn: 'Earth',
    Aquarius: 'Air',
    Pisces: 'Water',
  };

  const sunElement = elements[sunSign];
  const moonElement = elements[moonSign];

  return `Your ${sunSign} Sun makes you ${summaries[sunElement]}. With your Moon in ${moonSign}, your emotional nature is ${summaries[moonElement]}. Your ${risingSign} Rising shapes how others first perceive you.`;
}

function generateThemes(sunSign: string, moonSign: string): string[] {
  const themes: Record<string, string[]> = {
    Aries: ['leadership', 'initiative', 'courage'],
    Taurus: ['stability', 'sensuality', 'determination'],
    Gemini: ['communication', 'curiosity', 'adaptability'],
    Cancer: ['nurturing', 'emotional depth', 'home'],
    Leo: ['creativity', 'self-expression', 'confidence'],
    Virgo: ['service', 'analysis', 'improvement'],
    Libra: ['harmony', 'partnership', 'beauty'],
    Scorpio: ['transformation', 'intensity', 'depth'],
    Sagittarius: ['expansion', 'adventure', 'wisdom'],
    Capricorn: ['ambition', 'discipline', 'mastery'],
    Aquarius: ['innovation', 'independence', 'humanitarianism'],
    Pisces: ['compassion', 'intuition', 'spirituality'],
  };

  return [...(themes[sunSign] || []), ...(themes[moonSign] || [])].slice(0, 4);
}

export async function POST(request: NextRequest) {
  const unauthorized = requireGptAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { birthDate, birthTime, birthLocation } = body;

    if (!birthDate) {
      return NextResponse.json(
        { error: 'birthDate is required' },
        { status: 400 },
      );
    }

    const [year, month, day] = birthDate.split('-').map(Number);
    let hours = 12,
      minutes = 0;

    if (birthTime) {
      const [h, m] = birthTime.split(':').map(Number);
      hours = h;
      minutes = m || 0;
    }

    const date = new Date(Date.UTC(year, month - 1, day, hours, minutes));

    let latitude = 51.5074;
    let longitude = -0.1278;

    if (birthLocation) {
      const locationCoords: Record<string, [number, number]> = {
        london: [51.5074, -0.1278],
        'new york': [40.7128, -74.006],
        'los angeles': [34.0522, -118.2437],
        paris: [48.8566, 2.3522],
        tokyo: [35.6762, 139.6503],
        sydney: [-33.8688, 151.2093],
      };

      const locationKey = birthLocation.toLowerCase().split(',')[0].trim();
      if (locationCoords[locationKey]) {
        [latitude, longitude] = locationCoords[locationKey];
      }
    }

    const sunLongitude = calculatePlanetPosition(date, 'sun');
    const moonLongitude = calculatePlanetPosition(date, 'moon');
    const ascendantLongitude = calculateAscendant(date, latitude, longitude);

    const sunSign = getZodiacSign(sunLongitude);
    const moonSign = getZodiacSign(moonLongitude);
    const risingSign = getZodiacSign(ascendantLongitude);

    const sunHouse = getHouse(sunLongitude, ascendantLongitude);
    const moonHouse = getHouse(moonLongitude, ascendantLongitude);

    const response = {
      sun: { sign: sunSign, house: sunHouse },
      moon: { sign: moonSign, house: moonHouse },
      rising: { sign: risingSign },
      summary: generateSummary(sunSign, moonSign, risingSign),
      themes: generateThemes(sunSign, moonSign),
      limitationsNote:
        'This is a brief flavour based on your Big Three. A full birth chart includes all planets, houses, and aspects.',
      ctaUrl: 'https://lunary.app/welcome?from=gpt_birth_flavour',
      ctaText:
        'Get your complete personalized birth chart with full interpretations',
      source:
        'Lunary.app - Birth chart analysis with astronomical calculations',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('GPT birth-chart-summary error:', error);
    return NextResponse.json(
      { error: 'Failed to generate birth chart summary' },
      { status: 500 },
    );
  }
}
