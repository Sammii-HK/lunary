import { getPinterestBoard } from '@/lib/pinterest/boards';
import { buildUtmUrl } from '@/lib/urls';
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
import { getQuoteImageUrl } from '@/lib/social/quote-generator';
import {
  ensurePinterestQuoteQueue,
  getPinterestQuoteForDate,
  markPinterestQuoteSent,
} from '@/lib/social/pinterest-queue';
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
  getSignDescription,
} from '../../../../../utils/astrology/cosmic-og';
import {
  getAllPlatformHashtags,
  CosmicContext,
} from '../../../../../utils/hashtags';
import {
  getPlatformImageFormat,
  type ImageFormat,
} from '@/lib/social/educational-images';
import {
  getEngagementHook,
  getAspectHook,
  isTensionAspect,
  type HookType,
} from '@/constants/engagement-hooks';
import {
  detectUpcomingSignChanges,
  detectUpcomingRetrogradeStations,
  detectTransitMilestones,
  detectMajorEventCountdowns,
  getGlobalCosmicData,
  type SignChangeEvent,
  type RetrogradeStationEvent,
  type TransitMilestoneEvent,
  type CountdownEvent,
} from '@/lib/cosmic-snapshot/global-cache';
import {
  getUpcomingEclipses,
  type EclipseEvent,
} from '../../../../../utils/astrology/eclipseTracker';
import {
  aspectNatures,
  planetKeywords,
} from '../../../../../utils/blog/aspectInterpretations';
import { getSlowPlanetSignTotalDays } from '../../../../../utils/astrology/transit-duration';
import { postToSocial, postToSocialMultiPlatform } from '@/lib/social/client';
import { preUploadImage } from '@/lib/social/pre-upload-image';

