'use client';

import Link from 'next/link';
import { Copy, ExternalLink, Lock, Share2, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BirthChart } from '@/components/BirthChart';
import { TransitScrubber } from '@/components/charts/TransitScrubber';
import { Button } from '@/components/ui/button';
import { ShareImageModal } from '@/components/og/ShareImageModal';
import { useOgShareModal } from '@/hooks/useOgShareModal';
import type { BirthChartData } from '@utils/astrology/birthChart';
import type {
  ChartReplyAnalysis,
  TransitReplyAspect,
  TransitReplyHouseCusp,
} from '@/lib/transit-reply/analysis';

export type ShareTransitReplyDisplayData = {
  shareId: string;
  mode?: 'transits' | 'birth-chart';
  name?: string;
  date: string;
  question?: string;
  sourceUrl?: string;
  chartMeta?: {
    provider?: string | null;
    confidence?: 'high' | 'medium' | 'low';
    houseConfidence?: 'high' | 'medium' | 'low';
    houseSystem?: string | null;
    houseNumberingDirection?: 'clockwise' | 'counterclockwise' | 'unknown';
    birthDate?: string | null;
    birthTime?: string | null;
    birthLocation?: string | null;
  };
  birthChart: BirthChartData[];
  houseCusps?: TransitReplyHouseCusp[];
  summary: string;
  transits: TransitReplyAspect[];
  placements?: ChartReplyAnalysis['placements'];
  redditReply: string;
  shareUrl: string;
  imageUrl: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00Z`));
}

function TransitPill({ transit }: { transit: TransitReplyAspect }) {
  return (
    <div className='rounded-xl border border-stroke-subtle bg-surface-elevated/60 p-3'>
      <p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-content-muted'>
        {transit.aspect} · {transit.orb.toFixed(1)}° orb
      </p>
      <p className='mt-1 text-sm font-semibold text-content-primary'>
        {transit.transitPlanet} {transit.aspectGlyph} natal{' '}
        {transit.natalPlanet}
      </p>
      <p className='mt-1 text-xs leading-relaxed text-content-secondary'>
        {transit.house
          ? `${transit.house}${transit.house === 1 ? 'st' : transit.house === 2 ? 'nd' : transit.house === 3 ? 'rd' : 'th'} house: ${transit.houseTheme}`
          : `${transit.transitSign} to ${transit.natalSign}`}
      </p>
    </div>
  );
}

function PlacementPill({
  placement,
}: {
  placement: ChartReplyAnalysis['placements'][number];
}) {
  return (
    <div className='rounded-xl border border-stroke-subtle bg-surface-elevated/60 p-3'>
      <p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-content-muted'>
        {placement.body} · {placement.sign}
      </p>
      <p className='mt-1 text-sm font-semibold text-content-primary'>
        {placement.body} in {placement.sign}
      </p>
      <p className='mt-1 text-xs leading-relaxed text-content-secondary'>
        {placement.house
          ? `${placement.house}${placement.house === 1 ? 'st' : placement.house === 2 ? 'nd' : placement.house === 3 ? 'rd' : 'th'} house: ${placement.houseTheme}`
          : `${placement.degree}° ${placement.sign}`}
      </p>
    </div>
  );
}

export function ShareTransitReplyLayout({
  data,
}: {
  data: ShareTransitReplyDisplayData;
}) {
  const [copied, setCopied] = useState(false);
  const isBirthChart = data.mode === 'birth-chart';
  const {
    shareTarget,
    sharePreviewUrl,
    shareLoading,
    shareError,
    isOpen,
    openShareModal,
    closeShareModal,
    handleShareImage,
    handleDownloadShareImage,
    handleCopyShareLink,
  } = useOgShareModal();

  const target = useMemo(
    () => ({
      title: 'Share transit overlay',
      description: isBirthChart
        ? 'Birth chart snapshot with the strongest extracted placements.'
        : 'Natal chart inside, current transits outside, with the strongest active contacts.',
      pageUrl: data.shareUrl,
      ogUrl: data.imageUrl,
    }),
    [data.imageUrl, data.shareUrl, isBirthChart],
  );

  const copyReply = async () => {
    await navigator.clipboard.writeText(data.redditReply);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const freeChartHref = useMemo(() => {
    const params = new URLSearchParams({
      source: 'birth_chart_reply_share',
    });
    if (data.name) params.set('name', data.name);
    if (data.chartMeta?.birthDate)
      params.set('birthDate', data.chartMeta.birthDate);
    if (data.chartMeta?.birthTime)
      params.set('birthTime', data.chartMeta.birthTime);
    if (data.chartMeta?.birthLocation) {
      params.set('birthLocation', data.chartMeta.birthLocation);
    }
    return `/free-chart?${params.toString()}`;
  }, [data.chartMeta, data.name]);

  return (
    <main className='min-h-screen bg-surface-base text-content-primary'>
      <div className='mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10'>
        <header className='grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end'>
          <div>
            <p className='text-[11px] font-semibold uppercase tracking-[0.28em] text-content-muted'>
              {isBirthChart ? 'Birth chart read' : 'Live transit overlay'}
            </p>
            <h1 className='mt-2 max-w-3xl text-3xl font-semibold tracking-normal text-content-primary md:text-5xl'>
              {isBirthChart
                ? data.name
                  ? `${data.name}'s birth chart read`
                  : 'Birth chart read'
                : data.name
                  ? `${data.name}'s current transits`
                  : 'Current transits over this chart'}
            </h1>
            <p className='mt-3 max-w-2xl text-sm leading-relaxed text-content-secondary md:text-base'>
              {isBirthChart
                ? 'A clean snapshot of the chart supplied in the thread, focused on the strongest readable placements and house context.'
                : 'Natal chart inside. Current sky outside. The notes below focus on the strongest active contacts and the houses they are moving through right now.'}
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button
              type='button'
              onClick={() => openShareModal(target)}
              className='gap-2'
            >
              <Share2 className='h-4 w-4' />
              Share image
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={copyReply}
              className='gap-2'
            >
              <Copy className='h-4 w-4' />
              {copied ? 'Copied' : 'Copy reply'}
            </Button>
          </div>
        </header>

        <section className='grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]'>
          <div className='rounded-2xl border border-stroke-subtle bg-gradient-to-br from-surface-elevated/80 via-surface-base/80 to-layer-deep p-4 md:p-5'>
            {isBirthChart ? (
              <BirthChart
                birthChart={data.birthChart}
                houses={data.houseCusps}
                showAspects
                aspectFilter='all'
                showAsteroids={false}
                showPoints
                clockwise={
                  data.chartMeta?.houseNumberingDirection === 'clockwise'
                }
                houseSystem='placidus'
              />
            ) : (
              <TransitScrubber
                birthChart={data.birthChart}
                initialDate={data.date}
                forceLocked
              />
            )}
          </div>

          <aside className='flex flex-col gap-4'>
            <div className='rounded-2xl border border-stroke-subtle bg-surface-elevated/60 p-5'>
              <div className='mb-3 flex items-center justify-between gap-3'>
                <p className='text-[11px] font-semibold uppercase tracking-[0.24em] text-content-muted'>
                  {isBirthChart
                    ? 'Birth chart snapshot'
                    : formatDate(data.date)}
                </p>
                <Sparkles className='h-4 w-4 text-lunary-primary' />
              </div>
              <h2 className='text-xl font-semibold text-content-primary'>
                {isBirthChart
                  ? 'What stands out in the chart'
                  : 'What is active right now'}
              </h2>
              <p className='mt-3 text-sm leading-relaxed text-content-secondary'>
                {data.summary}
              </p>
            </div>

            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-1'>
              {isBirthChart
                ? (data.placements || [])
                    .slice(0, 4)
                    .map((placement) => (
                      <PlacementPill
                        key={`${placement.body}-${placement.sign}-${placement.house || 'sign'}`}
                        placement={placement}
                      />
                    ))
                : data.transits
                    .slice(0, 4)
                    .map((transit) => (
                      <TransitPill
                        key={`${transit.transitPlanet}-${transit.natalPlanet}-${transit.aspect}`}
                        transit={transit}
                      />
                    ))}
            </div>

            <div className='rounded-2xl border border-lunary-primary/30 bg-lunary-primary/10 p-5'>
              <div className='flex items-start gap-3'>
                <Lock className='mt-0.5 h-4 w-4 text-lunary-primary' />
                <div>
                  <h2 className='text-sm font-semibold text-content-primary'>
                    {isBirthChart
                      ? 'Get your free birth chart report'
                      : 'Keep this updated in Lunary'}
                  </h2>
                  <p className='mt-2 text-sm leading-relaxed text-content-secondary'>
                    {isBirthChart
                      ? 'Use Lunary’s free chart page to generate your own clean report, then save the full map when you want personalised daily timing.'
                      : 'This snapshot shows today. Sign in to save your chart, unlock the scrubber, and keep watching how the transits change over time.'}
                  </p>
                  <Link
                    href={
                      isBirthChart
                        ? freeChartHref
                        : '/signup/chart?source=transit_reply_share'
                    }
                    className='mt-4 inline-flex items-center gap-2 rounded-full bg-lunary-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-lunary-primary-400'
                  >
                    {isBirthChart
                      ? 'Open free chart page'
                      : 'Explore your chart'}
                    <ExternalLink className='h-3.5 w-3.5' />
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {data.question && (
          <section className='rounded-2xl border border-stroke-subtle bg-surface-elevated/40 p-5'>
            <p className='text-[11px] font-semibold uppercase tracking-[0.24em] text-content-muted'>
              Original context
            </p>
            <p className='mt-2 max-w-3xl text-sm leading-relaxed text-content-secondary'>
              {data.question}
            </p>
          </section>
        )}
      </div>

      <ShareImageModal
        isOpen={isOpen}
        target={shareTarget}
        previewUrl={sharePreviewUrl}
        loading={shareLoading}
        error={shareError}
        onClose={closeShareModal}
        onShare={handleShareImage}
        onDownload={handleDownloadShareImage}
        onCopy={handleCopyShareLink}
      />
    </main>
  );
}
