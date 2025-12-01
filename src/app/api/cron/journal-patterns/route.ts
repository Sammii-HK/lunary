import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import {
  analyzeJournalPatterns,
  savePatterns,
} from '@/lib/journal/pattern-analyzer';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const usersResult = await sql`
      SELECT DISTINCT user_id 
      FROM collections 
      WHERE category = 'journal'
      AND created_at > NOW() - INTERVAL '30 days'
    `;

    const userIds = usersResult.rows.map((row) => row.user_id);
    let patternsGenerated = 0;

    for (const userId of userIds) {
      try {
        const result = await analyzeJournalPatterns(userId, 30);
        if (result.patterns.length > 0) {
          await savePatterns(userId, result.patterns);
          patternsGenerated++;
        }
      } catch (error) {
        console.error(`Failed to analyze patterns for user ${userId}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      usersProcessed: userIds.length,
      patternsGenerated,
    });
  } catch (error) {
    console.error('Journal patterns cron failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate patterns' },
      { status: 500 },
    );
  }
}
