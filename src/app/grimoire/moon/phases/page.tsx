import { Metadata } from 'next';
import Link from 'next/link';
import { Moon as MoonIcon } from 'lucide-react';

const moonPhases = [
  {
    slug: 'new-moon',
    name: 'New Moon',
    symbol: '🌑',
    description: 'New beginnings, setting intentions, planting seeds',
  },
  {
    slug: 'waxing-crescent',
    name: 'Waxing Crescent',
    symbol: '🌒',
    description: 'Taking action, building momentum, growth',
  },
  {
    slug: 'first-quarter',
    name: 'First Quarter',
    symbol: '🌓',
    description: 'Decision making, overcoming obstacles, determination',
  },
  {
    slug: 'waxing-gibbous',
    name: 'Waxing Gibbous',
    symbol: '🌔',
    description: 'Refinement, patience, building energy',
  },
  {
    slug: 'full-moon',
    name: 'Full Moon',
    symbol: '🌕',
    description: 'Manifestation, completion, heightened intuition',
  },
  {
    slug: 'waning-gibbous',
    name: 'Waning Gibbous',
    symbol: '🌖',
    description: 'Gratitude, sharing wisdom, introspection',
  },
  {
    slug: 'third-quarter',
    name: 'Third Quarter',
    symbol: '🌗',
    description: 'Release, forgiveness, letting go',
  },
  {
    slug: 'waning-crescent',
    name: 'Waning Crescent',
    symbol: '🌘',
    description: 'Rest, surrender, preparation for renewal',
  },
];

export const metadata: Metadata = {
  title: 'Moon Phases: Complete Guide to Lunar Cycles | Lunary',
  description:
    'Explore all 8 moon phases from New Moon to Waning Crescent. Learn the meaning, energy, and rituals for each phase of the lunar cycle.',
  keywords: [
    'moon phases',
    'lunar cycle',
    'new moon',
    'full moon',
    'waxing moon',
    'waning moon',
  ],
  openGraph: {
    title: 'Moon Phases Guide | Lunary',
    description: 'Explore all 8 moon phases and their meanings.',
    url: 'https://lunary.app/grimoire/moon/phases',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/moon/phases',
  },
};

export default function MoonPhasesIndexPage() {
  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <div className='max-w-5xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <MoonIcon className='w-16 h-16 text-zinc-300' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Moon Phases
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            The moon moves through 8 distinct phases every 29.5 days. Each phase
            carries unique energy perfect for different activities, rituals, and
            intentions.
          </p>
        </div>

        {/* Introduction */}
        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Understanding the Lunar Cycle
          </h2>
          <p className='text-zinc-400 mb-4'>
            The lunar cycle is one of nature&apos;s most powerful rhythms. From
            the dark of the New Moon to the brightness of the Full Moon and back
            again, each phase offers different energy to work with.
          </p>
          <p className='text-zinc-400'>
            By aligning your activities with the moon&apos;s phases, you can
            harness natural rhythms to support manifestation, release, and
            transformation.
          </p>
        </div>

        {/* Moon Phases Grid */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            The Eight Moon Phases
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {moonPhases.map((phase) => (
              <Link
                key={phase.slug}
                href={`/grimoire/moon/phases/${phase.slug}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-zinc-600 transition-all'
              >
                <div className='flex items-center gap-4 mb-3'>
                  <span className='text-4xl'>{phase.symbol}</span>
                  <h3 className='text-xl font-medium text-zinc-100 group-hover:text-zinc-200 transition-colors'>
                    {phase.name}
                  </h3>
                </div>
                <p className='text-sm text-zinc-500'>{phase.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Related Links */}
        <div className='border-t border-zinc-800 pt-8'>
          <h3 className='text-lg font-medium text-zinc-100 mb-4'>
            Explore More Moon Topics
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/moon/full-moons'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Full Moon Names
            </Link>
            <Link
              href='/grimoire/moon-signs'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Moon Signs
            </Link>
            <Link
              href='/grimoire/moon-rituals'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Moon Rituals
            </Link>
            <Link
              href='/grimoire/eclipses'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Eclipses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
