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

    const productionUrl = 'https://lunary.app';

    // Fetch dynamic content for all post types
    console.log('🔗 Fetching dynamic content for all post types...');
    
    const [cosmicResponse, crystalResponse, tarotResponse, moonResponse, horoscopeResponse] = await Promise.all([
      fetch(`${productionUrl}/api/og/cosmic-post?date=${dateStr}`, {
        headers: { 'User-Agent': 'Lunary-Cron/1.0' }
      }),
      fetch(`${productionUrl}/api/crystal-recommendation?date=${dateStr}`, {
        headers: { 'User-Agent': 'Lunary-Cron/1.0' }
      }).catch(() => null), // Fallback if endpoint doesn't exist
      fetch(`${productionUrl}/api/tarot-daily?date=${dateStr}`, {
        headers: { 'User-Agent': 'Lunary-Cron/1.0' }
      }).catch(() => null), // Fallback if endpoint doesn't exist
      fetch(`${productionUrl}/api/moon-phase?date=${dateStr}`, {
        headers: { 'User-Agent': 'Lunary-Cron/1.0' }
      }).catch(() => null), // Fallback if endpoint doesn't exist
      fetch(`${productionUrl}/api/horoscope-daily?date=${dateStr}`, {
        headers: { 'User-Agent': 'Lunary-Cron/1.0' }
      }).catch(() => null) // Fallback if endpoint doesn't exist
    ]);

    console.log('🌟 API responses:', {
      cosmic: cosmicResponse?.status,
      crystal: crystalResponse?.status || 'fallback',
      tarot: tarotResponse?.status || 'fallback',
      moon: moonResponse?.status || 'fallback',
      horoscope: horoscopeResponse?.status || 'fallback'
    });

    if (!cosmicResponse.ok) {
      throw new Error(`Failed to fetch cosmic content: ${cosmicResponse.status}`);
    }

    const cosmicContent = await cosmicResponse.json();
    console.log('✅ Cosmic content loaded:', {
      primaryEvent: cosmicContent.primaryEvent,
      highlightsCount: cosmicContent.highlights?.length,
    });

    // Get dynamic content for other post types (with fallbacks)
    const crystalContent = crystalResponse?.ok ? await crystalResponse.json() : null;
    const tarotContent = tarotResponse?.ok ? await tarotResponse.json() : null;
    const moonContent = moonResponse?.ok ? await moonResponse.json() : null;
    const horoscopeContent = horoscopeResponse?.ok ? await horoscopeResponse.json() : null;

    // Generate dynamic hashtags
    const themes = [
      ['#tarot', '#dailytarot', '#tarotreading', '#divination'],
      ['#horoscope', '#astrology', '#zodiac', '#planetary'],
      ['#mooncycles', '#moonphases', '#lunar', '#celestial'],
      ['#crystals', '#healing', '#spirituality', '#gems'],
    ];
    const seed = today.getDate();

    // Calculate proper scheduling times
    const scheduleBase = new Date();
    scheduleBase.setHours(14, 0, 0, 0); // Start at 2 PM UTC

    // All platforms for every post
    const allPlatforms = ['x', 'bluesky', 'instagram', 'reddit', 'pinterest'];

    // Generate posts with dynamic content
    const posts = [
      {
        name: 'Main Cosmic',
        content: generateCosmicPost(cosmicContent, themes[1], seed),
        platforms: allPlatforms,
        imageUrl: `${productionUrl}/api/og/cosmic?date=${dateStr}`,
        alt: `${cosmicContent.primaryEvent.name} - ${cosmicContent.primaryEvent.energy}. Daily cosmic guidance.`,
        scheduledDate: new Date(scheduleBase.getTime()).toISOString(),
      },
      {
        name: 'Daily Crystal',
        content: generateCrystalPost(crystalContent, themes[3], seed),
        platforms: allPlatforms,
        imageUrl: `${productionUrl}/api/og/crystal?date=${dateStr}`,
        alt: 'Daily crystal recommendation for spiritual guidance and healing.',
        scheduledDate: new Date(scheduleBase.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        name: 'Daily Tarot',
        content: generateTarotPost(tarotContent, themes[0], seed),
        platforms: allPlatforms,
        imageUrl: `${productionUrl}/api/og/tarot?date=${dateStr}`,
        alt: 'Daily tarot card reading with guidance and meaning.',
        scheduledDate: new Date(scheduleBase.getTime() + 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        name: 'Moon Phase',
        content: generateMoonPost(moonContent, themes[2], seed),
        platforms: allPlatforms,
        imageUrl: `${productionUrl}/api/og/moon?date=${dateStr}`,
        alt: 'Current moon phase energy and guidance for today.',
        scheduledDate: new Date(scheduleBase.getTime() + 9 * 60 * 60 * 1000).toISOString(),
      },
      {
        name: 'Daily Horoscope',
        content: generateHoroscopePost(horoscopeContent, themes[1], seed),
        platforms: allPlatforms,
        imageUrl: `${productionUrl}/api/og/horoscope?date=${dateStr}`,
        alt: 'Daily zodiac horoscope with wisdom and guidance.',
        scheduledDate: new Date(scheduleBase.getTime() + 12 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const succulentApiUrl = 'https://app.succulent.social/api/posts';
    const apiKey = process.env.SUCCULENT_SECRET_KEY;
    const results = [];

    console.log(`🚀 Publishing ${posts.length} different posts...`);
    console.log('📋 Post schedule overview:');
    posts.forEach((post, index) => {
      const scheduledTime = new Date(post.scheduledDate).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
        timeZoneName: 'short',
      });
      console.log(`  ${index + 1}. ${post.name} → ${post.platforms.join(', ')} at ${scheduledTime}`);
    });

    // Send all posts to Succulent
    for (const post of posts) {
      try {
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

        console.log(`📤 Sending ${post.name} scheduled for:`, {
          scheduledDate: post.scheduledDate,
          platforms: post.platforms,
          contentLength: post.content.length
        });

        const response = await fetch(succulentApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey || '',
          },
          body: JSON.stringify(postData),
        });

        console.log(`🌐 Succulent API response for ${post.name}:`, {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        });

        const result = await response.json();

        if (response.ok) {
          console.log(`✅ ${post.name} post scheduled successfully`);
          results.push({
            name: post.name,
            platforms: post.platforms,
            status: 'success',
            postId: result.data?.postId || result.postId || result.id,
            scheduledDate: post.scheduledDate,
          });
        } else {
          console.error(`❌ ${post.name} post failed:`, {
            status: response.status,
            error: result.error || result.message || result,
          });
          results.push({
            name: post.name,
            platforms: post.platforms,
            status: 'error',
            error: result.error || result.message || `HTTP ${response.status}`,
            scheduledDate: post.scheduledDate,
          });
        }

        // Small delay between posts
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ ${post.name} post error:`, error);
        results.push({
          name: post.name,
          platforms: post.platforms,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const errorCount = results.filter((r) => r.status === 'error').length;

    console.log(`✅ Daily cron completed: ${successCount} success, ${errorCount} errors`);

    return NextResponse.json({
      success: successCount > 0,
      message: `Published ${successCount}/${posts.length} posts across all platforms throughout the day`,
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

// Dynamic content generators
function generateCosmicPost(cosmicContent: any, hashtagTheme: string[], seed: number): string {
  const hashtags = hashtagTheme.slice(0, 2).join(' ');
  
  return [
    cosmicContent.highlights?.[0] || `${cosmicContent.primaryEvent.name}: ${cosmicContent.primaryEvent.energy}`,
    '',
    'Daily cosmic guidance at lunary.app',
    '',
    hashtags,
  ].join('\\n');
}

function generateCrystalPost(crystalContent: any, hashtagTheme: string[], seed: number): string {
  const hashtags = hashtagTheme.slice(0, 3).join(' ');
  
  if (crystalContent?.crystal) {
    return [
      `Today's crystal: ${crystalContent.crystal.name}`,
      '',
      crystalContent.crystal.guidance || 'Powerful healing energy to support your spiritual journey.',
      '',
      'Discover personalized crystal guidance at lunary.app',
      '',
      hashtags,
    ].join('\\n');
  }
  
  // Fallback content
  return [
    "Today's crystal ally brings powerful healing energy to support your spiritual journey.",
    '',
    'Each crystal carries unique vibrations that enhance meditation and amplify intuition.',
    '',
    'Discover personalized crystal guidance at lunary.app',
    '',
    hashtags,
  ].join('\\n');
}

