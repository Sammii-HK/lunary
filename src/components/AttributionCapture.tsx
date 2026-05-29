'use client';

import { useEffect, useRef } from 'react';
import { useAuthStatus } from '@/components/AuthStatus';
import { getAnonymousId } from '@/lib/analytics';
import {
  getAttributionForTracking,
  getStoredAttribution,
  initializeAttribution,
} from '@/lib/attribution';
import { storeReferralCodeFromUrl } from '@/lib/referrals/referral-link';

const ATTRIBUTION_SYNC_PREFIX = 'lunary_attribution_synced';

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

    // Capture any `?ref=` referral code on first load so shared links (e.g. a
    // friend's public `/me/[handle]` page or a referral CTA) attribute the
    // signup back to the sharer, regardless of which landing page they hit.
    // Previously only `/auth` and `/pricing` captured this.
    storeReferralCodeFromUrl();
  }, []);

  return null;
}

export function AttributionSync() {
  const { isAuthenticated, loading, user } = useAuthStatus();
  const syncInFlight = useRef(false);

  useEffect(() => {
    if (loading || !isAuthenticated || !user?.id || syncInFlight.current) {
      return;
    }

    const attribution = getStoredAttribution();
    if (!attribution) return;

    const syncKey = `${ATTRIBUTION_SYNC_PREFIX}:${user.id}`;
    try {
      if (window.localStorage.getItem(syncKey)) return;
    } catch {
      // localStorage can be blocked; still attempt the authenticated sync.
    }

    syncInFlight.current = true;
    fetch('/api/attribution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        userId: user.id,
        anonymous_id: getAnonymousId(),
        ...getAttributionForTracking(),
      }),
    })
      .then((response) => {
        if (!response.ok) return;
        try {
          window.localStorage.setItem(syncKey, '1');
        } catch {
          // Non-critical; a future mount may retry the same idempotent upsert.
        }
      })
      .catch(() => {})
      .finally(() => {
        syncInFlight.current = false;
      });
  }, [isAuthenticated, loading, user?.id]);

  return null;
}
