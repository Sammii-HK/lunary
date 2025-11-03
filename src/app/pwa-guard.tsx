'use client';

import { useEffect } from 'react';

// This component prevents redirects when in PWA mode
export function PWAGuard() {
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    const isPWA =
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (!isPWA) return; // Only protect when in PWA mode

    console.log('🔒 PWA Guard active - preventing redirects');

    // Prevent window.location.href changes
    const originalLocation = window.location;
    let preventRedirect = false;

    // Override window.location.href setter
    try {
      Object.defineProperty(window, 'location', {
        get: () => originalLocation,
        set: (value: string) => {
          console.error(
            '🚨 BLOCKED window.location change in PWA mode:',
            value,
          );
          console.trace();
          // Don't actually redirect - just log it
        },
        configurable: true,
      });
    } catch (e) {
      // Can't override location on some browsers
    }

    // Monitor for any attempts to navigate away
    window.addEventListener('beforeunload', (e) => {
      if (isPWA) {
        console.log('⚠️ beforeunload fired in PWA mode');
        // Don't prevent, but log it
      }
    });

    // Log if display mode changes
    const checkMode = () => {
      const stillPWA =
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;

      if (!stillPWA && isPWA) {
        console.error('🚨 PWA MODE LOST - Display mode changed to browser!');
        console.trace();
      }
    };

    const modeCheckInterval = setInterval(checkMode, 1000);

    return () => {
      clearInterval(modeCheckInterval);
    };
  }, []);

  return null;
}
