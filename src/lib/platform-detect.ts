'use client';

import { Capacitor } from '@capacitor/core';

export type AppPlatform = 'web' | 'android' | 'ios' | 'pwa';

let cachedPlatform: AppPlatform | null = null;

/**
 * Detect the current app platform.
 * - Native iOS/Android via Capacitor
 * - PWA via display-mode: standalone
 * - Otherwise web
 */
export function detectPlatform(): AppPlatform {
  if (cachedPlatform !== null) return cachedPlatform;

  if (typeof window === 'undefined') {
    return 'web';
  }

  if (Capacitor.isNativePlatform()) {
    const native = Capacitor.getPlatform();
    cachedPlatform = native === 'ios' ? 'ios' : 'android';
  } else if (window.matchMedia('(display-mode: standalone)').matches) {
    cachedPlatform = 'pwa';
  } else {
    cachedPlatform = 'web';
  }

  return cachedPlatform;
}
