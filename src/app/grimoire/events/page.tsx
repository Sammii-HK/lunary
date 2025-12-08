import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';

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
            href='/grimoire/events/2025'
            className='group p-6 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-colors'
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='p-3 rounded-lg bg-purple-500/20'>
                  <Calendar className='h-8 w-8 text-purple-400' />
                </div>
                <div>
                  <h2 className='text-xl font-medium text-zinc-100 group-hover:text-purple-300 transition-colors'>
                    2025 Astrology Events
                  </h2>
                  <p className='text-zinc-400'>
                    Complete guide to Mercury retrogrades, Venus retrograde,
                    eclipses, and more
                  </p>
                </div>
              </div>
              <ArrowRight className='h-6 w-6 text-zinc-500 group-hover:text-purple-400 transition-colors' />
            </div>
          </Link>

          <div className='grid md:grid-cols-2 gap-4'>
            <Link
              href='/grimoire/events/2025/mercury-retrograde'
              className='group p-4 rounded-lg border border-lunary-rose-700 bg-lunary-rose/10 hover:bg-lunary-rose-900 transition-colors'
            >
              <h3 className='font-medium text-zinc-100 group-hover:text-lunary-rose-300 mb-1'>
                Mercury Retrograde 2025
              </h3>
              <p className='text-sm text-zinc-400'>
                3 retrograde periods: dates, meanings, survival tips
              </p>
            </Link>

            <Link
              href='/grimoire/events/2025/venus-retrograde'
              className='group p-4 rounded-lg border border-lunary-rose-700 bg-lunary-rose/10 hover:bg-lunary-rose-900 transition-colors'
            >
              <h3 className='font-medium text-zinc-100 group-hover:text-lunary-rose-300 mb-1'>
                Venus Retrograde 2025
              </h3>
              <p className='text-sm text-zinc-400'>
                March 1 - April 12: love, relationships, self-worth
              </p>
            </Link>

            <Link
              href='/grimoire/events/2025/eclipses'
              className='group p-4 rounded-lg border border-lunary-accent-700 bg-lunary-accent/10 hover:bg-lunary-accent-900 transition-colors'
            >
              <h3 className='font-medium text-zinc-100 group-hover:text-lunary-accent-300 mb-1'>
                2025 Eclipses
              </h3>
              <p className='text-sm text-zinc-400'>
                4 powerful eclipses: solar & lunar, meanings, rituals
              </p>
            </Link>

            <Link
              href='/grimoire/moon-rituals'
              className='group p-4 rounded-lg border border-lunary-secondary-700 bg-lunary-secondary/10 hover:bg-lunary-secondary-900 transition-colors'
            >
              <h3 className='font-medium text-zinc-100 group-hover:text-lunary-secondary-300 mb-1'>
                Moon Rituals
              </h3>
              <p className='text-sm text-zinc-400'>
                Rituals for every moon phase and lunar event
              </p>
            </Link>
          </div>
        </div>

        <div className='mt-12 text-center'>
          <Link
            href='/welcome'
            className='inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 font-medium transition-colors'
          >
            Get Personalized Event Notifications
            <ArrowRight className='h-5 w-5' />
          </Link>
        </div>
      </div>
    </div>
  );
}
