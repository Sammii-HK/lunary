'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, CheckCircle, XCircle } from 'lucide-react';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [message, setMessage] = useState('');

  const unsubscribe = useCallback(async () => {
    if (!email) return;

    try {
      const response = await fetch(
        `/api/newsletter/subscribers/${encodeURIComponent(email)}`,
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
  }, [email]);

  useEffect(() => {
    if (email) {
      unsubscribe();
    } else {
      setStatus('error');
      setMessage('No email address provided');
    }
  }, [email, unsubscribe]);

  return (
    <div className='min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4'>
      <div className='max-w-md w-full bg-zinc-800 rounded-lg p-8 border border-zinc-700'>
        <div className='text-center mb-6'>
          <Mail className='h-12 w-12 mx-auto mb-4 text-purple-400' />
          <h1 className='text-2xl font-bold mb-2'>Unsubscribe</h1>
          {email && <p className='text-sm text-zinc-400'>{email}</p>}
        </div>

        {status === 'loading' && (
          <div className='text-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4'></div>
            <p className='text-zinc-400'>Processing your request...</p>
          </div>
        )}

        {status === 'success' && (
          <div className='text-center py-8'>
            <CheckCircle className='h-12 w-12 mx-auto mb-4 text-green-400' />
            <p className='text-white mb-4'>{message}</p>
            <p className='text-sm text-zinc-400 mb-6'>
              You will no longer receive emails from Lunary. You can resubscribe
              at any time from your profile settings.
            </p>
            <a
              href='/profile'
              className='inline-block bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-md transition-colors'
            >
              Go to Profile
            </a>
          </div>
        )}

        {status === 'error' && (
          <div className='text-center py-8'>
            <XCircle className='h-12 w-12 mx-auto mb-4 text-red-400' />
            <p className='text-white mb-4'>{message}</p>
            <a
              href='/profile'
              className='inline-block bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-md transition-colors'
            >
              Go to Profile
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
