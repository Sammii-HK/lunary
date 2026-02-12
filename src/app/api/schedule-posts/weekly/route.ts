import { NextRequest, NextResponse } from 'next/server';
import { getImageBaseUrl } from '@/lib/urls';
import { getPlatformImageFormat } from '@/lib/social/educational-images';
import { getPlatformHashtags } from '../../../../../utils/hashtags';

interface PostContent {
  date: string;
  primaryEvent: {
    name: string;
    energy: string;
  };
  highlights: string[];
  horoscopeSnippet: string;
  callToAction: string;
}

interface SucculentPostData {
  accountGroupId: string;
  name?: string;
  content: string;
  platforms: string[];
  scheduledDate: string;
  media: Array<{
    type: 'image';
    url: string;
    alt: string;
  }>;
  variants?: Record<string, { content: string; media?: string[] }>;
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate'); // Format: 2024-02-05 for starting date
    const testMode = searchParams.get('test') === 'true';

    // Get environment variables
    const apiKey = process.env.SUCCULENT_SECRET_KEY;
    const accountGroupId = process.env.SUCCULENT_ACCOUNT_GROUP_ID;

    // Get the base URL for the application (dev vs prod)
    // Use production URL on any Vercel deployment
    const baseUrl = getImageBaseUrl();

    console.log('🔑 Weekly scheduler environment check:', {
      hasApiKey: !!apiKey,
      hasAccountGroupId: !!accountGroupId,
      baseUrl,
      nodeEnv: process.env.NODE_ENV,
      startDate: startDateParam,
    });

