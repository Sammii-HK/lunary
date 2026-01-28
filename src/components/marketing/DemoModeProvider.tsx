'use client';

import { createContext, useContext, ReactNode, useEffect, useRef } from 'react';

interface DemoModeContextValue {
  isDemoMode: boolean;
}

const DemoModeContext = createContext<DemoModeContextValue>({
  isDemoMode: false,
});

export function useDemoMode() {
  return useContext(DemoModeContext);
}

// CRITICAL: Override fetch at module level BEFORE any components render
// This ensures ALL fetch calls are intercepted, even those made during initial render
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  const fetchCache = new Map<string, Response>();
  let isOverridden = false;

  if (!isOverridden) {
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      // Extract URL string from all possible input types
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input instanceof Request
              ? input.url
              : String(input);

      // Check if we're in demo mode using global flag (more reliable than DOM check)
      const isDemoMode =
        (window as any).__LUNARY_DEMO_MODE__ === true ||
        document.getElementById('demo-preview-container') !== null;
      if (!isDemoMode) {
        return originalFetch(input, init);
      }

      // BLOCK auth session calls
      if (url.includes('/api/auth')) {
        return new Response(
          JSON.stringify({
            isAuthenticated: true,
            user: { id: 'demo', email: 'demo@lunary.app' },
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }

      // BLOCK analytics and notifications
      if (
        url.includes('/api/analytics') ||
        url.includes('/api/admin/notifications')
      ) {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // BLOCK tarot readings, horoscope, and other user-specific endpoints
      if (
        url.includes('/api/tarot/readings') ||
        url.includes('/api/horoscope/daily') ||
        url.includes('/api/journal') ||
        url.includes('/api/patterns')
      ) {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Allow only safe, public API calls
      const allowedEndpoints = ['/api/cosmic/global', '/api/grimoire/spells'];
      const isAllowed = allowedEndpoints.some((endpoint) =>
        url.includes(endpoint),
      );

      if (isAllowed) {
        // Cache GET requests
        if (!init || init.method === 'GET' || !init.method) {
          if (fetchCache.has(url)) {
            const cached = fetchCache.get(url)!;
            return cached.clone();
          }

          const response = await originalFetch(input, init);
          const cloned = response.clone();
          fetchCache.set(url, cloned);
          return response;
        }
        return originalFetch(input, init);
      }

      // Block everything else
      return new Response(
        JSON.stringify({ error: 'Demo mode - API call blocked' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    };

    isOverridden = true;
  }
}

interface DemoModeProviderProps {
  children: ReactNode;
  containerId?: string; // ID of the container to scope event listeners to
}

/**
 * Provides demo mode context to disable write operations
 * IMPORTANT: Event listeners are scoped to the container only (not global)
 */
export function DemoModeProvider({
  children,
  containerId = 'demo-preview-container',
}: DemoModeProviderProps) {
  const containerRef = useRef<HTMLElement | null>(null);

  // Override Math.random in demo mode to make it deterministic
  // This prevents Transit Wisdom suggestions from cycling on each render
  useEffect(() => {
    // Defer this to after initial render for faster load
    const timer = setTimeout(() => {
      // Return a fixed sequence of pseudo-random values
      // This makes selections consistent across renders
      let callCount = 0;
      const fixedValues = [0.42, 0.17, 0.89, 0.63, 0.28, 0.75, 0.51, 0.94];

      Math.random = () => {
        const value = fixedValues[callCount % fixedValues.length];
        callCount++;
        return value;
      };
    }, 100);

    return () => {
      clearTimeout(timer);
      // Note: Math.random override persists in demo mode (no cleanup needed)
    };
  }, []);

  // Note: Fetch interception happens at module level (see top of file)
  // No need for useEffect/useLayoutEffect - it's applied before any components render

  // Intercept form submissions ONLY within the demo container
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;
    containerRef.current = container;

    const handleSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement;

      // Only handle events within our container
      if (!container.contains(form)) return;

      // Allow certain forms (like filters, searches)
      if (form.hasAttribute('data-demo-allowed')) {
        return;
      }

      // Block all other form submissions
      e.preventDefault();
      e.stopPropagation();
      alert('Saving is not available in the demo preview');
    };

    container.addEventListener('submit', handleSubmit, true);

    return () => {
      container.removeEventListener('submit', handleSubmit, true);
    };
  }, [containerId]);

  // Intercept button clicks ONLY within the demo container
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Only handle events within our container
      if (!container.contains(target)) return;

      const button = target.closest('button');

      if (button) {
        const text = button.textContent?.toLowerCase() || '';
        const ariaLabel =
          button.getAttribute('aria-label')?.toLowerCase() || '';

        // Block buttons with save/create/add/update keywords
        const blockKeywords = [
          'save',
          'create',
          'add entry',
          'submit',
          'update',
          'delete',
        ];
        const shouldBlock = blockKeywords.some(
          (keyword) => text.includes(keyword) || ariaLabel.includes(keyword),
        );

        if (shouldBlock && !button.hasAttribute('data-demo-allowed')) {
          e.preventDefault();
          e.stopPropagation();
          alert('This action is not available in the demo preview');
        }
      }
    };

    container.addEventListener('click', handleClick, true);

    return () => {
      container.removeEventListener('click', handleClick, true);
    };
  }, [containerId]);

  return (
    <DemoModeContext.Provider value={{ isDemoMode: true }}>
      {children}
    </DemoModeContext.Provider>
  );
}
