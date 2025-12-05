/**
 * Feature Flags for Staged Rollout
 *
 * Environment Variables:
 * - ENABLE_POSTGRES_PROFILE: Use PostgreSQL for profile reads (default: true)
 * - MIGRATION_ROLLOUT_PERCENTAGE: Percentage of users on new system (0-100)
 */

export interface FeatureFlags {
  enablePostgresProfile: boolean;
  migrationRolloutPercentage: number;
  enableMigrationLogging: boolean;
}

const defaultFlags: FeatureFlags = {
  enablePostgresProfile: true,
  migrationRolloutPercentage: 100,
  enableMigrationLogging:
    process.env.NODE_ENV === 'development' ||
    process.env.ENABLE_MIGRATION_LOGGING === 'true',
};

export function getFeatureFlags(): FeatureFlags {
  return {
    enablePostgresProfile: process.env.ENABLE_POSTGRES_PROFILE !== 'false',
    migrationRolloutPercentage: parseInt(
      process.env.MIGRATION_ROLLOUT_PERCENTAGE || '100',
      10,
    ),
    enableMigrationLogging:
      process.env.NODE_ENV === 'development' ||
      process.env.ENABLE_MIGRATION_LOGGING === 'true',
  };
}

export function shouldUsePostgres(userId: string): boolean {
  const flags = getFeatureFlags();

  if (!flags.enablePostgresProfile) {
    return false;
  }

  if (flags.migrationRolloutPercentage >= 100) {
    return true;
  }

  if (flags.migrationRolloutPercentage <= 0) {
    return false;
  }

  const hash = simpleHash(userId);
  const userPercentile = hash % 100;

  return userPercentile < flags.migrationRolloutPercentage;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function logMigration(message: string, data?: any): void {
  const flags = getFeatureFlags();

  if (flags.enableMigrationLogging) {
    console.log(`[Migration] ${message}`, data || '');
  }
}

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

export function getEffectiveFlags(userId: string): FeatureFlags {
  const baseFlags = getFeatureFlags();
  const userOverrides = getUserOverrides(userId);

  if (userOverrides) {
    return { ...baseFlags, ...userOverrides };
  }

  return baseFlags;
}

export interface FeatureFlagContextValue {
  flags: FeatureFlags;
  isPostgresUser: boolean;
}

export function createFeatureFlagContext(
  userId: string,
): FeatureFlagContextValue {
  const flags = getEffectiveFlags(userId);

  return {
    flags,
    isPostgresUser: shouldUsePostgres(userId),
  };
}

export { defaultFlags };
