import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
import {
  createFAQPageSchema,
  createBreadcrumbSchema,
  renderJsonLd,
} from '@/lib/schema';
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

export default function MirrorHoursIndexPage() {
  const faqSchema = createFAQPageSchema(faqs);

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(faqSchema)}
      {renderJsonLd(
        createBreadcrumbSchema([
          { name: 'Grimoire', url: '/grimoire' },
          { name: 'Numerology', url: '/grimoire/numerology' },
          { name: 'Mirror Hours', url: '/grimoire/mirror-hours' },
        ]),
      )}
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <Breadcrumbs
          items={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Numerology', href: '/grimoire/numerology' },
            { label: 'Mirror Hours' },
          ]}
        />

        <header className='mb-12'>
          <h1 className='text-4xl font-light text-zinc-100 mb-4'>
            Mirror Hours
          </h1>
          <p className='text-lg text-zinc-400 leading-relaxed'>
            Mirror hours occur when clock digits mirror each other (like 12:21)
            or match exactly (like 11:11). Many traditions view these
            synchronicities as messages from the universe, angels, or your
            higher self. When you notice a mirror hour, pause and consider what
            you were thinking—the context often reveals the meaning.
          </p>
        </header>

        <section className='mb-12 p-6 rounded-lg border border-zinc-800 bg-zinc-900/30'>
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

        <section className='mb-12'>
          <h2 className='text-2xl font-light text-zinc-100 mb-6'>
            Frequently Asked Questions
          </h2>
          <div className='space-y-4'>
            {faqs.map((faq, index) => (
              <div
                key={index}
                className='p-5 rounded-lg border border-zinc-800 bg-zinc-900/30'
              >
                <h3 className='text-lg font-medium text-zinc-100 mb-2'>
                  {faq.question}
                </h3>
                <p className='text-zinc-400 text-sm'>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <CosmicConnections
          entityType='hub-glossary'
          entityKey='mirror-hours'
          title='Mirror Hour Connections'
          sections={cosmicConnectionsSections}
        />
      </div>
    </div>
  );
}
