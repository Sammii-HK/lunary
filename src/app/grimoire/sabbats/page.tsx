import { Metadata } from 'next';
import Link from 'next/link';
import { Sun } from 'lucide-react';
import { wheelOfTheYearSabbats } from '@/constants/sabbats';
import { stringToKebabCase } from '../../../../utils/string';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

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

const tableOfContents = [
  { label: 'Wheel of the Year', href: '#wheel-of-the-year' },
  { label: 'Sabbat Lineup', href: '#sabbat-lineup' },
  { label: 'Frequently Asked Questions', href: '#faq' },
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
  const heroContent = (
    <div className='text-center mb-8'>
      <div className='flex justify-center mb-4'>
        <Sun className='w-16 h-16 text-amber-400' />
      </div>
      <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
        The Wheel of the Year celebrates the cycling sun through the seasons.
      </p>
    </div>
  );

  const sections = (
    <>
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
          Greater Sabbats: Samhain, Imbolc, Beltane, Lughnasadh. Lesser Sabbats:
          Yule, Ostara, Litha, Mabon.
        </p>
      </div>

      <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
        <h2 className='text-xl font-medium text-zinc-100 mb-3'>
          How to Celebrate
        </h2>
        <p className='text-zinc-400 mb-4'>
          Sabbat celebrations can be simple. Many people light a candle, share a
          seasonal meal, or take a short nature walk. The intention is to mark
          the turning point and reflect on what you are growing or releasing.
        </p>
        <p className='text-zinc-400'>
          Choose one small ritual that feels meaningful and repeat it each year.
          This builds a personal tradition and helps you track your growth over
          time.
        </p>
      </div>

      <section id='sabbat-lineup' className='mb-12'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {wheelOfTheYearSabbats.map((sabbat) => (
            <Link
              key={sabbat.name}
              href={`/grimoire/sabbats/${stringToKebabCase(
                sabbat.name.split(' ')[0],
              )}`}
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
    </>
  );

  return (
    <SEOContentTemplate
      title={metadata.title as string}
      h1='Sabbats'
      description='The eight Sabbats mark the turning of the Wheel of the Year, celebrating the cycles of nature and the sun’s journey through the seasons.'
      keywords={metadata.keywords as string[]}
      canonicalUrl={
        (metadata.alternates?.canonical as string) ??
        'https://lunary.app/grimoire/sabbats'
      }
      tldr='The eight Sabbats mark seasonal turning points. Use them to align rituals with the year’s rhythm.'
      meaning={`Sabbats are seasonal checkpoints. They help you reflect on the past season, set intentions for the next, and stay connected to the natural cycle.

Greater Sabbats are often more community-focused, while Lesser Sabbats mark astronomical shifts. Both offer a powerful moment to pause, reset, and honor the season.

If you are new, start with one or two Sabbats that feel meaningful. Over time, the rhythm of the year becomes easier to feel, and your rituals can become simple seasonal anchors.

You can also track one theme across the whole wheel, like healing, creativity, or rest, and see how it changes from sabbat to sabbat.

If you miss a date, celebrate when you can. The intention matters more than the exact day.

Seasonal rituals work best when they are simple enough to repeat year after year.

The more consistent the rhythm, the more grounded the practice feels.`}
      howToWorkWith={[
        'Choose one sabbat to focus on this season.',
        'Keep the ritual short and repeatable.',
        'Track a single theme from one sabbat to the next.',
        'Use seasonal foods, colors, or herbs to reinforce the shift.',
      ]}
      rituals={[
        'Light a candle and name one intention for the season.',
        'Create a small altar with seasonal items.',
        'Journal what you are releasing and what you are inviting in.',
        'Share a simple meal or drink in gratitude.',
        'Spend a few minutes outside noticing the season.',
      ]}
      journalPrompts={[
        'What is ending for me this season?',
        'What do I want to begin or nurture?',
        'How do I want to feel by the next sabbat?',
        'What seasonal symbol resonates most with me?',
        'What tradition do I want to repeat next year?',
        'What would make this sabbat feel most nourishing?',
      ]}
      tables={[
        {
          title: 'Sabbat Overview',
          headers: ['Type', 'Dates'],
          rows: [
            ['Greater Sabbats', 'Samhain, Imbolc, Beltane, Lughnasadh'],
            ['Lesser Sabbats', 'Yule, Ostara, Litha, Mabon'],
          ],
        },
        {
          title: 'Seasonal Focus',
          headers: ['Season', 'Theme'],
          rows: [
            ['Winter', 'Rest, reflection, renewal'],
            ['Spring', 'Beginnings, growth'],
            ['Summer', 'Expansion, celebration'],
            ['Autumn', 'Harvest, release'],
          ],
        },
        {
          title: 'Simple Ritual Structure',
          headers: ['Step', 'Purpose'],
          rows: [
            ['Open', 'Name the season and intention'],
            ['Act', 'Light a candle or offer a small symbol'],
            ['Close', 'Give thanks and ground'],
          ],
        },
      ]}
      tableOfContents={tableOfContents}
      whatIs={{
        question: 'What are sabbats?',
        answer:
          'Sabbats are the seasonal festivals that mark the solstices, equinoxes, and cross-quarter fire festivals around the solar year.',
      }}
      intro='The Wheel of the Year connects modern practitioners to the rhythms of the sun, encouraging seasonal rituals, reflection, and celebration.'
      internalLinks={[
        { text: 'Wheel of the Year', href: '/grimoire/wheel-of-the-year' },
        { text: 'Moon Rituals', href: '/grimoire/moon/rituals' },
        { text: 'Correspondences', href: '/grimoire/correspondences' },
        { text: 'Grimoire Home', href: '/grimoire' },
      ]}
      faqs={faqs}
      heroContent={heroContent}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-glossary'
          entityKey='sabbats'
          title='Sabbat Connections'
          sections={cosmicConnectionsSections}
        />
      }
      // childrenPosition='after-intro'
    >
      {sections}
    </SEOContentTemplate>
  );
}
