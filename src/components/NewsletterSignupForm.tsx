'use client';

import { useState, useEffect, useId, useRef, FormEvent } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Lazy load auth client to avoid webpack issues
let betterAuthClient: any = null;
const loadAuthClient = async () => {
  if (betterAuthClient) return betterAuthClient;
  try {
    const authModule = await import('@/lib/auth-client');
    betterAuthClient = authModule.betterAuthClient;
    return betterAuthClient;
  } catch (error) {
    console.warn('Failed to load auth client:', error);
    return null;
  }
};

type SignupStatus = 'idle' | 'loading' | 'success' | 'error';

interface NewsletterSignupFormProps {
  className?: string;
  source?: string;
  headline?: string;
  description?: string;
  ctaLabel?: string;
  successMessage?: string;
  align?: 'left' | 'center';
  inputPlaceholder?: string;
}

export function NewsletterSignupForm({
  className,
  source = 'marketing_page',
  headline = 'Weekly cosmic forecasts, delivered to your inbox',
  description = 'Join the Lunary newsletter for celestial weather, product updates, and exclusive offers.',
  ctaLabel = 'Join the newsletter',
  successMessage = 'Check your inbox to confirm your subscription ✨',
  align = 'left',
  inputPlaceholder = 'you@example.com',
}: NewsletterSignupFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SignupStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const inputId = useId();
  const resetStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;

    const prefillEmailFromSession = async () => {
      try {
        const authClient = await loadAuthClient();
        if (!authClient) return;

        const session = await authClient.getSession();
        const sessionUser =
          (session as any)?.data?.user || (session as any)?.user || null;

        if (isMounted && sessionUser?.email) {
          setEmail((current) => current || sessionUser.email);
        }
      } catch (error) {
        console.warn(
          'Newsletter prefill skipped: unable to fetch session',
          error,
        );
      }
    };

    prefillEmailFromSession();

    return () => {
      isMounted = false;

      if (resetStatusTimeoutRef.current !== null) {
        clearTimeout(resetStatusTimeoutRef.current);
        resetStatusTimeoutRef.current = null;
      }
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setMessage(null);

    try {
      const response = await fetch('/api/newsletter/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          source,
          preferences: {
            weeklyNewsletter: true,
            blogUpdates: true,
            productUpdates: false,
            cosmicAlerts: false,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || data?.success !== true) {
        throw new Error(
          data?.error ||
            'We could not save your subscription. Please try again.',
        );
      }

      setStatus('success');
      setMessage(successMessage);
      setEmail('');
    } catch (error) {
      console.error('Newsletter signup failed:', error);
      setStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      if (resetStatusTimeoutRef.current !== null) {
        clearTimeout(resetStatusTimeoutRef.current);
      }

      resetStatusTimeoutRef.current = setTimeout(() => {
        setStatus((current) => (current === 'loading' ? 'idle' : current));
      }, 300);
    }
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-lunary-primary-800 bg-lunary-primary-950 p-6 sm:p-8 shadow-lg shadow-lunary-primary-950 backdrop-blur-lg',
        className,
      )}
    >
      <div
        className={cn(
          'flex flex-col gap-5 sm:gap-6',
          align === 'center' && 'items-center text-center',
        )}
      >
        <div
          className={cn(
            'flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-4',
            align === 'center' && 'sm:flex-col sm:items-center',
          )}
        >
          <div className='space-y-2'>
            <h3 className='text-xl sm:text-2xl text-white'>{headline}</h3>
            <p className='text-sm sm:text-base text-lunary-accent-100/80'>
              {description}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className={cn(
            'flex w-full flex-col gap-3 sm:flex-row',
            align === 'center' && 'sm:justify-center',
          )}
          noValidate
        >
          <div className='flex-1'>
            <label htmlFor={`${inputId}-email`} className='sr-only'>
              Email address
            </label>
            <Input
              id={`${inputId}-email`}
              type='email'
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (status === 'error') {
                  setStatus('idle');
                  setMessage(null);
                }
              }}
              placeholder={inputPlaceholder}
              className='border-lunary-primary-600 bg-black/40 placeholder:text-lunary-accent-200/40 focus:border-lunary-accent-300 focus:ring-lunary-accent-700'
              autoComplete='email'
              inputMode='email'
            />
          </div>
          <Button
            type='submit'
            variant='lunary-solid'
            disabled={status === 'loading'}
            className='px-6'
          >
            {status === 'loading' ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Subscribing…
              </>
            ) : (
              ctaLabel
            )}
          </Button>
        </form>

        {message && (
          <div
            className={cn(
              'flex items-start gap-2 text-sm',
              align === 'center' && 'justify-center text-center',
              status === 'error'
                ? 'text-lunary-error-300'
                : 'text-lunary-success-300',
            )}
          >
            {status === 'error' ? (
              <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0' />
            ) : (
              <CheckCircle2 className='mt-0.5 h-4 w-4 flex-shrink-0' />
            )}
            <span>{message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
