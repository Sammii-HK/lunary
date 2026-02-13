import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { head, put } from '@vercel/blob';
import { composeVideo } from '@/lib/video/compose-video';
import {
  renderRemotionVideo,
  isRemotionAvailable,
  scriptToAudioSegments,
} from '@/lib/video/remotion-renderer';
import { generateVoiceover } from '@/lib/tts';
import { TTS_PRESETS } from '@/lib/tts/presets';
import { buildThematicVideoComposition } from '@/lib/video/thematic-video';
import { buildVideoCaption } from '@/lib/social/video-captions';
import { categoryThemes, generateHashtags } from '@/lib/social/weekly-themes';
import { getImageBaseUrl } from '@/lib/urls';
import { createHash } from 'crypto';
import { writeFile, unlink, mkdtemp } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import ffmpeg from 'fluent-ffmpeg';

function getAudioDurationFromBuffer(buffer: Buffer): Promise<number> {
  return new Promise(async (resolve, reject) => {
    // Validate buffer size (max 50MB for audio)
    const MAX_AUDIO_SIZE = 50 * 1024 * 1024;
    if (buffer.length > MAX_AUDIO_SIZE) {
      reject(new Error('Audio buffer too large'));
      return;
    }

    // Validate buffer is not empty
    if (buffer.length === 0) {
      reject(new Error('Audio buffer is empty'));
      return;
    }

    const tempDir = await mkdtemp(join(tmpdir(), 'audio-dur-'));
    const tempPath = join(tempDir, 'audio.mp3');
    await writeFile(tempPath, buffer);
    ffmpeg.ffprobe(tempPath, async (err, metadata) => {
      await unlink(tempPath).catch(() => {});
      if (err) reject(err);
      else if (metadata.format.duration) resolve(metadata.format.duration);
      else reject(new Error('Could not determine audio duration'));
    });
  });
}

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for video processing

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(weekStart: Date): Date {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return weekEnd;
}

function getAudioCacheKey(
  scriptText: string,
  voiceName: string,
  model: string,
  speed: number,
): string {
  const hash = createHash('sha256')
    .update(scriptText)
    .digest('hex')
    .slice(0, 32);
  const speedKey = Number.isFinite(speed)
    ? speed.toFixed(2).replace('.', '')
    : '100';
  return `audio/shorts/${voiceName}-${model}-s${speedKey}-${hash}.mp3`;
}

function normalizeLineBreaks(text: string) {
  return text.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
}

function trimToMax(text: string, maxChars: number, addEllipsis = true) {
  if (text.length <= maxChars) return text;

  const protectedText = text.replace(/(\d)\.(\d)/g, '$1<DECIMAL>$2');
  const sentences = protectedText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [
    protectedText,
  ];
  let output = '';
  for (const sentence of sentences) {
    const restored = sentence.replace(/<DECIMAL>/g, '.').trim();
    const candidate = output ? `${output} ${restored}` : restored;
    if (candidate.length > maxChars) break;
    output = candidate;
  }

  if (!output) {
    let snippet = text.slice(0, Math.max(0, maxChars - 3)).trim();
    const lastSpace = snippet.lastIndexOf(' ');
    if (lastSpace > 40) {
      snippet = snippet.slice(0, lastSpace).trim();
    }
    output = snippet;
  }

  const suffix = addEllipsis ? '...' : '';
  if (output.length > maxChars - suffix.length) {
    output = output.slice(0, maxChars - suffix.length).trim();
  }

  if (addEllipsis && output.length < text.length) {
    return `${output}...`;
  }

  return output;
}

// Avoid passing array literals as strings; use parameterized arrays instead.

const videoHashtagConfig: Record<
  string,
  { useHashtags: boolean; count: number }
> = {
  instagram: { useHashtags: true, count: 3 },
  tiktok: { useHashtags: true, count: 3 },
  twitter: { useHashtags: true, count: 2 },
  threads: { useHashtags: false, count: 0 },
  youtube: { useHashtags: true, count: 3 },
};

