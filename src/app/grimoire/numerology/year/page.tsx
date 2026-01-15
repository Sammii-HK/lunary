import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

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
  const tableOfContents = [
    { label: 'Calculating Your Personal Year', href: '#calculating' },
    { label: 'Working With Your Year', href: '#working-with-year' },
    { label: 'The 9-Year Cycle', href: '#cycle' },
    { label: 'Related Resources', href: '#related' },
  ];

  const heroContent = (
    <div className='text-center'>
      <div className='flex justify-center mb-4'>
        <Calendar className='w-16 h-16 text-lunary-primary-400' />
      </div>
      <p className='text-lg text-zinc-400 max-w-3xl mx-auto'>
        Your Personal Year reveals the themes, opportunities, and lessons
        you&apos;ll encounter during a calendar year. It cycles from 1 to 9, and
        each number carries distinct guidance.
      </p>
    </div>
  );

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <SEOContentTemplate
        title={metadata.title as string}
        h1='Personal Year Numbers'
        description={metadata.description as string}
        keywords={metadata.keywords as string[]}
        canonicalUrl={
          (metadata.alternates?.canonical as string) ??
          'https://lunary.app/grimoire/numerology/year'
        }
        intro='Personal Year numbers describe your unique focus for a calendar year. They work alongside the Universal Year and show what to build, release, or prioritize as you move through the nine-year cycle.'
        tldr='Your Personal Year number guides the theme of your year. Align your goals and choices with that theme for smoother growth.'
        meaning={`Personal Year numbers reveal the dominant lesson for a given year. Think of them as a seasonal blueprint: some years ask for beginnings, others for structure, completion, or rest.

Using your Personal Year helps you plan with less resistance. It also explains why certain goals feel easier in some years and harder in others. When you align your focus with the number, progress tends to feel more natural.`}
        howToWorkWith={[
          'Calculate your number early in the year and keep it visible.',
          'Set one primary goal that matches the theme.',
          'Review progress each quarter and adjust.',
          'Pair your Personal Year with the Universal Year for context.',
        ]}
        rituals={[
          'Write a short intention for the year and revisit it monthly.',
          'Choose one habit that supports the theme and track it weekly.',
          'Do a simple end-of-month reflection on progress and lessons.',
          'Share your theme with a friend for accountability.',
        ]}
        journalPrompts={[
          'What does this year feel like it is asking of me?',
          'Which goals feel most aligned right now?',
          'Where am I resisting the theme of the year?',
          'What would success look like by year end?',
        ]}
        tables={[
          {
            title: 'Personal Year Themes',
            headers: ['Number', 'Theme'],
            rows: personalYears.map((year) => [year.number, year.theme]),
          },
          {
            title: 'Quick Focus Guide',
            headers: ['Year', 'Focus'],
            rows: [
              ['1', 'Start, initiate, experiment'],
              ['2', 'Cooperate, refine, support'],
              ['3', 'Create, share, express'],
              ['4', 'Build, organize, stabilize'],
            ],
          },
        ]}
        relatedItems={[
          {
            name: 'Numerology Overview',
            href: '/grimoire/numerology',
            type: 'Guide',
          },
          {
            name: 'Core Numbers',
            href: '/grimoire/numerology/core-numbers',
            type: 'Guide',
          },
          {
            name: 'Life Path Numbers',
            href: '/grimoire/life-path',
            type: 'Guide',
          },
        ]}
        tableOfContents={tableOfContents}
        heroContent={heroContent}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Numerology', href: '/grimoire/numerology' },
          { label: 'Year' },
        ]}
        internalLinks={[
          { text: 'Personal Year Calculator', href: '/horoscope' },
          { text: 'Core Numbers', href: '/grimoire/numerology/core-numbers' },
          { text: 'Numerology Guide', href: '/grimoire/numerology' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        faqs={[
          {
            question: 'How do I calculate my Personal Year number?',
            answer:
              'Add your birth month and day to the current year, then reduce the total to a single digit.',
          },
          {
            question: 'Does my Personal Year change on my birthday?',
            answer:
              'Some traditions start the Personal Year on your birthday, while others use the calendar year. Choose one method and stay consistent.',
          },
          {
            question: 'How do I use my Personal Year in planning?',
            answer:
              'Pick one main goal that matches the theme and review it quarterly. Alignment makes progress smoother.',
          },
        ]}
      >
        <section
          id='calculating'
          className='mb-12 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'
        >
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
        </section>

        <section
          id='working-with-year'
          className='mb-12 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'
        >
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Working With Your Personal Year
          </h2>
          <p className='text-zinc-400 mb-4'>
            Use your Personal Year as a planning tool. For example, a Year 1 is
            ideal for starting something new, while a Year 4 supports long-term
            structure. A Year 9 is best for completion and release.
          </p>
          <p className='text-zinc-400'>
            The goal is not to force outcomes, but to choose actions that match
            the energy. That alignment usually makes progress feel smoother and
            more sustainable.
          </p>
        </section>

        <section id='cycle' className='mb-12'>
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

        <section id='related' className='border-t border-zinc-800 pt-8'>
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
        </section>
      </SEOContentTemplate>
    </div>
  );
}
