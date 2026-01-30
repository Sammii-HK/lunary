import {
  getUpcomingEclipses,
  checkEclipseRelevance,
} from '@/utils/astrology/eclipseTracker';
import type { BirthChartData } from '@/utils/astrology/birthChart';

describe('Eclipse Tracking', () => {
  describe('getUpcomingEclipses', () => {
    it('should return array of eclipses', () => {
      const eclipses = getUpcomingEclipses(new Date('2026-01-01'), 6);

      expect(Array.isArray(eclipses)).toBe(true);
      expect(eclipses.length).toBeGreaterThan(0);
    });

    it('should include both solar and lunar eclipses', () => {
      const eclipses = getUpcomingEclipses(new Date('2026-01-01'), 12);

      const solarEclipses = eclipses.filter((e) => e.kind === 'solar');
      const lunarEclipses = eclipses.filter((e) => e.kind === 'lunar');

      expect(solarEclipses.length).toBeGreaterThan(0);
      expect(lunarEclipses.length).toBeGreaterThan(0);
    });

    it('should include required eclipse properties', () => {
      const eclipses = getUpcomingEclipses(new Date('2026-01-01'), 6);

      eclipses.forEach((eclipse) => {
        expect(eclipse.peak).toBeDefined();
        expect(eclipse.kind).toBeDefined();
        expect(['solar', 'lunar']).toContain(eclipse.kind);
        expect(eclipse.obscuration).toBeGreaterThanOrEqual(0);
        expect(eclipse.obscuration).toBeLessThanOrEqual(1);
        expect(eclipse.eclipticLongitude).toBeGreaterThanOrEqual(0);
        expect(eclipse.eclipticLongitude).toBeLessThan(360);
        expect(eclipse.sign).toBeDefined();
      });
    });

    it('should handle different month ranges', () => {
      const shortRange = getUpcomingEclipses(new Date('2026-01-01'), 3);
      const longRange = getUpcomingEclipses(new Date('2026-01-01'), 12);

      expect(longRange.length).toBeGreaterThanOrEqual(shortRange.length);
    });

    it('should return eclipses in chronological order', () => {
      const eclipses = getUpcomingEclipses(new Date('2026-01-01'), 12);

      for (let i = 1; i < eclipses.length; i++) {
        expect(eclipses[i].peak.getTime()).toBeGreaterThan(
          eclipses[i - 1].peak.getTime(),
        );
      }
    });
  });

  describe('checkEclipseRelevance', () => {
    // Sample natal chart for testing
    const sampleBirthChart: BirthChartData[] = [
      {
        body: 'Sun',
        sign: 'Aries',
        degree: 15.5,
        retrograde: false,
        house: 10,
        angle: 15.5,
      },
      {
        body: 'Moon',
        sign: 'Cancer',
        degree: 22.3,
        retrograde: false,
        house: 1,
        angle: 112.3,
      },
      {
        body: 'Mercury',
        sign: 'Pisces',
        degree: 28.8,
        retrograde: false,
        house: 9,
        angle: 358.8,
      },
    ];

    it('should detect relevance when eclipse aspects natal planet', () => {
      const eclipses = getUpcomingEclipses(new Date('2026-01-01'), 12);

      // Find an eclipse in Aries (close to natal Sun at 15° Aries)
      const ariesEclipse = eclipses.find(
        (e) => e.sign === 'Aries' && Math.abs(e.eclipticLongitude - 15.5) < 3, // Within 3° orb
      );

      if (ariesEclipse) {
        const relevance = checkEclipseRelevance(ariesEclipse, sampleBirthChart);

        expect(relevance.isRelevant).toBe(true);
        expect(relevance.affectedPlanets).toContain('Sun');
        expect(relevance.closestAspect).toBeDefined();
        expect(relevance.closestAspect?.planet).toBe('Sun');
      }
    });

    it('should return isRelevant = false when no natal planets aspected', () => {
      // Create an eclipse far from any natal planets
      const eclipses = getUpcomingEclipses(new Date('2026-01-01'), 12);

      // Find eclipse that doesn't aspect our sample chart
      const distantEclipse = eclipses.find((e) => {
        return sampleBirthChart.every((planet) => {
          const eclipseDegree = e.eclipticLongitude;
          const planetDegree = planet.angle;
          const orb = Math.abs(eclipseDegree - planetDegree);
          return orb > 3 && orb < 357; // Not within 3° orb
        });
      });

      if (distantEclipse) {
        const relevance = checkEclipseRelevance(
          distantEclipse,
          sampleBirthChart,
        );

        expect(relevance.isRelevant).toBe(false);
        expect(relevance.affectedPlanets).toHaveLength(0);
      }
    });

    it('should calculate orb correctly', () => {
      const eclipses = getUpcomingEclipses(new Date('2026-01-01'), 12);

      const relevantEclipses = eclipses
        .map((e) => ({
          eclipse: e,
          relevance: checkEclipseRelevance(e, sampleBirthChart),
        }))
        .filter((r) => r.relevance.isRelevant);

      relevantEclipses.forEach(({ relevance }) => {
        if (relevance.closestAspect) {
          expect(relevance.closestAspect.orb).toBeGreaterThanOrEqual(0);
          expect(relevance.closestAspect.orb).toBeLessThanOrEqual(3);
        }
      });
    });

    it('should handle multiple affected planets', () => {
      // Create chart with planets close together
      const clusteredChart: BirthChartData[] = [
        {
          body: 'Sun',
          sign: 'Aries',
          degree: 15,
          retrograde: false,
          house: 10,
          angle: 15,
        },
        {
          body: 'Mercury',
          sign: 'Aries',
          degree: 16,
          retrograde: false,
          house: 10,
          angle: 16,
        },
        {
          body: 'Venus',
          sign: 'Aries',
          degree: 14,
          retrograde: false,
          house: 10,
          angle: 14,
        },
      ];

      const eclipses = getUpcomingEclipses(new Date('2026-01-01'), 12);

      const ariesEclipse = eclipses.find(
        (e) => e.sign === 'Aries' && Math.abs(e.eclipticLongitude - 15) < 3,
      );

      if (ariesEclipse) {
        const relevance = checkEclipseRelevance(ariesEclipse, clusteredChart);

        if (relevance.isRelevant) {
          expect(relevance.affectedPlanets.length).toBeGreaterThanOrEqual(1);
        }
      }
    });

    it('should handle empty birth chart gracefully', () => {
      const eclipses = getUpcomingEclipses(new Date('2026-01-01'), 6);

      if (eclipses.length > 0) {
        const relevance = checkEclipseRelevance(eclipses[0], []);

        expect(relevance.isRelevant).toBe(false);
        expect(relevance.affectedPlanets).toHaveLength(0);
        expect(relevance.closestAspect).toBeUndefined();
      }
    });
  });

  describe('Eclipse Types', () => {
    it('should include eclipse obscuration percentage', () => {
      const eclipses = getUpcomingEclipses(new Date('2026-01-01'), 12);

      eclipses.forEach((eclipse) => {
        expect(eclipse.obscuration).toBeDefined();
        expect(typeof eclipse.obscuration).toBe('number');
        expect(eclipse.obscuration).toBeGreaterThanOrEqual(0);
        expect(eclipse.obscuration).toBeLessThanOrEqual(1);
      });
    });

    it('should map ecliptic longitude to zodiac sign correctly', () => {
      const eclipses = getUpcomingEclipses(new Date('2026-01-01'), 12);

      const zodiacSigns = [
        'Aries',
        'Taurus',
        'Gemini',
        'Cancer',
        'Leo',
        'Virgo',
        'Libra',
        'Scorpio',
        'Sagittarius',
        'Capricorn',
        'Aquarius',
        'Pisces',
      ];

      eclipses.forEach((eclipse) => {
        expect(zodiacSigns).toContain(eclipse.sign);

        // Verify longitude matches sign
        const signIndex = zodiacSigns.indexOf(eclipse.sign);
        const expectedMinLongitude = signIndex * 30;
        const expectedMaxLongitude = (signIndex + 1) * 30;

        expect(eclipse.eclipticLongitude).toBeGreaterThanOrEqual(
          expectedMinLongitude,
        );
        expect(eclipse.eclipticLongitude).toBeLessThan(expectedMaxLongitude);
      });
    });
  });

  describe('Performance', () => {
    it('should calculate eclipses within reasonable time', () => {
      const startTime = Date.now();
      getUpcomingEclipses(new Date('2026-01-01'), 12);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle relevance check efficiently', () => {
      const eclipses = getUpcomingEclipses(new Date('2026-01-01'), 6);
      const birthChart = Array(10).fill({
        body: 'Planet',
        sign: 'Aries',
        degree: 15,
        retrograde: false,
        house: 1,
        angle: 15,
      }) as BirthChartData[];

      const startTime = Date.now();
      eclipses.forEach((eclipse) => {
        checkEclipseRelevance(eclipse, birthChart);
      });
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });
  });
});
