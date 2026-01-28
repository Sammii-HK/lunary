import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  HOUSES,
  PLANETS_FOR_HOUSES,
  PLANET_HOUSE_DISPLAY,
  HOUSE_DATA,
  getOrdinalSuffix,
  HousePlanet,
  House,
} from '@/constants/seo/houses';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

// 30-day ISR revalidation
export const revalidate = 2592000;
interface PageParams {
  planet: string;
  house: string;
}

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { planet, house: houseStr } = await params;
  const house = parseInt(houseStr) as House;

  if (
    !PLANETS_FOR_HOUSES.includes(planet as HousePlanet) ||
    !HOUSES.includes(house)
  ) {
    return { title: 'House Placement Not Found | Lunary' };
  }

  const planetName = PLANET_HOUSE_DISPLAY[planet as HousePlanet];
  const houseData = HOUSE_DATA[house];
  const ordinal = getOrdinalSuffix(house);

  const title = `${planetName} in the ${ordinal} House: Meaning & Interpretation | Lunary`;
  const description = `${planetName} in the ${ordinal} House meaning in astrology. Learn how ${planetName} influences ${houseData.lifeArea.toLowerCase()} in your natal chart.`;

  return {
    title,
    description,
    keywords: [
      `${planetName.toLowerCase()} in ${ordinal} house`,
      `${planetName.toLowerCase()} ${ordinal} house`,
      `${ordinal} house ${planetName.toLowerCase()}`,
      `${planetName.toLowerCase()} house placement`,
      'natal chart houses',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/houses/${planet}/${house}`,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/houses/${planet}/${house}`,
    },
  };
}

export default async function HousePlacementPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { planet, house: houseStr } = await params;
  const house = parseInt(houseStr) as House;

  if (
    !PLANETS_FOR_HOUSES.includes(planet as HousePlanet) ||
    !HOUSES.includes(house)
  ) {
    notFound();
  }

  const planetName = PLANET_HOUSE_DISPLAY[planet as HousePlanet];
  const houseData = HOUSE_DATA[house];
  const ordinal = getOrdinalSuffix(house);

  return (
    <SEOContentTemplate
      title={`${planetName} in the ${ordinal} House`}
      h1={`${planetName} in the ${ordinal} House`}
      description={`When ${planetName} is placed in the ${ordinal} House, it brings its energy to the area of ${houseData.lifeArea.toLowerCase()}. This placement shapes how you experience ${houseData.keywords[0]} and ${houseData.keywords[1]}.`}
      keywords={[`${planetName} ${ordinal} house`, ...houseData.keywords]}
      canonicalUrl={`https://lunary.app/grimoire/houses/${planet}/${house}`}
      datePublished='2025-01-01'
      dateModified={new Date().toISOString().split('T')[0]}
      articleSection='House Placements'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Houses', href: '/grimoire/houses' },
        { label: `${planetName} in ${ordinal} House` },
      ]}
      whatIs={{
        question: `What does ${planetName} in the ${ordinal} House mean?`,
        answer: `${planetName} in the ${ordinal} House places ${planetName}'s energy in the realm of ${houseData.lifeArea.toLowerCase()}. The ${ordinal} House is naturally associated with ${houseData.naturalSign} and ruled by ${houseData.naturalRuler}. ${houseData.description}`,
      }}
      tldr={`${planetName} in House ${house} influences: ${houseData.lifeArea}. Natural sign: ${houseData.naturalSign}. Keywords: ${houseData.keywords.join(', ')}.`}
      meaning={`
## ${planetName} in the ${houseData.name}

${houseData.description}

When ${planetName} occupies this house, it brings its unique energy to these life areas.

### Life Areas Affected

This placement influences:
${houseData.keywords.map((k) => `- ${k.charAt(0).toUpperCase() + k.slice(1)}`).join('\n')}

### Expression of ${planetName} Energy

${planetName} in the ${ordinal} House expresses through ${houseData.lifeArea.toLowerCase()}. The way you approach ${houseData.keywords[0]} is colored by ${planetName}'s qualities.

### Natural Ruler Connection

The ${ordinal} House is naturally associated with ${houseData.naturalSign} and ruled by ${houseData.naturalRuler}. Having ${planetName} here creates a dialogue between ${planetName}'s energy and ${houseData.naturalRuler}'s themes.
      `}
      emotionalThemes={houseData.keywords.map(
        (k) => k.charAt(0).toUpperCase() + k.slice(1),
      )}
      signsMostAffected={[houseData.naturalSign]}
      tables={[
        {
          title: `${ordinal} House Overview`,
          headers: ['Property', 'Value'],
          rows: [
            ['House', ordinal],
            ['Life Area', houseData.lifeArea],
            ['Natural Sign', houseData.naturalSign],
            ['Natural Ruler', houseData.naturalRuler],
            ['Keywords', houseData.keywords.join(', ')],
          ],
        },
      ]}
      relatedItems={[
        {
          name: planetName,
          href: `/grimoire/astronomy/planets/${planet}`,
          type: 'Planet',
        },
        {
          name: `${houseData.naturalSign}`,
          href: `/grimoire/zodiac/${houseData.naturalSign.toLowerCase()}`,
          type: 'Zodiac',
        },
        { name: 'Houses Overview', href: '/grimoire/houses', type: 'Guide' },
      ]}
      ctaText='Find your house placements'
      ctaHref='/birth-chart'
      sources={[{ name: 'Traditional house meanings' }]}
    >
      <div className='mt-8'>
        <h3 className='text-lg font-medium mb-4'>
          {planetName} in Other Houses
        </h3>
        <div className='flex flex-wrap gap-2'>
          {HOUSES.map((h) => (
            <Link
              key={h}
              href={`/grimoire/houses/${planet}/${h}`}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                h === house
                  ? 'bg-lunary-primary-900/30 text-lunary-primary-200 border border-lunary-primary-600'
                  : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {getOrdinalSuffix(h)}
            </Link>
          ))}
        </div>
      </div>
    </SEOContentTemplate>
  );
}
