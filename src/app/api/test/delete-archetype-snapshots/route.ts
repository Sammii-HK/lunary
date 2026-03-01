/**
 * Delete all archetype snapshots to regenerate with monthly frequency
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Get user ID
    const userResult = await sql`
      SELECT id FROM "user" WHERE email = ${email} LIMIT 1
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userResult.rows[0].id;

    // Delete all archetype snapshots for this user
    const deleteResult = await sql`
      DELETE FROM journal_patterns
      WHERE user_id = ${userId}
        AND pattern_type = 'archetype'
    `;

    return NextResponse.json({
      success: true,
      email,
      deleted: deleteResult.rowCount || 0,
      message: `Deleted ${deleteResult.rowCount || 0} archetype snapshots. Run backfill to regenerate with monthly frequency.`,
    });
  } catch (error) {
    console.error('Error deleting archetype snapshots:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
