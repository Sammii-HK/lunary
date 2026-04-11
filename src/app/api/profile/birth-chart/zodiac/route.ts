import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/get-user-session';
import { normalizeIsoDateOnly } from '@/lib/date-only';
import { getZodiacSign } from '@utils/astrology/astrology';
import { convertToEquatorial } from '@utils/astrology/zodiacSystems';
import { convertToSidereal } from '@utils/astrology/zodiacSystems';

const ZODIAC_SYSTEMS = ['tropical', 'sidereal', 'equatorial'] as const;

export const dynamic = 'force-dynamic';

type PlanetWithZodiac = {
  body: string;
  eclipticLongitude: number;
  retrograde: boolean;
  tropical: {
    longitude: number;
    sign: string;
    degree: number;
    minute: number;
  };
  sidereal: {
    longitude: number;
    sign: string;
    degree: number;
    minute: number;
  };
  equatorial: {
    longitude: number;
    sign: string;
    degree: number;
    minute: number;
  };
};

/**
 * GET /api/profile/birth-chart/zodiac
 * Fetch all 3 zodiac systems in a single call
 * Returns: { tropical: Planet[], sidereal: Planet[], equatorial: Planet[] }
 * Cached on client to minimize API calls
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's birth chart data from profile
    const result = await sql`
      SELECT birthday, birth_chart FROM user_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'No birth chart found for user' },
        { status: 404 },
      );
    }

    const profile = result.rows[0] as {
      birthday?: string;
      birth_chart?: Array<{
        body: string;
        sign: string;
        degree: number;
        minute: number;
        eclipticLongitude: number;
        retrograde: boolean;
        house?: number;
      }>;
    };

    const birthDate = normalizeIsoDateOnly(
      profile.birthday ? String(profile.birthday) : null,
    );

    if (!profile?.birth_chart) {
      return NextResponse.json(
        { error: 'No birth chart found for user' },
        { status: 404 },
      );
    }

    if (!birthDate) {
      return NextResponse.json(
        { error: 'Birth date not set in profile' },
        { status: 400 },
      );
    }

    // Convert tropical birth chart to all zodiac systems
    const planets = profile.birth_chart;

    // Transform each planet to include all three zodiac systems
    const planetsWithAllSystems = planets.map((planet) => {
      const tropicalLongitude = planet.eclipticLongitude;
      const tropicalDegree = tropicalLongitude % 30;
      const tropicalSign = getZodiacSign(tropicalLongitude);
      const siderealLongitude = convertToSidereal(tropicalLongitude);
      const siderealSign = getZodiacSign(siderealLongitude);
      const equatorialLongitude = convertToEquatorial(tropicalLongitude, 0);
      const equatorialSign = getZodiacSign(equatorialLongitude);

      return {
        body: planet.body,
        eclipticLongitude: planet.eclipticLongitude,
        retrograde: planet.retrograde,
        tropical: {
          longitude: tropicalLongitude,
          sign: tropicalSign,
          degree: Math.floor(tropicalDegree),
          minute: Math.round((tropicalDegree % 1) * 60),
        },
        sidereal: {
          longitude: siderealLongitude,
          sign: siderealSign,
          degree: Math.floor(siderealLongitude % 30),
          minute: Math.round((siderealLongitude % 1) * 60),
        },
        equatorial: {
          longitude: equatorialLongitude,
          sign: equatorialSign,
          degree: Math.floor(equatorialLongitude % 30),
          minute: Math.round((equatorialLongitude % 1) * 60),
        },
      } as PlanetWithZodiac;
    });

    // Return as single object with all systems: { tropical: [...], sidereal: [...], ... }
    const response = {
      tropical: planetsWithAllSystems.map((p) => ({
        body: p.body,
        retrograde: p.retrograde,
        sign: p.tropical.sign,
        degree: p.tropical.degree,
        minute: p.tropical.minute,
        eclipticLongitude: p.tropical.longitude,
      })),
      sidereal: planetsWithAllSystems.map((p) => ({
        body: p.body,
        retrograde: p.retrograde,
        sign: p.sidereal.sign,
        degree: p.sidereal.degree,
        minute: p.sidereal.minute,
        eclipticLongitude: p.sidereal.longitude,
      })),
      equatorial: planetsWithAllSystems.map((p) => ({
        body: p.body,
        retrograde: p.retrograde,
        sign: p.equatorial.sign,
        degree: p.equatorial.degree,
        minute: p.equatorial.minute,
        eclipticLongitude: p.equatorial.longitude,
      })),
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=86400',
      },
    });
  } catch (error) {
    console.error('[Birth Chart Zodiac Systems]', error);
    return NextResponse.json(
      { error: 'Failed to calculate zodiac systems' },
      { status: 500 },
    );
  }
}
