import { NextRequest, NextResponse } from 'next/server';
import { getImageBaseUrl } from '@/lib/urls';
import { getPlatformImageFormat } from '@/lib/social/educational-images';
import { getPlatformHashtags } from '../../../../../utils/hashtags';
import { postToSocialMultiPlatform } from '@/lib/social/client';

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

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');

    const baseUrl = getImageBaseUrl();

    // Parse start date or default to next Monday
    let startDate: Date;
    if (startDateParam) {
      startDate = new Date(startDateParam);
    } else {
      const today = new Date();
      const daysUntilMonday = (1 + 7 - today.getDay()) % 7;
      startDate = new Date(today);
      startDate.setDate(
        today.getDate() + (daysUntilMonday === 0 ? 7 : daysUntilMonday),
      );
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      const dateStr = currentDate.toISOString().split('T')[0];

      const cosmicResponse = await fetch(
        `${baseUrl}/api/og/cosmic-post?date=${dateStr}`,
      );

      if (!cosmicResponse.ok) {
        console.error(
          `Failed to fetch cosmic content for ${dateStr}:`,
          cosmicResponse.status,
        );
        continue;
      }

      const cosmicContent: PostContent = await cosmicResponse.json();

      const scheduledDateTime = new Date(currentDate);
      scheduledDateTime.setHours(8, 0, 0, 0); // 8 AM UTC

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

      const twitterVariantContent = twitterContent.trim();
      const linkedinVariantContent = linkedinContent.trim();

      const variants: Record<string, { content: string; media?: string[] }> = {
        facebook: {
          content: baseContent,
          media: [buildCosmicImageUrl('facebook')],
        },
        x: {
          content: twitterVariantContent || baseContent,
          media: [buildCosmicImageUrl('x')],
        },
        threads: {
          content: twitterVariantContent || baseContent,
          media: [buildCosmicImageUrl('threads')],
        },
        linkedin: {
          content: linkedinVariantContent || baseContent,
          media: [buildCosmicImageUrl('linkedin')],
        },
      };

      console.log(`📅 Weekly post prepared for ${dateStr}:`, {
        contentLength: baseContent.length,
        imageUrl: storyImageUrl,
        scheduledDate: scheduledDateTime.toISOString(),
        scheduledTime: '8:00 AM',
        variantPlatforms: Object.keys(variants),
      });

      try {
        const { results: platformResults } = await postToSocialMultiPlatform({
          platforms: ['instagram'],
          content: baseContent,
          scheduledDate: scheduledDateTime.toISOString(),
          name: `Cosmic Post - ${readableDate}`,
          media: [
            {
              type: 'image',
              url: storyImageUrl,
              alt: altText,
            },
          ],
          variants,
        });

        const anySuccess = Object.values(platformResults).some(
          (r) => r.success,
        );
        if (anySuccess) {
          successCount++;
          results.push({
            date: dateStr,
            status: 'success',
          });
        } else {
          errorCount++;
          const firstError = Object.values(platformResults).find(
            (r) => r.error,
          );
          results.push({
            date: dateStr,
            status: 'error',
            error: firstError?.error || 'Unknown error',
          });
        }
      } catch (error) {
        errorCount++;
        results.push({
          date: dateStr,
          status: 'error',
          error: error instanceof Error ? error.message : 'Network error',
        });
      }

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
