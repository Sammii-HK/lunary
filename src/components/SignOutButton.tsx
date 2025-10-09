'use client';

import { useState } from 'react';
import { betterAuthClient } from '@/lib/auth-client';
import { useAuthStatus } from './AuthStatus';

export function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const authState = useAuthStatus();

  const handleSignOut = async () => {
    setLoading(true);
    
    try {
      console.log('🔄 Starting comprehensive sign out...');
      
      // Step 1: Sign out from Better Auth
      try {
        await betterAuthClient.signOut();
        console.log('✅ Better Auth signed out');
      } catch (error) {
        console.log('⚠️ Better Auth sign out failed (may not be signed in):', error);
      }

      // Step 2: Clear ALL localStorage and sessionStorage
      if (typeof window !== 'undefined') {
        console.log('🗑️ Clearing all browser storage...');
        
        // Clear everything - nuclear option
        localStorage.clear();
        sessionStorage.clear();
        
        // Also manually clear specific keys that might persist
        const specificKeys = [
          'auth_token', 'better-auth', 'migration_completed', 'migration_data', 
          'migration_profile_data', 'migration_user_name', 'user_session',
          'jazz', 'co-', 'account'
        ];
        
        specificKeys.forEach(key => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });
        
        console.log('✅ Cleared all storage completely');
      }

      // Step 3: Clear cookies
      if (typeof document !== 'undefined') {
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
          if (name) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
          }
        });
        console.log('✅ Cleared cookies');
      }

      console.log('🎉 Complete sign out finished');
      
      console.log('✅ Sign out completed');
      
    } catch (error) {
      console.error('❌ Sign out error:', error);
      // Force reload anyway
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
    >
      {loading ? (
        <>
          <span className="animate-spin mr-2">⏳</span>
          Signing Out...
        </>
      ) : (
        '🚪 Sign Out'
      )}
    </button>
  );
}
