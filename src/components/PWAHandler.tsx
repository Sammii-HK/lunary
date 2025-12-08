'use client';

import { useEffect, useState } from 'react';
import { useAuthStatus } from '@/components/AuthStatus';

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

interface PWAHandlerProps {
  allowUnauthenticatedInstall?: boolean;
  silent?: boolean;
}

export function PWAHandler({
  allowUnauthenticatedInstall = false,
  silent = false,
}: PWAHandlerProps = {}) {
  const authState = useAuthStatus();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if user dismissed the banner within the last 7 days
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const dismissedAt = localStorage.getItem('pwa_banner_dismissed');
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < sevenDays) {
        setIsDismissed(true);
      } else {
        localStorage.removeItem('pwa_banner_dismissed');
      }
    }
  }, []);

  useEffect(() => {
    // Skip service worker registration in development to prevent caching issues
    const isDevelopment =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      process.env.NODE_ENV === 'development';

    if (isDevelopment) {
      console.log('🔧 Development mode: Skipping service worker registration');
      // Unregister any existing service workers in development
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister().then(() => {
              console.log('✅ Unregistered service worker for development');
            });
          });
        });
      }
      return;
    }

    // Register service worker - CRITICAL: Must be active and controlling for iOS PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistration()
        .then(async (existingRegistration) => {
          if (existingRegistration) {
            existingRegistration.update();
            await navigator.serviceWorker.ready;

            if (!navigator.serviceWorker.controller) {
              await new Promise((resolve) => {
                let attempts = 0;
                const checkController = setInterval(() => {
                  attempts++;
                  if (navigator.serviceWorker.controller || attempts > 50) {
                    clearInterval(checkController);
                    resolve(true);
                  }
                }, 100);
              });
            }
          } else {
            const registration = await navigator.serviceWorker.register(
              '/sw.js',
              {
                scope: '/',
              },
            );

            await navigator.serviceWorker.ready;

            if (registration.active) {
              registration.active.postMessage({ type: 'SKIP_WAITING' });
            }

            if (!navigator.serviceWorker.controller) {
              await new Promise((resolve) => {
                let attempts = 0;
                const checkController = setInterval(() => {
                  attempts++;
                  if (navigator.serviceWorker.controller || attempts > 50) {
                    clearInterval(checkController);
                    resolve(true);
                  }
                }, 100);
              });
            }
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
      if (silent) {
        return;
      }
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

    if (!silent) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      if (!silent) {
        window.removeEventListener(
          'beforeinstallprompt',
          handleBeforeInstallPrompt,
        );
      }
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [deferredPrompt, silent]);

  const handleInstallClick = async () => {
    // Android/Desktop: Use programmatic install
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      return;
    }

    // iOS: Show instructions
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (isIOS) {
      const isChrome = /CriOS|Chrome/.test(navigator.userAgent);
      if (isChrome) {
        alert(
          '⚠️ IMPORTANT: Chrome on iOS does NOT support PWAs!\n\nTo install Lunary as a PWA:\n\n1. Open this page in SAFARI (not Chrome)\n2. Wait for the service worker to register (check debug box)\n3. Tap the Share button (square with arrow)\n4. Scroll down and tap "Add to Home Screen"\n5. Tap "Add"\n\nThen open it from your home screen!\n\nChrome on iOS only creates bookmarks, not real PWAs.',
        );
      } else {
        alert(
          'To install Lunary:\n\n1. Make sure service worker is registered (check debug box in top-right)\n2. Tap the Share button (square with arrow)\n3. Scroll down and tap "Add to Home Screen"\n4. Tap "Add"\n\nThen open it from your home screen!',
        );
      }
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setIsDismissed(true);
    // Remember dismissal for 7 days
    localStorage.setItem('pwa_banner_dismissed', Date.now().toString());
  };

  const shouldHideBanner =
    silent ||
    isInstalled ||
    isDismissed ||
    !showInstallPrompt ||
    authState.loading ||
    !authState.isAuthenticated;

  if (shouldHideBanner) {
    return null;
  }

  return (
    <div className='fixed top-0 left-0 right-0 z-50 safe-area-inset-top'>
      <div className='bg-gradient-to-r from-lunary-primary-700 to-lunary-highlight-700 border-b border-lunary-primary-800 px-4 py-3 backdrop-blur-md'>
        <div className='max-w-4xl mx-auto flex items-center justify-between'>
          <div className='flex-1'>
            <h3 className='text-sm font-semibold text-white'>
              Install Lunary App
            </h3>
            <p className='text-xs text-lunary-accent-300 mt-0.5'>
              Get faster access and offline support
            </p>
          </div>
          <div className='flex gap-2 ml-4'>
            <button
              onClick={handleDismiss}
              className='px-3 py-1.5 text-xs text-white/80 hover:text-white transition-colors'
            >
              Later
            </button>
            <button
              onClick={handleInstallClick}
              className='px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg font-medium transition-colors'
            >
              Install
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