    if (!apiKey || !accountGroupId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing Succulent API configuration',
        },
        { status: 500 },
      );
    }

    // Parse start date or default to next Monday
    let startDate: Date;
    if (startDateParam) {
      startDate = new Date(startDateParam);
    } else {
      // Default to next Monday
      const today = new Date();
      const daysUntilMonday = (1 + 7 - today.getDay()) % 7;
      startDate = new Date(today);
      startDate.setDate(
        today.getDate() + (daysUntilMonday === 0 ? 7 : daysUntilMonday),
      );
    }

    // Generate posts for 7 days (one week)
    const posts: SucculentPostData[] = [];

    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      const dateStr = currentDate.toISOString().split('T')[0];

      // Fetch cosmic content for this date
      const cosmicResponse = await fetch(
        `${baseUrl}/api/og/cosmic-post?date=${dateStr}`,
      );

      if (!cosmicResponse.ok) {
        console.error(
          `Failed to fetch cosmic content for ${dateStr}:`,
          cosmicResponse.status,
        );
        continue; // Skip this date if cosmic content fails
      }

      const cosmicContent: PostContent = await cosmicResponse.json();

      // Schedule post for 1 PM local time on the target date
      const scheduledDateTime = new Date(currentDate);
      scheduledDateTime.setHours(8, 0, 0, 0); // 8 AM UTC

      // Format readable date
      const formattedDate = scheduledDateTime.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const formattedTime = scheduledDateTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      const readableDate = `${formattedDate} at ${formattedTime}`;

      // Ensure image URL uses the correct base URL
      const getCosmicFormat = (platform: string) =>
        getPlatformImageFormat(platform === 'x' ? 'twitter' : platform);
      const buildCosmicImageUrl = (platform: string) =>
        `${baseUrl}/api/og/cosmic/${dateStr}?format=${getCosmicFormat(platform)}`;
      const storyImageUrl = buildCosmicImageUrl('instagram');
      const altText = `${cosmicContent.primaryEvent.name} - ${cosmicContent.primaryEvent.energy}. Daily cosmic guidance and astronomical insights.`;

      const baseContent = formatCosmicPost(cosmicContent, dateStr);
      const twitterContent = formatWeeklyTwitterContent(cosmicContent, dateStr);
      const linkedinContent = formatWeeklyLinkedInContent(
        cosmicContent,
        dateStr,
      );
      const tiktokContent = formatTikTokPost(cosmicContent, dateStr);

      const variants: Record<string, { content: string; media?: string[] }> =
        {};
      const twitterVariantContent = twitterContent.trim();
      const linkedinVariantContent = linkedinContent.trim();
      const variantEntries: Array<{
        platform: string;
        content: string;
      }> = [
        { platform: 'facebook', content: baseContent },
        {
          platform: 'x',
          content: twitterVariantContent || baseContent,
        },
        {
          platform: 'threads',
          content: twitterVariantContent || baseContent,
        },
        {
          platform: 'linkedin',
          content: linkedinVariantContent || baseContent,
        },
        {
          platform: 'tiktok',
          content: tiktokContent,
        },
      ];

      for (const entry of variantEntries) {
        const platformMediaUrls = [buildCosmicImageUrl(entry.platform)];
        variants[entry.platform] = {
          content: entry.content,
          media: platformMediaUrls,
        };
      }

      const postData: SucculentPostData = {
        accountGroupId,
        name: `Cosmic Post - ${readableDate}`,
        content: baseContent,
        platforms: ['instagram', 'tiktok'],
        scheduledDate: scheduledDateTime.toISOString(),
        media: [
          {
            type: 'image',
            url: storyImageUrl,
            alt: altText,
          },
        ],
      };

      if (Object.keys(variants).length > 0) {
        postData.variants = variants;
      }

      console.log(`📅 Weekly post prepared for ${dateStr}:`, {
        contentLength: baseContent.length,
        imageUrl: postData.media[0].url,
        scheduledDate: postData.scheduledDate,
        scheduledTime: '8:00 AM',
        variantPlatforms: Object.keys(variants),
      });

      posts.push(postData);
    }

    // Send posts to Succulent API
    const succulentApiUrl = testMode
      ? 'http://localhost:3001/api/posts'
      : 'https://app.succulent.social/api/posts';

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const post of posts) {
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

        if (response.ok) {
          successCount++;
          results.push({
            date: post.scheduledDate.split('T')[0],
            status: 'success',
            postId: result.data?.postId,
          });
        } else {
          errorCount++;
          results.push({
            date: post.scheduledDate.split('T')[0],
            status: 'error',
            error: result.error || 'Unknown error',
          });
        }
      } catch (error) {
        errorCount++;
        results.push({
          date: post.scheduledDate.split('T')[0],
          status: 'error',
          error: error instanceof Error ? error.message : 'Network error',
        });
      }

      // Add small delay between requests to be respectful
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const weekStart = startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const weekEnd = new Date(startDate);
    weekEnd.setDate(startDate.getDate() + 6);
    const weekEndStr = weekEnd.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return NextResponse.json({
      success: true,
      message: `Scheduled ${successCount} posts for week of ${weekStart} - ${weekEndStr} at 1:00 PM daily`,
      summary: {
        totalPosts: posts.length,
        successful: successCount,
        failed: errorCount,
        period: `${weekStart} - ${weekEndStr}`,
        scheduleTime: '1:00 PM',
      },
      results,
    });
  } catch (error) {
    console.error('Weekly scheduler error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to schedule weekly posts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

function formatCosmicPost(content: PostContent, date: string): string {
  console.log('📝 Formatting weekly cosmic post with content:', {
    primaryEvent: content.primaryEvent,
    highlightsCount: content.highlights?.length || 0,
    hasHoroscopeSnippet: !!content.horoscopeSnippet,
    hasCallToAction: !!content.callToAction,
  });

  const sections = [
    content.highlights?.[0],
    content.horoscopeSnippet,
    content.callToAction,
    getWeeklyHashtags(date),
  ]
    .map((section) => section?.trim())
    .filter(Boolean);

  const post = sections.join('\n\n');

  console.log('📝 Formatted post length:', post.length, 'characters');
  if (post.length > 280) {
    console.warn(
      '⚠️ Weekly post exceeds Twitter character limit:',
      post.length,
      'chars',
    );
  }

  return post;
}

function formatTikTokPost(content: PostContent, date: string): string {
  const tiktokHashtags = getPlatformHashtags('tiktok', date);

  const sections = [
    content.highlights?.[0],
    content.horoscopeSnippet,
    content.callToAction,
    tiktokHashtags,
  ]
    .map((section) => section?.trim())
    .filter(Boolean);

  return sections.join('\n\n');
}

function formatWeeklyTwitterContent(
  content: PostContent,
  date: string,
): string {
  const baseText = [content.highlights?.[0], content.callToAction]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(' — ');

  const hashtags = getWeeklyHashtags(date)
    .split(' ')
    .filter(Boolean)
    .slice(0, 3)
    .join(' ');

  const normalized = baseText.replace(/\s+/g, ' ').trim();
  const hashtagSegment = hashtags ? ` ${hashtags}` : '';
  const maxLength =
    280 - (hashtagSegment.length > 0 ? hashtagSegment.length : 0);
  const truncated =
    normalized.length > maxLength && maxLength > 1
      ? `${normalized.slice(0, maxLength - 1)}…`
      : normalized;

  return `${truncated}${hashtagSegment}`.trim();
}

function formatWeeklyLinkedInContent(
  content: PostContent,
  date: string,
): string {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const sections = [
    `Weekly cosmic forecast for ${formattedDate}`,
    content.primaryEvent
      ? `Primary event: ${content.primaryEvent.name} — ${content.primaryEvent.energy}`
      : undefined,
    content.horoscopeSnippet,
    content.highlights?.[0],
    content.callToAction,
    getWeeklyHashtags(date),
  ]
    .map((section) => section?.trim())
    .filter(Boolean);

  return sections.join('\n\n');
}

function getWeeklyHashtags(date: string): string {
  const themes = [
    ['#weeklyhoroscope', '#astroforecast', '#weeklyastro'],
    ['#lunaryweekly', '#cosmicforecast', '#celestialguide'],
    ['#astroinsights', '#starguidance', '#moonmagic'],
  ];

  const seed = new Date(date).getDate();
  return themes
    .map((theme, index) => theme[(seed + index) % theme.length])
    .join(' ');
}
