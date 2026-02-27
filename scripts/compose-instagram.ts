/**
 * Instagram Reels Composer — Remotion + TTS Pipeline
 *
 * Reuses existing TikTok screen recordings (same 9:16 format) and renders
 * Instagram Reels with expanded captions and 25 hashtags.
 *
 * Usage:
 *   pnpm compose:instagram                        # Compose all
 *   pnpm compose:instagram dashboard-overview      # Compose one
 *   pnpm compose:instagram --preview               # Quick low-quality preview
 *   pnpm compose:instagram --info                  # Print Instagram captions/hashtags
 *   pnpm compose:instagram --force-tts             # Regenerate TTS even if cached
 *   pnpm compose:instagram --no-tts                # Skip TTS
 *
 * Pipeline: record-app-features.ts (tiktok device) → compose-instagram.ts → ready-to-post .mp4
 * Note: No re-recording needed — reuses TikTok recordings (same 9:16 file).
 */

import { config } from 'dotenv';
import { resolve, join } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { mkdir, writeFile } from 'fs/promises';
import {
  TIKTOK_SCRIPTS,
  getDynamicScript,
  type TikTokScript,
} from '../src/lib/video/tiktok-scripts';
import { buildSkyData, type SkyData } from '../src/lib/video/tiktok-sky-data';
import { scriptToAppDemoProps } from '../src/lib/video/tiktok-to-remotion';
import { renderRemotionVideo } from '../src/lib/video/remotion-renderer';
import { generateVoiceover } from '../src/lib/tts';
import {
  getAudioDuration,
  fileExists,
  voiceoverHash,
  readFileText,
  findRecordingExtension,
} from '../src/lib/video/compose-utils';
import { adaptForInstagram } from '../src/lib/video/platform-adapters';

// Instagram Reels reuses TikTok recordings — same 9:16 source files
const INPUT_DIR = join(process.cwd(), 'public', 'app-demos');
const OUTPUT_DIR = join(process.cwd(), 'public', 'app-demos', 'instagram');
// TTS cache is shared with TikTok — if TikTok already generated audio, it's free here
const TTS_DIR = join(process.cwd(), 'public', 'app-demos', 'tts');

// ============================================================================
// Phase A: TTS Generation (shared cache with TikTok)
// ============================================================================

