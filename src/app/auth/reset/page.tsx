'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromQuery = searchParams.get('token') ?? '';
  const errorFromQuery = searchParams.get('error') ?? '';

  const [token, setToken] = useState(tokenFromQuery);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorFromQuery === 'INVALID_TOKEN'
      ? 'This reset link is invalid or has expired. Please request a new one.'
      : null,
  );
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (tokenFromQuery) {
      setToken(tokenFromQuery);
    }
  }, [tokenFromQuery]);

  const canSubmit = useMemo(() => {
    return (
      !loading &&
      token.trim().length > 0 &&
      password.length >= 8 &&
      password === confirmPassword
    );
  }, [token, password, confirmPassword, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/password/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token.trim(),
          newPassword: password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result?.status) {
        throw new Error(
          result?.message || 'Unable to reset your password. Try again.',
        );
      }

      setSuccess(
        'Password updated! You can now sign in with your new password.',
      );
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        router.push('/auth');
      }, 2000);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-black text-white flex items-center justify-center p-4'>
      <div className='w-full max-w-md bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 shadow-2xl'>
        <div className='text-center mb-8'>
          <div className='text-4xl mb-3'>🔐</div>
          <h1 className='text-3xl font-semibold mb-2'>Reset your password</h1>
          <p className='text-sm text-zinc-400'>
            Enter a new password below. Make sure it&apos;s at least 8
            characters long.
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-5'>
          {/* Only show token input if not provided in URL */}
          {!tokenFromQuery && (
            <div>
              <label
                htmlFor='token'
                className='block text-sm font-medium text-zinc-300 mb-2'
              >
                Reset token
              </label>
              <input
                id='token'
                name='token'
                value={token}
                onChange={(event) => setToken(event.target.value)}
                className='w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lunary-primary focus:border-transparent'
                placeholder='Paste your reset token'
                required
              />
              <p className='mt-2 text-xs text-zinc-500'>
                Paste the token from your password reset email.
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-zinc-300 mb-2'
            >
              New password
            </label>
            <input
              id='password'
              name='password'
              type='password'
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lunary-primary focus:border-transparent'
              placeholder='Enter a strong password'
              required
            />
          </div>

          <div>
            <label
              htmlFor='confirmPassword'
              className='block text-sm font-medium text-zinc-300 mb-2'
            >
              Confirm password
            </label>
            <input
              id='confirmPassword'
              name='confirmPassword'
              type='password'
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className='w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lunary-primary focus:border-transparent'
              placeholder='Re-enter your new password'
              required
            />
          </div>

          {password && confirmPassword && password !== confirmPassword && (
            <p className='text-xs text-lunary-error'>
              Passwords must match before you can reset.
            </p>
          )}

          {error && (
            <div className='bg-lunary-error-900/30 border border-lunary-error-700 text-lunary-error-300 px-4 py-3 rounded-lg text-sm'>
              {error}
            </div>
          )}

          {success && (
            <div className='bg-lunary-success-900/30 border border-lunary-success-700 text-lunary-success-300 px-4 py-3 rounded-lg text-sm'>
              {success}
            </div>
          )}

          <button
            type='submit'
            disabled={!canSubmit}
            className='w-full bg-lunary-primary-600 hover:bg-lunary-primary-700 disabled:bg-lunary-primary-900 disabled:text-lunary-primary-300/60 text-white font-medium rounded-lg py-3 transition-colors flex items-center justify-center gap-2'
          >
            {loading ? (
              <>
                <span className='animate-spin'>⏳</span>
                Resetting password...
              </>
            ) : (
              'Reset password'
            )}
          </button>
        </form>

        <div className='mt-6 text-center'>
          <button
            onClick={() => router.push('/auth')}
            className='text-sm text-lunary-primary-300 hover:text-lunary-primary-200 transition-colors'
          >
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-black text-white flex items-center justify-center p-4'>
          <div className='text-zinc-400'>Loading...</div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
