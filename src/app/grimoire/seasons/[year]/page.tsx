import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Sun } from 'lucide-react';

const VALID_YEARS = ['2024', '2025', '2026'];

const seasons = [
  {
    slug: 'aries-season',
    name: 'Aries Season',
    dates: 'March 20 - April 19',
    element: 'Fire',
  },
  {
    slug: 'taurus-season',
    name: 'Taurus Season',
    dates: 'April 20 - May 20',
    element: 'Earth',
  },
  {
    slug: 'gemini-season',
    name: 'Gemini Season',
    dates: 'May 21 - June 20',
    element: 'Air',
  },
  {
    slug: 'cancer-season',
    name: 'Cancer Season',
    dates: 'June 21 - July 22',
    element: 'Water',
  },
  {
    slug: 'leo-season',
    name: 'Leo Season',
    dates: 'July 23 - August 22',
    element: 'Fire',
  },
  {
    slug: 'virgo-season',
    name: 'Virgo Season',
    dates: 'August 23 - September 22',
    element: 'Earth',
  },
  {
    slug: 'libra-season',
    name: 'Libra Season',
    dates: 'September 23 - October 22',
    element: 'Air',
  },
  {
    slug: 'scorpio-season',
    name: 'Scorpio Season',
    dates: 'October 23 - November 21',
    element: 'Water',
  },
  {
    slug: 'sagittarius-season',
    name: 'Sagittarius Season',
    dates: 'November 22 - December 21',
    element: 'Fire',
  },
  {
    slug: 'capricorn-season',
    name: 'Capricorn Season',
    dates: 'December 22 - January 19',
    element: 'Earth',
  },
  {
    slug: 'aquarius-season',
    name: 'Aquarius Season',
    dates: 'January 20 - February 18',
    element: 'Air',
  },
  {
    slug: 'pisces-season',
    name: 'Pisces Season',
    dates: 'February 19 - March 19',
    element: 'Water',
  },
];

export async function generateStaticParams() {
  return VALID_YEARS.map((year) => ({ year }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;

  if (!VALID_YEARS.includes(year)) {
    return { title: 'Year Not Found | Lunary' };
  }

  const title = `Zodiac Seasons ${year}: All 12 Astrological Seasons | Lunary`;
  const description = `Explore all 12 zodiac seasons for ${year}. Learn the dates, themes, and energy of each astrological season from Aries to Pisces.`;

  return {
    title,
    description,
    keywords: [
      `zodiac seasons ${year}`,
      'astrological seasons',
      'aries season',
      'zodiac calendar',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/seasons/${year}`,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/seasons/${year}`,
    },
  };
}

export default async function YearSeasonsPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;

  if (!VALID_YEARS.includes(year)) {
    notFound();
  }

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <div className='max-w-5xl mx-auto'>
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <Sun className='w-16 h-16 text-amber-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            Zodiac Seasons {year}
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            Each year cycles through 12 zodiac seasons as the Sun moves through
            the signs. Explore the themes and energy of each season.
          </p>
        </div>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Astrological Seasons
          </h2>
          <p className='text-zinc-400'>
            As the Sun transits through each zodiac sign, it brings that
            sign&apos;s energy to everyone, regardless of your natal chart.
            These periods influence collective mood, focus, and opportunities.
          </p>
        </div>

        <section className='mb-12'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {seasons.map((season) => (
              <Link
                key={season.slug}
                href={`/grimoire/seasons/${year}/${season.slug}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-amber-700/50 transition-all'
              >
                <h3 className='font-medium text-zinc-100 group-hover:text-amber-300 transition-colors mb-2'>
                  {season.name}
                </h3>
                <p className='text-sm text-zinc-400 mb-1'>{season.dates}</p>
                <p className='text-xs text-zinc-400'>{season.element} Season</p>
              </Link>
            ))}
          </div>
        </section>

        <div className='border-t border-zinc-800 pt-8'>
          <h3 className='text-lg font-medium text-zinc-100 mb-4'>
            Related Resources
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/seasons'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              All Seasons
            </Link>
            <Link
              href='/grimoire/zodiac'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Zodiac Signs
            </Link>
            <Link
              href='/grimoire/transits'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Transits
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
