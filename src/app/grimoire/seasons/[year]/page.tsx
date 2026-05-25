import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { Sun } from 'lucide-react';
import { GrimoireBreadcrumbs } from '@/components/grimoire/GrimoireBreadcrumbs';
import { ZODIAC_SEASONS, getSeasonDates } from '@/constants/seo/zodiac-seasons';

// 30-day ISR revalidation
export const revalidate = 2592000;
const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 2024;
const MAX_YEAR = CURRENT_YEAR + 1;

function isValidSeasonYear(year: string) {
  const yearNum = Number(year);

  return (
    /^\d{4}$/.test(year) &&
    Number.isInteger(yearNum) &&
    yearNum >= MIN_YEAR &&
    yearNum <= MAX_YEAR
  );
}

function getLegacySeasonBySlug(slug: string) {
  return ZODIAC_SEASONS.find((season) => `${season.sign}-season` === slug);
}

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  const legacySeason = getLegacySeasonBySlug(year);

  if (legacySeason) {
    return {
      title: `${legacySeason.displayName} Season | Lunary`,
      alternates: {
        canonical: `https://lunary.app/grimoire/seasons/${CURRENT_YEAR}/${legacySeason.sign}`,
      },
      robots: { index: false, follow: true },
    };
  }

  if (!isValidSeasonYear(year)) {
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
  const legacySeason = getLegacySeasonBySlug(year);

  if (legacySeason) {
    permanentRedirect(`/grimoire/seasons/${CURRENT_YEAR}/${legacySeason.sign}`);
  }

  if (!isValidSeasonYear(year)) {
    notFound();
  }

  const yearNum = Number(year);
  const breadcrumbItems = [
    { name: 'Grimoire', url: '/grimoire' },
    { name: 'Seasons', url: '/grimoire/seasons' },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <GrimoireBreadcrumbs items={breadcrumbItems} />
      <div className='max-w-5xl mx-auto'>
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <Sun className='w-16 h-16 text-amber-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-content-primary mb-4'>
            Zodiac Seasons {year}
          </h1>
          <p className='text-lg text-content-muted max-w-2xl mx-auto'>
            Each year cycles through 12 zodiac seasons as the Sun moves through
            the signs. Explore the themes and energy of each season.
          </p>
        </div>

        <div className='bg-surface-elevated/50 border border-stroke-subtle rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-content-primary mb-3'>
            Astrological Seasons
          </h2>
          <p className='text-content-muted'>
            As the Sun transits through each zodiac sign, it brings that
            sign&apos;s energy to everyone, regardless of your natal chart.
            These periods influence collective mood, focus, and opportunities.
          </p>
        </div>

        <section className='mb-12'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {ZODIAC_SEASONS.map((season) => {
              const dates = getSeasonDates(season.sign, yearNum);

              return (
                <Link
                  key={season.sign}
                  href={`/grimoire/seasons/${year}/${season.sign}`}
                  className='group rounded-xl border border-stroke-subtle bg-surface-elevated/30 p-5 hover:bg-surface-elevated/50 hover:border-amber-700/50 transition-all'
                >
                  <h3 className='font-medium text-content-primary group-hover:text-amber-300 transition-colors mb-2'>
                    {season.displayName} Season
                  </h3>
                  <p className='text-sm text-content-muted mb-1'>
                    {dates.start.split(',')[0]} - {dates.end.split(',')[0]}
                  </p>
                  <p className='text-xs text-content-muted'>
                    {season.element} Season
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <div className='border-t border-stroke-subtle pt-8'>
          <h3 className='text-lg font-medium text-content-primary mb-4'>
            Related Resources
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/seasons'
              className='px-4 py-2 rounded-lg bg-surface-card text-content-secondary hover:bg-surface-overlay transition-colors'
            >
              All Seasons
            </Link>
            <Link
              href='/grimoire/zodiac'
              className='px-4 py-2 rounded-lg bg-surface-card text-content-secondary hover:bg-surface-overlay transition-colors'
            >
              Zodiac Signs
            </Link>
            <Link
              href='/grimoire/transits'
              className='px-4 py-2 rounded-lg bg-surface-card text-content-secondary hover:bg-surface-overlay transition-colors'
            >
              Transits
            </Link>
          </div>
        </div>
        <ExploreGrimoire />
      </div>
    </div>
  );
}
