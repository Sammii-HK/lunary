'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { useSafeSearchParams } from '@/lib/safeSearchParams';
import { AuthComponent } from '@/components/Auth';
import { useAuthStatus } from '@/components/AuthStatus';
import { MarketingFooter } from '@/components/MarketingFooter';
import { Logo } from '@/components/Logo';

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

      const redirect = () => {
        if (Capacitor.isNativePlatform()) {
          router.replace('/app');
        } else {
          window.location.replace('/app');
        }
      };

      // If the user came in from a quiz (cookie set on the quiz result page),
      // claim their pending result before redirecting. This fires the quiz
      // result email and clears the cookie. Failures here are swallowed so
      // the user still reaches /app.
      if (document.cookie.includes('lunary_pending_quiz=')) {
        fetch('/api/quiz/claim', {
          method: 'POST',
          credentials: 'include',
        })
          .catch(() => {})
          .finally(redirect);
      } else {
        redirect();
      }
    }
  }, [authState.isAuthenticated, authState.loading, router]);

  if (authState.loading || authState.isAuthenticated) {
    // Show spinner while auth check runs OR while redirecting to /app.
    // Returning null causes a blank screen in Capacitor WKWebView.
    return (
      <div className='min-h-screen bg-surface-base text-content-primary flex items-center justify-center p-4'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-lunary-primary mx-auto mb-4'></div>
          <p className='text-content-muted'>
            {authState.isAuthenticated
              ? 'Taking you to the app…'
              : 'Checking authentication...'}
          </p>
        </div>
      </div>
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
