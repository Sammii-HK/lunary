'use client';

import { motion } from 'motion/react';
import { Clock, BookOpen, Sparkles } from 'lucide-react';
import dayjs from 'dayjs';

import { Heading } from '@/components/ui/Heading';
import { cn } from '@/lib/utils';

interface AnniversaryMomentProps {
  /**
   * The anniversary date — typically one year before the page date.
   * Accepts a Date instance OR an ISO string for SSR ergonomics.
   */
  date: Date | string;
  /** Truncated journal entry text from that day, if any. */
  journalSnippet?: string;
  /** Short transit / sky description for that day, if any. */
  transitsSnippet?: string;
  /** Number of years ago — used in the eyebrow. Defaults to 1. */
  yearsAgo?: number;
  /** Optional className passthrough. */
  className?: string;
  /** Optional stagger index for list contexts. */
  index?: number;
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
 * gentle entrance. Pure presentational — accepts pre-resolved snippets so
 * server data assembly stays out of the component.
 */
export function AnniversaryMoment({
  date,
  journalSnippet,
  transitsSnippet,
  yearsAgo = 1,
  className,
  index = 0,
}: AnniversaryMomentProps) {
  const formatted = formatAnniversaryDate(date);
  const eyebrow =
    yearsAgo === 1 ? 'This time last year' : `${yearsAgo} years ago`;

  const hasJournal =
    typeof journalSnippet === 'string' && journalSnippet.trim().length > 0;
  const hasTransits =
    typeof transitsSnippet === 'string' && transitsSnippet.trim().length > 0;

  // Nothing to show — render nothing rather than an empty card.
  if (!hasJournal && !hasTransits) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: 'easeOut' }}
      aria-label='Cosmic memory from one year ago'
      className={cn(
        'relative overflow-hidden rounded-2xl border border-stroke-subtle/60',
        'bg-surface-elevated/60 backdrop-blur-sm',
        'p-5',
        className,
      )}
    >
      {/* Soft ambient glow — purely decorative */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-lunary-accent/10 blur-3xl'
      />

      <header className='relative flex items-center gap-2 mb-3'>
        <Clock className='w-3.5 h-3.5 text-lunary-accent' aria-hidden='true' />
        <p className='text-[11px] uppercase tracking-[0.14em] text-content-muted'>
          {eyebrow}
        </p>
      </header>

      <Heading
        as='h3'
        variant='h3'
        className='relative text-content-primary mb-4'
      >
        {formatted}
      </Heading>

      <div className='relative space-y-4'>
        {hasTransits && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + index * 0.06 }}
            className='flex items-start gap-3'
          >
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
          </motion.div>
        )}

        {hasJournal && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.22 + index * 0.06 }}
            className='flex items-start gap-3'
          >
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
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}

export default AnniversaryMoment;