// Track if cron is already running to prevent duplicate execution
// Using a Map to track by date for better serverless resilience
const executionTracker = new Map<string, boolean>();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const force = url.searchParams.get('force') === 'true';
    const overrideDate = url.searchParams.get('date');
    // Optional comma-separated section filter, e.g. ?sections=threads,stories
    // When omitted, all sections run as normal.
    const sectionsParam = url.searchParams.get('sections');
    const onlySections = sectionsParam
      ? new Set(sectionsParam.split(',').map((s) => s.trim().toLowerCase()))
      : null;
    // Optional threads slot override, e.g. ?threadsSlots=15,17,21
    const threadsSlotsParam = url.searchParams.get('threadsSlots');
    const threadsSlotsOverride = threadsSlotsParam
      ? threadsSlotsParam
          .split(',')
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !isNaN(n))
      : null;
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

    // Calculate target date: create posts for today
    const now = new Date();
    const targetDateStr = (() => {
      if (overrideDate && /^\d{4}-\d{2}-\d{2}$/.test(overrideDate)) {
        return overrideDate;
      }
      return now.toISOString().split('T')[0];
    })();
    const dailyPostsKey = `daily-posts-${targetDateStr}`;

    if (!force) {
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
      } catch (error: unknown) {
        if ((error as { code?: string })?.code === '42P01') {
          console.warn(
            'notification_sent_events table missing; proceeding without DB dedupe',
          );
        } else {
          throw error;
        }
      }
    }

    // Atomic check-and-set: Prevent duplicate execution for the same target date
    // This works better in serverless than separate checks
    if (!force && executionTracker.has(targetDateStr)) {
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
    if (!force) {
      executionTracker.set(targetDateStr, true);
    }

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
    console.log(`📅 Creating posts for today: ${targetDateStr}`);

    const todayDate = new Date();
    const dayOfWeek = todayDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayOfMonth = todayDate.getDate();
    const month = todayDate.getMonth() + 1;
    const dateStr = targetDateStr;

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

    // DAILY TASKS (Every day) - Instagram Content Batch
    console.log('📸 Generating Instagram content batch...');
    const igStartTime = Date.now();
    try {
      const { generateDailyBatch } =
        await import('@/lib/instagram/content-orchestrator');
      const igBatch = await generateDailyBatch(dateStr);

      // Post each Instagram batch item via Ayrshare
      const igSentResults: Array<{
        scheduledTime: string;
        type: string;
        status: string;
        error?: string;
      }> = [];

      for (const post of igBatch.posts) {
        try {
          // Pre-upload all images to static blob URLs
          const mediaItems: Array<{
            type: 'image';
            url: string;
            alt: string;
          }> = [];
          for (const imageUrl of post.imageUrls) {
            const staticUrl = await preUploadImage(imageUrl);
            mediaItems.push({
              type: 'image',
              url: staticUrl,
              alt: `${post.type} content from Lunary`,
            });
          }

          // Cap hashtags at 3 (Instagram sweet spot; Ayrshare max is 5)
          const limitedHashtags = post.hashtags.slice(0, 3);
          const caption =
            limitedHashtags.length > 0
              ? `${post.caption}\n\n${limitedHashtags.join(' ')}`
              : post.caption;

          const isStory = post.type === 'story';
          const isCarousel =
            post.type === 'carousel' || post.type === 'angel_number_carousel';

          const result = await postToSocial({
            platform: 'instagram',
            content: isStory ? '' : caption,
            scheduledDate: post.scheduledTime,
            media: mediaItems,
            platformSettings: {
              instagramOptions: {
                ...(isStory ? { isStory: true } : {}),
                ...(isCarousel ? { type: 'carousel' } : {}),
              },
            },
          });

          igSentResults.push({
            scheduledTime: post.scheduledTime,
            type: post.type,
            status: result.success ? 'success' : 'error',
            error: result.success ? undefined : result.error || 'Unknown error',
          });
        } catch (postError) {
          igSentResults.push({
            scheduledTime: post.scheduledTime,
            type: post.type,
            status: 'error',
            error:
              postError instanceof Error ? postError.message : 'Unknown error',
          });
        }
      }

      const igSuccessCount = igSentResults.filter(
        (r) => r.status === 'success',
      ).length;
      const igExecutionTime = Date.now() - igStartTime;

      console.log(
        `📸 Instagram batch: ${igBatch.posts.length} posts generated, ${igSuccessCount} sent in ${igExecutionTime}ms`,
      );

      cronResults.instagramBatch = {
        success: true,
        postCount: igBatch.posts.length,
        sentCount: igSuccessCount,
        posts: igSentResults,
        types: igBatch.posts.map((p: { type: string }) => p.type),
        executionTimeMs: igExecutionTime,
      };
    } catch (error) {
      const igExecutionTime = Date.now() - igStartTime;
      console.error('📸 Instagram batch failed:', error);
      cronResults.instagramBatch = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTimeMs: igExecutionTime,
      };
    }

    // DAILY TASKS (Every day) - Threads Content Batch
    if (onlySections && !onlySections.has('threads')) {
      cronResults.threadsBatch = {
        skipped: true,
        reason: 'Not in sections filter',
      };
    } else {
      console.log('🧵 Generating Threads content batch...');
      const threadsStartTime = Date.now();
      try {
        const { generateThreadsBatch } =
          await import('@/lib/threads/content-orchestrator');
        const threadsBatch = await generateThreadsBatch(dateStr);

        // Remap scheduled times if caller provided slot overrides
        if (threadsSlotsOverride && threadsSlotsOverride.length > 0) {
          threadsBatch.posts.forEach((post, i) => {
            const hour =
              threadsSlotsOverride[i] ??
              threadsSlotsOverride[threadsSlotsOverride.length - 1];
            const d = new Date(`${dateStr}T00:00:00.000Z`);
            d.setUTCHours(hour, 0, 0, 0);
            post.scheduledTime = d.toISOString();
          });
        }

        const threadsExecutionTime = Date.now() - threadsStartTime;

        // Send each Threads post via social client as standalone threads-only posts
        const threadsSentResults: Array<{
          scheduledTime: string;
          pillar: string;
          source: string;
          status: string;
          error?: string;
        }> = [];

        for (const post of threadsBatch.posts) {
          try {
            const content = [post.hook, post.body, post.prompt]
              .filter(Boolean)
              .join('\n\n');

            const result = await postToSocial({
              platform: 'threads',
              content,
              scheduledDate: post.scheduledTime,
              media:
                post.hasImage && post.imageUrl
                  ? [
                      {
                        type: 'image',
                        url: post.imageUrl,
                        alt: `${post.topicTag} content from Lunary`,
                      },
                    ]
                  : [],
              platformSettings: { topic_tag: post.topicTag },
            });

            if (result.success) {
              threadsSentResults.push({
                scheduledTime: post.scheduledTime,
                pillar: post.pillar,
                source: post.source,
                status: 'success',
              });
            } else {
              threadsSentResults.push({
                scheduledTime: post.scheduledTime,
                pillar: post.pillar,
                source: post.source,
                status: 'error',
                error: result.error || 'Unknown error',
              });
            }
          } catch (postError) {
            threadsSentResults.push({
              scheduledTime: post.scheduledTime,
              pillar: post.pillar,
              source: post.source,
              status: 'error',
              error:
                postError instanceof Error
                  ? postError.message
                  : 'Unknown error',
            });
          }
        }

        const successCount = threadsSentResults.filter(
          (r) => r.status === 'success',
        ).length;
        console.log(
          `🧵 Threads batch: ${threadsBatch.posts.length} posts generated, ${successCount} sent in ${threadsExecutionTime}ms`,
        );

        cronResults.threadsBatch = {
          success: true,
          postCount: threadsBatch.posts.length,
          sentCount: successCount,
          posts: threadsSentResults,
          executionTimeMs: threadsExecutionTime,
        };
      } catch (error) {
        const threadsExecutionTime = Date.now() - threadsStartTime;
        console.error('🧵 Threads batch failed:', error);
        cronResults.threadsBatch = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          executionTimeMs: threadsExecutionTime,
        };
      }
    } // end threads section filter

    // DAILY TASKS (Tue/Wed/Thu) - LinkedIn Standalone Posts
    console.log('💼 Checking LinkedIn posting day...');
    const linkedinStartTime = Date.now();
    try {
      const { isLinkedInPostingDay, generateLinkedInPost } =
        await import('@/lib/linkedin/content-generator');

      if (isLinkedInPostingDay(dateStr)) {
        const linkedinPost = generateLinkedInPost(dateStr);
        const linkedinExecutionTime = Date.now() - linkedinStartTime;

        const scheduledTime = new Date(
          `${dateStr}T${String(linkedinPost.scheduledHour).padStart(2, '0')}:00:00Z`,
        );

        const result = await postToSocial({
          platform: 'linkedin',
          content: linkedinPost.content,
          scheduledDate: scheduledTime.toISOString(),
          media: [],
        });

        cronResults.linkedinPost = {
          success: result.success,
          category: linkedinPost.category,
          scheduledDate: scheduledTime.toISOString(),
          executionTimeMs: linkedinExecutionTime,
          ...(result.success ? {} : { error: result.error || 'Unknown error' }),
        };

        if (result.success) {
          console.log(
            `💼 LinkedIn post scheduled: ${linkedinPost.category} fact at ${scheduledTime.toISOString()}`,
          );
        } else {
          console.error(`💼 LinkedIn post failed: ${result.error}`);
        }
      } else {
        const linkedinExecutionTime = Date.now() - linkedinStartTime;
        console.log('💼 Not a LinkedIn posting day (Tue/Wed/Thu only)');
        cronResults.linkedinPost = {
          success: true,
          skipped: true,
          reason: 'Not a posting day (Tue/Wed/Thu only)',
          executionTimeMs: linkedinExecutionTime,
        };
      }
    } catch (error) {
      const linkedinExecutionTime = Date.now() - linkedinStartTime;
      console.error('💼 LinkedIn post failed:', error);
      cronResults.linkedinPost = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTimeMs: linkedinExecutionTime,
      };
    }

    // DAILY TASKS (Every day) - Twitter Standalone Posts
    console.log('🐦 Generating Twitter standalone posts...');
    const twitterStartTime = Date.now();
    try {
      const { generateTwitterPosts } =
        await import('@/lib/social/standalone-content');
      const twitterPosts = generateTwitterPosts(dateStr);
      const twitterExecutionTime = Date.now() - twitterStartTime;

      const twitterResults: Array<{
        scheduledTime: string;
        postType: string;
        category: string;
        status: string;
        error?: string;
      }> = [];

      for (const post of twitterPosts) {
        try {
          const scheduledTime = new Date(
            `${dateStr}T${String(post.scheduledHour).padStart(2, '0')}:00:00Z`,
          );

          const result = await postToSocial({
            platform: 'x',
            content: post.content,
            scheduledDate: scheduledTime.toISOString(),
            media: [],
          });

          twitterResults.push({
            scheduledTime: scheduledTime.toISOString(),
            postType: post.postType,
            category: post.category,
            status: result.success ? 'success' : 'error',
            ...(result.success
              ? {}
              : { error: result.error || 'Unknown error' }),
          });
        } catch (postError) {
          twitterResults.push({
            scheduledTime: '',
            postType: post.postType,
            category: post.category,
            status: 'error',
            error:
              postError instanceof Error ? postError.message : 'Unknown error',
          });
        }
      }

      const successCount = twitterResults.filter(
        (r) => r.status === 'success',
      ).length;
      console.log(
        `🐦 Twitter: ${twitterPosts.length} posts generated, ${successCount} sent in ${twitterExecutionTime}ms`,
      );

      cronResults.twitterStandalone = {
        success: true,
        postCount: twitterPosts.length,
        sentCount: successCount,
        posts: twitterResults,
        executionTimeMs: twitterExecutionTime,
      };
    } catch (error) {
      const twitterExecutionTime = Date.now() - twitterStartTime;
      console.error('🐦 Twitter standalone posts failed:', error);
      cronResults.twitterStandalone = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTimeMs: twitterExecutionTime,
      };
    }

    // DAILY TASKS (Every day) - Bluesky Standalone Posts
    console.log('🦋 Generating Bluesky standalone posts...');
    const blueskyStartTime = Date.now();
    try {
      const { generateBlueskyPosts } =
        await import('@/lib/social/standalone-content');
      const blueskyPosts = generateBlueskyPosts(dateStr);
      const blueskyExecutionTime = Date.now() - blueskyStartTime;

      const blueskyResults: Array<{
        scheduledTime: string;
        postType: string;
        category: string;
        status: string;
        error?: string;
      }> = [];

      for (const post of blueskyPosts) {
        try {
          const scheduledTime = new Date(
            `${dateStr}T${String(post.scheduledHour).padStart(2, '0')}:00:00Z`,
          );

          const result = await postToSocial({
            platform: 'bluesky',
            content: post.content,
            scheduledDate: scheduledTime.toISOString(),
            media: [],
          });

          blueskyResults.push({
            scheduledTime: scheduledTime.toISOString(),
            postType: post.postType,
            category: post.category,
            status: result.success ? 'success' : 'error',
            ...(result.success
              ? {}
              : { error: result.error || 'Unknown error' }),
          });
        } catch (postError) {
          blueskyResults.push({
            scheduledTime: '',
            postType: post.postType,
            category: post.category,
            status: 'error',
            error:
              postError instanceof Error ? postError.message : 'Unknown error',
          });
        }
      }

      const successCount = blueskyResults.filter(
        (r) => r.status === 'success',
      ).length;
      console.log(
        `🦋 Bluesky: ${blueskyPosts.length} posts generated, ${successCount} sent in ${blueskyExecutionTime}ms`,
      );

      cronResults.blueskyStandalone = {
        success: true,
        postCount: blueskyPosts.length,
        sentCount: successCount,
        posts: blueskyResults,
        executionTimeMs: blueskyExecutionTime,
      };
    } catch (error) {
      const blueskyExecutionTime = Date.now() - blueskyStartTime;
      console.error('🦋 Bluesky standalone posts failed:', error);
      cronResults.blueskyStandalone = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTimeMs: blueskyExecutionTime,
      };
    }

    // DAILY TASKS (Every day) - Pinterest Evergreen Pins
    console.log('📌 Generating Pinterest evergreen pins...');
    const pinterestStartTime = Date.now();
    try {
      const { generatePinterestPins } =
        await import('@/lib/pinterest/evergreen-content');
      const pinterestPins = generatePinterestPins(dateStr);
      const pinterestExecutionTime = Date.now() - pinterestStartTime;

      const pinterestResults: Array<{
        scheduledTime: string;
        title: string;
        category: string;
        status: string;
        error?: string;
      }> = [];

      for (const pin of pinterestPins) {
        try {
          const scheduledTime = new Date(
            `${dateStr}T${String(pin.scheduledHour).padStart(2, '0')}:00:00Z`,
          );

          const pinBoard = getPinterestBoard(pin.category);

          const pinLink = buildUtmUrl(
            `/grimoire/${pin.category}`,
            'pinterest',
            'social',
            'evergreen_pin',
          );

          const result = await postToSocial({
            platform: 'pinterest',
            content: pin.description,
            scheduledDate: scheduledTime.toISOString(),
            media: [],
            platformSettings: {
              pinterestOptions: {
                ...pinBoard,
                title: pin.title,
                link: pinLink,
              },
            },
          });

          pinterestResults.push({
            scheduledTime: scheduledTime.toISOString(),
            title: pin.title,
            category: pin.category,
            status: result.success ? 'success' : 'error',
            ...(result.success
              ? {}
              : { error: result.error || 'Unknown error' }),
          });
        } catch (postError) {
          pinterestResults.push({
            scheduledTime: '',
            title: pin.title,
            category: pin.category,
            status: 'error',
            error:
              postError instanceof Error ? postError.message : 'Unknown error',
          });
        }
      }

      const successCount = pinterestResults.filter(
        (r) => r.status === 'success',
      ).length;
      console.log(
        `📌 Pinterest: ${pinterestPins.length} pins generated, ${successCount} sent in ${pinterestExecutionTime}ms`,
      );

      cronResults.pinterestEvergreen = {
        success: true,
        pinCount: pinterestPins.length,
        sentCount: successCount,
        pins: pinterestResults,
        executionTimeMs: pinterestExecutionTime,
      };
    } catch (error) {
      const pinterestExecutionTime = Date.now() - pinterestStartTime;
      console.error('📌 Pinterest evergreen pins failed:', error);
      cronResults.pinterestEvergreen = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTimeMs: pinterestExecutionTime,
      };
    }

    // DAILY TASKS (Every day) - Instagram Stories (5 per day, IG-only)
    if (onlySections && !onlySections.has('stories')) {
      cronResults.instagramStories = {
        skipped: true,
        reason: 'Not in sections filter',
      };
    } else {
      console.log('📖 Generating Instagram stories...');
      const storiesStartTime = Date.now();
      try {
        // Dedup guard: skip if stories already attempted today (success or failure)
        const existingStories = await sql`
        SELECT COUNT(*) as count FROM social_posts
        WHERE post_type = 'story' AND platform = 'instagram'
          AND scheduled_date::date = ${dateStr}::date
          AND status IN ('sent', 'failed')
      `;
        if (Number(existingStories.rows[0]?.count || 0) >= 4) {
          console.log('📖 Stories already generated for today, skipping');
          cronResults.instagramStories = {
            success: true,
            storyCount: 0,
            sentCount: 0,
            stories: [],
            skipped: true,
            executionTimeMs: Date.now() - storiesStartTime,
          };
        } else {
          const { generateDailyStoryData } =
            await import('@/lib/instagram/story-content');
          const { seededRandom } = await import('@/lib/instagram/ig-utils');

          const storyItems = generateDailyStoryData(dateStr); // [moon, tarot, rotating1, rotating2]

          // Fill quote slots from DB if today's rotation includes a quote
          const hasQuoteSlot = storyItems.some(
            (s) => s.variant === 'quote' && !s.title,
          );
          if (hasQuoteSlot) {
            let quoteText =
              'The cosmos is within us. We are made of star-stuff.';
            let quoteAuthor = 'Carl Sagan';
            try {
              const quoteResult = await sql`
            SELECT id, quote_text, author
            FROM social_quotes
            WHERE status = 'available'
            ORDER BY use_count ASC, created_at ASC
            LIMIT 50
          `;
              if (quoteResult.rows.length > 0) {
                const quoteRng = seededRandom(`story-quote-${dateStr}`);
                const quoteIndex = Math.floor(
                  quoteRng() * quoteResult.rows.length,
                );
                const quote = quoteResult.rows[quoteIndex];
                quoteText = quote.quote_text;
                quoteAuthor = quote.author || 'Lunary';
                await sql`
              UPDATE social_quotes
              SET use_count = use_count + 1, used_at = NOW(), updated_at = NOW()
              WHERE id = ${quote.id}
            `;
              }
            } catch (quoteError) {
              console.warn(
                '[Stories] Failed to fetch quote, using fallback:',
                quoteError,
              );
            }

            // Replace quote placeholder(s) with actual quote data
            for (let idx = 0; idx < storyItems.length; idx++) {
              if (
                storyItems[idx].variant === 'quote' &&
                !storyItems[idx].title
              ) {
                storyItems[idx] = {
                  variant: 'quote',
                  title: quoteText,
                  subtitle: quoteAuthor,
                  params: {
                    text:
                      quoteAuthor !== 'Lunary'
                        ? `${quoteText} - ${quoteAuthor}`
                        : quoteText,
                    format: 'story',
                    v: '4',
                  },
                  endpoint: '/api/og/social-quote',
                };
              }
            }
          }

          // 4 stories: moon, tarot, rotating1, rotating2
          const allStories = storyItems;
          const storyUtcHours = [9, 12, 15, 19];

          const SHARE_BASE_URL =
            process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

          const storySentResults: Array<{
            scheduledTime: string;
            variant: string;
            status: string;
            error?: string;
          }> = [];

          // Map variant to highlight category for Instagram Highlights
          const VARIANT_TO_HIGHLIGHT: Record<string, string> = {
            daily_moon: 'Moon',
            tarot_pull: 'Tarot',
            quote: 'Quotes',
            did_you_know: 'Grimoire',
            affirmation: 'Affirmations',
            ritual_tip: 'Rituals',
            sign_of_the_day: 'Zodiac',
            transit_alert: 'Cosmic',
            numerology: 'Numerology',
          };

          for (let i = 0; i < allStories.length; i++) {
            const story = allStories[i];
            const utcHour = storyUtcHours[i];
            const scheduledTime = new Date(
              `${dateStr}T${String(utcHour).padStart(2, '0')}:00:00Z`,
            );

            const imageParams = new URLSearchParams(story.params);
            const imageUrl = `${SHARE_BASE_URL}${story.endpoint}?${imageParams.toString()}`;
            const storyCategory =
              VARIANT_TO_HIGHLIGHT[story.variant] || 'Cosmic';

            try {
              // Pre-upload dynamic OG image so Instagram gets a static blob URL
              const staticImageUrl = await preUploadImage(imageUrl);

              const result = await postToSocial({
                platform: 'instagram',
                content: '',
                scheduledDate: scheduledTime.toISOString(),
                media: [
                  { type: 'image', url: staticImageUrl, alt: story.title },
                ],
                platformSettings: {
                  instagramOptions: { isStory: true },
                },
              });

              if (result.success) {
                await sql`
              INSERT INTO social_posts (content, platform, post_type, scheduled_date, status, image_url, story_category, content_type)
              VALUES ('', 'instagram', 'story', ${scheduledTime.toISOString()}, 'sent', ${staticImageUrl}, ${storyCategory}, ${story.variant})
            `;
                storySentResults.push({
                  scheduledTime: scheduledTime.toISOString(),
                  variant: story.variant,
                  status: 'success',
                });
              } else {
                const errorMsg = result.error || 'Unknown error';
                console.error(
                  `[daily-cron] IG story failed (${story.variant}): ${errorMsg}`,
                );
                // Persist failure so the error is visible in the DB
                await sql`
              INSERT INTO social_posts (content, platform, post_type, scheduled_date, status, story_category, content_type, rejection_feedback)
              VALUES ('', 'instagram', 'story', ${scheduledTime.toISOString()}, 'failed', ${storyCategory}, ${story.variant}, ${errorMsg})
            `;
                storySentResults.push({
                  scheduledTime: scheduledTime.toISOString(),
                  variant: story.variant,
                  status: 'error',
                  error: errorMsg,
                });
              }
            } catch (postError) {
              const errorMsg =
                postError instanceof Error
                  ? postError.message
                  : 'Unknown error';
              console.error(
                `[daily-cron] IG story exception (${story.variant}):`,
                postError,
              );
              // Persist exception so the error is visible in the DB
              await sql`
              INSERT INTO social_posts (content, platform, post_type, scheduled_date, status, story_category, content_type, rejection_feedback)
              VALUES ('', 'instagram', 'story', ${scheduledTime.toISOString()}, 'failed', ${storyCategory}, ${story.variant}, ${errorMsg})
            `;
              storySentResults.push({
                scheduledTime: scheduledTime.toISOString(),
                variant: story.variant,
                status: 'error',
                error: errorMsg,
              });
            }
          }

          const storySuccessCount = storySentResults.filter(
            (r) => r.status === 'success',
          ).length;
          const storiesExecutionTime = Date.now() - storiesStartTime;
          console.log(
            `📖 Instagram stories: ${allStories.length} generated, ${storySuccessCount} sent in ${storiesExecutionTime}ms`,
          );

          // Log story pipeline result to admin activity
          try {
            const { logActivity } = await import('@/lib/admin-activity');
            await logActivity({
              activityType: 'cron_execution',
              activityCategory: 'content',
              status:
                storySuccessCount === allStories.length ? 'success' : 'failed',
              message: `Stories: ${storySuccessCount}/${allStories.length} sent`,
              metadata: { stories: storySentResults },
              executionTimeMs: storiesExecutionTime,
            });
          } catch (logError) {
            console.warn('[Stories] Failed to log activity:', logError);
          }

          cronResults.instagramStories = {
            success: true,
            storyCount: allStories.length,
            sentCount: storySuccessCount,
            stories: storySentResults,
            executionTimeMs: storiesExecutionTime,
          };
        } // end of dedup else block
      } catch (error) {
        const storiesExecutionTime = Date.now() - storiesStartTime;
        console.error('📖 Instagram stories failed:', error);

        // Log story pipeline failure to admin activity
        try {
          const { logActivity } = await import('@/lib/admin-activity');
          await logActivity({
            activityType: 'cron_execution',
            activityCategory: 'content',
            status: 'failed',
            message: `Instagram stories failed for ${dateStr}`,
            errorMessage:
              error instanceof Error ? error.message : 'Unknown error',
            executionTimeMs: storiesExecutionTime,
          });
        } catch (logError) {
          console.warn('[Stories] Failed to log activity:', logError);
        }

        cronResults.instagramStories = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          executionTimeMs: storiesExecutionTime,
        };
      }
    } // end stories section filter

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

