'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, AlertTriangle, Mail } from 'lucide-react';

function StatusBanner() {
  const searchParams = useSearchParams();
  const confirmed = searchParams.get('confirmed');
  const cancelled = searchParams.get('cancelled');
  const error = searchParams.get('error');

  if (confirmed === 'true') {
    return (
      <div className='flex items-start gap-3 p-4 rounded-xl border border-green-800 bg-green-950/40 mb-6'>
        <CheckCircle className='h-5 w-5 text-green-400 mt-0.5 shrink-0' />
        <div>
          <p className='text-green-300 font-medium'>
            Deletion request confirmed
          </p>
          <p className='text-green-400/80 text-sm mt-1'>
            Your account has been scheduled for deletion. You&apos;ll receive an
            email with a link to cancel if you change your mind.
          </p>
        </div>
      </div>
    );
  }

  if (cancelled === 'true') {
    return (
      <div className='flex items-start gap-3 p-4 rounded-xl border border-green-800 bg-green-950/40 mb-6'>
        <CheckCircle className='h-5 w-5 text-green-400 mt-0.5 shrink-0' />
        <div>
          <p className='text-green-300 font-medium'>
            Deletion request cancelled
          </p>
          <p className='text-green-400/80 text-sm mt-1'>
            Your account is safe. No data will be deleted.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    const messages: Record<string, string> = {
      expired: 'This link has expired. Please submit a new deletion request.',
      invalid: 'This link is invalid. Please submit a new deletion request.',
      no_request: 'No pending deletion request was found to cancel.',
      server: 'Something went wrong. Please try again later.',
    };

    return (
      <div className='flex items-start gap-3 p-4 rounded-xl border border-red-800 bg-red-950/40 mb-6'>
        <XCircle className='h-5 w-5 text-red-400 mt-0.5 shrink-0' />
        <div>
          <p className='text-red-300 font-medium'>
            {messages[error] || messages.server}
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export function DeletionRequestForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/account/request-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className='mt-6'>
      <StatusBanner />

      <div className='p-5 border border-zinc-800 bg-zinc-900/30 rounded-xl'>
        <div className='flex items-center gap-2 mb-3'>
          <Mail className='h-5 w-5 text-lunary-primary-400' />
          <h3 className='text-lg font-medium text-white'>
            Request Deletion Online
          </h3>
        </div>
        <p className='text-zinc-400 text-sm mb-4'>
          Enter the email address associated with your account. We&apos;ll send
          you a verification link to confirm the deletion.
        </p>

        {status === 'success' ? (
          <div className='flex items-start gap-3 p-4 rounded-xl border border-green-800 bg-green-950/40'>
            <CheckCircle className='h-5 w-5 text-green-400 mt-0.5 shrink-0' />
            <div>
              <p className='text-green-300 font-medium'>Check your email</p>
              <p className='text-green-400/80 text-sm mt-1'>
                If an account exists with that email, we&apos;ve sent a
                verification link. Please check your inbox and spam folder.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='flex gap-3'>
            <Input
              type='email'
              placeholder='your@email.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === 'loading'}
              className='flex-1'
            />
            <Button
              type='submit'
              variant='destructive'
              disabled={status === 'loading' || !email.trim()}
            >
              {status === 'loading' ? 'Sending...' : 'Send Verification'}
            </Button>
          </form>
        )}

        {status === 'error' && (
          <div className='flex items-center gap-2 mt-3 text-sm text-red-400'>
            <AlertTriangle className='h-4 w-4' />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
