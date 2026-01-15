import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
import {
  CHINESE_ANIMALS,
  CHINESE_ZODIAC_DATA,
  CHINESE_YEARS,
} from '@/constants/seo/chinese-zodiac';
import { renderJsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Chinese Zodiac: 12 Animal Signs, Years & Compatibility | Lunary',
  description:
    'Complete guide to Chinese zodiac signs. Learn about all 12 animals, find your Chinese zodiac by birth year, and discover compatibility between signs. 2025 is the Year of the Snake.',
  keywords: [
    'chinese zodiac',
    'chinese astrology',
    'chinese horoscope',
    'year of the snake 2025',
    'chinese zodiac animals',
    'chinese zodiac compatibility',
    'chinese zodiac years',
    'chinese new year zodiac',
  ],
  openGraph: {
    title: 'Chinese Zodiac: 12 Animal Signs, Years & Compatibility',
    description:
      'Complete guide to Chinese zodiac. Learn about all 12 animals and find your sign by birth year.',
    url: 'https://lunary.app/grimoire/chinese-zodiac',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/chinese-zodiac',
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Chinese Zodiac Animals',
  description: 'The 12 animals of the Chinese zodiac cycle',
  numberOfItems: 12,
  itemListElement: CHINESE_ANIMALS.map((animal, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: `${CHINESE_ZODIAC_DATA[animal].displayName} (${CHINESE_ZODIAC_DATA[animal].emoji})`,
    url: `https://lunary.app/grimoire/chinese-zodiac/${animal}`,
  })),
};

const tableOfContents = [
  { label: 'Year Overview', href: '#current-year' },
  { label: 'How the Chinese Zodiac Works', href: '#how-it-works' },
  { label: 'The 12 Animals', href: '#animal-grid' },
  { label: 'Compatibility Basics', href: '#compatibility-basics' },
  { label: 'Upcoming Years', href: '#upcoming-years' },
  { label: 'Find Your Sign', href: '#find-sign' },
];

const faqs = [
  {
    question: 'How do I know what my Chinese zodiac sign is?',
    answer:
      'Look up your birth year in the Chinese zodiac cycle. Remember that if you were born in January or February, the zodiac might align with the previous year depending on the date of Chinese New Year.',
  },
  {
    question: 'Why are the Chinese zodiac animals arranged that way?',
    answer:
      'The 12 animals follow a traditional story that assigns each animal to a year in a repeating cycle. Each animal carries unique elements, yin/yang polarity, and personality archetypes.',
  },
  {
    question: 'How does compatibility work between signs?',
    answer:
      'Compatibility compares the elemental, yin/yang, and personality traits of each animal. Complementary signs support one another, while conflicting signs may require more effort and conscious balance.',
  },
];

const howToWorkWith = [
  'Study your animal sign’s element and yin/yang polarity to understand its energy.',
  'Use the 12-animal grid to explore compatibility with partners or collaborators.',
  'Honor annual shifts by ritualizing the incoming year’s animal and element.',
];

const cosmicSections: CosmicConnectionSection[] = [
  {
    title: 'Chinese Zodiac Resources',
    links: [
      { label: 'Chinese Zodiac Animals', href: '/grimoire/chinese-zodiac' },
      {
        label: 'Compatibility',
        href: '/grimoire/compatibility',
      },
      { label: 'Horoscopes', href: '/grimoire/horoscopes' },
    ],
  },
  {
    title: 'Practice Tools',
    links: [
      { label: 'Meditation', href: '/grimoire/meditation' },
      { label: 'Chakra Work', href: '/grimoire/chakras' },
      { label: 'Numerology', href: '/grimoire/numerology' },
    ],
  },
];

