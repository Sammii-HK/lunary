import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { put } from '@vercel/blob';
import { sendDiscordNotification } from '@/lib/discord';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const ALLOWED_BASE_URLS = new Set(
  [
    'https://lunary.app',
    'https://www.lunary.app',
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean),
);

// Platforms that receive carousel/image content
const TARGET_PLATFORMS = ['instagram', 'bluesky', 'mastodon'];

export async function GET(request: NextRequest) {
  try {
    // Auth (same pattern as daily-stories)
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
    const skipVideo = url.searchParams.get('skipVideo') === 'true';

    const dateStr = (() => {
      if (overrideDate && /^\d{4}-\d{2}-\d{2}$/.test(overrideDate)) {
        return overrideDate;
      }
      // Schedule 7 days ahead — gives time to review and fix issues
      const target = new Date();
      target.setDate(target.getDate() + 7);
      return target.toISOString().split('T')[0];
    })();

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
        console.log(`📸 Feed images already sent for ${dateStr}, skipping`);
        return NextResponse.json({
          success: true,
          skipped: true,
          message: `Feed images already sent for ${dateStr}`,
        });
      }
    }

    console.log(`📸 Generating daily carousel/image content for ${dateStr}...`);
    const startTime = Date.now();

    // Validate base URL (SSRF prevention)
    const requestedBaseUrl = (
      url.searchParams.get('baseUrl') ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      'https://lunary.app'
    ).replace(/\/$/, '');

    const baseUrl = ALLOWED_BASE_URLS.has(requestedBaseUrl)
      ? requestedBaseUrl
      : 'https://lunary.app';

    // Dynamic imports to keep cold starts fast
    const { generateDailyBatch } =
      await import('@/lib/instagram/content-orchestrator');
    const { postToSpellcastMultiPlatform } =
      await import('@/lib/social/spellcast');

    const batch = await generateDailyBatch(dateStr, baseUrl);

    if (batch.posts.length === 0) {
      return NextResponse.json({
        success: true,
        date: dateStr,
        message: 'No image content scheduled for today',
      });
    }

    const results: Array<{
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

        // For carousel types, try generating an animated cover video
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
              `[daily-carousels] Cover video generated for ${post.type}: ${cover.url}`,
            );
          } catch (videoErr) {
            console.warn(
              `[daily-carousels] Cover video failed for ${post.type}, using static image:`,
              videoErr instanceof Error ? videoErr.message : videoErr,
            );
          }
        }

        // Pre-render all slide images to Vercel Blob
        for (let i = 0; i < post.imageUrls.length; i++) {
          // Skip first slide if we have a cover video (it replaces the static cover)
          if (i === 0 && coverVideoUrl) {
            blobUrls.push(coverVideoUrl);
            continue;
          }

          try {
            const res = await fetch(post.imageUrls[i], {
              signal: AbortSignal.timeout(60000),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const buf = await res.arrayBuffer();
            const blobPath = `carousels/${dateStr}/${post.type}-${i}.png`;
            const blob = await put(blobPath, Buffer.from(buf), {
              access: 'public',
              contentType: 'image/png',
            });
            blobUrls.push(blob.url);
            console.log(
              `[daily-carousels] Uploaded ${post.type} slide ${i} (${(buf.byteLength / 1024).toFixed(0)}KB)`,
            );
          } catch {
            console.warn(
              `[daily-carousels] Slide ${i} pre-render failed, using OG URL`,
            );
            blobUrls.push(post.imageUrls[i]);
          }
        }

        // Ensure scheduled time is in the future
        let scheduledTime = post.scheduledTime;
        const scheduledDate = new Date(scheduledTime);
        const now = new Date();
        if (scheduledDate <= now) {
          scheduledTime = new Date(
            now.getTime() + 30 * 60 * 1000,
          ).toISOString();
        }

        // Build platform-specific captions
        const igCaption = post.caption;
        const hashtagStr = post.hashtags.join(' ');

        // Shortened caption for Bluesky (300 char limit) and Mastodon
        const hookLine = post.caption.split('\n')[0];
        const bskyCaption = `${hookLine}\n\nlunary.app/grimoire`.slice(0, 295);
        const mastoCaption = `${hookLine}\n\nlunary.app/grimoire\n\n${hashtagStr}`;

        // Determine media types (cover video = video, rest = image)
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
            mastodon: { content: mastoCaption },
          },
          firstComment: hashtagStr || undefined,
        });

        const anySuccess = Object.values(spellcastResult.results).some(
          (r) => r.success,
        );
        const allSuccess = Object.values(spellcastResult.results).every(
          (r) => r.success,
        );

        // Record in social_posts
        if (anySuccess) {
          const imageUrlStr = blobUrls.join('|');
          await sql`
            INSERT INTO social_posts (content, platform, post_type, scheduled_date, status, image_url, content_type)
            VALUES (${igCaption}, 'instagram', 'feed_image', ${scheduledTime}, 'sent', ${imageUrlStr}, ${post.type})
          `;
        }

        const platformResults = Object.entries(spellcastResult.results)
          .map(([p, r]) => `${p}:${r.success ? 'ok' : 'fail'}`)
          .join(' ');

        results.push({
          type: post.type,
          slides: blobUrls.length,
          status: allSuccess ? 'success' : anySuccess ? 'partial' : 'error',
          platforms: platformResults,
        });
      } catch (postError) {
        const errorMsg =
          postError instanceof Error ? postError.message : 'Unknown error';
        console.error(`[daily-carousels] ${post.type} failed:`, postError);

        await sql`
          INSERT INTO social_posts (content, platform, post_type, scheduled_date, status, content_type, rejection_feedback)
          VALUES ('', 'instagram', 'feed_image', ${post.scheduledTime}, 'failed', ${post.type}, ${errorMsg})
        `;

        results.push({
          type: post.type,
          slides: post.imageUrls.length,
          status: 'error',
          error: errorMsg,
        });
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const failedCount = results.filter((r) => r.status === 'error').length;
    const executionTimeMs = Date.now() - startTime;

    console.log(
      `📸 Carousels: ${batch.posts.length} generated, ${successCount} sent in ${executionTimeMs}ms`,
    );

    // Discord notification on failure
    if (failedCount > 0) {
      const failedPosts = results.filter((r) => r.status === 'error');
      try {
        await sendDiscordNotification({
          title: 'Daily Carousels — Failures',
          description: [
            `**${dateStr}**: ${successCount}/${results.length} sent, ${failedCount} failed`,
            ...failedPosts.map((r) => `- ${r.type}: ${r.error}`),
          ].join('\n'),
          color: successCount === 0 ? 'error' : 'warning',
          category: 'general',
        });
      } catch {
        console.warn('[daily-carousels] Discord notification failed');
      }
    }

    return NextResponse.json({
      success: successCount > 0,
      date: dateStr,
      postCount: batch.posts.length,
      sentCount: successCount,
      posts: results,
      executionTimeMs,
    });
  } catch (error) {
    console.error('📸 Daily Carousels cron failed:', error);
    try {
      await sendDiscordNotification({
        title: 'Daily Carousels — Fatal Error',
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
