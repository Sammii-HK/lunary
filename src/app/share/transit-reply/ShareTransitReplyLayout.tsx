'use client';

import Link from 'next/link';
import { BookOpen, ExternalLink, Lock, Share2, Sparkles } from 'lucide-react';
import { PLANET_DAILY_MOTION } from '../../../../utils/astrology/transit-duration-constants';
import type React from 'react';
import { useMemo } from 'react';
import { BirthChart } from '@/components/BirthChart';
import { TransitScrubber } from '@/components/charts/TransitScrubber';
import { Button } from '@/components/ui/button';
import { ShareImageModal } from '@/components/og/ShareImageModal';
import { useOgShareModal } from '@/hooks/useOgShareModal';
import { buildSignupChartUrl } from '@/lib/urls';
import type { BirthChartData } from '@utils/astrology/birthChart';
import type {
  ChartReplyAnalysis,
  TransitReplyAspect,
  TransitReplyHouseCusp,
} from '@/lib/transit-reply/analysis';
import {
  AspectCard,
  ActiveHousesGrid,
  type AspectCardData,
  buildAspectSentence,
  buildContextCopy,
  getAspectGlyph,
  ordinal,
  PLANET_MEANINGS,
  SIGN_MEANINGS,
  HOUSE_THEMES,
} from '@/components/aspects/AspectCard';
import {
  buildTransitDetails,
  type TransitAspect,
  type TransitDetail,
} from '@/features/horoscope';

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
  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00Z`));
}

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const ROUTED_PLANETS = new Set([
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
]);

const ASPECT_PAIR_SLUG: Record<string, string> = {
  Conjunction: 'conjunct',
  Opposition: 'opposite',
  Square: 'square',
  Trine: 'trine',
  Sextile: 'sextile',
};

const ASPECT_ANGLE: Record<string, number> = {
  conjunction: 0,
  opposition: 180,
  trine: 120,
  square: 90,
  sextile: 60,
};

/** Compute applying/separating + frozen exact-date label relative to a snapshot date. */
function computeAspectTiming(
  transit: TransitReplyAspect,
  snapshotDate: Date,
): { isApplying: boolean; exactDateLabel: string } {
  const aspectAngle = ASPECT_ANGLE[transit.aspect.toLowerCase()] ?? 0;
  const dailyMotion =
    PLANET_DAILY_MOTION[
      transit.transitPlanet as keyof typeof PLANET_DAILY_MOTION
    ] ?? 1;

  // Simulate yesterday's position to detect direction
  const yesterdayLong = transit.transitDegree - dailyMotion;
  let yesterdayDiff = Math.abs(yesterdayLong - transit.natalDegree);
  if (yesterdayDiff > 180) yesterdayDiff = 360 - yesterdayDiff;
  const yesterdayOrb = Math.abs(yesterdayDiff - aspectAngle);

  let currentDiff = Math.abs(transit.transitDegree - transit.natalDegree);
  if (currentDiff > 180) currentDiff = 360 - currentDiff;
  const currentOrb = Math.abs(currentDiff - aspectAngle);

  const isApplying = yesterdayOrb > currentOrb;

  // Exact date is relative to snapshot date, not today
  const daysToExact = currentOrb / dailyMotion;
  const exactDate = new Date(
    snapshotDate.getTime() +
      (isApplying ? daysToExact : -daysToExact) * 24 * 60 * 60 * 1000,
  );

  const label = exactDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
  const exactDateLabel = isApplying ? `peaks ${label}` : `peaked ${label}`;

  return { isApplying, exactDateLabel };
}

function planetHref(p: string) {
  return ROUTED_PLANETS.has(p)
    ? `/grimoire/astronomy/planets/${slug(p)}`
    : null;
}
function placementHref(body: string, sign: string) {
  return ROUTED_PLANETS.has(body)
    ? `/grimoire/placements/${slug(body)}-in-${slug(sign)}`
    : null;
}
function houseRefHref(h?: number | null) {
  return h ? `/grimoire/houses/${ordinal(h)}-house` : null;
}
function signHref(sign: string) {
  return `/grimoire/zodiac/${slug(sign)}`;
}

/** Map a TransitReplyAspect to the shared AspectCardData interface. */
function toAspectCardData(
  transit: TransitReplyAspect,
  snapshotDate: Date,
): AspectCardData {
  const aspectType = transit.aspect.toLowerCase();
  const sentence =
    transit.sentence?.trim() ||
    buildAspectSentence(
      transit.transitPlanet,
      transit.transitSign,
      transit.natalPlanet,
      transit.natalSign,
      aspectType,
      transit.house ?? null,
      transit.natalHouse ?? null,
    );

  const { isApplying, exactDateLabel } = computeAspectTiming(
    transit,
    snapshotDate,
  );

  return {
    aspectType,
    aspectGlyph: getAspectGlyph(aspectType),
    orb: transit.orb,
    transitPlanet: transit.transitPlanet,
    transitSign: transit.transitSign,
    natalPlanet: transit.natalPlanet,
    natalSign: transit.natalSign,
    transitHouse: transit.house ?? null,
    natalHouse: transit.natalHouse ?? null,
    sentence,
    contextCopy: buildContextCopy(transit.transitPlanet, transit.transitSign),
    duration: {
      displayText: '', // not shown when exactDateLabel is present
      isApplying,
    },
    exactDateLabel,
  };
}

// ── Section wrapper (matches HoroscopeSection in app) ──────────────────────
function Section({
  title,
  children,
  color = 'zinc',
}: {
  title: string;
  children: React.ReactNode;
  color?: 'purple' | 'zinc' | 'emerald' | 'amber' | 'indigo';
}) {
  const borders: Record<string, string> = {
    purple: 'border-lunary-primary-800',
    zinc: 'border-stroke-subtle',
    emerald: 'border-lunary-success-800',
    amber: 'border-lunary-accent-800',
    indigo: 'border-lunary-highlight-800',
  };
  return (
    <div
      className={`rounded-lg border ${borders[color]} bg-surface-elevated p-4`}
    >
      <h2 className='text-sm font-medium text-content-primary mb-2'>{title}</h2>
      {children}
    </div>
  );
}

// ── Placement card for birth-chart mode ───────────────────────────────────
function PlacementCard({
  placement,
}: {
  placement: ChartReplyAnalysis['placements'][number];
}) {
  const houseTheme = placement.house ? HOUSE_THEMES[placement.house] : null;
  const planetMeaning = PLANET_MEANINGS[placement.body];
  const signMeaning = SIGN_MEANINGS[placement.sign];

  return (
    <div className='rounded-lg border border-stroke-subtle bg-layer-deep/40 p-3'>
      <div className='flex items-center justify-between mb-1'>
        <span className='text-sm font-medium text-content-secondary'>
          {placement.body} in {placement.sign}
        </span>
        {placement.house && (
          <Link
            href={houseRefHref(placement.house) ?? '#'}
            className='text-[10px] px-2 py-0.5 rounded-full bg-layer-base/50 border border-lunary-primary-700/30 text-content-brand hover:border-lunary-primary-500 transition'
          >
            {ordinal(placement.house)} house
          </Link>
        )}
      </div>
      {planetMeaning && (
        <p className='text-xs text-content-muted mb-1'>
          {placement.body} {planetMeaning}.
        </p>
      )}
      {signMeaning && (
        <p className='text-xs text-content-muted mb-1'>
          In {placement.sign}, that energy is {signMeaning}.
        </p>
      )}
      {houseTheme && (
        <p className='text-xs text-content-secondary leading-relaxed'>
          Falls in the {ordinal(placement.house!)} house — {houseTheme}.
        </p>
      )}
    </div>
  );
}

// ── Reference link button ─────────────────────────────────────────────────
function RefLink({
  href,
  children,
}: {
  href: string | null;
  children: React.ReactNode;
}) {
  if (!href) return null;
  return (
    <Link
      href={href}
      className='inline-flex items-center gap-1 rounded-full border border-stroke-subtle bg-surface-elevated/70 px-2.5 py-1 text-[10px] font-medium text-content-secondary hover:border-lunary-primary/60 hover:text-content-primary transition'
    >
      <BookOpen className='h-2.5 w-2.5 shrink-0' />
      <span className='truncate'>{children}</span>
    </Link>
  );
}

// ── Intensity styles (mirrors TransitWisdom.tsx) ────────────────────────────
const INTENSITY_STYLES: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  'Life-Defining': {
    bg: 'bg-layer-deep/60',
    text: 'text-content-error',
    border: 'border-lunary-error-700/50',
  },
  'Highly Prominent': {
    bg: 'bg-layer-deep/60',
    text: 'text-content-brand-accent',
    border: 'border-lunary-accent-700/50',
  },
  Noticeable: {
    bg: 'bg-layer-deep/60',
    text: 'text-content-success',
    border: 'border-lunary-success-700/50',
  },
  Mild: {
    bg: 'bg-surface-elevated/60',
    text: 'text-content-muted',
    border: 'border-stroke-default/50',
  },
};

const THEME_COLORS: Record<string, string> = {
  Identity: 'tag-identity',
  Creativity: 'tag-creativity',
  Boundaries: 'tag-boundaries',
  Love: 'tag-love',
  Work: 'tag-work',
  Healing: 'tag-healing',
  Transformation: 'tag-transformation',
  Communication: 'tag-communication',
  Growth: 'tag-growth',
  Intuition: 'tag-intuition',
  Power: 'tag-power',
  Freedom: 'tag-freedom',
};

const ORB_BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  Exact: { bg: 'bg-layer-deep/60', text: 'text-content-brand' },
  Strong: { bg: 'bg-layer-deep/60', text: 'text-content-brand-secondary' },
  Subtle: { bg: 'bg-surface-elevated/60', text: 'text-content-muted' },
};

function ShareTransitCard({ detail }: { detail: TransitDetail }) {
  const styles =
    INTENSITY_STYLES[detail.intensityLevel] ?? INTENSITY_STYLES.Mild;
  const orbStyles =
    ORB_BADGE_STYLES[detail.intensity] ?? ORB_BADGE_STYLES.Subtle;

  return (
    <div
      className={`rounded-lg border ${styles.border} bg-surface-elevated/40 p-4 space-y-3`}
    >
      <div className='space-y-1'>
        <div className='flex items-center justify-between gap-2'>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${styles.bg} ${styles.text}`}
          >
            {detail.intensityLevel}
          </span>
          <p className='text-xs text-content-muted'>{detail.header}</p>
        </div>
        <h4 className='text-sm font-medium text-content-primary leading-tight'>
          {detail.title}
        </h4>
      </div>

      <div className='flex flex-wrap items-center gap-1.5'>
        {detail.themes.map((theme) => (
          <span
            key={theme}
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${THEME_COLORS[theme] ?? ''}`}
          >
            {theme}
          </span>
        ))}
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border border-stroke-default/50 ${orbStyles.bg} ${orbStyles.text}`}
        >
          {detail.intensity} · {detail.orbDegrees}°
        </span>
        <span className='inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border bg-surface-elevated border-stroke-subtle text-content-muted'>
          {detail.transitCycle}
        </span>
      </div>

      <p className='text-xs text-content-muted leading-relaxed'>
        {detail.degreeInfo}
      </p>
      <p className='text-sm text-content-secondary leading-relaxed'>
        {detail.meaning}
      </p>

      {detail.suggestion && (
        <p className='text-xs text-content-muted italic'>
          <span className='not-italic'>Try this:</span> {detail.suggestion}
        </p>
      )}
    </div>
  );
}

