/**
 * TikTok Video Composer — Remotion + TTS Pipeline
 *
 * Takes raw screen recordings, generates TTS voiceover, and renders
 * polished TikTok videos using Remotion with animated overlays.
 *
 * Usage:
 *   pnpm compose:tiktok                        # Compose all
 *   pnpm compose:tiktok dashboard-overview      # Compose one
 *   pnpm compose:tiktok --preview               # Quick low-quality preview
 *   pnpm compose:tiktok --info                  # Print captions/hashtags
 *   pnpm compose:tiktok --force-tts             # Regenerate TTS even if cached
 *   pnpm compose:tiktok --no-tts                # Skip TTS, render without voiceover
 *
 * Pipeline: record-app-features.ts → compose-tiktok.ts → ready-to-post .mp4
 */

import { config } from 'dotenv';
import { resolve, join } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { execSync } from 'child_process';
import { mkdir, access, writeFile } from 'fs/promises';
import { constants } from 'fs';
import {
  TIKTOK_SCRIPTS,
  getDynamicScript,
  type TikTokScript,
} from '../src/lib/video/tiktok-scripts';
import { buildSkyData, type SkyData } from '../src/lib/video/tiktok-sky-data';
import { scriptToAppDemoProps } from '../src/lib/video/tiktok-to-remotion';
import { renderRemotionVideo } from '../src/lib/video/remotion-renderer';
import { generateVoiceover } from '../src/lib/tts';
import { createHash } from 'crypto';

const INPUT_DIR = join(process.cwd(), 'public', 'app-demos');
const OUTPUT_DIR = join(process.cwd(), 'public', 'app-demos', 'final');
const TTS_DIR = join(process.cwd(), 'public', 'app-demos', 'tts');

// ============================================================================
// Helpers
// ============================================================================

function getAudioDuration(audioPath: string): number {
  const output = execSync(
    `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${audioPath}"`,
    { encoding: 'utf-8', timeout: 10000 },
  ).trim();
  return parseFloat(output);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function voiceoverHash(text: string): string {
  return createHash('md5').update(text).digest('hex').slice(0, 12);
}

async function readFileText(filePath: string): Promise<string | null> {
  try {
    const { readFile } = await import('fs/promises');
    return (await readFile(filePath, 'utf-8')).trim();
  } catch {
    return null;
  }
}

function findRecordingExtension(featureId: string): string | null {
  const webmPath = join(INPUT_DIR, `${featureId}.webm`);
  const mp4Path = join(INPUT_DIR, `${featureId}.mp4`);

  try {
    execSync(`test -f "${webmPath}"`, { stdio: 'pipe' });
    return 'webm';
  } catch {
    try {
      execSync(`test -f "${mp4Path}"`, { stdio: 'pipe' });
      return 'mp4';
    } catch {
      return null;
    }
  }
}

// ============================================================================
// Phase A: TTS Generation
// ============================================================================

async function generateTTS(
  script: TikTokScript,
  options: { forceTts: boolean },
): Promise<{ audioPath: string; audioDuration: number } | null> {
  const audioPath = join(TTS_DIR, `${script.id}.mp3`);
  const hashPath = join(TTS_DIR, `${script.id}.hash`);
  const currentHash = voiceoverHash(script.voiceover);

  // Check cache — invalidate if voiceover text changed (dynamic scripts)
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
  if (!script) throw new Error(`No TikTok script found for: ${featureId}`);

  // Find input recording
  const ext = findRecordingExtension(featureId);
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

  // Phase A: TTS Generation
  let audioUrl: string | undefined;
  let audioDuration: number | undefined;

  if (!options.noTts) {
    const ttsResult = await generateTTS(script, {
      forceTts: options.forceTts,
    });
    if (ttsResult) {
      audioUrl = `app-demos/tts/${featureId}.mp3`;
      audioDuration = ttsResult.audioDuration;
    }
  } else {
    console.log(`   TTS: skipped (--no-tts)`);
  }

  // Phase B: Build Props
  const props = scriptToAppDemoProps(script, videoSrc, audioUrl, audioDuration);

  // Effective duration — extend if TTS is longer than script to avoid audio cutoff
  const effectiveDuration = audioDuration
    ? Math.max(script.totalSeconds, Math.ceil(audioDuration))
    : script.totalSeconds;

  if (effectiveDuration > script.totalSeconds) {
    console.log(
      `   Duration: extended ${script.totalSeconds}s → ${effectiveDuration}s (TTS: ${audioDuration?.toFixed(1)}s)`,
    );
  }

  // Phase C: Remotion Render
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
    crf,
  });

  // Renderer returns buffer and cleans up temp — write to final output
  await writeFile(outputPath, videoBuffer);

  const sizeMB = (videoBuffer.length / 1024 / 1024).toFixed(1);
  console.log(`   Done: ${featureId}.mp4 (${sizeMB} MB)`);

  return outputPath;
}

// ============================================================================
// Print script info (captions, hashtags for posting)
// ============================================================================

function printScriptInfo(script: TikTokScript): void {
  const hookWords = script.hook.text.split(/\s+/).length;
  const voWords = script.voiceover.split(/\s+/).length;
  const wps = (voWords / script.totalSeconds).toFixed(1);

  console.log(`   Hook (${hookWords}w): "${script.hook.text}"`);
  console.log(`   CTA: "${script.outro.text}"`);
  console.log(`   Caption:\n     ${script.caption}`);
  console.log(
    `   Hashtags (${script.hashtags.length}): ${script.hashtags.map((h) => `#${h}`).join(' ')}`,
  );
  console.log(
    `   Voiceover: ${voWords} words / ${script.totalSeconds}s = ${wps} wps`,
  );

  // Overlay word count check
  const longOverlays = script.textOverlays.filter(
    (o) => o.text.split(/\s+/).length > 6,
  );
  if (longOverlays.length > 0) {
    console.log(`   WARNING: ${longOverlays.length} overlay(s) exceed 6 words`);
    for (const o of longOverlays) {
      console.log(`     - "${o.text}" (${o.text.split(/\s+/).length}w)`);
    }
  }
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
        : ', no retrogrades') +
      (skyData.numerology
        ? `, PD:${skyData.numerology.personalDay} UD:${skyData.numerology.universalDay}`
        : ''),
  );

  console.log('\nTikTok Video Composer (Remotion + TTS)');
  console.log('='.repeat(50));
  console.log(`Input: ${INPUT_DIR}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(
    `TTS: ${noTts ? 'disabled' : forceTts ? 'force regenerate' : 'cached'}`,
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
    console.log('   1. Preview: open public/app-demos/final/ in Finder');
    console.log('   2. See captions: pnpm compose:tiktok --info');
    console.log('   3. Post to TikTok with script caption + hashtags');
  }

  if (failed > 0) process.exit(1);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
