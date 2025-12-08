import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ZODIAC_SEASONS, getSeasonDates } from '@/constants/seo/zodiac-seasons';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

interface PageParams {
  year: string;
  season: string;
}

export async function generateStaticParams() {
  const years = ['2025', '2026'];
  const params: PageParams[] = [];

  for (const year of years) {
    for (const s of ZODIAC_SEASONS) {
      params.push({ year, season: s.sign });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { year, season } = await params;
  const yearNum = parseInt(year);
  const seasonData = ZODIAC_SEASONS.find((s) => s.sign === season);

  if (!seasonData || yearNum < 2024 || yearNum > 2030) {
    return { title: 'Season Not Found | Lunary' };
  }

  const dates = getSeasonDates(season, yearNum);
  const title = `${seasonData.displayName} Season ${year}: Dates, Meaning & Rituals | Lunary`;
  const description = `${seasonData.displayName} Season ${year} runs from ${dates.start} to ${dates.end}. Discover the cosmic energy, themes, and rituals for ${seasonData.displayName} season.`;

  return {
    title,
    description,
    keywords: [
      `${seasonData.displayName.toLowerCase()} season ${year}`,
      `${seasonData.displayName.toLowerCase()} season dates`,
      `when is ${seasonData.displayName.toLowerCase()} season`,
      `${seasonData.displayName.toLowerCase()} season meaning`,
      'zodiac season',
      'astrology season',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/seasons/${year}/${season}`,
      images: [
        `/api/og/cosmic?title=${encodeURIComponent(`${seasonData.symbol} ${seasonData.displayName} Season ${year}`)}`,
      ],
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/seasons/${year}/${season}`,
    },
  };
}

export default async function ZodiacSeasonPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { year, season } = await params;
  const yearNum = parseInt(year);
  const seasonData = ZODIAC_SEASONS.find((s) => s.sign === season);

  if (!seasonData || yearNum < 2024 || yearNum > 2030) {
    notFound();
  }

  const dates = getSeasonDates(season, yearNum);
  const seasonIndex = ZODIAC_SEASONS.findIndex((s) => s.sign === season);
  const prevSeason =
    seasonIndex > 0 ? ZODIAC_SEASONS[seasonIndex - 1] : ZODIAC_SEASONS[11];
  const nextSeason =
    seasonIndex < 11 ? ZODIAC_SEASONS[seasonIndex + 1] : ZODIAC_SEASONS[0];

  return (
    <SEOContentTemplate
      title={`${seasonData.displayName} Season ${year}`}
      h1={`${seasonData.symbol} ${seasonData.displayName} Season ${year}`}
      description={`${seasonData.displayName} Season ${year} brings ${seasonData.theme}. From ${dates.start} to ${dates.end}, the Sun travels through ${seasonData.displayName}, activating ${seasonData.element} energy for everyone.`}
      keywords={[
        `${seasonData.displayName} season`,
        year,
        'zodiac season',
        seasonData.element,
      ]}
      canonicalUrl={`https://lunary.app/grimoire/seasons/${year}/${season}`}
      datePublished='2025-01-01'
      dateModified={new Date().toISOString().split('T')[0]}
      articleSection='Zodiac Seasons'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Seasons', href: '/grimoire/seasons' },
        { label: year, href: `/grimoire/seasons/${year}` },
        { label: `${seasonData.displayName} Season` },
      ]}
      whatIs={{
        question: `When is ${seasonData.displayName} Season ${year}?`,
        answer: `${seasonData.displayName} Season ${year} runs from ${dates.start} to ${dates.end}. During this time, the Sun transits through ${seasonData.displayName}, bringing ${seasonData.element} energy and themes of ${seasonData.theme} to everyone, regardless of their Sun sign.`,
      }}
      tldr={`${seasonData.displayName} Season ${year}: ${dates.start} - ${dates.end}. Theme: ${seasonData.theme}. Element: ${seasonData.element}. Natural season: ${seasonData.season}.`}
      meaning={`
## What is ${seasonData.displayName} Season?

${seasonData.displayName} Season occurs when the Sun transits through the zodiac sign of ${seasonData.displayName}. This happens annually from approximately ${dates.start} to ${dates.end}.

### The Energy of ${seasonData.displayName} Season

${seasonData.energy}. This affects everyone, not just those with ${seasonData.displayName} Sun signs. During ${seasonData.displayName} Season, we all experience heightened ${seasonData.element.toLowerCase()} energy.

### Themes of ${seasonData.displayName} Season

The primary theme of ${seasonData.displayName} Season is ${seasonData.theme}. This is an excellent time to focus on activities and intentions that align with these energies.

### ${seasonData.displayName} Season and the Natural World

${seasonData.displayName} Season falls during ${seasonData.season} in the Northern Hemisphere. The qualities of this natural season mirror the astrological energy beautifully.
      `}
      rituals={seasonData.rituals}
      emotionalThemes={[
        seasonData.theme,
        `${seasonData.element} energy activation`,
        `${seasonData.season} themes`,
      ]}
      signsMostAffected={[seasonData.displayName]}
      tables={[
        {
          title: `${seasonData.displayName} Season ${year} Details`,
          headers: ['Aspect', 'Details'],
          rows: [
            ['Sign', `${seasonData.displayName} ${seasonData.symbol}`],
            ['Dates', `${dates.start} - ${dates.end}`],
            ['Element', seasonData.element],
            ['Natural Season', seasonData.season],
            ['Theme', seasonData.theme],
          ],
        },
      ]}
      relatedItems={[
        {
          name: `${seasonData.displayName} Zodiac Sign`,
          href: `/grimoire/zodiac/${season}`,
          type: 'Zodiac',
        },
        {
          name: `${prevSeason.displayName} Season ${year}`,
          href: `/grimoire/seasons/${year}/${prevSeason.sign}`,
          type: 'Season',
        },
        {
          name: `${nextSeason.displayName} Season ${year}`,
          href: `/grimoire/seasons/${year}/${nextSeason.sign}`,
          type: 'Season',
        },
      ]}
      ctaText={`Discover how ${seasonData.displayName} Season affects your chart`}
      ctaHref='/welcome'
      sources={[
        { name: 'Solar transit calculations' },
        { name: 'Traditional astrological seasons' },
      ]}
    >
      <div className='mt-8 flex justify-between text-sm'>
        <Link
          href={`/grimoire/seasons/${year}/${prevSeason.sign}`}
          className='text-lunary-primary-400 hover:text-lunary-primary-300'
        >
          ← {prevSeason.symbol} {prevSeason.displayName} Season
        </Link>
        <Link
          href={`/grimoire/seasons/${year}/${nextSeason.sign}`}
          className='text-lunary-primary-400 hover:text-lunary-primary-300'
        >
          {nextSeason.displayName} Season {nextSeason.symbol} →
        </Link>
      </div>
    </SEOContentTemplate>
  );
}
