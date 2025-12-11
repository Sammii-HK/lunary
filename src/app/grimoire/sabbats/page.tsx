import { Metadata } from 'next';
import Link from 'next/link';
import { Sun } from 'lucide-react';
import { wheelOfTheYearSabbats } from '@/constants/sabbats';
import { stringToKebabCase } from '../../../../utils/string';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
import { createFAQPageSchema, renderJsonLd } from '@/lib/schema';

const faqs = [
  {
    question: 'What are sabbats?',
    answer:
      'Sabbats are the eight seasonal festivals in the Wheel of the Year. They mark significant points in the solar cycle: solstices, equinoxes, and the cross-quarter days between them. Many modern witches, pagans, and nature-spirituality practitioners celebrate these as times for ritual, reflection, and renewal.',
  },
  {
    question: 'Do I need to celebrate all eight sabbats?',
    answer:
      'No. Many practitioners celebrate only the sabbats that resonate with them, or start with just a few and expand over time. Some focus on the solstices and equinoxes; others prefer the cross-quarter fire festivals. There is no requirement to observe all eight.',
  },
  {
    question: 'What is the difference between Greater and Lesser Sabbats?',
    answer:
      'Greater Sabbats (Samhain, Imbolc, Beltane, Lammas) are the cross-quarter fire festivals, traditionally more community-focused. Lesser Sabbats (Yule, Ostara, Litha, Mabon) are the solstices and equinoxes, marking astronomical turning points. Both are equally valid to celebrate.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Seasonal Practice',
    links: [
      { label: 'Wheel of the Year', href: '/grimoire/wheel-of-the-year' },
      { label: 'Moon Rituals', href: '/grimoire/moon/rituals' },
      { label: 'Correspondences', href: '/grimoire/correspondences' },
      { label: 'Candle Magic', href: '/grimoire/candle-magic' },
    ],
  },
  {
    title: 'Related Topics',
    links: [
      { label: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
      { label: 'Spellcraft', href: '/grimoire/spells/fundamentals' },
      { label: 'Book of Shadows', href: '/book-of-shadows' },
    ],
  },
];

export const metadata: Metadata = {
  title: 'Sabbats: The 8 Pagan Holidays | Lunary',
  description:
    'Explore the eight Sabbats of the Wheel of the Year. Learn about Samhain, Yule, Imbolc, Ostara, Beltane, Litha, Lammas, and Mabon celebrations.',
  keywords: [
    'sabbats',
    'pagan holidays',
    'wheel of the year',
    'samhain',
    'yule',
    'imbolc',
    'ostara',
    'beltane',
    'litha',
    'lammas',
    'mabon',
  ],
  openGraph: {
    title: 'Sabbats Guide | Lunary',
    description:
      'Explore the eight Sabbats of the Wheel of the Year and their celebrations.',
    url: 'https://lunary.app/grimoire/sabbats',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/sabbats',
  },
};

export default function SabbatsIndexPage() {
  const faqSchema = createFAQPageSchema(faqs);

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      {renderJsonLd(faqSchema)}
      <div className='max-w-5xl mx-auto'>
        <Breadcrumbs
          items={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Sabbats' },
          ]}
        />

        <div className='text-center mb-12 mt-8'>
          <div className='flex justify-center mb-4'>
            <Sun className='w-16 h-16 text-amber-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Sabbats
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            The eight Sabbats mark the turning of the Wheel of the Year,
            celebrating the cycles of nature and the sun&apos;s journey through
            the seasons.
          </p>
        </div>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            The Wheel of the Year
          </h2>
          <p className='text-zinc-400 mb-4'>
            The Wheel of the Year consists of four Greater Sabbats (fire
            festivals) and four Lesser Sabbats (solstices and equinoxes). These
            celebrations connect us to the natural rhythms of the earth and
            provide opportunities for reflection, ritual, and renewal.
          </p>
          <p className='text-zinc-400'>
            Greater Sabbats: Samhain, Imbolc, Beltane, Lughnasadh. Lesser
            Sabbats: Yule, Ostara, Litha, Mabon.
          </p>
        </div>

        <section className='mb-12'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {wheelOfTheYearSabbats.map((sabbat) => (
              <Link
                key={sabbat.name}
                href={`/grimoire/sabbats/${stringToKebabCase(sabbat.name.split(' ')[0])}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-amber-700/50 transition-all'
              >
                <div className='flex items-center justify-between mb-3'>
                  <h3 className='text-lg font-medium text-zinc-100 group-hover:text-amber-300 transition-colors'>
                    {sabbat.name}
                  </h3>
                  <span className='text-sm text-zinc-400'>{sabbat.date}</span>
                </div>
                <p className='text-sm text-zinc-400 line-clamp-3'>
                  {sabbat.description}
                </p>
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
          entityKey='sabbats'
          title='Sabbat Connections'
          sections={cosmicConnectionsSections}
        />
      </div>
    </div>
  );
}
