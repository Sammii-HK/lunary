import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { Moon, Calendar, Sparkles } from 'lucide-react';
import MoonPhaseEventList from '@/components/grimoire/MoonPhaseEventList';
import { getMoonEventsForYear } from '@/lib/moon/events';

export async function generateStaticParams() {
  // Generate pages for years 2025-2030
  return [2025, 2026, 2027, 2028, 2029, 2030].map((year) => ({
    year: year.toString(),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  const yearNum = parseInt(year);

  if (isNaN(yearNum) || yearNum < 2025 || yearNum > 2030) {
    return {
      title: 'Moon Calendar Not Found | Lunary',
    };
  }

  return {
    title: `${year} Moon Calendar: Full Moon & New Moon Dates | Lunary`,
    description: `Complete ${year} moon calendar with all full moon and new moon dates. Includes moon names, zodiac signs, and rituals for each lunar phase throughout ${year}.`,
    keywords: [
      `${year} moon calendar`,
      `full moon ${year}`,
      `new moon ${year}`,
      `${year} lunar calendar`,
      `moon phases ${year}`,
      `full moon dates ${year}`,
    ],
    openGraph: {
      title: `${year} Moon Calendar | Lunary`,
      description: `Complete guide to all full moons and new moons in ${year}.`,
      images: [
        `/api/og/cosmic?title=${encodeURIComponent(`${year} Moon Calendar`)}`,
      ],
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/moon/${year}`,
    },
  };
}

export default async function MoonYearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  const yearNum = parseInt(year);

  if (isNaN(yearNum) || yearNum < 2025 || yearNum > 2030) {
    notFound();
  }

  const { fullMoons, newMoons } = getMoonEventsForYear(yearNum);

  const intro = `Your complete guide to every full moon and new moon in ${year}. Plan your rituals, manifestations, and release work with the lunar cycle. The moon moves through approximately 13 lunar cycles each year, with each full moon and new moon carrying unique astrological energy based on the zodiac sign it occurs in.`;

  const meaning = `The ${year} moon calendar tracks all major lunar events throughout the year. Each full moon is traditionally named based on the month it occurs in, reflecting seasonal changes and agricultural cycles. The new moons mark powerful times for setting intentions and beginning new cycles.

Understanding the moon's phases helps you align your spiritual practice, rituals, and personal growth with cosmic rhythms. Each lunar event provides an opportunity to work with specific energies for manifestation, release, and transformation.`;

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${year} Moon Calendar: Full Moon & New Moon Dates | Lunary`}
        h1={`${year} Moon Calendar`}
        description={`Complete ${year} moon calendar with all full moon and new moon dates. Includes moon names, zodiac signs, and rituals for each lunar phase throughout ${year}.`}
        keywords={[
          `${year} moon calendar`,
          `full moon ${year}`,
          `new moon ${year}`,
          `${year} lunar calendar`,
          `moon phases ${year}`,
          `full moon dates ${year}`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/moon/${year}`}
        datePublished={`${year}-01-01`}
        dateModified={new Date().toISOString().split('T')[0]}
        articleSection='Moon'
        intro={intro}
        meaning={meaning}
        tldr={`The ${year} moon calendar includes ${fullMoons.length} full moons and ${newMoons.length} new moons, each occurring in different zodiac signs with unique energetic qualities.`}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Moon', href: '/grimoire/moon' },
          { label: year, href: `/grimoire/moon/${year}` },
        ]}
        relatedItems={[
          {
            name: 'Moon Phases Guide',
            href: '/grimoire/moon/phases',
            type: 'Guide',
          },
          {
            name: 'Full Moons',
            href: '/grimoire/moon/full-moons',
            type: 'Collection',
          },
          {
            name: 'Moon Rituals',
            href: '/grimoire/moon/rituals',
            type: 'Practice',
          },
          { name: 'Moon Signs', href: '/grimoire/moon/signs', type: 'Guide' },
        ]}
        internalLinks={[
          { text: 'View All Moon Phases', href: '/grimoire/moon/phases' },
          { text: 'Moon Calendar Hub', href: '/moon-calendar' },
          { text: "Today's Moon Phase", href: '/horoscope' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText='Get personalized lunar insights based on your birth chart'
        ctaHref='/horoscope'
      >
        <div className='space-y-12'>
          <section className='mb-12'>
            <h2 className='text-2xl font-medium text-white mb-3 flex items-center gap-2'>
              <Sparkles className='h-6 w-6 text-lunary-accent' />
              Full Moons {year}
            </h2>
            <p className='text-sm text-zinc-400 mb-6'>
              Dates and times reflect your browser’s current timezone.
            </p>
            <MoonPhaseEventList events={fullMoons} year={year} type='full' />
          </section>

          <section className='mb-12'>
            <h2 className='text-2xl font-medium text-white mb-3 flex items-center gap-2'>
              <Moon className='h-6 w-6 text-lunary-primary-400' />
              New Moons {year}
            </h2>
            <p className='text-sm text-zinc-400 mb-6'>
              Times adjust to your browser’s timezone so every intention is on
              point.
            </p>
            <MoonPhaseEventList events={newMoons} year={year} type='new' />
          </section>

          <section className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-2xl p-8 text-center'>
            <Calendar className='h-12 w-12 text-lunary-primary-400 mx-auto mb-4' />
            <h2 className='text-2xl font-medium text-white mb-4'>
              Track the Moon Daily
            </h2>
            <p className='text-zinc-400 mb-6'>
              Get personalized lunar insights based on your birth chart.
            </p>
            <Link
              href='/horoscope'
              className='inline-block px-6 py-3 bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white rounded-lg font-medium transition-colors'
            >
              Get Personalized Insights
            </Link>
          </section>

          <ExploreGrimoire />
        </div>
      </SEOContentTemplate>
    </div>
  );
}
