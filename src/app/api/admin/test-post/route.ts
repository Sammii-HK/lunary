import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { postToSocial } from '@/lib/social/client';
import { preUploadImage } from '@/lib/social/pre-upload-image';
import { generateDailyStoryData } from '@/lib/instagram/story-content';
import { format } from 'date-fns';
import { requireAdminAuth } from '@/lib/admin-auth';

/**
 * Debug endpoint: try posting to Instagram via Ayrshare and return raw results.
 *
 * POST /api/admin/test-post
 * Body: { type: 'story' | 'feed' | 'batch' | 'all-stories', dateStr?: string, dryRun?: boolean }
 *
 * - type=story       → generates today's first story, pre-uploads, posts via Ayrshare
 * - type=feed        → grabs the latest pending/approved instagram post from DB, posts it
 * - type=batch       → generates and posts the full Instagram content batch for today
 * - type=all-stories → generates and posts all stories for today
 * - dryRun=true      → does everything except the actual Ayrshare call
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json();
    const type = body.type || 'story'; // 'story' | 'feed'
    const dryRun = body.dryRun === true;
    const dateStr = body.dateStr || format(new Date(), 'yyyy-MM-dd');

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';
    const log: string[] = [];
    const addLog = (msg: string) => {
      const safeMsg = msg.replace(/[\r\n\x00-\x1F\x7F]/g, '');
      console.log(`[test-post] ${safeMsg}`);
      log.push(msg);
    };

    addLog(`Type: ${type}, Date: ${dateStr}, DryRun: ${dryRun}`);

    // Check what exists in DB for today
    const existingPosts = await sql`
      SELECT id, platform, post_type, status, content_type, scheduled_date, image_url,
             LEFT(content, 80) as content_preview
      FROM social_posts
      WHERE scheduled_date::date = ${dateStr}::date
        AND platform = 'instagram'
      ORDER BY scheduled_date ASC
    `;
    addLog(`Existing IG posts for ${dateStr}: ${existingPosts.rows.length}`);
    const existingSummary = existingPosts.rows.map((r) => ({
      id: r.id,
      type: r.post_type,
      status: r.status,
      contentType: r.content_type,
      scheduledDate: r.scheduled_date,
      hasImage: !!r.image_url,
      contentPreview: r.content_preview,
    }));

    if (type === 'story') {
      // Generate a story for today
      const stories = generateDailyStoryData(dateStr);
      addLog(`Generated ${stories.length} stories for ${dateStr}`);

      const story = stories[0]; // Use the first one (moon phase)
      const imageParams = new URLSearchParams(story.params);
      const imageUrl = `${baseUrl}${story.endpoint}?${imageParams.toString()}`;
      addLog(`Story variant: ${story.variant}, title: ${story.title}`);
      addLog(`OG image URL: ${imageUrl}`);

      // Pre-upload
      addLog('Pre-uploading image to Vercel Blob...');
      const staticUrl = await preUploadImage(imageUrl);
      addLog(`Static URL: ${staticUrl}`);

      // Schedule 15 min from now
      const scheduleDate = new Date(Date.now() + 15 * 60 * 1000);
      const payload = {
        platform: 'instagram' as const,
        content: '',
        scheduledDate: scheduleDate.toISOString(),
        media: [{ type: 'image' as const, url: staticUrl, alt: story.title }],
        platformSettings: {
          instagramOptions: { isStory: true },
        },
      };
      addLog(`Payload: ${JSON.stringify(payload, null, 2)}`);

      if (dryRun) {
        return NextResponse.json({
          success: true,
          dryRun: true,
          log,
          existingPosts: existingSummary,
          payload,
        });
      }

      addLog('Calling postToSocial...');
      const result = await postToSocial(payload);
      addLog(`Result: ${JSON.stringify(result, null, 2)}`);

      return NextResponse.json({
        success: result.success,
        result,
        rawResponse: result.rawResponse,
        log,
        existingPosts: existingSummary,
        payload,
      });
    }

    if (type === 'feed') {
      // Grab the latest pending/approved IG feed post from DB
      const feedPost = await sql`
        SELECT id, content, post_type, scheduled_date, image_url, video_url, status
        FROM social_posts
        WHERE platform = 'instagram'
          AND post_type != 'story'
          AND status IN ('pending', 'approved')
        ORDER BY scheduled_date ASC NULLS LAST
        LIMIT 1
      `;

      if (feedPost.rows.length === 0) {
        addLog('No pending/approved IG feed posts found in DB');
        return NextResponse.json({
          success: false,
          error: 'No pending/approved Instagram feed posts found',
          log,
          existingPosts: existingSummary,
        });
      }

      const post = feedPost.rows[0];
      addLog(
        `Found feed post: id=${post.id}, type=${post.post_type}, status=${post.status}`,
      );
      addLog(
        `Content preview: ${String(post.content || '').substring(0, 100)}`,
      );
      addLog(`Image URL: ${post.image_url || 'NONE'}`);
      addLog(`Video URL: ${post.video_url || 'NONE'}`);

      const rawImageUrl = post.image_url ? String(post.image_url).trim() : '';
      let imageUrls: string[] = [];
      if (rawImageUrl) {
        // Handle pipe-delimited carousel URLs
        imageUrls = rawImageUrl.split('|').map((u: string) => {
          const trimmed = u.trim();
          return trimmed.startsWith('http') ? trimmed : `${baseUrl}${trimmed}`;
        });
        if (imageUrls.length > 1) {
          addLog(`Carousel detected: ${imageUrls.length} images`);
        }
      }

      // Pre-upload all images
      const media: Array<{ type: 'image'; url: string; alt: string }> = [];
      for (const url of imageUrls) {
        addLog(`Pre-uploading feed image: ${url.substring(0, 80)}...`);
        const staticUrl = await preUploadImage(url);
        media.push({ type: 'image', url: staticUrl, alt: 'Lunary post' });
        addLog(`Static URL: ${staticUrl}`);
      }

      const isCarousel = media.length > 1;
      const scheduleDate = new Date(Date.now() + 15 * 60 * 1000);
      const payload = {
        platform: 'instagram' as const,
        content: String(post.content || ''),
        scheduledDate: scheduleDate.toISOString(),
        media,
        platformSettings: {
          instagramOptions: isCarousel
            ? { type: 'carousel' }
            : { type: 'post' },
        },
      };
      addLog(
        `Payload: ${JSON.stringify({ ...payload, content: payload.content.substring(0, 100) + '...' }, null, 2)}`,
      );

      if (dryRun) {
        return NextResponse.json({
          success: true,
          dryRun: true,
          log,
          existingPosts: existingSummary,
          postFromDb: {
            id: post.id,
            postType: post.post_type,
            status: post.status,
            hasContent: !!post.content,
            hasImage: !!post.image_url,
          },
          payload: {
            ...payload,
            content: payload.content.substring(0, 200) + '...',
          },
        });
      }

      addLog('Calling postToSocial...');
      const result = await postToSocial(payload);
      addLog(`Result: ${JSON.stringify(result, null, 2)}`);

      return NextResponse.json({
        success: result.success,
        result,
        rawResponse: result.rawResponse,
        log,
        existingPosts: existingSummary,
        postFromDb: {
          id: post.id,
          postType: post.post_type,
          status: post.status,
        },
        payload: {
          ...payload,
          content: payload.content.substring(0, 200) + '...',
        },
      });
    }

    if (type === 'batch') {
      // Generate and post the full Instagram content batch for today
      const { generateDailyBatch } =
        await import('@/lib/instagram/content-orchestrator');
      const igBatch = await generateDailyBatch(dateStr);
      addLog(`Generated ${igBatch.posts.length} batch posts for ${dateStr}`);
      addLog(
        `Types: ${igBatch.posts.map((p: { type: string }) => p.type).join(', ')}`,
      );

      const batchResults: Array<{
        type: string;
        scheduledTime: string;
        imageCount: number;
        status: string;
        error?: string;
        rawResponse?: unknown;
      }> = [];

      for (const post of igBatch.posts) {
        addLog(
          `\nProcessing ${post.type} (${post.imageUrls.length} images, scheduled: ${post.scheduledTime})`,
        );

        // Pre-upload all images
        const mediaItems: Array<{
          type: 'image';
          url: string;
          alt: string;
        }> = [];
        for (const imageUrl of post.imageUrls) {
          addLog(`  Pre-uploading: ${imageUrl.substring(0, 80)}...`);
          try {
            const staticUrl = await preUploadImage(imageUrl);
            mediaItems.push({
              type: 'image',
              url: staticUrl,
              alt: `${post.type} content from Lunary`,
            });
            addLog(`  Uploaded: ${staticUrl}`);
          } catch (uploadError) {
            addLog(
              `  Upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown'}`,
            );
          }
        }

        if (mediaItems.length === 0) {
          addLog(`  Skipping ${post.type} - no images uploaded`);
          batchResults.push({
            type: post.type,
            scheduledTime: post.scheduledTime,
            imageCount: 0,
            status: 'error',
            error: 'No images could be uploaded',
          });
          continue;
        }

        // Cap hashtags at 3 (Instagram sweet spot; Ayrshare max is 5)
        const limitedHashtags = post.hashtags.slice(0, 3);
        const caption =
          limitedHashtags.length > 0
            ? `${post.caption}\n\n${limitedHashtags.join(' ')}`
            : post.caption;

        const isCarousel =
          post.type === 'carousel' || post.type === 'angel_number_carousel';

        const payload = {
          platform: 'instagram' as const,
          content: caption,
          scheduledDate: post.scheduledTime,
          media: mediaItems,
          platformSettings: {
            instagramOptions: {
              ...(isCarousel ? { type: 'carousel' } : {}),
            },
          },
        };

        addLog(`  Payload: ${mediaItems.length} media, carousel=${isCarousel}`);

        if (dryRun) {
          batchResults.push({
            type: post.type,
            scheduledTime: post.scheduledTime,
            imageCount: mediaItems.length,
            status: 'dry_run',
          });
          continue;
        }

        const result = await postToSocial(payload);
        addLog(
          `  Result: success=${result.success}${result.error ? `, error=${result.error}` : ''}`,
        );

        batchResults.push({
          type: post.type,
          scheduledTime: post.scheduledTime,
          imageCount: mediaItems.length,
          status: result.success ? 'success' : 'error',
          error: result.success ? undefined : result.error,
          rawResponse: result.rawResponse,
        });
      }

      const successCount = batchResults.filter(
        (r) => r.status === 'success' || r.status === 'dry_run',
      ).length;

      return NextResponse.json({
        success: successCount > 0,
        dryRun,
        totalPosts: igBatch.posts.length,
        successCount,
        batchResults,
        log,
        existingPosts: existingSummary,
      });
    }

    if (type === 'all-stories') {
      // Generate and post all stories for today
      const stories = generateDailyStoryData(dateStr);
      addLog(`Generated ${stories.length} stories for ${dateStr}`);

      const storyUtcHours = [9, 12, 15, 19];
      const storyResults: Array<{
        variant: string;
        scheduledTime: string;
        status: string;
        error?: string;
        rawResponse?: unknown;
      }> = [];

      for (let i = 0; i < stories.length; i++) {
        const story = stories[i];
        const utcHour = storyUtcHours[i] ?? 9 + i * 3;
        const scheduledTime = new Date(
          `${dateStr}T${String(utcHour).padStart(2, '0')}:00:00Z`,
        );

        addLog(
          `\nStory ${i + 1}: ${story.variant} - ${story.title || '(no title)'}`,
        );

        const imageParams = new URLSearchParams(story.params);
        const imageUrl = `${baseUrl}${story.endpoint}?${imageParams.toString()}`;
        addLog(`  OG URL: ${imageUrl.substring(0, 100)}...`);

        let staticUrl: string;
        try {
          staticUrl = await preUploadImage(imageUrl);
          addLog(`  Uploaded: ${staticUrl}`);
        } catch (uploadError) {
          addLog(
            `  Upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown'}`,
          );
          storyResults.push({
            variant: story.variant,
            scheduledTime: scheduledTime.toISOString(),
            status: 'error',
            error: `Image upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown'}`,
          });
          continue;
        }

        const payload = {
          platform: 'instagram' as const,
          content: '',
          scheduledDate: scheduledTime.toISOString(),
          media: [
            { type: 'image' as const, url: staticUrl, alt: story.title || '' },
          ],
          platformSettings: {
            instagramOptions: { isStory: true },
          },
        };

        if (dryRun) {
          storyResults.push({
            variant: story.variant,
            scheduledTime: scheduledTime.toISOString(),
            status: 'dry_run',
          });
          continue;
        }

        const result = await postToSocial(payload);
        addLog(
          `  Result: success=${result.success}${result.error ? `, error=${result.error}` : ''}`,
        );

        storyResults.push({
          variant: story.variant,
          scheduledTime: scheduledTime.toISOString(),
          status: result.success ? 'success' : 'error',
          error: result.success ? undefined : result.error,
          rawResponse: result.rawResponse,
        });
      }

      const successCount = storyResults.filter(
        (r) => r.status === 'success' || r.status === 'dry_run',
      ).length;

      return NextResponse.json({
        success: successCount > 0,
        dryRun,
        totalStories: stories.length,
        successCount,
        storyResults,
        log,
        existingPosts: existingSummary,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: `Unknown type: ${type}. Use 'story', 'feed', 'batch', or 'all-stories'.`,
      },
      { status: 400 },
    );
  } catch (error) {
    console.error('[test-post] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
