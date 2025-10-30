'use client';

import { useState } from 'react';
import { betterAuthClient } from '@/lib/auth-client';
import { useAccount } from 'jazz-tools/react';
import { useAuthStatus } from './AuthStatus';

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
  const [isSignUp, setIsSignUp] = useState(defaultToSignUp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: '',
  });

  const account = useAccount();
  const authState = useAuthStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        const result = await betterAuthClient.signUp.email(
          {
            email: formData.email,
            password: formData.password,
            name: formData.name || 'User',
          },
          {
            onSuccess: async () => {
              // According to Jazz docs: "Don't forget to update the profile's name. It's not done automatically."
              if (account?.me?.profile) {
                account.me.profile.$jazz.set('name', formData.name || 'User');
                console.log('✅ Updated Jazz profile name:', formData.name);
              }
            },
          },
        );

        console.log('✅ Sign up result:', result);

        if (result.error) {
          throw new Error(result.error.message || 'Signup failed');
        }

        setSuccess('Account created successfully! You are now signed in.');
        setFormData({ email: '', password: '', name: '' });

        // Wait for session to be established, then trigger React state update
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Call onSuccess callback to trigger React re-render (no redirect needed)
        if (onSuccess) {
          onSuccess();
        } else {
          // Instead of redirecting, just close the modal and let React handle the state change
          setSuccess('Account created successfully! Welcome to Lunary.');
        }
      } else {
        const result = await betterAuthClient.signIn.email({
          email: formData.email,
          password: formData.password,
        });

        console.log('✅ Sign in result:', result);

        if (result.error) {
          throw new Error(result.error.message || 'Sign in failed');
        }

        setSuccess('Signed in successfully!');
        setFormData({ email: '', password: '', name: '' });

        // Brief delay for UI feedback, then proceed
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Call onSuccess callback to close modal and trigger re-render
        if (onSuccess) {
          onSuccess();
        } else {
          setSuccess('Welcome back! You are now signed in.');
        }
      }
    } catch (err: any) {
      console.error('Authentication error:', err);

      // Better error messages
      let errorMessage = 'Authentication failed. Please try again.';
      if (err.message?.includes('Invalid credentials')) {
        errorMessage =
          'Invalid email or password. Please check your credentials.';
      } else if (err.message?.includes('User already exists')) {
        errorMessage =
          'An account with this email already exists. Try signing in instead.';
      } else if (err.message?.includes('User not found')) {
        errorMessage =
          'No account found with this email. Try signing up instead.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // Use Better Auth's sign out method - Jazz will automatically sync
      await betterAuthClient.signOut();
      console.log('✅ Signed out successfully');

      console.log('✅ Auth state will refresh automatically');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // If user is authenticated, show sign out option
  if (authState.isAuthenticated) {
    return (
      <div className='w-full max-w-md mx-auto bg-zinc-900 rounded-lg p-6'>
        <div className='text-center mb-6'>
          <h2 className='text-2xl font-bold text-white mb-2'>Welcome back!</h2>
          <p className='text-zinc-400'>
            Signed in as:{' '}
            <span className='text-purple-400'>
              {authState.profile?.name || authState.user?.name || 'User'}
            </span>
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className='w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors'
        >
          Sign Out
        </button>
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
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          <p className='text-zinc-400'>
            {isSignUp
              ? 'Join Lunary to sync your cosmic journey'
              : 'Welcome back to your cosmic journey'}
          </p>
        </div>
      )}

      {compact && (
        <div className='text-center mb-4'>
          <p className='text-sm text-zinc-300'>
            {isSignUp ? 'Create account to save' : 'Sign in to save'}
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
              className={`w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${compact ? 'px-3 py-2 text-sm' : 'px-4 py-3'}`}
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
            className='w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            placeholder='Enter your email'
          />
        </div>

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
            className='w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            placeholder='Enter your password'
            minLength={6}
          />
        </div>

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
          className={`w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white font-medium rounded-lg transition-colors ${compact ? 'py-2 px-3 text-sm' : 'py-3 px-4'}`}
        >
          {loading ? (
            <>
              <span className='animate-spin mr-2'>⏳</span>
              {isSignUp ? 'Creating Account...' : 'Signing In...'}
            </>
          ) : isSignUp ? (
            'Create Account'
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className='mt-6 text-center'>
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
            setSuccess(null);
            setFormData({ email: '', password: '', name: '' });
          }}
          className='text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors'
        >
          {isSignUp
            ? 'Already have an account? Sign in'
            : "Don't have an account? Sign up"}
        </button>
      </div>

      <div className='mt-4 text-center'>
        <p className='text-xs text-zinc-500'>
          🔒 Your data is securely encrypted and synced across devices
        </p>
      </div>
    </div>
  );
}
