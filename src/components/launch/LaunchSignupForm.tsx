'use client';

import { useState } from 'react';
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) return;

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
          metadata: name ? { name } : undefined,
        }),
      });

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
        'space-y-4 rounded-3xl border border-white/10 bg-black/60 p-6 shadow-xl',
        className,
      )}
    >
      <div>
        <p className='text-xs uppercase tracking-[0.4em] text-purple-200'>
          Launch Waitlist
        </p>
        <h3 className='text-2xl font-semibold text-white'>Reserve your spot</h3>
        <p className='text-sm text-zinc-300'>
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
          className='rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none'
        />
        <div className='flex gap-3'>
          <input
            type='email'
            required
            placeholder='Email'
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className='flex-1 rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none'
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
      {message && (
        <p
          className={clsx('text-sm', {
            'text-green-300': status === 'success',
            'text-red-300': status === 'error',
            'text-zinc-400': status === 'idle',
          })}
        >
          {message}
        </p>
      )}
    </form>
  );
}
