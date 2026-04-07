'use client';

import { useState } from 'react';
import { betterAuthClient } from '@/lib/auth-client';

export function PasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mode, setMode] = useState<'view' | 'set' | 'change'>('view');

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'set') {
        // Setting password for first time (magic link users)
        const result = await betterAuthClient.changePassword({
          newPassword,
          currentPassword: '', // Empty for magic link users
          revokeOtherSessions: false,
        });

        if (result.error) {
          throw new Error(result.error.message || 'Failed to set password');
        }

        setSuccess(
          'Password set successfully! You can now sign in with your password.',
        );
      } else {
        // Changing existing password
        const result = await betterAuthClient.changePassword({
          currentPassword,
          newPassword,
          revokeOtherSessions: true,
        });

        if (result.error) {
          throw new Error(result.error.message || 'Failed to change password');
        }

        setSuccess('Password changed successfully!');
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMode('view');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'view') {
    return (
      <div className='space-y-4'>
        <p className='text-sm text-content-muted'>
          Manage your password for signing in with email and password.
        </p>

        <div className='flex flex-col gap-2'>
          <button
            onClick={() => setMode('set')}
            className='w-full bg-lunary-primary hover:bg-lunary-primary-400 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm'
          >
            Set a Password
          </button>
          <p className='text-xs text-content-muted text-center'>
            If you signed in with magic link and want to use a password instead
          </p>
        </div>

        <div className='flex flex-col gap-2'>
          <button
            onClick={() => setMode('change')}
            className='w-full bg-surface-overlay hover:bg-surface-overlay text-content-primary font-medium py-2 px-4 rounded-lg transition-colors text-sm'
          >
            Change Password
          </button>
          <p className='text-xs text-content-muted text-center'>
            If you already have a password and want to change it
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSetPassword} className='space-y-4'>
      <p className='text-sm text-content-muted'>
        {mode === 'set'
          ? 'Set a password to sign in without magic link.'
          : 'Enter your current password and choose a new one.'}
      </p>

      {mode === 'change' && (
        <div>
          <label className='block text-sm font-medium text-content-secondary mb-1'>
            Current Password
          </label>
          <input
            type='password'
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className='w-full bg-surface-card border border-stroke-default text-content-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lunary-primary'
            required
          />
        </div>
      )}

      <div>
        <label className='block text-sm font-medium text-content-secondary mb-1'>
          {mode === 'set' ? 'Password' : 'New Password'}
        </label>
        <input
          type='password'
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className='w-full bg-surface-card border border-stroke-default text-content-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lunary-primary'
          placeholder='At least 8 characters'
          minLength={8}
          required
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-content-secondary mb-1'>
          Confirm Password
        </label>
        <input
          type='password'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className='w-full bg-surface-card border border-stroke-default text-content-primary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lunary-primary'
          placeholder='Type password again'
          minLength={8}
          required
        />
      </div>

      {error && (
        <div className='bg-red-900/30 border border-red-700 text-red-300 px-3 py-2 rounded-lg text-sm'>
          {error}
        </div>
      )}

      {success && (
        <div className='bg-layer-base/30 border border-lunary-success-700 text-lunary-success-300 px-3 py-2 rounded-lg text-sm'>
          {success}
        </div>
      )}

      <div className='flex gap-2'>
        <button
          type='button'
          onClick={() => {
            setMode('view');
            setError(null);
            setSuccess(null);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
          }}
          className='flex-1 bg-surface-overlay hover:bg-surface-overlay text-content-primary font-medium py-2 px-4 rounded-lg transition-colors text-sm'
        >
          Cancel
        </button>
        <button
          type='submit'
          disabled={loading}
          className='flex-1 bg-lunary-primary hover:bg-lunary-primary-400 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm'
        >
          {loading
            ? 'Saving...'
            : mode === 'set'
              ? 'Set Password'
              : 'Change Password'}
        </button>
      </div>
    </form>
  );
}
