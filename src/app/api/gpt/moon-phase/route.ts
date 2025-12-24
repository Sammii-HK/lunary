import { NextRequest, NextResponse } from 'next/server';
import {
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
} from '../../../../../utils/astrology/cosmic-og';
import { requireGptAuth } from '@/lib/gptAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const MOON_PHASE_GUIDANCE: Record<
  string,
  { energy: string; bestFor: string[]; avoid: string[] }
> = {
  'New Moon': {
    energy: 'Fresh starts, planting seeds, setting intentions',
    bestFor: [
      'Setting intentions',
      'Starting new projects',
      'Making wishes',
      'Meditation',
      'Rest and reflection',
    ],
    avoid: ['Major launches', 'Expecting immediate results', 'Overexertion'],
  },
  'Waxing Crescent': {
    energy: 'Building momentum, taking first steps, commitment',
    bestFor: [
      'Taking action on intentions',
      'Building habits',
      'Making plans',
      'Gathering resources',
    ],
    avoid: ['Giving up on new goals', 'Major changes to plans'],
  },
  'First Quarter': {
    energy: 'Challenges, decision-making, commitment testing',
    bestFor: [
      'Making decisions',
      'Overcoming obstacles',
      'Taking action',
      'Problem-solving',
    ],
    avoid: ['Avoiding challenges', 'Indecision', 'Quitting'],
  },
  'Waxing Gibbous': {
    energy: 'Refinement, adjustment, near-completion',
    bestFor: [
      'Editing and refining',
      'Making adjustments',
      'Preparing for culmination',
      'Fine-tuning projects',
    ],
    avoid: ['Starting new projects', 'Major overhauls'],
  },
  'Full Moon': {
    energy: 'Culmination, illumination, release, celebration',
    bestFor: [
      'Releasing what no longer serves',
      'Celebrating achievements',
      'Charging crystals',
      'Gratitude rituals',
      'Manifestation work',
    ],
    avoid: ['Making impulsive decisions', 'Emotional confrontations'],
  },
  'Waning Gibbous': {
    energy: 'Gratitude, sharing, teaching, introspection',
    bestFor: [
      'Sharing wisdom',
      'Gratitude practices',
      'Teaching others',
      'Reflection',
    ],
    avoid: ['Starting new ventures', 'Ignoring lessons learned'],
  },
  'Last Quarter': {
    energy: 'Letting go, clearing, forgiveness, release',
    bestFor: [
      'Releasing old patterns',
      'Forgiveness work',
      'Decluttering',
      'Ending what no longer works',
    ],
    avoid: ['Starting new projects', 'Holding onto the past'],
  },
  'Waning Crescent': {
    energy: 'Rest, surrender, preparation, healing',
    bestFor: [
      'Rest and recuperation',
      'Meditation',
      'Healing work',
      'Preparing for new cycle',
    ],
    avoid: ['Overexertion', 'Major initiatives', 'Forcing outcomes'],
  },
};

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

export async function GET(request: NextRequest) {
  const unauthorized = requireGptAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    const today = dateParam ? new Date(dateParam) : new Date();
    const positions = getRealPlanetaryPositions(today);
    const moonPhase = getAccurateMoonPhase(today);

    const moonSign = getZodiacSign(positions.moon?.longitude || 0);
    const guidance =
      MOON_PHASE_GUIDANCE[moonPhase.name] || MOON_PHASE_GUIDANCE['New Moon'];

    const response = {
      date: today.toISOString().split('T')[0],
      phase: {
        name: moonPhase.name,
        emoji: getMoonEmoji(moonPhase.name),
        illumination: Math.round(moonPhase.illumination * 100),
        illuminationPercent: `${Math.round(moonPhase.illumination * 100)}%`,
      },
      moonSign,
      energy: guidance.energy,
      bestFor: guidance.bestFor,
      avoid: guidance.avoid,
      ritualSuggestion:
        moonPhase.name === 'Full Moon'
          ? 'Perfect time for a Full Moon release ritual or crystal charging'
          : moonPhase.name === 'New Moon'
            ? 'Ideal for intention setting and new beginnings ritual'
            : `${moonPhase.name} supports ${guidance.bestFor[0].toLowerCase()}`,
      ctaUrl: `https://lunary.app/moon-calendar?from=gpt_moon_phase`,
      ctaText: 'Track moon phases with Lunary',
      source: 'Lunary.app - Real-time moon phase calculations',
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('GPT moon-phase error:', error);
    return NextResponse.json(
      { error: 'Failed to get moon phase' },
      { status: 500 },
    );
  }
}
