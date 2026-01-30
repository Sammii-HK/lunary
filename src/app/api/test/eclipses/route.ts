import { NextResponse } from 'next/server';
import {
  getUpcomingEclipses,
  checkEclipseRelevance,
} from '@/utils/astrology/eclipseTracker';
import { requireUser } from '@/lib/ai/auth';
import { sql } from '@vercel/postgres';

/**
 * Test endpoint for eclipse tracking
 * Shows upcoming eclipses and their relevance to user's natal chart
 *
 * Usage: GET /api/test/eclipses?months=6
 */
export async function GET(request: Request) {
  try {
    // Require authentication
    const user = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get('months') || '6', 10);

    // Get user's natal chart
    const profileResult = await sql`
      SELECT birth_chart
      FROM user_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `;

    const birthChart = profileResult.rows[0]?.birth_chart as any[];

    if (!birthChart) {
      return NextResponse.json(
        {
          error: 'No birth chart found',
          message:
            'User profile must have a birth chart to check eclipse relevance',
        },
        { status: 400 },
      );
    }

    // Get upcoming eclipses
    const startTime = Date.now();
    const eclipses = getUpcomingEclipses(new Date(), months);
    const calculationTime = Date.now() - startTime;

    // Check relevance for each eclipse
    const eclipsesWithRelevance = eclipses.map((eclipse) => {
      const relevance = checkEclipseRelevance(eclipse, birthChart);

      return {
        date: eclipse.peak.toISOString().split('T')[0],
        type: eclipse.kind,
        obscuration: `${Math.round(eclipse.obscuration * 100)}%`,
        degree: `${Math.floor(eclipse.eclipticLongitude)}°`,
        zodiacSign: eclipse.sign,
        relevance: {
          isRelevant: relevance.isRelevant,
          affectedPlanets: relevance.affectedPlanets,
          closestAspect: relevance.closestAspect
            ? `${relevance.closestAspect.planet} (${relevance.closestAspect.orb.toFixed(1)}° orb)`
            : null,
          interpretation: relevance.isRelevant
            ? `This eclipse aspects your natal ${relevance.affectedPlanets.join(', ')} - significant personal impact`
            : 'This eclipse does not closely aspect your natal planets',
        },
      };
    });

    // Separate relevant and non-relevant
    const relevantEclipses = eclipsesWithRelevance.filter(
      (e) => e.relevance.isRelevant,
    );
    const otherEclipses = eclipsesWithRelevance.filter(
      (e) => !e.relevance.isRelevant,
    );

    return NextResponse.json({
      user: {
        id: user.id,
        natalPlanets: birthChart.map((p) => ({
          planet: p.body,
          sign: p.sign,
          degree: Math.floor(p.degree),
        })),
      },
      search: {
        startDate: new Date().toISOString().split('T')[0],
        months,
        totalEclipses: eclipses.length,
        relevantEclipses: relevantEclipses.length,
        calculationTimeMs: calculationTime,
      },
      relevantEclipses:
        relevantEclipses.length > 0
          ? relevantEclipses
          : 'No eclipses aspect your natal planets within ±3° orb',
      upcomingEclipses: otherEclipses,
      interpretation: {
        solarEclipses: 'New beginnings, fresh starts, external events',
        lunarEclipses: 'Emotional culminations, internal revelations, releases',
        relevanceOrb:
          'Eclipses within ±3° of natal planets are considered relevant',
        timing:
          'Eclipse effects are felt most strongly within ±1 week of exact date',
      },
      tips: [
        '✨ Relevant eclipses can trigger significant life events',
        '🌑 Solar eclipses in same sign as natal planets: New chapters beginning',
        '🌕 Lunar eclipses aspecting natal planets: Emotional releases, completions',
        '📅 Track these dates for major developments in your life',
      ],
    });
  } catch (error) {
    console.error('[Test] Eclipse tracking error:', error);
    return NextResponse.json(
      {
        error: 'Failed to track eclipses',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
