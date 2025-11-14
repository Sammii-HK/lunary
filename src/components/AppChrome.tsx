'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { PWAHandler } from '@/components/PWAHandler';
import { NotificationManager } from '@/components/NotificationManager';
import { ExitIntent } from '@/components/ExitIntent';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { ErrorBoundaryWrapper } from '@/components/ErrorBoundaryWrapper';

export function AppChrome() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <ErrorBoundaryWrapper>
        <PWAHandler
          allowUnauthenticatedInstall={isAdminRoute}
          silent={isAdminRoute}
        />
        {!isAdminRoute && (
          <>
            <NotificationManager />
            <ExitIntent />
            <OnboardingFlow />
          </>
        )}
      </ErrorBoundaryWrapper>
    </>
  );
}
