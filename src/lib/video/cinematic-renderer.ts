/**
 * Cinematic Renderer
 *
 * Renders the new marketing video compositions (LandscapeShowcase,
 * MultiPhoneShowcase, CinematicPhoneDemo) and exports static PNG marketing
 * shots via renderStill().
 *
 * Kept separate from remotion-renderer.ts to avoid breaking the existing
 * TikTok pipeline.
 */

import path from 'path';
import { readFile, unlink, mkdtemp } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import type { LandscapeShowcaseProps } from '@/remotion/compositions/LandscapeShowcase';
import type { MultiPhoneShowcaseProps } from '@/remotion/compositions/MultiPhoneShowcase';
import type { CinematicPhoneDemoProps } from '@/remotion/compositions/CinematicPhoneDemo';

export type CinematicFormat =
  | 'LandscapeShowcase'
  | 'LandscapeShowcaseSquare'
  | 'MultiPhoneShowcase'
  | 'MultiPhoneShowcaseSquare'
  | 'CinematicPhoneDemo';

type CinematicProps =
  | LandscapeShowcaseProps
  | MultiPhoneShowcaseProps
  | CinematicPhoneDemoProps;

/**
 * Bundle the Remotion project (shared between renderCinematicVideo and renderCinematicStill).
 * Cached in module scope between calls in the same process.
 */
let bundleCache: string | null = null;

async function getBundle(): Promise<string> {
  if (bundleCache) return bundleCache;

  const { bundle } = await import('@remotion/bundler');
  const projectRoot = process.cwd();

  bundleCache = await bundle({
    entryPoint: path.join(projectRoot, 'src/remotion/index.ts'),
    webpackOverride: (config) => ({
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...(config.resolve?.alias || {}),
          '@': path.join(projectRoot, 'src'),
          '@lib': path.join(projectRoot, 'src/lib'),
        },
      },
    }),
  });

  return bundleCache;
}

/**
 * Render a cinematic marketing video.
 * Returns the rendered video as a Buffer.
 */
export async function renderCinematicVideo({
  format,
  inputProps,
  durationSeconds,
  outputPath,
  crf = 18,
}: {
  format: CinematicFormat;
  inputProps: CinematicProps;
  durationSeconds: number;
  outputPath: string;
  crf?: number;
}): Promise<Buffer> {
  const { renderMedia, selectComposition } = await import('@remotion/renderer');
  const fps = 30;
  const durationInFrames = Math.ceil(durationSeconds * fps);

  const bundleLocation = await getBundle();

  console.log(
    `Remotion: Rendering ${format} (${durationSeconds}s, ${durationInFrames} frames, CRF ${crf})`,
  );

  const workDir = await mkdtemp(join(tmpdir(), 'remotion-cinematic-'));
  const renderPath = outputPath || join(workDir, 'output.mp4');

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: format,
    inputProps,
  });

  await renderMedia({
    composition: { ...composition, durationInFrames },
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: renderPath,
    inputProps,
    crf,
    pixelFormat: 'yuv420p',
    onProgress: ({ progress }) => {
      const pct = Math.round(progress * 100);
      if (pct % 10 === 0) {
        process.stdout.write(`\r   Rendering: ${pct}%`);
      }
    },
  });

  process.stdout.write('\n');
  console.log(`   Rendered to: ${renderPath}`);

  const videoBuffer = await readFile(renderPath);
  if (!outputPath) {
    await unlink(renderPath).catch(() => {});
  }

  return videoBuffer;
}

/**
 * Export a static PNG marketing shot from a Remotion composition.
 * Uses renderStill() at frame 0 — ideal for multi-phone hero images.
 */
export async function renderCinematicStill({
  format,
  inputProps,
  outputPath,
  frame = 0,
}: {
  format: CinematicFormat;
  inputProps: CinematicProps;
  outputPath: string;
  frame?: number;
}): Promise<void> {
  const { renderStill, selectComposition } = await import('@remotion/renderer');

  const bundleLocation = await getBundle();

  console.log(`Remotion: Exporting still from ${format} (frame ${frame})`);

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: format,
    inputProps,
  });

  await renderStill({
    composition,
    serveUrl: bundleLocation,
    output: outputPath,
    frame,
    inputProps,
    imageFormat: 'png',
    quality: 100,
  });

  console.log(`   Still exported: ${outputPath}`);
}
