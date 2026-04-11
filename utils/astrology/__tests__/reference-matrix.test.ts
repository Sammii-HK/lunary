import { Observer } from 'astronomy-engine';

import { generateBirthChartWithHouses } from '../birthChart';
import { calculateDashaTimeline } from '../vedic-dasha';

const PLANET_CLOSE = 0.01;
const ANGLE_CLOSE = 5e-5;

type ChartFixture = {
  name: string;
  date: string;
  time: string;
  observer: Observer;
  houses: number[];
  planets: Record<string, number>;
};

const REFERENCE_CASES: ChartFixture[] = [
  {
    name: 'New York spring',
    date: '1985-04-15',
    time: '13:30',
    observer: new Observer(40.7128, -74.006, 10),
    houses: [
      84.42261177265749, 104.87514068700659, 125.49179109547616,
      150.05626297029698, 182.66826761756576, 224.19282433218376,
      264.4226117726575, 284.8751406870066, 305.4917910954762, 330.056262970297,
      2.668267617565762, 44.19282433218375,
    ],
    planets: {
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
      Ascendant: 84.42261177265749,
      Midheaven: 330.056262970297,
    },
  },
  {
    name: 'London winter',
    date: '1994-01-20',
    time: '01:00',
    observer: new Observer(51.5074, -0.1278, 5),
    houses: [
      210.95236443610202, 238.36295315045052, 272.8120614353706,
      311.5998285440233, 345.3328550040061, 11.22751025301244,
      30.952364436102016, 58.362953150450494, 92.8120614353706,
      131.5998285440233, 165.3328550040061, 191.22751025301244,
    ],
    planets: {
      Sun: 299.74032014929077,
      Moon: 31.79117630011467,
      Mercury: 310.1994717065879,
      Venus: 300.4474287607108,
      Mars: 293.69517819620995,
      Jupiter: 222.3173246801045,
      Saturn: 328.9809930207357,
      Uranus: 292.70255732295766,
      Neptune: 291.1811129316932,
      Pluto: 237.5974052951256,
      Ascendant: 210.95236443610202,
      Midheaven: 131.5998285440233,
    },
  },
  {
    name: 'Sydney equinox',
    date: '1990-03-21',
    time: '12:15',
    observer: new Observer(-33.8688, 151.2093, 5),
    houses: [
      261.1711239836054, 283.4587677757555, 305.75682618807974,
      331.7050245783461, 4.482843006221401, 43.51921786366631,
      81.17112398360541, 103.45876777575552, 125.75682618807974,
      151.70502457834613, 184.48284300622143, 223.5192178636663,
    ],
    planets: {
      Sun: 0.6181054441888439,
      Moon: 292.3761014513224,
      Mercury: 3.0091655247557516,
      Venus: 314.4820615616192,
      Mars: 307.3034693810538,
      Jupiter: 91.7930857450032,
      Saturn: 293.7686737597683,
      Uranus: 279.3535212900948,
      Neptune: 284.3881552958341,
      Pluto: 227.52755076877452,
      Ascendant: 261.1711239836054,
      Midheaven: 151.70502457834613,
    },
  },
  {
    name: 'Reykjavik summer',
    date: '2024-06-21',
    time: '12:00',
    observer: new Observer(64.1265, -21.8174, 0),
    houses: [
      167.56805609480705, 185.7060618497014, 211.78448966629207,
      249.99708670989696, 294.24584748945927, 325.22161937762627,
      347.56805609480705, 5.7060618497014275, 31.784489666292075,
      69.99708670989696, 114.24584748945925, 145.22161937762627,
    ],
    planets: {
      Sun: 90.6020900993411,
      Moon: 263.7444333426423,
      Mercury: 98.8232275608488,
      Venus: 95.2036481303139,
      Mars: 39.0713737831182,
      Jupiter: 66.12156312886324,
      Saturn: 349.3686761674396,
      Uranus: 55.267092115685934,
      Neptune: 359.90266361387705,
      Pluto: 301.5756110904715,
      Ascendant: 167.56805609480705,
      Midheaven: 69.99708670989696,
    },
  },
  {
    name: 'Sao Paulo south',
    date: '2012-10-05',
    time: '18:40',
    observer: new Observer(-23.5505, -46.6333, 760),
    houses: [
      340.09476316703876, 7.938585884832638, 38.45408445955871,
      69.85473524216798, 100.81394946784292, 131.00762248749265,
      160.09476316703876, 187.93858588483263, 218.45408445955871,
      249.85473524216798, 280.8139494678429, 311.00762248749265,
    ],
    planets: {
      Sun: 192.92325847771207,
      Moon: 75.16496263521138,
      Mercury: 210.5003567787261,
      Venus: 152.89823490785034,
      Mars: 239.03922844267285,
      Jupiter: 76.37990135308678,
      Saturn: 209.9906335359829,
      Uranus: 6.291369004159739,
      Neptune: 330.7190570145319,
      Pluto: 277.034146010907,
      Ascendant: 340.09476316703876,
      Midheaven: 249.85473524216798,
    },
  },
];

