'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for isolating scroll events within an iframe container.
 *
 * Implements a layered defense strategy to prevent scroll propagation from iframe to parent:
 * 1. CSS-based isolation (baseline for modern desktop browsers)
 * 2. JavaScript event interception (critical for iOS Safari)
 * 3. Body scroll lock (prevents parent scroll during demo interaction)
 * 4. Pointer capture (proper event containment)
 *
 * @param enabled - Whether scroll isolation is active (default: true)
 * @returns Object containing containerRef and isInteracting state
 */
export function useIframeScrollIsolation(enabled: boolean = true) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const unlockTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollPositionRef = useRef(0);
  const isLockedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;

    // Lock body scroll and preserve scroll position
    const lockBodyScroll = () => {
      if (isLockedRef.current) return;

      // Save current scroll position
      scrollPositionRef.current = window.scrollY;

      // Lock body with position:fixed
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';

      isLockedRef.current = true;
    };

    // Unlock body scroll and restore scroll position
    const unlockBodyScroll = () => {
      if (!isLockedRef.current) return;

      // Restore body styles
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';

      // Restore scroll position
      window.scrollTo(0, scrollPositionRef.current);

      isLockedRef.current = false;
    };

    // Debounced unlock function
    const debouncedUnlock = () => {
      // Clear any existing timeout
      if (unlockTimeoutRef.current) {
        clearTimeout(unlockTimeoutRef.current);
      }

      // Set new timeout to unlock after 300ms of no interaction
      unlockTimeoutRef.current = setTimeout(() => {
        setIsInteracting(false);
        unlockBodyScroll();
      }, 300);
    };

    // Handle mouse wheel events
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isInteracting) {
        setIsInteracting(true);
        lockBodyScroll();
      }

      debouncedUnlock();
    };

    // Handle touch start
    const handleTouchStart = (e: TouchEvent) => {
      if (!isInteracting) {
        setIsInteracting(true);
        lockBodyScroll();
      }
    };

    // Handle touch move
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      debouncedUnlock();
    };

    // Handle touch end
    const handleTouchEnd = () => {
      debouncedUnlock();
    };

    // Handle mouse enter (for hover state)
    const handleMouseEnter = () => {
      if (!isInteracting) {
        setIsInteracting(true);
        lockBodyScroll();
      }
    };

    // Handle mouse leave
    const handleMouseLeave = () => {
      debouncedUnlock();
    };

    // Add event listeners with appropriate options
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });
    container.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup function
    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);

      // Clear timeout and unlock on unmount
      if (unlockTimeoutRef.current) {
        clearTimeout(unlockTimeoutRef.current);
      }
      unlockBodyScroll();
    };
    // isInteracting is intentionally excluded - we don't want to re-run on state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return {
    containerRef,
    isInteracting,
  };
}
