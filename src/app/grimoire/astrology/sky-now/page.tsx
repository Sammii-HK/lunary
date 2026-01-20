import type { Metadata } from 'next';
import { ChartWheelSvg } from '@/app/birth-chart/chart-wheel-svg';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { SkyNowSharePanel } from '@/components/grimoire/SkyNowSharePanel';
import { getGlobalCosmicData } from '@/lib/cosmic-snapshot/global-cache';
import { formatDegree } from '../../../../../utils/astrology/astrology';
import type { BirthChartData } from '../../../../../utils/astrology/birthChart';
import { Heading } from '@/components/ui/Heading';
import { ASPECT_DATA, Aspect } from '@/constants/seo/aspects';

const CANONICAL_PATH = '/grimoire/astrology/sky-now';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lunary.app';

export async function generateMetadata(): Promise<Metadata> {
  const title =
    'Live Astrology Transits Now | How to Read Today’s Planetary Aspects';
  const description =
    'Explore live astrology transits updated every two hours. Learn how to read planetary aspects, understand current sky patterns, and place today’s transits in clear, grounded context.';
  const canonical = `${APP_URL}${CANONICAL_PATH}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Lunary',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

type TransitHighlight = {
  name: string;
  energy: string;
  aspect: string;
  glyph: string;
};

const ASPECT_SUMMARIES: Array<{
  slug: Aspect;
  name: string;
  type: string;
  description: string;
  tip: string;
}> = [
  {
    slug: 'conjunct',
    name: 'Conjunction',
    type: '0° apart',
    description:
      'Planets merge energy and charge the same area of experience. Use it to focus on a single theme with clarity.',
    tip: 'Be mindful of intensity—balance getting things done with rest.',
  },
  {
    slug: 'trine',
    name: 'Trine',
    type: '120° apart',
    description:
      'Energies flow easily, offering talent and effortless support between themes.',
    tip: 'Relax into the flow and amplify what is already working.',
  },
  {
    slug: 'square',
    name: 'Square',
    type: '90° apart',
    description:
      'Tension builds between opposing needs, asking for courage, accountability, and boundary work.',
    tip: 'Take deliberate action instead of letting pressure freeze you.',
  },
  {
    slug: 'sextile',
    name: 'Sextile',
    type: '60° apart',
    description:
      'Opportunity knocking—planets offer friendly support when you show up.',
    tip: 'Notice the small openings and follow through quickly.',
  },
  {
    slug: 'opposite',
    name: 'Opposition',
    type: '180° apart',
    description:
      'Polarities surface, so balance, dialogue, and partnership become the work.',
    tip: 'Listen before reacting—distance gives perspective.',
  },
];

export default async function SkyNowPage() {
  const now = new Date();
  const cosmicData = await getGlobalCosmicData(now);
  if (!cosmicData) {
    return (
      <div className='min-h-[400px] rounded-3xl border border-zinc-800/40 bg-zinc-900/40 p-8 text-sm text-zinc-400'>
        Unable to load the sky data right now. Please refresh the page in a
        moment.
      </div>
    );
  }

  const positions = cosmicData.planetaryPositions;
  const chartData: BirthChartData[] = Object.keys(positions).map((body) => {
    const placement = positions[body];
    const formatted = formatDegree(placement.longitude);
    return {
      body,
      sign: placement.sign,
      degree: formatted.degree,
      minute: formatted.minute,
      eclipticLongitude: placement.longitude,
      retrograde: placement.retrograde,
    };
  });

  const transitHighlights: TransitHighlight[] = cosmicData.generalTransits.map(
    (transit) => ({
      name: transit.name,
      energy: transit.energy,
      aspect: transit.aspect,
      glyph: transit.glyph || '✷',
    }),
  );

  const ASPECT_GROUPS = [
    { id: 'conjunction', title: 'Conjunctions' },
    { id: 'trine', title: 'Trines' },
    { id: 'sextile', title: 'Sextiles' },
    { id: 'square', title: 'Squares' },
    { id: 'opposition', title: 'Oppositions' },
  ];

  const aspectSections = ASPECT_GROUPS.map((group) => ({
    ...group,
    entries: transitHighlights.filter(
      (transit) => transit.aspect?.toLowerCase() === group.id,
    ),
  })).filter((section) => section.entries.length > 0);

  const otherEntries = transitHighlights.filter(
    (transit) =>
      !ASPECT_GROUPS.some(
        (group) => group.id === transit.aspect?.toLowerCase(),
      ),
  );

  if (otherEntries.length > 0) {
    aspectSections.push({
      id: 'other',
      title: 'Other active transits',
      entries: otherEntries,
    });
  }

  const pageTitle = 'Sky Now Transit Chart';

  const shareDateParam = now.toISOString();
  const heroContent = (
    <div className='mx-auto flex max-w-4xl flex-col items-center gap-4'>
      <div className='rounded-[40px] border border-white/10 bg-gradient-to-b from-zinc-950/60 to-zinc-900/60 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.6)]'>
        <ChartWheelSvg birthChart={chartData} size={380} />
      </div>
      <SkyNowSharePanel dateParam={shareDateParam} />
      <p className='max-w-2xl text-center text-sm text-zinc-300'>
        The chart above reflects the planetary positions for the current sky now
        moment. Refresh the page periodically for updated transit geometry and
        bookmark this page to keep track of how the sky is shifting around you.
      </p>
    </div>
  );

  return (
    <SEOContentTemplate
      title='Sky Now'
      h1={pageTitle}
      subtitle='Current transits, planetary weather, and how to read the live chart'
      description='See the live transit chart for the current sky, learn how to read the planetary weather, and find evergreen guidance for working with today’s astro-energies.'
      keywords={[
        'current transits',
        'transit chart',
        'sky now',
        'astrology transits',
        'planetary weather',
      ]}
      canonicalUrl={`${APP_URL}${CANONICAL_PATH}`}
      intro='Tracking the sky now connects you to cycles that affect timing, moods, and momentum. This page combines the live transit chart with evergreen interpretation so you can understand the planetary story even as the sky updates in real time.'
      tldr='Bookmark this transit chart, note the retrograde pileups, and focus on one or two major aspects at a time to stay aligned with today’s cosmic weather.'
      meaning='Transits show how the sky interacts with your natal blueprint. When planets form aspects with each other, their energies blend or tension builds. Together they describe the tone of the day, week, or season; every chart is a snapshot of those unfolding rhythms.'
      howToWorkWith={[
        'Look for the major transits near the top of the chart; those define today’s headline energies.',
        'Use the glyphs and aspect labels below to name what feels charged—such as “Sun square Pluto” or “Venus trine Neptune.”',
        'Note which retrograde planets are active and allow them extra time to revisit unfinished business.',
      ]}
      rituals={[
        'Journal the theme of one highlighted transit.',
        'Choose an action aligned with the chart’s biggest earth or fire placements to anchor the energy.',
      ]}
      heroContent={heroContent}
      internalLinks={[
        {
          text: 'Birth chart basics',
          href: '/grimoire/birth-chart',
        },
        {
          text: 'Transit tracking guide',
          href: '/grimoire/transits',
        },
      ]}
      internalLinksTitle='Related Grimoire guides'
      contextualCopyVariant='callout'
      contextualCopy='Live planetary data keeps refreshing while this page shares evergreen context on how to read the chart.'
      cosmicConnections={
        <CosmicConnections
          entityType='hub-transits'
          entityKey='sky-now'
          maxSections={3}
        />
      }
    >
      <section className='mt-12 space-y-6'>
        <Heading as='h2' variant='h2'>
          Transit highlights
        </Heading>
        <div className='space-y-6'>
          {aspectSections.map((section) => {
            const visibleEntries = section.entries.slice(0, 5);
            const hiddenEntries = section.entries.slice(5);
            return (
              <div key={section.id} className='space-y-4'>
                <Heading as='h3' variant='h4'>
                  {section.title}
                </Heading>
                <div className='grid gap-3 md:grid-cols-2'>
                  {visibleEntries.map((highlight) => (
                    <article
                      key={`${highlight.name}-${highlight.aspect}`}
                      className='rounded-2xl border border-white/10 bg-zinc-950/60 p-4 text-sm text-zinc-200'
                    >
                      <div className='flex items-center gap-3'>
                        <span className='font-astro text-2xl text-white'>
                          {highlight.glyph}
                        </span>
                        <p className='text-base font-semibold text-white'>
                          {highlight.name}
                        </p>
                      </div>
                      <p className='mt-2 text-xs text-zinc-400 uppercase tracking-[0.35em]'>
                        {highlight.aspect || 'Aspect'}
                      </p>
                      <p className='mt-1 text-sm text-zinc-300'>
                        {highlight.energy}
                      </p>
                    </article>
                  ))}
                </div>
                {hiddenEntries.length > 0 && (
                  <details className='rounded-2xl border border-white/10 bg-zinc-900/60 p-4 text-sm text-zinc-200'>
                    <summary className='cursor-pointer text-xs font-semibold uppercase tracking-[0.35em] text-zinc-400'>
                      {hiddenEntries.length} more {section.title.toLowerCase()}
                    </summary>
                    <div className='mt-4 space-y-3'>
                      {hiddenEntries.map((highlight) => (
                        <article
                          key={`hidden-${highlight.name}-${highlight.aspect}`}
                          className='rounded-xl border border-zinc-800/40 bg-zinc-950/40 p-3'
                        >
                          <div className='flex items-center gap-2'>
                            <span
                              className='font-astro text-lg text-white'
                              aria-hidden='true'
                            >
                              {highlight.glyph}
                            </span>
                            <p className='text-sm font-semibold text-white'>
                              {highlight.name}
                            </p>
                          </div>
                          <p className='mt-1 text-[0.65rem] uppercase tracking-[0.4em] text-zinc-400'>
                            {highlight.aspect || 'Aspect'}
                          </p>
                          <p className='text-sm text-zinc-300'>
                            {highlight.energy}
                          </p>
                        </article>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
        <div>
          <Heading as='h2' variant='h2'>
            How to read the live transit chart
          </Heading>
          <div className='mt-4 space-y-4'>
            {ASPECT_SUMMARIES.map((summary) => {
              const data = ASPECT_DATA[summary.slug];
              return (
                <div
                  key={summary.slug}
                  className='flex flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-950/60 p-4 text-sm text-zinc-200'
                >
                  <div className='flex items-center justify-between'>
                    <span
                      className='text-3xl '
                      style={{ fontFamily: 'Astronomicon, serif' }}
                    >
                      {data.symbol}
                    </span>
                    <span className='text-xs uppercase tracking-[0.35em] text-zinc-500'>
                      {data.degrees}°
                    </span>
                  </div>
                  <div>
                    <Heading as='h3' variant='h3'>
                      {summary.name}
                    </Heading>
                    <p className='text-xs uppercase tracking-[0.35em] text-zinc-500'>
                      {summary.type}
                    </p>
                  </div>
                  <p className='text-sm text-zinc-300'>{summary.description}</p>
                  <p className='text-sm text-zinc-300'>{summary.tip}</p>
                </div>
              );
            })}
          </div>
        </div>
        <p className='text-xs capitalize tracking-[0.35em] text-zinc-500'>
          The chart updates whenever the sky shifts, while this explanation
          keeps the context evergreen. Refresh to catch new aspects and bookmark
          the page as your live transit reference.
        </p>
      </section>
    </SEOContentTemplate>
  );
}
