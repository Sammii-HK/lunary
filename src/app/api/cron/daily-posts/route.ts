import { NextRequest, NextResponse } from 'next/server';
import {
  sendAdminNotification,
  NotificationTemplates,
} from '../../../../../utils/notifications/pushNotifications';

// Track if cron is already running to prevent duplicate execution
// Using a Map to track by date for better serverless resilience
const executionTracker = new Map<string, boolean>();

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

    const today = new Date().toISOString().split('T')[0];

    // Atomic check-and-set: Prevent duplicate execution on the same day
    // This works better in serverless than separate checks
    if (executionTracker.has(today)) {
      console.log(
        `⚠️ Cron already executed today (${today}), skipping duplicate execution`,
      );
      return NextResponse.json({
        success: false,
        message: `Already executed today (${today})`,
        skipped: true,
      });
    }

    // Immediately mark as executing for this date (atomic operation)
    executionTracker.set(today, true);

    // Clean up old entries (keep only last 7 days to prevent memory leak)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
    for (const [date] of executionTracker) {
      if (date < cutoffDateStr) {
        executionTracker.delete(date);
      }
    }

    console.log('🕐 Master cron job started at:', new Date().toISOString());
    console.log('🔐 Auth check passed - proceeding with cron execution');

    const todayDate = new Date();
    const dayOfWeek = todayDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayOfMonth = todayDate.getDate();
    const month = todayDate.getMonth() + 1;
    const dateStr = todayDate.toISOString().split('T')[0];

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

    // Clear the execution flag for today on success (but keep it to prevent retries)
    // We don't delete it so if there's a retry, it's still blocked

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
    // On error, we could optionally remove the flag to allow retry
    // But keeping it prevents duplicate posts if there are network issues
    // executionTracker.delete(today); // Uncomment if you want retries on error
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
  const [cosmicResponse] = await Promise.all([
    fetch(`${productionUrl}/api/og/cosmic-post/${dateStr}`, {
      headers: { 'User-Agent': 'Lunary-Cron/1.0' },
    }),
  ]);

  console.log('cosmicResponse', cosmicResponse);

  if (!cosmicResponse.ok) {
    throw new Error(`Failed to fetch cosmic content: ${cosmicResponse.status}`);
  }

  const cosmicContent = await cosmicResponse.json();

  // Calculate proper scheduling times with buffer for Vercel cron delays
  // Cron runs at 8 AM UTC, schedule posts starting at 12 PM UTC (4 hour buffer)
  const scheduleBase = new Date();
  scheduleBase.setHours(12, 0, 0, 0); // Start at 12 PM UTC

  // Generate posts with dynamic content - ONE Twitter post only
  const posts = [
    {
      name: 'Main Cosmic X',
      content: generateCosmicPost(cosmicContent).snippet,
      platforms: ['x'], // Only Twitter/X - single post per day
      imageUrls: [`${productionUrl}/api/og/cosmic/${dateStr}/landscape`],
      alt: `${cosmicContent.primaryEvent.name} - ${cosmicContent.primaryEvent.energy}. Daily cosmic guidance from lunary.app.`,
      scheduledDate: new Date(scheduleBase.getTime()).toISOString(),
    },
    {
      name: 'Main Cosmic',
      content: generateCosmicPost(cosmicContent).snippet,
      platforms: ['reddit', 'pinterest'],
      imageUrls: [`${productionUrl}/api/og/cosmic/${dateStr}`],
      alt: `${cosmicContent.primaryEvent.name} - ${cosmicContent.primaryEvent.energy}. Daily cosmic guidance from lunary.app.`,
      scheduledDate: new Date(scheduleBase.getTime()).toISOString(),
    },
    {
      name: 'Main Cosmic Bluesky',
      content: generateCosmicPost(cosmicContent).snippetShort,
      platforms: ['bluesky'],
      imageUrls: [`${productionUrl}/api/og/cosmic/${dateStr}`],
      alt: `${cosmicContent.primaryEvent.name} - ${cosmicContent.primaryEvent.energy}. Daily cosmic guidance from lunary.app.`,
      scheduledDate: new Date(scheduleBase.getTime()).toISOString(),
    },
    {
      name: 'Main Cosmic Carousel',
      content: generateCosmicPost(cosmicContent).snippet,
      platforms: ['instagram'],
      imageUrls: [
        `${productionUrl}/api/og/cosmic/${dateStr}`,
        `${productionUrl}/api/og/crystal?date=${dateStr}`,
        `${productionUrl}/api/og/tarot?date=${dateStr}`,
        `${productionUrl}/api/og/moon?date=${dateStr}`,
        `${productionUrl}/api/og/horoscope?date=${dateStr}`,
      ],
      alt: `${cosmicContent.primaryEvent.name} - ${cosmicContent.primaryEvent.energy}. Daily cosmic guidance from lunary.app.`,
      scheduledDate: new Date(scheduleBase.getTime()).toISOString(),
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
        media: post.imageUrls.map((imageUrl: string) => ({
          type: 'image',
          url: imageUrl,
          alt: post.alt,
        })),
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

  // Send rich push notifications with cosmic data and images
  try {
    const failedPosts = postResults.filter((r: any) => r.status === 'error');

    if (successCount > 0) {
      // Send preview notification with today's cosmic event and main image
      await sendAdminNotification(
        NotificationTemplates.dailyPreview(
          dateStr,
          posts.length,
          cosmicContent?.primaryEvent,
        ),
      );

      // Send success summary
      await sendAdminNotification(
        NotificationTemplates.cronSuccess(summary, posts),
      );
    } else {
      await sendAdminNotification(
        NotificationTemplates.cronFailure(
          'All daily posts failed to schedule',
          failedPosts,
        ),
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
          blogData.data?.planetaryHighlights || [],
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

// NOTIFICATION CHECK using PostgreSQL
async function runNotificationCheck(dateStr: string) {
  console.log(
    '🔔 Checking for significant astronomical events via PostgreSQL...',
  );

  const baseUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://lunary.app'
      : 'http://localhost:3000';

  try {
    // First, get the cosmic data to determine what notifications to send
    const cosmicResponse = await fetch(
      `${baseUrl}/api/og/cosmic-post/${dateStr}`,
      {
        headers: { 'User-Agent': 'Lunary-Notification-Service/1.0' },
      },
    );

    if (!cosmicResponse.ok) {
      throw new Error(`Failed to fetch cosmic data: ${cosmicResponse.status}`);
    }

    const cosmicData = await cosmicResponse.json();

    // Check if there are notification-worthy events
    const notificationEvents = getNotificationWorthyEvents(cosmicData);

    if (notificationEvents.length === 0) {
      console.log('📭 No notification-worthy events today');
      return {
        success: true,
        notificationsSent: 0,
        primaryEvent: cosmicData.primaryEvent?.name,
        message: 'No significant events to notify about',
      };
    }

    // Send each significant event via Jazz worker
    const results = [];
    let totalSent = 0;

    for (const event of notificationEvents) {
      try {
        const pgResponse = await fetch(`${baseUrl}/api/notifications/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CRON_SECRET}`,
          },
          body: JSON.stringify({
            payload: {
              type: event.type,
              title: event.title,
              body: event.body,
              data: {
                date: dateStr,
                eventName: event.name,
                priority: event.priority,
                eventType: event.type,
              },
            },
          }),
        });

        const pgResult = await pgResponse.json();
        totalSent += pgResult.recipientCount || 0;
        results.push(pgResult);
      } catch (eventError) {
        console.error(
          `Failed to send notification for event ${event.name}:`,
          eventError,
        );
        results.push({
          success: false,
          error:
            eventError instanceof Error ? eventError.message : 'Unknown error',
          eventName: event.name,
        });
      }
    }

    console.log(
      `✅ PostgreSQL notification check completed: ${totalSent} notifications sent`,
    );

    return {
      success: totalSent > 0,
      notificationsSent: totalSent,
      primaryEvent: cosmicData.primaryEvent?.name,
      results,
    };
  } catch (error) {
    console.error('❌ PostgreSQL notification check failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Helper function to identify notification-worthy events
function getNotificationWorthyEvents(cosmicData: any) {
  const events = [];

  // Check primary event
  if (
    cosmicData.primaryEvent &&
    isEventNotificationWorthy(cosmicData.primaryEvent)
  ) {
    events.push(createNotificationFromEvent(cosmicData.primaryEvent));
  }

  // Check secondary high-priority events
  if (cosmicData.allEvents) {
    const significantEvents = cosmicData.allEvents
      .filter(
        (event: any) =>
          event.priority >= 8 && event !== cosmicData.primaryEvent,
      )
      .slice(0, 2); // Limit to 2 additional notifications per day

    for (const event of significantEvents) {
      if (isEventNotificationWorthy(event)) {
        events.push(createNotificationFromEvent(event));
      }
    }
  }

  return events;
}

function isEventNotificationWorthy(event: any): boolean {
  // Only send notifications for significant events
  if (event.priority >= 9) return true; // Extraordinary planetary events

  // Moon phases (but not every day - only exact phases)
  if (event.type === 'moon' && event.priority === 10) {
    const significantPhases = [
      'New Moon',
      'Full Moon',
      'First Quarter',
      'Last Quarter',
    ];
    return significantPhases.some((phase) => event.name.includes(phase));
  }

  // Seasonal events (equinoxes, solstices, sabbats)
  if (event.priority === 8) return true;

  // Major aspects involving outer planets
  if (event.type === 'aspect' && event.priority >= 7) {
    const outerPlanets = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    return outerPlanets.some(
      (planet) =>
        event.name?.includes(planet) || event.description?.includes(planet),
    );
  }

  return false;
}

function createNotificationFromEvent(event: any) {
  const baseEvent = {
    name: event.name,
    type: event.type,
    priority: event.priority,
  };

  // Customize based on event type
  switch (event.type) {
    case 'moon':
      return {
        ...baseEvent,
        title: `${event.emoji || '🌙'} ${event.name}`,
        body: `${event.energy} - ${getPhaseGuidance(event.name)}`,
      };

    case 'aspect':
      return {
        ...baseEvent,
        title: `${getPlanetEmoji(event)} ${event.name}`,
        body: `${event.energy} - Powerful cosmic alignment forming`,
      };

    case 'seasonal':
      return {
        ...baseEvent,
        title: `🌿 ${event.name}`,
        body: `${event.energy} - Seasonal energy shift begins`,
      };

    case 'ingress':
      return {
        ...baseEvent,
        title: `${getPlanetEmoji(event)} ${event.name}`,
        body: `${event.energy} - New cosmic energy emerges`,
      };

    default:
      return {
        ...baseEvent,
        title: `✨ ${event.name}`,
        body: event.energy || 'Significant cosmic event occurring',
      };
  }
}

function getPhaseGuidance(phaseName: string): string {
  const guidance: Record<string, string> = {
    'New Moon': 'Perfect time for new beginnings and intention setting',
    'Full Moon': 'Time for release, gratitude, and manifestation',
    'First Quarter': 'Take action on your intentions and push forward',
    'Last Quarter': 'Release what no longer serves and reflect',
  };

  for (const [phase, message] of Object.entries(guidance)) {
    if (phaseName.includes(phase)) return message;
  }

  return 'Lunar energy shift occurring';
}

function getPlanetEmoji(event: any): string {
  const text = event.name || event.description || '';
  const emojis: Record<string, string> = {
    Mercury: '☿',
    Venus: '♀',
    Mars: '♂',
    Jupiter: '♃',
    Saturn: '♄',
    Uranus: '♅',
    Neptune: '♆',
    Pluto: '♇',
    Sun: '☉',
    Moon: '☽',
  };

  for (const [planet, emoji] of Object.entries(emojis)) {
    if (text.includes(planet)) return emoji;
  }

  return '⭐';
}

function getBaseUrl(request: NextRequest): string {
  return process.env.NODE_ENV === 'production'
    ? 'https://lunary.app'
    : request.nextUrl.origin;
}

// Dynamic content generators
function generateCosmicPost(
  cosmicContent: any,
  // crystalContent: any,
  // tarotContent: any,
): { snippet: string; snippetShort: string } {
  return {
    snippet: cosmicContent.snippet,
    snippetShort: cosmicContent.snippetShort,
  } as { snippet: string; snippetShort: string };
}
