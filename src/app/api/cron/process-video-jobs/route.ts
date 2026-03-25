// DEPRECATED: Video pipeline moved to Hetzner (content-creator/hetzner-pipeline/).
// This route is no longer called by Vercel crons. Kept for admin/debug use only.

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { head, put } from '@vercel/blob';
import { composeVideo } from '@/lib/video/compose-video';
import {
  renderRemotionVideo,
  isRemotionAvailable,
  scriptToAudioSegments,
  wordTimestampsToSegments,
} from '@/lib/video/remotion-renderer';
import { generateVoiceover, transcribeWithWhisper } from '@/lib/tts';
import { TTS_PRESETS } from '@/lib/tts/presets';
import { buildThematicVideoComposition } from '@/lib/video/thematic-video';
import { buildVideoCaption } from '@/lib/social/video-captions';
import { categoryThemes, generateHashtags } from '@/lib/social/weekly-themes';
import { generateInstagramReelCaption } from '@/lib/social/video-scripts/tiktok/metadata';
import { getImageBaseUrl } from '@/lib/urls';
import { postToSocial } from '@/lib/social/client';
import { createHash } from 'crypto';
import { writeFile, unlink, mkdtemp } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import ffmpeg from 'fluent-ffmpeg';

export const dynamic = 'force-dynamic';

/**
 * Map contentTypeKey from script metadata to a category-visuals category.
 * Engagement scripts (sign-check, ranking, angel-number, etc.) don't have a
 * WeeklyTheme, so we derive the visual category from their content type key.
 */
function contentTypeKeyToCategory(
  contentTypeKey: string | undefined,
): string | undefined {
  if (!contentTypeKey) return undefined;
  const map: Record<string, string> = {
    angel_numbers: 'angel-numbers',
    sign_check: 'zodiac',
    sign_identity: 'zodiac',
    sign_origin: 'zodiac',
    chiron_sign: 'zodiac',
    ranking: 'zodiac',
    hot_take: 'zodiac',
    quiz: 'zodiac',
    myth: 'zodiac',
    did_you_know: 'zodiac',
    transit_alert: 'transits',
    zodiac_sun: 'zodiac',
    zodiac_moon: 'zodiac',
    zodiac_rising: 'zodiac',
    moon_phases: 'moon',
    numerology_life_path: 'numerology',
    numerology_expression: 'numerology',
    mirror_hours: 'mirror-hours',
    crystals: 'crystals',
    tarot_major: 'tarot',
    tarot_minor: 'tarot',
    spells: 'spells',
    planets: 'transits',
    retrogrades: 'transits',
    eclipses: 'eclipses',
    aspects: 'aspects',
    houses: 'houses',
    chakras: 'chakras',
  };
  return map[contentTypeKey];
}

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

    // Validate magic bytes: MP3 (ID3 header or sync word) or WAV (RIFF)
    const isID3 =
      buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33; // "ID3"
    const isMp3Sync = buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0; // 0xFFEx sync
    const isWav =
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46; // "RIFF"
    if (!isID3 && !isMp3Sync && !isWav) {
      reject(new Error('Buffer does not appear to be a valid audio file'));
      return;
    }

    try {
      const tempDir = await mkdtemp(join(tmpdir(), 'audio-dur-'));
      const tempPath = join(tempDir, 'audio.mp3');
      await writeFile(tempPath, buffer);
      ffmpeg.ffprobe(tempPath, async (err, metadata) => {
        await unlink(tempPath).catch(() => {});
        if (err) {
          // ffprobe not available (e.g. Vercel) — estimate from MP3 bitrate
          // Assume 128kbps MP3: duration = fileSize(bytes) / (128000/8)
          const estimatedDuration = buffer.length / (128000 / 8);
          console.warn(
            `ffprobe unavailable, estimating audio duration: ${estimatedDuration.toFixed(1)}s`,
          );
          resolve(estimatedDuration);
        } else if (metadata.format.duration) {
          resolve(metadata.format.duration);
        } else {
          reject(new Error('Could not determine audio duration'));
        }
      });
    } catch {
      // ffmpeg/ffprobe not installed at all — estimate from buffer size
      const estimatedDuration = buffer.length / (128000 / 8);
      console.warn(
        `ffprobe not found, estimating audio duration: ${estimatedDuration.toFixed(1)}s`,
      );
      resolve(estimatedDuration);
    }
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

