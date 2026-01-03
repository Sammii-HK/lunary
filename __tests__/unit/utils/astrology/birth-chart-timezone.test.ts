import { __test__ } from 'utils/astrology/birthChart';

describe('birth chart timezone conversion', () => {
  it('converts US time zones to UTC correctly', () => {
    const date = __test__.toUtcFromTimeZone(
      1990,
      5,
      15,
      14,
      30,
      'America/New_York',
    );

    expect(date.toISOString()).toBe('1990-05-15T18:30:00.000Z');
  });
});
