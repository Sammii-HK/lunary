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
import { astrologicalHouses } from '@/constants/grimoire/seo-data';
import { createCosmicEntitySchema, renderJsonLd } from '@/lib/schema';

// 30-day ISR revalidation
export const revalidate = 2592000;

// Map URL slugs (1st-house, 2nd-house, etc.) to house keys
const houseSlugMap: Record<string, keyof typeof astrologicalHouses> = {
  '1st-house': 'first',
  '2nd-house': 'second',
  '3rd-house': 'third',
  '4th-house': 'fourth',
  '5th-house': 'fifth',
  '6th-house': 'sixth',
  '7th-house': 'seventh',
  '8th-house': 'eighth',
  '9th-house': 'ninth',
  '10th-house': 'tenth',
  '11th-house': 'eleventh',
  '12th-house': 'twelfth',
};

// Get ordinal string from house number
function getOrdinal(num: number): string {
  if (num === 1) return '1st';
  if (num === 2) return '2nd';
  if (num === 3) return '3rd';
  return `${num}th`;
}

// Detect if slug is a house or a planet
function isHouseSlug(slug: string): boolean {
  return slug.toLowerCase() in houseSlugMap;
}

function isPlanetSlug(slug: string): boolean {
  return PLANETS_FOR_HOUSES.includes(slug as HousePlanet);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const slugLower = slug.toLowerCase();

  // Handle house detail pages (1st-house, 2nd-house, etc.)
  if (isHouseSlug(slugLower)) {
    const houseKey = houseSlugMap[slugLower];
    const houseData = astrologicalHouses[houseKey];
    const ordinal = getOrdinal(houseData.number);

    const title = `${ordinal} House in Astrology: ${houseData.keywords[0]}, ${houseData.keywords[1]} & Meaning | Lunary`;
    const description = `What is the ${ordinal} house in astrology? The ${houseData.name} governs ${houseData.area.toLowerCase()}. Learn how planets in your ${ordinal} house shape ${houseData.themes[0].toLowerCase()}. Complete guide with examples.`;

    return {
      title,
      description,
      keywords: [
        `${ordinal} house astrology`,
        `${ordinal} house meaning`,
        `${houseData.name.toLowerCase()} astrology`,
        `planets in ${ordinal} house`,
        `${houseData.keywords[0].toLowerCase()} house`,
        `house ${houseData.number} astrology`,
        `${ordinal} house birth chart`,
      ],
      openGraph: {
        title,
        description,
        url: `https://lunary.app/grimoire/houses/${slug}`,
        siteName: 'Lunary',
        images: [
          {
            url: '/api/og/grimoire/houses',
            width: 1200,
            height: 630,
            alt: `${ordinal} House in Astrology`,
          },
        ],
        locale: 'en_US',
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/api/og/grimoire/houses'],
      },
      alternates: {
        canonical: `https://lunary.app/grimoire/houses/${slug}`,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  }

  // Handle planet-in-houses pages (mars, venus, etc.)
  if (isPlanetSlug(slugLower)) {
    const planetName = PLANET_HOUSE_DISPLAY[slugLower as HousePlanet];
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
        url: `https://lunary.app/grimoire/houses/${slug}`,
      },
      alternates: {
        canonical: `https://lunary.app/grimoire/houses/${slug}`,
      },
    };
  }

  return { title: 'Not Found | Lunary' };
}

