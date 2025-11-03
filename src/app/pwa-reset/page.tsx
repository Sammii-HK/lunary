'use client';

import { useState } from 'react';

export default function PWAResetPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'clearing' | 'done'>('idle');

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const log = `[${timestamp}] ${message}`;
    console.log(log);
    setLogs((prev) => [...prev, log]);
  };

  const clearAll = async () => {
    setStatus('clearing');
    setLogs([]);
    addLog('Starting PWA reset...');

    try {
      // 1. Unregister all service workers
      if ('serviceWorker' in navigator) {
        addLog('Unregistering service workers...');
        const registrations = await navigator.serviceWorker.getRegistrations();

        for (const registration of registrations) {
          addLog(`Unregistering: ${registration.scope}`);
          const unregistered = await registration.unregister();
          if (unregistered) {
            addLog(`✅ Unregistered: ${registration.scope}`);
          } else {
            addLog(`⚠️ Failed to unregister: ${registration.scope}`);
          }
        }

        if (registrations.length === 0) {
          addLog('No service workers found to unregister');
        }
      } else {
        addLog('Service workers not supported');
      }

      // 2. Clear all caches
      if ('caches' in window) {
        addLog('Clearing all caches...');
        const cacheNames = await caches.keys();
        addLog(`Found ${cacheNames.length} cache(s)`);

        for (const cacheName of cacheNames) {
          addLog(`Deleting cache: ${cacheName}`);
          const deleted = await caches.delete(cacheName);
          if (deleted) {
            addLog(`✅ Deleted cache: ${cacheName}`);
          } else {
            addLog(`⚠️ Failed to delete cache: ${cacheName}`);
          }
        }

        if (cacheNames.length === 0) {
          addLog('No caches found to delete');
        }
      } else {
        addLog('Cache API not supported');
      }

      // 3. Clear localStorage
      try {
        addLog('Clearing localStorage...');
        localStorage.clear();
        addLog('✅ localStorage cleared');
      } catch (e) {
        addLog(`⚠️ Failed to clear localStorage: ${e}`);
      }

      // 4. Clear sessionStorage
      try {
        addLog('Clearing sessionStorage...');
        sessionStorage.clear();
        addLog('✅ sessionStorage cleared');
      } catch (e) {
        addLog(`⚠️ Failed to clear sessionStorage: ${e}`);
      }

      // 5. Clear IndexedDB (if available)
      if ('indexedDB' in window) {
        addLog('Attempting to clear IndexedDB...');
        try {
          const databases = await indexedDB.databases();
          for (const db of databases) {
            if (db.name) {
              addLog(`Closing database: ${db.name}`);
              const deleteReq = indexedDB.deleteDatabase(db.name);
              deleteReq.onsuccess = () => {
                addLog(`✅ Deleted database: ${db.name}`);
              };
              deleteReq.onerror = () => {
                addLog(`⚠️ Failed to delete database: ${db.name}`);
              };
            }
          }
        } catch (e) {
          addLog(`⚠️ IndexedDB clear failed: ${e}`);
        }
      }

      // 6. Report final status
      addLog('✅ PWA reset complete!');
      addLog('📋 Next steps:');
      addLog('1. Hard refresh the page (Cmd+Shift+R)');
      addLog('2. Close all tabs for this site');
      addLog('3. Wait 10 seconds');
      addLog('4. Visit the site again');
      addLog('5. Wait 30 seconds for service worker to register');
      addLog('6. Then add to home screen');

      setStatus('done');
    } catch (error) {
      addLog(`❌ Error during reset: ${error}`);
      setStatus('done');
    }
  };

  const hardReload = () => {
    window.location.reload();
  };

  const checkStatus = async () => {
    setLogs([]);
    addLog('Checking current PWA status...');

    // Check service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      addLog(`Service Workers: ${registrations.length}`);
      registrations.forEach((reg, i) => {
        addLog(`  ${i + 1}. Scope: ${reg.scope}`);
        addLog(`     Active: ${reg.active?.state || 'none'}`);
        const isControlling = navigator.serviceWorker
          ? !!navigator.serviceWorker.controller
          : false;
        addLog(`     Controlling: ${isControlling}`);
      });
    }

    // Check caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      addLog(`Caches: ${cacheNames.length}`);
      cacheNames.forEach((name) => {
        addLog(`  - ${name}`);
      });
    }

    // Check display mode
    const isMinimalUi = window.matchMedia('(display-mode: minimal-ui)').matches;
    const isStandalone = window.matchMedia(
      '(display-mode: standalone)',
    ).matches;
    const isBrowser = window.matchMedia('(display-mode: browser)').matches;
    const iosStandalone = (window.navigator as any).standalone === true;

    addLog('Display Mode:');
    addLog(`  Minimal-UI: ${isMinimalUi}`);
    addLog(`  Standalone: ${isStandalone}`);
    addLog(`  Browser: ${isBrowser}`);
    addLog(`  iOS Standalone: ${iosStandalone}`);

    // Check manifest
    try {
      const manifest = await fetch('/manifest.json');
      if (manifest.ok) {
        const data = await manifest.json();
        addLog('Manifest:');
        addLog(`  Name: ${data.name}`);
        addLog(`  Display: ${data.display}`);
        addLog(`  Start URL: ${data.start_url}`);
      }
    } catch (e) {
      addLog(`⚠️ Failed to load manifest: ${e}`);
    }
  };

  return (
    <div className='p-4 space-y-4 max-w-2xl mx-auto'>
      <h1 className='text-2xl font-bold'>🔧 PWA Reset & Debug Tool</h1>

      <div className='bg-yellow-900/20 border border-yellow-700 rounded p-4'>
        <p className='text-sm text-yellow-200'>
          ⚠️ This will clear ALL service workers, caches, and storage for this
          site. Use this when debugging PWA issues.
        </p>
      </div>

      <div className='flex gap-4'>
        <button
          onClick={clearAll}
          disabled={status === 'clearing'}
          className='px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg font-medium'
        >
          {status === 'clearing' ? 'Clearing...' : '🧹 Clear Everything'}
        </button>

        <button
          onClick={checkStatus}
          className='px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium'
        >
          📊 Check Status
        </button>

        <button
          onClick={hardReload}
          className='px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium'
        >
          🔄 Hard Reload
        </button>
      </div>

      {logs.length > 0 && (
        <div className='bg-zinc-900 border border-zinc-700 rounded p-4'>
          <div className='flex justify-between items-center mb-2'>
            <h2 className='font-bold'>Logs</h2>
            <button
              onClick={() => setLogs([])}
              className='text-xs text-zinc-400 hover:text-white'
            >
              Clear
            </button>
          </div>
          <div className='space-y-1 max-h-96 overflow-auto font-mono text-xs'>
            {logs.map((log, i) => (
              <div
                key={i}
                className={
                  log.includes('✅')
                    ? 'text-green-400'
                    : log.includes('⚠️') || log.includes('❌')
                      ? 'text-red-400'
                      : log.includes('📋')
                        ? 'text-yellow-400'
                        : 'text-zinc-300'
                }
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className='bg-zinc-900 border border-zinc-700 rounded p-4'>
        <h2 className='font-bold mb-2'>Quick Commands</h2>
        <div className='space-y-2 text-sm font-mono'>
          <div>
            <span className='text-zinc-400'>Check service worker:</span>
            <code className='ml-2 text-green-400'>
              navigator.serviceWorker.getRegistrations()
            </code>
          </div>
          <div>
            <span className='text-zinc-400'>Check display mode:</span>
            <code className='ml-2 text-green-400'>
              window.matchMedia('(display-mode: minimal-ui)').matches
            </code>
          </div>
          <div>
            <span className='text-zinc-400'>Check caches:</span>
            <code className='ml-2 text-green-400'>caches.keys()</code>
          </div>
        </div>
      </div>
    </div>
  );
}
