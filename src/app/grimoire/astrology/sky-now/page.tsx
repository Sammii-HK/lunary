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

export const revalidate = 7200;
const CANONICAL_PATH = '/grimoire/astrology/sky-now';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lunary.app';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Sky Now: Current Chart & Live Astrology Transits | Lunary';
  const description =
    'Read the current chart with live planetary positions, active aspects, and grounded chart-reading guidance. Learn how today’s sky fits into real astrology, not vague transit wallpaper.';
  const canonical = `${APP_URL}${CANONICAL_PATH}`;
  const ogImage = `${APP_URL}/api/og/grimoire/astrology/sky-now`;

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
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Lunary Sky Now current astrology transit chart',
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
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
      <div className='min-h-[400px] rounded-3xl border border-stroke-subtle/40 bg-surface-elevated/40 p-8 text-sm text-content-muted'>
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

  const coreBodies = [
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
  ];

  const currentChartRows = coreBodies
    .map((body) => {
      const placement = positions[body];
      if (!placement) return null;
      const positionLabel = `${placement.sign} ${formatDegree(placement.longitude).degree}°${formatDegree(placement.longitude).minute.toString().padStart(2, '0')}'`;
      return [
        body,
        positionLabel,
        placement.retrograde ? 'Retrograde' : 'Direct',
      ];
    })
    .filter((row): row is string[] => Boolean(row));

  const retrogradeBodies = coreBodies.filter(
    (body) => positions[body]?.retrograde,
  );

  const pageTitle = 'Sky Now Transit Chart';

  const shareDateParam = now.toISOString();
  const heroContent = (
    <div className='mx-auto flex max-w-4xl flex-col items-center gap-4'>
      <div className='rounded-[40px] border border-white/10 bg-gradient-to-b from-surface-base/60 to-surface-elevated/60 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.6)]'>
        <ChartWheelSvg birthChart={chartData} size={380} />
      </div>
      <SkyNowSharePanel dateParam={shareDateParam} />
      <p className='max-w-2xl text-center text-sm text-content-secondary'>
        The wheel above is the current chart: the sky as it stands right now.
        Use it to track sign placements, retrogrades, and the active aspect
        weather. Then read those movements against your natal chart to see what
        gets activated personally.
      </p>
    </div>
  );

  return (
    <SEOContentTemplate
      title='Sky Now: Current Chart & Live Astrology Transits'
      h1={pageTitle}
      subtitle='The current chart, live transits, and how to read today’s sky properly'
      description='See the current chart for the sky right now, track live planetary positions, and learn how to interpret today’s aspects with real chart-reading structure.'
      keywords={[
        'current transits',
        'transit chart',
        'sky now',
        'current chart astrology',
        'astrology transits',
        'planetary weather',
      ]}
      canonicalUrl={`${APP_URL}${CANONICAL_PATH}`}
      intro='Tracking the sky now is how you learn to read astrology as a living system rather than a pile of isolated interpretations. This page shows the current chart, the active transits, and the structure you need to turn the sky into something readable.'
      tldr='Read the current chart in order: check the sign positions, note any retrogrades, identify the loudest aspects, and then compare that weather to your natal chart.'
      meaning={`The current chart is a snapshot of where the planets are right now. It is not your natal chart, but it becomes personally meaningful when these live positions activate your own placements by sign, house, and aspect.

Start simple. First, look at where the Sun and Moon are, because they set the basic tone and daily mood. Next, scan Mercury, Venus, and Mars to understand communication, relating, and action. Then check the slower planets and retrogrades, because they describe the longer background story that makes some periods feel heavier, stranger, or more consequential than others.

The wheel on this page is intentionally a clean current chart rather than a hyper-personalized dashboard. Its job is to teach you how to read the sky itself. Once you can identify the sign placements, retrogrades, and strongest aspects, you can compare that live weather to your birth chart and see what part of your life is actually being stirred.`}
      howToWorkWith={[
        'Start with the current chart itself before reading any interpretation: where are the Sun, Moon, Mercury, Venus, and Mars?',
        'Look for the major transits near the top of the chart; those define today’s headline energies.',
        'Use the glyphs and aspect labels below to name what feels charged—such as “Sun square Pluto” or “Venus trine Neptune.”',
        'Note which retrograde planets are active and allow them extra time to revisit unfinished business.',
        'Then compare the live chart to your natal chart to see which houses and placements are being activated personally.',
      ]}
      tables={[
        {
          title: 'Current chart positions',
          headers: ['Body', 'Position', 'Motion'],
          rows: currentChartRows,
        },
      ]}
      rituals={[
        'Journal the theme of one highlighted transit and where it lands in your own chart.',
        'Choose one action that matches the current chart instead of fighting it.',
      ]}
      sources={[
        {
          name: 'Lunary transit interpretation framework',
          url: 'https://lunary.app/about/methodology',
        },
        {
          name: 'Astronomy Engine planetary calculations',
          url: 'https://github.com/cosinekitty/astronomy',
        },
        {
          name: 'Traditional aspect doctrine',
        },
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
        {
          text: 'Houses guide',
          href: '/grimoire/houses',
        },
        {
          text: 'Planetary placements guide',
          href: '/grimoire/placements',
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
        <div className='rounded-2xl border border-white/10 bg-surface-base/60 p-5 text-sm text-content-secondary'>
          <Heading as='h2' variant='h3'>
            How to read the current chart
          </Heading>
          <div className='mt-4 space-y-3'>
            <p>
              Think of this page as your daily chart-reading practice. The
              current chart tells you the weather. Your natal chart tells you
              where that weather lands.
            </p>
            <ol className='list-decimal pl-5 space-y-2'>
              <li>
                Read the current positions table and notice the loudest sign
                clusters.
              </li>
              <li>
                Check which planets are retrograde, because they change the pace
                and tone.
              </li>
              <li>
                Look at the major aspects below to see where the tension or flow
                is concentrated.
              </li>
              <li>
                Then map those live positions onto your natal chart by sign,
                house, and aspect.
              </li>
            </ol>
          </div>
        </div>

        {retrogradeBodies.length > 0 && (
          <div className='rounded-2xl border border-white/10 bg-surface-elevated/60 p-5 text-sm text-content-secondary'>
            <Heading as='h2' variant='h3'>
              Retrogrades active now
            </Heading>
            <p className='mt-3'>
              {retrogradeBodies.join(', ')}{' '}
              {retrogradeBodies.length === 1 ? 'is' : 'are'} currently
              retrograde. In practical terms, that means the current chart is
              asking for more review, revision, and reorientation in those
              planetary topics rather than clean linear momentum.
            </p>
          </div>
        )}

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
                      className='rounded-2xl border border-white/10 bg-surface-base/60 p-4 text-sm text-content-primary'
                    >
                      <div className='flex items-center gap-3'>
                        <span className='font-astro text-2xl text-content-primary'>
                          {highlight.glyph}
                        </span>
                        <p className='text-base font-semibold text-content-primary'>
                          {highlight.name}
                        </p>
                      </div>
                      <p className='mt-2 text-xs text-content-muted uppercase tracking-[0.35em]'>
                        {highlight.aspect || 'Aspect'}
                      </p>
                      <p className='mt-1 text-sm text-content-secondary'>
                        {highlight.energy}
                      </p>
                    </article>
                  ))}
                </div>
                {hiddenEntries.length > 0 && (
                  <details className='rounded-2xl border border-white/10 bg-surface-elevated/60 p-4 text-sm text-content-primary'>
                    <summary className='cursor-pointer text-xs font-semibold uppercase tracking-[0.35em] text-content-muted'>
                      {hiddenEntries.length} more {section.title.toLowerCase()}
                    </summary>
                    <div className='mt-4 space-y-3'>
                      {hiddenEntries.map((highlight) => (
                        <article
                          key={`hidden-${highlight.name}-${highlight.aspect}`}
                          className='rounded-xl border border-stroke-subtle/40 bg-surface-base/40 p-3'
                        >
                          <div className='flex items-center gap-2'>
                            <span
                              className='font-astro text-lg text-content-primary'
                              aria-hidden='true'
                            >
                              {highlight.glyph}
                            </span>
                            <p className='text-sm font-semibold text-content-primary'>
                              {highlight.name}
                            </p>
                          </div>
                          <p className='mt-1 text-[0.65rem] uppercase tracking-[0.4em] text-content-muted'>
                            {highlight.aspect || 'Aspect'}
                          </p>
                          <p className='text-sm text-content-secondary'>
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
                  className='flex flex-col gap-3 rounded-2xl border border-white/10 bg-surface-base/60 p-4 text-sm text-content-primary'
                >
                  <div className='flex items-center justify-between'>
                    <span
                      className='text-3xl '
                      style={{ fontFamily: 'Astronomicon, serif' }}
                    >
                      {data.symbol}
                    </span>
                    <span className='text-xs uppercase tracking-[0.35em] text-content-muted'>
                      {data.degrees}°
                    </span>
                  </div>
                  <div>
                    <Heading as='h3' variant='h3'>
                      {summary.name}
                    </Heading>
                    <p className='text-xs uppercase tracking-[0.35em] text-content-muted'>
                      {summary.type}
                    </p>
                  </div>
                  <p className='text-sm text-content-secondary'>
                    {summary.description}
                  </p>
                  <p className='text-sm text-content-secondary'>
                    {summary.tip}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        <p className='text-xs capitalize tracking-[0.35em] text-content-muted'>
          The chart updates whenever the sky shifts, while this explanation
          keeps the context evergreen. Refresh to catch new aspects and bookmark
          the page as your live transit reference.
        </p>
      </section>
    </SEOContentTemplate>
  );
}
