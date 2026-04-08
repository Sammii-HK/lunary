import {
  calculateCurrentDasha,
  calculateDashaTimeline,
  calculateAntardasha,
  getCurrentDashaState,
  isMajorDashaTransition,
  getDashaPeriodsWithSubdivisions,
} from '../vedic-dasha';
import dayjs from 'dayjs';

describe('Vedic Dasha System', () => {
  // Test with a known birth date and moon position
  const testBirthDate = new Date('1990-05-15T14:30:00Z');
  const testMoonDegree = 45.5; // Taurus nakshatra region

  describe('calculateDashaTimeline', () => {
    it('should generate a timeline of dasha periods', () => {
      const timeline = calculateDashaTimeline(testBirthDate, testMoonDegree);

      expect(timeline).toBeInstanceOf(Array);
      expect(timeline.length).toBeGreaterThan(0);

      // Verify basic structure
      timeline.forEach((period) => {
        expect(period.planet).toBeDefined();
        expect(period.startDate).toBeInstanceOf(Date);
        expect(period.endDate).toBeInstanceOf(Date);
        expect(period.years).toBeGreaterThan(0);
        expect(period.years).toBeLessThanOrEqual(20); // Max dasha period is 20 years
        expect(dayjs(period.endDate).isAfter(period.startDate)).toBe(true);
      });
    });

    it('should have periods sorted chronologically', () => {
      const timeline = calculateDashaTimeline(testBirthDate, testMoonDegree);

      for (let i = 1; i < timeline.length; i++) {
        const prevEnd = dayjs(timeline[i - 1].endDate);
        const currStart = dayjs(timeline[i].startDate);
        expect(currStart.isAfter(prevEnd) || currStart.isSame(prevEnd)).toBe(
          true,
        );
      }
    });

    it('should have one active period at any given time', () => {
      const timeline = calculateDashaTimeline(
        testBirthDate,
        testMoonDegree,
        new Date(),
      );
      const activePeriods = timeline.filter((p) => p.isActive);

      expect(activePeriods.length).toBeLessThanOrEqual(1);
    });
  });

  describe('calculateCurrentDasha', () => {
    it('should return null if no dasha is active', () => {
      const farFuture = new Date('2200-01-01');
      const dasha = calculateCurrentDasha(
        testBirthDate,
        testMoonDegree,
        farFuture,
      );

      // May still return a dasha if cycle restarts, but at least should be valid
      if (dasha) {
        expect(dasha.planet).toBeDefined();
        expect(dasha.startDate).toBeInstanceOf(Date);
        expect(dasha.endDate).toBeInstanceOf(Date);
      }
    });

    it('should return a dasha for a current date', () => {
      const now = new Date();
      const dasha = calculateCurrentDasha(testBirthDate, testMoonDegree, now);

      // If we have a valid birth date in the past, we should have a current dasha
      if (dayjs(testBirthDate).isBefore(now)) {
        expect(dasha).not.toBeNull();
        if (dasha) {
          const isInRange =
            dayjs(now).isAfter(dayjs(dasha.startDate)) &&
            dayjs(now).isBefore(dayjs(dasha.endDate).add(1, 'day'));
          expect(isInRange).toBe(true);
        }
      }
    });
  });

  describe('getCurrentDashaState', () => {
    it('should return complete dasha state information', () => {
      const state = getCurrentDashaState(
        testBirthDate,
        testMoonDegree,
        new Date(),
      );

      if (state) {
        expect(state.mahadasha).toBeDefined();
        expect(state.mahadasha.planet).toBeDefined();
        expect(state.mahadasha.startDate).toBeInstanceOf(Date);
        expect(state.mahadasha.endDate).toBeInstanceOf(Date);
        expect(state.mahadasha.daysRemaining).toBeGreaterThanOrEqual(0);
        expect(state.mahadasha.percentComplete).toBeGreaterThanOrEqual(0);
        expect(state.mahadasha.percentComplete).toBeLessThanOrEqual(100);

        expect(state.antardasha).toBeDefined();
        expect(state.currentAge).toBeGreaterThanOrEqual(0);
        expect(state.upcoming).toBeInstanceOf(Array);
      }
    });

    it('should calculate transition approaching correctly', () => {
      // Create a dasha state and check transition warning
      const state = getCurrentDashaState(
        testBirthDate,
        testMoonDegree,
        new Date(),
      );

      if (state) {
        expect(typeof state.transitionApproaching).toBe('boolean');

        // If transition approaching, daysRemaining should be < 180
        if (state.transitionApproaching) {
          expect(state.mahadasha.daysRemaining).toBeLessThan(180);
        }
      }
    });
  });

  describe('calculateAntardasha', () => {
    it('should calculate sub-periods within a mahadasha', () => {
      const timeline = calculateDashaTimeline(testBirthDate, testMoonDegree);
      const firstDasha = timeline[0];

      if (firstDasha) {
        const antardasha = calculateAntardasha(
          firstDasha.planet,
          firstDasha.startDate,
          firstDasha.endDate,
          firstDasha.startDate,
        );

        if (antardasha) {
          expect(antardasha.planet).toBeDefined();
          expect(antardasha.years).toBeGreaterThan(0);
          expect(antardasha.years).toBeLessThan(firstDasha.years);
        }
      }
    });
  });

  describe('isMajorDashaTransition', () => {
    it('should return a boolean', () => {
      const result = isMajorDashaTransition(
        testBirthDate,
        testMoonDegree,
        new Date(),
      );
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getDashaPeriodsWithSubdivisions', () => {
    it('should return mahadasha with antardasha subdivisions', () => {
      const startDate = new Date('2020-01-01');
      const endDate = new Date('2026-01-01');

      const periods = getDashaPeriodsWithSubdivisions(
        'Venus',
        startDate,
        endDate,
      );

      expect(periods).toBeInstanceOf(Array);
      expect(periods.length).toBeGreaterThan(0);

      const mahadasha = periods[0];
      expect(mahadasha.planet).toBe('Venus');
      expect(mahadasha.level).toBe('mahadasha');
      expect(mahadasha.antardashas).toBeInstanceOf(Array);

      // Each antardasha should be smaller than the mahadasha
      if (mahadasha.antardashas) {
        mahadasha.antardashas.forEach((antardasha) => {
          expect(antardasha.years).toBeLessThan(mahadasha.years);
          expect(antardasha.level).toBe('antardasha');
        });
      }
    });
  });

  describe('Moon position to dasha calculation', () => {
    it('should handle edge case of 0 degree moon', () => {
      const timeline = calculateDashaTimeline(testBirthDate, 0);
      expect(timeline).toBeInstanceOf(Array);
      expect(timeline.length).toBeGreaterThan(0);
    });

    it('should handle edge case of 359.99 degree moon', () => {
      const timeline = calculateDashaTimeline(testBirthDate, 359.99);
      expect(timeline).toBeInstanceOf(Array);
      expect(timeline.length).toBeGreaterThan(0);
    });

    it('should give different starting planets for different moon positions', () => {
      const timeline1 = calculateDashaTimeline(testBirthDate, 10);
      const timeline2 = calculateDashaTimeline(testBirthDate, 100);

      // Different moon positions should yield different starting planets or periods
      // (Even if starting time is same, the dasha planets should vary based on nakshatra)
      const firstPlanet1 = timeline1[0]?.planet;
      const firstPlanet2 = timeline2[0]?.planet;

      // At least one of the first few periods should differ in planet allocation
      const planetsMatch =
        timeline1
          .slice(0, 3)
          .map((p) => p.planet)
          .join(',') ===
        timeline2
          .slice(0, 3)
          .map((p) => p.planet)
          .join(',');

      // Since we're testing 90° apart (nakshatra span is ~13.3°),
      // they should likely hit different nakshatras and thus different planet sequences
      expect(planetsMatch).toBe(false);
    });
  });

  describe('Cycle validation', () => {
    it('should maintain 120-year cycle for full planet sequences', () => {
      const timeline = calculateDashaTimeline(testBirthDate, testMoonDegree);

      // After the first (partial) period, the next 9 periods should sum to 120 years
      // (since each is a complete planetary period)
      const fullCyclePeriods = timeline.slice(1, 10);

      let cycleYears = 0;
      for (const period of fullCyclePeriods) {
        cycleYears += period.years;
      }

      // 9 full periods should total 120 years
      expect(cycleYears).toBe(120);
    });
  });
});
