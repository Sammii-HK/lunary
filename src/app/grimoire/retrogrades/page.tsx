import { Metadata } from 'next';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';

const retrogrades = [
  {
    slug: 'mercury',
    name: 'Mercury Retrograde',
    symbol: '☿',
    frequency: '3-4 times/year',
    duration: '~3 weeks',
    themes: 'Communication, travel, technology, contracts',
  },
  {
    slug: 'venus',
    name: 'Venus Retrograde',
    symbol: '♀',
    frequency: 'Every 18 months',
    duration: '~6 weeks',
    themes: 'Love, beauty, values, money, relationships',
  },
  {
    slug: 'mars',
    name: 'Mars Retrograde',
    symbol: '♂',
    frequency: 'Every 2 years',
    duration: '~2.5 months',
    themes: 'Action, energy, desire, anger, motivation',
  },
  {
    slug: 'jupiter',
    name: 'Jupiter Retrograde',
    symbol: '♃',
    frequency: 'Yearly',
    duration: '~4 months',
    themes: 'Growth, luck, expansion, beliefs, travel',
  },
  {
    slug: 'saturn',
    name: 'Saturn Retrograde',
    symbol: '♄',
    frequency: 'Yearly',
    duration: '~4.5 months',
    themes: 'Responsibility, structure, karma, limitations',
  },
  {
    slug: 'uranus',
    name: 'Uranus Retrograde',
    symbol: '♅',
    frequency: 'Yearly',
    duration: '~5 months',
    themes: 'Innovation, rebellion, change, technology',
  },
  {
    slug: 'neptune',
    name: 'Neptune Retrograde',
    symbol: '♆',
    frequency: 'Yearly',
    duration: '~5 months',
    themes: 'Dreams, illusions, spirituality, creativity',
  },
  {
    slug: 'pluto',
    name: 'Pluto Retrograde',
    symbol: '♇',
    frequency: 'Yearly',
    duration: '~5-6 months',
    themes: 'Transformation, power, death/rebirth, secrets',
  },
];

export const metadata: Metadata = {
  title: 'Planetary Retrogrades: Complete Guide | Lunary',
  description:
    'Understand all planetary retrogrades from Mercury to Pluto. Learn when they occur, how long they last, and how to navigate their energies.',
  keywords: [
    'planetary retrograde',
    'mercury retrograde',
    'venus retrograde',
    'retrograde meaning',
    'retrograde effects',
  ],
  openGraph: {
    title: 'Planetary Retrogrades Guide | Lunary',
    description:
      'Understand all planetary retrogrades and how to navigate their energies.',
    url: 'https://lunary.app/grimoire/retrogrades',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/retrogrades',
  },
};

export default function RetrogradesIndexPage() {
  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <div className='max-w-5xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <RotateCcw className='w-16 h-16 text-lunary-primary-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Planetary Retrogrades
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            When a planet appears to move backward in the sky, it&apos;s
            retrograde. Each planet&apos;s retrograde brings opportunities for
            review, reflection, and revision.
          </p>
        </div>

        {/* Introduction */}
        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            What is Retrograde?
          </h2>
          <p className='text-zinc-400 mb-4'>
            Retrograde is an optical illusion caused by the relative positions
            and speeds of Earth and other planets. When a planet is retrograde,
            its energy turns inward — a time for reflection rather than new
            beginnings.
          </p>
          <p className='text-zinc-400'>
            Rather than fearing retrogrades, use them as opportunities to
            revisit, revise, and reflect on the themes each planet represents.
          </p>
        </div>

        {/* Retrogrades Grid */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            All Planetary Retrogrades
          </h2>
          <div className='space-y-4'>
            {retrogrades.map((retrograde) => (
              <Link
                key={retrograde.slug}
                href={`/grimoire/retrogrades/${retrograde.slug}`}
                className='group flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all'
              >
                <div className='text-3xl font-astro text-lunary-primary-400'>
                  {retrograde.symbol}
                </div>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-1'>
                    <h3 className='text-xl font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                      {retrograde.name}
                    </h3>
                  </div>
                  <div className='flex gap-4 text-sm text-zinc-500 mb-2'>
                    <span>{retrograde.frequency}</span>
                    <span>•</span>
                    <span>{retrograde.duration}</span>
                  </div>
                  <p className='text-sm text-zinc-400'>
                    Themes: {retrograde.themes}
                  </p>
                </div>
                <div className='text-zinc-600 group-hover:text-lunary-primary-400 transition-colors'>
                  →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Related Links */}
        <div className='border-t border-zinc-800 pt-8'>
          <h3 className='text-lg font-medium text-zinc-100 mb-4'>
            Explore More Astrology
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/transits'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Transits
            </Link>
            <Link
              href='/grimoire/astronomy'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Astronomy
            </Link>
            <Link
              href='/grimoire/events'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Astrological Events
            </Link>
            <Link
              href='/grimoire/horoscopes'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Horoscopes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
