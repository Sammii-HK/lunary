import { Metadata } from 'next';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { Calendar } from 'lucide-react';

const personalYears = [
  {
    number: '1',
    theme: 'New Beginnings',
    description: 'Starting fresh, independence, taking initiative',
  },
  {
    number: '2',
    theme: 'Cooperation',
    description: 'Partnerships, patience, diplomacy',
  },
  {
    number: '3',
    theme: 'Expression',
    description: 'Creativity, communication, socializing',
  },
  {
    number: '4',
    theme: 'Building',
    description: 'Hard work, foundations, stability',
  },
  {
    number: '5',
    theme: 'Change',
    description: 'Freedom, adventure, transformation',
  },
  {
    number: '6',
    theme: 'Responsibility',
    description: 'Family, home, service to others',
  },
  {
    number: '7',
    theme: 'Reflection',
    description: 'Introspection, spirituality, analysis',
  },
  {
    number: '8',
    theme: 'Achievement',
    description: 'Power, abundance, material success',
  },
  {
    number: '9',
    theme: 'Completion',
    description: 'Endings, wisdom, humanitarianism',
  },
];

export const metadata: Metadata = {
  title: 'Personal Year Numbers: Numerology Cycles | Lunary',
  description:
    'Calculate and understand your Personal Year number. Learn how the 9-year cycle influences your experiences and opportunities each year.',
  keywords: [
    'personal year number',
    'numerology year',
    'personal year 1',
    'numerology cycles',
    'year number meaning',
  ],
  openGraph: {
    title: 'Personal Year Numbers | Lunary',
    description:
      'Calculate and understand your Personal Year number and the 9-year numerology cycle.',
    url: 'https://lunary.app/grimoire/numerology/year',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/numerology/year',
  },
};

export default function PersonalYearIndexPage() {
  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <div className='max-w-5xl mx-auto'>
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <Calendar className='w-16 h-16 text-lunary-primary-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Personal Year Numbers
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            Your Personal Year reveals the themes, opportunities, and lessons
            you&apos;ll encounter during a calendar year. It cycles from 1 to 9.
          </p>
        </div>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Calculating Your Personal Year
          </h2>
          <p className='text-zinc-400 mb-4'>
            Add your birth month + birth day + current year, then reduce to a
            single digit. For example: March 15 in 2025 = 3 + 1 + 5 + 2 + 0 + 2
            + 5 = 18 → 1 + 8 = 9 (Personal Year 9).
          </p>
          <p className='text-zinc-400'>
            Each year has a distinct energy that influences your experiences.
            Working with your Personal Year helps you align with natural cycles
            and make the most of each period.
          </p>
        </div>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            The 9-Year Cycle
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {personalYears.map((year) => (
              <Link
                key={year.number}
                href={`/grimoire/numerology/year/${year.number}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all'
              >
                <div className='flex items-center gap-3 mb-2'>
                  <span className='text-2xl font-light text-lunary-primary-400'>
                    {year.number}
                  </span>
                  <h3 className='font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                    {year.theme}
                  </h3>
                </div>
                <p className='text-sm text-zinc-400'>{year.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <div className='border-t border-zinc-800 pt-8'>
          <h3 className='text-lg font-medium text-zinc-100 mb-4'>
            Related Resources
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/numerology'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Numerology Overview
            </Link>
            <Link
              href='/grimoire/life-path'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Life Path Numbers
            </Link>
            <Link
              href='/grimoire/numerology/core-numbers'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Core Numbers
            </Link>
            <Link
              href='/grimoire/numerology/master-numbers'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Master Numbers
            </Link>
          </div>
        </div>
        <ExploreGrimoire />
      </div>
    </div>
  );
}
