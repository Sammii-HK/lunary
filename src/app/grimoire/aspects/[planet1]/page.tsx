import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';

import {
  PLANETS,
  ASPECTS,
  ASPECT_DATA,
  PLANET_DISPLAY,
  PLANET_SYMBOLS,
  Planet,
  Aspect,
} from '@/constants/seo/aspects';
import { GrimoireBreadcrumbs } from '@/components/grimoire/GrimoireBreadcrumbs';

// 30-day ISR revalidation
export const revalidate = 2592000;
export const dynamicParams = false;

const PLANET_METHOD: Record<Planet, string> = {
  sun: 'identity, vitality, visibility, and the conscious direction of the chart',
  moon: 'instinct, memory, emotional regulation, and the body-level need for safety',
  mercury:
    'perception, speech, learning, interpretation, and everyday decision making',
  venus:
    'attachment, attraction, taste, values, money patterns, and relational ease',
  mars: 'drive, anger, courage, desire, conflict style, and how effort is mobilised',
  jupiter:
    'growth, faith, opportunity, teaching, travel, and the widening of perspective',
  saturn:
    'boundaries, discipline, fear, maturity, obligation, and long-term structure',
  uranus:
    'disruption, invention, liberation, surprise, and the need to break stale patterns',
  neptune:
    'imagination, longing, compassion, projection, spirituality, and dissolution',
  pluto:
    'power, compulsion, deep repair, shadow material, endings, and regeneration',
};

export function generateStaticParams() {
  return PLANETS.map((planet1) => ({ planet1 }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ planet1: string }>;
}): Promise<Metadata> {
  const { planet1 } = await params;

  if (!PLANETS.includes(planet1 as Planet)) {
    return { title: 'Planet Not Found | Lunary' };
  }

  const planetName = PLANET_DISPLAY[planet1 as Planet];
  const title = `${planetName} Aspects: All Major Aspects | Lunary`;
  const description = `Explore ${planetName} aspects by degree, orb, planet pairing, and chart context. Learn how ${planetName} aspects work in natal charts, transits, and synastry.`;

  return {
    title,
    description,
    keywords: [
      `${planetName.toLowerCase()} aspects`,
      `${planetName.toLowerCase()} conjunct`,
      `${planetName.toLowerCase()} opposite`,
      `${planetName.toLowerCase()} astrology`,
      `${planetName.toLowerCase()} aspect meanings`,
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/aspects/${planet1}`,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/aspects/${planet1}`,
    },
  };
}

