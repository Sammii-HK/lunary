import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { sql } from '@vercel/postgres';
import { composeVideo } from '@/lib/video/compose-video';
import {
  renderRemotionVideo,
  scriptToAudioSegments,
  isRemotionAvailable,
} from '@/lib/video/remotion-renderer';
import { generateVoiceover } from '@/lib/tts';
import { generateVoiceoverScriptFromWeeklyData } from '@/lib/video/composition';
import { TTS_PRESETS } from '@/lib/tts/presets';
import { normalizeScriptForTTS } from '@/lib/tts/normalize-script';
import { stripHtmlTags } from '@/lib/utils';
import {
  generateNarrativeFromWeeklyData,
  generateShortFormNarrative,
  generateMediumFormNarrative,
  generateVideoPostContent,
  segmentScriptIntoItems,
  segmentScriptIntoMediumItems,
} from '@/lib/video/narrative-generator';
import { resolveThemeCategory } from '@/lib/video/theme-category';
import { BRAND_COLORS, getThemePalette } from '@/lib/video/theme-palette';
import { clampHueShift, getThemeHueBase } from '@/lib/video/hue';
import { generateWeeklyContent } from '../../../../../utils/blog/weeklyContentGenerator';
import { sendDiscordNotification } from '@/lib/discord';

// Version for cache invalidation - increment when prompts change
const SCRIPT_VERSION = {
  short: 'v21',
  medium: 'v26',
  long: 'v24',
};

// Engagement CTAs for TikTok interaction
const ENGAGEMENT_CTAS = [
  'Which part hit different?',
  'Drop your sign below',
  'Save this for later',
  'Does this resonate?',
  'Comment your experience',
];

// Brand CTAs to drive traffic
const BRAND_CTAS = [
  'Dive deeper with Lunary',
  'Find more insights on Lunary',
  'Learn more with Lunary',
  'Explore more on Lunary',
  'Discover more with Lunary',
];

