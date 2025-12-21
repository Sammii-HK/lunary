/**
 * Utility functions for consistent messaging across the app
 *
 * FREE features (just need account): birth_chart, moon_phases, general_horoscope, etc.
 * PAID features (need subscription): personalized_horoscope, personal_tarot, moon_circles, etc.
 */

import { FEATURE_ACCESS } from '../../utils/pricing';

/**
 * Check if a feature is free (just requires account) or paid (requires subscription)
 */
export function isFreeFeature(feature: string): boolean {
  return FEATURE_ACCESS.free.includes(feature);
}

/**
 * Get the appropriate button text based on feature type and user state
 */
export function getFeatureButtonText(
  feature: string | undefined,
  isAuthenticated: boolean,
  isSubscribed: boolean,
  isTrialActive: boolean,
  hasRequiredData?: boolean, // e.g., has birthday for birth chart features
): string {
  // If feature is free, just needs account
  if (feature && isFreeFeature(feature)) {
    if (!isAuthenticated) {
      return 'Sign up for free';
    }
    if (!hasRequiredData) {
      return 'Add your details'; // e.g., "Add your birthday"
    }
    return 'View'; // Already has access
  }

  // Paid feature - needs subscription
  if (!isAuthenticated) {
    return 'Sign up for free'; // They can sign up and get trial
  }
  if (isTrialActive) {
    return 'Continue Trial';
  }
  if (isSubscribed) {
    return 'View';
  }
  return 'Start Free Trial';
}

/**
 * Get the appropriate link text for features
 */
export function getFeatureLinkText(
  feature: string | undefined,
  isAuthenticated: boolean,
  isSubscribed: boolean,
  isTrialActive: boolean,
  hasRequiredData?: boolean,
): string {
  // If feature is free, just needs account
  if (feature && isFreeFeature(feature)) {
    if (!isAuthenticated) {
      return 'Get [feature]'; // Will be replaced with actual feature name
    }
    if (!hasRequiredData) {
      return 'Add your details';
    }
    return 'View';
  }

  // Paid feature - needs subscription
  if (!isAuthenticated) {
    return 'Sign up for free';
  }
  if (isTrialActive) {
    return 'Continue your trial';
  }
  if (isSubscribed) {
    return 'View';
  }
  return 'Upgrade to unlock';
}

/**
 * Get the appropriate href based on feature type and user state
 */
export function getFeatureHref(
  feature: string | undefined,
  isAuthenticated: boolean,
  hasRequiredData?: boolean,
  customAuthHref?: string,
  customDataHref?: string,
): string {
  // If feature is free, just needs account
  if (feature && isFreeFeature(feature)) {
    if (!isAuthenticated) {
      return customAuthHref || '/auth?signup=true';
    }
    if (!hasRequiredData) {
      return customDataHref || '/profile';
    }
    return '/app'; // Default app location
  }

  // Paid feature - needs subscription
  if (!isAuthenticated) {
    return customAuthHref || '/auth?signup=true';
  }
  return '/pricing';
}
