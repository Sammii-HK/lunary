import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { correspondencesData } from '@/constants/grimoire/correspondences';
import { stringToKebabCase } from '../../../../../../utils/string';

const colorKeys = Object.keys(correspondencesData.colors);

const tableOfContents = [
  { label: 'Meaning', href: '#meaning' },
  { label: 'How to Work With This Energy', href: '#how-to-work' },
  { label: 'Correspondences Table', href: '#practices-overview' },
  { label: 'FAQ', href: '#faq' },
];

export async function generateStaticParams() {
  return colorKeys.map((color) => ({
    color: stringToKebabCase(color),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ color: string }>;
}): Promise<Metadata> {
  const { color } = await params;
  const colorKey = colorKeys.find(
    (c) => stringToKebabCase(c) === color.toLowerCase(),
  );

  if (!colorKey) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const colorData =
    correspondencesData.colors[
      colorKey as keyof typeof correspondencesData.colors
    ];
  const title = `${colorKey} Color: Magical Correspondences & Meanings - Lunary`;
  const description = `Discover the complete magical correspondences for ${colorKey.toLowerCase()} color. Learn about ${colorKey} uses, planetary influences, and how to work with ${colorKey.toLowerCase()} energy in candle magic and spellwork.`;

  return {
    title,
    description,
    keywords: [
      `${colorKey} color magic`,
      `${colorKey.toLowerCase()} candle`,
      `${colorKey.toLowerCase()} correspondences`,
      `${colorKey.toLowerCase()} color meaning`,
      stringToKebabCase(colorKey),
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
      canonical: `https://lunary.app/grimoire/correspondences/colors/${color}`,
    },
  };
}

export default async function ColorPage({
  params,
}: {
  params: Promise<{ color: string }>;
}) {
  const { color } = await params;
  const colorKey = colorKeys.find(
    (c) => stringToKebabCase(c) === color.toLowerCase(),
  );

  if (!colorKey) {
    notFound();
  }

  const colorData =
    correspondencesData.colors[
      colorKey as keyof typeof correspondencesData.colors
    ];

  const meaning = `${colorKey} is a powerful color in magical practice, carrying specific energetic properties and correspondences. ${colorKey} color corresponds to ${colorData.correspondences.join(', ')} energies, making it ideal for ${colorData.uses.join(', ')} magical work.

In candle magic, ${colorKey.toLowerCase()} candles are used for ${colorData.uses.join(', ')}. The color resonates with ${colorData.planets.join(' and ')} planetary influences, creating powerful alignments for specific types of spellwork.

Understanding ${colorKey.toLowerCase()} color correspondences helps you choose the right color for your intentions, whether you're working with candles, crystals, fabrics, or other magical tools.

Color is one of the fastest ways to set a ritual tone. Even subtle touches like ribbons, cloth, or ink can focus an intention. If you are unsure which color to use, start with the core correspondence and let intuition guide the shade and intensity.`;

  const howToWorkWith = [
    `Use ${colorKey.toLowerCase()} candles for ${colorData.uses[0]}`,
    `Incorporate ${colorKey.toLowerCase()} color in your altar setup`,
    `Work with ${colorKey.toLowerCase()}-colored crystals`,
    `Align with ${colorData.planets.join(' and ')} planetary influences`,
    `Use ${colorKey.toLowerCase()} fabric or cloth in spellwork`,
    `Create ${colorKey.toLowerCase()}-themed spell bags or sachets`,
    `Write intentions on ${colorKey.toLowerCase()} paper`,
    `Wear ${colorKey.toLowerCase()} clothing during ${colorData.uses[0]} rituals`,
  ];

  const faqs = [
    {
      question: `What is ${colorKey} color used for in magic?`,
      answer: `${colorKey} color is used for ${colorData.uses.join(', ')}. It corresponds to ${colorData.correspondences.join(', ')} energies and resonates with ${colorData.planets.join(' and ')} planetary influences.`,
    },
    {
      question: `When should I use ${colorKey.toLowerCase()} candles?`,
      answer: `Use ${colorKey.toLowerCase()} candles when working with ${colorData.uses.join(', ')}. The color aligns with ${colorData.planets.join(' and ')} planetary energy, making it powerful for these specific intentions.`,
    },
    {
      question: `What planets correspond to ${colorKey} color?`,
      answer: `${colorKey} color corresponds to ${colorData.planets.join(' and ')} planetary influences. Working with ${colorKey.toLowerCase()} color aligns your magic with these planetary energies.`,
    },
  ];

  return (
    <SEOContentTemplate
      title={`${colorKey} Color: Magical Correspondences & Meanings - Lunary`}
      h1={`${colorKey} Color`}
      description={`Discover the complete magical correspondences for ${colorKey.toLowerCase()} color. Learn about ${colorKey} uses, planetary influences, and how to work with ${colorKey.toLowerCase()} energy.`}
      keywords={[
        `${colorKey} color magic`,
        `${colorKey.toLowerCase()} candle`,
        `${colorKey.toLowerCase()} correspondences`,
        `${colorKey.toLowerCase()} color meaning`,
      ]}
      canonicalUrl={`https://lunary.app/grimoire/correspondences/colors/${color}`}
      tldr={`${colorKey} supports ${colorData.uses[0] || 'focused intention'} and resonates with ${colorData.correspondences.join(', ')}. Use it in candles, clothing, or altar tools to amplify the tone of your spellwork.`}
      tableOfContents={tableOfContents}
      intro={`${colorKey} is a powerful color in magical practice, carrying specific energetic properties and correspondences. Understanding ${colorKey.toLowerCase()} color meanings helps you choose the right color for your intentions and create more effective spellwork.`}
      meaning={meaning}
      howToWorkWith={howToWorkWith}
      rituals={[
        `Light a ${colorKey.toLowerCase()} candle and speak a single clear intention.`,
        `Tie a ${colorKey.toLowerCase()} ribbon around a journal or spell bag.`,
        `Create a small ${colorKey.toLowerCase()} altar focal point for a week.`,
        `Write your intention on ${colorKey.toLowerCase()} paper and keep it near your workspace.`,
      ]}
      journalPrompts={[
        `Where in my life do I need more ${colorData.correspondences[0] || 'alignment'}?`,
        `What does ${colorKey.toLowerCase()} energy help me release or invite?`,
        `How does this color change my mood or focus during ritual?`,
        'What is the smallest action I can take to match this color intention?',
      ]}
      faqs={faqs}
      cosmicConnectionsParams={{
        entityType: 'hub-correspondences',
        entityKey: 'correspondences',
      }}
      ctaText={`Want a personalized spell recipe using ${colorKey.toLowerCase()} correspondences?`}
      ctaHref='/pricing'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Correspondences', href: '/grimoire/correspondences' },
        { label: 'Colors', href: '/grimoire/correspondences/colors' },
        {
          label: `${colorKey}`,
          href: `/grimoire/correspondences/colors/${color}`,
        },
      ]}
      internalLinks={[
        {
          text: 'Magical Correspondences',
          href: '/grimoire/correspondences',
        },
        { text: 'Candle Magic', href: '/grimoire/candle-magic' },
        {
          text: 'Incantations by Candle Color',
          href: '/grimoire/candle-magic/incantations',
        },
        {
          text: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
        },
      ]}
      tables={[
        {
          title: `${colorKey} Color Correspondences`,
          headers: ['Category', 'Details'],
          rows: [
            ['Correspondences', colorData.correspondences.join(', ')],
            ['Uses', colorData.uses.join(', ')],
            ['Planets', colorData.planets.join(', ')],
          ],
        },
        {
          title: 'Practical Applications',
          headers: ['Use', 'Example'],
          rows: [
            [
              'Candle magic',
              `Pair with ${colorData.uses[0] || 'focused intention'} rituals`,
            ],
            ['Altar work', 'Cloth, ribbons, or crystals in this color'],
            ['Spellcraft', 'Ink, wax seals, or sachet ties'],
          ],
        },
      ]}
    />
  );
}
