import { Observer } from 'astronomy-engine';

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  timezone?: string;
  accuracy?: number;
}

export interface LocationState {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  hasPermission: boolean;
}

const DEFAULT_LOCATION: LocationData = {
  latitude: 40.7128,
  longitude: -74.006,
  city: 'New York',
  country: 'United States',
  timezone: 'America/New_York',
};

export const getLocationPermissionStatus =
  async (): Promise<PermissionState> => {
    if (!navigator.permissions) {
      return 'prompt';
    }

    try {
      const permission = await navigator.permissions.query({
        name: 'geolocation',
      });
      return permission.state;
    } catch {
      return 'prompt';
    }
  };

export const requestLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        try {
          const locationInfo = await reverseGeocode(latitude, longitude);
          resolve({
            latitude,
            longitude,
            accuracy,
            ...locationInfo,
          });
        } catch {
          resolve({
            latitude,
            longitude,
            accuracy,
          });
        }
      },
      (error) => {
        let message = 'Location access failed';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    );
  });
};

export const parseCoordinates = (
  location: string,
): { latitude: number; longitude: number } | null => {
  const trimmed = location.trim();
  if (!trimmed) return null;

  const parseCoordinateToken = (token: string): number | null => {
    const value = token.trim();
    if (!value) return null;

    const decimalHemisphereMatch = value.match(
      /^(-?\d+(?:\.\d+)?)\s*([NSEW])$/i,
    );
    if (decimalHemisphereMatch) {
      const numeric = Number.parseFloat(decimalHemisphereMatch[1]);
      if (!Number.isFinite(numeric)) return null;
      const hemisphere = decimalHemisphereMatch[2].toUpperCase();
      const magnitude = Math.abs(numeric);
      return hemisphere === 'S' || hemisphere === 'W' ? -magnitude : magnitude;
    }

    const dmsMatch = value.match(
      /^(\d{1,3})\s*(?:\u00b0|\u00ba)\s*(\d{1,2})?\s*(?:'|\u2032)?\s*(\d{1,2}(?:\.\d+)?)?\s*(?:\"|\u2033)?\s*([NSEW])$/i,
    );
    if (dmsMatch) {
      const degrees = Number.parseFloat(dmsMatch[1]);
      const minutes = dmsMatch[2] ? Number.parseFloat(dmsMatch[2]) : 0;
      const seconds = dmsMatch[3] ? Number.parseFloat(dmsMatch[3]) : 0;
      if (![degrees, minutes, seconds].every(Number.isFinite)) return null;
      const hemisphere = dmsMatch[4].toUpperCase();
      const magnitude = degrees + minutes / 60 + seconds / 3600;
      return hemisphere === 'S' || hemisphere === 'W' ? -magnitude : magnitude;
    }

    return null;
  };

  const decimalPairMatch = trimmed.match(
    /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/,
  );
  if (decimalPairMatch) {
    return {
      latitude: Number.parseFloat(decimalPairMatch[1]),
      longitude: Number.parseFloat(decimalPairMatch[2]),
    };
  }

  const decimalPairSpaceMatch = trimmed.match(
    /^(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)$/,
  );
  if (decimalPairSpaceMatch) {
    return {
      latitude: Number.parseFloat(decimalPairSpaceMatch[1]),
      longitude: Number.parseFloat(decimalPairSpaceMatch[2]),
    };
  }

  if (trimmed.includes(',')) {
    const [latToken, lonToken] = trimmed.split(',', 2);
    const latitude = parseCoordinateToken(latToken);
    const longitude = parseCoordinateToken(lonToken);
    if (latitude !== null && longitude !== null) {
      return { latitude, longitude };
    }
  }

  const directionalTokens = trimmed.match(
    /(?:[0-9.\s\u00b0\u00ba'"\u2032\u2033]+[NSEW])/gi,
  );
  if (directionalTokens && directionalTokens.length >= 2) {
    const latitude = parseCoordinateToken(directionalTokens[0]);
    const longitude = parseCoordinateToken(directionalTokens[1]);
    if (latitude !== null && longitude !== null) {
      return { latitude, longitude };
    }
  }

  return null;
};

export const geocodeLocation = async (
  location: string,
): Promise<Pick<LocationData, 'latitude' | 'longitude'> | null> => {
  if (!location) return null;

  const coords = parseCoordinates(location);
  if (coords) return coords;

  try {
    const response = await fetch(
      `/api/location/geocode?q=${encodeURIComponent(location)}`,
    );

    if (response.ok) {
      const data = (await response.json()) as {
        latitude?: number;
        longitude?: number;
      };
      if (
        typeof data.latitude === 'number' &&
        typeof data.longitude === 'number'
      ) {
        return { latitude: data.latitude, longitude: data.longitude };
      }
    }
  } catch {
    // Fall back below
  }

  return null;
};

const reverseGeocode = async (
  lat: number,
  lng: number,
): Promise<Partial<LocationData>> => {
  try {
    const response = await fetch(`/api/location/reverse?lat=${lat}&lon=${lng}`);

    if (response.ok) {
      const data = await response.json();
      if (data?.city || data?.country || data?.timezone) {
        return {
          city: data.city,
          country: data.country,
          timezone: data.timezone,
        };
      }
    }
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
  }

  // Fallback to just timezone
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return { timezone };
  } catch {
    return {};
  }
};

export const locationToObserver = (location: LocationData): Observer =>
  new Observer(location.latitude, location.longitude, 0);

export const getStoredLocation = (): LocationData | null => {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem('user_location');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// User's current location stored for astronomy accuracy (moon phases, planetary positions)
// User-consented data for personalized cosmic calculations, not tracking
// lgtm[js/clear-text-storage-of-sensitive-data]
export const storeLocation = (location: LocationData): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('user_location', JSON.stringify(location));
  } catch {
    console.warn('Failed to store location');
  }
};

export const clearStoredLocation = (): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('user_location');
  } catch {
    console.warn('Failed to clear stored location');
  }
};

export const getDefaultLocation = (): LocationData => DEFAULT_LOCATION;

export const formatLocation = (location: LocationData): string => {
  if (location.city && location.country) {
    return `${location.city}, ${location.country}`;
  }
  if (location.city) {
    return location.city;
  }
  const formatCoord = (value: unknown) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return null;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  const latText = formatCoord(location.latitude);
  const lonText = formatCoord(location.longitude);
  if (latText && lonText) {
    return `${latText}, ${lonText}`;
  }
  return 'Location pending update';
};
