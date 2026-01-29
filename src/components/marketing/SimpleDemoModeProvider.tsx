'use client';

import { createContext, useContext, ReactNode, useEffect } from 'react';

interface DemoModeContextValue {
  isDemoMode: boolean;
}

const DemoModeContext = createContext<DemoModeContextValue>({
  isDemoMode: true,
});

export function useDemoMode() {
  return useContext(DemoModeContext);
}

/**
 * Simplified demo mode provider for iframe usage.
 *
 * Since we're in an isolated iframe, we don't need:
 * - Math.random override (natural isolation)
 * - Complex event interception (scoped automatically)
 * - DOM-based checks (iframe is the entire context)
 *
 * We only need the fetch override for API blocking.
 */

// Simple fetch override - only blocks specific APIs
if (typeof window !== 'undefined' && !window.__DEMO_FETCH_OVERRIDDEN__) {
  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input instanceof Request
            ? input.url
            : String(input);

    // Block most API calls except allowed ones
    const allowedEndpoints = [
      '/api/cosmic/global',
      '/api/grimoire/spells',
      '/api/horoscope/daily',
    ];

    const isAllowed = allowedEndpoints.some((endpoint) =>
      url.includes(endpoint),
    );

    if (isAllowed) {
      return originalFetch(input, init);
    }

    // Block everything else silently
    if (url.includes('/api/')) {
      return new Response(
        JSON.stringify({ error: 'Demo mode - API blocked' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Allow non-API requests
    return originalFetch(input, init);
  };

  window.__DEMO_FETCH_OVERRIDDEN__ = true;
}

interface SimpleDemoModeProviderProps {
  children: ReactNode;
}

export function SimpleDemoModeProvider({
  children,
}: SimpleDemoModeProviderProps) {
  useEffect(() => {
    // Notify parent iframe is ready
    const timer = setTimeout(() => {
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'DEMO_IFRAME_READY' }, '*');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <DemoModeContext.Provider value={{ isDemoMode: true }}>
      {children}
    </DemoModeContext.Provider>
  );
}
