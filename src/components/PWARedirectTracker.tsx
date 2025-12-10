'use client';

import { useEffect, useState } from 'react';

export function PWARedirectTracker() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const addLog = (message: string) => {
      const timestamp = new Date().toLocaleTimeString();
      const log = `[${timestamp}] ${message}`;
      console.log(log);
      setLogs((prev) => [...prev.slice(-50), log]); // Keep last 50 logs
    };

    // Track initial state
    const checkInitialState = () => {
      const isPWA =
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;

      addLog(`Initial load - PWA mode: ${isPWA}`);
      addLog(
        `Display mode: ${window.matchMedia('(display-mode: minimal-ui)').matches ? 'minimal-ui' : window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'}`,
      );
      if ('serviceWorker' in navigator && navigator.serviceWorker) {
        addLog(
          `Service worker controller: ${!!navigator.serviceWorker.controller}`,
        );
      } else {
        addLog(`Service worker: not available`);
      }
      addLog(`URL: ${window.location.href}`);
    };

    checkInitialState();

    // Track display mode changes
    const checkDisplayMode = () => {
      const isMinimalUi = window.matchMedia(
        '(display-mode: minimal-ui)',
      ).matches;
      const isStandalone = window.matchMedia(
        '(display-mode: standalone)',
      ).matches;
      const isBrowser = window.matchMedia('(display-mode: browser)').matches;
      const iosStandalone = (window.navigator as any).standalone === true;

      addLog(
        `Display mode check - minimal-ui: ${isMinimalUi}, standalone: ${isStandalone}, browser: ${isBrowser}, iOS standalone: ${iosStandalone}`,
      );
    };

    checkDisplayMode();

    // Track URL changes (redirects) - VERY sensitive
    let lastUrl = window.location.href;
    let redirectCount = 0;

    const urlCheckInterval = setInterval(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        redirectCount++;
        addLog(`⚠️ REDIRECT #${redirectCount}: ${lastUrl} → ${currentUrl}`);
        addLog(`Stack trace: ${new Error().stack}`);
        lastUrl = currentUrl;

        // Check if we're in PWA mode after redirect
        const isPWA =
          window.matchMedia('(display-mode: minimal-ui)').matches ||
          window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as any).standalone === true;
        addLog(`After redirect - PWA mode: ${isPWA}`);
      }
    }, 50);

    // Wrap window.location methods to track redirects
    const originalLocationHref = Object.getOwnPropertyDescriptor(
      window,
      'location',
    );

    // Track pushState/replaceState (SPA navigations)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      addLog(`🚨 history.pushState called: ${args[2] || 'unknown'}`);
      addLog(`Stack: ${new Error().stack?.split('\n').slice(2, 5).join('\n')}`);
      return originalPushState.apply(history, args);
    };

    history.replaceState = function (...args) {
      addLog(`🚨 history.replaceState called: ${args[2] || 'unknown'}`);
      addLog(`Stack: ${new Error().stack?.split('\n').slice(2, 5).join('\n')}`);
      return originalReplaceState.apply(history, args);
    };

    // Track window focus/blur (tab changes)
    const handleFocus = () => {
      addLog('Window focused');
      checkDisplayMode();
    };

    const handleBlur = () => {
      addLog('Window blurred');
    };

    // Track service worker controller changes
    let handleControllerChange: (() => void) | null = null;
    let swCheckInterval: NodeJS.Timeout | null = null;

    if ('serviceWorker' in navigator && navigator.serviceWorker) {
      handleControllerChange = () => {
        addLog('Service worker controller changed');
        checkDisplayMode();
      };

      navigator.serviceWorker.addEventListener(
        'controllerchange',
        handleControllerChange,
      );

      // Check controller periodically
      swCheckInterval = setInterval(() => {
        if (navigator.serviceWorker) {
          const hasController = !!navigator.serviceWorker.controller;
          addLog(`Service worker controlling: ${hasController}`);
        }
      }, 2000);
    }

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Track any console errors
    const originalError = console.error;
    console.error = (...args) => {
      addLog(`❌ CONSOLE ERROR: ${args.join(' ')}`);
      originalError.apply(console, args);
    };

    return () => {
      clearInterval(urlCheckInterval);
      if (swCheckInterval) {
        clearInterval(swCheckInterval);
      }
      if (handleControllerChange && navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener(
          'controllerchange',
          handleControllerChange,
        );
      }
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      console.error = originalError;
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  return (
    <div className='fixed bottom-4 left-4 right-4 bg-black/90 border border-red-500 rounded-lg p-4 text-xs font-mono max-h-64 overflow-auto z-[9999]'>
      <div className='flex justify-between items-center mb-2'>
        <h3 className='text-red-400 font-bold'>🔍 PWA Redirect Tracker</h3>
        <button
          onClick={() => setLogs([])}
          className='text-zinc-400 hover:text-white'
        >
          Clear
        </button>
      </div>
      <div className='space-y-1'>
        {logs.length === 0 ? (
          <div className='text-zinc-400'>No logs yet...</div>
        ) : (
          logs.map((log, i) => (
            <div
              key={i}
              className={
                log.includes('⚠️') || log.includes('❌')
                  ? 'text-red-400'
                  : log.includes('URL')
                    ? 'text-lunary-accent'
                    : 'text-lunary-success'
              }
            >
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
