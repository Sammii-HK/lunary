'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function PWAHandler() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Register service worker IMMEDIATELY on page load
    if ('serviceWorker' in navigator) {
      // Force immediate registration for standalone mode
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.getRegistration();

          if (registration) {
            // Update existing service worker
            await registration.update();
            console.log('✅ Service worker updated');

            // Wait for it to be ready
            const readyRegistration = await navigator.serviceWorker.ready;
            console.log(
              '✅ Service worker ready and controlling:',
              readyRegistration.active?.state,
            );

            // Force skip waiting if needed
            if (readyRegistration.waiting) {
              readyRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
          } else {
            // Register new service worker
            const newRegistration = await navigator.serviceWorker.register(
              '/sw.js',
              {
                scope: '/',
                updateViaCache: 'none', // Always check for updates
              },
            );
            console.log('✅ Service worker registered:', newRegistration.scope);

            // Wait for it to be ready
            await navigator.serviceWorker.ready;
            console.log('✅ Service worker ready');
          }

          // Ensure service worker is controlling this page
          if (navigator.serviceWorker.controller) {
            console.log('✅ Service worker is controlling this page');
          } else {
            console.log(
              '⚠️ Service worker not yet controlling, will activate on next load',
            );
          }
        } catch (error) {
          console.error('❌ Service Worker registration failed:', error);
        }
      };

      // Register immediately
      registerSW();

      // Listen for controller changes but don't reload in PWA mode
      // Reloading in PWA can cause it to open in a tab
      const handleControllerChange = () => {
        console.log('✅ Service worker controller changed');
        // Only reload if NOT in PWA mode (to avoid breaking standalone)
        const isPWA =
          window.matchMedia('(display-mode: minimal-ui)').matches ||
          window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as any).standalone === true;

        if (!isPWA) {
          console.log('Reloading page (not in PWA mode)');
          window.location.reload();
        } else {
          console.log('Skipping reload (PWA mode - would break standalone)');
        }
      };

      navigator.serviceWorker.addEventListener(
        'controllerchange',
        handleControllerChange,
      );

      return () => {
        navigator.serviceWorker.removeEventListener(
          'controllerchange',
          handleControllerChange,
        );
      };
    }

    // Check if app is already installed
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Listen for app installed event
    const handleAppInstalled = (e: Event) => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div className='fixed bottom-20 left-4 right-4 z-50'>
      <div className='bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-4 shadow-lg backdrop-blur-sm'>
        <div className='flex items-center justify-between'>
          <div className='flex-1'>
            <h3 className='text-base font-semibold text-white'>
              Install Lunary App
            </h3>
            <p className='text-sm text-purple-200 mt-1'>
              Get faster access and offline support
            </p>
          </div>
          <div className='flex gap-2 ml-4'>
            <button
              onClick={handleDismiss}
              className='px-4 py-2 text-sm text-zinc-300 hover:text-white transition-colors'
            >
              Later
            </button>
            <button
              onClick={handleInstallClick}
              className='px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg font-medium transition-colors shadow-lg'
            >
              Install
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
