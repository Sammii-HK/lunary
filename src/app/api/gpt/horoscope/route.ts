import { NextRequest, NextResponse } from 'next/server';
import {
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
} from '../../../../../utils/astrology/cosmic-og';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const ZODIAC_SIGNS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const;

type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

const SIGN_DATA: Record<
  ZodiacSign,
  { element: string; ruler: string; modality: string }
> = {
  aries: { element: 'Fire', ruler: 'Mars', modality: 'Cardinal' },
  taurus: { element: 'Earth', ruler: 'Venus', modality: 'Fixed' },
  gemini: { element: 'Air', ruler: 'Mercury', modality: 'Mutable' },
  cancer: { element: 'Water', ruler: 'Moon', modality: 'Cardinal' },
  leo: { element: 'Fire', ruler: 'Sun', modality: 'Fixed' },
  virgo: { element: 'Earth', ruler: 'Mercury', modality: 'Mutable' },
  libra: { element: 'Air', ruler: 'Venus', modality: 'Cardinal' },
  scorpio: { element: 'Water', ruler: 'Pluto', modality: 'Fixed' },
  sagittarius: { element: 'Fire', ruler: 'Jupiter', modality: 'Mutable' },
  capricorn: { element: 'Earth', ruler: 'Saturn', modality: 'Cardinal' },
  aquarius: { element: 'Air', ruler: 'Uranus', modality: 'Fixed' },
  pisces: { element: 'Water', ruler: 'Neptune', modality: 'Mutable' },
};

const HOROSCOPE_TEMPLATES: Record<string, string[]> = {
  Fire: [
    'Your fiery energy is amplified today. Channel it into creative projects.',
    'Passion drives you forward. Let your enthusiasm inspire others.',
    'Your natural leadership shines. Take the initiative on something meaningful.',
  ],
  Earth: [
    'Ground yourself in practical matters today. Steady progress wins.',
    'Your patient approach pays off. Trust the process and keep building.',
    'Material concerns are highlighted. Focus on security and stability.',
  ],
  Air: [
    'Communication flows easily today. Share your ideas freely.',
    'Your mind is sharp and curious. Learn something new.',
    'Social connections bring opportunities. Network and collaborate.',
  ],
  Water: [
    'Trust your intuition today—it guides you true.',
    'Emotional depth brings insight. Honor your feelings.',
    'Your empathy is a strength. Connect deeply with loved ones.',
  ],
};

function generateHoroscope(
  sign: ZodiacSign,
  moonPhase: string,
  sunSign: string,
): string {
  const { element } = SIGN_DATA[sign];
  const templates = HOROSCOPE_TEMPLATES[element];
  const baseHoroscope = templates[Math.floor(Math.random() * templates.length)];

  const moonAdditions: Record<string, string> = {
    'New Moon': ' The New Moon supports fresh starts and intention-setting.',
    'Waxing Crescent': ' Building momentum—take action on recent ideas.',
    'First Quarter':
      ' Face challenges head-on. Obstacles lead to breakthroughs.',
    'Waxing Gibbous': ' Refine your approach as the Full Moon approaches.',
    'Full Moon': ' Emotions run high. Celebrate achievements and release.',
    'Waning Gibbous': ' Share wisdom gained. Gratitude amplifies blessings.',
    'Last Quarter': ' Let go of what no longer serves your growth.',
    'Waning Crescent': ' Rest and reflect. Recharge before the new cycle.',
  };

  return baseHoroscope + (moonAdditions[moonPhase] || '');
}

function getLuckyNumber(sign: ZodiacSign): number {
  const baseNumbers: Record<ZodiacSign, number[]> = {
    aries: [1, 9, 17],
    taurus: [2, 6, 24],
    gemini: [3, 7, 12],
    cancer: [2, 7, 11],
    leo: [1, 4, 19],
    virgo: [5, 14, 23],
    libra: [6, 15, 24],
    scorpio: [8, 11, 22],
    sagittarius: [3, 9, 21],
    capricorn: [4, 8, 22],
    aquarius: [4, 7, 11],
    pisces: [3, 9, 12],
  };
  const numbers = baseNumbers[sign];
  return numbers[Math.floor(Math.random() * numbers.length)];
}

