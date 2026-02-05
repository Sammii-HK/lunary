/**
 * Native Offline Service
 *
 * Handles offline content caching for native apps.
 * Works with the existing service worker for enhanced offline support.
 *
 * Usage:
 *   import { offlineService } from '@/services/native';
 *   await offlineService.precacheEssentials();
 */

// Match the cache name in public/sw.js
const CACHE_NAME = 'lunary-v17';

class OfflineService {
  /**
   * Pre-cache essential grimoire content for offline access
   */
  async precacheEssentials(): Promise<{ cached: number; failed: number }> {
    if (typeof window === 'undefined' || !('caches' in window)) {
      return { cached: 0, failed: 0 };
    }

    const cache = await caches.open(CACHE_NAME);

    // Essential pages to cache
    const essentialPages = [
      '/app',
      '/app/tarot',
      '/grimoire',
      '/grimoire/moon',
      '/grimoire/tarot',
      '/grimoire/crystals',
      '/grimoire/runes',
      '/grimoire/chakras',
      '/grimoire/practices',
      '/offline',
    ];

    // Major Arcana tarot cards
    const majorArcana = [
      'the-fool',
      'the-magician',
      'the-high-priestess',
      'the-empress',
      'the-emperor',
      'the-hierophant',
      'the-lovers',
      'the-chariot',
      'strength',
      'the-hermit',
      'wheel-of-fortune',
      'justice',
      'the-hanged-man',
      'death',
      'temperance',
      'the-devil',
      'the-tower',
      'the-star',
      'the-moon',
      'the-sun',
      'judgement',
      'the-world',
    ];

    const tarotPages = majorArcana.map((slug) => `/tarot/${slug}`);

    const allPages = [...essentialPages, ...tarotPages];

    const results = await Promise.allSettled(
      allPages.map((url) =>
        cache.add(url).catch((error) => {
          console.debug(`[Offline] Could not cache ${url}:`, error);
          throw error;
        }),
      ),
    );

    const cached = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    console.log(`[Offline] Cached ${cached}/${allPages.length} pages`);
    return { cached, failed };
  }

  /**
   * Get the estimated size of cached content
   */
  async getCacheSize(): Promise<string> {
    if (
      typeof navigator === 'undefined' ||
      !('storage' in navigator) ||
      !navigator.storage.estimate
    ) {
      return 'Unknown';
    }

    try {
      const estimate = await navigator.storage.estimate();
      const usedBytes = estimate.usage || 0;
      const usedMB = (usedBytes / 1024 / 1024).toFixed(1);
      return `${usedMB} MB`;
    } catch {
      return 'Unknown';
    }
  }

  /**
   * Clear all cached content
   */
  async clearCache(): Promise<void> {
    if (typeof window === 'undefined' || !('caches' in window)) return;

    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      console.log('[Offline] All caches cleared');
    } catch (error) {
      console.error('[Offline] Failed to clear cache:', error);
    }
  }

  /**
   * Check if the device is currently offline
   */
  isOffline(): boolean {
    if (typeof navigator === 'undefined') return false;
    return !navigator.onLine;
  }

  /**
   * Check if a specific URL is cached
   */
  async isCached(url: string): Promise<boolean> {
    if (typeof window === 'undefined' || !('caches' in window)) return false;

    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(url);
      return !!response;
    } catch {
      return false;
    }
  }

  /**
   * Get list of all cached URLs
   */
  async getCachedUrls(): Promise<string[]> {
    if (typeof window === 'undefined' || !('caches' in window)) return [];

    try {
      const cache = await caches.open(CACHE_NAME);
      const requests = await cache.keys();
      return requests.map((req) => new URL(req.url).pathname);
    } catch {
      return [];
    }
  }
}

// Export singleton instance
export const offlineService = new OfflineService();
