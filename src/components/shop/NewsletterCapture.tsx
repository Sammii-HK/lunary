'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface NewsletterCaptureProps {
  initialEmail?: string | null;
}

export function NewsletterCapture({ initialEmail }: NewsletterCaptureProps) {
  const [email, setEmail] = useState(initialEmail ?? '');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/shop/newsletter-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(
          data.error ?? 'Something went wrong. Please try again.',
        );
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className='bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 text-center'>
        <p className='text-lunary-primary-300 font-medium text-lg'>
          You&apos;re in ✦
        </p>
        <p className='text-slate-400 text-sm mt-1'>
          Watch your inbox for moon rituals and cosmic guides.
        </p>
      </div>
    );
  }

  return (
    <div className='bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6'>
      <h2 className='text-lg font-medium text-white mb-1'>
        Want more ritual content?
      </h2>
      <p className='text-slate-400 text-sm mb-5'>
        Get monthly moon rituals, crystal guides, and cosmic insights — free.
      </p>

      <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-3'>
        <input
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='your@email.com'
          required
          className='flex-1 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder-slate-500 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lunary-primary-500 focus:border-transparent'
        />
        <Button type='submit' variant='lunary' disabled={status === 'loading'}>
          {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
        </Button>
      </form>

      {status === 'error' && errorMessage && (
        <p className='text-lunary-error text-sm mt-3'>{errorMessage}</p>
      )}
    </div>
  );
}
