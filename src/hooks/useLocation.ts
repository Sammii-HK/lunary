'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'jazz-tools/react';
import {
  LocationData,
  requestLocation,
  getStoredLocation,
  storeLocation,
  getDefaultLocation,
} from '../../utils/location';

interface LocationState {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  hasPermission: boolean;
}

export const useLocation = () => {
  const { me } = useAccount();
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: false,
    error: null,
    hasPermission: false,
  });

  useEffect(() => {
    // First try to get from Jazz profile
    if (me?.profile) {
      const profileLocation = (me.profile as any)?.location;
      if (profileLocation) {
        const locationData: LocationData = {
          latitude: profileLocation.latitude,
          longitude: profileLocation.longitude,
          city: profileLocation.city,
          country: profileLocation.country,
          timezone: profileLocation.timezone,
        };
        setState((prev) => ({
          ...prev,
          location: locationData,
          hasPermission: true,
        }));
        return;
      }
    }

    // Fallback to localStorage
    const storedLocation = getStoredLocation();
    if (storedLocation) {
      setState((prev) => ({
        ...prev,
        location: storedLocation,
        hasPermission: true,
      }));
    } else {
      // Use default location
      setState((prev) => ({
        ...prev,
        location: getDefaultLocation(),
      }));
    }
  }, [me?.profile]);

  const saveLocationToProfile = useCallback(
    (location: LocationData) => {
      if (me?.profile) {
        try {
          (me.profile as any).$jazz.set('location', {
            latitude: location.latitude,
            longitude: location.longitude,
            city: location.city || undefined,
            country: location.country || undefined,
            timezone: location.timezone || undefined,
            lastUpdated: new Date().toISOString(),
          });
        } catch (error) {
          console.warn('Failed to save location to profile:', error);
        }
      }

      // Also save to localStorage as backup
      storeLocation(location);
    },
    [me?.profile],
  );

  const requestUserLocation = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const location = await requestLocation();
      saveLocationToProfile(location);
      setState((prev) => ({
        ...prev,
        location,
        loading: false,
        hasPermission: true,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error.message : 'Location request failed',
        location: getDefaultLocation(),
      }));
    }
  }, [saveLocationToProfile]);

  const updateLocation = useCallback(
    (newLocation: LocationData) => {
      saveLocationToProfile(newLocation);
      setState((prev) => ({
        ...prev,
        location: newLocation,
        hasPermission: true,
      }));
    },
    [saveLocationToProfile],
  );

  return {
    ...state,
    requestLocation: requestUserLocation,
    updateLocation,
    isLoggedIn: !!me,
  };
};
