/**
 * useHaptic - React hook for haptic feedback
 *
 * Provides memoized haptic feedback functions for use in components.
 * Safe to use on web - no-ops when not on native platform.
 *
 * Usage:
 *   const haptic = useHaptic();
 *
 *   <button onClick={() => { haptic.light(); handleClick(); }}>
 *     Navigate
 *   </button>
 *
 *   const handleSave = async () => {
 *     try {
 *       await save();
 *       haptic.success();
 *     } catch {
 *       haptic.error();
 *     }
 *   };
 */

'use client';

import { useCallback } from 'react';
import { hapticService } from '@/services/native/haptic-service';

export function useHaptic() {
  return {
    /**
     * Light impact - button taps, toggles, navigation
     */
    light: useCallback(() => hapticService.light(), []),

    /**
     * Medium impact - card reveals, selections, confirmations
     */
    medium: useCallback(() => hapticService.medium(), []),

    /**
     * Heavy impact - milestones, celebrations, major events
     */
    heavy: useCallback(() => hapticService.heavy(), []),

    /**
     * Success notification - save complete, action succeeded
     */
    success: useCallback(() => hapticService.success(), []),

    /**
     * Warning notification - challenging transit, attention needed
     */
    warning: useCallback(() => hapticService.warning(), []),

    /**
     * Error notification - failed action, network error
     */
    error: useCallback(() => hapticService.error(), []),

    /**
     * Selection changed - swiping through items, picker changes
     */
    selection: useCallback(() => hapticService.selection(), []),

    /**
     * Single selection tick - for continuous selection feedback
     */
    selectionTick: useCallback(() => hapticService.selectionTick(), []),
  };
}
