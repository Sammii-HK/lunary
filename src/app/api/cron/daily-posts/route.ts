import { NextRequest, NextResponse } from 'next/server';
import { NotificationTemplates } from '../../../../../utils/notifications/pushNotifications';
import { sendDiscordAdminNotification } from '@/lib/discord';
import { cleanupOldDates } from '@/app/api/cron/shared-notification-tracker';
import {
  sendUnifiedNotification,
  NotificationEvent,
} from '@/lib/notifications/unified-service';
import { sql } from '@vercel/postgres';
import { sendEmail } from '@/lib/email';
import { formatDate } from '@/lib/analytics/date-range';
import {
  generateTrialReminderEmailHTML,
  generateTrialReminderEmailText,
} from '@/lib/email-templates/trial-nurture';
import {
  generateTrialExpiredEmailHTML,
  generateTrialExpiredEmailText,
} from '@/lib/email-templates/trial-expired';
import { generateCatchyQuote } from '@/lib/social/quote-generator';
import { generateMoonCircle } from '@/lib/moon-circles/generator';
import { generateWeeklyReport } from '@/lib/cosmic-snapshot/reports';
import {
  generateWeeklyReportEmailHTML,
  generateWeeklyReportEmailText,
} from '@/lib/weekly-report/email-template';
import webpush from 'web-push';
import {
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
  checkSeasonalEvents,
  calculateRealAspects,
  checkRetrogradeEvents,
} from '../../../../../utils/astrology/cosmic-og';
import {
  getAllPlatformHashtags,
  CosmicContext,
} from '../../../../../utils/hashtags';

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

    if (!isVercelCron && !isInternalTest) {
      if (!cronSecret) {
        console.error('❌ CRON_SECRET not set - configuration error');
        return NextResponse.json(
          {
            error: 'Configuration error',
            message: 'CRON_SECRET must be set',
          },
          { status: 500 },
        );
      }

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
    }

    console.log('✅ Auth check passed - proceeding with cron execution');

    // Calculate target date: create posts for tomorrow (run the day before at 2 PM)
    const now = new Date();
    const tomorrowDate = new Date(now);
    tomorrowDate.setUTCDate(tomorrowDate.getUTCDate() + 1);
    const targetDateStr = tomorrowDate.toISOString().split('T')[0];
    const dailyPostsKey = `daily-posts-${targetDateStr}`;

    try {
      const gateResult = await sql`
        INSERT INTO notification_sent_events (date, event_key, event_type, event_name, event_priority, sent_by)
        VALUES (${targetDateStr}::date, ${dailyPostsKey}, 'daily_posts', 'Daily Posts', 1, 'cron')
        ON CONFLICT (date, event_key) DO NOTHING
        RETURNING id
      `;

      if (gateResult.rows.length === 0) {
        console.log(
          `⚠️ Daily posts already generated for ${targetDateStr}, skipping duplicate execution`,
        );
        return NextResponse.json({
          success: false,
          message: `Already executed for target date (${targetDateStr})`,
          skipped: true,
        });
      }
    } catch (error: any) {
      if (error?.code === '42P01') {
        console.warn(
          'notification_sent_events table missing; proceeding without DB dedupe',
        );
      } else {
        throw error;
      }
    }

    // Atomic check-and-set: Prevent duplicate execution for the same target date
    // This works better in serverless than separate checks
    if (executionTracker.has(targetDateStr)) {
      console.log(
        `⚠️ Cron already executed for target date (${targetDateStr}), skipping duplicate execution`,
      );
      return NextResponse.json({
        success: false,
        message: `Already executed for target date (${targetDateStr})`,
        skipped: true,
      });
    }

    // Immediately mark as executing for this target date (atomic operation)
    executionTracker.set(targetDateStr, true);

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
    console.log(`📅 Creating posts for tomorrow: ${targetDateStr}`);

    const todayDate = new Date();
    const dayOfWeek = todayDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayOfMonth = todayDate.getDate();
    const month = todayDate.getMonth() + 1;
    const dateStr = targetDateStr; // Use tomorrow's date for post creation

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
    const dailyPostsStartTime = Date.now();
    try {
      const { logActivity } = await import('@/lib/admin-activity');
      await logActivity({
        activityType: 'cron_execution',
        activityCategory: 'content',
        status: 'pending',
        message: `Starting daily posts generation for ${dateStr}`,
        metadata: { targetDate: dateStr },
      });

      const dailyResult = await runDailyPosts(dateStr);
      const executionTime = Date.now() - dailyPostsStartTime;

      await logActivity({
        activityType: 'cron_execution',
        activityCategory: 'content',
        status: dailyResult.success ? 'success' : 'failed',
        message: dailyResult.message || `Daily posts completed for ${dateStr}`,
        metadata: {
          targetDate: dateStr,
          summary: dailyResult.summary,
          results: dailyResult.results,
        },
        errorMessage: dailyResult.success ? undefined : dailyResult.message,
        executionTimeMs: executionTime,
      });

      cronResults.dailyPosts = dailyResult;
    } catch (error) {
      const executionTime = Date.now() - dailyPostsStartTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      console.error('❌ Daily posts failed:', error);

      try {
        const { logActivity } = await import('@/lib/admin-activity');
        await logActivity({
          activityType: 'cron_execution',
          activityCategory: 'content',
          status: 'failed',
          message: `Daily posts failed for ${dateStr}`,
          metadata: {
            targetDate: dateStr,
            errorType:
              error instanceof Error ? error.constructor.name : 'Unknown',
            errorStack,
          },
          errorMessage,
          executionTimeMs: executionTime,
        });
      } catch (logError) {
        console.error('Failed to log activity:', logError);
      }

      cronResults.dailyPosts = {
        success: false,
        error: errorMessage,
      };
    }

    // DAILY TASKS (Every day) - Push Notifications for Cosmic Events
    console.log('🔔 Checking for notification-worthy cosmic events...');
    const notificationStartTime = Date.now();
    try {
      const { logActivity } = await import('@/lib/admin-activity');
      await logActivity({
        activityType: 'cron_execution',
        activityCategory: 'notifications',
        status: 'pending',
        message: `Starting notification check for ${dateStr}`,
        metadata: { targetDate: dateStr },
      });

      const notificationResult = await runNotificationCheck(dateStr);
      const executionTime = Date.now() - notificationStartTime;

      const notificationsSent = notificationResult.notificationsSent || 0;
      const hasError = notificationResult.error && !notificationResult.success;
      const wasSkipped = notificationResult.success && notificationsSent === 0;

      let notificationStatus: 'success' | 'failed' | 'skipped' = 'success';
      if (hasError) {
        notificationStatus = 'failed';
      } else if (wasSkipped) {
        notificationStatus = 'skipped';
      }

      await logActivity({
        activityType: 'cron_execution',
        activityCategory: 'notifications',
        status: notificationStatus,
        message:
          notificationResult.message ||
          (wasSkipped
            ? `No notifications to send for ${dateStr}`
            : `Notification check completed for ${dateStr}: ${notificationsSent} sent`),
        metadata: {
          targetDate: dateStr,
          notificationsSent,
          eventsSent: notificationResult.eventsSent || [],
          skipped: wasSkipped,
        },
        errorMessage: hasError ? notificationResult.message : undefined,
        executionTimeMs: executionTime,
      });

      cronResults.notifications = notificationResult;
    } catch (error) {
      const executionTime = Date.now() - notificationStartTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      console.error('❌ Notification check failed:', error);

      try {
        const { logActivity } = await import('@/lib/admin-activity');
        await logActivity({
          activityType: 'cron_execution',
          activityCategory: 'notifications',
          status: 'failed',
          message: `Notification check failed for ${dateStr}`,
          metadata: {
            targetDate: dateStr,
            errorType:
              error instanceof Error ? error.constructor.name : 'Unknown',
            errorStack,
          },
          errorMessage,
          executionTimeMs: executionTime,
        });
      } catch (logError) {
        console.error('Failed to log activity:', logError);
      }

      cronResults.notifications = {
        success: false,
        error: errorMessage,
      };
    }

    // CONSOLIDATED DAILY NOTIFICATIONS (previously separate crons)
    console.log('🔔 Running consolidated daily notifications...');
    try {
      const consolidatedResult = await runConsolidatedNotifications(
        dateStr,
        dayOfWeek,
      );
      cronResults.consolidatedNotifications = consolidatedResult;
    } catch (error) {
      console.error('❌ Consolidated notifications failed:', error);
      cronResults.consolidatedNotifications = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // WEEKLY TASKS - Now handled by separate /api/cron/weekly-content cron at 8 AM UTC on Sundays
    // Removed to avoid duplication - weekly content generation runs in the morning via dedicated cron

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
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('❌ Master cron job failed:', error);

    // Log master cron failure
    try {
      const { logActivity } = await import('@/lib/admin-activity');
      // Get targetDateStr from execution tracker or use 'unknown'
      const targetDateStr = Array.from(executionTracker.keys())[0] || 'unknown';
      await logActivity({
        activityType: 'cron_execution',
        activityCategory: 'automation',
        status: 'failed',
        message: 'Master cron job failed',
        metadata: {
          targetDate: targetDateStr,
          errorType:
            error instanceof Error ? error.constructor.name : 'Unknown',
          errorStack,
        },
        errorMessage,
      });
    } catch (logError) {
      console.error('Failed to log master cron error:', logError);
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
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
  let excludeEvents: string[] = [];
  try {
    const recentEvents = await sql`
      SELECT event_name
      FROM notification_sent_events
      WHERE event_type = 'daily_cosmic_post'
        AND date < ${dateStr}::date
      ORDER BY date DESC
      LIMIT 5
    `;
    excludeEvents = recentEvents.rows
      .map((row) => row.event_name)
      .filter(Boolean);
  } catch (error: any) {
    if (error?.code !== '42P01') {
      console.error('Failed to load recent cosmic events:', error);
    }
  }

  const excludeParam =
    excludeEvents.length > 0
      ? `?exclude=${encodeURIComponent(excludeEvents.join(','))}`
      : '';

  const [cosmicResponse] = await Promise.all([
    fetch(`${productionUrl}/api/og/cosmic-post/${dateStr}${excludeParam}`, {
      headers: { 'User-Agent': 'Lunary-Cron/1.0' },
    }),
  ]);

  console.log('cosmicResponse', cosmicResponse);

  if (!cosmicResponse.ok) {
    const errorText = await cosmicResponse.text().catch(() => '');
    const errorDetails = {
      status: cosmicResponse.status,
      statusText: cosmicResponse.statusText,
      url: `${productionUrl}/api/og/cosmic-post/${dateStr}`,
      responseBody: errorText.substring(0, 500), // Limit response body size
    };

    try {
      const { logActivity } = await import('@/lib/admin-activity');
      await logActivity({
        activityType: 'content_creation',
        activityCategory: 'content',
        status: 'failed',
        message: `Failed to fetch cosmic content for ${dateStr}`,
        metadata: errorDetails,
        errorMessage: `HTTP ${cosmicResponse.status}: ${cosmicResponse.statusText}`,
      });
    } catch (logError) {
      console.error('Failed to log cosmic fetch error:', logError);
    }

    throw new Error(
      `Failed to fetch cosmic content: ${cosmicResponse.status} ${cosmicResponse.statusText}`,
    );
  }

  const cosmicContent = await cosmicResponse.json();

  // Calculate proper scheduling times
  // Cron runs at 8 AM UTC, schedule posts for 12 PM UTC on target date
  const scheduleBase = new Date(dateStr + 'T12:00:00Z'); // Start at 12 PM UTC on target date

  // Always post to our own subreddit r/lunary_insights
  const subreddit = { name: 'lunary_insights' };

  // Generate Reddit title from cosmic content
  const redditTitle = `Daily Cosmic Guidance - ${dateStr}: ${cosmicContent.primaryEvent.name}`;

  // Generate post content
  const postContent = generateCosmicPost(cosmicContent).snippet;

  // Generate AI quote for Pinterest/TikTok using shared utility
  const quote = await generateCatchyQuote(postContent, 'cosmic');

  // Build cosmic context for dynamic hashtags
  const cosmicContext: CosmicContext = {
    moonPhase: cosmicContent.astronomicalData?.moonPhase?.name,
    zodiacSign: cosmicContent.astronomicalData?.planets?.sun?.sign,
    retrograde: Object.entries(cosmicContent.astronomicalData?.planets || {})
      .filter(([_, data]: [string, any]) => data?.retrograde)
      .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1)),
    primaryEvent: cosmicContent.primaryEvent?.name,
  };

  // Generate platform-optimized hashtags
  const platformHashtags = getAllPlatformHashtags(dateStr, cosmicContext);

  // Generate posts with dynamic content
  const posts = [
    {
      name: dateStr,
      content: `${postContent}\n\n${platformHashtags.instagram}`,
      platforms: ['threads', 'pinterest', 'facebook', 'instagram'],
      imageUrls: [
        `${productionUrl}/api/og/cosmic/${dateStr}`,
        `${productionUrl}/api/og/crystal?date=${dateStr}`,
        `${productionUrl}/api/og/tarot?date=${dateStr}`,
        `${productionUrl}/api/og/moon?date=${dateStr}`,
        // `${productionUrl}/api/og/horoscope?date=${dateStr}`,
      ],
      alt: `${cosmicContent.primaryEvent.name} - ${cosmicContent.primaryEvent.energy}. Daily cosmic guidance from lunary.app.`,
      scheduledDate: new Date(scheduleBase.getTime()).toISOString(),
      // redditOptions: {
      //   title: redditTitle,
      //   subreddit: subreddit.name,
      // },
      pinterestOptions: {
        boardId: process.env.SUCCULENT_PINTEREST_BOARD_ID,
      },
      tiktokOptions: {
        type: 'post',
        autoAddMusic: true,
        visibility: 'public',
      },
      variants: {
        // instagram: {
        //   content: `${postContent}\n\n${platformHashtags.instagram}`,
        //   media: [
        //     `${productionUrl}/api/og/cosmic/${dateStr}`,
        //     `${productionUrl}/api/og/crystal?date=${dateStr}`,
        //     `${productionUrl}/api/og/tarot?date=${dateStr}`,
        //     `${productionUrl}/api/og/moon?date=${dateStr}`,
        //     `${productionUrl}/api/og/horoscope?date=${dateStr}`,
        //   ],
        // },
        tiktok: {
          content: `${generateCosmicPost(cosmicContent).snippetShort} ${platformHashtags.tiktok}`,
          media: [
            `${productionUrl}/api/og/cosmic/${dateStr}/portrait`,
            `${productionUrl}/api/og/crystal?date=${dateStr}&size=portrait`,
            `${productionUrl}/api/og/tarot?date=${dateStr}&size=portrait`,
            `${productionUrl}/api/og/moon?date=${dateStr}&size=portrait`,
            // `${productionUrl}/api/og/horoscope?date=${dateStr}&size=landscape`,
          ],
        },
        x: {
          content: `${generateCosmicPost(cosmicContent).snippetShort.replace(/\n/g, ' ')} ${platformHashtags.twitter}`,
          media: [
            `${productionUrl}/api/og/cosmic/${dateStr}/landscape`,
            `${productionUrl}/api/og/crystal?date=${dateStr}&size=landscape`,
            `${productionUrl}/api/og/tarot?date=${dateStr}&size=landscape`,
            `${productionUrl}/api/og/moon?date=${dateStr}&size=landscape`,
            // `${productionUrl}/api/og/horoscope?date=${dateStr}&size=landscape`,
          ],
          twitterOptions: {
            thread: false,
            threadNumber: false,
          },
        },
        bluesky: {
          content: `${generateCosmicPost(cosmicContent).snippetShort} ${platformHashtags.bluesky}`,
          media: [
            `${productionUrl}/api/og/cosmic/${dateStr}/landscape`,
            `${productionUrl}/api/og/crystal?date=${dateStr}&size=landscape`,
            `${productionUrl}/api/og/tarot?date=${dateStr}&size=landscape`,
            `${productionUrl}/api/og/moon?date=${dateStr}&size=landscape`,
            // `${productionUrl}/api/og/horoscope?date=${dateStr}&size=landscape`,
          ],
        },
        linkedin: {
          content: `${postContent}\n\n${platformHashtags.linkedin}`,
          media: [
            `${productionUrl}/api/og/cosmic/${dateStr}/landscape`,
            `${productionUrl}/api/og/crystal?date=${dateStr}&size=landscape`,
            `${productionUrl}/api/og/tarot?date=${dateStr}&size=landscape`,
            `${productionUrl}/api/og/moon?date=${dateStr}&size=landscape`,
            // `${productionUrl}/api/og/horoscope?date=${dateStr}&size=landscape`,
          ],
        },
        facebook: {
          content: platformHashtags.facebook
            ? `${postContent}\n\n${platformHashtags.facebook}`
            : postContent,
        },
      },
    },
  ];

  // Send posts to Succulent
  const succulentApiUrl = 'https://app.succulent.social/api/posts';
  const apiKey = process.env.SUCCULENT_SECRET_KEY;
  const accountGroupId = process.env.SUCCULENT_ACCOUNT_GROUP_ID;
  const postResults: any[] = [];

  // Helper function to format readable date
  const formatReadableDate = (dateStr: string, scheduledDate: string) => {
    const date = new Date(scheduledDate);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${formattedDate} at ${formattedTime}`;
  };

  const missingConfig: string[] = [];
  if (!apiKey) missingConfig.push('SUCCULENT_SECRET_KEY');
  if (!accountGroupId) missingConfig.push('SUCCULENT_ACCOUNT_GROUP_ID');

  if (missingConfig.length > 0) {
    const configError = `Missing required scheduler config: ${missingConfig.join(', ')}`;
    for (const post of posts) {
      postResults.push({
        name: post.name,
        platforms: post.platforms,
        status: 'error',
        error: configError,
        scheduledDate: post.scheduledDate,
      });
    }
  } else {
    for (const post of posts) {
      try {
        const readableDate = formatReadableDate(dateStr, post.scheduledDate);

        // Add Pinterest options if Pinterest is in platforms
        const pinterestOptions = post.platforms.includes('pinterest')
          ? {
              boardId:
                process.env.SUCCULENT_PINTEREST_BOARD_ID || 'lunaryapp/lunary',
              boardName: process.env.SUCCULENT_PINTEREST_BOARD_NAME || 'Lunary',
            }
          : undefined;

        const postData: any = {
          accountGroupId,
          name: post.name || `Cosmic Post - ${readableDate}`,
          content: post.content,
          platforms: post.platforms,
          scheduledDate: post.scheduledDate,
          media: (post.imageUrls || []).map((imageUrl: string) => ({
            type: 'image',
            url: imageUrl,
            alt: post.alt,
          })),
          variants: post.variants,
          // redditOptions: post.redditOptions,
        };

        if (pinterestOptions) {
          postData.pinterestOptions = pinterestOptions;
        }

        const response = await fetch(succulentApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey || '',
          },
          body: JSON.stringify(postData),
        });

        const responseText = await response.text();
        let result: any = {};
        if (responseText) {
          try {
            result = JSON.parse(responseText);
          } catch {
            result = { raw: responseText };
          }
        }

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
          const errorMessage =
            result.error ||
            result.message ||
            result.raw ||
            `HTTP ${response.status}`;
          const errorDetails = {
            postName: post.name,
            platforms: post.platforms,
            status: response.status,
            statusText: response.statusText,
            error: errorMessage,
            responseBody: responseText.substring(0, 500),
          };

          console.error(`❌ ${post.name} post failed:`, result);

          // Log individual post failures
          try {
            const { logActivity } = await import('@/lib/admin-activity');
            await logActivity({
              activityType: 'content_creation',
              activityCategory: 'content',
              status: 'failed',
              message: `Failed to schedule post "${post.name}" for ${dateStr}`,
              metadata: errorDetails,
              errorMessage,
            });
          } catch (logError) {
            console.error('Failed to log post error:', logError);
          }

          postResults.push({
            name: post.name,
            platforms: post.platforms,
            status: 'error',
            error: errorMessage,
            statusCode: response.status,
            statusText: response.statusText,
            scheduledDate: post.scheduledDate,
          });
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;

        console.error(`❌ ${post.name} post error:`, error);

        // Log individual post errors
        try {
          const { logActivity } = await import('@/lib/admin-activity');
          await logActivity({
            activityType: 'content_creation',
            activityCategory: 'content',
            status: 'failed',
            message: `Error scheduling post "${post.name}" for ${dateStr}`,
            metadata: {
              postName: post.name,
              platforms: post.platforms,
              errorType:
                error instanceof Error ? error.constructor.name : 'Unknown',
              errorStack,
            },
            errorMessage,
          });
        } catch (logError) {
          console.error('Failed to log post error:', logError);
        }

        postResults.push({
          name: post.name,
          platforms: post.platforms,
          status: 'error',
          error: errorMessage,
        });
      }
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

  if (successCount > 0 && cosmicContent?.primaryEvent?.name) {
    try {
      await sql`
        INSERT INTO notification_sent_events (date, event_key, event_type, event_name, event_priority, sent_by)
        VALUES (
          ${dateStr}::date,
          ${`daily-cosmic-post-${dateStr}`},
          'daily_cosmic_post',
          ${cosmicContent.primaryEvent.name},
          ${cosmicContent.primaryEvent.priority || 1},
          'cron'
        )
        ON CONFLICT (date, event_key) DO NOTHING
      `;
    } catch (error: any) {
      if (error?.code !== '42P01') {
        console.error('Failed to record daily cosmic post event:', error);
      }
    }
  }

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
      const dailyPreview = NotificationTemplates.dailyPreview(
        dateStr,
        posts.length,
        cosmicContent?.primaryEvent,
        postContent,
        allImageUrls,
      );

      await sendDiscordAdminNotification({
        title: dailyPreview.title,
        message: dailyPreview.message,
        priority: dailyPreview.priority,
        url: `${productionUrl}/admin/social-posts`,
        category: 'general',
        dedupeKey: `daily-preview-${dateStr}`,
      });

      // Send success summary
      const successTemplate = NotificationTemplates.cronSuccess(summary, posts);
      const successFields = [
        {
          name: 'Results',
          value: `${summary.successful}/${summary.total} posts`,
          inline: true,
        },
        {
          name: 'Success Rate',
          value: summary.successRate,
          inline: true,
        },
        {
          name: 'Platforms',
          value: 'X, Bluesky, Instagram, Threads, TikTok, Pinterest',
          inline: true,
        },
      ];

      await sendDiscordAdminNotification({
        title: successTemplate.title,
        message: successTemplate.message,
        priority: successTemplate.priority,
        url: `${productionUrl}/admin/social-posts`,
        fields: successFields,
        category: 'general',
        dedupeKey: `daily-posts-success-${dateStr}`,
      });
    } else {
      const firstError = failedPosts[0]?.error;
      const failureSummary = firstError
        ? `All daily posts failed to schedule: ${firstError}`
        : 'All daily posts failed to schedule';
      const failureTemplate = NotificationTemplates.cronFailure(
        failureSummary,
        failedPosts,
      );
      const failureFields = [
        {
          name: 'Error',
          value: failureTemplate.message.substring(0, 200),
          inline: false,
        },
        {
          name: 'Failed Posts',
          value:
            failedPosts.length > 0
              ? failedPosts.map((p) => p.name).join(', ')
              : 'All posts',
          inline: false,
        },
      ];

      await sendDiscordAdminNotification({
        title: failureTemplate.title,
        message: failureTemplate.message,
        priority: failureTemplate.priority,
        url: `${productionUrl}/admin/cron-monitor`,
        fields: failureFields,
        category: 'urgent',
        dedupeKey: `daily-posts-failure-${dateStr}`,
      });
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
  const startTime = Date.now();

  try {
    const { logActivity } = await import('@/lib/admin-activity');
    await logActivity({
      activityType: 'cron_execution',
      activityCategory: 'automation',
      status: 'pending',
      message: 'Weekly tasks started',
    });

    // 1. Generate weekly blog content
    const blogResponse = await fetch(`${baseUrl}/api/blog/weekly`, {
      headers: { 'User-Agent': 'Lunary-Master-Cron/1.0' },
    });

    if (!blogResponse.ok) {
      throw new Error(`Blog generation failed: ${blogResponse.status}`);
    }

    const blogData = await blogResponse.json();
    console.log('✅ Weekly blog content generated:', blogData.data?.title);

    await logActivity({
      activityType: 'content_creation',
      activityCategory: 'content',
      status: 'success',
      message: `Weekly blog generated: ${blogData.data?.title}`,
      metadata: {
        title: blogData.data?.title,
        weekNumber: blogData.data?.weekNumber,
      },
    });

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

    await logActivity({
      activityType: 'content_creation',
      activityCategory: 'content',
      status: newsletterData.success ? 'success' : 'failed',
      message: `Weekly newsletter ${newsletterData.success ? 'sent' : 'failed'}`,
      metadata: {
        recipients: newsletterData.data?.recipients || 0,
        subject: newsletterData.data?.subject,
      },
      errorMessage: newsletterData.error || null,
    });

    // 3. Publish to Substack (free and paid posts)
    console.log('📬 Publishing to Substack...');
    let substackResult = null;
    try {
      const substackResponse = await fetch(`${baseUrl}/api/substack/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Lunary-Master-Cron/1.0',
        },
        body: JSON.stringify({
          weekOffset: 0,
          publishFree: true,
          publishPaid: true,
        }),
      });

      if (substackResponse.ok) {
        substackResult = await substackResponse.json();
        console.log(
          `✅ Substack posts published: Free ${substackResult.results?.free?.success ? '✓' : '✗'}, Paid ${substackResult.results?.paid?.success ? '✓' : '✗'}`,
        );
        await logActivity({
          activityType: 'content_creation',
          activityCategory: 'content',
          status:
            substackResult.results?.free?.success ||
            substackResult.results?.paid?.success
              ? 'success'
              : 'failed',
          message: `Substack posts published: Free ${substackResult.results?.free?.success ? '✓' : '✗'}, Paid ${substackResult.results?.paid?.success ? '✓' : '✗'}`,
          metadata: {
            freeSuccess: substackResult.results?.free?.success || false,
            paidSuccess: substackResult.results?.paid?.success || false,
            freeUrl: substackResult.results?.free?.postUrl,
            paidUrl: substackResult.results?.paid?.postUrl,
          },
        });
      } else {
        console.error(
          '❌ Substack publishing failed:',
          substackResponse.status,
        );
        await logActivity({
          activityType: 'content_creation',
          activityCategory: 'content',
          status: 'failed',
          message: 'Substack publishing failed',
          errorMessage: `HTTP ${substackResponse.status}`,
        });
      }
    } catch (substackError) {
      console.error('❌ Substack publishing error:', substackError);
      await logActivity({
        activityType: 'content_creation',
        activityCategory: 'content',
        status: 'failed',
        message: 'Substack publishing error',
        errorMessage:
          substackError instanceof Error
            ? substackError.message
            : 'Unknown error',
      });
    }

    // 4. Generate social media posts for the week ahead (7 days in advance)
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
        await logActivity({
          activityType: 'content_creation',
          activityCategory: 'content',
          status: 'success',
          message: `Generated ${socialPostsResult.savedIds?.length || 0} social media posts`,
          metadata: {
            postsGenerated: socialPostsResult.savedIds?.length || 0,
            weekRange: socialPostsResult.weekRange,
          },
        });
      } else {
        console.error(
          '❌ Social posts generation failed:',
          socialPostsResponse.status,
        );
        await logActivity({
          activityType: 'content_creation',
          activityCategory: 'content',
          status: 'failed',
          message: 'Social posts generation failed',
          errorMessage: `HTTP ${socialPostsResponse.status}`,
        });
      }
    } catch (socialPostsError) {
      console.error('❌ Social posts generation error:', socialPostsError);
      await logActivity({
        activityType: 'content_creation',
        activityCategory: 'content',
        status: 'failed',
        message: 'Social posts generation error',
        errorMessage:
          socialPostsError instanceof Error
            ? socialPostsError.message
            : 'Unknown error',
      });
    }

    // Generate blog preview image URL (use first day of the week)
    const weekStartDate = blogData.data?.weekStart
      ? new Date(blogData.data.weekStart).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    const blogPreviewUrl = `${baseUrl}/api/og/cosmic/${weekStartDate}`;

    // Send push notification for weekly content with blog preview and social posts info
    try {
      const weeklyTemplate = NotificationTemplates.weeklyContentGenerated(
        blogData.data?.title || 'Weekly Content',
        blogData.data?.weekNumber || 0,
        blogData.data?.planetaryHighlights || [],
        blogPreviewUrl,
        socialPostsResult?.savedIds?.length || 0,
      );

      const highlights = (blogData.data?.planetaryHighlights || []).slice(0, 3);
      const weeklyFields = [
        {
          name: 'Week',
          value: `Week ${blogData.data?.weekNumber || 0}`,
          inline: true,
        },
        {
          name: 'Social Posts',
          value: `${socialPostsResult?.savedIds?.length || 0} posts ready`,
          inline: true,
        },
        {
          name: 'Status',
          value: 'Newsletter sent\nBlog ready',
          inline: true,
        },
      ];

      if (highlights.length > 0) {
        weeklyFields.push({
          name: 'Highlights',
          value: highlights
            .map(
              (h: { planet: string; event?: string }) =>
                `• ${h.planet} ${h.event?.replace('-', ' ') || 'activity'}`,
            )
            .join('\n'),
          inline: false,
        });
      }

      await sendDiscordAdminNotification({
        title: weeklyTemplate.title,
        message: weeklyTemplate.message,
        priority: weeklyTemplate.priority,
        url: `${baseUrl}/admin/social-posts`,
        fields: weeklyFields,
        category: 'todo',
        dedupeKey: `weekly-digest-${new Date().toISOString().split('T')[0]}`,
      });
      console.log(
        `✅ Weekly notification sent: ${socialPostsResult?.savedIds?.length || 0} social posts ready for approval`,
      );
    } catch (notificationError) {
      console.warn('📱 Weekly notification failed:', notificationError);
    }

    const executionTime = Date.now() - startTime;
    await logActivity({
      activityType: 'cron_execution',
      activityCategory: 'automation',
      status: 'success',
      message: 'Weekly tasks completed',
      metadata: {
        blogTitle: blogData.data?.title,
        newsletterSent: newsletterData.success,
        socialPostsGenerated: socialPostsResult?.savedIds?.length || 0,
        substackPublished:
          substackResult?.results?.free?.success ||
          substackResult?.results?.paid?.success ||
          false,
      },
      executionTimeMs: executionTime,
    });

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
      substack: substackResult
        ? {
            free: substackResult.results?.free?.success || false,
            paid: substackResult.results?.paid?.success || false,
            freeUrl: substackResult.results?.free?.postUrl,
            paidUrl: substackResult.results?.paid?.postUrl,
          }
        : null,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const { logActivity } = await import('@/lib/admin-activity');
    await logActivity({
      activityType: 'cron_execution',
      activityCategory: 'automation',
      status: 'failed',
      message: 'Weekly tasks failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      executionTimeMs: executionTime,
    });

    // Send urgent Discord notification for failure
    try {
      const { sendDiscordAdminNotification } = await import('@/lib/discord');
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await sendDiscordAdminNotification({
        title: '🚨 Weekly Automation Failed',
        message:
          'Weekly content creation failed (blog, newsletter, Substack, social posts)',
        priority: 'emergency',
        category: 'urgent',
        fields: [
          {
            name: 'Task',
            value: 'Weekly content generation',
            inline: true,
          },
          {
            name: 'Error',
            value: errorMessage.substring(0, 500),
            inline: false,
          },
        ],
        dedupeKey: `weekly-automation-failed-${new Date().toISOString().split('T')[0]}`,
      });
    } catch (discordError) {
      console.error('Failed to send Discord notification:', discordError);
    }

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
  const startTime = Date.now();

  try {
    const { logActivity } = await import('@/lib/admin-activity');
    await logActivity({
      activityType: 'cron_execution',
      activityCategory: 'automation',
      status: 'pending',
      message: 'Monthly tasks started - moon pack generation',
    });

    const response = await fetch(
      `${baseUrl}/api/cron/moon-packs?type=monthly`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
          'User-Agent': 'Lunary-Master-Cron/1.0',
          'Content-Type': 'application/json',
        },
      },
    );

    const result = await response.json();
    const executionTime = Date.now() - startTime;

    if (result.success) {
      await logActivity({
        activityType: 'cron_execution',
        activityCategory: 'automation',
        status: 'success',
        message: `Monthly moon packs generated: ${result.packsCreated || 0} packs`,
        metadata: {
          packsCreated: result.packsCreated || 0,
          packs: result.packs || [],
        },
        executionTimeMs: executionTime,
      });
      console.log('✅ Monthly moon packs generated');
    } else {
      await logActivity({
        activityType: 'cron_execution',
        activityCategory: 'automation',
        status: 'failed',
        message: 'Monthly moon pack generation failed',
        errorMessage: result.error || 'Unknown error',
        executionTimeMs: executionTime,
      });
    }

    return { success: result.success, moonPacks: result };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const { logActivity } = await import('@/lib/admin-activity');
    await logActivity({
      activityType: 'cron_execution',
      activityCategory: 'automation',
      status: 'failed',
      message: 'Monthly tasks failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      executionTimeMs: executionTime,
    });

    // Send urgent Discord notification for failure
    try {
      const { sendDiscordAdminNotification } = await import('@/lib/discord');
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await sendDiscordAdminNotification({
        title: '🚨 Monthly Automation Failed',
        message: 'Monthly moon pack generation failed',
        priority: 'emergency',
        category: 'urgent',
        fields: [
          {
            name: 'Task',
            value: 'Monthly moon pack generation',
            inline: true,
          },
          {
            name: 'Error',
            value: errorMessage.substring(0, 500),
            inline: false,
          },
        ],
        dedupeKey: `monthly-automation-failed-${new Date().toISOString().split('T')[0]}`,
      });
    } catch (discordError) {
      console.error('Failed to send Discord notification:', discordError);
    }

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
  const startTime = Date.now();

  try {
    const { logActivity } = await import('@/lib/admin-activity');
    await logActivity({
      activityType: 'cron_execution',
      activityCategory: 'automation',
      status: 'pending',
      message: 'Quarterly tasks started - moon pack generation',
    });

    const response = await fetch(
      `${baseUrl}/api/cron/moon-packs?type=quarterly`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
          'User-Agent': 'Lunary-Master-Cron/1.0',
          'Content-Type': 'application/json',
        },
      },
    );

    const result = await response.json();
    const executionTime = Date.now() - startTime;

    if (result.success) {
      await logActivity({
        activityType: 'cron_execution',
        activityCategory: 'automation',
        status: 'success',
        message: `Quarterly moon packs generated: ${result.packsCreated || 0} packs`,
        metadata: {
          packsCreated: result.packsCreated || 0,
          packs: result.packs || [],
        },
        executionTimeMs: executionTime,
      });
      console.log('✅ Quarterly moon packs generated');
    } else {
      await logActivity({
        activityType: 'cron_execution',
        activityCategory: 'automation',
        status: 'failed',
        message: 'Quarterly moon pack generation failed',
        errorMessage: result.error || 'Unknown error',
        executionTimeMs: executionTime,
      });
    }

    return { success: result.success, moonPacks: result };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const { logActivity } = await import('@/lib/admin-activity');
    await logActivity({
      activityType: 'cron_execution',
      activityCategory: 'automation',
      status: 'failed',
      message: 'Quarterly tasks failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      executionTimeMs: executionTime,
    });

    // Send urgent Discord notification for failure
    try {
      const { sendDiscordAdminNotification } = await import('@/lib/discord');
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await sendDiscordAdminNotification({
        title: '🚨 Quarterly Automation Failed',
        message: 'Quarterly moon pack generation failed',
        priority: 'emergency',
        category: 'urgent',
        fields: [
          {
            name: 'Task',
            value: 'Quarterly moon pack generation',
            inline: true,
          },
          {
            name: 'Error',
            value: errorMessage.substring(0, 500),
            inline: false,
          },
        ],
        dedupeKey: `quarterly-automation-failed-${new Date().toISOString().split('T')[0]}`,
      });
    } catch (discordError) {
      console.error('Failed to send Discord notification:', discordError);
    }

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
  const startTime = Date.now();

  try {
    const { logActivity } = await import('@/lib/admin-activity');
    await logActivity({
      activityType: 'cron_execution',
      activityCategory: 'automation',
      status: 'pending',
      message: 'Yearly tasks started - moon pack and calendar generation',
    });

    // Generate yearly moon packs
    const packResponse = await fetch(
      `${baseUrl}/api/cron/moon-packs?type=yearly`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
          'User-Agent': 'Lunary-Master-Cron/1.0',
          'Content-Type': 'application/json',
        },
      },
    );

    const packResult = await packResponse.json();
    let calendarResult = null;

    // Generate calendar for next year
    const nextYear = new Date().getFullYear() + 1;
    try {
      const calendarResponse = await fetch(
        `${baseUrl}/api/shop/calendar/generate-and-sync`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Lunary-Master-Cron/1.0',
          },
          body: JSON.stringify({
            year: nextYear,
            dryRun: false,
            autoPublish: true,
          }),
        },
      );

      if (calendarResponse.ok) {
        calendarResult = await calendarResponse.json();
        await logActivity({
          activityType: 'calendar_creation',
          activityCategory: 'shop',
          status: calendarResult.success ? 'success' : 'failed',
          message: `Calendar for ${nextYear} ${calendarResult.success ? 'created' : 'failed'}`,
          metadata: {
            year: nextYear,
            calendar: calendarResult.calendar || null,
          },
          errorMessage: calendarResult.error || null,
        });
        console.log(`✅ Calendar for ${nextYear} generated`);
      }
    } catch (calendarError) {
      console.error('❌ Calendar generation failed:', calendarError);
      await logActivity({
        activityType: 'calendar_creation',
        activityCategory: 'shop',
        status: 'failed',
        message: `Calendar generation for ${nextYear} failed`,
        errorMessage:
          calendarError instanceof Error
            ? calendarError.message
            : 'Unknown error',
      });
    }

    const executionTime = Date.now() - startTime;

    if (packResult.success) {
      await logActivity({
        activityType: 'cron_execution',
        activityCategory: 'automation',
        status: 'success',
        message: `Yearly moon packs generated: ${packResult.packsCreated || 0} packs`,
        metadata: {
          packsCreated: packResult.packsCreated || 0,
          packs: packResult.packs || [],
          calendarCreated: calendarResult?.success || false,
        },
        executionTimeMs: executionTime,
      });
      console.log('✅ Yearly moon packs generated');
    } else {
      await logActivity({
        activityType: 'cron_execution',
        activityCategory: 'automation',
        status: 'failed',
        message: 'Yearly moon pack generation failed',
        errorMessage: packResult.error || 'Unknown error',
        executionTimeMs: executionTime,
      });
    }

    return {
      success: packResult.success,
      moonPacks: packResult,
      calendar: calendarResult,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const { logActivity } = await import('@/lib/admin-activity');
    await logActivity({
      activityType: 'cron_execution',
      activityCategory: 'automation',
      status: 'failed',
      message: 'Yearly tasks failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      executionTimeMs: executionTime,
    });

    // Send urgent Discord notification for failure
    try {
      const { sendDiscordAdminNotification } = await import('@/lib/discord');
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await sendDiscordAdminNotification({
        title: '🚨 Yearly Automation Failed',
        message: 'Yearly moon pack and calendar generation failed',
        priority: 'emergency',
        category: 'urgent',
        fields: [
          {
            name: 'Task',
            value: 'Yearly moon pack & calendar generation',
            inline: true,
          },
          {
            name: 'Error',
            value: errorMessage.substring(0, 500),
            inline: false,
          },
        ],
        dedupeKey: `yearly-automation-failed-${new Date().toISOString().split('T')[0]}`,
      });
    } catch (discordError) {
      console.error('Failed to send Discord notification:', discordError);
    }

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

  const baseUrl = process.env.VERCEL
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

    // Log seasonal events in cosmic data
    console.log(
      '🌍 Cosmic data seasonal events:',
      cosmicData.seasonalEvents?.length || 0,
      cosmicData.seasonalEvents,
    );
    console.log(
      '🌍 Primary event:',
      cosmicData.primaryEvent?.name,
      'priority:',
      cosmicData.primaryEvent?.priority,
    );

    // Check if there are notification-worthy events
    const notificationEvents = getNotificationWorthyEvents(cosmicData);

    console.log(
      `🔔 Notification-worthy events found: ${notificationEvents.length}`,
      notificationEvents.map(
        (e) => `${e.name} (${e.type}, priority ${e.priority})`,
      ),
    );

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

    // Send each significant event via unified service
    // Schedule notifications throughout the day instead of all at once
    const results = [];
    let totalSent = 0;

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
        const notificationEvent: NotificationEvent = {
          name: eventToSend.name || 'Cosmic Event',
          type: eventToSend.type || 'unknown',
          priority: eventToSend.priority || 0,
          planet: eventToSend.planet,
          sign: eventToSend.sign,
          planetA: eventToSend.planetA,
          planetB: eventToSend.planetB,
          aspect: eventToSend.aspect,
          emoji: eventToSend.emoji,
          energy: eventToSend.energy,
          description: eventToSend.description,
        };

        const result = await sendUnifiedNotification(
          notificationEvent,
          cosmicData,
          'daily',
        );

        totalSent += result.recipientCount || 0;
        results.push({
          success: result.success,
          recipientCount: result.recipientCount,
          successful: result.successful,
          failed: result.failed,
          eventName: eventToSend.name,
          eventKey: result.eventKey,
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

    // Cleanup old tracking data (only keep today + 1 day buffer)
    // Note: Events are now tracked by unified service
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

        const fields = [
          {
            name: 'This Week',
            value: `${weeklySignups} signups\n${weeklyTrials} trials\n${weeklyConversions} conversions`,
            inline: true,
          },
          {
            name: 'Last 30 Days',
            value: `${monthlySignups} signups\n${monthlyTrials} trials\n${monthlyConversions} conversions`,
            inline: true,
          },
          {
            name: 'Metrics',
            value: `${conversionRate.toFixed(1)}% conversion rate\n${trialConversionRate.toFixed(1)}% trial conversion\n$${mrr.toFixed(2)} MRR`,
            inline: true,
          },
        ];

        await sendDiscordAdminNotification({
          title: '📊 Weekly Conversion Digest',
          message: 'Weekly conversion statistics for the past 7 and 30 days.',
          priority: 'normal',
          url: `${baseUrl}/admin/analytics`,
          fields,
          category: 'analytics',
          dedupeKey: `weekly-conversion-digest-${new Date().toISOString().split('T')[0]}`,
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
          s.user_id,
          s.email as email,
          s.user_name as name,
          s.trial_ends_at,
          s.plan
        FROM subscriptions s
        WHERE s.status = 'trial'
        AND s.trial_ends_at::date = ${formatDate(threeDaysFromNow)}
        AND (s.trial_reminder_3d_sent = false OR s.trial_reminder_3d_sent IS NULL)
        AND s.email IS NOT NULL
      `;

      // Get trials ending in 1 day (final reminder)
      const oneDayReminders = await sql`
        SELECT DISTINCT
          s.user_id,
          s.email as email,
          s.user_name as name,
          s.trial_ends_at,
          s.plan
        FROM subscriptions s
        WHERE s.status = 'trial'
        AND s.trial_ends_at::date = ${formatDate(oneDayFromNow)}
        AND (s.trial_reminder_1d_sent = false OR s.trial_reminder_1d_sent IS NULL)
        AND s.email IS NOT NULL
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

          const html = await generateTrialReminderEmailHTML(
            user.name || 'there',
            daysRemaining,
          );
          const text = await generateTrialReminderEmailText(
            user.name || 'there',
            daysRemaining,
          );

          await sendEmail({
            to: user.email,
            subject: `⏰ ${daysRemaining} Days Left in Your Trial - Lunary`,
            html,
            text,
            tracking: {
              userId: user.user_id,
              notificationType: 'trial_reminder',
              notificationId: `trial-3d-${user.user_id}`,
              utm: {
                source: 'email',
                medium: 'lifecycle',
                campaign: 'trial_reminder',
                content: '3_day',
              },
            },
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

          const html = await generateTrialReminderEmailHTML(
            user.name || 'there',
            daysRemaining,
          );
          const text = await generateTrialReminderEmailText(
            user.name || 'there',
            daysRemaining,
          );

          await sendEmail({
            to: user.email,
            subject: `⏰ Last Day! Your Trial Ends Tomorrow - Lunary`,
            html,
            text,
            tracking: {
              userId: user.user_id,
              notificationType: 'trial_reminder',
              notificationId: `trial-1d-${user.user_id}`,
              utm: {
                source: 'email',
                medium: 'lifecycle',
                campaign: 'trial_reminder',
                content: '1_day',
              },
            },
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
          s.user_id,
          s.email as email,
          s.user_name as name,
          s.trial_ends_at
        FROM subscriptions s
        WHERE s.status = 'trial'
        AND s.trial_ends_at::date = ${formatDate(yesterday)}
        AND (s.trial_expired_email_sent = false OR s.trial_expired_email_sent IS NULL)
        AND s.email IS NOT NULL
      `;

      let sentExpired = 0;
      for (const user of expiredTrials.rows) {
        try {
          const trialEnd = new Date(user.trial_ends_at);
          const daysSince = Math.floor(
            (Date.now() - trialEnd.getTime()) / (1000 * 60 * 60 * 24),
          );
          const missedInsights = Math.max(1, daysSince);

          const html = await generateTrialExpiredEmailHTML(
            user.name || 'there',
            missedInsights,
          );
          const text = await generateTrialExpiredEmailText(
            user.name || 'there',
            missedInsights,
          );

          await sendEmail({
            to: user.email,
            subject: `🌙 Your Trial Has Ended - ${missedInsights} Insights Waiting`,
            html,
            text,
            tracking: {
              userId: user.user_id,
              notificationType: 'trial_expired',
              notificationId: `trial-expired-${user.user_id}`,
              utm: {
                source: 'email',
                medium: 'lifecycle',
                campaign: 'trial_expired',
              },
            },
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
      eventsSent: results.map((r) => r.eventKey || r.eventName).filter(Boolean),
      eventsSentCount: results.length,
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
    console.log(
      `🌍 Adding ${cosmicData.seasonalEvents.length} seasonal events to allEvents`,
    );
    allEvents.push(
      ...cosmicData.seasonalEvents.map((event: any) => ({
        ...event,
        type: event.type || 'seasonal',
        priority: event.priority || 9, // Seasonal events should be priority 9
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

  // Seasonal events (equinoxes, solstices, sabbats) - priority 9
  if (event.type === 'seasonal' && event.priority >= 8) return true;

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
        return eventName || 'Moon Phase';

      case 'aspect':
        if (event.planetA && event.planetB && event.aspect) {
          const planetAName = event.planetA.name || event.planetA || 'Planet';
          const planetBName = event.planetB.name || event.planetB || 'Planet';
          const aspectName =
            event.aspect.charAt(0).toUpperCase() + event.aspect.slice(1);
          return `${planetAName}-${planetBName} ${aspectName}`;
        }
        return eventName || 'Planetary Aspect';

      case 'seasonal':
        return eventName || 'Seasonal Event';

      case 'ingress':
        if (event.planet && event.sign) {
          return `${event.planet} Enters ${event.sign}`;
        }
        if (eventName && eventName.includes('Enters')) {
          return eventName;
        }
        return eventName || 'Planetary Ingress';

      case 'retrograde':
        if (event.planet) {
          return `${event.planet} Retrograde Begins`;
        }
        if (eventName && eventName.includes('Retrograde')) {
          return eventName;
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
        body = getMoonPhaseDescription(event.name || 'Moon Phase', cosmicData);
        break;

      case 'aspect':
        body =
          getAspectDescription(event) ||
          'Powerful cosmic alignment creating new opportunities';
        break;

      case 'seasonal':
        body = getSeasonalDescription(event.name || 'Seasonal Event');
        break;

      case 'ingress':
        body = getIngressDescription(
          event.planet || event.name?.split(' ')[0],
          event.sign || event.name?.split(' ')[2],
        );
        break;

      case 'retrograde':
        body = getRetrogradeDescription(
          event.planet || event.name?.split(' ')[0],
          event.sign,
        );
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

  const getIngressDescription = (planet?: string, sign?: string): string => {
    if (!planet || !sign) {
      return 'Planetary energy shift creating new opportunities';
    }

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
  // Use production URL on any Vercel deployment
  return process.env.VERCEL ? 'https://lunary.app' : request.nextUrl.origin;
}

// CONSOLIDATED NOTIFICATIONS - replaces 5+ separate cron routes
async function runConsolidatedNotifications(
  dateStr: string,
  dayOfWeek: number,
) {
  const results: Record<string, any> = {};
  const now = new Date();

  // 1. Daily Insight Notification - MOVED TO MORNING (8 AM UTC)
  // This is now handled by daily-morning-notification cron
  // Skipping here to avoid duplicate notifications
  results.dailyInsight = {
    skipped: true,
    message:
      'Daily insight notification now runs at 8 AM UTC via daily-morning-notification cron',
  };

  // 2. Daily Cosmic Event Notification (was daily-cosmic-event cron)
  try {
    console.log('🌌 Checking for cosmic event notifications...');
    const dateStr2 = now.toISOString().split('T')[0];
    const eventKey = `daily-cosmic-event-${dateStr2}`;

    const alreadySentEvent = await sql`
      SELECT id FROM notification_sent_events 
      WHERE date = ${dateStr2}::date 
      AND event_key = ${eventKey}
    `;

    if (alreadySentEvent.rows.length === 0) {
      const positions = getRealPlanetaryPositions(now);
      console.log(
        `🌍 Checking seasonal events - Sun longitude: ${positions.Sun?.longitude}°`,
      );
      const moonPhase = getAccurateMoonPhase(now);
      const seasonalEvents = checkSeasonalEvents(positions);
      console.log(
        `🌍 Seasonal events found: ${seasonalEvents.length}`,
        seasonalEvents,
      );
      const aspects = calculateRealAspects(positions);
      const retrogradeEvents = checkRetrogradeEvents(positions);

      const allCosmicEvents: Array<{
        name: string;
        description: string;
        priority: number;
        type: string;
        emoji: string;
      }> = [];

      // Check for significant moon phases
      if (moonPhase.isSignificant) {
        const significantPhases = [
          'New Moon',
          'Full Moon',
          'First Quarter',
          'Last Quarter',
        ];
        if (significantPhases.some((phase) => moonPhase.name.includes(phase))) {
          allCosmicEvents.push({
            name: `${moonPhase.name} in ${positions.Moon.sign}`,
            description:
              'A powerful lunar moment for reflection and intention setting.',
            priority: 10,
            type: 'moon',
            emoji: moonPhase.emoji || '🌙',
          });
        }
      }

      // Check for extraordinary aspects (priority >= 8)
      const extraordinaryAspects = aspects.filter(
        (a: { priority: number }) => a.priority >= 8,
      );
      for (const aspect of extraordinaryAspects) {
        const planetA = aspect.planetA?.name || aspect.planetA;
        const planetB = aspect.planetB?.name || aspect.planetB;
        allCosmicEvents.push({
          name: `${planetA}-${planetB} ${aspect.aspect}`,
          description: 'Powerful cosmic alignment creating new opportunities.',
          priority: aspect.priority,
          type: 'aspect',
          emoji: '✨',
        });
      }

      // Check for retrograde events
      for (const event of retrogradeEvents) {
        if (event.type === 'retrograde_start') {
          allCosmicEvents.push({
            name: `${event.planet} Retrograde Begins`,
            description: `${event.planet} stations retrograde. Time for reflection.`,
            priority: 9,
            type: 'retrograde_start',
            emoji: '🔄',
          });
        }
      }

      // Check for seasonal events
      console.log(
        `🌍 Seasonal events detected: ${seasonalEvents.length}`,
        seasonalEvents.map((e) => `${e.name} (priority ${e.priority})`),
      );
      for (const event of seasonalEvents) {
        allCosmicEvents.push({
          name: event.name,
          description:
            event.description || 'Seasonal energy shift brings new themes.',
          priority: event.priority || 9, // Seasonal events should be priority 9
          type: 'seasonal',
          emoji: event.emoji || '🌿',
        });
      }

      allCosmicEvents.sort((a, b) => b.priority - a.priority);

      if (allCosmicEvents.length > 0) {
        const primaryEvent = allCosmicEvents[0];

        // Configure VAPID if not already done
        const publicKey = process.env.VAPID_PUBLIC_KEY;
        const privateKey = process.env.VAPID_PRIVATE_KEY;
        if (publicKey && privateKey) {
          webpush.setVapidDetails(
            'mailto:info@lunary.app',
            publicKey,
            privateKey,
          );
        }

        // Get subscribers
        const subscriptions = await sql`
          SELECT endpoint, p256dh, auth, user_id
          FROM push_subscriptions 
          WHERE is_active = true 
          AND (preferences->>'cosmicEvents' = 'true' OR preferences->>'cosmicEvents' IS NULL)
        `;

        let pushSent = 0;
        let pushFailed = 0;
        const baseUrl =
          process.env.NODE_ENV === 'production'
            ? 'https://lunary.app'
            : 'http://localhost:3000';

        const pushNotification = {
          title: `${primaryEvent.emoji} ${primaryEvent.name}`,
          body: primaryEvent.description,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          vibrate: [200, 100, 200],
          tag: 'lunary-daily-cosmic-event',
          data: { url: baseUrl, type: 'daily_cosmic_event', date: dateStr2 },
        };

        for (const sub of subscriptions.rows) {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth },
              },
              JSON.stringify(pushNotification),
            );
            pushSent++;
          } catch (pushError) {
            if (
              pushError instanceof Error &&
              (pushError.message.includes('410') ||
                pushError.message.includes('expired'))
            ) {
              await sql`UPDATE push_subscriptions SET is_active = false WHERE endpoint = ${sub.endpoint}`;
            }
            pushFailed++;
          }
        }

        if (pushSent > 0) {
          await sql`
            INSERT INTO notification_sent_events (date, event_key, event_type, event_name, event_priority, sent_by)
            VALUES (${dateStr2}::date, ${eventKey}, 'daily_cosmic_event', ${primaryEvent.name}, ${primaryEvent.priority}, 'daily')
            ON CONFLICT (date, event_key) DO NOTHING
          `;
        }

        results.dailyCosmicEvent = {
          sent: pushSent,
          failed: pushFailed,
          event: primaryEvent.name,
        };
        console.log(
          `✅ Cosmic event notification: ${pushSent} sent for ${primaryEvent.name}`,
        );
      } else {
        results.dailyCosmicEvent = { skipped: 'no significant events today' };
      }
    } else {
      results.dailyCosmicEvent = { skipped: 'already sent today' };
    }
  } catch (error) {
    console.error('❌ Daily cosmic event notification failed:', error);
    results.dailyCosmicEvent = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown',
    };
  }

  // 3. Moon Circles (was moon-circles cron) - only creates on new/full moons
  try {
    console.log('🌙 Checking for moon circle creation...');
    const moonCircle = await generateMoonCircle(now);
    if (moonCircle) {
      // Check if already exists
      const existingCircle = await sql`
        SELECT id FROM moon_circles WHERE event_date = ${dateStr}::date
      `;
      if (existingCircle.rows.length === 0) {
        // Create the moon circle
        const insertResult = await sql`
          INSERT INTO moon_circles (
            moon_phase,
            event_date,
            title,
            theme,
            description
          ) VALUES (
            ${moonCircle.moonPhase},
            ${dateStr}::date,
            ${`Moon Circle: ${moonCircle.moonPhase} in ${moonCircle.moonSign}`},
            ${moonCircle.moonPhase},
            ${moonCircle.moonSignInfo}
          )
          RETURNING id
        `;
        const moonCircleId = insertResult.rows[0]?.id;
        results.moonCircle = {
          created: true,
          phase: moonCircle.moonPhase,
          sign: moonCircle.moonSign,
          id: moonCircleId,
        };
        console.log(
          `✅ Moon circle created: ${moonCircle.moonPhase} in ${moonCircle.moonSign}`,
        );
      } else {
        results.moonCircle = { created: false, reason: 'already exists' };
      }
    } else {
      results.moonCircle = { created: false, reason: 'not a new/full moon' };
    }
  } catch (error) {
    console.error('❌ Moon circle creation failed:', error);
    results.moonCircle = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown',
    };
  }

  // 4. Weekly Cosmic Report (was weekly-cosmic-report cron) - Sundays only
  if (dayOfWeek === 0) {
    try {
      console.log('📊 Sending weekly cosmic reports...');
      const eventKey = `weekly-report-${dateStr}`;

      const alreadySent = await sql`
        SELECT id FROM notification_sent_events 
        WHERE date = ${dateStr}::date 
        AND event_key = ${eventKey}
      `;

      if (alreadySent.rows.length === 0) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - 6);
        weekStart.setHours(0, 0, 0, 0);

        const subscriptions = await sql`
          SELECT DISTINCT user_id, user_email, preferences
          FROM push_subscriptions
          WHERE is_active = true
          AND (preferences->>'weeklyReport' = 'true' OR preferences->>'weeklyReport' IS NULL)
          AND (preferences->>'birthday' IS NOT NULL AND preferences->>'birthday' != '')
        `;

        let emailsSent = 0;
        const baseUrl =
          process.env.NODE_ENV === 'production'
            ? 'https://lunary.app'
            : 'http://localhost:3000';

        for (const sub of subscriptions.rows) {
          try {
            const userId = sub.user_id;
            const userEmail = sub.user_email;
            const preferences = sub.preferences || {};
            const userName = (preferences.name as string) || undefined;

            if (!userEmail || !userId) continue;

            const report = await generateWeeklyReport(userId, weekStart);
            if (!report) continue;

            const emailHtml = await generateWeeklyReportEmailHTML(
              report,
              baseUrl,
              userName,
              userEmail,
            );
            const emailText = await generateWeeklyReportEmailText(
              report,
              baseUrl,
              userName,
              userEmail,
            );

            await sendEmail({
              to: userEmail,
              subject: '🌙 Your Weekly Cosmic Report',
              html: emailHtml,
              text: emailText,
            });

            emailsSent++;
          } catch (error) {
            console.error(
              `Failed to send weekly report to ${sub.user_email}:`,
              error,
            );
          }
        }

        if (emailsSent > 0) {
          await sql`
            INSERT INTO notification_sent_events (date, event_key, event_type, event_name, event_priority, sent_by)
            VALUES (${dateStr}::date, ${eventKey}, 'weekly_report', 'Weekly Cosmic Report', 5, 'weekly')
            ON CONFLICT (date, event_key) DO NOTHING
          `;
        }

        results.weeklyReport = { sent: emailsSent };
        console.log(`✅ Weekly reports: ${emailsSent} sent`);
      } else {
        results.weeklyReport = { skipped: 'already sent today' };
      }
    } catch (error) {
      console.error('❌ Weekly report failed:', error);
      results.weeklyReport = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown',
      };
    }
  }

  return {
    success: true,
    results,
  };
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
