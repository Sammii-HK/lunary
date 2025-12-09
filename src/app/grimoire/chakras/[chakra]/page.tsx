import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { chakras } from '@/constants/chakras';
import { stringToKebabCase } from '../../../../../utils/string';
import { createGrimoireMetadata } from '@/lib/grimoire-metadata';

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
}) {
  const { chakra } = await params;
  const chakraKey = chakraKeys.find(
    (c) => stringToKebabCase(c) === chakra.toLowerCase(),
  );

  if (!chakraKey) {
    return { title: 'Not Found - Lunary Grimoire' };
  }

  const chakraData = chakras[chakraKey as keyof typeof chakras];

  return createGrimoireMetadata({
    title: `${chakraData.name} Chakra: Meaning, Location & Balancing - Lunary`,
    description: `Discover the complete guide to ${chakraData.name} Chakra. Learn about ${chakraData.name} Chakra meaning, location (${chakraData.location}), color (${chakraData.color}), properties, and how to balance this chakra.`,
    keywords: [
      `${chakraData.name} chakra`,
      `${chakraData.name} chakra meaning`,
      `${chakraData.color} chakra`,
      `chakra ${chakraData.location}`,
      `${chakraData.name} chakra balancing`,
    ],
    url: `https://lunary.app/grimoire/chakras/${chakra}`,
    ogImagePath: '/api/og/grimoire/chakras',
    ogImageAlt: `${chakraData.name} Chakra`,
  });
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
      question: `What is the ${chakraData.name} Chakra?`,
      answer: `The ${chakraData.name} Chakra (Sanskrit: ${chakraData.sanskritName}) is located at ${chakraData.location.toLowerCase()}. It is associated with the ${chakraData.element} element, the color ${chakraData.color.toLowerCase()}, and governs ${chakraData.properties.toLowerCase()}.`,
    },
    {
      question: `What are the symptoms of a blocked ${chakraData.name} Chakra?`,
      answer: `Signs of a blocked ${chakraData.name} Chakra include: ${chakraData.blockageSymptoms.slice(0, 4).join(', ').toLowerCase()}. Physical symptoms may include ${chakraData.physicalBlockageSymptoms.slice(0, 3).join(', ').toLowerCase()}.`,
    },
    {
      question: `How do I balance my ${chakraData.name} Chakra?`,
      answer: `To balance your ${chakraData.name} Chakra: ${chakraData.healingPractices.slice(0, 3).join('; ')}. Crystals like ${chakraData.crystals.slice(0, 3).join(', ')} are helpful.`,
    },
    {
      question: `What crystals are best for the ${chakraData.name} Chakra?`,
      answer: `The best crystals for the ${chakraData.name} Chakra include ${chakraData.crystals.join(', ')}. These stones resonate with the ${chakraData.color.toLowerCase()} energy and help balance this chakra.`,
    },
    {
      question: `What yoga poses help the ${chakraData.name} Chakra?`,
      answer: `Yoga poses for the ${chakraData.name} Chakra include ${chakraData.yogaPoses.join(', ')}. These poses help open and balance the energy at ${chakraData.location.toLowerCase()}.`,
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
        intro={`The ${chakraData.name} Chakra (Sanskrit: ${chakraData.sanskritName}) is located at ${chakraData.location.toLowerCase()}. Associated with the ${chakraData.element} element and the color ${chakraData.color.toLowerCase()}, this chakra is activated by the seed mantra "${chakraData.seedMantra}" and resonates at ${chakraData.frequency}Hz.`}
        tldr={`The ${chakraData.name} Chakra governs ${chakraData.keywords.slice(0, 4).join(', ').toLowerCase()}. ${chakraData.balancedState}`}
        meaning={`${chakraData.mysticalProperties}

**Keywords:** ${chakraData.keywords.join(', ')}

**Physical Associations:** ${chakraData.physicalAssociations.join(', ')}

**Emotional Associations:** ${chakraData.emotionalAssociations.join(', ')}

**Signs of Blockage:**
${chakraData.blockageSymptoms.map((s) => `• ${s}`).join('\n')}

**Physical Symptoms of Blockage:**
${chakraData.physicalBlockageSymptoms.map((s) => `• ${s}`).join('\n')}

**Signs of Overactivity:**
${chakraData.overactiveSymptoms.map((s) => `• ${s}`).join('\n')}

**Balanced State:**
${chakraData.balancedState}

**Affirmation:** "${chakraData.affirmation}"`}
        glyphs={[chakraData.symbol]}
        astrologyCorrespondences={`Sanskrit Name: ${chakraData.sanskritName}
Location: ${chakraData.location}
Element: ${chakraData.element}
Color: ${chakraData.color}
Seed Mantra: ${chakraData.seedMantra}
Frequency: ${chakraData.frequency}Hz
Crystals: ${chakraData.crystals.join(', ')}
Essential Oils: ${chakraData.essentialOils.join(', ')}
Foods: ${chakraData.foods.slice(0, 3).join(', ')}`}
        howToWorkWith={chakraData.healingPractices}
        rituals={chakraData.yogaPoses}
        journalPrompts={[
          `How does ${chakraData.keywords[0].toLowerCase()} manifest in my daily life?`,
          `What blockages might I be experiencing in my ${chakraData.name} Chakra?`,
          `How can I embody the affirmation: "${chakraData.affirmation}"?`,
          `What healing practices can I incorporate for my ${chakraData.name} Chakra?`,
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
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Chakras', href: '/grimoire/chakras' },
          {
            label: chakraData.name,
            href: `/grimoire/chakras/${chakra}`,
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
