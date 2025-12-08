import { Metadata } from 'next';
import Link from 'next/link';
import { Moon, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';

export const metadata: Metadata = {
  title: '2026 Moon Calendar: Full Moon & New Moon Dates | Lunary',
  description:
    'Complete 2026 moon calendar with all full moon and new moon dates. Includes moon names, zodiac signs, and rituals for each lunar phase throughout 2026.',
  keywords: [
    '2026 moon calendar',
    'full moon 2026',
    'new moon 2026',
    '2026 lunar calendar',
    'moon phases 2026',
    'full moon dates 2026',
  ],
  openGraph: {
    title: '2026 Moon Calendar | Lunary',
    description: 'Complete guide to all full moons and new moons in 2026.',
    images: ['/api/og/cosmic?title=2026%20Moon%20Calendar'],
  },
};

const fullMoons2026 = [
  { month: 'January', name: 'Wolf Moon', sign: 'Cancer', date: 'January 13' },
  { month: 'February', name: 'Snow Moon', sign: 'Leo', date: 'February 12' },
  { month: 'March', name: 'Worm Moon', sign: 'Virgo', date: 'March 14' },
  { month: 'April', name: 'Pink Moon', sign: 'Libra', date: 'April 12' },
  { month: 'May', name: 'Flower Moon', sign: 'Scorpio', date: 'May 12' },
  {
    month: 'June',
    name: 'Strawberry Moon',
    sign: 'Sagittarius',
    date: 'June 11',
  },
  { month: 'July', name: 'Buck Moon', sign: 'Capricorn', date: 'July 10' },
  {
    month: 'August',
    name: 'Sturgeon Moon',
    sign: 'Aquarius',
    date: 'August 9',
  },
  {
    month: 'September',
    name: 'Harvest Moon',
    sign: 'Pisces',
    date: 'September 7',
  },
  { month: 'October', name: 'Hunter Moon', sign: 'Aries', date: 'October 7' },
  {
    month: 'November',
    name: 'Beaver Moon',
    sign: 'Taurus',
    date: 'November 5',
  },
  { month: 'December', name: 'Cold Moon', sign: 'Gemini', date: 'December 4' },
];

const newMoons2026 = [
  { month: 'January', sign: 'Capricorn', date: 'January 29' },
  { month: 'February', sign: 'Aquarius', date: 'February 27' },
  { month: 'March', sign: 'Pisces', date: 'March 29' },
  { month: 'April', sign: 'Aries', date: 'April 27' },
  { month: 'May', sign: 'Taurus', date: 'May 26' },
  { month: 'June', sign: 'Gemini', date: 'June 25' },
  { month: 'July', sign: 'Cancer', date: 'July 24' },
  { month: 'August', sign: 'Leo', date: 'August 23' },
  { month: 'September', sign: 'Virgo', date: 'September 21' },
  { month: 'October', sign: 'Libra', date: 'October 21' },
  { month: 'November', sign: 'Scorpio', date: 'November 20' },
  { month: 'December', sign: 'Sagittarius', date: 'December 19' },
];

export default function Moon2026Page() {
  return (
    <main className='min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] text-white'>
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <Breadcrumbs
          items={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Moon', href: '/grimoire/moon' },
            { label: '2026' },
          ]}
        />

        <header className='mb-12'>
          <div className='flex items-center gap-3 mb-4'>
            <Moon className='h-10 w-10 text-purple-400' />
            <h1 className='text-4xl md:text-5xl font-light'>
              2026 <span className='font-medium'>Moon Calendar</span>
            </h1>
          </div>
          <p className='text-lg text-zinc-400 max-w-2xl'>
            Your complete guide to every full moon and new moon in 2026. Plan
            your rituals, manifestations, and release work with the lunar cycle.
          </p>
        </header>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-white mb-6 flex items-center gap-2'>
            <Sparkles className='h-6 w-6 text-lunary-accent' />
            Full Moons 2026
          </h2>
          <div className='grid gap-4'>
            {fullMoons2026.map((moon) => (
              <Link
                key={moon.month}
                href={`/grimoire/moon/2026/full-moon-${moon.month.toLowerCase()}`}
                className='group flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl hover:bg-zinc-800/50 hover:border-purple-500/50 transition-all'
              >
                <div className='flex items-center gap-4'>
                  <span className='text-2xl'>🌕</span>
                  <div>
                    <h3 className='font-medium text-white group-hover:text-purple-300'>
                      {moon.name}
                    </h3>
                    <p className='text-sm text-zinc-500'>
                      {moon.date} • {moon.sign}
                    </p>
                  </div>
                </div>
                <ArrowRight className='h-5 w-5 text-zinc-600 group-hover:text-purple-400 transition-colors' />
              </Link>
            ))}
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-white mb-6 flex items-center gap-2'>
            <Moon className='h-6 w-6 text-purple-400' />
            New Moons 2026
          </h2>
          <div className='grid gap-4'>
            {newMoons2026.map((moon) => (
              <Link
                key={moon.month}
                href={`/grimoire/moon/2026/new-moon-${moon.month.toLowerCase()}`}
                className='group flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl hover:bg-zinc-800/50 hover:border-purple-500/50 transition-all'
              >
                <div className='flex items-center gap-4'>
                  <span className='text-2xl'>🌑</span>
                  <div>
                    <h3 className='font-medium text-white group-hover:text-purple-300'>
                      New Moon in {moon.sign}
                    </h3>
                    <p className='text-sm text-zinc-500'>{moon.date}</p>
                  </div>
                </div>
                <ArrowRight className='h-5 w-5 text-zinc-600 group-hover:text-purple-400 transition-colors' />
              </Link>
            ))}
          </div>
        </section>

        <section className='bg-purple-900/20 border border-purple-500/30 rounded-2xl p-8 text-center'>
          <Calendar className='h-12 w-12 text-purple-400 mx-auto mb-4' />
          <h2 className='text-2xl font-medium text-white mb-4'>
            Track the Moon Daily
          </h2>
          <p className='text-zinc-400 mb-6'>
            Get personalized lunar insights based on your birth chart.
          </p>
          <Link
            href='/welcome'
            className='inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors'
          >
            Start Free
          </Link>
        </section>
      </div>
    </main>
  );
}
