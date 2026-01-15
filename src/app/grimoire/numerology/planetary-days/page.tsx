import { Metadata } from 'next';
import Link from 'next/link';
import { Sun } from 'lucide-react';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

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
  const tableOfContents = [
    { label: 'Understanding Planetary Days', href: '#understanding' },
    { label: 'Days of the Week', href: '#days-of-week' },
    { label: 'How to Use Planetary Days', href: '#how-to-use' },
    { label: 'Explore More', href: '#explore-more' },
  ];

  const heroContent = (
    <div className='text-center'>
      <div className='flex justify-center mb-4'>
        <Sun className='w-16 h-16 text-amber-400' />
      </div>
      <p className='text-lg text-zinc-400 max-w-3xl mx-auto'>
        Each day of the week is ruled by a planet, carrying its own magical
        energy. Align your activities, spellwork, and intentions with the
        planetary rhythm for better results.
      </p>
    </div>
  );

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <SEOContentTemplate
        title={metadata.title as string}
        h1='Planetary Days'
        description={metadata.description as string}
        keywords={metadata.keywords as string[]}
        canonicalUrl={
          (metadata.alternates?.canonical as string) ??
          'https://lunary.app/grimoire/numerology/planetary-days'
        }
        intro='Planetary days map each weekday to a ruling planet. Use them as simple timing cues for rituals, planning, and self-care.'
        tldr='Each day has a planetary tone. Align tasks with the ruler for smoother results.'
        meaning={`Planetary days are a simple way to work with astrological timing. Each day carries a dominant planetary tone that supports certain activities more than others.

If you are new, use one day a week as a focus day. For example, plan creative work on Friday (Venus) or organize on Saturday (Saturn). Over time, the rhythm becomes intuitive.

Think of the week as a loop: begin, build, refine, and rest. Planetary days help you pace your energy rather than pushing the same way every day.`}
        tableOfContents={tableOfContents}
        heroContent={heroContent}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Numerology', href: '/grimoire/numerology' },
          { label: 'Planetary Days' },
        ]}
        rituals={[
          'Choose one intention that matches the day’s planet.',
          'Light a candle in a corresponding color.',
          'Journal a short reflection on the day’s energy.',
        ]}
        journalPrompts={[
          'Which day feels most productive for me and why?',
          'What intention could I repeat weekly?',
          'How does my energy change by weekday?',
        ]}
        tables={[
          {
            title: 'Day and Planet',
            headers: ['Day', 'Planet', 'Focus'],
            rows: planetaryDays.map((day) => [
              day.name,
              day.planet,
              day.energy,
            ]),
          },
          {
            title: 'Weekly Planning Ideas',
            headers: ['Goal', 'Day to Try'],
            rows: [
              ['Start something new', 'Sunday or Tuesday'],
              ['Collaborate or socialize', 'Wednesday or Friday'],
              ['Deep work or boundaries', 'Saturday'],
            ],
          },
        ]}
        internalLinks={[
          { text: 'Correspondences', href: '/grimoire/correspondences' },
          { text: 'Moon Phases', href: '/grimoire/moon' },
          { text: 'Numerology', href: '/grimoire/numerology' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
      >
        <section
          id='understanding'
          className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'
        >
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
        </section>

        <section id='days-of-week' className='mb-12 space-y-4'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Days of the Week
          </h2>
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
              <span className='text-zinc-600 group-hover:text-lunary-primary-400 transition-colors'>
                →
              </span>
            </Link>
          ))}
        </section>

        <section
          id='how-to-use'
          className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'
        >
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            How to Use Planetary Days
          </h2>
          <ul className='space-y-3 text-zinc-400'>
            <li className='flex gap-3 items-start'>
              <span className='text-lunary-primary-400'>•</span>
              <span>
                <strong className='text-zinc-200'>
                  Plan important activities:
                </strong>{' '}
                Schedule meetings, launches, or important tasks on corresponding
                days.
              </span>
            </li>
            <li className='flex gap-3 items-start'>
              <span className='text-lunary-primary-400'>•</span>
              <span>
                <strong className='text-zinc-200'>Time your spellwork:</strong>{' '}
                Cast spells and perform rituals on days that match your
                intention.
              </span>
            </li>
            <li className='flex gap-3 items-start'>
              <span className='text-lunary-primary-400'>•</span>
              <span>
                <strong className='text-zinc-200'>Set intentions:</strong> Use
                each day’s energy for journaling, affirmations, and
                goal-setting.
              </span>
            </li>
            <li className='flex gap-3 items-start'>
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

        <section
          id='explore-more'
          className='border-t border-zinc-800 pt-8 mb-12'
        >
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
        </section>
      </SEOContentTemplate>
    </div>
  );
}
