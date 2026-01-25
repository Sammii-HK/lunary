'use client';

import { useEffect } from 'react';
import { useAuthStatus } from '@/components/AuthStatus';
import { conversionTracking } from '@/lib/analytics';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authStatus = useAuthStatus();

  useEffect(() => {
    if (!authStatus.loading) {
      conversionTracking.productOpened(
        authStatus.user?.id,
        authStatus.user?.email,
      );
    }
  }, [authStatus.loading, authStatus.user?.id, authStatus.user?.email]);

  return <>{children}</>;
}