export default function ChineseZodiacIndexPage() {
  const currentYear = new Date().getFullYear();
  const currentYearData = CHINESE_YEARS.find(
    (year) => year.year === currentYear,
  );

  const sections = (
    <>
      {currentYearData && (
        <section
          id='current-year'
          className='mb-12 p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'
        >
          <div className='flex items-center gap-4 mb-4'>
            <span className='text-5xl'>
              {CHINESE_ZODIAC_DATA[currentYearData.animal].emoji}
            </span>
            <div>
              <h2 className='text-2xl font-medium text-lunary-primary-300'>
                {currentYear}: Year of the{' '}
                {CHINESE_ZODIAC_DATA[currentYearData.animal].displayName}
              </h2>
              <p className='text-zinc-400'>
                {currentYearData.element} {currentYearData.animal} (
                {currentYearData.startDate} - {currentYearData.endDate})
              </p>
            </div>
          </div>
          <Link
            href={`/grimoire/chinese-zodiac/${currentYearData.animal}`}
            className='inline-flex px-4 py-2 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 text-sm transition-colors'
          >
            Learn about the{' '}
            {CHINESE_ZODIAC_DATA[currentYearData.animal].displayName}
          </Link>
        </section>
      )}

      <section
        id='how-it-works'
        className='mb-12 p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'
      >
        <h2 className='text-xl font-medium mb-4'>
          How the Chinese Zodiac Works
        </h2>
        <p className='text-zinc-400 mb-4'>
          The Chinese zodiac is a 12-year cycle. Each year is associated with an
          animal, and that animal expresses through an element (Wood, Fire,
          Earth, Metal, Water) and a yin/yang polarity. Together, animal +
          element + polarity create the “tone” of a year.
        </p>
        <p className='text-zinc-400 text-sm'>
          For personal readings, your birth year animal describes your core
          archetype, while annual animal shifts describe the collective weather.
          This is why people often feel a “theme” each Chinese New Year—like a
          new chapter opening.
        </p>
      </section>

      <section id='animal-grid'>
        <h2 className='text-2xl font-light mb-6'>
          The 12 Chinese Zodiac Animals
        </h2>
        <div className='grid md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12'>
          {CHINESE_ANIMALS.map((animal, index) => {
            const data = CHINESE_ZODIAC_DATA[animal];
            return (
              <Link
                key={animal}
                href={`/grimoire/chinese-zodiac/${animal}`}
                className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-lunary-primary-600 hover:bg-zinc-900 transition-all group'
              >
                <div className='flex items-center gap-3 mb-3'>
                  <span className='text-3xl'>{data.emoji}</span>
                  <span className='text-xs text-zinc-400'>#{index + 1}</span>
                </div>
                <h3 className='text-lg font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                  {data.displayName}
                </h3>
                <p className='text-sm text-zinc-400'>
                  {data.element} / {data.yinYang}
                </p>
                <p className='text-xs text-zinc-600 mt-2'>
                  Years: {data.years.slice(-3).join(', ')}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section
        id='compatibility-basics'
        className='mb-12 p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'
      >
        <h2 className='text-xl font-medium mb-4'>Compatibility Basics</h2>
        <p className='text-zinc-400 mb-4'>
          Compatibility compares temperament, elements, and the way two animals
          handle conflict. “Best matches” usually share supportive rhythms,
          while “challenging matches” need more clarity, boundaries, and
          conscious communication.
        </p>
        <p className='text-sm text-zinc-400'>
          Use compatibility like a map, not a verdict: it’s a shortcut to where
          effort is required, and where connection flows naturally.
        </p>
      </section>

      <section
        id='upcoming-years'
        className='mb-12 p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'
      >
        <h2 className='text-xl font-medium mb-4'>
          Upcoming Chinese Zodiac Years
        </h2>
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {CHINESE_YEARS.map((yearData) => (
            <div
              key={yearData.year}
              className='flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30'
            >
              <span className='text-2xl'>
                {CHINESE_ZODIAC_DATA[yearData.animal].emoji}
              </span>
              <div>
                <div className='font-medium'>
                  {yearData.year}:{' '}
                  {CHINESE_ZODIAC_DATA[yearData.animal].displayName}
                </div>
                <div className='text-xs text-zinc-400'>
                  {yearData.element} {yearData.yinYang}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id='find-sign'
        className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'
      >
        <h2 className='text-xl font-medium mb-4'>Find Your Chinese Zodiac</h2>
        <p className='text-zinc-400 mb-4'>
          Your Chinese zodiac sign is determined by your birth year. Enter your
          birth year to find your animal sign, or explore the signs above.
        </p>
        <p className='text-sm text-zinc-400'>
          Note: Chinese New Year falls between late January and mid-February. If
          you were born in January or February, check whether your birthday
          falls before or after Chinese New Year in your birth year.
        </p>
      </section>
    </>
  );

  return (
    <>
      {renderJsonLd(structuredData)}
      <SEOContentTemplate
        title={metadata.title as string}
        h1='Chinese Zodiac'
        description={metadata.description as string}
        keywords={metadata.keywords as string[]}
        canonicalUrl={
          (metadata.alternates?.canonical as string) ??
          'https://lunary.app/grimoire/chinese-zodiac'
        }
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Chinese Zodiac' },
        ]}
        intro='The Chinese zodiac is a repeating 12-year cycle, with each year represented by an animal and its attributes. Discover your Chinese zodiac sign and learn about personality traits, compatibility, and what each year holds.'
        meaning='The Chinese zodiac weaves together animals, elements, and yin/yang polarity to describe yearly energies and personal archetypes. Each animal brings distinct strengths, lessons, and compatibility dynamics.'
        howToWorkWith={howToWorkWith}
        tableOfContents={tableOfContents}
        faqs={faqs}
        relatedItems={[
          {
            name: 'Chinese Zodiac Compatibility',
            href: '/grimoire/compatibility',
            type: 'Compatibility',
          },
          {
            name: 'Horoscopes',
            href: '/grimoire/horoscopes',
            type: 'Horoscopes',
          },
        ]}
        internalLinks={[
          { text: 'Compatibility', href: '/grimoire/compatibility' },
          { text: 'Horoscopes', href: '/grimoire/horoscopes' },
          { text: 'Numerology', href: '/grimoire/numerology' },
        ]}
        cosmicConnections={
          <CosmicConnections
            entityType='hub-zodiac'
            entityKey='zodiac'
            title='Chinese Zodiac Connections'
            sections={cosmicSections}
          />
        }
        ctaText='Compare zodiac compatibility'
        ctaHref='/grimoire/compatibility'
      >
        {sections}
      </SEOContentTemplate>
    </>
  );
}