const VEDIC_CASES = [
  {
    date: '1985-04-15T13:30:00Z',
    siderealMoon: 310.9206899634398,
    periods: [
      {
        planet: 'Rahu',
        startDate: '1985-04-15T13:30:00.000Z',
        endDate: '1997-04-15T13:30:00.000Z',
      },
      {
        planet: 'Jupiter',
        startDate: '1997-04-15T13:30:00.000Z',
        endDate: '2013-04-15T13:30:00.000Z',
      },
      {
        planet: 'Saturn',
        startDate: '2013-04-15T13:30:00.000Z',
        endDate: '2032-04-15T13:30:00.000Z',
      },
    ],
  },
  {
    date: '1992-11-05T18:45:00Z',
    siderealMoon: 326.8879693637291,
    periods: [
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
    ],
  },
  {
    date: '2000-03-20T06:00:00Z',
    siderealMoon: 156.73461961552607,
    periods: [
      {
        planet: 'Sun',
        startDate: '2000-03-20T06:00:00.000Z',
        endDate: '2001-03-20T06:00:00.000Z',
      },
      {
        planet: 'Moon',
        startDate: '2001-03-20T06:00:00.000Z',
        endDate: '2011-03-20T06:00:00.000Z',
      },
      {
        planet: 'Mars',
        startDate: '2011-03-20T06:00:00.000Z',
        endDate: '2018-03-20T06:00:00.000Z',
      },
    ],
  },
  {
    date: '2012-10-05T18:40:00Z',
    siderealMoon: 51.12996594757925,
    periods: [
      {
        planet: 'Moon',
        startDate: '2012-10-05T18:40:00.000Z',
        endDate: '2013-10-05T18:40:00.000Z',
      },
      {
        planet: 'Mars',
        startDate: '2013-10-05T18:40:00.000Z',
        endDate: '2020-10-05T18:40:00.000Z',
      },
      {
        planet: 'Rahu',
        startDate: '2020-10-05T18:40:00.000Z',
        endDate: '2038-10-05T18:40:00.000Z',
      },
    ],
  },
  {
    date: '2024-06-21T12:00:00Z',
    siderealMoon: 239.54480458037324,
    periods: [
      {
        planet: 'Mercury',
        startDate: '2024-06-21T12:00:00.000Z',
        endDate: '2024-06-21T12:00:00.000Z',
      },
      {
        planet: 'Ketu',
        startDate: '2024-06-21T12:00:00.000Z',
        endDate: '2031-06-21T12:00:00.000Z',
      },
      {
        planet: 'Venus',
        startDate: '2031-06-21T12:00:00.000Z',
        endDate: '2051-06-21T12:00:00.000Z',
      },
    ],
  },
];

function expectAngle(
  actual: number,
  expected: number,
  tolerance = ANGLE_CLOSE,
) {
  const delta = Math.abs(((actual - expected + 180) % 360) - 180);
  expect(delta).toBeLessThanOrEqual(tolerance);
}

function expectAngleArray(
  actual: number[],
  expected: number[],
  tolerance = ANGLE_CLOSE,
) {
  expect(actual).toHaveLength(expected.length);
  actual.forEach((value, index) => {
    expectAngle(value, expected[index], tolerance);
  });
}

describe('Swiss-free matrix validation', () => {
  it.each(REFERENCE_CASES)(
    'matches hard-coded chart outputs for %s',
    async ({ date, time, observer, houses, planets }) => {
      const chart = await generateBirthChartWithHouses(
        date,
        time,
        undefined,
        'UTC',
        observer,
        'placidus',
      );

      expectAngleArray(
        chart.houses.map((house) => house.eclipticLongitude),
        houses,
      );

      for (const [body, expectedLongitude] of Object.entries(planets)) {
        const planet = chart.planets.find((entry) => entry.body === body);
        expect(planet).toBeDefined();
        expectAngle(
          planet?.eclipticLongitude ?? 0,
          expectedLongitude,
          PLANET_CLOSE,
        );
      }
    },
  );

  it('matches hard-coded Vimshottari periods across dates', () => {
    for (const { date, siderealMoon, periods } of VEDIC_CASES) {
      const actual = calculateDashaTimeline(new Date(date), siderealMoon);

      expect(actual.slice(0, 3).map((period) => period.planet)).toEqual(
        periods.map((period) => period.planet),
      );
      expect(actual[0]?.startDate.toISOString()).toBe(periods[0]?.startDate);
      expect(actual[0]?.endDate.toISOString()).toBe(periods[0]?.endDate);
      expect(actual[1]?.startDate.toISOString()).toBe(periods[1]?.startDate);
      expect(actual[2]?.startDate.toISOString()).toBe(periods[2]?.startDate);
    }
  });
});
