'use client';

import React, { useState } from 'react';
import { betterAuthClient } from '@/lib/auth-client';

export default function TestBetterAuthPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Check current session on load
  React.useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await betterAuthClient.getSession();
      setCurrentUser(session && 'user' in session ? session.user : null);
    } catch (error) {
      setCurrentUser(null);
    }
  };

  const testSignUp = async () => {
    setLoading(true);
    try {
      const response = await betterAuthClient.signUp.email({
        email: 'test@example.com',
        password: 'testpassword123',
        name: 'Test User',
      });
      setResult({ success: true, data: response, action: 'Sign Up' });
      await checkSession(); // Refresh session
    } catch (error: any) {
      setResult({ success: false, error: error.message, action: 'Sign Up' });
    } finally {
      setLoading(false);
    }
  };

  const testSignIn = async () => {
    setLoading(true);
    try {
      const response = await betterAuthClient.signIn.email({
        email: 'test@example.com',
        password: 'testpassword123',
      });
      setResult({ success: true, data: response, action: 'Sign In' });
      await checkSession(); // Refresh session
    } catch (error: any) {
      setResult({ success: false, error: error.message, action: 'Sign In' });
    } finally {
      setLoading(false);
    }
  };

  const testSignOut = async () => {
    setLoading(true);
    try {
      await betterAuthClient.signOut();
      setResult({
        success: true,
        message: 'Signed out successfully',
        action: 'Sign Out',
      });
      await checkSession(); // Refresh session
    } catch (error: any) {
      setResult({ success: false, error: error.message, action: 'Sign Out' });
    } finally {
      setLoading(false);
    }
  };

  const testGetSession = async () => {
    setLoading(true);
    try {
      const session = await betterAuthClient.getSession();
      setResult({ success: true, data: session, action: 'Get Session' });
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        action: 'Get Session',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-black text-white p-8'>
      <div className='max-w-2xl mx-auto'>
        <h1 className='text-3xl font-bold mb-8 text-purple-400'>
          🧪 Complete Authentication Flow Test
        </h1>

        {/* Current User Status */}
        <div className='bg-zinc-800 rounded-lg p-4 mb-8'>
          <h2 className='text-lg font-semibold mb-2 text-zinc-200'>
            Current Status
          </h2>
          {currentUser ? (
            <div className='text-green-400'>
              ✅ Signed in as:{' '}
              <strong>{currentUser.name || currentUser.email}</strong>
              <div className='text-sm text-zinc-400 mt-1'>
                Email: {currentUser.email} | ID: {currentUser.id}
              </div>
            </div>
          ) : (
            <div className='text-zinc-400'>❌ Not signed in</div>
          )}
        </div>

        <div className='grid grid-cols-2 gap-4 mb-8'>
          <button
            onClick={testSignUp}
            disabled={loading}
            className='bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 px-4 py-2 rounded font-medium text-white transition-colors'
          >
            {loading ? '⏳' : '📝'} Test Sign Up
          </button>

          <button
            onClick={testSignIn}
            disabled={loading}
            className='bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 px-4 py-2 rounded font-medium text-white transition-colors'
          >
            {loading ? '⏳' : '🔑'} Test Sign In
          </button>

          <button
            onClick={testGetSession}
            disabled={loading}
            className='bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 px-4 py-2 rounded font-medium text-white transition-colors'
          >
            {loading ? '⏳' : '👤'} Get Session
          </button>

          <button
            onClick={testSignOut}
            disabled={loading}
            className='bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 px-4 py-2 rounded font-medium text-white transition-colors'
          >
            {loading ? '⏳' : '🚪'} Sign Out
          </button>
        </div>

        {result && (
          <div
            className={`rounded-lg p-6 ${
              result.success
                ? 'bg-green-900/30 border border-green-700'
                : 'bg-red-900/30 border border-red-700'
            }`}
          >
            <h3 className='text-lg font-semibold mb-4'>
              {result.success ? '✅ Success' : '❌ Error'} - {result.action}
            </h3>
            <pre className='text-sm overflow-x-auto whitespace-pre-wrap'>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className='mt-8 bg-zinc-900 rounded-lg p-6'>
          <h3 className='text-lg font-semibold mb-3 text-zinc-200'>
            📋 Integration Status
          </h3>
          <div className='space-y-2 text-sm text-zinc-400'>
            <p>✅ Jazz tools updated to latest version (0.18.20)</p>
            <p>✅ Better Auth server configured with Jazz plugin</p>
            <p>✅ Better Auth client configured with Jazz plugin</p>
            <p>
              ✅ Database migration completed (accountID, encryptedCredentials
              added)
            </p>
            <p>✅ AuthProvider wrapping JazzReactProvider</p>
            <p>
              ⚠️ WASM crypto compatibility issues with Next.js (working on fix)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
