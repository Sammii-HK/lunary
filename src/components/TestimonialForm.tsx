'use client';

import { FormEvent, ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';

const MAX_NAME_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 1200;

type SubmissionStatus = 'idle' | 'saving' | 'success';

export interface TestimonialFormProps {
  submitButtonLabel?: string;
  helperText?: ReactNode;
  onSuccess?: () => void;
  onError?: (message: string) => void;
  allowRepeat?: boolean;
}

export function TestimonialForm({
  submitButtonLabel = 'Share Testimonial',
  helperText,
  onSuccess,
  onError,
  allowRepeat = false,
}: TestimonialFormProps) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setMessage('');
    setStatus('idle');
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'saving') {
      return;
    }

    setError(null);
    setStatus('saving');

    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const serverMessage =
          data?.error ?? 'Something went wrong submitting your testimonial.';
        throw new Error(serverMessage);
      }

      setStatus('success');
      setName('');
      setMessage('');
      onSuccess?.();
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : 'Unable to submit your testimonial.';
      setError(message);
      onError?.(message);
      setStatus('idle');
    }
  };

  return (
    <div className='rounded-3xl border border-zinc-800/60 bg-zinc-900/60 p-8 shadow-[0px_20px_40px_rgba(0,0,0,0.45)] backdrop-blur'>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='space-y-1'>
          <label
            htmlFor='testimonial-name'
            className='text-sm font-medium text-zinc-200'
          >
            Your Name
          </label>
          <input
            id='testimonial-name'
            name='name'
            type='text'
            maxLength={MAX_NAME_LENGTH}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder='Selene Moon'
            required
            className='w-full rounded-2xl border border-zinc-800/60 bg-zinc-950/60 px-4 py-3 text-sm text-white placeholder:text-zinc-600 transition focus:border-lunary-accent focus:outline-none'
          />
          <p className='text-xs text-zinc-500'>
            {name.length}/{MAX_NAME_LENGTH} characters
          </p>
        </div>

        <div className='space-y-1'>
          <label
            htmlFor='testimonial-message'
            className='text-sm font-medium text-zinc-200'
          >
            Your Testimonial
          </label>
          <textarea
            id='testimonial-message'
            name='message'
            rows={6}
            maxLength={MAX_MESSAGE_LENGTH}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder='Share how Lunary has supported your rituals, insights, or personal growth.'
            required
            className='w-full rounded-2xl border border-zinc-800/60 bg-zinc-950/60 px-4 py-3 text-sm text-white placeholder:text-zinc-600 transition focus:border-lunary-accent focus:outline-none'
          />
          <p className='text-xs text-zinc-500'>
            {message.length}/{MAX_MESSAGE_LENGTH} characters
          </p>
        </div>

        <div
          className='rounded-2xl bg-zinc-900/60 px-4 py-3 text-xs text-zinc-400'
          aria-live='polite'
        >
          {status === 'success' && (
            <p className='text-sm font-medium text-lunary-success'>
              Thank you! We received your testimonial and will review it
              shortly.
            </p>
          )}
          {error && (
            <p className='text-sm font-medium text-lunary-error'>{error}</p>
          )}
          {status === 'idle' && !error && (
            <p>
              {helperText ??
                'Submissions are reviewed manually. Please keep your testimonial focused on how Lunary supports your personal practice.'}
            </p>
          )}
        </div>

        <div className='flex items-center justify-between gap-4'>
          <Button type='submit' variant='lunary' disabled={status === 'saving'}>
            {status === 'saving' ? 'Submitting...' : submitButtonLabel}
          </Button>
          {status === 'success' && allowRepeat && (
            <Button variant='lunary' onClick={resetForm}>
              Submit another
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
