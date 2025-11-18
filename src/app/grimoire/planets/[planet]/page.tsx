import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import {
  planetaryBodies,
  planetSymbols,
} from '../../../../../utils/zodiac/zodiac';
import { stringToKebabCase } from '../../../../../utils/string';

const planetKeys = Object.keys(planetaryBodies);

export async function generateStaticParams() {
  return planetKeys.map((planet) => ({
    planet: stringToKebabCase(planet),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ planet: string }>;
}): Promise<Metadata> {
  const { planet } = await params;
  const planetKey = planetKeys.find(
    (p) => stringToKebabCase(p) === planet.toLowerCase(),
  );

  if (!planetKey) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const planetData = planetaryBodies[planetKey as keyof typeof planetaryBodies];
  const symbol = planetSymbols[planetKey as keyof typeof planetSymbols];
  const title = `${planetData.name} in Astrology: Meaning & Influence - Lunary`;
  const description = `Discover the complete guide to ${planetData.name} in astrology. Learn about ${planetData.name}'s meaning, influence, mystical properties, and how it affects your birth chart and transits.`;

  return {
    title,
    description,
    keywords: [
      `${planetData.name} astrology`,
      `${planetData.name} meaning`,
      `${planetData.name} in birth chart`,
      `${planetData.name} transits`,
      `planet ${planetData.name}`,
      `${planetData.name} symbol`,
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/planets/${planet}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/cosmic',
          width: 1200,
          height: 630,
          alt: `${planetData.name} Planet`,
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
      canonical: `https://lunary.app/grimoire/planets/${planet}`,
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

export default async function PlanetPage({
  params,
}: {
  params: Promise<{ planet: string }>;
}) {
  const { planet } = await params;
  const planetKey = planetKeys.find(
    (p) => stringToKebabCase(p) === planet.toLowerCase(),
  );

  if (!planetKey) {
    notFound();
  }

  const planetData = planetaryBodies[planetKey as keyof typeof planetaryBodies];
  const symbol = planetSymbols[planetKey as keyof typeof planetSymbols];

  // Get ruling signs (simplified - would need full data)
  const rulingSignsMap: Record<string, string[]> = {
    sun: ['Leo'],
    moon: ['Cancer'],
    mercury: ['Gemini', 'Virgo'],
    venus: ['Taurus', 'Libra'],
    mars: ['Aries', 'Scorpio'],
    jupiter: ['Sagittarius', 'Pisces'],
    saturn: ['Capricorn', 'Aquarius'],
    uranus: ['Aquarius'],
    neptune: ['Pisces'],
    pluto: ['Scorpio'],
  };

  const rulingSigns = rulingSignsMap[planetKey] || [];

  const faqs = [
    {
      question: `What does ${planetData.name} represent in astrology?`,
      answer: `${planetData.name} represents ${planetData.mysticalProperties.toLowerCase()}. In your birth chart, ${planetData.name} shows ${planetData.properties.toLowerCase()}.`,
    },
    {
      question: `What signs does ${planetData.name} rule?`,
      answer: `${planetData.name} rules ${rulingSigns.join(' and ')}. These signs express ${planetData.name}'s energy most directly.`,
    },
    {
      question: `How does ${planetData.name} affect my birth chart?`,
      answer: `In your birth chart, ${planetData.name} reveals ${planetData.mysticalProperties.toLowerCase()}. The sign and house placement of ${planetData.name} shows how this energy manifests in your life.`,
    },
    {
      question: `What happens when ${planetData.name} is retrograde?`,
      answer: `When ${planetData.name} is retrograde, its energy turns inward. This is a time for reflection, review, and re-evaluation of the areas ${planetData.name} governs.`,
    },
    {
      question: `What is ${planetData.name}'s symbol?`,
      answer: `${planetData.name}'s astrological symbol is ${symbol}. This symbol represents the planet's energy and influence in astrology.`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${planetData.name} Planet - Lunary`}
        h1={`${planetData.name} in Astrology: Complete Guide`}
        description={`Discover everything about ${planetData.name} in astrology. Learn about its meaning, influence, and how it affects your birth chart.`}
        keywords={[
          `${planetData.name} astrology`,
          `${planetData.name} meaning`,
          `${planetData.name} planet`,
          `${planetData.name} symbol`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/planets/${planet}`}
        intro={`${planetData.name}, represented by the symbol ${symbol}, is ${planetData.properties.toLowerCase()}. In astrology, ${planetData.name} represents ${planetData.mysticalProperties.toLowerCase()}.`}
        tldr={`${planetData.name} (${symbol}) represents ${planetData.mysticalProperties.toLowerCase()}.`}
        meaning={`${planetData.name} is one of the key planetary bodies in astrology, representing ${planetData.mysticalProperties.toLowerCase()}. 

${planetData.properties}

In your birth chart, ${planetData.name} reveals how you express this planetary energy. The sign ${planetData.name} is in shows the style and approach, while the house placement reveals the life area where this energy is most active.

${planetData.name} rules ${rulingSigns.join(' and ')}, meaning these signs express ${planetData.name}'s energy most naturally and directly. When ${planetData.name} transits through different signs and houses, it activates those areas of life with its unique energy.

Understanding ${planetData.name} in your chart helps you understand ${planetData.mysticalProperties.toLowerCase()}. This knowledge empowers you to work with ${planetData.name}'s energy consciously and constructively.`}
        glyphs={[symbol]}
        howToWorkWith={[
          `Understand ${planetData.name}'s energy in your birth chart`,
          `Work with ${planetData.name} transits consciously`,
          `Express ${planetData.name} energy through its ruling signs`,
          `Honor ${planetData.name}'s influence in your life`,
          `Use ${planetData.name} energy for growth and development`,
        ]}
        astrologyCorrespondences={`Planet: ${planetData.name}
Symbol: ${symbol}
Properties: ${planetData.properties}
Ruling Signs: ${rulingSigns.join(', ')}
Mystical Properties: ${planetData.mysticalProperties}`}
        relatedItems={[
          {
            name: 'Birth Chart Guide',
            href: '/grimoire/birth-chart',
            type: 'Guide',
          },
          {
            name: rulingSigns[0] || 'Zodiac Signs',
            href: rulingSigns[0]
              ? `/grimoire/zodiac/${rulingSigns[0].toLowerCase()}`
              : '/grimoire/astronomy',
            type: 'Zodiac Sign',
          },
          {
            name: 'Horoscope',
            href: '/horoscope',
            type: 'Daily Reading',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Astronomy & Astrology', href: '/grimoire/astronomy' },
          {
            label: planetData.name,
            href: `/grimoire/planets/${planet}`,
          },
        ]}
        internalLinks={[
          { text: 'Calculate Birth Chart', href: '/birth-chart' },
          { text: "View Today's Horoscope", href: '/horoscope' },
          { text: 'Explore Zodiac Signs', href: '/grimoire/astronomy' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText={`Want to see ${planetData.name} in your birth chart?`}
        ctaHref='/pricing'
        faqs={faqs}
      />
    </div>
  );
}
