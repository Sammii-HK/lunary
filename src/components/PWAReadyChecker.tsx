'use client';

import { useEffect, useState } from 'react';
import { PWA_MANIFEST_URL } from '@/constants/pwa';

export function PWAReadyChecker() {
  const [isReady, setIsReady] = useState(false);
  const [checks, setChecks] = useState({
    serviceWorker: false,
    serviceWorkerControlling: false,
    manifest: false,
    https: false,
    icons: false,
  });

  useEffect(() => {
    const checkPWAReady = async () => {
      const newChecks = {
        serviceWorker: false,
        serviceWorkerControlling: false,
        manifest: false,
        https: false,
        icons: false,
      };

      // Check HTTPS (or localhost)
      newChecks.https =
        window.location.protocol === 'https:' ||
        window.location.hostname === 'localhost' ||
        /^192\.168\.|^10\.|^172\./.test(window.location.hostname);

      // Check manifest
      try {
        const manifestResponse = await fetch(PWA_MANIFEST_URL, {
          cache: 'no-store',
        });
        if (manifestResponse.ok) {
          const manifest = await manifestResponse.json();
          newChecks.manifest = !!manifest && !!manifest.name;
          newChecks.icons =
            Array.isArray(manifest.icons) && manifest.icons.length > 0;
        }
      } catch (e) {
        console.error('Manifest check failed:', e);
      }

      // Check service worker
      if ('serviceWorker' in navigator && navigator.serviceWorker) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          newChecks.serviceWorker = !!registration;

          if (registration) {
            // Wait for service worker to be active
            await navigator.serviceWorker.ready;

            // Check if it's controlling
            newChecks.serviceWorkerControlling =
              !!navigator.serviceWorker.controller;

            // If not controlling yet, wait a bit and check again
            if (!newChecks.serviceWorkerControlling) {
              await new Promise((resolve) => setTimeout(resolve, 2000));
              newChecks.serviceWorkerControlling =
                !!navigator.serviceWorker.controller;
            }
          }
        } catch (e) {
          console.error('Service worker check failed:', e);
        }
      }

      setChecks(newChecks);

      // PWA is ready when ALL checks pass
      const allReady =
        newChecks.serviceWorker &&
        newChecks.serviceWorkerControlling &&
        newChecks.manifest &&
        newChecks.https &&
        newChecks.icons;

      setIsReady(allReady);

      if (allReady) {
        console.log('✅ PWA READY - Safe to add to home screen!');
      } else {
        console.log('⏳ PWA not ready yet:', newChecks);
      }
    };

    checkPWAReady();

    // Recheck every 2 seconds until ready
    const interval = setInterval(() => {
      if (!isReady) {
        checkPWAReady();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isReady, checks.serviceWorker, checks.serviceWorkerControlling]);

  useEffect(() => {
    // If service worker is registered but not controlling after 5 seconds, suggest reload
    if (
      checks.serviceWorker &&
      !checks.serviceWorkerControlling &&
      typeof window !== 'undefined'
    ) {
      const timeout = setTimeout(() => {
        if (
          checks.serviceWorker &&
          !checks.serviceWorkerControlling &&
          !window.matchMedia('(display-mode: minimal-ui)').matches &&
          !window.matchMedia('(display-mode: standalone)').matches
        ) {
          console.warn(
            '🔄 Service worker registered but not controlling. A page reload is needed.',
          );
        }
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [checks.serviceWorker, checks.serviceWorkerControlling]);

  if (isReady) {
    return null; // Hide when ready
  }

  return (
    <div className='fixed top-4 left-4 right-4 bg-yellow-900/90 border-2 border-yellow-500 rounded-lg p-4 text-sm z-[10000]'>
      <div className='flex items-start gap-3'>
        <div className='text-2xl'>⏳</div>
        <div className='flex-1'>
          <h3 className='font-bold text-yellow-200 mb-2'>
            PWA Not Ready - DO NOT Add to Home Screen Yet!
          </h3>
          <div className='space-y-1 text-xs'>
            <div className={checks.https ? 'text-green-400' : 'text-red-400'}>
              {checks.https ? '✅' : '❌'} HTTPS/Localhost
            </div>
            <div
              className={checks.manifest ? 'text-green-400' : 'text-red-400'}
            >
              {checks.manifest ? '✅' : '❌'} Manifest Loaded
            </div>
            <div className={checks.icons ? 'text-green-400' : 'text-red-400'}>
              {checks.icons ? '✅' : '❌'} Icons Available
            </div>
            <div
              className={
                checks.serviceWorker ? 'text-green-400' : 'text-yellow-400'
              }
            >
              {checks.serviceWorker ? '✅' : '⏳'} Service Worker Registered
            </div>
            <div
              className={
                checks.serviceWorkerControlling
                  ? 'text-green-400'
                  : 'text-yellow-400'
              }
            >
              {checks.serviceWorkerControlling ? '✅' : '⏳'} Service Worker
              Controlling Page
            </div>
          </div>
          <p className='text-yellow-200 mt-3 text-xs'>
            <strong>Wait until all checks are ✅</strong> before adding to home
            screen. Adding too early creates a bookmark instead of a PWA!
          </p>
          {checks.serviceWorker && !checks.serviceWorkerControlling && (
            <p className='text-yellow-300 mt-2 text-xs font-bold'>
              ⚠️ Service worker is registered but not controlling. You may need
              to <strong>refresh the page once</strong> for it to take control.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
