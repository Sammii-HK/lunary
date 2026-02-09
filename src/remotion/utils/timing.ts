/**
 * Audio sync and timing utilities for Remotion compositions
 */

export interface AudioSegment {
  text: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  topic?: string;
  item?: string;
}

/**
 * Convert seconds to frames
 */
export function secondsToFrames(seconds: number, fps: number = 30): number {
  return Math.round(seconds * fps);
}

/**
 * Convert frames to seconds
 */
export function framesToSeconds(frames: number, fps: number = 30): number {
  return frames / fps;
}

/**
 * Calculate total duration in frames from audio segments
 */
export function getTotalDurationFrames(
  segments: AudioSegment[],
  fps: number = 30,
): number {
  if (segments.length === 0) return 0;
  const lastSegment = segments[segments.length - 1];
  return secondsToFrames(lastSegment.endTime, fps);
}

/**
 * Get the current segment at a given frame
 */
export function getCurrentSegment(
  frame: number,
  segments: AudioSegment[],
  fps: number = 30,
): AudioSegment | null {
  const currentTime = framesToSeconds(frame, fps);

  for (const segment of segments) {
    if (currentTime >= segment.startTime && currentTime < segment.endTime) {
      return segment;
    }
  }

  return null;
}

/**
 * Get segment by index
 */
export function getSegmentByIndex(
  index: number,
  segments: AudioSegment[],
): AudioSegment | null {
  return segments[index] || null;
}

/**
 * Calculate segment frame ranges
 */
export function getSegmentFrameRanges(
  segments: AudioSegment[],
  fps: number = 30,
): Array<{ segment: AudioSegment; startFrame: number; endFrame: number }> {
  return segments.map((segment) => ({
    segment,
    startFrame: secondsToFrames(segment.startTime, fps),
    endFrame: secondsToFrames(segment.endTime, fps),
  }));
}

/**
 * Estimate words per second from text and duration
 */
export function calculateWordsPerSecond(
  text: string,
  durationSeconds: number,
): number {
  const wordCount = text.split(/\s+/).length;
  return wordCount / durationSeconds;
}

/**
 * Split text into word-by-word timing for subtitle animation
 */
export function splitTextWithTiming(
  text: string,
  startTime: number,
  endTime: number,
  fps: number = 30,
): Array<{ word: string; startFrame: number; endFrame: number }> {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) return [];

  const totalDuration = endTime - startTime;
  const durationPerWord = totalDuration / words.length;

  // Lead time: highlight appears slightly before word is spoken (100ms)
  const leadTime = 0.1;

  return words.map((word, index) => {
    const wordStart = startTime + index * durationPerWord - leadTime;
    const wordEnd = wordStart + durationPerWord + leadTime * 0.5; // Extended slightly

    return {
      word,
      startFrame: secondsToFrames(Math.max(startTime, wordStart), fps),
      endFrame: secondsToFrames(Math.min(endTime, wordEnd), fps),
    };
  });
}

/**
 * Format time for display (MM:SS)
 */
export function formatTimeDisplay(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(
  currentTime: number,
  totalDuration: number,
): number {
  if (totalDuration === 0) return 0;
  return Math.min(100, Math.max(0, (currentTime / totalDuration) * 100));
}
