'use client';

import { useState, useEffect, useId, useRef, FormEvent } from 'react';
import { usePathname } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heading } from './ui/Heading';
import { trackCtaImpression, trackCtaClick } from '@/lib/analytics';

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
  /** Compact variant for inline/mid-article use */
  compact?: boolean;
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
  compact = false,
}: NewsletterSignupFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SignupStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const inputId = useId();
  const resetStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const turnstileTokenRef = useRef<string | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const impressionTracked = useRef(false);
  const pathname = usePathname() || '';

  // Track impression on mount
  useEffect(() => {
    if (!impressionTracked.current) {
      impressionTracked.current = true;
      trackCtaImpression({
        hub: source.replace('grimoire_', '') || 'unknown',
        ctaId: 'newsletter_signup',
        location: 'seo_newsletter_signup',
        label: ctaLabel,
        pagePath: pathname,
      });
    }
  }, [source, ctaLabel, pathname]);

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

    trackCtaClick({
      hub: source.replace('grimoire_', '') || 'unknown',
      ctaId: 'newsletter_signup',
      location: 'seo_newsletter_signup',
      label: ctaLabel,
      pagePath: pathname,
    });

    // Honeypot check: if the hidden field has a value, silently reject
    if (honeypotRef.current?.value) {
      setStatus('success');
      setMessage(successMessage);
      setEmail('');
      return;
    }

    // Turnstile check
    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      const turnstileToken = turnstileTokenRef.current;
      if (!turnstileToken) {
        setStatus('error');
        setMessage('Please wait for the security check to complete.');
        return;
      }
    }

    // Save email for rollback before clearing
    const submittedEmail = email.trim();

    // Optimistically show success immediately
    setStatus('success');
    setMessage(successMessage);
    setEmail('');

    try {
      const response = await fetch('/api/newsletter/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: submittedEmail,
          source,
          turnstileToken: turnstileTokenRef.current,
          preferences: {
            weeklyNewsletter: true,
            blogUpdates: true,
            productUpdates: false,
            cosmicAlerts: false,
          },
        }),
      });

      // Reset Turnstile token after use so it cannot be replayed
      turnstileTokenRef.current = null;

      const data = await response.json();

      if (!response.ok || data?.success !== true) {
        throw new Error(
          data?.error ||
            'We could not save your subscription. Please try again.',
        );
      }

      // Success confirmed – UI already in the right state
    } catch (error) {
      console.error('Newsletter signup failed:', error);
      // Revert: restore email and show error
      setStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
      );
      setEmail(submittedEmail);
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
        compact
          ? 'rounded-xl border border-stroke-default bg-surface-card/80 backdrop-blur-md p-4 sm:p-5'
          : 'rounded-2xl border border-stroke-default bg-surface-card/70 p-6 sm:p-8 shadow-lg shadow-lunary-primary-900/20 backdrop-blur-lg',
        className,
      )}
    >
      <div
        className={cn(
          'flex flex-col',
          compact ? 'gap-3' : 'gap-5 sm:gap-6',
          align === 'center' && 'items-center text-center',
        )}
      >
        <div
          className={cn(
            'flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-4',
            align === 'center' && 'sm:flex-col sm:items-center',
          )}
        >
          <div className={compact ? 'space-y-1' : 'space-y-2'}>
            <Heading as={compact ? 'h3' : 'h2'} variant={compact ? 'h3' : 'h2'}>
              {headline}
            </Heading>
            <p
              className={cn(
                'text-content-brand-accent/80',
                compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base',
              )}
            >
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
          {/* Honeypot field: hidden from real users, bots fill it */}
          <div
            aria-hidden='true'
            className='absolute -left-[9999px] -top-[9999px]'
          >
            <label htmlFor={`${inputId}-website`}>Website</label>
            <input
              ref={honeypotRef}
              id={`${inputId}-website`}
              type='text'
              name='website'
              tabIndex={-1}
              autoComplete='off'
            />
          </div>
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
              className='border-lunary-primary-600 bg-surface-base/40 placeholder:text-content-brand-accent/40 focus:border-lunary-accent-300 focus:ring-lunary-accent-700'
              autoComplete='email'
              inputMode='email'
            />
          </div>
          <Button
            type='submit'
            variant='lunary-soft'
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
          <div
            className={cn(
              'flex items-start gap-2 text-sm',
              align === 'center' && 'justify-center text-center',
              status === 'error'
                ? 'text-content-error'
                : 'text-content-success',
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
