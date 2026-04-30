import { Observer } from 'astronomy-engine';
import { calculateSunMoon, formatTime } from 'utils/astrology/ephemeris';

describe('sun and moon local timing', () => {
  it('formats London sunrise in the coordinate timezone, not New York time', () => {
    const timing = calculateSunMoon(
      new Observer(51.5074, -0.1278, 0),
      new Date('2026-04-29T12:00:00.000Z'),
      'Europe/London',
    );

    expect(formatTime(timing.sunrise, 'Europe/London')).toMatch(/^0[45]:/);
    expect(formatTime(timing.sunrise, 'America/New_York')).toMatch(/^00:/);
  });
});
