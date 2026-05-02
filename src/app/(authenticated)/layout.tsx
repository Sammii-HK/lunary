'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { WifiOff } from 'lucide-react';
import { useAuthStatus } from '@/components/AuthStatus';
import { conversionTracking } from '@/lib/analytics';
import SessionTracker from '@/components/SessionTracker';
import { TourProvider } from '@/context/TourContext';
import { AnnouncementProvider } from '@/components/feature-announcements/AnnouncementProvider';
import { nativePushService } from '@/services/native';
import { configureIAP } from '@/hooks/useIAPSubscription';
import { OfflineIndicator } from '@/components/offline/OfflineIndicator';

function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className='fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white px-4 py-2 text-center text-sm flex items-center justify-center gap-2 shadow-lg'>
      <WifiOff className='w-4 h-4' />
      <span>You're offline - browsing cached content</span>
    </div>
  );
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authStatus = useAuthStatus();
  const router = useRouter();
  const pathname = usePathname() ?? '/app';

  // Ensure first client render matches server render to prevent hydration mismatch.
  // The server always renders loading state; the client must do the same on hydration
  // before switching to the real auth-dependent content after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Track if product_opened has been fired this session to avoid wasteful API calls
  const productOpenedFired = useRef(false);
  const nativePushInitialized = useRef(false);

  useEffect(() => {
    if (!authStatus.loading && !authStatus.isAuthenticated) {
      const returnTo = encodeURIComponent(pathname);
      if (Capacitor.isNativePlatform()) {
        // Native: replace so WKWebView back-button doesn't expose auth content.
        router.replace(`/auth?returnTo=${returnTo}`);
      } else {
        // Web / PWA: push so the browser back-button returns to /app instead of
        // skipping over it to the marketing page.
        router.push(`/auth?returnTo=${returnTo}`);
      }
    }
  }, [authStatus.isAuthenticated, authStatus.loading, pathname, router]);

  // Fire product_opened once when user is authenticated
  // The analytics guard handles daily deduplication at storage/DB level
  useEffect(() => {
    if (
      !authStatus.loading &&
      authStatus.isAuthenticated &&
      !productOpenedFired.current
    ) {
      productOpenedFired.current = true;
      conversionTracking.productOpened(
        authStatus.user?.id,
        authStatus.user?.email,
      );
    }
  }, [
    authStatus.loading,
    authStatus.isAuthenticated,
    authStatus.user?.id,
    authStatus.user?.email,
  ]);

  // Suppress Capacitor "plugin not implemented" console.error in iOS simulator.
  // The plugin bridge itself logs console.error before our catch block runs.
  // On a real device with Firebase set up, this never fires.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const orig = console.error.bind(console);
    console.error = (...args: unknown[]) => {
      const msg = args
        .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
        .join(' ');
      if (
        msg.includes('not implemented') ||
        msg.includes('FirebaseMessaging') ||
        msg.includes('APNS token') ||
        msg.includes('FCM Token') ||
        msg === '{}' ||
        msg === ''
      ) {
        console.debug('[Native] Suppressed expected simulator error:', msg);
        return;
      }
      orig(...args);
    };
    return () => {
      console.error = orig;
    };
  }, []);

  // Initialize native push notifications for authenticated users
  useEffect(() => {
    if (
      !authStatus.loading &&
      authStatus.isAuthenticated &&
      authStatus.user?.id &&
      !nativePushInitialized.current
    ) {
      nativePushInitialized.current = true;
      // Configure RevenueCat IAP and push in background — don't block render
      configureIAP(authStatus.user.id).catch((error) => {
        console.debug('[Layout] IAP configure skipped:', error);
      });
      nativePushService.initialize(authStatus.user.id).catch((error) => {
        console.debug('[Layout] Native push init skipped:', error);
      });
    }
  }, [authStatus.loading, authStatus.isAuthenticated, authStatus.user?.id]);

  if (!mounted || authStatus.loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <span className='text-content-muted text-sm'>
          Checking authentication…
        </span>
      </div>
    );
  }

  if (!authStatus.isAuthenticated) {
    // Keep showing loading while window.location.replace navigates to /auth.
    // Returning null here causes a blank screen in Capacitor WKWebView.
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <span className='text-content-muted text-sm'>Redirecting…</span>
      </div>
    );
  }

  return (
    <TourProvider>
      <AnnouncementProvider>
        <OfflineIndicator />
        <OfflineBanner />
        <SessionTracker />
        {children}
      </AnnouncementProvider>
    </TourProvider>
  );
}
