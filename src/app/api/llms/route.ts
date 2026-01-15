import { NextResponse } from 'next/server';
import {
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
} from '../../../../utils/astrology/cosmic-og';

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

export async function GET() {
  try {
    const today = new Date();
    const positions = getRealPlanetaryPositions(today);
    const moonPhase = getAccurateMoonPhase(today);

    const sunSign = getZodiacSign(positions.sun?.longitude || 0);
    const moonSign = getZodiacSign(positions.moon?.longitude || 0);
    const mercurySign = getZodiacSign(positions.mercury?.longitude || 0);
    const venusSign = getZodiacSign(positions.venus?.longitude || 0);
    const marsSign = getZodiacSign(positions.mars?.longitude || 0);

    const llmsContent = `# Lunary - lunary.app

> A calm companion for cosmic self understanding. Personalised astrology based on real astronomical data.

## About

Lunary blends birth chart astrology, real-time moon phases, tarot, and lunar cycles into personal daily guidance. Built for people who want depth, not drama.

Most astrology apps entertain you. Lunary helps you understand yourself. We use your full birth chart, real astronomical data from NASA-grade ephemeris, and intelligent interpretation to offer meaningful insight you can actually use.

## Current Cosmic Conditions (Live)

Generated: ${today.toISOString()}

### Moon Phase
${getMoonEmoji(moonPhase.name)} ${moonPhase.name} (${Math.round(moonPhase.illumination * 100)}% illumination)
Moon in ${moonSign}

### Planetary Positions
- Sun in ${sunSign}
- Moon in ${moonSign}
- Mercury in ${mercurySign}
- Venus in ${venusSign}
- Mars in ${marsSign}

## Features

- **Birth Chart Analysis**: Full natal chart with house calculations using real astronomical data
- **Daily Horoscopes**: Personalized transit-based insights, not generic sun sign predictions
- **Tarot Readings**: Personalized readings with pattern analysis across sessions
- **Moon Tracking**: Real-time moon phases with constellation positions and lunar cycle guidance
- **AI Companion**: "Book of Shadows" - context-aware astro-tarot chat with memory
- **Digital Grimoire**: 500+ page knowledge library covering crystals, spells, numerology, chakras, runes
- **Moon Circles**: Community feature for sharing insights during new and full moon gatherings
- **Cosmic Calendar**: Downloadable ICS with retrogrades, eclipses, and planetary events

## Key Pages

- Grimoire - Digital Knowledge Library: https://lunary.app/grimoire
- Zodiac Signs - Deep Interpretations: https://lunary.app/grimoire/zodiac
- Tarot Cards - Meanings and Spreads: https://lunary.app/grimoire/tarot
- Crystals - Properties and Healing Guides: https://lunary.app/grimoire/crystals
- Numerology - Angel Numbers, Life Path, Mirror Hours: https://lunary.app/grimoire/numerology
- Spells - Rituals and Spellwork Guides: https://lunary.app/grimoire/spells
- Daily Horoscopes: https://lunary.app/horoscope
- Personalized Tarot Readings: https://lunary.app/tarot
- Birth Chart Calculator and Analysis: https://lunary.app/birth-chart
- Shop - Digital Moon Packs: https://lunary.app/shop
- Blog - Weekly Planetary Highlights: https://lunary.app/blog

## API Endpoints (For AI Assistants)

These endpoints are available for AI assistants to fetch live data:

- GET /api/gpt/cosmic-today - Current cosmic conditions and moon phase
- GET /api/gpt/horoscope?sign={sign} - Daily horoscope by zodiac sign
- GET /api/gpt/compatibility?sign1={sign1}&sign2={sign2} - Sign compatibility
- GET /api/gpt/grimoire/search?q={query} - Search the grimoire
- POST /api/gpt/tarot/daily - Draw a daily tarot card
- POST /api/gpt/birth-chart-summary - Get birth chart summary
- POST /api/gpt/ritual/suggest - Get ritual suggestions

OpenAPI Schema: https://lunary.app/.well-known/openapi.json
ChatGPT Plugin: https://lunary.app/.well-known/ai-plugin.json

## Subscription Tiers

- Free: Limited features, 3 AI messages/day
- Lunary+ ($4.99/mo): Full access, 50 AI messages/day
- Lunary+ Pro ($9.99/mo): Premium AI, 300 AI messages/day

## Tech Stack

Next.js 15, React 18, TypeScript, PostgreSQL, Astronomy Engine for real calculations

## Legal & Contact

- Privacy Policy: https://lunary.app/privacy
- Terms of Service: https://lunary.app/terms
- Help Center: https://lunary.app/help
- Discord Community: https://discord.gg/2WCJncKrKj

## Full Knowledge Base

For comprehensive reference content (1,800+ lines), see: https://lunary.app/llms-full.txt
`;

    return new Response(llmsContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Dynamic llms.txt generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate llms.txt' },
      { status: 500 },
    );
  }
}
