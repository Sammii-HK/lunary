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
import { getVideoScripts } from '@/lib/social/video-script-generator';
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

    const scripts = await getVideoScripts();
    const script = scripts.find((s) => s.id === scriptId);
    if (!script) {
      return NextResponse.json(
        { success: false, error: 'Script not found' },
        { status: 404 },
      );
    }

    const theme = categoryThemes.find((t) => t.name === script.themeName);
    const { slug, facet: matchedFacet } = getFacetInfo(
      theme,
      script.facetTitle,
    );
    const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, '-');

    const { images, overlays, highlightTerms, highlightColor } =
      buildThematicVideoComposition({
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

    const audioBuffer = await generateVoiceover(script.fullScript, {
      voiceName: 'alloy',
      model: 'gpt-4o-mini-tts',
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

        // Determine format based on number of images
        const remotionFormat =
          images.length > 1 ? 'MediumFormVideo' : 'ShortFormVideo';

        videoBuffer = await renderRemotionVideo({
          format: remotionFormat,
          outputPath: '',
          hookText: script.facetTitle,
          segments,
          audioUrl: audioBlob.url,
          images:
            images.length > 1
              ? images.map((img, idx) => ({
                  url: img.url,
                  startTime:
                    img.startTime || (idx * audioDuration) / images.length,
                  endTime:
                    img.endTime || ((idx + 1) * audioDuration) / images.length,
                  topic: script.facetTitle,
                }))
              : undefined,
          backgroundImage: images.length === 1 ? images[0].url : undefined,
          highlightTerms: highlightTerms || [],
          durationSeconds: audioDuration + 2,
        });

        console.log(`✅ Remotion: Video rendered with shooting stars`);
      } catch (remotionError) {
        console.error(
          `❌ Remotion render failed, falling back to FFmpeg:`,
          remotionError,
        );
        useFFmpegFallback = true;
      }
    }

    if (useFFmpegFallback) {
      console.log(`⚠️ Using FFmpeg fallback for video generation...`);
      videoBuffer = await composeVideo({
        images,
        audioBuffer,
        format: 'story',
        outputFilename: `short-${safeSlug}-${dateKey}.mp4`,
        subtitlesText: script.fullScript,
        subtitlesHighlightTerms: highlightTerms,
        subtitlesHighlightColor: highlightColor,
        overlays,
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
