import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { sql } from '@vercel/postgres';

import { auth } from '@/lib/auth';
import { hasFeatureAccess } from '../../../../../utils/pricing';
import type { BirthChartData } from '../../../../../utils/astrology/birthChart';
import { computeComposite } from '@/lib/couples/composite';
import { composeCompositeReading } from '@/lib/couples/composite-reading';

export const dynamic = 'force-dynamic';

type PairRow = {
  user_id: string;
  name: string | null;
  birth_chart: BirthChartData[] | null;
  status: string | null;
  plan_type: string | null;
};

type PairingRow = {
  userAId: string;
  userBId: string;
  pairedAt: Date | string | null;
};

async function fetchPair(userAId: string, userBId: string) {
  const result = await sql<PairRow>`
    SELECT
      u.id AS user_id,
      u.name,
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
  const map = new Map(result.rows.map((row) => [row.user_id, row]));
  return { a: map.get(userAId), b: map.get(userBId) };
}

export async function GET() {
  try {
    const session = await auth.api
      .getSession({ headers: await headers() })
      .catch(() => null);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }

    const pairingResult = await sql<PairingRow>`
      SELECT "userAId", "userBId", "pairedAt"
      FROM couple_pairings
      WHERE "pairedAt" IS NOT NULL
      AND ("userAId" = ${session.user.id} OR "userBId" = ${session.user.id})
      ORDER BY "pairedAt" DESC
      LIMIT 1
    `;
    const pairing = pairingResult.rows[0];

    if (!pairing) {
      return NextResponse.json({ error: 'No active pairing' }, { status: 404 });
    }

    const { a, b } = await fetchPair(pairing.userAId, pairing.userBId);
    if (!a || !b) {
      return NextResponse.json({ error: 'Pairing missing' }, { status: 404 });
    }

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
      return NextResponse.json({ requiresPlus: true });
    }

    const chartA = Array.isArray(a.birth_chart) ? a.birth_chart : [];
    const chartB = Array.isArray(b.birth_chart) ? b.birth_chart : [];
    if (chartA.length === 0 || chartB.length === 0) {
      return NextResponse.json(
        { error: 'Both partners need birth charts for a composite.' },
        { status: 422 },
      );
    }

    const composite = computeComposite({ chartA, chartB });
    const reading = composeCompositeReading(composite);

    return NextResponse.json(
      {
        success: true,
        partnerName:
          pairing.userAId === session.user.id
            ? (b.name ?? 'Your partner')
            : (a.name ?? 'Your partner'),
        composite,
        reading,
      },
      {
        headers: { 'Cache-Control': 'private, s-maxage=3600, max-age=0' },
      },
    );
  } catch (error) {
    console.error('[couples/composite] failed:', error);
    return NextResponse.json(
      { error: 'Failed to load composite chart' },
      { status: 500 },
    );
  }
}