type SocialVariantKey =
  | 'pinterest'
  | 'facebook'
  | 'threads'
  | 'tiktok'
  | 'twitter'
  | 'bluesky'
  | 'linkedin';

type SocialVariant = {
  content: string;
  media?: string[] | null;
  twitterOptions?: {
    thread: boolean;
    threadNumber: boolean;
  };
};

interface DailySocialPost {
  name: string;
  content: string;
  platforms: string[];
  imageUrls: string[];
  alt: string;
  scheduledDate: string;
  pinterestOptions?: {
    boardId?: string;
  };
  tiktokOptions?: {
    type: string;
    autoAddMusic: boolean;
    visibility: string;
  };
  variants?: Partial<Record<SocialVariantKey, SocialVariant>>;
  pinterestQuoteSlotId?: number;
}

// DAILY SOCIAL MEDIA POSTS
async function runDailyPosts(dateStr: string) {
  console.log('📱 Generating daily social media posts...');

  const productionUrl = 'https://lunary.app';

  try {
    await ensurePinterestQuoteQueue(dateStr, productionUrl);
  } catch (queueError) {
    console.warn(
      '[DailyPosts] Failed to prepare Pinterest quote queue:',
      queueError,
    );
  }

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
  } catch (error: unknown) {
    if ((error as { code?: string })?.code !== '42P01') {
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
  // Transit-specific hashtags: exclude moon phase tags from non-moon posts
  const transitPlatformHashtags = getAllPlatformHashtags(dateStr, {
    ...cosmicContext,
    moonPhase: undefined,
  });
  const majorTransitBase = new Date(dateStr + 'T16:00:00Z');
  let majorTransitOffsetMinutes = 0;
  const getMajorTransitSchedule = () => {
    const scheduled = new Date(majorTransitBase);
    scheduled.setMinutes(scheduled.getMinutes() + majorTransitOffsetMinutes);
    majorTransitOffsetMinutes += 15;
    return scheduled.toISOString();
  };
  const getCosmicFormat = (platform: string): ImageFormat =>
    getPlatformImageFormat(platform === 'x' ? 'twitter' : platform);
  const posts: DailySocialPost[] = [];

  // Transit post scheduling - avoid existing content slots at 12:00, 17:00, 20:00 UTC
  // Space evenly through the day with ~4h gaps so posts don't hammer in a burst
  const transitTimeSlots = [
    { hour: 7, label: 'primary' }, // UK early morning
    { hour: 11, label: 'secondary' }, // UK late morning
    { hour: 15, label: 'tertiary' }, // UK afternoon, US East morning
    { hour: 19, label: 'backup' }, // UK evening, US afternoon
  ];
  let transitSlotIndex = 0;
  const getTransitSchedule = () => {
    const slot = transitTimeSlots[transitSlotIndex % transitTimeSlots.length];
    transitSlotIndex++;
    return new Date(
      `${dateStr}T${String(slot.hour).padStart(2, '0')}:00:00Z`,
    ).toISOString();
  };

  // NEW: Detect upcoming sign changes and retrograde stations (tomorrow vs today)
  // Post BEFORE events happen to eliminate duplicates and give followers a heads-up
  const today = new Date(dateStr);
  const tomorrow = new Date(dateStr);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Detect retrograde/direct stations happening TOMORROW (post TODAY)
  const upcomingStations = await detectUpcomingRetrogradeStations(
    today,
    tomorrow,
  );

  // Add text-first transit and retrograde updates for X, Threads, and Bluesky
  const retrogradeTextPosts = buildRetrogradeTextPosts({
    dateStr,
    events: upcomingStations,
    platformHashtags: transitPlatformHashtags,
    getSchedule: getTransitSchedule,
  });
  const { ingresses, egresses } = await detectUpcomingSignChanges(
    today,
    tomorrow,
  );

  // Get tomorrow's positions for duration info on slow planet ingresses
  const tomorrowData = await getGlobalCosmicData(tomorrow);
  const tomorrowPositions = tomorrowData?.planetaryPositions;

  const ingressTextPosts = buildIngressTextPosts({
    dateStr,
    ingressEvents: ingresses,
    platformHashtags: transitPlatformHashtags,
    getSchedule: getTransitSchedule,
    tomorrowPositions,
  });

  const egressTextPosts = buildEgressTextPosts({
    dateStr,
    egressEvents: egresses,
    platformHashtags: transitPlatformHashtags,
    getSchedule: getTransitSchedule,
  });

  // Build supermoon posts (same day is fine for visual events)
  const supermoonTextPosts = buildSupermoonTextPosts({
    dateStr,
    moonPhase: cosmicContent.astronomicalData?.moonPhase ?? {},
    platformHashtags,
    getSchedule: getTransitSchedule,
  });

  // Build micromoon posts (same day is fine for visual events)
  const micromoonTextPosts = buildMicromoonTextPosts({
    dateStr,
    moonPhase: cosmicContent.astronomicalData?.moonPhase ?? {},
    platformHashtags,
    getSchedule: getTransitSchedule,
  });

  // Build eclipse posts (day BEFORE the eclipse)
  const upcomingEclipses = getUpcomingEclipses(today, 1); // Check next month
  const eclipseTextPosts = buildEclipseTextPosts({
    dateStr,
    eclipses: upcomingEclipses,
    platformHashtags,
    getSchedule: getTransitSchedule,
  });

  // Build moon phase posts (New, Full, First/Last Quarter)
  const moonPhaseTextPosts = buildMoonPhaseTextPosts({
    dateStr,
    moonPhase: cosmicContent.astronomicalData?.moonPhase ?? {},
    moonSign: cosmicContent.astronomicalData?.planets?.Moon?.sign,
    platformHashtags,
    getSchedule: getTransitSchedule,
  });

  // Build transit milestone posts for slow planets (halfway, 3mo, 1mo, 1wk remaining)
  const transitMilestones = await detectTransitMilestones(today);
  const transitMilestoneTextPosts = buildTransitMilestoneTextPosts({
    dateStr,
    milestones: transitMilestones,
    platformHashtags: transitPlatformHashtags,
    getSchedule: getTransitSchedule,
  });

  // Build countdown posts (3 days and 7 days before major retrogrades/sign changes)
  const countdownEvents = await detectMajorEventCountdowns(today);
  const countdownTextPosts = buildCountdownTextPosts({
    dateStr,
    countdowns: countdownEvents,
    platformHashtags: transitPlatformHashtags,
    getSchedule: getTransitSchedule,
  });

  // Build separate focused posts for significant aspects
  const aspectSource = Array.isArray(cosmicContent.dailyAspects)
    ? cosmicContent.dailyAspects
    : (cosmicContent.aspectEvents ?? []);
  const aspectTextPosts = buildAspectTextPosts({
    dateStr,
    aspects: aspectSource,
    platformHashtags: transitPlatformHashtags,
    getSchedule: getTransitSchedule,
  });

  posts.push(...retrogradeTextPosts);
  posts.push(...ingressTextPosts);
  posts.push(...egressTextPosts);
  posts.push(...supermoonTextPosts);
  posts.push(...micromoonTextPosts);
  posts.push(...eclipseTextPosts);
  posts.push(...moonPhaseTextPosts);
  posts.push(...transitMilestoneTextPosts);
  posts.push(...countdownTextPosts);
  posts.push(...aspectTextPosts);

  const pinterestQuoteSlot = await getPinterestQuoteForDate(dateStr);
  if (pinterestQuoteSlot) {
    if (pinterestQuoteSlot.status === 'pending') {
      const quoteAttribution = pinterestQuoteSlot.quoteAuthor
        ? ` - ${pinterestQuoteSlot.quoteAuthor}`
        : '';
      const quoteFull =
        `${pinterestQuoteSlot.quoteText}${quoteAttribution}`.trim();
      const pinterestQuoteContent = platformHashtags.pinterest
        ? `${quoteFull}\n\n${platformHashtags.pinterest}`
        : quoteFull;
      const format = getCosmicFormat('pinterest');
      const baseImageUrl =
        pinterestQuoteSlot.imageUrl ??
        getQuoteImageUrl(pinterestQuoteSlot.quoteText, productionUrl, {
          author: pinterestQuoteSlot.quoteAuthor || undefined,
          format,
        });
      const imageUrls = baseImageUrl ? [baseImageUrl] : [];

      posts.push({
        name: `Pinterest Quote • ${new Date(dateStr).toLocaleDateString(
          'en-US',
          {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          },
        )}`,
        content: pinterestQuoteContent,
        platforms: ['pinterest'],
        imageUrls,
        alt: `Pinterest quote for ${dateStr}`,
        scheduledDate: new Date(dateStr + 'T17:00:00Z').toISOString(),
        variants: {
          pinterest: {
            content: pinterestQuoteContent,
            media: imageUrls,
          },
        },
        pinterestQuoteSlotId: pinterestQuoteSlot.id,
      });
    } else {
      console.log(
        `[DailyPosts] Pinterest quote for ${dateStr} already marked ${pinterestQuoteSlot.status}`,
      );
    }
  } else {
    console.warn(`[DailyPosts] No Pinterest quote scheduled for ${dateStr}`);
  }

  // Send posts via social client
  const postResults: any[] = [];

  for (const post of posts) {
    try {
      // Add Pinterest options if Pinterest is in platforms
      const pinterestOptions = post.platforms.includes('pinterest')
        ? getPinterestBoard('quotes')
        : undefined;

      // Pre-upload dynamic OG images so platforms get static blob URLs
      const media = await Promise.all(
        (post.imageUrls || []).map(async (imageUrl: string) => ({
          type: 'image' as const,
          url: await preUploadImage(imageUrl),
          alt: post.alt,
        })),
      );

      // Also pre-upload any media URLs inside variants (e.g. Pinterest)
      const variants = post.variants ? { ...post.variants } : undefined;
      if (variants) {
        for (const [key, variant] of Object.entries(variants)) {
          if (variant && Array.isArray(variant.media)) {
            variants[key as keyof typeof variants] = {
              ...variant,
              media: await Promise.all(
                variant.media.map((url: string) => preUploadImage(url)),
              ),
            };
          }
        }
      }

      const multiResult = await postToSocialMultiPlatform({
        platforms: post.platforms,
        content: post.content,
        scheduledDate: post.scheduledDate,
        media,
        variants,
        name: post.name,
        pinterestOptions: pinterestOptions as any,
        pinterestLink: post.platforms.includes('pinterest')
          ? buildUtmUrl('/grimoire', 'pinterest', 'social', 'daily_quote')
          : undefined,
        ...(post.platforms.includes('threads')
          ? { platformSettings: { threads: { topic_tag: 'Astrology' } } }
          : {}),
      });

      // Check if all platforms succeeded
      const platformResults = Object.entries(multiResult.results);
      const allSucceeded = platformResults.every(([, r]) => r.success);
      const anySucceeded = platformResults.some(([, r]) => r.success);

      if (anySucceeded) {
        console.log(`✅ ${post.name} post scheduled successfully`);
        const firstSuccess = platformResults.find(([, r]) => r.success);
        postResults.push({
          name: post.name,
          platforms: post.platforms,
          status: allSucceeded ? 'success' : 'partial',
          postId: firstSuccess?.[1]?.postId,
          scheduledDate: post.scheduledDate,
        });
        if (post.pinterestQuoteSlotId) {
          await markPinterestQuoteSent(post.pinterestQuoteSlotId);
        }
      } else {
        const firstError = platformResults.find(([, r]) => !r.success);
        const errorMessage = firstError?.[1]?.error || 'All platforms failed';

        console.error(`❌ ${post.name} post failed:`, multiResult.results);

        // Log individual post failures
        try {
          const { logActivity } = await import('@/lib/admin-activity');
          await logActivity({
            activityType: 'content_creation',
            activityCategory: 'content',
            status: 'failed',
            message: `Failed to schedule post "${post.name}" for ${dateStr}`,
            metadata: {
              postName: post.name,
              platforms: post.platforms,
              error: errorMessage,
              results: multiResult.results,
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
    } catch (error: unknown) {
      if ((error as { code?: string })?.code !== '42P01') {
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
        posts[0]?.content ||
        cosmicContent?.primaryEvent?.name ||
        'Daily cosmic posts';

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
          s.user_email as email,
          s.user_name as name,
          s.trial_ends_at,
          s.plan_type as plan
        FROM subscriptions s
        WHERE s.status = 'trial'
        AND s.trial_ends_at::date = ${formatDate(threeDaysFromNow)}
        AND (s.trial_reminder_3d_sent = false OR s.trial_reminder_3d_sent IS NULL)
        AND s.user_email IS NOT NULL
        AND NOT (
          s.has_discount = true
          AND (
            COALESCE(s.discount_percent, 0) >= 100
            OR (s.monthly_amount_due IS NOT NULL AND s.monthly_amount_due <= 0)
          )
        )
        AND (s.promo_code IS NULL OR s.promo_code != 'FULLORBIT')
      `;

      // Get trials ending in 1 day (final reminder)
      const oneDayReminders = await sql`
        SELECT DISTINCT
          s.user_id,
          s.user_email as email,
          s.user_name as name,
          s.trial_ends_at,
          s.plan_type as plan
        FROM subscriptions s
        WHERE s.status = 'trial'
        AND s.trial_ends_at::date = ${formatDate(oneDayFromNow)}
        AND (s.trial_reminder_1d_sent = false OR s.trial_reminder_1d_sent IS NULL)
        AND s.user_email IS NOT NULL
        AND NOT (
          s.has_discount = true
          AND (
            COALESCE(s.discount_percent, 0) >= 100
            OR (s.monthly_amount_due IS NOT NULL AND s.monthly_amount_due <= 0)
          )
        )
        AND (s.promo_code IS NULL OR s.promo_code != 'FULLORBIT')
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
          s.user_email as email,
          s.user_name as name,
          s.trial_ends_at
        FROM subscriptions s
        WHERE s.status = 'trial'
        AND s.trial_ends_at::date = ${formatDate(yesterday)}
        AND (s.trial_expired_email_sent = false OR s.trial_expired_email_sent IS NULL)
        AND s.user_email IS NOT NULL
        AND NOT (
          s.has_discount = true
          AND (
            COALESCE(s.discount_percent, 0) >= 100
            OR (s.monthly_amount_due IS NOT NULL AND s.monthly_amount_due <= 0)
          )
        )
        AND (s.promo_code IS NULL OR s.promo_code != 'FULLORBIT')
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
              `${process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app'}/api/ether/cv`,
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

function getBaseUrl(_request: NextRequest): string {
  // Use hardcoded URLs to prevent SSRF attacks
  return process.env.VERCEL ? 'https://lunary.app' : 'http://localhost:3000';
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

function addHashtags(text: string, hashtags?: string): string {
  if (!hashtags || !hashtags.trim()) {
    return text;
  }
  return `${text}\n\n${hashtags.trim()}`;
}

/**
 * Dynamic event-specific hashtag generation.
 * Produces 1-2 tags specific to the actual event (planet, sign, event type)
 * then lets the factory's rotated contextual tags fill remaining slots.
 */
type EventHashtagType =
  | 'transit'
  | 'retrograde'
  | 'aspect'
  | 'eclipse'
  | 'moon';

function buildEventTags(
  eventType: EventHashtagType,
  context: { planet?: string; sign?: string; dateStr: string },
): string[] {
  const tags: string[] = [];
  const seen = new Set<string>();

  const add = (tag: string) => {
    const t = tag.toLowerCase();
    if (t && !seen.has(t)) {
      seen.add(t);
      tags.push(t);
    }
  };

  // Event-specific tag first (most relevant to the actual content)
  if (eventType === 'retrograde' && context.planet) {
    add(`#${context.planet.toLowerCase()}retrograde`);
  } else if (eventType === 'eclipse') {
    add('#eclipseseason');
  } else if (eventType === 'moon') {
    add('#moonphases');
  } else if (eventType === 'transit' || eventType === 'aspect') {
    add('#astrology');
  }

  // Sign tag for retrogrades and eclipses (skip planet name — too generic)
  if (
    (eventType === 'retrograde' || eventType === 'eclipse') &&
    context.sign &&
    context.sign !== 'in transit'
  ) {
    add(`#${context.sign.toLowerCase()}`);
  }

  return tags;
}

function addEventHashtags(
  text: string,
  factoryHashtags: string | undefined,
  eventType: EventHashtagType,
  context: { planet?: string; sign?: string; dateStr: string },
  limit: number = 3,
): string {
  const eventTags = buildEventTags(eventType, context);
  const factoryTags = (factoryHashtags || '').split(/\s+/).filter(Boolean);

  // Event-specific tags first (1-2), then factory's rotated tags fill remaining
  const merged: string[] = [];
  const seen = new Set<string>();

  for (const tag of [...eventTags, ...factoryTags]) {
    const t = tag.toLowerCase();
    if (!seen.has(t) && merged.length < limit) {
      seen.add(t);
      merged.push(t);
    }
  }

  return addHashtags(text, merged.join(' '));
}

const retrogradeReflectionTemplates = [
  'This is a reflective phase for {focus}, especially around clarity and follow-through.',
  'This transit slows momentum, making it a useful time to review {focus} rather than push ahead.',
  'You may notice {focus} feels more inward or uncertain, inviting patience rather than action.',
  'There’s value in pausing to reassess {focus} during this retrograde.',
  'How this shows up depends on your chart, but the collective tone leans reflective rather than decisive for {focus}.',
];

function getRetrogradeReflectionLine(focus: string, sign?: string): string {
  const index =
    (focus.length +
      (sign?.length ?? 0) +
      retrogradeReflectionTemplates.length) %
    retrogradeReflectionTemplates.length;
  return retrogradeReflectionTemplates[index].replace('{focus}', focus);
}

/** Format eventTime as relative hours from now */
function formatRelativeTime(eventTime?: Date): string {
  if (!eventTime) return 'later today';
  const hoursAway = (eventTime.getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursAway < 1) return 'in <1h';
  return `in ~${Math.round(hoursAway)}h`;
}

function buildRetrogradeTextPosts({
  dateStr,
  events,
  getSchedule,
  platformHashtags,
}: {
  dateStr: string;
  events: RetrogradeStationEvent[];
  getSchedule: () => string;
  platformHashtags: Record<string, string>;
}): DailySocialPost[] {
  const focusMap: Record<string, string> = {
    Mercury: 'communication and planning',
    Venus: 'relationships, beauty, and values',
    Mars: 'how you take action and claim energy',
    Jupiter: 'growth, belief, and expansion',
    Saturn: 'structure, responsibility, and long-term goals',
    Uranus: 'innovation, rebellion, and freedom',
    Neptune: 'dreams, intuition, and spiritual connection',
    Pluto: 'transformation, power, and deep renewal',
  };

  const retrogradeEvents = (events || []).filter(
    (event) =>
      event?.planet &&
      (event.type === 'retrograde_start' || event.type === 'retrograde_end') &&
      event?.sign,
  );

  const posts: DailySocialPost[] = [];

  for (const event of retrogradeEvents) {
    const planet = event.planet;
    if (!planet) continue;

    const focus = focusMap[planet] || `${planet.toLowerCase()} energy`;
    const isRetrograde = event.type === 'retrograde_start';
    const timeStr = formatRelativeTime(event.eventTime);

    // Create seed for deterministic hook selection
    const seed = `retrograde-${planet}-${event.type}-${dateStr}`;
    const engagementHook = getEngagementHook('retrograde', seed);

    // Threads: conversational with engagement hook
    const threadsBody = isRetrograde
      ? [
          `${planet} stations retrograde ${timeStr} in ${event.sign}.`,
          `Time to slow down and review ${focus}.`,
          '',
          engagementHook,
        ].join('\n')
      : [
          `${planet} stations direct ${timeStr} in ${event.sign}.`,
          `Momentum returns to ${focus}.`,
          '',
          engagementHook,
        ].join('\n');
    const retroCtx = { planet, sign: event.sign, dateStr };
    const threadsContent = addEventHashtags(
      threadsBody,
      platformHashtags.threads,
      'retrograde',
      retroCtx,
      0,
    );

    // X/Twitter: compact
    const xBody = isRetrograde
      ? [
          `${planet} stations retrograde ${timeStr}.`,
          `Time to slow down and review ${focus}.`,
        ].join('\n')
      : [
          `${planet} stations direct ${timeStr}.`,
          `Momentum returns to ${focus}.`,
        ].join('\n');
    const xContent = addEventHashtags(
      xBody,
      platformHashtags.twitter,
      'retrograde',
      retroCtx,
      2,
    );

    // Bluesky: informational
    const blueskyBody = isRetrograde
      ? [
          `${planet} stations retrograde ${timeStr} in ${event.sign}.`,
          `Time to slow down and review ${focus}.`,
        ].join('\n')
      : [
          `${planet} stations direct ${timeStr} in ${event.sign}.`,
          `Momentum returns to ${focus}.`,
        ].join('\n');
    const blueskyContent = addEventHashtags(
      blueskyBody,
      platformHashtags.bluesky,
      'retrograde',
      retroCtx,
    );

    posts.push({
      name: `Retrograde • ${planet} ${isRetrograde ? 'Retrograde' : 'Direct'} ${timeStr}`,
      content: xContent,
      platforms: ['x', 'bluesky', 'threads'],
      imageUrls: [],
      alt: `${planet} ${isRetrograde ? 'retrograde' : 'direct'} station ${timeStr}`,
      scheduledDate: getSchedule(),
      variants: {
        bluesky: { content: blueskyContent },
        twitter: { content: xContent },
        threads: { content: threadsContent },
      },
    });
  }

  return posts;
}

/**
 * Build separate posts for planet ingress events (entering new signs)
 * One focused post per ingress event with platform-specific content
 */
function buildIngressTextPosts({
  dateStr,
  ingressEvents,
  platformHashtags,
  getSchedule,
  tomorrowPositions,
}: {
  dateStr: string;
  ingressEvents: Array<any>;
  platformHashtags: Record<string, string>;
  getSchedule: () => string;
  tomorrowPositions?: Record<string, any>;
}): DailySocialPost[] {
  const posts: DailySocialPost[] = [];
  const events = (ingressEvents || []).filter(
    (event) => event?.planet && event?.sign,
  );

  // Slow planets get duration info
  const slowPlanets = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

  for (const event of events) {
    const planet = event.planet;
    const sign = event.sign;
    const energy = event.energy || 'fresh';
    const previousSign = event.previousSign;
    const timeStr = formatRelativeTime(event.eventTime);

    // Get duration info for slow planets from tomorrow's positions
    let durationText = '';
    if (slowPlanets.includes(planet) && tomorrowPositions?.[planet]?.duration) {
      const duration = tomorrowPositions[planet].duration;
      if (duration.totalDays) {
        const years = Math.round(duration.totalDays / 365);
        const months = Math.round(duration.totalDays / 30);
        if (years >= 1) {
          durationText = `This ~${years} year transit begins.`;
        } else if (months >= 2) {
          durationText = `This ~${months} month transit begins.`;
        }
      }
    }

    // Create seed for deterministic hook selection
    const seed = `ingress-${planet}-${sign}-${dateStr}`;
    const engagementHook = getEngagementHook('ingress', seed);

    // Threads: conversational with engagement hook
    const threadsBodyParts = [
      `${planet} enters ${sign} ${timeStr}.`,
      durationText || `A shift toward ${energy} energy begins.`,
      '',
      engagementHook,
    ];
    const threadsBody = threadsBodyParts.join('\n');
    const ingressCtx = { planet, sign, dateStr };
    const threadsContent = addEventHashtags(
      threadsBody,
      platformHashtags.threads,
      'transit',
      ingressCtx,
      0,
    );

    // X/Twitter: compact with CTA
    const xBodyParts = [`${planet} enters ${sign} ${timeStr}.`];
    if (durationText) {
      xBodyParts.push(durationText);
    } else if (previousSign) {
      xBodyParts.push(`Moving from ${previousSign} into ${energy} energy.`);
    } else {
      xBodyParts.push(`A shift toward ${energy} energy begins.`);
    }
    const xBody = xBodyParts.join('\n');
    const xContent = addEventHashtags(
      xBody,
      platformHashtags.twitter,
      'transit',
      ingressCtx,
      2,
    );

    // Bluesky: informational
    const blueskyBodyParts = [
      `${planet} enters ${sign} ${timeStr}.`,
      durationText || `A shift toward ${energy} energy begins.`,
    ];
    const blueskyBody = blueskyBodyParts.join('\n');
    const blueskyContent = addEventHashtags(
      blueskyBody,
      platformHashtags.bluesky,
      'transit',
      ingressCtx,
    );

    posts.push({
      name: `Ingress • ${planet} enters ${sign} ${timeStr}`,
      content: xContent,
      platforms: ['x', 'bluesky', 'threads'],
      imageUrls: [],
      alt: `${planet} enters ${sign} ${timeStr}`,
      scheduledDate: getSchedule(),
      variants: {
        bluesky: { content: blueskyContent },
        twitter: { content: xContent },
        threads: { content: threadsContent },
      },
    });
  }

  return posts;
}

/**
 * Build separate posts for significant daily aspects
 * Focuses on planet-to-planet connections with meaningful interpretation
 */
function buildAspectTextPosts({
  dateStr,
  aspects,
  platformHashtags,
  getSchedule,
}: {
  dateStr: string;
  aspects: Array<any>;
  platformHashtags: Record<string, string>;
  getSchedule: () => string;
}): DailySocialPost[] {
  const posts: DailySocialPost[] = [];

  // Filter valid aspects
  const validAspects = (aspects || []).filter(
    (aspect: any) => aspect?.planetA && aspect?.planetB && aspect?.aspect,
  );

  if (validAspects.length === 0) return posts;

  // Sort by priority (higher first), take top 4 aspects
  const sortedAspects = [...validAspects].sort(
    (a, b) => (b.priority || 5) - (a.priority || 5),
  );
  const selectedAspects = sortedAspects.slice(0, 4);

  for (const aspect of selectedAspects) {
    const planetA = aspect.planetA?.name || aspect.planetA;
    const planetB = aspect.planetB?.name || aspect.planetB;
    const signA = aspect.planetA?.constellation || 'in transit';
    const signB = aspect.planetB?.constellation || 'in transit';
    const aspectType = aspect.aspect?.toLowerCase() || 'aspect';
    const aspectLabel =
      aspectType.charAt(0).toUpperCase() + aspectType.slice(1);

    // Get aspect nature for description
    const aspectNature = aspectNatures[aspectType] || {
      nature: 'connecting',
      keyword: 'cosmic alignment',
    };

    // Get planet keywords for richer description
    const planetAInfo = planetKeywords[planetA] || {
      domain: planetA.toLowerCase(),
    };
    const planetBInfo = planetKeywords[planetB] || {
      domain: planetB.toLowerCase(),
    };

    // Get sign energies for richer context
    const signAEnergy = signA !== 'in transit' ? getSignDescription(signA) : '';
    const signBEnergy = signB !== 'in transit' ? getSignDescription(signB) : '';

    // Build energy description based on aspect type
    const isTension = isTensionAspect(aspectType);
    let energyDescription = '';

    if (signAEnergy && signBEnergy) {
      if (isTension) {
        energyDescription = `${planetAInfo.domain} meets resistance, challenging ${signAEnergy} drive with ${signBEnergy} force`;
      } else if (aspectType === 'conjunction') {
        energyDescription = `${planetAInfo.domain} and ${planetBInfo.domain} unite, amplifying ${signAEnergy} energy`;
      } else if (aspectType === 'trine' || aspectType === 'sextile') {
        energyDescription = `${planetAInfo.domain} flows harmoniously with ${planetBInfo.domain}, blending ${signAEnergy} and ${signBEnergy} energies`;
      } else {
        energyDescription = `${planetAInfo.domain} connects with ${planetBInfo.domain}, weaving ${signAEnergy} and ${signBEnergy} themes`;
      }
    } else {
      // Fallback if signs not available
      const connectionWord = isTension
        ? 'Tension between'
        : 'Connection between';
      energyDescription = `${connectionWord} ${planetAInfo.domain} and ${planetBInfo.domain}`;
    }

    // Create seed for deterministic hook selection
    const seed = `aspect-${planetA}-${aspectType}-${planetB}-${dateStr}`;
    const engagementHook = getAspectHook(aspectType, seed);

    // Format headline with signs
    const headlineWithSigns =
      signA !== 'in transit' && signB !== 'in transit'
        ? `${planetA} in ${signA} ${aspectLabel.toLowerCase()}s ${planetB} in ${signB}`
        : `${planetA} ${aspectLabel.toLowerCase()} ${planetB}`;

    // Threads: conversational with engagement hook
    const threadsBody = [
      headlineWithSigns,
      energyDescription,
      '',
      engagementHook,
    ].join('\n');
    const aspectCtx = {
      planet: planetA,
      sign: signA !== 'in transit' ? signA : signB,
      dateStr,
    };
    const threadsContent = addEventHashtags(
      threadsBody,
      platformHashtags.threads,
      'aspect',
      aspectCtx,
      0,
    );

    // X/Twitter: compact
    const xBody = [headlineWithSigns, energyDescription].join('\n');
    const xContent = addEventHashtags(
      xBody,
      platformHashtags.twitter,
      'aspect',
      aspectCtx,
      2,
    );

    // Bluesky: informational
    const blueskyBody = [headlineWithSigns, energyDescription].join('\n');
    const blueskyContent = addEventHashtags(
      blueskyBody,
      platformHashtags.bluesky,
      'aspect',
      aspectCtx,
    );

    posts.push({
      name: `Aspect • ${planetA} ${aspectLabel} ${planetB}`,
      content: xContent,
      platforms: ['x', 'bluesky', 'threads'],
      imageUrls: [],
      alt: `${planetA} ${aspectLabel} ${planetB}`,
      scheduledDate: getSchedule(),
      variants: {
        bluesky: { content: blueskyContent },
        twitter: { content: xContent },
        threads: { content: threadsContent },
      },
    });
  }

  return posts;
}

/**
 * Build posts for egress events (planet's final day in a sign)
 * Framed as "final day" rather than "leaving" - posted BEFORE the change
 */
function buildEgressTextPosts({
  dateStr,
  egressEvents,
  platformHashtags,
  getSchedule,
}: {
  dateStr: string;
  egressEvents: SignChangeEvent[];
  platformHashtags: Record<string, string>;
  getSchedule: () => string;
}): DailySocialPost[] {
  const posts: DailySocialPost[] = [];
  const events = (egressEvents || []).filter(
    (event) => event?.planet && event?.sign,
  );

  for (const event of events) {
    const planet = event.planet;
    const sign = event.sign;
    const nextSign = event.nextSign || 'a new sign';
    const energy = event.energy || 'transitional';
    const timeStr = formatRelativeTime(event.eventTime);

    // Create seed for deterministic hook selection
    const seed = `egress-${planet}-${sign}-${dateStr}`;
    const engagementHook = getEngagementHook('egress', seed);

    // Threads: conversational with engagement hook
    const threadsBody = [
      `${planet}'s last hours in ${sign}.`,
      `${planet} enters ${nextSign} ${timeStr}.`,
      '',
      engagementHook,
    ].join('\n');
    const egressCtx = { planet, sign, dateStr };
    const threadsContent = addEventHashtags(
      threadsBody,
      platformHashtags.threads,
      'transit',
      egressCtx,
      0,
    );

    // X/Twitter: compact
    const xBody = [
      `${planet}'s last hours in ${sign}.`,
      `${planet} enters ${nextSign} ${timeStr}.`,
    ].join('\n');
    const xContent = addEventHashtags(
      xBody,
      platformHashtags.twitter,
      'transit',
      egressCtx,
      2,
    );

    // Bluesky: informational
    const blueskyBody = [
      `${planet}'s last hours in ${sign}.`,
      `${planet} enters ${nextSign} ${timeStr}.`,
    ].join('\n');
    const blueskyContent = addEventHashtags(
      blueskyBody,
      platformHashtags.bluesky,
      'transit',
      egressCtx,
    );

    posts.push({
      name: `Egress • ${planet}'s last hours in ${sign}`,
      content: xContent,
      platforms: ['x', 'bluesky', 'threads'],
      imageUrls: [],
      alt: `${planet}'s last hours in ${sign}`,
      scheduledDate: getSchedule(),
      variants: {
        bluesky: { content: blueskyContent },
        twitter: { content: xContent },
        threads: { content: threadsContent },
      },
    });
  }

  return posts;
}

/**
 * Build posts for supermoon events (full moon when moon is extra close)
 * Only posts for Full Moon supermoons (the visual spectacle)
 */
function buildSupermoonTextPosts({
  dateStr,
  moonPhase,
  platformHashtags,
  getSchedule,
}: {
  dateStr: string;
  moonPhase: {
    name: string;
    isSuperMoon?: boolean;
    energy?: string;
  };
  platformHashtags: Record<string, string>;
  getSchedule: () => string;
}): DailySocialPost[] {
  const posts: DailySocialPost[] = [];

  // Only post for Full Moon supermoons
  if (!moonPhase?.isSuperMoon) return posts;
  const isFullMoon = moonPhase.name?.toLowerCase().includes('full');
  if (!isFullMoon) return posts;

  const seed = `supermoon-${dateStr}`;
  const engagementHook = getEngagementHook('supermoon', seed);

  // Threads: emotional and conversational
  const threadsBody = [
    'Supermoon tonight.',
    'The moon is extra close, amplifying emotional intensity.',
    '',
    engagementHook,
  ].join('\n');
  const moonCtx = { dateStr };
  const threadsContent = addEventHashtags(
    threadsBody,
    platformHashtags.threads,
    'moon',
    moonCtx,
    0,
  );

  // X/Twitter: compact with CTA
  const xBody = [
    'Supermoon Full Moon tonight.',
    'Emotions amplified. What is illuminated for you?',
    '',
    'lunary.app',
  ].join('\n');
  const xContent = addEventHashtags(
    xBody,
    platformHashtags.twitter,
    'moon',
    moonCtx,
    2,
  );

  // Bluesky: informational with CTA
  const blueskyBody = [
    'Supermoon Full Moon tonight.',
    'The moon is at its closest, making it appear larger and brighter.',
    '',
    'Track lunar events at lunary.app',
  ].join('\n');
  const blueskyContent = addEventHashtags(
    blueskyBody,
    platformHashtags.bluesky,
    'moon',
    moonCtx,
  );

  posts.push({
    name: `Supermoon • Full Moon`,
    content: xContent,
    platforms: ['x', 'bluesky', 'threads'],
    imageUrls: [],
    alt: 'Supermoon Full Moon',
    scheduledDate: getSchedule(),
    variants: {
      bluesky: { content: blueskyContent },
      twitter: { content: xContent },
      threads: { content: threadsContent },
    },
  });

  return posts;
}

/**
 * Build posts for micromoon events
 * Posts on the day of micromoon Full Moons (moon at apogee)
 */
function buildMicromoonTextPosts({
  dateStr,
  moonPhase,
  platformHashtags,
  getSchedule,
}: {
  dateStr: string;
  moonPhase: { name: string; isMicroMoon?: boolean; energy?: string };
  platformHashtags: Record<string, string>;
  getSchedule: () => string;
}): DailySocialPost[] {
  const posts: DailySocialPost[] = [];

  // Only post for Full Moon micromoons (parallel to supermoon logic)
  if (!moonPhase?.isMicroMoon) return posts;
  const isFullMoon = moonPhase.name?.toLowerCase().includes('full');
  if (!isFullMoon) return posts;

  const seed = `micromoon-${dateStr}`;
  const engagementHook = getEngagementHook('micromoon', seed);

  // Threads: emotional and conversational
  const threadsBody = [
    'Micromoon Full Moon tonight.',
    'The moon is at its farthest point, appearing smaller—distant perspective reveals hidden truths.',
    '',
    engagementHook,
  ].join('\n');
  const microCtx = { dateStr };
  const threadsContent = addEventHashtags(
    threadsBody,
    platformHashtags.threads,
    'moon',
    microCtx,
    0,
  );

  // X/Twitter: compact with CTA
  const xBody = [
    'Micromoon Full Moon tonight.',
    'The moon is at apogee—small but significant. What truths emerge from distance?',
    '',
    'lunary.app',
  ].join('\n');
  const xContent = addEventHashtags(
    xBody,
    platformHashtags.twitter,
    'moon',
    microCtx,
    2,
  );

  // Bluesky: informational with CTA
  const blueskyBody = [
    'Micromoon Full Moon tonight.',
    'The moon is at its farthest point (apogee), appearing smaller and providing a different perspective.',
    '',
    'Track lunar events at lunary.app',
  ].join('\n');
  const blueskyContent = addEventHashtags(
    blueskyBody,
    platformHashtags.bluesky,
    'moon',
    microCtx,
  );

  posts.push({
    name: `Micromoon • Full Moon`,
    content: xContent,
    platforms: ['x', 'bluesky', 'threads'],
    imageUrls: [],
    alt: 'Micromoon Full Moon',
    scheduledDate: getSchedule(),
    variants: {
      bluesky: { content: blueskyContent },
      twitter: { content: xContent },
      threads: { content: threadsContent },
    },
  });

  return posts;
}

/**
 * Build posts for eclipse events
 * Posts the DAY BEFORE the eclipse (when daysAway is between 0.5 and 1.5)
 */
function buildEclipseTextPosts({
  dateStr,
  eclipses,
  platformHashtags,
  getSchedule,
}: {
  dateStr: string;
  eclipses: EclipseEvent[];
  platformHashtags: Record<string, string>;
  getSchedule: () => string;
}): DailySocialPost[] {
  const posts: DailySocialPost[] = [];

  // Filter for eclipses happening tomorrow (daysAway ~ 1)
  const tomorrowEclipses = (eclipses || []).filter(
    (eclipse) => eclipse.daysAway >= 0.5 && eclipse.daysAway <= 1.5,
  );

  for (const eclipse of tomorrowEclipses) {
    const seed = `eclipse-${eclipse.type}-${eclipse.sign}-${dateStr}`;
    const engagementHook = getEngagementHook('eclipse', seed);

    const eclipseLabel =
      eclipse.type === 'solar' ? 'Solar Eclipse' : 'Lunar Eclipse';
    const kindLabel = eclipse.kind || '';

    const hoursAway = `~${Math.round(eclipse.daysAway * 24)} hours`;
    const eclipseCtx = { sign: eclipse.sign, dateStr };

    // X/Twitter: compact with CTA
    const xBody = [
      `${kindLabel} ${eclipseLabel} in ${eclipse.sign} in ${hoursAway}.`,
      'Major cosmic portal opening.',
      '',
      'lunary.app',
    ].join('\n');
    const xContent = addEventHashtags(
      xBody,
      platformHashtags.twitter,
      'eclipse',
      eclipseCtx,
      2,
    );

    // Bluesky: informational with CTA
    const blueskyBody = [
      `${kindLabel} ${eclipseLabel} in ${eclipse.sign} in ${hoursAway}.`,
      'Eclipse season brings fate-level shifts and new beginnings.',
      '',
      'Track eclipse impact at lunary.app',
    ].join('\n');
    const blueskyContent = addEventHashtags(
      blueskyBody,
      platformHashtags.bluesky,
      'eclipse',
      eclipseCtx,
    );

    posts.push({
      name: `Eclipse • ${kindLabel} ${eclipseLabel} in ${eclipse.sign}`,
      content: xContent,
      platforms: ['x', 'bluesky', 'threads'],
      imageUrls: [],
      alt: `${kindLabel} ${eclipseLabel} in ${eclipse.sign} in ${hoursAway}`,
      scheduledDate: getSchedule(),
      variants: {
        bluesky: { content: blueskyContent },
        twitter: { content: xContent },
      },
    });
  }

  return posts;
}

/**
 * Build posts for significant moon phases (New Moon, Full Moon, First/Last Quarter)
 * Posts on the day of the moon phase
 */
function buildMoonPhaseTextPosts({
  dateStr,
  moonPhase,
  moonSign,
  platformHashtags,
  getSchedule,
}: {
  dateStr: string;
  moonPhase: {
    name: string;
    energy?: string;
    isSignificant?: boolean;
    isSuperMoon?: boolean;
  };
  moonSign?: string;
  platformHashtags: Record<string, string>;
  getSchedule: () => string;
}): DailySocialPost[] {
  const posts: DailySocialPost[] = [];

  // Only post for significant phases (New, Full, First Quarter, Last Quarter)
  if (!moonPhase?.isSignificant) return posts;

  // Skip if it's a supermoon - that gets its own post
  if (moonPhase.isSuperMoon && moonPhase.name?.toLowerCase().includes('full')) {
    return posts;
  }

  const phaseName = moonPhase.name || 'Moon Phase';
  const energy = moonPhase.energy || '';
  const signText = moonSign ? ` in ${moonSign}` : '';

  // Determine hook type based on phase - use dedicated moon phase hooks
  let hookType: HookType = 'general';
  const phaseNameLower = phaseName.toLowerCase();
  if (phaseNameLower.includes('new')) {
    hookType = 'newMoon';
  } else if (phaseNameLower.includes('full')) {
    hookType = 'fullMoon';
  } else if (phaseNameLower.includes('first quarter')) {
    hookType = 'firstQuarter';
  } else if (phaseNameLower.includes('last quarter')) {
    hookType = 'lastQuarter';
  }

  const seed = `moon-${phaseName}-${dateStr}`;
  const engagementHook = getEngagementHook(hookType, seed);

  // Phase-specific messaging
  let phaseDescription = '';
  if (phaseName.toLowerCase().includes('new')) {
    phaseDescription = 'Time for new intentions and fresh starts.';
  } else if (phaseName.toLowerCase().includes('full')) {
    phaseDescription = 'Time for illumination and release.';
  } else if (phaseName.toLowerCase().includes('first quarter')) {
    phaseDescription = 'Time for action and decision-making.';
  } else if (phaseName.toLowerCase().includes('last quarter')) {
    phaseDescription = 'Time for reflection and letting go.';
  } else {
    phaseDescription = energy;
  }

  // Threads: conversational with engagement hook
  const threadsBody = [
    `${phaseName}${signText} today.`,
    phaseDescription,
    '',
    engagementHook,
  ].join('\n');
  const phaseCtx = { sign: moonSign, dateStr };
  const threadsContent = addEventHashtags(
    threadsBody,
    platformHashtags.threads,
    'moon',
    phaseCtx,
    0,
  );

  // X/Twitter: compact with CTA
  const xBody = [
    `${phaseName}${signText} today.`,
    phaseDescription,
    '',
    'lunary.app',
  ].join('\n');
  const xContent = addEventHashtags(
    xBody,
    platformHashtags.twitter,
    'moon',
    phaseCtx,
    2,
  );

  // Bluesky: informational with CTA
  const blueskyBody = [
    `${phaseName}${signText} today.`,
    phaseDescription,
    '',
    'Track moon phases at lunary.app',
  ].join('\n');
  const blueskyContent = addEventHashtags(
    blueskyBody,
    platformHashtags.bluesky,
    'moon',
    phaseCtx,
  );

  posts.push({
    name: `Moon Phase • ${phaseName}`,
    content: xContent,
    platforms: ['x', 'bluesky', 'threads'],
    imageUrls: [],
    alt: `${phaseName}${signText}`,
    scheduledDate: getSchedule(),
    variants: {
      bluesky: { content: blueskyContent },
      twitter: { content: xContent },
      threads: { content: threadsContent },
    },
  });

  return posts;
}

/**
 * Build posts for slow planet transit milestones
 * Posts at: halfway point, 3 months remaining, 1 month remaining, 1 week remaining
 */
function buildTransitMilestoneTextPosts({
  dateStr,
  milestones,
  platformHashtags,
  getSchedule,
}: {
  dateStr: string;
  milestones: TransitMilestoneEvent[];
  platformHashtags: Record<string, string>;
  getSchedule: () => string;
}): DailySocialPost[] {
  const posts: DailySocialPost[] = [];

  const planetThemes: Record<string, string> = {
    Mercury: 'communication, thinking, and connection',
    Venus: 'love, beauty, and values',
    Mars: 'action, drive, and desire',
    Jupiter: 'expansion, growth, and opportunity',
    Saturn: 'structure, discipline, and mastery',
    Uranus: 'innovation, awakening, and liberation',
    Neptune: 'spirituality, imagination, and transcendence',
    Pluto: 'transformation, power, and rebirth',
  };

  // Zodiac signs in order for calculating next sign
  const zodiacSigns = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ];

  const getNextSign = (currentSign: string): string => {
    const index = zodiacSigns.indexOf(currentSign);
    if (index === -1) return 'the next sign';
    return zodiacSigns[(index + 1) % zodiacSigns.length];
  };

  for (const milestone of milestones) {
    const { planet, sign, milestoneLabel, remainingDays, totalDays } =
      milestone;
    const theme = planetThemes[planet] || `${planet.toLowerCase()} energy`;
    const nextSign = getNextSign(sign);

    // Get sign energies for transition messaging
    const currentSignEnergy = getSignDescription(sign);
    const nextSignEnergy = getSignDescription(nextSign);

    // Create seed for deterministic hook selection
    const seed = `milestone-${planet}-${sign}-${milestone.milestone}-${dateStr}`;
    const engagementHook = getEngagementHook('transitMilestone', seed);

    // Milestones that use "leaving/entering" format (countdown to sign change)
    const isCountdownMilestone = [
      '1_month',
      '2_weeks',
      '1_week',
      '3_days',
      'tomorrow',
    ].includes(milestone.milestone);

    // Current transit duration (totalDays is now cumulative across retrograde segments)
    const transitYears = Math.round(totalDays / 365);
    const transitMonths = Math.round(totalDays / 30);

    // Duration in the NEXT sign (look up its actual segments, not reuse current)
    const nextSignTotalDays =
      getSlowPlanetSignTotalDays(planet, nextSign) ?? totalDays;
    const nextSignYears = Math.round(nextSignTotalDays / 365);
    const nextSignMonths = Math.round(nextSignTotalDays / 30);
    let durationInNextSign = '';
    if (nextSignYears >= 1) {
      durationInNextSign = `~${nextSignYears} ${nextSignYears === 1 ? 'year' : 'years'} in ${nextSign}`;
    } else if (nextSignMonths >= 2) {
      durationInNextSign = `~${nextSignMonths} months in ${nextSign}`;
    } else {
      durationInNextSign = `~${Math.round(nextSignTotalDays)} days in ${nextSign}`;
    }

    let threadsBody = '';
    let xBody = '';
    let blueskyBody = '';
    let postName = '';

    if (isCountdownMilestone) {
      // Format: "Jupiter leaves Aries and enters Taurus in ~1 week"
      // "~12 years in Taurus"
      // "Shifting from initiating energy to grounding energy"

      const timeframe =
        milestone.milestone === 'tomorrow'
          ? `~${Math.round(remainingDays * 24)} hours`
          : milestone.milestone === '3_days'
            ? '~3 days'
            : milestone.milestone === '1_week'
              ? '~1 week'
              : milestone.milestone === '2_weeks'
                ? '~2 weeks'
                : '~1 month';

      const headline = `${planet} leaves ${sign} and enters ${nextSign} in ${timeframe}`;
      const energyShift = `Shifting from ${currentSignEnergy} to ${nextSignEnergy} energy`;

      // Threads: detailed with engagement hook
      threadsBody = [
        headline,
        durationInNextSign,
        energyShift,
        '',
        engagementHook,
      ].join('\n');

      // X/Twitter: compact
      xBody = [headline, durationInNextSign, energyShift].join('\n');

      // Bluesky: informational
      blueskyBody = [headline, durationInNextSign, energyShift].join('\n');

      postName = `Transit Milestone • ${planet} leaves ${sign}, enters ${nextSign} ${timeframe}`;
    } else {
      // For halfway, 6_months, 3_months: traditional milestone format
      let durationContext = '';
      if (milestone.milestone === 'halfway') {
        const durationLabel =
          transitYears >= 1
            ? `${transitYears}-year`
            : transitMonths >= 2
              ? `${transitMonths}-month`
              : totalDays >= 14
                ? `${Math.round(totalDays / 7)}-week`
                : `${Math.round(totalDays)}-day`;
        durationContext = `This ${durationLabel} transit is at the midpoint.`;
      } else {
        durationContext = `${milestoneLabel} in this transit.`;
      }

      // Threads: reflective with engagement hook
      threadsBody = [
        `${planet} in ${sign}: ${milestoneLabel}.`,
        durationContext,
        `Themes of ${theme} continue to unfold.`,
        '',
        engagementHook,
      ].join('\n');

      // X/Twitter: compact
      xBody = [
        `${planet} in ${sign}: ${milestoneLabel}.`,
        `Themes of ${theme} continue.`,
      ].join('\n');

      // Bluesky: informational
      blueskyBody = [
        `${planet} in ${sign}: ${milestoneLabel}.`,
        durationContext,
      ].join('\n');

      postName = `Transit Milestone • ${planet} in ${sign} ${milestoneLabel}`;
    }

    const milestoneCtx = { planet, sign, dateStr };
    const threadsContent = addEventHashtags(
      threadsBody,
      platformHashtags.threads,
      'transit',
      milestoneCtx,
      0,
    );
    const xContent = addEventHashtags(
      xBody,
      platformHashtags.twitter,
      'transit',
      milestoneCtx,
      2,
    );
    const blueskyContent = addEventHashtags(
      blueskyBody,
      platformHashtags.bluesky,
      'transit',
      milestoneCtx,
    );

    posts.push({
      name: postName,
      content: xContent,
      platforms: ['x', 'bluesky', 'threads'],
      imageUrls: [],
      alt: `${planet} in ${sign} - ${milestoneLabel}`,
      scheduledDate: getSchedule(),
      variants: {
        bluesky: { content: blueskyContent },
        twitter: { content: xContent },
        threads: { content: threadsContent },
      },
    });
  }

  return posts;
}

/**
 * Build posts for major transit countdowns
 * Posts 3 days and 7 days before major retrogrades and sign changes
 */
function buildCountdownTextPosts({
  dateStr,
  countdowns,
  platformHashtags,
  getSchedule,
}: {
  dateStr: string;
  countdowns: CountdownEvent[];
  platformHashtags: Record<string, string>;
  getSchedule: () => string;
}): DailySocialPost[] {
  const posts: DailySocialPost[] = [];

  for (const countdown of countdowns) {
    const { planet, sign, daysUntil, event, type } = countdown;
    const seed = `countdown-${type}-${planet}-${sign}-${daysUntil}-${dateStr}`;
    const engagementHook = getEngagementHook(
      type === 'retrograde_countdown' ? 'retrograde' : 'ingress',
      seed,
    );

    let actionAdvice = '';
    if (event === 'retrograde_start') {
      actionAdvice =
        daysUntil === 7
          ? 'Start backing up files and reviewing plans.'
          : 'Final preparations—back up tech, confirm travel, wrap up contracts.';
    } else if (event === 'retrograde_end') {
      actionAdvice =
        daysUntil === 7
          ? 'Forward momentum resumes soon.'
          : 'Direct motion in 3 days—prepare to move forward.';
    } else if (event === 'sign_ingress') {
      actionAdvice =
        daysUntil === 7
          ? 'This generational transit begins soon.'
          : 'Major energy shift in 3 days.';
    }

    // Threads: urgent + conversational
    const threadsBody = [countdown.name, actionAdvice, '', engagementHook]
      .filter(Boolean)
      .join('\n');
    const countdownEventType: EventHashtagType =
      type === 'retrograde_countdown' ? 'retrograde' : 'transit';
    const countdownCtx = { planet, sign, dateStr };
    const threadsContent = addEventHashtags(
      threadsBody,
      platformHashtags.threads,
      countdownEventType,
      countdownCtx,
      0,
    );

    // X: compact
    const xBody = [countdown.name, actionAdvice].filter(Boolean).join('\n');
    const xContent = addEventHashtags(
      xBody,
      platformHashtags.twitter,
      countdownEventType,
      countdownCtx,
      2,
    );

    // Bluesky: informational
    const blueskyBody = [countdown.name, countdown.energy]
      .filter(Boolean)
      .join('\n');
    const blueskyContent = addEventHashtags(
      blueskyBody,
      platformHashtags.bluesky,
      countdownEventType,
      countdownCtx,
    );

    posts.push({
      name: `Countdown • ${countdown.name}`,
      content: xContent,
      platforms: ['x', 'bluesky', 'threads'],
      imageUrls: [],
      alt: countdown.name,
      scheduledDate: getSchedule(),
      variants: {
        bluesky: { content: blueskyContent },
        twitter: { content: xContent },
        threads: { content: threadsContent },
      },
    });
  }

  return posts;
}

function formatTransitAspectLine(aspect: any): string {
  const planetA = aspect.planetA?.name || aspect.planetA || 'Planet A';
  const planetB = aspect.planetB?.name || aspect.planetB || 'Planet B';
  const aspectLabel = aspect.aspect
    ? `${aspect.aspect.charAt(0).toUpperCase()}${aspect.aspect.slice(1)}`
    : 'Aspect';
  const constellation =
    aspect.planetA?.constellation && aspect.planetB?.constellation
      ? `in ${aspect.planetA.constellation}-${aspect.planetB.constellation}`
      : '';
  const separation = aspect.separation ? `at ${aspect.separation}°` : '';
  const parts = [planetA, aspectLabel, planetB];
  if (constellation) parts.push(constellation);
  if (separation) parts.push(separation);
  return `${parts.filter(Boolean).join(' ')}.`;
}
