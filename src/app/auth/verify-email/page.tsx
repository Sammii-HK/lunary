'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { betterAuthClient } from '@/lib/auth-client';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<
    'verifying' | 'success' | 'error' | 'expired'
  >('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link - missing token.');
        return;
      }

      try {
        // Use Better Auth client to verify the email
        const result = await betterAuthClient.verifyEmail({
          query: { token },
        });

        if (result.error) {
          if (result.error.message?.includes('expired')) {
            setStatus('expired');
            setMessage(
              'This verification link has expired. Please sign up again to receive a new link.',
            );
          } else {
            setStatus('error');
            setMessage(result.error.message || 'Verification failed.');
          }
        } else {
          setStatus('success');
          setMessage(
            'Email verified successfully! You can now sign in to your account.',
          );

          // Redirect to profile after successful verification
          setTimeout(() => {
            window.location.href = '/profile';
          }, 3000);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred.',
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'expired':
        return '⏰';
      default:
        return '🔄';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'verifying':
        return 'text-lunary-secondary';
      case 'success':
        return 'text-lunary-success';
      case 'error':
        return 'text-lunary-error';
      case 'expired':
        return 'text-lunary-accent';
      default:
        return 'text-gray-400';
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case 'success':
        return 'bg-lunary-success-900/20 border-lunary-success-700';
      case 'error':
        return 'bg-lunary-error-900/20 border-lunary-error-700';
      case 'expired':
        return 'bg-lunary-accent-900/20 border-lunary-accent-700';
      default:
        return 'bg-lunary-secondary-900/20 border-lunary-secondary-700';
    }
  };

  return (
    <div className='min-h-screen bg-black text-white flex items-center justify-center p-8'>
      <div className='max-w-md w-full'>
        <div
          className={`border rounded-lg p-8 text-center ${getBackgroundColor()}`}
        >
          <div className='text-6xl mb-6'>{getStatusIcon()}</div>

          <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
            {status === 'verifying' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
            {status === 'expired' && 'Link Expired'}
          </h1>

          <p className='text-zinc-300 mb-6 leading-relaxed'>{message}</p>

          <div className='space-y-3'>
            {status === 'success' && (
              <div className='text-sm text-zinc-400'>
                Redirecting to your profile in 3 seconds...
              </div>
            )}

            {status === 'error' && (
              <div className='space-y-3'>
                <a
                  href='/auth'
                  className='inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors'
                >
                  Try Again
                </a>
                <div className='text-sm text-zinc-400'>
                  Need help? Contact support or try signing up again.
                </div>
              </div>
            )}

            {status === 'expired' && (
              <div className='space-y-3'>
                <a
                  href='/auth'
                  className='inline-block bg-lunary-accent-600 hover:bg-lunary-accent-700 text-white px-6 py-3 rounded-lg font-medium transition-colors'
                >
                  Sign Up Again
                </a>
                <div className='text-sm text-zinc-400'>
                  You'll receive a new verification email.
                </div>
              </div>
            )}

            {status === 'verifying' && (
              <div className='text-sm text-zinc-400'>
                This may take a few moments...
              </div>
            )}
          </div>

          <div className='mt-8 pt-6 border-t border-zinc-700'>
            <a
              href='/'
              className='text-zinc-400 hover:text-white transition-colors text-sm'
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
