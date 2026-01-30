/**
 * Smart Moon Cache with Percentage-Based Expiration
 *
 * Instead of fixed 1-hour cache that causes "jumps" at arbitrary times,
 * this calculates when illumination will reach the next integer percentage
 * and caches until then for smooth, natural updates.
 *
 * Example:
 * - At 50.8%, calculates when it will reach 51.0%
 * - Cache expires exactly when percentage increments
 * - User sees: 50% → 51% → 52% (smooth progression)
 * - No jumps at arbitrary hour boundaries
 */

import {
  getAccurateMoonPhase,
  formatSupermoonInfo,
  formatCacheInfo,
} from './astronomical-data';

export interface SmartMoonData {
  // Basic data
  name: string;
  energy: string;
  priority: number;
  emoji: string;
  illumination: number; // Integer %
  illuminationPrecise: number; // With decimals
  age: number;
  isSignificant: boolean;

  // Supermoon/distance data
  distanceKm: number;
  isSuperMoon: boolean;
  isMicroMoon: boolean;
  angularSize: number;

  // Smart cache data
  changeRatePerHour: number; // % change per hour
  nextPercentageIn: number; // Seconds until next integer %
  optimalCacheTTL: number; // Calculated cache duration
  phaseAngle: number;
  trend: 'waxing' | 'waning';
}

/**
 * Get moon data with smart cache that expires when percentage changes
 *
 * This is a thin wrapper around getAccurateMoonPhase that maintains
 * backward compatibility and provides a focused interface for smart caching.
 */
export function getSmartMoonData(date: Date = new Date()): SmartMoonData {
  return getAccurateMoonPhase(date);
}

// Re-export helper functions for convenience
export { formatSupermoonInfo, formatCacheInfo };
