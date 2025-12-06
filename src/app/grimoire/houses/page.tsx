import { Metadata } from 'next';
import Link from 'next/link';
import {
  HOUSES,
  HOUSE_DATA,
  PLANETS_FOR_HOUSES,
  PLANET_HOUSE_DISPLAY,
  getOrdinalSuffix,
} from '@/constants/seo/houses';

export const metadata: Metadata = {
  title: 'The 12 Astrological Houses: Complete Guide | Lunary',
  description:
    'Complete guide to the 12 houses in astrology. Learn what each house represents, from identity (1st) to spirituality (12th), and how planet placements affect you.',
  keywords: [
    'astrological houses',
    '12 houses',
    'natal chart houses',
    'house meanings',
    'planets in houses',
  ],
  alternates: { canonical: 'https://lunary.app/grimoire/houses' },
};

export default function HousesIndexPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <div className='max-w-6xl mx-auto px-4 py-12'>
        <nav className='text-sm text-zinc-500 mb-8'>
          <Link href='/grimoire' className='hover:text-zinc-300'>
            Grimoire
          </Link>
          <span className='mx-2'>/</span>
          <span className='text-zinc-300'>Houses</span>
        </nav>

        <h1 className='text-4xl font-light mb-4'>The 12 Astrological Houses</h1>
        <p className='text-lg text-zinc-400 mb-8 max-w-3xl'>
          The houses in astrology represent different areas of life, from self
          and identity to spirituality and the unconscious. Each house is a
          stage where planets perform their roles.
        </p>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12'>
          {HOUSES.map((house) => {
            const data = HOUSE_DATA[house];
            return (
              <div
                key={house}
                className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'
              >
                <div className='flex items-center gap-3 mb-3'>
                  <span className='text-3xl font-light text-purple-400'>
                    {house}
                  </span>
                  <span className='text-xs text-zinc-500'>
                    {data.naturalSign}
                  </span>
                </div>
                <h3 className='text-lg font-medium mb-1'>{data.name}</h3>
                <p className='text-sm text-zinc-400 mb-2'>{data.lifeArea}</p>
                <p className='text-xs text-zinc-500'>
                  {data.keywords.join(' • ')}
                </p>
              </div>
            );
          })}
        </div>

        <h2 className='text-2xl font-light mb-6'>Planets in Houses</h2>
        <div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-12'>
          {PLANETS_FOR_HOUSES.slice(0, 10).map((planet) => (
            <Link
              key={planet}
              href={`/grimoire/houses/${planet}/1`}
              className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-purple-500/50 transition-all text-center group'
            >
              <div className='font-medium group-hover:text-purple-300 transition-colors'>
                {PLANET_HOUSE_DISPLAY[planet]}
              </div>
              <div className='text-xs text-zinc-500'>in houses</div>
            </Link>
          ))}
        </div>

        <div className='p-6 rounded-lg border border-purple-500/30 bg-purple-500/10'>
          <h2 className='text-xl font-medium text-purple-300 mb-2'>
            Discover Your House Placements
          </h2>
          <p className='text-zinc-300 mb-4'>
            Find out which planets are in which houses in your natal chart.
          </p>
          <Link
            href='/welcome'
            className='inline-flex px-6 py-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 font-medium transition-colors'
          >
            Generate Your Birth Chart
          </Link>
        </div>
      </div>
    </div>
  );
}
