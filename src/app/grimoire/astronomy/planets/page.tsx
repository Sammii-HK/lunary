import { Metadata } from 'next';
import Link from 'next/link';
import { Orbit } from 'lucide-react';
import {
  PLANETS,
  PLANET_DISPLAY,
  PLANET_SYMBOLS,
} from '@/constants/seo/aspects';

export const metadata: Metadata = {
  title: 'Astronomical Planets: Celestial Bodies Guide | Lunary',
  description:
    'Explore the astronomical properties of planets in our solar system. Learn about their orbits, characteristics, and significance.',
  keywords: [
    'planets',
    'astronomy',
    'solar system',
    'celestial bodies',
    'planetary science',
  ],
  openGraph: {
    title: 'Astronomical Planets | Lunary',
    description:
      'Explore the astronomical properties of planets in our solar system.',
    url: 'https://lunary.app/grimoire/astronomy/planets',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/astronomy/planets',
  },
};

export default function AstronomyPlanetsIndexPage() {
  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <div className='max-w-5xl mx-auto'>
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <Orbit className='w-16 h-16 text-lunary-primary-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Astronomical Planets
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            The celestial bodies that move through our solar system and form the
            basis of astrological interpretation.
          </p>
        </div>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            The Wandering Stars
          </h2>
          <p className='text-zinc-400'>
            The word &quot;planet&quot; comes from the Greek
            &quot;planetes,&quot; meaning wanderer. Ancient astronomers noticed
            these celestial bodies moved differently from fixed stars. In
            astrology, we include the Sun and Moon as &quot;planets&quot; for
            their significance in chart interpretation.
          </p>
        </div>

        <section className='mb-12'>
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4'>
            {PLANETS.map((planet) => (
              <Link
                key={planet}
                href={`/grimoire/astronomy/planets/${planet}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all text-center'
              >
                <div className='text-3xl mb-2'>{PLANET_SYMBOLS[planet]}</div>
                <h3 className='font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                  {PLANET_DISPLAY[planet]}
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
              href='/grimoire/astronomy'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Astronomy Overview
            </Link>
            <Link
              href='/grimoire/planets'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Astrological Planets
            </Link>
            <Link
              href='/grimoire/retrogrades'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Retrogrades
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
