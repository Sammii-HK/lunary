'use client';

import { useEffect, useState } from 'react';

export default function ClearCachePage() {
  const [status, setStatus] = useState<string>('Clearing...');

  useEffect(() => {
    const clearEverything = async () => {
      try {
        // Unregister all service workers
        if ('serviceWorker' in navigator) {
          const registrations =
            await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
            setStatus(`Unregistered: ${registration.scope}`);
          }
        }

        // Clear all caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          for (const cacheName of cacheNames) {
            await caches.delete(cacheName);
            setStatus(`Deleted cache: ${cacheName}`);
          }
        }

        setStatus(
          '✅ All cleared! Reload this page, then go back to home page.',
        );
      } catch (error) {
        setStatus(`❌ Error: ${error}`);
      }
    };

    clearEverything();
  }, []);

  return (
    <div className='p-6 space-y-4'>
      <h1 className='text-2xl font-bold'>Clear Cache</h1>
      <p className='text-zinc-300'>{status}</p>
      <a
        href='/'
        className='block mt-4 px-4 py-2 bg-lunary-primary-600 text-white rounded-lg text-center'
      >
        Go to Home
      </a>
    </div>
  );
}
