import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/get-user-session';
import { getRealPlanetaryPositions } from '@utils/astrology/astronomical-data';
import {
  computeSaturnReturn,
  computeJupiterReturn,
  computeProfectionYear,
  computeLunation,
  computeSolarReturn,
  summariseCycles,
  type CycleBundle,
} from '@/lib/personal-cycles/compute';

export const dynamic = 'force-dynamic';

/**
 * GET /api/personal-cycles
 *
 * Returns the user's current state across five interlocking life cycles:
 *   - Saturn return arc
 *   - Jupiter return countdown
 *   - Annual profection year
 *   - Current lunation
 *   - Solar return
 *
 * Plus a synthesised one-paragraph summary suitable for narration.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await sql`
      SELECT birthday FROM user_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `;

    const profile = result.rows[0] as { birthday?: string } | undefined;
    const birthday = profile?.birthday ? String(profile.birthday) : null;

    if (!birthday) {
      return NextResponse.json(
        { error: 'No birthday set on profile' },
        { status: 404 },
      );
    }

    const now = new Date();

    // Sun + Moon longitudes for the actual lunation phase angle.
    const positions = getRealPlanetaryPositions(now);
    const sunLon = positions?.Sun?.longitude;
    const moonLon = positions?.Moon?.longitude;

    if (typeof sunLon !== 'number' || typeof moonLon !== 'number') {
      return NextResponse.json(
        { error: 'Failed to compute Sun/Moon positions' },
        { status: 500 },
      );
    }

    const bundle: CycleBundle = {
      saturn: computeSaturnReturn({ birthDate: birthday, now }),
      jupiter: computeJupiterReturn({ birthDate: birthday, now }),
      profection: computeProfectionYear({ birthDate: birthday, now }),
      lunation: computeLunation({ now, sunLon, moonLon }),
      solar: computeSolarReturn({ birthDate: birthday, now }),
    };

    const summary = summariseCycles(bundle);

    return NextResponse.json(
      { ...bundle, summary, generatedAt: now.toISOString() },
      {
        headers: {
          'Cache-Control': 'private, s-maxage=3600',
        },
      },
    );
  } catch (error) {
    console.error('[personal-cycles] Failed to compute cycles:', error);
    return NextResponse.json(
      { error: 'Failed to compute personal cycles' },
      { status: 500 },
    );
  }
}
