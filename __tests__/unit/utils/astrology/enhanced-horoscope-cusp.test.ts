import { getEnhancedPersonalizedHoroscope } from 'utils/astrology/enhancedHoroscope';

const cuspChart = [
  {
    body: 'Sun',
    sign: 'Capricorn',
    degree: 29,
    minute: 44,
    eclipticLongitude: 299.74,
    retrograde: false,
    house: 3,
  },
  {
    body: 'Moon',
    sign: 'Libra',
    degree: 8,
    minute: 0,
    eclipticLongitude: 188,
    retrograde: false,
    house: 11,
  },
  {
    body: 'Ascendant',
    sign: 'Scorpio',
    degree: 20,
    minute: 0,
    eclipticLongitude: 230,
    retrograde: false,
    house: 1,
  },
];

describe('enhanced horoscope cusp charts', () => {
  it('keeps the calculated birth chart authoritative on Jan 20 cusp birthdays', () => {
    const horoscope = getEnhancedPersonalizedHoroscope(
      '1994-01-20',
      'Sammii',
      { birthday: '1994-01-20', birthChart: cuspChart },
      new Date('2026-04-29T12:00:00.000Z'),
    );

    expect(horoscope.sunSign).toBe('Capricorn');
    expect(horoscope.personalInsight).not.toMatch(/today's wider sky/i);
    expect(horoscope.overview).not.toMatch(/birth chart/i);
  });
});
