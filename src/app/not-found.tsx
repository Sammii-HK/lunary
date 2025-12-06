import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lost in the Cosmos | Lunary',
  description:
    'This page seems to have drifted into another dimension. Let us guide you back to the stars.',
};

export default function NotFound() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-4'>
      <div className='max-w-lg text-center'>
        <div className='mb-8 relative'>
          <div className='text-[12rem] font-light text-purple-500/20 leading-none select-none'>
            404
          </div>
          <div className='absolute inset-0 flex items-center justify-center'>
            <span className='text-6xl'>🌙</span>
          </div>
        </div>

        <h1 className='text-3xl font-light mb-4'>Lost in the Cosmos</h1>

        <p className='text-zinc-400 mb-8 text-lg'>
          This page seems to have drifted into another dimension. Perhaps
          Mercury is in retrograde, or maybe this star simply doesn&apos;t exist
          in our galaxy.
        </p>

        <div className='space-y-4'>
          <Link
            href='/'
            className='inline-flex items-center justify-center w-full px-6 py-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 font-medium transition-colors'
          >
            Return to Earth
          </Link>

          <div className='flex gap-3'>
            <Link
              href='/grimoire'
              className='flex-1 px-4 py-2.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 text-sm transition-colors'
            >
              Explore Grimoire
            </Link>
            <Link
              href='/horoscope'
              className='flex-1 px-4 py-2.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 text-sm transition-colors'
            >
              Read Horoscopes
            </Link>
          </div>
        </div>

        <p className='mt-12 text-sm text-zinc-600'>
          If you believe this page should exist, the universe (and our team)
          would love to know.
          <br />
          <a
            href='mailto:hello@lunary.app'
            className='text-purple-400/60 hover:text-purple-400'
          >
            hello@lunary.app
          </a>
        </p>
      </div>
    </div>
  );
}
