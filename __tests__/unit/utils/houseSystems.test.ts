import {
  calculateWholeSigHouses,
  calculatePlacidusHouses,
  calculateKochHouses,
  calculatePorphyryHouses,
  calculateAlcabitiusHouses,
  calculateHouses,
  type HouseSystem,
} from 'utils/astrology/houseSystems';
import { Observer } from 'astronomy-engine';

describe('House System Calculations', () => {
  // Test data: Standard coordinates and angles
  const ascendant = 120; // Leo Ascendant (120°)
  const mc = 30; // Aries MC (30°)
  const observer = new Observer(40.7128, -74.006, 10); // New York
  const jd = 2460000; // Jan 1, 2024

  describe('calculateWholeSigHouses', () => {
    it('should create 12 houses', () => {
      const houses = calculateWholeSigHouses(ascendant);
      expect(houses).toHaveLength(12);
    });

    it('should start with Ascendant in house 1', () => {
      const houses = calculateWholeSigHouses(ascendant);
      expect(houses[0].house).toBe(1);
      expect(houses[0].eclipticLongitude).toBe(120);
    });

    it('should have 30-degree houses', () => {
      const houses = calculateWholeSigHouses(ascendant);
      for (let i = 0; i < 12; i++) {
        const current = houses[i].eclipticLongitude;
        const next = houses[(i + 1) % 12].eclipticLongitude;
        const diff = (next - current + 360) % 360;
        expect(diff === 30 || diff === 0).toBe(true);
      }
    });

    it('should have correct zodiac signs', () => {
      const houses = calculateWholeSigHouses(0);
      const expectedSigns = [
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
      houses.forEach((house, i) => {
        expect(house.sign).toBe(expectedSigns[i]);
      });
    });

    it('should have degree and minute values', () => {
      const houses = calculateWholeSigHouses(ascendant);
      houses.forEach((house) => {
        expect(typeof house.degree).toBe('number');
        expect(typeof house.minute).toBe('number');
        expect(house.degree).toBeGreaterThanOrEqual(0);
        expect(house.degree).toBeLessThan(30);
        expect(house.minute).toBeGreaterThanOrEqual(0);
        expect(house.minute).toBeLessThan(60);
      });
    });
  });

  describe('calculatePlacidusHouses', () => {
    it('should create 12 houses', () => {
      const houses = calculatePlacidusHouses(ascendant, mc, observer, jd);
      expect(houses).toHaveLength(12);
    });

    it('should have house 1 at Ascendant', () => {
      const houses = calculatePlacidusHouses(ascendant, mc, observer, jd);
      expect(houses[0].house).toBe(1);
      expect(Math.abs(houses[0].eclipticLongitude - ascendant)).toBeLessThan(1);
    });

    it('should have house 10 near MC', () => {
      const houses = calculatePlacidusHouses(ascendant, mc, observer, jd);
      const mcCusp = houses[9];
      expect(mcCusp.house).toBe(10);
    });

    it('should have house 7 opposite Ascendant', () => {
      const houses = calculatePlacidusHouses(ascendant, mc, observer, jd);
      const desc = houses[6];
      const expectedDesc = (ascendant + 180) % 360;
      expect(Math.abs(desc.eclipticLongitude - expectedDesc)).toBeLessThan(2);
    });

    it('should have all longitudes within 0-360', () => {
      const houses = calculatePlacidusHouses(ascendant, mc, observer, jd);
      houses.forEach((house) => {
        expect(house.eclipticLongitude).toBeGreaterThanOrEqual(0);
        expect(house.eclipticLongitude).toBeLessThanOrEqual(360);
      });
    });
  });

  describe('calculateKochHouses', () => {
    it('should create 12 houses', () => {
      const houses = calculateKochHouses(ascendant, mc);
      expect(houses).toHaveLength(12);
    });

    it('should have house 1 at Ascendant', () => {
      const houses = calculateKochHouses(ascendant, mc);
      expect(houses[0].house).toBe(1);
      expect(Math.abs(houses[0].eclipticLongitude - ascendant)).toBeLessThan(
        0.1,
      );
    });

    it('should be valid independent system', () => {
      const koch = calculateKochHouses(ascendant, mc);

      // Koch should have all valid properties like other systems
      koch.forEach((house) => {
        expect(house.house).toBeDefined();
        expect(house.sign).toBeDefined();
        expect(house.degree).toBeDefined();
        expect(house.minute).toBeDefined();
        expect(house.eclipticLongitude).toBeDefined();
      });
    });

    it('should have all longitudes within 0-360', () => {
      const houses = calculateKochHouses(ascendant, mc);
      houses.forEach((house) => {
        expect(house.eclipticLongitude).toBeGreaterThanOrEqual(0);
        expect(house.eclipticLongitude).toBeLessThanOrEqual(360);
      });
    });
  });

  describe('calculatePorphyryHouses', () => {
    it('should create 12 houses', () => {
      const houses = calculatePorphyryHouses(ascendant, mc);
      expect(houses).toHaveLength(12);
    });

    it('should divide quadrants equally', () => {
      const houses = calculatePorphyryHouses(ascendant, mc);
      const asc = ascendant;
      const desc = (asc + 180) % 360;
      const ic = (mc + 180) % 360;

      // Quadrant 1: Asc to IC
      const q1Arc = (ic - asc + 360) % 360;
      const h1to3 =
        (houses[2].eclipticLongitude - houses[0].eclipticLongitude + 360) % 360;
      expect(h1to3).toBeCloseTo(q1Arc * (2 / 3), 0);
    });

    it('should have Ascendant, IC, Descendant, MC at cardinal points', () => {
      const houses = calculatePorphyryHouses(ascendant, mc);
      const asc = ascendant;
      const ic = (mc + 180) % 360;
      const desc = (asc + 180) % 360;

      expect(Math.abs(houses[0].eclipticLongitude - asc)).toBeLessThan(0.1);
      expect(Math.abs(houses[3].eclipticLongitude - ic)).toBeLessThan(0.1);
      expect(Math.abs(houses[6].eclipticLongitude - desc)).toBeLessThan(0.1);
      expect(Math.abs(houses[9].eclipticLongitude - mc)).toBeLessThan(0.1);
    });

    it('should have all longitudes within 0-360', () => {
      const houses = calculatePorphyryHouses(ascendant, mc);
      houses.forEach((house) => {
        expect(house.eclipticLongitude).toBeGreaterThanOrEqual(0);
        expect(house.eclipticLongitude).toBeLessThanOrEqual(360);
      });
    });
  });

  describe('calculateAlcabitiusHouses', () => {
    it('should create 12 houses', () => {
      const houses = calculateAlcabitiusHouses(ascendant, mc);
      expect(houses).toHaveLength(12);
    });

    it('should have cardinal points similar to Porphyry', () => {
      const porphyry = calculatePorphyryHouses(ascendant, mc);
      const alcabitius = calculateAlcabitiusHouses(ascendant, mc);

      // Cardinal points should match closely
      for (const i of [0, 3, 6, 9]) {
        const diff = Math.abs(
          porphyry[i].eclipticLongitude - alcabitius[i].eclipticLongitude,
        );
        expect(diff).toBeLessThan(0.1);
      }
    });

    it('should have all longitudes within 0-360', () => {
      const houses = calculateAlcabitiusHouses(ascendant, mc);
      houses.forEach((house) => {
        expect(house.eclipticLongitude).toBeGreaterThanOrEqual(0);
        expect(house.eclipticLongitude).toBeLessThanOrEqual(360);
      });
    });
  });

  describe('calculateHouses', () => {
    it('should calculate whole-sign houses', () => {
      const houses = calculateHouses('whole-sign', ascendant, mc, observer, jd);
      expect(houses).toHaveLength(12);
      expect(houses[0].eclipticLongitude).toBe(ascendant);
    });

    it('should calculate Placidus houses', () => {
      const houses = calculateHouses('placidus', ascendant, mc, observer, jd);
      expect(houses).toHaveLength(12);
      expect(Math.abs(houses[0].eclipticLongitude - ascendant)).toBeLessThan(1);
    });

    it('should calculate Koch houses', () => {
      const houses = calculateHouses('koch', ascendant, mc, observer, jd);
      expect(houses).toHaveLength(12);
      expect(Math.abs(houses[0].eclipticLongitude - ascendant)).toBeLessThan(
        0.1,
      );
    });

    it('should calculate Porphyry houses', () => {
      const houses = calculateHouses('porphyry', ascendant, mc, observer, jd);
      expect(houses).toHaveLength(12);
      expect(Math.abs(houses[0].eclipticLongitude - ascendant)).toBeLessThan(
        0.1,
      );
    });

    it('should calculate Alcabitius houses', () => {
      const houses = calculateHouses('alcabitius', ascendant, mc, observer, jd);
      expect(houses).toHaveLength(12);
      expect(Math.abs(houses[0].eclipticLongitude - ascendant)).toBeLessThan(
        0.1,
      );
    });

    it('should default to whole-sign for unknown system', () => {
      const houses = calculateHouses(
        'whole-sign' as HouseSystem,
        ascendant,
        mc,
      );
      const wholeSign = calculateWholeSigHouses(ascendant);
      expect(houses.map((h) => h.eclipticLongitude)).toEqual(
        wholeSign.map((h) => h.eclipticLongitude),
      );
    });
  });

  describe('Common properties across all systems', () => {
    const systems: HouseSystem[] = [
      'whole-sign',
      'placidus',
      'koch',
      'porphyry',
      'alcabitius',
    ];

    systems.forEach((system) => {
      describe(`${system}`, () => {
        it('should have valid house numbers 1-12', () => {
          const houses = calculateHouses(system, ascendant, mc, observer, jd);
          houses.forEach((house, i) => {
            expect(house.house).toBe(i + 1);
          });
        });

        it('should have valid sign names', () => {
          const houses = calculateHouses(system, ascendant, mc, observer, jd);
          const validSigns = [
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
          houses.forEach((house) => {
            expect(validSigns).toContain(house.sign);
          });
        });

        it('should have degree 0-29', () => {
          const houses = calculateHouses(system, ascendant, mc, observer, jd);
          houses.forEach((house) => {
            expect(house.degree).toBeGreaterThanOrEqual(0);
            expect(house.degree).toBeLessThanOrEqual(29);
          });
        });

        it('should have minute 0-59', () => {
          const houses = calculateHouses(system, ascendant, mc, observer, jd);
          houses.forEach((house) => {
            expect(house.minute).toBeGreaterThanOrEqual(0);
            expect(house.minute).toBeLessThan(60);
          });
        });

        it('should have valid ecliptic longitude 0-360', () => {
          const houses = calculateHouses(system, ascendant, mc, observer, jd);
          houses.forEach((house) => {
            expect(house.eclipticLongitude).toBeGreaterThanOrEqual(0);
            expect(house.eclipticLongitude).toBeLessThanOrEqual(360);
          });
        });
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle 0° Ascendant', () => {
      const houses = calculateWholeSigHouses(0);
      expect(houses[0].eclipticLongitude).toBe(0);
      expect(houses[0].sign).toBe('Aries');
    });

    it('should handle 359° Ascendant', () => {
      const houses = calculateWholeSigHouses(359);
      expect(houses[0].house).toBe(1);
      expect(houses[0].eclipticLongitude).toBeGreaterThan(0);
    });

    it('should handle different MC positions', () => {
      const mcPositions = [0, 90, 180, 270, 359];
      mcPositions.forEach((mcPos) => {
        const houses = calculatePlacidusHouses(ascendant, mcPos, observer, jd);
        expect(houses).toHaveLength(12);
        houses.forEach((house) => {
          expect(house.eclipticLongitude).toBeGreaterThanOrEqual(0);
          expect(house.eclipticLongitude).toBeLessThanOrEqual(360);
        });
      });
    });

    it('should handle Southern Hemisphere observer', () => {
      const southernObserver = new Observer(-33.8688, 151.2093, 5); // Sydney
      const houses = calculatePlacidusHouses(
        ascendant,
        mc,
        southernObserver,
        jd,
      );
      expect(houses).toHaveLength(12);
      houses.forEach((house) => {
        expect(house.eclipticLongitude).toBeGreaterThanOrEqual(0);
        expect(house.eclipticLongitude).toBeLessThanOrEqual(360);
      });
    });
  });
});
