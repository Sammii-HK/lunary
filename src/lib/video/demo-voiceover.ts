/**
 * Demo Voiceover Generator
 *
 * Generates TTS voiceover audio for TikTok app demo scripts,
 * transcribes with Whisper for word-level timestamps, and returns
 * scene-aligned subtitle segments ready for Remotion rendering.
 *
 * Key design: voiceover is generated FIRST, then timing derives from
 * real audio (not estimates). This ensures subtitles are perfectly synced.
 */

import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { put } from '@vercel/blob';
import { generateVoiceover, transcribeWithWhisper } from '@/lib/tts';
import type { WhisperWord } from '@/lib/tts';
import type { AudioSegment } from '@/remotion/utils/timing';
import type { TikTokScript } from './tiktok-scripts';
import {
  alignScriptToWhisperTiming,
  scriptToSceneAlignedSegments,
  scriptToAudioSegments,
} from './remotion-renderer';

export interface DemoVoiceoverResult {
  /** Public URL of the generated MP3 audio */
  audioUrl: string;
  /** Word-level timestamps from Whisper transcription */
  whisperWords: WhisperWord[];
  /** Scene-aligned subtitle segments for Remotion */
  segments: AudioSegment[];
  /** Total audio duration in seconds */
  audioDuration: number;
}

/**
 * Get audio duration using ffprobe.
 * Falls back to an estimate based on word count if ffprobe is unavailable.
 */
async function getAudioDuration(audioPath: string): Promise<number> {
  try {
    const ffmpeg = (await import('fluent-ffmpeg')).default;
    return await new Promise<number>((resolve, reject) => {
      ffmpeg.ffprobe(audioPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata.format.duration ?? 0);
        }
      });
    });
  } catch {
    return 0;
  }
}

/**
 * Estimate audio duration from word count when ffprobe is unavailable.
 * Uses 3.0 words per second (Orpheus/Jess typical rate).
 */
function estimateDurationFromText(text: string): number {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return wordCount / 3.0;
}

/**
 * Build scene-aligned segments using Whisper timestamps.
 *
 * Maps each scene's voiceoverLine to its portion of the Whisper-timed audio,
 * keeping the original script text (avoiding Whisper misspellings of mystical terms).
 */
function buildSceneAlignedWhisperSegments(
  script: TikTokScript,
  whisperWords: WhisperWord[],
  audioDuration: number,
): AudioSegment[] {
  const voiceoverLines = script.scenes
    .map((s) => s.voiceoverLine)
    .filter((line): line is string => !!line);

  // If no per-scene voiceover lines, fall back to full-text alignment
  if (voiceoverLines.length === 0) {
    return alignScriptToWhisperTiming(
      script.voiceover,
      whisperWords,
      audioDuration,
    );
  }

  // Calculate word boundaries for each scene line within the full voiceover
  const fullWords = script.voiceover
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter((w) => w.length > 0);

  const segments: AudioSegment[] = [];
  let wordOffset = 0;

  for (const line of voiceoverLines) {
    const lineWords = line
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter((w) => w.length > 0);

    if (lineWords.length === 0) continue;

    // Map word positions to Whisper timestamps using position ratio
    const startIdx = Math.min(
      Math.round((wordOffset / fullWords.length) * whisperWords.length),
      whisperWords.length - 1,
    );
    const endWordOffset = wordOffset + lineWords.length - 1;
    const endIdx = Math.min(
      Math.round((endWordOffset / fullWords.length) * whisperWords.length),
      whisperWords.length - 1,
    );

    const startTime = whisperWords[startIdx]?.start ?? 0;
    const endTime = Math.min(
      whisperWords[endIdx]?.end ?? audioDuration,
      audioDuration,
    );

    segments.push({
      text: line,
      startTime,
      endTime,
    });

    wordOffset += lineWords.length;
  }

  return segments;
}

/**
 * Generate a voiceover for a TikTok demo script.
 *
 * Steps:
 * 1. Extract voiceover text from script
 * 2. Generate TTS audio via Orpheus (voice: jess)
 * 3. Save to temp file and measure duration
 * 4. Transcribe with Whisper for word-level timestamps
 * 5. Build scene-aligned subtitle segments
 * 6. Upload audio to Vercel Blob
 * 7. Return audio URL, timestamps, segments, and duration
 */