async function generateTTS(
  script: TikTokScript,
  options: { forceTts: boolean },
): Promise<{ audioPath: string; audioDuration: number } | null> {
  const audioPath = join(TTS_DIR, `${script.id}.mp3`);
  const hashPath = join(TTS_DIR, `${script.id}.hash`);
  const currentHash = voiceoverHash(script.voiceover);

  // Check cache — invalidate if voiceover text changed
  if (!options.forceTts && (await fileExists(audioPath))) {
    const cachedHash = await readFileText(hashPath);
    if (cachedHash === currentHash) {
      const duration = getAudioDuration(audioPath);
      console.log(`   TTS: cached (${duration.toFixed(1)}s)`);
      return { audioPath, audioDuration: duration };
    }
    console.log(`   TTS: voiceover changed, regenerating...`);
  }

  console.log(`   TTS: generating voiceover...`);

  try {
    const audioBuffer = await generateVoiceover(script.voiceover, {
      model: 'tts-1-hd',
      voiceName: 'shimmer',
      speed: 1.05,
    });

    await writeFile(audioPath, Buffer.from(audioBuffer));
    await writeFile(hashPath, currentHash);

    const duration = getAudioDuration(audioPath);
    console.log(`   TTS: generated (${duration.toFixed(1)}s)`);
    return { audioPath, audioDuration: duration };
  } catch (error) {
    console.error(
      `   TTS: failed -`,
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

// ============================================================================
// Compose a single video
// ============================================================================

async function composeVideo(
  featureId: string,
  options: { preview: boolean; forceTts: boolean; noTts: boolean },
  skyData?: SkyData,
): Promise<string> {
  const script = getDynamicScript(featureId, skyData);
  if (!script) throw new Error(`No script found for: ${featureId}`);

  // Find input recording (same as TikTok — 9:16)
  const ext = findRecordingExtension(featureId, INPUT_DIR);
  if (!ext) {
    throw new Error(
      `No recording found. Run: pnpm record:app-features ${featureId}`,
    );
  }

  const videoSrc = `app-demos/${featureId}.${ext}`;
  console.log(`   Input: ${videoSrc}`);
  console.log(
    `   Script: ${script.totalSeconds}s, ${script.textOverlays.length} overlays`,
  );

  // Phase A: TTS Generation (Reels with voiceover perform well)
  let audioUrl: string | undefined;
  let audioDuration: number | undefined;

  if (!options.noTts) {
    const ttsResult = await generateTTS(script, { forceTts: options.forceTts });
    if (ttsResult) {
      audioUrl = `app-demos/tts/${featureId}.mp3`;
      audioDuration = ttsResult.audioDuration;
    }
  } else {
    console.log(`   TTS: skipped (--no-tts)`);
  }

  // Phase B: Build Props
  const props = scriptToAppDemoProps(script, videoSrc, audioUrl, audioDuration);

  const effectiveDuration = audioDuration
    ? Math.max(script.totalSeconds, Math.ceil(audioDuration))
    : script.totalSeconds;

  if (effectiveDuration > script.totalSeconds) {
    console.log(
      `   Duration: extended ${script.totalSeconds}s → ${effectiveDuration}s (TTS: ${audioDuration?.toFixed(1)}s)`,
    );
  }

  // Phase C: Remotion Render — same 9:16 AppDemoVideo composition as TikTok
  console.log(`   Rendering with Remotion...`);
  const outputPath = join(OUTPUT_DIR, `${featureId}.mp4`);
  const crf = options.preview ? 28 : 18;

  const videoBuffer = await renderRemotionVideo({
    format: 'AppDemoVideo',
    outputPath,
    durationSeconds: effectiveDuration,
    videoSrc: props.videoSrc,
    hookTextForDemo: props.hookText,
    hookStartTime: props.hookStartTime,
    hookEndTime: props.hookEndTime,
    overlays: props.overlays,
    outroText: props.outroText,
    outroStartTime: props.outroStartTime,
    outroEndTime: props.outroEndTime,
    audioUrl: props.audioUrl,
    segments: props.segments,
    categoryVisuals: props.categoryVisuals,
    highlightTerms: props.highlightTerms,
    audioStartOffset: props.audioStartOffset,
    backgroundMusicUrl: props.backgroundMusicUrl,
    backgroundMusicVolume: props.backgroundMusicVolume,
    crf,
  });

  await writeFile(outputPath, videoBuffer);

  const sizeMB = (videoBuffer.length / 1024 / 1024).toFixed(1);
  console.log(`   Done: ${featureId}.mp4 (${sizeMB} MB)`);

  return outputPath;
}

// ============================================================================
// Print script info (Instagram captions/hashtags)
// ============================================================================

function printScriptInfo(script: TikTokScript): void {
  const { caption, hashtags } = adaptForInstagram(script);

  console.log(`   Hook: "${script.hook.text}"`);
  console.log(`   Caption:\n${caption.replace(/^/gm, '     ')}`);
  console.log(
    `   Hashtags (${hashtags.length}): ${hashtags.map((h) => `#${h}`).join(' ')}`,
  );
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const preview = args.includes('--preview');
  const showInfo = args.includes('--info');
  const forceTts = args.includes('--force-tts');
  const noTts = args.includes('--no-tts');
  const featureArgs = args.filter((a) => !a.startsWith('--'));

  const featureIds =
    featureArgs.length > 0 ? featureArgs : TIKTOK_SCRIPTS.map((s) => s.id);

  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(TTS_DIR, { recursive: true });

  // Build sky data for dynamic scripts
  console.log('Building sky data...');
  const personaBirthday = process.env.PERSONA_BIRTHDAY;
  const skyData = await buildSkyData(new Date(), personaBirthday);
  console.log(
    `Sky: Moon in ${skyData.moonSign}, ${skyData.moonPhase.name}` +
      (skyData.retrogradePlanets.length > 0
        ? `, Rx: ${skyData.retrogradePlanets.join(', ')}`
        : ', no retrogrades'),
  );

  console.log('\nInstagram Reels Composer (Remotion + TTS)');
  console.log('='.repeat(50));
  console.log(`Input: ${INPUT_DIR} (reusing TikTok recordings)`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(
    `TTS: ${noTts ? 'disabled' : forceTts ? 'force regenerate' : 'cached (shared with TikTok)'}`,
  );
  console.log(
    `Quality: ${preview ? 'preview (crf 28)' : 'production (crf 18)'}`,
  );
  console.log(`\nProcessing ${featureIds.length} video(s)...\n`);

  let success = 0;
  let failed = 0;

  for (const featureId of featureIds) {
    const script = getDynamicScript(featureId, skyData);
    if (!script) {
      console.log(`\nNo script for: ${featureId}`);
      failed++;
      continue;
    }

    console.log(`\n[${script.id}] ${script.title}`);

    if (showInfo) {
      printScriptInfo(script);
      continue;
    }

    try {
      await composeVideo(featureId, { preview, forceTts, noTts }, skyData);
      success++;
    } catch (error) {
      console.error(
        `   Failed:`,
        error instanceof Error ? error.message : error,
      );
      failed++;
    }
  }

  if (showInfo) {
    console.log('\n(--info mode: no videos composed)');
    return;
  }

  console.log('\n' + '='.repeat(50));
  console.log('Compose Summary:');
  console.log(`   Success: ${success}`);
  console.log(`   Failed: ${failed}`);

  if (success > 0) {
    console.log(`\nComposed videos in: ${OUTPUT_DIR}`);
    console.log('\nNext steps:');
    console.log('   1. Preview: open public/app-demos/instagram/ in Finder');
    console.log('   2. See captions: pnpm compose:instagram --info');
    console.log(
      '   3. Post to Instagram Reels with full caption + 25 hashtags',
    );
  }

  if (failed > 0) process.exit(1);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
