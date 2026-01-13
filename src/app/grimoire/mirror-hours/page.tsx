import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
import { mirrorHourKeys } from '@/constants/grimoire/clock-numbers-data';

export const metadata: Metadata = {
  title: 'Mirror Hours: Meanings of 11:11, 12:21 & More - Lunary',
  description:
    'Wondering why you keep seeing times like 11:11 or 12:21? This guide explains each mirror hour, the meaning behind the synchronicity, and how to read the message when the clock reflects you back.',
  keywords: [
    'mirror hours',
    '11:11 meaning',
    '12:21 meaning',
    'clock synchronicity',
    'clock-based numerology',
    'mirror time meaning',
  ],
  openGraph: {
    title: 'Mirror Hours: Meanings of 11:11, 12:21 & More - Lunary',
    description: 'Complete guide to mirror hours and their spiritual messages.',
    url: 'https://lunary.app/grimoire/mirror-hours',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/mirror-hours',
  },
};

const faqs = [
  {
    question: 'What are mirror hours?',
    answer:
      'Mirror hours are clock times where the digits reflect each other, such as 01:10 or 12:21. They are interpreted through contrast and awareness rather than repetition.',
  },
  {
    question: 'Why do I keep seeing mirror hours?',
    answer:
      'Mirror hours often appear when your attention needs to shift. The meaning depends on what you were thinking or feeling at the exact moment you noticed the time.',
  },
  {
    question: 'Are mirror hours the same as double hours?',
    answer:
      'No. Mirror hours reflect digits, while double hours repeat the same digits. They are interpreted differently and carry different symbolic emphasis.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Numerology',
    links: [
      { label: 'Numerology Hub', href: '/grimoire/numerology' },
      { label: 'Angel Numbers', href: '/grimoire/angel-numbers' },
      { label: 'Double Hours', href: '/grimoire/double-hours' },
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

export default function MirrorHoursIndexPage() {
  const hubChildren = (
    <>
      <section className='mb-12'>
        <h2 className='text-2xl font-light text-zinc-100 mb-6'>
          All Mirror Hours
        </h2>
        <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3'>
          {mirrorHourKeys.map((time) => (
            <Link
              key={time}
              href={`/grimoire/mirror-hours/${time.replace(':', '-')}`}
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
        title='Mirror Hours: Meanings of 11:11, 12:21 & More - Lunary'
        h1='Mirror Hours'
        description='Wondering why you keep seeing times like 11:11 or 12:21? This guide explains each mirror hour, the meaning behind the synchronicity, and how to read the message when the clock reflects you back.'
        canonicalUrl='https://lunary.app/grimoire/mirror-hours'
        keywords={[
          'mirror hours',
          '11:11 meaning',
          '12:21 meaning',
          'clock synchronicity',
          'clock-based numerology',
          'mirror time meaning',
        ]}
        intro={`Mirror hours are clock times where the digits reflect or reverse, such as 01:10 or 12:21. Unlike repeating numbers, mirror hours are read through contrast and reflection, often appearing during moments of awareness or internal shift.

Seeing a mirror hour is a prompt to pause. The meaning is revealed by what you were thinking, feeling, or deciding in that moment.`}
        meaning={`Mirror hours are a form of synchronicity—meaningful coincidences that carry personal significance. The practice of interpreting clock times has roots in numerology and clock-based numerology traditions.

Each mirror hour is associated with specific energies and messages. Click any time below to discover its meaning.`}
        faqs={faqs}
        howToWorkWith={undefined}
        internalLinks={[
          { text: 'Numerology Hub', href: '/grimoire/numerology' },
          { text: 'Clock-based numerology', href: '/grimoire/angel-numbers' },
          { text: 'Double Hours', href: '/grimoire/double-hours' },
          { text: 'Life Path Numbers', href: '/grimoire/life-path' },
          { text: 'Divination Guide', href: '/grimoire/divination' },
        ]}
        internalLinksTitle='Explore more numerology'
        cosmicConnections={
          <CosmicConnections
            entityType='hub-glossary'
            entityKey='mirror-hours'
            title='Mirror Hour Connections'
            sections={cosmicConnectionsSections}
          />
        }
        children={hubChildren}
        childrenPosition='before-faqs'
      />
    </div>
  );
}
