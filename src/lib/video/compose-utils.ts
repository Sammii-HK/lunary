/**
 * Shared utilities for video compose scripts.
 *
 * Extracted from compose-tiktok.ts so that compose-instagram.ts,
 * compose-instagram-feed.ts, and compose-x.ts can import them without
 * duplicating code.
 */

import { execFileSync } from 'child_process';
import { access } from 'fs/promises';
import { constants, existsSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

/**
 * Get the duration of an audio file in seconds using ffprobe.
 */
export function getAudioDuration(audioPath: string): number {
  const output = execFileSync(
    'ffprobe',
    [
      '-v',
      'quiet',
      '-show_entries',
      'format=duration',
      '-of',
      'csv=p=0',
      audioPath,
    ],
    { encoding: 'utf-8', timeout: 10000 },
  ).trim();
  return parseFloat(output);
}

/**
 * Check whether a file exists at the given path.
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Return a short content hash for a voiceover string.
 * Used to detect when the voiceover text changes so cached TTS is invalidated.
 */
export function voiceoverHash(text: string): string {
  return createHash('md5').update(text).digest('hex').slice(0, 12);
}

/**
 * Read a UTF-8 text file and return its trimmed contents, or null on error.
 */
export async function readFileText(filePath: string): Promise<string | null> {
  try {
    const { readFile } = await import('fs/promises');
    return (await readFile(filePath, 'utf-8')).trim();
  } catch {
    return null;
  }
}

/**
 * Find the file extension (.webm or .mp4) for a given feature recording.
 *
 * @param featureId  The feature ID (filename without extension)
 * @param inputDir   Directory to search in
 * @returns 'webm' | 'mp4' | null
 */
export function findRecordingExtension(
  featureId: string,
  inputDir: string,
): string | null {
  if (existsSync(join(inputDir, `${featureId}.webm`))) return 'webm';
  if (existsSync(join(inputDir, `${featureId}.mp4`))) return 'mp4';
  return null;
}
