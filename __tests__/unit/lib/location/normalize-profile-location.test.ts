import { normalizeProfileLocationTimezones } from '@/lib/location/normalize-profile-location';

describe('normalizeProfileLocationTimezones', () => {
  it('corrects stale current-location timezone from coordinates', () => {
    const location = normalizeProfileLocationTimezones({
      latitude: 51.26932405022772,
      longitude: 1.097077819950983,
      city: 'Canterbury',
      timezone: 'America/New_York',
    });

    expect(location.timezone).toBe('Europe/London');
  });

  it('fills missing birth timezone from saved birth coordinates', () => {
    const location = normalizeProfileLocationTimezones({
      birthCoordinates: { latitude: 51.5074, longitude: -0.1278 },
    });

    expect(location.birthTimezone).toBe('Europe/London');
  });
});
