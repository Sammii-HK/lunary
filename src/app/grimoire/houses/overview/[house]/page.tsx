import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { astrologicalHouses } from '@/constants/grimoire/seo-data';
import { stringToKebabCase } from '../../../../../../utils/string';

const houseKeys = Object.keys(astrologicalHouses);

export async function generateStaticParams() {
  return houseKeys.map((house) => ({
    house: stringToKebabCase(house),
  }));
}

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
  const title = `${houseData.name} Meaning: Astrological House Guide - Lunary`;
  const description = `Discover the complete guide to the ${houseData.name} (${houseData.symbol}) in astrology. Learn about ${houseData.name} meaning, themes, and how it influences your birth chart.`;

  return {
    title,
    description,
    keywords: [
      `${houseData.name} astrology`,
      `${houseData.name} meaning`,
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

  const faqs = [
    {
      question: `What does the ${houseData.name} represent?`,
      answer: `The ${houseData.name} represents ${houseData.area.toLowerCase()}. It governs ${houseData.themes.join(', ').toLowerCase()}.`,
    },
    {
      question: `What sign rules the ${houseData.name}?`,
      answer: `The ${houseData.name} is ruled by ${houseData.rulingSign}, a ${houseData.element} sign. ${houseData.rulingPlanet} is the ruling planet.`,
    },
    {
      question: `What planets are associated with the ${houseData.name}?`,
      answer: `The ${houseData.name} is naturally associated with ${houseData.planets.join(' and ')}. When these planets are in the ${houseData.name}, their energy is expressed through this house's themes.`,
    },
    {
      question: `How does the ${houseData.name} affect my birth chart?`,
      answer: `Planets in your ${houseData.name} reveal how you express energy related to ${houseData.area.toLowerCase()}. The sign on the cusp of this house shows your approach to these themes.`,
    },
    {
      question: `What is the ${houseData.name} element?`,
      answer: `The ${houseData.name} is associated with ${houseData.element} element, which influences how energy is expressed in this house.`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${houseData.name} - Lunary`}
        h1={`${houseData.name} (${houseData.symbol}): Complete Astrological Guide`}
        description={`Discover everything about the ${houseData.name} in astrology. Learn about its meaning, themes, and influence on your birth chart.`}
        keywords={[
          `${houseData.name}`,
          `${houseData.symbol} house`,
          `house ${houseData.number}`,
          `${houseData.name} astrology`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/houses/overview/${house}`}
        intro={`The ${houseData.name}, represented by ${houseData.symbol}, is the ${houseData.number}${houseData.number === 1 ? 'st' : houseData.number === 2 ? 'nd' : houseData.number === 3 ? 'rd' : 'th'} house in astrology. It governs ${houseData.area.toLowerCase()} and is ruled by ${houseData.rulingSign} (${houseData.element} element).`}
        tldr={`The ${houseData.name} (${houseData.symbol}) governs ${houseData.area.toLowerCase()}.`}
        meaning={`The ${houseData.name} is one of the twelve astrological houses, each representing a different area of life. This house governs ${houseData.area.toLowerCase()}.

${houseData.description}

The ${houseData.name} is ruled by ${houseData.rulingSign}, a ${houseData.element} sign, and its ruling planet is ${houseData.rulingPlanet}. This connection influences how energy is expressed in this house.

When planets are placed in your ${houseData.name}, they activate themes related to ${houseData.themes.join(', ').toLowerCase()}. The sign on the cusp of this house shows your approach and style in these areas.

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
            href: `/grimoire/planets/${houseData.rulingPlanet.toLowerCase()}`,
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
          { text: 'Explore All Houses', href: '/grimoire/birth-chart#houses' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText={`Want to see planets in your ${houseData.name}?`}
        ctaHref='/pricing'
        faqs={faqs}
      />
    </div>
  );
}
