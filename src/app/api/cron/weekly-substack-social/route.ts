import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { publishBothTiers } from '../../../../../utils/substack/publisher';
import { generateWeeklyContent } from '../../../../../utils/blog/weeklyContentGenerator';
import {
  generateFreeSubstackPost,
  generatePaidSubstackPost,
} from '../../../../../utils/substack/contentFormatter';
import { generateReelHashtags } from '@/lib/video/narrative-generator';

export const runtime = 'nodejs';
export const maxDuration = 300;

interface SucculentPostData {
  accountGroupId: string;
  name: string;
  content: string;
  platforms: string[];
  scheduledDate: string;
  media?: Array<{
    type: 'image' | 'video';
    url: string;
    alt: string;
  }>;
  instagramOptions?: {
    type: 'story' | 'post' | 'reel';
  };
  facebookOptions?: {
    type: 'story' | 'post';
  };
  tiktokOptions?: {
    type: 'post';
  };
}

function stripMarkdown(input: string) {
  return input
    .replace(/\[(.*?)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateContent(content: string, maxLength: number) {
  if (content.length <= maxLength) {
    return content;
  }
  const truncated = content.slice(0, maxLength - 1);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.7) {
    return `${truncated.slice(0, lastSpace)}…`;
  }
  return `${truncated}…`;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const dayOfWeek = now.getDay();

    if (dayOfWeek !== 0) {
      return NextResponse.json({
        success: true,
        message: 'Not Sunday, skipping weekly Substack & social',
        dayOfWeek,
      });
    }

    const dateStr = now.toISOString().split('T')[0];
    const eventKey = `weekly-substack-social-${dateStr}`;

    const alreadyRun = await sql`
      SELECT id FROM notification_sent_events 
      WHERE date = ${dateStr}::date 
      AND event_key = ${eventKey}
    `;

    if (alreadyRun.rows.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Already run today',
        date: dateStr,
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';
    const results: {
      substack: { free?: any; paid?: any };
      social: { success: boolean; posts?: any[]; error?: string };
    } = {
      substack: {},
      social: { success: false },
    };

    console.log('[weekly-substack-social] Starting weekly publish...');

    // Declare shortFormVideoUrl in broader scope for use in social posts section
    let shortFormVideoUrl: string | null = null;
    let weeklyData: Awaited<ReturnType<typeof generateWeeklyContent>> | null =
      null;
    let freePost: ReturnType<typeof generateFreeSubstackPost> | null = null;
    let paidPost: ReturnType<typeof generatePaidSubstackPost> | null = null;

    // Step 1: Publish to Substack (current week, offset 0)
    try {
      // Get week start (Monday of current week)
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStart = new Date(
        now.getTime() - daysToMonday * 24 * 60 * 60 * 1000,
      );
      weekStart.setHours(0, 0, 0, 0);

      weeklyData = await generateWeeklyContent(weekStart);
      freePost = generateFreeSubstackPost(weeklyData);
      paidPost = generatePaidSubstackPost(weeklyData);

      const substackResults = await publishBothTiers(freePost, paidPost);
      results.substack = substackResults;
      console.log('[weekly-substack-social] Substack published:', {
        free: substackResults.free.success,
        paid: substackResults.paid.success,
      });

      // Generate videos after successful Substack publishing
      if (substackResults.free.success || substackResults.paid.success) {
        try {
          console.log('[weekly-substack-social] Generating videos...');
          const videoResponse = await fetch(`${baseUrl}/api/video/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'short',
              week: 0,
            }),
          });

          if (videoResponse.ok) {
            const videoData = await videoResponse.json();
            shortFormVideoUrl = videoData.video?.url || null;
            console.log(
              '[weekly-substack-social] Short-form video generated:',
              shortFormVideoUrl,
            );

            // Upload to YouTube Shorts
            if (shortFormVideoUrl) {
              fetch(`${baseUrl}/api/youtube/upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  videoUrl: shortFormVideoUrl,
                  videoId: videoData.video?.id,
                  title: `Week of ${weeklyData.weekStart.toLocaleDateString()}`,
                  description: 'Your weekly cosmic forecast from Lunary',
                  type: 'short',
                  publishDate: weekStart.toISOString(),
                }),
              }).catch((err) => {
                console.error(
                  '[weekly-substack-social] Failed to upload to YouTube Shorts:',
                  err,
                );
              });
            }

            // Generate and upload long-form video
            const blogContent = {
              title: `Weekly Cosmic Forecast - Week of ${weeklyData.weekStart.toLocaleDateString()}`,
              description: freePost.subtitle || paidPost.subtitle || '',
              body: freePost.content || paidPost.content || '',
            };

            fetch(`${baseUrl}/api/video/generate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'long',
                blogContent,
              }),
            })
              .then(async (res) => {
                if (res.ok) {
                  const longVideoData = await res.json();
                  if (longVideoData.video?.id) {
                    const longFormPublishDate = new Date(weekStart);
                    longFormPublishDate.setUTCDate(
                      longFormPublishDate.getUTCDate() + 2,
                    );
                    longFormPublishDate.setUTCHours(20, 0, 0, 0);

                    await fetch(`${baseUrl}/api/youtube/upload`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        videoUrl: longVideoData.video.url,
                        videoId: longVideoData.video.id,
                        title: blogContent.title,
                        description: blogContent.description,
                        type: 'long',
                        publishDate: longFormPublishDate.toISOString(),
                      }),
                    }).catch((err) => {
                      console.error(
                        '[weekly-substack-social] Failed to upload long-form to YouTube:',
                        err,
                      );
                    });
                  }
                }
              })
              .catch((err) => {
                console.error(
                  '[weekly-substack-social] Failed to generate long-form video:',
                  err,
                );
              });
          }
        } catch (error) {
          console.error(
            '[weekly-substack-social] Video generation error:',
            error,
          );
        }
      }
    } catch (error) {
      console.error('[weekly-substack-social] Substack error:', error);
      results.substack = {
        free: { success: false, error: String(error) },
        paid: { success: false, error: String(error) },
      };
    }

    // Step 2: Generate and schedule social media posts
    try {
      const apiKey = process.env.SUCCULENT_SECRET_KEY;
      const accountGroupId = process.env.SUCCULENT_ACCOUNT_GROUP_ID;

      if (!apiKey || !accountGroupId) {
        throw new Error('Succulent API not configured');
      }

      // Fetch social content for this week
      const contentResponse = await fetch(
        `${baseUrl}/api/social/content?week=0`,
      );
      if (!contentResponse.ok) {
        throw new Error(
          `Failed to fetch social content: ${contentResponse.status}`,
        );
      }
      const content = await contentResponse.json();

      const succulentApiUrl = 'https://app.succulent.social/api/posts';
      const scheduledPosts: any[] = [];

      // Helper to get caption based on platformOptions config
      // Use exactly 3 hashtags for all platforms
      const getCaption = (
        captionType: 'short' | 'medium' | 'long',
        includeHashtags = false,
        hashtagCount = 3,
        hashtagsOverride?: string[],
      ) => {
        const caption =
          content.captions[captionType] || content.captions.medium;
        if (includeHashtags && content.hashtags) {
          const tags = (hashtagsOverride || content.hashtags)
            .slice(0, hashtagCount)
            .join(' ');
          return `${caption}\n\n${tags}`;
        }
        return caption;
      };

      // Schedule for 10 AM today
      const postTime = new Date(now);
      postTime.setHours(10, 0, 0, 0);
      if (postTime < now) {
        postTime.setHours(now.getHours() + 1);
      }

      // 1. Instagram is video-only; static posts are skipped here.

      // 2. Shared story-style timing anchor
      const storyTime = new Date(postTime);
      storyTime.setMinutes(storyTime.getMinutes() + 30);

      // 3. TikTok static posts are disabled (video-only)

      // 4. Facebook Post (landscape) - uses long caption
      const fbPostTime = new Date(postTime);
      fbPostTime.setMinutes(fbPostTime.getMinutes() + 15);

      const fbPost: SucculentPostData = {
        accountGroupId,
        name: `Lunary Weekly - Facebook Post - ${dateStr}`,
        content: getCaption('long'),
        platforms: ['facebook'],
        scheduledDate: fbPostTime.toISOString(),
        media: [
          {
            type: 'image',
            url: `${baseUrl}/api/social/images?week=0&format=landscape`,
            alt: content.captions.short,
          },
        ],
        facebookOptions: { type: 'post' },
      };

      // 5. Facebook Story (story format) - uses short caption
      const fbStoryPost: SucculentPostData = {
        accountGroupId,
        name: `Lunary Weekly - Facebook Story - ${dateStr}`,
        content: getCaption('short'),
        platforms: ['facebook'],
        scheduledDate: storyTime.toISOString(),
        media: [
          {
            type: 'image',
            url: `${baseUrl}/api/social/images?week=0&format=story`,
            alt: content.captions.short,
          },
        ],
        facebookOptions: { type: 'story' },
      };

      // 6. Twitter/X (landscape 1200x675) - uses short caption with hashtags
      const twitterPost: SucculentPostData = {
        accountGroupId,
        name: `Lunary Weekly - Twitter - ${dateStr}`,
        content: getCaption('short', true),
        platforms: ['twitter'],
        scheduledDate: postTime.toISOString(),
        media: [
          {
            type: 'image',
            url: `${baseUrl}/api/social/images?week=0&format=landscape`,
            alt: content.captions.short,
          },
        ],
      };

      // 7. LinkedIn (landscape 1200x627) - uses long caption with hashtags
      const linkedinPost: SucculentPostData = {
        accountGroupId,
        name: `Lunary Weekly - LinkedIn - ${dateStr}`,
        content: getCaption('long', true),
        platforms: ['linkedin'],
        scheduledDate: fbPostTime.toISOString(),
        media: [
          {
            type: 'image',
            url: `${baseUrl}/api/social/images?week=0&format=landscape`,
            alt: content.captions.short,
          },
        ],
      };

      // 8. Bluesky (landscape 1200x630) - uses short caption with hashtags
      const blueskyPost: SucculentPostData = {
        accountGroupId,
        name: `Lunary Weekly - Bluesky - ${dateStr}`,
        content: getCaption('short', true),
        platforms: ['bluesky'],
        scheduledDate: postTime.toISOString(),
        media: [
          {
            type: 'image',
            url: `${baseUrl}/api/social/images?week=0&format=landscape`,
            alt: content.captions.short,
          },
        ],
      };

      const threadsScriptSource = freePost?.content || '';
      const threadsScript = truncateContent(
        stripMarkdown(threadsScriptSource || content.captions.medium || ''),
        420,
      );

      // 9. Threads (text-only) - uses written script
      const threadsPost: SucculentPostData = {
        accountGroupId,
        name: `Lunary Weekly - Threads - ${dateStr}`,
        content: threadsScript || getCaption('medium', false),
        platforms: ['threads'],
        scheduledDate: postTime.toISOString(),
      };

      const allPosts = [
        fbPost,
        fbStoryPost,
        twitterPost,
        linkedinPost,
        blueskyPost,
        threadsPost,
      ];

      let reelHashtags: string[] | null = null;
      if (weeklyData) {
        try {
          reelHashtags = await generateReelHashtags(weeklyData);
        } catch (error) {
          console.warn('Failed to generate reel hashtags:', error);
        }
      }

      // Add video posts if short-form video was generated
      if (shortFormVideoUrl) {
        // Instagram Reel
        const reelTime = new Date(postTime);
        reelTime.setMinutes(reelTime.getMinutes() + 60);
        const igReelPost: SucculentPostData = {
          accountGroupId,
          name: `Lunary Weekly - Instagram Reel - ${dateStr}`,
          content: getCaption('medium', true, 5, reelHashtags || undefined),
          platforms: ['instagram'],
          scheduledDate: reelTime.toISOString(),
          media: [
            {
              type: 'video',
              url: shortFormVideoUrl,
              alt: content.captions.short,
            },
          ],
          instagramOptions: { type: 'reel' },
        };

        // TikTok Video
        const tiktokVideoPost: SucculentPostData = {
          accountGroupId,
          name: `Lunary Weekly - TikTok Video - ${dateStr}`,
          content: getCaption('short', true),
          platforms: ['tiktok'],
          scheduledDate: reelTime.toISOString(),
          media: [
            {
              type: 'video',
              url: shortFormVideoUrl,
              alt: content.captions.short,
            },
          ],
        };

        allPosts.push(igReelPost, tiktokVideoPost);
      }

      for (const post of allPosts) {
        try {
          const response = await fetch(succulentApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': apiKey,
            },
            body: JSON.stringify(post),
          });

          const result = await response.json();
          scheduledPosts.push({
            name: post.name,
            platform: post.platforms[0],
            success: response.ok,
            postId: result.data?.postId,
            error: response.ok ? undefined : result.error,
          });

          await new Promise((r) => setTimeout(r, 200));
        } catch (error) {
          scheduledPosts.push({
            name: post.name,
            platform: post.platforms[0],
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      results.social = {
        success: scheduledPosts.some((p) => p.success),
        posts: scheduledPosts,
      };

      console.log('[weekly-substack-social] Social posts scheduled:', {
        total: scheduledPosts.length,
        successful: scheduledPosts.filter((p) => p.success).length,
      });
    } catch (error) {
      console.error('[weekly-substack-social] Social error:', error);
      results.social = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Record that we ran today
    await sql`
      INSERT INTO notification_sent_events (date, event_key, event_type, event_name, event_priority, sent_by)
      VALUES (${dateStr}::date, ${eventKey}, 'weekly_publish', 'Weekly Substack & Social', 5, 'cron')
      ON CONFLICT (date, event_key) DO NOTHING
    `;

    return NextResponse.json({
      success: true,
      date: dateStr,
      results,
    });
  } catch (error) {
    console.error('[weekly-substack-social] Fatal error:', error);
    return NextResponse.json(
      {
        error: 'Failed to run weekly publish',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
