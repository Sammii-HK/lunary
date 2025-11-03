'use client';

import { useEffect, useState } from 'react';

export function PWADebugInline() {
  const [status, setStatus] = useState<string>('Checking...');
  const [details, setDetails] = useState<string[]>([]);

  useEffect(() => {
    const check = async () => {
      const info: string[] = [];

      // Check service worker support
      if (!('serviceWorker' in navigator)) {
        info.push('❌ Service Worker NOT supported in this browser');
        setStatus('Service Worker Not Supported');
        setDetails(info);
        return;
      }

      info.push('✅ Service Worker API available');

      // Check registrations
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        info.push(`Found ${registrations.length} registration(s)`);

        if (registrations.length > 0) {
          for (const reg of registrations) {
            info.push(`Scope: ${reg.scope}`);
            info.push(`Active State: ${reg.active?.state || 'none'}`);
            info.push(`Waiting State: ${reg.waiting?.state || 'none'}`);
            info.push(`Installing State: ${reg.installing?.state || 'none'}`);
          }
        } else {
          info.push('⚠️ No service worker registered');
        }

        // Check if controlling
        const isControlling = !!navigator.serviceWorker.controller;
        if (isControlling) {
          info.push('✅ Service Worker is CONTROLLING this page');
          info.push(
            `Controller URL: ${navigator.serviceWorker.controller?.scriptURL}`,
          );
        } else {
          info.push('⚠️ Service Worker is NOT controlling this page');
        }

        // Check ready state
        try {
          await navigator.serviceWorker.ready;
          info.push('✅ Service Worker ready promise resolved');
        } catch (e) {
          info.push(`❌ Service Worker ready failed: ${e}`);
        }

        // Check caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          info.push(
            `Found ${cacheNames.length} cache(s): ${cacheNames.join(', ')}`,
          );
        }

        // Check display mode
        const isMinimalUi = window.matchMedia(
          '(display-mode: minimal-ui)',
        ).matches;
        const isStandalone = window.matchMedia(
          '(display-mode: standalone)',
        ).matches;
        const iosStandalone = (window.navigator as any).standalone === true;
        info.push(
          `Display Mode - Minimal-UI: ${isMinimalUi}, Standalone: ${isStandalone}, iOS: ${iosStandalone}`,
        );

        // Check if using Chrome on iOS (doesn't support PWAs)
        const userAgent = window.navigator?.userAgent || '';
        const isIOS = /iPhone|iPad|iPod/.test(userAgent);
        const isChrome = /CriOS|Chrome/.test(userAgent);
        if (isIOS && isChrome) {
          info.push(
            '⚠️ WARNING: Chrome on iOS does NOT support PWAs! Use Safari instead.',
          );
        }

        // Check manifest
        try {
          const manifestRes = await fetch('/manifest.json');
          if (manifestRes.ok) {
            const manifest = await manifestRes.json();
            info.push(
              `Manifest: ${manifest.display} mode, start_url: ${manifest.start_url}`,
            );
          }
        } catch (e) {
          info.push(`⚠️ Failed to load manifest: ${e}`);
        }

        // Check if sw.js is accessible
        try {
          const swRes = await fetch('/sw.js', { cache: 'no-store' });
          info.push(`sw.js status: ${swRes.status} ${swRes.statusText}`);
          const contentType = swRes.headers.get('content-type');
          info.push(`sw.js Content-Type: ${contentType || 'not set'}`);
          if (contentType && !contentType.includes('javascript')) {
            info.push(
              '❌ WRONG Content-Type! Should be application/javascript',
            );
          }
        } catch (e) {
          info.push(`❌ Failed to fetch sw.js: ${e}`);
        }

        setStatus(
          isControlling
            ? 'Service Worker Active'
            : 'Service Worker Not Controlling',
        );
      } catch (error) {
        info.push(`❌ Error checking service worker: ${error}`);
        setStatus('Error');
      }

      setDetails(info);
    };

    check();
  }, []);

  return (
    <div className='fixed top-4 right-4 bg-zinc-900/95 border border-zinc-700 rounded-lg p-4 max-w-md z-50 text-xs'>
      <div className='font-bold mb-2'>PWA Debug</div>
      <div className='mb-2 text-green-400'>{status}</div>
      <div className='space-y-1 max-h-64 overflow-auto font-mono'>
        {details.map((detail, i) => (
          <div
            key={i}
            className={
              detail.includes('❌')
                ? 'text-red-400'
                : detail.includes('⚠️')
                  ? 'text-yellow-400'
                  : 'text-zinc-300'
            }
          >
            {detail}
          </div>
        ))}
      </div>
    </div>
  );
}
