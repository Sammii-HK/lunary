import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Moon, Sun, ArrowRight, Star, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Astrology Events 2025: Complete Calendar & Guide',
  description:
    'Complete 2025 astrology events calendar. Mercury retrograde dates, Venus retrograde, eclipses, and major planetary transits. Your guide to navigating cosmic events.',
  openGraph: {
    title: 'Astrology Events 2025: Complete Calendar & Guide',
    description:
      '2025 astrology events calendar with retrogrades, eclipses, and transits.',
    url: 'https://lunary.app/grimoire/events/2025',
    siteName: 'Lunary',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/events/2025',
  },
};

const events2025 = [
  {
    category: 'Mercury Retrograde',
    icon: Star,
    color: 'orange',
    events: [
      { date: 'March 14 - April 7', description: 'Aries → Pisces' },
      { date: 'July 18 - August 11', description: 'Leo → Cancer' },
      { date: 'November 9 - 29', description: 'Sagittarius → Scorpio' },
    ],
    link: '/grimoire/events/2025/mercury-retrograde',
  },
  {
    category: 'Venus Retrograde',
    icon: Sparkles,
    color: 'pink',
    events: [{ date: 'March 1 - April 12', description: 'Aries → Pisces' }],
    link: '/grimoire/events/2025/venus-retrograde',
  },
  {
    category: 'Eclipses',
    icon: Sun,
    color: 'amber',
    events: [
      { date: 'March 14', description: 'Total Lunar Eclipse in Virgo' },
      { date: 'March 29', description: 'Partial Solar Eclipse in Aries' },
      { date: 'September 7', description: 'Total Lunar Eclipse in Pisces' },
      { date: 'September 21', description: 'Partial Solar Eclipse in Virgo' },
    ],
    link: '/grimoire/events/2025/eclipses',
  },
  {
    category: 'Other Retrogrades',
    icon: Moon,
    color: 'blue',
    events: [
      { date: 'May 4 - September 1', description: 'Pluto Retrograde' },
      { date: 'July 7 - November 27', description: 'Saturn Retrograde' },
      { date: 'July 19 - December 7', description: 'Neptune Retrograde' },
      { date: 'September 1 - February 2026', description: 'Uranus Retrograde' },
      { date: 'October 9 - February 2026', description: 'Jupiter Retrograde' },
      { date: 'December 6 - February 2026', description: 'Mars Retrograde' },
    ],
    link: '/grimoire/astronomy',
  },
];

const colorClasses: Record<
  string,
  { border: string; bg: string; text: string }
> = {
  orange: {
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
  },
  pink: {
    border: 'border-pink-500/30',
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
  },
  amber: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
  },
  blue: {
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
  },
};

export default function Events2025Page() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <div className='max-w-4xl mx-auto px-4 py-12'>
        {/* Header */}
        <div className='mb-12'>
          <div className='flex items-center gap-2 text-sm text-zinc-500 mb-4'>
            <Link href='/grimoire' className='hover:text-zinc-300'>
              Grimoire
            </Link>
            <span>/</span>
            <Link href='/grimoire/events' className='hover:text-zinc-300'>
              Events
            </Link>
            <span>/</span>
            <span className='text-zinc-400'>2025</span>
          </div>
          <h1 className='text-4xl font-light text-zinc-100 mb-4'>
            Astrology Events 2025
          </h1>
          <p className='text-lg text-zinc-400'>
            Your complete guide to navigating the cosmic events of 2025.
            Retrogrades, eclipses, and major planetary transits.
          </p>
        </div>

        {/* Quick Summary */}
        <div className='mb-12 p-6 rounded-lg border border-purple-500/30 bg-purple-500/10'>
          <h2 className='text-lg font-medium text-purple-300 mb-4'>
            2025 At a Glance
          </h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-center'>
            <div>
              <div className='text-3xl font-light text-purple-400'>3</div>
              <div className='text-sm text-zinc-400'>Mercury Retrogrades</div>
            </div>
            <div>
              <div className='text-3xl font-light text-purple-400'>1</div>
              <div className='text-sm text-zinc-400'>Venus Retrograde</div>
            </div>
            <div>
              <div className='text-3xl font-light text-purple-400'>4</div>
              <div className='text-sm text-zinc-400'>Eclipses</div>
            </div>
            <div>
              <div className='text-3xl font-light text-purple-400'>6</div>
              <div className='text-sm text-zinc-400'>Outer Planet Rx</div>
            </div>
          </div>
        </div>

        {/* Events by Category */}
        <div className='space-y-8'>
          {events2025.map((category, index) => {
            const Icon = category.icon;
            const colors = colorClasses[category.color];
            return (
              <section
                key={index}
                className={`p-6 rounded-lg border ${colors.border} ${colors.bg}`}
              >
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-3'>
                    <Icon className={`h-6 w-6 ${colors.text}`} />
                    <h2 className='text-xl font-medium text-zinc-100'>
                      {category.category}
                    </h2>
                  </div>
                  <Link
                    href={category.link}
                    className={`flex items-center gap-1 text-sm ${colors.text} hover:underline`}
                  >
                    Learn More <ArrowRight className='h-4 w-4' />
                  </Link>
                </div>
                <div className='space-y-3'>
                  {category.events.map((event, i) => (
                    <div
                      key={i}
                      className='flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0'
                    >
                      <span className='text-zinc-100 font-medium'>
                        {event.date}
                      </span>
                      <span className='text-zinc-400 text-sm'>
                        {event.description}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* CTA */}
        <div className='mt-12 text-center'>
          <Link
            href='/welcome'
            className='inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 font-medium text-lg transition-colors'
          >
            Get Your Personalized 2025 Forecast
            <ArrowRight className='h-5 w-5' />
          </Link>
        </div>

        {/* Related */}
        <div className='mt-12 pt-8 border-t border-zinc-800'>
          <h3 className='text-lg font-medium text-zinc-100 mb-4'>
            Related Resources
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/moon-rituals'
              className='px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors'
            >
              Moon Rituals
            </Link>
            <Link
              href='/grimoire/astronomy'
              className='px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors'
            >
              Planet Guide
            </Link>
            <Link
              href='/grimoire/tarot'
              className='px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors'
            >
              Tarot Guide
            </Link>
            <Link
              href='/birth-chart'
              className='px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors'
            >
              Birth Chart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
