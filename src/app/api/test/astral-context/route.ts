import { NextResponse } from 'next/server';
import { buildAstralContext } from '@/lib/ai/astral-guide';
import { analyzeContextNeeds } from '@/lib/ai/context-optimizer';
import { requireUser } from '@/lib/ai/auth';

/**
 * Test endpoint for astral context building with optimization
 * Shows what context is actually built for different queries
 *
 * Usage: GET /api/test/astral-context?query=YOUR_QUERY
 */
export async function GET(request: Request) {
  try {
    // Require authentication
    const user = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || "What's the cosmic weather?";
    const optimize = searchParams.get('optimize') !== 'false'; // Default to optimized

    const now = new Date();

    // Get user birthday (if available)
    const { sql } = await import('@vercel/postgres');
    const profileResult = await sql`
      SELECT birthday
      FROM user_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `;
    const userBirthday = profileResult.rows[0]?.birthday || undefined;

    // Build context with optimization
    let context;
    let requirements;
    let startTime = Date.now();

    if (optimize) {
      // Analyze query to determine needs
      requirements = analyzeContextNeeds(query);

      // Build optimized context
      context = await buildAstralContext(
        user.id,
        user.displayName,
        userBirthday,
        now,
        {
          needsPersonalTransits: requirements.needsPersonalTransits,
          needsNatalPatterns: requirements.needsNatalPatterns,
          needsPlanetaryReturns: requirements.needsPlanetaryReturns,
          needsProgressedChart: requirements.needsProgressedChart,
          needsEclipses: requirements.needsEclipses,
        },
      );
    } else {
      // Build full context (no optimization)
      context = await buildAstralContext(
        user.id,
        user.displayName,
        userBirthday,
        now,
      );
    }

    const buildTime = Date.now() - startTime;

    // Analyze what was included
    const included = {
      basicCosmic: !!(context.currentTransits && context.moonPhase),
      personalTransits: !!context.personalTransits,
      upcomingPersonalTransits: !!context.upcomingPersonalTransits,
      natalAspectPatterns: !!context.natalAspectPatterns,
      planetaryReturns: !!context.planetaryReturns,
      natalHouseEmphasis: !!context.natalHouseEmphasis,
      lunarSensitivity: !!context.lunarSensitivity,
      progressedChart: !!context.progressedChart,
      relevantEclipses: !!context.relevantEclipses,
      storedPatterns: !!context.storedPatterns,
    };

    // Count what was included
    const includedCount = Object.values(included).filter(Boolean).length;
    const totalPossible = Object.keys(included).length;

    return NextResponse.json({
      query,
      optimization: {
        enabled: optimize,
        buildTimeMs: buildTime,
        modulesIncluded: `${includedCount}/${totalPossible}`,
      },
      requirements: optimize ? requirements : 'Full context (no optimization)',
      contextModules: included,
      details: {
        user: {
          sun: context.user.sun,
          moon: context.user.moon,
          rising: context.user.rising || 'Unknown',
        },
        currentTransits: context.currentTransits ? 'Included' : 'Not included',
        personalTransits: context.personalTransits
          ? `${context.personalTransits.length} transits`
          : 'Not calculated',
        patterns: context.natalAspectPatterns
          ? `${context.natalAspectPatterns.length} patterns detected`
          : 'Not analyzed',
        returns: context.planetaryReturns
          ? `${context.planetaryReturns.length} active returns`
          : 'Not calculated',
        progressed: context.progressedChart
          ? `Sun in ${context.progressedChart.progressedSun.sign}, Moon in ${context.progressedChart.progressedMoon.sign}`
          : 'Not calculated',
        eclipses: context.relevantEclipses
          ? `${context.relevantEclipses.length} relevant eclipses`
          : 'Not calculated',
      },
      tip: optimize
        ? 'Optimization is ON - only necessary modules were calculated'
        : 'Optimization is OFF - add ?optimize=true to enable savings',
    });
  } catch (error) {
    console.error('[Test] Astral context error:', error);
    return NextResponse.json(
      {
        error: 'Failed to build astral context',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
