import { Metadata } from 'next';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { signDescriptions } from '@/constants/seo/planet-sign-content';
import { CompatibilityMatrix } from '@/components/CompatibilityMatrix';

const ZODIAC_SYMBOLS: Record<string, string> = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓',
};

export const metadata: Metadata = {
  title: 'Zodiac Compatibility Guide: Love & Relationship Matches - Lunary',
  description:
    'Complete zodiac compatibility guide. Explore love, friendship, and work compatibility between all 12 zodiac signs. 78+ detailed match analyses.',
  openGraph: {
    title: 'Zodiac Compatibility Guide - Lunary',
    description:
      'Explore compatibility between all 12 zodiac signs in love and relationships.',
    url: 'https://lunary.app/grimoire/compatibility',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/compatibility',
  },
};

export default function CompatibilityIndexPage() {
  const signs = Object.entries(signDescriptions);

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <div className='max-w-6xl mx-auto px-4 py-12'>
        {/* Header */}
        <div className='mb-12'>
          <nav className='flex items-center gap-2 text-sm text-zinc-500 mb-4'>
            <Link href='/grimoire' className='hover:text-zinc-300'>
              Grimoire
            </Link>
            <span>/</span>
            <span className='text-zinc-400'>Compatibility</span>
          </nav>
          <h1 className='text-4xl font-light text-zinc-100 mb-4'>
            Zodiac Compatibility Guide
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl'>
            Explore how zodiac signs interact in love, friendship, and work.
            Select two signs to see their compatibility analysis.
          </p>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-3 gap-4 mb-12 max-w-md'>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
            <div className='text-3xl font-light text-lunary-rose'>12</div>
            <div className='text-sm text-zinc-500'>Signs</div>
          </div>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
            <div className='text-3xl font-light text-lunary-rose'>78</div>
            <div className='text-sm text-zinc-500'>Unique Pairs</div>
          </div>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
            <div className='text-3xl font-light text-lunary-rose'>3</div>
            <div className='text-sm text-zinc-500'>Categories</div>
          </div>
        </div>

        {/* Compatibility Matrix */}
        <div className='mb-12 overflow-x-auto'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Compatibility Matrix
          </h2>
          <p className='text-zinc-400 text-sm mb-6'>
            Hover to highlight row and column. Click any cell to see the full
            compatibility analysis.
          </p>
          <CompatibilityMatrix signs={signs} />
        </div>

        {/* Browse by Sign */}
        <div className='space-y-8'>
          <h2 className='text-2xl font-medium text-zinc-100'>Browse by Sign</h2>
          {signs.map(([key1, sign1]) => (
            <section
              key={key1}
              className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/30'
            >
              <div className='flex items-center gap-3 mb-4'>
                <span className='text-2xl'>{ZODIAC_SYMBOLS[key1] || '⭐'}</span>
                <div>
                  <h3 className='text-xl font-medium text-zinc-100'>
                    {sign1.name} Compatibility
                  </h3>
                  <p className='text-sm text-zinc-500'>
                    {sign1.element} • {sign1.modality}
                  </p>
                </div>
              </div>
              <div className='flex flex-wrap gap-2'>
                {signs.map(([key2, sign2]) => {
                  const slug =
                    key1 <= key2
                      ? `${key1}-and-${key2}`
                      : `${key2}-and-${key1}`;
                  return (
                    <Link
                      key={key2}
                      href={`/grimoire/compatibility/${slug}`}
                      className='px-3 py-1.5 rounded-lg bg-zinc-800/50 hover:bg-lunary-rose-900 border border-zinc-700/50 hover:border-lunary-rose-600 text-zinc-300 hover:text-lunary-rose-300 text-sm transition-colors'
                    >
                      {sign1.name} & {sign2.name}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Synastry CTA */}
        <section className='mt-12'>
          <Link
            href='/grimoire/synastry/generate'
            className='block p-6 rounded-lg bg-gradient-to-r from-lunary-rose-900/30 to-lunary-primary-900/30 border border-lunary-rose-700 hover:border-lunary-rose-500 transition-colors group'
          >
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-xl font-medium text-lunary-rose-300 group-hover:text-lunary-rose-200 transition-colors flex items-center gap-2'>
                  <Heart className='h-5 w-5' />
                  Generate Synastry Chart
                </h3>
                <p className='text-zinc-400 mt-1'>
                  Compare two birth charts to discover deep compatibility,
                  strengths, and growth areas
                </p>
              </div>
              <span className='text-lunary-rose-400 group-hover:text-lunary-rose-300 transition-colors text-2xl'>
                →
              </span>
            </div>
          </Link>
        </section>

        {/* Birth Chart CTA */}
        <section className='mt-6 text-center'>
          <Link
            href='/birth-chart'
            className='inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-zinc-100 transition-colors'
          >
            View Your Birth Chart
          </Link>
          <p className='mt-3 text-sm text-zinc-500'>
            Understand your complete astrological profile
          </p>
        </section>
      </div>
    </div>
  );
}
