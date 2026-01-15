import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { Moon, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { MoonPhase } from 'astronomy-engine';
import { getRealPlanetaryPositions } from '../../../../../utils/astrology/cosmic-og';

// Moon names by month
const moonNames: { [key: number]: string } = {
  1: 'Wolf Moon',
  2: 'Snow Moon',
  3: 'Worm Moon',
  4: 'Pink Moon',
  5: 'Flower Moon',
  6: 'Strawberry Moon',
  7: 'Buck Moon',
  8: 'Sturgeon Moon',
  9: 'Harvest Moon',
  10: 'Hunter Moon',
  11: 'Beaver Moon',
  12: 'Cold Moon',
};

// Month names
const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface MoonEvent {
  month: string;
  name: string;
  sign: string;
  date: string;
  dateObj: Date;
}

function calculateMoonPhasesForYear(year: number): {
  fullMoons: MoonEvent[];
  newMoons: MoonEvent[];
} {
  const fullMoons: MoonEvent[] = [];
  const newMoons: MoonEvent[] = [];

  const startDate = new Date(year, 0, 1, 12, 0, 0); // Start at noon on Jan 1
  const endDate = new Date(year, 11, 31, 23, 59, 59); // End of Dec 31

  let currentDate = new Date(startDate);
  const checkInterval = 6 * 60 * 60 * 1000; // Check every 6 hours

  let lastFullMoonMonth = -1;
  let lastNewMoonMonth = -1;

  while (currentDate <= endDate) {
    const moonPhaseAngle = MoonPhase(currentDate);

    // Check for full moon (phase angle ~180°)
    const isFullMoon = moonPhaseAngle >= 175 && moonPhaseAngle <= 185;
    const currentMonth = currentDate.getMonth();

    // Check for new moon (phase angle ~0° or ~360°)
    const isNewMoon = moonPhaseAngle >= 355 || moonPhaseAngle <= 5;

    if (isFullMoon && currentMonth !== lastFullMoonMonth) {
      const positions = getRealPlanetaryPositions(currentDate);
      const moonSign = positions.Moon?.sign || 'Unknown';
      const monthName = monthNames[currentMonth];
      const moonName = moonNames[currentMonth + 1] || 'Full Moon';
      // Format date to match 2026 page format: "January 13"
      const dateStr = `${monthName} ${currentDate.getDate()}`;

      fullMoons.push({
        month: monthName,
        name: moonName,
        sign: moonSign,
        date: dateStr,
        dateObj: new Date(currentDate),
      });

      lastFullMoonMonth = currentMonth;
    }

    if (isNewMoon && currentMonth !== lastNewMoonMonth) {
      const positions = getRealPlanetaryPositions(currentDate);
      const moonSign = positions.Moon?.sign || 'Unknown';
      const monthName = monthNames[currentMonth];
      // Format date to match 2026 page format: "January 13"
      const dateStr = `${monthName} ${currentDate.getDate()}`;

      newMoons.push({
        month: monthName,
        name: 'New Moon',
        sign: moonSign,
        date: dateStr,
        dateObj: new Date(currentDate),
      });

      lastNewMoonMonth = currentMonth;
    }

    currentDate.setTime(currentDate.getTime() + checkInterval);
  }

  // Sort by date
  fullMoons.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  newMoons.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  return { fullMoons, newMoons };
}

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
        `/api/og/educational/moon?title=${encodeURIComponent(`${year} Moon Calendar`)}&subtitle=${encodeURIComponent('Full Moon • New Moon • Lunar Phases')}&format=landscape`,
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

  const { fullMoons, newMoons } = calculateMoonPhasesForYear(yearNum);

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
            <h2 className='text-2xl font-medium text-white mb-6 flex items-center gap-2'>
              <Sparkles className='h-6 w-6 text-lunary-accent' />
              Full Moons {year}
            </h2>
            <div className='grid gap-4'>
              {fullMoons.map((moon) => (
                <Link
                  key={`${moon.month}-${moon.date}`}
                  href={`/grimoire/moon/${year}/full-moon-${moon.month.toLowerCase()}`}
                  className='group flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl hover:bg-zinc-800/50 hover:border-lunary-primary-600 transition-all'
                >
                  <div className='flex items-center gap-4'>
                    <span className='text-2xl'>🌕</span>
                    <div>
                      <h3 className='font-medium text-white group-hover:text-lunary-primary-300'>
                        {moon.name}
                      </h3>
                      <p className='text-sm text-zinc-400'>
                        {moon.date} • {moon.sign}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className='h-5 w-5 text-zinc-600 group-hover:text-lunary-primary-400 transition-colors' />
                </Link>
              ))}
            </div>
          </section>

          <section className='mb-12'>
            <h2 className='text-2xl font-medium text-white mb-6 flex items-center gap-2'>
              <Moon className='h-6 w-6 text-lunary-primary-400' />
              New Moons {year}
            </h2>
            <div className='grid gap-4'>
              {newMoons.map((moon) => (
                <Link
                  key={`${moon.month}-${moon.date}`}
                  href={`/grimoire/moon/${year}/new-moon-${moon.month.toLowerCase()}`}
                  className='group flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl hover:bg-zinc-800/50 hover:border-lunary-primary-600 transition-all'
                >
                  <div className='flex items-center gap-4'>
                    <span className='text-2xl'>🌑</span>
                    <div>
                      <h3 className='font-medium text-white group-hover:text-lunary-primary-300'>
                        New Moon in {moon.sign}
                      </h3>
                      <p className='text-sm text-zinc-400'>{moon.date}</p>
                    </div>
                  </div>
                  <ArrowRight className='h-5 w-5 text-zinc-600 group-hover:text-lunary-primary-400 transition-colors' />
                </Link>
              ))}
            </div>
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
        </div>
      </SEOContentTemplate>
    </div>
  );
}
