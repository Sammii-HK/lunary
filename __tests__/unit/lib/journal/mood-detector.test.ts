import {
  detectMoodsByKeywords,
  detectMoodsByAI,
  detectMoods,
  MOOD_TAXONOMY,
  ALL_MOODS,
} from '@/lib/journal/mood-detector';

// Mock fetch for AI API calls
global.fetch = jest.fn();

describe('Mood Detector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe('MOOD_TAXONOMY', () => {
    it('should have all mood categories defined', () => {
      expect(MOOD_TAXONOMY).toHaveProperty('positive');
      expect(MOOD_TAXONOMY).toHaveProperty('neutral');
      expect(MOOD_TAXONOMY).toHaveProperty('challenging');
    });

    it('should contain expected mood counts', () => {
      expect(MOOD_TAXONOMY.positive.length).toBeGreaterThan(0);
      expect(MOOD_TAXONOMY.neutral.length).toBeGreaterThan(0);
      expect(MOOD_TAXONOMY.challenging.length).toBeGreaterThan(0);
    });

    it('should have 28 total moods', () => {
      const totalMoods =
        MOOD_TAXONOMY.positive.length +
        MOOD_TAXONOMY.neutral.length +
        MOOD_TAXONOMY.challenging.length;
      expect(totalMoods).toBe(28);
    });
  });

  describe('ALL_MOODS', () => {
    it('should contain all moods from taxonomy', () => {
      expect(ALL_MOODS.length).toBe(28);
      expect(ALL_MOODS).toContain('joyful');
      expect(ALL_MOODS).toContain('anxious');
      expect(ALL_MOODS).toContain('reflective');
    });

    it('should not have duplicates', () => {
      const unique = [...new Set(ALL_MOODS)];
      expect(unique.length).toBe(ALL_MOODS.length);
    });
  });

  describe('detectMoodsByKeywords', () => {
    it('should detect positive moods from text', () => {
      const text =
        'I feel so joyful and grateful today! Everything is amazing.';
      const result = detectMoodsByKeywords(text);

      expect(result.moods).toContain('joyful');
      expect(result.moods).toContain('grateful');
      expect(result.method).toBe('keyword');
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should detect challenging moods from text', () => {
      const text = 'I am feeling anxious and worried about tomorrow.';
      const result = detectMoodsByKeywords(text);

      expect(result.moods).toContain('anxious');
      expect(result.moods).toContain('worried');
      expect(result.method).toBe('keyword');
    });

    it('should detect neutral moods from text', () => {
      const text = 'Today I was very reflective and contemplative.';
      const result = detectMoodsByKeywords(text);

      expect(result.moods).toContain('reflective');
      expect(result.moods).toContain('contemplative');
      expect(result.method).toBe('keyword');
    });

    it('should be case insensitive', () => {
      const text = 'I feel JOYFUL and GRATEFUL!';
      const result = detectMoodsByKeywords(text);

      expect(result.moods).toContain('joyful');
      expect(result.moods).toContain('grateful');
    });

    it('should detect moods in various word forms', () => {
      const text =
        'I am feeling hopeful about the future and very creative today.';
      const result = detectMoodsByKeywords(text);

      expect(result.moods).toContain('hopeful');
      expect(result.moods).toContain('inspired'); // "creative" is a keyword for "inspired"
    });

    it('should handle text with no mood keywords', () => {
      const text = 'I went to the store and bought milk.';
      const result = detectMoodsByKeywords(text);

      expect(result.moods).toHaveLength(0);
      expect(result.method).toBe('keyword');
      expect(result.confidence).toBe(0);
    });

    it('should not have duplicate moods', () => {
      const text = 'I am joyful, so joyful, incredibly joyful today!';
      const result = detectMoodsByKeywords(text);

      const uniqueMoods = [...new Set(result.moods)];
      expect(result.moods.length).toBe(uniqueMoods.length);
    });

    it('should limit to top 5 moods', () => {
      const text =
        'I feel joyful, grateful, hopeful, peaceful, content, and excited today.';
      const result = detectMoodsByKeywords(text);

      expect(result.moods.length).toBeLessThanOrEqual(5);
    });

    it('should calculate confidence based on mood count', () => {
      const text1 = 'I feel joyful.';
      const text2 = 'I feel joyful and grateful.';
      const text3 = 'I feel joyful, grateful, and hopeful.';

      const result1 = detectMoodsByKeywords(text1);
      const result2 = detectMoodsByKeywords(text2);
      const result3 = detectMoodsByKeywords(text3);

      expect(result1.confidence).toBeLessThan(result2.confidence);
      expect(result2.confidence).toBeLessThan(result3.confidence);
    });

    it('should handle empty text', () => {
      const result = detectMoodsByKeywords('');

      expect(result.moods).toHaveLength(0);
      expect(result.confidence).toBe(0);
    });
  });

  describe('detectMoodsByAI', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should use AI when ANTHROPIC_API_KEY is set', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [{ text: '["joyful", "grateful"]' }],
        }),
      });

      const text = 'Today was an amazing day full of wonderful moments!';
      const result = await detectMoodsByAI(text);

      expect(global.fetch).toHaveBeenCalled();
      expect(result.method).toBe('ai');
      expect(result.moods.length).toBeGreaterThan(0);
      expect(result.moods).toContain('joyful');
      expect(result.moods).toContain('grateful');
    });

    it('should fallback to keyword detection when no API key', async () => {
      delete process.env.ANTHROPIC_API_KEY;

      const text = 'I feel joyful today!';
      const result = await detectMoodsByAI(text);

      expect(result.method).toBe('keyword');
      expect(result.moods).toContain('joyful');
    });

    it('should handle AI errors gracefully', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';

      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      const text = 'I feel anxious today';
      const result = await detectMoodsByAI(text);

      expect(result.method).toBe('keyword');
      expect(result.moods).toContain('anxious');
    });

    it('should filter invalid moods from AI response', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [
            {
              text: '["joyful", "invalid_mood", "grateful", "another_invalid"]',
            },
          ],
        }),
      });

      const text = 'Today was great!';
      const result = await detectMoodsByAI(text);

      expect(result.moods).toContain('joyful');
      expect(result.moods).toContain('grateful');
      expect(result.moods).not.toContain('invalid_mood');
      expect(result.moods).not.toContain('another_invalid');
    });

    it('should limit AI-detected moods to 5', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [
            {
              text: '["joyful", "grateful", "hopeful", "peaceful", "content", "excited"]',
            },
          ],
        }),
      });

      const text = 'Amazing day with so many emotions!';
      const result = await detectMoodsByAI(text);

      expect(result.moods.length).toBeLessThanOrEqual(5);
    });
  });

  describe('detectMoods (unified interface)', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should use keyword detection when preferAI is false', async () => {
      const text = 'I feel joyful and grateful today!';
      const result = await detectMoods(text, false);

      expect(result.method).toBe('keyword');
      expect(result.moods).toContain('joyful');
      expect(result.moods).toContain('grateful');
    });

    it('should try AI first when preferAI is true', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [{ text: '["joyful", "grateful"]' }],
        }),
      });

      const text = 'Today was an absolutely amazing day!';
      const result = await detectMoods(text, true);

      expect(global.fetch).toHaveBeenCalled();
      expect(result.method).toBe('ai');
    });

    it('should fallback to keywords when AI returns no moods', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [{ text: '["invalid_mood1", "invalid_mood2"]' }],
        }),
      });

      const text = 'I feel joyful today!';
      const result = await detectMoods(text, true);

      expect(result.method).toBe('keyword');
      expect(result.moods).toContain('joyful');
    });

    it('should handle empty text gracefully', async () => {
      const result = await detectMoods('', false);

      expect(result.moods).toHaveLength(0);
      expect(result.confidence).toBe(0);
    });
  });

  describe('Mood detection accuracy', () => {
    const testCases = [
      {
        text: 'What a beautiful sunrise! I feel so peaceful and content.',
        expectedMoods: ['peaceful', 'content'],
      },
      {
        text: 'Feeling overwhelmed and frustrated with all this work.',
        expectedMoods: ['overwhelmed', 'frustrated'],
      },
      {
        text: 'Today I felt really curious about learning new things.',
        expectedMoods: ['curious'],
      },
      {
        text: 'I am grateful for my friends and feel so much love.',
        expectedMoods: ['grateful', 'loving'],
      },
      {
        text: 'Feeling a bit melancholy as I remember old times.',
        expectedMoods: ['sad'], // "melancholy" is a keyword for "sad"
      },
    ];

    testCases.forEach(({ text, expectedMoods }) => {
      it(`should detect moods in: "${text.substring(0, 40)}..."`, () => {
        const result = detectMoodsByKeywords(text);

        expectedMoods.forEach((mood) => {
          expect(result.moods).toContain(mood);
        });
      });
    });
  });

  describe('Cost tracking', () => {
    it('should not incur costs for keyword detection', () => {
      const text = 'I feel joyful today!';
      const result = detectMoodsByKeywords(text);

      expect(result.method).toBe('keyword');
      // No API calls = no cost
    });

    it('should track AI usage method', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [{ text: '["joyful"]' }],
        }),
      });

      const text = 'Amazing day!';
      const result = await detectMoodsByAI(text);

      expect(result.method).toBe('ai');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
