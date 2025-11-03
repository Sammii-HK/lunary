'use client';

import { useEffect, useState } from 'react';

export function ServiceWorkerDebug() {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  useEffect(() => {
    const logs: string[] = [];

    const addLog = (msg: string) => {
      console.log(msg);
      logs.push(msg);
      setDebugInfo([...logs]);
    };

    const runDebug = async () => {
      addLog('🔍 Starting service worker debug...');

      // Check if service workers are supported
      addLog(`Checking service worker support...`);
      addLog(`URL: ${window.location.href}`);
      addLog(`Protocol: ${window.location.protocol}`);
      addLog(`Hostname: ${window.location.hostname}`);
      addLog(`'serviceWorker' in navigator: ${'serviceWorker' in navigator}`);

      // Check for Safari private mode
      try {
        await new Promise((resolve, reject) => {
          const db = indexedDB.open('test');
          db.onerror = () => {
            addLog(
              '❌ PRIVATE MODE DETECTED - Service workers disabled in Safari private mode!',
            );
            addLog('   SOLUTION: Close private tab and use regular Safari');
            reject(new Error('Private mode'));
          };
          db.onsuccess = () => {
            indexedDB.deleteDatabase('test');
            resolve(true);
          };
          setTimeout(() => resolve(false), 100);
        });
      } catch (e: any) {
        if (e?.message === 'Private mode') {
          return;
        }
      }

      // Check HTTPS requirement (Safari iOS needs HTTPS except localhost)
      const isHTTPS = window.location.protocol === 'https:';
      const isLocalhost =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
      const isLocalIP = /^192\.168\.|^10\.|^172\./.test(
        window.location.hostname,
      );

      if (!isHTTPS && !isLocalhost && isLocalIP) {
        addLog('⚠️ WARNING: Using HTTP with local IP');
        addLog(
          '   Safari iOS requires HTTPS for service workers (except localhost)',
        );
        addLog('   SOLUTION: Use localhost:3000 instead of IP address');
      }

      addLog(
        `navigator.serviceWorker exists: ${navigator.serviceWorker ? 'YES' : 'NO'}`,
      );

      if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        addLog('❌ Service workers not supported in this browser');
        const userAgent =
          typeof window !== 'undefined' && window.navigator
            ? window.navigator.userAgent || 'unknown'
            : 'unknown';
        addLog(`   User agent: ${userAgent}`);
        addLog(
          `   This might be private mode, old browser, or service workers disabled`,
        );
        return;
      }

      if (!navigator.serviceWorker) {
        addLog(
          '❌ serviceWorker in navigator but navigator.serviceWorker is undefined',
        );
        addLog(
          `   This happens in Safari private mode - service workers are disabled`,
        );
        addLog(
          `   SOLUTION: Close private/incognito tab and use regular browsing mode`,
        );
        return;
      }

      addLog('✅ Service workers supported');

      // Check if we can access the service worker file
      fetch('/sw.js')
        .then((response) => {
          if (response.ok) {
            addLog(`✅ Service worker file accessible (${response.status})`);
            addLog(`   Content-Type: ${response.headers.get('content-type')}`);
          } else {
            addLog(
              `❌ Service worker file not accessible (${response.status})`,
            );
          }
        })
        .catch((error) => {
          addLog(`❌ Failed to fetch service worker file: ${error.message}`);
        });

      // Try to register
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          addLog(`✅ Service worker registered successfully`);
          addLog(`   Scope: ${registration.scope}`);
          addLog(`   Active: ${registration.active?.state || 'none'}`);
          addLog(`   Installing: ${registration.installing?.state || 'none'}`);
          addLog(`   Waiting: ${registration.waiting?.state || 'none'}`);

          // Check for errors
          registration.addEventListener('updatefound', () => {
            addLog('⚠️ Update found for service worker');
          });

          // Wait for ready
          return navigator.serviceWorker.ready;
        })
        .then((registration) => {
          addLog(`✅ Service worker ready`);
          addLog(`   Active state: ${registration.active?.state}`);
          addLog(`   Controlling: ${!!navigator.serviceWorker.controller}`);

          // Check controller
          if (navigator.serviceWorker.controller) {
            addLog(`✅ Service worker is controlling`);
            addLog(
              `   Controller script: ${navigator.serviceWorker.controller.scriptURL}`,
            );
          } else {
            addLog(
              `⚠️ Service worker NOT controlling (will control on next page load)`,
            );
          }
        })
        .catch((error) => {
          addLog(`❌ Service worker registration FAILED`);
          addLog(`   Error: ${error.message}`);
          addLog(`   Error name: ${error.name}`);
          addLog(`   Stack: ${error.stack}`);
        });

      // Listen for controller changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        addLog('✅ Service worker controller changed!');
        addLog(`   Controlling: ${!!navigator.serviceWorker.controller}`);
      });
    };

    runDebug();
  }, []);

  if (debugInfo.length === 0) {
    return null;
  }

  return (
    <div className='fixed top-20 left-4 right-4 bg-zinc-900 border border-blue-500 rounded-lg p-4 text-xs font-mono max-h-96 overflow-auto z-[10001]'>
      <div className='flex justify-between items-center mb-2'>
        <h3 className='text-blue-400 font-bold'>🔧 Service Worker Debug</h3>
        <button
          onClick={() => setDebugInfo([])}
          className='text-zinc-400 hover:text-white'
        >
          Clear
        </button>
      </div>
      <div className='space-y-1'>
        {debugInfo.map((log, i) => (
          <div
            key={i}
            className={
              log.includes('❌')
                ? 'text-red-400'
                : log.includes('✅')
                  ? 'text-green-400'
                  : log.includes('⚠️')
                    ? 'text-yellow-400'
                    : 'text-zinc-300'
            }
          >
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
