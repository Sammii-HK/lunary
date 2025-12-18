import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { correspondencesData } from '@/constants/grimoire/correspondences';
import { stringToKebabCase } from '../../../../../../utils/string';

const animalKeys = Object.keys(correspondencesData.animals);

export async function generateStaticParams() {
  return animalKeys.map((animal) => ({
    animal: stringToKebabCase(animal),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ animal: string }>;
}): Promise<Metadata> {
  const { animal } = await params;
  const animalKey = animalKeys.find(
    (a) => stringToKebabCase(a) === animal.toLowerCase(),
  );

  if (!animalKey) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const animalData =
    correspondencesData.animals[
      animalKey as keyof typeof correspondencesData.animals
    ];
  const title = `${animalKey}: Animal Omen & Correspondences - Lunary`;
  const description = `Discover the complete magical correspondences for ${animalKey.toLowerCase()}. Learn about ${animalKey} as a spirit guide, omen meanings, planetary influences, and how to work with ${animalKey.toLowerCase()} energy.`;

  return {
    title,
    description,
    keywords: [
      `${animalKey} meaning`,
      `${animalKey.toLowerCase()} omen`,
      `${animalKey.toLowerCase()} spirit guide`,
      `${animalKey.toLowerCase()} correspondences`,
      `${animalKey.toLowerCase()} totem`,
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
      canonical: `https://lunary.app/grimoire/correspondences/animals/${animal}`,
    },
  };
}

export default async function AnimalPage({
  params,
}: {
  params: Promise<{ animal: string }>;
}) {
  const { animal } = await params;
  const animalKey = animalKeys.find(
    (a) => stringToKebabCase(a) === animal.toLowerCase(),
  );

  if (!animalKey) {
    notFound();
  }

  const animalData =
    correspondencesData.animals[
      animalKey as keyof typeof correspondencesData.animals
    ];

  const meaning = `${animalKey} is a powerful animal guide and omen with specific correspondences and meanings. ${animalKey} corresponds to ${animalData.correspondences.join(', ')} energies, making it a guide for ${animalData.uses.join(', ')} magical work.

When ${animalKey.toLowerCase()} appears as an omen or spirit guide, it brings messages about ${animalData.correspondences.join(', ')}. ${animalKey} resonates with ${animalData.planets[0]} planetary influence, adding planetary power to its guidance.

Understanding ${animalKey.toLowerCase()}'s correspondences helps you interpret when this animal appears in your life, dreams, or as an omen. Whether ${animalKey.toLowerCase()} is your spirit guide, appears in meditation, or shows up as a sign, it brings its unique energetic properties and guidance.`;

  const howToWorkWith = [
    `Interpret ${animalKey.toLowerCase()} when it appears as an omen`,
    `Work with ${animalKey.toLowerCase()} as a spirit guide`,
    `Use ${animalKey.toLowerCase()} energy for ${animalData.uses.join(' and ')}`,
    `Meditate on ${animalKey.toLowerCase()} qualities`,
    `Create ${animalKey.toLowerCase()}-themed altars`,
    `Align with ${animalData.planets[0]} planetary influences`,
    `Use ${animalKey.toLowerCase()} imagery in spellwork`,
    `Honor ${animalKey.toLowerCase()} in ritual`,
  ];

  const faqs = [
    {
      question: `What does ${animalKey} mean as an omen?`,
      answer: `${animalKey} as an omen brings messages about ${animalData.correspondences.join(', ')}. When ${animalKey.toLowerCase()} appears, pay attention to what you were thinking about and trust your intuition about the message.`,
    },
    {
      question: `Is ${animalKey} my spirit guide?`,
      answer: `${animalKey} may be your spirit guide if you feel a strong connection, see ${animalKey.toLowerCase()} frequently, or dream about ${animalKey.toLowerCase()}. Meditate on ${animalKey.toLowerCase()} and see if guidance comes through.`,
    },
    {
      question: `What planet rules ${animalKey}?`,
      answer: `${animalKey} is ruled by ${animalData.planets[0]}, which adds ${animalData.planets[0]}-related planetary energy to its guidance and correspondences.`,
    },
  ];

  return (
    <SEOContentTemplate
      title={`${animalKey}: Animal Omen & Correspondences - Lunary`}
      h1={`${animalKey}`}
      description={`Discover the complete magical correspondences for ${animalKey.toLowerCase()}. Learn about ${animalKey} as a spirit guide, omen meanings, planetary influences, and how to work with ${animalKey.toLowerCase()} energy.`}
      keywords={[
        `${animalKey} meaning`,
        `${animalKey.toLowerCase()} omen`,
        `${animalKey.toLowerCase()} spirit guide`,
        `${animalKey.toLowerCase()} correspondences`,
      ]}
      canonicalUrl={`https://lunary.app/grimoire/correspondences/animals/${animal}`}
      intro={`${animalKey} is a powerful animal guide and omen with specific correspondences and meanings. Understanding ${animalKey.toLowerCase()}'s properties helps you interpret when this animal appears and work with its energy.`}
      meaning={meaning}
      howToWorkWith={howToWorkWith}
      faqs={faqs}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Correspondences', href: '/grimoire/correspondences' },
        { label: 'Animals', href: '/grimoire/correspondences/animals' },
        {
          label: `${animalKey}`,
          href: `/grimoire/correspondences/animals/${animal}`,
        },
      ]}
      internalLinks={[
        {
          text: 'Magical Correspondences',
          href: '/grimoire/correspondences',
        },
        { text: 'Reading Omens', href: '/grimoire/divination/omen-reading' },
        { text: 'Divination Methods', href: '/grimoire/divination' },
        {
          text: 'Dream Interpretation',
          href: '/grimoire/divination/dream-interpretation',
        },
      ]}
      tables={[
        {
          title: `${animalKey} Correspondences`,
          headers: ['Category', 'Details'],
          rows: [
            ['Correspondences', animalData.correspondences.join(', ')],
            ['Uses', animalData.uses.join(', ')],
            ['Planet', animalData.planets[0]],
          ],
        },
      ]}
    />
  );
}
