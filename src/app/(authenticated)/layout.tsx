'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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

  // Track if product_opened has been fired this session to avoid wasteful API calls
  const productOpenedFired = useRef(false);
  const nativePushInitialized = useRef(false);

  useEffect(() => {
    if (!authStatus.loading && !authStatus.isAuthenticated) {
      const returnTo = encodeURIComponent(pathname);
      router.replace(`/auth?returnTo=${returnTo}`);
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

  if (authStatus.loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <span className='text-zinc-400 text-sm'>Checking authentication…</span>
      </div>
    );
  }

  if (!authStatus.isAuthenticated) {
    return null;
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
