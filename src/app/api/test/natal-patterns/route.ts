import { NextRequest, NextResponse } from 'next/server';
import { detectNatalAspectPatterns } from '@/lib/journal/aspect-pattern-detector';
import { calculatePlanetaryReturns } from '@/lib/journal/planetary-return-tracker';
import { requireUser } from '@/lib/ai/auth';
import { sql } from '@vercel/postgres';

/**
 * Test endpoint for natal pattern detection
 * Detects stelliums, aspect patterns, and planetary returns
 *
 * Usage: GET /api/test/natal-patterns
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireUser(request);

    // Get user's natal chart and birthday
    const profileResult = await sql`
      SELECT birth_chart, birthday
      FROM user_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `;

    const birthChart = profileResult.rows[0]?.birth_chart as any[];
    const birthday = profileResult.rows[0]?.birthday;

    if (!birthChart) {
      return NextResponse.json(
        {
          error: 'No birth chart found',
          message: 'User profile must have a birth chart',
        },
        { status: 400 },
      );
    }

    const currentDate = new Date();
    const birthDate = birthday ? new Date(birthday) : undefined;

    // Detect natal aspect patterns
    const startTime = Date.now();
    const natalPatterns = detectNatalAspectPatterns(birthChart);
    const patternDetectionTime = Date.now() - startTime;

    // Calculate planetary returns (if birthday available)
    let planetaryReturns: any[] | undefined = undefined;
    let returnsCalculationTime = 0;
    if (birthDate) {
      const returnsStartTime = Date.now();
      const allReturns = calculatePlanetaryReturns(
        birthChart,
        currentDate,
        birthDate,
      );
      returnsCalculationTime = Date.now() - returnsStartTime;
      planetaryReturns = allReturns.filter((r: any) => r.isActive);
    }

    // Format natal patterns for display
    const formattedPatterns = natalPatterns.map((pattern: any) => ({
      type: pattern.patternType || pattern.type,
      planets: pattern.planets,
      signs: pattern.signs,
      element: pattern.element,
      houses: pattern.houses,
      description: pattern.description,
      significance:
        (pattern.patternType || pattern.type) === 'stellium'
          ? 'Strong focus of energy - major life theme'
          : 'Significant natal configuration',
    }));

    // Format planetary returns
    const formattedReturns = planetaryReturns?.map((ret: any) => ({
      planet: ret.planet,
      type: ret.returnType,
      proximity: `${ret.proximityDays > 0 ? '+' : ''}${ret.proximityDays} days`,
      returnDate: ret.returnDate?.toISOString().split('T')[0] || 'Unknown',
      phase: ret.phase,
      isActive: ret.isActive,
      significance:
        ret.planet === 'Saturn'
          ? 'Major life restructuring, maturity milestone'
          : ret.planet === 'Jupiter'
            ? 'Growth, expansion, new opportunities'
            : 'New cycle beginning',
    }));

    return NextResponse.json({
      user: {
        id: user.id,
        birthDate: birthDate
          ? birthDate.toISOString().split('T')[0]
          : 'Unknown',
        natalChart: birthChart.map((p) => ({
          planet: p.body,
          sign: p.sign,
          degree: Math.floor(p.degree),
          house: p.house,
        })),
      },
      natalPatterns: {
        count: natalPatterns.length,
        patterns: formattedPatterns.length > 0 ? formattedPatterns : [],
        detectionTimeMs: patternDetectionTime,
      },
      planetaryReturns: birthDate
        ? {
            count: planetaryReturns?.length || 0,
            activeReturns:
              formattedReturns && formattedReturns.length > 0
                ? formattedReturns
                : 'No active returns within ±30 days',
            calculationTimeMs: returnsCalculationTime,
          }
        : 'Birthday required to calculate returns',
      interpretation: {
        stelliums:
          'Three or more planets in the same sign = concentrated energy and major life focus',
        returns:
          'Planetary returns occur when a planet returns to its natal position',
        solarReturn: 'Every year on your birthday - new annual cycle',
        jupiterReturn: 'Every ~12 years - growth and expansion opportunities',
        saturnReturn:
          'Every ~29 years - major life restructuring (ages 29, 58, 87)',
      },
      tips:
        natalPatterns.length > 0
          ? [
              '✨ Natal patterns are permanent features of your chart',
              '🔍 Transits activating pattern planets will be especially significant',
              '📊 These patterns describe your core themes and challenges',
            ]
          : [
              'No major aspect patterns detected in your natal chart',
              'This is normal - not everyone has stelliums or grand configurations',
              'Your chart strength comes from individual planetary placements',
            ],
    });
  } catch (error) {
    console.error('[Test] Natal patterns error:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect natal patterns',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
