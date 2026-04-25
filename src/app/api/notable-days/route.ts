import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import {
  scoreNextNDays,
  pickTopDays,
  type NotableDay,
} from '@/lib/notable-days/score';
import type { BirthChartData } from '../../../../utils/astrology/birthChart';

export const dynamic = 'force-dynamic';

const MAX_DAYS = 120;
const DEFAULT_DAYS = 90;

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);

    const { searchParams } = new URL(request.url);
    const requestedDays = parseInt(
      searchParams.get('days') || String(DEFAULT_DAYS),
      10,
    );
    const days = Math.min(
      Math.max(
        Number.isFinite(requestedDays) ? requestedDays : DEFAULT_DAYS,
        7,
      ),
      MAX_DAYS,
    );

    const profileResult = await sql`
      SELECT birth_chart FROM user_profiles WHERE user_id = ${user.id} LIMIT 1
    `;

    const natalChart = (profileResult.rows[0]?.birth_chart ??
      []) as BirthChartData[];

    if (!Array.isArray(natalChart) || natalChart.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Birth chart not found. Add your birth details first.',
          days: [] as NotableDay[],
          top5: [] as NotableDay[],
        },
        { status: 200 },
      );
    }

    const allDays = scoreNextNDays({ natalChart, days });
    const top5 = pickTopDays(allDays, 5);

    return NextResponse.json(
      {
        success: true,
        days: allDays,
        top5,
      },
      {
        headers: {
          'Cache-Control':
            'private, s-maxage=3600, stale-while-revalidate=1800',
        },
      },
    );
  } catch (error) {
    // Auth errors bubble up via requireUser's UnauthorizedError class — return 401.
    const message = error instanceof Error ? error.message : 'Unknown error';
    const isAuthError = message.toLowerCase().includes('unauthor');
    if (isAuthError) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }
    console.error('[notable-days] Error:', message);
    return NextResponse.json(
      { success: false, error: 'Failed to compute notable days' },
      { status: 500 },
    );
  }
}
