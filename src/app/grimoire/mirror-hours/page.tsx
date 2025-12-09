import { Metadata } from 'next';
import Link from 'next/link';
import { mirrorHourKeys } from '@/constants/grimoire/clock-numbers-data';

export const metadata: Metadata = {
  title: 'Mirror Hours: Meaning of 11:11, 22:22 & More - Lunary',
  description:
    'Discover the spiritual meaning of mirror hours like 11:11, 12:12, and 22:22. Complete guide to synchronicity and what the universe is telling you.',
  openGraph: {
    title: 'Mirror Hours: 01:10, 02:20, 03:30 Meanings - Lunary',
    description:
      'Complete guide to mirror hour meanings and spiritual messages.',
    url: 'https://lunary.app/grimoire/mirror-hours',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/mirror-hours',
  },
};

export default function MirrorHoursIndexPage() {
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
          <span className='text-zinc-400'>Mirror Hours</span>
        </nav>

        <header className='mb-12'>
          <h1 className='text-4xl font-light text-zinc-100 mb-4'>
            Mirror Hours
          </h1>
          <p className='text-lg text-zinc-400'>
            Mirror hours occur when the hour and minute digits mirror each other
            (like 12:21 or match (like 11:11). These synchronicities are
            believed to carry spiritual messages.
          </p>
        </header>

        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
          {mirrorHourKeys.map((time) => (
            <Link
              key={time}
              href={`/grimoire/mirror-hours/${time.replace(':', '-')}`}
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
            What Are Mirror Hours?
          </h2>
          <p className='text-zinc-400'>
            When you repeatedly notice the clock showing mirror hours, many
            believe your guardian angels or the universe is trying to
            communicate with you. Each mirror hour carries its own unique
            message and energy.
          </p>
        </section>
      </div>
    </div>
  );
}