function getLuckyColor(sign: ZodiacSign): string {
  const colors: Record<ZodiacSign, string[]> = {
    aries: ['Red', 'Orange', 'Gold'],
    taurus: ['Green', 'Pink', 'Earth tones'],
    gemini: ['Yellow', 'Light blue', 'Silver'],
    cancer: ['Silver', 'White', 'Sea green'],
    leo: ['Gold', 'Orange', 'Purple'],
    virgo: ['Navy', 'Brown', 'Forest green'],
    libra: ['Pink', 'Light blue', 'Lavender'],
    scorpio: ['Black', 'Deep red', 'Burgundy'],
    sagittarius: ['Purple', 'Blue', 'Turquoise'],
    capricorn: ['Brown', 'Black', 'Dark green'],
    aquarius: ['Electric blue', 'Silver', 'Violet'],
    pisces: ['Sea green', 'Lavender', 'Aqua'],
  };
  const signColors = colors[sign];
  return signColors[Math.floor(Math.random() * signColors.length)];
}

function getCompatibility(sign: ZodiacSign): string {
  const compatible: Record<ZodiacSign, string[]> = {
    aries: ['Leo', 'Sagittarius', 'Gemini'],
    taurus: ['Virgo', 'Capricorn', 'Cancer'],
    gemini: ['Libra', 'Aquarius', 'Aries'],
    cancer: ['Scorpio', 'Pisces', 'Taurus'],
    leo: ['Aries', 'Sagittarius', 'Gemini'],
    virgo: ['Taurus', 'Capricorn', 'Cancer'],
    libra: ['Gemini', 'Aquarius', 'Leo'],
    scorpio: ['Cancer', 'Pisces', 'Virgo'],
    sagittarius: ['Aries', 'Leo', 'Libra'],
    capricorn: ['Taurus', 'Virgo', 'Scorpio'],
    aquarius: ['Gemini', 'Libra', 'Sagittarius'],
    pisces: ['Cancer', 'Scorpio', 'Capricorn'],
  };
  const signs = compatible[sign];
  return signs[Math.floor(Math.random() * signs.length)];
}

function getMood(moonPhase: string): string {
  const moods: Record<string, string[]> = {
    'New Moon': ['Reflective', 'Hopeful', 'Introspective'],
    'Waxing Crescent': ['Optimistic', 'Determined', 'Energized'],
    'First Quarter': ['Motivated', 'Challenged', 'Focused'],
    'Waxing Gibbous': ['Anticipatory', 'Productive', 'Refined'],
    'Full Moon': ['Emotional', 'Illuminated', 'Celebratory'],
    'Waning Gibbous': ['Grateful', 'Wise', 'Sharing'],
    'Last Quarter': ['Releasing', 'Processing', 'Clearing'],
    'Waning Crescent': ['Restful', 'Contemplative', 'Peaceful'],
  };
  const options = moods[moonPhase] || ['Balanced'];
  return options[Math.floor(Math.random() * options.length)];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const signParam = searchParams.get('sign')?.toLowerCase();
    const dateParam = searchParams.get('date');

    if (!signParam || !ZODIAC_SIGNS.includes(signParam as ZodiacSign)) {
      return NextResponse.json(
        {
          error: 'Valid zodiac sign required',
          validSigns: ZODIAC_SIGNS,
        },
        { status: 400 },
      );
    }

    const sign = signParam as ZodiacSign;
    const today = dateParam ? new Date(dateParam) : new Date();
    const targetDate = new Date(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T12:00:00Z`,
    );

    const positions = getRealPlanetaryPositions(targetDate);
    const moonPhase = getAccurateMoonPhase(targetDate);

    const sunLongitude = positions.sun?.longitude || 0;
    const sunSign =
      ZODIAC_SIGNS[Math.floor((((sunLongitude % 360) + 360) % 360) / 30)];

    const response = {
      sign: sign.charAt(0).toUpperCase() + sign.slice(1),
      date: targetDate.toISOString().split('T')[0],
      horoscope: generateHoroscope(sign, moonPhase.name, sunSign),
      mood: getMood(moonPhase.name),
      luckyNumber: getLuckyNumber(sign),
      luckyColor: getLuckyColor(sign),
      compatibility: getCompatibility(sign),
      moonPhase: moonPhase.name,
      element: SIGN_DATA[sign].element,
      ctaUrl: `https://lunary.app/horoscope?sign=${sign}&from=gpt_horoscope`,
      ctaText: 'Get your personalized daily horoscope based on your full chart',
      source: 'Lunary.app - Personalized astrology with real astronomical data',
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('GPT horoscope error:', error);
    return NextResponse.json(
      { error: 'Failed to generate horoscope' },
      { status: 500 },
    );
  }
}
