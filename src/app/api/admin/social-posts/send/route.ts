import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { selectSubredditForPostType } from '@/config/reddit-subreddits';
import { categoryThemes } from '@/lib/social/weekly-themes';
import { recordThemeUsage } from '@/lib/social/thematic-generator';
import { getImageBaseUrl } from '@/lib/urls';
import { sanitizeForLog } from '@/lib/security/log-sanitize';

type DbPostRow = {
  id: number;
  content: string;
  platform: string;
  post_type: string;
  scheduled_date: string | null;
  image_url: string | null;
  video_url: string | null;
  week_theme: string | null;
  week_start: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'sent';
  base_group_key: string | null;
  base_post_id: number | null;
};

type PlatformPayload = {
  platform: string;
  content: string;
  media: Array<{ type: 'image' | 'video'; url: string; alt: string }>;
  reddit?: { title?: string; subreddit?: string };
  pinterestOptions?: { boardId: string; boardName: string };
  tiktokOptions?: { type: string; coverUrl?: string; autoAddMusic?: boolean };
  instagramOptions?: { type: string; coverUrl?: string };
};

const videoPlatforms = ['instagram', 'tiktok', 'youtube'];
const noMediaVariantMode: Record<string, 'noImage' | 'mediaNull'> = {
  bluesky: 'noImage',
  threads: 'noImage',
};
const validPlatforms = [
  'twitter',
  'x',
  'instagram',
  'facebook',
  'linkedin',
  'pinterest',
  'reddit',
  'tiktok',
  'bluesky',
  'threads',
  'youtube',
];

const toIntArrayLiteral = (values: number[]) =>
  `{${values.map((value) => Number(value)).join(',')}}`;

const toPlatformStr = (platform: string) =>
  String(platform).toLowerCase().trim();

const formatMediaKey = (media: PlatformPayload['media']) =>
  media.map((item) => `${item.type}:${item.url}`).join('|');

