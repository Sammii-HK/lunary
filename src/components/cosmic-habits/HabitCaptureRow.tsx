'use client';

/**
 * HabitCaptureRow — compact, optional habit-capture controls for the journal
 * composer. Sleep stars (1-5), mood emoji-row (low → glowing), and a
 * "practised today" toggle. Output is a `HabitCapture` block that callers
 * stash into `entry.content.habitCapture`.
 */
import { useState } from 'react';
import { Heart, Moon, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HabitCapture, Mood, SleepScore } from '@/lib/cosmic-habits/types';
import { MOOD_LABELS } from '@/lib/cosmic-habits/types';

const MOOD_LABEL_TEXT: Record<Mood, string> = {
  low: 'Low',
  meh: 'Meh',
  ok: 'OK',
  good: 'Good',
  glowing: 'Glowing',
};

interface HabitCaptureRowProps {
  value: HabitCapture;
  onChange: (next: HabitCapture) => void;
  defaultOpen?: boolean;
  className?: string;
}

export function HabitCaptureRow({
  value,
  onChange,
  defaultOpen = false,
  className,
}: HabitCaptureRowProps) {
  const [open, setOpen] = useState(defaultOpen);

  const setSleep = (n: SleepScore) => {
    onChange({
      ...value,
      sleepScore: value.sleepScore === n ? undefined : n,
    });
  };

  const setMood = (m: Mood) => {
    onChange({ ...value, mood: value.mood === m ? undefined : m });
  };

  const togglePractised = () => {
    onChange({ ...value, practiced: !value.practiced });
  };

  return (
    <div
      className={cn(
        'rounded-lg border border-stroke-default/60 bg-surface-elevated/40',
        className,
      )}
    >
      <button
        type='button'
        onClick={() => setOpen((o) => !o)}
        className='flex w-full items-center justify-between gap-2 px-3 py-2 text-left'
        aria-expanded={open}
      >
        <span className='inline-flex items-center gap-2 text-sm text-content-secondary'>
          <Sparkles className='h-3.5 w-3.5 text-lunary-primary-400' />
          Track today (optional)
        </span>
        <span className='text-xs text-content-muted'>
          {open ? 'Hide' : 'Show'}
        </span>
      </button>

      {open && (
        <div className='space-y-3 border-t border-stroke-default/40 px-3 py-3'>
          {/* Sleep */}
          <div>
            <div className='mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-content-muted'>
              <Moon className='h-3.5 w-3.5 text-lunary-primary-400' />
              Sleep last night
            </div>
            <div
              className='flex items-center gap-1'
              role='radiogroup'
              aria-label='Sleep score'
            >
              {[1, 2, 3, 4, 5].map((n) => {
                const filled = (value.sleepScore ?? 0) >= n;
                return (
                  <button
                    key={n}
                    type='button'
                    onClick={() => setSleep(n as SleepScore)}
                    aria-checked={value.sleepScore === n}
                    role='radio'
                    className={cn(
                      'rounded p-1 transition-colors',
                      filled
                        ? 'text-lunary-primary-400'
                        : 'text-content-muted hover:text-content-secondary',
                    )}
                  >
                    <Star
                      className='h-4 w-4'
                      fill={filled ? 'currentColor' : 'none'}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mood */}
          <div>
            <div className='mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-content-muted'>
              <Heart className='h-3.5 w-3.5 text-lunary-rose-400' />
              Mood
            </div>
            <div className='flex flex-wrap gap-1.5'>
              {MOOD_LABELS.map((m) => {
                const active = value.mood === m;
                return (
                  <button
                    key={m}
                    type='button'
                    onClick={() => setMood(m)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                      active
                        ? 'border-lunary-primary-500 bg-lunary-primary-600/20 text-content-primary'
                        : 'border-stroke-default bg-surface-card/60 text-content-muted hover:text-content-secondary',
                    )}
                  >
                    {MOOD_LABEL_TEXT[m]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Practice toggle */}
          <div>
            <button
              type='button'
              onClick={togglePractised}
              aria-pressed={!!value.practiced}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                value.practiced
                  ? 'border-lunary-primary-500 bg-lunary-primary-600/20 text-content-primary'
                  : 'border-stroke-default bg-surface-card/60 text-content-muted hover:text-content-secondary',
              )}
            >
              <Sparkles className='h-3.5 w-3.5' />I practised today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HabitCaptureRow;
