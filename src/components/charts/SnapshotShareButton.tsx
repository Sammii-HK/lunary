'use client';

/**
 * SnapshotShareButton — "Share this moment" button for the bi-wheel and
 * time-machine page. Composes a full URL to the OG share route, then either:
 *  - calls `navigator.share({title, text, url})` if available, or
 *  - copies the URL to the clipboard and shows a transient toast.
 *
 * Tracks the share event via `conversionTracking.birthChartShared` if the
 * user is logged in (best-effort; falls back to `console.log`).
 */

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Check } from 'lucide-react';
import { conversionTracking } from '@/lib/analytics';
import { useUser } from '@/context/UserContext';

type Props = {
  /** Relative path to the OG image route, including query params, e.g.
   * `/api/og/share/birth-chart?date=2018-08-12&event=My%20breakup` */
  chartUrl: string;
  /** Optional event label (renders in share text) */
  label?: string;
  /** Optional date label (renders in share text) */
  dateLabel?: string;
  /** Optional className override */
  className?: string;
};

function resolveOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'https://lunary.app';
}

export function SnapshotShareButton({
  chartUrl,
  label,
  dateLabel,
  className,
}: Props) {
  const { user } = useUser();
  const [copied, setCopied] = useState(false);
  const [pending, setPending] = useState(false);

  const handleClick = useCallback(async () => {
    if (pending) return;
    setPending(true);
    const origin = resolveOrigin();
    const url = chartUrl.startsWith('http') ? chartUrl : `${origin}${chartUrl}`;

    const title = label ? `The sky on ${label}` : 'A moment in the sky';
    const text = dateLabel
      ? `${title} — ${dateLabel}. From Lunary.`
      : `${title} — from Lunary.`;

    let platform: 'native' | 'clipboard' = 'clipboard';

    try {
      const nav = typeof navigator !== 'undefined' ? navigator : undefined;
      if (nav && typeof nav.share === 'function') {
        try {
          await nav.share({ title, text, url });
          platform = 'native';
        } catch (err) {
          // User cancellation throws — fall through to clipboard if not aborted.
          const aborted =
            err instanceof Error &&
            (err.name === 'AbortError' ||
              /abort|cancel/i.test(err.message ?? ''));
          if (aborted) {
            setPending(false);
            return;
          }
          await copyToClipboard(url);
          platform = 'clipboard';
          setCopied(true);
        }
      } else {
        await copyToClipboard(url);
        setCopied(true);
      }

      // Best-effort analytics
      try {
        await conversionTracking.birthChartShared(user?.id, platform);
      } catch {
        if (typeof console !== 'undefined') {
          console.log(
            '[SnapshotShareButton] shared',
            platform,
            label ?? null,
            dateLabel ?? null,
          );
        }
      }
    } finally {
      setPending(false);
      if (platform === 'clipboard') {
        window.setTimeout(() => setCopied(false), 2200);
      }
    }
  }, [chartUrl, dateLabel, label, pending, user?.id]);

  return (
    <div className={`relative inline-flex ${className ?? ''}`}>
      <motion.button
        type='button'
        onClick={handleClick}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        animate={{
          boxShadow: [
            '0 0 0 rgba(199,125,255,0)',
            '0 0 12px rgba(199,125,255,0.45)',
            '0 0 0 rgba(199,125,255,0)',
          ],
        }}
        transition={{
          boxShadow: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
        }}
        disabled={pending}
        className='inline-flex items-center gap-1.5 rounded-full border border-lunary-primary/40 bg-lunary-primary/15 px-3 py-1.5 text-xs font-semibold text-content-primary transition-colors hover:bg-lunary-primary/25 disabled:opacity-60'
        aria-label='Share this moment'
      >
        <motion.span
          aria-hidden
          animate={{ rotate: [0, 12, -8, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
          className='flex'
        >
          <Sparkles className='h-3.5 w-3.5 text-lunary-accent' />
        </motion.span>
        Share this moment
      </motion.button>

      <AnimatePresence>
        {copied && (
          <motion.span
            key='snap-copied-toast'
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className='absolute left-1/2 top-full mt-2 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full border border-lunary-primary/40 bg-black/80 px-2.5 py-1 text-[11px] text-white shadow-lg backdrop-blur'
            role='status'
          >
            <Check className='h-3 w-3 text-emerald-300' />
            Link copied
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

async function copyToClipboard(value: string): Promise<void> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
  } catch {
    /* fall through */
  }
  // Fallback: textarea + execCommand
  try {
    const ta = document.createElement('textarea');
    ta.value = value;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  } catch {
    /* noop */
  }
}