/**
 * Map contentTypeKey (from script metadata) to a theme category
 * so we can generate hashtags even when theme/facet lookup fails.
 */
const CONTENT_TYPE_TO_CATEGORY: Record<string, string> = {
  angel_numbers: 'numerology',
  sign_identity: 'zodiac',
  zodiac_sun: 'zodiac',
  zodiac_moon: 'zodiac',
  zodiac_rising: 'zodiac',
  zodiac_compatibility: 'zodiac',
  zodiac_ranking: 'zodiac',
  zodiac_hot_take: 'zodiac',
  birth_chart: 'zodiac',
  transit: 'planetary',
  retrograde: 'planetary',
  retrogrades: 'planetary',
  moon_phase: 'lunar',
  moon_phases: 'lunar',
  new_moon: 'lunar',
  full_moon: 'lunar',
  tarot_card: 'tarot',
  tarot_reading: 'tarot',
  tarot_spread: 'tarot',
  crystal: 'crystals',
  crystal_healing: 'crystals',
  spell: 'spells',
  spellwork: 'spells',
  ritual: 'spells',
  chakra: 'chakras',
  rune: 'runes',
  sabbat: 'sabbat',
  eclipse: 'planetary',
  eclipses: 'planetary',
};

/**
 * Fallback hashtag pools by category for when theme/facet resolution fails.
 * TikTok: 3-5 varied, on-topic tags (no brand tag — stunts TikTok reach).
 * Instagram: 5 IG-native tags (no #fyp/#learnontiktok).
 */
const FALLBACK_HASHTAGS: Record<
  string,
  { tiktok: string[]; instagram: string[] }
> = {
  zodiac: {
    tiktok: [
      '#astrology',
      '#zodiac',
      '#zodiacsigns',
      '#astrologytiktok',
      '#spiritualtiktok',
    ],
    instagram: [
      '#astrology',
      '#zodiac',
      '#zodiacsigns',
      '#birthchart',
      '#astrologycommunity',
    ],
  },
  tarot: {
    tiktok: [
      '#tarot',
      '#tarotreading',
      '#tarottok',
      '#tarotcards',
      '#witchtok',
    ],
    instagram: [
      '#tarot',
      '#tarotreading',
      '#tarotcommunity',
      '#tarotcards',
      '#witchesofinstagram',
    ],
  },
  lunar: {
    tiktok: [
      '#moonphases',
      '#moon',
      '#moonmagic',
      '#witchtok',
      '#spiritualtiktok',
    ],
    instagram: [
      '#moonphases',
      '#moonmagic',
      '#newmoon',
      '#fullmoon',
      '#witchesofinstagram',
    ],
  },
  planetary: {
    tiktok: [
      '#astrology',
      '#zodiac',
      '#astrologytiktok',
      '#spiritualtiktok',
      '#witchtok',
    ],
    instagram: [
      '#astrology',
      '#zodiac',
      '#zodiacsigns',
      '#birthchart',
      '#spiritualinstagram',
    ],
  },
  numerology: {
    tiktok: [
      '#numerology',
      '#angelnumbers',
      '#manifestation',
      '#spiritualtiktok',
      '#spiritualawakening',
    ],
    instagram: [
      '#numerology',
      '#angelnumbers',
      '#manifestation',
      '#spiritualawakening',
      '#spiritualinstagram',
    ],
  },
  crystals: {
    tiktok: [
      '#crystals',
      '#crystaltok',
      '#crystalhealing',
      '#witchtok',
      '#spiritualtiktok',
    ],
    instagram: [
      '#crystals',
      '#crystalhealing',
      '#crystalcollection',
      '#witchesofinstagram',
      '#spiritualinstagram',
    ],
  },
  spells: {
    tiktok: ['#witchtok', '#spells', '#witchcraft', '#spellwork', '#babywitch'],
    instagram: [
      '#witchesofinstagram',
      '#spells',
      '#witchcraft',
      '#spellcasting',
      '#witchyvibes',
    ],
  },
  chakras: {
    tiktok: [
      '#chakras',
      '#spiritual',
      '#meditation',
      '#healing',
      '#spiritualtiktok',
    ],
    instagram: [
      '#chakras',
      '#spiritual',
      '#meditation',
      '#healing',
      '#spiritualinstagram',
    ],
  },
  runes: {
    tiktok: ['#runes', '#norse', '#viking', '#elderfuthark', '#witchtok'],
    instagram: [
      '#runes',
      '#norsemythology',
      '#elderfuthark',
      '#divination',
      '#witchesofinstagram',
    ],
  },
  sabbat: {
    tiktok: [
      '#pagan',
      '#wicca',
      '#witchtok',
      '#witchcraft',
      '#spiritualtiktok',
    ],
    instagram: [
      '#pagan',
      '#wicca',
      '#witchesofinstagram',
      '#witchcraft',
      '#sabbat',
    ],
  },
};

