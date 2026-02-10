import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');
    const date = dateParam || new Date().toISOString().split('T')[0];

    const result = await sql`
      SELECT 
        id,
        moon_phase,
        moon_sign,
        circle_date,
        content
      FROM moon_circles
      WHERE circle_date = ${date}::date
      ORDER BY circle_date DESC
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        moonCircle: null,
        message: 'No moon circle found for this date',
      });
    }

    const row = result.rows[0];
    const moonCircle = {
      id: row.id,
      moonPhase: row.moon_phase,
      moonSign: row.moon_sign,
      circleDate: row.circle_date,
      content: row.content,
    };

    return NextResponse.json(
      {
        success: true,
        moonCircle,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
      },
    );
  } catch (error) {
    console.error('Error fetching moon circle:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