export default async function PlanetAspectsPage({
  params,
}: {
  params: Promise<{ planet1: string }>;
}) {
  const { planet1 } = await params;

  if (!PLANETS.includes(planet1 as Planet)) {
    notFound();
  }

  const planetName = PLANET_DISPLAY[planet1 as Planet];
  const symbol = PLANET_SYMBOLS[planet1 as Planet];
  const planetMethod = PLANET_METHOD[planet1 as Planet];

  const breadcrumbItems = [
    { name: 'Grimoire', url: '/grimoire' },
    { name: 'Aspects', url: '/grimoire/aspects' },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <GrimoireBreadcrumbs items={breadcrumbItems} />
      <div className='max-w-5xl mx-auto'>
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <span className='text-6xl'>{symbol}</span>
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-content-primary mb-4'>
            {planetName} Aspects
          </h1>
          <p className='text-lg text-content-muted max-w-2xl mx-auto'>
            Explore how {planetName} interacts with other planets through
            angular distance, orb, sign condition, house placement, and timing.
          </p>
        </div>

        <div className='bg-surface-elevated/50 border border-stroke-subtle rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-content-primary mb-3'>
            How to Read {planetName} Aspects
          </h2>
          <p className='text-content-muted mb-4'>
            Aspects are measured angles between two planetary positions. In a
            chart, {planetName} describes {planetMethod}. The aspect shows
            whether that function merges, cooperates, strains, flows, adjusts,
            or polarises with another planet.
          </p>
          <div className='grid gap-3 md:grid-cols-3 text-sm text-content-muted'>
            <div className='rounded-lg border border-stroke-subtle bg-surface-card/40 p-4'>
              <h3 className='font-medium text-content-secondary mb-2'>
                1. Measure the Angle
              </h3>
              <p>
                Start with the zodiacal longitude between {planetName} and the
                other planet, then compare it with the exact aspect degree.
              </p>
            </div>
            <div className='rounded-lg border border-stroke-subtle bg-surface-card/40 p-4'>
              <h3 className='font-medium text-content-secondary mb-2'>
                2. Check the Chart Context
              </h3>
              <p>
                Read the signs, houses, rulers, and whether the aspect is natal,
                transiting, or between two charts.
              </p>
            </div>
            <div className='rounded-lg border border-stroke-subtle bg-surface-card/40 p-4'>
              <h3 className='font-medium text-content-secondary mb-2'>
                3. Synthesis Beats Keywords
              </h3>
              <p>
                Use keywords only as a starting point. The final meaning comes
                from how both planets behave in the whole chart.
              </p>
            </div>
          </div>
        </div>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-content-primary mb-6'>
            Aspect Types
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {ASPECTS.map((aspect) => {
              const aspectData = ASPECT_DATA[aspect as Aspect];

              return (
                <Link
                  key={aspect}
                  href={`/grimoire/aspects/${planet1}/${aspect}`}
                  className='group rounded-xl border border-stroke-subtle bg-surface-elevated/30 p-5 hover:bg-surface-elevated/50 hover:border-lunary-primary-600 transition-all'
                >
                  <div className='flex items-center gap-4 mb-2'>
                    <span className='text-3xl'>{aspectData.symbol}</span>
                    <h3 className='text-lg font-medium text-content-primary group-hover:text-content-brand transition-colors capitalize'>
                      {planetName} {aspectData.displayName}s
                    </h3>
                  </div>
                  <p className='text-sm text-content-muted'>
                    {aspectData.degrees}° {aspectData.nature} aspect:{' '}
                    {aspectData.keywords.join(', ')}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className='mb-12 rounded-xl border border-stroke-subtle bg-surface-elevated/40 p-6'>
          <h2 className='text-2xl font-medium text-content-primary mb-4'>
            Lunary Aspect Method
          </h2>
          <div className='space-y-4 text-content-muted'>
            <p>
              Lunary treats aspect interpretation as a calculation plus a
              synthesis problem: the measured angle tells you the aspect, the
              orb tells you how tightly it is operating, and the signs and
              houses explain where the pattern is expressed.
            </p>
            <p>
              Traditional aspect doctrine gives the basic geometry: conjunctions
              at 0 degrees, sextiles at 60, squares at 90, trines at 120,
              oppositions at 180, plus minor adjustments such as the quincunx
              and semisextile. The interpretation is then grounded in the
              planets involved, not copied as a generic paragraph.
            </p>
          </div>
        </section>

        <div className='border-t border-stroke-subtle pt-8'>
          <h3 className='text-lg font-medium text-content-primary mb-4'>
            Related Resources
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/aspects'
              className='px-4 py-2 rounded-lg bg-surface-card text-content-secondary hover:bg-surface-overlay transition-colors'
            >
              All Aspects
            </Link>
            <Link
              href='/grimoire/aspects/types'
              className='px-4 py-2 rounded-lg bg-surface-card text-content-secondary hover:bg-surface-overlay transition-colors'
            >
              Aspect Types
            </Link>
            <Link
              href='/grimoire/astronomy/planets'
              className='px-4 py-2 rounded-lg bg-surface-card text-content-secondary hover:bg-surface-overlay transition-colors'
            >
              All Planets
            </Link>
          </div>
        </div>
        <ExploreGrimoire />
      </div>
    </div>
  );
}