const DEFAULT_FALLBACK_HASHTAGS = {
  tiktok: [
    '#spiritualtiktok',
    '#witchtok',
    '#spiritual',
    '#spiritualawakening',
  ],
  instagram: [
    '#spiritualinstagram',
    '#witchesofinstagram',
    '#spiritual',
    '#mystical',
    '#cosmicenergy',
  ],
};

/**
 * Generate fallback hashtags from script metadata when theme/facet lookup fails.
 */
function getFallbackHashtags(
  platform: string,
  metadata: Record<string, unknown>,
): string {
  const contentTypeKey = String(metadata?.contentTypeKey || '');
  const category = CONTENT_TYPE_TO_CATEGORY[contentTypeKey] || '';
  const pool = FALLBACK_HASHTAGS[category];
  const platformKey = platform === 'instagram' ? 'instagram' : 'tiktok';
  const tags = pool?.[platformKey] || DEFAULT_FALLBACK_HASHTAGS[platformKey];
  const count = platform === 'instagram' ? 5 : 3;
  return tags.slice(0, count).join(' ');
}

const videoHashtagConfig: Record<
  string,
  { useHashtags: boolean; count: number }
> = {
  instagram: { useHashtags: true, count: 5 },
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
    // Clean up orphaned jobs — jobs where no social_post of any status exists
    // for the matching script topic + date. A 48-hour grace period prevents
    // newly-created engagement scripts (which have no social_post yet) from
    // being swept up before the pipeline has a chance to process them.
    await sql`
      DELETE FROM video_jobs vj
      WHERE vj.status IN ('pending', 'failed')
        AND vj.created_at < NOW() - INTERVAL '48 hours'
        AND NOT EXISTS (
          SELECT 1
          FROM video_scripts vs
          JOIN social_posts sp
            ON sp.topic = vs.facet_title
           AND sp.scheduled_date::date = vs.scheduled_date
           AND sp.post_type = 'video'
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
        // For engagement scripts (sign-check, ranking, angel-number, etc.)
        // theme is undefined because they don't use weekly themes.
        // Derive category from script metadata contentTypeKey instead.
        const metadata = script.metadata || {};
        const category =
          theme?.category ||
          contentTypeKeyToCategory(metadata.contentTypeKey) ||
          'lunar';

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

          // Content-type-aware TTS pacing — different speeds for different content feels
          const contentTypeKey = (script.metadata || {}).contentTypeKey as
            | string
            | undefined;
          const TTS_PRESET_BY_TYPE: Record<string, keyof typeof TTS_PRESETS> = {
            angel_numbers: 'short_mystical',
            mirror_hours: 'short_mystical',
            ranking: 'short',
            hot_take: 'short',
            quiz: 'short',
            did_you_know: 'short',
            chiron_sign: 'slow_mystical',
          };
          const presetKey =
            (contentTypeKey && TTS_PRESET_BY_TYPE[contentTypeKey]) || 'medium';
          const ttsPreset = TTS_PRESETS[presetKey];
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

          // Upload audio to Blob so the render server can download it
          const audioBlob = await put(
            `temp/audio-${Date.now()}.mp3`,
            audioNodeBuffer,
            { access: 'public', addRandomSuffix: true },
          );

          const contentCreatorUrl = process.env.CONTENT_CREATOR_API_URL;
          if (contentCreatorUrl) {
            // Delegate rendering to Content Creator server (Hetzner)
            console.log(
              `🎬 Sending script ${script.id} to Content Creator for rendering...`,
            );

            // Whisper transcription for accurate subtitle timing
            let wordTimestamps: Array<{
              word: string;
              start: number;
              end: number;
            }> = [];
            try {
              const whisperWords = await transcribeWithWhisper(audioBuffer);
              if (whisperWords.length > 0) {
                wordTimestamps = whisperWords;
                console.log(
                  `🎙️ Whisper: ${whisperWords.length} word timestamps for script ${script.id}`,
                );
              }
            } catch (whisperErr) {
              console.warn(
                `⚠️ Whisper transcription failed, render server will use fallback timing:`,
                whisperErr instanceof Error ? whisperErr.message : whisperErr,
              );
            }

            const renderSecret =
              process.env.LUNARY_RENDER_SECRET || process.env.CRON_SECRET;
            const renderResponse = await fetch(
              `${contentCreatorUrl}/api/lunary-render`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(renderSecret
                    ? { Authorization: `Bearer ${renderSecret}` }
                    : {}),
                },
                body: JSON.stringify({
                  scriptText: script.full_script,
                  audioUrl: audioBlob.url,
                  images: images.map(
                    (img: string | { url: string; [k: string]: unknown }) => {
                      const url = typeof img === 'string' ? img : img?.url;
                      if (!url) return img;
                      return url.startsWith('http') ? url : `${baseUrl}${url}`;
                    },
                  ),
                  slug: safeSlug,
                  facetTitle: script.facet_title,
                  dateKey,
                  wordTimestamps:
                    wordTimestamps.length > 0 ? wordTimestamps : undefined,
                  audioDuration,
                  // Remotion composition props
                  overlays: overlays || [],
                  highlightTerms: highlightTerms || [],
                  categoryVisuals,
                  seed: `${safeSlug}-${script.id}-${Date.now()}`,
                  zodiacSign: `${script.facet_title || ''} ${script.full_script?.substring(0, 200) || ''}`,
                }),
              },
            );

            if (!renderResponse.ok) {
              const errorBody = await renderResponse.text();
              throw new Error(
                `Content Creator render failed (${renderResponse.status}): ${errorBody}`,
              );
            }

            const renderResult = await renderResponse.json();
            if (!renderResult.videoData) {
              throw new Error('Content Creator returned no video data');
            }

            videoBuffer = Buffer.from(renderResult.videoData, 'base64');
            console.log(
              `✅ Content Creator rendered ${(videoBuffer.length / 1024 / 1024).toFixed(1)}MB video for script ${script.id}`,
            );
          } else {
            // Local rendering fallback (development only)
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

                let segments;
                try {
                  const whisperWords = await transcribeWithWhisper(audioBuffer);
                  segments = whisperWords.length
                    ? wordTimestampsToSegments(
                        whisperWords,
                        audioDuration,
                        6,
                        script.full_script,
                      )
                    : scriptToAudioSegments(
                        script.full_script,
                        audioDuration,
                        2.6,
                      );
                } catch {
                  segments = scriptToAudioSegments(
                    script.full_script,
                    audioDuration,
                    2.6,
                  );
                }

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
                console.error(
                  `❌ Remotion render failed for script ${script.id}:`,
                  remotionError,
                );
                useFFmpegFallback = true;
              }
            }

            if (useFFmpegFallback) {
              console.log(
                `⚠️ Using FFmpeg fallback for script ${script.id}...`,
              );
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
          // Instagram-dedicated scripts (platform='instagram' in video_scripts) post only
          // to Instagram — they must not cross-post to TikTok or other platforms.
          // Threads is excluded from video cross-posting: it's a text/conversation
          // platform and receiving 3 videos/day on top of text posts is spammy.
          // Instagram is excluded from TikTok cross-posts: it has its own dedicated
          // Reels queue (generateWeeklyInstagramScripts, Mon-Fri at 15:00 UTC) and
          // cross-posting caused 3-4 reels/day instead of 2/week.
          const shortVideoPlatforms =
            script.platform === 'instagram'
              ? ['instagram']
              : ['tiktok', 'youtube'];
          const shortPlatformSet = new Set(['twitter']);
          const scheduledDate = new Date(script.scheduled_date);
          // Apply slot-specific posting hour from metadata
          const scriptMetadata = script.metadata || {};
          if (scriptMetadata.scheduledHour != null) {
            scheduledDate.setUTCHours(scriptMetadata.scheduledHour, 0, 0, 0);
          }
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
          } else {
            // Fallback: derive hashtags from script metadata when theme/facet
            // lookup fails (common for scripts generated by daily-content-generate)
            const scriptMeta = (script.metadata || {}) as Record<
              string,
              unknown
            >;
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
                getFallbackHashtags(platform, scriptMeta),
              );
            }
          }
          const buildCaptionForPlatform = (platform: string) => {
            const tags = tagsByPlatform.get(platform) || '';
            const isShort = shortPlatformSet.has(platform);
            if (!isShort) {
              let caption = tags
                ? `${baseVideoCaption}\n\n${tags}`
                : baseVideoCaption;
              // Append grimoire link for YouTube only — TikTok penalises links
              // in descriptions and Instagram links belong in first comments.
              if (platform === 'youtube' && slug) {
                caption += `\n\nLearn more: lunary.app/grimoire/${slug}`;
              }
              return caption;
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
            // Skip series parts > 1 on Instagram — users don't see parts in order
            if (platform === 'instagram' && partNumber > 1) continue;
            // Instagram scheduling uses the scheduledDate from the dedicated IG script
            // (already set to 15:00 UTC by generateWeeklyInstagramScripts)
            const platformScheduledDate = scheduledDate;
            // Instagram gets its own caption optimised for saves/shares/follows
            const postCaption =
              platform === 'instagram'
                ? generateInstagramReelCaption({
                    category,
                    themeName,
                    facetTitle: script.facet_title,
                    hookText:
                      typeof metadata.hookText === 'string'
                        ? metadata.hookText
                        : undefined,
                    scheduledDate: platformScheduledDate,
                  })
                : buildCaptionForPlatform(platform);
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
                ${postCaption},
                ${platform},
                'video',
                ${script.facet_title},
                'pending',
                ${imageUrl ?? null},
                ${videoUrl},
                ${platformScheduledDate.toISOString()},
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

          // ─── Auto-scheduling bridge ───
          // Push newly created video posts to the appropriate social backend
          // (Spellcast for IG reels, Ayrshare for TikTok, etc.)
          const pendingPosts = await sql`
            SELECT id, content, platform, scheduled_date, video_url
            FROM social_posts
            WHERE topic = ${script.facet_title}
              AND scheduled_date::date = ${dateKey}
              AND post_type = 'video'
              AND status = 'pending'
              AND video_url IS NOT NULL
          `;
          for (const post of pendingPosts.rows) {
            try {
              const scheduledIso = new Date(post.scheduled_date).toISOString();
              const isFuture = new Date(post.scheduled_date) > new Date();
              const result = await postToSocial({
                platform: post.platform as string,
                content: post.content as string,
                scheduledDate: scheduledIso,
                media: [{ type: 'video', url: post.video_url as string }],
                platformSettings:
                  post.platform === 'tiktok'
                    ? {
                        privacyLevel: 'PUBLIC_TO_EVERYONE',
                      }
                    : undefined,
              });
              if (result.success) {
                await sql`
                  UPDATE social_posts
                  SET status = ${isFuture ? 'scheduled' : 'published'},
                      updated_at = NOW()
                  WHERE id = ${post.id}
                `;
                console.log(
                  `[bridge] ${post.platform} post ${post.id} → ${result.backend} (${result.postId})`,
                );
              } else {
                console.warn(
                  `[bridge] ${post.platform} post ${post.id} failed: ${result.error}`,
                );
                await sql`
                  UPDATE social_posts
                  SET status = 'failed', updated_at = NOW()
                  WHERE id = ${post.id}
                `;
              }
            } catch (bridgeErr) {
              console.warn(
                `[bridge] ${post.platform} post ${post.id} error:`,
                bridgeErr instanceof Error ? bridgeErr.message : bridgeErr,
              );
            }
          }
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
