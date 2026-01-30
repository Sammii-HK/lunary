import { NextRequest, NextResponse } from 'next/server';
import { calculateProgressedChart } from '../../../../../utils/astrology/progressedChart';
import { requireUser } from '@/lib/ai/auth';
import { sql } from '@vercel/postgres';

/**
 * Test endpoint for progressed chart calculations
 * Shows secondary progressions for authenticated user
 *
 * Usage: GET /api/test/progressed-chart
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireUser(request);

    // Get user birthday
    const profileResult = await sql`
      SELECT birthday
      FROM user_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `;

    const userBirthday = profileResult.rows[0]?.birthday;

    if (!userBirthday) {
      return NextResponse.json(
        {
          error: 'No birth date found',
          message:
            'User profile must have a birthday to calculate progressions',
        },
        { status: 400 },
      );
    }

    const birthDate = new Date(userBirthday);
    const currentDate = new Date();

    // Calculate progressed chart
    const startTime = Date.now();
    const progressedChart = await calculateProgressedChart(
      birthDate,
      currentDate,
    );
    const calculationTime = Date.now() - startTime;

    // Get natal chart for comparison
    const natalResult = await sql`
      SELECT birth_chart
      FROM user_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `;

    const natalChart = natalResult.rows[0]?.birth_chart as any[];
    const natalSun = natalChart?.find((p) => p.body === 'Sun');
    const natalMoon = natalChart?.find((p) => p.body === 'Moon');

    return NextResponse.json({
      user: {
        id: user.id,
        birthDate: birthDate.toISOString().split('T')[0],
        age: Math.floor(progressedChart.yearsSinceBirth),
      },
      progressedChart: {
        progressedSun: {
          sign: progressedChart.progressedSun.sign,
          degree: `${Math.floor(progressedChart.progressedSun.degree)}°${progressedChart.progressedSun.minute}'`,
          natalSun: natalSun
            ? `${natalSun.sign} ${Math.floor(natalSun.degree)}°`
            : 'Unknown',
          change:
            natalSun && natalSun.sign !== progressedChart.progressedSun.sign
              ? `Changed from ${natalSun.sign} to ${progressedChart.progressedSun.sign}`
              : 'Same sign as natal',
        },
        progressedMoon: {
          sign: progressedChart.progressedMoon.sign,
          degree: `${Math.floor(progressedChart.progressedMoon.degree)}°${progressedChart.progressedMoon.minute}'`,
          cyclePhase: progressedChart.progressedMoon.moonPhaseInCycle,
          natalMoon: natalMoon
            ? `${natalMoon.sign} ${Math.floor(natalMoon.degree)}°`
            : 'Unknown',
          change:
            natalMoon && natalMoon.sign !== progressedChart.progressedMoon.sign
              ? `Changed from ${natalMoon.sign} to ${progressedChart.progressedMoon.sign}`
              : 'Same sign as natal',
        },
        progressedMercury: progressedChart.progressedMercury
          ? {
              sign: progressedChart.progressedMercury.sign,
              degree: `${Math.floor(progressedChart.progressedMercury.degree)}°`,
            }
          : undefined,
        progressedVenus: progressedChart.progressedVenus
          ? {
              sign: progressedChart.progressedVenus.sign,
              degree: `${Math.floor(progressedChart.progressedVenus.degree)}°`,
            }
          : undefined,
        progressedMars: progressedChart.progressedMars
          ? {
              sign: progressedChart.progressedMars.sign,
              degree: `${Math.floor(progressedChart.progressedMars.degree)}°`,
            }
          : undefined,
      },
      metadata: {
        progressionDate: progressedChart.progressionDate
          .toISOString()
          .split('T')[0],
        yearsSinceBirth: progressedChart.yearsSinceBirth.toFixed(2),
        calculationTimeMs: calculationTime,
        description: progressedChart.description,
      },
      interpretation: {
        progressedSunMeaning:
          'Progressed Sun changes sign every ~30 years, indicating major life theme shifts',
        progressedMoonMeaning:
          'Progressed Moon changes sign every ~2.5 years, showing evolving emotional needs',
        cycleMeaning:
          'Progressed Moon completes full cycle every ~27-28 years, representing major emotional/spiritual cycles',
      },
    });
  } catch (error) {
    console.error('[Test] Progressed chart error:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate progressed chart',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