async function ensureVideoJobsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS video_jobs (
      id SERIAL PRIMARY KEY,
      script_id INTEGER NOT NULL,
      week_start DATE,
      date_key DATE,
      topic TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_video_jobs_script_id
    ON video_jobs(script_id)
  `;
}

export async function POST(request: NextRequest) {
  const vercelCronHeader =
    request.headers.get('x-vercel-cron') ||
    request.headers.get('X-Vercel-Cron') ||
    request.headers.get('X-VERCEL-CRON');
  const isVercelCron = vercelCronHeader === '1' || vercelCronHeader === 'true';
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization') || '';

  if (!isVercelCron && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }

  try {
    await ensureVideoJobsTable();
    // Clean up orphaned jobs — but don't require week_theme match
    // (engagement scripts may have different theme names than their social_posts)
    await sql`
      DELETE FROM video_jobs vj
      WHERE vj.status IN ('pending', 'failed')
        AND NOT EXISTS (
          SELECT 1
          FROM video_scripts vs
          JOIN social_posts sp
            ON sp.topic = vs.facet_title
           AND sp.scheduled_date::date = vs.scheduled_date
           AND sp.post_type = 'video'
           AND sp.status IN ('pending', 'approved')
          WHERE vs.id = vj.script_id
        )
    `;

    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const limit = Math.min(Math.max(Number(limitParam || 1), 1), 5);

    const jobsResult = await sql`
      WITH next_jobs AS (
        SELECT id
        FROM video_jobs
        WHERE status = 'pending'
        ORDER BY created_at ASC
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      )
      UPDATE video_jobs
      SET status = 'processing', attempts = attempts + 1, updated_at = NOW()
      WHERE id IN (SELECT id FROM next_jobs)
      RETURNING *
    `;

    if (jobsResult.rows.length === 0) {
      return NextResponse.json({ success: true, processed: 0 });
    }

    const baseUrl = getImageBaseUrl();
    let processed = 0;
    const errors: Array<{ jobId: number; error: string }> = [];

    for (const job of jobsResult.rows) {
      try {
        const scriptResult = await sql`
          SELECT *
          FROM video_scripts
          WHERE id = ${job.script_id}
          LIMIT 1
        `;
        const script = scriptResult.rows[0];
        if (!script) {
          throw new Error('Script not found');
        }

        const scheduledDate = new Date(script.scheduled_date);
        const dateKey = scheduledDate.toISOString().split('T')[0];
        const weekStart = job.week_start
          ? getWeekStart(new Date(job.week_start))
          : getWeekStart(scheduledDate);
        const weekEnd = getWeekEnd(weekStart);

        const themeName = script.theme_name;
        const theme = categoryThemes.find((t) => t.name === themeName);
        const facet = theme?.facets.find((f) => f.title === script.facet_title);
        const fallbackSlug = script.facet_title
          .toLowerCase()
          .replace(/\s+/g, '-');
        const slug = facet?.grimoireSlug.split('/').pop() || fallbackSlug;
        const category = theme?.category || 'lunar';

        const totalParts = theme?.facets.length || 7;
        const facetIndex =
          theme?.facets.findIndex((f) => f.title === script.facet_title) ?? -1;
        const dayOfWeek = scheduledDate.getDay();
        const dayOffset =
          Number.isFinite(scheduledDate.getTime()) && dayOfWeek >= 0
            ? dayOfWeek === 0
              ? 6
              : dayOfWeek - 1
            : null;
        const partNumber = Number.isFinite(script.part_number)
          ? script.part_number
          : facetIndex >= 0
            ? facetIndex + 1
            : dayOffset !== null
              ? dayOffset + 1
              : 1;

        const postResult = await sql`
          SELECT video_url, week_theme, scheduled_date
          FROM social_posts
          WHERE topic = ${script.facet_title}
            AND scheduled_date::date = ${dateKey}
            AND post_type = 'video'
          ORDER BY created_at DESC
          LIMIT 1
        `;
        const postRow = postResult.rows[0] as
          | {
              video_url: string | null;
              week_theme: string | null;
              scheduled_date: string | Date;
            }
          | undefined;
        if (!postRow) {
          const message = `No matching post for topic "${script.facet_title}" on ${dateKey}`;
          errors.push({ jobId: job.id, error: message });
          await sql`
            UPDATE video_jobs
            SET status = 'failed', last_error = ${message}, updated_at = NOW()
            WHERE id = ${job.id}
          `;
          continue;
        }

        const existingVideoUrl = postRow.video_url ?? undefined;
        const postWeekTheme = postRow.week_theme ?? undefined;

        if (postWeekTheme && themeName && postWeekTheme !== themeName) {
          throw new Error(
            `Theme mismatch: post uses "${postWeekTheme}" but script uses "${themeName}"`,
          );
        }

        const force = url.searchParams.get('force') === 'true';
        let videoUrl = force ? undefined : existingVideoUrl;
        if (!videoUrl) {
          const {
            images,
            overlays,
            highlightTerms,
            highlightColor,
            categoryVisuals,
          } = buildThematicVideoComposition({
            script: script.full_script,
            facet: facet || {
              dayIndex: 0,
              title: script.facet_title,
              grimoireSlug: slug,
              focus: script.facet_title,
              shortFormHook: script.facet_title,
              threads: {
                keyword: script.facetTitle,
                angles: [],
              },
            },
            theme,
            baseUrl,
            slug,
          });

          if (!script.full_script) {
            throw new Error('Script text missing');
          }

          const ttsPreset = TTS_PRESETS.medium;
          const audioCacheKey = getAudioCacheKey(
            script.full_script,
            ttsPreset.voiceName,
            ttsPreset.model,
            ttsPreset.speed,
          );

          let audioBuffer: ArrayBuffer | null = null;
          try {
            const existingAudio = await head(audioCacheKey);
            if (existingAudio) {
              const audioResponse = await fetch(existingAudio.url);
              if (audioResponse.ok) {
                audioBuffer = await audioResponse.arrayBuffer();
                console.log(
                  `♻️ Reusing cached audio for script ${script.id}: ${audioCacheKey}`,
                );
              }
            }
          } catch {
            console.log(
              `ℹ️ No cached audio found for script ${script.id}: ${audioCacheKey}`,
            );
          }

          if (!audioBuffer) {
            audioBuffer = await generateVoiceover(script.full_script, {
              voiceName: ttsPreset.voiceName,
              model: ttsPreset.model,
              speed: ttsPreset.speed,
            });
            try {
              await put(audioCacheKey, audioBuffer, {
                access: 'public',
                contentType: 'audio/mpeg',
              });
            } catch (uploadError) {
              console.warn('Failed to cache audio:', uploadError);
            }
          }

          const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, '-');

          // Get audio duration for Remotion timing
          const audioNodeBuffer = Buffer.from(audioBuffer);
          const audioDuration =
            await getAudioDurationFromBuffer(audioNodeBuffer);
          console.log(`🎵 Audio duration: ${audioDuration}s`);

          let videoBuffer: Buffer | undefined;

          // Try Remotion first
          const remotionAvailable = await isRemotionAvailable();
          let useFFmpegFallback = !remotionAvailable || !audioDuration;

          console.log(
            `🎥 Remotion available: ${remotionAvailable}, audio duration: ${audioDuration}s`,
          );

          if (!useFFmpegFallback) {
            try {
              console.log(
                `🎬 Using Remotion for video generation (script ${script.id})...`,
              );

              // Upload audio to a temporary URL for Remotion
              const audioBlob = await put(
                `temp/audio-${Date.now()}.mp3`,
                audioNodeBuffer,
                { access: 'public', addRandomSuffix: true },
              );

              const segments = scriptToAudioSegments(
                script.full_script,
                audioDuration,
                2.6,
              );

              const remotionFormat =
                audioDuration > 45 ? 'MediumFormVideo' : 'ShortFormVideo';
              const videoSeed = `${safeSlug}-${script.id}-${Date.now()}`;
              const symbolContent = `${script.facet_title || ''} ${script.full_script?.substring(0, 200) || ''}`;

              videoBuffer = await renderRemotionVideo({
                format: remotionFormat,
                outputPath: '',
                segments,
                audioUrl: audioBlob.url,
                backgroundMusicUrl: '/audio/series/lunary-bed-v1.mp3',
                highlightTerms: highlightTerms || [],
                durationSeconds: audioDuration + 2,
                overlays: overlays || [],
                categoryVisuals,
                seed: videoSeed,
                zodiacSign: symbolContent,
              });

              console.log(
                `✅ Remotion: Video rendered for script ${script.id}`,
              );
            } catch (remotionError) {
              const errMsg =
                remotionError instanceof Error
                  ? remotionError.message
                  : String(remotionError);
              console.error(
                `❌ Remotion render failed for script ${script.id}, falling back to FFmpeg: ${errMsg}`,
              );
              useFFmpegFallback = true;
            }
          }

          if (useFFmpegFallback) {
            console.log(`⚠️ Using FFmpeg fallback for script ${script.id}...`);
            videoBuffer = await composeVideo({
              images,
              audioBuffer,
              format: 'story',
              outputFilename: `short-${safeSlug}-${dateKey}.mp4`,
              subtitlesText: script.full_script,
              subtitlesHighlightTerms: highlightTerms,
              subtitlesHighlightColor: highlightColor,
              overlays,
            });
          }

          if (!videoBuffer) {
            throw new Error('Video generation failed - no buffer produced');
          }

          const blobKey = `videos/shorts/daily/${dateKey}-${safeSlug}-${Date.now()}.mp4`;
          const uploadResult = await put(blobKey, videoBuffer, {
            access: 'public',
            contentType: 'video/mp4',
          });
          videoUrl = uploadResult.url;
        }

        if (videoUrl) {
          const shortVideoPlatforms = [
            'tiktok',
            'threads',
            'instagram',
            'twitter',
            'youtube',
          ];
          const shortPlatformSet = new Set(['twitter']);
          const scheduledDate = new Date(script.scheduled_date);
          // Use the engagement-optimized caption from generateTikTokCaption()
          // (stored in written_post_content) when available. Fall back to
          // buildVideoCaption() only for legacy scripts without it.
          const baseVideoCaption = normalizeLineBreaks(
            script.written_post_content
              ? script.written_post_content
              : buildVideoCaption({
                  themeName: postWeekTheme || themeName || undefined,
                  facetTitle: script.facet_title,
                  partNumber,
                  totalParts,
                  scriptText: script.full_script,
                }),
          );
          const tagsByPlatform = new Map<string, string>();
          if (theme && facet) {
            const tags = generateHashtags(theme, facet);
            for (const platform of shortVideoPlatforms) {
              const config = videoHashtagConfig[platform] || {
                useHashtags: false,
                count: 0,
              };
              if (!config.useHashtags || config.count <= 0) {
                tagsByPlatform.set(platform, '');
                continue;
              }
              tagsByPlatform.set(
                platform,
                [tags.domain, tags.topic, tags.brand]
                  .slice(0, config.count)
                  .join(' '),
              );
            }
          }
          const buildCaptionForPlatform = (platform: string) => {
            const tags = tagsByPlatform.get(platform) || '';
            const isShort = shortPlatformSet.has(platform);
            if (!isShort) {
              return tags ? `${baseVideoCaption}\n\n${tags}` : baseVideoCaption;
            }
            if (!tags) {
              return trimToMax(baseVideoCaption, 180, true);
            }
            const reserved = tags.length + 2;
            const bodyLimit = Math.max(80, 180 - reserved);
            const trimmedBody = trimToMax(baseVideoCaption, bodyLimit, true);
            return `${trimmedBody}\n\n${tags}`;
          };

          const existingPlatformsResult = await sql.query(
            `
              SELECT platform
              FROM social_posts
              WHERE topic = $1
                AND scheduled_date::date = $2
                AND platform = ANY($3::text[])
                AND post_type = 'video'
            `,
            [script.facet_title, dateKey, shortVideoPlatforms],
          );
          const existingPlatforms = new Set(
            existingPlatformsResult.rows.map((row) => row.platform as string),
          );

          for (const platform of shortVideoPlatforms) {
            if (existingPlatforms.has(platform)) continue;
            const imageUrl: string | null = null;
            await sql`
              INSERT INTO social_posts (
                content,
                platform,
                post_type,
                topic,
                status,
                image_url,
                video_url,
                scheduled_date,
                week_theme,
                week_start,
                created_at
              )
              VALUES (
                ${buildCaptionForPlatform(platform)},
                ${platform},
                'video',
                ${script.facet_title},
                'pending',
                ${imageUrl ?? null},
                ${videoUrl},
                ${scheduledDate.toISOString()},
                ${postWeekTheme || themeName || null},
                ${weekStart.toISOString().split('T')[0]},
                NOW()
              )
            `;
          }

          await sql`
            UPDATE social_posts
            SET video_url = ${videoUrl}
            WHERE topic = ${script.facet_title}
              AND scheduled_date::date = ${dateKey}
              AND post_type = 'video'
          `;
        }

        await sql`
          UPDATE video_jobs
          SET status = 'complete', last_error = NULL, updated_at = NOW()
          WHERE id = ${job.id}
        `;
        processed += 1;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        errors.push({ jobId: job.id, error: message });
        await sql`
          UPDATE video_jobs
          SET status = 'failed', last_error = ${message}, updated_at = NOW()
          WHERE id = ${job.id}
        `;
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      processed,
      errors,
    });
  } catch (error) {
    console.error('Video job processor failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
