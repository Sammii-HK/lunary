import { Observer } from 'astronomy-engine';
import { calculateHouses, calculateWholeSigHouses } from '../houseSystems';
import { calculateDashaTimeline } from '../vedic-dasha';
import { generateBirthChartWithHouses } from '../birthChart';

const CLOSE = 5e-5;
const PLANET_CLOSE = 0.01;

const NYC_OBSERVER = new Observer(40.7128, -74.006, 10);
const LONDON_OBSERVER = new Observer(51.5074, -0.1278, 5);
const SYDNEY_OBSERVER = new Observer(-33.8688, 151.2093, 5);

const NYC_PLACIDUS = [
  84.42261177265749, 104.87514068700659, 125.49179109547616, 150.05626297029698,
  182.66826761756576, 224.19282433218376, 264.4226117726575, 284.8751406870066,
  305.4917910954762, 330.056262970297, 2.668267617565762, 44.19282433218375,
];

const NYC_KOCH = [
  84.42261177265749, 107.90845640069917, 129.2060485069706, 150.05626297029698,
  195.23272025089497, 235.1239847595732, 264.4226117726575, 287.90845640069915,
  309.2060485069706, 330.056262970297, 15.23272025089497, 55.12398475957321,
];

const NYC_PORPHYRY = [
  84.42261177265749, 106.3004996810076, 128.1783875893577, 150.05626297029698,
  188.1783875893577, 226.3004996810076, 264.4226117726575, 286.3004996810076,
  308.17838758935767, 330.056262970297, 8.17838758935767, 46.30049968100759,
];

const NYC_ALCABITIUS = [
  84.42261177265749, 105.3563207972965, 127.00590308329495, 150.05626297029698,
  190.23295838413128, 229.11891862603667, 264.4226117726575, 285.3563207972965,
  307.0059030832949, 330.056262970297, 10.23295838413128, 49.118918626036674,
];

const NYC_WHOLE_SIGN = [60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 0, 30];

const LONDON_PLACIDUS = [
  210.95236443610202, 238.36295315045052, 272.8120614353706, 311.5998285440233,
  345.3328550040061, 11.22751025301244, 30.952364436102016, 58.362953150450494,
  92.8120614353706, 131.5998285440233, 165.3328550040061, 191.22751025301244,
];

const SYDNEY_PLACIDUS = [
  261.1711239836054, 283.4587677757555, 305.75682618807974, 331.7050245783461,
  4.482843006221401, 43.51921786366631, 81.17112398360541, 103.45876777575552,
  125.75682618807974, 151.70502457834613, 184.48284300622143, 223.5192178636663,
];

const ARIES_BOUNDARY_OBSERVER = new Observer(0, 0, 0);
const ARIES_BOUNDARY_HOUSES = [
  357.90378548222134, 30.173579248704005, 60.24740799849203, 88.23520230908525,
  116.07771794009699, 145.82195639736335, 177.90378548222134,
  210.17357924870402, 240.24740799849204, 268.23520230908525, 296.077717940097,
  325.82195639736335,
];
const ARIES_BOUNDARY_PLANETS = {
  Sun: 359.93433054513673,
  Moon: 180.59481415144268,
  Mercury: 334.13625921851235,
} as const;

const HIGH_LAT_OBSERVER = new Observer(64.1265, -21.8174, 0);
const HIGH_LAT_HOUSES = [
  167.56805609480705, 185.7060618497014, 211.78448966629207, 249.99708670989696,
  294.24584748945927, 325.22161937762627, 347.56805609480705,
  5.7060618497014275, 31.784489666292075, 69.99708670989696, 114.24584748945925,
  145.22161937762627,
];
const HIGH_LAT_PLANETS = {
  Sun: 90.6020900993411,
  Moon: 263.7444333426423,
  Mercury: 98.8232275608488,
} as const;

const VEDIC_SAMPLE_TROPICAL_MOON = 350.6451406225765;
const VEDIC_SAMPLE_SIDEREAL_MOON = 326.8879693637291;
const VEDIC_SAMPLE_DASHA = [
  {
    planet: 'Jupiter',
    startDate: '1992-11-05T18:45:00.000Z',
    endDate: '1999-11-05T18:45:00.000Z',
  },
  {
    planet: 'Saturn',
    startDate: '1999-11-05T18:45:00.000Z',
    endDate: '2018-11-05T18:45:00.000Z',
  },
  {
    planet: 'Mercury',
    startDate: '2018-11-05T18:45:00.000Z',
    endDate: '2035-11-05T18:45:00.000Z',
  },
] as const;

const NYC_PLANETS = {
  Sun: 25.52155114829439,
  Moon: 334.5723736053405,
  Mercury: 6.842963562247251,
  Venus: 7.791909092015301,
  Mars: 52.42718316432464,
  Jupiter: 313.20483497599884,
  Saturn: 236.91879241767003,
  Uranus: 257.747843832178,
  Neptune: 273.5848209877047,
  Pluto: 213.58759201631236,
} as const;

const NYC_HOUSE_ASSIGNMENTS = {
  Sun: 11,
  Moon: 10,
  Mercury: 11,
  Ascendant: 1,
  Midheaven: 10,
} as const;

function expectAngle(actual: number, expected: number, tolerance = CLOSE) {
  const delta = Math.abs(((actual - expected + 180) % 360) - 180);
  expect(delta).toBeLessThanOrEqual(tolerance);
}

