import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import {
  collectVideoPerformance,
  formatPerformanceMarkdown,
} from '@/lib/social/video-scripts/collect-performance';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120;

const MEMORY_DIR = join(
  process.env.HOME ?? '/tmp',
  '.claude/projects/-Users-sammii-development/memory',
);

/**
 * GET /api/cron/collect-video-performance
 *
 * Daily cron (06:00 UTC) that:
 * 1. Fetches TikTok + Instagram + Pinterest analytics from Ayrshare
 * 2. Categorises each post by caption keyword matching
 * 3. Inserts metrics into video_performance table
 * 4. Updates content-performance.md memory file
 * 5. Self-healing scheduler reads video_performance to adjust content weights
 *
 * Runs on Vercel Cron — works even when local machine is offline.
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { collected, skipped, errors, rankings } =
      await collectVideoPerformance();

    // Update content-performance.md with latest rankings + platform data
    let memoryUpdated = false;
    try {
      const markdown = await formatPerformanceMarkdown(rankings);
      mkdirSync(MEMORY_DIR, { recursive: true });
      writeFileSync(join(MEMORY_DIR, 'content-performance.md'), markdown);
      memoryUpdated = true;
    } catch (memErr) {
      console.warn(
        '[Collect Performance] Failed to write content-performance.md:',
        memErr,
      );
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      collected,
      skipped,
      errors,
      rankingsCount: rankings.length,
      topPerformer: rankings[0]?.contentType ?? 'none',
      topScore: rankings[0]?.compositeScore
        ? Math.round(rankings[0].compositeScore)
        : 0,
      memoryUpdated,
      duration: `${duration}ms`,
    });
  } catch (error) {
    console.error('Error collecting video performance:', error);
    return NextResponse.json(
      {
        error: 'Failed to collect video performance',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
