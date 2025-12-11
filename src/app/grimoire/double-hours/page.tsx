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
  const faqSchema = createFAQPageSchema(faqs);

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(faqSchema)}
      {renderJsonLd(
        createBreadcrumbSchema([
          { name: 'Grimoire', url: '/grimoire' },
          { name: 'Numerology', url: '/grimoire/numerology' },
          { name: 'Double Hours', url: '/grimoire/double-hours' },
        ]),
      )}
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <Breadcrumbs
          items={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Numerology', href: '/grimoire/numerology' },
            { label: 'Double Hours' },
          ]}
        />

        <header className='mb-12'>
          <h1 className='text-4xl font-light text-zinc-100 mb-4'>
            Double Hours
          </h1>
          <p className='text-lg text-zinc-400 leading-relaxed'>
            Double hours occur when the hour matches the minute—10:10, 12:12,
            21:21, and so on. These repeating patterns are considered powerful
            synchronicities. When you notice a double hour, take a moment to
            reflect on your current thoughts and situation—the universe may be
            affirming your path.
          </p>
        </header>

        <section className='mb-12 p-6 rounded-lg border border-zinc-800 bg-zinc-900/30'>
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
            Record the double hours you notice in your Book of Shadows along
            with what you were doing or thinking. Over time, you may notice
            personal patterns in when certain numbers appear.
          </p>
        </section>

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
          entityKey='double-hours'
          title='Double Hour Connections'
          sections={cosmicConnectionsSections}
        />
      </div>
    </div>
  );
}
