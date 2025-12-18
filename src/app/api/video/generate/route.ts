import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { sql } from '@vercel/postgres';
import { composeVideo } from '@/lib/video/compose-video';
import { generateVoiceover } from '@/lib/tts';
import { generateVoiceoverScriptFromWeeklyData } from '@/lib/video/composition';
import {
  generateNarrativeFromWeeklyData,
  generateShortFormNarrative,
  generateMediumFormNarrative,
  generateVideoPostContent,
  segmentScriptIntoItems,
  segmentScriptIntoMediumItems,
} from '@/lib/video/narrative-generator';
import { generateTopicImages } from '@/lib/video/image-generator';
import { generateWeeklyContent } from '../../../../../utils/blog/weeklyContentGenerator';

// Version for cache invalidation - increment when prompts change
const SCRIPT_VERSION = {
  short: 'v11', // v5: fixed moon phase detection using MoonPhase angle + seasonal events
  medium: 'v16', // v9: explains what Sun in X means, seasonal events
  long: 'v14', // v7: dedicated solstice section, in-depth Sun/Moon meanings, intention setting
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

/**
 * Schedule video to appropriate platforms based on type
 * - Short form: Instagram Stories (scheduled)
 * - Medium form: TikTok, Instagram Reels, YouTube Shorts (posted immediately)
 * - Long form: YouTube (already handled via upload route)
 */
async function scheduleVideoToPlatforms(
  videoUrl: string,
  videoType: 'short' | 'medium' | 'long',
  title: string,
  description: string,
  baseUrl: string,
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

  if (videoType === 'short') {
    // Short form: Schedule to Instagram Stories
    const scheduledDate = new Date(now);
    scheduledDate.setHours(10, 0, 0, 0);
    if (scheduledDate < now) {
      scheduledDate.setHours(now.getHours() + 1, 0, 0, 0);
    }

    const storyPost = {
      accountGroupId,
      name: `Lunary Short - ${dateStr}`,
      content: description,
      platforms: ['instagram'],
      scheduledDate: scheduledDate.toISOString(),
      media: [{ type: 'video' as const, url: videoUrl, alt: title }],
      instagramOptions: { stories: true },
    };

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
          `❌ Failed to schedule short-form video: ${response.status} ${error}`,
        );
      }
    } catch (error) {
      console.error('Error scheduling short-form video:', error);
    }
  } else if (videoType === 'medium') {
    // Medium form: Post immediately to TikTok, Instagram Reels, YouTube Shorts
    const currentTime = new Date().toISOString();

    // TikTok - post immediately (omit scheduledDate)
    const tiktokPost = {
      accountGroupId,
      name: `Lunary Medium - TikTok - ${dateStr}`,
      content: description,
      platforms: ['tiktok'],
      media: [{ type: 'video' as const, url: videoUrl, alt: title }],
    };

    // Instagram Reels - post immediately
    const reelPost = {
      accountGroupId,
      name: `Lunary Medium - Instagram Reel - ${dateStr}`,
      content: description,
      platforms: ['instagram'],
      media: [{ type: 'video' as const, url: videoUrl, alt: title }],
      instagramOptions: { type: 'reel' as const },
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

    // YouTube Shorts - handled via upload route (post immediately by omitting publishDate)
    // This is already handled in the YouTube upload route
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
        imageUrl = `${baseUrl}/api/social/images?format=youtube&title=${encodeURIComponent(blogContent.title)}${blogContent.description ? `&subtitle=${encodeURIComponent(blogContent.description)}` : ''}`;
        videoFormat = 'youtube';
        title = blogContent.title;
        description = blogContent.description || '';
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
      weekKey = `week-${week}`;
      const version = SCRIPT_VERSION.short;
      scriptCacheKey = `scripts/short/${version}/${weekKey}.txt`;
      audioCacheKey = `audio/short/${version}/${weekKey}.mp3`;

      // Get weekly content data for short-form
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

      weeklyData = await generateWeeklyContent(weekStart);
    } else if (type === 'medium') {
      // Medium-form: cache by week number + version
      if (week === undefined) {
        return NextResponse.json(
          { error: 'Week number is required for medium-form videos' },
          { status: 400 },
        );
      }
      weekKey = `week-${week}`;
      const version = SCRIPT_VERSION.medium;
      scriptCacheKey = `scripts/medium/${version}/${weekKey}.txt`;
      audioCacheKey = `audio/medium/${version}/${weekKey}.mp3`;

      // Get weekly content data for medium-form
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

      weeklyData = await generateWeeklyContent(weekStart);
      console.log('✅ Generated weeklyData for medium-form video');

      // Update title to use the weekly data title (same as intro slide)
      if (weeklyData?.title) {
        title = weeklyData.title;
      }
    } else {
      // Long-form: cache by blog slug or week number + version
      weekKey = blogSlug ? `blog-${blogSlug}` : `week-${weekNumber || 0}`;
      const version = SCRIPT_VERSION.long;
      scriptCacheKey = `scripts/long/${version}/${weekKey}.txt`;
      audioCacheKey = `audio/long/${version}/${weekKey}.mp3`;

      // Long-form: ALWAYS get weekly content (required for topic images)
      try {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const weekStart = new Date(
          now.getTime() - daysToMonday * 24 * 60 * 60 * 1000,
        );
        weekStart.setHours(0, 0, 0, 0);
        weeklyData = await generateWeeklyContent(weekStart);
        console.log('✅ Generated weeklyData for long-form video');
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

      // Set imageUrl for long-form if not already set
      if ((!imageUrl || imageUrl === '') && weeklyData) {
        imageUrl = `${baseUrl}/api/social/images?format=youtube&title=${encodeURIComponent(weeklyData.title)}&subtitle=${encodeURIComponent(weeklyData.subtitle || '')}`;
      }
    }

    // Step 1: Check for cached script
    const { head } = await import('@vercel/blob');
    try {
      const existingScript = await head(scriptCacheKey!);
      if (existingScript) {
        const scriptResponse = await fetch(existingScript.url);
        if (scriptResponse.ok) {
          script = await scriptResponse.text();
          console.log(`♻️ Reusing cached script for ${weekKey}`);
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
      // const ttsSpeed = type === 'medium' ? 1.1 : 1.0;
      const ttsSpeed = 1.1;
      audioBuffer = await generateVoiceover(script, {
        voiceName: 'nova', // British female voice
        model: 'tts-1-hd', // High quality
        speed: ttsSpeed,
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
        imageUrl = `${baseUrl}/api/social/images?format=youtube&title=${encodeURIComponent(weeklyData.title)}&subtitle=${encodeURIComponent(weeklyData.subtitle || '')}`;
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
        );

        console.log(`✅ Generated ${topicImages.length} topic images`);

        // Compose video with multiple images
        videoBuffer = await composeVideo({
          images: topicImages.map((img) => ({
            url: img.imageUrl,
            startTime: img.startTime,
            endTime: img.endTime,
          })),
          audioBuffer,
          format: videoFormat,
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
      } else if (type === 'medium' || type === 'long') {
        // Medium and long form both use current week
        const now = new Date();
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const weekStart = new Date(
          now.getTime() - daysToMonday * 24 * 60 * 60 * 1000,
        );
        weekStart.setHours(0, 0, 0, 0);
        weeklyDataForPost = await generateWeeklyContent(weekStart);
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

    // Schedule video to platforms (fire and forget - don't block response)
    // Use postContent for social media posts if available, otherwise fall back to description
    const socialPostContent = postContent || description;
    scheduleVideoToPlatforms(
      videoUrl,
      type,
      title,
      socialPostContent,
      baseUrl,
    ).catch((err) => {
      console.error('Failed to schedule video to platforms:', err);
    });

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
