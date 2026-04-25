'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, XCircle, Sparkles, Loader2 } from 'lucide-react';

import { Heading } from '@/components/ui/Heading';
import AudioNarrator from '@/components/audio/AudioNarrator';
import { cn } from '@/lib/utils';

// Inline the result shape so the client doesn't pull the score module
// (it's safe — the type is plain data) and we don't ship server-only deps.
type Verdict = 'yes' | 'wait' | 'no';

interface DecisionResponse {
  success: boolean;
  category?: string;
  verdict?: Verdict;
  confidence?: number;
  reasoning?: string;
  betterDay?: { date: string; why: string };
  error?: string;
  message?: string;
}

interface RecentEntry {
  question: string;
  verdict: Verdict;
  category: string;
  at: number;
}

const STORAGE_KEY = 'lunary:decision-helper:recent';
const MAX_RECENT = 5;

function readRecent(): RecentEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is RecentEntry =>
          !!e &&
          typeof (e as RecentEntry).question === 'string' &&
          typeof (e as RecentEntry).at === 'number' &&
          ['yes', 'wait', 'no'].includes((e as RecentEntry).verdict),
      )
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

function writeRecent(entries: RecentEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(entries.slice(0, MAX_RECENT)),
    );
  } catch {
    /* noop */
  }
}

function formatBetterDayDate(ymd: string): string {
  // ymd is `YYYY-MM-DD` (UTC). Render in user's locale, weekday + month + day.
  const [y, m, d] = ymd.split('-').map(Number);
  if (!y || !m || !d) return ymd;
  const date = new Date(Date.UTC(y, m - 1, d));
  try {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return ymd;
  }
}

function VerdictPill({
  verdict,
  confidence,
}: {
  verdict: Verdict;
  confidence?: number;
}) {
  const config = {
    yes: {
      label: 'Yes',
      Icon: CheckCircle2,
      classes:
        'bg-lunary-success/15 text-lunary-success border-lunary-success/40',
    },
    wait: {
      label: 'Wait',
      Icon: Clock,
      classes: 'bg-lunary-accent/15 text-lunary-accent border-lunary-accent/40',
    },
    no: {
      label: 'No',
      Icon: XCircle,
      classes: 'bg-lunary-rose/15 text-lunary-rose border-lunary-rose/40',
    },
  } as const;

  const { label, Icon, classes } = config[verdict];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 rounded-full border px-6 py-3 text-2xl font-semibold tracking-wide',
        classes,
      )}
      role='status'
      aria-label={`Verdict: ${label}`}
    >
      <Icon className='h-7 w-7' aria-hidden='true' />
      <span className='uppercase'>{label}</span>
      {typeof confidence === 'number' ? (
        <span className='ml-1 text-sm font-normal opacity-80 tabular-nums'>
          {confidence}%
        </span>
      ) : null}
    </div>
  );
}

interface Props {
  className?: string;
}

