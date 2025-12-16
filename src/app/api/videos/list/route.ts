import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'short' | 'medium' | 'long'
    const status = searchParams.get('status'); // 'pending' | 'uploaded' | 'failed'
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Build query with proper conditional WHERE clauses
    const whereConditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    whereConditions.push(`created_at > NOW() - INTERVAL '7 days'`);

    if (type) {
      whereConditions.push(`type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    params.push(limit);

    const whereClause = whereConditions.join(' AND ');
    const queryText = `
      SELECT
        id,
        type,
        video_url,
        audio_url,
        thumbnail_url,
        title,
        description,
        post_content,
        week_number,
        blog_slug,
        status,
        youtube_video_id,
        created_at,
        expires_at
      FROM videos
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex}
    `;

    const result = await sql.query(queryText, params);

    return NextResponse.json({
      success: true,
      videos: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Failed to list videos:', error);
    return NextResponse.json(
      {
        error: 'Failed to list videos',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    );
  }
}
