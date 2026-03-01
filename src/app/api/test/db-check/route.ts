/**
 * Database structure check endpoint
 * GET /api/test/db-check
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    // Check if tables exist
    const tablesResult = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('global_cosmic_data', 'tarot_readings', 'collections', 'journal_patterns')
      ORDER BY table_name
    `;

    const tables = tablesResult.rows.map((r) => r.table_name);

    // Check global_cosmic_data structure if it exists
    let cosmicDataStructure = null;
    if (tables.includes('global_cosmic_data')) {
      const structureResult = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'global_cosmic_data'
        ORDER BY ordinal_position
      `;
      cosmicDataStructure = structureResult.rows;

      // Check sample data
      const sampleResult = await sql`
        SELECT * FROM global_cosmic_data
        ORDER BY data_date DESC
        LIMIT 1
      `;
      cosmicDataStructure = {
        columns: structureResult.rows,
        sampleRow: sampleResult.rows[0] || null,
        rowCount: (await sql`SELECT COUNT(*) as count FROM global_cosmic_data`)
          .rows[0].count,
      };
    }

    // Check journal_patterns structure
    const journalPatternsResult = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'journal_patterns'
      ORDER BY ordinal_position
    `;

    return NextResponse.json({
      success: true,
      tables: {
        exists: tables,
        globalCosmicData: cosmicDataStructure,
        journalPatterns: journalPatternsResult.rows,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
