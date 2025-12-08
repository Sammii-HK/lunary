import { Metadata } from 'next';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { signDescriptions } from '@/constants/seo/planet-sign-content';

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
            <div className='text-3xl font-light text-pink-400'>12</div>
            <div className='text-sm text-zinc-500'>Signs</div>
          </div>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
            <div className='text-3xl font-light text-pink-400'>78</div>
            <div className='text-sm text-zinc-500'>Unique Pairs</div>
          </div>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center'>
            <div className='text-3xl font-light text-pink-400'>3</div>
            <div className='text-sm text-zinc-500'>Categories</div>
          </div>
        </div>

        {/* Compatibility Matrix */}
        <div className='mb-12 overflow-x-auto'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Compatibility Matrix
          </h2>
          <p className='text-zinc-400 text-sm mb-6'>
            Click any cell to see the full compatibility analysis
          </p>
          <div className='min-w-[800px]'>
            <table className='w-full border-collapse'>
              <thead>
                <tr>
                  <th className='p-2'></th>
                  {signs.map(([key, sign]) => (
                    <th
                      key={key}
                      className='p-2 text-xs text-zinc-400 font-medium'
                    >
                      {sign.name.slice(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {signs.map(([key1, sign1]) => (
                  <tr key={key1}>
                    <td className='p-2 text-xs text-zinc-400 font-medium'>
                      {sign1.name.slice(0, 3)}
                    </td>
                    {signs.map(([key2]) => {
                      const slug =
                        key1 <= key2
                          ? `${key1}-and-${key2}`
                          : `${key2}-and-${key1}`;
                      return (
                        <td key={key2} className='p-1'>
                          <Link
                            href={`/grimoire/compatibility/${slug}`}
                            className='block w-8 h-8 rounded bg-zinc-800 hover:bg-pink-500/30 hover:border-pink-500/50 border border-transparent transition-colors flex items-center justify-center'
                          >
                            <Heart className='h-3 w-3 text-zinc-600 hover:text-pink-400' />
                          </Link>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                      className='px-3 py-1.5 rounded-lg bg-zinc-800/50 hover:bg-pink-500/20 border border-zinc-700/50 hover:border-pink-500/50 text-zinc-300 hover:text-pink-300 text-sm transition-colors'
                    >
                      {sign1.name} & {sign2.name}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <section className='mt-12 text-center'>
          <Link
            href='/welcome'
            className='inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 text-pink-300 font-medium text-lg transition-colors'
          >
            <Heart className='h-5 w-5' />
            Get Your Synastry Reading
          </Link>
          <p className='mt-3 text-sm text-zinc-500'>
            Compare full birth charts for deeper compatibility insights
          </p>
        </section>
      </div>
    </div>
  );
}
