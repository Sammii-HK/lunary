import { Metadata } from 'next';
import Link from 'next/link';
import { Compass } from 'lucide-react';

const houses = [
  { number: 1, name: 'First House', theme: 'Self & Identity' },
  { number: 2, name: 'Second House', theme: 'Resources & Values' },
  { number: 3, name: 'Third House', theme: 'Communication' },
  { number: 4, name: 'Fourth House', theme: 'Home & Family' },
  { number: 5, name: 'Fifth House', theme: 'Creativity & Pleasure' },
  { number: 6, name: 'Sixth House', theme: 'Health & Service' },
  { number: 7, name: 'Seventh House', theme: 'Partnerships' },
  { number: 8, name: 'Eighth House', theme: 'Transformation' },
  { number: 9, name: 'Ninth House', theme: 'Philosophy & Travel' },
  { number: 10, name: 'Tenth House', theme: 'Career & Status' },
  { number: 11, name: 'Eleventh House', theme: 'Community & Dreams' },
  { number: 12, name: 'Twelfth House', theme: 'Spirituality & Hidden' },
];

const houseSlugMap: Record<number, string> = {
  1: 'first',
  2: 'second',
  3: 'third',
  4: 'fourth',
  5: 'fifth',
  6: 'sixth',
  7: 'seventh',
  8: 'eighth',
  9: 'ninth',
  10: 'tenth',
  11: 'eleventh',
  12: 'twelfth',
};

export const metadata: Metadata = {
  title: 'Houses in Your Birth Chart | Lunary',
  description:
    'Learn about the 12 houses in your birth chart. Understand how each house represents different areas of life and experiences.',
  keywords: [
    'birth chart houses',
    'natal houses',
    '12 houses',
    'astrological houses',
    'chart interpretation',
  ],
  openGraph: {
    title: 'Birth Chart Houses | Lunary',
    description:
      'Learn about the 12 houses and how they appear in your birth chart.',
    url: 'https://lunary.app/grimoire/birth-chart/houses',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/birth-chart/houses',
  },
};

export default function BirthChartHousesIndexPage() {
  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <div className='max-w-5xl mx-auto'>
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <Compass className='w-16 h-16 text-lunary-primary-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Houses in Your Birth Chart
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            Your birth chart is divided into 12 houses, each governing different
            areas of life. Learn what each house reveals about you.
          </p>
        </div>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Reading Your Houses
          </h2>
          <p className='text-zinc-400'>
            In your birth chart, planets fall into different houses based on
            your birth time and location. The sign on each house cusp and
            planets within that house color how you experience that life area.
          </p>
        </div>

        <section className='mb-12'>
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
            {houses.map((house) => (
              <Link
                key={house.number}
                href={`/grimoire/birth-chart/houses/${houseSlugMap[house.number]}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all'
              >
                <div className='text-2xl font-light text-lunary-primary-400 mb-2'>
                  {house.number}
                </div>
                <h3 className='font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors text-sm'>
                  {house.name}
                </h3>
                <p className='text-xs text-zinc-400 mt-1'>{house.theme}</p>
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
              href='/grimoire/birth-chart'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Birth Chart Overview
            </Link>
            <Link
              href='/grimoire/houses'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Houses (General)
            </Link>
            <Link
              href='/birth-chart'
              className='px-4 py-2 rounded-lg bg-lunary-primary-900/30 text-lunary-primary-300 hover:bg-lunary-primary-900/50 transition-colors'
            >
              Calculate Your Chart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
