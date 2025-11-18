'use client';

import { useEffect, useRef } from 'react';
import { AuthComponent } from '@/components/Auth';
import { useAuthStatus } from '@/components/AuthStatus';

// Skip auth redirects in test/CI environments
const isTestMode =
  process.env.NODE_ENV === 'test' ||
  process.env.CI === 'true' ||
  !!process.env.CI ||
  (typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'));

export default function AuthPage() {
  const authState = useAuthStatus();
  const redirectExecuted = useRef(false);

  useEffect(() => {
    // Skip redirect logic in test mode
    if (isTestMode) return;

    if (typeof window === 'undefined') return;
    if (!window.location.pathname.includes('/auth')) return;
    if (redirectExecuted.current) return;

    if (!authState.loading && authState.isAuthenticated) {
      redirectExecuted.current = true;
      window.location.replace('/');
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
    <div className='min-h-screen bg-black text-white flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-purple-400 mb-2'>🌙 Lunary</h1>
          <p className='text-zinc-400'>Your Personal Cosmic Journey</p>
        </div>

        <AuthComponent />
      </div>
    </div>
  );
}
