import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';

/**
 * GET /api/admin/social-posts/stories
 * Query Instagram stories by highlight category.
 * Query params: ?category=Moon&days=7
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const days = parseInt(searchParams.get('days') || '30', 10);

    const since = new Date();
    since.setDate(since.getDate() - days);

    const stories = await sql`
      SELECT id, content_type, story_category, scheduled_date, status, image_url
      FROM social_posts
      WHERE post_type = 'story' AND platform = 'instagram'
        AND scheduled_date >= ${since.toISOString()}
        AND (${category}::text IS NULL OR story_category = ${category})
      ORDER BY scheduled_date DESC
      LIMIT 50
    `;

    return NextResponse.json({
      success: true,
      stories: stories.rows,
      count: stories.rows.length,
    });
  } catch (error) {
    console.error('Failed to fetch stories:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
