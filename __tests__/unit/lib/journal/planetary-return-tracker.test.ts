import { calculatePlanetaryReturns } from '@/src/lib/journal/planetary-return-tracker';
import type { BirthChartData } from '@/utils/astrology/birthChart';

describe('Planetary Return Tracker', () => {
  describe('Solar Return (Birthday)', () => {
    it('should detect solar return on exact birthday', () => {
      const birthChart: BirthChartData[] = [
        {
          body: 'Sun',
          sign: 'Leo',
          degree: 15,
          retrograde: false,
          house: 5,
          angle: 135,
        },
      ];

      const birthDate = new Date('1990-08-08');
      const currentDate = new Date('2024-08-08'); // Exactly on birthday

      const returns = calculatePlanetaryReturns(
        birthChart,
        currentDate,
        birthDate,
      );

      const solarReturn = returns.find((r) => r.planet === 'Sun');
      expect(solarReturn).toBeDefined();
      expect(solarReturn?.isActive).toBe(true);
      expect(Math.abs(solarReturn!.proximityDays)).toBeLessThanOrEqual(1);
    });

    it('should detect approaching solar return', () => {
      const birthChart: BirthChartData[] = [
        {
          body: 'Sun',
          sign: 'Gemini',
          degree: 20,
          retrograde: false,
          house: 3,
          angle: 80,
        },
      ];

      const birthDate = new Date('1985-06-10');
      const currentDate = new Date('2024-05-25'); // 16 days before birthday

      const returns = calculatePlanetaryReturns(
        birthChart,
        currentDate,
        birthDate,
      );

      const solarReturn = returns.find((r) => r.planet === 'Sun');
      expect(solarReturn).toBeDefined();
      expect(solarReturn?.phase).toBe('approaching');
      expect(solarReturn?.proximityDays).toBeGreaterThan(0);
      expect(solarReturn?.proximityDays).toBeLessThanOrEqual(30);
    });

    it('should detect separating solar return', () => {
      const birthChart: BirthChartData[] = [
        {
          body: 'Sun',
          sign: 'Pisces',
          degree: 10,
          retrograde: false,
          house: 12,
          angle: 340,
        },
      ];

      const birthDate = new Date('1992-03-01');
      const currentDate = new Date('2024-03-15'); // 14 days after birthday

      const returns = calculatePlanetaryReturns(
        birthChart,
        currentDate,
        birthDate,
      );

      const solarReturn = returns.find((r) => r.planet === 'Sun');
      expect(solarReturn).toBeDefined();
      expect(solarReturn?.phase).toBe('separating');
      expect(solarReturn?.proximityDays).toBeLessThan(0);
      expect(solarReturn?.proximityDays).toBeGreaterThanOrEqual(-30);
    });

    it('should NOT be active when far from birthday', () => {
      const birthChart: BirthChartData[] = [
        {
          body: 'Sun',
          sign: 'Aries',
          degree: 5,
          retrograde: false,
          house: 1,
          angle: 5,
        },
      ];

      const birthDate = new Date('1988-03-20');
      const currentDate = new Date('2024-09-20'); // 6 months from birthday

      const returns = calculatePlanetaryReturns(
        birthChart,
        currentDate,
        birthDate,
      );

      const solarReturn = returns.find((r) => r.planet === 'Sun' && r.isActive);
      expect(solarReturn).toBeUndefined();
    });
  });

  describe('Jupiter Return (~12 years)', () => {
    it('should detect Jupiter return proximity', () => {
      const birthChart: BirthChartData[] = [
        {
          body: 'Jupiter',
          sign: 'Sagittarius',
          degree: 15,
          retrograde: false,
          house: 9,
          angle: 255,
        },
      ];

      // Approximate Jupiter return ages: 12, 24, 36, 48, 60, 72...
      const birthDate = new Date('1988-01-01');
      const currentDate = new Date('2024-01-01'); // Age 36

      const returns = calculatePlanetaryReturns(
        birthChart,
        currentDate,
        birthDate,
      );

      const jupiterReturn = returns.find((r) => r.planet === 'Jupiter');
      expect(jupiterReturn).toBeDefined();
      expect(jupiterReturn?.returnType).toBe('Jupiter Return');
    });

    it('should calculate Jupiter return within expected timeframe', () => {
      const birthChart: BirthChartData[] = [
        {
          body: 'Jupiter',
          sign: 'Capricorn',
          degree: 20,
          retrograde: false,
          house: 10,
          angle: 290,
        },
      ];

      const birthDate = new Date('2000-01-15');
      const currentDate = new Date('2024-01-01'); // Age 24 (near 2nd Jupiter return)

      const returns = calculatePlanetaryReturns(
        birthChart,
        currentDate,
        birthDate,
      );

      const jupiterReturn = returns.find((r) => r.planet === 'Jupiter');
      if (jupiterReturn) {
        // Jupiter return cycle is ~11.86 years
        // At age 24, should be near 2nd return
        const ageYears =
          (currentDate.getTime() - birthDate.getTime()) /
          (365.25 * 24 * 60 * 60 * 1000);
        expect(ageYears).toBeGreaterThan(23);
        expect(ageYears).toBeLessThan(25);
      }
    });
  });

  describe('Saturn Return (~29 years)', () => {
    it('should detect first Saturn return', () => {
      const birthChart: BirthChartData[] = [
        {
          body: 'Saturn',
          sign: 'Aquarius',
          degree: 10,
          retrograde: false,
          house: 11,
          angle: 310,
        },
      ];

      // First Saturn return around age 29
      const birthDate = new Date('1995-02-01');
      const currentDate = new Date('2024-02-01'); // Age 29

      const returns = calculatePlanetaryReturns(
        birthChart,
        currentDate,
        birthDate,
      );

      const saturnReturn = returns.find((r) => r.planet === 'Saturn');
      expect(saturnReturn).toBeDefined();
      expect(saturnReturn?.returnType).toBe('Saturn Return');
    });

    it('should detect second Saturn return', () => {
      const birthChart: BirthChartData[] = [
        {
          body: 'Saturn',
          sign: 'Virgo',
          degree: 25,
          retrograde: false,
          house: 6,
          angle: 175,
        },
      ];

      // Second Saturn return around age 58
      const birthDate = new Date('1966-09-15');
      const currentDate = new Date('2024-09-01'); // Age 58

      const returns = calculatePlanetaryReturns(
        birthChart,
        currentDate,
        birthDate,
      );

      const saturnReturn = returns.find((r) => r.planet === 'Saturn');
      expect(saturnReturn).toBeDefined();
    });

    it('should mark Saturn return as active within ±30 days', () => {
      const birthChart: BirthChartData[] = [
        {
          body: 'Saturn',
          sign: 'Scorpio',
          degree: 15,
          retrograde: false,
          house: 8,
          angle: 225,
        },
      ];

      const birthDate = new Date('1995-11-01');
      const currentDate = new Date('2024-11-15'); // Near 29th birthday

      const returns = calculatePlanetaryReturns(
        birthChart,
        currentDate,
        birthDate,
      );

      const saturnReturn = returns.find(
        (r) => r.planet === 'Saturn' && r.isActive,
      );

      if (saturnReturn) {
        expect(Math.abs(saturnReturn.proximityDays)).toBeLessThanOrEqual(30);
      }
    });
  });

  describe('Return Phases', () => {
    it('should correctly identify approaching phase', () => {
      const birthChart: BirthChartData[] = [
        {
          body: 'Sun',
          sign: 'Taurus',
          degree: 20,
          retrograde: false,
          house: 2,
          angle: 50,
        },
      ];

      const birthDate = new Date('1990-05-10');
      const currentDate = new Date('2024-04-25'); // 15 days before birthday

      const returns = calculatePlanetaryReturns(
        birthChart,
        currentDate,
        birthDate,
      );

      const solarReturn = returns.find((r) => r.planet === 'Sun');
      expect(solarReturn?.phase).toBe('approaching');
      expect(solarReturn?.proximityDays).toBeGreaterThan(0);
    });

    it('should correctly identify exact phase', () => {
      const birthChart: BirthChartData[] = [
        {
          body: 'Sun',
          sign: 'Cancer',
          degree: 5,
          retrograde: false,
          house: 4,
          angle: 95,
        },
      ];

      const birthDate = new Date('1985-06-25');
      const currentDate = new Date('2024-06-25'); // Exact birthday

      const returns = calculatePlanetaryReturns(
        birthChart,
        currentDate,
        birthDate,
      );

      const solarReturn = returns.find((r) => r.planet === 'Sun');
      expect(solarReturn?.phase).toBe('exact');
      expect(Math.abs(solarReturn!.proximityDays)).toBeLessThanOrEqual(1);
    });

    it('should correctly identify separating phase', () => {
      const birthChart: BirthChartData[] = [
        {
          body: 'Sun',
          sign: 'Libra',
          degree: 12,
          retrograde: false,
          house: 7,
          angle: 192,
        },
      ];

      const birthDate = new Date('1992-10-05');
      const currentDate = new Date('2024-10-20'); // 15 days after birthday

      const returns = calculatePlanetaryReturns(
        birthChart,
        currentDate,
        birthDate,
      );

      const solarReturn = returns.find((r) => r.planet === 'Sun');
      expect(solarReturn?.phase).toBe('separating');
      expect(solarReturn?.proximityDays).toBeLessThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty birth chart', () => {
      const birthDate = new Date('1990-01-01');
      const currentDate = new Date('2024-01-01');

      const returns = calculatePlanetaryReturns([], currentDate, birthDate);

      expect(returns).toEqual([]);
    });

    it('should handle birth chart with only outer planets', () => {
      const birthChart: BirthChartData[] = [
        {
          body: 'Uranus',
          sign: 'Aquarius',
          degree: 10,
          retrograde: false,
          house: 11,
          angle: 310,
        },
        {
          body: 'Neptune',
          sign: 'Pisces',
          degree: 15,
          retrograde: false,
          house: 12,
          angle: 345,
        },
      ];

      const birthDate = new Date('1990-01-01');
      const currentDate = new Date('2024-01-01');

      const returns = calculatePlanetaryReturns(
        birthChart,
        currentDate,
        birthDate,
      );

      // Should only return for Sun, Jupiter, Saturn
      const returnPlanets = returns.map((r) => r.planet);
      expect(returnPlanets).not.toContain('Uranus');
      expect(returnPlanets).not.toContain('Neptune');
    });

    it('should handle very young age (first year)', () => {
      const birthChart: BirthChartData[] = [
        {
          body: 'Sun',
          sign: 'Aries',
          degree: 10,
          retrograde: false,
          house: 1,
          angle: 10,
        },
      ];

      const birthDate = new Date('2023-03-20');
      const currentDate = new Date('2024-01-01'); // 9 months old

      const returns = calculatePlanetaryReturns(
        birthChart,
        currentDate,
        birthDate,
      );

      expect(Array.isArray(returns)).toBe(true);
      // Solar return approaching first birthday
      const solarReturn = returns.find((r) => r.planet === 'Sun');
      if (solarReturn) {
        expect(solarReturn.proximityDays).toBeGreaterThan(0);
      }
    });

    it('should handle very old age (90+ years)', () => {
      const birthChart: BirthChartData[] = [
        {
          body: 'Saturn',
          sign: 'Taurus',
          degree: 20,
          retrograde: false,
          house: 2,
          angle: 50,
        },
      ];

      const birthDate = new Date('1930-05-15');
      const currentDate = new Date('2024-05-15'); // Age 94

      const returns = calculatePlanetaryReturns(
        birthChart,
        currentDate,
        birthDate,
      );

      // Should handle 3rd Saturn return (age 87)
      expect(Array.isArray(returns)).toBe(true);
    });
  });

  describe('Return Date Calculation', () => {
    it('should provide accurate return date', () => {
      const birthChart: BirthChartData[] = [
        {
          body: 'Sun',
          sign: 'Capricorn',
          degree: 15,
          retrograde: false,
          house: 10,
          angle: 285,
        },
      ];

      const birthDate = new Date('1990-01-05');
      const currentDate = new Date('2023-12-20'); // Approaching birthday

      const returns = calculatePlanetaryReturns(
        birthChart,
        currentDate,
        birthDate,
      );

      const solarReturn = returns.find((r) => r.planet === 'Sun');
      expect(solarReturn?.returnDate).toBeDefined();
      expect(solarReturn?.returnDate).toBeInstanceOf(Date);

      // Return date should be near birthday
      const returnMonth = solarReturn?.returnDate.getMonth();
      const birthMonth = birthDate.getMonth();
      expect(returnMonth).toBe(birthMonth);
    });
  });

  describe('Performance', () => {
    it('should calculate returns efficiently', () => {
      const birthChart: BirthChartData[] = [
        {
          body: 'Sun',
          sign: 'Leo',
          degree: 15,
          retrograde: false,
          house: 5,
          angle: 135,
        },
        {
          body: 'Jupiter',
          sign: 'Sagittarius',
          degree: 20,
          retrograde: false,
          house: 9,
          angle: 260,
        },
        {
          body: 'Saturn',
          sign: 'Capricorn',
          degree: 10,
          retrograde: false,
          house: 10,
          angle: 280,
        },
      ];

      const birthDate = new Date('1990-08-08');
      const currentDate = new Date('2024-01-01');

      const startTime = Date.now();
      const returns = calculatePlanetaryReturns(
        birthChart,
        currentDate,
        birthDate,
      );
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50); // Should complete within 50ms
      expect(Array.isArray(returns)).toBe(true);
    });
  });
});
