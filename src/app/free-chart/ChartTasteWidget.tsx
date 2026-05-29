'use client';

import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, ChevronDown, Send, Sparkles, Stars } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/Heading';
import { Input } from '@/components/ui/input';
import { captureEvent } from '@/lib/posthog-client';

const SURFACE = 'public-chart-taste';
/** Source-labelled referral code so the resulting signup is attributable. */
const REFERRAL_CODE = 'chart-ai-taste';
/** Mirrors the server cap in /api/ai/chart-taste. */
const MAX_QUESTIONS = 3;

export type ChartPlacement = {
  body: string;
  sign: string;
  degree?: string | null;
  house?: number | null;
};

type Exchange = {
  question: string;
  answer: string;
  provenance: ChartPlacement[];
};

type Status = 'idle' | 'loading';

/** Build the source-labelled signup link the CTA points at. */
function signupHref(source: string): string {
  const params = new URLSearchParams({
    hub: 'free-chart',
    location: 'chart_ai_taste',
    pagePath: '/free-chart',
    ref: REFERRAL_CODE,
    source,
  });
  return `/signup/chart?${params.toString()}`;
}

/** Seed suggested prompts from the visitor's actual placements. */
function buildChips(placements: ChartPlacement[]): string[] {
  const chips: string[] = [];
  const find = (body: string) => placements.find((p) => p.body === body);

  const moon = find('Moon');
  if (moon) chips.push(`What does my Moon in ${moon.sign} mean?`);

  const saturn = find('Saturn');
  if (saturn) {
    chips.push(
      saturn.house
        ? `What does my Saturn in the ${saturn.house} house mean?`
        : `What does my Saturn in ${saturn.sign} mean?`,
    );
  }

  const sun = find('Sun');
  if (sun && chips.length < MAX_QUESTIONS) {
    chips.push(`How do my Sun and Moon work together?`);
  }

  const ascendant = find('Ascendant');
  if (ascendant && chips.length < MAX_QUESTIONS) {
    chips.push(`What does my ${ascendant.sign} rising say about me?`);
  }

  // Always offer a chart-wide prompt so there is something to ask even for a
  // sparse, time-less chart.
  if (chips.length < MAX_QUESTIONS) {
    chips.push('What stands out most in my chart?');
  }

  return chips.slice(0, MAX_QUESTIONS);
}

