'use client';

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { PWA_MANIFEST_URL } from '@/constants/pwa';

export default function PWADebugPage() {
  if (process.env.NODE_ENV === 'production') {
    redirect('/');
  }
  const [status, setStatus] = useState<any>({});

  useEffect(() => {
    const checkPWA = async () => {
      const checks: any = {};

      // Check service worker
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          checks.serviceWorker = {
            registered: !!registration,
            scope: registration?.scope,
            activeState: registration?.active?.state,
            controlling: navigator.serviceWorker
              ? !!navigator.serviceWorker.controller
              : false,
            controllerUrl:
              navigator.serviceWorker?.controller?.scriptURL || null,
          };
        } catch (e) {
          checks.serviceWorker = { error: String(e) };
        }
      } else {
        checks.serviceWorker = { supported: false };
      }

      // Check caches
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          const lunaryCaches = cacheNames.filter((name) =>
            name.startsWith('lunary-'),
          );
          checks.caches = {
            names: cacheNames,
            lunaryCaches: lunaryCaches,
            latestCache: lunaryCaches.sort().reverse()[0] || 'none',
          };

          const latestCacheName =
            lunaryCaches.sort().reverse()[0] || 'lunary-v7';
          const cache = await caches.open(latestCacheName);
          const startUrlCached = await cache.match('/');
          checks.caches.startUrlCached = !!startUrlCached;
        } catch (e) {
          checks.caches = { error: String(e) };
        }
      }

      // Check manifest
      try {
        const manifest = await fetch(PWA_MANIFEST_URL, { cache: 'no-store' });
        const manifestData = await manifest.json();
        checks.manifest = {
          loaded: true,
          name: manifestData.name,
          start_url: manifestData.start_url,
          display: manifestData.display,
        };
      } catch (e) {
        checks.manifest = { error: String(e) };
      }

      // Check display mode
      checks.displayMode = {
        standalone: window.matchMedia('(display-mode: standalone)').matches,
        fullscreen: window.matchMedia('(display-mode: fullscreen)').matches,
        minimalUi: window.matchMedia('(display-mode: minimal-ui)').matches,
        browser: window.matchMedia('(display-mode: browser)').matches,
        current: (window.navigator as any).standalone
          ? 'standalone'
          : 'browser',
      };

      // Check protocol
      checks.protocol = {
        https: window.location.protocol === 'https:',
        http: window.location.protocol === 'http:',
        localhost: window.location.hostname === 'localhost',
        localIP: /^192\.168\.|^10\.|^172\./.test(window.location.hostname),
      };

      setStatus(checks);
    };

    checkPWA();
  }, []);

  return (
    <div className='p-4 space-y-4 max-w-2xl mx-auto'>
      <h1 className='text-2xl font-bold'>PWA Debug Status</h1>

      <div className='space-y-4'>
        <section className='bg-zinc-900 p-4 rounded'>
          <h2 className='font-bold mb-2'>Service Worker</h2>
          <pre className='text-xs overflow-auto'>
            {JSON.stringify(status.serviceWorker, null, 2)}
          </pre>
        </section>

        <section className='bg-zinc-900 p-4 rounded'>
          <h2 className='font-bold mb-2'>Caches</h2>
          <pre className='text-xs overflow-auto'>
            {JSON.stringify(status.caches, null, 2)}
          </pre>
        </section>

        <section className='bg-zinc-900 p-4 rounded'>
          <h2 className='font-bold mb-2'>Manifest</h2>
          <pre className='text-xs overflow-auto'>
            {JSON.stringify(status.manifest, null, 2)}
          </pre>
        </section>

        <section className='bg-zinc-900 p-4 rounded'>
          <h2 className='font-bold mb-2'>Display Mode</h2>
          <pre className='text-xs overflow-auto'>
            {JSON.stringify(status.displayMode, null, 2)}
          </pre>
        </section>

        <section className='bg-zinc-900 p-4 rounded'>
          <h2 className='font-bold mb-2'>Protocol</h2>
          <pre className='text-xs overflow-auto'>
            {JSON.stringify(status.protocol, null, 2)}
          </pre>
        </section>
      </div>

      <div className='bg-lunary-accent-900/30 p-4 rounded border border-lunary-accent-700'>
        <h3 className='font-bold mb-2'>⚠️ Chrome iOS PWA Requirements</h3>
        <ul className='text-sm space-y-1'>
          <li>
            ✅ Service Worker:{' '}
            {status.serviceWorker?.controlling ? 'YES' : 'NO'}
          </li>
          <li>
            ✅ Start URL Cached: {status.caches?.startUrlCached ? 'YES' : 'NO'}
          </li>
          <li>
            ⚠️ HTTPS:{' '}
            {status.protocol?.https
              ? 'YES'
              : status.protocol?.localhost || status.protocol?.localIP
                ? 'HTTP (might not work)'
                : 'NO'}
          </li>
        </ul>
        <p className='text-xs mt-2 text-lunary-accent-200'>
          Chrome iOS requires HTTPS for PWAs. Local HTTP might not work. Try
          Safari instead!
        </p>
      </div>
    </div>
  );
}
