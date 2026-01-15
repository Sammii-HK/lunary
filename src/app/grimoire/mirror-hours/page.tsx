import { Metadata } from 'next';
import Link from 'next/link';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
import { mirrorHourKeys } from '@/constants/grimoire/clock-numbers-data';

export const metadata: Metadata = {
  title: 'Mirror Hours: Meanings of 11:11, 12:21 & More - Lunary',
  description:
    'Complete guide to mirror hours and their spiritual meanings. Discover what 11:11, 12:21, 01:10 and other mirror times mean when you see them on the clock.',
  keywords: [
    'mirror hours',
    '11:11 meaning',
    '12:21 meaning',
    'clock synchronicity',
    'angel messages',
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
      'Mirror hours are clock times where the digits mirror each other or match exactly (like 12:21 or 11:11). Many believe these synchronicities carry spiritual messages from angels, guides, or the universe. Noticing them repeatedly may indicate you are in alignment with cosmic energy.',
  },
  {
    question: 'Why do I keep seeing mirror hours?',
    answer:
      'Repeatedly seeing mirror hours may indicate heightened awareness, spiritual awakening, or that your guides are trying to communicate. Pay attention to your thoughts and circumstances when you notice these times—the context often reveals the message.',
  },
  {
    question: 'Are mirror hours the same as angel numbers?',
    answer:
      'They are related but different. Angel numbers are repeating sequences (111, 222, 333) that can appear anywhere. Mirror hours specifically refer to clock times with mirrored or matching digits. Both are considered forms of divine communication.',
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

const tableOfContents = [
  { label: 'Understanding Mirror Hours', href: '#understanding' },
  { label: 'How to Interpret', href: '#reading-method' },
  { label: 'All Mirror Hours', href: '#all-mirror-hours' },
  { label: 'Mirror Hour Connections', href: '#cosmic-connections' },
  { label: 'Frequently Asked Questions', href: '#faq' },
];

const breadcrumbs = [
  { label: 'Grimoire', href: '/grimoire' },
  { label: 'Numerology', href: '/grimoire/numerology' },
  { label: 'Mirror Hours' },
];

export default function MirrorHoursIndexPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <SEOContentTemplate
        title='Mirror Hours: Meanings of 11:11, 12:21 & More - Lunary'
        h1='Mirror Hours'
        description='Mirror hours occur when clock digits mirror each other (like 12:21) or match exactly (like 11:11). Many traditions view these synchronicities as messages from the universe, angels, or your higher self.'
        keywords={[
          'mirror hours',
          '11:11 meaning',
          '12:21 meaning',
          'clock synchronicity',
          'angel messages',
          'mirror time meaning',
        ]}
        canonicalUrl='https://lunary.app/grimoire/mirror-hours'
        tableOfContents={tableOfContents}
        intro='Mirror hours are repeating or mirrored clock times that many people experience as meaningful. They can act like small prompts to pause, reflect, and notice what is happening internally or around you.'
        tldr='Mirror hours are synchronicities on the clock. Use them as reflection prompts rather than fixed predictions.'
        meaning={`Mirror hours are a modern form of symbolic timing. When you see a mirror hour repeatedly, it can be a reminder to slow down, check in, and realign with your intention.

Interpretation works best when you notice your thoughts and emotions in the moment. The meaning often relates to what you were thinking about just before you saw the time.

You do not need to force a meaning. Treat mirror hours as gentle cues, not strict instructions.`}
        rituals={[
          'Pause for three slow breaths when you see a mirror hour.',
          'Write down the thought you were having in that moment.',
          'Set a short intention for the next hour.',
          'End the day by noting any repeated times you noticed.',
        ]}
        journalPrompts={[
          'What was I thinking right before I saw the time?',
          'What emotion is most present for me today?',
          'Where do I need clarity or reassurance?',
          'What action would help me align with my intention?',
        ]}
        tables={[
          {
            title: 'Mirror Hour Reflection',
            headers: ['Step', 'Prompt'],
            rows: [
              ['Pause', 'Take three slow breaths'],
              ['Notice', 'What were you just thinking?'],
              ['Reflect', 'What might the message be?'],
              ['Act', 'Choose one small aligned action'],
            ],
          },
          {
            title: 'Related Number Types',
            headers: ['Type', 'Example'],
            rows: [
              ['Mirror Hours', '12:21'],
              ['Double Hours', '11:11'],
              ['Angel Numbers', '444'],
            ],
          },
        ]}
        faqs={faqs}
        breadcrumbs={breadcrumbs}
        internalLinks={[
          { text: 'Angel Numbers', href: '/grimoire/angel-numbers' },
          { text: 'Double Hours', href: '/grimoire/double-hours' },
          { text: 'Numerology', href: '/grimoire/numerology' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        cosmicConnections={
          <div id='cosmic-connections'>
            <CosmicConnections
              entityType='hub-glossary'
              entityKey='mirror-hours'
              title='Mirror Hour Connections'
              sections={cosmicConnectionsSections}
            />
          </div>
        }
      >
        <section
          id='understanding'
          className='mb-12 p-6 rounded-lg border border-zinc-800 bg-zinc-900/30'
        >
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Understanding Mirror Hours
          </h2>
          <p className='text-zinc-400 mb-4'>
            Mirror hours are a form of synchronicity—meaningful coincidences
            that carry personal significance. The practice of interpreting clock
            times has roots in numerology and angel number traditions.
          </p>
          <p className='text-zinc-400'>
            Each mirror hour is associated with specific energies and messages.
            Click any time below to discover its meaning.
          </p>
        </section>

        <section
          id='reading-method'
          className='mb-12 p-6 rounded-lg border border-zinc-800 bg-zinc-900/30'
        >
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            How to Interpret Mirror Hours
          </h2>
          <p className='text-zinc-400 mb-4'>
            Start with your immediate context. What were you focusing on, and
            what do you need to hear right now? That is often the clearest
            message.
          </p>
          <p className='text-zinc-400'>
            Use the numerology meaning as a guide, then apply it to your current
            situation. If the message feels vague, ask a more specific question
            and wait to see if the time repeats.
          </p>
          <p className='text-zinc-400 mt-4'>
            If you keep seeing the same time, treat it as a recurring theme for
            the week. A single short practice, repeated daily, often reveals the
            message more clearly than analysis.
          </p>
        </section>

        <section id='all-mirror-hours' className='mb-12'>
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
      </SEOContentTemplate>
    </div>
  );
}
