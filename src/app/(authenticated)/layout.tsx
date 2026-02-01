'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStatus } from '@/components/AuthStatus';
import { conversionTracking } from '@/lib/analytics';
import SessionTracker from '@/components/SessionTracker';
import { TourProvider } from '@/context/TourContext';

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
      <SessionTracker />
      {children}
    </TourProvider>
  );
}
