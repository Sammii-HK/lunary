import { NextRequest, NextResponse } from 'next/server';
import {
  sendAdminNotification,
  NotificationTemplates,
  sendPushoverNotification,
} from '../../../../../utils/notifications/pushNotifications';
import {
  markEventsAsSent,
  cleanupOldDates,
} from '@/app/api/cron/shared-notification-tracker';
import { sql } from '@vercel/postgres';
import { sendEmail } from '@/lib/email';
import {
  generateTrialReminderEmailHTML,
  generateTrialReminderEmailText,
} from '@/lib/email-templates/trial-nurture';
import {
  generateTrialExpiredEmailHTML,
  generateTrialExpiredEmailText,
} from '@/lib/email-templates/trial-expired';

// Track if cron is already running to prevent duplicate execution
// Using a Map to track by date for better serverless resilience
const executionTracker = new Map<string, boolean>();

export async function GET(request: NextRequest) {
  try {
    // Verify cron request
    // Vercel cron jobs send x-vercel-cron header, allow those
    // Check both lowercase and any case variations
    const vercelCronHeader =
      request.headers.get('x-vercel-cron') ||
      request.headers.get('X-Vercel-Cron') ||
      request.headers.get('X-VERCEL-CRON');
    const isVercelCron =
      vercelCronHeader === '1' || vercelCronHeader === 'true';

    // Internal test calls from same origin (for manual testing)
    const isInternalTest =
      request.headers.get('x-internal-test') === 'true' &&
      request.headers.get('user-agent')?.includes('Manual-Test-Trigger');
    const authHeader =
      request.headers.get('authorization') ||
      request.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Log all headers for debugging (but don't log sensitive values)
    const allHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      // Only log first few chars of auth headers
      if (key.toLowerCase().includes('auth')) {
        allHeaders[key] = value.substring(0, 20) + '...';
      } else {
        allHeaders[key] = value;
      }
    });

    console.log('🔐 Auth check:', {
      isVercelCron,
      vercelCronHeader,
      isInternalTest,
      hasAuthHeader: !!authHeader,
      authHeaderLength: authHeader?.length || 0,
      cronSecretSet: !!cronSecret,
      cronSecretLength: cronSecret?.length || 0,
      userAgent: request.headers.get('user-agent'),
      allHeaders,
    });

    // If not from Vercel cron or internal test, require CRON_SECRET
    if (!isVercelCron && !isInternalTest) {
      // If CRON_SECRET is set, require it to match
      if (cronSecret) {
        const expectedAuth = `Bearer ${cronSecret.trim()}`;
        // Normalize both headers for comparison (trim whitespace)
        const normalizedAuthHeader = authHeader?.trim() || '';
        const normalizedExpected = expectedAuth.trim();

        console.log('🔐 Comparing auth:', {
          received: normalizedAuthHeader.substring(0, 30) + '...',
          expected: normalizedExpected.substring(0, 30) + '...',
          match: normalizedAuthHeader === normalizedExpected,
        });

        if (normalizedAuthHeader !== normalizedExpected) {
          console.error('❌ Authorization failed - returning 401 immediately');
          console.warn('⚠️ Authorization failed:', {
            hasAuthHeader: !!authHeader,
            authHeaderLength: authHeader?.length || 0,
            expectedLength: expectedAuth.length,
            cronSecretSet: !!cronSecret,
            authHeaderStart: authHeader?.substring(0, 30) || 'none',
            expectedStart: expectedAuth.substring(0, 30),
            headersMatch: normalizedAuthHeader === normalizedExpected,
          });
          return NextResponse.json(
            {
              error: 'Unauthorized',
              message:
                'Invalid or missing Authorization header. Ensure CRON_SECRET matches.',
            },
            { status: 401 },
          );
        }
        console.log('✅ Authorization successful - CRON_SECRET matched');
      } else {
        // If CRON_SECRET is not set, allow the request (for local development)
        const isProduction = process.env.NODE_ENV === 'production';
        if (isProduction) {
          console.error(
            '❌ CRON_SECRET not set in production - this should not happen',
          );
          return NextResponse.json(
            {
              error: 'Configuration error',
              message: 'CRON_SECRET must be set in production',
            },
            { status: 500 },
          );
        }
        console.warn(
          '⚠️ CRON_SECRET not set - allowing request (local dev mode)',
        );
      }
    } else if (isVercelCron) {
      console.log(
        '✅ Vercel cron detected - allowing request (x-vercel-cron header present)',
      );
    } else if (isInternalTest) {
      console.log('✅ Internal test call detected - allowing request');
    }

    console.log('✅ Auth check passed - proceeding with cron execution');

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

    // DAILY TASKS (Every day) - Push Notifications for Cosmic Events
    console.log('🔔 Checking for notification-worthy cosmic events...');
    try {
      const notificationResult = await runNotificationCheck(dateStr);
      cronResults.notifications = notificationResult;
    } catch (error) {
      console.error('❌ Notification check failed:', error);
      cronResults.notifications = {
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
      name: dateStr,
      content: generateCosmicPost(cosmicContent).snippet,
      platforms: ['reddit', 'pinterest'],
      imageUrls: [`${productionUrl}/api/og/cosmic/${dateStr}`],
      alt: `${cosmicContent.primaryEvent.name} - ${cosmicContent.primaryEvent.energy}. Daily cosmic guidance from lunary.app.`,
      scheduledDate: new Date(scheduleBase.getTime()).toISOString(),
      variants: {
        instagram: {
          media: [
            `${productionUrl}/api/og/cosmic/${dateStr}`,
            `${productionUrl}/api/og/crystal?date=${dateStr}`,
            `${productionUrl}/api/og/tarot?date=${dateStr}`,
            `${productionUrl}/api/og/moon?date=${dateStr}`,
            `${productionUrl}/api/og/horoscope?date=${dateStr}`,
          ],
        },
        x: {
          content: generateCosmicPost(cosmicContent).snippetShort.replace(
            /\n/g,
            ' ',
          ),
          media: [
            `${productionUrl}/api/og/cosmic/${dateStr}/landscape`,
            `${productionUrl}/api/og/crystal?date=${dateStr}&size=landscape`,
            `${productionUrl}/api/og/horoscope?date=${dateStr}&size=landscape`,
          ],
        },
        bluesky: {
          content: generateCosmicPost(cosmicContent).snippetShort,
          media: [
            `${productionUrl}/api/og/cosmic/${dateStr}`,
            `${productionUrl}/api/og/crystal?date=${dateStr}`,
            `${productionUrl}/api/og/tarot?date=${dateStr}`,
            `${productionUrl}/api/og/moon?date=${dateStr}`,
            `${productionUrl}/api/og/horoscope?date=${dateStr}`,
          ],
        },
      },
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
        name: post.name || `Cosmic Post ${dateStr}`,
        content: post.content,
        platforms: post.platforms,
        scheduledDate: post.scheduledDate,
        media: (post.imageUrls || []).map((imageUrl: string) => ({
          type: 'image',
          url: imageUrl,
          alt: post.alt,
        })),
        variants: post.variants,
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
      // Collect all image URLs from the post variants
      const allImageUrls: string[] = [];

      // Add main image URLs
      if (posts[0]?.imageUrls) {
        posts[0].imageUrls.forEach((url: string) => {
          if (!allImageUrls.includes(url)) {
            allImageUrls.push(url);
          }
        });
      }

      // Get post content snippet
      const postContent =
        posts[0]?.content || generateCosmicPost(cosmicContent).snippet;

      // Send one notification for daily posts with all images and content
      await sendAdminNotification(
        NotificationTemplates.dailyPreview(
          dateStr,
          posts.length,
          cosmicContent?.primaryEvent,
          postContent,
          allImageUrls,
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

    // 3. Generate social media posts for the week ahead (7 days in advance)
    console.log(
      '📱 Generating social media posts for the week ahead (7 days in advance)...',
    );
    let socialPostsResult = null;
    try {
      // Calculate the week that starts 7 days from now
      // This ensures posts are always generated exactly 7 days in advance
      const today = new Date();
      const weekAheadDate = new Date(today);
      weekAheadDate.setDate(today.getDate() + 7);

      console.log(
        `📅 Generating posts for week starting: ${weekAheadDate.toISOString()}`,
      );

      const socialPostsResponse = await fetch(
        `${baseUrl}/api/admin/social-posts/generate-weekly`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Lunary-Master-Cron/1.0',
          },
          body: JSON.stringify({
            weekStart: weekAheadDate.toISOString(),
          }),
        },
      );

      if (socialPostsResponse.ok) {
        socialPostsResult = await socialPostsResponse.json();
        console.log(
          `✅ Generated ${socialPostsResult.savedIds?.length || 0} social media posts for next week`,
        );
      } else {
        console.error(
          '❌ Social posts generation failed:',
          socialPostsResponse.status,
        );
      }
    } catch (socialPostsError) {
      console.error('❌ Social posts generation error:', socialPostsError);
    }

    // Generate blog preview image URL (use first day of the week)
    const weekStartDate = blogData.data?.weekStart
      ? new Date(blogData.data.weekStart).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    const blogPreviewUrl = `${baseUrl}/api/og/cosmic/${weekStartDate}`;

    // Send push notification for weekly content with blog preview
    try {
      await sendAdminNotification(
        NotificationTemplates.weeklyContentGenerated(
          blogData.data?.title || 'Weekly Content',
          blogData.data?.weekNumber || 0,
          blogData.data?.planetaryHighlights || [],
          blogPreviewUrl,
        ),
      );
      console.log('✅ Weekly blog notification sent with preview image');
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
      socialPosts: socialPostsResult
        ? {
            generated: socialPostsResult.savedIds?.length || 0,
            weekRange: socialPostsResult.weekRange,
          }
        : null,
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
        eventsSent: [],
      };
    }

    // Send each significant event via Jazz worker
    // Schedule notifications throughout the day instead of all at once
    const results = [];
    let totalSent = 0;
    const eventsToTrack: Array<{
      key: string;
      type: string;
      name: string;
      priority: number;
    }> = [];

    // Daily cron should only send ONE notification - the most important event
    // The 4-hourly cron will handle sending additional events throughout the day
    const sortedEvents = [...notificationEvents].sort((a, b) => {
      if (a.type === 'retrograde' && b.type !== 'retrograde') return -1;
      if (a.type !== 'retrograde' && b.type === 'retrograde') return 1;
      return (b.priority || 0) - (a.priority || 0);
    });

    // Only send the top priority event from daily cron
    const eventToSend = sortedEvents[0];

    if (eventToSend) {
      try {
        const eventKey = `${eventToSend.type}-${eventToSend.name}-${eventToSend.priority}`;

        // Map event type to notification type format
        const getNotificationType = (type: string): string => {
          const mapping: Record<string, string> = {
            moon: 'moon_phase',
            aspect: 'major_aspect',
            ingress: 'planetary_transit',
            seasonal: 'sabbat',
            retrograde: 'retrograde',
          };
          return mapping[type] || 'moon_phase';
        };

        // Create notification with improved descriptions
        const notification = createNotificationFromEvent(
          eventToSend,
          cosmicData,
        );

        const pgResponse = await fetch(`${baseUrl}/api/notifications/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CRON_SECRET}`,
          },
          body: JSON.stringify({
            payload: {
              type: getNotificationType(eventToSend.type),
              title: notification.title,
              body: notification.body,
              data: {
                date: dateStr,
                eventName: eventToSend.name,
                priority: eventToSend.priority,
                eventType: eventToSend.type,
                checkType: 'daily',
              },
            },
          }),
        });

        const pgResult = await pgResponse.json();
        totalSent += pgResult.recipientCount || 0;
        results.push(pgResult);

        // Track this event to mark as sent (will be marked in shared tracker below)
        eventsToTrack.push({
          key: eventKey,
          type: eventToSend.type,
          name: eventToSend.name,
          priority: eventToSend.priority,
        });
      } catch (eventError) {
        console.error(
          `Failed to send notification for event ${eventToSend.name}:`,
          eventError,
        );
        results.push({
          success: false,
          error:
            eventError instanceof Error ? eventError.message : 'Unknown error',
          eventName: eventToSend.name,
        });
      }
    }

    console.log(
      `✅ PostgreSQL notification check completed: ${totalSent} notifications sent`,
    );

    // Mark all events as sent in shared tracker (database)
    await markEventsAsSent(dateStr, eventsToTrack, 'daily');

    // Cleanup old tracking data (only keep today + 1 day buffer)
    await cleanupOldDates(1);

    // Send weekly conversion digest on Mondays
    const today = new Date();
    const isMonday = today.getDay() === 1;

    if (isMonday) {
      try {
        const last7Days = await sql`
          SELECT 
            COUNT(DISTINCT CASE WHEN event_type = 'signup' THEN user_id END) as signups,
            COUNT(DISTINCT CASE WHEN event_type = 'trial_started' THEN user_id END) as trials,
            COUNT(DISTINCT CASE WHEN event_type IN ('trial_converted', 'subscription_started') THEN user_id END) as conversions
          FROM conversion_events
          WHERE created_at >= NOW() - INTERVAL '7 days'
        `;

        const last30Days = await sql`
          SELECT 
            COUNT(DISTINCT CASE WHEN event_type = 'signup' THEN user_id END) as signups,
            COUNT(DISTINCT CASE WHEN event_type = 'trial_started' THEN user_id END) as trials,
            COUNT(DISTINCT CASE WHEN event_type IN ('trial_converted', 'subscription_started') THEN user_id END) as conversions
          FROM conversion_events
          WHERE created_at >= NOW() - INTERVAL '30 days'
        `;

        const weekly = last7Days.rows[0];
        const monthly = last30Days.rows[0];

        const weeklySignups = parseInt(weekly?.signups || '0');
        const weeklyTrials = parseInt(weekly?.trials || '0');
        const weeklyConversions = parseInt(weekly?.conversions || '0');
        const monthlySignups = parseInt(monthly?.signups || '0');
        const monthlyTrials = parseInt(monthly?.trials || '0');
        const monthlyConversions = parseInt(monthly?.conversions || '0');

        const monthlySubscriptions = await sql`
          SELECT COUNT(DISTINCT user_id) as count
          FROM conversion_events
          WHERE event_type IN ('subscription_started', 'trial_converted')
            AND plan_type = 'monthly'
            AND created_at >= NOW() - INTERVAL '30 days'
        `;

        const yearlySubscriptions = await sql`
          SELECT COUNT(DISTINCT user_id) as count
          FROM conversion_events
          WHERE event_type IN ('subscription_started', 'trial_converted')
            AND plan_type = 'yearly'
            AND created_at >= NOW() - INTERVAL '30 days'
        `;

        const monthlyCount = parseInt(
          monthlySubscriptions.rows[0]?.count || '0',
        );
        const yearlyCount = parseInt(yearlySubscriptions.rows[0]?.count || '0');
        const mrr = monthlyCount * 4.99 + (yearlyCount * 39.99) / 12;

        const conversionRate =
          monthlySignups > 0 ? (monthlyConversions / monthlySignups) * 100 : 0;
        const trialConversionRate =
          monthlyTrials > 0 ? (monthlyConversions / monthlyTrials) * 100 : 0;

        const baseUrl =
          process.env.NODE_ENV === 'production'
            ? 'https://lunary.app'
            : 'http://localhost:3000';

        await sendPushoverNotification({
          title: '📊 Weekly Conversion Digest',
          message: `This Week:
• ${weeklySignups} signups
• ${weeklyTrials} trials started
• ${weeklyConversions} conversions

Last 30 Days:
• ${monthlySignups} total signups
• ${monthlyTrials} trials
• ${monthlyConversions} conversions
• ${conversionRate.toFixed(1)}% conversion rate
• ${trialConversionRate.toFixed(1)}% trial conversion
• $${mrr.toFixed(2)} MRR`,
          priority: 'normal',
          sound: 'default',
          url: `${baseUrl}/admin/analytics`,
        });

        console.log('✅ Weekly conversion digest sent');
      } catch (digestError) {
        console.error('❌ Failed to send weekly digest:', digestError);
      }
    }

    // Send trial reminder emails (3 days and 1 day before trial ends)
    try {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      const oneDayFromNow = new Date();
      oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

      // Get trials ending in 3 days (first reminder)
      const threeDayReminders = await sql`
        SELECT DISTINCT
          p.user_id,
          p.email,
          p.name,
          s.trial_ends_at,
          s.plan_type
        FROM user_profiles p
        JOIN subscriptions s ON p.user_id = s.user_id
        WHERE s.status = 'trial'
        AND s.trial_ends_at::date = ${threeDaysFromNow.toISOString().split('T')[0]}
        AND (s.trial_reminder_3d_sent = false OR s.trial_reminder_3d_sent IS NULL)
      `;

      // Get trials ending in 1 day (final reminder)
      const oneDayReminders = await sql`
        SELECT DISTINCT
          p.user_id,
          p.email,
          p.name,
          s.trial_ends_at,
          s.plan_type
        FROM user_profiles p
        JOIN subscriptions s ON p.user_id = s.user_id
        WHERE s.status = 'trial'
        AND s.trial_ends_at::date = ${oneDayFromNow.toISOString().split('T')[0]}
        AND (s.trial_reminder_1d_sent = false OR s.trial_reminder_1d_sent IS NULL)
      `;

      let sent3Day = 0;
      let sent1Day = 0;

      // Send 3-day reminders
      for (const user of threeDayReminders.rows) {
        try {
          const trialEnd = new Date(user.trial_ends_at);
          const daysRemaining = Math.ceil(
            (trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
          );

          const html = generateTrialReminderEmailHTML(
            user.name || 'there',
            daysRemaining,
          );
          const text = generateTrialReminderEmailText(
            user.name || 'there',
            daysRemaining,
          );

          await sendEmail({
            to: user.email,
            subject: `⏰ ${daysRemaining} Days Left in Your Trial - Lunary`,
            html,
            text,
          });

          // Mark as sent (using Jazz profile for now, will migrate to PostgreSQL)
          await sql`
            UPDATE subscriptions
            SET trial_reminder_3d_sent = true
            WHERE user_id = ${user.user_id}
            AND status = 'trial'
          `;

          sent3Day++;
        } catch (error) {
          console.error(
            `Failed to send 3-day reminder to ${user.email}:`,
            error,
          );
        }
      }

      // Send 1-day reminders
      for (const user of oneDayReminders.rows) {
        try {
          const trialEnd = new Date(user.trial_ends_at);
          const daysRemaining = Math.ceil(
            (trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
          );

          const html = generateTrialReminderEmailHTML(
            user.name || 'there',
            daysRemaining,
          );
          const text = generateTrialReminderEmailText(
            user.name || 'there',
            daysRemaining,
          );

          await sendEmail({
            to: user.email,
            subject: `⏰ Last Day! Your Trial Ends Tomorrow - Lunary`,
            html,
            text,
          });

          // Mark as sent
          await sql`
            UPDATE subscriptions
            SET trial_reminder_1d_sent = true
            WHERE user_id = ${user.user_id}
            AND status = 'trial'
          `;

          sent1Day++;
        } catch (error) {
          console.error(
            `Failed to send 1-day reminder to ${user.email}:`,
            error,
          );
        }
      }

      if (sent3Day > 0 || sent1Day > 0) {
        console.log(
          `✅ Sent ${sent3Day} three-day reminders and ${sent1Day} one-day reminders`,
        );
      }

      // Send trial expired emails (trials that ended yesterday)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const expiredTrials = await sql`
        SELECT DISTINCT
          p.user_id,
          p.email,
          p.name,
          s.trial_ends_at
        FROM user_profiles p
        JOIN subscriptions s ON p.user_id = s.user_id
        WHERE s.status = 'trial'
        AND s.trial_ends_at::date = ${yesterday.toISOString().split('T')[0]}
        AND (s.trial_expired_email_sent = false OR s.trial_expired_email_sent IS NULL)
      `;

      let sentExpired = 0;
      for (const user of expiredTrials.rows) {
        try {
          const trialEnd = new Date(user.trial_ends_at);
          const daysSince = Math.floor(
            (Date.now() - trialEnd.getTime()) / (1000 * 60 * 60 * 24),
          );
          const missedInsights = Math.max(1, daysSince);

          const html = generateTrialExpiredEmailHTML(
            user.name || 'there',
            missedInsights,
          );
          const text = generateTrialExpiredEmailText(
            user.name || 'there',
            missedInsights,
          );

          await sendEmail({
            to: user.email,
            subject: `🌙 Your Trial Has Ended - ${missedInsights} Insights Waiting`,
            html,
            text,
          });

          // Mark as sent and update status
          await sql`
            UPDATE subscriptions
            SET 
              trial_expired_email_sent = true,
              status = 'cancelled'
            WHERE user_id = ${user.user_id}
            AND status = 'trial'
          `;

          // Track trial expired event
          try {
            await fetch(
              `${process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app'}/api/analytics/conversion`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  event: 'trial_expired',
                  userId: user.user_id,
                  userEmail: user.email,
                  metadata: { missedInsights },
                }),
              },
            );
          } catch (trackError) {
            console.error('Failed to track trial expired:', trackError);
          }

          sentExpired++;
        } catch (error) {
          console.error(
            `Failed to send expired email to ${user.email}:`,
            error,
          );
        }
      }

      if (sentExpired > 0) {
        console.log(`✅ Sent ${sentExpired} trial expired emails`);
      }
    } catch (trialReminderError) {
      console.error('❌ Failed to send trial reminders:', trialReminderError);
    }

    return {
      success: totalSent > 0,
      notificationsSent: totalSent,
      primaryEvent: cosmicData.primaryEvent?.name,
      eventsSent: eventsToTrack.map((e) => e.key),
      eventsSentCount: eventsToTrack.length,
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
  const events: any[] = [];

  // Build allEvents array from available data (same as admin page)
  const allEvents: any[] = [];

  // Get primary event with full metadata
  const primaryEventType =
    cosmicData.astronomicalData?.primaryEvent?.type || 'unknown';
  const primaryEventPriority =
    cosmicData.astronomicalData?.primaryEvent?.priority || 0;

  if (cosmicData.primaryEvent) {
    allEvents.push({
      name: cosmicData.primaryEvent.name,
      energy: cosmicData.primaryEvent.energy,
      type: primaryEventType,
      priority: primaryEventPriority,
      ...cosmicData.astronomicalData?.primaryEvent,
    });
  }

  // Add aspect events
  if (cosmicData.aspectEvents && Array.isArray(cosmicData.aspectEvents)) {
    allEvents.push(
      ...cosmicData.aspectEvents.map((event: any) => ({
        ...event,
        type: event.type || 'aspect',
      })),
    );
  }

  // Add ingress events
  if (cosmicData.ingressEvents && Array.isArray(cosmicData.ingressEvents)) {
    allEvents.push(
      ...cosmicData.ingressEvents.map((event: any) => ({
        ...event,
        type: event.type || 'ingress',
        priority: event.priority || 4,
      })),
    );
  }

  // Add seasonal events
  if (cosmicData.seasonalEvents && Array.isArray(cosmicData.seasonalEvents)) {
    allEvents.push(
      ...cosmicData.seasonalEvents.map((event: any) => ({
        ...event,
        type: event.type || 'seasonal',
        priority: event.priority || 8,
      })),
    );
  }

  // Add retrograde events
  if (
    cosmicData.retrogradeEvents &&
    Array.isArray(cosmicData.retrogradeEvents)
  ) {
    allEvents.push(
      ...cosmicData.retrogradeEvents.map((event: any) => ({
        ...event,
        type: event.type || 'retrograde',
        priority: event.priority || 6,
      })),
    );
  }

  // Add retrograde ingress events
  if (
    cosmicData.retrogradeIngress &&
    Array.isArray(cosmicData.retrogradeIngress)
  ) {
    allEvents.push(
      ...cosmicData.retrogradeIngress.map((event: any) => ({
        ...event,
        type: event.type || 'retrograde',
        priority: event.priority || 6,
      })),
    );
  }

  // Sort by priority
  allEvents.sort((a, b) => (b.priority || 0) - (a.priority || 0));

  // Get notification-worthy events
  const notificationWorthyEvents = allEvents.filter((event: any) => {
    return isEventNotificationWorthy(event);
  });

  // Create notification objects for up to 5 most significant events
  const eventsToSend = notificationWorthyEvents.slice(0, 5);

  for (const event of eventsToSend) {
    events.push(createNotificationFromEvent(event));
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

function createNotificationFromEvent(event: any, cosmicData?: any) {
  const baseEvent = {
    name: event.name,
    type: event.type,
    priority: event.priority,
  };

  // Create descriptive titles without emojis
  const createNotificationTitle = (event: any) => {
    const eventName = event.name || 'Cosmic Event';

    switch (event.type) {
      case 'moon':
        return eventName;

      case 'aspect':
        if (event.planetA && event.planetB && event.aspect) {
          const planetAName = event.planetA.name || event.planetA;
          const planetBName = event.planetB.name || event.planetB;
          const aspectName =
            event.aspect.charAt(0).toUpperCase() + event.aspect.slice(1);
          return `${planetAName}-${planetBName} ${aspectName}`;
        }
        return eventName || 'Planetary Aspect';

      case 'seasonal':
        return eventName;

      case 'ingress':
        if (event.planet && event.sign) {
          return `${event.planet} Enters ${event.sign}`;
        }
        return eventName || 'Planetary Ingress';

      case 'retrograde':
        if (event.planet) {
          return `${event.planet} Retrograde Begins`;
        }
        return eventName || 'Planetary Retrograde';

      default:
        return eventName || 'Cosmic Event';
    }
  };

  const createNotificationBody = (event: any) => {
    let body = '';
    switch (event.type) {
      case 'moon':
        body = getMoonPhaseDescription(event.name, cosmicData);
        break;

      case 'aspect':
        body = getAspectDescription(event);
        break;

      case 'seasonal':
        body = getSeasonalDescription(event.name);
        break;

      case 'ingress':
        body = getIngressDescription(event.planet, event.sign);
        break;

      case 'retrograde':
        body = getRetrogradeDescription(event.planet, event.sign);
        break;

      default:
        body = 'Significant cosmic energy shift occurring';
    }

    return body;
  };

  const getMoonPhaseDescription = (
    phaseName: string,
    cosmicData?: any,
  ): string => {
    // Get moon constellation from cosmic data
    const moonSign = cosmicData?.astronomicalData?.planets?.moon?.sign;

    // Import constellations dynamically
    const constellations: Record<string, any> = {
      aries: {
        name: 'Aries',
        information:
          'Aries is known for its courage, initiative, and leadership. This is a time to take bold actions, start new projects, and assert yourself confidently.',
      },
      taurus: {
        name: 'Taurus',
        information:
          "Taurus emphasizes stability, security, and sensuality. It's a time to build solid foundations, enjoy life's pleasures, and value consistency.",
      },
      gemini: {
        name: 'Gemini',
        information:
          'Gemini is characterized by adaptability, communication, and intellect. This is a time to explore new ideas, connect with others, and stay curious.',
      },
      cancer: {
        name: 'Cancer',
        information:
          "Cancer is associated with nurturing, emotion, and home. It's a time to care for yourself and loved ones, create a cozy home environment, and honor your feelings.",
      },
      leo: {
        name: 'Leo',
        information:
          'Leo shines with creativity, confidence, and generosity. This is a time to express your talents, lead with confidence, and give generously.',
      },
      virgo: {
        name: 'Virgo',
        information:
          "Virgo values analysis, perfection, and service. It's a time to focus on details, improve your skills, and be of service to others.",
      },
      libra: {
        name: 'Libra',
        information:
          'Libra seeks balance, harmony, and relationships. This is a time to cultivate partnerships, seek fairness, and create beauty.',
      },
      scorpio: {
        name: 'Scorpio',
        information:
          "Scorpio is known for its intensity, transformation, and mystery. It's a time to delve deep into your psyche, embrace change, and explore hidden truths.",
      },
      sagittarius: {
        name: 'Sagittarius',
        information:
          'Sagittarius is adventurous, philosophical, and freedom-loving. This is a time to broaden your horizons, seek truth, and embrace new experiences.',
      },
      capricorn: {
        name: 'Capricorn',
        information:
          "Capricorn emphasizes ambition, discipline, and practicality. It's a time to set long-term goals, work hard, and stay focused on your ambitions.",
      },
      aquarius: {
        name: 'Aquarius',
        information:
          'Aquarius is innovative, individualistic, and humanitarian. This is a time to embrace your unique qualities, think outside the box, and contribute to the greater good.',
      },
      pisces: {
        name: 'Pisces',
        information:
          "Pisces is compassionate, imaginative, and spiritual. It's a time to connect with your inner self, explore your creativity, and show empathy to others.",
      },
    };

    const descriptions: Record<string, string> = {
      'New Moon':
        'A powerful reset point for manifestation and new beginnings. Set intentions aligned with your deeper purpose.',
      'Full Moon':
        'Peak illumination brings clarity to accomplishments and reveals areas ready for release and transformation.',
      'First Quarter':
        'A critical decision point supporting decisive action and breakthrough moments.',
      'Last Quarter':
        'A time for reflection, release, and preparing for the next lunar cycle.',
    };

    let description = '';
    for (const [phase, phaseDesc] of Object.entries(descriptions)) {
      if (phaseName.includes(phase)) {
        description = phaseDesc;
        break;
      }
    }

    if (!description) {
      description = 'Lunar energy shift creating new opportunities for growth';
    }

    // Add moon constellation info if available
    if (moonSign) {
      const constellationKey =
        moonSign.toLowerCase() as keyof typeof constellations;
      const constellation = constellations[constellationKey];
      if (constellation) {
        return `Moon enters ${constellation.name}: ${constellation.information} ${description}`;
      }
      return `Moon in ${moonSign}: ${description}`;
    }

    return description;
  };

  const getIngressDescription = (planet: string, sign: string): string => {
    // Use the same influence mappings as horoscope code for consistency
    const planetInfluences: Record<string, Record<string, string>> = {
      Mars: {
        Aries: 'action, courage, and pioneering initiative',
        Taurus: 'stability, patience, and material progress',
        Gemini: 'communication, learning, and mental agility',
        Cancer: 'emotional security and nurturing actions',
        Leo: 'creative expression and confident leadership',
        Virgo: 'precision and disciplined action in work and health',
        Libra: 'balance in partnerships and harmonious action',
        Scorpio: 'transformation and deep emotional focus',
        Sagittarius: 'adventure and philosophical exploration',
        Capricorn: 'structured ambition and long-term goals',
        Aquarius: 'innovation and revolutionary change',
        Pisces: 'intuitive action and compassionate service',
      },
      Venus: {
        Aries: 'passionate attraction and bold romance',
        Taurus: 'sensuality, stability, and material beauty',
        Gemini: 'lighthearted connections and intellectual attraction',
        Cancer: 'emotional bonds and nurturing love',
        Leo: 'dramatic romance and creative expression',
        Virgo: 'practical love and service in relationships',
        Libra: 'partnerships and artistic beauty',
        Scorpio: 'transformative love and deep connections',
        Sagittarius: 'adventurous romance and philosophical bonds',
        Capricorn: 'committed, structured relationships',
        Aquarius: 'unconventional connections and friendly love',
        Pisces: 'dreamy romance and spiritual connection',
      },
      Mercury: {
        Aries: 'directness and pioneering ideas',
        Taurus: 'practicality and grounded wisdom',
        Gemini: 'mental agility, communication, and learning',
        Cancer: 'emotional intelligence and intuition',
        Leo: 'confidence and creative expression',
        Virgo: 'precision and analytical clarity',
        Libra: 'harmony and balanced dialogue',
        Scorpio: 'deep, transformative conversations',
        Sagittarius: 'philosophical discourse and exploration',
        Capricorn: 'practical achievement through communication',
        Aquarius: 'unconventional ideas and technology',
        Pisces: 'intuitive understanding and artistic expression',
      },
      Jupiter: {
        Aries: 'leadership and pioneering ventures',
        Taurus: 'financial growth and material abundance',
        Gemini: 'learning, communication, and short-distance travel',
        Cancer: 'home, family, and emotional security',
        Leo: 'creativity, entertainment, and self-expression',
        Virgo: 'health, work, and service to others',
        Libra: 'partnerships, justice, and artistic pursuits',
        Scorpio: 'transformation, research, and shared resources',
        Sagittarius: 'higher education, philosophy, and long-distance travel',
        Capricorn: 'career recognition and public achievement',
        Aquarius: 'friendship and humanitarian causes',
        Pisces: 'spirituality, compassion, and artistic inspiration',
      },
      Saturn: {
        Aries: 'discipline in personal expression and independence',
        Taurus: 'structure in material values and financial stability',
        Gemini: 'responsibility in communication and learning',
        Cancer: 'structure in emotional security and family',
        Leo: 'discipline in creative expression and leadership',
        Virgo: 'structure in work methods and health routines',
        Libra: 'commitment in partnerships and relationships',
        Scorpio: 'transformation through power structures and healing',
        Sagittarius: 'structure in belief systems and education',
        Capricorn: 'authority and institutional achievement',
        Aquarius: 'structured social change',
        Pisces: 'discipline in spiritual practice',
      },
      Uranus: {
        Aries: 'personal independence and pioneering spirit',
        Taurus: 'material values and earth-conscious innovation',
        Gemini: 'communication technology and mental liberation',
        Cancer: 'family structures and emotional freedom',
        Leo: 'creative expression and individual uniqueness',
        Virgo: 'work methods and health innovations',
        Libra: 'relationship patterns and social justice',
        Scorpio: 'power structures and transformational healing',
        Sagittarius: 'belief systems and educational reform',
        Capricorn: 'authority structures and institutional change',
        Aquarius: 'collective consciousness and technological advancement',
        Pisces: 'spiritual awakening and artistic inspiration',
      },
      Neptune: {
        Aries: 'spiritual leadership and intuitive action',
        Taurus: 'material attachment and earth spirituality',
        Gemini: 'intuitive communication and mental clarity',
        Cancer: 'emotional boundaries and family mysticism',
        Leo: 'creative expression and heart-centered art',
        Virgo: 'service and practical spirituality',
        Libra: 'relationship ideals and artistic beauty',
        Scorpio: 'hidden truths and mystical transformation',
        Sagittarius: 'spiritual seeking and higher knowledge',
        Capricorn:
          'transcendence of material illusions with spiritual authority',
        Aquarius: 'collective dreams and humanitarian vision',
        Pisces: 'universal compassion and divine connection',
      },
      Pluto: {
        Aries: 'personal power and individual transformation',
        Taurus: 'material values and resource transformation',
        Gemini: 'communication power and mental transformation',
        Cancer: 'emotional depth and family transformation',
        Leo: 'creative power and self-expression transformation',
        Virgo: 'work and health transformation',
        Libra: 'relationship power and social transformation',
        Scorpio: 'deep psychological and spiritual transformation',
        Sagittarius: 'belief systems and educational transformation',
        Capricorn: 'power structures and institutional transformation',
        Aquarius: 'collective consciousness and technological transformation',
        Pisces: 'spiritual evolution and universal consciousness',
      },
    };

    const influence = planetInfluences[planet]?.[sign];
    if (influence) {
      return `This amplifies focus on ${influence} energies`;
    }

    return `This amplifies focus on ${sign} themes and energies`;
  };

  const getAspectDescription = (event: any): string => {
    if (!event.aspect) {
      return 'Powerful cosmic alignment creating new opportunities';
    }

    const planetA = event.planetA?.name || event.planetA;
    const planetB = event.planetB?.name || event.planetB;
    const signA = event.planetA?.constellation || event.signA;
    const signB = event.planetB?.constellation || event.signB;

    const aspectDescriptions: Record<string, string> = {
      conjunction: 'unite their energies',
      trine: 'flow harmoniously together',
      square: 'create dynamic tension',
      sextile: 'offer cooperative opportunities',
      opposition: 'seek balance between',
    };

    const aspectAction = aspectDescriptions[event.aspect] || 'align';
    const signDescription = signA || 'cosmic';

    if (planetA && planetB) {
      if (signA && signB) {
        return `${planetA} and ${planetB} ${aspectAction}, amplifying ${signDescription} energy and creating new possibilities`;
      }
      return `${planetA} and ${planetB} ${aspectAction}, creating powerful cosmic influence`;
    }

    return 'Planetary alignment forming with significant influence';
  };

  const getSeasonalDescription = (eventName: string): string => {
    if (eventName.includes('Equinox')) {
      return 'Equal day and night mark a powerful balance point, supporting new beginnings and equilibrium';
    }
    if (eventName.includes('Solstice')) {
      return 'Peak daylight or darkness marks a turning point, supporting reflection and seasonal transition';
    }
    return 'Seasonal energy shift brings new themes and opportunities for growth';
  };

  const getRetrogradeDescription = (planet: string, sign?: string): string => {
    const retrogradeMeanings: Record<string, string> = {
      Mercury:
        'invites reflection on communication, technology, and mental patterns',
      Venus:
        'encourages review of relationships, values, and what brings beauty',
      Mars: 'suggests revisiting action, motivation, and how we channel energy',
      Jupiter:
        'invites reflection on expansion, growth, and philosophical beliefs',
      Saturn:
        'encourages review of structures, responsibilities, and long-term goals',
      Uranus:
        'brings revolutionary reflection on change, innovation, and freedom',
      Neptune:
        'invites reflection on dreams, intuition, and spiritual connection',
      Pluto: 'encourages deep transformation through shadow work and renewal',
    };

    const meaning =
      retrogradeMeanings[planet] || 'invites reflection and review';

    // Since we can't easily get exact retrograde timing, use "starts retrograde today"
    const baseMessage = `This ${meaning}`;
    if (sign) {
      return `${baseMessage} in ${sign}. Starts retrograde today`;
    }
    return `${baseMessage}. Starts retrograde today`;
  };

  return {
    ...baseEvent,
    title: createNotificationTitle(event),
    body: createNotificationBody(event),
  };
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
