'use client';

import { useId, useRef, useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import clsx from 'clsx';

interface LaunchSignupFormProps {
  source?: 'product_hunt' | 'launch_page' | 'press_kit' | 'tiktok';
  className?: string;
}

export function LaunchSignupForm({
  source = 'launch_page',
  className = '',
}: LaunchSignupFormProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState('');
  const turnstileTokenRef = useRef<string | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const formId = useId();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) return;

    // Honeypot check
    if (honeypotRef.current?.value) {
      setStatus('success');
      setMessage('You are on the list! Watch your inbox for launch updates.');
      setEmail('');
      return;
    }

    // Turnstile check
    if (
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
      !turnstileTokenRef.current
    ) {
      setStatus('error');
      setMessage('Please wait for the security check to complete.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/launch/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source,
          turnstileToken: turnstileTokenRef.current,
          metadata: name ? { name } : undefined,
        }),
      });

      turnstileTokenRef.current = null;

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Signup failed');
      }

      setStatus('success');
      setMessage('You are on the list! Watch your inbox for launch updates.');
      setEmail('');
      setName('');
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Try again?',
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx(
        'space-y-4 rounded-3xl border border-white/10 bg-surface-base/60 p-6 shadow-xl',
        className,
      )}
    >
      {/* Honeypot */}
      <div aria-hidden='true' className='absolute -left-[9999px] -top-[9999px]'>
        <label htmlFor={`${formId}-website`}>Website</label>
        <input
          ref={honeypotRef}
          id={`${formId}-website`}
          type='text'
          name='website'
          tabIndex={-1}
          autoComplete='off'
        />
      </div>
      <div>
        <p className='text-xs uppercase tracking-[0.4em] text-content-secondary'>
          Launch Waitlist
        </p>
        <h3 className='text-2xl font-semibold text-content-primary'>
          Reserve your spot
        </h3>
        <p className='text-sm text-content-secondary'>
          Get the Product Hunt reminder, press kit drops, and cosmic report
          template.
        </p>
      </div>
      <div className='grid gap-3 sm:grid-cols-2'>
        <input
          type='text'
          placeholder='Preferred name (optional)'
          value={name}
          onChange={(event) => setName(event.target.value)}
          className='rounded-2xl border border-white/10 bg-surface-base/70 px-4 py-3 text-sm text-content-primary placeholder:text-content-muted focus:border-lunary-primary-400 focus:outline-none'
        />
        <div className='flex gap-3'>
          <label htmlFor='launch-email' className='sr-only'>
            Email address
          </label>
          <input
            id='launch-email'
            type='email'
            required
            placeholder='Email'
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className='flex-1 rounded-2xl border border-white/10 bg-surface-base/70 px-4 py-3 text-sm text-content-primary placeholder:text-content-muted focus:border-lunary-primary-400 focus:outline-none'
          />
          <button
            type='submit'
            disabled={status === 'loading'}
            className='rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:opacity-60'
          >
            {status === 'loading' ? 'Joining…' : 'Join'}
          </button>
        </div>
      </div>
      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          onSuccess={(token) => {
            turnstileTokenRef.current = token;
          }}
          onExpire={() => {
            turnstileTokenRef.current = null;
          }}
          options={{ theme: 'dark', size: 'invisible' }}
        />
      )}
      {message && (
        <p
          className={clsx('text-sm', {
            'text-lunary-success-300': status === 'success',
            'text-red-300': status === 'error',
            'text-content-muted': status === 'idle',
          })}
        >
          {message}
        </p>
      )}
    </form>
  );
}
