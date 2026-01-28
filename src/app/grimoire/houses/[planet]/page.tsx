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
} from '@/constants/seo/houses';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { Heading } from '@/components/ui/Heading';

// 30-day ISR revalidation
export const revalidate = 2592000;
// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<{ planet: string }>;
}): Promise<Metadata> {
  const { planet } = await params;

  if (!PLANETS_FOR_HOUSES.includes(planet as HousePlanet)) {
    return { title: 'Planet Not Found | Lunary' };
  }

  const planetName = PLANET_HOUSE_DISPLAY[planet as HousePlanet];
  const title = `${planetName} in Houses: All 12 House Placements | Lunary`;
  const description = `Explore ${planetName} through all 12 houses. Learn how ${planetName}'s energy manifests in different life areas of your birth chart.`;

  return {
    title,
    description,
    keywords: [
      `${planetName.toLowerCase()} in houses`,
      `${planetName.toLowerCase()} house placement`,
      `${planetName.toLowerCase()} natal chart`,
      `${planetName.toLowerCase()} astrology`,
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/houses/${planet}`,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/houses/${planet}`,
    },
  };
}

export default async function PlanetInHousesPage({
  params,
}: {
  params: Promise<{ planet: string }>;
}) {
  const { planet } = await params;

  if (!PLANETS_FOR_HOUSES.includes(planet as HousePlanet)) {
    notFound();
  }

  const planetName = PLANET_HOUSE_DISPLAY[planet as HousePlanet];
  const pageTitle = `${planetName} in Houses: All 12 House Placements`;
  const pageDescription = `Discover how ${planetName}'s energy expresses through each of the 12 houses in the birth chart.`;
  const pageKeywords = [
    `${planetName.toLowerCase()} in houses`,
    `${planetName.toLowerCase()} house placement`,
    `${planetName.toLowerCase()} natal chart`,
    `${planetName.toLowerCase()} astrology`,
  ];

  return (
    <SEOContentTemplate
      title={pageTitle}
      h1={`${planetName} in Houses`}
      description={pageDescription}
      keywords={pageKeywords}
      canonicalUrl={`https://lunary.app/grimoire/houses/${planet}`}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Houses', href: '/grimoire/houses' },
        { label: planetName },
      ]}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-placements'
          entityKey='houses'
          title='House Connections'
        />
      }
      whatIs={{
        question: `What does the ${planetName} in your House mean?`,
        answer: `The house containing ${planetName} in your birth chart shows where
            its energy naturally focuses. Each house represents a different
            area of life, and ${planetName}'s presence there colors your
            experience of that domain.`,
      }}
    >
      <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
        <div className='max-w-5xl mx-auto'>
          <section className='mb-12'>
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
              {HOUSES.map((house) => {
                const houseData = HOUSE_DATA[house];
                return (
                  <Link
                    key={house}
                    href={`/grimoire/houses/${planet}/${house}`}
                    className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all'
                  >
                    <Heading
                      as='h2'
                      variant='h2'
                      className='text-lunary-accent-200'
                    >
                      {getOrdinalSuffix(house)} House
                    </Heading>
                    <p className='text-xs text-zinc-400 mt-1'>
                      {houseData.lifeArea}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </SEOContentTemplate>
  );
}
