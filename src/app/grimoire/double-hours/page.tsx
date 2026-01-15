import { Metadata } from 'next';
import Link from 'next/link';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { doubleHourKeys } from '@/constants/grimoire/clock-numbers-data';
export const metadata: Metadata = {
  title: 'Double Hours: Meanings of 10:10, 12:12, 21:21 & More - Lunary',
  description:
    'Complete guide to double hours and their spiritual meanings. Discover what 10:10, 12:12, 21:21 and other repeated clock times mean when you see them.',
  keywords: [
    'double hours',
    '12:12 meaning',
    '21:21 meaning',
    '10:10 meaning',
    'clock synchronicity',
    'repeating numbers clock',
  ],
  openGraph: {
    title: 'Double Hours: Meanings of 10:10, 12:12, 21:21 & More - Lunary',
    description: 'Complete guide to double hours and their spiritual messages.',
    url: 'https://lunary.app/grimoire/double-hours',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/double-hours',
  },
};

const faqs = [
  {
    question: 'What are double hours?',
    answer:
      'Double hours are clock times where the hour and minute digits are identical, like 10:10, 12:12, or 21:21. Unlike mirror hours (which show mirrored digits), double hours repeat the same numbers. Many believe seeing these times repeatedly carries spiritual significance.',
  },
  {
    question: 'What does 12:12 mean?',
    answer:
      '12:12 is often associated with spiritual awakening, completion of cycles, and cosmic alignment. The number 12 appears frequently in sacred traditions (12 zodiac signs, 12 months). Seeing 12:12 may signal that you are completing a phase and preparing for new growth.',
  },
  {
    question: 'How are double hours different from angel numbers?',
    answer:
      'Angel numbers are repeating sequences (111, 444) that can appear anywhere—on receipts, addresses, phone numbers. Double hours specifically refer to clock times. Both are forms of numerical synchronicity and carry similar interpretive frameworks.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Numerology',
    links: [
      { label: 'Numerology Hub', href: '/grimoire/numerology' },
      { label: 'Angel Numbers', href: '/grimoire/angel-numbers' },
      { label: 'Mirror Hours', href: '/grimoire/mirror-hours' },
      { label: 'Life Path Numbers', href: '/grimoire/life-path' },
    ],
  },
  {
    title: 'Related Practices',
    links: [
      { label: 'Divination', href: '/grimoire/divination' },
      { label: 'Meditation', href: '/grimoire/meditation' },
      { label: 'Book of Shadows', href: '/book-of-shadows' },
    ],
  },
];

export default function DoubleHoursIndexPage() {
  const tableOfContents = [
    {
      label: 'Understanding Double Hours',
      href: '#understanding-double-hours',
    },
    { label: 'All Double Hours', href: '#all-double-hours' },
    { label: 'Frequently Asked Questions', href: '#faq' },
  ];

  const sections = (
    <>
      <section
        id='understanding-double-hours'
        className='mb-12 p-6 rounded-lg border border-zinc-800 bg-zinc-900/30'
      >
        <h2 className='text-xl font-medium text-zinc-100 mb-4'>
          Understanding Double Hours
        </h2>
        <p className='text-zinc-400 mb-4'>
          Double hours amplify the energy of the number they display. Seeing
          21:21 carries the doubled influence of 21 (which reduces to 3 in
          numerology). This amplification is why many people feel these times
          carry extra significance.
        </p>
        <p className='text-zinc-400'>
          Record the double hours you notice in your Book of Shadows along with
          what you were doing or thinking. Over time, you may notice personal
          patterns in when certain numbers appear.
        </p>
      </section>

      <section id='all-double-hours' className='mb-12'>
        <h2 className='text-2xl font-light text-zinc-100 mb-6'>
          All Double Hours
        </h2>
        <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3'>
          {doubleHourKeys.map((time) => (
            <Link
              key={time}
              href={`/grimoire/double-hours/${time.replace(':', '-')}`}
              className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-lunary-primary-600 hover:bg-zinc-900 transition-all text-center group'
            >
              <span className='text-xl font-mono text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                {time}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <SEOContentTemplate
        title='Double Hours: Meanings of 10:10, 12:12, 21:21 & More - Lunary'
        h1='Double Hours'
        description='Double hours occur when the hour matches the minute—10:10, 12:12, 21:21, and beyond. Discover the spiritual meaning of each repeated clock time.'
        keywords={[
          'double hours',
          '12:12 meaning',
          '21:21 meaning',
          '10:10 meaning',
          'clock synchronicity',
          'repeating numbers clock',
        ]}
        canonicalUrl='https://lunary.app/grimoire/double-hours'
        intro='Double hours are repeating clock times like 10:10 or 22:22 that many people experience as moments of synchronicity. This guide explains why these times feel significant, how to interpret them through numerology, and how to work with the messages in a grounded way.'
        tldr='Double hours are repeating clock times that amplify a number’s energy. Track when they appear, link them to your current focus, and use the message to make one aligned choice.'
        meaning={`Double hours happen when the hour and minute match, creating a visual echo of the same number. In numerology, repetition amplifies the vibration, so these times can feel louder or more urgent than a random glance at the clock.

Many people experience double hours during periods of transition or decision-making. Rather than treating them as predictions, use them as prompts: what is being emphasized in your life right now? The meaning comes from the combination of the number’s symbolism and your personal context.

If you track your sightings over time, patterns often emerge. You may notice that certain double hours appear when you are thinking about relationships, work, or spiritual growth. This patterning is useful because it turns vague synchronicities into actionable insights.

If you are new to this practice, start with one or two double hours that show up often. Learn their meanings, then observe how those themes play out in your daily life.`}
        howToWorkWith={[
          'Pause when you see a double hour and take one deep breath.',
          'Note what you were thinking or feeling in that moment.',
          'Look up the number’s meaning and apply it to your situation.',
          'Choose one small action that aligns with the message.',
          'Track your sightings in a journal for pattern recognition.',
        ]}
        rituals={[
          'Light a candle and set a simple intention linked to the number.',
          'Write the time in your journal and list three aligned actions.',
          'Use a short meditation to ask for clarity on your next step.',
          'Create a reminder note with the message to keep it visible.',
        ]}
        journalPrompts={[
          'What was I focused on when the double hour appeared?',
          'Which area of life feels most activated right now?',
          'How can I respond to this message with one tangible action?',
          'What pattern is emerging across the times I notice?',
        ]}
        faqs={faqs}
        tableOfContents={tableOfContents}
        heroContent={
          <p className='text-lg text-zinc-400 leading-relaxed'>
            Double hours occur when the hour matches the minute—10:10, 12:12,
            21:21, and so on. These repeating patterns are considered powerful
            synchronicities. When you notice a double hour, take a moment to
            reflect on your current thoughts and situation—the universe may be
            affirming your path.
          </p>
        }
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Numerology', href: '/grimoire/numerology' },
          { label: 'Double Hours' },
        ]}
        internalLinks={[
          { text: 'Numerology', href: '/grimoire/numerology' },
          { text: 'Angel Numbers', href: '/grimoire/angel-numbers' },
          { text: 'Mirror Hours', href: '/grimoire/mirror-hours' },
          { text: 'Book of Shadows', href: '/book-of-shadows' },
        ]}
        cosmicConnections={
          <div id='double-hour-connections'>
            <CosmicConnections
              entityType='hub-glossary'
              entityKey='double-hours'
              title='Double Hour Connections'
              sections={cosmicConnectionsSections}
            />
          </div>
        }
      >
        {sections}
      </SEOContentTemplate>
    </div>
  );
}
