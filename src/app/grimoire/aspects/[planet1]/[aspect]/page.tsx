import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';

import {
  PLANETS,
  PLANET_DISPLAY,
  PLANET_SYMBOLS,
  Planet,
} from '@/constants/seo/aspects';
import { GrimoireBreadcrumbs } from '@/components/grimoire/GrimoireBreadcrumbs';

const ASPECTS = [
  'conjunction',
  'opposition',
  'trine',
  'square',
  'sextile',
] as const;
type Aspect = (typeof ASPECTS)[number];

const aspectSymbols: Record<Aspect, string> = {
  conjunction: '☌',
  opposition: '☍',
  trine: '△',
  square: '□',
  sextile: '⚹',
};

const aspectDescriptions: Record<Aspect, string> = {
  conjunction: 'merging and intensifying',
  opposition: 'balancing and polarizing',
  trine: 'harmonizing and flowing',
  square: 'challenging and motivating',
  sextile: 'opportunistic and cooperative',
};

export async function generateStaticParams() {
  const params: { planet1: string; aspect: string }[] = [];
  for (const planet of PLANETS) {
    for (const aspect of ASPECTS) {
      params.push({ planet1: planet, aspect });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ planet1: string; aspect: string }>;
}): Promise<Metadata> {
  const { planet1, aspect } = await params;

  if (
    !PLANETS.includes(planet1 as Planet) ||
    !ASPECTS.includes(aspect as Aspect)
  ) {
    return { title: 'Aspect Not Found | Lunary' };
  }

  const planetName = PLANET_DISPLAY[planet1 as Planet];
  const title = `${planetName} ${aspect.charAt(0).toUpperCase() + aspect.slice(1)}: All Combinations | Lunary`;
  const description = `Explore all ${planetName} ${aspect} aspects with other planets. Learn how ${planetName}'s ${aspectDescriptions[aspect as Aspect]} energy works.`;

  return {
    title,
    description,
    keywords: [
      `${planetName.toLowerCase()} ${aspect}`,
      `${aspect} aspects`,
      `${planetName.toLowerCase()} aspects`,
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/aspects/${planet1}/${aspect}`,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/aspects/${planet1}/${aspect}`,
    },
  };
}

export default async function PlanetAspectTypePage({
  params,
}: {
  params: Promise<{ planet1: string; aspect: string }>;
}) {
  const { planet1, aspect } = await params;

  if (
    !PLANETS.includes(planet1 as Planet) ||
    !ASPECTS.includes(aspect as Aspect)
  ) {
    notFound();
  }

  const planetName = PLANET_DISPLAY[planet1 as Planet];
  const symbol = PLANET_SYMBOLS[planet1 as Planet];
  const aspectSymbol = aspectSymbols[aspect as Aspect];
  const otherPlanets = PLANETS.filter((p) => p !== planet1);

  const breadcrumbItems = [
    { name: 'Grimoire', url: '/grimoire' },
    { name: 'Aspects', url: '/grimoire/aspects' },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <GrimoireBreadcrumbs items={breadcrumbItems} />
      <div className='max-w-5xl mx-auto'>
        <div className='text-center mb-12'>
          <div className='flex justify-center items-center gap-4 mb-4'>
            <span className='text-5xl'>{symbol}</span>
            <span className='text-3xl text-zinc-400'>{aspectSymbol}</span>
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            {planetName} {aspect.charAt(0).toUpperCase() + aspect.slice(1)}{' '}
            Aspects
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            Explore how {planetName} forms {aspect} aspects with other planets,
            creating {aspectDescriptions[aspect as Aspect]} energy.
          </p>
        </div>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            {planetName} {aspect.charAt(0).toUpperCase() + aspect.slice(1)}{' '}
            Combinations
          </h2>
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
            {otherPlanets.map((planet2) => (
              <Link
                key={planet2}
                href={`/grimoire/aspects/${planet1}/${aspect}/${planet2}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all text-center'
              >
                <div className='flex items-center justify-center gap-2 mb-2'>
                  <span className='text-2xl'>{symbol}</span>
                  <span className='text-lg text-zinc-400'>{aspectSymbol}</span>
                  <span className='text-2xl'>
                    {PLANET_SYMBOLS[planet2 as Planet]}
                  </span>
                </div>
                <h3 className='font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors text-sm'>
                  {planetName}{' '}
                  {aspect.charAt(0).toUpperCase() + aspect.slice(1)}{' '}
                  {PLANET_DISPLAY[planet2 as Planet]}
                </h3>
              </Link>
            ))}
          </div>
        </section>

        <div className='border-t border-zinc-800 pt-8'>
          <h3 className='text-lg font-medium text-zinc-100 mb-4'>
            Related Resources
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href={`/grimoire/aspects/${planet1}`}
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              All {planetName} Aspects
            </Link>
            <Link
              href={`/grimoire/aspects/types/${aspect}`}
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              About {aspect.charAt(0).toUpperCase() + aspect.slice(1)}s
            </Link>
            <Link
              href='/grimoire/aspects'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              All Aspects
            </Link>
          </div>
        </div>
        <ExploreGrimoire />
      </div>
    </div>
  );
}
