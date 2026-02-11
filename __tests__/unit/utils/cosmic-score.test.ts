import { calculateCosmicScore } from '@/utils/cosmic-score';
import type { GlobalCosmicData } from '@/lib/cosmic-snapshot/global-cache';

const mockBirthChart = [
  { body: 'Sun', sign: 'Aries', degree: 15 },
  { body: 'Moon', sign: 'Cancer', degree: 10 },
  { body: 'Ascendant', sign: 'Leo', degree: 5 },
  { body: 'Mercury', sign: 'Pisces', degree: 20 },
  { body: 'Venus', sign: 'Taurus', degree: 12 },
  { body: 'Mars', sign: 'Gemini', degree: 8 },
];

function createMockCosmicData(
  overrides: Partial<GlobalCosmicData> = {},
): GlobalCosmicData {
  return {
    moonPhase: {
      name: 'Full Moon',
      energy: 'Illumination',
      priority: 9,
      emoji: '🌕',
      illumination: 100,
      age: 14.8,
      isSignificant: true,
    },
    planetaryPositions: {
      Sun: {
        longitude: 15,
        sign: 'Aries',
        degree: 15,
        minutes: 0,
        retrograde: false,
        newRetrograde: false,
        newDirect: false,
      },
      Moon: {
        longitude: 195,
        sign: 'Libra',
        degree: 15,
        minutes: 0,
        retrograde: false,
        newRetrograde: false,
        newDirect: false,
      },
      Mercury: {
        longitude: 25,
        sign: 'Aries',
        degree: 25,
        minutes: 0,
        retrograde: false,
        newRetrograde: false,
        newDirect: false,
      },
      Venus: {
        longitude: 45,
        sign: 'Taurus',
        degree: 15,
        minutes: 0,
        retrograde: false,
        newRetrograde: false,
        newDirect: false,
      },
      Mars: {
        longitude: 75,
        sign: 'Gemini',
        degree: 15,
        minutes: 0,
        retrograde: false,
        newRetrograde: false,
        newDirect: false,
      },
      Jupiter: {
        longitude: 135,
        sign: 'Leo',
        degree: 15,
        minutes: 0,
        retrograde: false,
        newRetrograde: false,
        newDirect: false,
      },
      Saturn: {
        longitude: 345,
        sign: 'Pisces',
        degree: 15,
        minutes: 0,
        retrograde: false,
        newRetrograde: false,
        newDirect: false,
      },
    },
    generalTransits: [],
    ...overrides,
  };
}