export default function DecisionHelperCard({ className }: Props) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<DecisionResponse | null>(null);
  const [recent, setRecent] = useState<RecentEntry[]>([]);

  useEffect(() => {
    setRecent(readRecent());
  }, []);

  const narrationText = useMemo(() => {
    if (!response?.verdict) return '';
    const verdictWord =
      response.verdict === 'yes'
        ? 'Yes.'
        : response.verdict === 'wait'
          ? 'Wait.'
          : 'No.';
    const reasoning = response.reasoning ?? '';
    const better = response.betterDay
      ? ` Better day: ${formatBetterDayDate(response.betterDay.date)} — ${response.betterDay.why}`
      : '';
    return `${verdictWord} ${reasoning}${better}`.trim();
  }, [response]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const q = question.trim();
      if (!q || loading) return;

      setLoading(true);
      setError(null);
      setResponse(null);

      try {
        const res = await fetch('/api/decision-helper', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: q }),
        });
        const data: DecisionResponse = await res.json();

        if (!res.ok || !data.success) {
          setError(
            data.message ||
              data.error ||
              'Could not read the sky right now. Try again in a moment.',
          );
          return;
        }

        setResponse(data);

        // Persist to recent (only when we have a verdict).
        if (data.verdict) {
          const next: RecentEntry[] = [
            {
              question: q,
              verdict: data.verdict,
              category: data.category ?? 'general',
              at: Date.now(),
            },
            ...recent.filter((r) => r.question !== q),
          ].slice(0, MAX_RECENT);
          setRecent(next);
          writeRecent(next);
        }
      } catch {
        setError('Network hiccup. Try again.');
      } finally {
        setLoading(false);
      }
    },
    [question, loading, recent],
  );

  const handleRecentClick = useCallback((q: string) => {
    setQuestion(q);
  }, []);

  return (
    <section
      className={cn(
        'flex w-full flex-col gap-5 rounded-2xl border border-lunary-primary-700/40 bg-layer-base/70 p-5 shadow-lg backdrop-blur-sm sm:p-6',
        className,
      )}
      aria-label='Cosmic Decision Helper'
    >
      <div className='flex items-center gap-2 text-content-muted'>
        <Sparkles className='h-4 w-4 text-lunary-accent' aria-hidden='true' />
        <span className='text-xs uppercase tracking-wider'>
          Cosmic Decision Helper
        </span>
      </div>

      <Heading as='h2' variant='h2'>
        Ask the cosmos…
      </Heading>

      <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
        <label htmlFor='decision-question' className='sr-only'>
          Your question
        </label>
        <textarea
          id='decision-question'
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder='Should I send this email today? Is this a good day to launch?'
          className='w-full resize-none rounded-xl border border-lunary-primary-700/40 bg-layer-base/50 px-4 py-3 text-base text-content-primary placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-lunary-primary'
          disabled={loading}
        />
        <div className='flex items-center justify-between gap-3'>
          <span className='text-xs text-content-muted'>
            {question.length}/500
          </span>
          <button
            type='submit'
            disabled={loading || question.trim().length === 0}
            className='inline-flex items-center gap-2 rounded-full bg-lunary-primary px-5 py-2 text-sm font-medium text-white shadow hover:brightness-110 transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lunary-primary'
          >
            {loading ? (
              <Loader2 className='h-4 w-4 animate-spin' aria-hidden='true' />
            ) : (
              <Sparkles className='h-4 w-4' aria-hidden='true' />
            )}
            <span>{loading ? 'Reading…' : 'Read the sky'}</span>
          </button>
        </div>
      </form>

      {error ? (
        <div
          className='rounded-xl border border-lunary-rose/40 bg-lunary-rose/10 px-4 py-3 text-sm text-lunary-rose'
          role='alert'
        >
          {error}
        </div>
      ) : null}

      {response?.verdict ? (
        <div className='flex flex-col gap-4 rounded-xl border border-stroke-subtle bg-surface-elevated/40 p-4 sm:p-5'>
          <div className='flex flex-wrap items-center gap-3'>
            <VerdictPill
              verdict={response.verdict}
              confidence={response.confidence}
            />
            {response.category && response.category !== 'general' ? (
              <span className='rounded-full border border-stroke-subtle px-2.5 py-1 text-xs uppercase tracking-wider text-content-muted'>
                {response.category}
              </span>
            ) : null}
          </div>

          {response.reasoning ? (
            <p className='text-base leading-relaxed text-content-secondary'>
              {response.reasoning}
            </p>
          ) : null}

          {response.betterDay ? (
            <div className='rounded-lg border border-lunary-accent/30 bg-lunary-accent/5 px-4 py-3 text-sm text-content-secondary'>
              <span className='font-medium text-lunary-accent'>
                Better day:{' '}
              </span>
              <span className='text-content-primary'>
                {formatBetterDayDate(response.betterDay.date)}
              </span>
              <span className='text-content-muted'> — </span>
              <span>{response.betterDay.why}</span>
            </div>
          ) : null}

          {narrationText ? (
            <div className='pt-1'>
              <AudioNarrator
                text={narrationText}
                title='The cosmos says…'
                compactVariant='pill'
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {recent.length > 0 ? (
        <div className='flex flex-col gap-2 pt-2'>
          <Heading as='h3' variant='h3'>
            Recent questions
          </Heading>
          <ul className='flex flex-col gap-2'>
            {recent.map((entry) => (
              <li key={`${entry.at}-${entry.question}`}>
                <button
                  type='button'
                  onClick={() => handleRecentClick(entry.question)}
                  className='flex w-full items-center justify-between gap-3 rounded-lg border border-stroke-subtle bg-layer-base/40 px-3 py-2 text-left text-sm text-content-secondary hover:border-lunary-primary-600 hover:bg-layer-raised transition-colors'
                >
                  <span className='truncate'>{entry.question}</span>
                  <span
                    className={cn(
                      'flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                      entry.verdict === 'yes' &&
                        'bg-lunary-success/15 text-lunary-success',
                      entry.verdict === 'wait' &&
                        'bg-lunary-accent/15 text-lunary-accent',
                      entry.verdict === 'no' &&
                        'bg-lunary-rose/15 text-lunary-rose',
                    )}
                  >
                    {entry.verdict}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

export { DecisionHelperCard };
