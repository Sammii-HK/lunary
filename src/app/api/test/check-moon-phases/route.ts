import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getAccurateMoonPhase } from '../../../../../utils/astrology/astronomical-data';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 },
      );
    }

    // Get user ID
    const userResult = await sql`
      SELECT id FROM "user" WHERE email = ${email} LIMIT 1
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: `No user found with email: ${email}` },
        { status: 404 },
      );
    }

    const userId = userResult.rows[0].id;

    // Get journal entries with moon phase data
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const entriesResult = await sql`
      SELECT content, created_at
      FROM collections
      WHERE user_id = ${userId}
      AND category = 'journal'
      AND created_at >= ${cutoffDate.toISOString()}
      ORDER BY created_at DESC
    `;

    const entries = [];

    for (const row of entriesResult.rows) {
      const content =
        typeof row.content === 'string' ? JSON.parse(row.content) : row.content;
      const entryDate = new Date(row.created_at);

      // Get moon phase for this entry
      const moonData = await getAccurateMoonPhase(entryDate);

      entries.push({
        date: entryDate.toISOString().split('T')[0],
        moonPhase: moonData.name,
        emoji: moonData.emoji,
        moodTags: content.moodTags || [],
      });
    }

    // Group by moon phase
    const phaseGroups: Record<string, number> = {};
    for (const entry of entries) {
      phaseGroups[entry.moonPhase] = (phaseGroups[entry.moonPhase] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      email,
      totalEntries: entries.length,
      entries,
      phaseGroups,
      message:
        'To detect moon phase patterns, need 2+ entries in same phase with 2+ occurrences of same mood',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
