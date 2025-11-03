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
    // Register service worker - KEEP IT SIMPLE (like working version)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistration()
        .then((existingRegistration) => {
          if (existingRegistration) {
            console.log(
              '✅ Service Worker already registered:',
              existingRegistration.scope,
            );
            existingRegistration.update();
            return navigator.serviceWorker.ready.then(() => {
              console.log('✅ Service Worker is ready');
            });
          } else {
            console.log('Registering service worker...');
            return navigator.serviceWorker
              .register('/sw.js', {
                scope: '/',
              })
              .then((registration) => {
                console.log(
                  '✅ Service Worker registered:',
                  registration.scope,
                );
                return navigator.serviceWorker.ready.then(() => {
                  console.log('✅ Service Worker is ready and controlling');
                });
              });
          }
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    }

    // Check if app is already installed (including minimal-ui for iOS)
    const isPWA =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      (window.navigator as any).standalone === true;

    if (isPWA) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event (Android/Desktop only)
    // On iOS, this won't fire - users must manually "Add to Home Screen"
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // On iOS, show install prompt after a delay if not installed
    // beforeinstallprompt doesn't work on iOS Safari
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator?.userAgent || '';
      const isIOS = /iPhone|iPad|iPod/.test(userAgent);
      if (isIOS && !isPWA && !deferredPrompt) {
        // Show install prompt on iOS after 5 seconds
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 5000);
      }
    }

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
    // Android/Desktop: Use programmatic install
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }

      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      return;
    }

    // iOS: Show instructions
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (isIOS) {
      alert(
        'To install Lunary:\n\n1. Tap the Share button (square with arrow)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add"\n\nThen open it from your home screen!',
      );
      setShowInstallPrompt(false);
    }
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
