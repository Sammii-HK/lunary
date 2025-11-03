'use client';

import { useEffect, useState } from 'react';
import { PWA_MANIFEST_URL } from '@/constants/pwa';

export default function PWADiagnosePage() {
  const [results, setResults] = useState<
    Array<{
      check: string;
      status: 'pass' | 'fail' | 'warning';
      message: string;
    }>
  >([]);

  useEffect(() => {
    const runDiagnostics = async () => {
      const checks: Array<{
        check: string;
        status: 'pass' | 'fail' | 'warning';
        message: string;
      }> = [];

      // 1. Check HTTPS
      const isHTTPS = window.location.protocol === 'https:';
      const isLocalhost =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
      checks.push({
        check: 'HTTPS/Localhost',
        status: isHTTPS || isLocalhost ? 'pass' : 'fail',
        message: isHTTPS
          ? 'Using HTTPS ✓'
          : isLocalhost
            ? 'Using localhost (OK for testing) ✓'
            : '❌ MUST use HTTPS or localhost for service workers',
      });

      // 2. Check Service Worker Support
      const hasSW = 'serviceWorker' in navigator;
      checks.push({
        check: 'Service Worker API',
        status: hasSW ? 'pass' : 'fail',
        message: hasSW
          ? 'Service Worker API available ✓'
          : '❌ Service Worker not supported in this browser',
      });

      // 3. Check Manifest
      try {
        const manifestRes = await fetch(PWA_MANIFEST_URL, {
          cache: 'no-store',
        });
        if (!manifestRes.ok) {
          checks.push({
            check: 'Manifest Access',
            status: 'fail',
            message: `❌ Manifest not accessible: ${manifestRes.status} ${manifestRes.statusText}`,
          });
        } else {
          const manifest = await manifestRes.json();
          checks.push({
            check: 'Manifest Access',
            status: 'pass',
            message: 'Manifest accessible ✓',
          });

          // Validate manifest
          if (!manifest.start_url || manifest.start_url !== '/') {
            checks.push({
              check: 'Manifest start_url',
              status: 'fail',
              message: `❌ start_url must be "/", got: ${manifest.start_url}`,
            });
          } else {
            checks.push({
              check: 'Manifest start_url',
              status: 'pass',
              message: 'start_url is "/" ✓',
            });
          }

          if (
            !manifest.display ||
            !['standalone', 'minimal-ui', 'fullscreen'].includes(
              manifest.display,
            )
          ) {
            checks.push({
              check: 'Manifest display',
              status: 'fail',
              message: `❌ display must be standalone/minimal-ui/fullscreen, got: ${manifest.display}`,
            });
          } else {
            checks.push({
              check: 'Manifest display',
              status: 'pass',
              message: `display is "${manifest.display}" ✓`,
            });
          }

          if (!manifest.icons || manifest.icons.length === 0) {
            checks.push({
              check: 'Manifest icons',
              status: 'fail',
              message: '❌ No icons in manifest',
            });
          } else {
            checks.push({
              check: 'Manifest icons',
              status: 'pass',
              message: `${manifest.icons.length} icons defined ✓`,
            });
          }
        }
      } catch (e) {
        checks.push({
          check: 'Manifest Access',
          status: 'fail',
          message: `❌ Failed to fetch manifest: ${e}`,
        });
      }

      // 4. Check Service Worker File
      try {
        const swRes = await fetch('/sw.js', { cache: 'no-store' });
        if (!swRes.ok) {
          checks.push({
            check: 'Service Worker File',
            status: 'fail',
            message: `❌ sw.js not accessible: ${swRes.status} ${swRes.statusText}`,
          });
        } else {
          const contentType = swRes.headers.get('content-type');
          if (!contentType || !contentType.includes('javascript')) {
            checks.push({
              check: 'Service Worker Content-Type',
              status: 'fail',
              message: `❌ Wrong Content-Type: ${contentType || 'not set'}. Must be application/javascript`,
            });
          } else {
            checks.push({
              check: 'Service Worker Content-Type',
              status: 'pass',
              message: `Content-Type: ${contentType} ✓`,
            });
          }
          checks.push({
            check: 'Service Worker File',
            status: 'pass',
            message: 'sw.js accessible ✓',
          });
        }
      } catch (e) {
        checks.push({
          check: 'Service Worker File',
          status: 'fail',
          message: `❌ Failed to fetch sw.js: ${e}`,
        });
      }

      // 5. Check Service Worker Registration
      if (hasSW) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (!registration) {
            checks.push({
              check: 'Service Worker Registration',
              status: 'fail',
              message: '❌ Service Worker not registered',
            });
          } else {
            checks.push({
              check: 'Service Worker Registration',
              status: 'pass',
              message: `Registered at scope: ${registration.scope} ✓`,
            });

            // Check states
            if (registration.installing) {
              checks.push({
                check: 'Service Worker State',
                status: 'warning',
                message: `⚠️ Installing... (state: ${registration.installing.state})`,
              });
            } else if (registration.waiting) {
              checks.push({
                check: 'Service Worker State',
                status: 'warning',
                message: `⚠️ Waiting... (state: ${registration.waiting.state}) - may need to skip waiting`,
              });
            } else if (registration.active) {
              checks.push({
                check: 'Service Worker State',
                status: 'pass',
                message: `Active state: ${registration.active.state} ✓`,
              });
            } else {
              checks.push({
                check: 'Service Worker State',
                status: 'fail',
                message: '❌ No active service worker',
              });
            }
          }

          // Check if controlling
          const isControlling = !!navigator.serviceWorker.controller;
          checks.push({
            check: 'Service Worker Controlling',
            status: isControlling ? 'pass' : 'fail',
            message: isControlling
              ? 'Service Worker is controlling this page ✓'
              : '❌ Service Worker is NOT controlling - will control on next page load',
          });

          // Wait for ready
          try {
            await navigator.serviceWorker.ready;
            checks.push({
              check: 'Service Worker Ready',
              status: 'pass',
              message: 'Service Worker ready promise resolved ✓',
            });
          } catch (e) {
            checks.push({
              check: 'Service Worker Ready',
              status: 'fail',
              message: `❌ Service Worker ready failed: ${e}`,
            });
          }

          // Check cache
          const cacheNames = await caches.keys();
          if (cacheNames.length === 0) {
            checks.push({
              check: 'Service Worker Cache',
              status: 'fail',
              message:
                '❌ No caches found - service worker may not have installed properly',
            });
          } else {
            checks.push({
              check: 'Service Worker Cache',
              status: 'pass',
              message: `Found ${cacheNames.length} cache(s): ${cacheNames.join(', ')} ✓`,
            });

            // Check if start_url is cached
            const mainCache = await caches.open(cacheNames[0]);
            const cachedStart = await mainCache.match('/');
            checks.push({
              check: 'Start URL Cached',
              status: cachedStart ? 'pass' : 'fail',
              message: cachedStart
                ? 'Start URL (/) is cached ✓'
                : '❌ Start URL (/) is NOT cached',
            });
          }
        } catch (e) {
          checks.push({
            check: 'Service Worker Registration',
            status: 'fail',
            message: `❌ Error checking registration: ${e}`,
          });
        }
      }

      // 6. Check Display Mode
      const isMinimalUi = window.matchMedia(
        '(display-mode: minimal-ui)',
      ).matches;
      const isStandalone = window.matchMedia(
        '(display-mode: standalone)',
      ).matches;
      const iosStandalone = (window.navigator as any).standalone === true;
      const isBrowser = window.matchMedia('(display-mode: browser)').matches;

      if (isBrowser) {
        checks.push({
          check: 'Display Mode',
          status: 'warning',
          message:
            'Currently in browser mode (not PWA) - this is normal if testing',
        });
      } else if (isMinimalUi || isStandalone || iosStandalone) {
        checks.push({
          check: 'Display Mode',
          status: 'pass',
          message: `Running as PWA: ${isMinimalUi ? 'minimal-ui' : isStandalone ? 'standalone' : 'iOS standalone'} ✓`,
        });
      }

      // 7. Check for redirects
      const currentUrl = window.location.href;
      checks.push({
        check: 'Current URL',
        status: 'pass',
        message: `URL: ${currentUrl}`,
      });

      // 8. iOS-specific checks
      const userAgent = window.navigator?.userAgent || '';
      const isIOS = /iPhone|iPad|iPod/.test(userAgent);
      if (isIOS) {
        checks.push({
          check: 'iOS Device',
          status: 'pass',
          message: 'iOS device detected ✓',
        });

        // Check if in private mode
        try {
          await new Promise((resolve, reject) => {
            const db = indexedDB.open('test');
            db.onerror = () => reject(new Error('Private mode'));
            db.onsuccess = () => {
              indexedDB.deleteDatabase('test');
              resolve(true);
            };
            setTimeout(() => resolve(false), 100);
          });
          checks.push({
            check: 'Private Mode',
            status: 'pass',
            message: 'Not in private mode ✓',
          });
        } catch (e: any) {
          if (e.message === 'Private mode') {
            checks.push({
              check: 'Private Mode',
              status: 'fail',
              message:
                '❌ PRIVATE MODE DETECTED - Service workers disabled in private mode!',
            });
          }
        }
      }

      setResults(checks);
    };

    runDiagnostics();
  }, []);

  const passCount = results.filter((r) => r.status === 'pass').length;
  const failCount = results.filter((r) => r.status === 'fail').length;
  const warnCount = results.filter((r) => r.status === 'warning').length;

  return (
    <div className='p-4 space-y-4 max-w-2xl mx-auto'>
      <h1 className='text-2xl font-bold'>🔍 PWA Diagnostic Tool</h1>

      <div className='bg-zinc-900 border border-zinc-700 rounded p-4'>
        <div className='grid grid-cols-3 gap-4 mb-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-green-400'>{passCount}</div>
            <div className='text-xs text-zinc-400'>Passed</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-red-400'>{failCount}</div>
            <div className='text-xs text-zinc-400'>Failed</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-yellow-400'>
              {warnCount}
            </div>
            <div className='text-xs text-zinc-400'>Warnings</div>
          </div>
        </div>
      </div>

      <div className='space-y-2'>
        {results.map((result, i) => (
          <div
            key={i}
            className={`p-3 rounded border ${
              result.status === 'pass'
                ? 'bg-green-900/20 border-green-700'
                : result.status === 'fail'
                  ? 'bg-red-900/20 border-red-700'
                  : 'bg-yellow-900/20 border-yellow-700'
            }`}
          >
            <div className='flex items-start justify-between'>
              <div className='font-bold text-sm'>{result.check}</div>
              <div className='text-xs'>
                {result.status === 'pass'
                  ? '✓'
                  : result.status === 'fail'
                    ? '✗'
                    : '⚠'}
              </div>
            </div>
            <div
              className={`text-xs mt-1 ${
                result.status === 'pass'
                  ? 'text-green-300'
                  : result.status === 'fail'
                    ? 'text-red-300'
                    : 'text-yellow-300'
              }`}
            >
              {result.message}
            </div>
          </div>
        ))}
      </div>

      {failCount > 0 && (
        <div className='bg-red-900/20 border border-red-700 rounded p-4'>
          <h2 className='font-bold text-red-400 mb-2'>
            ❌ Critical Issues Found
          </h2>
          <p className='text-sm text-red-300'>
            Fix the issues above before adding to home screen. iOS requires all
            checks to pass for PWA installation.
          </p>
        </div>
      )}

      {failCount === 0 && warnCount === 0 && results.length > 0 && (
        <div className='bg-green-900/20 border border-green-700 rounded p-4'>
          <h2 className='font-bold text-green-400 mb-2'>
            ✅ All Checks Passed!
          </h2>
          <p className='text-sm text-green-300'>
            Your PWA is ready. You can now add it to home screen. If it still
            doesn't work, iOS may have cached a "not a PWA" decision - try
            deleting the app from home screen and re-adding.
          </p>
        </div>
      )}
    </div>
  );
}
