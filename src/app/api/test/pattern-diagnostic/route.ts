import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get users with recent journal entries
    const usersResult = await sql`
      SELECT
        user_id,
        COUNT(*) as entry_count
      FROM collections
      WHERE category = 'journal'
        AND created_at > NOW() - INTERVAL '30 days'
      GROUP BY user_id
      ORDER BY entry_count DESC
      LIMIT 10
    `;

    // Check existing patterns
    const patternsResult = await sql`
      SELECT
        pattern_type,
        pattern_category,
        COUNT(*) as count,
        AVG(confidence) as avg_confidence,
        MAX(generated_at) as last_generated
      FROM journal_patterns
      GROUP BY pattern_type, pattern_category
      ORDER BY count DESC
    `;

    // Check sample journal entry structure
    const sampleEntry = await sql`
      SELECT
        content,
        created_at
      FROM collections
      WHERE category = 'journal'
        AND created_at > NOW() - INTERVAL '30 days'
      LIMIT 1
    `;

    return NextResponse.json({
      success: true,
      usersWithEntries: usersResult.rows,
      totalUsers: usersResult.rows.length,
      existingPatterns: patternsResult.rows,
      sampleEntry: sampleEntry.rows[0],
    });
  } catch (error) {
    console.error('Pattern diagnostic error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
