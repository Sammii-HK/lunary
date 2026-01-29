'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';

interface DemoNavigationContextValue {
  isDemoMode: boolean;
  onNavigate?: (path: string) => void;
}

const DemoNavigationContext = createContext<DemoNavigationContextValue>({
  isDemoMode: false,
});

export function useDemoNavigation() {
  return useContext(DemoNavigationContext);
}

interface DemoNavigationProviderProps {
  children: ReactNode;
  onNavigate?: (path: string) => void;
  containerId?: string;
}

/**
 * Intercepts navigation ONLY within the demo container
 * IMPORTANT: Event listeners are scoped to container, not global
 */
export function DemoNavigationProvider({
  children,
  onNavigate,
  containerId = 'demo-preview-container',
}: DemoNavigationProviderProps) {
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Intercept link clicks ONLY within the demo container
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Only handle events within our container
      if (!container.contains(target)) return;

      // If the click originated from a button, let the button handle it first
      // (important for buttons like ritual complete that are inside links)
      const button = target.closest('button');
      if (button) {
        return; // Let button's onClick handler run instead of intercepting
      }

      const link = target.closest('a');

      if (link && link.href) {
        const url = new URL(link.href, window.location.origin);

        // Allow external links to open in new tab
        if (url.origin !== window.location.origin) {
          return;
        }

        // Check if it's a navigation link (not anchor or download)
        if (
          !link.hasAttribute('download') &&
          !link.href.startsWith('#') &&
          !link.target
        ) {
          e.preventDefault();
          e.stopPropagation();

          const path = url.pathname;

          // Try to handle navigation within the mini app
          if (onNavigate) {
            onNavigate(path);
          } else {
            // Default: show alert
            alert('Navigation not available in demo preview');
          }
        }
      }
    };

    // Intercept button clicks that might trigger navigation
    const handleButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Only handle events within our container
      if (!container.contains(target)) return;

      const button = target.closest('button');

      if (button) {
        // Check if button has data attributes that indicate navigation
        const navigateTo = button.getAttribute('data-navigate');
        if (navigateTo) {
          e.preventDefault();
          e.stopPropagation();

          if (onNavigate) {
            onNavigate(navigateTo);
          } else {
            alert('Navigation not available in demo preview');
          }
        }
      }
    };

    container.addEventListener('click', handleClick, true);
    container.addEventListener('click', handleButtonClick, true);

    return () => {
      container.removeEventListener('click', handleClick, true);
      container.removeEventListener('click', handleButtonClick, true);
    };
  }, [onNavigate, containerId]);

  return (
    <DemoNavigationContext.Provider value={{ isDemoMode: true, onNavigate }}>
      {children}
    </DemoNavigationContext.Provider>
  );
}
