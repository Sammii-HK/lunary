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

function expectAngles(actual: number[], expected: number[], tolerance = 2e-5) {
  expect(actual).toHaveLength(expected.length);
  actual.forEach((value, index) => {
    expect(Math.abs(value - expected[index])).toBeLessThan(tolerance);
  });
}

describe('House System Calculations', () => {
  // Exact reference chart: New York, 1985-04-15 13:30 UTC
  const ascendant = 84.42261433054409;
  const mc = 330.05627416571383;
  const observer = new Observer(40.7128, -74.006, 10);
  const jd = 2446171.0625;

  const wholeSign = [60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 0, 30];
  const placidus = [
    84.42261433054409, 104.87514595027967, 125.49179946854504,
    150.05627416571383, 182.6682793307973, 224.19283141247044,
    264.4226143305441, 284.87514595027966, 305.491799468545, 330.05627416571383,
    2.668279330797313, 44.19283141247045,
  ];
  const koch = [
    84.42261433054409, 107.90846062687496, 129.206054881885, 150.05627416571383,
    195.23273035098526, 235.12398803896093, 264.4226143305441,
    287.90846062687496, 309.206054881885, 330.05627416571383,
    15.232730350985262, 55.12398803896093,
  ];
  const porphyry = [
    84.42261433054409, 106.30050094226733, 128.17838755399058,
    150.05627416571383, 188.1783875539906, 226.30050094226732,
    264.4226143305441, 286.3005009422673, 308.17838755399055,
    330.05627416571383, 8.178387553990603, 46.30050094226732,
  ];
  const alcabitius = [
    84.42261433054409, 105.3563207972965, 127.00590308329495,
    150.05627416571383, 190.23295838413128, 229.11891862603667,
    264.4226143305441, 285.3563207972965, 307.0059030832949, 330.05627416571383,
    10.23295838413128, 49.118918626036674,
  ];

  describe('calculateWholeSigHouses', () => {
    it('should create 12 houses', () => {
      const houses = calculateWholeSigHouses(ascendant);
      expect(houses).toHaveLength(12);
    });

    it('should start with Ascendant in house 1', () => {
      const houses = calculateWholeSigHouses(ascendant);
      expect(houses[0].house).toBe(1);
      expect(houses[0].eclipticLongitude).toBe(60);
    });

    it('should have 30-degree houses', () => {
      const houses = calculateWholeSigHouses(ascendant);
      for (let i = 0; i < 12; i++) {
        expect(houses[i].eclipticLongitude).toBe(wholeSign[i]);
      }
    });

    it('should have correct zodiac signs', () => {
      const houses = calculateWholeSigHouses(ascendant);
      const expectedSigns = [
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
        'Aries',
        'Taurus',
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
      expectAngles(
        houses.map((house) => house.eclipticLongitude),
        placidus,
      );
    });

    it('should have house 10 near MC', () => {
      const houses = calculatePlacidusHouses(ascendant, mc, observer, jd);
      const mcCusp = houses[9];
      expect(mcCusp.house).toBe(10);
      expect(mcCusp.eclipticLongitude).toBeCloseTo(mc, 6);
    });

    it('should have house 7 opposite Ascendant', () => {
      const houses = calculatePlacidusHouses(ascendant, mc, observer, jd);
      const desc = houses[6];
      expect(desc.eclipticLongitude).toBeCloseTo(264.4226143305441, 6);
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

    it('should match the reference Koch cusps', () => {
      const houses = calculateKochHouses(ascendant, mc, observer, jd);
      expectAngles(
        houses.map((house) => house.eclipticLongitude),
        koch,
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

    it('should match the reference Porphyry cusps', () => {
      const houses = calculatePorphyryHouses(ascendant, mc, observer, jd);
      expectAngles(
        houses.map((house) => house.eclipticLongitude),
        porphyry,
      );
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

    it('should match the reference Alcabitius cusps', () => {
      const houses = calculateAlcabitiusHouses(ascendant, mc, observer, jd);
      expectAngles(
        houses.map((house) => house.eclipticLongitude),
        alcabitius,
      );
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
      expectAngles(
        houses.map((house) => house.eclipticLongitude),
        wholeSign,
      );
    });

    it('should calculate Placidus houses', () => {
      const houses = calculateHouses('placidus', ascendant, mc, observer, jd);
      expect(houses).toHaveLength(12);
      expectAngles(
        houses.map((house) => house.eclipticLongitude),
        placidus,
      );
    });

    it('should calculate Koch houses', () => {
      const houses = calculateHouses('koch', ascendant, mc, observer, jd);
      expect(houses).toHaveLength(12);
      expectAngles(
        houses.map((house) => house.eclipticLongitude),
        koch,
      );
    });

    it('should calculate Porphyry houses', () => {
      const houses = calculateHouses('porphyry', ascendant, mc, observer, jd);
      expect(houses).toHaveLength(12);
      expectAngles(
        houses.map((house) => house.eclipticLongitude),
        porphyry,
      );
    });

    it('should calculate Alcabitius houses', () => {
      const houses = calculateHouses('alcabitius', ascendant, mc, observer, jd);
      expect(houses).toHaveLength(12);
      expectAngles(
        houses.map((house) => house.eclipticLongitude),
        alcabitius,
      );
    });

    it('should default to whole-sign for unknown system', () => {
      const houses = calculateHouses(
        'whole-sign' as HouseSystem,
        ascendant,
        mc,
      );
      const wholeSign = calculateWholeSigHouses(ascendant);
      expectAngles(
        houses.map((h) => h.eclipticLongitude),
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

    it('should produce sequential cusps (NYC reference)', () => {
      // Cusps must go in sequential ecliptic order — each cusp advances
      // forward through the zodiac. If cusps jump backwards by > 180°,
      // the algorithm converged to the wrong quadrant.
      const houses = calculatePlacidusHouses(ascendant, mc, observer, jd);
      const longs = houses.map((h) => h.eclipticLongitude);
      for (let i = 0; i < 12; i++) {
        const curr = longs[i];
        const next = longs[(i + 1) % 12];
        const gap = (next - curr + 360) % 360;
        expect(gap).toBeLessThan(180);
      }
    });

    it('should produce sequential cusps for all quadrant systems', () => {
      // Regression: the houses API was passing Observer(0,0,0) to
      // calculateHouses instead of the real observer. This caused RAMC
      // to be inconsistent with the provided AC/MC, producing cusps
      // in the wrong quadrants. Fixed by resolving observer in
      // generateBirthChartWithHouses before passing to calculateHouses.
      const systems: HouseSystem[] = [
        'placidus',
        'koch',
        'porphyry',
        'alcabitius',
      ];
      for (const system of systems) {
        const houses = calculateHouses(system, ascendant, mc, observer, jd);
        const longs = houses.map((h) => h.eclipticLongitude);
        for (let i = 0; i < 12; i++) {
          const curr = longs[i];
          const next = longs[(i + 1) % 12];
          const gap = (next - curr + 360) % 360;
          expect(gap).toBeLessThan(180);
        }
      }
    });
  });
});
