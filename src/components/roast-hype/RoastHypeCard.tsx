'use client';

/**
 * Roast Me / Hype Me, viral chart-aware shareable.
 *
 * Two big buttons (Roast / Hype). On tap we fetch `/api/roast-hype?mode=...`,
 * fade-in the 3-line reading, expose an audio narrator below it, and offer
 * a "Share my reading" action that uses the native share sheet (with a
 * copy-to-clipboard fallback) and also opens the OG card preview.
 *
 * Design notes:
 *   - Styling stays inside the brand palette via `cn()` and `lunary-*`
 *     colours; no raw Tailwind hexes.
 *   - Heading + Button come from `@/components/ui` (CLAUDE.md mandate).
 *   - lucide-react icons only, no emoji in the rendered surface.
 *   - The component is pure UI: it never builds external URLs from
 *     unvalidated input. The OG share URL is built relative to the current
 *     origin and the few user-controlled params (mode, headline, lines,
 *     handle) are URL-encoded; the OG route itself enforces an allow-list.
 */

import { useCallback, useMemo, useState } from 'react';
import { Flame, Share2, Sparkles, Volume2 } from 'lucide-react';

// AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting.
// import AudioNarrator from '@/components/audio/AudioNarrator';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/Heading';
import { cn } from '@/lib/utils';

type Mode = 'roast' | 'hype';

interface Reading {
  mode: Mode;
  headline: string;
  lines: string[];
  tone: string;
}

interface RoastHypeCardProps {
  /**
   * Optional public handle, included in the share URL so the OG card can
   * stamp `@handle`. Validation happens in the OG route.
   */
  handle?: string | null;
  /** Render variant, default vs. compact (sidebar/dashboard mount). */
  variant?: 'default' | 'compact';
  className?: string;
}

const MODE_LABEL: Record<Mode, string> = {
  roast: 'Roast me',
  hype: 'Hype me',
};

const MODE_ACCENT: Record<Mode, string> = {
  // Brand palette only, rose for roast (sharp), accent gold for hype.
  roast:
    'border-lunary-rose-700 bg-layer-base text-lunary-rose-300 hover:bg-lunary-rose-900/40 hover:border-lunary-rose-500',
  hype: 'border-lunary-accent-700 bg-layer-base text-lunary-accent-300 hover:bg-lunary-accent-900/40 hover:border-lunary-accent-500',
};

const MODE_GLOW: Record<Mode, string> = {
  roast: 'shadow-[0_0_30px_rgba(238,120,158,0.25)]',
  hype: 'shadow-[0_0_30px_rgba(212,165,116,0.25)]',
};

