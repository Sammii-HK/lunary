import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { postToSocial } from '@/lib/social/client';
import { preUploadImage } from '@/lib/social/pre-upload-image';
import { generateDailyStoryData } from '@/lib/instagram/story-content';
import { format } from 'date-fns';

/**
 * Debug endpoint: try posting to Instagram via Ayrshare and return raw results.
 *
 * POST /api/admin/test-post
 * Body: { type: 'story' | 'feed', dateStr?: string, dryRun?: boolean }
 *
 * - type=story  → generates today's first story, pre-uploads, posts via Ayrshare
 * - type=feed   → grabs the latest pending/approved instagram post from DB, posts it
 * - dryRun=true → does everything except the actual Ayrshare call
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const type = body.type || 'story'; // 'story' | 'feed'
    const dryRun = body.dryRun === true;
    const dateStr = body.dateStr || format(new Date(), 'yyyy-MM-dd');

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';
    const log: string[] = [];
    const addLog = (msg: string) => {
      console.log(`[test-post] ${msg}`);
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

      let mediaUrl = post.image_url ? String(post.image_url).trim() : '';
      if (mediaUrl && !mediaUrl.startsWith('http')) {
        mediaUrl = `${baseUrl}${mediaUrl}`;
      }

      // Handle pipe-delimited carousel URLs — use the first one
      if (mediaUrl.includes('|')) {
        mediaUrl = mediaUrl.split('|')[0];
        addLog(`Carousel detected, using first image: ${mediaUrl}`);
      }

      if (mediaUrl) {
        addLog('Pre-uploading feed image...');
        mediaUrl = await preUploadImage(mediaUrl);
        addLog(`Static URL: ${mediaUrl}`);
      }

      const scheduleDate = new Date(Date.now() + 15 * 60 * 1000);
      const payload = {
        platform: 'instagram' as const,
        content: String(post.content || ''),
        scheduledDate: scheduleDate.toISOString(),
        media: mediaUrl
          ? [{ type: 'image' as const, url: mediaUrl, alt: 'Lunary post' }]
          : [],
        platformSettings: {
          instagramOptions: { type: 'post' },
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

    return NextResponse.json(
      {
        success: false,
        error: `Unknown type: ${type}. Use 'story' or 'feed'.`,
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
