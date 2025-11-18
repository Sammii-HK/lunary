import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { correspondencesData } from '@/constants/grimoire/correspondences';
import { stringToKebabCase } from '../../../../../../utils/string';

const herbKeys = Object.keys(correspondencesData.herbs);

export async function generateStaticParams() {
  return herbKeys.map((herb) => ({
    herb: stringToKebabCase(herb),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ herb: string }>;
}): Promise<Metadata> {
  const { herb } = await params;
  const herbKey = herbKeys.find(
    (h) => stringToKebabCase(h) === herb.toLowerCase(),
  );

  if (!herbKey) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const herbData =
    correspondencesData.herbs[
      herbKey as keyof typeof correspondencesData.herbs
    ];
  const title = `${herbKey}: Magical Herb Correspondences & Uses - Lunary`;
  const description = `Discover the complete magical correspondences for ${herbKey.toLowerCase()}. Learn about ${herbKey} uses, planetary influences, and how to work with ${herbKey.toLowerCase()} in spells and rituals.`;

  return {
    title,
    description,
    keywords: [
      `${herbKey} magic`,
      `${herbKey.toLowerCase()} herb`,
      `${herbKey.toLowerCase()} correspondences`,
      `${herbKey.toLowerCase()} uses`,
      `magical ${herbKey.toLowerCase()}`,
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
      canonical: `https://lunary.app/grimoire/correspondences/herbs/${herb}`,
    },
  };
}

export default async function HerbPage({
  params,
}: {
  params: Promise<{ herb: string }>;
}) {
  const { herb } = await params;
  const herbKey = herbKeys.find(
    (h) => stringToKebabCase(h) === herb.toLowerCase(),
  );

  if (!herbKey) {
    notFound();
  }

  const herbData =
    correspondencesData.herbs[
      herbKey as keyof typeof correspondencesData.herbs
    ];

  const meaning = `${herbKey} is a powerful magical herb with specific correspondences and uses. ${herbKey} corresponds to ${herbData.correspondences.join(', ')} energies, making it ideal for ${herbData.uses.join(', ')} magical work.

${herbKey} resonates with ${herbData.planets[0]} planetary influence, adding planetary power to your spellwork. This herb can be used in various ways: as incense, in spell bags, added to candles, brewed as tea, or used in ritual baths.

Understanding ${herbKey.toLowerCase()}'s correspondences helps you incorporate it effectively into your practice. Whether you're working with protection, love, prosperity, or other intentions, ${herbKey.toLowerCase()} brings its unique energetic properties to your magic.`;

  const howToWorkWith = [
    `Use ${herbKey.toLowerCase()} for ${herbData.uses.join(' and ')} spells`,
    `Burn ${herbKey.toLowerCase()} as incense for ${herbData.correspondences[0]}`,
    `Add ${herbKey.toLowerCase()} to spell bags and sachets`,
    `Incorporate ${herbKey.toLowerCase()} in candle magic`,
    `Brew ${herbKey.toLowerCase()} tea for ${herbData.uses[0]}`,
    `Use ${herbKey.toLowerCase()} in ritual baths`,
    `Align with ${herbData.planets[0]} planetary influences`,
    `Combine ${herbKey.toLowerCase()} with complementary herbs`,
  ];

  const faqs = [
    {
      question: `What is ${herbKey} used for in magic?`,
      answer: `${herbKey} is used for ${herbData.uses.join(', ')}. It corresponds to ${herbData.correspondences.join(', ')} energies and resonates with ${herbData.planets[0]} planetary influence.`,
    },
    {
      question: `How do I use ${herbKey.toLowerCase()} in spells?`,
      answer: `${herbKey} can be used in many ways: burned as incense, added to spell bags, incorporated in candle magic, brewed as tea, or used in ritual baths. Choose the method that aligns with your intention and practice.`,
    },
    {
      question: `What planet rules ${herbKey}?`,
      answer: `${herbKey} is ruled by ${herbData.planets[0]}, which adds ${herbData.planets[0]}-related planetary energy to your spellwork when you use this herb.`,
    },
  ];

  return (
    <SEOContentTemplate
      title={`${herbKey}: Magical Herb Correspondences & Uses - Lunary`}
      h1={`${herbKey}`}
      description={`Discover the complete magical correspondences for ${herbKey.toLowerCase()}. Learn about ${herbKey} uses, planetary influences, and how to work with ${herbKey.toLowerCase()} in spells and rituals.`}
      keywords={[
        `${herbKey} magic`,
        `${herbKey.toLowerCase()} herb`,
        `${herbKey.toLowerCase()} correspondences`,
        `${herbKey.toLowerCase()} uses`,
      ]}
      canonicalUrl={`https://lunary.app/grimoire/correspondences/herbs/${herb}`}
      intro={`${herbKey} is a powerful magical herb with specific correspondences and uses. Understanding ${herbKey.toLowerCase()}'s properties helps you incorporate it effectively into your spellwork and rituals.`}
      meaning={meaning}
      howToWorkWith={howToWorkWith}
      faqs={faqs}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        {
          label: 'Magical Correspondences',
          href: '/grimoire/correspondences',
        },
        {
          label: `${herbKey}`,
          href: `/grimoire/correspondences/herbs/${herb}`,
        },
      ]}
      internalLinks={[
        {
          text: 'Magical Correspondences',
          href: '/grimoire/correspondences',
        },
        {
          text: 'Spellcraft Fundamentals',
          href: '/grimoire/spellcraft-fundamentals',
        },
        { text: 'Spells & Rituals', href: '/grimoire/practices' },
        { text: 'Candle Magic', href: '/grimoire/candle-magic' },
      ]}
      tables={[
        {
          title: `${herbKey} Correspondences`,
          headers: ['Category', 'Details'],
          rows: [
            ['Correspondences', herbData.correspondences.join(', ')],
            ['Uses', herbData.uses.join(', ')],
            ['Planet', herbData.planets[0]],
          ],
        },
      ]}
    />
  );
}
