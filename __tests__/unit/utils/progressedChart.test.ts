import { calculateProgressedChart } from '@/utils/astrology/progressedChart';

describe('Progressed Chart Calculations', () => {
  describe('Secondary Progressions Formula', () => {
    it('should calculate progressed positions using 1 day = 1 year formula', async () => {
      const birthDate = new Date('1980-01-01');
      const currentDate = new Date('2024-01-01'); // 44 years later

      const result = await calculateProgressedChart(birthDate, currentDate);

      expect(result.yearsSinceBirth).toBeCloseTo(44, 1);
      expect(result.progressionDate).toBeDefined();
      expect(result.progressedSun).toBeDefined();
      expect(result.progressedMoon).toBeDefined();
    });

    it('should handle fractional years correctly', async () => {
      const birthDate = new Date('1990-06-15');
      const currentDate = new Date('2024-12-15'); // 34.5 years later

      const result = await calculateProgressedChart(birthDate, currentDate);

      expect(result.yearsSinceBirth).toBeGreaterThan(34);
      expect(result.yearsSinceBirth).toBeLessThan(35);
    });

    it('should calculate progression date correctly', async () => {
      const birthDate = new Date('1985-03-20');
      const currentDate = new Date('2015-03-20'); // Exactly 30 years later

      const result = await calculateProgressedChart(birthDate, currentDate);

      // 30 years of life = 30 days after birth
      const expectedProgressionDate = new Date('1985-04-19'); // ~30 days after birth
      const actualProgressionDate = new Date(result.progressionDate);

      // Allow 1 day tolerance due to leap years
      const daysDiff = Math.abs(
        (actualProgressionDate.getTime() - expectedProgressionDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      expect(daysDiff).toBeLessThanOrEqual(1);
    });
  });

  describe('Progressed Sun', () => {
    it('should return progressed Sun sign and degree', async () => {
      const birthDate = new Date('1980-01-01');
      const currentDate = new Date('2024-01-01');

      const result = await calculateProgressedChart(birthDate, currentDate);

      expect(result.progressedSun.sign).toBeDefined();
      expect(typeof result.progressedSun.sign).toBe('string');
      expect(result.progressedSun.degree).toBeGreaterThanOrEqual(0);
      expect(result.progressedSun.degree).toBeLessThan(30);
    });

    it('should include minutes for progressed Sun', async () => {
      const birthDate = new Date('1990-05-15');
      const currentDate = new Date('2024-05-15');

      const result = await calculateProgressedChart(birthDate, currentDate);

      expect(result.progressedSun.minute).toBeGreaterThanOrEqual(0);
      expect(result.progressedSun.minute).toBeLessThan(60);
    });
  });

  describe('Progressed Moon', () => {
    it('should return progressed Moon sign and degree', async () => {
      const birthDate = new Date('1980-01-01');
      const currentDate = new Date('2024-01-01');

      const result = await calculateProgressedChart(birthDate, currentDate);

      expect(result.progressedMoon.sign).toBeDefined();
      expect(typeof result.progressedMoon.sign).toBe('string');
      expect(result.progressedMoon.degree).toBeGreaterThanOrEqual(0);
      expect(result.progressedMoon.degree).toBeLessThan(30);
    });

    it('should include moon cycle phase description', async () => {
      const birthDate = new Date('1990-01-01');
      const currentDate = new Date('2024-01-01');

      const result = await calculateProgressedChart(birthDate, currentDate);

      expect(result.progressedMoon.moonPhaseInCycle).toBeDefined();
      expect(typeof result.progressedMoon.moonPhaseInCycle).toBe('string');
      expect(result.progressedMoon.moonPhaseInCycle.length).toBeGreaterThan(0);
    });

    it('should have different moon cycle phases for different ages', async () => {
      const birthDate = new Date('1990-01-01');

      // Age 5 (first quarter)
      const young = await calculateProgressedChart(
        birthDate,
        new Date('1995-01-01'),
      );

      // Age 15 (third quarter)
      const teen = await calculateProgressedChart(
        birthDate,
        new Date('2005-01-01'),
      );

      expect(young.progressedMoon.moonPhaseInCycle).toContain('First Quarter');
      expect(teen.progressedMoon.moonPhaseInCycle).toContain('Third Quarter');
    });
  });

  describe('Personal Planets', () => {
    it('should include progressed Mercury if available', async () => {
      const birthDate = new Date('1980-01-01');
      const currentDate = new Date('2024-01-01');

      const result = await calculateProgressedChart(birthDate, currentDate);

      if (result.progressedMercury) {
        expect(result.progressedMercury.sign).toBeDefined();
        expect(result.progressedMercury.degree).toBeGreaterThanOrEqual(0);
        expect(result.progressedMercury.degree).toBeLessThan(30);
      }
    });

    it('should include progressed Venus if available', async () => {
      const birthDate = new Date('1980-01-01');
      const currentDate = new Date('2024-01-01');

      const result = await calculateProgressedChart(birthDate, currentDate);

      if (result.progressedVenus) {
        expect(result.progressedVenus.sign).toBeDefined();
        expect(result.progressedVenus.degree).toBeGreaterThanOrEqual(0);
        expect(result.progressedVenus.degree).toBeLessThan(30);
      }
    });

    it('should include progressed Mars if available', async () => {
      const birthDate = new Date('1980-01-01');
      const currentDate = new Date('2024-01-01');

      const result = await calculateProgressedChart(birthDate, currentDate);

      if (result.progressedMars) {
        expect(result.progressedMars.sign).toBeDefined();
        expect(result.progressedMars.degree).toBeGreaterThanOrEqual(0);
        expect(result.progressedMars.degree).toBeLessThan(30);
      }
    });
  });

  describe('Description Generation', () => {
    it('should generate a description string', async () => {
      const birthDate = new Date('1980-01-01');
      const currentDate = new Date('2024-01-01');

      const result = await calculateProgressedChart(birthDate, currentDate);

      expect(result.description).toBeDefined();
      expect(typeof result.description).toBe('string');
      expect(result.description).toContain('Progressed Sun');
      expect(result.description).toContain('Progressed Moon');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very young ages (< 1 year)', async () => {
      const birthDate = new Date('2023-06-15');
      const currentDate = new Date('2024-01-01');

      const result = await calculateProgressedChart(birthDate, currentDate);

      expect(result.yearsSinceBirth).toBeGreaterThan(0);
      expect(result.yearsSinceBirth).toBeLessThan(1);
      expect(result.progressedSun).toBeDefined();
    });

    it('should handle very old ages (90+ years)', async () => {
      const birthDate = new Date('1930-01-01');
      const currentDate = new Date('2024-01-01');

      const result = await calculateProgressedChart(birthDate, currentDate);

      expect(result.yearsSinceBirth).toBeGreaterThan(90);
      expect(result.progressedSun).toBeDefined();
      expect(result.progressedMoon).toBeDefined();
    });

    it('should handle exact birthday (0 years)', async () => {
      const birthDate = new Date('2024-01-01');
      const currentDate = new Date('2024-01-01');

      const result = await calculateProgressedChart(birthDate, currentDate);

      expect(result.yearsSinceBirth).toBeCloseTo(0, 1);
      expect(result.progressedSun).toBeDefined();
    });
  });
});
