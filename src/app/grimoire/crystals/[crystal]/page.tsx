import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { crystalDatabase } from '@/constants/grimoire/crystals';
import { stringToKebabCase } from '../../../../../utils/string';

export async function generateStaticParams() {
  return crystalDatabase.map((crystal) => ({
    crystal: stringToKebabCase(crystal.name),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ crystal: string }>;
}): Promise<Metadata> {
  const { crystal } = await params;
  const crystalData = crystalDatabase.find(
    (c) => stringToKebabCase(c.name) === crystal.toLowerCase(),
  );

  if (!crystalData) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const title = `${crystalData.name} Crystal Meaning: Properties & Uses - Lunary`;
  const description = `Discover the complete guide to ${crystalData.name} crystal. Learn about ${crystalData.name} meaning, properties (${crystalData.properties.slice(0, 3).join(', ')}), chakras, zodiac signs, and how to use this crystal.`;

  return {
    title,
    description,
    keywords: [
      `${crystalData.name} crystal`,
      `${crystalData.name} meaning`,
      `${crystalData.name} properties`,
      `${crystalData.name} uses`,
      `crystal ${crystalData.name}`,
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/crystals/${crystal}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/grimoire/crystals',
          width: 1200,
          height: 630,
          alt: `${crystalData.name} Crystal`,
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
      canonical: `https://lunary.app/grimoire/crystals/${crystal}`,
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

export default async function CrystalPage({
  params,
}: {
  params: Promise<{ crystal: string }>;
}) {
  const { crystal } = await params;
  const crystalData = crystalDatabase.find(
    (c) => stringToKebabCase(c.name) === crystal.toLowerCase(),
  );

  if (!crystalData) {
    notFound();
  }

  const faqs = [
    {
      question: `What is ${crystalData.name} crystal?`,
      answer: `${crystalData.name} is ${crystalData.description.toLowerCase()}. ${crystalData.metaphysicalProperties}`,
    },
    {
      question: `What are ${crystalData.name}'s properties?`,
      answer: `${crystalData.name} is associated with ${crystalData.properties.join(', ').toLowerCase()}.`,
    },
    {
      question: `Which chakras does ${crystalData.name} work with?`,
      answer: `${crystalData.name} works with the ${crystalData.chakras.join(' and ')} chakras.`,
    },
    {
      question: `How do I use ${crystalData.name}?`,
      answer: `${crystalData.name} can be used for ${crystalData.workingWith.meditation.toLowerCase()}, ${crystalData.workingWith.spellwork.toLowerCase()}, and ${crystalData.workingWith.healing.toLowerCase()}.`,
    },
    {
      question: `How do I cleanse ${crystalData.name}?`,
      answer: `${crystalData.name} can be cleansed using ${crystalData.careInstructions.cleansing.join(', ').toLowerCase()}.`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${crystalData.name} Crystal - Lunary`}
        h1={`${crystalData.name} Crystal: Complete Guide`}
        description={`Discover everything about ${crystalData.name} crystal. Learn about its meaning, properties, uses, and how to work with this powerful crystal.`}
        keywords={[
          `${crystalData.name} crystal`,
          `${crystalData.name} meaning`,
          `${crystalData.name} properties`,
          `${crystalData.name} uses`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/crystals/${crystal}`}
        whatIs={{
          question: `What is ${crystalData.name}?`,
          answer: `${crystalData.name} is ${crystalData.description.toLowerCase()}. This ${crystalData.rarity} crystal is associated with ${crystalData.properties.slice(0, 3).join(', ').toLowerCase()} and works with the ${crystalData.chakras.join(' and ')} chakra${crystalData.chakras.length > 1 ? 's' : ''}. ${crystalData.metaphysicalProperties.split('.')[0]}.`,
        }}
        intro={`${crystalData.name} is ${crystalData.description.toLowerCase()}. ${crystalData.metaphysicalProperties}`}
        tldr={`${crystalData.name} is associated with ${crystalData.properties.slice(0, 3).join(', ').toLowerCase()} and works with the ${crystalData.chakras.join(' and ')} chakras.`}
        meaning={`Crystals are powerful tools for healing, manifestation, and spiritual growth. Each crystal carries unique energetic properties that can support your journey. ${crystalData.name} is one of the most ${crystalData.rarity === 'common' ? 'accessible' : crystalData.rarity === 'rare' ? 'powerful' : 'unique'} crystals, known for its ${crystalData.properties.slice(0, 2).join(' and ')} properties.

${crystalData.description}

${crystalData.metaphysicalProperties}

${crystalData.historicalUse ? `Historically, ${crystalData.historicalUse.toLowerCase()}.` : ''}

Understanding ${crystalData.name} helps you work with its energy consciously and effectively. Whether you're using it for healing, meditation, spellwork, or manifestation, ${crystalData.name} can be a powerful ally on your spiritual journey.`}
        emotionalThemes={crystalData.properties}
        astrologyCorrespondences={`Crystal: ${crystalData.name}
Properties: ${crystalData.properties.join(', ')}
Chakras: ${crystalData.chakras.join(', ')}
Elements: ${crystalData.elements.join(', ')}
Zodiac Signs: ${crystalData.zodiacSigns.join(', ')}
Planets: ${crystalData.planets.join(', ')}
Moon Phases: ${crystalData.moonPhases.join(', ')}
Rarity: ${crystalData.rarity}`}
        howToWorkWith={[
          `Use ${crystalData.name} for ${crystalData.workingWith.meditation.toLowerCase()}`,
          `Work with ${crystalData.name} in ${crystalData.workingWith.spellwork.toLowerCase()}`,
          `Place ${crystalData.name} on ${crystalData.chakras.join(' or ')} chakra for ${crystalData.workingWith.healing.toLowerCase()}`,
          `Use ${crystalData.name} for ${crystalData.workingWith.manifestation.toLowerCase()}`,
          `Cleanse ${crystalData.name} regularly using ${crystalData.careInstructions.cleansing[0]?.toLowerCase() || 'moonlight'}`,
        ]}
        rituals={[
          `Meditation: ${crystalData.workingWith.meditation}`,
          `Spellwork: ${crystalData.workingWith.spellwork}`,
          `Healing: ${crystalData.workingWith.healing}`,
          `Manifestation: ${crystalData.workingWith.manifestation}`,
          `Cleansing: Cleanse using ${crystalData.careInstructions.cleansing.join(' or ')}`,
          `Charging: Charge under ${crystalData.careInstructions.charging.join(' or ')}`,
          `Programming: ${crystalData.careInstructions.programming}`,
        ]}
        tables={[
          {
            title: `${crystalData.name} Correspondences`,
            headers: ['Category', 'Items'],
            rows: [
              ['Chakras', crystalData.chakras.join(', ')],
              ['Elements', crystalData.elements.join(', ')],
              ['Zodiac Signs', crystalData.zodiacSigns.join(', ')],
              ['Planets', crystalData.planets.join(', ')],
              ['Herbs', crystalData.correspondences.herbs.join(', ')],
              ['Tarot Cards', crystalData.correspondences.tarot.join(', ')],
            ],
          },
        ]}
        journalPrompts={[
          `How does ${crystalData.name} make me feel?`,
          `What properties of ${crystalData.name} do I need most?`,
          `How can I work with ${crystalData.name} in my practice?`,
          `What intentions align with ${crystalData.name}?`,
        ]}
        relatedItems={[
          ...crystalData.combinations.enhances.map((name) => ({
            name,
            href: `/grimoire/crystals/${stringToKebabCase(name)}`,
            type: 'Crystal',
          })),
          {
            name: 'Crystals Guide',
            href: '/grimoire/crystals',
            type: 'Guide',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Crystals', href: '/grimoire/crystals' },
          {
            label: crystalData.name,
            href: `/grimoire/crystals/${crystal}`,
          },
        ]}
        internalLinks={[
          { text: 'Explore All Crystals', href: '/grimoire/crystals' },
          { text: 'Find Crystals by Chakra', href: '/grimoire/chakras' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        faqs={faqs}
      />
    </div>
  );
}
