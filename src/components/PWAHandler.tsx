'use client';

import { useEffect, useState } from 'react';
import { useAuthStatus } from '@/components/AuthStatus';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

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
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [notificationToggle, setNotificationToggle] = useState(false);
  const [notificationPromptSeen, setNotificationPromptSeen] = useState(false);

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = localStorage.getItem('pwa_notifications_prompted');
    setNotificationPromptSeen(seen === '1');
    const toggleValue = localStorage.getItem('pwa_notifications_toggle');
    setNotificationToggle(toggleValue === '1');
  }, []);

  useEffect(() => {
    if (isInstalled && !notificationPromptSeen) {
      const timer = setTimeout(() => {
        setShowNotificationPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isInstalled, notificationPromptSeen]);

  const handleInstallClick = async () => {
    // Android/Desktop: Use programmatic install
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      setDeferredPrompt(null);
      setShowInstallPrompt(outcome === 'accepted' ? false : true);
      return;
    }

    // iOS: Show instructions
    setShowInstallPrompt(true);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setIsDismissed(true);
    // Remember dismissal for 7 days
    localStorage.setItem('pwa_banner_dismissed', Date.now().toString());
  };

  const handleNotificationToggle = async () => {
    if (typeof window === 'undefined') return;
    const enable = !notificationToggle;
    if (enable && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setNotificationToggle(false);
        localStorage.setItem('pwa_notifications_toggle', '0');
      } else {
        setNotificationToggle(true);
        localStorage.setItem('pwa_notifications_toggle', '1');
      }
    } else {
      setNotificationToggle(false);
      localStorage.setItem('pwa_notifications_toggle', '0');
    }
    setNotificationPromptSeen(true);
    localStorage.setItem('pwa_notifications_prompted', '1');
    setShowNotificationPrompt(false);
  };

  const handleNotificationDismiss = () => {
    setShowNotificationPrompt(false);
    setNotificationPromptSeen(true);
    localStorage.setItem('pwa_notifications_prompted', '1');
  };

  const showInstallBanner =
    !silent &&
    !isInstalled &&
    !isDismissed &&
    showInstallPrompt &&
    !authState.loading &&
    authState.isAuthenticated;

  const showNotificationsBanner =
    !silent &&
    isInstalled &&
    !notificationPromptSeen &&
    showNotificationPrompt &&
    authState.isAuthenticated;

  if (!showInstallBanner && !showNotificationsBanner) {
    return null;
  }

  const isIOS =
    typeof window !== 'undefined' &&
    /iPhone|iPad|iPod/.test(window.navigator.userAgent);
  const installInstructions = isIOS
    ? [
        'Tap the Share button (square with arrow) from Safari.',
        'Choose "Add to Home Screen".',
        'Tap "Add" and launch Lunary from your home screen.',
      ]
    : [
        'Open the browser menu (⋮ or ⁝) and tap "Install app".',
        'Choose "Add to Home screen" or "Install".',
        'Launch Lunary from your home screen or launcher for a fast, offline-ready experience.',
      ];

  if (showNotificationsBanner) {
    return (
      <div className='fixed bottom-14 md:bottom-16 left-0 right-0 z-40'>
        <div className='bg-gradient-to-r from-lunary-primary-950/80 via-zinc-950/80 to-lunary-rose-950/80 border-t border-lunary-primary-700/30 px-4 py-4 backdrop-blur-md'>
          <div className='max-w-4xl mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div>
              <h3 className='text-sm font-semibold text-lunary-primary-200'>
                Stay in the loop
              </h3>
              <p className='text-xs text-zinc-400 mt-1'>
                Enable push alerts so Lunary can share moon phases, retrogrades,
                and fresh readings right when they happen.
              </p>
            </div>
            <div className='flex items-center gap-3'>
              <Switch
                checked={notificationToggle}
                onCheckedChange={handleNotificationToggle}
                className='border border-zinc-700 bg-zinc-900'
              />
              <Button
                variant='outline'
                size='sm'
                onClick={handleNotificationDismiss}
              >
                Later
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='fixed bottom-14 md:bottom-16 left-0 right-0 z-40'>
      <div className='bg-gradient-to-r from-lunary-primary-950/80 via-zinc-950/80 to-lunary-rose-950/80 border-t border-lunary-primary-700/30 px-4 py-4 backdrop-blur-md'>
        <div className='max-w-4xl mx-auto flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
          <div className='flex-1'>
            <h3 className='text-sm font-semibold text-lunary-primary-200'>
              Install Lunary App
            </h3>
            <p className='text-xs text-zinc-300 mt-0.5'>
              Instant access, offline reads, and a smoother home-screen
              experience.
            </p>
            <ul className='mt-2 space-y-1 text-[11px] text-zinc-400'>
              {installInstructions.map((instruction) => (
                <li key={instruction}>• {instruction}</li>
              ))}
            </ul>
          </div>
          <div className='flex gap-3 md:ml-4'>
            <Button variant='ghost' size='sm' onClick={handleDismiss}>
              Maybe Later
            </Button>
            <Button variant='lunary' size='sm' onClick={handleInstallClick}>
              {isIOS ? 'Show Steps' : 'Install'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
