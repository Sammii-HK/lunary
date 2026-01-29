/**
 * Helper functions for determining user's effective timezone and location
 * for astronomical calculations and daily content generation
 */

import type { UserData } from '@/context/UserContext';

export interface UserObserverLocation {
  latitude: number;
  longitude: number;
  elevation: number;
  source: 'current' | 'birth' | 'default';
}

/**
 * Get user's effective location for astronomical calculations
 * Priority: Current location > Birth location > Default (Greenwich)
 */
export function getUserObserverLocation(
  user: UserData | null,
): UserObserverLocation {
  // Check for current location
  const location = user?.location as any;
  if (location?.currentLocation) {
    const lat = location.currentLocation.latitude;
    const lng = location.currentLocation.longitude;
    if (typeof lat === 'number' && typeof lng === 'number') {
      return {
        latitude: lat,
        longitude: lng,
        elevation: location.currentLocation.elevation || 0,
        source: 'current',
      };
    }
  }

  // Fall back to birth location
  if (location?.birthLocation) {
    const lat = location.birthLocation.latitude;
    const lng = location.birthLocation.longitude;
    if (typeof lat === 'number' && typeof lng === 'number') {
      return {
        latitude: lat,
        longitude: lng,
        elevation: location.birthLocation.elevation || 0,
        source: 'birth',
      };
    }
  }

  // Default to Greenwich (0, 0)
  return {
    latitude: 51.4769, // Greenwich
    longitude: 0.0,
    elevation: 0,
    source: 'default',
  };
}

/**
 * Get timezone identifier for the user
 * Uses browser's timezone (which respects device settings)
 * This determines when "midnight" occurs for daily content refresh
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

/**
 * Get user's timezone offset in hours
 */
export function getUserTimezoneOffset(): number {
  return -new Date().getTimezoneOffset() / 60;
}
