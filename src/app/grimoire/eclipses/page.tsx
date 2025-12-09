import { Metadata } from 'next';
import Link from 'next/link';
import { Sun, Moon as MoonIcon } from 'lucide-react';

const eclipseTypes = [
  {
    slug: 'solar',
    name: 'Solar Eclipse',
    icon: <Sun className='w-8 h-8' />,
    description: 'New Moon eclipses - powerful new beginnings',
    themes: [
      'New beginnings',
      'Major life changes',
      'Fresh starts',
      'External manifestation',
    ],
    occurs: 'When the Moon passes between Earth and Sun',
    energy: 'Outward, active, manifest',
  },
  {
    slug: 'lunar',
    name: 'Lunar Eclipse',
    icon: <MoonIcon className='w-8 h-8' />,
    description: 'Full Moon eclipses - powerful releases and revelations',
    themes: [
      'Endings',
      'Revelations',
      'Emotional release',
      'Internal transformation',
    ],
    occurs: 'When Earth passes between Sun and Moon',
    energy: 'Inward, reflective, releasing',
  },
];

export const metadata: Metadata = {
  title: 'Solar & Lunar Eclipses: Complete Guide | Lunary',
  description:
    'Understand the spiritual and astrological significance of solar and lunar eclipses. Learn how eclipse energy affects you and how to work with it.',
  keywords: [
    'solar eclipse',
    'lunar eclipse',
    'eclipse astrology',
    'eclipse meaning',
    'eclipse effects',
  ],
  openGraph: {
    title: 'Eclipses Guide | Lunary',
    description:
      'Understand the spiritual significance of solar and lunar eclipses.',
    url: 'https://lunary.app/grimoire/eclipses',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/eclipses',
  },
};

export default function EclipsesIndexPage() {
  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <div className='max-w-5xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-12'>
          <div className='flex justify-center gap-2 mb-4'>
            <Sun className='w-16 h-16 text-amber-400' />
            <MoonIcon className='w-16 h-16 text-zinc-300' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Eclipses
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            Eclipses are powerful cosmic events that mark significant turning
            points. They accelerate change and catalyze transformation in our
            lives.
          </p>
        </div>

        {/* Introduction */}
        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Understanding Eclipses
          </h2>
          <p className='text-zinc-400 mb-4'>
            Eclipses occur when the Sun, Moon, and Earth align. They happen in
            pairs or sometimes trios, with a solar and lunar eclipse occurring
            about two weeks apart. Eclipse seasons happen roughly every 6
            months.
          </p>
          <p className='text-zinc-400'>
            In astrology, eclipses are like cosmic wild cards — they can bring
            sudden changes, revelations, or new paths. Events set in motion
            during eclipses often unfold over the following 6 months.
          </p>
        </div>

        {/* Eclipse Types */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Types of Eclipses
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {eclipseTypes.map((eclipse) => (
              <Link
                key={eclipse.slug}
                href={`/grimoire/eclipses/${eclipse.slug}`}
                className={`group rounded-xl border p-6 transition-all ${
                  eclipse.slug === 'solar'
                    ? 'border-amber-900/50 bg-amber-950/20 hover:bg-amber-950/30 hover:border-amber-600'
                    : 'border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900/70 hover:border-zinc-500'
                }`}
              >
                <div className='flex items-center gap-4 mb-4'>
                  <span
                    className={
                      eclipse.slug === 'solar'
                        ? 'text-amber-400'
                        : 'text-zinc-300'
                    }
                  >
                    {eclipse.icon}
                  </span>
                  <h3
                    className={`text-xl font-medium ${
                      eclipse.slug === 'solar'
                        ? 'text-zinc-100 group-hover:text-amber-300'
                        : 'text-zinc-100 group-hover:text-zinc-200'
                    } transition-colors`}
                  >
                    {eclipse.name}
                  </h3>
                </div>
                <p className='text-zinc-400 mb-3'>{eclipse.description}</p>
                <div className='text-sm text-zinc-500 mb-3'>
                  <span className='font-medium text-zinc-400'>Occurs: </span>
                  {eclipse.occurs}
                </div>
                <div className='text-sm text-zinc-500 mb-4'>
                  <span className='font-medium text-zinc-400'>Energy: </span>
                  {eclipse.energy}
                </div>
                <div className='flex flex-wrap gap-2'>
                  {eclipse.themes.map((theme) => (
                    <span
                      key={theme}
                      className={`text-xs px-2 py-1 rounded ${
                        eclipse.slug === 'solar'
                          ? 'bg-amber-900/30 text-amber-300/70'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Working with Eclipses */}
        <section className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Working with Eclipse Energy
          </h2>
          <ul className='space-y-3 text-zinc-400'>
            <li className='flex gap-3'>
              <span className='text-lunary-primary-400'>•</span>
              <span>
                <strong className='text-zinc-200'>
                  Don&apos;t manifest during eclipses:
                </strong>{' '}
                The energy is too chaotic. Observe what unfolds instead.
              </span>
            </li>
            <li className='flex gap-3'>
              <span className='text-lunary-primary-400'>•</span>
              <span>
                <strong className='text-zinc-200'>
                  Pay attention to themes:
                </strong>{' '}
                Notice what comes up 2 weeks before and after an eclipse.
              </span>
            </li>
            <li className='flex gap-3'>
              <span className='text-lunary-primary-400'>•</span>
              <span>
                <strong className='text-zinc-200'>Check your chart:</strong>{' '}
                Eclipses hitting personal planets bring more noticeable effects.
              </span>
            </li>
            <li className='flex gap-3'>
              <span className='text-lunary-primary-400'>•</span>
              <span>
                <strong className='text-zinc-200'>Stay flexible:</strong>{' '}
                Eclipses can bring unexpected changes — go with the flow.
              </span>
            </li>
          </ul>
        </section>

        {/* Related Links */}
        <div className='border-t border-zinc-800 pt-8'>
          <h3 className='text-lg font-medium text-zinc-100 mb-4'>
            Explore More
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/events'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Astrological Events
            </Link>
            <Link
              href='/grimoire/lunar-nodes'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Lunar Nodes
            </Link>
            <Link
              href='/grimoire/moon/phases'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Moon Phases
            </Link>
            <Link
              href='/grimoire/transits'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Transits
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
