'use client';

import { useEffect, useMemo, useState } from 'react';
import { Quote, Share2 } from 'lucide-react';

import { Heading } from '@/components/ui/Heading';
import { cn } from '@/lib/utils';

type SixWordResponse =
  | {
      success: true;
      line: string;
      transitTag: string;
      dateUTC: string;
    }
  | {
      success?: false;
      error?: string;
      message?: string;
    };

function formatDate(dateUTC: string): string {
  const date = new Date(`${dateUTC}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return dateUTC;
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function SixWordCard({ className }: { className?: string }) {
  const [data, setData] = useState<SixWordResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/six-word/today', { credentials: 'include' })
      .then((res) => res.json())
      .then((json: SixWordResponse) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setData({ success: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const shareUrl = useMemo(() => {
    if (!data?.success) return '';
    const params = new URLSearchParams({
      line: data.line,
      date: data.dateUTC,
    });
    return `/api/og/six-word?${params.toString()}`;
  }, [data]);

  if (!data || !data.success) return null;

  const handleShare = async () => {
    const text = `${data.line}\n\nMy Lunary six-word horoscope for ${formatDate(data.dateUTC)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Lunary six-word horoscope', text });
        return;
      }
      await navigator.clipboard.writeText(
        `${text}\n${window.location.origin}${shareUrl}`,
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      className={cn(
        'rounded-xl border border-lunary-primary/30 bg-gradient-to-br from-layer-base/80 via-surface-elevated/60 to-lunary-primary/10 p-4 shadow-lg',
        className,
      )}
      aria-label='Six-word horoscope'
    >
      <div className='mb-2 flex items-center justify-between gap-3'>
        <div className='flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-content-muted'>
          <Quote className='h-3.5 w-3.5 text-lunary-accent' aria-hidden />
          <span>Today&apos;s push line</span>
        </div>
        <span className='text-[11px] text-content-muted'>
          {formatDate(data.dateUTC)}
        </span>
      </div>

      <Heading as='h2' variant='h2' className='leading-tight'>
        {data.line}
      </Heading>

      <div className='mt-3 flex flex-wrap items-center gap-2'>
        <button
          type='button'
          onClick={handleShare}
          className='inline-flex items-center gap-2 rounded-full border border-stroke-subtle bg-layer-base/70 px-3 py-1.5 text-sm font-medium text-content-secondary transition-colors hover:border-lunary-primary/50 hover:text-content-primary'
        >
          <Share2 className='h-4 w-4' aria-hidden />
          <span>{copied ? 'Copied' : 'Share'}</span>
        </button>
      </div>
    </section>
  );
}
