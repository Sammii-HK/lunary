'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heading } from '@/components/ui/Heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BirthdayInput } from '@/components/ui/birthday-input';
import {
  Lock,
  Sparkles,
  ArrowRight,
  Download,
  Link2,
  Share2,
} from 'lucide-react';
import { captureEvent } from '@/lib/posthog-client';
import type { QuizResult } from '@/lib/quiz/types';

const QUIZ_SLUG = 'chart-ruler';

type Phase = 'form' | 'loading' | 'result' | 'error';

type FormState = {
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  skipTime: boolean;
};

const initialForm: FormState = {
  birthDate: '',
  birthTime: '',
  birthLocation: '',
  skipTime: false,
};

export function ChartRulerQuizClient() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [phase, setPhase] = useState<Phase>('form');
  const [result, setResult] = useState<QuizResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    captureEvent('quiz_started', { quizSlug: QUIZ_SLUG });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.birthDate || !form.birthLocation) return;
    captureEvent('quiz_submitted', {
      quizSlug: QUIZ_SLUG,
      hasBirthTime: !form.skipTime && !!form.birthTime,
    });
    setPhase('loading');
    setErrorMessage('');
    try {
      const res = await fetch('/api/quiz/chart-ruler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate: form.birthDate,
          birthTime:
            form.skipTime || !form.birthTime ? undefined : form.birthTime,
          birthLocation: form.birthLocation,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErrorMessage(
          data?.error ?? 'Something went wrong computing your chart.',
        );
        captureEvent('quiz_error', {
          quizSlug: QUIZ_SLUG,
          status: res.status,
          source: 'api',
        });
        setPhase('error');
        return;
      }
      const data = (await res.json()) as QuizResult;
      captureEvent('quiz_result_viewed', {
        quizSlug: data.quizSlug,
        archetype: data.archetype?.label,
        dignity: data.meta?.signals?.dignity ?? null,
        houseNature: data.meta?.signals?.houseNature,
        houseNumber: data.meta?.signals?.houseNumber,
        rulerInRising: data.meta?.signals?.rulerInRising,
        retrograde: data.meta?.signals?.retrograde,
      });
      try {
        const payload = JSON.stringify({
          quizSlug: data.quizSlug,
          birthDate: form.birthDate,
          birthTime:
            form.skipTime || !form.birthTime ? undefined : form.birthTime,
          birthLocation: form.birthLocation,
        });
        document.cookie = `lunary_pending_quiz=${encodeURIComponent(payload)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      } catch {
        // Cookie write failed (private mode etc), graceful degrade. User can still sign up, they just won't get the quiz-specific email.
      }
      setResult(data);
      setPhase('result');
    } catch {
      captureEvent('quiz_error', {
        quizSlug: QUIZ_SLUG,
        source: 'network',
      });
      setErrorMessage('Network error. Please try again.');
      setPhase('error');
    }
  }

  if (phase === 'result' && result) {
    return <ChartRulerResultView result={result} />;
  }

  return (
    <section className='mx-auto w-full max-w-2xl px-4 py-8'>
      <form
        onSubmit={handleSubmit}
        className='flex flex-col gap-6 rounded-2xl border border-lunary-primary-800/60 bg-layer-base p-6 sm:p-8'
        aria-busy={phase === 'loading'}
      >
        <div className='flex flex-col gap-2'>
          <Heading as='h2' variant='h3'>
            Let's find your chart ruler
          </Heading>
          <p className='text-content-secondary text-sm'>
            Takes 90 seconds. We use your full birth chart, not just your sun
            sign.
          </p>
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='birthDate'>Birth date</Label>
          <BirthdayInput
            id='birthDate'
            name='birthDate'
            value={form.birthDate}
            onChange={(value) => setForm((f) => ({ ...f, birthDate: value }))}
            disabled={phase === 'loading'}
          />
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='birthTime'>
            Birth time{' '}
            <span className='text-content-secondary text-xs'>
              (optional, improves accuracy)
            </span>
          </Label>
          <Input
            id='birthTime'
            name='birthTime'
            type='time'
            value={form.birthTime}
            disabled={form.skipTime || phase === 'loading'}
            onChange={(e) =>
              setForm((f) => ({ ...f, birthTime: e.target.value }))
            }
          />
          <label className='text-content-secondary mt-1 flex items-center gap-2 text-xs'>
            <input
              type='checkbox'
              checked={form.skipTime}
              onChange={(e) =>
                setForm((f) => ({ ...f, skipTime: e.target.checked }))
              }
              className='accent-lunary-primary'
            />
            I don't know my birth time
          </label>
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='birthLocation'>Birth place</Label>
          <Input
            id='birthLocation'
            name='birthLocation'
            placeholder='e.g. London, UK'
            value={form.birthLocation}
            disabled={phase === 'loading'}
            onChange={(e) =>
              setForm((f) => ({ ...f, birthLocation: e.target.value }))
            }
          />
        </div>

        {phase === 'error' && errorMessage && (
          <p className='text-lunary-error text-sm' role='alert'>
            {errorMessage}
          </p>
        )}

        <Button
          type='submit'
          variant='lunary-solid'
          size='lg'
          disabled={
            phase === 'loading' || !form.birthDate || !form.birthLocation
          }
        >
          {phase === 'loading' ? (
            'Reading your chart…'
          ) : (
            <>
              Reveal my chart ruler <ArrowRight />
            </>
          )}
        </Button>

        <p className='text-content-secondary text-center text-xs'>
          We only use birth data to compute your chart. No account needed to see
          your result.
        </p>
      </form>
    </section>
  );
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

  const quizLandingPath = `/quiz/beyond-your-sun-sign/${result.quizSlug}`;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
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

function ChartRulerResultView({ result }: { result: QuizResult }) {
  const signupHref = `/auth?quiz=${result.quizSlug}&k=${encodeURIComponent(result.meta.chartKey)}`;
  const [copied, setCopied] = useState(false);
  const share = buildShareAssets(result);

  function handleSignupClick() {
    captureEvent('quiz_signup_clicked', {
      quizSlug: result.quizSlug,
      archetype: result.archetype?.label,
      chartKey: result.meta.chartKey,
    });
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(share.fullQuizUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      captureEvent('quiz_share_clicked', {
        quizSlug: result.quizSlug,
        archetype: result.archetype?.label,
        destination: 'copy_link',
      });
    } catch {
      // Clipboard API unavailable, fall back silently. User can still use other share options.
    }
  }

  function handleShareClick(destination: string) {
    captureEvent('quiz_share_clicked', {
      quizSlug: result.quizSlug,
      archetype: result.archetype?.label,
      destination,
    });
  }

  return (
    <section className='mx-auto w-full max-w-3xl px-4 py-8'>
      <div className='flex flex-col gap-8 rounded-2xl border border-lunary-primary-800/60 bg-layer-base p-6 sm:p-10'>
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

        <div className='flex flex-col gap-6'>
          {result.sections.map((section, i) => (
            <article
              key={i}
              className={
                section.locked
                  ? 'border-lunary-primary-700/40 bg-layer-raised/60 relative rounded-xl border p-5'
                  : 'border-lunary-primary-800/40 bg-layer-raised/40 rounded-xl border p-5'
              }
            >
              {section.locked && (
                <div className='text-lunary-accent mb-3 flex items-center gap-2 text-xs'>
                  <Lock className='size-3.5' /> Locked
                </div>
              )}
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

        <div className='border-lunary-primary-700/60 bg-layer-raised flex flex-col gap-3 rounded-xl border p-6 text-center'>
          <p className='text-content-primary text-base'>{result.tease}</p>
          <Button asChild variant='lunary-solid' size='lg'>
            <Link href={signupHref} onClick={handleSignupClick}>
              Unlock my full profile (free 7-day trial) <ArrowRight />
            </Link>
          </Button>
          <p className='text-content-secondary text-xs'>
            Creates your free Lunary account. No card required.
          </p>
        </div>
      </div>
    </section>
  );
}
