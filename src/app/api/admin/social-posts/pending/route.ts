import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const result = await sql`
      SELECT 
        id,
        content,
        platform,
        post_type as "postType",
        topic,
        scheduled_date as "scheduledDate",
        status,
        image_url as "imageUrl",
        video_url as "videoUrl",
        created_at as "createdAt"
      FROM social_posts
      WHERE status IN ('pending', 'approved')
      ORDER BY created_at DESC
      LIMIT 50
    `;

    return NextResponse.json({
      success: true,
      posts: result.rows,
    });
  } catch (error) {
    console.error('Error fetching pending posts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        posts: [],
      },
      { status: 500 },
    );
  }
}
