import {
  preprocessTextForTTS,
  splitTextIntoChunks,
} from '@/lib/tts/normalize-script';

describe('preprocessTextForTTS', () => {
  it('converts paragraph breaks to pause markers', () => {
    const result = preprocessTextForTTS('First section.\n\nSecond section.');
    expect(result).toContain('. . . , ,');
    expect(result).not.toContain('\n\n');
  });

  it('handles multiple paragraph breaks', () => {
    const result = preprocessTextForTTS('A.\n\n\n\nB.');
    expect(result).toContain('. . . , ,');
    expect(result).not.toContain('\n');
  });

  it('removes duplicate consecutive words', () => {
    const result = preprocessTextForTTS('the the moon is full');
    expect(result).not.toMatch(/\bthe the\b/);
    expect(result).toContain('the moon is full');
  });

  it('removes hyphenated duplicate words', () => {
    const result = preprocessTextForTTS('Moon-Moon is rising');
    expect(result).not.toContain('Moon-Moon');
    expect(result).toContain('Moon is rising');
  });

  it('collapses double spaces', () => {
    const result = preprocessTextForTTS('Venus  enters  Pisces');
    expect(result).not.toContain('  ');
  });

  it('converts ellipses to breathing pause markers', () => {
    const result = preprocessTextForTTS('Take a breath... then continue.');
    expect(result).toContain('. . ,');
  });

  it('trims leading and trailing whitespace', () => {
    const result = preprocessTextForTTS('  hello world  ');
    expect(result).toBe('hello world');
  });
});

describe('splitTextIntoChunks', () => {
  it('returns single chunk for short text', () => {
    const text = 'Venus enters Pisces today.';
    const chunks = splitTextIntoChunks(text);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe(text);
  });

  it('returns single chunk for text under maxChars', () => {
    const text = 'A'.repeat(3000);
    const chunks = splitTextIntoChunks(text);
    expect(chunks).toHaveLength(1);
  });

  it('splits long text at sentence boundaries', () => {
    // Create text over 3500 chars with sentence boundaries
    const sentence = 'The moon is full tonight and it shines brightly. ';
    const text = sentence.repeat(100); // ~4900 chars
    const chunks = splitTextIntoChunks(text);
    expect(chunks.length).toBeGreaterThan(1);
    // Each chunk should be under 3500 chars
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(3500);
    }
  });

  it('splits very long single sentence at word boundaries', () => {
    // Create one sentence that's over 3500 chars with no periods
    const word = 'superlongword ';
    const text = word.repeat(300); // ~4200 chars
    const chunks = splitTextIntoChunks(text);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(3500);
    }
  });

  it('all chunks are within maxChars limit', () => {
    const maxChars = 500;
    const text = 'Hello world. '.repeat(100);
    const chunks = splitTextIntoChunks(text, maxChars);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(maxChars);
    }
  });

  it('preserves all text content across chunks', () => {
    const sentence =
      'Sentence number one. Sentence number two. Sentence number three. ';
    const text = sentence.repeat(30);
    const chunks = splitTextIntoChunks(text, 500);
    const rejoined = chunks.join(' ');
    // All words from original should appear in the rejoined text
    expect(rejoined).toContain('Sentence number one');
    expect(rejoined).toContain('Sentence number three');
  });
});
