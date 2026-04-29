'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Network Information API connection types.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation
 */
export type EffectiveConnectionType = 'slow-2g' | '2g' | '3g' | '4g' | '5g';

type NetworkInformation = {
  effectiveType?: EffectiveConnectionType;
  saveData?: boolean;
  addEventListener?: (type: 'change', listener: () => void) => void;
  removeEventListener?: (type: 'change', listener: () => void) => void;
};

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
};

export type OfflineState = {
  /** True when the browser reports an online connection. */
  online: boolean;
  /** Connection class from `navigator.connection.effectiveType`, if available. */
  effectiveType?: EffectiveConnectionType;
  /** True when the user has data-saver enabled. */
  saveData?: boolean;
  /** True if the tab has been offline at any point during this session. */
  wasOffline: boolean;
};

function readConnection(): NetworkInformation | undefined {
  if (typeof navigator === 'undefined') return undefined;
  const nav = navigator as NavigatorWithConnection;
  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection;
}

function readSnapshot(): {
  online: boolean;
  effectiveType?: EffectiveConnectionType;
  saveData?: boolean;
} {
  if (typeof navigator === 'undefined') {
    return { online: true };
  }
  const conn = readConnection();
  return {
    online: navigator.onLine,
    effectiveType: conn?.effectiveType,
    saveData: conn?.saveData,
  };
}

/**
 * Subscribes to `online` / `offline` events and (when supported)
 * `navigator.connection` change events.
 *
 * SSR-safe: returns `online: true, wasOffline: false` on the server and on
 * the very first client render to avoid hydration mismatches; the post-mount
 * effect then reconciles with the real browser state.
 */
export function useOfflineState(): OfflineState {
  const [state, setState] = useState<OfflineState>({
    online: true,
    wasOffline: false,
  });
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const update = () => {
      const snap = readSnapshot();
      if (!snap.online) wasOfflineRef.current = true;
      setState({
        online: snap.online,
        effectiveType: snap.effectiveType,
        saveData: snap.saveData,
        wasOffline: wasOfflineRef.current,
      });
    };

    // Initial reconcile after mount (covers the "started offline" case too).
    update();

    window.addEventListener('online', update);
    window.addEventListener('offline', update);

    const conn = readConnection();
    conn?.addEventListener?.('change', update);

    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      conn?.removeEventListener?.('change', update);
    };
  }, []);

  return state;
}
