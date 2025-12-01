'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { betterAuthClient } from '@/lib/auth-client';
import { invalidateAuthCache } from './AuthStatus';

interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

interface AuthButtonsProps {
  variant?: 'primary' | 'secondary' | 'navbar';
  className?: string;
}

function isTestMode(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    window.navigator.userAgent.includes('HeadlessChrome') ||
    (window as any).__PLAYWRIGHT_TEST__ === true ||
    (window.location.hostname === 'localhost' &&
      window.navigator.userAgent.includes('Playwright'))
  );
}

export function AuthButtons({
  variant = 'primary',
  className = '',
}: AuthButtonsProps) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(!isTestMode());

  useEffect(() => {
    if (isTestMode()) {
      setLoading(false);
      return;
    }
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const session = await betterAuthClient.getSession();
      const user =
        session && typeof session === 'object'
          ? 'user' in session
            ? (session as any).user
            : (session as any)?.data?.user
          : null;

      if (user) {
        setAuthUser({
          id: user.id,
          email: user.email,
          name: user.name,
        });
      } else {
        setAuthUser(null);
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setAuthUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await betterAuthClient.signOut();
      invalidateAuthCache();
      setAuthUser(null);
    } catch (error) {
      console.error('Sign out failed:', error);
      setAuthUser(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className='animate-pulse bg-zinc-700 h-10 w-20 rounded-full'></div>
        <div className='animate-pulse bg-zinc-700 h-10 w-20 rounded-full'></div>
      </div>
    );
  }

  if (authUser) {
    const displayName = authUser.name || 'User';

    if (variant === 'navbar') {
      return (
        <div className={`flex items-center gap-3 ${className}`}>
          <span className='text-sm text-zinc-300'>👋 {displayName}</span>
          <Link
            href='/profile'
            className='text-xs text-purple-400 hover:text-purple-300 transition-colors'
          >
            Profile
          </Link>
        </div>
      );
    }

    return (
      <div
        className={`flex flex-col sm:flex-row items-center gap-4 ${className}`}
      >
        <div className='text-center'>
          <p className='text-zinc-300 mb-2'>
            Welcome back,{' '}
            <span className='text-purple-400 font-medium'>{displayName}</span>!
          </p>
          <p className='text-sm text-zinc-500'>
            Your cosmic profile is synced and ready
          </p>
        </div>
        <div className='flex gap-3'>
          <Link
            href='/profile'
            className='bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full font-medium transition-colors'
          >
            View Profile
          </Link>
          <button
            onClick={handleSignOut}
            className='text-red-400 hover:text-red-300 px-4 py-2 font-medium transition-colors'
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // If not authenticated, show single profile creation button
  const baseButtonClasses =
    'font-medium transition-all duration-300 rounded-full';

  if (variant === 'primary') {
    return (
      <div className={`flex justify-center items-center ${className}`}>
        <Link
          href='/profile'
          className={`${baseButtonClasses} bg-purple-500/10 hover:bg-purple-500/15 text-purple-300/90 border border-purple-500/20 hover:border-purple-500/30 px-8 py-4 text-lg transition-all`}
        >
          Start Free Trial
        </Link>
      </div>
    );
  }

  if (variant === 'secondary') {
    return (
      <div className={`flex justify-center ${className}`}>
        <Link
          href='/profile'
          className={`${baseButtonClasses} bg-purple-500/10 hover:bg-purple-500/15 text-purple-300/90 border border-purple-500/20 hover:border-purple-500/30 px-6 py-3`}
        >
          Start Free Trial
        </Link>
      </div>
    );
  }

  if (variant === 'navbar') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Link
          href='/profile'
          className='text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-full transition-colors'
        >
          Profile
        </Link>
      </div>
    );
  }

  return null;
}
