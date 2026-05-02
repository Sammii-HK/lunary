/**
 * GET /api/weekly-pages/this-week
 *
 * Returns the authenticated user's "Week Ahead" digest for the current
 * Sunday → Saturday week in their locale. Cached privately for 6h so a
 * Sunday-evening visitor doesn't recompute on every refresh.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import {
  buildWeeklyPage,
  getCurrentWeekRange,
  type WeeklyPage,
} from '@/lib/weekly-pages/build';
import type { BirthChartData } from '../../../../../utils/astrology/birthChart';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);

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
          page: null as WeeklyPage | null,
        },
        { status: 200 },
      );
    }

    const { weekStart, weekEnd } = getCurrentWeekRange(
      new Date(),
      user.timezone,
    );

    const page = buildWeeklyPage({ natalChart, weekStart, weekEnd });

    return NextResponse.json(
      { success: true, page },
      {
        headers: {
          'Cache-Control': 'private, s-maxage=21600',
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const isAuthError = message.toLowerCase().includes('unauthor');
    if (isAuthError) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }
    console.error('[weekly-pages/this-week] Error');
    return NextResponse.json(
      { success: false, error: 'Failed to build weekly page' },
      { status: 500 },
    );
  }
}
