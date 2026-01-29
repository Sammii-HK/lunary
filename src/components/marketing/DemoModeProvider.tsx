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
//
// DEMO MODE API POLICY:
// ✅ ALLOWED (with caching):
//    - /api/cosmic/global - planetary positions
//    - /api/grimoire/spells - moon spells
//    - /api/horoscope/daily - personalized horoscope preview
// ✅ ALLOWED (session-only, no persistence):
//    - POST /api/ritual/complete - marks ritual complete (UI only, resets on refresh)
// 🚫 BLOCKED (with user alerts):
//    - POST /api/journal - reflection/dream submissions
//    - POST /api/tarot/readings - pulling new tarot spreads
//    - PATCH /api/tarot/readings - modifying tarot readings
//    - DELETE /api/tarot/readings - deleting tarot readings
//    - POST /api/moon-circles/*/insights - sharing insights
//    - navigator.clipboard.writeText() - copying share links
//    - navigator.share() - native share dialog
//    - Social share links (Twitter, Facebook, Instagram, Threads, Bluesky, Reddit)
//    - Share button clicks
// 🚫 BLOCKED (silent):
//    - /api/auth/* - returns mock authenticated user
//    - /api/analytics/* - returns success
//    - /api/admin/notifications/* - returns success
//    - GET /api/tarot/readings - returns empty (shows pre-pulled demo spreads only)
//    - GET /api/journal - returns empty
//    - GET /api/patterns - returns empty
//    - All other endpoints - blocked with error message
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

      // BLOCK journal/reflection submissions (POST)
      if (url.includes('/api/journal') && init?.method === 'POST') {
        alert('Reflections cannot be saved in the demo preview');
        return new Response(
          JSON.stringify({ success: false, error: 'Demo mode' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } },
        );
      }

      // BLOCK moon circle insights sharing (POST)
      if (
        url.includes('/api/moon-circles') &&
        url.includes('/insights') &&
        init?.method === 'POST'
      ) {
        alert('Insights cannot be shared in the demo preview');
        return new Response(
          JSON.stringify({ success: false, error: 'Demo mode' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } },
        );
      }

      // BLOCK tarot spread pulls and modifications
      if (url.includes('/api/tarot/readings')) {
        const method = init?.method || 'GET';
        // Block POST (new spreads), PATCH (updates), DELETE (deletions)
        if (method === 'POST' || method === 'PATCH' || method === 'DELETE') {
          const action =
            method === 'POST'
              ? 'pulled'
              : method === 'DELETE'
                ? 'deleted'
                : 'modified';
          alert(`Tarot spreads cannot be ${action} in the demo preview`);
          return new Response(
            JSON.stringify({ success: false, error: 'Demo mode' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } },
          );
        }
      }

      // ALLOW ritual completion (POST) but return mock success - session only, doesn't persist
      if (url.includes('/api/ritual/complete') && init?.method === 'POST') {
        return new Response(
          JSON.stringify({
            success: true,
            ritualStreak: 1,
            longestRitualStreak: 1,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }

      // BLOCK GET requests to user-specific data (journal, patterns, tarot history)
      if (
        url.includes('/api/tarot/readings') ||
        url.includes('/api/journal') ||
        url.includes('/api/patterns')
      ) {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Allow safe, public API calls and personalized preview data (with caching)
      const allowedEndpoints = [
        '/api/cosmic/global',
        '/api/grimoire/spells',
        '/api/horoscope/daily', // Allow for personalized preview
      ];
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

  // Block clipboard and native share APIs in demo mode
  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    const originalClipboardWriteText = navigator.clipboard?.writeText;
    const originalShare = navigator.share;

    // Override clipboard.writeText to prevent copying share links
    if (
      navigator.clipboard &&
      typeof originalClipboardWriteText !== 'undefined'
    ) {
      navigator.clipboard.writeText = async (text: string) => {
        alert('Sharing is not available in the demo preview');
        throw new Error('Demo mode - clipboard blocked');
      };
    }

    // Override navigator.share to prevent native share dialog
    if (typeof originalShare !== 'undefined') {
      navigator.share = async (data?: ShareData) => {
        alert('Sharing is not available in the demo preview');
        throw new Error('Demo mode - sharing blocked');
      };
    }

    return () => {
      // Restore original functions
      if (
        navigator.clipboard &&
        typeof originalClipboardWriteText !== 'undefined'
      ) {
        navigator.clipboard.writeText = originalClipboardWriteText;
      }
      if (typeof originalShare !== 'undefined') {
        navigator.share = originalShare;
      }
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

      // Check for social share links (Twitter, Facebook, Instagram, etc.)
      const link = target.closest('a');
      if (link) {
        const href = link.getAttribute('href') || '';
        const socialDomains = [
          'twitter.com',
          'facebook.com',
          'instagram.com',
          'threads.net',
          'bsky.app',
          'reddit.com',
          'linkedin.com',
        ];
        const isSocialShare = socialDomains.some((domain) =>
          href.includes(domain),
        );

        if (isSocialShare) {
          e.preventDefault();
          e.stopPropagation();
          alert('Sharing is not available in the demo preview');
          return;
        }
      }

      const button = target.closest('button');

      if (button) {
        const text = button.textContent?.toLowerCase() || '';
        const ariaLabel =
          button.getAttribute('aria-label')?.toLowerCase() || '';

        // Block share buttons
        if (text.includes('share') || ariaLabel.includes('share')) {
          e.preventDefault();
          e.stopPropagation();
          alert('Sharing is not available in the demo preview');
          return;
        }

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
