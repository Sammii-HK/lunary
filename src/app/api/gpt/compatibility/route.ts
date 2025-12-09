import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

const ELEMENTS: Record<ZodiacSign, string> = {
  aries: 'Fire',
  taurus: 'Earth',
  gemini: 'Air',
  cancer: 'Water',
  leo: 'Fire',
  virgo: 'Earth',
  libra: 'Air',
  scorpio: 'Water',
  sagittarius: 'Fire',
  capricorn: 'Earth',
  aquarius: 'Air',
  pisces: 'Water',
};

const MODALITIES: Record<ZodiacSign, string> = {
  aries: 'Cardinal',
  taurus: 'Fixed',
  gemini: 'Mutable',
  cancer: 'Cardinal',
  leo: 'Fixed',
  virgo: 'Mutable',
  libra: 'Cardinal',
  scorpio: 'Fixed',
  sagittarius: 'Mutable',
  capricorn: 'Cardinal',
  aquarius: 'Fixed',
  pisces: 'Mutable',
};

function calculateCompatibilityScore(
  sign1: ZodiacSign,
  sign2: ZodiacSign,
): number {
  const element1 = ELEMENTS[sign1];
  const element2 = ELEMENTS[sign2];
  const modality1 = MODALITIES[sign1];
  const modality2 = MODALITIES[sign2];

  let score = 50; // Base score

  // Same element = high compatibility
  if (element1 === element2) {
    score += 25;
  }

  // Complementary elements
  const complementary: Record<string, string> = {
    Fire: 'Air',
    Air: 'Fire',
    Earth: 'Water',
    Water: 'Earth',
  };
  if (complementary[element1] === element2) {
    score += 20;
  }

  // Opposite elements (challenging but can work)
  if (
    (element1 === 'Fire' && element2 === 'Water') ||
    (element1 === 'Water' && element2 === 'Fire') ||
    (element1 === 'Earth' && element2 === 'Air') ||
    (element1 === 'Air' && element2 === 'Earth')
  ) {
    score -= 5;
  }

  // Same modality = can be competitive
  if (modality1 === modality2) {
    score -= 5;
  }

  // Same sign = very compatible
  if (sign1 === sign2) {
    score = 85;
  }

  // Opposite signs (6 signs apart) = attraction of opposites
  const signIndex1 = ZODIAC_SIGNS.indexOf(sign1);
  const signIndex2 = ZODIAC_SIGNS.indexOf(sign2);
  if (Math.abs(signIndex1 - signIndex2) === 6) {
    score = 75;
  }

  return Math.min(100, Math.max(30, score));
}

function getCompatibilityLevel(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Very Good';
  if (score >= 55) return 'Good';
  if (score >= 40) return 'Challenging but Growth-Oriented';
  return 'Requires Work';
}

function generateSummary(
  sign1: ZodiacSign,
  sign2: ZodiacSign,
  score: number,
): string {
  const s1 = sign1.charAt(0).toUpperCase() + sign1.slice(1);
  const s2 = sign2.charAt(0).toUpperCase() + sign2.slice(1);
  const element1 = ELEMENTS[sign1];
  const element2 = ELEMENTS[sign2];

  if (score >= 85) {
    return `${s1} and ${s2} share a natural harmony. Both ${element1 === element2 ? `${element1} signs` : 'signs'} understand each other intuitively and support each other's growth.`;
  }
  if (score >= 70) {
    return `${s1} and ${s2} complement each other well. ${element1} and ${element2} energies combine to create balance and mutual understanding.`;
  }
  if (score >= 55) {
    return `${s1} and ${s2} can build a solid connection with effort. Their different approaches (${element1} meets ${element2}) offer opportunities for growth.`;
  }
  return `${s1} and ${s2} face challenges but can learn from each other. ${element1} and ${element2} energies require patience and understanding to harmonize.`;
}

function getStrengths(sign1: ZodiacSign, sign2: ZodiacSign): string[] {
  const element1 = ELEMENTS[sign1];
  const element2 = ELEMENTS[sign2];
  const strengths: string[] = [];

  if (element1 === element2) {
    strengths.push('Natural understanding and shared values');
    strengths.push('Similar communication styles');
    strengths.push('Aligned life goals and priorities');
  }

  if (element1 === 'Fire' || element2 === 'Fire') {
    strengths.push('Passion and excitement in the relationship');
  }
  if (element1 === 'Earth' || element2 === 'Earth') {
    strengths.push('Stability and practical support');
  }
  if (element1 === 'Air' || element2 === 'Air') {
    strengths.push('Strong intellectual connection');
  }
  if (element1 === 'Water' || element2 === 'Water') {
    strengths.push('Deep emotional bond and intuition');
  }

  return strengths.slice(0, 4);
}

function getChallenges(sign1: ZodiacSign, sign2: ZodiacSign): string[] {
  const element1 = ELEMENTS[sign1];
  const element2 = ELEMENTS[sign2];
  const challenges: string[] = [];

  if (element1 === element2) {
    challenges.push("May reinforce each other's weaknesses");
    challenges.push('Can lack balance without outside perspectives');
  }

  if (
    (element1 === 'Fire' && element2 === 'Water') ||
    (element1 === 'Water' && element2 === 'Fire')
  ) {
    challenges.push("Fire's directness may overwhelm Water's sensitivity");
    challenges.push('Different emotional expression styles');
  }

  if (
    (element1 === 'Earth' && element2 === 'Air') ||
    (element1 === 'Air' && element2 === 'Earth')
  ) {
    challenges.push('Earth may find Air too detached');
    challenges.push('Different approaches to decision-making');
  }

  if (challenges.length === 0) {
    challenges.push('Minor differences in communication style');
    challenges.push('Different energy levels at times');
  }

  return challenges.slice(0, 3);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sign1Param = searchParams.get('sign1')?.toLowerCase();
    const sign2Param = searchParams.get('sign2')?.toLowerCase();

    if (
      !sign1Param ||
      !sign2Param ||
      !ZODIAC_SIGNS.includes(sign1Param as ZodiacSign) ||
      !ZODIAC_SIGNS.includes(sign2Param as ZodiacSign)
    ) {
      return NextResponse.json(
        {
          error: 'Two valid zodiac signs required (sign1 and sign2)',
          validSigns: ZODIAC_SIGNS,
        },
        { status: 400 },
      );
    }

    const sign1 = sign1Param as ZodiacSign;
    const sign2 = sign2Param as ZodiacSign;
    const score = calculateCompatibilityScore(sign1, sign2);

    const response = {
      sign1: sign1.charAt(0).toUpperCase() + sign1.slice(1),
      sign2: sign2.charAt(0).toUpperCase() + sign2.slice(1),
      compatibilityScore: score,
      compatibilityLevel: getCompatibilityLevel(score),
      summary: generateSummary(sign1, sign2, score),
      elements: {
        sign1: ELEMENTS[sign1],
        sign2: ELEMENTS[sign2],
      },
      modalities: {
        sign1: MODALITIES[sign1],
        sign2: MODALITIES[sign2],
      },
      strengths: getStrengths(sign1, sign2),
      challenges: getChallenges(sign1, sign2),
      advice:
        score >= 70
          ? 'Focus on maintaining your natural connection through quality time together.'
          : 'Communication and patience are key. Embrace your differences as opportunities for growth.',
      ctaUrl: `https://lunary.app/grimoire/compatibility/${sign1}-${sign2}?from=gpt_compatibility`,
      ctaText: 'Get a detailed compatibility reading with synastry analysis',
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control':
          'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('GPT compatibility error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate compatibility' },
      { status: 500 },
    );
  }
}
