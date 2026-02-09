import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/get-user-session';

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
      return NextResponse.json({ birthChart: null });
    }

    return NextResponse.json({
      birthChart: result.rows[0].birth_chart,
    });
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

    // Invalidate cached synastry reports so they recalculate with the new chart
    try {
      await sql`DELETE FROM synastry_reports WHERE user_id = ${user.id}`;
    } catch (synastryError) {
      console.warn(
        '[Birth Chart] Failed to invalidate synastry cache:',
        synastryError,
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
