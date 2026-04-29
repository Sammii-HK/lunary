import tzLookup from 'tz-lookup';

type LocationRecord = Record<string, any>;

const getTimezone = (latitude: unknown, longitude: unknown) => {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return undefined;
  }

  try {
    return tzLookup(latitude, longitude);
  } catch {
    return undefined;
  }
};

export function normalizeProfileLocationTimezones<
  T extends LocationRecord | null,
>(location: T): T {
  if (!location) return location;

  const currentTimezone = getTimezone(location.latitude, location.longitude);
  if (currentTimezone) {
    location.timezone = currentTimezone;
  }

  const birthCoordinates = location.birthCoordinates;
  if (
    birthCoordinates &&
    typeof birthCoordinates === 'object' &&
    !location.birthTimezone
  ) {
    const birthTimezone = getTimezone(
      birthCoordinates.latitude,
      birthCoordinates.longitude,
    );
    if (birthTimezone) {
      location.birthTimezone = birthTimezone;
    }
  }

  return location;
}
