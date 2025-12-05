import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const { targetSubreddit = 'lunary_insights' } = await request.json();

    const result = await sql`
      UPDATE social_posts 
      SET 
        content = REGEXP_REPLACE(
          content, 
          'r/[A-Za-z0-9_]+', 
          ${'r/' + targetSubreddit},
          'g'
        ),
        updated_at = NOW()
      WHERE platform = 'reddit' 
        AND status IN ('pending', 'approved')
      RETURNING id, content
    `;

    return NextResponse.json({
      success: true,
      message: `Updated ${result.rowCount} Reddit posts to r/${targetSubreddit}`,
      updatedCount: result.rowCount,
      updatedIds: result.rows.map((r) => r.id),
    });
  } catch (error: any) {
    console.error('Error updating Reddit subreddits:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to update Reddit posts',
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const result = await sql`
      SELECT id, content, status, created_at
      FROM social_posts 
      WHERE platform = 'reddit' 
        AND status IN ('pending', 'approved')
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      success: true,
      posts: result.rows,
      count: result.rowCount,
    });
  } catch (error: any) {
    console.error('Error fetching Reddit posts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch Reddit posts',
      },
      { status: 500 },
    );
  }
}
