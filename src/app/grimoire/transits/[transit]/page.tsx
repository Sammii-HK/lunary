import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  YEARLY_TRANSITS,
  getTransitsForYear,
  generateAllTransitParams,
} from '@/constants/seo/yearly-transits';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export async function generateStaticParams() {
  return generateAllTransitParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ transit: string }>;
}): Promise<Metadata> {
  const { transit: transitId } = await params;

  const transit = YEARLY_TRANSITS.find((t) => t.id === transitId);
  if (!transit) {
    return { title: 'Transit Not Found | Lunary' };
  }

  const title = `${transit.title}: ${transit.transitType} Meaning & Dates | Lunary`;
  const description = `${transit.title} (${transit.dates}). ${transit.description.slice(0, 150)}...`;

  return {
    title,
    description,
    keywords: [
      transit.title.toLowerCase(),
      transit.transitType.toLowerCase(),
      `${transit.planet.toLowerCase()} transit ${transit.year}`,
      ...transit.signs.map(
        (s) => `${transit.planet.toLowerCase()} in ${s.toLowerCase()}`,
      ),
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/transits/${transitId}`,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/transits/${transitId}`,
    },
  };
}

export default async function TransitPage({
  params,
}: {
  params: Promise<{ transit: string }>;
}) {
  const { transit: transitId } = await params;

  const transit = YEARLY_TRANSITS.find((t) => t.id === transitId);
  if (!transit) {
    notFound();
  }

  const sameYearTransits = getTransitsForYear(transit.year).filter(
    (t) => t.id !== transitId,
  );

  return (
    <SEOContentTemplate
      title={transit.title}
      h1={transit.title}
      description={transit.description}
      keywords={[transit.transitType, transit.planet, ...transit.signs]}
      canonicalUrl={`https://lunary.app/grimoire/transits/${transitId}`}
      datePublished='2025-01-01'
      dateModified={new Date().toISOString().split('T')[0]}
      articleSection='Yearly Transits'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Transits', href: '/grimoire/transits' },
        {
          label: String(transit.year),
          href: `/grimoire/transits/year/${transit.year}`,
        },
        { label: transit.title },
      ]}
      whatIs={{
        question: `What is ${transit.title}?`,
        answer: transit.description,
      }}
      tldr={`${transit.title} (${transit.dates}). Planet: ${transit.planet}. Signs: ${transit.signs.join(', ')}. Key themes: ${transit.themes.join(', ')}.`}
      meaning={`
## ${transit.title}

${transit.description}

### When Does This Transit Occur?

${transit.dates}

### Signs Most Affected

${transit.signs.join(', ')} ${transit.signs.length > 1 ? 'are' : 'is'} directly impacted by this transit.

### Key Themes

${transit.themes.map((t) => `- ${t.charAt(0).toUpperCase() + t.slice(1)}`).join('\n')}

### What to Do During This Transit

${transit.doList.map((d) => `- ${d}`).join('\n')}

### What to Avoid

${transit.avoidList.map((a) => `- ${a}`).join('\n')}
      `}
      rituals={transit.doList}
      emotionalThemes={transit.themes.map(
        (t) => t.charAt(0).toUpperCase() + t.slice(1),
      )}
      signsMostAffected={transit.signs}
      tables={[
        {
          title: 'Transit Overview',
          headers: ['Property', 'Value'],
          rows: [
            ['Transit', transit.transitType],
            ['Planet', transit.planet],
            ['Year', String(transit.year)],
            ['Dates', transit.dates],
            ['Signs', transit.signs.join(', ')],
          ],
        },
      ]}
      relatedItems={[
        {
          name: transit.planet,
          href: `/grimoire/astronomy/planets/${transit.planet.toLowerCase()}`,
          type: 'Planet',
        },
        ...transit.signs.slice(0, 2).map((s) => ({
          name: s,
          href: `/grimoire/zodiac/${s.toLowerCase()}`,
          type: 'Zodiac' as const,
        })),
      ]}
      ctaText='See how this transit affects your chart'
      ctaHref='/welcome'
      sources={[{ name: 'Ephemeris calculations' }]}
    >
      {sameYearTransits.length > 0 && (
        <div className='mt-8'>
          <h3 className='text-lg font-medium mb-4'>
            Other {transit.year} Transits
          </h3>
          <div className='flex flex-wrap gap-2'>
            {sameYearTransits.map((t) => (
              <Link
                key={t.id}
                href={`/grimoire/transits/${t.id}`}
                className='px-3 py-1.5 rounded-lg text-sm bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors'
              >
                {t.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </SEOContentTemplate>
  );
}
