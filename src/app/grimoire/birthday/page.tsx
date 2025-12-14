import { Metadata } from 'next';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import {
  MONTH_NAMES,
  ZODIAC_DATE_RANGES,
} from '@/constants/seo/birthday-zodiac';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';
import { renderJsonLd, createBreadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Birthday Zodiac Signs: Find Your Sun Sign by Birth Date | Lunary',
  description:
    'Discover your zodiac sign based on your birthday. Complete guide to all 366 birthday personalities with traits, compatibility, and cosmic insights for every day of the year.',
  keywords: [
    'birthday zodiac sign',
    'zodiac sign by birthday',
    'what is my zodiac sign',
    'birthday personality',
    'zodiac birthday calendar',
    'sun sign calculator',
    'astrology birthday',
  ],
  openGraph: {
    title: 'Birthday Zodiac Signs: Find Your Sun Sign by Birth Date',
    description:
      'Discover your zodiac sign based on your birthday. Complete guide to all 366 birthday personalities.',
    url: 'https://lunary.app/grimoire/birthday',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/birthday',
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Birthday Zodiac Calendar',
  description: 'Complete list of zodiac signs for every birthday of the year',
  numberOfItems: 366,
  itemListElement: ZODIAC_DATE_RANGES.map((zodiac, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: `${zodiac.sign} (${MONTH_NAMES[zodiac.startMonth - 1]} ${zodiac.startDay} - ${MONTH_NAMES[zodiac.endMonth - 1]} ${zodiac.endDay})`,
    url: `https://lunary.app/grimoire/zodiac/${zodiac.sign.toLowerCase()}`,
  })),
};

export default function BirthdayIndexPage() {
  const months = MONTH_NAMES.map((name, index) => {
    const month = index + 1;
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][index];
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return { name, month, days };
  });

  return (
    <>
      {renderJsonLd(structuredData)}
      {renderJsonLd(
        createBreadcrumbSchema([
          { name: 'Grimoire', url: '/grimoire' },
          { name: 'Birthday', url: '/grimoire/birthday' },
        ]),
      )}
      <div className='min-h-screen bg-zinc-950 text-zinc-100'>
        <div className='max-w-6xl mx-auto px-4 py-12'>
          <Breadcrumbs
            items={[
              { label: 'Grimoire', href: '/grimoire' },
              { label: 'Birthday' },
            ]}
          />

          <h1 className='text-4xl font-light mb-4'>Birthday Zodiac Calendar</h1>
          <p className='text-lg text-zinc-400 mb-8 max-w-3xl'>
            Find your zodiac sign based on your birthday. Select your birth
            month and day below to discover your sun sign, personality traits,
            compatibility, and cosmic insights.
          </p>

          <div className='mb-12 p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'>
            <h2 className='text-xl font-medium mb-4'>Zodiac Sign Dates</h2>
            <div className='grid md:grid-cols-3 gap-4'>
              {ZODIAC_DATE_RANGES.map((zodiac) => (
                <Link
                  key={zodiac.sign}
                  href={`/grimoire/zodiac/${zodiac.sign.toLowerCase()}`}
                  className='flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors'
                >
                  <span className='text-2xl'>
                    {zodiac.sign === 'Aries'
                      ? '♈'
                      : zodiac.sign === 'Taurus'
                        ? '♉'
                        : zodiac.sign === 'Gemini'
                          ? '♊'
                          : zodiac.sign === 'Cancer'
                            ? '♋'
                            : zodiac.sign === 'Leo'
                              ? '♌'
                              : zodiac.sign === 'Virgo'
                                ? '♍'
                                : zodiac.sign === 'Libra'
                                  ? '♎'
                                  : zodiac.sign === 'Scorpio'
                                    ? '♏'
                                    : zodiac.sign === 'Sagittarius'
                                      ? '♐'
                                      : zodiac.sign === 'Capricorn'
                                        ? '♑'
                                        : zodiac.sign === 'Aquarius'
                                          ? '♒'
                                          : '♓'}
                  </span>
                  <div>
                    <div className='font-medium'>{zodiac.sign}</div>
                    <div className='text-sm text-zinc-400'>
                      {MONTH_NAMES[zodiac.startMonth - 1].slice(0, 3)}{' '}
                      {zodiac.startDay} -{' '}
                      {MONTH_NAMES[zodiac.endMonth - 1].slice(0, 3)}{' '}
                      {zodiac.endDay}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <h2 className='text-2xl font-light mb-6'>Browse by Birthday</h2>
          <div className='space-y-8'>
            {months.map(({ name, days }) => (
              <div key={name}>
                <h3 className='text-lg font-medium text-lunary-primary-400 mb-4'>
                  {name}
                </h3>
                <div className='flex flex-wrap gap-2'>
                  {days.map((day) => (
                    <Link
                      key={`${name}-${day}`}
                      href={`/grimoire/birthday/${name.toLowerCase()}-${day}`}
                      className='w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-800 hover:border-lunary-primary-600 hover:bg-zinc-800/50 text-sm transition-colors'
                    >
                      {day}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className='mt-12 p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
            <h2 className='text-xl font-medium text-lunary-primary-300 mb-2'>
              Get Your Full Birth Chart
            </h2>
            <p className='text-zinc-300 mb-4'>
              Your birthday reveals your Sun sign, but your complete natal chart
              includes Moon, Rising, and all planetary placements for deeper
              cosmic insight.
            </p>
            <Link
              href='/birth-chart'
              className='inline-flex px-6 py-3 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 font-medium transition-colors'
            >
              View Your Birth Chart
            </Link>
          </div>
        </div>

        <ExploreGrimoire />
      </div>
    </>
  );
}