// 70% engagement / 30% brand rotation
function getRandomCTA(): string {
  const pool = Math.random() < 0.7 ? ENGAGEMENT_CTAS : BRAND_CTAS;
  return pool[Math.floor(Math.random() * pool.length)];
}

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
  const { postToSocial } = await import('@/lib/social/client');

  const now = new Date();
  const scheduledDate = new Date(now);
  scheduledDate.setHours(21, 30, 0, 0);
  if (scheduledDate < now) {
    scheduledDate.setDate(scheduledDate.getDate() + 1);
  }
  const scheduledDateIso = scheduledDate.toISOString();
  const videoMedia = [{ type: 'video' as const, url: videoUrl, alt: title }];

  if (videoType === 'short') {
    const content = postContent || description;

    // Threads - generate platform-specific content
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
        threadsContent = truncateContent(threadsContent, 300);
      } catch (error) {
        console.warn(
          'Failed to generate Threads-specific content, using default:',
          error,
        );
        threadsContent = truncateContent(content, 300);
      }
    } else {
      threadsContent = truncateContent(content, 300);
    }

    const twitterContent = truncateContent(content.replace(/\n/g, ' '), 280);
    const blueskyContent = truncateContent(content, 300);

    // Post to all short-form platforms
    const shortFormPosts = [
      {
        platform: 'instagram',
        content,
        platformSettings: { stories: true },
        media: videoMedia,
        label: 'Instagram Stories',
      },
      {
        platform: 'instagram',
        content,
        platformSettings: { type: 'reel' },
        media: videoMedia,
        label: 'Instagram Reels',
      },
      {
        platform: 'threads',
        content: threadsContent,
        media: undefined,
        label: 'Threads',
      },
      {
        platform: 'twitter',
        content: twitterContent,
        media: videoMedia,
        label: 'Twitter/X',
      },
      {
        platform: 'bluesky',
        content: blueskyContent,
        media: videoMedia,
        label: 'Bluesky',
      },
    ];

    for (const post of shortFormPosts) {
      try {
        const result = await postToSocial({
          platform: post.platform,
          content: post.content,
          scheduledDate: scheduledDateIso,
          media: post.media,
          platformSettings: post.platformSettings,
        });

        if (result.success) {
          console.log(
            `✅ Scheduled short-form video to ${post.label} for ${scheduledDateIso}`,
          );
        } else {
          console.error(
            `❌ Failed to schedule to ${post.label}: ${result.error}`,
          );
        }
      } catch (error) {
        console.error(`Error scheduling to ${post.label}:`, error);
      }
    }
  } else if (videoType === 'medium') {
    const content = postContent || description;

    // Post to TikTok, Instagram Reels, and YouTube Shorts
    const mediumFormPosts = [
      {
        platform: 'tiktok',
        label: 'TikTok',
      },
      {
        platform: 'instagram',
        label: 'Instagram Reels',
        platformSettings: { type: 'reel' },
      },
      {
        platform: 'youtube',
        label: 'YouTube Shorts',
        youtubeOptions: {
          title,
          visibility: 'public' as const,
          isShort: true,
          madeForKids: false,
          playlistId: process.env.YOUTUBE_WEEKLY_SERIES_PLAYLIST_ID,
        },
      },
    ];

    for (const post of mediumFormPosts) {
      try {
        const result = await postToSocial({
          platform: post.platform,
          content,
          scheduledDate: scheduledDateIso,
          media: videoMedia,
          platformSettings: post.platformSettings,
          youtubeOptions: post.youtubeOptions,
        });

        if (result.success) {
          console.log(`✅ Posted medium-form video to ${post.label}`);
        } else {
          console.error(`❌ Failed to post to ${post.label}: ${result.error}`);
        }
      } catch (error) {
        console.error(`Error posting to ${post.label}:`, error);
      }
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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

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
      videoFormat = 'story';
      // Title and description will be updated from weeklyData after generation
      title = `Week of ${weekRange}`;
      description = 'Your weekly cosmic forecast from Lunary';
      imageUrl = ''; // Will be set from weeklyData
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

      // Update title and description from weeklyData
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
          let formattedText = stripHtmlTags(blogText, '')
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
    let videoBuffer: Buffer | undefined;

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

        console.log(
          `🎨 Creating topic metadata for ${scaledItems.length} items (no images needed for Remotion)...`,
        );

        // Create topic metadata without generating image URLs (Remotion renders everything)
        const topicImages = scaledItems.map((item) => ({
          topic: item.topic,
          item: item.item,
          imageUrl: '', // Not needed - Remotion generates visuals
          startTime: item.startTime,
          endTime: item.endTime,
        }));

        console.log(`✅ Created ${topicImages.length} topic segments`);

        // Compose video with multiple images using Remotion
        // Extract hook (first sentence) for overlay
        const hookMatch = script.match(/^[^.!?]+[.!?]/);
        const hookText = hookMatch
          ? hookMatch[0].trim().substring(0, 60) // Max 60 chars for readability
          : undefined;

        // Check if Remotion is available
        const remotionAvailable = await isRemotionAvailable();

        let useFFmpegFallback = !remotionAvailable || !actualAudioDuration;

        if (!useFFmpegFallback) {
          try {
            // Use Remotion for smooth animations and shooting stars
            const remotionFormat =
              type === 'medium' ? 'MediumFormVideo' : 'LongFormVideo';

            // Convert script to audio segments for subtitles
            const segments = scriptToAudioSegments(
              script,
              actualAudioDuration!,
              2.6,
            );

            // Add background music for all blog video types (long, medium, short)
            const backgroundMusicUrl = `${baseUrl}/audio/series/lunary-bed-v1.mp3`;

            // Create symbol content for overlay detection (title + key topics)
            const symbolContent = weeklyData
              ? `${title} ${description} ${topicImages.map((img) => img.topic).join(' ')}`
              : undefined;

            videoBuffer = await renderRemotionVideo({
              format: remotionFormat,
              outputPath: '',
              title: title,
              subtitle: description,
              hookText: hookText || title,
              segments,
              audioUrl: audioUrl!,
              backgroundMusicUrl,
              images: topicImages.map((img) => ({
                url: '', // No image URLs needed - Remotion generates visuals
                startTime: img.startTime,
                endTime: img.endTime,
                topic: img.topic,
              })),
              highlightTerms: [],
              durationSeconds: actualAudioDuration! + 2, // Add buffer at end
              seed: `${weekKey}-${type}-${Date.now()}`,
              symbolContent,
              zodiacSign: symbolContent,
              showBrandedIntro: type === 'medium', // Enable branded intro for medium-form cosmic forecast videos
            });
            console.log(
              `✅ Remotion: Video rendered with ${topicImages.length} images, shooting stars, animated subtitles`,
            );
          } catch (remotionError) {
            console.error(
              `❌ Remotion render failed, falling back to FFmpeg:`,
              remotionError,
            );
            useFFmpegFallback = true;
          }
        }

        if (useFFmpegFallback) {
          // Fallback to FFmpeg if Remotion not available
          console.log(
            `⚠️ Remotion not available or failed, falling back to FFmpeg`,
          );

          // Build overlays for hook and CTA
          const videoOverlays: Array<{
            text: string;
            startTime: number;
            endTime: number;
            style: 'chapter' | 'stamp' | 'title';
          }> = [];

          // Hook overlay at the beginning
          if (hookText && hookText.length > 10) {
            videoOverlays.push({
              text: hookText,
              startTime: 0.5,
              endTime: 3.5,
              style: 'title',
            });
          }

          // CTA overlay at the end (random from bank)
          if (actualAudioDuration && actualAudioDuration > 8) {
            videoOverlays.push({
              text: getRandomCTA(),
              startTime: actualAudioDuration - 2,
              endTime: actualAudioDuration + 1.5,
              style: 'stamp',
            });
          }

          videoBuffer = await composeVideo({
            images: topicImages.map((img) => ({
              url: img.imageUrl,
              startTime: img.startTime,
              endTime: img.endTime,
            })),
            audioBuffer,
            format: videoFormat,
            subtitlesText: script,
            overlays: videoOverlays.length > 0 ? videoOverlays : undefined,
            hueShiftBase,
            hueShiftMaxDelta: 12,
            lockIntroHue: true,
          });
          console.log(
            `✅ FFmpeg: Video composed with ${topicImages.length} images, subtitles, ${videoOverlays.length} overlays`,
          );
        }
      } catch (error) {
        console.error(
          '❌ Failed to create topic segments:',
          error instanceof Error ? error.message : error,
          error instanceof Error ? error.stack : '',
        );
        // Fall back to simple intro-only video
        console.log(
          '⚠️ Falling back to intro-only video without topic segments',
        );
        const topicImages = [
          {
            topic: 'intro',
            item: title,
            imageUrl: '',
            startTime: 0,
            endTime: actualAudioDuration || 60,
          },
        ];
      }
    } else {
      // Short-form or fallback: single image
      if (!imageUrl) {
        throw new Error('No image URL available for video composition');
      }

      // Extract hook (first sentence) for overlay
      const hookMatch = script.match(/^[^.!?]+[.!?]/);
      const hookText = hookMatch
        ? hookMatch[0].trim().substring(0, 50) // Max 50 chars for short-form
        : undefined;

      // Check if Remotion is available
      const remotionAvailable = await isRemotionAvailable();

      let useFFmpegFallback = !remotionAvailable || !actualAudioDuration;

      if (!useFFmpegFallback) {
        try {
          // Use Remotion for smooth animations and shooting stars
          const segments = scriptToAudioSegments(
            script,
            actualAudioDuration!,
            2.6,
          );

          // Create symbol content for short-form (title + description)
          const shortSymbolContent = weeklyData
            ? `${title} ${description}`
            : undefined;

          videoBuffer = await renderRemotionVideo({
            format: 'ShortFormVideo',
            outputPath: '',
            title: title,
            subtitle: description,
            hookText: hookText || title,
            segments,
            audioUrl: audioUrl!,
            backgroundImage: imageUrl,
            backgroundMusicUrl: `${baseUrl}/audio/series/lunary-bed-v1.mp3`,
            highlightTerms: [],
            durationSeconds: actualAudioDuration! + 2,
            seed: `${weekKey}-short-${Date.now()}`,
            zodiacSign: shortSymbolContent,
            showBrandedIntro: true, // Enable branded intro for cosmic forecast videos
          });
          console.log(
            `✅ Remotion: Short-form video rendered with shooting stars, animated subtitles`,
          );
        } catch (remotionError) {
          console.error(
            `❌ Remotion render failed, falling back to FFmpeg:`,
            remotionError,
          );
          useFFmpegFallback = true;
        }
      }

      if (useFFmpegFallback) {
        // Fallback to FFmpeg if Remotion not available
        console.log(
          `⚠️ Remotion not available, falling back to FFmpeg for short-form`,
        );

        // Build overlays for hook and CTA
        const videoOverlays: Array<{
          text: string;
          startTime: number;
          endTime: number;
          style: 'chapter' | 'stamp' | 'title';
        }> = [];

        // Hook overlay at the beginning
        if (hookText && hookText.length > 10) {
          videoOverlays.push({
            text: hookText,
            startTime: 0.3,
            endTime: 3.0,
            style: 'title',
          });
        }

        // CTA overlay at the end (random from bank)
        if (actualAudioDuration && actualAudioDuration > 8) {
          videoOverlays.push({
            text: getRandomCTA(),
            startTime: actualAudioDuration - 1.5,
            endTime: actualAudioDuration + 1.5,
            style: 'stamp',
          });
        }

        videoBuffer = await composeVideo({
          imageUrl,
          audioBuffer,
          format: videoFormat,
          subtitlesText: script,
          overlays: videoOverlays.length > 0 ? videoOverlays : undefined,
          hueShiftBase,
          hueShiftMaxDelta: 12,
          lockIntroHue: true,
        });
        console.log(
          `✅ FFmpeg: Short-form video composed with subtitles, ${videoOverlays.length} overlays`,
        );
      }
    }

    // Ensure video was generated
    if (!videoBuffer) {
      throw new Error('Video generation failed - no video buffer produced');
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
