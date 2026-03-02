type NormalizeOptions = {
  topicLabel?: string;
};

const sentenceSplit = (text: string) =>
  text
    .replace(/(\d)\.(\d)/g, '$1<DECIMAL>$2')
    .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
    ?.map((sentence) => sentence.replace(/<DECIMAL>/g, '.').trim())
    .filter(Boolean) || [];

const normalizeToken = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const dedupeAdjacentSentences = (line: string) => {
  const sentences = sentenceSplit(line);
  const result: string[] = [];
  let prev = '';
  for (const sentence of sentences) {
    const normalized = normalizeToken(sentence);
    if (normalized && normalized === prev) {
      continue;
    }
    result.push(sentence);
    prev = normalized;
  }
  return result.join(' ');
};

const dedupeAdjacentLines = (lines: string[]) => {
  const result: string[] = [];
  let prev = '';
  for (const line of lines) {
    const normalized = normalizeToken(line);
    if (normalized && normalized === prev) {
      continue;
    }
    result.push(line);
    prev = normalized;
  }
  return result;
};

/**
 * Capitalise the first character of a line (sentence case).
 * Leaves the rest of the line untouched — proper nouns in the source text
 * should already be capitalised by the LLM.
 */
const sentenceCaseLine = (line: string) =>
  line ? line.charAt(0).toUpperCase() + line.slice(1) : line;

const fixDuplicateWords = (text: string) => {
  let output = text;
  const pattern = /\b([a-zA-Z]+)\s+\1\b/g;
  // Loop until stable to collapse sequences like "Moon Moon Moon".
  while (pattern.test(output)) {
    output = output.replace(pattern, '$1');
  }
  return output;
};

export const normalizeGeneratedContent = (
  text: string,
  options: NormalizeOptions = {},
): string => {
  if (!text) return text;
  // Strip control characters that are illegal in JSON strings (0x00-0x08, 0x0B, 0x0C, 0x0E-0x1F).
  // Keep \t (0x09), \n (0x0A), and \r (0x0D) which are safe and meaningful.
  // eslint-disable-next-line no-control-regex
  let output = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

  if (options.topicLabel) {
    const safeTopic = options.topicLabel.trim();
    if (safeTopic) {
      output = output.replace(/\bExplore Lunar\b/gi, `Explore ${safeTopic}`);
    }
  }

  output = fixDuplicateWords(output);

  const lines = output
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim());
  const cleanedLines = lines.map((line) => dedupeAdjacentSentences(line));
  const deduped = dedupeAdjacentLines(cleanedLines).map(sentenceCaseLine);

  return deduped.join('\n').trim();
};
