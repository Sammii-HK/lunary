'use client';

import { useEffect, useMemo, useState } from 'react';
import { Share2, Sparkles } from 'lucide-react';

// AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting.
// import AudioNarrator from '@/components/audio/AudioNarrator';
import { BirthChart } from '@/components/BirthChart';
import { Heading } from '@/components/ui/Heading';
import type { CompositeChart } from '@/lib/couples/composite';

type CompositeResponse =
  | {
      success: true;
      partnerName: string;
      composite: CompositeChart;
      reading: string;
    }
  | { requiresPlus: true }
  | { error: string };

type CompositeSuccess = Extract<CompositeResponse, { success: true }>;

export function CompositeChartCard() {
  const [data, setData] = useState<CompositeResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/couples/composite', { credentials: 'include' })
      .then((res) => res.json())
      .then((json: CompositeResponse) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setData({ error: 'Failed to load composite chart' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const shareUrl = useMemo(() => {
    if (!data || !('success' in data) || !data.success) return '';
    const sun = data.composite.placements.find((p) => p.body === 'Sun')?.sign;
    const moon = data.composite.placements.find((p) => p.body === 'Moon')?.sign;
    const params = new URLSearchParams({
      partner: data.partnerName,
      sun: sun || '',
      moon: moon || '',
      element: data.composite.dominantElement,
    });
    return `/api/og/couple-composite?${params.toString()}`;
  }, [data]);

  if (!data) {
    return (
      <div className='rounded-2xl border border-stroke-subtle bg-surface-elevated/50 p-6 text-sm text-content-muted'>
        Calculating your composite chart...
      </div>
    );
  }
  if ('requiresPlus' in data && data.requiresPlus) return null;
  if ('error' in data) return null;
  if (!('success' in data) || !data.success) return null;
  const successData: CompositeSuccess = data;

  const handleShare = async () => {
    const text = `Our composite chart on Lunary: ${successData.composite.summary}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Our composite chart', text });
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
    <section className='space-y-4 rounded-2xl border border-lunary-primary/25 bg-surface-elevated/45 p-4 sm:p-5'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <div className='mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-content-muted'>
            <Sparkles className='h-3.5 w-3.5 text-lunary-accent' />
            Composite chart
          </div>
          <Heading as='h2' variant='h2'>
            The relationship as its own sky
          </Heading>
        </div>
        <button
          type='button'
          onClick={handleShare}
          className='inline-flex items-center gap-2 rounded-full border border-stroke-subtle px-3 py-1.5 text-sm text-content-secondary transition hover:border-lunary-primary/50 hover:text-content-primary'
        >
          <Share2 className='h-4 w-4' />
          <span>{copied ? 'Copied' : 'Share'}</span>
        </button>
      </div>

      <BirthChart
        birthChart={successData.composite.placements}
        userName='The Composite'
        showAspects
        showAsteroids={false}
        showPoints
      />

      <div className='rounded-xl border border-stroke-subtle bg-layer-base/45 p-4'>
        <p className='text-sm leading-relaxed text-content-secondary'>
          {successData.reading}
        </p>
        {/* AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting. */}
        {/* <div className='mt-3'>
          <AudioNarrator
            text={successData.reading}
            title='Composite reading'
            compactVariant='pill'
          />
        </div> */}
      </div>
    </section>
  );
}
