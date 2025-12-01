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
  const { me } = useAccount(); // Read-only for migration - data syncs to Postgres via useProfile
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: false,
    error: null,
    hasPermission: false,
  });

  useEffect(() => {
    // First try to get from Jazz profile (most reliable source)
    if (me?.profile) {
      const profileLocation = (me.profile as any)?.location;
      if (
        profileLocation &&
        profileLocation.latitude &&
        profileLocation.longitude
      ) {
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
        // Also update localStorage as backup
        storeLocation(locationData);
        return;
      }
    }

    // Fallback to localStorage (persists across sessions)
    const storedLocation = getStoredLocation();
    if (storedLocation && storedLocation.latitude && storedLocation.longitude) {
      setState((prev) => ({
        ...prev,
        location: storedLocation,
        hasPermission: true,
      }));
      return;
    }

    // Only use default location if no saved location exists
    // This prevents unnecessary location requests
    setState((prev) => ({
      ...prev,
      location: getDefaultLocation(),
      hasPermission: false, // Default location doesn't mean we have permission
    }));
  }, [me?.profile]);

  const saveLocationToProfile = useCallback(async (location: LocationData) => {
    // Save to Postgres only - no Jazz writes
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
    } catch (error) {
      console.warn('Failed to save location:', error);
    }

    // Save to localStorage as backup
    storeLocation(location);
  }, []);

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
