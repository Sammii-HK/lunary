'use client';

import { useState, useEffect } from 'react';
import { isFeatureEnabled, getFeatureFlag } from '@/lib/posthog-client';

export function useFeatureFlag(flag: string): boolean | undefined {
  const [enabled, setEnabled] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const checkFlag = () => {
      try {
        const result = isFeatureEnabled(flag);
        setEnabled(result);
      } catch (error) {
        // Silently fail and keep undefined state
        console.warn('Failed to check feature flag:', flag, error);
      }
    };

    checkFlag();

    const interval = setInterval(checkFlag, 1000);

    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [flag]);

  return enabled;
}

export function useFeatureFlagVariant(
  flag: string,
): string | boolean | undefined {
  const [variant, setVariant] = useState<string | boolean | undefined>(
    undefined,
  );

  useEffect(() => {
    const checkFlag = () => {
      try {
        const result = getFeatureFlag(flag);
        setVariant(result);
      } catch (error) {
        // Silently fail and keep undefined state
        console.warn('Failed to get feature flag:', flag, error);
      }
    };

    checkFlag();

    const interval = setInterval(checkFlag, 1000);

    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [flag]);

  return variant;
}

export function useFeatureFlagPayload<T = unknown>(
  flag: string,
): T | undefined {
  const [payload, setPayload] = useState<T | undefined>(undefined);

  useEffect(() => {
    const checkFlag = () => {
      if (typeof window === 'undefined') return;
      const posthog = (window as any).posthog;
      if (!posthog || typeof posthog.getFeatureFlagPayload !== 'function')
        return;

      const result = posthog.getFeatureFlagPayload(flag);
      setPayload(result as T);
    };

    checkFlag();

    const interval = setInterval(checkFlag, 1000);

    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [flag]);

  return payload;
}