// House detail page component
function HouseDetailPage({
  slug,
  houseKey,
}: {
  slug: string;
  houseKey: keyof typeof astrologicalHouses;
}) {
  const houseData = astrologicalHouses[houseKey];
  const ordinal = getOrdinal(houseData.number);

  // Extra notes for upper houses (10, 11, 12)
  const extraHouseNotes =
    houseData.number === 10
      ? `\n\nThe ${ordinal} House is strongly tied to career, reputation, and life direction. It relates to the Midheaven (MC) and shows how you want to be seen for your work in the world.`
      : houseData.number === 11
        ? `\n\nThe ${ordinal} House highlights community, collaboration, and long-term goals. It shows the kind of networks that support your future.`
        : houseData.number === 12
          ? `\n\nThe ${ordinal} House governs solitude, subconscious patterns, and spiritual restoration. It often asks for quiet reflection before major decisions.`
          : '';

  const isUpperHouse = [10, 11, 12].includes(houseData.number);

  // Comprehensive FAQs
  const faqs = [
    {
      question: `What is the ${ordinal} house in astrology?`,
      answer: `The ${ordinal} house in astrology governs ${houseData.area.toLowerCase()}. It reveals how you approach ${houseData.themes[0].toLowerCase()} and expresses themes like ${houseData.themes.slice(0, 3).join(', ').toLowerCase()}. This house is ruled by ${houseData.rulingSign} and ${houseData.rulingPlanet}.`,
    },
    {
      question: `What does the ${ordinal} house represent?`,
      answer: `The ${ordinal} house represents ${houseData.area.toLowerCase()}. It governs ${houseData.themes.join(', ').toLowerCase()}. When planets are in this house, they influence these life areas.`,
    },
    {
      question: `What planets rule the ${ordinal} house?`,
      answer: `The ${ordinal} house is naturally ruled by ${houseData.rulingPlanet} and associated with ${houseData.rulingSign}. However, any planet can be placed in your ${ordinal} house depending on your birth chart.`,
    },
    {
      question: `How does the ${ordinal} house affect my birth chart?`,
      answer: `Planets in your ${ordinal} house reveal how you express energy related to ${houseData.area.toLowerCase()}. The sign on the cusp shows your natural approach to these themes. Understanding this house helps you work consciously with ${houseData.themes[0].toLowerCase()}.`,
    },
    {
      question: `How do I know what sign is in my ${ordinal} house?`,
      answer: `Your ${ordinal} house sign is determined by your birth chart. Calculate your chart using your exact birth time, date, and location to discover your house placements.`,
    },
  ];

  // Entity schema for Knowledge Graph
  const houseSchema = createCosmicEntitySchema({
    name: `${houseData.name} in Astrology`,
    description: `The ${houseData.name} (${houseData.symbol}) governs ${houseData.area.toLowerCase()}. ${houseData.description.slice(0, 100)}...`,
    url: `/grimoire/houses/${slug}`,
    additionalType: 'https://en.wikipedia.org/wiki/House_(astrology)',
    keywords: [
      houseData.name,
      `${ordinal} house astrology`,
      'astrological house',
      'natal chart houses',
      houseData.area,
    ],
  });

  // Related items with extra links for upper houses
  const relatedItems = [
    {
      name: 'Birth Chart Guide',
      href: '/grimoire/birth-chart',
      type: 'Guide' as const,
    },
    {
      name: 'Get Your Birth Chart',
      href: '/birth-chart',
      type: 'Tool' as const,
    },
    {
      name: houseData.rulingSign,
      href: `/grimoire/zodiac/${houseData.rulingSign.toLowerCase()}`,
      type: 'Zodiac Sign' as const,
    },
    {
      name: houseData.rulingPlanet,
      href: `/grimoire/astronomy/planets/${houseData.rulingPlanet.toLowerCase()}`,
      type: 'Planet' as const,
    },
    ...(isUpperHouse
      ? [
          {
            name: 'Rising Sign',
            href: '/grimoire/rising',
            type: 'Guide' as const,
          },
          {
            name: 'Life Path Numbers',
            href: '/grimoire/life-path',
            type: 'Guide' as const,
          },
        ]
      : []),
  ];

  // Internal links
  const internalLinks = [
    { text: 'Calculate Birth Chart', href: '/birth-chart' },
    { text: "View Today's Horoscope", href: '/horoscope' },
    { text: 'Explore All Houses', href: '/grimoire/houses' },
    { text: 'Zodiac Signs', href: '/grimoire/zodiac' },
    ...(isUpperHouse
      ? [
          { text: 'Rising Sign (Ascendant)', href: '/grimoire/rising' },
          { text: 'Planets in Astrology', href: '/grimoire/astronomy/planets' },
          { text: 'Astrology Placements', href: '/grimoire/placements' },
        ]
      : []),
    { text: 'Grimoire Home', href: '/grimoire' },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      {renderJsonLd(houseSchema)}
      <SEOContentTemplate
        title={houseData.name}
        h1={`The ${ordinal} House in Astrology: ${houseData.area}`}
        description={`Discover everything about the ${houseData.name} in astrology. Learn about its meaning, themes, and influence on your birth chart.`}
        keywords={[
          `${houseData.name}`,
          `${ordinal} house`,
          `${houseData.symbol} house`,
          `house ${houseData.number}`,
          `${houseData.name} astrology`,
          `planets in ${ordinal} house`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/houses/${slug}`}
        whatIs={{
          question: `What is the ${ordinal} house in astrology?`,
          answer: `The ${ordinal} house in astrology governs ${houseData.area.toLowerCase()}. Ruled by ${houseData.rulingSign} and ${houseData.rulingPlanet}, this ${houseData.element} house reveals how you approach ${houseData.themes[0].toLowerCase()} in your life. Planets placed here shape your experience of ${houseData.themes.slice(0, 2).join(' and ').toLowerCase()}.`,
        }}
        intro={`The ${houseData.name}, represented by ${houseData.symbol}, is the ${ordinal} house in astrology. It governs ${houseData.area.toLowerCase()} and is ruled by ${houseData.rulingSign} (${houseData.element} element).`}
        tldr={`The ${ordinal} house governs ${houseData.area.toLowerCase()}. Ruled by ${houseData.rulingSign} & ${houseData.rulingPlanet}. Key themes: ${houseData.themes.slice(0, 3).join(', ').toLowerCase()}. Element: ${houseData.element}.`}
        meaning={`The ${houseData.name} is one of the twelve astrological houses, each representing a different area of life. This house governs ${houseData.area.toLowerCase()}.

${houseData.description}

The ${houseData.name} is ruled by ${houseData.rulingSign}, a ${houseData.element} sign, and its ruling planet is ${houseData.rulingPlanet}. This connection influences how energy is expressed in this house.

When planets are placed in your ${houseData.name}, they activate themes related to ${houseData.themes.join(', ').toLowerCase()}. The sign on the cusp of this house shows your approach and style in these areas.

## Planets in the ${ordinal} House

Any planet can appear in your ${ordinal} house, and each brings its unique energy to ${houseData.area.toLowerCase()}:

**Sun in ${ordinal} House:** Your core identity and life purpose express through ${houseData.area.toLowerCase()}. This placement makes ${houseData.themes[0].toLowerCase()} central to who you are.

**Moon in ${ordinal} House:** Your emotions and instincts are deeply connected to ${houseData.area.toLowerCase()}. You feel most secure when honoring ${houseData.themes[0].toLowerCase()}.

**Mercury in ${ordinal} House:** You think and communicate about ${houseData.area.toLowerCase()}. Mental energy flows toward ${houseData.themes[0].toLowerCase()}.

**Venus in ${ordinal} House:** You find beauty and value in ${houseData.area.toLowerCase()}. Relationships may connect to ${houseData.themes[0].toLowerCase()}.

**Mars in ${ordinal} House:** You take action through ${houseData.area.toLowerCase()}. Drive and ambition express via ${houseData.themes[0].toLowerCase()}.

**Jupiter in ${ordinal} House:** Expansion and growth come through ${houseData.area.toLowerCase()}. This placement often brings opportunity in ${houseData.themes[0].toLowerCase()}.

**Saturn in ${ordinal} House:** You learn discipline and mastery in ${houseData.area.toLowerCase()}. Challenges teach valuable lessons about ${houseData.themes[0].toLowerCase()}.

The specific influence depends on the planet's sign, aspects, and your overall chart. Each planet colors how you experience the ${ordinal} house themes.${extraHouseNotes}

Understanding your ${houseData.name} helps you work consciously with energy related to ${houseData.area.toLowerCase()}.`}
        glyphs={[houseData.symbol]}
        emotionalThemes={houseData.themes}
        astrologyCorrespondences={`House Number: ${houseData.number}
Symbol: ${houseData.symbol}
Ruling Sign: ${houseData.rulingSign}
Ruling Planet: ${houseData.rulingPlanet}
Element: ${houseData.element}
Area: ${houseData.area}`}
        howToWorkWith={[
          `Study planets in your ${ordinal} House`,
          `Note the sign on your ${ordinal} House cusp`,
          `Observe transits through your ${ordinal} House`,
          `Work with ${houseData.rulingPlanet} for house support`,
          `Honor ${houseData.element} element practices`,
          `Use ${houseData.name} energy for growth`,
        ]}
        tables={[
          {
            title: `${ordinal} House Correspondences`,
            headers: ['Aspect', 'Details'],
            rows: [
              ['House Name', houseData.name],
              ['Keywords', houseData.keywords.join(', ')],
              ['Element', houseData.element],
              ['Ruling Sign', houseData.rulingSign],
              ['Ruling Planet', houseData.rulingPlanet],
              ['Life Area', houseData.area],
              ['Themes', houseData.themes.join(', ')],
            ],
          },
        ]}
        journalPrompts={[
          `What planets do I have in my ${ordinal} House?`,
          `How do ${houseData.keywords[0].toLowerCase()} themes show up in my life?`,
          `What sign rules my ${ordinal} House?`,
          `How can I work with my ${ordinal} House energy?`,
        ]}
        relatedItems={relatedItems}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Houses', href: '/grimoire/houses' },
          {
            label: `${ordinal} House`,
            href: `/grimoire/houses/${slug}`,
          },
        ]}
        internalLinks={internalLinks}
        ctaText={`Want to see planets in your ${houseData.name}?`}
        ctaHref='/birth-chart'
        faqs={faqs}
        cosmicConnections={
          <CosmicConnections
            entityType='house'
            entityKey={houseKey}
            title={`${houseData.name} Cosmic Connections`}
          />
        }
      />
    </div>
  );
}

// Planet-in-houses overview page component
function PlanetInHousesPage({ planet }: { planet: HousePlanet }) {
  const planetName = PLANET_HOUSE_DISPLAY[planet];
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

export default async function HousesSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const slugLower = slug.toLowerCase();

  // Handle house detail pages (1st-house, 2nd-house, etc.)
  if (isHouseSlug(slugLower)) {
    const houseKey = houseSlugMap[slugLower];
    return <HouseDetailPage slug={slug} houseKey={houseKey} />;
  }

  // Handle planet-in-houses pages (mars, venus, etc.)
  if (isPlanetSlug(slugLower)) {
    return <PlanetInHousesPage planet={slugLower as HousePlanet} />;
  }

  notFound();
}
