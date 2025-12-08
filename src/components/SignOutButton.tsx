'use client';

import { useState } from 'react';
import { betterAuthClient } from '@/lib/auth-client';
import { useAuthStatus, invalidateAuthCache } from './AuthStatus';

interface SignOutButtonProps {
  variant?: 'primary' | 'text' | 'full-width';
  redirect?: boolean;
}

export function SignOutButton({
  variant = 'primary',
  redirect = true,
}: SignOutButtonProps) {
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, signOut } = useAuthStatus();

  const handleSignOut = async () => {
    if (loading) return;
    setLoading(true);

    // Update local auth state immediately
    signOut();

    // Clear all storage
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }

    // Clear cookies
    if (typeof document !== 'undefined') {
      document.cookie.split(';').forEach((c) => {
        const name = c.split('=')[0].trim();
        if (name) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        }
      });
    }

    // Sign out from server
    try {
      await betterAuthClient.signOut();
    } catch {
      // Ignore - session might already be gone
    }

    // Clear auth cache
    invalidateAuthCache();

    // Hard reload to guarantee UI updates
    if (redirect) {
      window.location.href = '/';
    } else {
      window.location.reload();
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const baseClasses = 'font-medium transition-colors disabled:opacity-50';
  const variantClasses = {
    primary:
      'bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-4 py-2 rounded-lg',
    text: 'text-red-400 hover:text-red-300 px-4 py-2',
    'full-width':
      'w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white py-3 px-4 rounded-lg',
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {loading ? 'Signing Out...' : 'Sign Out'}
    </button>
  );
}
