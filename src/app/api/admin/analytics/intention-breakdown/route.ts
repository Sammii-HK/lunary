import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

import { formatTimestamp, resolveDateRange } from '@/lib/analytics/date-range';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    const breakdownResult = await sql`
      SELECT intention, COUNT(*) AS count
      FROM user_profiles
      WHERE intention IS NOT NULL
        AND intention <> ''
        AND updated_at BETWEEN ${formatTimestamp(range.start)} AND ${formatTimestamp(
          range.end,
        )}
      GROUP BY intention
      ORDER BY count DESC
    `;

    const rows = breakdownResult.rows.map((row) => ({
      intention: row.intention as string,
      count: Number(row.count || 0),
    }));

    const total = rows.reduce((sum, item) => sum + item.count, 0);

    const breakdown = rows.map((item) => ({
      ...item,
      percentage:
        total > 0 ? Number(((item.count / total) * 100).toFixed(2)) : 0,
    }));

    return NextResponse.json({ data: breakdown, total });
  } catch (error) {
    console.error(
      '[admin/analytics/intention-breakdown] Failed to fetch intention data',
      error,
    );
    return NextResponse.json(
      { error: 'Failed to load intention breakdown' },
      { status: 500 },
    );
  }
}
