import { NextRequest, NextResponse } from 'next/server';
import { generateThreadsBatch } from '@/lib/threads/content-orchestrator';
import { THREADS_CHAR_LIMITS } from '@/lib/threads/types';
import { requireAdminAuth } from '@/lib/admin-auth';

/**
 * GET /api/admin/threads/preview?date=YYYY-MM-DD
 *
 * Returns a preview of the Threads batch for a given date without
 * sending anything to Succulent. Useful for testing and QA.
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const dateStr =
    searchParams.get('date') || new Date().toISOString().split('T')[0];

  try {
    const batch = await generateThreadsBatch(dateStr);

    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

    const postsPreview = batch.posts.map((post) => {
      const fullContent = [post.hook, post.body, post.prompt]
        .filter(Boolean)
        .join('\n\n');

      return {
        scheduledTime: post.scheduledTime,
        source: post.source,
        pillar: post.pillar,
        topicTag: post.topicTag,
        hasImage: post.hasImage,
        imageUrl: post.imageUrl,
        charCount: {
          hook: post.hook.length,
          body: post.body.length,
          prompt: post.prompt.length,
          total: fullContent.length,
          withinLimit: fullContent.length <= THREADS_CHAR_LIMITS.total,
        },
        content: {
          hook: post.hook,
          body: post.body,
          prompt: post.prompt,
          full: fullContent,
        },
      };
    });

    return NextResponse.json({
      date: dateStr,
      dayName,
      isWeekend,
      expectedSlots: isWeekend ? 3 : 5,
      actualSlots: batch.posts.length,
      posts: postsPreview,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to generate Threads batch preview',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