function generateTarotPost(tarotContent: any, hashtagTheme: string[], seed: number): string {
  const hashtags = hashtagTheme.slice(0, 3).join(' ');
  
  if (tarotContent?.card) {
    return [
      `Today's card: ${tarotContent.card.name}`,
      '',
      tarotContent.card.guidance || 'Ancient wisdom speaks to your path today.',
      '',
      'Explore personalized tarot readings at lunary.app',
      '',
      hashtags,
    ].join('\\n');
  }
  
  // Fallback content
  return [
    'The cards reveal profound insights about your path today.',
    '',
    'Each archetype carries ancient wisdom from new beginnings to inner strength.',
    '',
    'Explore personalized tarot readings at lunary.app',
    '',
    hashtags,
  ].join('\\n');
}

function generateMoonPost(moonContent: any, hashtagTheme: string[], seed: number): string {
  const hashtags = hashtagTheme.slice(0, 3).join(' ');
  
  if (moonContent?.phase) {
    return [
      `${moonContent.phase.name}: ${moonContent.phase.energy}`,
      '',
      moonContent.phase.guidance || 'The lunar cycle influences our emotional and spiritual rhythms.',
      '',
      'Track lunar phases and cosmic timing at lunary.app',
      '',
      hashtags,
    ].join('\\n');
  }
  
  // Fallback content
  return [
    'The lunar cycle profoundly influences our emotional and spiritual rhythms.',
    '',
    'Each phase offers unique opportunities for growth, release, and manifestation.',
    '',
    'Track lunar phases and cosmic timing at lunary.app',
    '',
    hashtags,
  ].join('\\n');
}

function generateHoroscopePost(horoscopeContent: any, hashtagTheme: string[], seed: number): string {
  const hashtags = hashtagTheme.slice(0, 3).join(' ');
  
  if (horoscopeContent?.guidance) {
    return [
      "Today's zodiac wisdom offers profound insights into your cosmic nature.",
      '',
      horoscopeContent.guidance.slice(0, 120) + '...', // Truncate for social media
      '',
      'Explore personalized horoscopes at lunary.app',
      '',
      hashtags,
    ].join('\\n');
  }
  
  // Fallback content
  return [
    "Today's zodiac wisdom offers profound insights into your cosmic nature.",
    '',
    'Each sign carries unique gifts that can guide your daily journey.',
    '',
    'Explore personalized horoscopes at lunary.app',
    '',
    hashtags,
  ].join('\\n');
}