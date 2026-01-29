'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { DemoBlockedModal } from './DemoBlockedModal';

interface DemoModeContextValue {
  isDemoMode: boolean;
  showBlockedAction: (action: string) => void;
}

const DemoModeContext = createContext<DemoModeContextValue>({
  isDemoMode: true,
  showBlockedAction: () => {},
});

export function useDemoMode() {
  return useContext(DemoModeContext);
}

// TypeScript declaration for demo mode flag
declare global {
  interface Window {
    __DEMO_FETCH_OVERRIDDEN__?: boolean;
  }
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
  const [showModal, setShowModal] = useState(false);
  const [blockedAction, setBlockedAction] = useState('This action');

  const showBlockedAction = (action: string) => {
    setBlockedAction(action);
    setShowModal(true);
  };

  // Notify parent iframe is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'DEMO_IFRAME_READY' }, '*');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Listen for blocked actions from fetch override or other sources
  useEffect(() => {
    const handleBlockedAction = (event: CustomEvent) => {
      showBlockedAction(event.detail?.action || 'This action');
    };

    window.addEventListener('demo-action-blocked' as any, handleBlockedAction);
    return () => {
      window.removeEventListener(
        'demo-action-blocked' as any,
        handleBlockedAction,
      );
    };
  }, []);

  return (
    <DemoModeContext.Provider value={{ isDemoMode: true, showBlockedAction }}>
      {children}
      <DemoBlockedModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        action={blockedAction}
      />
    </DemoModeContext.Provider>
  );
}
