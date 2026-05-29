'use client';

import { useState } from 'react';
import { Heading } from '@/components/ui/Heading';
import { Button } from '@/components/ui/button';
import { SmartTrialButton } from '@/components/SmartTrialButton';
import { CosmicReportPreview } from '@/components/cosmic-report/CosmicReportPreview';
import { CosmicReportData } from '@/lib/cosmic-report/types';
import { Loader2, Sparkles } from 'lucide-react';

/**
 * Cap + teaser door for the Cosmic Report (no hard paywall).
 *
 * Shown to free / Plus users in place of the generator. It renders a truncated
 * preview of what the personalised report contains, then offers BOTH a
 * lower-commitment "buy this report once" purchase AND the existing 7-day Pro
 * trial. The free birth chart stays free; this only adds paid doors on top of a
 * teaser, it never gates an existing free feature.
 */

// A representative teaser of the report shape — NOT the buyer's real data, just
// enough to show the structure and the personalisation promise.
const TEASER_REPORT: CosmicReportData = {
  title: 'Your Personalised Cosmic Report',
  subtitle: 'Read against your own chart, houses and current transits',
  reportType: 'monthly',
  sections: [
    {
      key: 'natal',
      title: 'Your Chart Signature',
      summary:
        'Your Big 3 and key placements by house — the backbone every transit below is read against.',
      highlights: [
        'Sun, Moon and rising with house placements',
        'Mercury, Venus and Mars by sign and house',
        'Unlock to see your full chart signature',
      ],
    },
    {
      key: 'transits',
      title: 'Planetary Transits, mapped to your houses',
      summary:
        'Each movement is placed in your own houses, with timing and a one-line "what to do".',
      highlights: [
        'See which of YOUR houses each transit lands in',
        'How long each window lasts',
        'Unlock for the full house-by-house breakdown',
      ],
      energyLevel: 'high',
    },
    {
      key: 'moon',
      title: 'Lunar Weather',
      summary: 'Full and new moons in your report window, with ritual prompts.',
      highlights: ['Key lunar dates', 'Unlock for the full lunar calendar'],
    },
  ],
};

export function BuyOnceReportCTA() {
  const [isBuying, setIsBuying] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [buyUnavailable, setBuyUnavailable] = useState(false);

  const handleBuyOnce = async () => {
    try {
      setIsBuying(true);
      setBuyError(null);
      const response = await fetch('/api/cosmic-report/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_type: 'monthly' }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        setBuyError('Please sign in to buy your report.');
        return;
      }
      if (response.status === 503 || data.notConfigured) {
        // One-time purchase not set up yet — hide the buy door, keep the trial.
        setBuyUnavailable(true);
        return;
      }
      if (!response.ok || !data.success || !data.checkoutUrl) {
        throw new Error(data.message || 'Could not start checkout');
      }
      window.location.href = data.checkoutUrl;
    } catch (error) {
      setBuyError(
        error instanceof Error
          ? error.message
          : 'Could not start checkout right now.',
      );
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div className='w-full max-w-5xl mx-auto space-y-8 px-4 py-8 text-content-primary'>
      <div className='space-y-2'>
        <Heading as='h1' variant='h1'>
          Cosmic Report Generator
        </Heading>
        <p className='text-content-muted'>
          A personalised report that reads every transit against your own chart
          and houses, delivered as a PDF you can keep and share. Richer than
          your free birth chart, built for a specific moment.
        </p>
      </div>

      <div className='grid gap-8 md:grid-cols-[1.1fr,1fr]'>
        {/* Teaser preview */}
        <div className='relative'>
          <div className='pointer-events-none select-none opacity-70'>
            <CosmicReportPreview report={TEASER_REPORT} />
          </div>
          <div className='absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface-base to-transparent' />
        </div>

        {/* Dual CTA */}
        <div className='space-y-5 rounded-2xl border border-lunary-primary-700/50 bg-gradient-to-br from-layer-base to-lunary-highlight-900/40 p-6'>
          <div className='flex items-center gap-2'>
            <Sparkles className='h-5 w-5 text-lunary-primary-400' />
            <Heading as='h2' variant='h3'>
              Unlock your report
            </Heading>
          </div>

          <div className='space-y-3 rounded-xl border border-stroke-subtle bg-surface-elevated/40 p-4'>
            <p className='text-sm font-medium text-content-primary'>
              Buy this report once
            </p>
            <p className='text-xs text-content-muted'>
              A one-off personalised PDF for this moment. No subscription.
              Delivered to your email.
            </p>
            {!buyUnavailable ? (
              <Button
                onClick={handleBuyOnce}
                disabled={isBuying}
                className='w-full'
              >
                {isBuying ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Starting checkout…
                  </>
                ) : (
                  'Buy report once'
                )}
              </Button>
            ) : (
              <p className='text-xs text-content-muted italic'>
                One-time purchase is coming soon. Start a free Pro trial below
                to generate unlimited reports today.
              </p>
            )}
            {buyError && <p className='text-xs text-lunary-rose'>{buyError}</p>}
          </div>

          <div className='relative flex items-center'>
            <span className='h-px flex-1 bg-stroke-subtle' />
            <span className='px-3 text-xs uppercase tracking-wider text-content-muted'>
              or
            </span>
            <span className='h-px flex-1 bg-stroke-subtle' />
          </div>

          <div className='space-y-3 rounded-xl border border-stroke-subtle bg-surface-elevated/40 p-4'>
            <p className='text-sm font-medium text-content-primary'>
              Start a 7-day Pro trial
            </p>
            <p className='text-xs text-content-muted'>
              Generate unlimited reports plus every personalised feature. Cancel
              any time.
            </p>
            <SmartTrialButton feature='downloadable_reports' fullWidth />
          </div>
        </div>
      </div>
    </div>
  );
}
