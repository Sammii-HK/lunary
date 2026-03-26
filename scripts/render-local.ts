/**
 * Render video jobs locally using Remotion + ffprobe.
 *
 * Processes pending video_jobs from the DB, bypassing the broken
 * Content Creator remote server.
 *
 * Usage:
 *   pnpm tsx scripts/render-local.ts               # Process all pending jobs
 *   pnpm tsx scripts/render-local.ts 1569 1570      # Process specific job IDs
 *   pnpm tsx scripts/render-local.ts --preview      # TTS + duration only (no Remotion render)
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

// Must load env before importing app modules
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { neon } from '@neondatabase/serverless';
import { writeFile, unlink, mkdtemp, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { createHash } from 'crypto';
import ffmpeg from 'fluent-ffmpeg';
import { put, head } from '@vercel/blob';
import {
  renderRemotionVideo,
  isRemotionAvailable,
  scriptToAudioSegments,
  wordTimestampsToSegments,
} from '@/lib/video/remotion-renderer';
import { generateVoiceover, transcribeWithWhisper } from '@/lib/tts';
import { TTS_PRESETS } from '@/lib/tts/presets';
import { buildThematicVideoComposition } from '@/lib/video/thematic-video';

const sql = neon(process.env.POSTGRES_URL as string);

function getAudioDurationFromBuffer(buffer: Buffer): Promise<number> {
  return new Promise(async (resolve, reject) => {
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

function contentTypeKeyToCategory(
  contentTypeKey: string | undefined,
): string | undefined {
  if (!contentTypeKey) return undefined;
  const map: Record<string, string> = {
    angel_numbers: 'angel-numbers',
    sign_check: 'zodiac',
    sign_identity: 'zodiac',
    transit_alert: 'transits',
    moon_phases: 'moon',
    crystals: 'crystals',
    tarot_major: 'tarot',
    spells: 'spells',
    chakras: 'chakras',
  };
  return map[contentTypeKey];
}

const TTS_PRESET_BY_TYPE: Record<string, keyof typeof TTS_PRESETS> = {
  angel_numbers: 'short_mystical',
  mirror_hours: 'short_mystical',
  ranking: 'short',
  hot_take: 'short',
  quiz: 'short',
  did_you_know: 'short',
  chiron_sign: 'slow_mystical',
};

async function processJob(jobId: number, scriptId: number, preview: boolean) {
  console.log(`\n━━━ Processing job ${jobId} (script ${scriptId}) ━━━`);

  // Fetch script
  const scripts = await sql`
    SELECT * FROM video_scripts WHERE id = ${scriptId} LIMIT 1
  `;
  const script = scripts[0];
  if (!script) {
    console.error(`Script ${scriptId} not found`);
    return;
  }

  console.log(`📝 "${script.facet_title}" (${script.platform})`);
  console.log(
    `   Words: ${(script.full_script as string).split(/\s+/).length}`,
  );

  const metadata = (script.metadata || {}) as Record<string, unknown>;
  const contentTypeKey = metadata.contentTypeKey as string | undefined;
  const category = contentTypeKeyToCategory(contentTypeKey) || 'transits';

  // TTS
  const presetKey =
    (contentTypeKey && TTS_PRESET_BY_TYPE[contentTypeKey]) || 'medium';
  const ttsPreset = TTS_PRESETS[presetKey];
  const audioCacheKey = getAudioCacheKey(
    script.full_script as string,
    ttsPreset.voiceName,
    ttsPreset.model,
    ttsPreset.speed,
  );

  let audioBuffer: ArrayBuffer | null = null;

  // Check cache
  try {
    const existingAudio = await head(audioCacheKey);
    if (existingAudio) {
      const audioResponse = await fetch(existingAudio.url);
      if (audioResponse.ok) {
        audioBuffer = await audioResponse.arrayBuffer();
        console.log(`♻️  Cached audio found`);
      }
    }
  } catch {}

  if (!audioBuffer) {
    console.log(
      `🎙️  Generating TTS (${ttsPreset.voiceName}, speed ${ttsPreset.speed})...`,
    );
    const ttsScript = (script.full_script as string).replace(
      /\[(?:HOOK|MEANING|WHAT TO EXPECT|CTA)\]\s*\([^)]*\)\.?\s*/gi,
      '',
    );
    audioBuffer = await generateVoiceover(ttsScript, {
      voiceName: ttsPreset.voiceName,
      model: ttsPreset.model,
      speed: ttsPreset.speed,
    });
    // Cache it
    try {
      await put(audioCacheKey, audioBuffer, {
        access: 'public',
        contentType: 'audio/mpeg',
      });
      console.log(`💾 Audio cached`);
    } catch (e) {
      console.warn(`⚠️  Failed to cache audio`);
    }
  }

  // Duration
  const audioNodeBuffer = Buffer.from(audioBuffer);
  const audioDuration = await getAudioDurationFromBuffer(audioNodeBuffer);
  console.log(`🎵 Duration: ${audioDuration.toFixed(1)}s`);

  if (preview) {
    console.log(`\n📋 Script preview:\n${script.full_script}\n`);
    console.log(`⏭️  Preview mode — skipping render`);
    return;
  }

  // Check Remotion
  const remotionAvailable = await isRemotionAvailable();
  if (!remotionAvailable) {
    console.error('❌ Remotion not available locally');
    return;
  }

  // Upload audio for Remotion
  const audioBlob = await put(`temp/audio-${Date.now()}.mp3`, audioNodeBuffer, {
    access: 'public',
    addRandomSuffix: true,
  });
  console.log(`☁️  Audio uploaded for render`);

  // Build composition
  const slug = (script.facet_title as string)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  const baseUrl = 'https://lunary.app';

  const { images, overlays, highlightTerms, highlightColor, categoryVisuals } =
    buildThematicVideoComposition({
      script: script.full_script as string,
      facet: {
        dayIndex: 0,
        title: script.facet_title as string,
        grimoireSlug: slug,
        focus: script.facet_title as string,
        shortFormHook: script.facet_title as string,
        threads: {
          keyword: script.facet_title as string,
          angles: [],
        },
      },
      category,
      theme: undefined,
      baseUrl,
      slug,
    });

  // Whisper transcription
  let segments;
  try {
    console.log(`🎙️  Transcribing with Whisper...`);
    const whisperWords = await transcribeWithWhisper(audioBuffer);
    if (whisperWords.length > 0) {
      console.log(`✅ Whisper: ${whisperWords.length} word timestamps`);
      segments = wordTimestampsToSegments(
        whisperWords,
        audioDuration,
        6,
        script.full_script as string,
      );
    } else {
      segments = scriptToAudioSegments(
        script.full_script as string,
        audioDuration,
        2.6,
      );
    }
  } catch (e) {
    console.warn(`⚠️  Whisper failed, using fallback timing`);
    segments = scriptToAudioSegments(
      script.full_script as string,
      audioDuration,
      2.6,
    );
  }

  // Render
  const remotionFormat =
    audioDuration > 45 ? 'MediumFormVideo' : 'ShortFormVideo';
  const videoSeed = `${slug}-${script.id}-${Date.now()}`;
  const symbolContent = `${script.facet_title || ''} ${(script.full_script as string).substring(0, 200)}`;

  console.log(
    `🎬 Rendering ${remotionFormat} (${(audioDuration + 2).toFixed(0)}s)...`,
  );

  const videoBuffer = await renderRemotionVideo({
    format: remotionFormat,
    outputPath: '',
    segments,
    audioUrl: audioBlob.url,
    backgroundMusicUrl: 'https://lunary.app/audio/series/lunary-bed-v1.mp3',
    highlightTerms: highlightTerms || [],
    durationSeconds: audioDuration + 2,
    overlays: overlays || [],
    categoryVisuals,
    seed: videoSeed,
    zodiacSign: symbolContent,
  });

  if (!videoBuffer) {
    console.error('❌ Render produced no buffer');
    return;
  }

  const videoSizeMB = (videoBuffer.length / 1024 / 1024).toFixed(1);
  console.log(`📦 Video size: ${videoSizeMB}MB`);

  // Quality gate
  if (videoBuffer.length < 2 * 1024 * 1024) {
    console.error(
      `❌ Quality gate failed: ${videoSizeMB}MB is below 2MB minimum`,
    );
    return;
  }

  // Save locally for preview
  const outputDir = join(process.cwd(), 'output', 'videos');
  await mkdir(outputDir, { recursive: true });
  const localPath = join(outputDir, `${slug}-${script.id}.mp4`);
  await writeFile(localPath, videoBuffer);
  console.log(`💾 Saved locally: ${localPath}`);

  // Upload to Blob
  const dateKey = new Date(script.scheduled_date as string)
    .toISOString()
    .split('T')[0];
  const blobKey = `videos/shorts/daily/${dateKey}-${slug}-${Date.now()}.mp4`;
  const uploadResult = await put(blobKey, videoBuffer, {
    access: 'public',
    contentType: 'video/mp4',
  });
  console.log(`☁️  Uploaded: ${uploadResult.url}`);

  // Update job status
  await sql`
    UPDATE video_jobs
    SET status = 'complete', updated_at = NOW()
    WHERE id = ${jobId}
  `;

  // Update social_posts with video URL
  await sql`
    UPDATE social_posts
    SET video_url = ${uploadResult.url}, updated_at = NOW()
    WHERE topic = ${script.facet_title}
      AND scheduled_date::date = ${dateKey}
      AND post_type = 'video'
  `;

  console.log(`✅ Job ${jobId} complete!`);
}

