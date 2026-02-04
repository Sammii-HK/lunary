import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/push/preferences
 * Get user's native push notification preferences
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await sql`
      SELECT preferences, is_active
      FROM native_push_tokens
      WHERE user_id = ${session.user.id} AND is_active = true
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({
        registered: false,
        preferences: null,
      });
    }

    return NextResponse.json({
      registered: true,
      preferences: result.rows[0].preferences || {},
      isActive: result.rows[0].is_active,
    });
  } catch (error) {
    console.error('[API] Error fetching push preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/push/preferences
 * Update user's native push notification preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { preferences } = await request.json();

    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'Invalid preferences' },
        { status: 400 },
      );
    }

    // Merge new preferences with existing ones
    const result = await sql`
      UPDATE native_push_tokens
      SET
        preferences = COALESCE(preferences, '{}'::jsonb) || ${JSON.stringify(preferences)}::jsonb,
        updated_at = NOW()
      WHERE user_id = ${session.user.id} AND is_active = true
      RETURNING preferences
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'No active push registration found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      preferences: result.rows[0].preferences,
    });
  } catch (error) {
    console.error('[API] Error updating push preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 },
    );
  }
}
