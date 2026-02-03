/**
 * Hook to sync cosmic data with native widgets
 *
 * This hook fetches the current cosmic state and sends it to native widgets
 * when the dashboard loads and when data changes.
 */

import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { widgetService, WidgetData } from '@/services/native/widget-service';

interface UseWidgetSyncOptions {
  enabled?: boolean;
}

export function useWidgetSync(options: UseWidgetSyncOptions = {}) {
  const { enabled = true } = options;
  const hasSynced = useRef(false);

  useEffect(() => {
    console.log(
      '[WidgetSync] Hook running, isNative:',
      Capacitor.isNativePlatform(),
      'enabled:',
      enabled,
      'platform:',
      Capacitor.getPlatform(),
    );

    // Only run on native platforms
    if (!Capacitor.isNativePlatform() || !enabled) {
      console.log('[WidgetSync] Skipping - not native or not enabled');
      return;
    }

    // Prevent duplicate syncs
    if (hasSynced.current) {
      console.log('[WidgetSync] Skipping - already synced');
      return;
    }

    async function syncWidgetData() {
      try {
        console.log('[WidgetSync] Starting widget sync...');

        // Fetch cosmic data from API
        const response = await fetch('/api/widget/sync', {
          credentials: 'include',
        });

        if (!response.ok) {
          console.warn('[WidgetSync] API returned error:', response.status);
          return;
        }

        const data: WidgetData = await response.json();
        console.log(
          '[WidgetSync] Fetched data:',
          JSON.stringify(data).slice(0, 200),
        );

        // Send to native widgets
        const result = await widgetService.updateWidgetData(data);
        console.log('[WidgetSync] Native bridge result:', result);
        hasSynced.current = true;

        console.log('[WidgetSync] Widget data synced successfully');
      } catch (error) {
        console.error('[WidgetSync] Failed to sync widget data:', error);
      }
    }

    // Sync after a short delay to let the page render first
    const timer = setTimeout(syncWidgetData, 1000);

    return () => clearTimeout(timer);
  }, [enabled]);
}

/**
 * Manually trigger a widget sync (e.g., after pulling a new tarot card)
 */
export async function triggerWidgetSync(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    const response = await fetch('/api/widget/sync', {
      credentials: 'include',
    });

    if (!response.ok) {
      return;
    }

    const data: WidgetData = await response.json();
    await widgetService.updateWidgetData(data);
  } catch (error) {
    console.warn('[WidgetSync] Manual sync failed:', error);
  }
}
