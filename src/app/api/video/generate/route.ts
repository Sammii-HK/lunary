import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { sql } from '@vercel/postgres';
import { composeVideo } from '@/lib/video/compose-video';
import { generateVoiceover } from '@/lib/tts';
import { generateVoiceoverScriptFromWeeklyData } from '@/lib/video/composition';
import { TTS_PRESETS } from '@/lib/tts/presets';
import { normalizeScriptForTTS } from '@/lib/tts/normalize-script';

// Feature flags for video rendering
const USE_REMOTION_RENDERER = process.env.USE_REMOTION_RENDERER === 'true';
import {
  generateNarrativeFromWeeklyData,
  generateShortFormNarrative,
  generateMediumFormNarrative,
  generateVideoPostContent,
  segmentScriptIntoItems,
  segmentScriptIntoMediumItems,
} from '@/lib/video/narrative-generator';
import { generateTopicImages } from '@/lib/video/image-generator';
import { resolveThemeCategory } from '@/lib/video/theme-category';
import { BRAND_COLORS, getThemePalette } from '@/lib/video/theme-palette';
import { clampHueShift, getThemeHueBase } from '@/lib/video/hue';
import { generateWeeklyContent } from '../../../../../utils/blog/weeklyContentGenerator';
import { sendDiscordNotification } from '@/lib/discord';

// Version for cache invalidation - increment when prompts change
const SCRIPT_VERSION = {
  short: 'v13', // v13: 2s end buffer for subtitle visibility, extended music
  medium: 'v18', // v18: 2s end buffer for subtitle visibility, extended music
  long: 'v16', // v16: 2s end buffer for subtitle visibility, extended music
};

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for video generation

interface GenerateVideoRequest {
  type: 'short' | 'medium' | 'long';
  week?: number;
  blogContent?: {
    title: string;
    description?: string;
    body?: string;
    slug?: string;
  };
}

function getWeekDates(weekOffset: number): string {
  const now = new Date();
  const targetDate = new Date(
    now.getTime() + weekOffset * 7 * 24 * 60 * 60 * 1000,
  );

  const dayOfWeek = targetDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(
    targetDate.getTime() - daysToMonday * 24 * 60 * 60 * 1000,
  );
  const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
}

function getWeekStartFromOffset(weekOffset: number): Date {
  const now = new Date();
  const currentDayOfWeek = now.getDay();
  const daysToCurrentMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
  const currentWeekMonday = new Date(now);
  currentWeekMonday.setDate(now.getDate() - daysToCurrentMonday);
  currentWeekMonday.setHours(0, 0, 0, 0);

  const weekStart = new Date(currentWeekMonday);
  weekStart.setDate(currentWeekMonday.getDate() + weekOffset * 7);
  weekStart.setHours(0, 0, 0, 0);

  return weekStart;
}

function getWeekOfYear(weekStart: Date): { year: number; weekOfYear: number } {
  const yearStart = new Date(weekStart.getFullYear(), 0, 1);
  const daysSinceYearStart = Math.floor(
    (weekStart.getTime() - yearStart.getTime()) / (24 * 60 * 60 * 1000),
  );
  const weekOfYear = Math.floor(daysSinceYearStart / 7) + 1;
  return { year: weekStart.getFullYear(), weekOfYear };
}

const normalizeHueDelta = (delta: number) => {
  let normalized = ((delta + 180) % 360) - 180;
  if (normalized < -180) normalized += 360;
  return normalized;
};

// const buildIntroImageUrl = ({
//   baseUrl,
//   weeklyData,
//   format,
//   weekOffset,
//   paletteParams,
// }: {
//   baseUrl: string;
//   weeklyData: any;
//   format: string;
//   weekOffset: number;
//   paletteParams: string;
// }) => {
//   const weekOf = weeklyData.weekStart.toLocaleDateString('en-US', {
//     month: 'long',
//     day: 'numeric',
//   });
//   const year = weeklyData.weekStart.getFullYear();
//   const introTitle = `Week of ${weekOf}, ${year}`;
//   const introSubtitle = weeklyData.subtitle || '';

//   return `${baseUrl}/api/social/images?format=${format}&title=${encodeURIComponent(introTitle)}&subtitle=${encodeURIComponent(introSubtitle)}&week=${weekOffset}${paletteParams}`;
// };

const buildPaletteParams = ({
  bg,
  fg,
  accent,
  highlight,
  lockHue,
}: {
  bg: string;
  fg: string;
  accent: string;
  highlight: string;
  lockHue?: boolean;
}) => {
  const params = new URLSearchParams();
  params.set('bg', bg);
  params.set('fg', fg);
  params.set('accent', accent);
  params.set('highlight', highlight);
  if (lockHue) {
    params.set('lockHue', '1');
  }
  return `&${params.toString()}`;
};

/**
 * Truncate content to fit platform character limits
 * Attempts to truncate at word boundaries when possible
 */
function truncateContent(content: string, maxLength: number): string {
  if (content.length <= maxLength) {
    return content;
  }

  // Try to truncate at word boundary
  const truncated = content.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.8) {
    // If we can find a space reasonably close to the limit, use it
    return truncated.substring(0, lastSpace) + '...';
  }

  // Otherwise, just truncate and add ellipsis
  return truncated + '...';
}

/**
 * Schedule video to appropriate platforms based on type
 * - Short form: Instagram Stories, Instagram Reels, Threads (text-only), Twitter/X, Bluesky (scheduled)
 * - Medium form: TikTok, Instagram Reels, YouTube Shorts (posted immediately)
 * - Long form: YouTube (already handled via upload route)
 */
