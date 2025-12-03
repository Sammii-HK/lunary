'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
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
  const { user, refetch } = useUser();
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: true,
    error: null,
    hasPermission: false,
  });

  useEffect(() => {
    if (user?.location) {
      const locationData: LocationData = {
        latitude: user.location.latitude,
        longitude: user.location.longitude,
        city: user.location.city,
        country: user.location.country,
        timezone: user.location.timezone,
      };
      setState({
        location: locationData,
        loading: false,
        error: null,
        hasPermission: true,
      });
      storeLocation(locationData);
      return;
    }

    const storedLocation = getStoredLocation();
    if (storedLocation && storedLocation.latitude && storedLocation.longitude) {
      setState({
        location: storedLocation,
        loading: false,
        error: null,
        hasPermission: true,
      });
      return;
    }

    setState({
      location: getDefaultLocation(),
      loading: false,
      error: null,
      hasPermission: false,
    });
  }, [user?.location]);

  const saveLocationToProfile = useCallback(
    async (location: LocationData) => {
      try {
        await fetch('/api/profile/location', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            location: {
              latitude: location.latitude,
              longitude: location.longitude,
              city: location.city || undefined,
              country: location.country || undefined,
              timezone: location.timezone || undefined,
              lastUpdated: new Date().toISOString(),
            },
          }),
        });
        refetch();
      } catch {
        // Silently fail - localStorage backup will be used
      }
      storeLocation(location);
    },
    [refetch],
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
      setState({
        location,
        loading: false,
        error: null,
        hasPermission: true,
      });
    } catch (error) {
      setState({
        location: getDefaultLocation(),
        loading: false,
        error:
          error instanceof Error ? error.message : 'Location request failed',
        hasPermission: false,
      });
    }
  }, [saveLocationToProfile]);

  const updateLocation = useCallback(
    (newLocation: LocationData) => {
      saveLocationToProfile(newLocation);
      setState({
        location: newLocation,
        loading: false,
        error: null,
        hasPermission: true,
      });
    },
    [saveLocationToProfile],
  );

  return {
    ...state,
    requestLocation: requestUserLocation,
    updateLocation,
    isLoggedIn: !!user,
  };
};
