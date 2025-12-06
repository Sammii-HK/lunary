import { Metadata } from 'next';
import Link from 'next/link';
import {
  NUMEROLOGY_MEANINGS,
  getUniversalYear,
  getYearRange,
} from '@/constants/seo/numerology';

export const metadata: Metadata = {
  title: 'Numerology Guide: Universal Years & Number Meanings | Lunary',
  description:
    'Complete numerology guide. Learn about universal year meanings, personal year calculations, and how numbers influence your life. Find your numerology forecast.',
  keywords: [
    'numerology',
    'universal year',
    'personal year number',
    'numerology meaning',
    'number meanings',
    'numerology forecast',
    'life path number',
  ],
  openGraph: {
    title: 'Numerology Guide: Universal Years & Number Meanings',
    description: 'Complete guide to numerology and universal year meanings.',
    url: 'https://lunary.app/grimoire/numerology',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/numerology',
  },
};

const currentYear = new Date().getFullYear();
const currentUniversalYear = getUniversalYear(currentYear);

export default function NumerologyIndexPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <div className='max-w-6xl mx-auto px-4 py-12'>
        <nav className='text-sm text-zinc-500 mb-8'>
          <Link href='/grimoire' className='hover:text-zinc-300'>
            Grimoire
          </Link>
          <span className='mx-2'>/</span>
          <span className='text-zinc-300'>Numerology</span>
        </nav>

        <h1 className='text-4xl font-light mb-4'>Numerology</h1>
        <p className='text-lg text-zinc-400 mb-8 max-w-3xl'>
          Numerology is the mystical study of numbers and their influence on
          human life. Discover universal year meanings, calculate your personal
          year, and understand how numeric vibrations shape your destiny.
        </p>

        <div className='mb-12 p-6 rounded-lg border border-purple-500/30 bg-purple-500/10'>
          <div className='flex items-center gap-4 mb-4'>
            <span className='text-5xl font-light text-purple-300'>
              {currentUniversalYear}
            </span>
            <div>
              <h2 className='text-2xl font-medium text-purple-300'>
                {currentYear}: Universal Year {currentUniversalYear}
              </h2>
              <p className='text-zinc-400'>
                {NUMEROLOGY_MEANINGS[currentUniversalYear].theme}
              </p>
            </div>
          </div>
          <p className='text-zinc-300 mb-4'>
            {NUMEROLOGY_MEANINGS[currentUniversalYear].energy}
          </p>
          <Link
            href={`/grimoire/numerology/year/${currentYear}`}
            className='inline-flex px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-sm transition-colors'
          >
            Read {currentYear} Full Forecast
          </Link>
        </div>

        <h2 className='text-2xl font-light mb-6'>Universal Year Meanings</h2>
        <div className='grid md:grid-cols-3 gap-4 mb-12'>
          {Object.entries(NUMEROLOGY_MEANINGS).map(([num, data]) => (
            <div
              key={num}
              className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'
            >
              <div className='flex items-center gap-3 mb-3'>
                <span className='text-3xl font-light text-purple-400'>
                  {num}
                </span>
              </div>
              <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                {data.theme}
              </h3>
              <p className='text-sm text-zinc-400 mb-3'>
                {data.keywords.join(', ')}
              </p>
            </div>
          ))}
        </div>

        <h2 className='text-2xl font-light mb-6'>Year Forecasts</h2>
        <div className='grid grid-cols-4 md:grid-cols-6 gap-3 mb-12'>
          {getYearRange().map((year) => {
            const uYear = getUniversalYear(year);
            return (
              <Link
                key={year}
                href={`/grimoire/numerology/year/${year}`}
                className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-purple-500/50 hover:bg-zinc-900 transition-all text-center group'
              >
                <div className='text-lg font-medium text-zinc-100 group-hover:text-purple-300 transition-colors'>
                  {year}
                </div>
                <div className='text-2xl font-light text-purple-400'>
                  {uYear}
                </div>
              </Link>
            );
          })}
        </div>

        <div className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'>
          <h2 className='text-xl font-medium mb-4'>
            How to Calculate Universal Year
          </h2>
          <p className='text-zinc-400 mb-4'>
            The Universal Year is calculated by adding all digits of the year
            together until you get a single digit (1-9). For example:
          </p>
          <div className='bg-zinc-800/50 p-4 rounded-lg font-mono text-sm'>
            <p>2025 = 2 + 0 + 2 + 5 = 9</p>
            <p>2026 = 2 + 0 + 2 + 6 = 10 = 1 + 0 = 1</p>
          </div>
        </div>
      </div>
    </div>
  );
}
