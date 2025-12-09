import { Metadata } from 'next';
import Link from 'next/link';
import { ZODIAC_CUSPS, getCuspData, CuspId } from '@/constants/seo/cusps';

export const metadata: Metadata = {
  title: 'Zodiac Cusps: All 12 Cusp Signs Explained | Lunary',
  description:
    'Complete guide to zodiac cusps. Born on the cusp of two signs? Learn about the Cusp of Power, Magic, Rebirth, and more. Find your cusp personality.',
  keywords: [
    'zodiac cusp',
    'cusp signs',
    'born on the cusp',
    'cusp personality',
    'aries taurus cusp',
    'pisces aries cusp',
  ],
  alternates: { canonical: 'https://lunary.app/grimoire/cusps' },
};

export default function CuspsIndexPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <div className='max-w-6xl mx-auto px-4 py-12'>
        <nav className='text-sm text-zinc-500 mb-8'>
          <Link href='/grimoire' className='hover:text-zinc-300'>
            Grimoire
          </Link>
          <span className='mx-2'>/</span>
          <span className='text-zinc-300'>Cusps</span>
        </nav>

        <h1 className='text-4xl font-light mb-4'>Zodiac Cusps</h1>
        <p className='text-lg text-zinc-400 mb-8 max-w-3xl'>
          Born on the border between two zodiac signs? You may be a cusp baby,
          blending the energies of both signs into a unique personality.
          Discover your cusp type.
        </p>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12'>
          {ZODIAC_CUSPS.map((cusp) => {
            const data = getCuspData(cusp.id as CuspId);
            return (
              <Link
                key={cusp.id}
                href={`/grimoire/cusps/${cusp.id}`}
                className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
              >
                <div className='text-sm text-lunary-primary-400 mb-1'>
                  {data.dates}
                </div>
                <h3 className='text-lg font-medium mb-1 group-hover:text-lunary-primary-300 transition-colors'>
                  {data.sign1}-{data.sign2} Cusp
                </h3>
                <div className='text-zinc-300 mb-2'>The {data.name}</div>
                <div className='text-sm text-zinc-500'>
                  {data.element1} + {data.element2}
                </div>
              </Link>
            );
          })}
        </div>

        <div className='p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
          <h2 className='text-xl font-medium text-lunary-primary-300 mb-2'>
            Are You a Cusp Baby?
          </h2>
          <p className='text-zinc-300 mb-4'>
            Enter your birth details to see if you were born on a cusp and which
            one.
          </p>
          <Link
            href='/birth-chart'
            className='inline-flex px-6 py-3 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 font-medium transition-colors'
          >
            Check Your Birth Chart
          </Link>
        </div>
      </div>
    </div>
  );
}
