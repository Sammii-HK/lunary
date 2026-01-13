import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
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
    'clock-based numerology',
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
      'Double hours are times where the hour and minute are the same, such as 11:11 or 22:22. They amplify a single number’s energy.',
  },
  {
    question: 'Why do double hours feel significant?',
    answer:
      'Because repetition strengthens symbolism. Double hours often show up during alignment, manifestation, or confirmation moments.',
  },
  {
    question: 'Are double hours the same as mirror hours?',
    answer:
      'No. Double hours repeat numbers. Mirror hours reverse them. Each system has its own interpretive framework.',
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
  const hubChildren = (
    <>
      <section className='mb-12'>
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
        description='Complete guide to double hours and their spiritual meanings. Discover what 10:10, 12:12, 21:21 and other repeated clock times mean when you see them.'
        canonicalUrl='https://lunary.app/grimoire/double-hours'
        keywords={[
          'double hours',
          '12:12 meaning',
          '21:21 meaning',
          '10:10 meaning',
          'clock synchronicity',
          'repeating numbers clock',
          'clock-based numerology',
        ]}
        intro={`Double hours occur when the hour and minute are identical, such as 01:01 or 22:22. These times amplify the energy of a single number and are often linked to alignment, confirmation, and momentum.

When a double hour repeats in your life, it usually appears during periods of decision, manifestation, or transition.`}
        meaning={`Double hours amplify the energy of the number they display. Seeing 21:21 carries the doubled influence of 21 (which reduces to 3 in numerology). This amplification is why many people feel these times carry extra significance.

Record the double hours you notice in your Book of Shadows along with what you were doing or thinking. Over time, you may notice personal patterns in when certain numbers appear.`}
        faqs={faqs}
        internalLinks={[
          { text: 'Numerology Hub', href: '/grimoire/numerology' },
          { text: 'Mirror Hours', href: '/grimoire/mirror-hours' },
          { text: 'Angel Numbers', href: '/grimoire/angel-numbers' },
          { text: 'Divination Guide', href: '/grimoire/divination' },
          { text: 'Life Path Numbers', href: '/grimoire/life-path' },
        ]}
        internalLinksTitle='Explore more numerology'
        cosmicConnections={
          <CosmicConnections
            entityType='hub-glossary'
            entityKey='double-hours'
            title='Double Hour Connections'
            sections={cosmicConnectionsSections}
          />
        }
        childrenPosition='before-faqs'
      >
        {hubChildren}
      </SEOContentTemplate>
    </div>
  );
}
