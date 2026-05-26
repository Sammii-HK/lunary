'use client';

import Link from 'next/link';
import {
  BookOpen,
  Copy,
  ExternalLink,
  Lock,
  Share2,
  Sparkles,
} from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
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

function ordinal(value: number) {
  if (value >= 11 && value <= 13) return `${value}th`;
  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

function aspectTone(aspect: TransitReplyAspect['aspect']) {
  if (aspect === 'Square') return 'pressure, friction, and a need to act';
  if (aspect === 'Opposition')
    return 'contrast, projection, and relationship mirrors';
  if (aspect === 'Conjunction')
    return 'concentration, immediacy, and a louder inner signal';
  if (aspect === 'Trine')
    return 'ease, flow, and something that can be used constructively';
  return 'openings, support, and a subtle invitation to respond';
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

const PLANET_MEANINGS: Record<string, string> = {
  Sun: 'identity, vitality, confidence, and the conscious self',
  Moon: 'emotional needs, instinct, memory, and inner security',
  Mercury: 'language, thinking, learning, and interpretation',
  Venus: 'love, desire, values, attraction, and pleasure',
  Mars: 'drive, anger, desire, assertion, and physical action',
  Jupiter: 'growth, belief, opportunity, hope, and expansion',
  Saturn: 'limits, pressure, responsibility, maturity, and structure',
  Uranus: 'change, freedom, disruption, originality, and breakthrough',
  Neptune: 'dreams, longing, imagination, spirituality, and porous boundaries',
  Pluto: 'power, fear, transformation, obsession, and deep renewal',
  Ascendant: 'identity, appearance, first impressions, and how life is met',
  Descendant: 'partnerships, projection, mirroring, and committed others',
  Midheaven: 'visibility, vocation, reputation, and public direction',
  'Imum Coeli': 'home, roots, privacy, family patterns, and emotional ground',
  'North Node':
    'growth direction, appetite for experience, and unfamiliar lessons',
  Chiron: 'sensitivity, old pain, healing work, and practiced wisdom',
};

const SIGN_MEANINGS: Record<string, string> = {
  Aries: 'direct, initiating, hot, urgent, and instinctive',
  Taurus: 'steady, embodied, sensual, loyal, and concerned with security',
  Gemini: 'curious, verbal, changeable, connective, and mentally quick',
  Cancer: 'protective, emotional, memory-led, private, and attachment-focused',
  Leo: 'expressive, proud, creative, warm, and visibility-oriented',
  Virgo:
    'analytical, precise, practical, service-minded, and improvement-focused',
  Libra: 'relational, aesthetic, diplomatic, comparative, and balance-seeking',
  Scorpio:
    'intense, private, investigative, loyal, and transformation-oriented',
  Sagittarius:
    'expansive, honest, exploratory, philosophical, and freedom-seeking',
  Capricorn:
    'disciplined, strategic, mature, responsible, and achievement-focused',
  Aquarius:
    'systemic, future-minded, independent, experimental, and collective',
  Pisces:
    'porous, imaginative, compassionate, symbolic, and spiritually sensitive',
};

const ASPECT_TYPE_SLUG: Record<TransitReplyAspect['aspect'], string> = {
  Conjunction: 'conjunction',
  Opposition: 'opposition',
  Square: 'square',
  Trine: 'trine',
  Sextile: 'sextile',
};

const ASPECT_PAIR_SLUG: Record<TransitReplyAspect['aspect'], string> = {
  Conjunction: 'conjunct',
  Opposition: 'opposite',
  Square: 'square',
  Trine: 'trine',
  Sextile: 'sextile',
};

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function planetHref(planet: string) {
  return ROUTED_PLANETS.has(planet)
    ? `/grimoire/astronomy/planets/${slug(planet)}`
    : null;
}

function placementHref(body: string, sign: string) {
  return ROUTED_PLANETS.has(body)
    ? `/grimoire/placements/${slug(body)}-in-${slug(sign)}`
    : null;
}

function aspectPairHref(transit: TransitReplyAspect) {
  if (
    !ROUTED_PLANETS.has(transit.transitPlanet) ||
    !ROUTED_PLANETS.has(transit.natalPlanet)
  ) {
    return null;
  }
  return `/grimoire/aspects/${slug(transit.transitPlanet)}/${ASPECT_PAIR_SLUG[transit.aspect]}/${slug(transit.natalPlanet)}`;
}

function houseHref(house?: number | null) {
  return house ? `/grimoire/houses/${ordinal(house)}-house` : null;
}

function signHref(sign: string) {
  return `/grimoire/zodiac/${slug(sign)}`;
}

function ReferenceButton({
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
      className='inline-flex min-w-0 items-center gap-1 rounded-full border border-stroke-subtle bg-surface-elevated/70 px-3 py-1.5 text-xs font-medium text-content-secondary transition hover:border-lunary-primary/60 hover:text-content-primary'
    >
      <BookOpen className='h-3 w-3 shrink-0' />
      <span className='truncate'>{children}</span>
    </Link>
  );
}

function TransitPill({ transit }: { transit: TransitReplyAspect }) {
  return (
    <div className='min-w-0 overflow-hidden rounded-xl border border-stroke-subtle bg-surface-elevated/60 p-3'>
      <p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-content-muted'>
        {transit.aspect} - {transit.orb.toFixed(1)}° orb
      </p>
      <p className='mt-1 break-words text-sm font-semibold text-content-primary'>
        {transit.transitPlanet} {transit.aspect.toLowerCase()} natal{' '}
        {transit.natalPlanet}
      </p>
      <p className='mt-1 text-xs leading-relaxed text-content-secondary'>
        {transit.house
          ? `${ordinal(transit.house)} house: ${transit.houseTheme}`
          : `${transit.transitSign} to ${transit.natalSign}`}
      </p>
    </div>
  );
}

function ConceptReferenceCard({
  title,
  body,
  links,
}: {
  title: string;
  body: string;
  links: Array<{ href: string | null; label: string }>;
}) {
  return (
    <article className='rounded-2xl border border-stroke-subtle bg-surface-elevated/45 p-4'>
      <h3 className='text-sm font-semibold text-content-primary'>{title}</h3>
      <p className='mt-2 text-sm leading-relaxed text-content-secondary'>
        {body}
      </p>
      <div className='mt-4 flex flex-wrap gap-2'>
        {links.map((link) => (
          <ReferenceButton key={`${link.href}-${link.label}`} href={link.href}>
            {link.label}
          </ReferenceButton>
        ))}
      </div>
    </article>
  );
}

function PlacementPill({
  placement,
}: {
  placement: ChartReplyAnalysis['placements'][number];
}) {
  return (
    <div className='min-w-0 overflow-hidden rounded-xl border border-stroke-subtle bg-surface-elevated/60 p-3'>
      <p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-content-muted'>
        {placement.body} - {placement.sign}
      </p>
      <p className='mt-1 break-words text-sm font-semibold text-content-primary'>
        {placement.body} in {placement.sign}
      </p>
      <p className='mt-1 text-xs leading-relaxed text-content-secondary'>
        {placement.house
          ? `${ordinal(placement.house)} house: ${placement.houseTheme}`
          : `${placement.degree}° ${placement.sign}`}
      </p>
    </div>
  );
}

function TransitBreakdown({ transit }: { transit: TransitReplyAspect }) {
  return (
    <article className='rounded-2xl border border-stroke-subtle bg-surface-elevated/50 p-4'>
      <p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-content-muted'>
        {transit.transitPlanet} {transit.aspect.toLowerCase()} natal{' '}
        {transit.natalPlanet}
      </p>
      <h3 className='mt-2 text-base font-semibold text-content-primary'>
        Why this one matters
      </h3>
      <p className='mt-2 text-sm leading-relaxed text-content-secondary'>
        {transit.transitPlanet} is currently in {transit.transitSign}, forming a{' '}
        {transit.aspect.toLowerCase()} to the natal {transit.natalPlanet} in{' '}
        {transit.natalSign}. With an orb of {transit.orb.toFixed(1)}°, this is
        one of the tighter live contacts in the chart.
      </p>
      <p className='mt-3 text-sm leading-relaxed text-content-secondary'>
        This aspect usually describes {aspectTone(transit.aspect)}.{' '}
        {transit.house && transit.houseTheme
          ? `Because the moving planet is activating the ${ordinal(transit.house)} house, the visible life area is ${transit.houseTheme}.`
          : 'Without a fully readable house structure, the sign and planet contact are the cleaner signal.'}
      </p>
      {transit.natalHouse && transit.natalHouseTheme && (
        <p className='mt-3 text-sm leading-relaxed text-content-secondary'>
          The natal planet sits in the {ordinal(transit.natalHouse)} house, so
          the deeper chart theme comes back to {transit.natalHouseTheme}.
        </p>
      )}
    </article>
  );
}

function TransitReferenceMap({ transit }: { transit: TransitReplyAspect }) {
  const transitPlanetMeaning =
    PLANET_MEANINGS[transit.transitPlanet] || 'a moving planetary function';
  const natalPlanetMeaning =
    PLANET_MEANINGS[transit.natalPlanet] || 'a natal chart function';
  const transitSignMeaning =
    SIGN_MEANINGS[transit.transitSign] || 'the sign style of the transit';
  const natalSignMeaning =
    SIGN_MEANINGS[transit.natalSign] || 'the sign style of the natal placement';

  return (
    <div className='grid gap-4 lg:grid-cols-3'>
      <ConceptReferenceCard
        title={`${transit.aspect} aspect`}
        body={`${transit.aspect} describes the geometry of the contact. In this read, it is ${aspectTone(transit.aspect)}, with a ${transit.orb.toFixed(1)}° orb between the moving ${transit.transitPlanet} and natal ${transit.natalPlanet}.`}
        links={[
          {
            href: `/grimoire/aspects/types/${ASPECT_TYPE_SLUG[transit.aspect]}`,
            label: `${transit.aspect} meaning`,
          },
          {
            href: aspectPairHref(transit),
            label: `${transit.transitPlanet} ${transit.aspect} ${transit.natalPlanet}`,
          },
          { href: '/grimoire/aspects', label: 'All aspects' },
        ]}
      />
      <ConceptReferenceCard
        title={`${transit.transitPlanet} in ${transit.transitSign}`}
        body={`${transit.transitPlanet} brings ${transitPlanetMeaning}. ${transit.transitSign} makes that expression feel ${transitSignMeaning}. This is the moving sky layer, not a permanent natal trait.`}
        links={[
          {
            href: planetHref(transit.transitPlanet),
            label: `${transit.transitPlanet} planet`,
          },
          {
            href: signHref(transit.transitSign),
            label: `${transit.transitSign} zodiac`,
          },
          { href: '/grimoire/transits', label: 'All transits' },
        ]}
      />
      <ConceptReferenceCard
        title={`Natal ${transit.natalPlanet} in ${transit.natalSign}`}
        body={`The natal ${transit.natalPlanet} describes ${natalPlanetMeaning}. In ${transit.natalSign}, it tends to express through a ${natalSignMeaning} style.${transit.natalHouse && transit.natalHouseTheme ? ` The house layer ties it to ${transit.natalHouseTheme}.` : ''}`}
        links={[
          {
            href: placementHref(transit.natalPlanet, transit.natalSign),
            label: `${transit.natalPlanet} in ${transit.natalSign}`,
          },
          {
            href: houseHref(transit.natalHouse),
            label: transit.natalHouse
              ? `${ordinal(transit.natalHouse)} house`
              : 'House meanings',
          },
          { href: '/grimoire/houses', label: 'All houses' },
        ]}
      />
    </div>
  );
}

function PlacementBreakdown({
  placement,
}: {
  placement: ChartReplyAnalysis['placements'][number];
}) {
  return (
    <article className='rounded-2xl border border-stroke-subtle bg-surface-elevated/50 p-4'>
      <p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-content-muted'>
        {placement.body} in {placement.sign}
      </p>
      <h3 className='mt-2 text-base font-semibold text-content-primary'>
        How I would read it
      </h3>
      <p className='mt-2 text-sm leading-relaxed text-content-secondary'>
        {placement.body} in {placement.sign} is a core chart signal, but the
        house placement is what makes it practical.{' '}
        {placement.house && placement.houseTheme
          ? `Here it falls in the ${ordinal(placement.house)} house, tying the placement to ${placement.houseTheme}.`
          : 'The sign is visible, but the house context should be treated more carefully unless the chart table is clear.'}
      </p>
    </article>
  );
}

function PlacementReferenceMap({
  placement,
}: {
  placement: ChartReplyAnalysis['placements'][number];
}) {
  const planetMeaning =
    PLANET_MEANINGS[placement.body] || 'a visible chart function';
  const signMeaning = SIGN_MEANINGS[placement.sign] || 'the sign style';

  return (
    <ConceptReferenceCard
      title={`${placement.body} in ${placement.sign}`}
      body={`${placement.body} describes ${planetMeaning}. ${placement.sign} gives it a ${signMeaning} expression.${placement.house && placement.houseTheme ? ` The ${ordinal(placement.house)} house connects that expression to ${placement.houseTheme}.` : ''}`}
      links={[
        {
          href: placementHref(placement.body, placement.sign),
          label: `${placement.body} in ${placement.sign}`,
        },
        { href: signHref(placement.sign), label: `${placement.sign} zodiac` },
        {
          href: houseHref(placement.house),
          label: placement.house
            ? `${ordinal(placement.house)} house`
            : 'All houses',
        },
      ]}
    />
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
      utm_source: 'reddit',
      utm_medium: 'share_page',
      utm_campaign: 'birth_chart_reply',
      utm_content: 'free_chart_cta',
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

  return (
    <main className='min-h-screen bg-surface-base text-content-primary'>
      <div className='mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10'>
        <header className='grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end'>
          <div>
            <p className='text-[11px] font-semibold uppercase tracking-[0.28em] text-content-muted'>
              {isBirthChart ? 'Chart insight' : 'Live transit overlay'}
            </p>
            <h1 className='mt-2 max-w-3xl text-3xl font-semibold tracking-normal text-content-primary md:text-5xl'>
              {isBirthChart
                ? 'What stands out in this chart'
                : data.name
                  ? `${data.name}'s current transits`
                  : 'Current transits over this chart'}
            </h1>
            <p className='mt-3 max-w-2xl text-sm leading-relaxed text-content-secondary md:text-base'>
              {isBirthChart
                ? 'This is a short read from the chart supplied in the thread. The image is only a preview; the notes below explain why the placements matter.'
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
              <div className='mx-auto max-w-[460px]'>
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
                    href={isBirthChart ? freeChartHref : signupHref}
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

        <section className='grid gap-4 lg:grid-cols-2'>
          {isBirthChart
            ? (data.placements || [])
                .slice(0, 4)
                .map((placement) => (
                  <PlacementBreakdown
                    key={`detail-${placement.body}-${placement.sign}-${placement.house || 'sign'}`}
                    placement={placement}
                  />
                ))
            : data.transits
                .slice(0, 4)
                .map((transit) => (
                  <TransitBreakdown
                    key={`detail-${transit.transitPlanet}-${transit.natalPlanet}-${transit.aspect}`}
                    transit={transit}
                  />
                ))}
        </section>

        <section className='rounded-2xl border border-stroke-subtle bg-surface-elevated/30 p-5 md:p-6'>
          <div className='max-w-3xl'>
            <p className='text-[11px] font-semibold uppercase tracking-[0.24em] text-content-muted'>
              Grimoire references
            </p>
            <h2 className='mt-2 text-2xl font-semibold text-content-primary'>
              The concepts behind this read
            </h2>
            <p className='mt-3 text-sm leading-relaxed text-content-secondary'>
              Lunary reads from the same public reference system used across the
              Grimoire: aspects, planet meanings, zodiac signs, houses,
              placements, and transit context. Use these links to go deeper than
              the teaser image.
            </p>
          </div>

          <div className='mt-5 space-y-5'>
            {isBirthChart
              ? (data.placements || [])
                  .slice(0, 3)
                  .map((placement) => (
                    <PlacementReferenceMap
                      key={`reference-${placement.body}-${placement.sign}-${placement.house || 'sign'}`}
                      placement={placement}
                    />
                  ))
              : data.transits
                  .slice(0, 2)
                  .map((transit) => (
                    <TransitReferenceMap
                      key={`reference-${transit.transitPlanet}-${transit.natalPlanet}-${transit.aspect}`}
                      transit={transit}
                    />
                  ))}
          </div>

          <div className='mt-5 flex flex-wrap gap-2 border-t border-stroke-subtle pt-5'>
            <ReferenceButton href='/grimoire/birth-chart'>
              Birth chart guide
            </ReferenceButton>
            <ReferenceButton href='/grimoire/aspects'>
              All aspects
            </ReferenceButton>
            <ReferenceButton href='/grimoire/transits'>
              All transits
            </ReferenceButton>
            <ReferenceButton href='/grimoire/houses'>
              All houses
            </ReferenceButton>
            <ReferenceButton href='/grimoire/zodiac'>
              Zodiac signs
            </ReferenceButton>
          </div>
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
