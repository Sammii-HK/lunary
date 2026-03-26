/**
 * Test render a single snippet video end-to-end.
 * Usage: pnpm tsx scripts/test-render-snippet.ts [scriptId]
 *
 * Generates TTS, gets Whisper timestamps, builds Remotion props,
 * and renders to public/app-demos/test-output/
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { TIKTOK_SCRIPTS } from '../src/lib/video/tiktok-scripts';
import { generateDemoVoiceover } from '../src/lib/video/demo-voiceover';
import { scriptToAppDemoProps } from '../src/lib/video/tiktok-to-remotion';
import {
  renderRemotionVideo,
  isRemotionAvailable,
} from '../src/lib/video/remotion-renderer';
import type { RemotionVideoProps } from '../src/lib/video/remotion-renderer';
import path from 'path';
import fs from 'fs';

const scriptId = process.argv[2] || 'snippet-angel-number';
const script = Object.values(TIKTOK_SCRIPTS).find((s) => s.id === scriptId);

if (!script) {
  console.error(`Script ${scriptId} not found`);
  process.exit(1);
}

async function main() {
  console.log(`\n=== Test Render: ${script!.id} ===\n`);

  // 1. Check Remotion
  const available = await isRemotionAvailable();
  if (!available) {
    console.error('Remotion not available');
    process.exit(1);
  }

  // 2. Generate voiceover
  console.log('Step 1: Generating voiceover...');
  const voiceover = await generateDemoVoiceover(script!);
  console.log(
    `  Audio: ${voiceover.audioDuration.toFixed(2)}s, ${voiceover.segments.length} segments`,
  );

  // 3. Build props
  console.log('Step 2: Building Remotion props...');
  // Try webm first, fall back to mp4
  let videoSrc = `app-demos/${scriptId}.webm`;
  let videoPath = path.join(process.cwd(), 'public', videoSrc);

  if (!fs.existsSync(videoPath)) {
    videoSrc = `app-demos/${scriptId}.mp4`;
    videoPath = path.join(process.cwd(), 'public', videoSrc);
  }

  if (!fs.existsSync(videoPath)) {
    console.error(`Recording not found for ${scriptId}`);
    console.error(
      `Record with: BASE_URL=https://lunary.app npx tsx scripts/record-demo.ts ${scriptId} --headed`,
    );
    process.exit(1);
  }

  const appDemoProps = scriptToAppDemoProps(
    script!,
    videoSrc,
    voiceover.audioUrl,
    voiceover.audioDuration,
  );

  const effectiveDuration = Math.max(
    script!.totalSeconds,
    Math.ceil(voiceover.audioDuration + 0.5),
  );

  const remotionProps: RemotionVideoProps = {
    format: 'AppDemoVideo',
    outputPath: '',
    durationSeconds: effectiveDuration,
    videoSrc: appDemoProps.videoSrc,
    hookTextForDemo: appDemoProps.hookText,
    hookStartTime: appDemoProps.hookStartTime,
    hookEndTime: appDemoProps.hookEndTime,
    overlays: appDemoProps.overlays,
    outroText: appDemoProps.outroText,
    outroStartTime: appDemoProps.outroStartTime,
    outroEndTime: appDemoProps.outroEndTime,
    audioUrl: voiceover.audioUrl,
    segments: voiceover.segments,
    categoryVisuals: appDemoProps.categoryVisuals,
    highlightTerms: appDemoProps.highlightTerms,
    audioStartOffset: appDemoProps.audioStartOffset,
    backgroundMusicUrl: appDemoProps.backgroundMusicUrl,
    backgroundMusicVolume: appDemoProps.backgroundMusicVolume,
    zoomPoints: appDemoProps.zoomPoints,
    tapPoints: appDemoProps.tapPoints,
    zodiacSign: appDemoProps.zodiacSign,
  };

  // 4. Render
  console.log(`Step 3: Rendering video (${effectiveDuration}s)...`);
  const startTime = Date.now();
  const videoBuffer = await renderRemotionVideo(remotionProps);
  const renderTime = ((Date.now() - startTime) / 1000).toFixed(1);

  // 5. Save output
  const outputDir = path.join(
    process.cwd(),
    'public',
    'app-demos',
    'test-output',
  );
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${scriptId}.mp4`);
  fs.writeFileSync(outputPath, videoBuffer);

  console.log(`\n=== Done ===`);
  console.log(`  Render time: ${renderTime}s`);
  console.log(`  Output: ${outputPath}`);
  console.log(
    `  Size: ${(videoBuffer.byteLength / 1024 / 1024).toFixed(1)} MB`,
  );
}

main().catch((err) => {
  console.error('Failed:', err.message || err);
  process.exit(1);
});
