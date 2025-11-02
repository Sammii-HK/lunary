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
    // Register service worker with aggressive cleanup
    if ('serviceWorker' in navigator) {
      // FORCE UNREGISTER ALL service workers first to clear any stale ones
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          console.log(
            `Found ${registrations.length} service worker registrations`,
          );
          // Unregister ALL service workers
          const unregisterPromises = registrations.map((reg) => {
            console.log('Unregistering service worker:', reg.scope);
            return reg.unregister().then((success) => {
              console.log(`Unregistered ${reg.scope}: ${success}`);
              return success;
            });
          });
          return Promise.all(unregisterPromises);
        })
        .then(() => {
          // Wait a moment for unregistration to complete
          return new Promise((resolve) => setTimeout(resolve, 500));
        })
        .then(() => {
          // Register fresh service worker
          console.log('Registering fresh service worker...');
          return navigator.serviceWorker
            .register('/sw.js?v=' + Date.now(), {
              scope: '/',
              updateViaCache: 'none',
            })
            .then((registration) => {
              console.log('✅ Service Worker registered:', registration.scope);

              // Force immediate update
              registration.update();

              // Wait for ready
              return navigator.serviceWorker.ready.then(() => {
                console.log('✅ Service Worker is ready and controlling');

                // Additional diagnostic
                navigator.serviceWorker.getRegistration().then((reg) => {
                  if (reg) {
                    console.log('✅ Registration confirmed:', {
                      scope: reg.scope,
                      active: reg.active?.scriptURL,
                      waiting: reg.waiting?.scriptURL,
                      installing: reg.installing?.scriptURL,
                    });
                  }
                });
              });
            });
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
          if (error instanceof Error) {
            console.error('Error details:', {
              message: error.message,
              name: error.name,
              stack: error.stack,
            });
          }
        });
    } else {
      console.error('❌ Service Worker not supported');
    }

    // Check if app is already installed
    const checkInstalled = () => {
      if (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      ) {
        setIsInstalled(true);
      }
    };

    checkInstalled();

    // Debug: Check PWA criteria
    const debugInfo = {
      isSecureContext: window.isSecureContext,
      hasServiceWorker: 'serviceWorker' in navigator,
      standalone: window.matchMedia('(display-mode: standalone)').matches,
      userAgent: navigator.userAgent,
      location: window.location.href,
      protocol: window.location.protocol,
    };
    console.log('🔍 PWA Debug Info:', debugInfo);

    // Check manifest
    fetch('/manifest.json')
      .then((res) => {
        console.log('Manifest fetch:', res.status, res.statusText);
        return res.json();
      })
      .then((manifest) => {
        console.log('✅ Manifest loaded:', {
          name: manifest.name,
          display: manifest.display,
          start_url: manifest.start_url,
          scope: manifest.scope,
          icons: manifest.icons?.length,
        });
      })
      .catch((err) => {
        console.error('❌ Manifest fetch failed:', err);
      });

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('🎯 beforeinstallprompt event fired!', e);
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Listen for app installed event
    const handleAppInstalled = (e: Event) => {
      console.log('🎯 appinstalled event fired!', e);
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
      <div className='bg-zinc-800 border border-zinc-700 rounded-lg p-4 shadow-lg'>
        <div className='flex items-center justify-between'>
          <div className='flex-1'>
            <h3 className='text-sm font-medium text-white'>Install Lunary</h3>
            <p className='text-xs text-zinc-400 mt-1'>
              Add to your home screen for quick access
            </p>
          </div>
          <div className='flex gap-2 ml-4'>
            <button
              onClick={handleDismiss}
              className='px-3 py-1 text-xs text-zinc-400 hover:text-white transition-colors'
            >
              Later
            </button>
            <button
              onClick={handleInstallClick}
              className='px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white text-xs rounded transition-colors'
            >
              Install
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
