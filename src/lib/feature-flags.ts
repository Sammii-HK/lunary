/**
 * Feature Flags for Migration and Staged Rollout
 *
 * This module provides feature flags for controlling the Jazz to PostgreSQL migration
 * and enabling gradual rollout of new features.
 *
 * Environment Variables:
 * - ENABLE_POSTGRES_PROFILE: Use PostgreSQL for profile reads (default: true)
 * - ENABLE_DUAL_WRITE: Write to both Jazz and PostgreSQL (default: false)
 * - ENABLE_JAZZ_FALLBACK: Fallback to Jazz if PostgreSQL fails (default: false)
 * - MIGRATION_ROLLOUT_PERCENTAGE: Percentage of users on new system (0-100)
 * - FEATURE_FLAGS_OVERRIDE: JSON object to override flags for specific users
 */

export interface FeatureFlags {
  // Migration flags
  enablePostgresProfile: boolean;
  enableDualWrite: boolean;
  enableJazzFallback: boolean;

  // Rollout control
  migrationRolloutPercentage: number;

  // Feature-specific fallbacks
  fallbackBirthChart: boolean;
  fallbackPersonalCard: boolean;
  fallbackLocation: boolean;

  // Debug flags
  enableMigrationLogging: boolean;
}

// Default feature flag values
const defaultFlags: FeatureFlags = {
  enablePostgresProfile: true, // PostgreSQL is now the primary
  enableDualWrite: false, // Dual-write disabled by default
  enableJazzFallback: false, // No Jazz fallback (Jazz removed)
  migrationRolloutPercentage: 100, // 100% on PostgreSQL
  fallbackBirthChart: false,
  fallbackPersonalCard: false,
  fallbackLocation: false,
  enableMigrationLogging:
    process.env.NODE_ENV === 'development' ||
    process.env.ENABLE_MIGRATION_LOGGING === 'true',
};

/**
 * Get feature flags from environment variables
 */
export function getFeatureFlags(): FeatureFlags {
  return {
    enablePostgresProfile: process.env.ENABLE_POSTGRES_PROFILE !== 'false',
    enableDualWrite: process.env.ENABLE_DUAL_WRITE === 'true',
    enableJazzFallback: process.env.ENABLE_JAZZ_FALLBACK === 'true',
    migrationRolloutPercentage: parseInt(
      process.env.MIGRATION_ROLLOUT_PERCENTAGE || '100',
      10,
    ),
    fallbackBirthChart: process.env.FALLBACK_BIRTH_CHART === 'true',
    fallbackPersonalCard: process.env.FALLBACK_PERSONAL_CARD === 'true',
    fallbackLocation: process.env.FALLBACK_LOCATION === 'true',
    enableMigrationLogging:
      process.env.NODE_ENV === 'development' ||
      process.env.ENABLE_MIGRATION_LOGGING === 'true',
  };
}

/**
 * Check if a specific user should use the new PostgreSQL system
 * based on rollout percentage.
 *
 * Uses a deterministic hash of the user ID to ensure consistent
 * assignment across requests.
 */
export function shouldUsePostgres(userId: string): boolean {
  const flags = getFeatureFlags();

  // If PostgreSQL is disabled, always return false
  if (!flags.enablePostgresProfile) {
    return false;
  }

  // If rollout is 100%, everyone uses PostgreSQL
  if (flags.migrationRolloutPercentage >= 100) {
    return true;
  }

  // If rollout is 0%, no one uses PostgreSQL
  if (flags.migrationRolloutPercentage <= 0) {
    return false;
  }

  // Deterministic hash based on user ID
  const hash = simpleHash(userId);
  const userPercentile = hash % 100;

  return userPercentile < flags.migrationRolloutPercentage;
}

/**
 * Simple hash function for deterministic user assignment
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Check if dual-write is enabled
 */
export function isDualWriteEnabled(): boolean {
  return getFeatureFlags().enableDualWrite;
}

/**
 * Check if Jazz fallback is enabled
 */
export function isJazzFallbackEnabled(): boolean {
  return getFeatureFlags().enableJazzFallback;
}

/**
 * Check if a specific feature should use fallback mode
 */
export function shouldUseFallback(
  feature: 'birthChart' | 'personalCard' | 'location',
): boolean {
  const flags = getFeatureFlags();

  switch (feature) {
    case 'birthChart':
      return flags.fallbackBirthChart;
    case 'personalCard':
      return flags.fallbackPersonalCard;
    case 'location':
      return flags.fallbackLocation;
    default:
      return false;
  }
}

/**
 * Log migration-related events (only in development or when enabled)
 */
export function logMigration(message: string, data?: any): void {
  const flags = getFeatureFlags();

  if (flags.enableMigrationLogging) {
    console.log(`[Migration] ${message}`, data || '');
  }
}

/**
 * Get user-specific feature flag overrides from environment
 */
export function getUserOverrides(userId: string): Partial<FeatureFlags> | null {
  try {
    const overridesJson = process.env.FEATURE_FLAGS_OVERRIDE;
    if (!overridesJson) return null;

    const overrides = JSON.parse(overridesJson);
    return overrides[userId] || null;
  } catch {
    return null;
  }
}

/**
 * Get effective feature flags for a specific user
 */
export function getEffectiveFlags(userId: string): FeatureFlags {
  const baseFlags = getFeatureFlags();
  const userOverrides = getUserOverrides(userId);

  if (userOverrides) {
    return { ...baseFlags, ...userOverrides };
  }

  return baseFlags;
}

/**
 * Feature flag context for React components
 */
export interface FeatureFlagContextValue {
  flags: FeatureFlags;
  isPostgresUser: boolean;
  shouldUseFallback: (
    feature: 'birthChart' | 'personalCard' | 'location',
  ) => boolean;
}

/**
 * Create feature flag context value for a user
 */
export function createFeatureFlagContext(
  userId: string,
): FeatureFlagContextValue {
  const flags = getEffectiveFlags(userId);

  return {
    flags,
    isPostgresUser: shouldUsePostgres(userId),
    shouldUseFallback: (feature) => {
      const flagKey =
        `fallback${feature.charAt(0).toUpperCase() + feature.slice(1)}` as keyof FeatureFlags;
      return !!flags[flagKey];
    },
  };
}

// Export default flags for testing
export { defaultFlags };
