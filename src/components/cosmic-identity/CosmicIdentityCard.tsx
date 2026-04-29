'use client';

/**
 * CosmicIdentityCard — Linktree-style "cosmic identity" card.
 *
 * Renders a brand-themed gradient card showing a user's:
 *   - Big Three (Sun / Moon / Rising) with element-coloured glyphs
 *   - Current "vibe" sentence (top transit hitting them this week +
 *     optional cosmic-vibe quiz archetype)
 *   - Top 3 transits of the year as a small list
 *   - Share button (`navigator.share` with clipboard fallback)
 *
 * Used both on the public `/me/[handle]` page (no session) and inside
 * the authenticated app's profile.
 */

import { useState } from 'react';
import { Sparkles, Share2, Copy, Check } from 'lucide-react';

import { Heading } from '@/components/ui/Heading';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// -----------------------------------------------------------------------
// Types — kept loose so the public server page can pass plain JSON.
// -----------------------------------------------------------------------

export interface BigThreeSign {
  /** "Sun" | "Moon" | "Rising" */
  placement: 'Sun' | 'Moon' | 'Rising';
  /** Sign name e.g. "Aries". May be null if missing. */
  sign: string | null;
}

export interface CosmicIdentityVibe {
  /** Headline sentence — e.g. "Saturn is squaring your Sun this week." */
  headline: string;
  /** Optional cosmic-vibe quiz archetype label, e.g. "Saturn Witch". */
  archetype?: string | null;
}

export interface CosmicIdentityTopTransit {
  label: string;
  date?: string | null;
  score?: number;
}

export interface CosmicIdentityCardProps {
  handle: string;
  displayName?: string | null;
  bigThree: BigThreeSign[];
  vibe?: CosmicIdentityVibe | null;
  topTransits?: CosmicIdentityTopTransit[];
  /** Absolute share URL — defaults to `/me/{handle}` if omitted. */
  shareUrl?: string;
  /** When true, the share button is hidden (e.g. embedded inside the app). */
  hideShare?: boolean;
  className?: string;
}

// -----------------------------------------------------------------------
// Static lookups (allow-list — no user-derived strings make it into UI
// without passing through these maps).
// -----------------------------------------------------------------------

const SIGN_GLYPHS: Record<string, string> = {
  Aries: '\u2648',
  Taurus: '\u2649',
  Gemini: '\u264A',
  Cancer: '\u264B',
  Leo: '\u264C',
  Virgo: '\u264D',
  Libra: '\u264E',
  Scorpio: '\u264F',
  Sagittarius: '\u2650',
  Capricorn: '\u2651',
  Aquarius: '\u2652',
  Pisces: '\u2653',
};

const SIGN_ELEMENTS: Record<string, 'Fire' | 'Earth' | 'Air' | 'Water'> = {
  Aries: 'Fire',
  Taurus: 'Earth',
  Gemini: 'Air',
  Cancer: 'Water',
  Leo: 'Fire',
  Virgo: 'Earth',
  Libra: 'Air',
  Scorpio: 'Water',
  Sagittarius: 'Fire',
  Capricorn: 'Earth',
  Aquarius: 'Air',
  Pisces: 'Water',
};

const ELEMENT_COLOR_CLASS: Record<string, string> = {
  Fire: 'text-lunary-rose',
  Earth: 'text-lunary-success',
  Air: 'text-lunary-accent',
  Water: 'text-lunary-primary-300',
};

const ELEMENT_RING_CLASS: Record<string, string> = {
  Fire: 'ring-lunary-rose/40',
  Earth: 'ring-lunary-success/40',
  Air: 'ring-lunary-accent/40',
  Water: 'ring-lunary-primary/40',
};

function glyphFor(sign: string | null): string {
  if (!sign) return '\u2728';
  return SIGN_GLYPHS[sign] ?? '\u2728';
}

function elementFor(sign: string | null): keyof typeof ELEMENT_COLOR_CLASS {
  if (!sign || !SIGN_ELEMENTS[sign]) return 'Air';
  return SIGN_ELEMENTS[sign];
}

// -----------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------