const formatReadableDate = (scheduleDate: Date) => {
  const formattedDate = scheduleDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = scheduleDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${formattedDate} at ${formattedTime}`;
};

const buildPlatformPayload = (
  post: DbPostRow,
  scheduleDate: Date,
  baseUrl: string,
): PlatformPayload => {
  const platformStr = toPlatformStr(post.platform);
  const content = String(post.content || '').trim();
  const shouldUseVideo =
    post.post_type === 'video' &&
    post.video_url &&
    videoPlatforms.includes(platformStr);
  const scheduleLabel = `Lunary cosmic insight - ${scheduleDate.toLocaleDateString()}`;

  let imageUrlForPlatform = post.image_url ? String(post.image_url).trim() : '';
  if (imageUrlForPlatform) {
    try {
      if (
        !imageUrlForPlatform.startsWith('http://') &&
        !imageUrlForPlatform.startsWith('https://')
      ) {
        imageUrlForPlatform = new URL(imageUrlForPlatform, baseUrl).toString();
      }
    } catch (error) {
      console.warn('Failed to normalize image URL:', error);
    }
  }

  if (!shouldUseVideo && platformStr === 'tiktok' && imageUrlForPlatform) {
    try {
      const url = new URL(imageUrlForPlatform);
      const currentFormat = url.searchParams.get('format');
      if (!currentFormat || currentFormat === 'square') {
        url.searchParams.set('format', 'story');
        imageUrlForPlatform = url.toString();
      }
    } catch (error) {
      if (!imageUrlForPlatform.includes('format=')) {
        const separator = imageUrlForPlatform.includes('?') ? '&' : '?';
        imageUrlForPlatform = `${imageUrlForPlatform}${separator}format=story`;
      }
    }
  }

  if (shouldUseVideo && platformStr === 'instagram' && imageUrlForPlatform) {
    try {
      const url = new URL(imageUrlForPlatform);
      url.searchParams.set('format', 'story');
      imageUrlForPlatform = url.toString();
    } catch (error) {
      if (!imageUrlForPlatform.includes('format=')) {
        const separator = imageUrlForPlatform.includes('?') ? '&' : '?';
        imageUrlForPlatform = `${imageUrlForPlatform}${separator}format=story`;
      }
    }
  }

  const media: PlatformPayload['media'] = shouldUseVideo
    ? [
        {
          type: 'video',
          url: String(post.video_url || '').trim(),
          alt: scheduleLabel,
        },
      ]
    : imageUrlForPlatform
      ? [
          {
            type: 'image',
            url: imageUrlForPlatform,
            alt: scheduleLabel,
          },
        ]
      : [];

  const payload: PlatformPayload = {
    platform: platformStr,
    content,
    media,
  };

  if (platformStr === 'reddit') {
    const selectedSubreddit = selectSubredditForPostType(post.post_type);
    const redditTitle =
      content.match(/^[^.!?]+[.!?]/)?.[0] ||
      content.substring(0, 100).replace(/\n/g, ' ').trim();
    payload.reddit = {
      title: redditTitle,
      subreddit: selectedSubreddit.name,
    };
  }

  if (platformStr === 'pinterest') {
    payload.pinterestOptions = {
      boardId: process.env.SUCCULENT_PINTEREST_BOARD_ID || 'lunaryapp/lunary',
      boardName: process.env.SUCCULENT_PINTEREST_BOARD_NAME || 'Lunary',
    };
  }

  if (platformStr === 'tiktok' && media.length > 0) {
    payload.tiktokOptions = {
      type: 'post',
      // Only add music to image posts, not videos (videos have audio already)
      autoAddMusic: !shouldUseVideo,
      ...(shouldUseVideo && imageUrlForPlatform
        ? { coverUrl: imageUrlForPlatform }
        : {}),
    };
  }

  if (platformStr === 'instagram') {
    if (shouldUseVideo) {
      payload.instagramOptions = {
        type: 'reel',
        ...(imageUrlForPlatform ? { coverUrl: imageUrlForPlatform } : {}),
      };
    } else {
      // Static Instagram post (meme, carousel, daily cosmic, etc.)
      payload.instagramOptions = {
        type: 'post',
      };
    }
  }

  return payload;
};

export async function POST(request: NextRequest) {
  try {
    const {
      postId,
      content,
      platform,
      scheduledDate,
      imageUrl,
      videoUrl,
      postType,
      groupPostIds,
    } = await request.json();

    if (!postId || !platform) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: postId and platform',
        },
        { status: 400 },
      );
    }

    // Get post data from database (including any edits)
    const postDataFromDb = await sql`
      SELECT id, content, post_type, scheduled_date, image_url, video_url, week_theme, week_start, platform, status, base_group_key, base_post_id
      FROM social_posts WHERE id = ${postId}
    `;

    if (postDataFromDb.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 },
      );
    }

    // Use content from request if provided, otherwise use from DB (which may have been edited)
    const primaryPost = postDataFromDb.rows[0] as DbPostRow;
    const actualContent = content || primaryPost.content;
    const actualScheduledDate = scheduledDate || primaryPost.scheduled_date;

    if (!actualContent || actualContent.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Post content is empty' },
        { status: 400 },
      );
    }

    const apiKey = process.env.SUCCULENT_SECRET_KEY;
    const accountGroupId = process.env.SUCCULENT_ACCOUNT_GROUP_ID;

    if (!apiKey || !accountGroupId) {
      return NextResponse.json(
        { success: false, error: 'Succulent API not configured' },
        { status: 500 },
      );
    }

    const baseUrl = getImageBaseUrl();

    // Ensure accountGroupId is a string
    const accountGroupIdStr = String(accountGroupId).trim();
    if (!accountGroupIdStr) {
      return NextResponse.json(
        { success: false, error: 'Invalid accountGroupId' },
        { status: 500 },
      );
    }

    // Parse scheduled date
    let scheduleDate: Date;
    if (actualScheduledDate) {
      scheduleDate = new Date(actualScheduledDate);
      if (isNaN(scheduleDate.getTime())) {
        console.warn(
          'Invalid scheduled date, using default:',
          actualScheduledDate,
        );
        scheduleDate = new Date(Date.now() + 15 * 60 * 1000);
      }
    } else {
      scheduleDate = new Date(Date.now() + 15 * 60 * 1000);
    }

    const groupIds = Array.isArray(groupPostIds)
      ? groupPostIds
          .map((id: unknown) => Number(id))
          .filter((id: number) => Number.isFinite(id))
      : [];
    const groupKey = primaryPost.base_group_key;
    let groupPosts: DbPostRow[] = [primaryPost];
    if (groupIds.length > 0) {
      const groupIdsArrayLiteral = toIntArrayLiteral(groupIds);
      const groupResult = await sql`
        SELECT id, content, post_type, scheduled_date, image_url, video_url, week_theme, week_start, platform, status, base_group_key, base_post_id
        FROM social_posts
        WHERE id = ANY(${groupIdsArrayLiteral}::int[])
      `;
      groupPosts = groupResult.rows as DbPostRow[];
    } else if (groupKey) {
      const groupResult = await sql`
        SELECT id, content, post_type, scheduled_date, image_url, video_url, week_theme, week_start, platform, status, base_group_key, base_post_id
        FROM social_posts
        WHERE base_group_key = ${groupKey}
      `;
      groupPosts = groupResult.rows as DbPostRow[];
    }

    const approvedGroupPosts = groupPosts.filter(
      (post) => post.status === 'approved',
    );
    const postsToSend =
      approvedGroupPosts.length > 0 ? approvedGroupPosts : [primaryPost];

    const basePostId = primaryPost.base_post_id;
    const basePost =
      typeof basePostId === 'number'
        ? postsToSend.find((post) => post.id === basePostId)
        : undefined;
    const fallbackBasePost = postsToSend.find((post) => {
      const payload = buildPlatformPayload(post, scheduleDate, baseUrl);
      return payload.media.length > 0;
    });
    const selectedBasePost = basePost || fallbackBasePost || postsToSend[0];

    const basePayload = buildPlatformPayload(
      selectedBasePost,
      scheduleDate,
      baseUrl,
    );
    if (!validPlatforms.includes(basePayload.platform)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid platform: ${basePayload.platform}. Must be one of: ${validPlatforms.join(', ')}`,
        },
        { status: 400 },
      );
    }

    if (!basePayload.content) {
      return NextResponse.json(
        { success: false, error: 'Post content is empty' },
        { status: 400 },
      );
    }

    const platformsToSend = new Set<string>();
    let pinterestHasMedia = false;
    const variants: Record<
      string,
      { content: string; media?: string[] | null; noImage?: boolean }
    > = {};
    let pinterestOptions: PlatformPayload['pinterestOptions'];
    let tiktokOptions: PlatformPayload['tiktokOptions'];
    let instagramOptions: PlatformPayload['instagramOptions'];
    let redditData: PlatformPayload['reddit'];

    const baseMediaKey = formatMediaKey(basePayload.media);

    for (const post of postsToSend) {
      const payload = buildPlatformPayload(post, scheduleDate, baseUrl);
      if (!validPlatforms.includes(payload.platform)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid platform: ${payload.platform}. Must be one of: ${validPlatforms.join(', ')}`,
          },
          { status: 400 },
        );
      }

      if (payload.pinterestOptions) {
        pinterestOptions = payload.pinterestOptions;
      }
      if (payload.tiktokOptions) {
        tiktokOptions = payload.tiktokOptions;
      }
      if (payload.instagramOptions) {
        instagramOptions = payload.instagramOptions;
      }
      if (payload.reddit) {
        redditData = payload.reddit;
      }

      const mediaKey = formatMediaKey(payload.media);
      const differs =
        payload.platform !== basePayload.platform ||
        payload.content !== basePayload.content ||
        mediaKey !== baseMediaKey;

      const dropMediaMode = noMediaVariantMode[payload.platform];
      const removeMedia =
        Boolean(dropMediaMode) && basePayload.media.length > 0;

      platformsToSend.add(payload.platform);
      if (payload.platform === 'pinterest' && payload.media.length > 0) {
        pinterestHasMedia = true;
      }

      if (differs || removeMedia) {
        const variant: {
          content: string;
          media?: string[] | null;
          noImage?: boolean;
        } = {
          content: payload.content,
        };

        if (removeMedia) {
          if (dropMediaMode === 'noImage') {
            variant.noImage = true;
          } else if (dropMediaMode === 'mediaNull') {
            variant.media = null;
          }
        } else if (mediaKey !== baseMediaKey && payload.media.length > 0) {
          variant.media = payload.media.map((item) => item.url);
        }

        variants[payload.platform] = variant;
      }
    }

    if (platformsToSend.size === 0) {
      platformsToSend.add(basePayload.platform);
    }

    if (
      platformsToSend.has('pinterest') &&
      basePayload.media.length === 0 &&
      !pinterestHasMedia
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Pinterest requires an image or video. Please provide media for Pinterest posts.',
        },
        { status: 400 },
      );
    }

    const readableDate = formatReadableDate(scheduleDate);
    const postData: any = {
      accountGroupId: accountGroupIdStr,
      name: `Lunary Post - ${readableDate}`,
      content: basePayload.content,
      platforms: Array.from(platformsToSend),
      scheduledDate: scheduleDate.toISOString(),
      media: basePayload.media,
    };

    if (Object.keys(variants).length > 0) {
      postData.variants = variants;
    }

    if (redditData) {
      postData.reddit = redditData;
    }

    if (pinterestOptions) {
      postData.pinterestOptions = pinterestOptions;
    }

    if (tiktokOptions) {
      postData.tiktokOptions = tiktokOptions;
    }

    if (instagramOptions) {
      postData.instagramOptions = instagramOptions;
    }

    const succulentApiUrl = 'https://app.succulent.social/api/posts';

    // Validate and stringify JSON
    let jsonBody: string;
    try {
      jsonBody = JSON.stringify(postData);
      console.log('📤 Sending to Succulent:', {
        url: succulentApiUrl,
        postData: JSON.parse(jsonBody), // Parse back to log nicely
        jsonLength: jsonBody.length,
      });
    } catch (jsonError) {
      console.error('❌ Failed to stringify post data:', jsonError);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to serialize post data: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`,
        },
        { status: 500 },
      );
    }

    const response = await fetch(succulentApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: jsonBody,
    });

    let responseData;
    const contentType = response.headers.get('content-type');
    const responseText = await response.text();

    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse Succulent response:', {
        status: response.status,
        statusText: response.statusText,
        contentType,
        responseText: responseText.substring(0, 500),
      });
      return NextResponse.json(
        {
          success: false,
          error: `Invalid JSON response from Succulent: ${responseText.substring(0, 200)}`,
        },
        { status: 500 },
      );
    }

    console.log('📥 Succulent response:', {
      status: response.status,
      data: responseData,
    });

    if (response.ok) {
      // Update status to 'sent' for all posts in the group (or just the single post)
      console.log('🔄 Updating post status to sent...', {
        postId,
        groupKey,
        approvedGroupPostsCount: approvedGroupPosts.length,
      });

      try {
        if (groupKey && approvedGroupPosts.length > 0) {
          console.log(
            `Updating group posts with base_group_key = ${sanitizeForLog(groupKey)}`,
          );
          const updateResult = await sql`
            UPDATE social_posts
            SET status = 'sent', updated_at = NOW()
            WHERE base_group_key = ${groupKey}
              AND status IN ('pending', 'approved')
          `;
          console.log(
            `✅ Updated ${updateResult.rowCount} posts in group ${sanitizeForLog(groupKey)} to 'sent'`,
          );

          if (updateResult.rowCount === 0) {
            console.warn(
              `⚠️ No posts updated! Checking what posts exist with this group key...`,
            );
            const checkResult = await sql`
              SELECT id, status, base_group_key FROM social_posts WHERE base_group_key = ${groupKey}
            `;
            console.log('Posts with this group key:', checkResult.rows);
          }
        } else {
          console.log(
            `Updating single post with id = ${sanitizeForLog(postId)}`,
          );
          const updateResult = await sql`
            UPDATE social_posts
            SET status = 'sent', updated_at = NOW()
            WHERE id = ${Number(postId)}
          `;
          console.log(
            `✅ Updated post ${sanitizeForLog(postId)} to 'sent' (rows affected: ${updateResult.rowCount})`,
          );

          if (updateResult.rowCount === 0) {
            console.warn(`⚠️ No posts updated! Checking if post exists...`);
            const checkResult = await sql`
              SELECT id, status FROM social_posts WHERE id = ${Number(postId)}
            `;
            console.log('Post status:', checkResult.rows);
          }
        }
      } catch (updateError) {
        console.error('❌ Failed to update post status to sent:', updateError);
        console.error('Update error details:', {
          message:
            updateError instanceof Error ? updateError.message : 'Unknown',
          stack: updateError instanceof Error ? updateError.stack : undefined,
        });
        // Continue - don't fail the request if status update fails
      }

      const weekTheme = selectedBasePost?.week_theme as string | undefined;
      const weekStart = selectedBasePost?.week_start as string | undefined;

      if (weekTheme && weekStart) {
        try {
          await sql`
            CREATE TABLE IF NOT EXISTS theme_publications (
              id SERIAL PRIMARY KEY,
              week_start DATE NOT NULL,
              theme_name TEXT NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              UNIQUE(week_start, theme_name)
            )
          `;

          const insertResult = await sql`
            INSERT INTO theme_publications (week_start, theme_name)
            VALUES (${weekStart}, ${weekTheme})
            ON CONFLICT (week_start, theme_name) DO NOTHING
            RETURNING id
          `;

          if (insertResult.rows.length > 0) {
            const matchedTheme = categoryThemes.find(
              (theme) => theme.name === weekTheme,
            );
            if (matchedTheme) {
              await recordThemeUsage(sql, matchedTheme.id);
            } else {
              console.warn(
                'Theme name not found for rotation tracking:',
                weekTheme,
              );
            }
          }
        } catch (themeError) {
          console.warn('Failed to record theme publication:', themeError);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Post sent to Succulent successfully',
        postId: responseData.data?.postId || responseData.postId,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error:
            responseData.error ||
            responseData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
        },
        { status: response.status },
      );
    }
  } catch (error) {
    console.error('Error sending post to Succulent:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
