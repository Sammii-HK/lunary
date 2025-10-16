import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Verify cron request
    const authHeader = request.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🕐 Daily cron job started at:', new Date().toISOString());
    console.log('🔐 Auth check passed - proceeding with cron execution');

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    console.log('📅 Publishing posts for date:', dateStr);
    console.log('🌐 Environment check:', {
      hasSucculentKey: !!process.env.SUCCULENT_SECRET_KEY,
      hasAccountGroupId: !!process.env.SUCCULENT_ACCOUNT_GROUP_ID,
      nodeEnv: process.env.NODE_ENV,
    });

    // Always use production URL - avoid preview deployment issues
    const productionUrl = 'https://lunary.app';
    const cosmicUrl = `${productionUrl}/api/og/cosmic-post?date=${dateStr}`;
    console.log('🔗 Fetching cosmic content from production:', cosmicUrl);

    const cosmicResponse = await fetch(cosmicUrl, {
      headers: {
        'User-Agent': 'Lunary-Cron/1.0',
      },
    });

    console.log('🌟 Cosmic API response:', {
      status: cosmicResponse.status,
      ok: cosmicResponse.ok,
      contentType: cosmicResponse.headers.get('content-type'),
    });

    if (!cosmicResponse.ok) {
      console.error('❌ Cosmic API failed:', {
        status: cosmicResponse.status,
        statusText: cosmicResponse.statusText,
        url: cosmicUrl,
      });

      const errorText = await cosmicResponse.text();
      console.error('❌ Error response:', errorText.substring(0, 200));

      throw new Error(
        `Failed to fetch cosmic content: ${cosmicResponse.status}`,
      );
    }

    const cosmicContent = await cosmicResponse.json();
    console.log('✅ Cosmic content loaded:', {
      primaryEvent: cosmicContent.primaryEvent,
      highlightsCount: cosmicContent.highlights?.length,
    });

    // Simple hashtag selection
    const themes = [
      ['#tarot', '#dailytarot', '#tarotreading', '#divination'],
      ['#horoscope', '#astrology', '#zodiac', '#planetary'],
      ['#mooncycles', '#moonphases', '#lunar', '#celestial'],
    ];

    const seed = today.getDate();
    const selectedHashtags = themes.map(
      (theme, i) => theme[(seed + i) % theme.length],
    );

    // Format post content with hashtags (Twitter-friendly)
    const socialContent = [
      cosmicContent.highlights.slice(0, 1)[0], // Just the first highlight point
      '',
      'Daily cosmic guidance at lunary.app',
      '',
      selectedHashtags.join(' '),
    ].join('\n');

    console.log('📝 Post length:', socialContent.length, 'characters');
    if (socialContent.length > 280) {
      console.warn('⚠️ Post exceeds Twitter limit:', socialContent.length);
    }

    // Create multiple posts scheduled throughout the day
    const now = new Date();
    const posts = [
      {
        name: 'Main Cosmic',
        content: socialContent,
        platforms: ['x', 'bluesky', 'instagram', 'reddit', 'pinterest'],
        imageUrl: `https://lunary.app/api/og/cosmic?date=${dateStr}`,
        alt: `${cosmicContent.primaryEvent.name} - ${cosmicContent.primaryEvent.energy}. Daily cosmic guidance.`,
        scheduledDate: now.toISOString(), // Immediate (1 PM)
      },
      {
        name: 'Daily Crystal',
        content: `Today's crystal ally brings powerful healing energy to support your spiritual journey. Each crystal carries unique vibrations that can enhance meditation, protect your energy field, and amplify your natural intuition.\n\nDiscover personalized crystal guidance at lunary.app\n\n#crystals #healing #spirituality`,
        platforms: ['instagram', 'pinterest', 'reddit'],
        imageUrl: `https://lunary.app/api/og/crystal?date=${dateStr}`,
        alt: 'Daily crystal recommendation for spiritual guidance and healing.',
        scheduledDate: new Date(
          now.getTime() + 3 * 60 * 60 * 1000,
        ).toISOString(), // 3 hours later (4 PM)
      },
      {
        name: 'Daily Tarot',
        content: `The cards reveal profound insights about your path today. Each tarot archetype carries ancient wisdom that speaks to different aspects of the human experience - from new beginnings to inner strength.\n\nExplore personalized tarot readings at lunary.app\n\n#tarot #dailytarot #divination`,
        platforms: ['x', 'bluesky', 'reddit'],
        imageUrl: `https://lunary.app/api/og/tarot?date=${dateStr}`,
        alt: 'Daily tarot card reading with guidance and meaning.',
        scheduledDate: new Date(
          now.getTime() + 6 * 60 * 60 * 1000,
        ).toISOString(), // 6 hours later (7 PM)
      },
      {
        name: 'Moon Phase',
        content: `The lunar cycle profoundly influences our emotional and spiritual rhythms. Each phase offers unique opportunities for growth, release, and manifestation. Working with moon energy can deepen your intuitive practice and enhance your connection to natural cycles.\n\nTrack lunar phases and cosmic timing at lunary.app\n\n#moonphases #lunar #celestial`,
        platforms: ['instagram', 'pinterest'],
        imageUrl: `https://lunary.app/api/og/moon?date=${dateStr}`,
        alt: 'Current moon phase energy and guidance for today.',
        scheduledDate: new Date(
          now.getTime() + 9 * 60 * 60 * 1000,
        ).toISOString(), // 9 hours later (10 PM)
      },
      {
        name: 'Daily Horoscope',
        content: `Today's zodiac wisdom offers profound insights into your cosmic nature. Each sign carries unique gifts and perspectives that can guide your daily journey. Understanding your astrological influences helps you navigate life with greater awareness and purpose.\n\nExplore personalized horoscopes at lunary.app\n\n#horoscope #zodiac #astrology`,
        platforms: ['x', 'bluesky'],
        imageUrl: `https://lunary.app/api/og/horoscope?date=${dateStr}`,
        alt: 'Daily zodiac horoscope with wisdom and guidance.',
        scheduledDate: new Date(
          now.getTime() + 12 * 60 * 60 * 1000,
        ).toISOString(), // 12 hours later (1 AM next day)
      },
    ];

    const succulentApiUrl = 'https://app.succulent.social/api/posts';
    const apiKey = process.env.SUCCULENT_SECRET_KEY;
    const results = [];

    console.log(`🚀 Publishing ${posts.length} different posts...`);
    console.log('📋 Post schedule overview:');
    posts.forEach((post, index) => {
      const scheduledTime = new Date(post.scheduledDate).toLocaleTimeString(
        'en-US',
        {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'UTC',
          timeZoneName: 'short',
        },
      );
      console.log(
        `  ${index + 1}. ${post.name} → ${post.platforms.join(', ')} at ${scheduledTime}`,
      );
    });

    // Send each post to Succulent - continue even if one fails
    for (const post of posts) {
      try {
        // First test if the image URL works
        console.log(`🔍 Testing image URL for ${post.name}:`, post.imageUrl);

        try {
          const imageTest = await fetch(post.imageUrl, { method: 'HEAD' });
          if (!imageTest.ok) {
            console.warn(
              `⚠️ Image URL failed for ${post.name}, but continuing with post`,
            );
          }
        } catch (imageError) {
          console.warn(
            `⚠️ Image test failed for ${post.name}:`,
            imageError instanceof Error
              ? imageError.message
              : String(imageError),
          );
          console.log(
            `📤 Continuing with post anyway - platform may handle image fetch`,
          );
        }

        const postData = {
          accountGroupId: process.env.SUCCULENT_ACCOUNT_GROUP_ID,
          content: post.content,
          platforms: post.platforms,
          scheduledDate: post.scheduledDate,
          media: [
            {
              type: 'image',
              url: post.imageUrl,
              alt: post.alt,
            },
          ],
        };

        console.log(
          `📤 Sending ${post.name} post to platforms:`,
          post.platforms,
        );

        const response = await fetch(succulentApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey || '',
          },
          body: JSON.stringify(postData),
        });

        const result = await response.json();

        if (response.ok) {
          console.log(`✅ ${post.name} post published successfully`);
          results.push({
            name: post.name,
            platforms: post.platforms,
            status: 'success',
            postId: result.data?.postId || result.postId,
          });
        } else {
          console.error(`❌ ${post.name} post failed:`, result);
          results.push({
            name: post.name,
            platforms: post.platforms,
            status: 'error',
            error: result.error || result.message,
          });
        }

        // Small delay between posts
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ ${post.name} post error:`, error);
        console.log(
          `📤 Continuing with remaining posts despite ${post.name} failure`,
        );
        results.push({
          name: post.name,
          platforms: post.platforms,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        // Continue with next post even if this one failed
        continue;
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const errorCount = results.filter((r) => r.status === 'error').length;

    console.log(
      `✅ Daily cron completed: ${successCount} success, ${errorCount} errors`,
    );
    console.log('📊 Final summary:', {
      totalPosts: posts.length,
      successful: successCount,
      failed: errorCount,
      successRate: `${Math.round((successCount / posts.length) * 100)}%`,
      failedPosts: results
        .filter((r) => r.status === 'error')
        .map((r) => r.name),
    });

    // Log each post result for debugging
    results.forEach((result) => {
      if (result.status === 'success') {
        console.log(
          `✅ ${result.name}: Posted to ${result.platforms.join(', ')} - ID: ${result.postId}`,
        );
      } else {
        console.error(
          `❌ ${result.name}: Failed on ${result.platforms.join(', ')} - Error: ${result.error}`,
        );
      }
    });

    return NextResponse.json({
      success: successCount > 0, // Success if at least one post worked
      message: `Published ${successCount}/${posts.length} posts across 5 platforms throughout the day`,
      date: dateStr,
      summary: {
        total: posts.length,
        successful: successCount,
        failed: errorCount,
        successRate: `${Math.round((successCount / posts.length) * 100)}%`,
      },
      results: results,
      publishedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Daily cron job failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
