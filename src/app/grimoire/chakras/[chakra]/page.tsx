import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { chakras } from '@/constants/chakras';
import { stringToKebabCase } from '../../../../../utils/string';

const chakraKeys = Object.keys(chakras);

export async function generateStaticParams() {
  return chakraKeys.map((chakra) => ({
    chakra: stringToKebabCase(chakra),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chakra: string }>;
}): Promise<Metadata> {
  const { chakra } = await params;
  const chakraKey = chakraKeys.find(
    (c) => stringToKebabCase(c) === chakra.toLowerCase(),
  );

  if (!chakraKey) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const chakraData = chakras[chakraKey as keyof typeof chakras];
  const title = `${chakraData.name} Chakra: Meaning, Location & Balancing - Lunary`;
  const description = `Discover the complete guide to ${chakraData.name} Chakra. Learn about ${chakraData.name} Chakra meaning, location (${chakraData.location}), color (${chakraData.color}), properties, and how to balance this chakra.`;

  return {
    title,
    description,
    keywords: [
      `${chakraData.name} chakra`,
      `${chakraData.name} chakra meaning`,
      `${chakraData.color} chakra`,
      `chakra ${chakraData.location}`,
      `${chakraData.name} chakra balancing`,
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/chakras/${chakra}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/cosmic',
          width: 1200,
          height: 630,
          alt: `${chakraData.name} Chakra`,
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
      canonical: `https://lunary.app/grimoire/chakras/${chakra}`,
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

export default async function ChakraPage({
  params,
}: {
  params: Promise<{ chakra: string }>;
}) {
  const { chakra } = await params;
  const chakraKey = chakraKeys.find(
    (c) => stringToKebabCase(c) === chakra.toLowerCase(),
  );

  if (!chakraKey) {
    notFound();
  }

  const chakraData = chakras[chakraKey as keyof typeof chakras];

  const faqs = [
    {
      question: `Where is the ${chakraData.name} Chakra located?`,
      answer: `The ${chakraData.name} Chakra is located at ${chakraData.location.toLowerCase()}.`,
    },
    {
      question: `What color is the ${chakraData.name} Chakra?`,
      answer: `The ${chakraData.name} Chakra is associated with the color ${chakraData.color.toLowerCase()}.`,
    },
    {
      question: `What does the ${chakraData.name} Chakra govern?`,
      answer: `The ${chakraData.name} Chakra governs ${chakraData.properties.toLowerCase()}.`,
    },
    {
      question: `How do I balance my ${chakraData.name} Chakra?`,
      answer: `To balance your ${chakraData.name} Chakra, focus on ${chakraData.properties.toLowerCase()}. Use ${chakraData.color.toLowerCase()} crystals, meditation, and activities that support this chakra's energy.`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${chakraData.name} Chakra - Lunary`}
        h1={`${chakraData.name} Chakra: Complete Guide`}
        description={`Discover everything about ${chakraData.name} Chakra. Learn about its location, color, properties, and how to balance this energy center.`}
        keywords={[
          `${chakraData.name} chakra`,
          `${chakraData.color} chakra`,
          `chakra ${chakraData.location}`,
          `${chakraData.name} chakra meaning`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/chakras/${chakra}`}
        intro={`The ${chakraData.name} Chakra is one of the seven main energy centers in the body. Located at ${chakraData.location.toLowerCase()}, this chakra is associated with the color ${chakraData.color.toLowerCase()} and governs ${chakraData.properties.toLowerCase()}.`}
        tldr={`The ${chakraData.name} Chakra (${chakraData.location}) is ${chakraData.color.toLowerCase()} and governs ${chakraData.properties.toLowerCase()}.`}
        meaning={`Chakras are energy centers in the body that correspond to different aspects of physical, emotional, and spiritual well-being. The ${chakraData.name} Chakra is one of the seven main chakras, each playing a vital role in your overall health and spiritual development.

Located at ${chakraData.location.toLowerCase()}, the ${chakraData.name} Chakra is associated with the color ${chakraData.color.toLowerCase()} and governs ${chakraData.properties.toLowerCase()}. 

${chakraData.mysticalProperties}

When your ${chakraData.name} Chakra is balanced, you experience ${chakraData.properties.toLowerCase()} in healthy ways. When it's blocked or overactive, you may experience challenges related to these areas.

Understanding and working with your ${chakraData.name} Chakra helps you maintain balance, health, and spiritual growth. Regular chakra work can enhance your well-being and help you live more authentically.`}
        glyphs={[chakraData.symbol]}
        astrologyCorrespondences={`Chakra: ${chakraData.name}
Location: ${chakraData.location}
Color: ${chakraData.color}
Symbol: ${chakraData.symbol}
Properties: ${chakraData.properties}`}
        howToWorkWith={[
          `Meditate on ${chakraData.color.toLowerCase()} light at ${chakraData.location.toLowerCase()}`,
          `Use ${chakraData.color.toLowerCase()} crystals for this chakra`,
          `Practice activities that support ${chakraData.properties.toLowerCase()}`,
          `Wear ${chakraData.color.toLowerCase()} clothing or accessories`,
          `Visualize ${chakraData.color.toLowerCase()} energy flowing through this chakra`,
        ]}
        journalPrompts={[
          `How is my ${chakraData.name} Chakra feeling?`,
          `What does ${chakraData.properties.toLowerCase()} mean to me?`,
          `How can I balance my ${chakraData.name} Chakra?`,
          `What activities support my ${chakraData.name} Chakra?`,
        ]}
        relatedItems={[
          {
            name: 'Chakras Guide',
            href: '/grimoire/chakras',
            type: 'Guide',
          },
          {
            name: 'Crystals',
            href: '/grimoire/crystals',
            type: 'Guide',
          },
        ]}
        internalLinks={[
          { text: 'Explore All Chakras', href: '/grimoire/chakras' },
          { text: 'Find Crystals by Chakra', href: '/grimoire/crystals' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        faqs={faqs}
      />
    </div>
  );
}
