'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { trackCtaImpression, trackCtaClick } from '@/lib/analytics';

interface MidArticleEmailCaptureProps {
  topic?: string;
  hub?: string;
  propositionVariant?: 'cosmic_newsletter' | 'daily_horoscope';
}

const HOROSCOPE_EMAIL_CAPTURE_TEST = 'horoscope_email_capture_proposition_v1';

function getHoroscopeSignFromPath(pathname: string): string | undefined {
  const match = pathname.match(/\/grimoire\/horoscopes\/(?:today\/)?([a-z-]+)/i);
  return match?.[1];
}

export function MidArticleEmailCapture({
  topic,
  hub,
  propositionVariant = 'daily_horoscope',
}: MidArticleEmailCaptureProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLDivElement>(null);
  const impressionTracked = useRef(false);
  const turnstileTokenRef = useRef<string | null>(null);
  const turnstileFailedRef = useRef(false);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname() || '';
  const isHoroscope = hub === 'horoscopes';
  const sign = getHoroscopeSignFromPath(pathname);
  const isDailyHoroscopeVariant = propositionVariant === 'daily_horoscope';
  const headline = isHoroscope
    ? isDailyHoroscopeVariant
      ? 'Get this horoscope delivered daily'
      : 'Get weekly cosmic updates'
    : topic
      ? `See how ${topic} affects YOUR chart`
      : 'See how this affects YOUR chart';
  const description = isHoroscope
    ? isDailyHoroscopeVariant
      ? `Daily ${sign ? `${sign} ` : ''}guidance straight to your inbox.`
      : 'Free forecasts, transit alerts, and cosmic guidance in your inbox.'
    : 'Enter your email to keep receiving personalised cosmic guidance.';
  const ctaLabel = isHoroscope
    ? isDailyHoroscopeVariant
      ? 'Send me my horoscope'
      : 'Subscribe'
    : 'Show me my chart';
  const source = isHoroscope
    ? `grimoire_horoscope_${propositionVariant}`
    : 'grimoire_mid_article_capture';

  useEffect(() => {
    // Don't show if already signed up or dismissed this session
    if (sessionStorage.getItem('email_capture_dismissed')) {
      setDismissed(true);
      return;
    }
    if (localStorage.getItem('email_capture_submitted')) {
      setSubmitted(true);
      return;
    }

    const handleScroll = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const percent = window.scrollY / scrollable;
      if (percent > 0.5 && !visible) {
        setVisible(true);
        if (!impressionTracked.current) {
          impressionTracked.current = true;
          trackCtaImpression({
            hub: hub || 'unknown',
            ctaId: 'mid_article_email_capture',
            location: 'seo_mid_article_email',
            label: ctaLabel,
            pagePath: pathname,
            abTest: isHoroscope ? HOROSCOPE_EMAIL_CAPTURE_TEST : undefined,
            abVariant: isHoroscope ? propositionVariant : undefined,
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visible, ctaLabel, hub, isHoroscope, pathname, propositionVariant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    trackCtaClick({
      hub: hub || 'unknown',
      ctaId: 'mid_article_email_capture',
      location: 'seo_mid_article_email',
      label: ctaLabel,
      pagePath: pathname,
      abTest: isHoroscope ? HOROSCOPE_EMAIL_CAPTURE_TEST : undefined,
      abVariant: isHoroscope ? propositionVariant : undefined,
    });

    if (honeypotRef.current?.value) {
      setSubmitted(true);
      localStorage.setItem('email_capture_submitted', 'true');
      return;
    }

    let turnstileToken = turnstileTokenRef.current;

    if (
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
      !turnstileFailedRef.current
    ) {
      if (!turnstileToken) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        turnstileToken = turnstileTokenRef.current;
      }

      if (!turnstileToken) {
        console.warn(
          '[horoscope-email-turnstile] Token not available after wait, proceeding without bot check',
        );
      }
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/newsletter/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source,
          turnstileToken,
          preferences: {
            weeklyNewsletter: !isDailyHoroscopeVariant,
            blogUpdates: true,
            productUpdates: false,
            cosmicAlerts: !isDailyHoroscopeVariant,
            dailyHoroscope: isDailyHoroscopeVariant,
            captureContext: {
              proposition: propositionVariant,
              placement: 'mid_article',
              hub,
              sign,
              pagePath: pathname,
              abTest: isHoroscope ? HOROSCOPE_EMAIL_CAPTURE_TEST : undefined,
              abVariant: isHoroscope ? propositionVariant : undefined,
            },
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      turnstileTokenRef.current = null;
      setSubmitted(true);
      localStorage.setItem('email_capture_submitted', 'true');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('email_capture_dismissed', 'true');
  };

  if (dismissed || (!visible && !submitted)) return null;

  return (
    <div
      ref={formRef}
      className={`my-8 overflow-hidden rounded-xl border border-lunary-primary-500/20 bg-gradient-to-br from-layer-deep/60 to-layer-base/30 transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {submitted ? (
        <div className='px-6 py-8 text-center'>
          <Sparkles className='mx-auto mb-3 h-6 w-6 text-lunary-primary-400' />
          <p className='text-lg font-medium text-content-secondary'>
            {isHoroscope ? 'You are in' : 'Check your inbox'}
          </p>
          <p className='mt-1 text-sm text-lunary-primary-400'>
            {isHoroscope
              ? isDailyHoroscopeVariant
                ? `Your ${sign ? `${sign} ` : ''}horoscope will land in your inbox.`
                : 'We will send you weekly cosmic updates by email.'
              : 'We have sent you a link to see your personalised chart.'}
          </p>
        </div>
      ) : (
        <div className='px-6 py-6'>
          <div className='mb-1 flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-content-secondary'>
              {headline}
            </h3>
            <button
              onClick={handleDismiss}
              className='text-lunary-primary-500 hover:text-content-brand transition-colors'
              aria-label='Dismiss'
            >
              <svg
                width='16'
                height='16'
                viewBox='0 0 16 16'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <path d='M4 4l8 8M12 4l-8 8' />
              </svg>
            </button>
          </div>
          <p className='mb-4 text-sm text-lunary-primary-400'>
            {description}
          </p>

          <form onSubmit={handleSubmit} className='space-y-3'>
            <div
              aria-hidden='true'
              className='absolute -left-[9999px] -top-[9999px]'
            >
              <label htmlFor='mid-article-website'>Website</label>
              <input
                ref={honeypotRef}
                id='mid-article-website'
                type='text'
                name='website'
                tabIndex={-1}
                autoComplete='off'
              />
            </div>
            <input
              type='email'
              placeholder='Your email address'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='w-full rounded-lg border border-lunary-primary-500/30 bg-layer-deep/50 px-4 py-2.5 text-sm text-white placeholder:text-lunary-primary-500 focus:border-lunary-primary-400 focus:outline-none focus:ring-1 focus:ring-lunary-primary-400'
            />
            {error && <p className='text-xs text-red-400'>{error}</p>}
            <button
              type='submit'
              disabled={loading}
              className='flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-lunary-primary-600 to-lunary-primary-500 px-4 py-2.5 text-sm font-medium text-content-primary transition-all hover:from-lunary-primary-500 hover:to-lunary-primary-400 disabled:opacity-50'
            >
              {loading ? (
                'Sending...'
              ) : (
                <>
                  {ctaLabel}
                  <ArrowRight className='h-4 w-4' />
                </>
              )}
            </button>
          </form>

          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
            <div className='mt-3'>
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                onSuccess={(token) => {
                  turnstileTokenRef.current = token;
                  turnstileFailedRef.current = false;
                }}
                onExpire={() => {
                  turnstileTokenRef.current = null;
                }}
                onError={() => {
                  turnstileTokenRef.current = null;
                  turnstileFailedRef.current = true;
                }}
                onUnsupported={() => {
                  turnstileTokenRef.current = null;
                  turnstileFailedRef.current = true;
                }}
                options={{ theme: 'dark', size: 'invisible' }}
              />
            </div>
          )}

          <p className='mt-3 text-center text-xs text-lunary-primary-600'>
            Free forever. Unsubscribe any time.
          </p>
        </div>
      )}
    </div>
  );
}
