import { Metadata } from 'next';
import Link from 'next/link';
import {
  planetDescriptions,
  signDescriptions,
} from '@/constants/seo/planet-sign-content';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';

export const metadata: Metadata = {
  title:
    'Astrological Placements: Sun, Moon & Rising in Every Sign: Planet in Sign Meanings - Lunary',
  description:
    'Complete guide to astrological placements. Explore what each planet means in every zodiac sign. 144+ detailed interpretations for your birth chart analysis.',
  openGraph: {
    title: 'Astrological Placements: Sun, Moon & Rising in Every Sign - Lunary',
    description: 'Explore 144+ planet-in-sign combinations and their meanings.',
    url: 'https://lunary.app/grimoire/placements',
    images: [
      {
        url: '/api/og/grimoire/placements',
        width: 1200,
        height: 630,
        alt: 'Astrological Placements Guide - Lunary',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Astrological Placements: Sun, Moon & Rising in Every Sign - Lunary',
    description: 'Explore 144+ planet-in-sign combinations and their meanings.',
    images: ['/api/og/grimoire/placements'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/placements',
  },
};

export default function PlacementsIndexPage() {
  const planets = Object.entries(planetDescriptions);
  const signs = Object.entries(signDescriptions);

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <div className='max-w-6xl mx-auto px-4 py-12'>
        {/* Header */}
        <div className='mb-12'>
          <nav className='flex items-center gap-2 text-sm text-zinc-400 mb-4'>
            <Link href='/grimoire' className='hover:text-zinc-300'>
              Grimoire
            </Link>
            <span>/</span>
            <span className='text-zinc-400'>Placements</span>
          </nav>
          <h1 className='text-4xl font-light text-zinc-100 mb-4'>
            Astrological Placements: Sun, Moon & Rising in Every Sign
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl'>
            Explore what each planet means in every zodiac sign. Click any
            combination to learn about its influence on personality, strengths,
            and challenges.
          </p>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-3 gap-4 mb-12 max-w-md'>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
            <div className='text-3xl font-light text-lunary-primary-400'>
              {planets.length}
            </div>
            <div className='text-sm text-zinc-400'>Planets</div>
          </div>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
            <div className='text-3xl font-light text-lunary-primary-400'>
              {signs.length}
            </div>
            <div className='text-sm text-zinc-400'>Signs</div>
          </div>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
            <div className='text-3xl font-light text-lunary-primary-400'>
              {planets.length * signs.length}
            </div>
            <div className='text-sm text-zinc-400'>Combinations</div>
          </div>
        </div>

        {/* Planet Sections */}
        <div className='space-y-12'>
          {planets.map(([planetKey, planet]) => (
            <section
              key={planetKey}
              id={`${planetKey}-placements`}
              className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/30'
            >
              <div className='mb-6'>
                <h2 className='text-2xl font-medium text-zinc-100 mb-2'>
                  {planet.name} Placements
                </h2>
                <p className='text-zinc-400 text-sm'>
                  {planet.name} governs {planet.themes}. Rules {planet.rules}.
                </p>
              </div>
              <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2'>
                {signs.map(([signKey, sign]) => (
                  <Link
                    key={signKey}
                    href={`/grimoire/placements/${planetKey}-in-${signKey}`}
                    className='p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 hover:border-lunary-primary-600 transition-colors text-center group'
                  >
                    <div className='text-lg mb-1'>
                      {sign.element === 'Fire'
                        ? '🔥'
                        : sign.element === 'Earth'
                          ? '🌍'
                          : sign.element === 'Air'
                            ? '💨'
                            : '💧'}
                    </div>
                    <div className='text-sm text-zinc-300 group-hover:text-lunary-primary-300 transition-colors'>
                      {sign.name}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Sign Quick Links */}
        <section className='mt-12 p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Browse by Zodiac Sign
          </h2>
          <div className='flex flex-wrap gap-3'>
            {signs.map(([signKey, sign]) => (
              <Link
                key={signKey}
                href={`/grimoire/zodiac/${signKey}`}
                className='px-4 py-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 hover:text-lunary-primary-300 text-sm transition-colors'
              >
                {sign.name}
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className='mt-12 text-center'>
          <Link
            href='/birth-chart'
            className='inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 font-medium text-lg transition-colors'
          >
            Discover Your Placements
          </Link>
          <p className='mt-3 text-sm text-zinc-400'>
            Generate your complete birth chart to see all your planetary
            placements
          </p>
        </section>

        <ExploreGrimoire />
      </div>
    </div>
  );
}
