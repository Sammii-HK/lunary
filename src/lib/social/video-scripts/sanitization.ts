/**
 * Script sanitization utilities
 */

import { TRUNCATION_PATTERNS } from '../shared/text/truncation';
import { ensureSentenceEndsWithPunctuation } from '../shared/text/normalize';
import type { SanitizeScriptOptions } from './types';

/**
 * Sanitize video script lines
 */
export const sanitizeVideoScriptLines = (
  lines: string[],
  options: SanitizeScriptOptions & { allowTruncationFix?: boolean },
): string[] => {
  const buildFallbackLine = () => {
    const snippet = (options.sourceSnippet || '').trim();
    const fallback = (options.fallbackSource || '').trim();
    let candidate = snippet || fallback;
    if (!candidate) {
      candidate = `${options.topic} keeps attention on recurring timing`;
    }
    const lowerTopic = options.topic.toLowerCase();
    if (!candidate.toLowerCase().includes(lowerTopic)) {
      const normalized = candidate.replace(/^[A-Z]/, (c) => c.toLowerCase());
      candidate = `${options.topic} ${normalized}`;
    }
    return ensureSentenceEndsWithPunctuation(candidate.replace(/[.!?]+$/, ''));
  };

  const trimmedLines = lines.map((line) => line.trim()).filter(Boolean);
  const allowTruncationFix = options.allowTruncationFix !== false;
  return trimmedLines.map((line) => {
    const needsReplacement = TRUNCATION_PATTERNS.some((pattern) =>
      pattern.test(line.trim()),
    );
    if (!needsReplacement || !allowTruncationFix) {
      return ensureSentenceEndsWithPunctuation(line);
    }
    return buildFallbackLine();
  });
};

/**
 * Strip LLM-hallucinated timing markers from script text.
 * Removes patterns like [0:00], [0:30], [1:00], (0:00), 00:00 -
 * These appear when the model has seen timestamped scripts in training data.
 *
 * Also strips structured section headers from transit-alert and similar generators:
 * [HOOK] (0-3s), [MEANING] (3-20s), [WHAT TO EXPECT], [CTA], etc.
 */
export const stripTimingMarkers = (text: string): string => {
  return (
    text
      // Remove [0:00], [0:30], [1:15] etc.
      .replace(/\[\d{1,2}:\d{2}\]/g, '')
      // Remove (0:00), (1:30) etc.
      .replace(/\(\d{1,2}:\d{2}\)/g, '')
      // Remove bare timestamps at line start: "0:00 -", "0:30 -"
      .replace(/^\d{1,2}:\d{2}\s*[-–]\s*/gm, '')
      // Remove "Scene X:", "Shot X:", "Card X:" type stage directions
      .replace(/^(Scene|Shot|Card|Frame|Slide|Clip)\s+\d+\s*:/gim, '')
      // Remove structured section headers from transit-alert scripts:
      // [HOOK] (0-3s), [MEANING] (3-20s), [WHAT TO EXPECT] (20-27s), [CTA] (27-30s)
      // [FULL_SCRIPT], [BODY], [INTRO], [OUTRO], etc. with optional timing in parens
      .replace(/^\[[A-Z][A-Z\s]+\]\s*(?:\(\d+[^)]*\))?\s*$/gm, '')
      // Remove standalone timing ranges on their own line: "(0-3s)", "(3-20s)" etc.
      .replace(/^\(\d+-\d+s?\)\s*$/gm, '')
      // Clean up any double spaces left behind
      .replace(/  +/g, ' ')
      .trim()
  );
};

/**
 * Sanitize video script text
 */
export const sanitizeVideoScriptText = (
  text: string,
  options: SanitizeScriptOptions,
): string => {
  const cleaned = stripTimingMarkers(text);
  const lines = cleaned
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const sanitizedLines = sanitizeVideoScriptLines(lines, options);
  return sanitizedLines.join('\n');
};