async function scheduleVideoToPlatforms(
  videoUrl: string,
  videoType: 'short' | 'medium' | 'long',
  title: string,
  description: string,
  baseUrl: string,
  postContent?: string | null,
  weeklyData?: any,
  blogSlug?: string,
): Promise<void> {
  const apiKey = process.env.SUCCULENT_SECRET_KEY;
  const accountGroupId = process.env.SUCCULENT_ACCOUNT_GROUP_ID;

  if (!apiKey || !accountGroupId) {
    console.warn('Succulent API not configured, skipping video scheduling');
    return;
  }

  const succulentApiUrl = 'https://app.succulent.social/api/posts';
  const dateStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const scheduledDate = new Date(now);
  scheduledDate.setHours(21, 30, 0, 0);
  if (scheduledDate < now) {
    scheduledDate.setDate(scheduledDate.getDate() + 1);
  }

  if (videoType === 'short') {
    // Short form: Schedule to Instagram Stories, Instagram Reels, Threads, Twitter/X, and Bluesky
    // Use postContent if available (generated from weekly data), otherwise fall back to description
    const content = postContent || description;

    // Instagram Stories
    const storyPost = {
      accountGroupId,
      name: `Lunary Short - Instagram Stories - ${dateStr}`,
      content: content,
      platforms: ['instagram'],
      scheduledDate: scheduledDate.toISOString(),
      media: [{ type: 'video' as const, url: videoUrl, alt: title }],
      instagramOptions: { stories: true },
    };

    // Instagram Reels
    const reelPost = {
      accountGroupId,
      name: `Lunary Short - Instagram Reel - ${dateStr}`,
      content: content,
      platforms: ['instagram'],
      scheduledDate: scheduledDate.toISOString(),
      media: [{ type: 'video' as const, url: videoUrl, alt: title }],
      instagramOptions: { type: 'reel' as const },
    };

    // Threads - generate Threads-specific content with categorizing hashtags
    let threadsContent = content;
    if (weeklyData) {
      try {
        const { generateVideoPostContent } =
          await import('@/lib/video/narrative-generator');
        threadsContent = await generateVideoPostContent(
          weeklyData,
          videoType,
          blogSlug,
          'threads',
        );
        // Truncate to 300 characters for Threads
        threadsContent = truncateContent(threadsContent, 300);
      } catch (error) {
        console.warn(
          'Failed to generate Threads-specific content, using default:',
          error,
        );
        // Fallback: use regular content but ensure it's truncated
        threadsContent = truncateContent(content, 300);
      }
    } else {
      // No weeklyData available, use regular content truncated
      threadsContent = truncateContent(content, 300);
    }

    const threadsPost = {
      accountGroupId,
      name: `Lunary Short - Threads - ${dateStr}`,
      content: threadsContent,
      platforms: ['threads'],
      scheduledDate: scheduledDate.toISOString(),
    };

    // Twitter/X - 280 character limit
    const twitterContent = content.replace(/\n/g, ' '); // Twitter doesn't support line breaks well
    const twitterPost = {
      accountGroupId,
      name: `Lunary Short - Twitter - ${dateStr}`,
      content: truncateContent(twitterContent, 280),
      platforms: ['twitter'],
      scheduledDate: scheduledDate.toISOString(),
      media: [{ type: 'video' as const, url: videoUrl, alt: title }],
      twitterOptions: {
        thread: false,
        threadNumber: false,
      },
    };

    // Bluesky - 300 character limit
    const blueskyPost = {
      accountGroupId,
      name: `Lunary Short - Bluesky - ${dateStr}`,
      content: truncateContent(content, 300),
      platforms: ['bluesky'],
      scheduledDate: scheduledDate.toISOString(),
      media: [{ type: 'video' as const, url: videoUrl, alt: title }],
    };

    // Post to Instagram Stories
    try {
      const response = await fetch(succulentApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(storyPost),
      });

      if (response.ok) {
        console.log(
          `✅ Scheduled short-form video to Instagram Stories for ${scheduledDate.toISOString()}`,
        );
      } else {
        const error = await response.text();
        console.error(
          `❌ Failed to schedule short-form video to Instagram Stories: ${response.status} ${error}`,
        );
      }
    } catch (error) {
      console.error(
        'Error scheduling short-form video to Instagram Stories:',
        error,
      );
    }

    // Post to Instagram Reels
    try {
      const response = await fetch(succulentApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(reelPost),
      });

      if (response.ok) {
        console.log(
          `✅ Scheduled short-form video to Instagram Reels for ${scheduledDate.toISOString()}`,
        );
      } else {
        const error = await response.text();
        console.error(
          `❌ Failed to schedule short-form video to Instagram Reels: ${response.status} ${error}`,
        );
      }
    } catch (error) {
      console.error(
        'Error scheduling short-form video to Instagram Reels:',
        error,
      );
    }

    // Post to Threads
    try {
      const response = await fetch(succulentApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(threadsPost),
      });

      if (response.ok) {
        console.log(
          `✅ Scheduled short-form video to Threads for ${scheduledDate.toISOString()}`,
        );
      } else {
        const error = await response.text();
        console.error(
          `❌ Failed to schedule short-form video to Threads: ${response.status} ${error}`,
        );
      }
    } catch (error) {
      console.error('Error scheduling short-form video to Threads:', error);
    }

    // Post to Twitter/X
    try {
      const response = await fetch(succulentApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(twitterPost),
      });

      if (response.ok) {
        console.log(
          `✅ Scheduled short-form video to Twitter/X for ${scheduledDate.toISOString()}`,
        );
      } else {
        const error = await response.text();
        console.error(
          `❌ Failed to schedule short-form video to Twitter/X: ${response.status} ${error}`,
        );
      }
    } catch (error) {
      console.error('Error scheduling short-form video to Twitter/X:', error);
    }

    // Post to Bluesky (if it supports videos)
    try {
      const response = await fetch(succulentApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(blueskyPost),
      });

      if (response.ok) {
        console.log(
          `✅ Scheduled short-form video to Bluesky for ${scheduledDate.toISOString()}`,
        );
      } else {
        const error = await response.text();
        // Log as warning since Bluesky may not support videos yet
        console.warn(
          `⚠️ Failed to schedule short-form video to Bluesky (may not support videos): ${response.status} ${error}`,
        );
      }
    } catch (error) {
      console.warn(
        'Error scheduling short-form video to Bluesky (may not support videos):',
        error,
      );
    }
  } else if (videoType === 'medium') {
    // Medium form: Schedule to TikTok, Instagram Reels, YouTube Shorts
    // Use postContent if available (generated from weekly data), otherwise fall back to description
    const content = postContent || description;
    // TikTok - post immediately (omit scheduledDate)
    const tiktokPost = {
      accountGroupId,
      name: `Lunary Medium - TikTok - ${dateStr}`,
      content: content,
      platforms: ['tiktok'],
      media: [{ type: 'video' as const, url: videoUrl, alt: title }],
      scheduledDate: scheduledDate.toISOString(),
      tiktokOptions: {
        visibility: 'public',
        isAiGenerated: true,
      },
    };

    // Instagram Reels - post immediately
    const reelPost = {
      accountGroupId,
      name: `Lunary Medium - Instagram Reel - ${dateStr}`,
      content: content,
      platforms: ['instagram'],
      media: [{ type: 'video' as const, url: videoUrl, alt: title }],
      scheduledDate: scheduledDate.toISOString(),
      instagramOptions: { type: 'reel' as const },
    };

    const youtubeShortPost = {
      accountGroupId,
      name: `Lunary Medium - YouTube Short - ${dateStr}`,
      content: content,
      platforms: ['youtube'],
      media: [{ type: 'video' as const, url: videoUrl, alt: title }],
      scheduledDate: scheduledDate.toISOString(),
    };

    // Post to TikTok
    try {
      const tiktokResponse = await fetch(succulentApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(tiktokPost),
      });

      if (tiktokResponse.ok) {
        console.log('✅ Posted medium-form video to TikTok');
      } else {
        const error = await tiktokResponse.text();
        console.error(
          `❌ Failed to post to TikTok: ${tiktokResponse.status} ${error}`,
        );
      }
    } catch (error) {
      console.error('Error posting to TikTok:', error);
    }

    // Post to Instagram Reels
    try {
      const reelResponse = await fetch(succulentApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(reelPost),
      });

      if (reelResponse.ok) {
        console.log('✅ Posted medium-form video to Instagram Reels');
      } else {
        const error = await reelResponse.text();
        console.error(
          `❌ Failed to post to Instagram Reels: ${reelResponse.status} ${error}`,
        );
      }
    } catch (error) {
      console.error('Error posting to Instagram Reels:', error);
    }

    // Post to YouTube Shorts via Succulent
    try {
      const youtubeResponse = await fetch(succulentApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(youtubeShortPost),
      });

      if (youtubeResponse.ok) {
        console.log('✅ Scheduled medium-form video to YouTube Shorts');
      } else {
        const error = await youtubeResponse.text();
        console.error(
          `❌ Failed to schedule YouTube Shorts: ${youtubeResponse.status} ${error}`,
        );
      }
    } catch (error) {
      console.error('Error scheduling YouTube Shorts:', error);
    }
  }
  // Long form videos are already handled via YouTube upload route
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateVideoRequest = await request.json();
    const { type, week, blogContent } = body;

    if (!type || (type !== 'short' && type !== 'medium' && type !== 'long')) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "short", "medium", or "long"' },
        { status: 400 },
      );
    }

    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    let imageUrl: string;
    let videoFormat: 'story' | 'square' | 'landscape' | 'youtube';
    let title: string;
    let description: string;
    let weekNumber: number | null = null;
    let blogSlug: string | null = null;

    if (type === 'short') {
      // Short-form video: use story format
      if (week === undefined) {
        return NextResponse.json(
          { error: 'Week number is required for short-form videos' },
          { status: 400 },
        );
      }

      weekNumber = week;
      const weekRange = getWeekDates(week);
      imageUrl = `${baseUrl}/api/social/images?week=${week}&format=story`;
      videoFormat = 'story';
      title = `Week of ${weekRange}`;
      description = 'Your weekly cosmic forecast from Lunary';
    } else if (type === 'medium') {
      // Medium-form video: use story format (vertical for Reels/TikTok/YouTube Shorts)
      if (week === undefined) {
        return NextResponse.json(
          { error: 'Week number is required for medium-form videos' },
          { status: 400 },
        );
      }

      weekNumber = week;
      const weekRange = getWeekDates(week);
      videoFormat = 'story';
      // Title will be set from weeklyData.title after generation
      title = `Weekly Cosmic Forecast - Week of ${weekRange}`;
      description = 'Your quick weekly cosmic forecast from Lunary';
      // imageUrl will be set based on weekly data after we generate it
      imageUrl = ''; // Temporary, will be set later
    } else {
      // Long-form video: use YouTube format
      // Can use blogContent if provided, otherwise will use weekly data
      if (blogContent) {
        blogSlug = blogContent.slug || null;
        videoFormat = 'youtube';
        title = blogContent.title;
        // Description will be set from weeklyData.subtitle after we generate it
        // This ensures it has the correct date
        description = blogContent.description || '';
        // imageUrl will be set from weeklyData after generation to ensure correct subtitle with date
        imageUrl = ''; // Temporary, will be set later
      } else {
        // Use weekly data for long-form (will be set in script generation section)
        videoFormat = 'youtube';
        title = 'Weekly Cosmic Forecast';
        description = 'Your comprehensive weekly cosmic forecast from Lunary';
        // imageUrl will be set based on weekly data after we generate it
        imageUrl = ''; // Temporary, will be set later
      }
    }

    // Generate or retrieve voiceover script (cached by week/blog)
    let script: string | undefined;
    let weeklyData: Awaited<ReturnType<typeof generateWeeklyContent>> | null =
      null;
    let themePaletteParams = '';
    let introPaletteParams = '';
    let hueShiftBase = 0;
    let themeCategory = '';
    let resolvedThemePalette: ReturnType<typeof getThemePalette> | null = null;

    // Determine cache key for script and audio
    let scriptCacheKey: string | null = null;
    let audioCacheKey: string | null = null;
    let weekKey: string | null = null;

    if (type === 'short') {
      // Short-form: cache by week number + version
      if (week === undefined) {
        return NextResponse.json(
          { error: 'Week number is required for short-form videos' },
          { status: 400 },
        );
      }
      const weekStart = getWeekStartFromOffset(week);
      const { year, weekOfYear } = getWeekOfYear(weekStart);
      weekKey = `${year}-w${weekOfYear}`;
      const version = SCRIPT_VERSION.short;
      scriptCacheKey = `scripts/short/${version}/${weekKey}.txt`;
      audioCacheKey = `audio/short/${version}/${weekKey}.mp3`;

      // Get weekly content data for short-form
      // weekOffset represents weeks from current week's Monday
      // week=0 = current week, week=1 = next week, etc.
      weeklyData = await generateWeeklyContent(weekStart);
    } else if (type === 'medium') {
      // Medium-form: cache by week number + version
      if (week === undefined) {
        return NextResponse.json(
          { error: 'Week number is required for medium-form videos' },
          { status: 400 },
        );
      }
      const weekStart = getWeekStartFromOffset(week);
      const { year, weekOfYear } = getWeekOfYear(weekStart);
      weekKey = `${year}-w${weekOfYear}`;
      const version = SCRIPT_VERSION.medium;
      scriptCacheKey = `scripts/medium/${version}/${weekKey}.txt`;
      audioCacheKey = `audio/medium/${version}/${weekKey}.mp3`;

      // Get weekly content data for medium-form
      // weekOffset represents weeks from current week's Monday
      // week=0 = current week, week=1 = next week, etc.
      const safeWeekForLog = String(week).replace(/[\r\n]/g, '');
      console.log(
        `[Medium Video] Generating for week offset ${safeWeekForLog}: weekStart=${weekStart.toISOString()}`,
      );

      weeklyData = await generateWeeklyContent(weekStart);
      console.log(
        `✅ Generated weeklyData for medium-form video: weekStart=${weeklyData.weekStart.toISOString()}, title="${weeklyData.title}", subtitle="${weeklyData.subtitle}"`,
      );

      // Update title and description to use the weekly data (same as intro slide)
      if (weeklyData?.title) {
        title = weeklyData.title;
      }
      if (weeklyData?.subtitle) {
        description = weeklyData.subtitle;
      }

      // Set imageUrl from weekly data
      if (weeklyData) {
        imageUrl = `${baseUrl}/api/social/images?format=story&title=${encodeURIComponent(weeklyData.title)}&subtitle=${encodeURIComponent(weeklyData.subtitle || '')}`;
      }
    } else {
      // Long-form: cache by blog slug or week number of year + version
      // First calculate weekStart to get the actual week number of the year
      const now = new Date();
      let weekStart: Date;

      if (week !== undefined) {
        // Use the week parameter if provided (for manual generation)
        // weekOffset represents weeks from current week's Monday
        const currentDayOfWeek = now.getDay();
        const daysToCurrentMonday =
          currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
        const currentWeekMonday = new Date(now);
        currentWeekMonday.setDate(now.getDate() - daysToCurrentMonday);
        currentWeekMonday.setHours(0, 0, 0, 0);

        // Calculate the target week's Monday
        weekStart = new Date(currentWeekMonday);
        weekStart.setDate(currentWeekMonday.getDate() + week * 7);
        console.log(
          `📅 Long-form video: Using week parameter ${week}, weekStart=${weekStart.toISOString()}, currentWeekMonday=${currentWeekMonday.toISOString()}`,
        );
      } else {
        // Default to current week if no week parameter
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        weekStart = new Date(
          now.getTime() - daysToMonday * 24 * 60 * 60 * 1000,
        );
        console.log(
          `📅 Long-form video: No week parameter provided, using current week, weekStart=${weekStart.toISOString()}`,
        );
      }

      weekStart.setHours(0, 0, 0, 0);

      // Calculate actual week number of the year (1-53)
      const yearStart = new Date(weekStart.getFullYear(), 0, 1);
      const daysSinceYearStart = Math.floor(
        (weekStart.getTime() - yearStart.getTime()) / (24 * 60 * 60 * 1000),
      );
      const weekOfYear = Math.floor(daysSinceYearStart / 7) + 1;
      const year = weekStart.getFullYear();

      // Use actual week number of year in cache key (e.g., "2025-w50")
      if (blogSlug) {
        weekKey = `blog-${blogSlug}-${year}-w${weekOfYear}`;
      } else {
        weekKey = `${year}-w${weekOfYear}`;
      }
      const version = SCRIPT_VERSION.long;
      scriptCacheKey = `scripts/long/${version}/${weekKey}.txt`;
      audioCacheKey = `audio/long/${version}/${weekKey}.mp3`;

      console.log(
        `🔑 Long-form cache key: ${weekKey} (weekOfYear=${weekOfYear}, year=${year}, week=${week}, blogSlug=${blogSlug || 'none'})`,
      );

      // Long-form: ALWAYS get weekly content (required for topic images)
      try {
        weeklyData = await generateWeeklyContent(weekStart);
        console.log(
          `✅ Generated weeklyData for long-form video: weekStart=${weeklyData.weekStart.toISOString()}, title="${weeklyData.title}", subtitle="${weeklyData.subtitle}"`,
        );
      } catch (error) {
        console.error(
          '❌ Failed to generate weekly content for long-form video:',
          error,
        );
        // Don't continue without weeklyData - it's required for topic images
        throw new Error(
          `Failed to generate weekly content for long-form video. Weekly data is required for topic-based images. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }

      // Set imageUrl and description for long-form from weeklyData
      // This ensures both title and subtitle have the correct date
      if (weeklyData) {
        // Use weeklyData.title and subtitle for image (ensures correct date)
        imageUrl = `${baseUrl}/api/social/images?format=youtube&title=${encodeURIComponent(weeklyData.title)}&subtitle=${encodeURIComponent(weeklyData.subtitle || '')}`;

        // Update description to use weeklyData.subtitle if blogContent.description is empty or generic
        // This ensures the subtitle/description has the correct date
        if (
          !blogContent ||
          !blogContent.description ||
          blogContent.description === ''
        ) {
          description = weeklyData.subtitle || description;
        }
      }
    }

    if (weeklyData) {
      const resolution = resolveThemeCategory({
        weeklyCategory: (weeklyData as any).category || null,
        title: weeklyData.title,
      });
      themeCategory = resolution.category;
      const themePalette = getThemePalette(resolution.category);
      resolvedThemePalette = themePalette;
      const themeHue = getThemeHueBase(themePalette.highlight);
      const brandHue = getThemeHueBase(BRAND_COLORS.accentDefault);
      const rawDelta = normalizeHueDelta(themeHue - brandHue);
      hueShiftBase = clampHueShift(0, rawDelta, 12);

      themePaletteParams = buildPaletteParams({
        bg: themePalette.background,
        fg: themePalette.foreground,
        accent: themePalette.accent,
        highlight: themePalette.highlight,
      });
      introPaletteParams = buildPaletteParams({
        bg: BRAND_COLORS.cosmicBlack,
        fg: themePalette.foreground,
        accent: themePalette.accent,
        highlight: themePalette.highlight,
        lockHue: true,
      });

      console.log(
        `[Theme Palette] category=${resolution.category} inferred=${resolution.inferredFrom} bg=${themePalette.background} highlight=${themePalette.highlight} hueShift=${hueShiftBase}`,
      );
      console.log(
        `[Intro Palette] bg=${BRAND_COLORS.cosmicBlack} accent=${themePalette.accent} highlight=${themePalette.highlight}`,
      );
      if (imageUrl && themePaletteParams) {
        imageUrl += themePaletteParams;
      }
      if (
        resolution.inferredFrom === 'title' ||
        resolution.inferredFrom === 'fallback'
      ) {
        await sendDiscordNotification({
          title: 'Theme category inferred',
          description: `Category inferred from ${resolution.inferredFrom}`,
          fields: [
            { name: 'Week', value: weekKey || 'unknown', inline: true },
            { name: 'Category', value: resolution.category, inline: true },
            { name: 'Source', value: resolution.sourceText || 'n/a' },
          ],
          category: 'general',
          dedupeKey: `theme-category-${weekKey || 'unknown'}`,
        });
      }
    }

    // Step 1: Check for cached script
    const { head } = await import('@vercel/blob');
    let cachedScriptValid = false;
    try {
      const existingScript = await head(scriptCacheKey!);
      if (existingScript) {
        const scriptResponse = await fetch(existingScript.url);
        if (scriptResponse.ok) {
          script = await scriptResponse.text();

          // Validate cached script matches current week's data (for long-form videos)
          if (type === 'long' && weeklyData) {
            // Check if script contains key identifiers from current week
            const weekTitle = weeklyData.title || '';
            const weekSubtitle = weeklyData.subtitle || '';
            const scriptLower = script.toLowerCase();

            // Extract date from subtitle (e.g., "Week of December 22, 2025")
            const dateMatch = weekSubtitle.match(
              /week of ([^,]+),?\s*(\d{4})/i,
            );
            const expectedDateStr = dateMatch
              ? `${dateMatch[1]} ${dateMatch[2]}`.toLowerCase()
              : '';

            // Also extract month and day for more flexible matching
            const monthDayMatch = weekSubtitle.match(
              /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})/i,
            );
            const monthDayStr = monthDayMatch
              ? `${monthDayMatch[1]} ${monthDayMatch[2]}`.toLowerCase()
              : '';

            // Check if script mentions the current week's key events
            const hasTitleMatch =
              weekTitle &&
              scriptLower.includes(weekTitle.toLowerCase().substring(0, 20));
            const hasDateMatch =
              expectedDateStr && scriptLower.includes(expectedDateStr);
            const hasMonthDayMatch =
              monthDayStr && scriptLower.includes(monthDayStr);

            // Check for major planetary events from current week
            const hasPlanetaryMatch = weeklyData.planetaryHighlights?.some(
              (highlight) => {
                const planetName = highlight.planet?.toLowerCase() || '';
                const eventName = highlight.event?.toLowerCase() || '';
                return (
                  (planetName && scriptLower.includes(planetName)) ||
                  (eventName && scriptLower.includes(eventName))
                );
              },
            );

            // Check for moon phases from current week
            const hasMoonPhaseMatch = weeklyData.moonPhases?.some((phase) => {
              const phaseName = phase.phase?.toLowerCase() || '';
              return phaseName && scriptLower.includes(phaseName);
            });

            // Validate: script should contain at least one key identifier
            cachedScriptValid =
              hasTitleMatch ||
              hasDateMatch ||
              hasMonthDayMatch ||
              hasPlanetaryMatch ||
              hasMoonPhaseMatch;

            if (!cachedScriptValid) {
              console.warn(
                `⚠️ Cached script for ${weekKey} doesn't match current week's data. Regenerating...`,
                {
                  weekTitle: weekTitle.substring(0, 30),
                  weekSubtitle: weekSubtitle.substring(0, 30),
                  expectedDateStr,
                  monthDayStr,
                  hasTitleMatch,
                  hasDateMatch,
                  hasMonthDayMatch,
                  hasPlanetaryMatch,
                  hasMoonPhaseMatch,
                  scriptPreview: script.substring(0, 200),
                },
              );
              script = undefined; // Force regeneration
            } else {
              console.log(`♻️ Reusing validated cached script for ${weekKey}`, {
                weekTitle: weekTitle.substring(0, 30),
                weekSubtitle: weekSubtitle.substring(0, 30),
              });
            }
          } else {
            // For short/medium form, just use the cached script
            console.log(`♻️ Reusing cached script for ${weekKey}`);
            cachedScriptValid = true;
          }
        }
      }
    } catch (error) {
      console.log(
        `ℹ️ No cached script found for ${weekKey}, will generate new`,
      );
    }

    // Step 2: Generate script if not cached
    if (!script) {
      if (type === 'short') {
        // Use OpenAI to generate short-form narrative
        try {
          script = await generateShortFormNarrative(weeklyData!);
          console.log(
            `✅ Generated short-form narrative: ${script.split(/\s+/).length} words`,
          );
        } catch (error) {
          console.warn(
            'Failed to generate OpenAI short-form narrative, falling back:',
            error,
          );
          // Fallback to structured script
          script = generateVoiceoverScriptFromWeeklyData(weeklyData!, 'short');
        }
      } else if (type === 'medium') {
        // Use OpenAI to generate medium-form narrative
        if (weeklyData) {
          try {
            script = await generateMediumFormNarrative(weeklyData);
            console.log(
              `✅ Generated medium-form narrative: ${script.split(/\s+/).length} words`,
            );
          } catch (error) {
            console.warn(
              'Failed to generate OpenAI medium-form narrative, falling back:',
              error,
            );
            // Fallback to structured script
            script = generateVoiceoverScriptFromWeeklyData(weeklyData, 'short');
          }
        } else {
          throw new Error('Weekly data is required for medium-form videos');
        }
      } else {
        // Long-form: Use OpenAI to generate a natural narrative from weekly data
        if (weeklyData) {
          try {
            script = await generateNarrativeFromWeeklyData(weeklyData);
            console.log(
              `✅ Generated narrative script: ${script.split(/\s+/).length} words`,
            );
          } catch (error) {
            console.warn(
              'Failed to generate OpenAI narrative, falling back to structured script:',
              error,
            );
            // Fallback to structured script
            script = generateVoiceoverScriptFromWeeklyData(weeklyData, 'long');
          }
        } else {
          // Fallback: Use blog content but format it properly
          const blogText = blogContent!.body || blogContent!.description || '';

          if (!blogText || blogText.length < 100) {
            throw new Error(
              'Blog content is too short for long-form video. Need at least 100 characters.',
            );
          }

          // Remove HTML, format for voiceover
          let formattedText = blogText
            .replace(/<[^>]*>/g, '') // Remove HTML
            .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
            .replace(/#{1,6}\s+/g, '') // Remove markdown headers
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.*?)\*/g, '$1') // Remove italic
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links
            .replace(/```[\s\S]*?```/g, '') // Remove code blocks
            .replace(/`[^`]+`/g, ''); // Remove inline code

          // Split into sentences and clean up - keep more for long-form
          const sentences = formattedText
            .split(/[.!?]+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 10 && s.length < 500) // Filter out too short or too long
            .slice(0, 200); // Keep up to 200 sentences for 5-15 minute video

          if (sentences.length < 20) {
            throw new Error(
              `Blog content too short: only ${sentences.length} sentences. Need at least 20 sentences for long-form video.`,
            );
          }

          script = `${blogContent!.title}. ${sentences.join('. ')}`;
        }
      }

      // Cache the script
      try {
        await put(scriptCacheKey!, script, {
          access: 'public',
          addRandomSuffix: false,
          contentType: 'text/plain',
        });
        console.log(`✅ Cached script for ${weekKey}`);
      } catch (error) {
        console.warn('Failed to cache script:', error);
        // Continue even if caching fails
      }

      // Validate script length
      if (type === 'long') {
        const wordCount = script.split(/\s+/).length;
        if (wordCount < 500) {
          console.warn(
            `Long-form script is short: ${wordCount} words. Expected 1200-2000 for 5-8 minute video.`,
          );
        } else {
          console.log(
            `Long-form script generated: ${wordCount} words (~${Math.round(wordCount / 2.5 / 60)} minutes)`,
          );
        }
      }
    }

    // Step 3: Check for cached audio (by week/blog, not script hash)
    let audioUrl: string | null = null;
    let audioBuffer: ArrayBuffer | null = null;

    // Method 1: Check Vercel Blob first (most reliable)
    try {
      const existingAudio = await head(audioCacheKey!);
      if (existingAudio) {
        const audioResponse = await fetch(existingAudio.url);
        if (audioResponse.ok) {
          audioBuffer = await audioResponse.arrayBuffer();
          audioUrl = existingAudio.url;
          console.log(
            `♻️ Reusing cached audio from Blob for ${weekKey}: ${audioUrl}`,
          );
        }
      }
    } catch (blobError) {
      console.log(
        `ℹ️ No cached audio found in Blob for ${weekKey}, checking database...`,
      );
    }

    // Generate new audio if not found in Blob cache
    // Note: Database lookup removed - was causing stale audio to be reused when versions changed
    if (!audioUrl || !audioBuffer) {
      console.log(
        `🎙️ Generating new audio for ${type} video (not found in cache for ${weekKey})...`,
      );
      const ttsPreset = TTS_PRESETS[type];
      const ttsScript = normalizeScriptForTTS(script);
      audioBuffer = await generateVoiceover(ttsScript, {
        voiceName: ttsPreset.voiceName,
        model: ttsPreset.model,
        speed: ttsPreset.speed,
      });

      // Upload audio to Vercel Blob with week/blog key
      const { url } = await put(audioCacheKey!, audioBuffer, {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'audio/mpeg',
      });
      audioUrl = url;
      console.log(`✅ Audio generated and cached for ${weekKey}: ${audioUrl}`);
    }

    // Ensure audioBuffer is assigned
    if (!audioBuffer) {
      throw new Error('Failed to generate or retrieve audio buffer');
    }

    // Get actual audio duration for timestamp scaling
    // We need to write audio to temp file to get duration
    const { writeFile, unlink } = await import('fs/promises');
    const { join } = await import('path');
    const { tmpdir } = await import('os');
    const tempDir = tmpdir();
    const audioTimestamp = Date.now();
    const tempAudioPath = join(tempDir, `audio-${audioTimestamp}.mp3`);
    let actualAudioDuration: number | null = null;

    try {
      await writeFile(tempAudioPath, Buffer.from(audioBuffer));
      // Use ffprobe to get duration (same as compose-video.ts does)
      const ffmpeg = (await import('fluent-ffmpeg')).default;
      actualAudioDuration = await new Promise<number>((resolve, reject) => {
        ffmpeg.ffprobe(tempAudioPath, (err, metadata) => {
          if (err) {
            console.warn('Could not get audio duration:', err);
            resolve(null as any);
          } else {
            resolve(metadata.format.duration || (null as any));
          }
        });
      });
      await unlink(tempAudioPath).catch(() => {});
    } catch (error) {
      console.warn(
        'Failed to get audio duration, will use estimated timestamps:',
        error,
      );
    }

    // Ensure imageUrl is set before composing video
    if (!imageUrl || imageUrl === '') {
      if (weeklyData) {
        imageUrl = `${baseUrl}/api/social/images?format=youtube&title=${encodeURIComponent(weeklyData.title)}&subtitle=${encodeURIComponent(weeklyData.subtitle || '')}${introPaletteParams || ''}`;
      } else {
        throw new Error('No image URL available for video composition');
      }
    }

    // Compose video (image + audio)
    console.log(`🎬 Composing video (${videoFormat})...`);
    let videoBuffer: Buffer;

    // For medium-form and long-form videos, segment script into items and generate topic images
    if ((type === 'medium' || type === 'long') && weeklyData) {
      try {
        console.log(`📝 Segmenting script into items...`);

        // Calculate ACTUAL words per second from generated audio
        let actualWordsPerSecond = 2.5; // Default fallback
        if (actualAudioDuration && actualAudioDuration > 0) {
          const totalWords = script.split(/\s+/).length;
          actualWordsPerSecond = totalWords / actualAudioDuration;

          console.log(
            `⏱️ Audio: ${actualAudioDuration.toFixed(2)}s, ${totalWords} words = ${actualWordsPerSecond.toFixed(2)} wps`,
          );
        }

        const items =
          type === 'medium'
            ? segmentScriptIntoMediumItems(
                script,
                weeklyData,
                actualWordsPerSecond,
              )
            : segmentScriptIntoItems(script, weeklyData, actualWordsPerSecond);

        console.log(
          `📸 Generated ${items.length} item segments: ${items.map((t) => `${t.topic}${t.item ? ` (${t.item})` : ''}`).join(', ')}`,
        );

        if (items.length === 0) {
          throw new Error('No items found in script');
        }

        // No proportional scaling needed - timestamps are already accurate based on actual audio
        const scaledItems = items;

        console.log(`🎨 Generating images for ${scaledItems.length} items...`);
        const topicImages = await generateTopicImages(
          scaledItems,
          weeklyData,
          baseUrl,
          videoFormat,
          {
            palette: resolvedThemePalette || undefined,
            introBg: BRAND_COLORS.cosmicBlack,
            lockIntroHue: true,
          },
        );

        console.log(`✅ Generated ${topicImages.length} topic images`);

        if (topicImages.length > 0) {
          const firstImage = topicImages[0];
          const parsed = new URL(firstImage.imageUrl);
          const bgParam = parsed.searchParams.get('bg');
          if (
            !bgParam ||
            bgParam.toLowerCase() !== BRAND_COLORS.cosmicBlack.toLowerCase()
          ) {
            console.warn(
              '[Intro Frame] Enforcing cosmic black background for first frame',
            );
            parsed.searchParams.set('bg', BRAND_COLORS.cosmicBlack);
            parsed.searchParams.set('lockHue', '1');
            if (resolvedThemePalette) {
              parsed.searchParams.set('fg', resolvedThemePalette.foreground);
              parsed.searchParams.set('accent', resolvedThemePalette.accent);
              parsed.searchParams.set(
                'highlight',
                resolvedThemePalette.highlight,
              );
            }
            firstImage.imageUrl = parsed.toString();
            await sendDiscordNotification({
              title: 'Intro hue lock enforced',
              description: 'First frame was rebuilt with cosmic black.',
              fields: [
                { name: 'Week', value: weekKey || 'unknown', inline: true },
                {
                  name: 'Category',
                  value: themeCategory || 'unknown',
                  inline: true,
                },
              ],
              category: 'general',
              dedupeKey: `intro-hue-lock-${weekKey || 'unknown'}`,
            });
          }
        }

        // Compose video with multiple images
        // Future: When USE_REMOTION_RENDERER is enabled, use Remotion for more
        // sophisticated animations. For now, FFmpeg handles all rendering.
        // To enable Remotion: set USE_REMOTION_RENDERER=true in environment
        if (USE_REMOTION_RENDERER) {
          console.log(
            `🎬 Remotion rendering enabled but not yet implemented for production`,
          );
          console.log(
            `💡 Falling back to FFmpeg for now. Remotion structure ready at src/remotion/`,
          );
        }

        videoBuffer = await composeVideo({
          images: topicImages.map((img) => ({
            url: img.imageUrl,
            startTime: img.startTime,
            endTime: img.endTime,
          })),
          audioBuffer,
          format: videoFormat,
          hueShiftBase,
          hueShiftMaxDelta: 12,
          lockIntroHue: true,
        });
        console.log(`✅ Video composed with ${topicImages.length} images`);
      } catch (error) {
        console.error(
          '❌ Failed to generate topic-based images:',
          error instanceof Error ? error.message : error,
          error instanceof Error ? error.stack : '',
        );
        // Don't silently fall back - throw the error so we can see what's wrong
        throw new Error(
          `Failed to generate topic-based images for long-form video: ${error instanceof Error ? error.message : 'Unknown error'}. This is required for long-form videos.`,
        );
      }
    } else {
      // Short-form or fallback: single image
      if (!imageUrl) {
        throw new Error('No image URL available for video composition');
      }
      videoBuffer = await composeVideo({
        imageUrl,
        audioBuffer,
        format: videoFormat,
        hueShiftBase,
        hueShiftMaxDelta: 12,
        lockIntroHue: true,
      });
    }

    // Upload to Vercel Blob
    const timestamp = Date.now();
    const blobKey =
      type === 'short'
        ? `videos/shorts/week-${week}-${timestamp}.mp4`
        : `videos/long-form/${blogSlug || 'blog'}-${timestamp}.mp4`;

    console.log(`☁️ Uploading video to Blob: ${blobKey}`);
    const { url: videoUrl } = await put(blobKey, videoBuffer, {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'video/mp4',
    });

    // Generate post content for social media
    let postContent: string | null = null;
    try {
      // Get weekly data for post content generation
      let weeklyDataForPost: Awaited<
        ReturnType<typeof generateWeeklyContent>
      > | null = null;
      if (type === 'short' && week !== undefined) {
        const now = new Date();
        const targetDate = new Date(
          now.getTime() + week * 7 * 24 * 60 * 60 * 1000,
        );
        const dayOfWeek = targetDate.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const weekStart = new Date(
          targetDate.getTime() - daysToMonday * 24 * 60 * 60 * 1000,
        );
        weekStart.setHours(0, 0, 0, 0);
        weeklyDataForPost = await generateWeeklyContent(weekStart);
      } else if (type === 'medium') {
        // Medium form: use the same week as the video (already calculated above)
        if (week !== undefined && weeklyData) {
          weeklyDataForPost = weeklyData;
        } else {
          const now = new Date();
          const dayOfWeek = now.getDay();
          const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          const weekStart = new Date(
            now.getTime() - daysToMonday * 24 * 60 * 60 * 1000,
          );
          weekStart.setHours(0, 0, 0, 0);
          weeklyDataForPost = await generateWeeklyContent(weekStart);
        }
      } else if (type === 'long') {
        // Long form: use the same week as the video (already calculated above)
        if (weeklyData) {
          weeklyDataForPost = weeklyData;
        } else {
          const now = new Date();
          const dayOfWeek = now.getDay();
          const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          const weekStart = new Date(
            now.getTime() - daysToMonday * 24 * 60 * 60 * 1000,
          );
          weekStart.setHours(0, 0, 0, 0);
          weeklyDataForPost = await generateWeeklyContent(weekStart);
        }
      }

      if (weeklyDataForPost) {
        postContent = await generateVideoPostContent(
          weeklyDataForPost,
          type,
          blogSlug || undefined,
        );
        console.log(`✅ Generated post content for ${type} video`);

        // For long-form videos, also update description to include hashtags
        // (postContent includes hashtags, so use it for description if not already set from blogContent)
        if (type === 'long' && !blogContent) {
          description = postContent;
        }
      }
    } catch (error) {
      console.warn('Failed to generate post content:', error);
      // Continue without post content - it's optional
    }

    // Store in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Try to insert with audio_url and script, fallback if columns don't exist
    let result;
    try {
      result = await sql`
        INSERT INTO videos (
          type,
          video_url,
          audio_url,
          script,
          title,
          description,
          post_content,
          week_number,
          blog_slug,
          status,
          created_at,
          expires_at
        ) VALUES (
          ${type},
          ${videoUrl},
          ${audioUrl},
          ${script || null},
          ${title},
          ${description || null},
          ${postContent || null},
          ${weekNumber},
          ${blogSlug},
          'pending',
          NOW(),
          ${expiresAt.toISOString()}
        )
        RETURNING id, video_url, created_at, expires_at
      `;
    } catch (error: any) {
      // If audio_url or script column doesn't exist, try without them
      if (
        error?.code === '42703' ||
        error?.message?.includes('audio_url') ||
        error?.message?.includes('script')
      ) {
        console.warn(
          'audio_url or script column not found, inserting without them. Run database migration.',
        );
        try {
          result = await sql`
            INSERT INTO videos (
              type,
              video_url,
              audio_url,
              title,
              description,
              post_content,
              week_number,
              blog_slug,
              status,
              created_at,
              expires_at
            ) VALUES (
              ${type},
              ${videoUrl},
              ${audioUrl},
              ${title},
              ${description || null},
              ${postContent || null},
              ${weekNumber},
              ${blogSlug},
              'pending',
              NOW(),
              ${expiresAt.toISOString()}
            )
            RETURNING id, video_url, created_at, expires_at
          `;
        } catch (error2: any) {
          // If still fails, insert without audio_url
          if (
            error2?.code === '42703' ||
            error2?.message?.includes('audio_url')
          ) {
            result = await sql`
              INSERT INTO videos (
                type,
                video_url,
                title,
                description,
                post_content,
                week_number,
                blog_slug,
                status,
                created_at,
                expires_at
              ) VALUES (
                ${type},
                ${videoUrl},
                ${title},
                ${description || null},
                ${postContent || null},
                ${weekNumber},
                ${blogSlug},
                'pending',
                NOW(),
                ${expiresAt.toISOString()}
              )
              RETURNING id, video_url, created_at, expires_at
            `;
          } else {
            throw error2;
          }
        }
      } else {
        throw error;
      }
    }

    const videoRecord = result.rows[0];

    console.log(`✅ Video generated and stored: ${videoUrl}`);

    // Send Discord notification with video details for manual backup
    sendDiscordNotification({
      title: `🎥 Video Generated: ${title}`,
      description: `New ${type}-form video created. Download link below if Succulent fails.`,
      url: videoUrl,
      fields: [
        {
          name: '📹 Video URL (Blob)',
          value: videoUrl,
          inline: false,
        },
        {
          name: '📝 Title',
          value: title || 'No title',
          inline: true,
        },
        {
          name: '📊 Type',
          value: type,
          inline: true,
        },
        {
          name: '📱 Post Content',
          value:
            postContent && postContent.length > 1024
              ? postContent.substring(0, 1021) + '...'
              : postContent || description || 'No post content',
          inline: false,
        },
      ],
      color: 'success',
      category: 'todo',
      dedupeKey: `video-generated-${videoRecord.id}`,
    }).catch((err) => {
      console.error('Failed to send Discord notification:', err);
    });

    // Schedule video to platforms (fire and forget - don't block response)
    // Use postContent for social media posts if available, otherwise fall back to description
    // Pass weeklyData and blogSlug for Threads-specific formatting
    // Videos are generated only. Posting happens via explicit platform buttons.

    return NextResponse.json({
      success: true,
      video: {
        id: videoRecord.id,
        url: videoUrl,
        type,
        title,
        description,
        postContent,
        weekNumber,
        blogSlug,
        createdAt: videoRecord.created_at,
        expiresAt: videoRecord.expires_at,
      },
    });
  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate video',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    );
  }
}
