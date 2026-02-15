import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { put } from '@vercel/blob';
import { writeFile, unlink, mkdtemp } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import ffmpeg from 'fluent-ffmpeg';
import { composeVideo } from '@/lib/video/compose-video';
import {
  renderRemotionVideo,
  isRemotionAvailable,
  scriptToAudioSegments,
} from '@/lib/video/remotion-renderer';
import { generateVoiceover } from '@/lib/tts';
import {
  categoryThemes,
  type WeeklyTheme,
  type DailyFacet,
} from '@/lib/social/weekly-themes';
import { buildThematicVideoComposition } from '@/lib/video/thematic-video';
import { getImageBaseUrl } from '@/lib/urls';

async function getAudioDurationFromBuffer(buffer: Buffer): Promise<number> {
  const tempDir = await mkdtemp(join(tmpdir(), 'audio-'));
  const tempPath = join(tempDir, 'audio.mp3');
  await writeFile(tempPath, buffer);

  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(tempPath, async (err, metadata) => {
      await unlink(tempPath).catch(() => {});
      if (err) {
        reject(err);
      } else if (metadata.format.duration) {
        resolve(metadata.format.duration);
      } else {
        reject(new Error('Could not determine audio duration'));
      }
    });
  });
}

export const runtime = 'nodejs';