export async function generateDemoVoiceover(
  script: TikTokScript,
): Promise<DemoVoiceoverResult> {
  const voiceoverText = script.voiceover;
  if (!voiceoverText?.trim()) {
    throw new Error(`Script "${script.id}" has no voiceover text`);
  }

  console.log(
    `[demo-voiceover] Generating TTS for "${script.id}" (${voiceoverText.split(/\s+/).length} words)`,
  );

  // 1. Generate TTS audio via Orpheus with voice "jess"
  const audioBuffer = await generateVoiceover(voiceoverText, {
    voiceName: 'jess',
    speed: 1.0,
  });

  if (!audioBuffer || audioBuffer.byteLength === 0) {
    throw new Error(`TTS generation returned empty audio for "${script.id}"`);
  }

  console.log(
    `[demo-voiceover] TTS generated: ${(audioBuffer.byteLength / 1024).toFixed(0)} KB`,
  );

  // 2. Write to temp file for duration measurement
  const safeId = script.id.replace(/[^a-zA-Z0-9_-]/g, '');
  const tempPath = join(tmpdir(), `demo-vo-${safeId}-${Date.now()}.mp3`);
  await writeFile(tempPath, Buffer.from(audioBuffer));

  // 3. Get actual audio duration
  let audioDuration = await getAudioDuration(tempPath);
  if (!audioDuration || audioDuration <= 0) {
    console.warn(
      '[demo-voiceover] ffprobe unavailable, estimating duration from word count',
    );
    audioDuration = estimateDurationFromText(voiceoverText);
  }

  console.log(`[demo-voiceover] Audio duration: ${audioDuration.toFixed(2)}s`);

  // 4. Transcribe with Whisper for word-level timestamps
  let whisperWords: WhisperWord[] = [];
  try {
    whisperWords = await transcribeWithWhisper(audioBuffer);
    console.log(
      `[demo-voiceover] Whisper returned ${whisperWords.length} word timestamps`,
    );

    // Use Whisper's last word end time as duration if ffprobe failed
    if (whisperWords.length > 0 && audioDuration <= 0) {
      audioDuration = whisperWords[whisperWords.length - 1].end + 0.5;
    }
  } catch (error) {
    console.warn(
      '[demo-voiceover] Whisper transcription failed, using estimated timing:',
      error,
    );
  }

  // 5. Build scene-aligned subtitle segments
  let segments: AudioSegment[];
  const hasVoiceoverLines = script.scenes.some((s) => s.voiceoverLine);

  if (whisperWords.length > 0 && hasVoiceoverLines) {
    // Best case: Whisper timestamps + per-scene voiceover lines
    segments = buildSceneAlignedWhisperSegments(
      script,
      whisperWords,
      audioDuration,
    );
  } else if (whisperWords.length > 0) {
    // Whisper timestamps but no per-scene lines: align full text
    segments = alignScriptToWhisperTiming(
      voiceoverText,
      whisperWords,
      audioDuration,
    );
  } else if (hasVoiceoverLines) {
    // No Whisper but have scene lines: use estimated scene alignment
    segments = scriptToSceneAlignedSegments(script, audioDuration);
  } else {
    // Fallback: simple estimated segments
    segments = scriptToAudioSegments(voiceoverText, audioDuration);
  }

  // 6. Upload audio to Vercel Blob
  const timestamp = Date.now();
  const blobKey = `videos/demos/audio/${script.id}-${timestamp}.mp3`;

  console.log(`[demo-voiceover] Uploading audio to Blob: ${blobKey}`);
  const { url: audioUrl } = await put(blobKey, Buffer.from(audioBuffer), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'audio/mpeg',
  });

  // 7. Clean up temp file
  await unlink(tempPath).catch(() => {});

  console.log(`[demo-voiceover] Complete. Audio: ${audioUrl}`);

  return {
    audioUrl,
    whisperWords,
    segments,
    audioDuration,
  };
}
