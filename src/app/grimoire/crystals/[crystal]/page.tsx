import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
import { crystalDatabase } from '@/constants/grimoire/crystals';
import { stringToKebabCase } from '../../../../../utils/string';
import {
  createGrimoireMetadata,
  createNotFoundMetadata,
} from '@/lib/grimoire-metadata';
import { createCrystalSchema, renderJsonLd } from '@/lib/schema';

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
    return createNotFoundMetadata();
  }

  return createGrimoireMetadata({
    title: `${crystalData.name} Crystal: Meaning, Properties & Uses - Lunary`,
    description: `${crystalData.name} crystal meaning and healing properties. Associated with ${crystalData.properties.slice(0, 3).join(', ').toLowerCase()}. Works with ${crystalData.chakras.join(' & ')} chakras. Complete guide to using ${crystalData.name}.`,
    keywords: [
      `${crystalData.name} crystal`,
      `${crystalData.name} meaning`,
      `${crystalData.name} properties`,
      `${crystalData.name} healing`,
      `${crystalData.name} uses`,
      `crystal ${crystalData.name}`,
    ],
    url: `/grimoire/crystals/${crystal}`,
    ogImagePath: '/api/og/grimoire/crystals',
    ogImageAlt: `${crystalData.name} Crystal`,
  });
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

  const tableOfContents = [
    { label: 'Overview', href: '#overview' },
    { label: 'Properties & Correspondences', href: '#properties' },
    { label: 'Working with It', href: '#working-with-it' },
    { label: 'Care & Storage', href: '#care' },
    { label: 'FAQ', href: '#faq' },
  ];

  const detailCosmicSections: CosmicConnectionSection[] = [
    {
      title: 'Crystal Combos',
      links: crystalData.combinations.enhances.map((name) => ({
        label: `Pairs well with ${name}`,
        href: `/grimoire/crystals/${stringToKebabCase(name)}`,
      })),
    },
    {
      title: 'Practice Guides',
      links: [
        { label: 'Meditation', href: '/grimoire/meditation' },
        {
          label: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
        },
        { label: 'Chakra Guide', href: '/grimoire/chakras' },
      ],
    },
  ];

  // Entity schema for Knowledge Graph
  const crystalSchema = createCrystalSchema({
    name: crystalData.name,
    description: `${crystalData.name} is a crystal known for ${crystalData.properties.slice(0, 3).join(', ').toLowerCase()}.`,
    properties: crystalData.properties,
    chakras: crystalData.chakras,
    zodiacSigns: crystalData.zodiacSigns,
    element: crystalData.elements[0],
  });

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      {renderJsonLd(crystalSchema)}
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
        tableOfContents={tableOfContents}
        faqs={faqs}
        ctaText={`Want a crystal stack that matches ${crystalData.name}?`}
        ctaHref='/pricing'
        cosmicConnections={
          <CosmicConnections
            entityType='crystal'
            entityKey={crystal}
            title={`${crystalData.name} Cosmic Connections`}
            sections={detailCosmicSections}
          />
        }
      >
        <section id='overview' className='space-y-4 mb-10'>
          <h2 className='text-2xl font-semibold text-zinc-100'>Overview</h2>
          <p className='text-sm text-zinc-300'>
            {crystalData.name} is {crystalData.description.toLowerCase()}.{' '}
            {crystalData.metaphysicalProperties}
          </p>
          <p className='text-sm text-zinc-300'>
            Work with this crystal to invite{' '}
            {crystalData.properties[0].toLowerCase()} energy while honoring the{' '}
            {crystalData.chakras.join(', ')} chakra
            {crystalData.chakras.length > 1 ? 's' : ''}.
          </p>
        </section>

        <section id='properties' className='space-y-4 mb-10'>
          <h2 className='text-2xl font-semibold text-zinc-100'>
            Properties & Correspondences
          </h2>
          <div className='grid md:grid-cols-2 gap-4'>
            <div className='rounded-xl border border-zinc-800 p-4 bg-zinc-900/40'>
              <h3 className='text-sm font-semibold text-zinc-300 mb-2'>
                Core Properties
              </h3>
              <ul className='list-disc list-inside text-sm text-zinc-300 space-y-1'>
                {crystalData.properties.map((prop) => (
                  <li key={prop}>{prop}</li>
                ))}
              </ul>
            </div>
            <div className='rounded-xl border border-zinc-800 p-4 bg-zinc-900/40'>
              <h3 className='text-sm font-semibold text-zinc-300 mb-2'>
                Correspondences
              </h3>
              <p className='text-zinc-300 text-sm'>
                Chakras: {crystalData.chakras.join(', ')}
                <br />
                Elements: {crystalData.elements.join(', ')}
                <br />
                Planets: {crystalData.planets.join(', ')}
                <br />
                Zodiac Signs: {crystalData.zodiacSigns.join(', ')}
              </p>
            </div>
          </div>
        </section>

        <section id='working-with-it' className='space-y-4 mb-10'>
          <h2 className='text-2xl font-semibold text-zinc-100'>
            Working with {crystalData.name}
          </h2>
          <ul className='list-disc list-inside text-sm text-zinc-300 space-y-1'>
            {[
              `Meditate with ${crystalData.name} to welcome ${crystalData.properties[0].toLowerCase()} energy`,
              `Use it for ${crystalData.workingWith.spellwork.toLowerCase()} rituals`,
              `Balance the ${crystalData.workingWith.healing.toLowerCase()} chakra energy it supports`,
            ].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section id='care' className='space-y-4'>
          <h2 className='text-2xl font-semibold text-zinc-100'>
            Care & Storage
          </h2>
          <p className='text-sm text-zinc-300'>
            Cleanse {crystalData.name} using{' '}
            {crystalData.careInstructions.cleansing.join(', ')} and charge it
            with {crystalData.careInstructions.charging.join(', ')}. Store it
            wrapped or separated to preserve its vibration.
          </p>
          {crystalData.careInstructions.programming && (
            <p className='text-sm text-zinc-300'>
              Programming tip: {crystalData.careInstructions.programming}
            </p>
          )}
        </section>
      </SEOContentTemplate>
    </div>
  );
}
