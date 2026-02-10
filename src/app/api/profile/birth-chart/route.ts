import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/get-user-session';
import { invalidateSnapshot } from '@/lib/cosmic-snapshot/cache';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await sql`
      SELECT birth_chart FROM user_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `;

    if (result.rows.length === 0 || !result.rows[0].birth_chart) {
      return NextResponse.json(
        { birthChart: null },
        {
          headers: {
            'Cache-Control':
              'private, max-age=300, stale-while-revalidate=3600',
          },
        },
      );
    }

    return NextResponse.json(
      { birthChart: result.rows[0].birth_chart },
      {
        headers: {
          'Cache-Control': 'private, max-age=300, stale-while-revalidate=3600',
        },
      },
    );
  } catch (error) {
    console.error('Error fetching birth chart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch birth chart' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { birthChart } = body;

    if (!birthChart || !Array.isArray(birthChart)) {
      return NextResponse.json(
        { error: 'Invalid birth chart data' },
        { status: 400 },
      );
    }

    await sql`
      INSERT INTO user_profiles (user_id, birth_chart)
      VALUES (${user.id}, ${JSON.stringify(birthChart)}::jsonb)
      ON CONFLICT (user_id) DO UPDATE SET
        birth_chart = EXCLUDED.birth_chart,
        updated_at = NOW()
    `;

    // Invalidate ALL cached data derived from the birth chart.
    // Each deletion is wrapped in try/catch so missing tables don't break the flow.
    const tablesToInvalidate = [
      'synastry_reports',
      'daily_horoscopes',
      'monthly_insights',
      'cosmic_snapshots',
      'cosmic_reports',
      'journal_patterns',
      'pattern_analysis',
      'year_analysis',
    ];

    const deletionResults = await Promise.allSettled(
      tablesToInvalidate.map((table) =>
        sql.query(`DELETE FROM ${table} WHERE user_id = $1`, [user.id]),
      ),
    );

    deletionResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.warn(
          `[Birth Chart] Failed to invalidate ${tablesToInvalidate[index]}:`,
          result.reason,
        );
      }
    });

    // Invalidate friend connection synastry caches (different column name)
    try {
      await sql`
        UPDATE friend_connections
        SET synastry_score = NULL, synastry_data = NULL, last_synastry_calc = NULL
        WHERE user_id = ${user.id} OR friend_id = ${user.id}
      `;
    } catch (friendError) {
      console.warn(
        '[Birth Chart] Failed to invalidate friend synastry:',
        friendError,
      );
    }

    // Invalidate Next.js server-side cache tags for cosmic snapshots
    try {
      invalidateSnapshot(user.id);
    } catch (tagError) {
      console.warn(
        '[Birth Chart] Failed to invalidate snapshot cache tags:',
        tagError,
      );
    }

    // Track explorer progress - birth chart saved (Level 1 threshold = 1)
    try {
      const { setExplorerProgress } = await import('@/lib/progress/server');
      await setExplorerProgress(user.id, 1);
    } catch (progressError) {
      console.warn('[Birth Chart] Failed to track progress:', progressError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving birth chart:', error);
    return NextResponse.json(
      { error: 'Failed to save birth chart' },
      { status: 500 },
    );
  }
}
