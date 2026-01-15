import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
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

Understanding ${woodKey.toLowerCase()} wood's correspondences helps you choose the right wood for your magical tools. Whether you're crafting a wand, creating runes, or using ${woodKey.toLowerCase()} in ritual, this wood brings its unique energetic properties to your practice.

Wood carries the energy of growth and endurance. It works best when used as a long-term tool rather than a one-time ingredient, helping you build consistency and focus in your practice.`;

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

  const tableOfContents = [
    { label: 'Overview', href: '#overview' },
    { label: 'Practice Notes', href: '#practice-notes' },
    { label: 'Ritual Ideas', href: '#ritual-ideas' },
  ];

  const cosmicSections: CosmicConnectionSection[] = [
    {
      title: 'Wood Connections',
      links: [
        {
          label: 'Wood Correspondences',
          href: '/grimoire/correspondences/wood',
        },
        {
          label: 'Correspondences Overview',
          href: '/grimoire/correspondences',
        },
        { label: 'Tools Guide', href: '/grimoire/modern-witchcraft/tools' },
      ],
    },
    {
      title: 'Practice Support',
      links: [
        {
          label: 'Witchcraft Tools',
          href: '/grimoire/modern-witchcraft/tools',
        },
        {
          label: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
        },
        { label: 'Candle Magic', href: '/grimoire/candle-magic' },
      ],
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
      tldr={`${woodKey} supports ${woodData.uses[0] || 'ritual work'} and aligns with ${woodData.correspondences.join(', ')}. Use it in wands, runes, or altar tools for steady, grounded energy.`}
      intro={`${woodKey} wood is a powerful magical material with specific correspondences and uses. Understanding ${woodKey.toLowerCase()} wood's properties helps you choose the right wood for your magical tools and incorporate it effectively into your practice.`}
      meaning={meaning}
      howToWorkWith={howToWorkWith}
      rituals={[
        `Hold a ${woodKey.toLowerCase()} tool and set a clear intention for its purpose.`,
        `Wrap a wand with thread that matches ${woodData.correspondences[0] || 'the core theme'}.`,
        `Place a small piece of ${woodKey.toLowerCase()} on your altar for a week.`,
        `Cleanse the wood with smoke before your next ritual.`,
      ]}
      journalPrompts={[
        `What long-term goal does ${woodKey.toLowerCase()} support for me?`,
        `How can I bring ${woodData.correspondences[0] || 'this energy'} into daily practice?`,
        `What tool do I need to craft or refresh this season?`,
        'Where do I need more steady, grounded focus?',
      ]}
      faqs={faqs}
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
      tableOfContents={tableOfContents}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-correspondences'
          entityKey='correspondences'
          title={`${woodKey} Connections`}
          sections={cosmicSections}
        />
      }
      ctaText={`Want ${woodKey} ritual plans?`}
      ctaHref='/pricing'
    >
      <section id='overview' className='space-y-3 mb-8'>
        <p className='text-sm text-zinc-300'>{meaning}</p>
        <p className='text-sm text-zinc-300'>
          Pair {woodKey.toLowerCase()} with{' '}
          {woodData.correspondences.slice(0, 2).join(' and ')} correspondences
          to strengthen {woodData.uses[0]} work.
        </p>
      </section>
      <section id='practice-notes' className='space-y-3 mb-8'>
        <h2 className='text-xl font-semibold text-zinc-100'>Practice Notes</h2>
        <ul className='list-disc list-inside text-sm text-zinc-300 space-y-2'>
          {howToWorkWith.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section id='ritual-ideas' className='space-y-3'>
        <h2 className='text-xl font-semibold text-zinc-100'>Ritual Ideas</h2>
        <p className='text-sm text-zinc-300'>
          Carve runes into {woodKey.toLowerCase()} for divination sets, or
          anoint wands made from it with {woodData.correspondences[0]}-aligned
          oils.
        </p>
        <p className='text-sm text-zinc-300'>
          Combine {woodKey.toLowerCase()} chips with candles and herbs that
          mirror its energies for layered tools.
        </p>
        <p className='text-sm text-zinc-300'>
          If you are crafting a tool, set an intention before each step. The
          slow, deliberate process helps anchor the wood's energy into the
          object you will use long term.
        </p>
      </section>
    </SEOContentTemplate>
  );
}
