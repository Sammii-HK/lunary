'use client';

import { useEffect } from 'react';
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

  useEffect(() => {
    if (!authStatus.loading && !authStatus.isAuthenticated) {
      const returnTo = encodeURIComponent(pathname);
      router.replace(`/auth?returnTo=${returnTo}`);
    }
  }, [authStatus.isAuthenticated, authStatus.loading, pathname, router]);

  useEffect(() => {
    if (!authStatus.loading) {
      conversionTracking.productOpened(
        authStatus.user?.id,
        authStatus.user?.email,
      );
    }
  }, [authStatus.loading, authStatus.user?.id, authStatus.user?.email]);

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
    <>
      <SessionTracker />
      <TourProvider>{children}</TourProvider>
    </>
  );
}
