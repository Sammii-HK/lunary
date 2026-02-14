import { normalizeScriptForTTS } from '@/lib/tts/normalize-script';

describe('normalizeScriptForTTS', () => {
  describe('number to words conversion', () => {
    it('converts small numbers to words', () => {
      const result = normalizeScriptForTTS('3 planets align today');
      expect(result).toContain('three planets');
    });

    it('converts teen numbers to words', () => {
      const result = normalizeScriptForTTS('There are 15 degrees left');
      expect(result).toContain('fifteen degrees');
    });

    it('converts two-digit numbers to words', () => {
      const result = normalizeScriptForTTS('At 45 degrees');
      expect(result).toContain('forty five degrees');
    });
  });

  describe('year normalisation', () => {
    it('converts 2025 to words', () => {
      const result = normalizeScriptForTTS('In 2025 things will shift');
      expect(result).toContain('twenty twenty five');
    });

    it('converts 2000 to words', () => {
      const result = normalizeScriptForTTS('Since 2000 we have seen');
      expect(result).toContain('twenty zero');
    });

    it('converts 2099 to words', () => {
      const result = normalizeScriptForTTS('By 2099 Neptune');
      expect(result).toContain('twenty ninety nine');
    });
  });

  describe('range normalisation', () => {
    it('converts ranges to "X to Y"', () => {
      const result = normalizeScriptForTTS('3-5 planets are active');
      expect(result).toContain('three to five planets');
    });

    it('handles ranges with spaces around dash', () => {
      const result = normalizeScriptForTTS('about 10 - 20 degrees');
      expect(result).toContain('ten to twenty degrees');
    });
  });

  describe('long sentence splitting', () => {
    it('splits sentences longer than 26 words', () => {
      const longSentence =
        'The cosmic energy flowing through the celestial sphere brings a powerful transformative force that will reshape how you experience love relationships career growth and personal spiritual development in the coming weeks.';
      const result = normalizeScriptForTTS(longSentence);
      // Should be split into multiple sentences (periods inserted)
      const periodCount = (result.match(/\./g) || []).length;
      expect(periodCount).toBeGreaterThanOrEqual(2);
    });

    it('leaves short sentences intact', () => {
      const shortSentence = 'Venus enters Pisces today.';
      const result = normalizeScriptForTTS(shortSentence);
      expect(result).toBe('Venus enters Pisces today.');
    });
  });

  describe('punctuation normalisation', () => {
    it('collapses multiple exclamation marks', () => {
      const result = normalizeScriptForTTS('Amazing!!!');
      expect(result).not.toContain('!!!');
      expect(result).toContain('.');
    });

    it('collapses multiple question marks', () => {
      const result = normalizeScriptForTTS('Really???');
      expect(result).not.toContain('???');
      expect(result).toContain('.');
    });
  });

  describe('slash replacement', () => {
    it('replaces slashes with "and"', () => {
      const result = normalizeScriptForTTS('Sun/Moon conjunction');
      expect(result).toContain('Sun and Moon');
    });

    it('handles slashes with spaces', () => {
      const result = normalizeScriptForTTS('career / love life');
      expect(result).toContain('career and love life');
    });
  });

  describe('whitespace normalisation', () => {
    it('collapses double spaces', () => {
      const result = normalizeScriptForTTS('Venus  enters  Pisces');
      expect(result).not.toContain('  ');
    });
  });

  describe('pause preservation', () => {
    it('converts paragraph breaks to ellipsis pause markers', () => {
      const result = normalizeScriptForTTS('First section.\n\nSecond section.');
      expect(result).toContain('...');
    });

    it('preserves existing ellipses as pause markers', () => {
      const result = normalizeScriptForTTS('Take a moment... and breathe.');
      expect(result).toContain('...');
    });
  });
});
