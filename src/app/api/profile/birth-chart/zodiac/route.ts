import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  convertLongitudeToZodiacSystem,
  getSignForZodiacSystem,
} from '@utils/astrology/zodiacSystems';

const ZODIAC_SYSTEMS = ['tropical', 'sidereal', 'equatorial'] as const;

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
    const user = await requireAuth();

    // Get user's birth chart data from profile
    const profile = await db.query.userProfiles.findFirst({
      where: (fields) => ({
        userId: user.id,
      }),
      columns: {
        birthChart: true,
      },
    });

    if (!profile?.birthChart) {
      return NextResponse.json(
        { error: 'No birth chart found for user' },
        { status: 404 },
      );
    }

    // Convert tropical birth chart to all zodiac systems
    const planets = profile.birthChart as Array<{
      body: string;
      sign: string;
      degree: number;
      minute: number;
      eclipticLongitude: number;
      retrograde: boolean;
      house?: number;
    }>;

    // Transform each planet to include all three zodiac systems
    const planetsWithAllSystems = planets.map((planet) => {
      const tropical = getSignForZodiacSystem(
        planet.eclipticLongitude,
        'tropical',
      );
      const sidereal = getSignForZodiacSystem(
        planet.eclipticLongitude,
        'sidereal',
      );
      const equatorial = getSignForZodiacSystem(
        planet.eclipticLongitude,
        'equatorial',
      );

      return {
        body: planet.body,
        eclipticLongitude: planet.eclipticLongitude,
        retrograde: planet.retrograde,
        tropical: {
          longitude: convertLongitudeToZodiacSystem(
            planet.eclipticLongitude,
            0,
            'tropical',
          ),
          sign: tropical.sign,
          degree: Math.floor(tropical.degreeInSign),
          minute: Math.round((tropical.degreeInSign % 1) * 60),
        },
        sidereal: {
          longitude: convertLongitudeToZodiacSystem(
            planet.eclipticLongitude,
            0,
            'sidereal',
          ),
          sign: sidereal.sign,
          degree: Math.floor(sidereal.degreeInSign),
          minute: Math.round((sidereal.degreeInSign % 1) * 60),
        },
        equatorial: {
          longitude: convertLongitudeToZodiacSystem(
            planet.eclipticLongitude,
            0,
            'equatorial',
          ),
          sign: equatorial.sign,
          degree: Math.floor(equatorial.degreeInSign),
          minute: Math.round((equatorial.degreeInSign % 1) * 60),
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
