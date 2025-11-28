import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { publishBothTiers } from '../../../../../utils/substack/publisher';
import { generateWeeklyContent } from '../../../../../utils/blog/weeklyContentGenerator';
import {
  generateFreeSubstackPost,
  generatePaidSubstackPost,
} from '../../../../../utils/substack/contentFormatter';

export const runtime = 'nodejs';
export const maxDuration = 300;

interface SucculentPostData {
  accountGroupId: string;
  name: string;
  content: string;
  platforms: string[];
  scheduledDate: string;
  media: Array<{
    type: 'image';
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

    // Step 1: Publish to Substack (current week, offset 0)
    try {
      // Get week start (Monday of current week)
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStart = new Date(
        now.getTime() - daysToMonday * 24 * 60 * 60 * 1000,
      );
      weekStart.setHours(0, 0, 0, 0);

      const weeklyData = await generateWeeklyContent(weekStart);
      const freePost = generateFreeSubstackPost(weeklyData);
      const paidPost = generatePaidSubstackPost(weeklyData);

      const substackResults = await publishBothTiers(freePost, paidPost);
      results.substack = substackResults;
      console.log('[weekly-substack-social] Substack published:', {
        free: substackResults.free.success,
        paid: substackResults.paid.success,
      });
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

      // Schedule for 10 AM today
      const postTime = new Date(now);
      postTime.setHours(10, 0, 0, 0);
      if (postTime < now) {
        postTime.setHours(now.getHours() + 1);
      }

      // 1. Instagram Feed Post (portrait 4:5)
      const igFeedPost: SucculentPostData = {
        accountGroupId,
        name: `Lunary Weekly - Instagram Feed - ${dateStr}`,
        content: content.platforms.instagram.feed,
        platforms: ['instagram'],
        scheduledDate: postTime.toISOString(),
        media: [
          {
            type: 'image',
            url: `${baseUrl}/api/social/images?week=0&format=portrait`,
            alt: content.captions.short,
          },
        ],
        instagramOptions: { type: 'post' },
      };

      // 2. Instagram Story (story format)
      const storyTime = new Date(postTime);
      storyTime.setMinutes(storyTime.getMinutes() + 30);

      const igStoryPost: SucculentPostData = {
        accountGroupId,
        name: `Lunary Weekly - Instagram Story - ${dateStr}`,
        content: content.platforms.instagram.story,
        platforms: ['instagram'],
        scheduledDate: storyTime.toISOString(),
        media: [
          {
            type: 'image',
            url: `${baseUrl}/api/social/images?week=0&format=story`,
            alt: content.captions.short,
          },
        ],
        instagramOptions: { type: 'story' },
      };

      // 3. TikTok (story format)
      const tiktokPost: SucculentPostData = {
        accountGroupId,
        name: `Lunary Weekly - TikTok - ${dateStr}`,
        content: content.platforms.tiktok.video,
        platforms: ['tiktok'],
        scheduledDate: storyTime.toISOString(),
        media: [
          {
            type: 'image',
            url: `${baseUrl}/api/social/images?week=0&format=story`,
            alt: content.captions.short,
          },
        ],
      };

      // 4. Facebook Post (landscape)
      const fbPostTime = new Date(postTime);
      fbPostTime.setMinutes(fbPostTime.getMinutes() + 15);

      const fbPost: SucculentPostData = {
        accountGroupId,
        name: `Lunary Weekly - Facebook Post - ${dateStr}`,
        content: content.platforms.facebook.post,
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

      // 5. Facebook Story (story format)
      const fbStoryPost: SucculentPostData = {
        accountGroupId,
        name: `Lunary Weekly - Facebook Story - ${dateStr}`,
        content: content.platforms.facebook.story,
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

      // 6. Twitter/X (landscape)
      const twitterPost: SucculentPostData = {
        accountGroupId,
        name: `Lunary Weekly - Twitter - ${dateStr}`,
        content: content.platforms.twitter.post,
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

      // 7. LinkedIn (landscape)
      const linkedinPost: SucculentPostData = {
        accountGroupId,
        name: `Lunary Weekly - LinkedIn - ${dateStr}`,
        content: content.platforms.linkedin.post,
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

      const allPosts = [
        igFeedPost,
        igStoryPost,
        tiktokPost,
        fbPost,
        fbStoryPost,
        twitterPost,
        linkedinPost,
      ];

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
