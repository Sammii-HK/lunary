/**
 * Check tarot_readings table structure and spread types
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    // Get table structure
    const structureResult = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'tarot_readings'
      ORDER BY ordinal_position
    `;

    // Get spread types
    const spreadTypesResult = await sql`
      SELECT
        spread_slug,
        spread_name,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users
      FROM tarot_readings
      GROUP BY spread_slug, spread_name
      ORDER BY count DESC
    `;

    // Sample of each spread type
    const samplesResult = await sql`
      SELECT DISTINCT ON (spread_slug)
        spread_slug,
        spread_name,
        cards,
        metadata,
        created_at
      FROM tarot_readings
      ORDER BY spread_slug, created_at DESC
    `;

    return NextResponse.json({
      success: true,
      structure: structureResult.rows,
      spreadTypes: spreadTypesResult.rows,
      samples: samplesResult.rows,
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