export function ChartTasteWidget({
  placements,
  source = 'free_chart',
}: {
  placements: ChartPlacement[];
  source?: string;
}) {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [exchanges, setExchanges] = useState<Exchange[]>([]);

  const chips = useMemo(() => buildChips(placements), [placements]);
  const used = exchanges.length;
  const capReached = used >= MAX_QUESTIONS;
  const remaining = Math.max(0, MAX_QUESTIONS - used);

  async function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || status === 'loading' || capReached) return;

    setStatus('loading');
    setError('');
    captureEvent('public_chart_taste_question', {
      surface: SURFACE,
      source,
      question_index: used,
    });

    try {
      const response = await fetch('/api/ai/chart-taste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, placements, source }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(
          data?.error ||
            'The guide is resting right now. Please try again shortly.',
        );
        setStatus('idle');
        captureEvent('public_chart_taste_error', {
          surface: SURFACE,
          source,
          status: response.status,
        });
        return;
      }

      setExchanges((current) => [
        ...current,
        {
          question: trimmed,
          answer: String(data.answer ?? ''),
          provenance: Array.isArray(data.provenance) ? data.provenance : [],
        },
      ]);
      setInput('');
      setStatus('idle');
    } catch {
      setError('Network error. Please try again.');
      setStatus('idle');
      captureEvent('public_chart_taste_error', {
        surface: SURFACE,
        source,
        status: 'network',
      });
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(input);
  }

  function handleCtaClick() {
    captureEvent('public_chart_taste_signup_clicked', {
      surface: SURFACE,
      source,
      questions_used: used,
    });
  }

  return (
    <section
      className='border border-stroke-subtle bg-surface-elevated/50 rounded-lg p-6'
      data-surface={SURFACE}
    >
      <div className='flex items-start gap-3'>
        <Stars className='mt-1 h-5 w-5 flex-none text-content-brand' />
        <div>
          <Heading as='h3' variant='h3'>
            Ask the Astral Guide about your chart
          </Heading>
          <p className='mt-1 text-sm text-content-muted'>
            Grounded in the real placements you just generated, not a generic
            horoscope. {remaining} free{' '}
            {remaining === 1 ? 'question' : 'questions'} on this chart.
          </p>
        </div>
      </div>

      {exchanges.length > 0 && (
        <div className='mt-5 space-y-4'>
          {exchanges.map((exchange, index) => (
            <ChartTasteAnswer key={index} exchange={exchange} />
          ))}
        </div>
      )}

      {!capReached && (
        <>
          {chips.length > 0 && exchanges.length === 0 && (
            <div className='mt-5 flex flex-wrap gap-2'>
              {chips.map((chip) => (
                <button
                  key={chip}
                  type='button'
                  disabled={status === 'loading'}
                  onClick={() => void ask(chip)}
                  className='rounded-full border border-stroke-subtle bg-surface-base px-3 py-1.5 text-xs text-content-secondary transition-colors hover:border-content-brand hover:text-content-brand disabled:opacity-50'
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className='mt-4 flex gap-2'>
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder='Ask about a placement in your chart...'
              maxLength={500}
              disabled={status === 'loading'}
              aria-label='Ask the Astral Guide about your chart'
            />
            <Button
              type='submit'
              disabled={status === 'loading' || !input.trim()}
              className='gap-2'
            >
              {status === 'loading' ? (
                'Reading...'
              ) : (
                <>
                  Ask <Send className='h-4 w-4' />
                </>
              )}
            </Button>
          </form>
        </>
      )}

      {error && (
        <p className='mt-3 text-sm text-lunary-rose-300' role='alert'>
          {error}
        </p>
      )}

      <div className='mt-5 border-t border-stroke-subtle pt-4'>
        <p className='text-sm text-content-secondary'>
          {capReached
            ? 'That is your free taste. Create a free account to keep asking the Astral Guide about your chart.'
            : 'Computed from your real chart. Create a free account to ask unlimited questions and save your chart.'}
        </p>
        <a href={signupHref(source)} onClick={handleCtaClick}>
          <Button variant='lunary-solid' className='mt-3 gap-2'>
            <Sparkles className='h-4 w-4' />
            Create your free account
            <ArrowRight className='h-4 w-4' />
          </Button>
        </a>
      </div>
    </section>
  );
}

function ChartTasteAnswer({ exchange }: { exchange: Exchange }) {
  const [showProvenance, setShowProvenance] = useState(false);
  const hasProvenance = exchange.provenance.length > 0;

  return (
    <div className='rounded-lg border border-stroke-subtle bg-surface-base p-4'>
      <p className='text-xs font-medium uppercase tracking-wide text-content-brand'>
        {exchange.question}
      </p>
      <p className='mt-2 whitespace-pre-wrap text-sm leading-6 text-content-secondary'>
        {exchange.answer}
      </p>

      {hasProvenance && (
        <div className='mt-3'>
          <button
            type='button'
            onClick={() => setShowProvenance((value) => !value)}
            className='inline-flex items-center gap-1.5 text-xs text-content-muted transition-colors hover:text-content-brand'
            aria-expanded={showProvenance}
          >
            <Sparkles className='h-3.5 w-3.5' />
            Grounded in your real chart
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${
                showProvenance ? 'rotate-180' : ''
              }`}
            />
          </button>
          {showProvenance && (
            <ul className='mt-2 flex flex-wrap gap-2'>
              {exchange.provenance.map((placement) => (
                <li
                  key={`${placement.body}-${placement.sign}`}
                  className='rounded-md border border-stroke-subtle bg-surface-elevated/60 px-2.5 py-1 text-xs text-content-muted'
                >
                  {placement.body} in {placement.sign}
                  {placement.degree ? ` ${placement.degree}` : ''}
                  {typeof placement.house === 'number'
                    ? `, H${placement.house}`
                    : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
