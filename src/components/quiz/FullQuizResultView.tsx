'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heading } from '@/components/ui/Heading';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  ArrowRight,
  Download,
  Link2,
  Share2,
  CheckCircle2,
  Mail,
} from 'lucide-react';
import { captureEvent } from '@/lib/posthog-client';
import type { QuizResult } from '@/lib/quiz/types';

const STORAGE_KEY = 'lunary_claimed_quiz_result';

type LoadState = 'loading' | 'ready' | 'missing';

export function FullQuizResultView() {
  const [state, setState] = useState<LoadState>('loading');
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadFromStorage = (): QuizResult | null => {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as QuizResult;
      } catch {
        return null;
      }
    };

    const ready = (r: QuizResult) => {
      if (cancelled) return;
      setResult(r);
      setState('ready');
      captureEvent('quiz_full_result_viewed', {
        quizSlug: r.quizSlug,
        archetype: r.archetype?.label,
      });
    };

    // Try sessionStorage first — fast path when arriving from /auth redirect.
    const stored = loadFromStorage();
    if (stored) {
      ready(stored);
      return;
    }

    // Fallback: if the user has a pending claim cookie but never went through
    // /auth's handoff (cached /auth JS, direct navigation, etc), claim now.
    // Snapshot the cookie birth data into sessionStorage before calling
    // claim, so the "Email this to me" button has what to post later.
    const hasCookie =
      typeof document !== 'undefined' &&
      document.cookie.includes('lunary_pending_quiz=');

    if (!hasCookie) {
      setState('missing');
      return;
    }

    try {
      const match = document.cookie.match(/lunary_pending_quiz=([^;]+)/);
      if (match) {
        sessionStorage.setItem(
          'lunary_quiz_birth_data',
          decodeURIComponent(match[1]),
        );
      }
    } catch {
      // Non-fatal.
    }

    fetch('/api/quiz/claim', { method: 'POST', credentials: 'include' })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setState('missing');
          return;
        }
        const data = await res.json().catch(() => null);
        if (data?.result) {
          try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data.result));
          } catch {
            // Non-fatal — we'll still render from memory below.
          }
          ready(data.result as QuizResult);
        } else {
          setState('missing');
        }
      })
      .catch(() => {
        if (cancelled) return;
        setState('missing');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (state === 'loading') {
    return (
      <section className='mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center px-4 py-8'>
        <p className='text-content-secondary text-sm'>
          Preparing your full reading…
        </p>
      </section>
    );
  }

  if (state === 'missing' || !result) {
    return (
      <section className='mx-auto w-full max-w-2xl px-4 py-12'>
        <div className='border-lunary-primary-800/60 bg-layer-base flex flex-col gap-4 rounded-2xl border p-8 text-center'>
          <Heading as='h1' variant='h2'>
            Take the quiz to see your reading
          </Heading>
          <p className='text-content-secondary'>
            Your session doesn't have a recent result loaded. Head back to the
            quiz to generate one — it takes 90 seconds.
          </p>
          <Button asChild variant='lunary-solid' size='lg'>
            <Link href='/quiz/beyond-your-sun-sign/chart-ruler'>
              Take the quiz <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant='ghost' size='sm'>
            <Link href='/app'>Go to app</Link>
          </Button>
        </div>
      </section>
    );
  }

  return <FullResultContent result={result} />;
}

function buildShareAssets(result: QuizResult) {
  const label = result.archetype?.label ?? 'Your chart ruler';
  const subtitle = result.shareCard.subtitle;
  const tagline = result.hero.headline;

  const params = new URLSearchParams({
    format: 'story',
    label,
    subtitle,
    tagline,
  });
  const ogPath = `/api/og/quiz/${result.quizSlug}?${params.toString()}`;
  const pinterestParams = new URLSearchParams({
    format: 'pinterest',
    label,
    subtitle,
    tagline,
  });
  const pinterestOgPath = `/api/og/quiz/${result.quizSlug}?${pinterestParams.toString()}`;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const quizLandingPath = `/quiz/beyond-your-sun-sign/${result.quizSlug}`;
  const shareText = `I got "${label}" in the Beyond Your Sun Sign quiz. ${subtitle}.`;
  const fullQuizUrl = `${origin}${quizLandingPath}`;

  return {
    ogPath,
    pinterestOgPath,
    fullQuizUrl,
    shareText,
    threadsUrl: `https://www.threads.net/intent/post?text=${encodeURIComponent(
      `${shareText} Take it: ${fullQuizUrl}`,
    )}`,
    blueskyUrl: `https://bsky.app/intent/compose?text=${encodeURIComponent(
      `${shareText} Take it: ${fullQuizUrl}`,
    )}`,
    pinterestShareUrl: `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(
      fullQuizUrl,
    )}&media=${encodeURIComponent(origin + pinterestOgPath)}&description=${encodeURIComponent(shareText)}`,
  };
}

type EmailState = 'idle' | 'sending' | 'sent' | 'error';

function FullResultContent({ result }: { result: QuizResult }) {
  const share = buildShareAssets(result);
  const [copied, setCopied] = useState(false);
  const [emailState, setEmailState] = useState<EmailState>('idle');
  const [emailError, setEmailError] = useState<string>('');

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(share.fullQuizUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      captureEvent('quiz_share_clicked', {
        quizSlug: result.quizSlug,
        archetype: result.archetype?.label,
        destination: 'copy_link',
        source: 'full_page',
      });
    } catch {
      // Clipboard unavailable
    }
  }

  function handleShareClick(destination: string) {
    captureEvent('quiz_share_clicked', {
      quizSlug: result.quizSlug,
      archetype: result.archetype?.label,
      destination,
      source: 'full_page',
    });
  }

  async function handleEmailMe() {
    let birthPayload: unknown = null;
    try {
      const raw = sessionStorage.getItem('lunary_quiz_birth_data');
      if (raw) birthPayload = JSON.parse(raw);
    } catch {
      // Fall through — handled below.
    }

    if (
      !birthPayload ||
      typeof birthPayload !== 'object' ||
      !(birthPayload as Record<string, unknown>).birthDate
    ) {
      setEmailError(
        'Your birth data isn\u2019t in this session any more. Re-take the quiz to email yourself.',
      );
      setEmailState('error');
      return;
    }

    setEmailState('sending');
    setEmailError('');
    captureEvent('quiz_email_requested', {
      quizSlug: result.quizSlug,
      archetype: result.archetype?.label,
    });

    try {
      const res = await fetch('/api/quiz/email-result', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizSlug: result.quizSlug,
          ...(birthPayload as Record<string, unknown>),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setEmailError(data?.error ?? 'Email failed. Try again in a moment.');
        setEmailState('error');
        return;
      }
      setEmailState('sent');
    } catch {
      setEmailError('Network error. Try again in a moment.');
      setEmailState('error');
    }
  }

  return (
    <section className='mx-auto w-full max-w-3xl px-4 py-8'>
      <div className='flex flex-col gap-8 rounded-2xl border border-lunary-primary-800/60 bg-layer-base p-6 sm:p-10'>
        {/* Welcome banner */}
        <div className='border-lunary-accent-700/50 bg-lunary-accent-900/30 flex items-center gap-3 rounded-xl border p-4'>
          <CheckCircle2 className='text-lunary-accent size-5 shrink-0' />
          <div className='flex flex-col'>
            <p className='text-content-primary text-sm font-medium'>
              You're in. Your 7-day Lunary+ trial is active.
            </p>
            <p className='text-content-secondary text-xs'>
              Your full reading is below. Email it to yourself if you want a
              copy for reference.
            </p>
          </div>
        </div>

        {/* Hero */}
        <div className='flex flex-col gap-4 text-center'>
          <span className='text-lunary-accent text-xs tracking-widest uppercase'>
            {result.hero.eyebrow}
          </span>
          {result.archetype && (
            <div className='flex flex-col gap-2'>
              <Heading as='h1' variant='h1' className='text-lunary-primary-100'>
                {result.archetype.label}
              </Heading>
              <p className='text-content-primary mx-auto max-w-xl text-base italic'>
                {result.archetype.tagline}
              </p>
            </div>
          )}
          <p className='text-content-secondary mx-auto max-w-2xl text-sm sm:text-base'>
            {result.hero.headline}
          </p>
          <p className='text-content-secondary mx-auto max-w-xl text-sm'>
            {result.hero.subhead}
          </p>
          {result.archetype && (
            <p className='text-content-secondary mx-auto mt-2 max-w-2xl text-sm leading-relaxed'>
              {result.archetype.rationale}
            </p>
          )}
        </div>

        {/* All sections (including previously-locked content) */}
        <div className='flex flex-col gap-6'>
          {result.sections.map((section, i) => (
            <article
              key={i}
              className='border-lunary-primary-800/40 bg-layer-raised/40 rounded-xl border p-5'
            >
              <Heading as='h3' variant='h4' className='mb-2'>
                {section.heading}
              </Heading>
              <p className='text-content-secondary text-sm leading-relaxed'>
                {section.body}
              </p>
              {section.highlight && (
                <p className='text-lunary-accent mt-3 text-xs'>
                  {section.highlight}
                </p>
              )}
              {section.bullets && section.bullets.length > 0 && (
                <ul className='text-content-secondary mt-3 flex flex-col gap-1 text-sm'>
                  {section.bullets.map((b, bi) => (
                    <li key={bi} className='flex items-start gap-2'>
                      <Sparkles className='text-lunary-accent mt-1 size-3 shrink-0' />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>

        {/* Share */}
        <div className='border-lunary-primary-700/60 bg-layer-raised flex flex-col gap-5 rounded-xl border p-6 sm:p-8'>
          <div className='flex flex-col gap-1 text-center'>
            <Heading as='h3' variant='h4'>
              Share your archetype
            </Heading>
            <p className='text-content-secondary text-sm'>
              Your card is ready. Save it, post it, pin it.
            </p>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={share.ogPath}
            alt={`${result.archetype?.label ?? 'Your chart ruler'} share card`}
            className='border-lunary-primary-700/40 mx-auto w-full max-w-sm rounded-xl border'
            loading='lazy'
          />

          <div className='flex flex-wrap justify-center gap-2'>
            <Button asChild variant='lunary' size='sm'>
              <a
                href={share.ogPath}
                download={`${result.archetype?.label?.replace(/\s+/g, '-').toLowerCase() ?? 'chart-ruler'}-lunary.png`}
                onClick={() => handleShareClick('download')}
              >
                <Download /> Save image
              </a>
            </Button>
            <Button variant='lunary' size='sm' onClick={handleCopyLink}>
              <Link2 /> {copied ? 'Copied!' : 'Copy link'}
            </Button>
            <Button asChild variant='lunary' size='sm'>
              <a
                href={share.threadsUrl}
                target='_blank'
                rel='noopener noreferrer'
                onClick={() => handleShareClick('threads')}
              >
                <Share2 /> Threads
              </a>
            </Button>
            <Button asChild variant='lunary' size='sm'>
              <a
                href={share.blueskyUrl}
                target='_blank'
                rel='noopener noreferrer'
                onClick={() => handleShareClick('bluesky')}
              >
                <Share2 /> Bluesky
              </a>
            </Button>
            <Button asChild variant='lunary' size='sm'>
              <a
                href={share.pinterestShareUrl}
                target='_blank'
                rel='noopener noreferrer'
                onClick={() => handleShareClick('pinterest')}
              >
                <Share2 /> Pinterest
              </a>
            </Button>
          </div>
        </div>

        {/* Email opt-in */}
        <div className='border-lunary-primary-700/60 bg-layer-raised flex flex-col gap-3 rounded-xl border p-6 text-center'>
          <Heading as='h3' variant='h4'>
            Want this for reference?
          </Heading>
          <p className='text-content-secondary text-sm'>
            We can email you this reading so you can come back to it any time.
          </p>
          <Button
            variant='lunary'
            size='lg'
            onClick={handleEmailMe}
            disabled={emailState === 'sending' || emailState === 'sent'}
          >
            <Mail />
            {emailState === 'sending'
              ? 'Sending…'
              : emailState === 'sent'
                ? 'Sent to your inbox'
                : 'Email this to me'}
          </Button>
          {emailState === 'error' && emailError && (
            <p className='text-lunary-error text-xs' role='alert'>
              {emailError}
            </p>
          )}
        </div>

        {/* Primary CTA into the app */}
        <div className='border-lunary-primary-700/60 bg-layer-raised flex flex-col gap-3 rounded-xl border p-6 text-center'>
          <p className='text-content-primary text-base'>{result.tease}</p>
          <Button asChild variant='lunary-solid' size='lg'>
            <Link href='/app'>
              Open Lunary <ArrowRight />
            </Link>
          </Button>
          <p className='text-content-secondary text-xs'>
            Your trial is already active. No card required.
          </p>
        </div>
      </div>
    </section>
  );
}
