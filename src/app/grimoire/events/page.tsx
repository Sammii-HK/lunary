import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';

const currentYear = new Date().getFullYear();
const nextYear = currentYear + 1;

export const metadata: Metadata = {
  title: 'Astrology Events Calendar - Lunary',
  description:
    'Astrology events calendar with retrogrades, eclipses, and planetary transits. Navigate cosmic events with guidance and rituals.',
  openGraph: {
    title: 'Astrology Events Calendar - Lunary',
    description:
      'Astrology events calendar with retrogrades, eclipses, and transits.',
    url: 'https://lunary.app/grimoire/events',
    siteName: 'Lunary',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/events',
  },
};

export default function EventsIndexPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <div className='mb-12'>
          <div className='flex items-center gap-2 text-sm text-zinc-500 mb-4'>
            <Link href='/grimoire' className='hover:text-zinc-300'>
              Grimoire
            </Link>
            <span>/</span>
            <span className='text-zinc-400'>Events</span>
          </div>
          <h1 className='text-4xl font-light text-zinc-100 mb-4'>
            Astrology Events
          </h1>
          <p className='text-lg text-zinc-400'>
            Navigate cosmic events with our comprehensive guides to retrogrades,
            eclipses, and planetary transits.
          </p>
        </div>

        <div className='grid gap-6'>
          <Link
            href={`/grimoire/events/${currentYear}`}
            className='group p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10 hover:bg-lunary-primary-900/20 transition-colors'
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='p-3 rounded-lg bg-lunary-primary-900/20'>
                  <Calendar className='h-8 w-8 text-lunary-primary-400' />
                </div>
                <div>
                  <h2 className='text-xl font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                    {currentYear} Astrology Events
                  </h2>
                  <p className='text-zinc-400'>
                    Complete guide to Mercury retrogrades, Venus retrograde,
                    eclipses, and more
                  </p>
                </div>
              </div>
              <ArrowRight className='h-6 w-6 text-zinc-500 group-hover:text-lunary-primary-400 transition-colors' />
            </div>
          </Link>

          <div className='grid md:grid-cols-2 gap-4'>
            <Link
              href={`/grimoire/events/${currentYear}/mercury-retrograde`}
              className='group p-4 rounded-lg border border-lunary-rose-700 bg-lunary-rose-950 hover:bg-lunary-rose-900 transition-colors'
            >
              <h3 className='font-medium text-zinc-100 group-hover:text-lunary-rose-300 mb-1'>
                Mercury Retrograde {currentYear}
              </h3>
              <p className='text-sm text-zinc-400'>
                Retrograde periods: dates, meanings, survival tips
              </p>
            </Link>

            <Link
              href={`/grimoire/events/${currentYear}/venus-retrograde`}
              className='group p-4 rounded-lg border border-lunary-rose-700 bg-lunary-rose-950 hover:bg-lunary-rose-900 transition-colors'
            >
              <h3 className='font-medium text-zinc-100 group-hover:text-lunary-rose-300 mb-1'>
                Venus Retrograde {currentYear}
              </h3>
              <p className='text-sm text-zinc-400'>
                Love, relationships, self-worth themes
              </p>
            </Link>

            <Link
              href={`/grimoire/events/${currentYear}/eclipses`}
              className='group p-4 rounded-lg border border-lunary-accent-700 bg-lunary-accent-950 hover:bg-lunary-accent-900 transition-colors'
            >
              <h3 className='font-medium text-zinc-100 group-hover:text-lunary-accent-300 mb-1'>
                {currentYear} Eclipses
              </h3>
              <p className='text-sm text-zinc-400'>
                Solar & lunar eclipses: meanings, rituals
              </p>
            </Link>

            <Link
              href='/grimoire/moon-rituals'
              className='group p-4 rounded-lg border border-lunary-secondary-700 bg-lunary-secondary-950 hover:bg-lunary-secondary-900 transition-colors'
            >
              <h3 className='font-medium text-zinc-100 group-hover:text-lunary-secondary-300 mb-1'>
                Moon Rituals
              </h3>
              <p className='text-sm text-zinc-400'>
                Rituals for every moon phase and lunar event
              </p>
            </Link>
          </div>

          <Link
            href={`/grimoire/events/${nextYear}`}
            className='group p-4 rounded-lg border border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 transition-colors'
          >
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                  {nextYear} Astrology Events
                </h3>
                <p className='text-sm text-zinc-400'>
                  Preview upcoming cosmic events
                </p>
              </div>
              <ArrowRight className='h-5 w-5 text-zinc-500 group-hover:text-lunary-primary-400 transition-colors' />
            </div>
          </Link>
        </div>

        <div className='mt-12 text-center'>
          <Link
            href='/horoscope'
            className='inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 font-medium transition-colors'
          >
            See How Events Affect Your Chart
            <ArrowRight className='h-5 w-5' />
          </Link>
        </div>
      </div>
    </div>
  );
}
