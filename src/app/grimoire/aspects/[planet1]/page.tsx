import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Circle } from 'lucide-react';
import {
  PLANETS,
  PLANET_DISPLAY,
  PLANET_SYMBOLS,
  Planet,
} from '@/constants/seo/aspects';

const ASPECTS = ['conjunction', 'opposition', 'trine', 'square', 'sextile'];
const aspectSymbols: Record<string, string> = {
  conjunction: '☌',
  opposition: '☍',
  trine: '△',
  square: '□',
  sextile: '⚹',
};

export async function generateStaticParams() {
  return PLANETS.map((planet) => ({ planet1: planet }));
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
  const description = `Explore all major aspects involving ${planetName}. Learn about ${planetName} conjunctions, oppositions, trines, squares, and sextiles.`;

  return {
    title,
    description,
    keywords: [
      `${planetName.toLowerCase()} aspects`,
      `${planetName.toLowerCase()} conjunction`,
      `${planetName.toLowerCase()} opposition`,
      `${planetName.toLowerCase()} astrology`,
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

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <div className='max-w-5xl mx-auto'>
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <span className='text-6xl'>{symbol}</span>
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            {planetName} Aspects
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            Explore how {planetName} interacts with other planets through the
            five major aspects in astrology.
          </p>
        </div>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            {planetName} in Aspect
          </h2>
          <p className='text-zinc-400'>
            Aspects are angular relationships between planets that describe how
            their energies interact. Select an aspect type to explore{' '}
            {planetName}&apos;s relationships with other planets.
          </p>
        </div>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Aspect Types
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {ASPECTS.map((aspect) => (
              <Link
                key={aspect}
                href={`/grimoire/aspects/${planet1}/${aspect}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all'
              >
                <div className='flex items-center gap-4 mb-2'>
                  <span className='text-3xl'>{aspectSymbols[aspect]}</span>
                  <h3 className='text-lg font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors capitalize'>
                    {planetName} {aspect}s
                  </h3>
                </div>
                <p className='text-sm text-zinc-400'>
                  View all {planetName} {aspect} aspects with other planets
                </p>
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
              href='/grimoire/aspects'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              All Aspects
            </Link>
            <Link
              href='/grimoire/aspects/types'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Aspect Types
            </Link>
            <Link
              href='/grimoire/astronomy/planets'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              All Planets
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
