import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';

/**
 * Cleanup job to delete expired video records
 * Runs daily via cron or scheduled function
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request (optional security check)
    const authHeader = request.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🧹 Starting video cleanup job...');

    // Delete videos where expires_at < NOW()
    const result = await sql`
      DELETE FROM videos
      WHERE expires_at < NOW()
      RETURNING id, video_url, type
    `;

    const deletedCount = result.rows.length;

    console.log(`✅ Cleaned up ${deletedCount} expired video records`);

    return NextResponse.json({
      success: true,
      deletedCount,
      deletedVideos: result.rows,
    });
  } catch (error) {
    console.error('Video cleanup error:', error);
    return NextResponse.json(
      {
        error: 'Failed to cleanup videos',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    );
  }
}