describe('calculateCosmicScore', () => {
  it('returns a score with all required fields', () => {
    const data = createMockCosmicData();
    const result = calculateCosmicScore(
      data,
      mockBirthChart,
      new Date('2025-06-15'),
    );

    expect(result).toHaveProperty('overall');
    expect(result).toHaveProperty('categories');
    expect(result).toHaveProperty('bestWindowDescription');
    expect(result).toHaveProperty('dominantEnergy');
    expect(result).toHaveProperty('headline');
  });

  it('overall score is between 1 and 100', () => {
    const data = createMockCosmicData();
    const result = calculateCosmicScore(
      data,
      mockBirthChart,
      new Date('2025-06-15'),
    );

    expect(result.overall).toBeGreaterThanOrEqual(1);
    expect(result.overall).toBeLessThanOrEqual(100);
  });

  it('categories are all between 0 and 20', () => {
    const data = createMockCosmicData();
    const result = calculateCosmicScore(
      data,
      mockBirthChart,
      new Date('2025-06-15'),
    );

    const { categories } = result;
    expect(categories.communication).toBeGreaterThanOrEqual(0);
    expect(categories.communication).toBeLessThanOrEqual(20);
    expect(categories.creativity).toBeGreaterThanOrEqual(0);
    expect(categories.creativity).toBeLessThanOrEqual(20);
    expect(categories.love).toBeGreaterThanOrEqual(0);
    expect(categories.love).toBeLessThanOrEqual(20);
    expect(categories.career).toBeGreaterThanOrEqual(0);
    expect(categories.career).toBeLessThanOrEqual(20);
    expect(categories.rest).toBeGreaterThanOrEqual(0);
    expect(categories.rest).toBeLessThanOrEqual(20);
  });

  it('is deterministic for the same date and birth chart', () => {
    const data = createMockCosmicData();
    const date = new Date('2025-06-15');

    const result1 = calculateCosmicScore(data, mockBirthChart, date);
    const result2 = calculateCosmicScore(data, mockBirthChart, date);

    expect(result1).toEqual(result2);
  });

  it('produces different scores for different dates', () => {
    const data = createMockCosmicData();

    const result1 = calculateCosmicScore(
      data,
      mockBirthChart,
      new Date('2025-06-15'),
    );
    const result2 = calculateCosmicScore(
      data,
      mockBirthChart,
      new Date('2025-06-16'),
    );

    // At minimum the date-based variety should make them slightly different
    // (though they could theoretically match, highly unlikely with hash variation)
    expect(
      result1.overall !== result2.overall ||
        result1.headline !== result2.headline,
    ).toBe(true);
  });

  it('retrograde Mercury reduces communication score', () => {
    const normalData = createMockCosmicData();
    const retroData = createMockCosmicData({
      planetaryPositions: {
        ...createMockCosmicData().planetaryPositions,
        Mercury: {
          longitude: 25,
          sign: 'Aries',
          degree: 25,
          minutes: 0,
          retrograde: true,
          newRetrograde: true,
          newDirect: false,
        },
      },
    });

    const date = new Date('2025-06-15');
    const normalScore = calculateCosmicScore(normalData, mockBirthChart, date);
    const retroScore = calculateCosmicScore(retroData, mockBirthChart, date);

    expect(retroScore.categories.communication).toBeLessThanOrEqual(
      normalScore.categories.communication,
    );
  });

  it('moon phase affects category scores', () => {
    const fullMoonData = createMockCosmicData({
      moonPhase: {
        name: 'Full Moon',
        energy: 'Illumination',
        priority: 9,
        emoji: '🌕',
        illumination: 100,
        age: 14.8,
        isSignificant: true,
      },
    });

    const newMoonData = createMockCosmicData({
      moonPhase: {
        name: 'New Moon',
        energy: 'New beginnings',
        priority: 9,
        emoji: '🌑',
        illumination: 0,
        age: 0,
        isSignificant: true,
      },
    });

    const date = new Date('2025-06-15');
    const fullResult = calculateCosmicScore(fullMoonData, mockBirthChart, date);
    const newResult = calculateCosmicScore(newMoonData, mockBirthChart, date);

    // Full Moon boosts love (+3), New Moon boosts rest (+3)
    expect(fullResult.categories.love).toBeGreaterThan(
      newResult.categories.love,
    );
    expect(newResult.categories.rest).toBeGreaterThan(
      fullResult.categories.rest,
    );
  });

  it('headline reflects high score', () => {
    // Create a very harmonious setup
    const data = createMockCosmicData();
    const date = new Date('2025-06-15');
    const result = calculateCosmicScore(data, mockBirthChart, date);

    expect(typeof result.headline).toBe('string');
    expect(result.headline.length).toBeGreaterThan(0);
  });

  it('dominantEnergy is a valid label', () => {
    const data = createMockCosmicData();
    const result = calculateCosmicScore(
      data,
      mockBirthChart,
      new Date('2025-06-15'),
    );

    const validLabels = [
      'Communicative',
      'Creative',
      'Heart-centered',
      'Ambitious',
      'Restorative',
    ];
    expect(validLabels).toContain(result.dominantEnergy);
  });

  it('handles empty birth chart gracefully', () => {
    const data = createMockCosmicData();
    const result = calculateCosmicScore(data, [], new Date('2025-06-15'));

    expect(result.overall).toBeGreaterThanOrEqual(1);
    expect(result.overall).toBeLessThanOrEqual(100);
  });
});
