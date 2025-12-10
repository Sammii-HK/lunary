import { Metadata } from 'next';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { Sun } from 'lucide-react';

const planetaryDays = [
  {
    day: 'sunday',
    name: 'Sunday',
    planet: 'Sun',
    symbol: '☉',
    energy: 'Success, vitality, leadership, self-expression',
    color: 'text-amber-400',
  },
  {
    day: 'monday',
    name: 'Monday',
    planet: 'Moon',
    symbol: '☽',
    energy: 'Intuition, emotions, home, fertility',
    color: 'text-zinc-300',
  },
  {
    day: 'tuesday',
    name: 'Tuesday',
    planet: 'Mars',
    symbol: '♂',
    energy: 'Courage, action, conflict resolution, passion',
    color: 'text-red-400',
  },
  {
    day: 'wednesday',
    name: 'Wednesday',
    planet: 'Mercury',
    symbol: '☿',
    energy: 'Communication, learning, travel, commerce',
    color: 'text-orange-400',
  },
  {
    day: 'thursday',
    name: 'Thursday',
    planet: 'Jupiter',
    symbol: '♃',
    energy: 'Expansion, luck, abundance, wisdom',
    color: 'text-purple-400',
  },
  {
    day: 'friday',
    name: 'Friday',
    planet: 'Venus',
    symbol: '♀',
    energy: 'Love, beauty, art, relationships, pleasure',
    color: 'text-pink-400',
  },
  {
    day: 'saturday',
    name: 'Saturday',
    planet: 'Saturn',
    symbol: '♄',
    energy: 'Discipline, protection, banishing, boundaries',
    color: 'text-slate-400',
  },
];

export const metadata: Metadata = {
  title: 'Planetary Days: Magical Correspondences for Each Day | Lunary',
  description:
    'Discover the planetary correspondences for each day of the week. Learn which activities, spells, and intentions align best with Sunday through Saturday.',
  keywords: [
    'planetary days',
    'days of the week magic',
    'planetary correspondences',
    'magical timing',
    'day correspondences',
  ],
  openGraph: {
    title: 'Planetary Days Guide | Lunary',
    description:
      'Discover the planetary correspondences and magical energies for each day of the week.',
    url: 'https://lunary.app/grimoire/numerology/planetary-days',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/numerology/planetary-days',
  },
};

export default function PlanetaryDaysIndexPage() {
  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <div className='max-w-5xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <Sun className='w-16 h-16 text-amber-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Planetary Days
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            Each day of the week is ruled by a planet, carrying its unique
            energy and correspondences. Align your activities with planetary
            timing for greater success.
          </p>
        </div>

        {/* Introduction */}
        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Understanding Planetary Days
          </h2>
          <p className='text-zinc-400 mb-4'>
            The concept of planetary days dates back to ancient Babylon and was
            adopted by Roman astrology. Each day of the week is named after and
            ruled by a celestial body, which influences the energy available
            that day.
          </p>
          <p className='text-zinc-400'>
            Working with planetary days helps you time important activities,
            spells, rituals, and intentions for maximum effectiveness.
          </p>
        </div>

        {/* Planetary Days Grid */}
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Days of the Week
          </h2>
          <div className='space-y-4'>
            {planetaryDays.map((day) => (
              <Link
                key={day.day}
                href={`/grimoire/numerology/planetary-days/${day.day}`}
                className='group flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all'
              >
                <div className={`text-4xl font-astro ${day.color}`}>
                  {day.symbol}
                </div>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-1'>
                    <h3 className='text-xl font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                      {day.name}
                    </h3>
                    <span className={`text-sm ${day.color}`}>{day.planet}</span>
                  </div>
                  <p className='text-sm text-zinc-400'>{day.energy}</p>
                </div>
                <div className='text-zinc-600 group-hover:text-lunary-primary-400 transition-colors'>
                  →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* How to Use */}
        <section className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            How to Use Planetary Days
          </h2>
          <ul className='space-y-3 text-zinc-400'>
            <li className='flex gap-3'>
              <span className='text-lunary-primary-400'>•</span>
              <span>
                <strong className='text-zinc-200'>
                  Plan important activities:
                </strong>{' '}
                Schedule meetings, launches, or important tasks on corresponding
                days.
              </span>
            </li>
            <li className='flex gap-3'>
              <span className='text-lunary-primary-400'>•</span>
              <span>
                <strong className='text-zinc-200'>Time your spellwork:</strong>{' '}
                Cast spells and perform rituals on days that match your
                intention.
              </span>
            </li>
            <li className='flex gap-3'>
              <span className='text-lunary-primary-400'>•</span>
              <span>
                <strong className='text-zinc-200'>Set intentions:</strong> Use
                each day&apos;s energy for journaling, affirmations, and
                goal-setting.
              </span>
            </li>
            <li className='flex gap-3'>
              <span className='text-lunary-primary-400'>•</span>
              <span>
                <strong className='text-zinc-200'>
                  Combine with planetary hours:
                </strong>{' '}
                For even more precision, use planetary hours within each day.
              </span>
            </li>
          </ul>
        </section>

        {/* Related Links */}
        <div className='border-t border-zinc-800 pt-8'>
          <h3 className='text-lg font-medium text-zinc-100 mb-4'>
            Explore More
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/correspondences'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Correspondences
            </Link>
            <Link
              href='/grimoire/moon'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Moon Phases
            </Link>
            <Link
              href='/grimoire/numerology'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Numerology
            </Link>
            <Link
              href='/grimoire/astronomy'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Astronomy
            </Link>
          </div>
        </div>
        <ExploreGrimoire />
      </div>
    </div>
  );
}
