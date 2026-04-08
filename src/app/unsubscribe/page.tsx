'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSafeSearchParams } from '@/lib/safeSearchParams';
import { Mail, CheckCircle, XCircle, Send } from 'lucide-react';

function UnsubscribeContent() {
  const searchParams = useSafeSearchParams();
  const emailFromUrl = searchParams.get('email');
  const [email, setEmail] = useState(emailFromUrl || '');
  const [status, setStatus] = useState<
    'loading' | 'success' | 'error' | 'manual'
  >(emailFromUrl ? 'loading' : 'manual');
  const [message, setMessage] = useState('');

  const unsubscribe = useCallback(async (emailToUnsubscribe: string) => {
    if (!emailToUnsubscribe) return;

    setStatus('loading');

    try {
      const response = await fetch(
        `/api/newsletter/subscribers/${encodeURIComponent(emailToUnsubscribe)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: false }),
        },
      );

      if (response.ok) {
        setStatus('success');
        setMessage('You have been successfully unsubscribed from our emails.');
      } else {
        const data = await response.json();
        setStatus('error');
        setMessage(data.error || 'Failed to unsubscribe. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred. Please try again later.');
    }
  }, []);

  useEffect(() => {
    if (emailFromUrl) {
      setEmail(emailFromUrl);
      unsubscribe(emailFromUrl);
    }
  }, [emailFromUrl, unsubscribe]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      unsubscribe(email.trim());
    }
  };

  return (
    <div className='min-h-screen bg-surface-base text-content-primary flex items-center justify-center px-4'>
      <div className='max-w-md w-full bg-surface-card rounded-lg p-8 border border-stroke-default'>
        <div className='text-center mb-6'>
          <Mail className='h-12 w-12 mx-auto mb-4 text-lunary-primary-400' />
          <h1 className='text-2xl font-bold mb-2'>Unsubscribe</h1>
          {email && status !== 'manual' && (
            <p className='text-sm text-content-muted'>{email}</p>
          )}
        </div>

        {status === 'loading' && (
          <div className='text-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-lunary-primary-400 mx-auto mb-4'></div>
            <p className='text-content-muted'>Processing your request...</p>
          </div>
        )}

        {status === 'manual' && (
          <div className='py-4'>
            <p className='text-content-muted text-center mb-6'>
              Enter your email address to unsubscribe from Lunary emails.
            </p>
            <form onSubmit={handleManualSubmit} className='space-y-4'>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='your@email.com'
                required
                className='w-full px-4 py-3 bg-surface-elevated border border-stroke-default rounded-lg text-content-primary placeholder-zinc-500 focus:outline-none focus:border-lunary-primary focus:ring-1 focus:ring-lunary-primary'
              />
              <button
                type='submit'
                className='w-full flex items-center justify-center gap-2 bg-lunary-primary-600 hover:bg-layer-high text-white py-3 px-6 rounded-lg transition-colors'
              >
                <Send className='h-4 w-4' />
                Unsubscribe
              </button>
            </form>
            <p className='text-xs text-content-muted text-center mt-4'>
              You can also manage your email preferences from your{' '}
              <a
                href='/profile'
                className='text-lunary-primary-400 hover:underline'
              >
                profile settings
              </a>
              .
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className='text-center py-8'>
            <CheckCircle className='h-12 w-12 mx-auto mb-4 text-lunary-success' />
            <p className='text-content-primary mb-4'>{message}</p>
            <p className='text-sm text-content-muted mb-6'>
              You will no longer receive emails from Lunary. You can resubscribe
              at any time from your profile settings.
            </p>
            <a
              href='/profile'
              className='inline-block bg-lunary-primary-600 hover:bg-layer-high text-white py-2 px-6 rounded-md transition-colors'
            >
              Go to Profile
            </a>
          </div>
        )}

        {status === 'error' && (
          <div className='text-center py-8'>
            <XCircle className='h-12 w-12 mx-auto mb-4 text-lunary-error' />
            <p className='text-content-primary mb-4'>{message}</p>
            <div className='space-y-3'>
              <button
                onClick={() => setStatus('manual')}
                className='w-full bg-surface-overlay hover:bg-surface-overlay text-content-primary py-2 px-6 rounded-md transition-colors'
              >
                Try with different email
              </button>
              <a
                href='/profile'
                className='block bg-lunary-primary-600 hover:bg-layer-high text-white py-2 px-6 rounded-md transition-colors'
              >
                Go to Profile
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-surface-base text-content-primary flex items-center justify-center px-4'>
          <div className='max-w-md w-full bg-surface-card rounded-lg p-8 border border-stroke-default'>
            <div className='text-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-lunary-primary-400 mx-auto mb-4'></div>
              <p className='text-content-muted'>Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
