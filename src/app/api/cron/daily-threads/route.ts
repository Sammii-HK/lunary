import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { postToSocial } from '@/lib/social/client';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(request: NextRequest) {
  try {
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const authHeader = request.headers.get('authorization');

    if (!isVercelCron) {
      if (
        !process.env.CRON_SECRET ||
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const url = new URL(request.url);
    const force = url.searchParams.get('force') === 'true';
    const overrideDate = url.searchParams.get('date');
    const threadsSlotsParam = url.searchParams.get('threadsSlots');
    const threadsSlotsOverride = threadsSlotsParam
      ? threadsSlotsParam
          .split(',')
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !isNaN(n))
      : null;

    const now = new Date();
    const dateStr =
      overrideDate && /^\d{4}-\d{2}-\d{2}$/.test(overrideDate)
        ? overrideDate
        : now.toISOString().split('T')[0];

    const eventKey = `daily-threads-${dateStr}`;

    // Dedup gate
    if (!force) {
      const alreadySent = await sql`
        SELECT id FROM notification_sent_events
        WHERE date = ${dateStr}::date
        AND event_key = ${eventKey}
      `;
      if (alreadySent.rows.length > 0) {
        console.log(`🧵 Threads already generated for ${dateStr}, skipping`);
        return NextResponse.json({
          success: true,
          skipped: true,
          message: `Already generated for ${dateStr}`,
        });
      }
    }

    console.log(`🧵 Generating Threads batch for ${dateStr}...`);
    const startTime = Date.now();

    const { generateThreadsBatch } =
      await import('@/lib/threads/content-orchestrator');
    const threadsBatch = await generateThreadsBatch(dateStr);

    // Apply slot overrides if provided
    if (threadsSlotsOverride && threadsSlotsOverride.length > 0) {
      threadsBatch.posts.forEach(
        (post: { scheduledTime: string }, i: number) => {
          const hour =
            threadsSlotsOverride[i] ??
            threadsSlotsOverride[threadsSlotsOverride.length - 1];
          const d = new Date(`${dateStr}T00:00:00.000Z`);
          d.setUTCHours(hour, 0, 0, 0);
          post.scheduledTime = d.toISOString();
        },
      );
    }

    const results: Array<{
      scheduledTime: string;
      pillar: string;
      source: string;
      status: string;
      error?: string;
    }> = [];

    for (const post of threadsBatch.posts) {
      try {
        const content = [post.hook, post.body, post.prompt]
          .filter(Boolean)
          .join('\n\n');

        const result = await postToSocial({
          platform: 'threads',
          content,
          scheduledDate: post.scheduledTime,
          media:
            post.hasImage && post.imageUrl
              ? [
                  {
                    type: 'image',
                    url: post.imageUrl,
                    alt: `${post.topicTag} content from Lunary`,
                  },
                ]
              : [],
          platformSettings: { topic_tag: post.topicTag },
        });

        results.push({
          scheduledTime: post.scheduledTime,
          pillar: post.pillar,
          source: post.source,
          status: result.success ? 'success' : 'error',
          ...(result.success ? {} : { error: result.error || 'Unknown error' }),
        });
      } catch (postError) {
        results.push({
          scheduledTime: post.scheduledTime,
          pillar: post.pillar,
          source: post.source,
          status: 'error',
          error:
            postError instanceof Error ? postError.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const executionTimeMs = Date.now() - startTime;

    // Record that we ran today
    if (successCount > 0) {
      await sql`
        INSERT INTO notification_sent_events (date, event_key, event_type, event_name, event_priority, sent_by)
        VALUES (${dateStr}::date, ${eventKey}, 'daily_threads', 'Daily Threads Batch', 3, 'cron')
        ON CONFLICT (date, event_key) DO NOTHING
      `;
    }

    console.log(
      `🧵 Threads batch: ${threadsBatch.posts.length} generated, ${successCount} sent in ${executionTimeMs}ms`,
    );

    return NextResponse.json({
      success: successCount > 0,
      date: dateStr,
      postCount: threadsBatch.posts.length,
      sentCount: successCount,
      posts: results,
      executionTimeMs,
    });
  } catch (error) {
    console.error('🧵 Daily Threads cron failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
