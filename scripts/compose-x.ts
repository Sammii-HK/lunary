/**
 * X / Twitter Video Composer — Remotion Pipeline
 *
 * Renders X/Twitter landscape (16:9, 1280×720) videos from native x-landscape
 * recordings. TTS is off by default — X autoplay is muted, text overlays carry
 * the message. Override with --with-tts.
 *
 * Usage:
 *   pnpm compose:x                       # Compose all
 *   pnpm compose:x dashboard-overview    # Compose one
 *   pnpm compose:x --preview             # Quick low-quality preview
 *   pnpm compose:x --info                # Print X captions/hashtags
 *   pnpm compose:x --with-tts            # Enable TTS voiceover
 *   pnpm compose:x --force-tts           # Regenerate TTS even if cached
 *
 * Pipeline: record:x → compose-x.ts → ready-to-post .mp4
 * Requires: BASE_URL=https://lunary.app pnpm record:x
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
import { adaptForX } from '../src/lib/video/platform-adapters';

const INPUT_DIR = join(process.cwd(), 'public', 'app-demos', 'x');
const OUTPUT_DIR = join(process.cwd(), 'public', 'app-demos', 'x', 'final');
// TTS cache is shared across all platforms
const TTS_DIR = join(process.cwd(), 'public', 'app-demos', 'tts');

// ============================================================================
// Phase A: TTS Generation (shared cache, optional)
// ============================================================================

async function generateTTS(
  script: TikTokScript,
  options: { forceTts: boolean },
): Promise<{ audioPath: string; audioDuration: number } | null> {
  const audioPath = join(TTS_DIR, `${script.id}.mp3`);
  const hashPath = join(TTS_DIR, `${script.id}.hash`);
  const currentHash = voiceoverHash(script.voiceover);

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
  options: { preview: boolean; forceTts: boolean; withTts: boolean },
  skyData?: SkyData,
): Promise<string> {
  const script = getDynamicScript(featureId, skyData);
  if (!script) throw new Error(`No script found for: ${featureId}`);

  const ext = findRecordingExtension(featureId, INPUT_DIR);
  if (!ext) {
    throw new Error(
      `No x-landscape recording found. Run: BASE_URL=https://lunary.app pnpm record:x ${featureId}`,
    );
  }

  const videoSrc = `app-demos/x/${featureId}.${ext}`;
  console.log(`   Input: ${videoSrc}`);
  console.log(
    `   Script: ${script.totalSeconds}s, ${script.textOverlays.length} overlays`,
  );

  // TTS is off by default for X — autoplay is muted
  let audioUrl: string | undefined;
  let audioDuration: number | undefined;

  if (options.withTts) {
    const ttsResult = await generateTTS(script, { forceTts: options.forceTts });
    if (ttsResult) {
      audioUrl = `app-demos/tts/${featureId}.mp3`;
      audioDuration = ttsResult.audioDuration;
    }
  } else {
    console.log(
      `   TTS: disabled (X autoplay is muted; use --with-tts to enable)`,
    );
  }

  const props = scriptToAppDemoProps(script, videoSrc, audioUrl, audioDuration);

  const effectiveDuration = audioDuration
    ? Math.max(script.totalSeconds, Math.ceil(audioDuration))
    : script.totalSeconds;

  // Phase C: Remotion Render — AppDemoVideoX (1280×720, 16:9)
  // Background music is skipped by default (no audio on autoplay)
  console.log(`   Rendering with Remotion (1280×720)...`);
  const outputPath = join(OUTPUT_DIR, `${featureId}.mp4`);
  const crf = options.preview ? 28 : 18;

  const videoBuffer = await renderRemotionVideo({
    format: 'AppDemoVideoX',
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
    // No background music by default — X videos autoplay muted
    crf,
  });

  await writeFile(outputPath, videoBuffer);

  const sizeMB = (videoBuffer.length / 1024 / 1024).toFixed(1);
  console.log(`   Done: ${featureId}.mp4 (${sizeMB} MB)`);

  return outputPath;
}

// ============================================================================
// Print script info (X caption/hashtags)
// ============================================================================

function printScriptInfo(script: TikTokScript): void {
  const { caption, hashtags } = adaptForX(script);
  const hashtagStr = hashtags.map((h) => `#${h}`).join(' ');
  const fullPost = `${caption} ${hashtagStr}`;

  console.log(`   Hook: "${script.hook.text}"`);
  console.log(`   Caption (${caption.length} chars): "${caption}"`);
  console.log(`   Hashtags (${hashtags.length}): ${hashtagStr}`);
  console.log(
    `   Full post (~${fullPost.length} chars): "${fullPost.slice(0, 100)}${fullPost.length > 100 ? '...' : ''}"`,
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
  const withTts = args.includes('--with-tts');
  const featureArgs = args.filter((a) => !a.startsWith('--'));

  const featureIds =
    featureArgs.length > 0 ? featureArgs : TIKTOK_SCRIPTS.map((s) => s.id);

  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(TTS_DIR, { recursive: true });

  console.log('Building sky data...');
  const personaBirthday = process.env.PERSONA_BIRTHDAY;
  const skyData = await buildSkyData(new Date(), personaBirthday);
  console.log(
    `Sky: Moon in ${skyData.moonSign}, ${skyData.moonPhase.name}` +
      (skyData.retrogradePlanets.length > 0
        ? `, Rx: ${skyData.retrogradePlanets.join(', ')}`
        : ', no retrogrades'),
  );

  console.log('\nX / Twitter Video Composer (Remotion, 1280×720)');
  console.log('='.repeat(50));
  console.log(`Input: ${INPUT_DIR}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(
    `TTS: ${withTts ? (forceTts ? 'force regenerate' : 'cached') : 'disabled (X autoplay muted; use --with-tts)'}`,
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
      await composeVideo(featureId, { preview, forceTts, withTts }, skyData);
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
    console.log('   1. Preview: open public/app-demos/x/final/ in Finder');
    console.log('   2. See captions: pnpm compose:x --info');
    console.log('   3. Post to @LunaryApp on X with caption + 1-2 hashtags');
  }

  if (failed > 0) process.exit(1);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
