/**
 * Truncation detection and handling utilities
 */

export const TRUNCATION_PATTERNS = [
  /\bthe\.$/i,
  /\beach\.$/i,
  /\bbegin at\.$/i,
  /\bcrosses the\.$/i,
  /\band the\.$/i,
  /,\s*each\.$/i,
  /:\s*$/i,
  /\bat\.$/i,
  /\bevery 2\.$/i,
];

export const LINE_DANGLING_PATTERNS = [
  /,\s*each\.$/i,
  /crosses the\.$/i,
  /begin at\.$/i,
  /\b(the|a|an|at|to|with|of|in|for|on|by|from)\.$/i,
  /,\s*(and|but|or|each|which|that)\.$/i,
  /\b(which|that|because|while|since)\.$/i,
];

/**
 * Check if text has truncation artifact
 */
export const hasTruncation = (text: string): boolean =>
  TRUNCATION_PATTERNS.some((pattern) => pattern.test(text.trim()));

/**
 * Check if text has truncation artifact (alias)
 */
export const hasTruncationArtifact = (text: string): boolean =>
  hasTruncation(text);

/**
 * Check if line needs rewrite due to dangling patterns
 */
export const needsLineRewrite = (line: string): boolean => {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (hasTruncation(trimmed)) return true;
  return LINE_DANGLING_PATTERNS.some((pattern) => pattern.test(trimmed));
};

/**
 * Trim text to max characters, preserving sentence boundaries
 */
export const trimToMaxChars = (text: string, maxChars: number): string => {
  if (text.length <= maxChars) return text.trim();
  const snippet = text.slice(0, Math.max(0, maxChars - 1)).trim();
  const lastStop = Math.max(
    snippet.lastIndexOf('.'),
    snippet.lastIndexOf('!'),
    snippet.lastIndexOf('?'),
  );
  if (lastStop > 40) {
    return snippet.slice(0, lastStop + 1).trim();
  }
  const lastSpace = snippet.lastIndexOf(' ');
  return `${snippet.slice(0, lastSpace > 0 ? lastSpace : snippet.length).trim()}.`;
};

/**
 * Get first sentence from text
 */
export const getFirstSentence = (text: string): string | null => {
  const cleaned = text.trim();
  if (!cleaned) return null;
  const match = cleaned.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : null;
};

/**
 * Split sentences while preserving decimal numbers
 */
export const splitSentencesPreservingDecimals = (text: string): string[] => {
  const protectedText = text.replace(/(\d)\.(\d)/g, '$1<DECIMAL>$2');
  const sentences =
    protectedText.match(/[^.!?]+[.!?]/g)?.map((s) => s.trim()) || [];
  const restored = sentences.map((sentence) =>
    sentence.replace(/<DECIMAL>/g, '.'),
  );
  if (restored.length > 0) {
    return restored;
  }
  const fallback = protectedText.replace(/<DECIMAL>/g, '.').trim();
  return fallback ? [fallback] : [];
};
