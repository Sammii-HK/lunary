import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';
export const revalidate = 3600; // Cache shared reports for 1 hour - they don't change frequently

export async function GET(_request: NextRequest, context: any) {
  try {
    const { params } = context as { params: { token: string } };
    const { token } = params;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Share token required' },
        { status: 400 },
      );
    }

    const result = await sql`
      SELECT id, report_type, report_data, created_at
      FROM cosmic_reports
      WHERE share_token = ${token} AND is_public = true
      LIMIT 1
    `;

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Report not found' },
        { status: 404 },
      );
    }

    const row = result.rows[0];

    return NextResponse.json(
      {
        success: true,
        report: {
          id: row.id,
          type: row.report_type,
          data: row.report_data,
          created_at: row.created_at,
        },
      },
      {
        headers: {
          'Cache-Control':
            'public, s-maxage=3600, stale-while-revalidate=1800, max-age=3600',
          'CDN-Cache-Control': 'public, s-maxage=3600',
          'Vercel-CDN-Cache-Control': 'public, s-maxage=3600',
        },
      },
    );
  } catch (error) {
    console.error('Failed to fetch shared cosmic report:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to load report' },
      { status: 500 },
    );
  }
}
