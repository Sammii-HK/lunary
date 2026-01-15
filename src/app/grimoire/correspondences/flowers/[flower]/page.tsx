import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
import { correspondencesData } from '@/constants/grimoire/correspondences';
import { stringToKebabCase } from '../../../../../../utils/string';

const flowerKeys = Object.keys(correspondencesData.flowers);

export async function generateStaticParams() {
  return flowerKeys.map((flower) => ({
    flower: stringToKebabCase(flower),
  }));
}

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

Understanding ${flowerKey.toLowerCase()}'s correspondences helps you incorporate it effectively into your practice. Whether you're working with love, protection, prosperity, or other intentions, ${flowerKey.toLowerCase()} brings its unique energetic properties to your magic.

Flowers hold gentle but clear energy. They are ideal for softening a ritual, opening the heart, or adding beauty to spellwork. Use petals when you want a subtle influence, and full blooms when you want the energy to feel more ceremonial.`;

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

  const tableOfContents = [
    { label: 'Overview', href: '#overview' },
    { label: 'Practice Notes', href: '#practice-notes' },
    { label: 'Ritual Ideas', href: '#ritual-ideas' },
  ];

  const cosmicSections: CosmicConnectionSection[] = [
    {
      title: 'Flower Connections',
      links: [
        {
          label: 'Flower Correspondences',
          href: '/grimoire/correspondences/flowers',
        },
        {
          label: 'Herb Correspondences',
          href: '/grimoire/correspondences/herbs',
        },
        { label: 'Candle Magic', href: '/grimoire/candle-magic' },
      ],
    },
    {
      title: 'Practice Tools',
      links: [
        {
          label: 'Correspondences Overview',
          href: '/grimoire/correspondences',
        },
        { label: 'Moon Phases', href: '/grimoire/moon/phases' },
        {
          label: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
        },
      ],
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
      tldr={`${flowerKey} supports ${flowerData.uses[0] || 'intentional work'} and aligns with ${flowerData.correspondences.join(', ')}. Use petals or oils to add beauty and clarity to rituals.`}
      intro={`${flowerKey} is a beautiful and powerful magical flower with specific correspondences and uses. Understanding ${flowerKey.toLowerCase()}'s properties helps you incorporate it effectively into your spellwork and rituals.`}
      meaning={meaning}
      howToWorkWith={howToWorkWith}
      rituals={[
        `Place ${flowerKey.toLowerCase()} petals in a bowl of water and set a gentle intention.`,
        `Anoint a candle with ${flowerKey.toLowerCase()} oil before ritual.`,
        `Create a small bouquet for your altar and refresh it weekly.`,
        `Press a petal into your journal to anchor your ritual focus.`,
      ]}
      journalPrompts={[
        `What does ${flowerKey.toLowerCase()} help me soften or open?`,
        `Which of ${flowerKey.toLowerCase()}'s colors feels most aligned right now?`,
        `How can I invite ${flowerData.correspondences[0] || 'beauty'} into my daily practice?`,
        'Where does my ritual need more gentleness?',
      ]}
      faqs={faqs}
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
      tableOfContents={tableOfContents}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-correspondences'
          entityKey='correspondences'
          title={`${flowerKey} Connections`}
          sections={cosmicSections}
        />
      }
      ctaText={`Want ritual ideas centered on ${flowerKey}?`}
      ctaHref='/pricing'
    >
      <section id='overview' className='space-y-4 mb-10'>
        <p className='text-sm text-zinc-300'>{meaning}</p>
        <p className='text-sm text-zinc-300'>
          The colors {flowerData.colors.join(', ')} shift emphasis between{' '}
          {flowerData.correspondences.join(', ')}, and the planetary influence
          of {flowerData.planets[0]} adds {flowerData.planets[0]}-level energy
          to these spells.
        </p>
      </section>
      <section id='practice-notes' className='space-y-3 mb-10'>
        <h2 className='text-xl font-semibold text-zinc-100'>
          How to Work with {flowerKey}
        </h2>
        <ul className='list-disc list-inside text-sm text-zinc-300 space-y-2'>
          {howToWorkWith.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section id='ritual-ideas' className='space-y-3'>
        <h2 className='text-xl font-semibold text-zinc-100'>Ritual Ideas</h2>
        <p className='text-sm text-zinc-300'>
          Try layering {flowerKey} petals in your spell bags, brewing them in
          oils for anointing, or scattering them atop candles aligned with{' '}
          {flowerData.planets[0]} to bring {flowerData.correspondences[0]}{' '}
          energy into your altar.
        </p>
        <p className='text-sm text-zinc-300'>
          Pair {flowerKey} with complementary correspondences like{' '}
          {flowerData.correspondences.slice(1, 3).join(', ')} to amplify
          outcomes, and keep {flowerData.colors[0]} or{' '}
          {flowerData.colors[1] ?? flowerData.colors[0]} ribbons nearby for
          color resonance.
        </p>
        <p className='text-sm text-zinc-300'>
          Fresh blooms are ideal for beginnings, while dried petals are great
          for long-term spells. If you are unsure, start with a simple offering
          and track how the flower changes the ritual atmosphere.
        </p>
      </section>
    </SEOContentTemplate>
  );
}
