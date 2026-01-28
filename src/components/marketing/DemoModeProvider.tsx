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
