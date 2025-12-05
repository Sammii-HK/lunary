'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { betterAuthClient } from '@/lib/auth-client';
import { useAuthStatus, invalidateAuthCache } from './AuthStatus';

export function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, signOut } = useAuthStatus();
  const router = useRouter();
  const isSigningOut = useRef(false);

  const handleSignOut = async () => {
    if (isSigningOut.current || loading) return;

    isSigningOut.current = true;
    setLoading(true);

    // Step 1: IMMEDIATELY update auth state - UI reacts instantly
    signOut();

    // Step 2: Clear all storage first
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }

    // Step 3: Clear cookies
    if (typeof document !== 'undefined') {
      document.cookie.split(';').forEach((c) => {
        const name = c.split('=')[0].trim();
        if (name) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        }
      });
    }

    // Step 4: Sign out from better-auth - AWAIT this
    try {
      await betterAuthClient.signOut();
    } catch {
      // Ignore errors, session might already be gone
    }

    // Step 5: Invalidate cache again after server signout
    invalidateAuthCache();

    // Step 6: Navigate home and force refresh to clear all state
    router.replace('/');
    router.refresh();

    setLoading(false);
    setTimeout(() => {
      isSigningOut.current = false;
    }, 500);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className='bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors'
    >
      {loading ? 'Signing Out...' : 'Sign Out'}
    </button>
  );
}
