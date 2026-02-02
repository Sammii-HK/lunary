/**
 * @jest-environment node
 */
import {
  calculateSynastryAspects,
  calculateElementBalance,
  calculateModalityBalance,
  calculateCompatibilityScore,
  calculateSynastry,
  generateSynastryAnalysis,
} from '../../../../src/lib/astrology/synastry';
import type { BirthChartData } from '../../../../utils/astrology/birthChart';

// Mock birth chart data for testing
const createMockPlanet = (
  body: string,
  sign: string,
  longitude: number,
): BirthChartData => ({
  body,
  sign,
  eclipticLongitude: longitude,
  degree: Math.floor(longitude % 30),
  minute: Math.floor((longitude % 1) * 60),
  retrograde: false,
  house: 1,
});

describe('Synastry Calculations', () => {
  describe('calculateSynastryAspects', () => {
    it('should detect conjunction aspects (0°)', () => {
      const chart1 = [createMockPlanet('Sun', 'Aries', 15)];
      const chart2 = [createMockPlanet('Moon', 'Aries', 17)]; // 2° orb

      const aspects = calculateSynastryAspects(chart1, chart2);

      expect(aspects.length).toBeGreaterThan(0);
      expect(aspects[0].aspectType).toBe('conjunction');
      expect(aspects[0].person1Planet).toBe('Sun');
      expect(aspects[0].person2Planet).toBe('Moon');
      expect(aspects[0].isHarmonious).toBe(true);
      expect(aspects[0].orb).toBeCloseTo(2, 1);
    });

    it('should detect opposition aspects (180°)', () => {
      const chart1 = [createMockPlanet('Venus', 'Aries', 10)];
      const chart2 = [createMockPlanet('Mars', 'Libra', 192)]; // 182° = opposition with 2° orb

      const aspects = calculateSynastryAspects(chart1, chart2);

      const opposition = aspects.find((a) => a.aspectType === 'opposition');
      expect(opposition).toBeDefined();
      expect(opposition?.isHarmonious).toBe(false);
    });

    it('should detect trine aspects (120°)', () => {
      const chart1 = [createMockPlanet('Sun', 'Aries', 15)];
      const chart2 = [createMockPlanet('Moon', 'Leo', 135)]; // 120° = trine

      const aspects = calculateSynastryAspects(chart1, chart2);

      const trine = aspects.find((a) => a.aspectType === 'trine');
      expect(trine).toBeDefined();
      expect(trine?.isHarmonious).toBe(true);
    });

    it('should detect square aspects (90°)', () => {
      const chart1 = [createMockPlanet('Sun', 'Aries', 15)];
      const chart2 = [createMockPlanet('Moon', 'Cancer', 105)]; // 90° = square

      const aspects = calculateSynastryAspects(chart1, chart2);

      const square = aspects.find((a) => a.aspectType === 'square');
      expect(square).toBeDefined();
      expect(square?.isHarmonious).toBe(false);
    });

    it('should detect sextile aspects (60°)', () => {
      const chart1 = [createMockPlanet('Venus', 'Aries', 15)];
      const chart2 = [createMockPlanet('Mars', 'Gemini', 75)]; // 60° = sextile

      const aspects = calculateSynastryAspects(chart1, chart2);

      const sextile = aspects.find((a) => a.aspectType === 'sextile');
      expect(sextile).toBeDefined();
      expect(sextile?.isHarmonious).toBe(true);
    });

    it('should not detect aspects outside of orb', () => {
      const chart1 = [createMockPlanet('Sun', 'Aries', 15)];
      const chart2 = [createMockPlanet('Moon', 'Taurus', 60)]; // 45° = no major aspect

      const aspects = calculateSynastryAspects(chart1, chart2);

      // Should not find any major aspects at 45°
      expect(
        aspects.filter(
          (a) =>
            a.person1Planet === 'Sun' &&
            a.person2Planet === 'Moon' &&
            [
              'conjunction',
              'opposition',
              'trine',
              'square',
              'sextile',
            ].includes(a.aspectType),
        ).length,
      ).toBe(0);
    });

    it('should sort aspects by weight (significance)', () => {
      const chart1 = [
        createMockPlanet('Sun', 'Aries', 15),
        createMockPlanet('Mercury', 'Aries', 20),
      ];
      const chart2 = [
        createMockPlanet('Moon', 'Aries', 17),
        createMockPlanet('Saturn', 'Aries', 22),
      ];

      const aspects = calculateSynastryAspects(chart1, chart2);

      // Sun-Moon conjunction should be weighted higher than Mercury-Saturn
      if (aspects.length >= 2) {
        expect(aspects[0].weight).toBeGreaterThanOrEqual(aspects[1].weight);
      }
    });

    it('should only analyze synastry planets', () => {
      const chart1 = [
        createMockPlanet('Sun', 'Aries', 15),
        createMockPlanet('Midheaven', 'Capricorn', 270), // Not in SYNASTRY_PLANETS
      ];
      const chart2 = [createMockPlanet('Moon', 'Aries', 17)];

      const aspects = calculateSynastryAspects(chart1, chart2);

      // Should not include Midheaven aspects
      expect(aspects.some((a) => a.person1Planet === 'Midheaven')).toBe(false);
    });
  });

  describe('calculateElementBalance', () => {
    it('should count fire signs correctly', () => {
      const chart1 = [
        createMockPlanet('Sun', 'Aries', 15),
        createMockPlanet('Moon', 'Leo', 135),
      ];
      const chart2 = [createMockPlanet('Venus', 'Sagittarius', 255)];

      const balance = calculateElementBalance(chart1, chart2);

      expect(balance.fire.person1).toBeGreaterThan(0);
      expect(balance.fire.person2).toBeGreaterThan(0);
      expect(balance.fire.combined).toBeGreaterThan(0);
    });

    it('should count earth signs correctly', () => {
      const chart1 = [createMockPlanet('Sun', 'Taurus', 45)];
      const chart2 = [createMockPlanet('Moon', 'Virgo', 165)];

      const balance = calculateElementBalance(chart1, chart2);

      expect(balance.earth.person1).toBeGreaterThan(0);
      expect(balance.earth.person2).toBeGreaterThan(0);
    });

    it('should identify complementary elements (fire-air)', () => {
      const chart1 = [
        createMockPlanet('Sun', 'Aries', 15),
        createMockPlanet('Moon', 'Leo', 135),
        createMockPlanet('Venus', 'Sagittarius', 255),
      ];
      const chart2 = [
        createMockPlanet('Sun', 'Gemini', 75),
        createMockPlanet('Moon', 'Libra', 195),
        createMockPlanet('Venus', 'Aquarius', 315),
      ];

      const balance = calculateElementBalance(chart1, chart2);

      expect(balance.compatibility).toBe('complementary');
    });

    it('should identify similar elements', () => {
      const chart1 = [
        createMockPlanet('Sun', 'Aries', 15),
        createMockPlanet('Moon', 'Leo', 135),
      ];
      const chart2 = [
        createMockPlanet('Sun', 'Aries', 20),
        createMockPlanet('Moon', 'Sagittarius', 260),
      ];

      const balance = calculateElementBalance(chart1, chart2);

      expect(balance.compatibility).toBe('similar');
    });
  });

  describe('calculateModalityBalance', () => {
    it('should count cardinal signs correctly', () => {
      const chart1 = [
        createMockPlanet('Sun', 'Aries', 15),
        createMockPlanet('Moon', 'Cancer', 105),
      ];
      const chart2 = [createMockPlanet('Venus', 'Libra', 195)];

      const balance = calculateModalityBalance(chart1, chart2);

      expect(balance.cardinal.person1).toBeGreaterThan(0);
      expect(balance.cardinal.person2).toBeGreaterThan(0);
    });

    it('should count fixed signs correctly', () => {
      const chart1 = [createMockPlanet('Sun', 'Taurus', 45)];
      const chart2 = [createMockPlanet('Moon', 'Leo', 135)];

      const balance = calculateModalityBalance(chart1, chart2);

      expect(balance.fixed.person1).toBeGreaterThan(0);
      expect(balance.fixed.person2).toBeGreaterThan(0);
    });

    it('should count mutable signs correctly', () => {
      const chart1 = [createMockPlanet('Sun', 'Gemini', 75)];
      const chart2 = [createMockPlanet('Moon', 'Virgo', 165)];

      const balance = calculateModalityBalance(chart1, chart2);

      expect(balance.mutable.person1).toBeGreaterThan(0);
      expect(balance.mutable.person2).toBeGreaterThan(0);
    });
  });

  describe('calculateCompatibilityScore', () => {
    it('should return score between 0 and 100', () => {
      const aspects = [
        {
          person1Planet: 'Sun',
          person2Planet: 'Moon',
          aspectType: 'conjunction',
          orb: 2,
          person1Sign: 'Aries',
          person2Sign: 'Aries',
          isHarmonious: true,
          weight: 100,
        },
      ];
      const elementBalance = {
        fire: { person1: 10, person2: 10, combined: 20 },
        earth: { person1: 5, person2: 5, combined: 10 },
        air: { person1: 3, person2: 3, combined: 6 },
        water: { person1: 2, person2: 2, combined: 4 },
        compatibility: 'similar' as const,
      };
      const modalityBalance = {
        cardinal: { person1: 10, person2: 10, combined: 20 },
        fixed: { person1: 5, person2: 5, combined: 10 },
        mutable: { person1: 5, person2: 5, combined: 10 },
        compatibility: 'similar' as const,
      };

      const score = calculateCompatibilityScore(
        aspects,
        elementBalance,
        modalityBalance,
      );

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should increase score for harmonious aspects', () => {
      const harmoniousAspects = [
        {
          person1Planet: 'Sun',
          person2Planet: 'Moon',
          aspectType: 'trine',
          orb: 1,
          person1Sign: 'Aries',
          person2Sign: 'Leo',
          isHarmonious: true,
          weight: 100,
        },
      ];
      const challengingAspects = [
        {
          person1Planet: 'Sun',
          person2Planet: 'Moon',
          aspectType: 'square',
          orb: 1,
          person1Sign: 'Aries',
          person2Sign: 'Cancer',
          isHarmonious: false,
          weight: 100,
        },
      ];
      const neutralBalance = {
        fire: { person1: 5, person2: 5, combined: 10 },
        earth: { person1: 5, person2: 5, combined: 10 },
        air: { person1: 5, person2: 5, combined: 10 },
        water: { person1: 5, person2: 5, combined: 10 },
        compatibility: 'similar' as const,
      };
      const neutralModality = {
        cardinal: { person1: 7, person2: 7, combined: 14 },
        fixed: { person1: 7, person2: 7, combined: 14 },
        mutable: { person1: 6, person2: 6, combined: 12 },
        compatibility: 'similar' as const,
      };

      const harmoniousScore = calculateCompatibilityScore(
        harmoniousAspects,
        neutralBalance,
        neutralModality,
      );
      const challengingScore = calculateCompatibilityScore(
        challengingAspects,
        neutralBalance,
        neutralModality,
      );

      expect(harmoniousScore).toBeGreaterThan(challengingScore);
    });

    it('should increase score for complementary elements', () => {
      const aspects: any[] = [];
      const complementaryBalance = {
        fire: { person1: 20, person2: 0, combined: 20 },
        earth: { person1: 0, person2: 0, combined: 0 },
        air: { person1: 0, person2: 20, combined: 20 },
        water: { person1: 0, person2: 0, combined: 0 },
        compatibility: 'complementary' as const,
      };
      const challengingBalance = {
        fire: { person1: 20, person2: 0, combined: 20 },
        earth: { person1: 0, person2: 0, combined: 0 },
        air: { person1: 0, person2: 0, combined: 0 },
        water: { person1: 0, person2: 20, combined: 20 },
        compatibility: 'challenging' as const,
      };
      const neutralModality = {
        cardinal: { person1: 7, person2: 7, combined: 14 },
        fixed: { person1: 7, person2: 7, combined: 14 },
        mutable: { person1: 6, person2: 6, combined: 12 },
        compatibility: 'similar' as const,
      };

      const complementaryScore = calculateCompatibilityScore(
        aspects,
        complementaryBalance,
        neutralModality,
      );
      const challengingScore = calculateCompatibilityScore(
        aspects,
        challengingBalance,
        neutralModality,
      );

      expect(complementaryScore).toBeGreaterThan(challengingScore);
    });
  });

  describe('generateSynastryAnalysis', () => {
    it('should generate summary for high compatibility', () => {
      const aspects = [
        {
          person1Planet: 'Sun',
          person2Planet: 'Moon',
          aspectType: 'conjunction',
          orb: 2,
          person1Sign: 'Aries',
          person2Sign: 'Aries',
          isHarmonious: true,
          weight: 100,
        },
      ];
      const elementBalance = {
        fire: { person1: 10, person2: 10, combined: 20 },
        earth: { person1: 5, person2: 5, combined: 10 },
        air: { person1: 3, person2: 3, combined: 6 },
        water: { person1: 2, person2: 2, combined: 4 },
        compatibility: 'complementary' as const,
      };
      const modalityBalance = {
        cardinal: { person1: 10, person2: 10, combined: 20 },
        fixed: { person1: 5, person2: 5, combined: 10 },
        mutable: { person1: 5, person2: 5, combined: 10 },
        compatibility: 'similar' as const,
      };

      const summary = generateSynastryAnalysis(
        aspects,
        elementBalance,
        modalityBalance,
        85,
      );

      expect(summary).toContain('harmony');
      expect(summary).toContain('Key connections');
    });

    it('should generate summary for low compatibility', () => {
      const aspects: any[] = [];
      const elementBalance = {
        fire: { person1: 10, person2: 0, combined: 10 },
        earth: { person1: 0, person2: 10, combined: 10 },
        air: { person1: 0, person2: 0, combined: 0 },
        water: { person1: 0, person2: 0, combined: 0 },
        compatibility: 'challenging' as const,
      };
      const modalityBalance = {
        cardinal: { person1: 10, person2: 10, combined: 20 },
        fixed: { person1: 0, person2: 0, combined: 0 },
        mutable: { person1: 0, person2: 0, combined: 0 },
        compatibility: 'similar' as const,
      };

      const summary = generateSynastryAnalysis(
        aspects,
        elementBalance,
        modalityBalance,
        30,
      );

      expect(summary).toContain('growth');
    });
  });

  describe('calculateSynastry (integration)', () => {
    it('should return complete synastry result', () => {
      const chart1 = [
        createMockPlanet('Sun', 'Aries', 15),
        createMockPlanet('Moon', 'Cancer', 105),
        createMockPlanet('Venus', 'Taurus', 50),
        createMockPlanet('Mars', 'Leo', 140),
        createMockPlanet('Mercury', 'Aries', 20),
      ];
      const chart2 = [
        createMockPlanet('Sun', 'Libra', 195),
        createMockPlanet('Moon', 'Aries', 18),
        createMockPlanet('Venus', 'Virgo', 170),
        createMockPlanet('Mars', 'Sagittarius', 260),
        createMockPlanet('Mercury', 'Libra', 200),
      ];

      const result = calculateSynastry(chart1, chart2);

      expect(result).toHaveProperty('aspects');
      expect(result).toHaveProperty('elementBalance');
      expect(result).toHaveProperty('modalityBalance');
      expect(result).toHaveProperty('compatibilityScore');
      expect(result).toHaveProperty('summary');

      expect(Array.isArray(result.aspects)).toBe(true);
      expect(typeof result.compatibilityScore).toBe('number');
      expect(result.compatibilityScore).toBeGreaterThanOrEqual(0);
      expect(result.compatibilityScore).toBeLessThanOrEqual(100);
      expect(typeof result.summary).toBe('string');
      expect(result.summary.length).toBeGreaterThan(0);
    });

    it('should handle empty charts gracefully', () => {
      const chart1: BirthChartData[] = [];
      const chart2: BirthChartData[] = [];

      const result = calculateSynastry(chart1, chart2);

      expect(result.aspects).toEqual([]);
      expect(result.compatibilityScore).toBeGreaterThanOrEqual(0);
      expect(result.compatibilityScore).toBeLessThanOrEqual(100);
    });
  });
});
