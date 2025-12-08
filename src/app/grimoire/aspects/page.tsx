import { Metadata } from 'next';
import Link from 'next/link';
import {
  PLANETS,
  ASPECTS,
  PLANET_DISPLAY,
  PLANET_SYMBOLS,
  ASPECT_DATA,
} from '@/constants/seo/aspects';

export const metadata: Metadata = {
  title:
    'Astrological Aspects: Conjunct, Trine, Square, Sextile, Opposition | Lunary',
  description:
    'Complete guide to astrological aspects. Learn about conjunctions, trines, squares, sextiles, and oppositions between planets in your natal chart, transits, and synastry.',
  keywords: [
    'astrological aspects',
    'conjunction',
    'trine',
    'square',
    'sextile',
    'opposition',
    'natal aspects',
    'synastry aspects',
  ],
  alternates: { canonical: 'https://lunary.app/grimoire/aspects' },
};

export default function AspectsIndexPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <div className='max-w-6xl mx-auto px-4 py-12'>
        <nav className='text-sm text-zinc-500 mb-8'>
          <Link href='/grimoire' className='hover:text-zinc-300'>
            Grimoire
          </Link>
          <span className='mx-2'>/</span>
          <span className='text-zinc-300'>Aspects</span>
        </nav>

        <h1 className='text-4xl font-light mb-4'>Astrological Aspects</h1>
        <p className='text-lg text-zinc-400 mb-8 max-w-3xl'>
          Aspects are the angles between planets in a chart, revealing how their
          energies interact. From harmonious trines to challenging squares, each
          aspect tells a unique story.
        </p>

        <h2 className='text-2xl font-light mb-6'>The Five Major Aspects</h2>
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12'>
          {ASPECTS.map((aspect) => {
            const data = ASPECT_DATA[aspect];
            return (
              <div
                key={aspect}
                className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'
              >
                <div className='flex items-center gap-3 mb-3'>
                  <span className='text-3xl'>{data.symbol}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${data.nature === 'harmonious' ? 'bg-lunary-success-900 text-lunary-success-300' : data.nature === 'challenging' ? 'bg-lunary-error-900 text-lunary-error-300' : 'bg-lunary-secondary-900 text-lunary-secondary-300'}`}
                  >
                    {data.nature}
                  </span>
                </div>
                <h3 className='text-lg font-medium mb-1'>{data.displayName}</h3>
                <p className='text-sm text-zinc-500 mb-2'>{data.degrees}°</p>
                <p className='text-sm text-zinc-400'>
                  {data.keywords.join(', ')}
                </p>
              </div>
            );
          })}
        </div>

        <h2 className='text-2xl font-light mb-6'>
          Explore Planet Combinations
        </h2>
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12'>
          {PLANETS.slice(0, 6).map((planet) => (
            <Link
              key={planet}
              href={`/grimoire/aspects/${planet}/conjunct/${PLANETS.find((p) => p !== planet) || 'moon'}`}
              className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-purple-500/50 transition-all group'
            >
              <div className='text-3xl mb-2'>{PLANET_SYMBOLS[planet]}</div>
              <h3 className='text-lg font-medium group-hover:text-purple-300 transition-colors'>
                {PLANET_DISPLAY[planet]} Aspects
              </h3>
              <p className='text-sm text-zinc-500'>
                Explore all {PLANET_DISPLAY[planet]} aspect combinations
              </p>
            </Link>
          ))}
        </div>

        <div className='p-6 rounded-lg border border-purple-500/30 bg-purple-500/10'>
          <h2 className='text-xl font-medium text-purple-300 mb-2'>
            Find Aspects in Your Chart
          </h2>
          <p className='text-zinc-300 mb-4'>
            Discover the aspects in your natal chart and understand how your
            planetary energies interact.
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