/** Adapter: convert share-page transit aspects to TransitAspect for buildTransitDetails */
function toTransitAspects(
  transits: ShareTransitReplyDisplayData['transits'],
): TransitAspect[] {
  return transits.map((t) => ({
    transitPlanet: t.transitPlanet,
    natalPlanet: t.natalPlanet,
    aspectType: t.aspect.toLowerCase(),
    transitSign: t.transitSign,
    transitDegree: '',
    natalSign: t.natalSign,
    natalDegree: '',
    orbDegrees: t.orb,
    house: t.house ?? undefined,
    natalHouse: t.natalHouse ?? undefined,
  }));
}

// ── Main layout ───────────────────────────────────────────────────────────
export function ShareTransitReplyLayout({
  data,
}: {
  data: ShareTransitReplyDisplayData;
}) {
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
      title: isBirthChart ? 'Birth chart snapshot' : 'Transit overlay',
      description: isBirthChart
        ? 'Birth chart snapshot with the strongest extracted placements.'
        : 'Natal chart inside, current transits outside, with the strongest active contacts.',
      pageUrl: data.shareUrl,
      ogUrl: data.imageUrl,
    }),
    [data.imageUrl, data.shareUrl, isBirthChart],
  );

  const freeChartHref = useMemo(() => {
    const p = new URLSearchParams({
      source: 'birth_chart_reply_share',
      utm_source: 'reddit',
      utm_medium: 'share_page',
      utm_campaign: 'birth_chart_reply',
      utm_content: 'free_chart_cta',
    });
    if (data.name) p.set('name', data.name);
    if (data.chartMeta?.birthDate) p.set('birthDate', data.chartMeta.birthDate);
    if (data.chartMeta?.birthTime) p.set('birthTime', data.chartMeta.birthTime);
    if (data.chartMeta?.birthLocation)
      p.set('birthLocation', data.chartMeta.birthLocation);
    return `/free-chart?${p.toString()}`;
  }, [data.chartMeta, data.name]);

  const signupHref = buildSignupChartUrl({
    source: 'reddit',
    medium: 'share_page',
    campaign: isBirthChart ? 'birth_chart_reply' : 'transit_reply',
    content: 'locked_scrubber',
    hub: isBirthChart ? 'birth_chart' : 'transits',
    location: 'transit_reply_share',
    pagePath: `/insights/chart/${data.shareId}`,
    funnel: 'reddit_chart_reply',
  });

  const snapshotDate = useMemo(
    () => new Date(`${data.date}T12:00:00Z`),
    [data.date],
  );

  const primaryTransits = data.transits.slice(0, 6);
  const primaryPlacements = (data.placements ?? []).slice(0, 6);

  const transitWisdomDetails = useMemo(() => {
    if (isBirthChart || data.transits.length === 0) return [];
    return buildTransitDetails(toTransitAspects(data.transits), {
      maxItems: 3,
    });
  }, [isBirthChart, data.transits]);

  return (
    <main className='min-h-screen bg-surface-base text-content-primary'>
      <div className='mx-auto w-full max-w-2xl space-y-4 px-4 py-6 pb-16'>
        {/* ── Header ── */}
        <div>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div className='flex-1'>
              <p className='text-[11px] font-semibold uppercase tracking-[0.28em] text-content-muted'>
                {isBirthChart ? 'Chart insight' : 'Live transit overlay'}
              </p>
              <h1 className='mt-1 text-xl font-semibold text-content-primary'>
                {isBirthChart
                  ? 'What stands out in this chart'
                  : data.name
                    ? `${data.name}'s current transits`
                    : 'Current transits over this chart'}
              </h1>
              <p className='text-sm text-content-muted mt-0.5'>
                {isBirthChart
                  ? 'Strongest placements from the supplied chart'
                  : !isBirthChart
                    ? `How the planets are moving through this chart right now${data.date ? ` · ${formatDate(data.date)}` : ''}`
                    : ''}
              </p>
            </div>
            <Button
              type='button'
              onClick={() => openShareModal(target)}
              size='sm'
              className='gap-2 shrink-0'
            >
              <Share2 className='h-3.5 w-3.5' />
              Share image
            </Button>
          </div>
        </div>

        {/* ── TransitScrubber / Birth chart ── */}
        <div className='rounded-2xl border border-stroke-subtle/70 bg-gradient-to-br from-surface-elevated/70 via-surface-base/70 to-layer-deep p-4'>
          {isBirthChart ? (
            <div className='mx-auto max-w-[400px]'>
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
            </div>
          ) : (
            <TransitScrubber
              birthChart={data.birthChart}
              initialDate={data.date}
              forceLocked
            />
          )}
        </div>

        {/* ── Cosmic highlight (summary) ── matches in-app style ── */}
        <div className='rounded-xl border border-stroke-subtle/70 bg-gradient-to-br from-surface-elevated/70 via-surface-base/70 to-layer-deep p-3 space-y-2'>
          <div className='flex items-start justify-between gap-3'>
            <h2 className='text-sm font-semibold text-content-primary leading-snug flex-1'>
              {isBirthChart ? 'What stands out' : 'What is active right now'}
            </h2>
            <Sparkles className='h-3.5 w-3.5 text-lunary-primary shrink-0 mt-0.5' />
          </div>
          <p className='text-xs text-content-secondary leading-relaxed'>
            {data.summary}
          </p>
        </div>

        {/* ── Active transits / placements ── */}
        <Section
          title={
            isBirthChart
              ? 'Strongest placements'
              : 'Active aspects on this chart'
          }
          color='indigo'
        >
          <p className='text-xs text-content-muted mb-2'>
            {isBirthChart
              ? 'Key placements extracted from the chart image'
              : 'How the sky was connecting to the natal chart on this date'}
          </p>
          {!isBirthChart && (
            <>
              <ActiveHousesGrid
                aspects={primaryTransits.map((t) => ({
                  transitHouse: t.house ?? null,
                  natalHouse: t.natalHouse ?? null,
                }))}
              />
              {/* Snapshot lock notice */}
              <div className='flex items-center gap-2 rounded-md border border-stroke-subtle/60 bg-surface-elevated/50 px-3 py-2 mb-2'>
                <Lock className='h-3 w-3 shrink-0 text-content-muted' />
                <p className='text-[11px] text-content-muted leading-snug'>
                  Dates shown are frozen to{' '}
                  <span className='text-content-secondary font-medium'>
                    {snapshotDate.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  .{' '}
                  <Link
                    href={signupHref}
                    className='text-content-brand hover:underline'
                  >
                    Sign in for live timings
                  </Link>
                </p>
              </div>
            </>
          )}
          <div className='space-y-2'>
            {isBirthChart
              ? primaryPlacements.map((p) => (
                  <PlacementCard
                    key={`${p.body}-${p.sign}-${p.house ?? 'no-house'}`}
                    placement={p}
                  />
                ))
              : primaryTransits.map((t) => (
                  <AspectCard
                    key={`${t.transitPlanet}-${t.natalPlanet}-${t.aspect}`}
                    aspect={toAspectCardData(t, snapshotDate)}
                  />
                ))}
          </div>
        </Section>

        {/* ── Transit wisdom ── */}
        {transitWisdomDetails.length > 0 && (
          <Section title='What this means for you' color='purple'>
            <p className='text-xs text-content-muted mb-3'>
              The strongest active transits over this chart right now
            </p>
            <div className='space-y-3'>
              {transitWisdomDetails.map((detail) => (
                <ShareTransitCard key={detail.id} detail={detail} />
              ))}
            </div>
            <p className='text-[11px] text-content-muted mt-3 pt-3 border-t border-stroke-subtle/50'>
              Personalised daily timing, house activations and transit history
              are available in{' '}
              <Link
                href='/pricing?nav=app'
                className='text-content-brand hover:underline'
              >
                Lunary+
              </Link>
            </p>
          </Section>
        )}

        {/* ── CTA ── */}
        <div className='rounded-lg border border-lunary-primary/30 bg-lunary-primary/10 p-4'>
          <div className='flex items-start gap-3'>
            <Lock className='mt-0.5 h-4 w-4 text-lunary-primary shrink-0' />
            <div>
              <h2 className='text-sm font-semibold text-content-primary'>
                {isBirthChart
                  ? 'Get your free birth chart report'
                  : 'Keep this updated in Lunary'}
              </h2>
              <p className='mt-1 text-xs leading-relaxed text-content-secondary'>
                {isBirthChart
                  ? "Use Lunary's free chart page to generate your own clean report, then save it when you want personalised daily timing."
                  : 'This snapshot shows today. Sign in to save your chart, unlock the scrubber, and watch how your transits change over time.'}
              </p>
              <Link
                href={isBirthChart ? freeChartHref : signupHref}
                className='mt-3 inline-flex items-center gap-2 rounded-full bg-lunary-primary px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-lunary-primary-400'
              >
                {isBirthChart ? 'Open free chart page' : 'Explore your chart'}
                <ExternalLink className='h-3 w-3' />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Grimoire references ── */}
        <Section title='Learn more' color='zinc'>
          <p className='text-xs text-content-muted mb-3'>
            Go deeper into the concepts behind this read
          </p>

          {/* Per-transit concept pills */}
          {!isBirthChart &&
            primaryTransits.slice(0, 3).map((t) => (
              <div
                key={`ref-${t.transitPlanet}-${t.natalPlanet}-${t.aspect}`}
                className='mb-3 last:mb-0'
              >
                <p className='text-[10px] font-semibold uppercase tracking-[0.2em] text-content-muted mb-1.5'>
                  {t.transitPlanet} {t.aspect.toLowerCase()} natal{' '}
                  {t.natalPlanet}
                </p>
                <div className='flex flex-wrap gap-1.5'>
                  <RefLink href={planetHref(t.transitPlanet)}>
                    {t.transitPlanet}
                  </RefLink>
                  <RefLink href={signHref(t.transitSign)}>
                    {t.transitSign}
                  </RefLink>
                  {ROUTED_PLANETS.has(t.natalPlanet) &&
                    ROUTED_PLANETS.has(t.transitPlanet) && (
                      <RefLink
                        href={`/grimoire/aspects/${slug(t.transitPlanet)}/${ASPECT_PAIR_SLUG[t.aspect]}/${slug(t.natalPlanet)}`}
                      >
                        {t.transitPlanet} {ASPECT_PAIR_SLUG[t.aspect]}{' '}
                        {t.natalPlanet}
                      </RefLink>
                    )}
                  <RefLink href={placementHref(t.natalPlanet, t.natalSign)}>
                    natal {t.natalPlanet} in {t.natalSign}
                  </RefLink>
                  <RefLink href={houseRefHref(t.natalHouse)}>
                    {t.natalHouse ? `${ordinal(t.natalHouse)} house` : null}
                  </RefLink>
                </div>
              </div>
            ))}

          {/* Per-placement concept pills */}
          {isBirthChart &&
            primaryPlacements.slice(0, 3).map((p) => (
              <div
                key={`ref-${p.body}-${p.sign}-${p.house ?? 'no-house'}`}
                className='mb-3 last:mb-0'
              >
                <p className='text-[10px] font-semibold uppercase tracking-[0.2em] text-content-muted mb-1.5'>
                  {p.body} in {p.sign}
                </p>
                <div className='flex flex-wrap gap-1.5'>
                  <RefLink href={placementHref(p.body, p.sign)}>
                    {p.body} in {p.sign}
                  </RefLink>
                  <RefLink href={signHref(p.sign)}>{p.sign}</RefLink>
                  <RefLink href={houseRefHref(p.house)}>
                    {p.house ? `${ordinal(p.house)} house` : null}
                  </RefLink>
                </div>
              </div>
            ))}

          {/* General grimoire links */}
          <div className='mt-3 pt-3 border-t border-stroke-subtle flex flex-wrap gap-1.5'>
            <RefLink href='/grimoire/aspects'>All aspects</RefLink>
            <RefLink href='/grimoire/transits'>All transits</RefLink>
            <RefLink href='/grimoire/houses'>All houses</RefLink>
            <RefLink href='/grimoire/zodiac'>Zodiac signs</RefLink>
            <RefLink href='/grimoire/birth-chart'>Birth chart guide</RefLink>
          </div>
        </Section>

        {/* ── Original question ── */}
        {data.question && (
          <Section title='Original context' color='zinc'>
            <p className='text-xs leading-relaxed text-content-secondary'>
              {data.question}
            </p>
          </Section>
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
