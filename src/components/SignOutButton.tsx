'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { betterAuthClient } from '@/lib/auth-client';
import { useAuthStatus } from './AuthStatus';

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

    try {
      // Step 2: Clear storage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }

      // Step 3: Sign out from better-auth (fire and forget)
      betterAuthClient.signOut().catch(() => {});

      // Step 4: Clear cookies
      if (typeof document !== 'undefined') {
        document.cookie.split(';').forEach((c) => {
          const name = c.split('=')[0].trim();
          if (name) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          }
        });
      }

      // Step 5: Navigate home
      router.replace('/');
      router.refresh();
    } catch (error) {
      console.error('Sign out cleanup error:', error);
      router.replace('/');
    } finally {
      setLoading(false);
      setTimeout(() => {
        isSigningOut.current = false;
      }, 1000);
    }
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
      {loading ? 'Signing Out...' : '🚪 Sign Out'}
    </button>
  );
}
