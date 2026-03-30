import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { put } from '@vercel/blob';
import { postToSocial } from '@/lib/social/client';
import { hasValidImageExtension } from '@/lib/social/pre-upload-image';
import { sendDiscordNotification } from '@/lib/discord';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const STORY_UTC_HOURS = [9, 12, 15, 19];

const VARIANT_TO_HIGHLIGHT: Record<string, string> = {
  daily_moon: 'Moon',
  tarot_pull: 'Tarot',
  quote: 'Quotes',
  did_you_know: 'Grimoire',
  affirmation: 'Affirmations',
  ritual_tip: 'Rituals',
  sign_of_the_day: 'Zodiac',
  transit_alert: 'Cosmic',
  numerology: 'Numerology',
  calendar_event: 'Cosmic',
};

const ALLOWED_BASE_URLS = new Set(
  [
    'https://lunary.app',
    'https://www.lunary.app',
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean),
);

/**
 * Weekly stories cron — pre-renders 28 story images and schedules them to Spellcast.
 * Runs Sunday 4AM UTC. Replaces the daily-stories cron.
 *
 * GET /api/cron/weekly-stories
 * GET /api/cron/weekly-stories?startDate=2026-03-26&days=7&force=true
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
    const overrideStart = url.searchParams.get('startDate');
    const daysParam = url.searchParams.get('days');
    const days = daysParam ? Math.min(parseInt(daysParam, 10), 14) : 7;

    const requestedBaseUrl = (
      url.searchParams.get('storyBaseUrl') ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      'https://lunary.app'
    ).replace(/\/$/, '');

    const SHARE_BASE_URL = ALLOWED_BASE_URLS.has(requestedBaseUrl)
      ? requestedBaseUrl
      : 'https://lunary.app';

    // Calculate date range: default is tomorrow + 7 days
    const startDate = (() => {
      if (overrideStart && /^\d{4}-\d{2}-\d{2}$/.test(overrideStart)) {
        return new Date(`${overrideStart}T00:00:00Z`);
      }
      const d = new Date();
      d.setUTCDate(d.getUTCDate() + 1);
      return d;
    })();

    const { generateDailyStoryData } =
      await import('@/lib/instagram/story-content');

    const allResults: Array<{
      date: string;
      stories: Array<{
        variant: string;
        scheduledTime: string;
        status: string;
        error?: string;
      }>;
    }> = [];

    let totalRendered = 0;
    let totalScheduled = 0;
    let totalSkipped = 0;
    let totalFailed = 0;

    for (let dayOffset = 0; dayOffset < days; dayOffset++) {
      const targetDate = new Date(startDate);
      targetDate.setUTCDate(targetDate.getUTCDate() + dayOffset);
      const dateStr = targetDate.toISOString().split('T')[0];

      // Dedup: skip if 4 stories already sent for this date
      if (!force) {
        const existing = await sql`
          SELECT COUNT(*) as count FROM social_posts
          WHERE post_type = 'story' AND platform = 'instagram'
            AND scheduled_date::date = ${dateStr}::date
            AND status = 'sent'
        `;
        if (Number(existing.rows[0]?.count || 0) >= 4) {
          console.log(
            `[weekly-stories] ${dateStr}: already scheduled, skipping`,
          );
          totalSkipped += 4;
          allResults.push({ date: dateStr, stories: [] });
          continue;
        }
      }

      // Generate story data with real quotes filled in
      const storyItems = await generateDailyStoryData(dateStr, {
        fillQuotes: true,
      });

      // Pre-render story images sequentially (parallel overwhelms Vercel OG
      // functions and causes timeouts — each OG render takes ~18s)
      const imageUrls: string[] = [];
      for (let i = 0; i < storyItems.length; i++) {
        const story = storyItems[i];
        const imageParams = new URLSearchParams(story.params);
        const rawImageUrl = `${SHARE_BASE_URL}${story.endpoint}?${imageParams.toString()}`;
        const staticImageUrl = rawImageUrl.includes('/api/og/')
          ? rawImageUrl
              .replace(/^(https?:\/\/[^/]+)\/\//, '$1/')
              .replace(/(\?.*)$/, '.png$1')
          : rawImageUrl;

        try {
          const ogRes = await fetch(staticImageUrl, {
            signal: AbortSignal.timeout(45_000),
          });
          if (!ogRes.ok) {
            imageUrls.push(staticImageUrl);
            continue;
          }

          const imageBuffer = await ogRes.arrayBuffer();
          const blobPath = `stories/${dateStr}/${story.variant}-${i}.png`;
          const blob = await put(blobPath, Buffer.from(imageBuffer), {
            access: 'public',
            contentType: 'image/png',
          });

          // Store in pre_rendered_stories (upsert)
          await sql`
              INSERT INTO pre_rendered_stories (date_str, slot_index, variant, blob_url, rendered_at)
              VALUES (${dateStr}, ${i}, ${story.variant}, ${blob.url}, NOW())
              ON CONFLICT (date_str, slot_index)
              DO UPDATE SET blob_url = ${blob.url}, variant = ${story.variant}, rendered_at = NOW()
            `;

          totalRendered++;
          console.log(
            `[weekly-stories] ${dateStr}/${story.variant} → ${blob.url} (${(imageBuffer.byteLength / 1024).toFixed(0)}KB)`,
          );
          imageUrls.push(blob.url);
        } catch (err) {
          console.warn(
            `[weekly-stories] Pre-render failed for ${dateStr}/${story.variant}, using OG URL`,
          );
          imageUrls.push(staticImageUrl);
        }
      }

      // Schedule all 4 stories to Spellcast
      const dayResults: Array<{
        variant: string;
        scheduledTime: string;
        status: string;
        error?: string;
      }> = [];

      for (let i = 0; i < storyItems.length; i++) {
        const story = storyItems[i];
        const utcHour = STORY_UTC_HOURS[i];
        const scheduledTime = `${dateStr}T${String(utcHour).padStart(2, '0')}:00:00Z`;
        const mediaUrl = imageUrls[i];
        const storyCategory = VARIANT_TO_HIGHLIGHT[story.variant] || 'Cosmic';

        if (!hasValidImageExtension(mediaUrl)) {
          dayResults.push({
            variant: story.variant,
            scheduledTime,
            status: 'error',
            error: 'No valid image extension',
          });
          totalFailed++;
          continue;
        }

        try {
          const result = await postToSocial({
            platform: 'instagram',
            content: '',
            scheduledDate: scheduledTime,
            media: [{ type: 'image', url: mediaUrl, alt: story.title }],
            platformSettings: {
              instagramOptions: { isStory: true },
            },
          });

          if (result.success) {
            await sql`
              INSERT INTO social_posts (content, platform, post_type, scheduled_date, status, image_url, story_category, content_type)
              VALUES ('', 'instagram', 'story', ${scheduledTime}, 'sent', ${mediaUrl}, ${storyCategory}, ${story.variant})
            `;
            dayResults.push({
              variant: story.variant,
              scheduledTime,
              status: 'success',
            });
            totalScheduled++;
          } else {
            const errorMsg = result.error || 'Unknown error';
            await sql`
              INSERT INTO social_posts (content, platform, post_type, scheduled_date, status, story_category, content_type, rejection_feedback)
              VALUES ('', 'instagram', 'story', ${scheduledTime}, 'failed', ${storyCategory}, ${story.variant}, ${errorMsg})
            `;
            dayResults.push({
              variant: story.variant,
              scheduledTime,
              status: 'error',
              error: errorMsg,
            });
            totalFailed++;
          }
        } catch (postError) {
          const errorMsg =
            postError instanceof Error ? postError.message : 'Unknown error';
          await sql`
            INSERT INTO social_posts (content, platform, post_type, scheduled_date, status, story_category, content_type, rejection_feedback)
            VALUES ('', 'instagram', 'story', ${scheduledTime}, 'failed', ${storyCategory}, ${story.variant}, ${errorMsg})
          `;
          dayResults.push({
            variant: story.variant,
            scheduledTime,
            status: 'error',
            error: errorMsg,
          });
          totalFailed++;
        }
      }

      allResults.push({ date: dateStr, stories: dayResults });
    }

    const executionTimeMs = Date.now() - startTime;
    const dateRange = `${allResults[0]?.date || '?'} to ${allResults[allResults.length - 1]?.date || '?'}`;

    console.log(
      `[weekly-stories] Done: ${totalRendered} rendered, ${totalScheduled} scheduled, ${totalSkipped} skipped, ${totalFailed} failed in ${executionTimeMs}ms`,
    );

    // Discord summary
    try {
      await sendDiscordNotification({
        title:
          totalFailed > 0
            ? 'Weekly Stories — Partial'
            : 'Weekly Stories — Done',
        description: [
          `**${dateRange}** (${days} days)`,
          `Rendered: ${totalRendered} | Scheduled: ${totalScheduled} | Skipped: ${totalSkipped} | Failed: ${totalFailed}`,
          `Time: ${(executionTimeMs / 1000).toFixed(1)}s`,
        ].join('\n'),
        color: totalFailed > 0 ? 'warning' : 'success',
        category: 'general',
      });
    } catch {
      console.warn('[weekly-stories] Discord notification failed');
    }

    return NextResponse.json({
      success: totalScheduled > 0 || totalSkipped > 0,
      dateRange,
      days,
      totalRendered,
      totalScheduled,
      totalSkipped,
      totalFailed,
      executionTimeMs,
      results: allResults,
    });
  } catch (error) {
    console.error('[weekly-stories] Fatal error:', error);
    try {
      await sendDiscordNotification({
        title: 'Weekly Stories — Fatal Error',
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
