import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Compass } from 'lucide-react';
import {
  HOUSES,
  PLANETS_FOR_HOUSES,
  PLANET_HOUSE_DISPLAY,
  HOUSE_DATA,
  getOrdinalSuffix,
  HousePlanet,
} from '@/constants/seo/houses';

export async function generateStaticParams() {
  return PLANETS_FOR_HOUSES.map((planet) => ({ planet }));
}

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

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <div className='max-w-5xl mx-auto'>
        <div className='text-center mb-12'>
          <div className='flex justify-center mb-4'>
            <Compass className='w-16 h-16 text-lunary-primary-400' />
          </div>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4'>
            {planetName} in Houses
          </h1>
          <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
            Discover how {planetName}&apos;s energy expresses through each of
            the 12 astrological houses in your birth chart.
          </p>
        </div>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'>
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            {planetName} House Placement
          </h2>
          <p className='text-zinc-400'>
            The house containing {planetName} in your birth chart shows where
            its energy naturally focuses. Each house represents a different area
            of life, and {planetName}&apos;s presence there colors your
            experience of that domain.
          </p>
        </div>

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
                  <div className='text-2xl font-light text-lunary-primary-400 mb-2'>
                    {house}
                  </div>
                  <h3 className='font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors text-sm'>
                    {getOrdinalSuffix(house)} House
                  </h3>
                  <p className='text-xs text-zinc-400 mt-1'>
                    {houseData.lifeArea}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <div className='border-t border-zinc-800 pt-8'>
          <h3 className='text-lg font-medium text-zinc-100 mb-4'>
            Related Resources
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/houses'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              All Houses
            </Link>
            <Link
              href='/grimoire/astronomy/planets'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              All Planets
            </Link>
            <Link
              href='/birth-chart'
              className='px-4 py-2 rounded-lg bg-lunary-primary-900/30 text-lunary-primary-300 hover:bg-lunary-primary-900/50 transition-colors'
            >
              Calculate Your Chart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
