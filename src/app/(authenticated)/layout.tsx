'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { useAuthStatus } from '@/components/AuthStatus';
import { conversionTracking } from '@/lib/analytics';
import SessionTracker from '@/components/SessionTracker';
import { TourProvider } from '@/context/TourContext';
import { AnnouncementProvider } from '@/components/feature-announcements/AnnouncementProvider';
import dynamic from 'next/dynamic';
import { nativePushService } from '@/services/native';

// Dynamically import OfflineBanner to avoid SSR issues
const OfflineBanner = dynamic(
  () =>
    import('@/components/native/OfflineBanner').then((m) => ({
      default: m.OfflineBanner,
    })),
  { ssr: false },
);

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
      if (typeof window !== 'undefined') {
        if (Capacitor.isNativePlatform()) {
          // On native, use Next.js router to avoid WKWebView opening Safari
          router.replace(`/auth?returnTo=${returnTo}`);
        } else {
          // On web, use hard navigation for reliability before cookies are set
          window.location.replace(`/auth?returnTo=${returnTo}`);
        }
      } else {
        router.replace(`/auth?returnTo=${returnTo}`);
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
      const msg = args.join(' ');
      if (
        msg.includes('not implemented') ||
        msg.includes('FirebaseMessaging')
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
      // Initialize in background - don't block render
      nativePushService.initialize(authStatus.user.id).catch((error) => {
        console.debug('[Layout] Native push init skipped:', error);
      });
    }
  }, [authStatus.loading, authStatus.isAuthenticated, authStatus.user?.id]);

  if (!mounted || authStatus.loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <span className='text-zinc-400 text-sm'>Checking authentication…</span>
      </div>
    );
  }

  if (!authStatus.isAuthenticated) {
    // Keep showing loading while window.location.replace navigates to /auth.
    // Returning null here causes a blank screen in Capacitor WKWebView.
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <span className='text-zinc-400 text-sm'>Redirecting…</span>
      </div>
    );
  }

  return (
    <TourProvider>
      <AnnouncementProvider>
        <OfflineBanner />
        <SessionTracker />
        {children}
      </AnnouncementProvider>
    </TourProvider>
  );
}
