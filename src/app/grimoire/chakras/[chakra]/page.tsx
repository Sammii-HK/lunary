import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { chakras } from '@/constants/chakras';
import { stringToKebabCase } from '../../../../../utils/string';
import { createGrimoireMetadata } from '@/lib/grimoire-metadata';
import { createCosmicEntitySchema, renderJsonLd } from '@/lib/schema';

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
    title: `${chakraData.name} Chakra: Meaning, Healing & How to Balance - Lunary`,
    description: `${chakraData.name} Chakra (${chakraData.color}, ${chakraData.location}): healing, balancing & activation. Signs of blockage, crystals, yoga poses & meditation techniques for ${chakraData.name} Chakra.`,
    keywords: [
      `${chakraData.name} chakra`,
      `${chakraData.name} chakra healing`,
      `${chakraData.name} chakra meaning`,
      `${chakraData.color} chakra`,
      `${chakraData.name} chakra balancing`,
      `${chakraData.name} chakra blocked`,
    ],
    url: `/grimoire/chakras/${chakra}`,
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

  const tableOfContents = [
    { label: 'Correspondences', href: '#correspondences' },
    { label: 'Healing Practices', href: '#healing' },
    { label: 'Daily Rituals', href: '#practice-notes' },
    { label: 'FAQ', href: '#faq' },
  ];

  const sectionContent = (
    <div className='space-y-10'>
      <section id='correspondences' className='space-y-3'>
        <h2 className='text-3xl font-light text-zinc-100'>Correspondences</h2>
        <div className='grid gap-4 md:grid-cols-2 text-sm text-zinc-300'>
          {[
            { label: 'Element', value: chakraData.element },
            { label: 'Color', value: chakraData.color },
            { label: 'Location', value: chakraData.location },
            { label: 'Seed Mantra', value: chakraData.seedMantra },
          ].map((item) => (
            <article
              key={item.label}
              className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-4'
            >
              <h3 className='text-lg font-semibold text-zinc-100 mb-1'>
                {item.label}
              </h3>
              <p className='text-sm text-zinc-300'>{item.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section id='healing' className='space-y-3'>
        <h2 className='text-3xl font-light text-zinc-100'>Healing Practices</h2>
        <p className='text-sm text-zinc-300 leading-relaxed'>
          Cycle through meditation, crystals, and gentle movement to clear
          blocks. Work with the listed practices while chanting the seed mantra
          and embodying the affirmation.
        </p>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-zinc-300'>
          {chakraData.healingPractices.slice(0, 4).map((practice) => (
            <article
              key={practice}
              className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-4'
            >
              <p>{practice}</p>
            </article>
          ))}
        </div>
      </section>

      <section id='practice-notes' className='space-y-3'>
        <h2 className='text-3xl font-light text-zinc-100'>
          Daily Ritual Notes
        </h2>
        <ul className='list-disc list-inside text-sm text-zinc-300 space-y-2'>
          <li>
            Light the corresponding color candle while chanting the seed mantra.
          </li>
          <li>
            Layer crystals, oils, and journaling around the chakra’s balanced
            state.
          </li>
          <li>
            Notice sensations during pranayama and adjust to keep energy
            flowing.
          </li>
        </ul>
      </section>
    </div>
  );

  // Entity schema for Knowledge Graph
  const chakraSchema = createCosmicEntitySchema({
    name: `${chakraData.name} Chakra`,
    description: `The ${chakraData.name} Chakra (${chakraData.sanskritName}) is located at ${chakraData.location.toLowerCase()}. Color: ${chakraData.color}. ${chakraData.mysticalProperties}`,
    url: `/grimoire/chakras/${chakra}`,
    additionalType: 'https://en.wikipedia.org/wiki/Chakra',
    keywords: [
      `${chakraData.name} chakra`,
      chakraData.sanskritName,
      chakraData.color,
      chakraData.location,
      'chakra healing',
      'energy center',
      ...chakraData.crystals,
    ],
    relatedEntities: chakraData.crystals.slice(0, 3).map((crystal) => ({
      name: crystal,
      url: `/grimoire/crystals/${stringToKebabCase(crystal)}`,
      relationship: `Crystal for ${chakraData.name} Chakra`,
    })),
  });

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      {renderJsonLd(chakraSchema)}
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
        tableOfContents={tableOfContents}
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

**Affirmation:** "${chakraData.affirmation}"

**Daily Alignment:**
Spend a few minutes noticing the area around ${chakraData.location.toLowerCase()}. Gentle breath, color visualization, or a short mantra repetition can shift the energy quickly.

Track one small change each day so you can see progress over time.`}
        symbolism={`The ${chakraData.name} Chakra is a bridge between body and emotion. When this center is balanced, its qualities show up as steady choices, clear boundaries, and a sense of inner permission. When it is blocked or overactive, the same qualities can become distorted.

Treat balance as a process, not a fixed state. Small, consistent practices create more change than rare, intense sessions.

If you are unsure where to start, choose one practice from the list and repeat it for a week. Tracking small shifts is more helpful than seeking a dramatic breakthrough.

Balance often feels subtle: a calmer response, more grounded choices, or clearer emotional signals. Look for those small signs rather than a sudden, dramatic change.

If the energy feels stuck, focus on breath and posture first. The body often unlocks the mind.`}
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
        tables={[
          {
            title: `${chakraData.name} Focus`,
            headers: ['Aspect', 'Details'],
            rows: [
              ['Element', chakraData.element],
              ['Color', chakraData.color],
              ['Seed Mantra', chakraData.seedMantra],
              ['Key Theme', chakraData.keywords.slice(0, 2).join(', ')],
            ],
          },
          {
            title: 'Quick Alignment Routine',
            headers: ['Step', 'Time'],
            rows: [
              ['Breath with mantra', '2 minutes'],
              ['Visualize the color', '2 minutes'],
              ['Light stretch or pose', '3 minutes'],
              ['Short journal line', '1 minute'],
            ],
          },
          {
            title: 'Balance Signals',
            headers: ['State', 'Common Feel'],
            rows: [
              ['Balanced', 'Steady, clear, grounded'],
              ['Blocked', 'Stuck, low, disconnected'],
              ['Overactive', 'Restless, intense, scattered'],
            ],
          },
        ]}
        rituals={chakraData.yogaPoses}
        journalPrompts={[
          `How does ${chakraData.keywords[0].toLowerCase()} manifest in my daily life?`,
          `What blockages might I be experiencing in my ${chakraData.name} Chakra?`,
          `How can I embody the affirmation: "${chakraData.affirmation}"?`,
          `What healing practices can I incorporate for my ${chakraData.name} Chakra?`,
          'What is one sign that my energy feels more balanced?',
          'What small practice can I repeat for seven days?',
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
        cosmicConnections={
          <CosmicConnections
            entityType='crystal'
            entityKey={chakra}
            title={`${chakraData.name} Chakra Connections`}
            sections={[
              {
                title: 'Related Pages',
                links: [
                  { label: 'All Chakras', href: '/grimoire/chakras' },
                  {
                    label: 'Crystal Healing',
                    href: '/grimoire/guides/crystal-healing-guide',
                  },
                  { label: 'Meditation', href: '/grimoire/meditation' },
                  ...chakraData.crystals.slice(0, 2).map((c: string) => ({
                    label: c,
                    href: `/grimoire/crystals/${c.toLowerCase().replace(/\s+/g, '-')}`,
                  })),
                ],
              },
            ]}
          />
        }
        ctaText='Practice chakra meditation'
        ctaHref='/grimoire/meditation'
      >
        {sectionContent}
      </SEOContentTemplate>
    </div>
  );
}
