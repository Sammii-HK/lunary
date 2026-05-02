import { sunSignFromDate } from '@/lib/astrology/sun-sign-from-date';

describe('sunSignFromDate', () => {
  test.each([
    ['2000-01-19', 'Capricorn'],
    ['2000-01-20', 'Aquarius'],
    ['2000-02-18', 'Aquarius'],
    ['2000-02-19', 'Pisces'],
    ['2000-03-20', 'Pisces'],
    ['2000-03-21', 'Aries'],
    ['2000-04-19', 'Aries'],
    ['2000-04-20', 'Taurus'],
    ['2000-05-20', 'Taurus'],
    ['2000-05-21', 'Gemini'],
    ['2000-06-20', 'Gemini'],
    ['2000-06-21', 'Cancer'],
    ['2000-07-22', 'Cancer'],
    ['2000-07-23', 'Leo'],
    ['2000-08-22', 'Leo'],
    ['2000-08-23', 'Virgo'],
    ['2000-09-22', 'Virgo'],
    ['2000-09-23', 'Libra'],
    ['2000-10-22', 'Libra'],
    ['2000-10-23', 'Scorpio'],
    ['2000-11-21', 'Scorpio'],
    ['2000-11-22', 'Sagittarius'],
    ['2000-12-21', 'Sagittarius'],
    ['2000-12-22', 'Capricorn'],
    ['2000-12-31', 'Capricorn'],
    ['2001-01-01', 'Capricorn'],
  ])('%s → %s', (input, expected) => {
    expect(sunSignFromDate(input)).toBe(expected);
  });

  test('returns null for invalid input', () => {
    expect(sunSignFromDate('not-a-date')).toBeNull();
  });
});
