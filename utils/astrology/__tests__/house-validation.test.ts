import { Observer } from 'astronomy-engine';
import { generateBirthChartWithHouses } from '../birthChart';
import {
  calculateAlcabitiusHouses,
  calculateHouses,
  calculateKochHouses,
  calculatePlacidusHouses,
  calculatePorphyryHouses,
  calculateWholeSigHouses,
} from '../houseSystems';

const NYC_OBSERVER = new Observer(40.7128, -74.006, 10);
const NYC_JD = 2446171.0625;
const NYC_ASC = 84.42261433054409;
const NYC_MC = 330.05627416571383;

const NYC_WHOLE_SIGN = [60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 0, 30];
const NYC_PLACIDUS = [
  84.42261433054409, 104.87514595027967, 125.49179946854504, 150.05627416571383,
  182.6682793307973, 224.19283141247044, 264.4226143305441, 284.87514595027966,
  305.491799468545, 330.05627416571383, 2.668279330797313, 44.19283141247045,
];
const NYC_KOCH = [
  84.42261433054409, 107.90846062687496, 129.206054881885, 150.05627416571383,
  195.23273035098526, 235.12398803896093, 264.4226143305441, 287.90846062687496,
  309.206054881885, 330.05627416571383, 15.232730350985262, 55.12398803896093,
];
const NYC_PORPHYRY = [
  84.42261433054409, 106.30050094226733, 128.17838755399058, 150.05627416571383,
  188.1783875539906, 226.30050094226732, 264.4226143305441, 286.3005009422673,
  308.17838755399055, 330.05627416571383, 8.178387553990603, 46.30050094226732,
];
const NYC_ALCABITIUS = [
  84.42261433054409, 105.3563207972965, 127.00590308329495, 150.05627416571383,
  190.23295838413128, 229.11891862603667, 264.4226143305441, 285.3563207972965,
  307.0059030832949, 330.05627416571383, 10.23295838413128, 49.118918626036674,
];

const LONDON_OBSERVER = new Observer(51.5074, -0.1278, 5);
const LONDON_JD = 2449372.5416666665;
const LONDON_PLACIDUS = [
  210.9523726693758, 238.36296654518878, 272.81207694394436, 311.599838946751,
  345.3328673925106, 11.22752134983665, 30.95237266937579, 58.36296654518878,
  92.81207694394436, 131.599838946751, 165.33286739251056, 191.22752134983665,
];

const SYDNEY_OBSERVER = new Observer(-33.8688, 151.2093, 5);
const SYDNEY_JD = 2447972.0104166665;
const SYDNEY_PLACIDUS = [
  261.17108592685224, 283.45873769382945, 305.75679559426516, 331.7049855582495,
  4.4828027728971165, 43.519177182259284, 81.17108592685224, 103.45873769382945,
  125.75679559426516, 151.70498555824955, 184.48280277289714,
  223.51917718225928,
];

function expectAngles(actual: number[], expected: number[]) {
  expect(actual).toHaveLength(expected.length);
  actual.forEach((value, index) => {
    expect(Math.abs(value - expected[index])).toBeLessThan(5e-5);
  });
}

describe('House System Validation - New York', () => {
  describe('Whole-Sign System', () => {
    it('matches the reference whole-sign cusps', () => {
      expectAngles(
        calculateWholeSigHouses(NYC_ASC).map(
          (house) => house.eclipticLongitude,
        ),
        NYC_WHOLE_SIGN,
      );
    });
  });

  describe('Placidus System', () => {
    it('matches the reference Placidus cusps', () => {
      expectAngles(
        calculatePlacidusHouses(NYC_ASC, NYC_MC, NYC_OBSERVER, NYC_JD).map(
          (house) => house.eclipticLongitude,
        ),
        NYC_PLACIDUS,
      );
    });
  });

  describe('Koch System', () => {
    it('matches the reference Koch cusps', () => {
      expectAngles(
        calculateKochHouses(NYC_ASC, NYC_MC, NYC_OBSERVER, NYC_JD).map(
          (house) => house.eclipticLongitude,
        ),
        NYC_KOCH,
      );
    });
  });

  describe('Porphyry System', () => {
    it('matches the reference Porphyry cusps', () => {
      expectAngles(
        calculatePorphyryHouses(NYC_ASC, NYC_MC, NYC_OBSERVER, NYC_JD).map(
          (house) => house.eclipticLongitude,
        ),
        NYC_PORPHYRY,
      );
    });
  });

  describe('Alcabitius System', () => {
    it('matches the reference Alcabitius cusps', () => {
      expectAngles(
        calculateAlcabitiusHouses(NYC_ASC, NYC_MC, NYC_OBSERVER, NYC_JD).map(
          (house) => house.eclipticLongitude,
        ),
        NYC_ALCABITIUS,
      );
    });
  });

  describe('Dispatcher', () => {
    it('returns the same reference values as the direct helpers', () => {
      expectAngles(
        calculateHouses(
          'whole-sign',
          NYC_ASC,
          NYC_MC,
          NYC_OBSERVER,
          NYC_JD,
        ).map((house) => house.eclipticLongitude),
        NYC_WHOLE_SIGN,
      );
      expectAngles(
        calculateHouses('placidus', NYC_ASC, NYC_MC, NYC_OBSERVER, NYC_JD).map(
          (house) => house.eclipticLongitude,
        ),
        NYC_PLACIDUS,
      );
      expectAngles(
        calculateHouses('koch', NYC_ASC, NYC_MC, NYC_OBSERVER, NYC_JD).map(
          (house) => house.eclipticLongitude,
        ),
        NYC_KOCH,
      );
      expectAngles(
        calculateHouses('porphyry', NYC_ASC, NYC_MC, NYC_OBSERVER, NYC_JD).map(
          (house) => house.eclipticLongitude,
        ),
        NYC_PORPHYRY,
      );
      expectAngles(
        calculateHouses(
          'alcabitius',
          NYC_ASC,
          NYC_MC,
          NYC_OBSERVER,
          NYC_JD,
        ).map((house) => house.eclipticLongitude),
        NYC_ALCABITIUS,
      );
    });
  });
});

describe('House System Validation - London', () => {
  it('matches the reference Placidus cusps for London', async () => {
    const chart = await generateBirthChartWithHouses(
      '1994-01-20',
      '01:00',
      undefined,
      'UTC',
      LONDON_OBSERVER,
      'placidus',
    );
    expectAngles(
      chart.houses.map((house) => house.eclipticLongitude),
      LONDON_PLACIDUS,
    );
  });
});

describe('House System Validation - Sydney', () => {
  it('matches the reference Placidus cusps for Sydney', async () => {
    const chart = await generateBirthChartWithHouses(
      '1990-03-21',
      '12:15',
      undefined,
      'UTC',
      SYDNEY_OBSERVER,
      'placidus',
    );
    expectAngles(
      chart.houses.map((house) => house.eclipticLongitude),
      SYDNEY_PLACIDUS,
    );
  });
});
