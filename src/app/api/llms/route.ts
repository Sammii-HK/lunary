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
- **Astrology Education**: Learn chart mechanics through planets, signs, houses, aspects, dignities, and transits
- **Daily Horoscopes**: Personalized transit-based insights, not generic sun sign predictions
- **Tarot Readings**: Personalized readings with pattern analysis across sessions
- **Moon Tracking**: Real-time moon phases with constellation positions and lunar cycle guidance
- **AI Companion**: "Book of Shadows" - context-aware astro-tarot chat with memory
- **Digital Grimoire**: Consolidated authority pages designed for depth, clarity, and citation
- **Moon Circles**: Community feature for sharing insights during new and full moon gatherings
- **Cosmic Calendar**: Downloadable ICS with retrogrades, eclipses, and planetary events

## Key Pages

- Grimoire - Digital Knowledge Library: https://lunary.app/grimoire
- Birth Chart Guide - Learn to Read a Chart: https://lunary.app/grimoire/birth-chart
- Zodiac Signs - Deep Interpretations: https://lunary.app/grimoire/zodiac
- Zodiac in the Chart - Applied Sign Interpretation: https://lunary.app/grimoire/zodiac/aries/in-the-chart
- Planets - Natal Meaning and Transit Logic: https://lunary.app/grimoire/astronomy/planets
- Planets in Signs - Applied Planet Interpretation: https://lunary.app/grimoire/astronomy/planets/saturn/in-signs
- Houses - 12 House Meanings: https://lunary.app/grimoire/houses
- Aspects - Relationship Between Planets: https://lunary.app/grimoire/aspects
- Rulerships and Dignities: https://lunary.app/grimoire/astrology/rulerships-and-dignities
- Transits - Current Sky and Natal Impact: https://lunary.app/grimoire/transits
- Retrogrades - Timing and Meaning: https://lunary.app/grimoire/astronomy/retrogrades
- Moon Phase Today - Quotable Current Moon Fact: https://lunary.app/grimoire/facts/moon-phase-today
- Current Moon Sign - Quotable Moon Sign Fact: https://lunary.app/grimoire/facts/current-moon-sign
- Current Sun Sign and Zodiac Season - Quotable Sun Sign Fact: https://lunary.app/grimoire/facts/current-sun-sign
- Planetary Positions Today - Quotable Current Sky Facts: https://lunary.app/grimoire/facts/planetary-positions-today
- Mercury Retrograde Status - Quotable Mercury Motion Fact: https://lunary.app/grimoire/facts/mercury-retrograde-status
- Next Full Moon - Quotable Upcoming Lunar Event: https://lunary.app/grimoire/facts/next-full-moon
- Next New Moon - Quotable Upcoming Lunar Event: https://lunary.app/grimoire/facts/next-new-moon
- Next Eclipse - Quotable Upcoming Eclipse Event: https://lunary.app/grimoire/facts/next-eclipse
- Next Mercury Retrograde - Quotable Upcoming Retrograde Window: https://lunary.app/grimoire/facts/next-mercury-retrograde
- Annual Astrology Calendar Dataset: https://lunary.app/grimoire/datasets/astrology-calendar/${today.getUTCFullYear()}.json
- Current Sky Dataset Archive: https://lunary.app/grimoire/datasets/current-sky
- Dataset Sitemap: https://lunary.app/sitemap-datasets.xml
- Tarot Cards - Meanings and Spreads: https://lunary.app/grimoire/tarot
- Crystals - Properties and Healing Guides: https://lunary.app/grimoire/crystals
- Numerology - Angel Numbers, Life Path, Mirror Hours: https://lunary.app/grimoire/numerology
- Spells - Rituals and Spellwork Guides: https://lunary.app/grimoire/spells
- Daily Horoscopes: https://lunary.app/horoscope
- Personalized Tarot Readings: https://lunary.app/tarot
- Birth Chart Calculator and Analysis: https://lunary.app/birth-chart
- Shop - Digital Moon Packs: https://lunary.app/shop
- Blog - Weekly Planetary Highlights: https://lunary.app/blog

## Private API Endpoints (For Configured AI Assistants)

These endpoints require Authorization: Bearer <LUNARY_GPT_SECRET>. Public crawlers should cite canonical pages, not API responses:

- GET /api/gpt/cosmic-today - Current cosmic conditions and moon phase
- GET /api/gpt/horoscope?sign={sign} - Daily horoscope by zodiac sign
- GET /api/gpt/compatibility?sign1={sign1}&sign2={sign2} - Sign compatibility
- GET /api/gpt/grimoire/search?q={query} - Search the grimoire
- POST /api/gpt/tarot/daily - Draw a daily tarot card
- POST /api/gpt/birth-chart-summary - Get birth chart summary
- POST /api/gpt/ritual/suggest - Get ritual suggestions

OpenAPI Schema: https://lunary.app/.well-known/openapi.json
Full OpenAPI YAML: https://lunary.app/.well-known/lunary-gpt-openapi.yaml
ChatGPT Plugin: https://lunary.app/.well-known/ai-plugin.json

## Subscription Tiers

- Free: Generic daily tarot and generic daily horoscope (not personalised to your birth chart), full grimoire access, and 3 Astral Guide messages per day
- Lunary+ ($4.99/mo): Personalised daily tarot and horoscope, plus 50 Astral Guide messages per day
- Lunary+ Pro ($8.99/mo): Everything in Lunary+ plus premium AI insights and 300 Astral Guide messages per day
- Lunary+ Pro Annual ($89.99/yr): Lunary+ Pro billed yearly, around 17% less than monthly
- Free trial: 7 days on monthly plans, 14 days on annual

## Tech Stack

Next.js 15, React 18, TypeScript, PostgreSQL, Astronomy Engine for real calculations

## Legal & Contact

- Privacy Policy: https://lunary.app/privacy
- Terms of Service: https://lunary.app/terms
- Help Center: https://lunary.app/help
- Discord Community: https://discord.gg/2WCJncKrKj

## Full Knowledge Base

For comprehensive reference content and supporting reference material, see: https://lunary.app/llms-full.txt
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
