import { Metadata } from 'next';
import Link from 'next/link';
import { doubleHourKeys } from '@/constants/grimoire/clock-numbers-data';

export const metadata: Metadata = {
  title: 'Double Hours: Meaning of Repeating Clock Times - Lunary',
  description:
    'Discover the spiritual meaning of double hours like 12:12, 13:13, and 21:21. Complete guide to clock synchronicities.',
  openGraph: {
    title: 'Double Hours: 10:10, 12:12, 21:21 Meanings - Lunary',
    description:
      'Complete guide to double hour meanings and spiritual messages.',
    url: 'https://lunary.app/grimoire/double-hours',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/double-hours',
  },
};

export default function DoubleHoursIndexPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <nav className='flex items-center gap-2 text-sm text-zinc-400 mb-8'>
          <Link href='/grimoire' className='hover:text-zinc-300'>
            Grimoire
          </Link>
          <span>/</span>
          <Link href='/grimoire/numerology' className='hover:text-zinc-300'>
            Numerology
          </Link>
          <span>/</span>
          <span className='text-zinc-400'>Double Hours</span>
        </nav>

        <header className='mb-12'>
          <h1 className='text-4xl font-light text-zinc-100 mb-4'>
            Double Hours
          </h1>
          <p className='text-lg text-zinc-400'>
            Double hours occur when the hour matches the minute (12:12, 13:13,
            etc). These synchronicities are believed to be messages from the
            spiritual realm.
          </p>
        </header>

        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
          {doubleHourKeys.map((time) => (
            <Link
              key={time}
              href={`/grimoire/double-hours/${time.replace(':', '-')}`}
              className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-lunary-primary-600 hover:bg-zinc-900 transition-all text-center group'
            >
              <span className='text-xl font-mono text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                {time}
              </span>
            </Link>
          ))}
        </div>

        <section className='mt-12 p-6 rounded-lg border border-zinc-800 bg-zinc-900/30'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Understanding Double Hours
          </h2>
          <p className='text-zinc-400'>
            Unlike mirror hours which show mirrored digits, double hours show
            the same number twice. Each double hour is associated with different
            energies and messages from the universe.
          </p>
        </section>
      </div>
    </div>
  );
}