function getFacetInfo(
  theme: WeeklyTheme | undefined,
  facetTitle: string,
): { facet: DailyFacet | null; category: string; slug: string } {
  const fallbackSlug = facetTitle.toLowerCase().replace(/\s+/g, '-');

  if (!theme) {
    return { facet: null, category: 'lunar', slug: fallbackSlug };
  }

  const matchedFacet = theme.facets.find((f) => f.title === facetTitle);
  const slug = matchedFacet
    ? matchedFacet.grimoireSlug.split('/').pop() || fallbackSlug
    : fallbackSlug;

  return {
    facet: matchedFacet || null,
    category: theme.category,
    slug,
  };
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const scriptId = Number(id);
    if (!Number.isFinite(scriptId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid script id' },
        { status: 400 },
      );
    }

    const baseUrl = getImageBaseUrl();

    // Fetch script directly by ID instead of loading all scripts
    const scriptResult = await sql`
      SELECT * FROM video_scripts WHERE id = ${scriptId}
    `;
    if (scriptResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Script not found' },
        { status: 404 },
      );
    }

    const row = scriptResult.rows[0];
    const script = {
      id: row.id,
      themeId: row.theme_id,
      themeName: row.theme_name,
      facetTitle: row.facet_title,
      platform: row.platform,
      sections: row.sections,
      fullScript: row.full_script,
      wordCount: row.word_count,
      estimatedDuration: row.estimated_duration,
      scheduledDate: new Date(row.scheduled_date),
      status: row.status,
      metadata: row.metadata,
      coverImageUrl: row.cover_image_url,
      partNumber: row.part_number,
    };

    // Detect if this is an engagement video (not educational)
    const isEngagementVideo =
      script.themeName?.startsWith('Sign Check') ||
      script.themeName === 'Ranking' ||
      script.themeName === 'Hot Take' ||
      script.themeName?.startsWith('Quiz') ||
      script.themeName === 'Myth' ||
      script.themeName === 'Transit Alert';

    console.log(
      `🎯 Script theme: "${script.themeName}", facet: "${script.facetTitle}"`,
    );
    console.log(`🎯 Is engagement video: ${isEngagementVideo}`);

    const theme = categoryThemes.find((t) => t.name === script.themeName);
    const { slug, facet: matchedFacet } = getFacetInfo(
      theme,
      script.facetTitle,
    );
    const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, '-');

    let images: Array<{ url: string; startTime: number; endTime: number }> = [];
    let overlays: Array<{
      text: string;
      startTime: number;
      endTime: number;
      style?:
        | 'hook'
        | 'hook_large'
        | 'cta'
        | 'stamp'
        | 'chapter'
        | 'series_badge';
    }> = [];
    let highlightTerms: string[] = [];
    let highlightColor = '#5AD7FF';
    let categoryVisuals: any;

    if (isEngagementVideo) {
      // Engagement videos: no OG images, just clean background with subtitles
      categoryVisuals = {
        gradientColors: ['#2a2f4a', '#3d4571', '#2a2f4a'], // Even brighter blue gradient for visibility
        particleTintColor: '#7ec8ff',
        accentColor: '#5AD7FF',
        backgroundAnimation: 'starfield' as const,
      };
      // Extract highlight terms from script (zodiac signs, planets)
      const scriptLower = script.fullScript.toLowerCase();
      const zodiacSigns = [
        'aries',
        'taurus',
        'gemini',
        'cancer',
        'leo',
        'virgo',
        'libra',
        'scorpio',
        'sagittarius',
        'capricorn',
        'aquarius',
        'pisces',
      ];
      const planets = [
        'sun',
        'moon',
        'mercury',
        'venus',
        'mars',
        'jupiter',
        'saturn',
        'uranus',
        'neptune',
        'pluto',
      ];
      highlightTerms = [...zodiacSigns, ...planets].filter((term) =>
        scriptLower.includes(term),
      );
    } else {
      // Educational videos: use thematic composition with OG images
      const composition = buildThematicVideoComposition({
        script: script.fullScript,
        facet: matchedFacet || {
          dayIndex: 0,
          title: script.facetTitle,
          grimoireSlug: slug,
          focus: script.facetTitle,
          shortFormHook: script.facetTitle,
          threads: {
            keyword: script.facetTitle,
            angles: [],
          },
        },
        theme,
        baseUrl,
        slug,
      });
      images = composition.images;
      overlays = composition.overlays;
      highlightTerms = composition.highlightTerms;
      highlightColor = composition.highlightColor;
      categoryVisuals = composition.categoryVisuals;
    }

    const audioBuffer = await generateVoiceover(script.fullScript, {
      voiceName: 'alloy',
      speed: 1.0,
    });

    // Get audio duration for Remotion
    const audioNodeBuffer = Buffer.from(audioBuffer);
    const audioDuration = await getAudioDurationFromBuffer(audioNodeBuffer);
    console.log(`🎵 Audio duration: ${audioDuration}s`);

    const dateKey = script.scheduledDate.toISOString().split('T')[0];
    let videoBuffer: Buffer | undefined;

    // Try Remotion first for beautiful shooting stars animation
    const remotionAvailable = await isRemotionAvailable();
    let useFFmpegFallback = !remotionAvailable || !audioDuration;

    console.log(
      `🎥 Remotion available: ${remotionAvailable}, audio duration: ${audioDuration}s`,
    );
    console.log(
      `🎥 Will use: ${useFFmpegFallback ? 'FFmpeg fallback' : 'Remotion'}`,
    );

    if (!useFFmpegFallback) {
      try {
        console.log(`🎬 Using Remotion for video generation...`);

        // Upload audio to a temporary URL for Remotion
        const audioBlob = await put(
          `temp/audio-${Date.now()}.mp3`,
          audioBuffer,
          { access: 'public', addRandomSuffix: true },
        );

        // Build subtitle segments from script
        const segments = scriptToAudioSegments(
          script.fullScript,
          audioDuration,
          2.6,
        );

        // Use MediumFormVideo for thematic videos (multi-segment), ShortFormVideo for short
        const remotionFormat =
          audioDuration > 45 ? 'MediumFormVideo' : 'ShortFormVideo';

        // Unique seed per render — same script + timestamp = different background each time
        const videoSeed = `${safeSlug}-${scriptId}-${Date.now()}`;

        // Extract symbol content (zodiac, planet, numerology, tarot) for overlay
        // Pass facetTitle + beginning of script for detection
        const symbolContent = `${script.facetTitle || ''} ${script.fullScript?.substring(0, 200) || ''}`;

        // Background music for ambient atmosphere
        const musicBaseUrl =
          process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';
        const backgroundMusicUrl = `${musicBaseUrl}/audio/series/lunary-bed-v1.mp3`;

        videoBuffer = await renderRemotionVideo({
          format: remotionFormat,
          outputPath: '',
          segments,
          audioUrl: audioBlob.url,
          highlightTerms: highlightTerms || [],
          durationSeconds: audioDuration + 2,
          overlays: overlays || [],
          categoryVisuals,
          seed: videoSeed,
          zodiacSign: symbolContent,
          backgroundMusicUrl,
        });

        console.log(`✅ Remotion: Video rendered with shooting stars`);
      } catch (remotionError) {
        const errMsg =
          remotionError instanceof Error
            ? remotionError.message
            : String(remotionError);
        const errStack =
          remotionError instanceof Error ? remotionError.stack : '';
        console.error(
          `❌ Remotion render failed, falling back to FFmpeg:\n  Message: ${errMsg}\n  Stack: ${errStack}`,
        );
        useFFmpegFallback = true;
      }
    }

    if (useFFmpegFallback) {
      console.log(`⚠️ Using FFmpeg fallback for video generation...`);
      // FFmpeg doesn't support series_badge style, filter it out
      const ffmpegOverlays = overlays.filter((o) => o.style !== 'series_badge');
      videoBuffer = await composeVideo({
        images,
        audioBuffer,
        format: 'story',
        outputFilename: `short-${safeSlug}-${dateKey}.mp4`,
        subtitlesText: script.fullScript,
        subtitlesHighlightTerms: highlightTerms,
        subtitlesHighlightColor: highlightColor,
        overlays: ffmpegOverlays as any,
      });
    }

    if (!videoBuffer) {
      throw new Error('Video generation failed - no video buffer produced');
    }

    const blobKey = `videos/shorts/daily/manual-${dateKey}-${safeSlug}-${Date.now()}.mp4`;
    const { url: videoUrl } = await put(blobKey, videoBuffer, {
      access: 'public',
      contentType: 'video/mp4',
    });

    const videoPlatforms = [
      'instagram',
      'tiktok',
      'threads',
      'twitter',
      'youtube',
    ];
    try {
      await sql`
        ALTER TABLE social_posts
        ADD COLUMN IF NOT EXISTS video_url TEXT
      `;
    } catch (alterError) {
      console.warn('Could not add video_url column:', alterError);
    }
    await sql.query(
      `UPDATE social_posts
       SET video_url = $1
       WHERE platform = ANY($2::text[])
         AND post_type = $3
         AND topic = $4
         AND scheduled_date::date = $5`,
      [videoUrl, videoPlatforms, 'video', script.facetTitle, dateKey],
    );

    const scheduleResult = await sql.query(
      `SELECT scheduled_date, content
       FROM social_posts
       WHERE platform = ANY($1::text[])
         AND post_type = $2
         AND topic = $3
         AND scheduled_date::date = $4
       ORDER BY scheduled_date ASC
       LIMIT 1`,
      [videoPlatforms, 'video', script.facetTitle, dateKey],
    );
    const rawPublishDate =
      scheduleResult.rows[0]?.scheduled_date || script.scheduledDate;
    const publishDate = (() => {
      if (!rawPublishDate) {
        return new Date(`${dateKey}T20:00:00.000Z`).toISOString();
      }
      const dateValue = new Date(rawPublishDate);
      if (
        dateValue.getUTCHours() === 0 &&
        dateValue.getUTCMinutes() === 0 &&
        dateValue.getUTCSeconds() === 0
      ) {
        return new Date(`${dateKey}T20:00:00.000Z`).toISOString();
      }
      return dateValue.toISOString();
    })();

    return NextResponse.json({
      success: true,
      videoUrl,
    });
  } catch (error) {
    console.error('Failed to generate video from script:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
