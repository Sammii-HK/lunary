'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { betterAuthClient } from '@/lib/auth-client';
import { useAuthStatus, invalidateAuthCache } from './AuthStatus';
import { SignOutButton } from './SignOutButton';
import { conversionTracking } from '@/lib/analytics';
import {
  getStoredAttribution,
  getAttributionForTracking,
} from '@/lib/attribution';
import { captureEvent } from '@/lib/posthog-client';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { BirthdayInput } from '@/components/ui/birthday-input';

interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  birthday?: string;
}

let cachedAuthFormData: AuthFormData | null = null;

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
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>(
    () =>
      cachedAuthFormData || {
        email: '',
        password: '',
        name: '',
        birthday: '',
      },
  );

  const { refreshAuth, ...authState } = useAuthStatus();
  const router = useRouter();
  const [isNative, setIsNative] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  useEffect(() => {
    cachedAuthFormData = formData;
  }, [formData]);

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
            email: formData.email.toLowerCase().trim(),
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
        cachedAuthFormData = null;
        setFormData({ email: '', password: '', name: '', birthday: '' });
        return;
      }

      if (isSignUp) {
        // Age gate validation
        if (!formData.birthday) {
          throw new Error('Date of birth is required to create your account.');
        }
        const birthDate = new Date(formData.birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const hasHadBirthdayThisYear =
          today.getMonth() > birthDate.getMonth() ||
          (today.getMonth() === birthDate.getMonth() &&
            today.getDate() >= birthDate.getDate());
        if (!hasHadBirthdayThisYear) {
          age -= 1;
        }
        if (age < 16) {
          throw new Error('You must be at least 16 years old to use Lunary.');
        }

        // No timeout - let the request complete naturally
        const result = await betterAuthClient.signUp.email({
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          name: formData.name || 'User',
        });

        console.log('✅ Sign up result:', result);

        if (result.error) {
          throw new Error(result.error.message || 'Signup failed');
        }

        const user = result.data?.user;
        if (user) {
          const attribution = getStoredAttribution();
          const attributionData = getAttributionForTracking();

          conversionTracking.signup(user.id, formData.email);

          captureEvent('signup_completed', {
            user_id: user.id,
            ...attributionData,
            signup_source: attribution?.source,
            signup_landing_page: attribution?.landingPage,
            signup_keyword: attribution?.keyword,
          });

          if (attribution) {
            fetch('/api/attribution', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                ...attributionData,
              }),
            }).catch(() => {});
          }

          // Save birthday from signup (fire-and-forget)
          if (formData.birthday) {
            fetch('/api/profile', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ birthday: formData.birthday }),
            }).catch(() => {});
          }
        }

        setSuccess('Account created successfully! You are now signed in.');
        cachedAuthFormData = null;
        setFormData({ email: '', password: '', name: '', birthday: '' });

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
          email: formData.email.toLowerCase().trim(),
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
            if (Capacitor.isNativePlatform()) {
              router.replace('/app');
            } else {
              window.location.href = '/app';
            }
          }, 500);
          return;
        }

        setSuccess('Signed in successfully!');
        cachedAuthFormData = null;
        setFormData({ email: '', password: '', name: '', birthday: '' });

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

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    setError(null);
    try {
      const SignInWithApple = registerPlugin<{
        authorize(options: { nonce?: string }): Promise<{
          response: {
            identityToken: string;
            user: string;
            email?: string;
            givenName?: string;
            familyName?: string;
          };
        }>;
      }>('SignInWithApple');

      // Capacitor's SignInWithApple plugin calls console.error({}) internally on
      // cancellation/no-Apple-ID, which triggers the Next.js dev overlay. Suppress it.
      const _origConsoleError = console.error;
      console.error = (...args: unknown[]) => {
        const first = args[0];
        if (
          args.length === 1 &&
          first !== null &&
          typeof first === 'object' &&
          Object.keys(first).length === 0
        )
          return;
        _origConsoleError(...args);
      };
      let result: Awaited<ReturnType<typeof SignInWithApple.authorize>>;
      try {
        result = await SignInWithApple.authorize({
          nonce: crypto.randomUUID(),
        });
      } finally {
        console.error = _origConsoleError;
      }

      const response = await fetch('/api/auth/apple-native', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          identityToken: result.response.identityToken,
          user: {
            email: result.response.email,
            givenName: result.response.givenName,
            familyName: result.response.familyName,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Apple sign-in failed');
      }

      // Set cookie directly in JS so WKWebView includes it in subsequent navigation requests.
      // data.token is already signed (token.base64sig). URI-encode it to match the server-set format.
      // Must use __Secure- prefix with Secure flag to match better-auth's cookie name
      // (triggered because NEXT_PUBLIC_BASE_URL starts with https://).
      if (data.token) {
        const cookieName =
          data.cookieName || '__Secure-better-auth.session_token';
        const expires = new Date(data.expiresAt).toUTCString();
        document.cookie = `${cookieName}=${encodeURIComponent(data.token)}; path=/; expires=${expires}; SameSite=Lax; Secure`;
      }

      invalidateAuthCache();

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = '/app';
      }
    } catch (err: any) {
      // err may be a plain {} from Capacitor — normalise it
      const code: number | string | undefined = err?.code ?? err?.error?.code;
      const msg: string = err?.message ?? err?.error?.message ?? '';

      const isSilent =
        (!code && !msg) || // empty object {} = user dismissed
        code === 1001 ||
        String(code).includes('1001') ||
        msg.includes('1001') ||
        msg.toLowerCase().includes('cancel') ||
        code === 1000 || // no Apple ID in Settings — Apple shows its own native modal
        String(code).includes('1000') ||
        msg.includes('1000');

      if (isSilent) {
        // silent — Apple already handles this with a native modal or sheet dismissal
      } else {
        setError(msg || 'Apple sign-in failed. Please try again.');
      }
    } finally {
      setAppleLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // If user is authenticated and there's an onSuccess callback, call it immediately
  // This handles the case where the user is already logged in when viewing an invite
  useEffect(() => {
    if (authState.isAuthenticated && onSuccess) {
      onSuccess();
    }
  }, [authState.isAuthenticated, onSuccess]);

  // If user is authenticated and on /auth page, redirect (handled by page component)
  // If in a modal/compact mode, show sign out option
  if (authState.isAuthenticated) {
    // If on /auth page (not in modal), let the page component handle redirect
    if (typeof window !== 'undefined' && window.location.pathname === '/auth') {
      return null; // Page component will handle redirect
    }

    // If there's an onSuccess callback, don't show sign out - the callback will handle it
    if (onSuccess) {
      return (
        <div className='w-full max-w-md mx-auto bg-zinc-900 rounded-lg p-6'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-lunary-primary mx-auto mb-4' />
            <p className='text-zinc-400'>Processing...</p>
          </div>
        </div>
      );
    }

    // Otherwise show sign out option (for modals without onSuccess)
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

        {isSignUp && (
          <div>
            <label
              htmlFor='birthday'
              className='block text-sm font-medium text-zinc-300 mb-2'
            >
              Birthday
            </label>
            <BirthdayInput
              id='birthday'
              name='birthday'
              value={formData.birthday || ''}
              onChange={(isoDate) =>
                setFormData((prev) => ({ ...prev, birthday: isoDate }))
              }
            />
            <p className='mt-1 text-xs text-zinc-400'>
              Used to create your birth chart
            </p>
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
            className={`w-full bg-zinc-800 border border-zinc-700 text-white text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-lunary-primary focus:border-transparent placeholder:text-zinc-500 ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}
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
            <div className='relative'>
              <input
                id='password'
                name='password'
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleInputChange}
                className='w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-lunary-primary focus:border-transparent text-base'
                placeholder='Enter your password'
                minLength={6}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300 transition-colors'
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className='w-5 h-5' />
                ) : (
                  <Eye className='w-5 h-5' />
                )}
              </button>
            </div>
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
          <div className='bg-lunary-success-900/30 border border-lunary-success-700 text-lunary-success-300 px-4 py-3 rounded-lg text-sm'>
            {success}
          </div>
        )}

        <button
          type='submit'
          disabled={loading}
          className={`w-full bg-lunary-primary hover:bg-lunary-primary-400 disabled:bg-lunary-primary-800 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center ${compact ? 'py-2 px-3 text-sm' : 'py-3 px-4'}`}
        >
          {loading ? (
            <>
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
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
            }}
            className='text-lunary-accent hover:text-lunary-accent-300 text-sm font-medium transition-colors'
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        )}
      </div>

      {isNative && !isForgot && (
        <div className='mt-6'>
          <div className='relative flex items-center gap-3 mb-4'>
            <div className='flex-1 h-px bg-zinc-700' />
            <span className='text-xs text-zinc-500'>or</span>
            <div className='flex-1 h-px bg-zinc-700' />
          </div>
          <button
            type='button'
            onClick={handleAppleSignIn}
            disabled={appleLoading}
            className='w-full bg-white hover:bg-zinc-100 disabled:opacity-50 text-black font-medium rounded-lg py-3 px-4 flex items-center justify-center gap-3 transition-colors'
          >
            {appleLoading ? (
              <Loader2 className='w-5 h-5 animate-spin text-black' />
            ) : (
              <svg className='w-5 h-5' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z' />
              </svg>
            )}
            {isSignUp ? 'Sign up with Apple' : 'Sign in with Apple'}
          </button>
        </div>
      )}

      <div className='mt-4 text-center'>
        <p className='text-xs text-zinc-400'>
          🔒 Your data is securely encrypted and synced across devices
        </p>
      </div>
    </div>
  );
}
