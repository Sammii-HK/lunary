/**
 * Debug endpoint to check tarot data sources
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    // Check tarot_readings structure
    const tarotReadingsResult = await sql`
      SELECT COUNT(*) as total_readings,
             COUNT(DISTINCT user_id) as unique_users
      FROM tarot_readings
    `;

    // Sample tarot readings to see structure
    const sampleReadings = await sql`
      SELECT id, user_id, created_at, cards, metadata
      FROM tarot_readings
      ORDER BY created_at DESC
      LIMIT 5
    `;

    // Check if there's a daily_tarot or similar table
    const tablesResult = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name LIKE '%tarot%'
      ORDER BY table_name
    `;

    // Check for users with most tarot activity
    const topUsersResult = await sql`
      SELECT user_id, COUNT(*) as pull_count
      FROM tarot_readings
      GROUP BY user_id
      ORDER BY pull_count DESC
      LIMIT 10
    `;

    return NextResponse.json({
      success: true,
      summary: {
        tarotReadings: tarotReadingsResult.rows[0],
        tarotTables: tablesResult.rows.map((r) => r.table_name),
      },
      sampleReadings: sampleReadings.rows,
      topUsers: topUsersResult.rows,
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
