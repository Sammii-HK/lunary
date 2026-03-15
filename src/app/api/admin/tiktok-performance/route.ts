import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { bulkInsertPerformance } from '@/lib/social/video-scripts/database';
import { categorisePost } from '@/lib/social/video-scripts/categorise';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export const runtime = 'nodejs';

const BulkImportSchema = z.array(
  z.object({
    description: z.string(),
    views: z.number().int().min(0),
    likes: z.number().int().min(0),
    comments: z.number().int().min(0),
    shares: z.number().int().min(0),
    saves: z.number().int().min(0).optional(),
    duration: z.string().optional(),
    postedAt: z.string(),
    contentCategory: z.string().optional(),
  }),
);

/**
 * POST /api/admin/tiktok-performance
 * Bulk import TikTok Studio performance data.
 *
 * Accepts array of post records. Auto-categorises by description keywords
 * if contentCategory is not provided.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json();
    const parsed = BulkImportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.issues },
        { status: 400 },
      );
    }

    const records = parsed.data.map((record) => ({
      ...record,
      contentCategory:
        record.contentCategory || categorisePost(record.description),
    }));

    const inserted = await bulkInsertPerformance(records);

    return NextResponse.json({
      success: true,
      imported: inserted,
      total: records.length,
      categories: records.reduce(
        (acc, r) => {
          acc[r.contentCategory] = (acc[r.contentCategory] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    });
  } catch (error) {
    console.error('[TikTok Performance POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to import performance data' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/admin/tiktok-performance
 * Returns aggregated scores by content category for the admin dashboard.
 * Query params: ?days=30
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    // Aggregated metrics by content type with composite score
    const byCategory = await sql`
      SELECT
        content_type as category,
        COUNT(*)::int as count,
        AVG(views)::int as avg_views,
        AVG(likes)::int as avg_likes,
        AVG(comments)::int as avg_comments,
        AVG(shares)::int as avg_shares,
        AVG(saves)::int as avg_saves,
        (AVG(views) * 0.3 + AVG(likes) * 1.0 + AVG(comments) * 3.0 + AVG(shares) * 2.0)::int as composite_score
      FROM video_performance
      WHERE content_type IS NOT NULL
        AND recorded_at >= NOW() - INTERVAL '1 day' * ${days}
      GROUP BY content_type
      ORDER BY composite_score DESC
    `;

    // Total stats
    const totals = await sql`
      SELECT
        COUNT(*)::int as total_posts,
        SUM(views)::int as total_views,
        SUM(likes)::int as total_likes,
        SUM(comments)::int as total_comments,
        AVG(views)::int as avg_views
      FROM video_performance
      WHERE recorded_at >= NOW() - INTERVAL '1 day' * ${days}
    `;

    return NextResponse.json({
      days,
      categories: byCategory.rows,
      totals: totals.rows[0] || {},
    });
  } catch (error) {
    console.error('[TikTok Performance GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 },
    );
  }
}
