import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { correspondencesData } from '@/constants/grimoire/correspondences';
import { stringToKebabCase } from '../../../../../../utils/string';

// 30-day ISR revalidation
export const revalidate = 2592000;
const flowerKeys = Object.keys(correspondencesData.flowers);

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<{ flower: string }>;
}): Promise<Metadata> {
  const { flower } = await params;
  const flowerKey = flowerKeys.find(
    (f) => stringToKebabCase(f) === flower.toLowerCase(),
  );

  if (!flowerKey) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const flowerData =
    correspondencesData.flowers[
      flowerKey as keyof typeof correspondencesData.flowers
    ];
  const title = `${flowerKey}: Magical Flower Correspondences & Uses - Lunary`;
  const description = `Discover the complete magical correspondences for ${flowerKey.toLowerCase()}. Learn about ${flowerKey} uses, colors, planetary influences, and how to work with ${flowerKey.toLowerCase()} in spells and rituals.`;

  return {
    title,
    description,
    keywords: [
      `${flowerKey} magic`,
      `${flowerKey.toLowerCase()} flower`,
      `${flowerKey.toLowerCase()} correspondences`,
      `${flowerKey.toLowerCase()} uses`,
      `magical ${flowerKey.toLowerCase()}`,
    ],
    openGraph: {
      title,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/correspondences/flowers/${flower}`,
    },
  };
}

export default async function FlowerPage({
  params,
}: {
  params: Promise<{ flower: string }>;
}) {
  const { flower } = await params;
  const flowerKey = flowerKeys.find(
    (f) => stringToKebabCase(f) === flower.toLowerCase(),
  );

  if (!flowerKey) {
    notFound();
  }

  const flowerData =
    correspondencesData.flowers[
      flowerKey as keyof typeof correspondencesData.flowers
    ];

  const meaning = `${flowerKey} is a beautiful and powerful magical flower with specific correspondences and uses. ${flowerKey} corresponds to ${flowerData.correspondences.join(', ')} energies, making it ideal for ${flowerData.uses.join(', ')} magical work.

${flowerKey} comes in ${flowerData.colors.join(', ')} colors and resonates with ${flowerData.planets[0]} planetary influence, adding planetary power to your spellwork. This flower can be used fresh, dried, as petals, in oils, or as decoration in ritual.

Understanding ${flowerKey.toLowerCase()}'s correspondences helps you incorporate it effectively into your practice. Whether you're working with love, protection, prosperity, or other intentions, ${flowerKey.toLowerCase()} brings its unique energetic properties to your magic.`;

  const howToWorkWith = [
    `Use ${flowerKey.toLowerCase()} for ${flowerData.uses.join(' and ')} spells`,
    `Add ${flowerKey.toLowerCase()} petals to spell bags`,
    `Create ${flowerKey.toLowerCase()}-infused oils`,
    `Decorate altars with ${flowerKey.toLowerCase()} flowers`,
    `Use ${flowerKey.toLowerCase()} in ritual baths`,
    `Incorporate ${flowerKey.toLowerCase()} in love or beauty spells`,
    `Align with ${flowerData.planets[0]} planetary influences`,
    `Press ${flowerKey.toLowerCase()} for long-term use`,
  ];

  const faqs = [
    {
      question: `What is ${flowerKey} used for in magic?`,
      answer: `${flowerKey} is used for ${flowerData.uses.join(', ')}. It corresponds to ${flowerData.correspondences.join(', ')} energies and resonates with ${flowerData.planets[0]} planetary influence.`,
    },
    {
      question: `How do I use ${flowerKey.toLowerCase()} in spells?`,
      answer: `${flowerKey} can be used fresh or dried, as petals in spell bags, infused in oils, added to ritual baths, or used to decorate altars. Choose the method that aligns with your intention.`,
    },
    {
      question: `What colors does ${flowerKey} come in?`,
      answer: `${flowerKey} comes in ${flowerData.colors.join(', ')} colors. Each color variation may have slightly different correspondences, but all share ${flowerKey.toLowerCase()}'s core magical properties.`,
    },
  ];

  return (
    <SEOContentTemplate
      title={`${flowerKey}: Magical Flower Correspondences & Uses - Lunary`}
      h1={`${flowerKey}`}
      description={`Discover the complete magical correspondences for ${flowerKey.toLowerCase()}. Learn about ${flowerKey} uses, colors, planetary influences, and how to work with ${flowerKey.toLowerCase()} in spells.`}
      keywords={[
        `${flowerKey} magic`,
        `${flowerKey.toLowerCase()} flower`,
        `${flowerKey.toLowerCase()} correspondences`,
        `${flowerKey.toLowerCase()} uses`,
      ]}
      canonicalUrl={`https://lunary.app/grimoire/correspondences/flowers/${flower}`}
      intro={`${flowerKey} is a beautiful and powerful magical flower with specific correspondences and uses. Understanding ${flowerKey.toLowerCase()}'s properties helps you incorporate it effectively into your spellwork and rituals.`}
      meaning={meaning}
      howToWorkWith={howToWorkWith}
      faqs={faqs}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Correspondences', href: '/grimoire/correspondences' },
        { label: 'Flowers', href: '/grimoire/correspondences/flowers' },
        {
          label: `${flowerKey}`,
          href: `/grimoire/correspondences/flowers/${flower}`,
        },
      ]}
      internalLinks={[
        {
          text: 'Magical Correspondences',
          href: '/grimoire/correspondences',
        },
        {
          text: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
        },
        { text: 'Spells & Rituals', href: '/grimoire/spells' },
        { text: 'Candle Magic', href: '/grimoire/candle-magic' },
      ]}
      tables={[
        {
          title: `${flowerKey} Correspondences`,
          headers: ['Category', 'Details'],
          rows: [
            ['Correspondences', flowerData.correspondences.join(', ')],
            ['Uses', flowerData.uses.join(', ')],
            ['Colors', flowerData.colors.join(', ')],
            ['Planet', flowerData.planets[0]],
          ],
        },
      ]}
    />
  );
}
