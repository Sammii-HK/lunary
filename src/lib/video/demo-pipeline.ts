/**
 * Demo Video Pipeline
 *
 * End-to-end orchestration for generating app demo videos:
 * Script lookup -> TTS voiceover -> Whisper timestamps -> Remotion render -> DB storage
 *
 * The key innovation: voiceover is generated FIRST, so all timing derives from
 * real audio rather than estimates. Subtitles are perfectly synced to speech.
 */

import path from 'path';
import fs from 'fs';
import { put } from '@vercel/blob';
import { sql } from '@vercel/postgres';
import { getScript, getDynamicScript } from './tiktok-scripts';
import type { TikTokScript } from './tiktok-scripts';
import { generateDemoVoiceover } from './demo-voiceover';
import { scriptToAppDemoProps } from './tiktok-to-remotion';
import { renderRemotionVideo, isRemotionAvailable } from './remotion-renderer';
import type { RemotionVideoProps } from './remotion-renderer';

export interface DemoVideoRecord {
  id: string;
  type: string;
  videoUrl: string;
  audioUrl: string | null;
  title: string | null;
  scriptId: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  audioDuration: number;
}

export interface GenerateDemoVideoOptions {
  /** Script ID to render (e.g. 'dashboard-overview', 'birth-chart') */
  scriptId: string;
  /** Path to the screen recording relative to public/ */
  videoSrc?: string;
  /** Override the Remotion format (default: 'AppDemoVideo') */
  format?: 'AppDemoVideo' | 'AppDemoVideoFeed' | 'AppDemoVideoX';
}

/**
 * Generate a complete app demo video from a script ID.
 *
 * Pipeline:
 * 1. Look up TikTokScript by ID
 * 2. Generate voiceover (TTS + Whisper timestamps + scene-aligned segments)
 * 3. Convert script to Remotion props
 * 4. Inject real audio URL and word timestamps into props
 * 5. Render with Remotion
 * 6. Upload video to Vercel Blob
 * 7. Store record in database
 */
export async function generateDemoVideo(
  options: GenerateDemoVideoOptions,
): Promise<DemoVideoRecord> {
  const { scriptId, format = 'AppDemoVideo' } = options;

  // 1. Look up the script
  const script: TikTokScript | undefined =
    getDynamicScript(scriptId) ?? getScript(scriptId);

  if (!script) {
    throw new Error(`Unknown script ID: "${scriptId}". Check TIKTOK_SCRIPTS.`);
  }

  console.log(
    `[demo-pipeline] Starting pipeline for "${script.title}" (${script.id})`,
  );

  // Default video source path
  const videoSrc = options.videoSrc ?? `app-demos/${scriptId}.webm`;

  // 2. Generate voiceover with real timestamps
  console.log('[demo-pipeline] Step 1/4: Generating voiceover...');
  const voiceover = await generateDemoVoiceover(script);

  // 3. Convert script to Remotion props (with estimated timing initially)
  console.log('[demo-pipeline] Step 2/4: Building Remotion props...');
  const appDemoProps = scriptToAppDemoProps(
    script,
    videoSrc,
    voiceover.audioUrl,
    voiceover.audioDuration,
  );

  // 4. Override segments with Whisper-aligned timing
  //    scriptToAppDemoProps uses estimated segments; we replace with real ones
  const propsWithRealTiming = {
    ...appDemoProps,
    segments: voiceover.segments,
    audioUrl: voiceover.audioUrl,
  };

  // Calculate effective duration: extend if audio is longer than script
  const effectiveDuration = Math.max(
    script.totalSeconds,
    Math.ceil(voiceover.audioDuration + 0.5),
  );

  // 4b. Verify recording file exists before rendering
  const videoPath = path.join(process.cwd(), 'public', videoSrc);
  if (!fs.existsSync(videoPath)) {
    throw new Error(
      `Recording not found: ${videoSrc}. Run: pnpm record:demo ${scriptId}`,
    );
  }

  // 5. Render with Remotion
  console.log(
    `[demo-pipeline] Step 3/4: Rendering video (${effectiveDuration}s, format: ${format})...`,
  );

  const remotionAvailable = await isRemotionAvailable();
  if (!remotionAvailable) {
    throw new Error(
      'Remotion is not available. Ensure @remotion/bundler and @remotion/renderer are installed.',
    );
  }

  const remotionProps: RemotionVideoProps = {
    format,
    outputPath: '',
    durationSeconds: effectiveDuration,
    // AppDemoVideo-specific props
    videoSrc: propsWithRealTiming.videoSrc,
    hookTextForDemo: propsWithRealTiming.hookText,
    hookStartTime: propsWithRealTiming.hookStartTime,
    hookEndTime: propsWithRealTiming.hookEndTime,
    overlays: propsWithRealTiming.overlays,
    outroText: propsWithRealTiming.outroText,
    outroStartTime: propsWithRealTiming.outroStartTime,
    outroEndTime: propsWithRealTiming.outroEndTime,
    audioUrl: propsWithRealTiming.audioUrl,
    segments: propsWithRealTiming.segments,
    categoryVisuals: propsWithRealTiming.categoryVisuals,
    highlightTerms: propsWithRealTiming.highlightTerms,
    audioStartOffset: propsWithRealTiming.audioStartOffset,
    backgroundMusicUrl: propsWithRealTiming.backgroundMusicUrl,
    backgroundMusicVolume: propsWithRealTiming.backgroundMusicVolume,
    zoomPoints: propsWithRealTiming.zoomPoints,
    tapPoints: propsWithRealTiming.tapPoints,
    zodiacSign: propsWithRealTiming.zodiacSign,
  };

  const videoBuffer = await renderRemotionVideo(remotionProps);

  // 6. Upload video to Vercel Blob
  console.log('[demo-pipeline] Step 4/4: Uploading video...');
  const timestamp = Date.now();
  const blobKey = `videos/demos/${scriptId}-${timestamp}.mp4`;

  const { url: videoUrl } = await put(blobKey, videoBuffer, {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'video/mp4',
  });

  // 7. Store in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // Demo videos last 30 days

  const result = await sql`
    INSERT INTO videos (
      type,
      video_url,
      audio_url,
      script,
      title,
      description,
      status,
      created_at,
      expires_at
    ) VALUES (
      'demo',
      ${videoUrl},
      ${voiceover.audioUrl},
      ${scriptId},
      ${script.title},
      ${`App demo: ${script.title} (${format})`},
      'ready',
      NOW(),
      ${expiresAt.toISOString()}
    )
    RETURNING id, video_url, audio_url, title, status, created_at, expires_at
  `;

  const row = result.rows[0];

  console.log(
    `[demo-pipeline] Complete! Video ID: ${row.id}, URL: ${row.video_url}`,
  );

  return {
    id: row.id,
    type: 'demo',
    videoUrl: row.video_url,
    audioUrl: row.audio_url,
    title: row.title,
    scriptId,
    status: row.status,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    audioDuration: voiceover.audioDuration,
  };
}
