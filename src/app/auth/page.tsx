'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { useSafeSearchParams } from '@/lib/safeSearchParams';
import { AuthComponent } from '@/components/Auth';
import { useAuthStatus } from '@/components/AuthStatus';
import { MarketingFooter } from '@/components/MarketingFooter';
import { Logo } from '@/components/Logo';
import { BrandedPageLoader } from '@/components/states/BrandedPageLoader';

// Skip auth redirects ONLY in Playwright e2e tests (NOT Jest unit tests)
function isTestMode(): boolean {
  if (typeof window === 'undefined') return false;

  // Jest unit tests run in jsdom (Node.js), not real browser
  // Only skip for Playwright e2e tests which run in real browser
  return (
    window.navigator.userAgent.includes('HeadlessChrome') ||
    (window as any).__PLAYWRIGHT_TEST__ === true ||
    (window.location.hostname === 'localhost' &&
      window.navigator.userAgent.includes('Playwright'))
  );
}

export default function AuthPage() {
  const authState = useAuthStatus();
  const router = useRouter();
  const redirectExecuted = useRef(false);
  const searchParams = useSafeSearchParams();
  const defaultToSignUp = searchParams.get('signup') === 'true';
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  useEffect(() => {
    // Skip redirect logic in Playwright e2e test mode
    if (isTestMode()) return;

    if (typeof window === 'undefined') return;
    if (!window.location.pathname.includes('/auth')) return;
    if (redirectExecuted.current) return;

    if (!authState.loading && authState.isAuthenticated) {
      redirectExecuted.current = true;
      if (Capacitor.isNativePlatform()) {
        router.replace('/app');
      } else {
        window.location.replace('/app');
      }
    }
  }, [authState.isAuthenticated, authState.loading, router]);

  if (authState.loading || authState.isAuthenticated) {
    return (
      <BrandedPageLoader
        message={
          authState.isAuthenticated
            ? 'Taking you to the app…'
            : 'Checking authentication…'
        }
      />
    );
  }

  return (
    <div className='min-h-screen bg-surface-base text-content-primary flex flex-col'>
      <div className='flex-1 flex items-center justify-center p-4'>
        <div className='w-full max-w-md'>
          <div className='text-center mb-8'>
            <div className='flex items-center justify-center gap-3 mb-2'>
              <Logo size={48} />
              <h1 className='text-3xl md:text-4xl font-bold text-lunary-accent'>
                Lunary
              </h1>
            </div>
            <p className='text-content-muted'>
              Your birth chart, daily transits, and personalised tarot — free
              for 7 days
            </p>
          </div>

          <AuthComponent defaultToSignUp={defaultToSignUp} />
        </div>
      </div>
      {!isNative && (
        <div className='mt-auto'>
          <MarketingFooter />
        </div>
      )}
    </div>
  );
}
