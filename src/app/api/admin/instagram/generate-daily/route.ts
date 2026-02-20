import { NextRequest, NextResponse } from 'next/server';
import { generateDailyBatch } from '@/lib/instagram/content-orchestrator';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const dateStr =
      searchParams.get('date') || new Date().toISOString().split('T')[0];

    const batch = await generateDailyBatch(dateStr);

    return NextResponse.json({
      success: true,
      date: batch.date,
      postCount: batch.posts.length,
      posts: batch.posts.map((post) => ({
        type: post.type,
        format: post.format,
        imageCount: post.imageUrls.length,
        imageUrls: post.imageUrls,
        caption: post.caption,
        hashtags: post.hashtags.join(' '),
        scheduledTime: post.scheduledTime,
        metadata: post.metadata,
      })),
    });
  } catch (error) {
    console.error('[Admin IG Generate] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