export function RoastHypeCard({
  handle,
  variant = 'default',
  className,
}: RoastHypeCardProps) {
  const [reading, setReading] = useState<Reading | null>(null);
  const [activeMode, setActiveMode] = useState<Mode | null>(null);
  const [loading, setLoading] = useState<Mode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<
    'idle' | 'sharing' | 'copied' | 'failed'
  >('idle');

  const fetchReading = useCallback(async (mode: Mode) => {
    setLoading(mode);
    setError(null);
    setReading(null);
    setShareStatus('idle');
    try {
      // Relative URL, never built from request headers (CLAUDE.md SSRF rule).
      const res = await fetch(`/api/roast-hype?mode=${mode}`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setError(data?.error || 'Could not load your reading.');
        return;
      }
      setReading({
        mode,
        headline: data.headline,
        lines: Array.isArray(data.lines) ? data.lines : [],
        tone: data.tone || mode,
      });
      setActiveMode(mode);
    } catch {
      setError('Network hiccup. Try again in a beat.');
    } finally {
      setLoading(null);
    }
  }, []);

  const narrationText = useMemo(() => {
    if (!reading) return '';
    return [reading.headline, ...reading.lines].join('. ');
  }, [reading]);

  const shareUrl = useMemo(() => {
    if (!reading) return null;
    const params = new URLSearchParams({
      mode: reading.mode,
      headline: reading.headline,
      line1: reading.lines[0] ?? '',
      line2: reading.lines[1] ?? '',
      line3: reading.lines[2] ?? '',
    });
    if (handle) params.set('handle', handle);
    // Relative path keeps us inside the same-origin / no-SSRF lane. The
    // browser will resolve it against the current origin.
    return `/api/og/roast-hype?${params.toString()}`;
  }, [reading, handle]);

  const handleShare = useCallback(async () => {
    if (!reading || !shareUrl) return;
    setShareStatus('sharing');
    const fullUrl =
      typeof window !== 'undefined'
        ? new URL(shareUrl, window.location.origin).toString()
        : shareUrl;
    const text = `${reading.headline}\n\n${reading.lines.join('\n')}\n\nGet yours: lunary.app`;
    try {
      if (
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function'
      ) {
        await navigator.share({
          title: `Lunary ${MODE_LABEL[reading.mode]}`,
          text,
          url: fullUrl,
        });
        setShareStatus('idle');
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${text}\n${fullUrl}`);
        setShareStatus('copied');
        // Open the OG preview in a new tab so the user can save / screenshot.
        if (typeof window !== 'undefined') {
          window.open(fullUrl, '_blank', 'noopener,noreferrer');
        }
        return;
      }
      // Last-resort: just open the OG URL.
      if (typeof window !== 'undefined') {
        window.open(fullUrl, '_blank', 'noopener,noreferrer');
      }
      setShareStatus('idle');
    } catch {
      setShareStatus('failed');
    }
  }, [reading, shareUrl]);

  const isCompact = variant === 'compact';

  return (
    <section
      className={cn(
        'rounded-2xl border border-lunary-primary-800/60 bg-layer-base/60 p-6 backdrop-blur-sm',
        isCompact ? 'p-4' : 'p-6',
        className,
      )}
    >
      <div className='flex items-start justify-between gap-3'>
        <div>
          <Heading as='h2' variant='h2'>
            Roast me / Hype me
          </Heading>
          <p className='mt-1 text-sm text-content-muted'>
            Three lines. Your actual chart. Pick your poison.
          </p>
        </div>
      </div>

      <div className='mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2'>
        {(['roast', 'hype'] as Mode[]).map((mode) => {
          const Icon = mode === 'roast' ? Flame : Sparkles;
          const isActive = activeMode === mode;
          const isLoading = loading === mode;
          return (
            <button
              key={mode}
              type='button'
              onClick={() => fetchReading(mode)}
              disabled={loading !== null}
              className={cn(
                'group flex items-center justify-center gap-3 rounded-xl border px-4 py-5 text-base font-medium transition-all',
                MODE_ACCENT[mode],
                isActive && MODE_GLOW[mode],
                'disabled:opacity-60',
              )}
            >
              <Icon className='h-5 w-5' aria-hidden />
              <span>
                {isLoading ? 'Reading the chart\u2026' : MODE_LABEL[mode]}
              </span>
            </button>
          );
        })}
      </div>

      {error && <p className='mt-4 text-sm text-lunary-rose-300'>{error}</p>}

      {reading && (
        <div
          key={`${reading.mode}-${reading.headline}`}
          className='mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500'
        >
          <Heading
            as='h3'
            variant='h3'
            className={cn(
              reading.mode === 'roast'
                ? 'text-lunary-rose-300'
                : 'text-lunary-accent-300',
            )}
          >
            {reading.headline}
          </Heading>
          <ul className='mt-3 space-y-3'>
            {reading.lines.map((line, idx) => (
              <li
                key={idx}
                className='flex items-start gap-3 text-content-secondary'
              >
                <span
                  aria-hidden
                  className={cn(
                    'mt-2 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full',
                    reading.mode === 'roast'
                      ? 'bg-lunary-rose-400'
                      : 'bg-lunary-accent-400',
                  )}
                />
                <span className='text-base leading-relaxed'>{line}</span>
              </li>
            ))}
          </ul>

          <div className='mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            {/* AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting. */}
            {/* <AudioNarrator
              text={narrationText}
              title={MODE_LABEL[reading.mode]}
              compactVariant='pill'
              className='flex-shrink-0'
            /> */}
            <Button
              type='button'
              variant='lunary'
              size='default'
              onClick={handleShare}
              disabled={!shareUrl}
              className='gap-2'
            >
              <Share2 className='h-4 w-4' aria-hidden />
              {shareStatus === 'copied'
                ? 'Copied, preview opened'
                : shareStatus === 'failed'
                  ? 'Try again'
                  : 'Share my reading'}
            </Button>
          </div>
          {!narrationText && (
            <span className='sr-only'>
              <Volume2 aria-hidden /> audio not ready
            </span>
          )}
        </div>
      )}
    </section>
  );
}

export default RoastHypeCard;
