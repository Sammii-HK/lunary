'use client';

import { useEffect, useState } from 'react';

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
};

type NavigatorWithHints = Navigator & {
  connection?: NetworkInformation;
  deviceMemory?: number;
};

/**
 * Gates scroll/reveal animations behind user preferences and device capability.
 *
 * Returns `false` during SSR and on initial mount, so children should render
 * in their resting (visible) state by default. Animations opt IN only when:
 *   - the user has not requested reduced motion
 *   - the network is not in data-saver mode
 *   - the effective connection type is 4g or better (or unknown)
 *   - the device reports at least 4GB of memory (or doesn't expose the API)
 *
 * Re-evaluates when `prefers-reduced-motion` changes at runtime.
 */
export function useMotionEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const nav = navigator as NavigatorWithHints;
    const conn = nav.connection;
    const mem = nav.deviceMemory;

    const slowTypes = new Set(['slow-2g', '2g', '3g']);

    const compute = () =>
      !mql.matches &&
      !conn?.saveData &&
      !(conn?.effectiveType && slowTypes.has(conn.effectiveType)) &&
      (mem === undefined || mem >= 4);

    setEnabled(compute());

    const onChange = () => setEnabled(compute());
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return enabled;
}
