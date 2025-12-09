import { Metadata } from 'next';
import Link from 'next/link';
import {
  CHINESE_ANIMALS,
  CHINESE_ZODIAC_DATA,
  CHINESE_YEARS,
} from '@/constants/seo/chinese-zodiac';
import Script from 'next/script';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';

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

export default function ChineseZodiacIndexPage() {
  const currentYear = new Date().getFullYear();
  const currentYearData = CHINESE_YEARS.find((y) => y.year === currentYear);
  const nextYearData = CHINESE_YEARS.find((y) => y.year === currentYear + 1);

  return (
    <>
      <Script
        id='chinese-zodiac-structured-data'
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className='min-h-screen bg-zinc-950 text-zinc-100'>
        <div className='max-w-6xl mx-auto px-4 py-12'>
          <Breadcrumbs
            items={[
              { label: 'Grimoire', href: '/grimoire' },
              { label: 'Chinese Zodiac' },
            ]}
          />

          <h1 className='text-4xl font-light mb-4'>Chinese Zodiac</h1>
          <p className='text-lg text-zinc-400 mb-8 max-w-3xl'>
            The Chinese zodiac is a repeating 12-year cycle, with each year
            represented by an animal and its attributes. Discover your Chinese
            zodiac sign and learn about personality traits, compatibility, and
            what each year holds.
          </p>

          {currentYearData && (
            <div className='mb-12 p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
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
            </div>
          )}

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
                    <span className='text-xs text-zinc-500'>#{index + 1}</span>
                  </div>
                  <h3 className='text-lg font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                    {data.displayName}
                  </h3>
                  <p className='text-sm text-zinc-500'>
                    {data.element} / {data.yinYang}
                  </p>
                  <p className='text-xs text-zinc-600 mt-2'>
                    Years: {data.years.slice(-3).join(', ')}
                  </p>
                </Link>
              );
            })}
          </div>

          <div className='mb-12 p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'>
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
                    <div className='text-xs text-zinc-500'>
                      {yearData.element} {yearData.yinYang}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'>
            <h2 className='text-xl font-medium mb-4'>
              Find Your Chinese Zodiac
            </h2>
            <p className='text-zinc-400 mb-4'>
              Your Chinese zodiac sign is determined by your birth year. Enter
              your birth year to find your animal sign, or explore the signs
              above.
            </p>
            <p className='text-sm text-zinc-500'>
              Note: Chinese New Year falls between late January and
              mid-February. If you were born in January or February, check
              whether your birthday falls before or after Chinese New Year in
              your birth year.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
