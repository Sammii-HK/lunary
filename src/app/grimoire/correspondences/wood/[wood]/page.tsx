import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { correspondencesData } from '@/constants/grimoire/correspondences';
import { stringToKebabCase } from '../../../../../../utils/string';

const woodKeys = Object.keys(correspondencesData.wood);

export async function generateStaticParams() {
  return woodKeys.map((wood) => ({
    wood: stringToKebabCase(wood),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ wood: string }>;
}): Promise<Metadata> {
  const { wood } = await params;
  const woodKey = woodKeys.find(
    (w) => stringToKebabCase(w) === wood.toLowerCase(),
  );

  if (!woodKey) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const woodData =
    correspondencesData.wood[woodKey as keyof typeof correspondencesData.wood];
  const title = `${woodKey} Wood: Magical Correspondences & Uses - Lunary`;
  const description = `Discover the complete magical correspondences for ${woodKey.toLowerCase()} wood. Learn about ${woodKey} uses, planetary influences, and how to work with ${woodKey.toLowerCase()} wood in wands, tools, and spellwork.`;

  return {
    title,
    description,
    keywords: [
      `${woodKey} wood`,
      `${woodKey.toLowerCase()} wand`,
      `${woodKey.toLowerCase()} correspondences`,
      `${woodKey.toLowerCase()} uses`,
      `magical ${woodKey.toLowerCase()} wood`,
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
      canonical: `https://lunary.app/grimoire/correspondences/wood/${wood}`,
    },
  };
}

export default async function WoodPage({
  params,
}: {
  params: Promise<{ wood: string }>;
}) {
  const { wood } = await params;
  const woodKey = woodKeys.find(
    (w) => stringToKebabCase(w) === wood.toLowerCase(),
  );

  if (!woodKey) {
    notFound();
  }

  const woodData =
    correspondencesData.wood[woodKey as keyof typeof correspondencesData.wood];

  const meaning = `${woodKey} wood is a powerful magical material with specific correspondences and uses. ${woodKey} corresponds to ${woodData.correspondences.join(', ')} energies, making it ideal for ${woodData.uses.join(', ')} magical work.

${woodKey} wood resonates with ${woodData.planets.join(' and ')} planetary influences, adding planetary power to tools and spellwork made from this wood. ${woodKey} is commonly used for wands, staves, runes, and other magical tools.

Understanding ${woodKey.toLowerCase()} wood's correspondences helps you choose the right wood for your magical tools. Whether you're crafting a wand, creating runes, or using ${woodKey.toLowerCase()} in ritual, this wood brings its unique energetic properties to your practice.`;

  const howToWorkWith = [
    `Craft wands from ${woodKey.toLowerCase()} wood`,
    `Use ${woodKey.toLowerCase()} for ${woodData.uses.join(' and ')} spells`,
    `Create runes or divination tools from ${woodKey.toLowerCase()}`,
    `Burn ${woodKey.toLowerCase()} as incense`,
    `Use ${woodKey.toLowerCase()} chips in spell bags`,
    `Align with ${woodData.planets.join(' and ')} planetary influences`,
    `Create ${woodKey.toLowerCase()}-themed altars`,
    `Use ${woodKey.toLowerCase()} in protection or ${woodData.uses[0]} work`,
  ];

  const faqs = [
    {
      question: `What is ${woodKey} wood used for in magic?`,
      answer: `${woodKey} wood is used for ${woodData.uses.join(', ')}. It corresponds to ${woodData.correspondences.join(', ')} energies and resonates with ${woodData.planets.join(' and ')} planetary influences.`,
    },
    {
      question: `Can I make a wand from ${woodKey.toLowerCase()} wood?`,
      answer: `Yes! ${woodKey} is an excellent choice for wands. It corresponds to ${woodData.correspondences[0]} energy, making it powerful for ${woodData.uses[0]} work. Choose a branch that feels right to you.`,
    },
    {
      question: `What planets rule ${woodKey} wood?`,
      answer: `${woodKey} wood is ruled by ${woodData.planets.join(' and ')}, which adds planetary energy to tools and spellwork made from this wood.`,
    },
  ];

  return (
    <SEOContentTemplate
      title={`${woodKey} Wood: Magical Correspondences & Uses - Lunary`}
      h1={`${woodKey} Wood`}
      description={`Discover the complete magical correspondences for ${woodKey.toLowerCase()} wood. Learn about ${woodKey} uses, planetary influences, and how to work with ${woodKey.toLowerCase()} wood in wands and spellwork.`}
      keywords={[
        `${woodKey} wood`,
        `${woodKey.toLowerCase()} wand`,
        `${woodKey.toLowerCase()} correspondences`,
        `${woodKey.toLowerCase()} uses`,
      ]}
      canonicalUrl={`https://lunary.app/grimoire/correspondences/wood/${wood}`}
      intro={`${woodKey} wood is a powerful magical material with specific correspondences and uses. Understanding ${woodKey.toLowerCase()} wood's properties helps you choose the right wood for your magical tools and incorporate it effectively into your practice.`}
      meaning={meaning}
      howToWorkWith={howToWorkWith}
      faqs={faqs}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Correspondences', href: '/grimoire/correspondences' },
        { label: 'Wood', href: '/grimoire/correspondences/wood' },
        {
          label: `${woodKey}`,
          href: `/grimoire/correspondences/wood/${wood}`,
        },
      ]}
      internalLinks={[
        {
          text: 'Magical Correspondences',
          href: '/grimoire/correspondences',
        },
        {
          text: 'Witchcraft Tools',
          href: '/grimoire/modern-witchcraft/tools-guide',
        },
        {
          text: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
        },
        { text: 'Spells & Rituals', href: '/grimoire/spells' },
      ]}
      tables={[
        {
          title: `${woodKey} Wood Correspondences`,
          headers: ['Category', 'Details'],
          rows: [
            ['Correspondences', woodData.correspondences.join(', ')],
            ['Uses', woodData.uses.join(', ')],
            ['Planets', woodData.planets.join(', ')],
          ],
        },
      ]}
    />
  );
}
