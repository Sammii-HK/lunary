import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Compass } from 'lucide-react';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
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

  const tableOfContents = [
    { label: 'Planet in Houses', href: '#planet-in-houses' },
    { label: 'House Overview', href: '#house-overview' },
    { label: 'Related Resources', href: '#related-resources' },
  ];

  const heroContent = (
    <div className='text-center'>
      <div className='flex justify-center mb-4'>
        <Compass className='w-16 h-16 text-lunary-primary-400' />
      </div>
      <p className='text-lg text-zinc-400 max-w-3xl mx-auto'>
        Discover how {planetName}&apos;s energy expresses through each of the 12
        astrological houses in your birth chart.
      </p>
    </div>
  );

  const sections = (
    <>
      <section
        id='planet-in-houses'
        className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'
      >
        <h2 className='text-xl font-medium text-zinc-100 mb-3'>
          {planetName} House Placement
        </h2>
        <p className='text-zinc-400'>
          The house containing {planetName} in your birth chart shows where its
          energy naturally focuses. Each house represents a different area of
          life, and {planetName}&apos;s presence there colors your experience of
          that domain.
        </p>
        <p className='text-zinc-400 mt-3'>
          Read the placement alongside the sign for best accuracy. The sign
          describes style, while the house describes the life arena.
        </p>
      </section>
      <section className='mb-12 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6'>
        <h2 className='text-xl font-medium text-zinc-100 mb-3'>Reading Tips</h2>
        <p className='text-sm text-zinc-300'>
          Use the placement to identify patterns: where does this planet feel
          energized, and where does it feel blocked? This gives you a practical
          starting point for growth.
        </p>
      </section>

      <section id='house-overview' className='mb-12'>
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

      <section id='related-resources' className='border-t border-zinc-800 pt-8'>
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
      </section>
    </>
  );

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <SEOContentTemplate
        title={`${planetName} in Houses: All 12 House Placements | Lunary`}
        h1={`${planetName} in Houses`}
        description={`Explore how ${planetName} expresses through each of the 12 houses in your birth chart.`}
        keywords={[
          `${planetName.toLowerCase()} in houses`,
          `${planetName.toLowerCase()} house placement`,
          `${planetName.toLowerCase()} natal chart`,
          `${planetName.toLowerCase()} astrology`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/houses/${planet}`}
        tableOfContents={tableOfContents}
        heroContent={heroContent}
        intro={`${planetName} in houses shows where this planet’s energy lands in your life. Each house shifts the focus, turning the same planet into a different story.`}
        tldr={`${planetName} in houses reveals where your ${planetName.toLowerCase()} energy expresses most strongly. Explore each house to see the life area it activates.`}
        meaning={`${planetName} describes a core function in your chart. The house placement tells you where that function plays out—relationships, career, health, creativity, or inner life. Reading all 12 houses helps you understand the full spectrum of how this planet can express. Use the house placements as a map rather than a label.

If you’re unsure where to start, focus on the house where your ${planetName.toLowerCase()} sits. That is the life area where this planet’s themes show up most consistently.`}
        howToWorkWith={[
          'Find the house where your planet sits and focus on that life area.',
          'Read neighboring houses to see how the theme evolves.',
          'Compare your planet’s house with transits to track timing.',
          'Pair the placement with your sign to add nuance.',
        ]}
        rituals={[
          `Journal about where ${planetName.toLowerCase()} feels most active in your life.`,
          `Set one intention tied to the house your ${planetName.toLowerCase()} occupies.`,
          'Review the placement during major life changes.',
        ]}
        journalPrompts={[
          `Where do I experience ${planetName.toLowerCase()} energy most clearly?`,
          'What house topic needs more attention right now?',
          'How does this placement show up in relationships or work?',
          'What change would help me express this planet more healthfully?',
        ]}
        faqs={[
          {
            question: `What does ${planetName} in a house mean?`,
            answer: `It shows the life area where ${planetName.toLowerCase()} energy expresses most strongly. Different houses shift the focus from inner to outer life.`,
          },
          {
            question: 'Do house placements change over time?',
            answer:
              'Your natal placement stays the same, but transits can activate different houses and emphasize new themes.',
          },
        ]}
        tables={[
          {
            title: `${planetName} Placement Reading`,
            headers: ['Layer', 'Question'],
            rows: [
              ['Planet', 'What energy is it?'],
              ['House', 'Where does it show up?'],
              ['Sign', 'How does it express?'],
            ],
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Houses', href: '/grimoire/houses' },
          { label: `${planetName} in Houses` },
        ]}
        internalLinks={[
          { text: 'Houses Overview', href: '/grimoire/houses/overview' },
          { text: 'Birth Chart Basics', href: '/grimoire/birth-chart' },
          { text: 'Planets', href: '/grimoire/astronomy/planets' },
        ]}
      >
        {sections}
      </SEOContentTemplate>
    </div>
  );
}
