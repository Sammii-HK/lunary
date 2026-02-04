import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export interface GrimoirePageStats {
  pagePath: string;
  viewsLast30Days: number;
  viewsAllTime: number;
}

/**
 * GET /api/grimoire/stats
 * Get view statistics for grimoire pages
 * Query params:
 *   - path: specific page path (optional, returns stats for that page)
 *   - top: number of top pages to return (optional, defaults to 10)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pagePath = searchParams.get('path');
    const topCount = Math.min(
      parseInt(searchParams.get('top') || '10', 10),
      50,
    );

    // Get stats for a specific page
    if (pagePath) {
      const result = await sql`
        SELECT
          COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as views_30d,
          COUNT(*) as views_all_time
        FROM conversion_events
        WHERE event_type = 'page_viewed'
          AND page_path = ${pagePath}
      `;

      const row = result.rows[0];
      return NextResponse.json({
        stats: {
          pagePath,
          viewsLast30Days: parseInt(row?.views_30d || '0'),
          viewsAllTime: parseInt(row?.views_all_time || '0'),
        },
      });
    }

    // Get top grimoire pages by views
    const result = await sql`
      SELECT
        page_path,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as views_30d,
        COUNT(*) as views_all_time
      FROM conversion_events
      WHERE event_type = 'page_viewed'
        AND page_path LIKE '/grimoire/%'
      GROUP BY page_path
      ORDER BY views_30d DESC
      LIMIT ${topCount}
    `;

    const pages: GrimoirePageStats[] = result.rows.map((row) => ({
      pagePath: row.page_path,
      viewsLast30Days: parseInt(row.views_30d || '0'),
      viewsAllTime: parseInt(row.views_all_time || '0'),
    }));

    return NextResponse.json({ pages });
  } catch (error: any) {
    // If tables don't exist yet, return empty stats
    if (error?.code === '42P01') {
      return NextResponse.json({
        stats: { pagePath: '', viewsLast30Days: 0, viewsAllTime: 0 },
        pages: [],
      });
    }
    console.error('[Grimoire Stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grimoire stats' },
      { status: 500 },
    );
  }
}
