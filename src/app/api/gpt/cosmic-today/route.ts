import { NextRequest, NextResponse } from 'next/server';
import {
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
} from '../../../../../utils/astrology/cosmic-og';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 3600;

function getZodiacSign(longitude: number): string {
  const signs = [
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
  const index = Math.floor((((longitude % 360) + 360) % 360) / 30);
  return signs[index];
}

function getMoonEmoji(phase: string): string {
  const emojiMap: Record<string, string> = {
    'New Moon': '🌑',
    'Waxing Crescent': '🌒',
    'First Quarter': '🌓',
    'Waxing Gibbous': '🌔',
    'Full Moon': '🌕',
    'Waning Gibbous': '🌖',
    'Last Quarter': '🌗',
    'Waning Crescent': '🌘',
  };
  return emojiMap[phase] || '🌙';
}

function generateHeadline(positions: any, moonPhase: any): string {
  const headlines = [
    `Moon in ${getZodiacSign(positions.moon?.longitude || 0)}: ${moonPhase.name} energy`,
    `${moonPhase.name} in ${getZodiacSign(positions.moon?.longitude || 0)}`,
    `Cosmic weather: ${moonPhase.name} vibes`,
  ];
  return headlines[Math.floor(Math.random() * headlines.length)];
}

function generateSummary(moonPhase: any): string {
  const summaries: Record<string, string> = {
    'New Moon':
      'A time for new beginnings, intention setting, and planting seeds for the future. Great for starting fresh projects.',
    'Waxing Crescent':
      'Building momentum. Take action on your New Moon intentions and start moving toward your goals.',
    'First Quarter':
      'A turning point requiring decision and action. Challenges may arise but push through.',
    'Waxing Gibbous':
      'Refine and adjust. Your efforts are building—fine-tune your approach before the Full Moon.',
    'Full Moon':
      'Peak energy and illumination. Celebrate achievements, release what no longer serves, and embrace clarity.',
    'Waning Gibbous':
      "Time for gratitude and sharing wisdom. Reflect on what you've learned this cycle.",
    'Last Quarter':
      "Release and let go. Clear out what isn't working and prepare for the next cycle.",
    'Waning Crescent':
      'Rest and restore. A time for introspection, healing, and preparing for the New Moon.',
  };
  return summaries[moonPhase.name] || 'Connect with the cosmic energy today.';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    const today = dateParam ? new Date(dateParam) : new Date();
    const targetDate = new Date(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T12:00:00Z`,
    );

    const positions = getRealPlanetaryPositions(targetDate);
    const moonPhase = getAccurateMoonPhase(targetDate);

    const sunSign = getZodiacSign(positions.sun?.longitude || 0);
    const moonSign = getZodiacSign(positions.moon?.longitude || 0);

    const keyTransits = [];

    if (positions.mercury) {
      keyTransits.push({
        label: `Mercury in ${getZodiacSign(positions.mercury.longitude)}`,
        impact: 'Communication and thought patterns',
        intensity: 0.6,
      });
    }

    if (positions.venus) {
      keyTransits.push({
        label: `Venus in ${getZodiacSign(positions.venus.longitude)}`,
        impact: 'Love, beauty, and relationships',
        intensity: 0.5,
      });
    }

    if (positions.mars) {
      keyTransits.push({
        label: `Mars in ${getZodiacSign(positions.mars.longitude)}`,
        impact: 'Action, drive, and energy',
        intensity: 0.7,
      });
    }

    const response = {
      date: targetDate.toISOString().split('T')[0],
      headline: generateHeadline(positions, moonPhase),
      summary: generateSummary(moonPhase),
      moonPhase: {
        name: moonPhase.name,
        emoji: getMoonEmoji(moonPhase.name),
        sign: moonSign,
        illumination: Math.round(moonPhase.illumination * 100),
      },
      sunSign,
      keyTransits,
      ctaUrl: 'https://lunary.app/welcome?from=gpt_cosmic_today',
      ctaText: 'Get personalized cosmic insights for your birth chart',
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('GPT cosmic-today error:', error);
    return NextResponse.json(
      { error: 'Failed to generate cosmic weather' },
      { status: 500 },
    );
  }
}