function expectAngleArray(actual: number[], expected: number[]) {
  expect(actual).toHaveLength(expected.length);
  actual.forEach((value, index) => {
    expectAngle(value, expected[index]);
  });
}

describe('House and zodiac reference validation', () => {
  it('matches exact house cusps for New York across supported systems', () => {
    expectAngleArray(
      calculateHouses(
        'placidus',
        84.42261177265749,
        330.056262970297,
        NYC_OBSERVER,
        2446171.0625,
      ).map((house) => house.eclipticLongitude),
      NYC_PLACIDUS,
    );
    expectAngleArray(
      calculateHouses(
        'koch',
        84.42261177265749,
        330.056262970297,
        NYC_OBSERVER,
        2446171.0625,
      ).map((house) => house.eclipticLongitude),
      NYC_KOCH,
    );
    expectAngleArray(
      calculateHouses(
        'porphyry',
        84.42261177265749,
        330.056262970297,
        NYC_OBSERVER,
        2446171.0625,
      ).map((house) => house.eclipticLongitude),
      NYC_PORPHYRY,
    );
    expectAngleArray(
      calculateHouses(
        'alcabitius',
        84.42261177265749,
        330.056262970297,
        NYC_OBSERVER,
        2446171.0625,
      ).map((house) => house.eclipticLongitude),
      NYC_ALCABITIUS,
    );
    expectAngleArray(
      calculateWholeSigHouses(84.42261177265749).map(
        (house) => house.eclipticLongitude,
      ),
      NYC_WHOLE_SIGN,
    );
  });

  it('matches the reference Placidus cusps for London and Sydney', () => {
    expectAngleArray(
      calculateHouses(
        'placidus',
        210.95236443610202,
        131.5998285440233,
        LONDON_OBSERVER,
        2449372.5416666665,
      ).map((house) => house.eclipticLongitude),
      LONDON_PLACIDUS,
    );

    expectAngleArray(
      calculateHouses(
        'placidus',
        261.1711239836054,
        151.7050245783461,
        SYDNEY_OBSERVER,
        2447972.0104166665,
      ).map((house) => house.eclipticLongitude),
      SYDNEY_PLACIDUS,
    );
  });

  it('matches a sign-boundary Aries ingress chart', async () => {
    const chart = await generateBirthChartWithHouses(
      '2000-03-20',
      '06:00',
      undefined,
      'UTC',
      ARIES_BOUNDARY_OBSERVER,
      'placidus',
    );

    for (const [body, expected] of Object.entries(ARIES_BOUNDARY_PLANETS)) {
      const planet = chart.planets.find((entry) => entry.body === body);
      expect(planet).toBeDefined();
      expectAngle(planet?.eclipticLongitude ?? 0, expected, PLANET_CLOSE);
    }

    expectAngleArray(
      chart.houses.map((house) => house.eclipticLongitude),
      ARIES_BOUNDARY_HOUSES,
    );
  });

  it('matches a high-latitude summer-solstice chart', async () => {
    const chart = await generateBirthChartWithHouses(
      '2024-06-21',
      '12:00',
      undefined,
      'UTC',
      HIGH_LAT_OBSERVER,
      'placidus',
    );

    for (const [body, expected] of Object.entries(HIGH_LAT_PLANETS)) {
      const planet = chart.planets.find((entry) => entry.body === body);
      expect(planet).toBeDefined();
      expectAngle(planet?.eclipticLongitude ?? 0, expected, PLANET_CLOSE);
    }

    expectAngleArray(
      chart.houses.map((house) => house.eclipticLongitude),
      HIGH_LAT_HOUSES,
    );
  });

  it('matches a fixed Vedic sample dasha sequence', () => {
    const timeline = calculateDashaTimeline(
      new Date('1992-11-05T18:45:00Z'),
      VEDIC_SAMPLE_SIDEREAL_MOON,
    );

    expect(timeline.slice(0, 3).map((period) => period.planet)).toEqual([
      VEDIC_SAMPLE_DASHA[0].planet,
      VEDIC_SAMPLE_DASHA[1].planet,
      VEDIC_SAMPLE_DASHA[2].planet,
    ]);
    expect(timeline[0]?.startDate.toISOString()).toBe(
      VEDIC_SAMPLE_DASHA[0].startDate,
    );
    expect(timeline[0]?.endDate.toISOString()).toBe(
      VEDIC_SAMPLE_DASHA[0].endDate,
    );
    expect(timeline[1]?.startDate.toISOString()).toBe(
      VEDIC_SAMPLE_DASHA[1].startDate,
    );
    expect(timeline[2]?.startDate.toISOString()).toBe(
      VEDIC_SAMPLE_DASHA[2].startDate,
    );
  });

  it('matches the reference birth chart for New York', async () => {
    const chart = await generateBirthChartWithHouses(
      '1985-04-15',
      '13:30',
      undefined,
      'UTC',
      NYC_OBSERVER,
      'placidus',
    );

    for (const [body, expected] of Object.entries(NYC_PLANETS)) {
      const planet = chart.planets.find((entry) => entry.body === body);
      expect(planet).toBeDefined();
      expectAngle(planet?.eclipticLongitude ?? 0, expected, PLANET_CLOSE);
    }

    for (const [body, expectedHouse] of Object.entries(NYC_HOUSE_ASSIGNMENTS)) {
      const planet = chart.planets.find((entry) => entry.body === body);
      expect(planet?.house).toBe(expectedHouse);
    }

    expectAngleArray(
      chart.houses.map((house) => house.eclipticLongitude),
      NYC_PLACIDUS,
    );
  });
});
