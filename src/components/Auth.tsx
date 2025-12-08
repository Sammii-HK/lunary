'use client';

import { useState } from 'react';
import { betterAuthClient } from '@/lib/auth-client';
import { useAuthStatus, invalidateAuthCache } from './AuthStatus';
import { SignOutButton } from './SignOutButton';
import { conversionTracking } from '@/lib/analytics';

interface AuthFormData {
  email: string;
  password: string;
  name?: string;
}

interface AuthComponentProps {
  onSuccess?: () => void;
  compact?: boolean;
  defaultToSignUp?: boolean;
}

export function AuthComponent({
  onSuccess,
  compact = false,
  defaultToSignUp = false,
}: AuthComponentProps = {}) {
  const [mode, setMode] = useState<'signIn' | 'signUp' | 'forgot'>(
    defaultToSignUp ? 'signUp' : 'signIn',
  );
  const isSignUp = mode === 'signUp';
  const isForgot = mode === 'forgot';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: '',
  });

  const { refreshAuth, ...authState } = useAuthStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isForgot) {
        if (!formData.email) {
          throw new Error('Enter the email you use with Lunary.');
        }

        const redirectTo =
          typeof window !== 'undefined'
            ? `${window.location.origin}/auth/reset`
            : undefined;

        const response = await fetch('/api/auth/password/forgot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            ...(redirectTo ? { redirectTo } : {}),
          }),
        });

        const result = await response.json();

        if (!response.ok || !result?.status) {
          throw new Error(
            result?.message ||
              result?.error ||
              'Unable to send the reset email. Please try again.',
          );
        }

        setSuccess(
          result?.message ||
            'If that email exists in our system, we just sent a reset link. Check your inbox.',
        );
        setMode('signIn');
        setFormData({ email: '', password: '', name: '' });
        return;
      }

      if (isSignUp) {
        // No timeout - let the request complete naturally
        const result = await betterAuthClient.signUp.email({
          email: formData.email,
          password: formData.password,
          name: formData.name || 'User',
        });

        console.log('✅ Sign up result:', result);

        if (result.error) {
          throw new Error(result.error.message || 'Signup failed');
        }

        const user = result.data?.user;
        if (user) {
          conversionTracking.signup(user.id, formData.email);
        }

        setSuccess('Account created successfully! You are now signed in.');
        setFormData({ email: '', password: '', name: '' });

        await new Promise((resolve) => setTimeout(resolve, 500));

        invalidateAuthCache();
        refreshAuth();

        if (onSuccess) {
          onSuccess();
        } else {
          setSuccess('Account created successfully! Welcome to Lunary.');
        }
      } else {
        // No timeout - let the request complete naturally
        const result = await betterAuthClient.signIn.email({
          email: formData.email,
          password: formData.password,
        });

        console.log('✅ Sign in result:', result);

        if (result.error) {
          console.error('❌ Sign in error:', result.error);
          throw new Error(result.error.message || 'Sign in failed');
        }

        if (!result.data) {
          console.error('❌ Sign in failed - no data returned');
          throw new Error('Sign in failed - no data returned');
        }

        console.log('✅ Sign in successful, user:', result.data.user?.email);

        // If on admin subdomain, redirect immediately after successful sign-in
        if (
          typeof window !== 'undefined' &&
          window.location.hostname.startsWith('admin.')
        ) {
          console.log('🔄 Redirecting to admin dashboard after sign-in');
          setSuccess('Signed in successfully! Redirecting...');
          // Use setTimeout to ensure redirect happens after state update
          setTimeout(() => {
            console.log('🔄 Executing redirect to /');
            window.location.href = '/';
          }, 500);
          return;
        }

        // If on /auth page (not in modal), redirect to app
        if (
          typeof window !== 'undefined' &&
          window.location.pathname === '/auth'
        ) {
          console.log('🔄 Redirecting to app after sign-in');
          setSuccess('Signed in successfully! Redirecting...');
          setTimeout(() => {
            window.location.href = '/app';
          }, 500);
          return;
        }

        setSuccess('Signed in successfully!');
        setFormData({ email: '', password: '', name: '' });

        await new Promise((resolve) => setTimeout(resolve, 500));

        invalidateAuthCache();
        refreshAuth();

        if (onSuccess) {
          onSuccess();
        } else {
          setSuccess('Welcome back! You are now signed in.');
        }
      }
    } catch (err: any) {
      console.error('Authentication error:', err);

      let errorMessage = isForgot
        ? 'We could not send the reset email. Please try again.'
        : 'Authentication failed. Please try again.';

      const msg = err.message || '';

      if (msg.includes('timed out')) {
        errorMessage =
          'Request timed out. The authentication server may not be responding. Please check your connection and try again.';
      } else if (
        msg.includes('Invalid credentials') ||
        msg.includes('invalid')
      ) {
        errorMessage =
          'Invalid email or password. Please check your credentials.';
      } else if (msg.includes('User already exists')) {
        errorMessage =
          'An account with this email already exists. Try signing in instead.';
      } else if (msg.includes('User not found')) {
        errorMessage =
          'No account found with this email. Try signing up instead.';
      } else if (msg) {
        errorMessage = msg;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // If user is authenticated and on /auth page, redirect (handled by page component)
  // If in a modal/compact mode, show sign out option
  if (authState.isAuthenticated) {
    // If on /auth page (not in modal), let the page component handle redirect
    if (typeof window !== 'undefined' && window.location.pathname === '/auth') {
      return null; // Page component will handle redirect
    }

    // Otherwise show sign out option (for modals)
    return (
      <div className='w-full max-w-md mx-auto bg-zinc-900 rounded-lg p-6'>
        <div className='text-center mb-6'>
          <h2 className='text-2xl font-bold text-white mb-2'>Welcome back!</h2>
          <p className='text-zinc-400'>
            Signed in as:{' '}
            <span className='text-lunary-accent'>
              {authState.profile?.name || authState.user?.name || 'User'}
            </span>
          </p>
        </div>

        <SignOutButton variant='full-width' redirect={false} />
      </div>
    );
  }

  const containerClasses = compact
    ? 'bg-transparent'
    : 'w-full max-w-md mx-auto bg-zinc-900 rounded-lg p-6';

  return (
    <div className={containerClasses}>
      {!compact && (
        <div className='text-center mb-6'>
          <h2 className='text-2xl font-bold text-white mb-2'>
            {isSignUp
              ? 'Create Account'
              : isForgot
                ? 'Reset Your Password'
                : 'Sign In'}
          </h2>
          <p className='text-zinc-400'>
            {isSignUp
              ? 'Join Lunary to sync your cosmic journey'
              : isForgot
                ? 'Send yourself a secure password reset link'
                : 'Welcome back to your cosmic journey'}
          </p>
        </div>
      )}

      {compact && (
        <div className='text-center mb-4'>
          <p className='text-sm text-zinc-300'>
            {isSignUp
              ? 'Create account to save'
              : isForgot
                ? 'Reset your Lunary password'
                : 'Sign in to save'}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-4'>
        {isSignUp && (
          <div>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-zinc-300 mb-2'
            >
              Name
            </label>
            <input
              id='name'
              name='name'
              type='text'
              required={isSignUp}
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full bg-zinc-800 border border-zinc-700 text-white text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-lunary-primary focus:border-transparent ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}
              placeholder='Enter your name'
            />
          </div>
        )}

        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-zinc-300 mb-2'
          >
            Email
          </label>
          <input
            id='email'
            name='email'
            type='email'
            required
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full bg-zinc-800 border border-zinc-700 text-white text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-lunary-primary focus:border-transparent ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}
            placeholder='Enter your email'
          />
        </div>

        {!isForgot && (
          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-zinc-300 mb-2'
            >
              Password
            </label>
            <input
              id='password'
              name='password'
              type='password'
              required
              value={formData.password}
              onChange={handleInputChange}
              className='w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lunary-primary focus:border-transparent text base'
              placeholder='Enter your password'
              minLength={6}
            />
          </div>
        )}

        {!isForgot && !isSignUp && (
          <div className='flex justify-end'>
            <button
              type='button'
              onClick={() => {
                setMode('forgot');
                setError(null);
                setSuccess(null);
              }}
              className='text-base text-lunary-accent-300 hover:text-lunary-accent-200 transition-colors'
            >
              Forgot password?
            </button>
          </div>
        )}

        {error && (
          <div className='bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm'>
            {error}
          </div>
        )}

        {success && (
          <div className='bg-green-900/30 border border-green-700 text-green-300 px-4 py-3 rounded-lg text-sm'>
            {success}
          </div>
        )}

        <button
          type='submit'
          disabled={loading}
          className={`w-full bg-lunary-primary hover:bg-lunary-primary-400 disabled:bg-lunary-primary-800 disabled:opacity-50 text-white font-medium rounded-lg transition-colors ${compact ? 'py-2 px-3 text-sm' : 'py-3 px-4'}`}
        >
          {loading ? (
            <>
              <span className='animate-spin mr-2'>⏳</span>
              {isSignUp
                ? 'Creating Account...'
                : isForgot
                  ? 'Sending Reset Link...'
                  : 'Signing In...'}
            </>
          ) : isSignUp ? (
            'Create Account'
          ) : isForgot ? (
            'Send Reset Link'
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className='mt-6 text-center'>
        {isForgot ? (
          <button
            onClick={() => {
              setMode('signIn');
              setError(null);
              setSuccess(null);
              setFormData({ email: '', password: '', name: '' });
            }}
            className='text-lunary-accent hover:text-lunary-accent-300 text-sm font-medium transition-colors'
          >
            Remembered your password? Sign in
          </button>
        ) : (
          <button
            onClick={() => {
              setMode(isSignUp ? 'signIn' : 'signUp');
              setError(null);
              setSuccess(null);
              setFormData({ email: '', password: '', name: '' });
            }}
            className='text-lunary-accent hover:text-lunary-accent-300 text-sm font-medium transition-colors'
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        )}
      </div>

      <div className='mt-4 text-center'>
        <p className='text-xs text-zinc-500'>
          🔒 Your data is securely encrypted and synced across devices
        </p>
      </div>
    </div>
  );
}
