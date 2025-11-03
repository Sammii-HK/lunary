'use client';

import { useEffect, useState } from 'react';

/**
 * This component ensures service worker is ready BEFORE allowing PWA installation
 * iOS requires SW to be active and controlling before "Add to Home Screen" works
 */
export function PWAInstallGuard() {
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState<string>('Checking...');

  useEffect(() => {
    const checkReady = async () => {
      if (!('serviceWorker' in navigator)) {
        setStatus('Service Worker not supported');
        return;
      }

      try {
        // Check if service worker is registered
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          setStatus('⚠️ Service Worker not registered yet...');
          return;
        }

        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;

        // Check if it's controlling
        const isControlling = !!navigator.serviceWorker.controller;
        if (!isControlling) {
          setStatus('⚠️ Service Worker not controlling yet...');
          return;
        }

        // Check if start_url is cached
        const cacheNames = await caches.keys();
        const hasCache = cacheNames.length > 0;
        if (!hasCache) {
          setStatus('⚠️ Cache not ready...');
          return;
        }

        // All checks passed - ready for PWA installation
        setIsReady(true);
        setStatus('✅ Ready to add to home screen!');
      } catch (error) {
        setStatus(`❌ Error: ${error}`);
      }
    };

    checkReady();
    const interval = setInterval(checkReady, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isReady) {
    return (
      <div className='fixed top-4 left-4 right-4 bg-yellow-900/20 border border-yellow-700 rounded-lg p-3 text-xs z-[100]'>
        <div className='font-bold text-yellow-400 mb-1'>
          PWA Installation Status
        </div>
        <div className='text-yellow-200'>{status}</div>
        <div className='text-yellow-300/80 mt-2 text-[10px]'>
          ⚠️ Wait for this to show "Ready" before adding to home screen!
        </div>
      </div>
    );
  }

  return (
    <div className='fixed top-4 left-4 right-4 bg-green-900/20 border border-green-700 rounded-lg p-3 text-xs z-[100]'>
      <div className='font-bold text-green-400 mb-1'>✅ PWA Ready!</div>
      <div className='text-green-200'>
        Service worker is active and controlling. Safe to add to home screen
        now.
      </div>
    </div>
  );
}
