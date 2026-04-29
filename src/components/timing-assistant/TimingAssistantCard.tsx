'use client';

import { useCallback, useMemo, useState } from 'react';
import { Calendar, ChevronRight, Loader2, Sparkles } from 'lucide-react';

import { Heading } from '@/components/ui/Heading';
// AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting.
// import AudioNarrator from '@/components/audio/AudioNarrator';
import { cn } from '@/lib/utils';

// Mirror the server type so the client doesn't pull the score module.
interface TimedDate {
  date: string;
  score: number;
  dominantAspect: string;
  reasoning: string;
  theme: string;
}

interface TimingResponse {
  success: boolean;
  category?: string;
  dates?: TimedDate[];
  error?: string;
  message?: string;
}

/**
 * Pretty date helpers, `date` is `YYYY-MM-DD` (UTC). We split manually
 * rather than `new Date(ymd)` to dodge the "interpreted as midnight UTC"
 * trap that can shift the displayed weekday by one in negative offsets.
 */
function parseYMD(ymd: string): Date | null {
  const [y, m, d] = ymd.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

function formatDayOfWeek(ymd: string): string {
  const date = parseYMD(ymd);
  if (!date) return '';
  try {
    return date.toLocaleDateString(undefined, { weekday: 'long' });
  } catch {
    return '';
  }
}

function formatLongDate(ymd: string): string {
  const date = parseYMD(ymd);
  if (!date) return ymd;
  try {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return ymd;
  }
}

interface Props {
  className?: string;
}

export default function TimingAssistantCard({ className }: Props) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<TimingResponse | null>(null);

  const dates = useMemo(() => response?.dates ?? [], [response?.dates]);

  // AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting.
  // const narrationText = useMemo(() => {
  //   if (dates.length === 0) return '';
  //   const lines = dates.map((d, i) => {
  //     const dow = formatDayOfWeek(d.date);
  //     const long = formatLongDate(d.date);
  //     return `Option ${i + 1}: ${dow}, ${long}. ${d.reasoning}`;
  //   });
  //   return `Here are three windows for ${response?.category ?? 'this'}. ${lines.join(' ')}`;
  // }, [dates, response?.category]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const q = question.trim();
      if (!q || loading) return;

      setLoading(true);
      setError(null);
      setResponse(null);

      try {
        const res = await fetch('/api/timing-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: q }),
        });
        const data: TimingResponse = await res.json();

        if (!res.ok || !data.success) {
          setError(
            data.message ||
              data.error ||
              'Could not scan the sky right now. Try again in a moment.',
          );
          return;
        }

        setResponse(data);
      } catch {
        setError('Network hiccup. Try again.');
      } finally {
        setLoading(false);
      }
    },
    [question, loading],
  );

  return (
    <section
      className={cn(
        'flex w-full flex-col gap-5 rounded-2xl border border-lunary-primary-700/40 bg-layer-base/70 p-5 shadow-lg backdrop-blur-sm sm:p-6',
        className,
      )}
      aria-label='Timing Assistant'
    >
      <div className='flex items-center gap-2 text-content-muted'>
        <Sparkles className='h-4 w-4 text-lunary-accent' aria-hidden='true' />
        <span className='text-xs uppercase tracking-wider'>
          Timing Assistant
        </span>
      </div>

      <Heading as='h2' variant='h2'>
        When should I...
      </Heading>

      <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
        <label htmlFor='timing-question' className='sr-only'>
          What are you trying to time?
        </label>
        <textarea
          id='timing-question'
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder='Send my pitch deck. Launch the new product. Ask them out.'
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
              <Calendar className='h-4 w-4' aria-hidden='true' />
            )}
            <span>{loading ? 'Scanning...' : 'Find 3 dates'}</span>
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

      {dates.length > 0 ? (
        <div className='flex flex-col gap-3'>
          {response?.category && response.category !== 'general' ? (
            <span className='inline-flex w-fit rounded-full border border-stroke-subtle px-2.5 py-1 text-xs uppercase tracking-wider text-content-muted'>
              {response.category}
            </span>
          ) : null}

          <ul className='flex flex-col gap-3'>
            {dates.map((d, i) => (
              <DateRow key={d.date} entry={d} rank={i + 1} />
            ))}
          </ul>

          {/* AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting. */}
          {/* {narrationText ? (
            <div className='pt-1'>
              <AudioNarrator
                text={narrationText}
                title='The cosmos suggests...'
                compactVariant='pill'
              />
            </div>
          ) : null} */}
        </div>
      ) : null}

      {!loading && !error && dates.length === 0 && response ? (
        <div className='rounded-xl border border-stroke-subtle bg-surface-elevated/30 px-4 py-3 text-sm text-content-muted'>
          The next month is quiet for this. Try widening the goal or rechecking
          in a week.
        </div>
      ) : null}
    </section>
  );
}

interface DateRowProps {
  entry: TimedDate;
  rank: number;
}

function DateRow({ entry, rank }: DateRowProps) {
  const dow = formatDayOfWeek(entry.date);
  const long = formatLongDate(entry.date);
  const score = Math.max(0, Math.min(100, Math.round(entry.score)));

  return (
    <li className='flex flex-col gap-3 rounded-xl border border-stroke-subtle bg-surface-elevated/40 p-4 sm:p-5'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-start gap-3'>
          <div
            className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-lunary-primary/15 text-lunary-primary'
            aria-hidden='true'
          >
            <Calendar className='h-5 w-5' />
          </div>
          <div className='flex flex-col'>
            <span className='text-xs uppercase tracking-wider text-content-muted'>
              Pick #{rank} · {entry.theme}
            </span>
            <span className='text-lg font-semibold text-content-primary'>
              {dow}
            </span>
            <span className='text-sm text-content-secondary'>{long}</span>
          </div>
        </div>
        <ChevronRight
          className='mt-2 h-4 w-4 flex-shrink-0 text-content-muted'
          aria-hidden='true'
        />
      </div>

      <div className='flex flex-col gap-1.5'>
        <div className='flex items-center justify-between gap-2 text-xs text-content-muted'>
          <span>Cosmic support</span>
          <span className='tabular-nums'>{score}%</span>
        </div>
        <div
          className='h-1.5 w-full overflow-hidden rounded-full bg-layer-base/60'
          role='progressbar'
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Score ${score} percent`}
        >
          <div
            className='h-full rounded-full bg-gradient-to-r from-lunary-primary to-lunary-accent transition-all'
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <p className='text-sm leading-relaxed text-content-secondary'>
        {entry.reasoning}
      </p>
    </li>
  );
}

export { TimingAssistantCard };