async function main() {
  const args = process.argv.slice(2);
  const preview = args.includes('--preview');
  const jobIds = args
    .filter((a) => !a.startsWith('--'))
    .map(Number)
    .filter(Boolean);

  let jobs: Array<{ id: number; script_id: number; topic: string }>;

  if (jobIds.length > 0) {
    // Process specific jobs
    jobs = await sql`
      SELECT id, script_id, topic
      FROM video_jobs
      WHERE id = ANY(${jobIds})
      ORDER BY id ASC
    `;
  } else {
    // Process all pending
    jobs = await sql`
      SELECT id, script_id, topic
      FROM video_jobs
      WHERE status = 'pending'
      ORDER BY created_at ASC
    `;
  }

  if (jobs.length === 0) {
    console.log('No pending video jobs found.');
    return;
  }

  console.log(`Found ${jobs.length} job(s) to process:`);
  for (const job of jobs) {
    console.log(`  - Job ${job.id}: ${job.topic}`);
  }

  for (const job of jobs) {
    try {
      await processJob(job.id, job.script_id, preview);
    } catch (err) {
      console.error(
        `❌ Job ${job.id} failed:`,
        err instanceof Error ? err.message : err,
      );
      await sql`
        UPDATE video_jobs
        SET status = 'failed', last_error = ${err instanceof Error ? err.message : String(err)}, updated_at = NOW()
        WHERE id = ${job.id}
      `;
    }
  }

  console.log('\n✅ All done!');
}

main().catch(console.error);
