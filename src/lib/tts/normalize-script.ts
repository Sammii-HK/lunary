const numberWords: Record<number, string> = {
  0: 'zero',
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
  10: 'ten',
  11: 'eleven',
  12: 'twelve',
  13: 'thirteen',
  14: 'fourteen',
  15: 'fifteen',
  16: 'sixteen',
  17: 'seventeen',
  18: 'eighteen',
  19: 'nineteen',
  20: 'twenty',
  30: 'thirty',
  40: 'forty',
  50: 'fifty',
  60: 'sixty',
  70: 'seventy',
  80: 'eighty',
  90: 'ninety',
};

const toWordsUnder100 = (num: number) => {
  if (num < 20) return numberWords[num] || String(num);
  const tens = Math.floor(num / 10) * 10;
  const ones = num % 10;
  if (ones === 0) return numberWords[tens] || String(num);
  return `${numberWords[tens] || tens} ${numberWords[ones] || ones}`;
};

const normalizeYear = (num: number) => {
  if (num >= 2000 && num <= 2099) {
    const tail = num % 100;
    return `twenty ${toWordsUnder100(tail)}`;
  }
  return String(num);
};

const splitLongSentence = (sentence: string) => {
  const words = sentence.trim().split(/\s+/);
  if (words.length <= 26) return [sentence.trim()];
  const midpoint = Math.min(words.length - 1, 13);
  const first = words.slice(0, midpoint).join(' ');
  const second = words.slice(midpoint).join(' ');
  return [`${first}.`, second];
};

export function normalizeScriptForTTS(text: string): string {
  let output = text;

  // Convert paragraph breaks to ellipsis pause markers before other processing
  output = output.replace(/\n{2,}/g, ' ... ');

  output = output.replace(/[!?]{2,}/g, '.');
  // Preserve ellipses as pause markers (don't collapse to single period)
  // Use split/join instead of /\s*\/\s*/g to avoid ReDoS on repeated whitespace
  output = output
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean)
    .join(' and ');
  output = output.replace(/\s{2,}/g, ' ');

  output = output.replace(/(\d+)\s{0,3}-\s{0,3}(\d+)/g, (_match, a, b) => {
    const left = toWordsUnder100(Number(a));
    const right = toWordsUnder100(Number(b));
    return `${left} to ${right}`;
  });

  output = output.replace(/\b(20\d{2})\b/g, (_match, year) =>
    normalizeYear(Number(year)),
  );

  output = output.replace(/\b(\d{1,2})\b/g, (_match, num) =>
    toWordsUnder100(Number(num)),
  );

  const sentences =
    output.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()) || [];
  const normalizedSentences = sentences.flatMap(splitLongSentence);
  return normalizedSentences
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Preprocess text to help TTS with pronunciation.
 * Converts paragraph breaks to ellipsis pause markers and fixes stuttering.
 * Shared between OpenAI and Kokoro providers.
 */
/**
 * Ensure every non-empty line ends with sentence punctuation.
 * Prevents TTS from running lines together without pauses.
 * Should be called before preprocessTextForTTS.
 */
export function ensureLinePunctuation(text: string): string {
  return text
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;
      // Already ends with punctuation
      if (/[.!?,;:\-—]$/.test(trimmed)) return line;
      // Add a period to force a TTS pause
      return `${trimmed}.`;
    })
    .join('\n');
}

export function preprocessTextForTTS(text: string): string {
  const longPause = '__LONG_PAUSE__';
  const shortPause = '__SHORT_PAUSE__';

  let processed = text;

  // Double newlines = long pause (paragraph break)
  processed = processed.replace(/\n{2,}/g, ` ${longPause} `);

  // Single newline followed by capital letter = short pause (new thought/option)
  // e.g. "Option A: ...\nOption B: ..."
  processed = processed.replace(/\n(?=[A-Z])/g, ` ${shortPause} `);

  // Single newline followed by bullet/dash/number = short pause (list item)
  processed = processed.replace(/\n(?=[-•*\d])/g, ` ${shortPause} `);

  // Remaining single newlines = minimal break
  processed = processed.replace(/\n/g, ' ');

  // Remove duplicate consecutive words (TTS stuttering fix)
  processed = processed.replace(/\b(\w+)[-\s]+\1\b/gi, '$1');

  // Clean up any double spaces
  processed = processed.replace(/\s+/g, ' ').trim();

  // Insert pause markers — stacked periods + commas force Kokoro to breathe
  // Long pause: ~1s break (paragraph/section change)
  processed = processed.replace(new RegExp(longPause, 'g'), '. . . , ,');
  // Short pause: ~0.5s break (new line/option/thought)
  processed = processed.replace(new RegExp(shortPause, 'g'), '. . ,');

  // Convert existing ellipses to breathing pauses
  processed = processed.replace(/\.{2,}/g, '. . ,');

  return processed;
}

/**
 * Split text into chunks that fit within TTS character limits.
 * Tries to split at sentence boundaries to avoid cutting mid-sentence.
 */
export function splitTextIntoChunks(
  text: string,
  maxChars: number = 3500,
): string[] {
  const chunks: string[] = [];

  if (text.length <= maxChars) {
    return [text];
  }

  // Split by sentences first
  const sentences = text.split(/([.!?]+\s+)/);
  let currentChunk = '';

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const testChunk = currentChunk + sentence;

    if (testChunk.length <= maxChars) {
      currentChunk = testChunk;
    } else {
      // Current chunk is full, save it and start new one
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;

      // If a single sentence is too long, split it by words
      if (currentChunk.length > maxChars) {
        const words = currentChunk.split(/\s+/);
        let wordChunk = '';
        for (const word of words) {
          if ((wordChunk + ' ' + word).length <= maxChars) {
            wordChunk = wordChunk ? wordChunk + ' ' + word : word;
          } else {
            if (wordChunk) chunks.push(wordChunk);
            wordChunk = word;
          }
        }
        if (wordChunk) currentChunk = wordChunk;
      }
    }
  }

  // Add final chunk
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
