'use client';

import { useEffect, useRef } from 'react';
import { AuthComponent } from '@/components/Auth';
import { useAuthStatus } from '@/components/AuthStatus';
import { MarketingFooter } from '@/components/MarketingFooter';

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
  const redirectExecuted = useRef(false);

  useEffect(() => {
    // Skip redirect logic in Playwright e2e test mode
    if (isTestMode()) return;

    if (typeof window === 'undefined') return;
    if (!window.location.pathname.includes('/auth')) return;
    if (redirectExecuted.current) return;

    if (!authState.loading && authState.isAuthenticated) {
      redirectExecuted.current = true;
      window.location.replace('/app');
    }
  }, [authState.isAuthenticated, authState.loading]);

  if (authState.loading) {
    return (
      <div className='min-h-screen bg-black text-white flex items-center justify-center p-4'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4'></div>
          <p className='text-zinc-400'>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (authState.isAuthenticated) {
    return null;
  }

  return (
    <div className='min-h-screen bg-black text-white flex flex-col'>
      <div className='flex-1 flex items-center justify-center p-4'>
        <div className='w-full max-w-md'>
          <div className='text-center mb-8'>
            <h1 className='text-4xl font-bold text-purple-400 mb-2'>
              🌙 Lunary
            </h1>
            <p className='text-zinc-400'>Your Personal Cosmic Journey</p>
          </div>

          <AuthComponent />
        </div>
      </div>
      <div className='mt-auto'>
        <MarketingFooter />
      </div>
    </div>
  );
}
