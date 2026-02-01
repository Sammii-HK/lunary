'use client';

import { useEffect, useRef } from 'react';
import { initializeAttribution } from '@/lib/attribution';

/**
 * Captures attribution data (referrer, UTM params, landing page) on first page load.
 *
 * This runs independently of PostHog/cookie consent because:
 * - It only reads first-party data (document.referrer, URL params)
 * - It stores to localStorage, not external services
 * - Attribution is essential for understanding user acquisition
 *
 * Must be in root layout to capture before signup.
 */
export function AttributionCapture() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Capture attribution immediately on first page load
    // This ensures attribution is available for signup tracking
    initializeAttribution();
  }, []);

  return null;
}
