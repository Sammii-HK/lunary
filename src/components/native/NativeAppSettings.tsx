'use client';

import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Smartphone, Vibrate, Download, Trash2 } from 'lucide-react';
import { hapticService } from '@/services/native/haptic-service';
import { offlineService } from '@/services/native/offline-service';

export function NativeAppSettings() {
  const [isNative, setIsNative] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [cacheSize, setCacheSize] = useState('Calculating...');
  const [isPrecaching, setIsPrecaching] = useState(false);
  const [precacheResult, setPrecacheResult] = useState<string | null>(null);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
    setHapticsEnabled(hapticService.isEnabled());
    offlineService.getCacheSize().then(setCacheSize);
  }, []);

  const toggleHaptics = (enabled: boolean) => {
    setHapticsEnabled(enabled);
    hapticService.setEnabled(enabled);
  };

  const handlePrecache = async () => {
    setIsPrecaching(true);
    setPrecacheResult(null);

    try {
      const result = await offlineService.precacheEssentials();
      const newSize = await offlineService.getCacheSize();
      setCacheSize(newSize);
      setPrecacheResult(
        `Cached ${result.cached} pages${result.failed > 0 ? ` (${result.failed} unavailable)` : ''}`,
      );
    } catch (error) {
      setPrecacheResult('Failed to cache content');
    } finally {
      setIsPrecaching(false);
    }
  };

  const handleClearCache = async () => {
    await offlineService.clearCache();
    setCacheSize('0 MB');
    setPrecacheResult('Cache cleared');
  };

  // Show minimal version for web users
  if (!isNative) {
    return (
      <div className='space-y-4'>
        {/* Offline content - available for all */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Download className='w-5 h-5 text-lunary-primary-400' />
              <div>
                <p className='text-sm font-medium text-white'>
                  Offline Content
                </p>
                <p className='text-xs text-zinc-400'>
                  Download grimoire for offline reading
                </p>
              </div>
            </div>
            <span className='text-xs text-zinc-500'>{cacheSize}</span>
          </div>

          <div className='flex gap-2'>
            <button
              onClick={handlePrecache}
              disabled={isPrecaching}
              className='flex-1 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white py-2 px-3 rounded-lg text-sm transition-colors'
            >
              {isPrecaching ? 'Downloading...' : 'Download'}
            </button>
            <button
              onClick={handleClearCache}
              className='p-2 text-zinc-400 hover:text-red-400 transition-colors'
              title='Clear cache'
            >
              <Trash2 className='w-4 h-4' />
            </button>
          </div>

          {precacheResult && (
            <p className='text-xs text-zinc-400'>{precacheResult}</p>
          )}
        </div>

        <p className='text-xs text-zinc-500 pt-2 border-t border-zinc-700'>
          <Smartphone className='w-3 h-3 inline mr-1' />
          More settings available in the Lunary app
        </p>
      </div>
    );
  }

  // Full native settings
  return (
    <div className='space-y-6'>
      {/* Haptic Feedback */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Vibrate className='w-5 h-5 text-lunary-primary-400' />
          <div>
            <p className='text-sm font-medium text-white'>Haptic Feedback</p>
            <p className='text-xs text-zinc-400'>
              Feel vibrations when interacting
            </p>
          </div>
        </div>
        <button
          onClick={() => toggleHaptics(!hapticsEnabled)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            hapticsEnabled ? 'bg-lunary-primary-600' : 'bg-zinc-600'
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
              hapticsEnabled ? 'translate-x-5' : ''
            }`}
          />
        </button>
      </div>

      {/* Offline Content */}
      <div className='space-y-3 pt-4 border-t border-zinc-700'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Download className='w-5 h-5 text-lunary-primary-400' />
            <div>
              <p className='text-sm font-medium text-white'>Offline Content</p>
              <p className='text-xs text-zinc-400'>
                Download grimoire for offline access
              </p>
            </div>
          </div>
          <span className='text-xs text-zinc-500'>{cacheSize}</span>
        </div>

        <div className='flex gap-2'>
          <button
            onClick={handlePrecache}
            disabled={isPrecaching}
            className='flex-1 bg-lunary-primary-600 hover:bg-lunary-primary-700 disabled:opacity-50 text-white py-2 px-3 rounded-lg text-sm transition-colors'
          >
            {isPrecaching ? 'Downloading...' : 'Download Offline Content'}
          </button>
          <button
            onClick={handleClearCache}
            className='p-2 text-zinc-400 hover:text-red-400 transition-colors'
            title='Clear cache'
          >
            <Trash2 className='w-4 h-4' />
          </button>
        </div>

        {precacheResult && (
          <p className='text-xs text-zinc-400'>{precacheResult}</p>
        )}
      </div>
    </div>
  );
}
