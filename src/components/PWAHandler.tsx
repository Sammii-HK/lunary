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
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileInstructions, setShowMobileInstructions] = useState(false);
  const [swStatus, setSwStatus] = useState<string>('Checking...');
  const [manifestStatus, setManifestStatus] = useState<string>('Checking...');
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Register service worker - KEEP IT REGISTERED once working
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistration()
        .then((existingRegistration) => {
          if (existingRegistration) {
            // Service worker already registered - just check for updates
            console.log(
              '✅ Service Worker already registered:',
              existingRegistration.scope,
            );

            // Check for updates in background (don't block)
            existingRegistration.update();

            return navigator.serviceWorker.ready.then(() => {
              console.log('✅ Service Worker is ready');
              // Ensure service worker is controlling the page
              if (navigator.serviceWorker.controller) {
                console.log('✅ Service Worker is controlling the page');
                setSwStatus('✅ Active & Controlling');
              } else {
                console.warn(
                  '⚠️ Service Worker registered but not controlling - refresh may be needed',
                );
                setSwStatus('⚠️ Registered (refresh needed)');
              }
            });
          } else {
            // Register new service worker
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

                // Wait for ready AND reload to ensure it controls the page
                return navigator.serviceWorker.ready.then(() => {
                  console.log('✅ Service Worker is ready');
                  // On first registration, service worker might not control immediately
                  // Check if it's controlling
                  if (navigator.serviceWorker.controller) {
                    console.log('✅ Service Worker is controlling the page');
                    setSwStatus('✅ Active & Controlling');
                  } else {
                    console.log('⚠️ Service Worker will control after reload');
                    setSwStatus('⚠️ Registered (reload page)');
                  }
                });
              });
          }
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
          setSwStatus('❌ Registration failed');
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

    // Detect mobile and iOS specifically
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent,
      );
    const iosDevice = /iphone|ipad|ipod/i.test(userAgent);
    setIsMobile(isMobileDevice);
    setIsIOS(iosDevice);

    // On mobile, show instructions after service worker is ready (iOS doesn't need SW for basic PWA)
    let mobileTimer: NodeJS.Timeout;
    if (isMobileDevice && !isInstalled) {
      if (iosDevice) {
        // iOS Safari: Service worker not required for basic "Add to Home Screen"
        setSwStatus('ℹ️ iOS (SW optional)');
        mobileTimer = setTimeout(() => {
          setShowMobileInstructions(true);
        }, 1000);
      } else {
        // Android Chrome: Service worker REQUIRED
        navigator.serviceWorker.ready
          .then(() => {
            if (navigator.serviceWorker.controller) {
              setSwStatus('✅ Ready for Install');
              mobileTimer = setTimeout(() => {
                setShowMobileInstructions(true);
              }, 500);
            } else {
              setSwStatus('⚠️ Reload page first');
              mobileTimer = setTimeout(() => {
                setShowMobileInstructions(true);
              }, 2000);
            }
          })
          .catch(() => {
            setSwStatus('❌ Not ready');
            mobileTimer = setTimeout(() => {
              setShowMobileInstructions(true);
            }, 2000);
          });
      }
    }

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
        setManifestStatus(`✅ Valid (${manifest.display})`);
      })
      .catch((err) => {
        console.error('❌ Manifest fetch failed:', err);
        setManifestStatus('❌ Failed to load');
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
      if (mobileTimer) {
        clearTimeout(mobileTimer);
      }
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
    setShowMobileInstructions(false);
  };

  // Mobile instructions modal
  if (isMobile && showMobileInstructions && !isInstalled) {
    return (
      <div className='fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4'>
        <div className='bg-zinc-800 border border-zinc-700 rounded-lg p-6 max-w-sm w-full shadow-xl'>
          <h3 className='text-lg font-semibold text-white mb-3'>
            Install Lunary
          </h3>
          <div className='space-y-4 text-sm'>
            <div className='bg-zinc-900 rounded p-3 space-y-2'>
              <div className='text-zinc-300'>
                <span className='font-medium'>Service Worker:</span>{' '}
                <span
                  className={
                    swStatus.includes('✅')
                      ? 'text-green-400'
                      : swStatus.includes('⚠️')
                        ? 'text-yellow-400'
                        : 'text-red-400'
                  }
                >
                  {swStatus}
                </span>
              </div>
              <div className='text-zinc-300'>
                <span className='font-medium'>Manifest:</span>{' '}
                <span
                  className={
                    manifestStatus.includes('✅')
                      ? 'text-green-400'
                      : 'text-red-400'
                  }
                >
                  {manifestStatus}
                </span>
              </div>
            </div>
            {swStatus.includes('⚠️') || swStatus.includes('❌') ? (
              <div className='bg-yellow-900/30 border border-yellow-700 rounded p-3 mb-3'>
                <p className='text-yellow-200 text-sm font-medium'>
                  ⚠️ Action Required:{' '}
                  {swStatus.includes('reload')
                    ? 'Please reload this page first, then add to home screen.'
                    : 'Service worker not ready. Wait a moment and try again.'}
                </p>
              </div>
            ) : null}
            <div className='space-y-2 text-zinc-300'>
              <p className='font-medium'>Follow these steps:</p>
              <ol className='list-decimal list-inside space-y-2 ml-2'>
                <li>
                  {swStatus.includes('⚠️') || swStatus.includes('❌') ? (
                    <span className='line-through text-zinc-500'>
                      Tap the menu button (⋮) in Chrome
                    </span>
                  ) : (
                    <>
                      Tap the <strong className='text-white'>menu</strong>{' '}
                      button (⋮) in Chrome
                    </>
                  )}
                </li>
                <li>
                  {isIOS ? (
                    <>
                      Tap{' '}
                      <strong className='text-white'>
                        "Add to Home Screen"
                      </strong>
                    </>
                  ) : (
                    <>
                      Select{' '}
                      <strong className='text-white'>"Install app"</strong> (not
                      "Add to Home Screen")
                    </>
                  )}
                </li>
                <li>
                  Tap <strong className='text-white'>"Install"</strong> when
                  prompted
                </li>
              </ol>
            </div>
            <p className='text-xs text-zinc-400 mt-4'>
              {isIOS
                ? 'ℹ️ Note: On iOS 17.4+, PWAs open in Safari. On older iOS, they open standalone. Make sure to DELETE the old home screen icon and add a NEW one after visiting this page.'
                : swStatus.includes('✅')
                  ? '✅ Ready to install! Make sure to use "Install app" not "Add to Home Screen".'
                  : 'Service worker must be active for proper PWA installation.'}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className='mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors'
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  // Desktop install prompt (beforeinstallprompt)
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
