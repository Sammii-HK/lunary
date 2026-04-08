import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/get-user-session';
import {
  getCurrentDashaState,
  calculateDashaTimeline,
  type CurrentDashaState,
  type DashaPeriod,
} from '@utils/astrology/vedic-dasha';

export const dynamic = 'force-dynamic';

interface DashaResponse {
  currentDasha: CurrentDashaState | null;
  upcomingPeriods: DashaPeriod[];
  error?: string;
}

/**
 * GET /api/profile/birth-chart/dasha
 * Fetch current dasha and timeline for authenticated user
 *
 * Query params:
 * - moonDegree: number (required) - natal Moon position in degrees
 * - age: number (optional) - user's current age in years
 *
 * Returns:
 * - currentDasha: current mahadasha, antardasha, and upcoming periods
 * - upcomingPeriods: next 3 major dasha transitions
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract params from URL
    const searchParams = request.nextUrl.searchParams;
    const moonDegreeParam = searchParams.get('moonDegree');
    const birthdayParam = searchParams.get('birthday');

    if (!moonDegreeParam || !birthdayParam) {
      return NextResponse.json(
        {
          error:
            'Missing required parameters: moonDegree and birthday are required',
        },
        { status: 400 },
      );
    }

    const natalMoonDegree = parseFloat(moonDegreeParam);
    if (
      isNaN(natalMoonDegree) ||
      natalMoonDegree < 0 ||
      natalMoonDegree >= 360
    ) {
      return NextResponse.json(
        { error: 'Invalid moonDegree: must be a number between 0 and 360' },
        { status: 400 },
      );
    }

    const birthDate = new Date(birthdayParam);
    if (isNaN(birthDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid birthday: must be a valid date' },
        { status: 400 },
      );
    }

    // Calculate current dasha state
    const currentDasha = getCurrentDashaState(
      birthDate,
      natalMoonDegree,
      new Date(),
    );

    // Get upcoming periods
    const timeline = calculateDashaTimeline(
      birthDate,
      natalMoonDegree,
      new Date(),
    );
    const currentDashaIndex = timeline.findIndex(
      (p) => p.planet === currentDasha?.mahadasha.planet && p.isActive,
    );
    const upcomingPeriods = timeline.slice(
      currentDashaIndex + 1,
      currentDashaIndex + 4,
    );

    const response: DashaResponse = {
      currentDasha,
      upcomingPeriods,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[Dasha] Error fetching dasha data:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate dasha',
        currentDasha: null,
        upcomingPeriods: [],
      },
      { status: 500 },
    );
  }
}
