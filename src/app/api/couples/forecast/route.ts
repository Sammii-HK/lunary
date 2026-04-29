import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getRealPlanetaryPositions } from '../../../../../utils/astrology/astronomical-data';
import { hasFeatureAccess } from '../../../../../utils/pricing';
import type { BirthChartData } from '../../../../../utils/astrology/birthChart';
import {
  computeCoupleForecast,
  type SkyLongitudes,
} from '@/lib/couples/forecast';

export const dynamic = 'force-dynamic';

interface UserSubRow {
  user_id: string;
  status: string | null;
  plan_type: string | null;
  name: string | null;
  birth_chart: BirthChartData[] | null;
  public_handle: string | null;
}

async function fetchPairProfiles(userAId: string, userBId: string) {
  // Pull profile name, public handle, birth_chart, and the most recent
  // subscription row for both users in one round trip.
  const result = await sql<UserSubRow>`
    SELECT
      u.id AS user_id,
      u.name,
      u.public_handle,
      up.birth_chart,
      sub.status,
      sub.plan_type
    FROM "user" u
    LEFT JOIN user_profiles up ON up.user_id = u.id
    LEFT JOIN LATERAL (
      SELECT status, plan_type
      FROM subscriptions s
      WHERE s.user_id = u.id
      ORDER BY s.created_at DESC
      LIMIT 1
    ) sub ON true
    WHERE u.id = ${userAId} OR u.id = ${userBId}
  `;
  const map = new Map<string, UserSubRow>();
  for (const row of result.rows) {
    map.set(row.user_id, row);
  }
  return { a: map.get(userAId), b: map.get(userBId) };
}

function skyFromPositions(
  positions: Record<string, { longitude?: unknown; retrograde?: unknown }>,
): SkyLongitudes {
  const sky: SkyLongitudes = {};
  for (const [planet, data] of Object.entries(positions)) {
    if (!data || typeof data !== 'object') continue;
    const longitude =
      typeof data.longitude === 'number' ? data.longitude : null;
    if (longitude === null) continue;
    sky[planet] = {
      longitude,
      retrograde: Boolean(data.retrograde),
    };
  }
  return sky;
}

/**
 * GET /api/couples/forecast
 *
 * Returns the active pairing's daily compatibility + 14-day calendar for the
 * signed-in user. Premium-gated: at least one user in the pair must hold
 * `personalized_transit_readings` access (Lunary Plus).
 *
 * Cache: `private, s-maxage=3600` — the underlying transit math is stable
 * for at least an hour and shouldn't be shared across users.
 */
export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api
      .getSession({ headers: headersList })
      .catch(() => null);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }
    const userId = session.user.id;

    // Find this user's active pairing (either side, paired only).
    const pairing = await prisma.couple_pairings.findFirst({
      where: {
        AND: [
          { pairedAt: { not: null } },
          { OR: [{ userAId: userId }, { userBId: userId }] },
        ],
      },
      orderBy: { pairedAt: 'desc' },
    });

    if (!pairing) {
      return NextResponse.json({ error: 'No active pairing' }, { status: 404 });
    }

    const { a, b } = await fetchPairProfiles(pairing.userAId, pairing.userBId);

    if (!a || !b) {
      return NextResponse.json(
        { error: 'Pairing partner missing' },
        { status: 404 },
      );
    }

    // Premium gate — pair stays unlocked if EITHER user holds Plus.
    const aHasAccess = hasFeatureAccess(
      a.status ?? undefined,
      a.plan_type ?? undefined,
      'personalized_transit_readings',
    );
    const bHasAccess = hasFeatureAccess(
      b.status ?? undefined,
      b.plan_type ?? undefined,
      'personalized_transit_readings',
    );

    if (!aHasAccess && !bHasAccess) {
      return NextResponse.json(
        { requiresPlus: true },
        {
          status: 200,
          headers: { 'Cache-Control': 'private, s-maxage=3600' },
        },
      );
    }

    const userIsA = pairing.userAId === userId;
    const me = userIsA ? a : b;
    const partner = userIsA ? b : a;

    const userChart = Array.isArray(me.birth_chart) ? me.birth_chart : [];
    const partnerChart = Array.isArray(partner.birth_chart)
      ? partner.birth_chart
      : [];

    if (userChart.length === 0 || partnerChart.length === 0) {
      return NextResponse.json(
        {
          error:
            'Both partners need a birth chart on file to generate a forecast.',
        },
        { status: 422 },
      );
    }

    const now = new Date();
    const positions = getRealPlanetaryPositions(now);
    const currentSky = skyFromPositions(
      positions as Record<
        string,
        { longitude?: unknown; retrograde?: unknown }
      >,
    );

    const summary = computeCoupleForecast({
      userChart,
      partnerChart,
      currentSky,
      partnerId: partner.user_id,
      partnerName: partner.name ?? 'Your partner',
      partnerHandle: partner.public_handle ?? undefined,
      pairedAt: pairing.pairedAt!,
    });

    return NextResponse.json(summary, {
      status: 200,
      headers: { 'Cache-Control': 'private, s-maxage=3600' },
    });
  } catch (error) {
    console.error('[Couples/forecast] GET failed:', error);
    return NextResponse.json(
      { error: 'Failed to load couple forecast' },
      { status: 500 },
    );
  }
}
