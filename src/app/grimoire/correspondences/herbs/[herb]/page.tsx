import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
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

Understanding ${herbKey.toLowerCase()}'s correspondences helps you incorporate it effectively into your practice. Whether you're working with protection, love, prosperity, or other intentions, ${herbKey.toLowerCase()} brings its unique energetic properties to your magic.

Start with small amounts and focus on the intention rather than intensity. Herbs are best used consistently over time, building a steady energetic signature in your practice.`;

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
    {
      question: `Can I combine ${herbKey.toLowerCase()} with other herbs?`,
      answer: `Yes. Blend ${herbKey.toLowerCase()} with herbs that share ${herbData.correspondences[0]} energy to keep the intention focused. Start with small amounts and adjust based on feel.`,
    },
  ];

  const tableOfContents = [
    { label: 'Overview', href: '#overview' },
    { label: 'How to Work With It', href: '#practice-notes' },
    { label: 'Ritual Ideas', href: '#ritual-ideas' },
  ];

  const cosmicSections: CosmicConnectionSection[] = [
    {
      title: 'Herb Connections',
      links: [
        {
          label: 'Herb Correspondences',
          href: '/grimoire/correspondences/herbs',
        },
        { label: 'Flowers', href: '/grimoire/correspondences/flowers' },
        { label: 'Elements', href: '/grimoire/correspondences/elements' },
      ],
    },
    {
      title: 'Practice Tools',
      links: [
        {
          label: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
        },
        { label: 'Moon Phases', href: '/grimoire/moon/phases' },
        { label: 'Candle Magic', href: '/grimoire/candle-magic' },
      ],
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
      tldr={`${herbKey} aligns with ${herbData.correspondences.join(', ')} and supports ${herbData.uses[0] || 'focused spellwork'}. Use it in incense, sachets, or baths to anchor the intention.`}
      intro={`${herbKey} is a powerful magical herb with specific correspondences and uses. Understanding ${herbKey.toLowerCase()}'s properties helps you incorporate it effectively into your spellwork and rituals.`}
      meaning={meaning}
      howToWorkWith={howToWorkWith}
      rituals={[
        `Burn a small pinch of ${herbKey.toLowerCase()} as incense before a ritual.`,
        `Add ${herbKey.toLowerCase()} to a sachet and keep it near your bed.`,
        `Brew a ritual wash with ${herbKey.toLowerCase()} and cleanse your tools.`,
        `Sprinkle ${herbKey.toLowerCase()} around a candle before lighting it.`,
      ]}
      journalPrompts={[
        `What intention feels most aligned with ${herbKey.toLowerCase()} right now?`,
        `How does ${herbKey.toLowerCase()} change the mood of my ritual?`,
        `Which of ${herbData.correspondences[0] || 'the core themes'} needs my focus?`,
        'What small action will reinforce this herbal intention today?',
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
          title: `${herbKey} Correspondences`,
          headers: ['Category', 'Details'],
          rows: [
            ['Correspondences', herbData.correspondences.join(', ')],
            ['Uses', herbData.uses.join(', ')],
            ['Planet', herbData.planets[0]],
          ],
        },
      ]}
      tableOfContents={tableOfContents}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-correspondences'
          entityKey='correspondences'
          title={`${herbKey} Connections`}
          sections={cosmicSections}
        />
      }
      ctaText={`Want ritual choreo with ${herbKey}?`}
      ctaHref='/pricing'
    >
      <section id='overview' className='space-y-3 mb-8'>
        <p className='text-sm text-zinc-300'>{meaning}</p>
        <p className='text-sm text-zinc-300'>
          Each use of {herbKey.toLowerCase()} amplifies{' '}
          {herbData.correspondences.join(', ')} energies and echoes the{' '}
          {herbData.planets[0]} planetary resonance.
        </p>
        <p className='text-sm text-zinc-300'>
          Keep your ritual tools clean and store herbs in a dry, dark place to
          preserve their potency. Fresh herbs bring a lively, immediate energy,
          while dried herbs are better for steady, long-term workings.
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
          Layer {herbKey.toLowerCase()} with{' '}
          {herbData.correspondences.slice(0, 2).join(' and ')} when crafting
          spells for {herbData.uses[0]}, and burn it during{' '}
          {herbData.planets[0]} hours for extra planetary punch.
        </p>
        <p className='text-sm text-zinc-300'>
          Make sachets mixing {herbKey.toLowerCase()} with complementary herbs
          like {herbData.correspondences.slice(2, 4).join(', ')} for a portable
          intent.
        </p>
        <p className='text-sm text-zinc-300'>
          If you are working with tea or bath blends, keep the intention gentle
          and focused. Consistent, small rituals tend to be more effective than
          a single intense working.
        </p>
      </section>
    </SEOContentTemplate>
  );
}
