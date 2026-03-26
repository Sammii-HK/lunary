import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import MoonPhaseEventList from '@/components/grimoire/MoonPhaseEventList';
import { getMoonEventsForYear } from '@/lib/moon/events';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { getCosmicConnections } from '@/lib/cosmicConnectionsConfig';
import { Heading } from '@/components/ui/Heading';

// 30-day ISR revalidation
export const revalidate = 2592000;
// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

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

  const moonYears = [2025, 2026, 2027, 2028, 2029, 2030];
  const cosmicSections = [
    ...getCosmicConnections('hub-moon', 'moon'),
    {
      title: `${year} Links`,
      links: [
        { label: 'Moon Rituals', href: '/grimoire/moon/rituals' },
        { label: 'Moon Signs', href: '/grimoire/moon/signs' },
        {
          label: `${year} Moon Calendar`,
          href: `/grimoire/moon/${year}`,
        },
        {
          label: 'Moon Phases Guide',
          href: '/grimoire/guides/moon-phases-guide',
        },
      ],
    },
    {
      title: 'Other Lunar Years',
      links: moonYears
        .filter((y) => y !== yearNum)
        .map((y) => ({
          label: `${y} Moon Calendar`,
          href: `/grimoire/moon/${y}`,
        })),
    },
  ];

  return (
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
      cosmicConnections={
        <CosmicConnections
          entityType='hub-moon'
          entityKey='moon'
          title='Moon Cosmic Connections'
          sections={cosmicSections}
        />
      }
    >
      <div className='space-y-12'>
        <section className='mb-12'>
          <Heading as='h2' variant='h2'>
            Full Moons {year}
          </Heading>
          <p className='text-sm text-zinc-400 mb-6'>
            Dates and times reflect your browser’s current timezone.
          </p>
          <MoonPhaseEventList events={fullMoons} year={year} type='full' />
        </section>

        <section className='mb-12'>
          <Heading as='h2' variant='h2'>
            New Moons {year}
          </Heading>
          <p className='text-sm text-zinc-400 mb-6'>
            Times adjust to your browser’s timezone so every intention is on
            point.
          </p>
          <MoonPhaseEventList events={newMoons} year={year} type='new' />
        </section>
      </div>
    </SEOContentTemplate>
  );
}
