import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

interface Params {
  token: string;
}

export async function GET(_request: Request, { params }: { params: Params }) {
  try {
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

    return NextResponse.json({
      success: true,
      report: {
        id: row.id,
        type: row.report_type,
        data: row.report_data,
        created_at: row.created_at,
      },
    });
  } catch (error) {
    console.error('Failed to fetch shared cosmic report:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to load report' },
      { status: 500 },
    );
  }
}
