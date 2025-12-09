import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Moon, Star, ArrowRight, Sparkles } from 'lucide-react';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';

export const metadata: Metadata = {
  title: '2026 Astrological Events Calendar | Lunary',
  description:
    'Complete guide to 2026 astrological events including Mercury retrograde dates, Venus retrograde, eclipses, equinoxes, and major planetary transits.',
  keywords: [
    '2026 astrology',
    '2026 mercury retrograde',
    '2026 eclipses',
    '2026 astrological events',
    '2026 lunar calendar',
    '2026 planetary transits',
  ],
  openGraph: {
    title: '2026 Astrological Events | Lunary',
    description: 'Your complete guide to cosmic events in 2026.',
    images: ['/api/og/cosmic?title=2026%20Cosmic%20Events'],
  },
};

const events2026 = [
  {
    title: 'Mercury Retrograde 2026',
    href: '/grimoire/events/2026/mercury-retrograde',
    icon: Star,
    description: 'Mercury retrograde dates, survival tips, and what to expect',
    dates: '3-4 times per year',
    color: 'text-lunary-accent',
  },
  {
    title: 'Venus Retrograde 2026',
    href: '/grimoire/events/2026/venus-retrograde',
    icon: Sparkles,
    description: 'Love and relationships during Venus retrograde',
    dates: 'March 1 - April 12',
    color: 'text-lunary-rose',
  },
  {
    title: '2026 Eclipses',
    href: '/grimoire/events/2026/eclipses',
    icon: Moon,
    description: 'Solar and lunar eclipses of 2026',
    dates: '4 eclipses',
    color: 'text-lunary-primary-400',
  },
];

export default function Events2026Page() {
  return (
    <main className='min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] text-white'>
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <Breadcrumbs
          items={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Events', href: '/grimoire/events' },
            { label: '2026' },
          ]}
        />

        <header className='mb-12'>
          <div className='flex items-center gap-3 mb-4'>
            <Calendar className='h-10 w-10 text-lunary-primary-400' />
            <h1 className='text-4xl md:text-5xl font-light'>
              2026 <span className='font-medium'>Cosmic Events</span>
            </h1>
          </div>
          <p className='text-lg text-zinc-400 max-w-2xl'>
            Your complete guide to the major astrological events of 2026. Plan
            ahead with our cosmic calendar and make the most of each planetary
            transit.
          </p>
        </header>

        <div className='grid gap-6 mb-12'>
          {events2026.map((event) => (
            <Link
              key={event.href}
              href={event.href}
              className='group block p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl hover:bg-zinc-800/50 hover:border-lunary-primary-600 transition-all'
            >
              <div className='flex items-start gap-4'>
                <event.icon
                  className={`h-8 w-8 ${event.color} flex-shrink-0`}
                />
                <div className='flex-1'>
                  <div className='flex items-center justify-between mb-2'>
                    <h2 className='text-xl font-medium text-white group-hover:text-lunary-primary-300 transition-colors'>
                      {event.title}
                    </h2>
                    <span className='text-sm text-zinc-500'>{event.dates}</span>
                  </div>
                  <p className='text-zinc-400'>{event.description}</p>
                </div>
                <ArrowRight className='h-5 w-5 text-zinc-600 group-hover:text-lunary-primary-400 group-hover:translate-x-1 transition-all flex-shrink-0' />
              </div>
            </Link>
          ))}
        </div>

        <section className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-2xl p-8 text-center'>
          <h2 className='text-2xl font-medium text-white mb-4'>
            Get Personalized 2026 Forecasts
          </h2>
          <p className='text-zinc-400 mb-6'>
            See how these cosmic events affect your unique birth chart.
          </p>
          <Link
            href='/birth-chart'
            className='inline-block px-6 py-3 bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white rounded-lg font-medium transition-colors'
          >
            View Your Birth Chart
          </Link>
        </section>
      </div>
    </main>
  );
}
