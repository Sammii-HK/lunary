'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  maxPull?: number;
  disabled?: boolean;
}

interface PullToRefreshState {
  pullDistance: number;
  isRefreshing: boolean;
  isPulling: boolean;
}

/**
 * Hook for pull-to-refresh gesture on touch devices.
 * Attach the returned ref to the scrollable container.
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPull = 120,
  disabled = false,
}: UsePullToRefreshOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isPullingRef = useRef(false);

  const [state, setState] = useState<PullToRefreshState>({
    pullDistance: 0,
    isRefreshing: false,
    isPulling: false,
  });

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || state.isRefreshing) return;

      const container = containerRef.current;
      if (!container) return;

      // Only activate when scrolled to the top
      const scrollTop = container.scrollTop || window.scrollY;
      if (scrollTop > 0) return;

      startY.current = e.touches[0].clientY;
      isPullingRef.current = true;
    },
    [disabled, state.isRefreshing],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPullingRef.current || disabled || state.isRefreshing) return;

      currentY.current = e.touches[0].clientY;
      const distance = currentY.current - startY.current;

      // Only pull down, not up
      if (distance <= 0) {
        setState((prev) => ({ ...prev, pullDistance: 0, isPulling: false }));
        return;
      }

      // Apply resistance curve (diminishing returns as you pull further)
      const dampened = Math.min(distance * 0.5, maxPull);

      setState((prev) => ({
        ...prev,
        pullDistance: dampened,
        isPulling: true,
      }));

      // Prevent default scrolling while pulling
      if (dampened > 10) {
        e.preventDefault();
      }
    },
    [disabled, maxPull, state.isRefreshing],
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPullingRef.current) return;
    isPullingRef.current = false;

    const distance = state.pullDistance;

    if (distance >= threshold && !state.isRefreshing) {
      setState({
        pullDistance: threshold,
        isRefreshing: true,
        isPulling: false,
      });

      try {
        await onRefresh();
      } finally {
        setState({ pullDistance: 0, isRefreshing: false, isPulling: false });
      }
    } else {
      setState({ pullDistance: 0, isRefreshing: false, isPulling: false });
    }
  }, [onRefresh, state.pullDistance, state.isRefreshing, threshold]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });
    container.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    containerRef,
    ...state,
    progress: Math.min(state.pullDistance / threshold, 1),
  };
}
