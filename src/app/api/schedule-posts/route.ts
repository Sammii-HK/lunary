import { NextRequest, NextResponse } from 'next/server';

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
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month'); // Format: 2024-02 for February 2024
    const testMode = searchParams.get('test') === 'true';

    // Get environment variables
    const apiKey = process.env.SUCCULENT_SECRET_KEY;
    const accountGroupId = process.env.SUCCULENT_ACCOUNT_GROUP_ID;

    // Get the base URL for the application (dev vs prod)
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    console.log('🔑 Monthly scheduler environment check:', {
      hasApiKey: !!apiKey,
      hasAccountGroupId: !!accountGroupId,
      baseUrl,
      nodeEnv: process.env.NODE_ENV,
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
    const posts: SucculentPostData[] = [];
    const daysInMonth = new Date(
      targetMonth.getFullYear(),
      targetMonth.getMonth() + 1,
      0,
    ).getDate();

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
        continue; // Skip this date if cosmic content fails
      }

      const cosmicContent: PostContent = await cosmicResponse.json();

      // Format the social media post
      const socialContent = formatCosmicPost(cosmicContent, dateStr);

      // Schedule post for 1 PM local time on the target date
      const scheduledDateTime = new Date(currentDate);
      scheduledDateTime.setHours(13, 0, 0, 0);

      // Ensure image URL uses the correct base URL
      const imageUrl = `${baseUrl}/api/og/cosmic/${dateStr}`;

      const postData: SucculentPostData = {
        accountGroupId,
        name: `Cosmic Post ${dateStr}`,
        content: socialContent,
        platforms: ['instagram', 'x', 'facebook', 'linkedin'],
        scheduledDate: scheduledDateTime.toISOString(),
        media: [
          {
            type: 'image',
            url: imageUrl,
            alt: `${cosmicContent.primaryEvent.name} - ${cosmicContent.primaryEvent.energy}. Daily cosmic guidance and astronomical insights.`,
          },
        ],
      };

      console.log(`📅 Post prepared for ${dateStr}:`, {
        contentLength: postData.content.length,
        imageUrl: postData.media[0].url,
        scheduledDate: postData.scheduledDate,
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

    return NextResponse.json({
      success: true,
      message: `Scheduled ${successCount} posts for ${targetMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      summary: {
        totalPosts: posts.length,
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
