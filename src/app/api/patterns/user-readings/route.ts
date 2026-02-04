/**
 * API route to fetch user's actual tarot readings for pattern analysis
 * Replaces seeded generation with real database data
 * Enhanced with moon phase and aspects for each reading
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import {
  getAccurateMoonPhase,
  getRealPlanetaryPositions,
} from '../../../../../utils/astrology/astronomical-data';
import { ASPECT_DATA } from '@/constants/seo/aspects';

// Helper to convert moon phase label to key
function getMoonPhaseKey(label: string): string {
  return label.toLowerCase().replace(' ', '_') as any;
}

// Helper to get moon phase emoji
function getMoonPhaseEmoji(phaseLabel: string): string {
  // Moon phase emoji mapping
  const emojiMap: Record<string, string> = {
    'new moon': '🌑',
    'waxing crescent': '🌒',
    'first quarter': '🌓',
    'waxing gibbous': '🌔',
    'full moon': '🌕',
    'waning gibbous': '🌖',
    'last quarter': '🌗',
    'waning crescent': '🌘',
  };
  return emojiMap[phaseLabel.toLowerCase()] || '🌙';
}

// Helper to calculate major daily aspects (transit to transit only, simplified)
function calculateDailyAspects(date: Date): Array<{
  planet1: string;
  planet2: string;
  aspectType: string;
  aspectSymbol: string;
}> {
  try {
    const positions = getRealPlanetaryPositions(date);
    const aspects: Array<{
      planet1: string;
      planet2: string;
      aspectType: string;
      aspectSymbol: string;
    }> = [];

    const planets = [
      'Sun',
      'Moon',
      'Mercury',
      'Venus',
      'Mars',
      'Jupiter',
      'Saturn',
    ];
    const significantAspects = [
      {
        name: 'conjunct',
        angle: 0,
        orb: 8,
        symbol: ASPECT_DATA.conjunct.symbol,
      },
      {
        name: 'opposite',
        angle: 180,
        orb: 8,
        symbol: ASPECT_DATA.opposite.symbol,
      },
      { name: 'trine', angle: 120, orb: 6, symbol: ASPECT_DATA.trine.symbol },
      { name: 'square', angle: 90, orb: 6, symbol: ASPECT_DATA.square.symbol },
    ];

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planet1 = planets[i];
        const planet2 = planets[j];
        const pos1 = positions[planet1];
        const pos2 = positions[planet2];

        if (!pos1 || !pos2) continue;

        let diff = Math.abs(pos1.longitude - pos2.longitude);
        if (diff > 180) diff = 360 - diff;

        for (const aspectDef of significantAspects) {
          const orb = Math.abs(diff - aspectDef.angle);
          if (orb <= aspectDef.orb) {
            aspects.push({
              planet1,
              planet2,
              aspectType: aspectDef.name,
              aspectSymbol: aspectDef.symbol,
            });
          }
        }
      }
    }

    // Return top 3 most significant aspects
    return aspects.slice(0, 3);
  } catch (error) {
    console.error('Error calculating aspects:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get timeFrame from query params (default 30 days)
    const searchParams = request.nextUrl.searchParams;
    const timeFrameDays = parseInt(searchParams.get('days') || '30', 10);

    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeFrameDays);
    const startDateStr = startDate.toISOString().split('T')[0];

    // Query multi-card spread readings only (exclude daily single-card pulls)
    const result = await sql`
      SELECT cards, created_at, spread_slug
      FROM tarot_readings
      WHERE user_id = ${userId}
        AND jsonb_array_length(cards) > 1
        AND created_at >= ${startDateStr}::date
        AND archived_at IS NULL
      ORDER BY created_at DESC
    `;

    // Extract and format spread readings with cosmic context
    const readings = await Promise.all(
      result.rows.map(async (row) => {
        try {
          const cardsData =
            typeof row.cards === 'string' ? JSON.parse(row.cards) : row.cards;

          if (Array.isArray(cardsData) && cardsData.length > 0) {
            const readingDate = new Date(row.created_at);

            // Get moon phase for this date
            const moonPhase = await getAccurateMoonPhase(readingDate);
            const moonPhaseLabel = moonPhase.name;
            const moonPhaseKey = getMoonPhaseKey(moonPhaseLabel);
            const moonPhaseEmoji =
              moonPhase.emoji || getMoonPhaseEmoji(moonPhaseLabel);

            // Calculate aspects for this date
            const aspects = calculateDailyAspects(readingDate);

            // Extract all cards from the spread
            const cards = cardsData
              .filter((cd: any) => cd.card)
              .map((cd: any) => ({
                name: cd.card.name,
                keywords: cd.card.keywords || [],
                position: cd.position || undefined,
              }));

            if (cards.length === 0) return null;

            return {
              spreadSlug: row.spread_slug || 'unknown',
              cards,
              cardCount: cards.length,
              createdAt: row.created_at,
              moonPhase: {
                phase: moonPhaseKey,
                emoji: moonPhaseEmoji,
                name: moonPhaseLabel,
              },
              aspects: aspects.length > 0 ? aspects : undefined,
            };
          }
          return null;
        } catch (error) {
          console.error('Error parsing card data:', error);
          return null;
        }
      }),
    ).then((results) =>
      results.filter((r): r is NonNullable<typeof r> => r !== null),
    );

    return NextResponse.json({
      success: true,
      readings,
      count: readings.length,
      timeFrameDays,
    });
  } catch (error) {
    console.error('Error fetching user readings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
