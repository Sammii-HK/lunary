import { detectNatalAspectPatterns } from '@/src/lib/journal/aspect-pattern-detector';
import type { BirthChartData } from '@/utils/astrology/birthChart';

describe('Natal Aspect Pattern Detection', () => {
  describe('Stellium Detection', () => {
    it('should detect a stellium with 3 planets in same sign', () => {
      const birthChart: BirthChartData[] = [
        {
          body: 'Sun',
          sign: 'Leo',
          degree: 5,
          retrograde: false,
          house: 5,
          angle: 125,
        },
        {
          body: 'Mercury',
          sign: 'Leo',
          degree: 10,
          retrograde: false,
          house: 5,
          angle: 130,
        },
        {
          body: 'Venus',
          sign: 'Leo',
          degree: 15,
          retrograde: false,
          house: 5,
          angle: 135,
        },
        {
          body: 'Moon',
          sign: 'Pisces',
          degree: 20,
          retrograde: false,
          house: 12,
          angle: 350,
        },
      ];

      const patterns = detectNatalAspectPatterns(birthChart);

      expect(patterns.length).toBeGreaterThan(0);

      const stellium = patterns.find((p) => p.patternType === 'stellium');
      expect(stellium).toBeDefined();
      expect(stellium?.planets).toContain('Sun');
      expect(stellium?.planets).toContain('Mercury');
      expect(stellium?.planets).toContain('Venus');
      expect(stellium?.signs).toEqual(['Leo']);
    });

    it('should detect stellium with 4+ planets', () => {
      const birthChart: BirthChartData[] = [
        {
          body: 'Sun',
          sign: 'Aquarius',
          degree: 1,
          retrograde: false,
          house: 11,
          angle: 301,
        },
        {
          body: 'Mercury',
          sign: 'Aquarius',
          degree: 5,
          retrograde: false,
          house: 11,
          angle: 305,
        },
        {
          body: 'Venus',
          sign: 'Aquarius',
          degree: 12,
          retrograde: false,
          house: 11,
          angle: 312,
        },
        {
          body: 'Mars',
          sign: 'Aquarius',
          degree: 18,
          retrograde: false,
          house: 11,
          angle: 318,
        },
      ];

      const patterns = detectNatalAspectPatterns(birthChart);

      const stellium = patterns.find((p) => p.patternType === 'stellium');
      expect(stellium).toBeDefined();
      expect(stellium?.planets.length).toBe(4);
      expect(stellium?.description).toContain('4 planets');
    });

    it('should NOT detect stellium with only 2 planets', () => {
      const birthChart: BirthChartData[] = [
        {
          body: 'Sun',
          sign: 'Gemini',
          degree: 5,
          retrograde: false,
          house: 3,
          angle: 65,
        },
        {
          body: 'Mercury',
          sign: 'Gemini',
          degree: 10,
          retrograde: false,
          house: 3,
          angle: 70,
        },
        {
          body: 'Moon',
          sign: 'Cancer',
          degree: 15,
          retrograde: false,
          house: 4,
          angle: 105,
        },
      ];

      const patterns = detectNatalAspectPatterns(birthChart);

      const stellium = patterns.find((p) => p.patternType === 'stellium');
      expect(stellium).toBeUndefined();
    });

    it('should include element information for stellium', () => {
      const birthChart: BirthChartData[] = [
        {
          body: 'Sun',
          sign: 'Aries',
          degree: 5,
          retrograde: false,
          house: 1,
          angle: 5,
        },
        {
          body: 'Mars',
          sign: 'Aries',
          degree: 12,
          retrograde: false,
          house: 1,
          angle: 12,
        },
        {
          body: 'Jupiter',
          sign: 'Aries',
          degree: 20,
          retrograde: false,
          house: 1,
          angle: 20,
        },
      ];

      const patterns = detectNatalAspectPatterns(birthChart);

      const stellium = patterns.find((p) => p.patternType === 'stellium');
      expect(stellium?.element).toBe('Fire');
    });

    it('should detect multiple stelliums if present', () => {
      const birthChart: BirthChartData[] = [
        {
          body: 'Sun',
          sign: 'Aries',
          degree: 5,
          retrograde: false,
          house: 1,
          angle: 5,
        },
        {
          body: 'Mars',
          sign: 'Aries',
          degree: 12,
          retrograde: false,
          house: 1,
          angle: 12,
        },
        {
          body: 'Jupiter',
          sign: 'Aries',
          degree: 20,
          retrograde: false,
          house: 1,
          angle: 20,
        },
        {
          body: 'Moon',
          sign: 'Scorpio',
          degree: 5,
          retrograde: false,
          house: 8,
          angle: 215,
        },
        {
          body: 'Venus',
          sign: 'Scorpio',
          degree: 10,
          retrograde: false,
          house: 8,
          angle: 220,
        },
        {
          body: 'Mercury',
          sign: 'Scorpio',
          degree: 15,
          retrograde: false,
          house: 8,
          angle: 225,
        },
      ];

      const patterns = detectNatalAspectPatterns(birthChart);

      const stelliums = patterns.filter((p) => p.patternType === 'stellium');
      expect(stelliums.length).toBe(2);

      const ariesStellium = stelliums.find((s) => s.signs.includes('Aries'));
      const scorpioStellium = stelliums.find((s) =>
        s.signs.includes('Scorpio'),
      );

      expect(ariesStellium).toBeDefined();
      expect(scorpioStellium).toBeDefined();
    });
  });

  describe('House Information', () => {
    it('should include house information for patterns', () => {
      const birthChart: BirthChartData[] = [
        {
          body: 'Sun',
          sign: 'Libra',
          degree: 5,
          retrograde: false,
          house: 7,
          angle: 185,
        },
        {
          body: 'Venus',
          sign: 'Libra',
          degree: 10,
          retrograde: false,
          house: 7,
          angle: 190,
        },
        {
          body: 'Mercury',
          sign: 'Libra',
          degree: 15,
          retrograde: false,
          house: 7,
          angle: 195,
        },
      ];

      const patterns = detectNatalAspectPatterns(birthChart);

      const stellium = patterns.find((p) => p.patternType === 'stellium');
      expect(stellium?.houses).toBeDefined();
      expect(stellium?.houses).toContain(7);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty birth chart', () => {
      const patterns = detectNatalAspectPatterns([]);

      expect(patterns).toEqual([]);
    });

    it('should handle chart with no patterns', () => {
      const birthChart: BirthChartData[] = [
        {
          body: 'Sun',
          sign: 'Aries',
          degree: 5,
          retrograde: false,
          house: 1,
          angle: 5,
        },
        {
          body: 'Moon',
          sign: 'Cancer',
          degree: 10,
          retrograde: false,
          house: 4,
          angle: 100,
        },
        {
          body: 'Mercury',
          sign: 'Libra',
          degree: 15,
          retrograde: false,
          house: 7,
          angle: 195,
        },
      ];

      const patterns = detectNatalAspectPatterns(birthChart);

      expect(Array.isArray(patterns)).toBe(true);
      // May be empty or have patterns - just verify it doesn't crash
    });

    it('should handle planets without house information', () => {
      const birthChart: BirthChartData[] = [
        {
          body: 'Sun',
          sign: 'Taurus',
          degree: 5,
          retrograde: false,
          house: 0,
          angle: 35,
        },
        {
          body: 'Venus',
          sign: 'Taurus',
          degree: 10,
          retrograde: false,
          house: 0,
          angle: 40,
        },
        {
          body: 'Mercury',
          sign: 'Taurus',
          degree: 15,
          retrograde: false,
          house: 0,
          angle: 45,
        },
      ];

      const patterns = detectNatalAspectPatterns(birthChart);

      const stellium = patterns.find((p) => p.patternType === 'stellium');
      if (stellium) {
        expect(stellium.houses).toBeDefined();
        expect(Array.isArray(stellium.houses)).toBe(true);
      }
    });
  });

  describe('Pattern Description', () => {
    it('should generate descriptive text for stelliums', () => {
      const birthChart: BirthChartData[] = [
        {
          body: 'Sun',
          sign: 'Sagittarius',
          degree: 5,
          retrograde: false,
          house: 9,
          angle: 245,
        },
        {
          body: 'Mercury',
          sign: 'Sagittarius',
          degree: 10,
          retrograde: false,
          house: 9,
          angle: 250,
        },
        {
          body: 'Venus',
          sign: 'Sagittarius',
          degree: 15,
          retrograde: false,
          house: 9,
          angle: 255,
        },
      ];

      const patterns = detectNatalAspectPatterns(birthChart);

      const stellium = patterns.find((p) => p.patternType === 'stellium');
      expect(stellium?.description).toBeDefined();
      expect(stellium?.description).toContain('Sagittarius');
      expect(stellium?.description.toLowerCase()).toContain('stellium');
    });
  });

  describe('Performance', () => {
    it('should detect patterns efficiently even with many planets', () => {
      const largeBirthChart: BirthChartData[] = Array(20)
        .fill(null)
        .map((_, i) => ({
          body: `Planet${i}`,
          sign: 'Capricorn',
          degree: i * 1.5,
          retrograde: false,
          house: 10,
          angle: 270 + i * 1.5,
        }));

      const startTime = Date.now();
      const patterns = detectNatalAspectPatterns(largeBirthChart);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100); // Should complete within 100ms
      expect(Array.isArray(patterns)).toBe(true);
    });
  });
});
