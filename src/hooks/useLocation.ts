'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import {
  LocationData,
  ProfileLocationData,
  clearStoredLocation,
  getBirthLocationFallback,
  requestLocation,
  getStoredLocation,
  storeLocation,
  isDefaultLocation,
  normalizeKnownLocation,
  resolveCoordinateTimezone,
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
    let cancelled = false;

    const resolveLocation = async () => {
      const profileLocation = user?.location as ProfileLocationData | undefined;
      const profileCurrentLocation = normalizeKnownLocation(profileLocation);

      if (profileCurrentLocation && isDefaultLocation(profileCurrentLocation)) {
        clearStoredLocation();
      } else if (profileCurrentLocation) {
        const resolvedLocation = await resolveCoordinateTimezone(
          profileCurrentLocation,
        );
        if (cancelled) return;
        setState({
          location: resolvedLocation,
          loading: false,
          error: null,
          hasPermission: true,
        });
        storeLocation(resolvedLocation);
        return;
      }

      const storedLocation = getStoredLocation();
      if (storedLocation && isDefaultLocation(storedLocation)) {
        clearStoredLocation();
      } else {
        const normalizedStoredLocation = normalizeKnownLocation(storedLocation);
        if (normalizedStoredLocation) {
          const resolvedLocation = await resolveCoordinateTimezone(
            normalizedStoredLocation,
          );
          if (cancelled) return;
          setState({
            location: resolvedLocation,
            loading: false,
            error: null,
            hasPermission: true,
          });
          storeLocation(resolvedLocation);
          return;
        }
      }

      const birthLocation = await getBirthLocationFallback(profileLocation);
      if (birthLocation) {
        if (cancelled) return;
        setState({
          location: birthLocation,
          loading: false,
          error: null,
          hasPermission: true,
        });
        return;
      }

      if (cancelled) return;
      setState({
        location: null,
        loading: false,
        error: null,
        hasPermission: false,
      });
    };

    resolveLocation();

    return () => {
      cancelled = true;
    };
  }, [user?.location]);

  const normalizeCurrentLocation = useCallback((input: LocationData) => {
    return normalizeKnownLocation(input) ?? input;
  }, []);

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
      const normalizedLocation = await resolveCoordinateTimezone(
        normalizeCurrentLocation(location),
      );
      saveLocationToProfile(normalizedLocation);
      setState({
        location: normalizedLocation,
        loading: false,
        error: null,
        hasPermission: true,
      });
    } catch (error) {
      const birthLocation = await getBirthLocationFallback(
        user?.location as ProfileLocationData | undefined,
      );
      setState({
        location: birthLocation,
        loading: false,
        error:
          error instanceof Error ? error.message : 'Location request failed',
        hasPermission: Boolean(birthLocation),
      });
    }
  }, [saveLocationToProfile, normalizeCurrentLocation, user?.location]);

  const updateLocation = useCallback(
    async (newLocation: LocationData) => {
      const normalizedLocation = await resolveCoordinateTimezone(
        normalizeCurrentLocation(newLocation),
      );
      saveLocationToProfile(normalizedLocation);
      setState({
        location: normalizedLocation,
        loading: false,
        error: null,
        hasPermission: true,
      });
    },
    [saveLocationToProfile, normalizeCurrentLocation],
  );

  return {
    ...state,
    requestLocation: requestUserLocation,
    updateLocation,
    isLoggedIn: !!user,
  };
};