export function CosmicIdentityCard({
  handle,
  displayName,
  bigThree,
  vibe,
  topTransits,
  shareUrl,
  hideShare,
  className,
}: CosmicIdentityCardProps) {
  const [copied, setCopied] = useState(false);
  const url =
    shareUrl ??
    (typeof window !== 'undefined'
      ? `${window.location.origin}/me/${handle}`
      : `/me/${handle}`);

  const onShare = async () => {
    const shareData = {
      title: `${displayName || handle} \u00b7 Cosmic identity`,
      text: vibe?.headline || 'My cosmic identity on Lunary',
      url,
    };
    try {
      if (
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function'
      ) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      // user dismissed or share failed — fall through to clipboard
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      // last-resort no-op
    }
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-lunary-primary-700/50',
        'bg-gradient-to-br from-lunary-primary-900/80 via-surface-base to-lunary-rose-900/40',
        'p-6 sm:p-8 shadow-[0_0_60px_rgba(132,88,216,0.18)]',
        className,
      )}
    >
      {/* Cosmic vignette */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 opacity-60'
        style={{
          background:
            'radial-gradient(ellipse at 30% 0%, rgba(132,88,216,0.25) 0%, rgba(0,0,0,0) 60%), radial-gradient(ellipse at 80% 100%, rgba(238,120,158,0.18) 0%, rgba(0,0,0,0) 55%)',
        }}
      />

      <div className='relative flex flex-col gap-6'>
        {/* Header */}
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <p className='text-xs uppercase tracking-[0.18em] text-content-muted'>
              Cosmic identity
            </p>
            <Heading
              as='h1'
              variant='h1'
              className='mt-1 truncate text-content-primary'
            >
              {displayName || `@${handle}`}
            </Heading>
            <p className='mt-1 text-sm text-content-muted'>@{handle}</p>
          </div>
          {!hideShare && (
            <Button
              type='button'
              variant='lunary'
              size='sm'
              onClick={onShare}
              aria-label='Share my chart'
            >
              {copied ? (
                <>
                  <Check aria-hidden /> Copied
                </>
              ) : (
                <>
                  <Share2 aria-hidden /> Share
                </>
              )}
            </Button>
          )}
        </div>

        {/* Big Three */}
        <div>
          <Heading as='h2' variant='h3'>
            Big Three
          </Heading>
          <div className='mt-2 grid grid-cols-3 gap-3'>
            {bigThree.map((entry) => {
              const element = elementFor(entry.sign);
              return (
                <div
                  key={entry.placement}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 rounded-2xl bg-surface-overlay/60',
                    'p-4 ring-1',
                    ELEMENT_RING_CLASS[element],
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'text-4xl sm:text-5xl leading-none',
                      ELEMENT_COLOR_CLASS[element],
                    )}
                  >
                    {glyphFor(entry.sign)}
                  </span>
                  <span className='text-xs uppercase tracking-wider text-content-muted'>
                    {entry.placement}
                  </span>
                  <span className='text-sm text-content-secondary'>
                    {entry.sign || '\u2014'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vibe */}
        {vibe?.headline && (
          <div className='rounded-2xl border border-lunary-accent-700/40 bg-layer-base/70 p-4'>
            <div className='flex items-center gap-2 text-content-brand'>
              <Sparkles aria-hidden className='h-4 w-4' />
              <span className='text-xs uppercase tracking-[0.18em]'>
                This week
              </span>
            </div>
            <p className='mt-2 text-base text-content-secondary'>
              {vibe.headline}
            </p>
            {vibe.archetype && (
              <p className='mt-2 text-sm text-content-muted'>
                Archetype:{' '}
                <span className='text-lunary-accent'>{vibe.archetype}</span>
              </p>
            )}
          </div>
        )}

        {/* Top 3 transits */}
        {topTransits && topTransits.length > 0 && (
          <div>
            <Heading as='h2' variant='h3'>
              Top transits this year
            </Heading>
            <ol className='mt-2 space-y-2'>
              {topTransits.slice(0, 3).map((t, i) => (
                <li
                  key={`${t.label}-${i}`}
                  className='flex items-center justify-between rounded-xl bg-surface-overlay/40 px-3 py-2'
                >
                  <span className='flex min-w-0 items-center gap-3'>
                    <span className='text-xs font-medium text-lunary-accent'>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className='truncate text-sm text-content-secondary'>
                      {t.label}
                    </span>
                  </span>
                  {t.date && (
                    <span className='ml-3 shrink-0 text-xs text-content-muted'>
                      {formatShortDate(t.date)}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Footer fallback share (also helps when navigator.share is unavailable) */}
        {!hideShare && (
          <button
            type='button'
            onClick={onShare}
            className='inline-flex items-center justify-center gap-2 rounded-xl border border-lunary-primary-700/50 px-4 py-2 text-sm text-content-muted transition-colors hover:bg-layer-base hover:text-content-secondary'
          >
            <Copy aria-hidden className='h-4 w-4' />
            <span className='truncate'>{url.replace(/^https?:\/\//, '')}</span>
          </button>
        )}
      </div>
    </div>
  );
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default CosmicIdentityCard;
