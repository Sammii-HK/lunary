'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, BookOpen, Sparkles, ChevronDown } from 'lucide-react';
import dayjs from 'dayjs';

import { Heading } from '@/components/ui/Heading';
import { cn } from '@/lib/utils';

interface AnniversaryMomentProps {
  /**
   * The anniversary date, typically one year before the page date.
   * Accepts a Date instance OR an ISO string for SSR ergonomics.
   */
  date: Date | string;
  /** Truncated journal entry text from that day, if any. */
  journalSnippet?: string;
  /** Short transit / sky description for that day, if any. */
  transitsSnippet?: string;
  /** Number of years ago, used in the eyebrow. Defaults to 1. */
  yearsAgo?: number;
  /** Optional className passthrough. */
  className?: string;
  /** Optional stagger index for list contexts. */
  index?: number;
  /**
   * Visual mode.
   * - `compact` (default): single-line teaser, expands on tap.
   * - `expanded`: always-expanded original card.
   */
  variant?: 'compact' | 'expanded';
}

function formatAnniversaryDate(date: Date | string): string {
  const d = typeof date === 'string' ? dayjs(date) : dayjs(date);
  if (!d.isValid()) return '';
  return d.format('MMMM D, YYYY');
}

/**
 * AnniversaryMoment
 *
 * "This time last year" card. Shown on journal/horoscope pages to surface
 * the user's cosmic memory: the sky from one year ago plus the journal
 * entry they wrote that day, if any.
 *
 * Uses Lunary brand tokens (`bg-surface-elevated`, `text-content-*`,
 * `text-lunary-accent`, `border-stroke-subtle`) and `motion/react` for a
 * gentle entrance. Pure presentational, accepts pre-resolved snippets so
 * server data assembly stays out of the component.
 */
export function AnniversaryMoment({
  date,
  journalSnippet,
  transitsSnippet,
  yearsAgo = 1,
  className,
  index = 0,
  variant = 'compact',
}: AnniversaryMomentProps) {
  const formatted = formatAnniversaryDate(date);
  const eyebrow =
    yearsAgo === 1 ? 'This time last year' : `${yearsAgo} years ago`;

  const hasJournal =
    typeof journalSnippet === 'string' && journalSnippet.trim().length > 0;
  const hasTransits =
    typeof transitsSnippet === 'string' && transitsSnippet.trim().length > 0;

  // Compact mode starts collapsed; expanded variant starts (and stays) open.
  const [isOpen, setIsOpen] = useState(variant === 'expanded');

  // Nothing to show, render nothing rather than an empty card.
  if (!hasJournal && !hasTransits) return null;

  // Build a single-line teaser preferring the journal snippet, then transits.
  const teaserSource = hasJournal ? journalSnippet! : transitsSnippet!;
  const teaser = teaserSource.replace(/\s+/g, ' ').trim();

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
      aria-label='Cosmic memory from one year ago'
      className={cn(
        'relative overflow-hidden rounded-2xl border border-stroke-subtle/60',
        'bg-surface-elevated/60 backdrop-blur-sm',
        className,
      )}
    >
      <button
        type='button'
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls='anniversary-moment-body'
        className={cn(
          'relative flex w-full items-center gap-3 px-4 py-3 text-left',
          'transition-colors hover:bg-surface-card/30',
        )}
      >
        <span
          className={cn(
            'inline-flex h-7 w-7 flex-shrink-0 items-center justify-center',
            'rounded-full border border-stroke-subtle/70 bg-surface-card/40',
          )}
          aria-hidden='true'
        >
          <Clock className='h-3.5 w-3.5 text-lunary-accent' />
        </span>
        <span className='min-w-0 flex-1'>
          <span className='block text-[10px] uppercase tracking-[0.14em] text-content-muted'>
            {eyebrow}
          </span>
          <span className='block truncate text-sm text-content-secondary'>
            {teaser}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 flex-shrink-0 text-content-muted transition-transform',
            isOpen && 'rotate-180',
          )}
          aria-hidden='true'
        />
      </button>

      {isOpen && (
        <motion.div
          id='anniversary-moment-body'
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className='relative px-4 pb-4'
        >
          {/* Soft ambient glow, purely decorative */}
          <div
            aria-hidden='true'
            className='pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-lunary-accent/10 blur-3xl'
          />

          <Heading
            as='h3'
            variant='h3'
            className='relative text-content-primary mb-3'
          >
            {formatted}
          </Heading>

          <div className='relative space-y-4'>
            {hasTransits && (
              <div className='flex items-start gap-3'>
                <span
                  className={cn(
                    'mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center',
                    'rounded-full border border-stroke-subtle/70 bg-surface-card/40',
                  )}
                >
                  <Sparkles
                    className='h-3 w-3 text-lunary-accent'
                    aria-hidden='true'
                  />
                </span>
                <div>
                  <p className='text-[10px] uppercase tracking-wide text-content-muted mb-1'>
                    The sky that day
                  </p>
                  <p className='text-sm leading-relaxed text-content-secondary'>
                    {transitsSnippet}
                  </p>
                </div>
              </div>
            )}

            {hasJournal && (
              <div className='flex items-start gap-3'>
                <span
                  className={cn(
                    'mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center',
                    'rounded-full border border-stroke-subtle/70 bg-surface-card/40',
                  )}
                >
                  <BookOpen
                    className='h-3 w-3 text-lunary-accent'
                    aria-hidden='true'
                  />
                </span>
                <div>
                  <p className='text-[10px] uppercase tracking-wide text-content-muted mb-1'>
                    You wrote
                  </p>
                  <blockquote className='border-l-2 border-lunary-accent/40 pl-3'>
                    <p className='text-sm leading-relaxed text-content-secondary italic'>
                      &ldquo;{journalSnippet}&rdquo;
                    </p>
                  </blockquote>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}

export default AnniversaryMoment;
