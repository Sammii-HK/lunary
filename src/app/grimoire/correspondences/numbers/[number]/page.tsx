import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { correspondencesData } from '@/constants/grimoire/correspondences';
import { stringToKebabCase } from '../../../../../../utils/string';

const numberKeys = Object.keys(correspondencesData.numbers);

export async function generateStaticParams() {
  return numberKeys.map((num) => ({
    number: stringToKebabCase(num),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ number: string }>;
}): Promise<Metadata> {
  const { number } = await params;
  const numberKey = numberKeys.find(
    (n) => stringToKebabCase(n) === number.toLowerCase(),
  );

  if (!numberKey) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const numberData =
    correspondencesData.numbers[
      numberKey as unknown as keyof typeof correspondencesData.numbers
    ];
  const title = `Number ${numberKey}: Magical Number Correspondences - Lunary`;
  const description = `Discover the complete magical correspondences for the number ${numberKey}. Learn about ${numberKey}'s meanings, planetary influences, and how to work with ${numberKey} energy in numerology and spellwork.`;

  return {
    title,
    description,
    keywords: [
      `number ${numberKey}`,
      `${numberKey} meaning`,
      `${numberKey} correspondences`,
      `magical number ${numberKey}`,
      `${numberKey} numerology`,
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
      canonical: `https://lunary.app/grimoire/correspondences/numbers/${number}`,
    },
  };
}

export default async function NumberPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const numberKey = numberKeys.find(
    (n) => stringToKebabCase(n) === number.toLowerCase(),
  );

  if (!numberKey) {
    notFound();
  }

  const numberData =
    correspondencesData.numbers[
      numberKey as unknown as keyof typeof correspondencesData.numbers
    ];

  const meaning = `The number ${numberKey} carries specific vibrational energy and magical correspondences. ${numberKey} corresponds to ${numberData.correspondences.join(', ')} energies, making it powerful for ${numberData.uses.join(', ')} magical work.

Number ${numberKey} resonates with ${numberData.planets[0]} planetary influence, adding planetary power to your spellwork. In numerology, ${numberKey} represents ${numberData.correspondences[0]}, influencing personality traits, life path, and magical timing.

Understanding number ${numberKey}'s correspondences helps you incorporate numerical energy into your practice. Whether you're working with numerology, timing spells, or using numbers in ritual, ${numberKey} brings its unique vibrational properties to your magic.`;

  const howToWorkWith = [
    `Use ${numberKey} for ${numberData.uses.join(' and ')} spells`,
    `Repeat intentions ${numberKey} times in ritual`,
    `Work with ${numberKey} candles or items`,
    `Align with ${numberData.planets[0]} planetary influences`,
    `Time spells using ${numberKey} numerology`,
    `Create ${numberKey}-themed altars`,
    `Use ${numberKey} in sigil magic`,
    `Incorporate ${numberKey} in spell timing`,
  ];

  const faqs = [
    {
      question: `What does the number ${numberKey} mean?`,
      answer: `Number ${numberKey} corresponds to ${numberData.correspondences.join(', ')} energies. It represents ${numberData.correspondences[0]} and is used for ${numberData.uses.join(', ')} magical work.`,
    },
    {
      question: `How do I use number ${numberKey} in magic?`,
      answer: `Use number ${numberKey} by repeating intentions ${numberKey} times, working with ${numberKey} candles or items, timing spells using ${numberKey} numerology, or incorporating ${numberKey} in ritual structure.`,
    },
    {
      question: `What planet rules number ${numberKey}?`,
      answer: `Number ${numberKey} is ruled by ${numberData.planets[0]}, which adds ${numberData.planets[0]}-related planetary energy to your spellwork when you work with this number.`,
    },
  ];

  return (
    <SEOContentTemplate
      title={`Number ${numberKey}: Magical Number Correspondences - Lunary`}
      h1={`Number ${numberKey}`}
      description={`Discover the complete magical correspondences for the number ${numberKey}. Learn about ${numberKey}'s meanings, planetary influences, and how to work with ${numberKey} energy.`}
      keywords={[
        `number ${numberKey}`,
        `${numberKey} meaning`,
        `${numberKey} correspondences`,
        `magical number ${numberKey}`,
      ]}
      canonicalUrl={`https://lunary.app/grimoire/correspondences/numbers/${number}`}
      intro={`The number ${numberKey} carries specific vibrational energy and magical correspondences. Understanding number ${numberKey}'s properties helps you incorporate numerical energy into your spellwork and rituals.`}
      meaning={meaning}
      howToWorkWith={howToWorkWith}
      faqs={faqs}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Correspondences', href: '/grimoire/correspondences' },
        { label: 'Numbers', href: '/grimoire/correspondences/numbers' },
        {
          label: `Number ${numberKey}`,
          href: `/grimoire/correspondences/numbers/${number}`,
        },
      ]}
      internalLinks={[
        {
          text: 'Magical Correspondences',
          href: '/grimoire/correspondences',
        },
        { text: 'Numerology', href: '/grimoire/numerology' },
        {
          text: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
        },
        { text: 'Spells & Rituals', href: '/grimoire/spells' },
      ]}
      tables={[
        {
          title: `Number ${numberKey} Correspondences`,
          headers: ['Category', 'Details'],
          rows: [
            ['Correspondences', numberData.correspondences.join(', ')],
            ['Uses', numberData.uses.join(', ')],
            ['Planet', numberData.planets[0]],
          ],
        },
      ]}
    />
  );
}
