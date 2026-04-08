import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { put } from '@vercel/blob';
import { sendDiscordNotification } from '@/lib/discord';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Only canonical non-www URL is allowed — www.lunary.app returns 308
// which Postiz/Spellcast does not follow when fetching carousel images.
const ALLOWED_BASE_URLS = new Set(['https://lunary.app'].filter(Boolean));

const TARGET_PLATFORMS = ['instagram', 'bluesky'];

/**
 * Weekly carousels cron — generates 7 days of carousel/image content,
 * pre-renders to Blob, and schedules to Spellcast.
 * Runs Sunday 3:30 AM UTC. Replaces the daily-carousels cron.
 *
 * GET /api/cron/weekly-carousels
 * GET /api/cron/weekly-carousels?startDate=2026-03-26&days=7&force=true
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

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
    const skipVideo = url.searchParams.get('skipVideo') === 'true';
    const overrideStart = url.searchParams.get('startDate');
    const daysParam = url.searchParams.get('days');
    const days = daysParam ? Math.min(parseInt(daysParam, 10), 14) : 7;

    const requestedBaseUrl = (
      url.searchParams.get('baseUrl') ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      'https://lunary.app'
    ).replace(/\/$/, '');

    const baseUrl = ALLOWED_BASE_URLS.has(requestedBaseUrl)
      ? requestedBaseUrl
      : 'https://lunary.app';

    const startDate = (() => {
      if (overrideStart && /^\d{4}-\d{2}-\d{2}$/.test(overrideStart)) {
        return new Date(`${overrideStart}T00:00:00Z`);
      }
      const d = new Date();
      d.setUTCDate(d.getUTCDate() + 1);
      return d;
    })();

    const { generateDailyBatch } =
      await import('@/lib/instagram/content-orchestrator');
    const { postToSpellcastMultiPlatform } =
      await import('@/lib/social/spellcast');

    let totalScheduled = 0;
    let totalSkipped = 0;
    let totalFailed = 0;

    const allResults: Array<{
      date: string;
      posts: Array<{
        type: string;
        slides: number;
        status: string;
        platforms?: string;
        error?: string;
      }>;
    }> = [];

    for (let dayOffset = 0; dayOffset < days; dayOffset++) {
      const targetDate = new Date(startDate);
      targetDate.setUTCDate(targetDate.getUTCDate() + dayOffset);
      const dateStr = targetDate.toISOString().split('T')[0];

      // Dedup: skip if feed images already sent for this date
      if (!force) {
        const existing = await sql`
          SELECT COUNT(*) as count FROM social_posts
          WHERE post_type = 'feed_image'
            AND platform = 'instagram'
            AND scheduled_date::date = ${dateStr}::date
            AND status = 'sent'
        `;
        if (Number(existing.rows[0]?.count || 0) > 0) {
          console.log(
            `[weekly-carousels] ${dateStr}: already scheduled, skipping`,
          );
          totalSkipped++;
          allResults.push({ date: dateStr, posts: [] });
          continue;
        }
      }

      const batch = await generateDailyBatch(dateStr, baseUrl);

      if (batch.posts.length === 0) {
        allResults.push({ date: dateStr, posts: [] });
        continue;
      }

      const dayResults: Array<{
        type: string;
        slides: number;
        status: string;
        platforms?: string;
        error?: string;
      }> = [];

      for (const post of batch.posts) {
        try {
          const blobUrls: string[] = [];
          let coverVideoUrl: string | null = null;

          // Optional animated cover video for multi-slide carousels
          const isMultiSlide = post.imageUrls.length > 1;
          if (isMultiSlide && !skipVideo && process.env.CONTENT_CREATOR_URL) {
            try {
              const { generateCarouselCoverVideo } =
                await import('@/lib/instagram/carousel-cover-video');
              const slug = post.metadata.slug || post.type;
              const cover = await generateCarouselCoverVideo({
                slug,
                seed: `carousel-${dateStr}-${slug}`,
              });
              coverVideoUrl = cover.url;
              console.log(
                `[weekly-carousels] ${dateStr} cover video: ${post.type}`,
              );
            } catch (videoErr) {
              console.warn(
                `[weekly-carousels] Cover video failed for ${dateStr}/${post.type}:`,
                videoErr instanceof Error ? videoErr.message : videoErr,
              );
            }
          }

          // Pre-render slide images to Blob sequentially (parallel overwhelms
          // Vercel OG functions and causes timeouts on multi-slide carousels)
          const resolvedUrls: string[] = [];
          for (let i = 0; i < post.imageUrls.length; i++) {
            const imageUrl = post.imageUrls[i];
            if (i === 0 && coverVideoUrl) {
              resolvedUrls.push(coverVideoUrl);
              continue;
            }

            try {
              const res = await fetch(imageUrl, {
                signal: AbortSignal.timeout(45_000),
              });
              if (!res.ok) throw new Error(`HTTP ${res.status}`);

              const buf = await res.arrayBuffer();
              const blobPath = `carousels/${dateStr}/${post.type}-${i}.png`;
              const blob = await put(blobPath, Buffer.from(buf), {
                access: 'public',
                contentType: 'image/png',
              });
              console.log(
                `[weekly-carousels] ${dateStr}/${post.type} slide ${i} (${(buf.byteLength / 1024).toFixed(0)}KB)`,
              );
              resolvedUrls.push(blob.url);
            } catch {
              console.warn(
                `[weekly-carousels] Slide ${i} pre-render failed, using OG URL`,
              );
              // Append .png before query params so Postiz accepts the URL
              resolvedUrls.push(
                imageUrl.includes('/api/og/')
                  ? imageUrl.replace(/(\?.*)$/, '.png$1')
                  : imageUrl,
              );
            }
          }
          // Safety cap: Instagram rejects carousels with more than 10 slides
          const INSTAGRAM_MAX_SLIDES = 10;
          if (resolvedUrls.length > INSTAGRAM_MAX_SLIDES) {
            console.warn(
              `[weekly-carousels] ${post.type} has ${resolvedUrls.length} slides, truncating to ${INSTAGRAM_MAX_SLIDES}`,
            );
            resolvedUrls.splice(INSTAGRAM_MAX_SLIDES);
          }

          blobUrls.push(...resolvedUrls);

          // Ensure scheduled time is in the future
          let scheduledTime = post.scheduledTime;
          const scheduledDate = new Date(scheduledTime);
          const now = new Date();
          if (scheduledDate <= now) {
            scheduledTime = new Date(
              now.getTime() + 30 * 60 * 1000,
            ).toISOString();
          }

          // Platform-specific captions
          const igCaption = post.caption;
          const hashtagStr = post.hashtags.join(' ');
          const hookLine = post.caption.split('\n')[0];
          const bskyCaption = `${hookLine}\n\nlunary.app/grimoire`.slice(
            0,
            295,
          );

          const media = blobUrls.map((blobUrl, i) => ({
            type: (i === 0 && coverVideoUrl ? 'video' : 'image') as
              | 'image'
              | 'video',
            url: blobUrl,
          }));

          const spellcastResult = await postToSpellcastMultiPlatform({
            platforms: TARGET_PLATFORMS,
            content: igCaption,
            scheduledDate: scheduledTime,
            media,
            variants: {
              bluesky: { content: bskyCaption },
            },
            firstComment: hashtagStr || undefined,
          });

          const anySuccess = Object.values(spellcastResult.results).some(
            (r) => r.success,
          );
          const allSuccess = Object.values(spellcastResult.results).every(
            (r) => r.success,
          );

          if (anySuccess) {
            const imageUrlStr = blobUrls.join('|');
            await sql`
              INSERT INTO social_posts (content, platform, post_type, scheduled_date, status, image_url, content_type)
              VALUES (${igCaption}, 'instagram', 'feed_image', ${scheduledTime}, 'sent', ${imageUrlStr}, ${post.type})
            `;
            totalScheduled++;
          }

          const platformResults = Object.entries(spellcastResult.results)
            .map(([p, r]) => `${p}:${r.success ? 'ok' : r.error || 'fail'}`)
            .join(' | ');

          dayResults.push({
            type: post.type,
            slides: blobUrls.length,
            status: allSuccess ? 'success' : anySuccess ? 'partial' : 'error',
            platforms: platformResults,
            ...(!anySuccess
              ? {
                  error: Object.values(spellcastResult.results).find(
                    (r) => !r.success,
                  )?.error,
                }
              : {}),
          });

          if (!anySuccess) totalFailed++;
        } catch (postError) {
          const errorMsg =
            postError instanceof Error ? postError.message : 'Unknown error';
          console.error(
            `[weekly-carousels] ${dateStr}/${post.type} failed:`,
            postError,
          );

          await sql`
            INSERT INTO social_posts (content, platform, post_type, scheduled_date, status, content_type, rejection_feedback)
            VALUES ('', 'instagram', 'feed_image', ${post.scheduledTime}, 'failed', ${post.type}, ${errorMsg})
          `;

          dayResults.push({
            type: post.type,
            slides: post.imageUrls.length,
            status: 'error',
            error: errorMsg,
          });
          totalFailed++;
        }
      }

      allResults.push({ date: dateStr, posts: dayResults });
    }

    const executionTimeMs = Date.now() - startTime;
    const dateRange = `${allResults[0]?.date || '?'} to ${allResults[allResults.length - 1]?.date || '?'}`;

    console.log(
      `[weekly-carousels] Done: ${totalScheduled} scheduled, ${totalSkipped} skipped, ${totalFailed} failed in ${executionTimeMs}ms`,
    );

    try {
      await sendDiscordNotification({
        title:
          totalFailed > 0
            ? 'Weekly Carousels — Partial'
            : 'Weekly Carousels — Done',
        description: [
          `**${dateRange}** (${days} days)`,
          `Scheduled: ${totalScheduled} | Skipped: ${totalSkipped} | Failed: ${totalFailed}`,
          `Time: ${(executionTimeMs / 1000).toFixed(1)}s`,
        ].join('\n'),
        color: totalFailed > 0 ? 'warning' : 'success',
        category: 'general',
      });
    } catch {
      console.warn('[weekly-carousels] Discord notification failed');
    }

    return NextResponse.json({
      success: totalScheduled > 0 || totalSkipped > 0,
      dateRange,
      days,
      totalScheduled,
      totalSkipped,
      totalFailed,
      executionTimeMs,
      results: allResults,
    });
  } catch (error) {
    console.error('[weekly-carousels] Fatal error:', error);
    try {
      await sendDiscordNotification({
        title: 'Weekly Carousels — Fatal Error',
        description: error instanceof Error ? error.message : 'Unknown error',
        color: 'error',
        category: 'general',
      });
    } catch {
      // Discord itself failed
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
