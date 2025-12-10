import { NextRequest, NextResponse } from 'next/server';
import { getRealPlanetaryPositions } from '../../../../../utils/astrology/cosmic-og';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 3600;

interface RetrogradeInfo {
  planet: string;
  isRetrograde: boolean;
  meaning: string;
  advice: string;
}

const RETROGRADE_MEANINGS: Record<string, { meaning: string; advice: string }> =
  {
    mercury: {
      meaning:
        'Communication challenges, technology glitches, travel delays, misunderstandings. Great for revision and reflection.',
      advice:
        'Double-check communications, back up data, avoid signing contracts if possible, reconnect with old friends.',
    },
    venus: {
      meaning:
        'Relationship reviews, past lovers returning, reconsidering values and aesthetics.',
      advice:
        'Avoid major relationship decisions, reflect on what you truly value, reconnect with self-love.',
    },
    mars: {
      meaning:
        'Frustration, misdirected energy, delays in action, reviewing goals and motivations.',
      advice:
        'Plan rather than act, avoid conflicts, channel energy into completing old projects.',
    },
    jupiter: {
      meaning:
        'Inner growth focus, reassessing beliefs and life philosophy, spiritual introspection.',
      advice:
        'Reflect on your goals and beliefs, focus on inner wisdom rather than external expansion.',
    },
    saturn: {
      meaning:
        'Reviewing structures, boundaries, and responsibilities. Karmic lessons resurface.',
      advice:
        'Address old responsibilities, restructure rather than build new, face delayed consequences.',
    },
    uranus: {
      meaning: 'Internal revolution, reassessing need for freedom and change.',
      advice:
        'Process changes internally before acting, avoid impulsive rebellion.',
    },
    neptune: {
      meaning:
        'Clarity emerging from confusion, spiritual reassessment, confronting illusions.',
      advice:
        'Ground your spirituality, distinguish dreams from delusions, creative introspection.',
    },
    pluto: {
      meaning:
        'Deep psychological review, confronting shadow material, transformation from within.',
      advice:
        'Inner healing work, release what no longer serves, prepare for rebirth.',
    },
  };

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    const today = dateParam ? new Date(dateParam) : new Date();
    const positions = getRealPlanetaryPositions(today);

    const retrogrades: RetrogradeInfo[] = [];

    const planetsToCheck = [
      'mercury',
      'venus',
      'mars',
      'jupiter',
      'saturn',
      'uranus',
      'neptune',
      'pluto',
    ];

    for (const planet of planetsToCheck) {
      const pos = positions[planet as keyof typeof positions];
      if (pos) {
        const isRetro = pos.isRetrograde || false;
        const info = RETROGRADE_MEANINGS[planet];
        retrogrades.push({
          planet: planet.charAt(0).toUpperCase() + planet.slice(1),
          isRetrograde: isRetro,
          meaning: isRetro
            ? info.meaning
            : 'Direct motion - energy flows normally',
          advice: isRetro ? info.advice : 'Move forward with plans',
        });
      }
    }

    const activeRetrogrades = retrogrades.filter((r) => r.isRetrograde);

    const response = {
      date: today.toISOString().split('T')[0],
      summary:
        activeRetrogrades.length === 0
          ? 'No planets are currently retrograde. Energy flows freely for new initiatives.'
          : `${activeRetrogrades.length} planet(s) retrograde: ${activeRetrogrades.map((r) => r.planet).join(', ')}`,
      activeRetrogrades: activeRetrogrades.map((r) => ({
        planet: r.planet,
        meaning: r.meaning,
        advice: r.advice,
      })),
      allPlanets: retrogrades,
      generalAdvice:
        activeRetrogrades.length >= 3
          ? 'Multiple retrogrades suggest a time for review, not new beginnings.'
          : activeRetrogrades.length >= 1
            ? 'Some areas benefit from review. Check specific planets for guidance.'
            : 'Clear skies for forward momentum. Act on your plans.',
      ctaUrl: 'https://lunary.app/cosmic-state?from=gpt_retrograde',
      ctaText: 'See full planetary positions and transits',
      source: 'Lunary.app - Real-time astronomical calculations',
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('GPT retrograde error:', error);
    return NextResponse.json(
      { error: 'Failed to check retrograde status' },
      { status: 500 },
    );
  }
}
