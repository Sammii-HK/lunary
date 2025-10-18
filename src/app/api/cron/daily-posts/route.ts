import { NextRequest, NextResponse } from 'next/server';
import {
  sendAdminNotification,
  NotificationTemplates,
} from '../../../../../utils/notifications/pushNotifications';

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

    console.log('🕐 Master cron job started at:', new Date().toISOString());
    console.log('🔐 Auth check passed - proceeding with cron execution');

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayOfMonth = today.getDate();
    const month = today.getMonth() + 1;
    const dateStr = today.toISOString().split('T')[0];

    console.log('📅 Cron execution context:', {
      date: dateStr,
      dayOfWeek,
      dayOfMonth,
      month,
      isWeeklyDay: dayOfWeek === 0, // Sunday
      isMonthlyDay: dayOfMonth === 15,
      isQuarterlyMonth: [1, 4, 7, 10].includes(month),
      isYearlyDay: month === 7 && dayOfMonth === 1,
    });

    const cronResults: any = {};

    // DAILY TASKS (Every day) - Social Media Posts
    console.log('📱 Running daily social media tasks...');
    try {
      const dailyResult = await runDailyPosts(dateStr);
      cronResults.dailyPosts = dailyResult;
    } catch (error) {
      console.error('❌ Daily posts failed:', error);
      cronResults.dailyPosts = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // WEEKLY TASKS (Sundays)
    if (dayOfWeek === 0) {
      console.log('📅 Sunday detected - running weekly tasks...');
      try {
        const weeklyResult = await runWeeklyTasks(request);
        cronResults.weeklyContent = weeklyResult;
      } catch (error) {
        console.error('❌ Weekly tasks failed:', error);
        cronResults.weeklyContent = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    // MONTHLY TASKS (15th of each month)
    if (dayOfMonth === 15) {
      console.log('📅 15th detected - running monthly tasks...');
      try {
        const monthlyResult = await runMonthlyTasks(request);
        cronResults.monthlyTasks = monthlyResult;
      } catch (error) {
        console.error('❌ Monthly tasks failed:', error);
        cronResults.monthlyTasks = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    // QUARTERLY TASKS (15th of Jan, Apr, Jul, Oct)
    if (dayOfMonth === 15 && [1, 4, 7, 10].includes(month)) {
      console.log('📅 Quarterly date detected - running quarterly tasks...');
      try {
        const quarterlyResult = await runQuarterlyTasks(request);
        cronResults.quarterlyTasks = quarterlyResult;
      } catch (error) {
        console.error('❌ Quarterly tasks failed:', error);
        cronResults.quarterlyTasks = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    // YEARLY TASKS (July 1st)
    if (month === 7 && dayOfMonth === 1) {
      console.log('📅 July 1st detected - running yearly tasks...');
      try {
        const yearlyResult = await runYearlyTasks(request);
        cronResults.yearlyTasks = yearlyResult;
      } catch (error) {
        console.error('❌ Yearly tasks failed:', error);
        cronResults.yearlyTasks = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    const totalTasks = Object.keys(cronResults).length;
    const successfulTasks = Object.values(cronResults).filter(
      (r: any) => r.success,
    ).length;

    console.log(
      `✅ Master cron completed: ${successfulTasks}/${totalTasks} task groups successful`,
    );

    return NextResponse.json({
      success: successfulTasks > 0,
      message: `Master cron completed - ${successfulTasks}/${totalTasks} task groups successful`,
      date: dateStr,
      executionContext: {
        dayOfWeek,
        dayOfMonth,
        month,
        tasksRun: Object.keys(cronResults),
      },
      results: cronResults,
      executedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Master cron job failed:', error);
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

// DAILY SOCIAL MEDIA POSTS
async function runDailyPosts(dateStr: string) {
  console.log('📱 Generating daily social media posts...');

  const productionUrl = 'https://lunary.app';

  // Fetch dynamic content for all post types
  const [
    cosmicResponse,
    crystalResponse,
    tarotResponse,
    moonResponse,
    horoscopeResponse,
  ] = await Promise.all([
    fetch(`${productionUrl}/api/og/cosmic-post?date=${dateStr}`, {
      headers: { 'User-Agent': 'Lunary-Cron/1.0' },
    }),
    fetch(`${productionUrl}/api/crystal-recommendation?date=${dateStr}`, {
      headers: { 'User-Agent': 'Lunary-Cron/1.0' },
    }).catch(() => null),
    fetch(`${productionUrl}/api/tarot-daily?date=${dateStr}`, {
      headers: { 'User-Agent': 'Lunary-Cron/1.0' },
    }).catch(() => null),
    fetch(`${productionUrl}/api/moon-phase?date=${dateStr}`, {
      headers: { 'User-Agent': 'Lunary-Cron/1.0' },
    }).catch(() => null),
    fetch(`${productionUrl}/api/horoscope-daily?date=${dateStr}`, {
      headers: { 'User-Agent': 'Lunary-Cron/1.0' },
    }).catch(() => null),
  ]);

  if (!cosmicResponse.ok) {
    throw new Error(`Failed to fetch cosmic content: ${cosmicResponse.status}`);
  }

  const cosmicContent = await cosmicResponse.json();
  const crystalContent = crystalResponse?.ok
    ? await crystalResponse.json()
    : null;
  const tarotContent = tarotResponse?.ok ? await tarotResponse.json() : null;
  const moonContent = moonResponse?.ok ? await moonResponse.json() : null;
  const horoscopeContent = horoscopeResponse?.ok
    ? await horoscopeResponse.json()
    : null;

  // Generate dynamic hashtags
  const themes = [
    ['#tarot', '#dailytarot', '#tarotreading', '#divination'],
    ['#horoscope', '#astrology', '#zodiac', '#planetary'],
    ['#mooncycles', '#moonphases', '#lunar', '#celestial'],
    ['#crystals', '#healing', '#spirituality', '#gems'],
  ];
  const seed = new Date().getDate();

  // Calculate proper scheduling times with buffer for Vercel cron delays
  // Cron runs at 8 AM UTC, schedule posts starting at 12 PM UTC (4 hour buffer)
  const scheduleBase = new Date();
  scheduleBase.setHours(12, 0, 0, 0); // Start at 12 PM UTC

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
      scheduledDate: new Date(
        scheduleBase.getTime() + 3 * 60 * 60 * 1000,
      ).toISOString(),
    },
    {
      name: 'Daily Tarot',
      content: generateTarotPost(tarotContent, themes[0], seed),
      platforms: allPlatforms,
      imageUrl: `${productionUrl}/api/og/tarot?date=${dateStr}`,
      alt: 'Daily tarot card reading with guidance and meaning.',
      scheduledDate: new Date(
        scheduleBase.getTime() + 6 * 60 * 60 * 1000,
      ).toISOString(),
    },
    {
      name: 'Moon Phase',
      content: generateMoonPost(moonContent, themes[2], seed),
      platforms: allPlatforms,
      imageUrl: `${productionUrl}/api/og/moon?date=${dateStr}`,
      alt: 'Current moon phase energy and guidance for today.',
      scheduledDate: new Date(
        scheduleBase.getTime() + 9 * 60 * 60 * 1000,
      ).toISOString(),
    },
    {
      name: 'Daily Horoscope',
      content: generateHoroscopePost(horoscopeContent, themes[1], seed),
      platforms: allPlatforms,
      imageUrl: `${productionUrl}/api/og/horoscope?date=${dateStr}`,
      alt: 'Daily zodiac horoscope with wisdom and guidance.',
      scheduledDate: new Date(
        scheduleBase.getTime() + 12 * 60 * 60 * 1000,
      ).toISOString(),
    },
  ];

  // Send posts to Succulent
  const succulentApiUrl = 'https://app.succulent.social/api/posts';
  const apiKey = process.env.SUCCULENT_SECRET_KEY;
  const postResults: any[] = [];

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
        console.log(`✅ ${post.name} post scheduled successfully`);
        postResults.push({
          name: post.name,
          platforms: post.platforms,
          status: 'success',
          postId: result.data?.postId || result.postId || result.id,
          scheduledDate: post.scheduledDate,
        });
      } else {
        console.error(`❌ ${post.name} post failed:`, result);
        postResults.push({
          name: post.name,
          platforms: post.platforms,
          status: 'error',
          error: result.error || result.message || `HTTP ${response.status}`,
          scheduledDate: post.scheduledDate,
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ ${post.name} post error:`, error);
      postResults.push({
        name: post.name,
        platforms: post.platforms,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  const successCount = postResults.filter(
    (r: any) => r.status === 'success',
  ).length;
  const errorCount = postResults.filter(
    (r: any) => r.status === 'error',
  ).length;

  const summary = {
    total: posts.length,
    successful: successCount,
    failed: errorCount,
    successRate: `${Math.round((successCount / posts.length) * 100)}%`,
  };

  // Send push notification with preview link
  try {
    if (successCount > 0) {
      await sendAdminNotification(
        NotificationTemplates.dailyPreview(dateStr, posts.length),
      );
      await sendAdminNotification(NotificationTemplates.cronSuccess(summary));
    } else {
      await sendAdminNotification(
        NotificationTemplates.cronFailure('All daily posts failed to schedule'),
      );
    }
  } catch (notificationError) {
    console.warn('📱 Push notification failed:', notificationError);
  }

  return {
    success: successCount > 0,
    message: `Published ${successCount}/${posts.length} posts across all platforms`,
    summary,
    results: postResults,
  };
}

// WEEKLY TASKS (Sundays)
async function runWeeklyTasks(request: NextRequest) {
  console.log('📅 Running weekly tasks...');
  const baseUrl = getBaseUrl(request);

  try {
    // 1. Generate weekly blog content
    const blogResponse = await fetch(`${baseUrl}/api/blog/weekly`, {
      headers: { 'User-Agent': 'Lunary-Master-Cron/1.0' },
    });

    if (!blogResponse.ok) {
      throw new Error(`Blog generation failed: ${blogResponse.status}`);
    }

    const blogData = await blogResponse.json();
    console.log('✅ Weekly blog content generated:', blogData.data?.title);

    // 2. Send weekly newsletter
    const newsletterResponse = await fetch(`${baseUrl}/api/newsletter/weekly`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Lunary-Master-Cron/1.0',
      },
      body: JSON.stringify({
        send: true,
        customSubject: `🌟 ${blogData.data?.title}`,
      }),
    });

    const newsletterData = await newsletterResponse.json();
    console.log('📧 Weekly newsletter result:', newsletterData.message);

    // Send push notification for weekly content
    try {
      await sendAdminNotification(
        NotificationTemplates.weeklyContentGenerated(
          blogData.data?.title || 'Weekly Content',
          blogData.data?.weekNumber || 0,
        ),
      );
    } catch (notificationError) {
      console.warn('📱 Weekly notification failed:', notificationError);
    }

    return {
      success: true,
      blog: {
        title: blogData.data?.title,
        weekNumber: blogData.data?.weekNumber,
        year: blogData.data?.year,
      },
      newsletter: {
        sent: newsletterData.success,
        recipients: newsletterData.data?.recipients || 0,
      },
    };
  } catch (error) {
    console.error('❌ Weekly tasks failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// MONTHLY TASKS (15th of each month)
async function runMonthlyTasks(request: NextRequest) {
  console.log('📅 Running monthly tasks...');
  const baseUrl = getBaseUrl(request);

  try {
    const response = await fetch(
      `${baseUrl}/api/cron/moon-packs?type=monthly`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
          'User-Agent': 'Lunary-Master-Cron/1.0',
        },
      },
    );

    const result = await response.json();
    console.log('✅ Monthly moon packs generated');

    return { success: true, moonPacks: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// QUARTERLY TASKS (15th of Jan, Apr, Jul, Oct)
async function runQuarterlyTasks(request: NextRequest) {
  console.log('📅 Running quarterly tasks...');
  const baseUrl = getBaseUrl(request);

  try {
    const response = await fetch(
      `${baseUrl}/api/cron/moon-packs?type=quarterly`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
          'User-Agent': 'Lunary-Master-Cron/1.0',
        },
      },
    );

    const result = await response.json();
    console.log('✅ Quarterly moon packs generated');

    return { success: true, moonPacks: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// YEARLY TASKS (July 1st)
async function runYearlyTasks(request: NextRequest) {
  console.log('📅 Running yearly tasks...');
  const baseUrl = getBaseUrl(request);

  try {
    const response = await fetch(`${baseUrl}/api/cron/moon-packs?type=yearly`, {
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
        'User-Agent': 'Lunary-Master-Cron/1.0',
      },
    });

    const result = await response.json();
    console.log('✅ Yearly moon packs generated');

    return { success: true, moonPacks: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function getBaseUrl(request: NextRequest): string {
  return process.env.NODE_ENV === 'production'
    ? 'https://lunary.app'
    : request.nextUrl.origin;
}

// Dynamic content generators
function generateCosmicPost(
  cosmicContent: any,
  hashtagTheme: string[],
  seed: number,
): string {
  const hashtags = hashtagTheme.slice(0, 2).join(' ');

  return [
    cosmicContent.highlights?.[0] ||
      `${cosmicContent.primaryEvent.name}: ${cosmicContent.primaryEvent.energy}`,
    '',
    'Daily cosmic guidance at lunary.app',
    '',
    hashtags,
  ].join('\n');
}

function generateCrystalPost(
  crystalContent: any,
  hashtagTheme: string[],
  seed: number,
): string {
  const hashtags = hashtagTheme.slice(0, 3).join(' ');

  if (crystalContent?.crystal) {
    return [
      `Today's crystal: ${crystalContent.crystal.name}`,
      '',
      crystalContent.crystal.guidance ||
        'Powerful healing energy to support your spiritual journey.',
      '',
      'Discover personalized crystal guidance at lunary.app',
      '',
      hashtags,
    ].join('\n');
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
  ].join('\n');
}

function generateTarotPost(
  tarotContent: any,
  hashtagTheme: string[],
  seed: number,
): string {
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
    ].join('\n');
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
  ].join('\n');
}

function generateMoonPost(
  moonContent: any,
  hashtagTheme: string[],
  seed: number,
): string {
  const hashtags = hashtagTheme.slice(0, 3).join(' ');

  if (moonContent?.phase) {
    return [
      `${moonContent.phase.name}: ${moonContent.phase.energy}`,
      '',
      moonContent.phase.guidance ||
        'The lunar cycle influences our emotional and spiritual rhythms.',
      '',
      'Track lunar phases and cosmic timing at lunary.app',
      '',
      hashtags,
    ].join('\n');
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
  ].join('\n');
}

function generateHoroscopePost(
  horoscopeContent: any,
  hashtagTheme: string[],
  seed: number,
): string {
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
    ].join('\n');
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
  ].join('\n');
}
