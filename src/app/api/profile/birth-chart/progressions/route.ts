import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/get-user-session';
import { generateBirthChart } from '@/utils/astrology/birthChart';
import { Observer } from 'astronomy-engine';
import tzLookup from 'tz-lookup';

export const dynamic = 'force-dynamic';

interface LocationData {
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

/**
 * GET /api/profile/birth-chart/progressions?age=25
 *
 * Calculate the secondary progressed chart for a given age
 * Secondary progression formula: 1 day after birth = 1 year of life
 *
 * So for age 25, calculate the chart from 25 days after the birth date
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ageParam = searchParams.get('age');
    const dateParam = searchParams.get('date'); // Alternative: provide explicit date in YYYY-MM-DD format

    if (!ageParam && !dateParam) {
      return NextResponse.json(
        { error: 'age or date parameter required' },
        { status: 400 },
      );
    }

    // Fetch user's birth data from user_profiles
    const result = await sql`
      SELECT birthday, location FROM user_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 },
      );
    }

    const { birthday, location } = result.rows[0] as {
      birthday?: string;
      location?: LocationData;
    };

    if (!birthday) {
      return NextResponse.json(
        { error: 'Birth date not set in profile' },
        { status: 400 },
      );
    }

    // Calculate the progressed date
    let progressedDate: string;
    if (dateParam) {
      // Use explicit date if provided
      progressedDate = dateParam;
    } else {
      // Calculate date based on age: birth_date + age days
      const age = parseInt(ageParam || '0', 10);
      if (isNaN(age) || age < 0) {
        return NextResponse.json(
          { error: 'Invalid age parameter' },
          { status: 400 },
        );
      }

      const birthDate = new Date(birthday);
      const progDate = new Date(birthDate);
      progDate.setDate(progDate.getDate() + age);

      progressedDate = progDate.toISOString().split('T')[0];
    }

    // Get coordinates from location if available
    let observer: Observer | undefined;
    let timezone: string | undefined = 'UTC';

    if (location && typeof location === 'object') {
      if (location.latitude && location.longitude) {
        observer = new Observer(location.latitude, location.longitude, 0);
        timezone = location.timezone || 'UTC';

        // Try to look up timezone if not provided
        if (!location.timezone) {
          try {
            timezone = tzLookup(location.latitude, location.longitude);
          } catch {
            timezone = 'UTC';
          }
        }
      }
    }

    // Generate progressed chart using the same calculation as natal
    // but with the progressed date instead of birth date
    // Note: We don't have birth time stored, so we use noon (12:00) as default
    const progressedChart = await generateBirthChart(
      progressedDate,
      '12:00', // Use noon if birth time not available
      undefined,
      timezone,
      observer,
    );

    if (!progressedChart || !Array.isArray(progressedChart)) {
      return NextResponse.json(
        { error: 'Failed to generate progressed chart' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        progressedChart,
        progressedDate,
        age: ageParam ? parseInt(ageParam, 10) : undefined,
      },
      {
        headers: {
          'Cache-Control':
            'private, max-age=3600, stale-while-revalidate=86400',
        },
      },
    );
  } catch (error) {
    console.error('Error calculating progressed chart:', error);
    return NextResponse.json(
      { error: 'Failed to calculate progressed chart' },
      { status: 500 },
    );
  }
}
