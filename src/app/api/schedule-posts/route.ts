import { NextRequest, NextResponse } from 'next/server';
import { getImageBaseUrl } from '@/lib/urls';
import { getPlatformImageFormat } from '@/lib/social/educational-images';
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
    const monthParam = searchParams.get('month'); // Format: 2024-02 for February 2024

    const baseUrl = getImageBaseUrl();

    // Parse target month or default to next month
    let targetMonth: Date;
    if (monthParam) {
      const [year, month] = monthParam.split('-');
      targetMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
    } else {
      targetMonth = new Date();
      targetMonth.setMonth(targetMonth.getMonth() + 1);
      targetMonth.setDate(1);
    }

    // Generate posts for the entire month
    const daysInMonth = new Date(
      targetMonth.getFullYear(),
      targetMonth.getMonth() + 1,
      0,
    ).getDate();

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(
        targetMonth.getFullYear(),
        targetMonth.getMonth(),
        day,
      );
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
        continue;
      }

      const cosmicContent: PostContent = await cosmicResponse.json();
      const socialContent = formatCosmicPost(cosmicContent, dateStr);

      // Schedule post for 1 PM local time on the target date
      const scheduledDateTime = new Date(currentDate);
      scheduledDateTime.setHours(13, 0, 0, 0);

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

      try {
        const { results: platformResults } = await postToSocialMultiPlatform({
          platforms: ['instagram', 'x', 'facebook', 'linkedin'],
          content: socialContent,
          scheduledDate: scheduledDateTime.toISOString(),
          name: `Cosmic Post - ${readableDate}`,
          media: [
            {
              type: 'image',
              url: buildCosmicImageUrl('instagram'),
              alt: `${cosmicContent.primaryEvent.name} - ${cosmicContent.primaryEvent.energy}. Daily cosmic guidance and astronomical insights.`,
            },
          ],
          variants: {
            x: {
              content: socialContent,
              media: [buildCosmicImageUrl('twitter')],
            },
            facebook: {
              content: socialContent,
              media: [buildCosmicImageUrl('facebook')],
            },
            linkedin: {
              content: socialContent,
              media: [buildCosmicImageUrl('linkedin')],
            },
          },
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

      // Add small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      success: true,
      message: `Scheduled ${successCount} posts for ${targetMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      summary: {
        totalPosts: successCount + errorCount,
        successful: successCount,
        failed: errorCount,
        month: targetMonth.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        }),
      },
      results,
    });
  } catch (error) {
    console.error('Scheduler error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to schedule posts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

function getDailyHashtags(date: string): string {
  const themes = [
    ['#tarot', '#dailytarot', '#tarotreading', '#divination'],
    ['#horoscope', '#astrology', '#zodiac', '#planetary'],
    ['#mooncycles', '#moonphases', '#lunar', '#celestial'],
  ];

  const seed = new Date(date).getDate();
  return themes.map((theme, i) => theme[(seed + i) % theme.length]).join(' ');
}

function formatCosmicPost(content: PostContent, date: string): string {
  console.log('📝 Formatting cosmic post with content:', {
    primaryEvent: content.primaryEvent,
    highlightsCount: content.highlights?.length || 0,
    hasHoroscopeSnippet: !!content.horoscopeSnippet,
    hasCallToAction: !!content.callToAction,
  });

  // Get daily hashtags
  const hashtags = getDailyHashtags(date);

  // Create concise social media content for Twitter's 280 char limit
  const post = [
    content.highlights.slice(0, 1)[0], // Just the first highlight point
    '',
    'Daily cosmic guidance at lunary.app',
    '',
    hashtags,
  ].join('\n');

  console.log('📝 Formatted post length:', post.length, 'characters');

  // Warn if over Twitter limit
  if (post.length > 280) {
    console.warn(
      '⚠️ Post exceeds Twitter character limit:',
      post.length,
      'chars',
    );
  }

  return post;
}
