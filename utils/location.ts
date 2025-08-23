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
  longitude: -74.0060,
  city: 'New York',
  country: 'United States',
  timezone: 'America/New_York',
};

export const getLocationPermissionStatus = async (): Promise<PermissionState> => {
  if (!navigator.permissions) {
    return 'prompt';
  }
  
  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
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
      }
    );
  });
};

const reverseGeocode = async (lat: number, lng: number): Promise<Partial<LocationData>> => {
  try {
    // Use OpenStreetMap Nominatim API for reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`,
      {
        headers: {
          'User-Agent': 'Lunary-Astrology-App/1.0'
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      const address = data.address || {};
      
      const city = address.city || address.town || address.village || address.suburb || address.neighbourhood;
      const country = address.country;
      
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      return {
        city,
        country,
        timezone,
      };
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
  return `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`;
}; 