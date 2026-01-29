import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { astrologicalHouses } from '@/constants/grimoire/seo-data';
import { stringToKebabCase } from '../../../../../../utils/string';
import { createCosmicEntitySchema, renderJsonLd } from '@/lib/schema';

// 30-day ISR revalidation
export const revalidate = 2592000;
const houseKeys = Object.keys(astrologicalHouses);

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<{ house: string }>;
}): Promise<Metadata> {
  const { house } = await params;
  const houseKey = houseKeys.find(
    (h) => stringToKebabCase(h) === house.toLowerCase(),
  );

  if (!houseKey) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const houseData =
    astrologicalHouses[houseKey as keyof typeof astrologicalHouses];
  const ordinal =
    houseData.number === 1
      ? '1st'
      : houseData.number === 2
        ? '2nd'
        : houseData.number === 3
          ? '3rd'
          : `${houseData.number}th`;
  const title = `${ordinal} House in Astrology: Meaning, Planets & Themes`;
  const description = `Discover the ${ordinal} house in astrology: what it reveals about ${houseData.area.toLowerCase()}. Learn how planets in your ${ordinal} house shape your ${houseData.themes[0].toLowerCase()}. Complete guide with examples.`;

  return {
    title,
    description,
    keywords: [
      `${houseData.name} astrology`,
      `${houseData.name} meaning`,
      `${ordinal} house`,
      `planets in ${ordinal} house`,
      `${houseData.symbol} house`,
      `house ${houseData.number}`,
      `${houseData.name} birth chart`,
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/houses/overview/${house}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/grimoire/houses',
          width: 1200,
          height: 630,
          alt: `${houseData.name}`,
        },
      ],
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/api/og/cosmic'],
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/houses/overview/${house}`,
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

export default async function HousePage({
  params,
}: {
  params: Promise<{ house: string }>;
}) {
  const { house } = await params;
  const houseKey = houseKeys.find(
    (h) => stringToKebabCase(h) === house.toLowerCase(),
  );

  if (!houseKey) {
    notFound();
  }

  const houseData =
    astrologicalHouses[houseKey as keyof typeof astrologicalHouses];

  const ordinal =
    houseData.number === 1
      ? '1st'
      : houseData.number === 2
        ? '2nd'
        : houseData.number === 3
          ? '3rd'
          : `${houseData.number}th`;

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
      question: `What are the themes of the ${ordinal} house?`,
      answer: `The ${ordinal} house themes include ${houseData.themes.join(', ').toLowerCase()}. This ${houseData.element} house influences how you experience and express these areas of life.`,
    },
  ];

  // Entity schema for Knowledge Graph
  const houseSchema = createCosmicEntitySchema({
    name: `${houseData.name} in Astrology`,
    description: `The ${houseData.name} (${houseData.symbol}) governs ${houseData.area.toLowerCase()}. ${houseData.description.slice(0, 100)}...`,
    url: `/grimoire/houses/overview/${house}`,
    additionalType: 'https://en.wikipedia.org/wiki/House_(astrology)',
    keywords: [
      houseData.name,
      `${ordinal} house astrology`,
      'astrological house',
      'natal chart houses',
      houseData.area,
    ],
  });

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
        canonicalUrl={`https://lunary.app/grimoire/houses/overview/${house}`}
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

The specific influence depends on the planet's sign, aspects, and your overall chart. Each planet colors how you experience the ${ordinal} house themes.

Understanding your ${houseData.name} helps you understand how you express energy related to ${houseData.area.toLowerCase()}. This knowledge empowers you to work with this house's themes consciously and constructively.`}
        emotionalThemes={houseData.themes}
        howToWorkWith={[
          `Understand planets in your ${houseData.name}`,
          `Work with ${houseData.rulingSign} energy consciously`,
          `Express ${houseData.element} element through this house`,
          `Honor ${houseData.name} themes in your life`,
          `Use ${houseData.name} energy for growth`,
        ]}
        astrologyCorrespondences={`House Number: ${houseData.number}
Symbol: ${houseData.symbol}
Ruling Sign: ${houseData.rulingSign}
Ruling Planet: ${houseData.rulingPlanet}
Element: ${houseData.element}
Area: ${houseData.area}`}
        relatedItems={[
          {
            name: 'Birth Chart Guide',
            href: '/grimoire/birth-chart',
            type: 'Guide',
          },
          {
            name: houseData.rulingSign,
            href: `/grimoire/zodiac/${houseData.rulingSign.toLowerCase()}`,
            type: 'Zodiac Sign',
          },
          {
            name: houseData.rulingPlanet,
            href: `/grimoire/astronomy/planets/${houseData.rulingPlanet.toLowerCase()}`,
            type: 'Planet',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Birth Chart', href: '/grimoire/birth-chart' },
          {
            label: houseData.name,
            href: `/grimoire/houses/overview/${house}`,
          },
        ]}
        internalLinks={[
          { text: 'Calculate Birth Chart', href: '/birth-chart' },
          { text: "View Today's Horoscope", href: '/horoscope' },
          { text: 'Explore All Houses', href: '/grimoire/houses' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText={`Want to see planets in your ${houseData.name}?`}
        ctaHref='/pricing'
        faqs={faqs}
        cosmicConnections={
          <CosmicConnections
            entityType='house'
            entityKey={house}
            title={`${houseData.name} Cosmic Connections`}
          />
        }
      />
    </div>
  );
}
