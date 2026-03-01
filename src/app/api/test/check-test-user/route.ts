import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const testUserId = 'test-pattern-user-001';

    // Check if user exists
    const userCheck = await sql`
      SELECT id, name, email FROM "user" WHERE id = ${testUserId}
    `;

    // Check if profile exists
    const profileCheck = await sql`
      SELECT user_id, name, birthday FROM user_profiles WHERE user_id = ${testUserId}
    `;

    // Check journal entries (any date)
    const entriesCheck = await sql`
      SELECT
        COUNT(*) as total_count,
        MIN(created_at) as first_entry,
        MAX(created_at) as last_entry
      FROM collections
      WHERE user_id = ${testUserId}
        AND category = 'journal'
    `;

    // Get sample entries
    const sampleEntries = await sql`
      SELECT
        title,
        content,
        created_at
      FROM collections
      WHERE user_id = ${testUserId}
        AND category = 'journal'
      ORDER BY created_at DESC
      LIMIT 3
    `;

    return NextResponse.json({
      success: true,
      testUserId,
      userExists: userCheck.rows.length > 0,
      user: userCheck.rows[0] || null,
      profileExists: profileCheck.rows.length > 0,
      profile: profileCheck.rows[0] || null,
      entries: {
        total: entriesCheck.rows[0]?.total_count || 0,
        firstEntry: entriesCheck.rows[0]?.first_entry,
        lastEntry: entriesCheck.rows[0]?.last_entry,
        samples: sampleEntries.rows,
      },
    });
  } catch (error) {
    console.error('Check test user error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
